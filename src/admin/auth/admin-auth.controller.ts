import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { AdminForgotPasswordDto } from './dto/admin-forgot-password.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { EmptyResponseDto } from '../../app/auth/dto/user-response.dto';
import { AdminLoginResponseDto } from './dto/admin-response.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('Admin - Authentication')
@Controller({
  path: 'admin/auth',
  version: '1',
})
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create account for dashboard',
    description:
      'Register a new admin user account to access the dashboard. Creates an ACTIVE admin user and returns access token.',
  })
  @ApiSuccessResponse(AdminLoginResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Admin account created successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  @ApiErrorResponse(HttpStatus.CONFLICT, 'Email or phone number already exists')
  register(@Body() dto: AdminRegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiSuccessResponse(AdminLoginResponseDto, {
    status: HttpStatus.OK,
    description: 'Login successful',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  @ApiErrorResponse(
    HttpStatus.UNAUTHORIZED,
    'Invalid email or password / Unauthorized access',
  )
  login(@Body() dto: AdminLoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset OTP for Admin' })
  @ApiSuccessResponse(EmptyResponseDto, {
    status: HttpStatus.OK,
    description: 'If an account exists, a password reset OTP has been sent.',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  forgotPassword(@Body() dto: AdminForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset Admin password using token' })
  @ApiSuccessResponse(EmptyResponseDto, {
    status: HttpStatus.OK,
    description: 'Password reset successfully.',
  })
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    'Validation failed or expired token',
  )
  resetPassword(@Body() dto: AdminResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
