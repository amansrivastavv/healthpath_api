import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { GetConditionsDto } from './dto/get-conditions.dto';
import { GetConditionDoctorsDto } from './dto/get-condition-doctors.dto';
import { GetConditionTestsDto } from './dto/get-condition-tests.dto';
import { Prisma, VerificationStatus } from '@prisma/client';

const CONDITION_DOCTOR_SELECT = {
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

const CONDITION_TEST_SELECT = {
  id: true,
  name: true,
  slug: true,
  code: true,
  shortDescription: true,
  description: true,
  sampleType: true,
  tat: true,
  price: true,
  discountPrice: true,
  isFeatured: true,
  isActive: true,
} satisfies Prisma.TestSelect;

@Injectable()
export class ConditionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: GetConditionsDto) {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.ConditionWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
      
      this.prisma.searchLog.create({
        data: { searchQuery: search, category: 'CONDITION' },
      }).catch((e) => console.error('Error logging search', e));
    }

    const [items, total] = await Promise.all([
      this.prisma.condition.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          description: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              doctors: true,
              tests: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.condition.count({ where }),
    ]);

    const formattedItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      icon: item.icon,
      description: item.description,
      isActive: item.isActive,
      doctorsCount: item._count.doctors,
      testsCount: item._count.tests,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return ApiResponseHelper.success('Conditions fetched successfully', {
      items: formattedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  async findOne(id: string) {
    const condition = await this.prisma.condition.findFirst({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            doctors: true,
            tests: true,
          },
        },
      },
    });

    if (!condition) {
      throw new NotFoundException('Condition not found');
    }

    // Analytics: Increment Profile Views
    this.prisma.condition.update({
      where: { id: condition.id },
      data: { profileViews: { increment: 1 } },
    }).catch((e) => console.error('Error incrementing view count', e));

    return ApiResponseHelper.success('Condition details fetched successfully', {
      id: condition.id,
      name: condition.name,
      slug: condition.slug,
      icon: condition.icon,
      description: condition.description,
      isActive: condition.isActive,
      doctorsCount: condition._count.doctors,
      testsCount: condition._count.tests,
      createdAt: condition.createdAt,
      updatedAt: condition.updatedAt,
    });
  }

  async findDoctors(conditionId: string, dto: GetConditionDoctorsDto) {
    const condition = await this.prisma.condition.findFirst({
      where: { id: conditionId, isActive: true },
    });

    if (!condition) {
      throw new NotFoundException('Condition not found');
    }

    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.DoctorWhereInput = {
      isActive: true,
      verificationStatus: VerificationStatus.VERIFIED,
      provider: {
        isActive: true,
      },
      conditions: {
        some: {
          conditionId,
        },
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
        select: CONDITION_DOCTOR_SELECT,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.doctor.count({ where }),
    ]);

    return ApiResponseHelper.success('Condition doctors fetched successfully', {
      condition: {
        id: condition.id,
        name: condition.name,
        slug: condition.slug,
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

  async findTests(conditionId: string, dto: GetConditionTestsDto) {
    const condition = await this.prisma.condition.findFirst({
      where: { id: conditionId, isActive: true },
    });

    if (!condition) {
      throw new NotFoundException('Condition not found');
    }

    const { page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'asc' } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.TestWhereInput = {
      isActive: true,
      conditions: {
        some: {
          conditionId,
        },
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { shortDescription: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.test.findMany({
        where,
        select: CONDITION_TEST_SELECT,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.test.count({ where }),
    ]);

    return ApiResponseHelper.success('Condition tests fetched successfully', {
      condition: {
        id: condition.id,
        name: condition.name,
        slug: condition.slug,
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
