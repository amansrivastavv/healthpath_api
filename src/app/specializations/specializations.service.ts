import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { GetSpecializationDoctorsDto } from './dto/get-specialization-doctors.dto';
import { Prisma, VerificationStatus } from '@prisma/client';

const SPECIALIZATION_DOCTOR_SELECT = {
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
  rating: true,
  totalRatings: true,
  isActive: true,
  verificationStatus: true,
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
export class SpecializationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const specializations = await this.prisma.specialization.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        description: true,
        isActive: true,
      },
    });

    return ApiResponseHelper.success('Specializations fetched successfully', specializations);
  }

  async findDoctors(specializationId: string, dto: GetSpecializationDoctorsDto) {
    const specialization = await this.prisma.specialization.findFirst({
      where: { id: specializationId, isActive: true },
    });

    if (!specialization) {
      throw new NotFoundException('Specialization not found');
    }

    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.DoctorWhereInput = {
      specializationId,
      isActive: true,
      verificationStatus: VerificationStatus.VERIFIED,
      provider: {
        isActive: true,
      },
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { qualification: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        select: SPECIALIZATION_DOCTOR_SELECT,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.doctor.count({ where }),
    ]);

    return ApiResponseHelper.success('Specialization doctors fetched successfully', {
      specialization: {
        id: specialization.id,
        name: specialization.name,
        slug: specialization.slug,
        icon: specialization.icon,
      },
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}
