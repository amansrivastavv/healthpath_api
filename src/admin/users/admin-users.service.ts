import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { GetUsersDto } from './dto/get-users.dto';
import { Prisma } from '@prisma/client';

const USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  countryCode: true,
  profileImage: true,
  role: true,
  status: true,
  emailVerified: true,
  phoneVerified: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const USER_DETAIL_SELECT = {
  ...USER_SELECT,
  providers: {
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      city: true,
      isVerified: true,
      isActive: true,
    },
  },
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: GetUsersDto) {
    const { page, limit, search, role, status, sortBy, sortOrder } = dto;
    const skip = (page! - 1) * limit!;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phoneNumber: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        orderBy: { [sortBy!]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    this.logger.log(`Admin fetched ${items.length} users (total: ${total})`);

    return ApiResponseHelper.success('Users fetched successfully', {
      items,
      pagination: {
        page: page!,
        limit: limit!,
        total,
        totalPages: Math.ceil(total / limit!),
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_DETAIL_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return ApiResponseHelper.success('User details fetched successfully', user);
  }
}
