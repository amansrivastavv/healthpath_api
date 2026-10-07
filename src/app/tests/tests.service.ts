import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { GetTestsDto } from './dto/get-tests.dto';
import { GetTestLabsDto } from './dto/get-test-labs.dto';
import { Prisma, VerificationStatus } from '@prisma/client';

@Injectable()
export class TestsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate distance between two lat/lon points using Haversine formula (km).
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  /**
   * GET /api/v1/tests — list tests with filters & pagination
   */
  async findAll(dto: GetTestsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      conditionId,
      sampleType,
      isFeatured,
      sortBy = 'name',
      sortOrder = 'asc',
    } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.TestWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { shortDescription: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (conditionId) {
      where.conditions = {
        some: {
          conditionId,
        },
      };
    }

    if (sampleType) {
      where.sampleType = { contains: sampleType };
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    const [tests, total] = await Promise.all([
      this.prisma.test.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          code: true,
          shortDescription: true,
          description: true,
          preparation: true,
          sampleType: true,
          tat: true,
          price: true,
          discountPrice: true,
          isActive: true,
          isFeatured: true,
          createdAt: true,
          updatedAt: true,
          conditions: {
            select: {
              condition: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  icon: true,
                },
              },
            },
          },
          _count: {
            select: {
              providerTests: {
                where: {
                  isActive: true,
                  provider: {
                    isActive: true,
                  },
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.test.count({ where }),
    ]);

    const items = tests.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      code: t.code,
      shortDescription: t.shortDescription,
      description: t.description,
      preparation: t.preparation,
      sampleType: t.sampleType,
      tat: t.tat,
      price: t.price ?? 0,
      discountPrice: t.discountPrice,
      isActive: t.isActive,
      isFeatured: t.isFeatured,
      conditions: t.conditions.map((c) => c.condition),
      availableLabsCount: t._count.providerTests,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return ApiResponseHelper.success('Tests fetched successfully', {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  /**
   * GET /api/v1/tests/:id — single test details
   */
  async findOne(id: string) {
    const test = await this.prisma.test.findFirst({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        code: true,
        shortDescription: true,
        description: true,
        preparation: true,
        sampleType: true,
        tat: true,
        price: true,
        discountPrice: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        conditions: {
          select: {
            condition: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: {
            providerTests: {
              where: {
                isActive: true,
                provider: {
                  isActive: true,
                },
              },
            },
          },
        },
      },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    const result = {
      id: test.id,
      name: test.name,
      slug: test.slug,
      code: test.code,
      shortDescription: test.shortDescription,
      description: test.description,
      preparation: test.preparation,
      sampleType: test.sampleType,
      tat: test.tat,
      price: test.price ?? 0,
      discountPrice: test.discountPrice,
      isActive: test.isActive,
      isFeatured: test.isFeatured,
      conditions: test.conditions.map((c) => c.condition),
      availableLabsCount: test._count.providerTests,
      createdAt: test.createdAt,
      updatedAt: test.updatedAt,
    };

    return ApiResponseHelper.success('Test details fetched successfully', result);
  }

  /**
   * GET /api/v1/tests/:id/labs — get labs offering a specific test
   */
  async findLabs(testId: string, dto: GetTestLabsDto) {
    const test = await this.prisma.test.findFirst({
      where: { id: testId, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        code: true,
        price: true,
      },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    const {
      page = 1,
      limit = 10,
      latitude,
      longitude,
      radius = 10,
      city,
      homeCollection,
      sortBy = 'price',
      sortOrder = 'asc',
    } = dto;

    const where: Prisma.ProviderTestWhereInput = {
      testId,
      isActive: true,
      provider: {
        isActive: true,
        verificationStatus: VerificationStatus.VERIFIED,
        ...(city ? { city: { equals: city } } : {}),
      },
    };

    if (homeCollection !== undefined) {
      const hcBool = homeCollection === 'true';
      if (hcBool) {
        where.OR = [
          { homeCollectionAvailable: true },
          { provider: { homeCollectionAvailable: true } },
        ];
      }
    }

    const providerTests = await this.prisma.providerTest.findMany({
      where,
      select: {
        id: true,
        price: true,
        discountPrice: true,
        homeCollectionAvailable: true,
        labVisitAvailable: true,
        turnaroundTime: true,
        provider: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            profileImage: true,
            coverImage: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
            latitude: true,
            longitude: true,
            rating: true,
            totalRatings: true,
            homeCollectionAvailable: true,
            openingHours: true,
            isVerified: true,
          },
        },
      },
    });

    // Process and enrich with distance if lat/lon provided
    let items = providerTests.map((pt) => {
      let distance: number | undefined;
      if (
        latitude !== undefined &&
        longitude !== undefined &&
        pt.provider.latitude !== null &&
        pt.provider.longitude !== null
      ) {
        distance = this.calculateDistance(
          latitude,
          longitude,
          pt.provider.latitude,
          pt.provider.longitude,
        );
      }

      return {
        id: pt.provider.id,
        name: pt.provider.name,
        slug: pt.provider.slug,
        type: pt.provider.type,
        profileImage: pt.provider.profileImage,
        coverImage: pt.provider.coverImage,
        address: pt.provider.address,
        city: pt.provider.city,
        state: pt.provider.state,
        pincode: pt.provider.pincode,
        latitude: pt.provider.latitude,
        longitude: pt.provider.longitude,
        distance,
        rating: pt.provider.rating ?? 0,
        totalRatings: pt.provider.totalRatings ?? 0,
        testPrice: pt.price,
        discountPrice: pt.discountPrice,
        homeCollectionAvailable:
          pt.homeCollectionAvailable || pt.provider.homeCollectionAvailable,
        labVisitAvailable: pt.labVisitAvailable,
        turnaroundTime: pt.turnaroundTime,
        openingHours: pt.provider.openingHours,
        isVerified: pt.provider.isVerified,
      };
    });

    // Radius filter if distance was calculated
    if (latitude !== undefined && longitude !== undefined && radius) {
      items = items.filter(
        (item) => item.distance !== undefined && item.distance <= radius,
      );
    }

    // Sort items
    items.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'price') {
        comparison = (a.discountPrice ?? a.testPrice) - (b.discountPrice ?? b.testPrice);
      } else if (sortBy === 'rating') {
        comparison = (b.rating ?? 0) - (a.rating ?? 0);
      } else if (sortBy === 'distance') {
        const distA = a.distance ?? Number.MAX_VALUE;
        const distB = b.distance ?? Number.MAX_VALUE;
        comparison = distA - distB;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = items.length;
    const paginatedItems = items.slice((page - 1) * limit, page * limit);

    return ApiResponseHelper.success('Labs for test fetched successfully', {
      test: {
        id: test.id,
        name: test.name,
        slug: test.slug,
        code: test.code,
      },
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}
