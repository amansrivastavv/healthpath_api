import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { R2Service } from '../../r2/r2.service';
import { UploadReportDto } from './dto/upload-report.dto';
import { GetReportsDto } from './dto/get-reports.dto';
import { GetProviderPatientsDto } from './dto/get-provider-patients.dto';
import { GetAdminReportsDto } from '../../admin/reports/dto/get-admin-reports.dto';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { Gender, Prisma, ReportType, UserRole } from '@prisma/client';
import * as crypto from 'crypto';

export interface ProviderContext {
  doctorId?: string;
  providerId?: string;
  isAdmin?: boolean;
  role: UserRole;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  /**
   * Helper to format single report for API response
   */
  private formatReportResponse(report: any) {
    const formattedDate =
      report.reportDate instanceof Date
        ? report.reportDate.toISOString().split('T')[0]
        : String(report.reportDate);

    return {
      id: report.id,
      reportNumber: report.reportNumber,
      title: report.title,
      reportType: report.reportType,
      description: report.description || null,
      fileUrl: report.fileUrl,
      fileName: report.fileName,
      fileSize: report.fileSize ?? null,
      mimeType: report.mimeType ?? null,
      reportDate: formattedDate,
      patient: {
        userId: report.userId || null,
        patientName: report.patientName,
        patientPhone: report.patientPhone,
        patientAge: report.patientAge ?? null,
        patientGender: report.patientGender || null,
      },
      doctor: report.doctor
        ? {
            id: report.doctor.id,
            fullName: report.doctor.fullName,
            specialization: report.doctor.specialization?.name || null,
          }
        : null,
      provider: report.provider
        ? {
            id: report.provider.id,
            name: report.provider.name,
            type: report.provider.type,
            city: report.provider.city || null,
          }
        : null,
      test: report.test
        ? {
            id: report.test.id,
            name: report.test.name,
            code: report.test.code || null,
          }
        : null,
      bookingId: report.bookingId || null,
      createdAt: report.createdAt,
    };
  }

  /**
   * Common relation include object for queries
   */
  private get reportInclude() {
    return {
      user: {
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          email: true,
        },
      },
      doctor: {
        select: {
          id: true,
          fullName: true,
          specialization: { select: { name: true } },
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
          type: true,
          city: true,
        },
      },
      test: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    };
  }

  /**
   * Resolve calling user's provider / doctor entity context from DB
   * Enforces that doctors, hospital admins, and lab staff are strictly isolated
   */
  async resolveProviderContext(
    userId: string,
    role: UserRole,
  ): Promise<ProviderContext> {
    if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
      return { isAdmin: true, role };
    }

    if (role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId },
      });
      if (!doctor) {
        throw new ForbiddenException(
          'Doctor profile not linked with your account.',
        );
      }
      return {
        doctorId: doctor.id,
        providerId: doctor.providerId,
        role,
      };
    }

    if (
      role === UserRole.LAB_OWNER ||
      role === UserRole.LAB_STAFF ||
      role === UserRole.TECHNICIAN
    ) {
      // Find provider owned by this user
      const provider = await this.prisma.provider.findFirst({
        where: { ownerId: userId },
      });
      if (!provider) {
        throw new ForbiddenException(
          'Provider / Diagnostic Lab facility not linked with your account.',
        );
      }
      return {
        providerId: provider.id,
        role,
      };
    }

    throw new ForbiddenException(
      'Unauthorized: Only Doctors, Hospitals, and Diagnostic Labs can perform provider operations.',
    );
  }

  /**
   * Upload and register a new medical report with strict provider validation
   */
  async uploadReport(
    uploaderId: string,
    uploaderRole: UserRole,
    dto: UploadReportDto,
    file?: Express.Multer.File,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Medical report file (PDF / Image) is required.');
    }

    // Validate mime type
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type '${file.mimetype}'. Only PDF, JPEG, PNG, and WebP files are supported.`,
      );
    }

    // Max file size: 25 MB
    const maxSizeBytes = 25 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException('File size exceeds the 25 MB limit.');
    }

    const context = await this.resolveProviderContext(uploaderId, uploaderRole);

    let assignedDoctorId = context.doctorId || dto.doctorId || undefined;
    let assignedProviderId = context.providerId || undefined;

    // If bookingId is provided, verify ownership of booking!
    let matchedUserId: string | undefined;
    if (dto.bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: { id: dto.bookingId },
      });

      if (!booking) {
        throw new NotFoundException(`Booking '${dto.bookingId}' not found.`);
      }

      // STRICT MULTI-TENANT CHECK:
      // If caller is doctor, booking must belong to this doctor
      if (context.doctorId && booking.doctorId && booking.doctorId !== context.doctorId) {
        throw new ForbiddenException(
          'Access Denied: This appointment booking belongs to another doctor.',
        );
      }

      // If caller is lab/hospital, booking must belong to this provider
      if (context.providerId && booking.providerId && booking.providerId !== context.providerId) {
        throw new ForbiddenException(
          'Access Denied: This appointment booking belongs to another facility/lab.',
        );
      }

      if (booking.userId) {
        matchedUserId = booking.userId;
      }
      if (!assignedDoctorId && booking.doctorId) {
        assignedDoctorId = booking.doctorId;
      }
      if (!assignedProviderId && booking.providerId) {
        assignedProviderId = booking.providerId;
      }
    }

    // Validate doctor if passed by hospital
    if (dto.doctorId && !context.doctorId) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: dto.doctorId },
      });
      if (!doctor) {
        throw new BadRequestException(`Doctor '${dto.doctorId}' not found.`);
      }
      // If facility is uploading, ensure doctor belongs to this facility (unless admin)
      if (context.providerId && doctor.providerId !== context.providerId) {
        throw new ForbiddenException(
          'Access Denied: This doctor does not belong to your medical facility.',
        );
      }
      assignedDoctorId = doctor.id;
    }

    // Validate diagnostic test if provided
    if (dto.testId) {
      const test = await this.prisma.test.findUnique({
        where: { id: dto.testId },
      });
      if (!test) {
        throw new BadRequestException(`Test with ID '${dto.testId}' not found.`);
      }
    }

    // Check if patient phone number matches any registered patient user
    if (!matchedUserId && dto.patientPhone) {
      const cleanPhone = dto.patientPhone.trim();
      const rawNumber = cleanPhone.replace(/^\+91/, '');
      const patientUser = await this.prisma.user.findFirst({
        where: {
          role: UserRole.PATIENT,
          OR: [
            { phoneNumber: cleanPhone },
            { phoneNumber: rawNumber },
            { phoneNumber: `+91${rawNumber}` },
          ],
        },
      });
      if (patientUser) {
        matchedUserId = patientUser.id;
      }
    }

    // Parse report date
    let parsedDate = new Date();
    if (dto.reportDate) {
      parsedDate = new Date(dto.reportDate);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid date format for reportDate.');
      }
    }

    // Upload to Cloudflare R2
    const uploadResult = await this.r2Service.upload(
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      },
      'medical-reports',
    );

    // Generate unique report number: HP-REP-YYYYMMDD-XXXX
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const reportNumber = `HP-REP-${todayStr}-${randSuffix}`;

    // Create Report in database
    const createdReport = await this.prisma.medicalReport.create({
      data: {
        reportNumber,
        title: dto.title,
        reportType: dto.reportType || ReportType.LAB_REPORT,
        description: dto.description || null,
        fileUrl: uploadResult.url,
        fileKey: uploadResult.key,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        reportDate: parsedDate,
        patientName: dto.patientName,
        patientPhone: dto.patientPhone,
        patientAge: dto.patientAge,
        patientGender: dto.patientGender,
        userId: matchedUserId || null,
        doctorId: assignedDoctorId || null,
        providerId: assignedProviderId || null,
        testId: dto.testId || null,
        bookingId: dto.bookingId || null,
        uploadedById: uploaderId,
      },
      include: this.reportInclude,
    });

    this.logger.log(
      `Medical report '${reportNumber}' uploaded successfully by user ${uploaderId}`,
    );

    return ApiResponseHelper.success(
      'Medical report uploaded successfully',
      this.formatReportResponse(createdReport),
    );
  }

  /**
   * Get patients belonging to the caller's doctor or provider facility
   */
  async getProviderPatients(
    uploaderId: string,
    uploaderRole: UserRole,
    query: GetProviderPatientsDto,
  ) {
    const context = await this.resolveProviderContext(uploaderId, uploaderRole);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter by doctor or provider
    const bookingWhere: Prisma.BookingWhereInput = {};
    const reportWhere: Prisma.MedicalReportWhereInput = {};

    if (context.doctorId) {
      bookingWhere.doctorId = context.doctorId;
      reportWhere.doctorId = context.doctorId;
    } else if (context.providerId) {
      bookingWhere.providerId = context.providerId;
      reportWhere.providerId = context.providerId;
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      bookingWhere.OR = [
        { patientName: { contains: term } },
        { phone: { contains: term } },
      ];
      reportWhere.OR = [
        { patientName: { contains: term } },
        { patientPhone: { contains: term } },
      ];
    }

    // Parallel fetch from bookings and reports belonging ONLY to this provider/doctor
    const [bookings, reports] = await Promise.all([
      this.prisma.booking.findMany({
        where: bookingWhere,
        select: {
          userId: true,
          patientName: true,
          phone: true,
          age: true,
          gender: true,
          date: true,
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.medicalReport.findMany({
        where: reportWhere,
        select: {
          userId: true,
          patientName: true,
          patientPhone: true,
          patientAge: true,
          patientGender: true,
          reportDate: true,
        },
        orderBy: { reportDate: 'desc' },
      }),
    ]);

    // Aggregate unique patients by phone number (or userId)
    const patientMap = new Map<string, any>();

    for (const b of bookings) {
      const key = (b.phone || b.userId || '').trim();
      if (!key) continue;

      if (!patientMap.has(key)) {
        patientMap.set(key, {
          userId: b.userId || null,
          patientName: b.patientName,
          phone: b.phone,
          age: b.age,
          gender: b.gender,
          lastActivityDate: b.date,
          bookingsCount: 1,
          reportsCount: 0,
        });
      } else {
        const item = patientMap.get(key);
        item.bookingsCount += 1;
        if (new Date(b.date) > new Date(item.lastActivityDate)) {
          item.lastActivityDate = b.date;
        }
      }
    }

    for (const r of reports) {
      const key = (r.patientPhone || r.userId || '').trim();
      if (!key) continue;

      if (!patientMap.has(key)) {
        patientMap.set(key, {
          userId: r.userId || null,
          patientName: r.patientName,
          phone: r.patientPhone,
          age: r.patientAge,
          gender: r.patientGender,
          lastActivityDate: r.reportDate,
          bookingsCount: 0,
          reportsCount: 1,
        });
      } else {
        const item = patientMap.get(key);
        item.reportsCount += 1;
        if (new Date(r.reportDate) > new Date(item.lastActivityDate)) {
          item.lastActivityDate = r.reportDate;
        }
      }
    }

    const allPatients = Array.from(patientMap.values()).sort(
      (a, b) => new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime(),
    );

    const total = allPatients.length;
    const paginatedPatients = allPatients.slice(skip, skip + limit);

    return ApiResponseHelper.success('Patients retrieved successfully', {
      items: paginatedPatients,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  }

  /**
   * List reports uploaded by / belonging to caller's doctor or provider
   */
  async getProviderReports(
    uploaderId: string,
    uploaderRole: UserRole,
    dto: GetReportsDto,
  ) {
    const context = await this.resolveProviderContext(uploaderId, uploaderRole);
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.MedicalReportWhereInput = {};

    // Strict multi-tenant constraint
    if (context.doctorId) {
      where.doctorId = context.doctorId;
    } else if (context.providerId) {
      where.providerId = context.providerId;
    }

    if (dto.reportType) {
      where.reportType = dto.reportType;
    }

    if (dto.patientPhone) {
      where.patientPhone = { contains: dto.patientPhone.trim() };
    }

    if (dto.fromDate || dto.toDate) {
      where.reportDate = {};
      if (dto.fromDate) {
        where.reportDate.gte = new Date(dto.fromDate);
      }
      if (dto.toDate) {
        const endDay = new Date(dto.toDate);
        endDay.setHours(23, 59, 59, 999);
        where.reportDate.lte = endDay;
      }
    }

    if (dto.search && dto.search.trim()) {
      const term = dto.search.trim();
      where.OR = [
        { reportNumber: { contains: term } },
        { title: { contains: term } },
        { patientName: { contains: term } },
        { patientPhone: { contains: term } },
      ];
    }

    const [total, reports] = await Promise.all([
      this.prisma.medicalReport.count({ where }),
      this.prisma.medicalReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { reportDate: 'desc' },
        include: this.reportInclude,
      }),
    ]);

    return ApiResponseHelper.success('Reports retrieved successfully', {
      items: reports.map((r) => this.formatReportResponse(r)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  }

  /**
   * Mobile App - Patient listing of their own reports
   */
  async getPatientReports(patientUserId: string, dto: GetReportsDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const skip = (page - 1) * limit;

    const patient = await this.prisma.user.findUnique({
      where: { id: patientUserId },
    });

    if (!patient) {
      throw new NotFoundException('Patient account not found.');
    }

    const cleanPhone = patient.phoneNumber ? patient.phoneNumber.trim() : null;
    const rawNumber = cleanPhone ? cleanPhone.replace(/^\+91/, '') : null;

    // Condition: reports explicitly linked to userId OR matched by patient phone number
    const userOrPhoneConditions: Prisma.MedicalReportWhereInput[] = [
      { userId: patient.id },
    ];

    if (cleanPhone) {
      userOrPhoneConditions.push({ patientPhone: cleanPhone });
    }
    if (rawNumber) {
      userOrPhoneConditions.push({ patientPhone: rawNumber });
      userOrPhoneConditions.push({ patientPhone: `+91${rawNumber}` });
    }

    const where: Prisma.MedicalReportWhereInput = {
      AND: [
        { OR: userOrPhoneConditions },
      ],
    };

    if (dto.reportType) {
      where.reportType = dto.reportType;
    }

    if (dto.doctorId) {
      where.doctorId = dto.doctorId;
    }

    if (dto.providerId) {
      where.providerId = dto.providerId;
    }

    if (dto.fromDate || dto.toDate) {
      where.reportDate = {};
      if (dto.fromDate) {
        where.reportDate.gte = new Date(dto.fromDate);
      }
      if (dto.toDate) {
        const endDay = new Date(dto.toDate);
        endDay.setHours(23, 59, 59, 999);
        where.reportDate.lte = endDay;
      }
    }

    if (dto.search && dto.search.trim()) {
      const term = dto.search.trim();
      (where.AND as Prisma.MedicalReportWhereInput[]).push({
        OR: [
          { title: { contains: term } },
          { reportNumber: { contains: term } },
          { doctor: { fullName: { contains: term } } },
          { provider: { name: { contains: term } } },
        ],
      });
    }

    const [total, reports] = await Promise.all([
      this.prisma.medicalReport.count({ where }),
      this.prisma.medicalReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { reportDate: 'desc' },
        include: this.reportInclude,
      }),
    ]);

    return ApiResponseHelper.success('Patient reports retrieved successfully', {
      items: reports.map((r) => this.formatReportResponse(r)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  }

  /**
   * Get single report with strict ownership validation
   */
  async getReportById(reportId: string, callerId: string, callerRole: UserRole) {
    const report = await this.prisma.medicalReport.findFirst({
      where: {
        OR: [{ id: reportId }, { reportNumber: reportId }],
      },
      include: this.reportInclude,
    });

    if (!report) {
      throw new NotFoundException(`Medical report '${reportId}' not found.`);
    }

    await this.verifyReportAccess(report, callerId, callerRole);

    return ApiResponseHelper.success(
      'Medical report retrieved successfully',
      this.formatReportResponse(report),
    );
  }

  /**
   * Generate secure signed download URL for medical report
   */
  async getReportDownloadUrl(
    reportId: string,
    callerId: string,
    callerRole: UserRole,
  ) {
    const report = await this.prisma.medicalReport.findFirst({
      where: {
        OR: [{ id: reportId }, { reportNumber: reportId }],
      },
    });

    if (!report) {
      throw new NotFoundException(`Medical report '${reportId}' not found.`);
    }

    await this.verifyReportAccess(report, callerId, callerRole);

    // Generate signed download URL (valid for 15 minutes)
    const signedUrl = await this.r2Service.getSignedDownloadUrl(
      report.fileKey,
      900,
      report.fileName,
    );

    return ApiResponseHelper.success('Download URL generated successfully', {
      downloadUrl: signedUrl || report.fileUrl,
      fileName: report.fileName,
      mimeType: report.mimeType,
      expiresInSeconds: 900,
    });
  }

  /**
   * Delete a medical report (verifies ownership before removing from DB and R2)
   */
  async deleteReport(reportId: string, callerId: string, callerRole: UserRole) {
    const report = await this.prisma.medicalReport.findFirst({
      where: {
        OR: [{ id: reportId }, { reportNumber: reportId }],
      },
    });

    if (!report) {
      throw new NotFoundException(`Medical report '${reportId}' not found.`);
    }

    // Only Admin, or the issuing doctor, or issuing provider owner can delete
    if (callerRole !== UserRole.ADMIN && callerRole !== UserRole.SUPER_ADMIN) {
      const context = await this.resolveProviderContext(callerId, callerRole);
      const isAuthorizedDoctor = context.doctorId && report.doctorId === context.doctorId;
      const isAuthorizedProvider = context.providerId && report.providerId === context.providerId;

      if (!isAuthorizedDoctor && !isAuthorizedProvider) {
        throw new ForbiddenException(
          'Access Denied: You do not have permission to delete this report.',
        );
      }
    }

    // Delete file from R2
    if (report.fileKey) {
      await this.r2Service.delete(report.fileKey).catch((err) => {
        this.logger.warn(`Failed to delete file from R2: ${err.message}`);
      });
    }

    // Delete record from DB
    await this.prisma.medicalReport.delete({
      where: { id: report.id },
    });

    return ApiResponseHelper.success('Medical report deleted successfully');
  }

  /**
   * Security guard method: checks whether caller is authorized to view/download this report
   */
  private async verifyReportAccess(
    report: any,
    callerId: string,
    callerRole: UserRole,
  ) {
    if (callerRole === UserRole.ADMIN || callerRole === UserRole.SUPER_ADMIN) {
      return;
    }

    if (callerRole === UserRole.PATIENT) {
      const patient = await this.prisma.user.findUnique({
        where: { id: callerId },
        select: { id: true, phoneNumber: true },
      });

      if (!patient) {
        throw new ForbiddenException('Patient account not found.');
      }

      const cleanPhone = patient.phoneNumber?.replace(/^\+91/, '').trim();
      const reportPhone = report.patientPhone?.replace(/^\+91/, '').trim();

      const isDirectUser = report.userId === patient.id;
      const isPhoneMatch = cleanPhone && reportPhone && cleanPhone === reportPhone;

      if (!isDirectUser && !isPhoneMatch) {
        throw new ForbiddenException(
          'Access Denied: You are not authorized to view this medical report.',
        );
      }
      return;
    }

    // Provider / Doctor Access Check
    const context = await this.resolveProviderContext(callerId, callerRole);
    const isDoctor = context.doctorId && report.doctorId === context.doctorId;
    const isProvider = context.providerId && report.providerId === context.providerId;

    if (!isDoctor && !isProvider) {
      throw new ForbiddenException(
        'Access Denied: This medical report belongs to another healthcare facility or doctor.',
      );
    }
  }

  // ─── Admin Global Methods ──────────────────────────────────────

  /**
   * List all reports across the platform with full filters and summary statistics
   */
  async getAdminReports(dto: GetAdminReportsDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.MedicalReportWhereInput = {};

    if (dto.reportType) where.reportType = dto.reportType;
    if (dto.doctorId) where.doctorId = dto.doctorId;
    if (dto.providerId) where.providerId = dto.providerId;
    if (dto.testId) where.testId = dto.testId;
    if (dto.userId) where.userId = dto.userId;

    if (dto.fromDate || dto.toDate) {
      where.reportDate = {};
      if (dto.fromDate) where.reportDate.gte = new Date(dto.fromDate);
      if (dto.toDate) {
        const endDay = new Date(dto.toDate);
        endDay.setHours(23, 59, 59, 999);
        where.reportDate.lte = endDay;
      }
    }

    if (dto.search && dto.search.trim()) {
      const term = dto.search.trim();
      where.OR = [
        { reportNumber: { contains: term } },
        { title: { contains: term } },
        { patientName: { contains: term } },
        { patientPhone: { contains: term } },
        { doctor: { fullName: { contains: term } } },
        { provider: { name: { contains: term } } },
      ];
    }

    const [total, reports, labCount, rxCount, scanCount] = await Promise.all([
      this.prisma.medicalReport.count({ where }),
      this.prisma.medicalReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { reportDate: 'desc' },
        include: this.reportInclude,
      }),
      this.prisma.medicalReport.count({
        where: { ...where, reportType: ReportType.LAB_REPORT },
      }),
      this.prisma.medicalReport.count({
        where: { ...where, reportType: ReportType.PRESCRIPTION },
      }),
      this.prisma.medicalReport.count({
        where: { ...where, reportType: ReportType.RADIOLOGY_SCAN },
      }),
    ]);

    return ApiResponseHelper.success('Admin reports retrieved successfully', {
      items: reports.map((r) => this.formatReportResponse(r)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: {
        totalReports: total,
        labReports: labCount,
        prescriptions: rxCount,
        scans: scanCount,
      },
    });
  }

  /**
   * Admin get report by id
   */
  async getAdminReportById(id: string) {
    const report = await this.prisma.medicalReport.findFirst({
      where: {
        OR: [{ id }, { reportNumber: id }],
      },
      include: this.reportInclude,
    });

    if (!report) {
      throw new NotFoundException(`Medical report '${id}' not found.`);
    }

    return ApiResponseHelper.success(
      'Medical report retrieved successfully',
      this.formatReportResponse(report),
    );
  }

  /**
   * Admin delete report
   */
  async deleteAdminReport(id: string) {
    const report = await this.prisma.medicalReport.findFirst({
      where: {
        OR: [{ id }, { reportNumber: id }],
      },
    });

    if (!report) {
      throw new NotFoundException(`Medical report '${id}' not found.`);
    }

    if (report.fileKey) {
      await this.r2Service.delete(report.fileKey).catch((err) => {
        this.logger.warn(`Failed to delete file from R2: ${err.message}`);
      });
    }

    await this.prisma.medicalReport.delete({
      where: { id: report.id },
    });

    return ApiResponseHelper.success('Medical report deleted successfully');
  }
}

