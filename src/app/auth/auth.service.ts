import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { MailService } from '../../mail/mail.service';
import { OAuth2Client } from 'google-auth-library';
import { generateSecureToken, generateOTP, hashToken } from '../../common/utils/crypto.util';
import { ApiResponseHelper } from '../../common/utils/response.util';

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
        authProvider: true,
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
      authProvider: user.authProvider === 'LOCAL' ? 'email' : 'google',
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
        authProvider: true,
        profileImage: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'Invalid email or password. Please sign in with Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    this.logger.log(`User logged in: ${user.email}`);

    const userProfile = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      authProvider: user.authProvider === 'LOCAL' ? 'email' : 'google',
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

  async googleLogin(dto: GoogleLoginDto) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    try {
      const ticket = await client.verifyIdToken({
        idToken: dto.token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const { email, name, picture, sub: googleId } = payload;

      let user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            fullName: name || 'Google User',
            profileImage: picture,
            authProvider: 'GOOGLE',
            googleId,
            emailVerified: true,
          },
        });
        this.logger.log(`New user registered via Google: ${user.email}`);
      } else {
        if (!user.googleId) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { 
              googleId, 
              authProvider: 'GOOGLE',
              profileImage: user.profileImage || picture,
            }
          });
        }
      }

      const jwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = await this.jwtService.signAsync(jwtPayload);

      this.logger.log(`User logged in via Google: ${user.email}`);

      const userProfile = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        authProvider: user.authProvider === 'LOCAL' ? 'email' : 'google',
        profileImage: user.profileImage,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return ApiResponseHelper.success('Google login successful', {
        accessToken,
        user: userProfile,
      });
    } catch (error) {
      this.logger.error(`Google login failed: ${error.message}`);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  logout() {
    return ApiResponseHelper.success('Logged out successfully');
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    this.logger.log(`Forgot password requested for email: ${dto.email}`);
    
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true },
    });

    if (user) {
      this.logger.log(`User found in DB for email: ${dto.email}. Generating OTP and sending email...`);
      const rawToken = generateOTP(6);
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
      this.logger.log(`Email successfully triggered for: ${dto.email}`);
    } else {
      this.logger.warn(`User NOT FOUND in DB for email: ${dto.email}. No email will be sent to prevent enumeration.`);
    }

    return ApiResponseHelper.success(
      'If an account exists, a password reset OTP has been sent.',
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
