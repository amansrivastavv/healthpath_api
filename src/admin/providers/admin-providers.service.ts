import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { R2Service } from '../../r2/r2.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { GetProvidersDto } from '../../app/providers/dto/get-providers.dto';
import { Prisma, ProviderType } from '@prisma/client';

@Injectable()
export class AdminProvidersService {
  private readonly logger = new Logger(AdminProvidersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  async create(dto: CreateProviderDto, profileImageFile?: Express.Multer.File) {
    // Check for unique slug
    const existing = await this.prisma.provider.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Provider with this slug already exists');
    }

    let profileImageUrl = dto.profileImage;

    // Handle file upload if present
    if (profileImageFile) {
      const uploadResult = await this.r2Service.upload(
        {
          buffer: profileImageFile.buffer,
          originalname: profileImageFile.originalname,
          mimetype: profileImageFile.mimetype,
        },
        'providers/profiles',
      );
      profileImageUrl = uploadResult.url;
    }

    const provider = await this.prisma.provider.create({
      data: {
        ...dto,
        profileImage: profileImageUrl,
        type: dto.type as ProviderType,
      },
    });

    this.logger.log(`Admin created provider: ${provider.id}`);

    return ApiResponseHelper.success('Provider created successfully', provider);
  }

  async findAll(dto: GetProvidersDto) {
    const { page, limit, search, city, type, verified, homeCollection, sortBy, sortOrder } = dto;
    const skip = (page! - 1) * limit!;

    const where: Prisma.ProviderWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) {
      where.city = { equals: city, mode: 'insensitive' };
    }

    if (type) {
      where.type = type as Prisma.EnumProviderTypeFilter['equals'];
    }

    if (verified !== undefined) {
      where.isVerified = verified === 'true';
    }

    if (homeCollection !== undefined) {
      where.homeCollectionAvailable = homeCollection === 'true';
    }

    const [items, total] = await Promise.all([
      this.prisma.provider.findMany({
        where,
        orderBy: { [sortBy!]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.provider.count({ where }),
    ]);

    return ApiResponseHelper.success('Providers fetched successfully', {
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
    const provider = await this.prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return ApiResponseHelper.success('Provider fetched successfully', provider);
  }

  async update(id: string, dto: UpdateProviderDto, profileImageFile?: Express.Multer.File) {
    // Ensure provider exists
    const provider = await this.prisma.provider.findUnique({ where: { id } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // If updating slug, check uniqueness
    if (dto.slug) {
      const existing = await this.prisma.provider.findFirst({
        where: { slug: dto.slug, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Provider with this slug already exists');
      }
    }

    let profileImageUrl = dto.profileImage;

    // Handle file upload if present
    if (profileImageFile) {
      const uploadResult = await this.r2Service.upload(
        {
          buffer: profileImageFile.buffer,
          originalname: profileImageFile.originalname,
          mimetype: profileImageFile.mimetype,
        },
        'providers/profiles',
      );
      profileImageUrl = uploadResult.url;

      // Optional: Delete the old image from R2 if we are replacing it
      // if (provider.profileImage && provider.profileImage.includes('r2.cloudflarestorage')) {
      //   // Extract key and delete...
      // }
    }

    const updated = await this.prisma.provider.update({
      where: { id },
      data: {
        ...dto,
        profileImage: profileImageUrl !== undefined ? profileImageUrl : undefined,
        type: dto.type ? (dto.type as ProviderType) : undefined,
      },
    });

    this.logger.log(`Admin updated provider: ${id}`);

    return ApiResponseHelper.success('Provider updated successfully', updated);
  }

  async remove(id: string) {
    // Soft delete by setting isActive to false
    await this.findOne(id);

    await this.prisma.provider.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Admin soft-deleted provider: ${id}`);

    return ApiResponseHelper.success('Provider deleted successfully');
  }
}
