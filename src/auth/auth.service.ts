import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service';
import { generateSecureToken, hashToken } from '../common/utils/crypto.util';
import { ApiResponseHelper } from '../common/utils/response.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
        email: true,
      },
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

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
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

    this.logger.log(`New user registered: ${user.email}`);

    const userProfile = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return ApiResponseHelper.success(
      'User registered successfully',
      userProfile,
    );
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        password: true,
        profileImage: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    this.logger.log(`User logged in: ${user.email}`);

    const userProfile = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return ApiResponseHelper.success('Login successful', {
      accessToken,
      user: userProfile,
    });
  }

  logout() {
    return ApiResponseHelper.success('Logged out successfully');
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true },
    });

    if (user) {
      const rawToken = generateSecureToken();
      const hashedToken = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpires: expiresAt,
        },
      });

      await this.mailService.sendForgotPasswordEmail(user.email, rawToken);
    }

    return ApiResponseHelper.success(
      'If an account exists, a password reset link has been sent.',
    );
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashedToken = hashToken(dto.token);

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gte: new Date(),
        },
      },
      select: { id: true },
    });

    if (!user) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: [
          {
            field: 'token',
            message: 'Invalid or expired reset token',
          },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return ApiResponseHelper.success('Password reset successfully.');
  }
}
