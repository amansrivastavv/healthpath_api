import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { R2Service } from '../../r2/r2.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { GetDoctorsDto } from './dto/get-doctors.dto';
import { Prisma, VerificationStatus, UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class AdminDoctorsService {
  private readonly logger = new Logger(AdminDoctorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  async create(dto: CreateDoctorDto, profileImageFile?: Express.Multer.File) {
    // Auto-create Specialization if missing
    let finalSpecializationId = dto.specializationId;
    if (!finalSpecializationId) {
      let spec = await this.prisma.specialization.findFirst({
        where: { name: 'General Physician' },
      });
      if (!spec) {
        spec = await this.prisma.specialization.create({
          data: { name: 'General Physician', slug: 'general-physician', isActive: true },
        });
      }
      finalSpecializationId = spec.id;
    } else {
      const specialization = await this.prisma.specialization.findUnique({
        where: { id: finalSpecializationId },
      });
      if (!specialization) {
        throw new NotFoundException('Specialization not found');
      }
    }

    // Auto-create Provider if missing
    let finalProviderId = dto.providerId;
    if (!finalProviderId) {
      const slugBase = dto.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const provider = await this.prisma.provider.create({
        data: {
          name: `${dto.fullName}'s Clinic`,
          slug: `${slugBase}-clinic-${Date.now()}`,
          type: 'INDIVIDUAL_DOCTOR',
          isVerified: true,
          verificationStatus: 'VERIFIED',
          isActive: true,
        },
      });
      finalProviderId = provider.id;
    } else {
      const provider = await this.prisma.provider.findUnique({
        where: { id: finalProviderId },
      });
      if (!provider) {
        throw new NotFoundException('Provider not found');
      }
    }

    // Validate Medical Registration Number uniqueness
    const existingRegistration = await this.prisma.doctor.findUnique({
      where: { medicalRegistrationNumber: dto.medicalRegistrationNumber },
    });
    if (existingRegistration) {
      throw new ConflictException('Doctor with this medical registration number already exists');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phoneNumber: dto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('User with this phone number already exists');
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

    const randomPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const doctor = await this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          password: hashedPassword,
          phoneNumber: dto.phone ?? null,
          role: UserRole.DOCTOR,
          status: dto.isActive === false ? UserStatus.INACTIVE : UserStatus.ACTIVE,
          emailVerified: true,
        },
      });

      return await prisma.doctor.create({
        data: {
          userId: user.id,
          fullName: dto.fullName,
          profileImage: profileImageUrl,
          specializationId: finalSpecializationId,
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
          providerId: finalProviderId,
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
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
            },
          },
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
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
          },
        },
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
    const doctor = await this.prisma.doctor.findUnique({ where: { id }, include: { user: true } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (dto.email && doctor.user?.email !== dto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (dto.phone && doctor.user?.phoneNumber !== dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phoneNumber: dto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('User with this phone number already exists');
      }
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

    const updated = await this.prisma.$transaction(async (prisma) => {
      if (doctor.userId && (dto.email !== undefined || dto.phone !== undefined || dto.fullName !== undefined || dto.isActive !== undefined)) {
        await prisma.user.update({
          where: { id: doctor.userId },
          data: {
            ...(dto.email !== undefined && { email: dto.email }),
            ...(dto.phone !== undefined && { phoneNumber: dto.phone }),
            ...(dto.fullName !== undefined && { fullName: dto.fullName }),
            ...(dto.isActive !== undefined && { status: dto.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE }),
          },
        });
      }

      return await prisma.doctor.update({
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
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
            },
          },
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
    });

    this.logger.log(`Updated doctor: ${id}`);
    return ApiResponseHelper.success('Doctor updated successfully', updated);
  }

  async remove(id: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Soft delete doctor and associated user
    await this.prisma.$transaction(async (prisma) => {
      await prisma.doctor.update({
        where: { id },
        data: { isActive: false },
      });
      
      if (doctor.userId) {
        await prisma.user.update({
          where: { id: doctor.userId },
          data: { status: UserStatus.INACTIVE },
        });
      }
    });

    this.logger.log(`Soft-deleted doctor: ${id}`);
    return ApiResponseHelper.success('Doctor deleted successfully');
  }
}
