import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { GetUsersDto } from './dto/get-users.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { Prisma, UserRole, UserStatus } from '@prisma/client';

export interface CurrentAdminContext {
  sub: string;
  email: string;
  role: UserRole;
}

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

  async create(dto: CreateAdminUserDto, currentAdmin: CurrentAdminContext) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException({
        message: 'Validation failed',
        errors: [
          {
            field: 'email',
            message: 'Email already exists',
          },
        ],
      });
    }

    if (dto.phoneNumber) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phoneNumber: dto.phoneNumber },
        select: { id: true },
      });

      if (existingPhone) {
        throw new ConflictException({
          message: 'Validation failed',
          errors: [
            {
              field: 'phoneNumber',
              message: 'Phone number already exists',
            },
          ],
        });
      }
    }

    // Role check: Only SUPER_ADMIN can create other SUPER_ADMIN accounts
    const assignedRole = dto.role ?? UserRole.ADMIN;
    if (
      assignedRole === UserRole.SUPER_ADMIN &&
      currentAdmin.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can create other Super Admin accounts',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
        phoneNumber: dto.phoneNumber ?? null,
        countryCode: dto.countryCode ?? '+91',
        profileImage: dto.profileImage ?? null,
        role: assignedRole,
        status: dto.status ?? UserStatus.ACTIVE,
        emailVerified: true,
      },
      select: USER_SELECT,
    });

    this.logger.log(
      `User created by ${currentAdmin.email}: ${newUser.email} with role ${newUser.role}`,
    );

    return ApiResponseHelper.success('User created successfully', newUser);
  }

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

  /**
   * Super Admin assigns or changes a user's role.
   */
  async assignRole(
    id: string,
    dto: AssignRoleDto,
    currentAdmin: CurrentAdminContext,
  ) {
    if (currentAdmin.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Access denied: Only SUPER_ADMIN can assign or change user roles',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Safeguard: Prevent Super Admin from accidentally demoting themselves
    if (
      existingUser.id === currentAdmin.sub &&
      dto.role !== UserRole.SUPER_ADMIN
    ) {
      throw new BadRequestException(
        'You cannot demote yourself from SUPER_ADMIN',
      );
    }

    // Safeguard: Do not leave the system with zero active Super Admins
    if (
      existingUser.role === UserRole.SUPER_ADMIN &&
      dto.role !== UserRole.SUPER_ADMIN
    ) {
      const activeSuperAdminCount = await this.prisma.user.count({
        where: { role: UserRole.SUPER_ADMIN, status: UserStatus.ACTIVE },
      });
      if (activeSuperAdminCount <= 1) {
        throw new BadRequestException(
          'Cannot demote the last remaining active Super Admin',
        );
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: USER_SELECT,
    });

    this.logger.log(
      `Role change: Super Admin ${currentAdmin.email} assigned role ${dto.role} to ${existingUser.email} (ID: ${id})`,
    );

    return ApiResponseHelper.success(
      `User role updated to ${dto.role} successfully`,
      updatedUser,
    );
  }

  /**
   * Update user status (ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION).
   */
  async updateStatus(
    id: string,
    dto: UpdateUserStatusDto,
    currentAdmin: CurrentAdminContext,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Safeguard: Cannot deactivate or suspend own account
    if (
      existingUser.id === currentAdmin.sub &&
      dto.status !== UserStatus.ACTIVE
    ) {
      throw new BadRequestException(
        'You cannot deactivate or suspend your own account',
      );
    }

    // Safeguard: Only Super Admin can change status of another Super Admin
    if (
      existingUser.role === UserRole.SUPER_ADMIN &&
      currentAdmin.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can modify status of another Super Admin',
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      select: USER_SELECT,
    });

    this.logger.log(
      `User status updated: ${existingUser.email} -> ${dto.status} by ${currentAdmin.email}`,
    );

    return ApiResponseHelper.success(
      `User status updated to ${dto.status} successfully`,
      updatedUser,
    );
  }

  /**
   * Update user profile information.
   */
  async update(
    id: string,
    dto: UpdateAdminUserDto,
    currentAdmin: CurrentAdminContext,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Regular admin cannot modify Super Admin profile unless it's their own
    if (
      existingUser.role === UserRole.SUPER_ADMIN &&
      currentAdmin.role !== UserRole.SUPER_ADMIN &&
      existingUser.id !== currentAdmin.sub
    ) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can modify Super Admin accounts',
      );
    }

    if (dto.phoneNumber) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phoneNumber: dto.phoneNumber, NOT: { id } },
        select: { id: true },
      });

      if (existingPhone) {
        throw new ConflictException({
          message: 'Validation failed',
          errors: [
            {
              field: 'phoneNumber',
              message: 'Phone number already in use',
            },
          ],
        });
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
        ...(dto.countryCode !== undefined && { countryCode: dto.countryCode }),
        ...(dto.profileImage !== undefined && { profileImage: dto.profileImage }),
      },
      select: USER_SELECT,
    });

    this.logger.log(`User ${existingUser.email} profile updated by ${currentAdmin.email}`);

    return ApiResponseHelper.success('User updated successfully', updatedUser);
  }

  /**
   * Soft-deactivate user account.
   */
  async remove(id: string, currentAdmin: CurrentAdminContext) {
    if (currentAdmin.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Access denied: Only SUPER_ADMIN can remove or deactivate users',
      );
    }

    if (id === currentAdmin.sub) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.INACTIVE },
      select: USER_SELECT,
    });

    this.logger.log(
      `User ${existingUser.email} deactivated by Super Admin ${currentAdmin.email}`,
    );

    return ApiResponseHelper.success('User deactivated successfully', updatedUser);
  }
}
