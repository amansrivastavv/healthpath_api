import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { UserResponseDto, EmptyResponseDto } from './dto/user-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../common/decorators/api-response.decorator';

@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiSuccessResponse(UserResponseDto, {
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  @ApiErrorResponse(HttpStatus.CONFLICT, 'Email already exists')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiSuccessResponse(LoginResponseDto, {
    status: HttpStatus.OK,
    description: 'Login successful',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  @ApiErrorResponse(HttpStatus.UNAUTHORIZED, 'Invalid email or password')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout currently authenticated user' })
  @ApiSuccessResponse(EmptyResponseDto, {
    status: HttpStatus.OK,
    description: 'Logged out successfully',
  })
  @ApiErrorResponse(HttpStatus.UNAUTHORIZED, 'Unauthorized')
  logout() {
    return this.authService.logout();
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiSuccessResponse(EmptyResponseDto, {
    status: HttpStatus.OK,
    description: 'If an account exists, a password reset link has been sent.',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiSuccessResponse(EmptyResponseDto, {
    status: HttpStatus.OK,
    description: 'Password reset successfully.',
  })
  @ApiErrorResponse(
    HttpStatus.BAD_REQUEST,
    'Validation failed or expired token',
  )
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
