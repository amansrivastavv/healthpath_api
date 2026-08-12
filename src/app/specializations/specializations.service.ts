import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponseHelper } from '../../common/utils/response.util';

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
      },
    });

    return ApiResponseHelper.success('Specializations fetched successfully', specializations);
  }
}
