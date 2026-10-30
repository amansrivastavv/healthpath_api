import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { GetBookingsDto } from './dto/get-bookings.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import {
  BookingListResponseDto,
  BookingResponseDto,
} from './dto/booking-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('App - Bookings')
@Controller({
  path: 'bookings',
  version: '1',
})
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create appointment booking & initialize Razorpay order',
    description:
      'Creates an appointment booking with price, date, available slot time, mode (ONLINE/OFFLINE), and patient details. Automatically creates a Razorpay Order ID for frontend checkout popup.',
  })
  @ApiBearerAuth()
  @ApiBody({
    type: CreateBookingDto,
    examples: {
      standardBooking: {
        summary: 'Standard Consultation Booking',
        value: {
          price: 500,
          date: '2026-11-20',
          availableSlotTime: '10:30 AM',
          mode: 'ONLINE',
          patientName: 'Rahul Verma',
          age: 32,
          gender: 'MALE',
          phone: '+919876543210',
          reason: 'Experiencing mild fever and headache for 2 days',
          notes: 'Please call before arriving',
        },
      },
      doctorBooking: {
        summary: 'Doctor Consultation Booking',
        value: {
          price: 600,
          date: '2026-11-20',
          availableSlotTime: '11:00 AM',
          mode: 'ONLINE',
          doctorId: '847c3402-dfe6-4c8f-a51c-1758c576c53f',
          patientName: 'Rahul Verma',
          age: 32,
          gender: 'MALE',
          phone: '+919876543210',
          reason: 'Cardiology consultation',
        },
      },
      labTestBooking: {
        summary: 'Lab Test Booking (Complete Blood Count)',
        value: {
          price: 350,
          date: '2026-11-22',
          availableSlotTime: '08:00 AM',
          mode: 'OFFLINE',
          testId: 'b37d23fd-7279-4056-8422-d73c99f22baf',
          patientName: 'Rahul Verma',
          age: 32,
          gender: 'MALE',
          phone: '+919876543210',
          reason: 'CBC diagnostic lab test',
        },
      },
    },
  })
  @ApiSuccessResponse(BookingResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Booking created and Razorpay order generated successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed or missing required fields')
  create(
    @Body() dto: CreateBookingDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.bookingsService.create(dto, userId);
  }

  @Public()
  @Post(':id/payment/order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate / retry Razorpay order for booking',
    description:
      'Generates a new Razorpay Order for a pending booking. Useful if previous payment timed out or was closed by the user.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID or reference string' })
  @ApiBearerAuth()
  @ApiSuccessResponse(Object, {
    status: HttpStatus.OK,
    description: 'Razorpay order generated successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Booking is already paid or cannot be paid')
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Booking not found')
  createPaymentOrder(
    @Param('id') id: string,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.bookingsService.createPaymentOrder(id, userId);
  }

  @Public()
  @Post(':id/payment/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify Razorpay payment signature & confirm booking',
    description:
      'Verifies the payment with Razorpay HMAC SHA256 signature using razorpayOrderId, razorpayPaymentId, and razorpaySignature. Once verified, marks booking status as CONFIRMED and payment status as PAID.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID or reference string' })
  @ApiBearerAuth()
  @ApiSuccessResponse(BookingResponseDto, {
    status: HttpStatus.OK,
    description: 'Payment verified and booking confirmed successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Invalid Razorpay signature or payment verification failed')
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Booking not found')
  verifyPayment(
    @Param('id') id: string,
    @Body() dto: VerifyPaymentDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.bookingsService.verifyPayment(id, dto, userId);
  }

  @Get('my-bookings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get logged-in patient bookings',
    description:
      'Retrieve a paginated list of bookings for the currently authenticated patient with optional status, mode, and date filtering.',
  })
  @ApiBearerAuth()
  @ApiSuccessResponse(BookingListResponseDto, {
    status: HttpStatus.OK,
    description: 'Bookings retrieved successfully',
  })
  findMyBookings(
    @Query() dto: GetBookingsDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.bookingsService.findMyBookings(dto, userId);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get booking details by ID or reference',
    description:
      'Retrieve details of a booking using its unique UUID or booking reference (e.g. HP-BK-20261030-A1B2).',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID or booking reference string' })
  @ApiBearerAuth()
  @ApiSuccessResponse(BookingResponseDto, {
    status: HttpStatus.OK,
    description: 'Booking details retrieved successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Booking not found')
  findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.bookingsService.findOne(id, userId);
  }

  @Public()
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel a booking',
    description: 'Cancel an existing appointment booking with an optional reason.',
  })
  @ApiParam({ name: 'id', description: 'Booking UUID or booking reference string' })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          example: 'Scheduling conflict with work',
          description: 'Reason for cancellation',
        },
      },
    },
    required: false,
  })
  @ApiSuccessResponse(BookingResponseDto, {
    status: HttpStatus.OK,
    description: 'Booking cancelled successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Booking cannot be cancelled')
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Booking not found')
  cancel(
    @Param('id') id: string,
    @Body('reason') reason?: string,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.bookingsService.cancel(id, userId, reason);
  }
}
