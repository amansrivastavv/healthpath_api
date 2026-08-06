import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { GetProvidersDto } from './dto/get-providers.dto';
import { NearbyProvidersDto } from './dto/nearby-providers.dto';
import { Prisma } from '@prisma/client';

/** Select fields exposed to the patient-facing API */
const PROVIDER_SELECT = {
  id: true,
  name: true,
  slug: true,
  type: true,
  description: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  country: true,
  pincode: true,
  latitude: true,
  longitude: true,
  rating: true,
  totalRatings: true,
  openingHours: true,
  homeCollectionAvailable: true,
  profileImage: true,
  coverImage: true,
  isVerified: true,
  isActive: true,
  isFeatured: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProviderSelect;

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /providers — list with pagination, search, filters & sorting.
   */
  async findAll(dto: GetProvidersDto) {
    const { page, limit, search, city, type, verified, homeCollection, sortBy, sortOrder } = dto;
    const skip = (page! - 1) * limit!;

    // Build dynamic where clause
    const where: Prisma.ProviderWhereInput = {
      isActive: true,
    };

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
        select: PROVIDER_SELECT,
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

  /**
   * GET /providers/nearby — find providers within a radius using the Haversine formula.
   *
   * Uses a raw SQL query with the Haversine distance calculation.
   * Can be replaced with PostGIS `ST_DWithin` for production-scale performance.
   */
  async findNearby(dto: NearbyProvidersDto) {
    const { latitude, longitude, radius, page, limit } = dto;
    const skip = (page! - 1) * limit!;

    // Earth radius in kilometers
    const EARTH_RADIUS_KM = 6371;

    // Raw SQL with Haversine formula for distance calculation
    // Filters by is_active = true and only rows that have lat/lng
    const providers = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >`
      SELECT
        id, name, slug, type, description, email, phone,
        address, city, state, country, pincode,
        latitude, longitude,
        rating, total_ratings AS "totalRatings",
        opening_hours AS "openingHours",
        home_collection_available AS "homeCollectionAvailable",
        profile_image AS "profileImage",
        cover_image AS "coverImage",
        is_verified AS "isVerified",
        is_active AS "isActive",
        is_featured AS "isFeatured",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        (
          ${EARTH_RADIUS_KM} * acos(
            cos(radians(${latitude})) * cos(radians(latitude))
            * cos(radians(longitude) - radians(${longitude}))
            + sin(radians(${latitude})) * sin(radians(latitude))
          )
        ) AS distance
      FROM providers
      WHERE is_active = true
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND (
          ${EARTH_RADIUS_KM} * acos(
            cos(radians(${latitude})) * cos(radians(latitude))
            * cos(radians(longitude) - radians(${longitude}))
            + sin(radians(${latitude})) * sin(radians(latitude))
          )
        ) <= ${radius}
      ORDER BY distance ASC
      LIMIT ${limit} OFFSET ${skip}
    `;

    // Count total matching rows
    const countResult = await this.prisma.$queryRaw<
      Array<{ count: bigint }>
    >`
      SELECT COUNT(*)::bigint AS count
      FROM providers
      WHERE is_active = true
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND (
          ${EARTH_RADIUS_KM} * acos(
            cos(radians(${latitude})) * cos(radians(latitude))
            * cos(radians(longitude) - radians(${longitude}))
            + sin(radians(${latitude})) * sin(radians(latitude))
          )
        ) <= ${radius}
    `;

    const total = Number(countResult[0]?.count ?? 0);

    // Round distance to 2 decimal places
    const items = providers.map((p) => ({
      ...p,
      distance: Math.round((p.distance as number) * 100) / 100,
    }));

    return ApiResponseHelper.success('Nearby providers fetched successfully', {
      items,
      pagination: {
        page: page!,
        limit: limit!,
        total,
        totalPages: Math.ceil(total / limit!),
      },
    });
  }

  /**
   * GET /providers/:id — single provider by UUID.
   */
  async findOne(id: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      select: PROVIDER_SELECT,
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return ApiResponseHelper.success('Provider fetched successfully', provider);
  }
}
