import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { R2Service } from '../../r2/r2.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { GetProvidersDto } from '../../app/providers/dto/get-providers.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { AdminDoctorsService } from './admin-doctors.service';
import { Prisma, ProviderType, VerificationStatus } from '@prisma/client';

@Injectable()
export class AdminProvidersService {
  private readonly logger = new Logger(AdminProvidersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
    private readonly doctorsService: AdminDoctorsService,
  ) {}

  async create(dto: CreateProviderDto, profileImageFile?: Express.Multer.File) {
    const existing = await this.prisma.provider.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Provider with this slug already exists');
    }

    let profileImageUrl = dto.profileImage;
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
        name: dto.name,
        slug: dto.slug,
        type: dto.type,
        description: dto.description,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country ?? 'India',
        pincode: dto.pincode,
        latitude: dto.latitude,
        longitude: dto.longitude,
        establishedYear: dto.establishedYear,
        emergencyAvailable: dto.emergencyAvailable ?? false,
        available24x7: dto.available24x7 ?? false,
        parkingAvailable: dto.parkingAvailable ?? false,
        pharmacyAvailable: dto.pharmacyAvailable ?? false,
        wheelchairAccessible: dto.wheelchairAccessible ?? false,
        openingHours: dto.openingHours,
        homeCollectionAvailable: dto.homeCollectionAvailable ?? false,
        profileImage: profileImageUrl,
        coverImages: dto.coverImages ?? [],
        isVerified: dto.isVerified ?? false,
        verificationStatus: dto.verificationStatus ?? VerificationStatus.PENDING,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });

    this.logger.log(`Admin created provider: ${provider.id}`);
    return ApiResponseHelper.success('Provider created successfully', provider);
  }

  async findAll(dto: GetProvidersDto) {
    const {
      page = 1,
      limit = 10,
      search,
      city,
      state,
      type,
      verified,
      verificationStatus,
      isActive,
      homeCollection,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = dto;
    const skip = (page - 1) * limit;

    const where: Prisma.ProviderWhereInput = {};

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

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (homeCollection !== undefined) {
      where.homeCollectionAvailable = homeCollection === 'true';
    }

    const [items, total] = await Promise.all([
      this.prisma.provider.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.provider.count({ where }),
    ]);

    return ApiResponseHelper.success('Providers fetched successfully', {
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
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      include: {
        doctors: {
          include: {
            specialization: true,
          },
        },
        documents: true,
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return ApiResponseHelper.success('Provider fetched successfully', provider);
  }

  async update(id: string, dto: UpdateProviderDto, profileImageFile?: Express.Multer.File) {
    const provider = await this.prisma.provider.findUnique({ where: { id } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    if (dto.slug && dto.slug !== provider.slug) {
      const existing = await this.prisma.provider.findFirst({
        where: { slug: dto.slug, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException('Provider with this slug already exists');
      }
    }

    let profileImageUrl = dto.profileImage;
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

    const updated = await this.prisma.provider.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug }),
        ...(dto.type && { type: dto.type }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.website !== undefined && { website: dto.website }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.pincode !== undefined && { pincode: dto.pincode }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.establishedYear !== undefined && { establishedYear: dto.establishedYear }),
        ...(dto.emergencyAvailable !== undefined && { emergencyAvailable: dto.emergencyAvailable }),
        ...(dto.available24x7 !== undefined && { available24x7: dto.available24x7 }),
        ...(dto.parkingAvailable !== undefined && { parkingAvailable: dto.parkingAvailable }),
        ...(dto.pharmacyAvailable !== undefined && { pharmacyAvailable: dto.pharmacyAvailable }),
        ...(dto.wheelchairAccessible !== undefined && { wheelchairAccessible: dto.wheelchairAccessible }),
        ...(dto.openingHours !== undefined && { openingHours: dto.openingHours }),
        ...(dto.homeCollectionAvailable !== undefined && { homeCollectionAvailable: dto.homeCollectionAvailable }),
        ...(profileImageUrl !== undefined && { profileImage: profileImageUrl }),
        ...(dto.coverImages !== undefined && { coverImages: dto.coverImages }),
        ...(dto.isVerified !== undefined && { isVerified: dto.isVerified }),
        ...(dto.verificationStatus !== undefined && { verificationStatus: dto.verificationStatus }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    this.logger.log(`Admin updated provider: ${id}`);
    return ApiResponseHelper.success('Provider updated successfully', updated);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.provider.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Admin soft-deleted provider: ${id}`);
    return ApiResponseHelper.success('Provider deleted successfully');
  }

  async getDoctorsByProviderId(providerId: string) {
    const provider = await this.prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const doctors = await this.prisma.doctor.findMany({
      where: { providerId },
      include: {
        specialization: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponseHelper.success('Provider doctors fetched successfully', doctors);
  }

  async createDoctorForProvider(
    providerId: string,
    dto: CreateDoctorDto,
    profileImageFile?: Express.Multer.File,
  ) {
    return this.doctorsService.create({ ...dto, providerId }, profileImageFile);
  }
}
