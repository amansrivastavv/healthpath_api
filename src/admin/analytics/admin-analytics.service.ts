import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalPatients,
      totalDoctors,
      totalTests,
      totalConditions,
      topSearches
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.PATIENT } }),
      this.prisma.doctor.count({ where: { isActive: true } }),
      this.prisma.test.count({ where: { isActive: true } }),
      this.prisma.condition.count({ where: { isActive: true } }),
      this.prisma.searchLog.groupBy({
        by: ['searchQuery', 'category'],
        _count: { searchQuery: true },
        orderBy: { _count: { searchQuery: 'desc' } },
        take: 10,
      })
    ]);

    const formattedTopSearches = topSearches.map(item => ({
      query: item.searchQuery,
      category: item.category,
      count: item._count.searchQuery
    }));

    return ApiResponseHelper.success('Analytics dashboard data fetched successfully', {
      counts: {
        patients: totalPatients,
        doctors: totalDoctors,
        tests: totalTests,
        conditions: totalConditions,
      },
      topSearches: formattedTopSearches
    });
  }
}
