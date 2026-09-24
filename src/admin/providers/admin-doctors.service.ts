import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { R2Service } from '../../r2/r2.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { GetDoctorsDto } from './dto/get-doctors.dto';
import { Prisma, VerificationStatus } from '@prisma/client';

@Injectable()
export class AdminDoctorsService {
  private readonly logger = new Logger(AdminDoctorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  async create(dto: CreateDoctorDto, profileImageFile?: Express.Multer.File) {
    // Validate Specialization
    const specialization = await this.prisma.specialization.findUnique({
      where: { id: dto.specializationId },
    });
    if (!specialization) {
      throw new NotFoundException('Specialization not found');
    }

    // Validate Provider
    const provider = await this.prisma.provider.findUnique({
      where: { id: dto.providerId },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Validate Medical Registration Number uniqueness
    const existingRegistration = await this.prisma.doctor.findUnique({
      where: { medicalRegistrationNumber: dto.medicalRegistrationNumber },
    });
    if (existingRegistration) {
      throw new ConflictException('Doctor with this medical registration number already exists');
    }

    let profileImageUrl = dto.profileImage;
    if (profileImageFile) {
      const uploadResult = await this.r2Service.upload(
        {
          buffer: profileImageFile.buffer,
          originalname: profileImageFile.originalname,
          mimetype: profileImageFile.mimetype,
        },
        'doctors/profiles',
      );
      profileImageUrl = uploadResult.url;
    }

    const doctor = await this.prisma.doctor.create({
      data: {
        fullName: dto.fullName,
        profileImage: profileImageUrl,
        specializationId: dto.specializationId,
        qualification: dto.qualification,
        experienceYears: dto.experienceYears ?? 0,
        medicalRegistrationNumber: dto.medicalRegistrationNumber,
        gender: dto.gender,
        languages: dto.languages ?? [],
        about: dto.about,
        consultationFee: dto.consultationFee ?? 0,
        onlineConsultationFee: dto.onlineConsultationFee,
        inPersonConsultationFee: dto.inPersonConsultationFee,
        homeVisitFee: dto.homeVisitFee,
        consultationTypes: dto.consultationTypes ?? ['IN_PERSON'],
        providerId: dto.providerId,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        verificationStatus: dto.verificationStatus ?? VerificationStatus.PENDING,
      },
      include: {
        specialization: true,
        provider: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            city: true,
            state: true,
          },
        },
      },
    });

    this.logger.log(`Created doctor: ${doctor.id}`);
    return ApiResponseHelper.success('Doctor created successfully', doctor);
  }

  async findAll(dto: GetDoctorsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      providerId,
      specializationId,
      providerType,
      city,
      state,
      isActive,
      verificationStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.DoctorWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { qualification: { contains: search } },
        { medicalRegistrationNumber: { contains: search } },
      ];
    }

    if (providerId) {
      where.providerId = providerId;
    }

    if (specializationId) {
      where.specializationId = specializationId;
    }

    const providerWhere: Prisma.ProviderWhereInput = {};
    if (providerType) {
      providerWhere.type = providerType;
    }
    if (city) {
      providerWhere.city = { equals: city };
    }
    if (state) {
      providerWhere.state = { equals: state };
    }
    if (Object.keys(providerWhere).length > 0) {
      where.provider = providerWhere;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }

    const [items, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        include: {
          specialization: true,
          provider: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              city: true,
              state: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.doctor.count({ where }),
    ]);

    return ApiResponseHelper.success('Doctors fetched successfully', {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        specialization: true,
        provider: true,
        availabilities: {
          where: { isActive: true },
        },
        documents: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return ApiResponseHelper.success('Doctor fetched successfully', doctor);
  }

  async update(id: string, dto: UpdateDoctorDto, profileImageFile?: Express.Multer.File) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (dto.specializationId && dto.specializationId !== doctor.specializationId) {
      const specialization = await this.prisma.specialization.findUnique({
        where: { id: dto.specializationId },
      });
      if (!specialization) {
        throw new NotFoundException('Specialization not found');
      }
    }

    if (dto.providerId && dto.providerId !== doctor.providerId) {
      const provider = await this.prisma.provider.findUnique({
        where: { id: dto.providerId },
      });
      if (!provider) {
        throw new NotFoundException('Provider not found');
      }
    }

    if (
      dto.medicalRegistrationNumber &&
      dto.medicalRegistrationNumber !== doctor.medicalRegistrationNumber
    ) {
      const existingRegistration = await this.prisma.doctor.findUnique({
        where: { medicalRegistrationNumber: dto.medicalRegistrationNumber },
      });
      if (existingRegistration) {
        throw new ConflictException('Doctor with this medical registration number already exists');
      }
    }

    let profileImageUrl = dto.profileImage;
    if (profileImageFile) {
      const uploadResult = await this.r2Service.upload(
        {
          buffer: profileImageFile.buffer,
          originalname: profileImageFile.originalname,
          mimetype: profileImageFile.mimetype,
        },
        'doctors/profiles',
      );
      profileImageUrl = uploadResult.url;
    }

    const updated = await this.prisma.doctor.update({
      where: { id },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(profileImageUrl !== undefined && { profileImage: profileImageUrl }),
        ...(dto.specializationId && { specializationId: dto.specializationId }),
        ...(dto.qualification && { qualification: dto.qualification }),
        ...(dto.experienceYears !== undefined && { experienceYears: dto.experienceYears }),
        ...(dto.medicalRegistrationNumber && { medicalRegistrationNumber: dto.medicalRegistrationNumber }),
        ...(dto.gender && { gender: dto.gender }),
        ...(dto.languages && { languages: dto.languages }),
        ...(dto.about !== undefined && { about: dto.about }),
        ...(dto.consultationFee !== undefined && { consultationFee: dto.consultationFee }),
        ...(dto.onlineConsultationFee !== undefined && { onlineConsultationFee: dto.onlineConsultationFee }),
        ...(dto.inPersonConsultationFee !== undefined && { inPersonConsultationFee: dto.inPersonConsultationFee }),
        ...(dto.homeVisitFee !== undefined && { homeVisitFee: dto.homeVisitFee }),
        ...(dto.consultationTypes && { consultationTypes: dto.consultationTypes }),
        ...(dto.providerId && { providerId: dto.providerId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.verificationStatus && { verificationStatus: dto.verificationStatus }),
      },
      include: {
        specialization: true,
        provider: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            city: true,
            state: true,
          },
        },
      },
    });

    this.logger.log(`Updated doctor: ${id}`);
    return ApiResponseHelper.success('Doctor updated successfully', updated);
  }

  async remove(id: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Soft delete
    await this.prisma.doctor.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Soft-deleted doctor: ${id}`);
    return ApiResponseHelper.success('Doctor deleted successfully');
  }
}
