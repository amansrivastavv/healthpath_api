import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class TrendingService {
  constructor(private prisma: PrismaService) {}

  async getTrendingDoctors(limit: number = 5) {
    const doctors = await this.prisma.doctor.findMany({
      where: { isActive: true, verificationStatus: VerificationStatus.VERIFIED },
      orderBy: { profileViews: 'desc' },
      take: limit,
      select: {
        id: true,
        fullName: true,
        profileImage: true,
        qualification: true,
        experienceYears: true,
        rating: true,
        totalRatings: true,
        consultationFee: true,
        specialization: { select: { name: true, slug: true } },
      }
    });
    return ApiResponseHelper.success('Trending doctors fetched successfully', doctors);
  }

  async getTrendingConditions(limit: number = 5) {
    const conditions = await this.prisma.condition.findMany({
      where: { isActive: true },
      orderBy: { profileViews: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        description: true,
      }
    });
    return ApiResponseHelper.success('Trending conditions fetched successfully', conditions);
  }

  async getTrendingTests(limit: number = 5) {
    const tests = await this.prisma.test.findMany({
      where: { isActive: true },
      orderBy: { profileViews: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        price: true,
        discountPrice: true,
      }
    });
    return ApiResponseHelper.success('Trending tests fetched successfully', tests);
  }
}
