import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { R2Service } from '../../r2/r2.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { GetAppDoctorsDto } from './dto/get-app-doctors.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { Prisma, VerificationStatus } from '@prisma/client';

const PATIENT_DOCTOR_SELECT = {
  id: true,
  fullName: true,
  profileImage: true,
  qualification: true,
  experienceYears: true,
  medicalRegistrationNumber: true,
  gender: true,
  languages: true,
  about: true,
  consultationFee: true,
  onlineConsultationFee: true,
  inPersonConsultationFee: true,
  homeVisitFee: true,
  consultationTypes: true,
  isActive: true,
  verificationStatus: true,
  createdAt: true,
  updatedAt: true,
  specialization: {
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
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
      address: true,
      latitude: true,
      longitude: true,
      rating: true,
      totalRatings: true,
      profileImage: true,
    },
  },
} satisfies Prisma.DoctorSelect;

@Injectable()
export class DoctorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  async findAll(dto: GetAppDoctorsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      city,
      specializationId,
      providerType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.DoctorWhereInput = {
      isActive: true,
      verificationStatus: VerificationStatus.VERIFIED,
      provider: {
        isActive: true,
        ...(city ? { city: { equals: city } } : {}),
        ...(providerType ? { type: providerType } : {}),
      },
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { qualification: { contains: search } },
      ];
    }

    if (specializationId) {
      where.specializationId = specializationId;
    }

    const [items, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        select: PATIENT_DOCTOR_SELECT,
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
    const doctor = await this.prisma.doctor.findFirst({
      where: {
        id,
        isActive: true,
        verificationStatus: VerificationStatus.VERIFIED,
        provider: {
          isActive: true,
        },
      },
      select: {
        ...PATIENT_DOCTOR_SELECT,
        availabilities: {
          where: { isActive: true },
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            slotDuration: true,
            breakStart: true,
            breakEnd: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return ApiResponseHelper.success('Doctor fetched successfully', doctor);
  }

  async getMe(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      select: {
        ...PATIENT_DOCTOR_SELECT,
        availabilities: {
          where: { isActive: true },
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            slotDuration: true,
            breakStart: true,
            breakEnd: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return ApiResponseHelper.success('Doctor profile fetched successfully', doctor);
  }

  async updateMe(userId: string, dto: UpdateDoctorProfileDto, profileImageFile?: Express.Multer.File) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
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
      if (dto.fullName !== undefined) {
        await prisma.user.update({
          where: { id: userId },
          data: { fullName: dto.fullName },
        });
      }
      return await prisma.doctor.update({
        where: { id: doctor.id },
        data: {
          ...(dto.fullName && { fullName: dto.fullName }),
          ...(profileImageUrl !== undefined && { profileImage: profileImageUrl }),
          ...(dto.about !== undefined && { about: dto.about }),
          ...(dto.consultationFee !== undefined && { consultationFee: dto.consultationFee }),
          ...(dto.onlineConsultationFee !== undefined && { onlineConsultationFee: dto.onlineConsultationFee }),
          ...(dto.inPersonConsultationFee !== undefined && { inPersonConsultationFee: dto.inPersonConsultationFee }),
          ...(dto.homeVisitFee !== undefined && { homeVisitFee: dto.homeVisitFee }),
          ...(dto.consultationTypes && { consultationTypes: dto.consultationTypes }),
          ...(dto.languages && { languages: dto.languages }),
        },
        select: PATIENT_DOCTOR_SELECT,
      });
    });

    return ApiResponseHelper.success('Doctor profile updated successfully', updated);
  }
}
