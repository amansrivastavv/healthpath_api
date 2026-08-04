import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const MAX_FILE_SIZE_BYTES = 500 * 1024; // 500 KB limit
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      success: true,
      data: user,
      user: user,
    };
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException('User profile not found');
    }

    let profileImageUrl = dto.profileImage;

    // Handle file upload if an image file was attached
    if (file) {
      profileImageUrl = await this.processAndUploadPicture(file);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(profileImageUrl !== undefined && {
          profileImage: profileImageUrl,
        }),
        ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User profile updated for user ID: ${userId}`);

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
      user: updatedUser,
    };
  }

  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException('User profile not found');
    }

    const profileImageUrl = await this.processAndUploadPicture(file);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: profileImageUrl,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImage: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Profile picture uploaded for user ID: ${userId}`);

    return {
      success: true,
      message: 'Profile picture uploaded successfully',
      data: updatedUser,
      user: updatedUser,
    };
  }

  private async processAndUploadPicture(
    file: Express.Multer.File,
  ): Promise<string> {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `Profile picture size must be under 500KB. Received: ${(file.size / 1024).toFixed(1)}KB`,
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type (${file.mimetype}). Allowed types: JPEG, PNG, WEBP, GIF`,
      );
    }

    const uploadResult = await this.r2Service.upload(
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      },
      'profiles',
    );

    return uploadResult.url;
  }
}
