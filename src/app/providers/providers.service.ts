import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { GetProvidersDto } from './dto/get-providers.dto';
import { NearbyProvidersDto } from './dto/nearby-providers.dto';
import { Prisma, VerificationStatus } from '@prisma/client';

/** Select fields exposed to the patient-facing API */
const PROVIDER_SELECT = {
  id: true,
  name: true,
  slug: true,
  type: true,
  description: true,
  email: true,
  phone: true,
  website: true,
  address: true,
  city: true,
  state: true,
  country: true,
  pincode: true,
  latitude: true,
  longitude: true,
  establishedYear: true,
  emergencyAvailable: true,
  available24x7: true,
  parkingAvailable: true,
  pharmacyAvailable: true,
  wheelchairAccessible: true,
  rating: true,
  totalRatings: true,
  openingHours: true,
  homeCollectionAvailable: true,
  profileImage: true,
  coverImage: true,
  coverImages: true,
  isVerified: true,
  verificationStatus: true,
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
    const { page, limit, search, city, state, type, verified, verificationStatus, homeCollection, sortBy, sortOrder } = dto;
    const skip = (page! - 1) * limit!;

    // Build dynamic where clause
    const where: Prisma.ProviderWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { city: { contains: search } },
      ];
    }

    if (city) {
      where.city = { equals: city };
    }

    if (state) {
      where.state = { equals: state };
    }

    if (type) {
      where.type = type;
    }

    if (verified !== undefined) {
      where.isVerified = verified === 'true';
    }

    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
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
   */
  async findNearby(dto: NearbyProvidersDto) {
    const { latitude, longitude, radius, page, limit } = dto;
    const skip = (page! - 1) * limit!;

    const EARTH_RADIUS_KM = 6371;

    const providers = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >`
      SELECT
        id, name, slug, type, description, email, phone, website,
        address, city, state, country, pincode,
        latitude, longitude,
        established_year AS "establishedYear",
        emergency_available AS "emergencyAvailable",
        available_24x7 AS "available24x7",
        parking_available AS "parkingAvailable",
        pharmacy_available AS "pharmacyAvailable",
        wheelchair_accessible AS "wheelchairAccessible",
        rating, total_ratings AS "totalRatings",
        opening_hours AS "openingHours",
        home_collection_available AS "homeCollectionAvailable",
        profile_image AS "profileImage",
        cover_image AS "coverImage",
        cover_images AS "coverImages",
        is_verified AS "isVerified",
        verification_status AS "verificationStatus",
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
    const provider = await this.prisma.provider.findFirst({
      where: { id, isActive: true },
      select: PROVIDER_SELECT,
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return ApiResponseHelper.success('Provider fetched successfully', provider);
  }

  /**
   * GET /providers/:id/doctors — get active & verified doctors for a provider.
   */
  async findDoctorsByProviderId(providerId: string) {
    const provider = await this.prisma.provider.findFirst({
      where: { id: providerId, isActive: true },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const doctors = await this.prisma.doctor.findMany({
      where: {
        providerId,
        isActive: true,
        verificationStatus: VerificationStatus.VERIFIED,
      },
      select: {
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
        specialization: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponseHelper.success('Provider doctors fetched successfully', doctors);
  }
}
