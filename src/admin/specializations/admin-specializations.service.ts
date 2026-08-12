import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';
import { GetSpecializationsDto } from './dto/get-specializations.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminSpecializationsService {
  private readonly logger = new Logger(AdminSpecializationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(dto: CreateSpecializationDto) {
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);

    const existingName = await this.prisma.specialization.findUnique({
      where: { name: dto.name },
    });

    if (existingName) {
      throw new ConflictException('Specialization with this name already exists');
    }

    const existingSlug = await this.prisma.specialization.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException('Specialization with this slug already exists');
    }

    const specialization = await this.prisma.specialization.create({
      data: {
        name: dto.name,
        slug,
        icon: dto.icon,
        description: dto.description,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });

    this.logger.log(`Created specialization: ${specialization.id}`);
    return ApiResponseHelper.success('Specialization created successfully', specialization);
  }

  async findAll(dto: GetSpecializationsDto) {
    const { page = 1, limit = 10, search, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.SpecializationWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [items, total] = await Promise.all([
      this.prisma.specialization.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.specialization.count({ where }),
    ]);

    return ApiResponseHelper.success('Specializations fetched successfully', {
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
    const specialization = await this.prisma.specialization.findUnique({
      where: { id },
    });

    if (!specialization) {
      throw new NotFoundException('Specialization not found');
    }

    return ApiResponseHelper.success('Specialization fetched successfully', specialization);
  }

  async update(id: string, dto: UpdateSpecializationDto) {
    const specialization = await this.prisma.specialization.findUnique({ where: { id } });
    if (!specialization) {
      throw new NotFoundException('Specialization not found');
    }

    if (dto.name && dto.name !== specialization.name) {
      const existingName = await this.prisma.specialization.findUnique({ where: { name: dto.name } });
      if (existingName) {
        throw new ConflictException('Specialization with this name already exists');
      }
    }

    let slug = specialization.slug;
    if (dto.slug) {
      slug = this.slugify(dto.slug);
    } else if (dto.name && dto.name !== specialization.name) {
      slug = this.slugify(dto.name);
    }

    if (slug !== specialization.slug) {
      const existingSlug = await this.prisma.specialization.findUnique({ where: { slug } });
      if (existingSlug) {
        throw new ConflictException('Specialization with this slug already exists');
      }
    }

    const updated = await this.prisma.specialization.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        slug,
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    this.logger.log(`Updated specialization: ${id}`);
    return ApiResponseHelper.success('Specialization updated successfully', updated);
  }

  async remove(id: string) {
    const specialization = await this.prisma.specialization.findUnique({ where: { id } });
    if (!specialization) {
      throw new NotFoundException('Specialization not found');
    }

    // Soft delete
    await this.prisma.specialization.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Soft-deleted specialization: ${id}`);
    return ApiResponseHelper.success('Specialization deleted successfully');
  }
}
