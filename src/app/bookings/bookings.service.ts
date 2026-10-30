import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RazorpayService, RazorpayOrderResult } from './razorpay.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { GetBookingsDto } from './dto/get-bookings.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpayService: RazorpayService,
  ) {}

  /**
   * Helper to format booking record into standard response DTO
   */
  private formatBookingResponse(
    booking: any,
    paymentOrder?: RazorpayOrderResult,
  ): BookingResponseDto {
    const formattedDate =
      booking.date instanceof Date
        ? booking.date.toISOString().split('T')[0]
        : String(booking.date);

    const paymentInfo = paymentOrder
      ? {
          orderId: paymentOrder.orderId,
          amount: paymentOrder.amount,
          amountInRupees: paymentOrder.amountInRupees,
          currency: paymentOrder.currency,
          keyId: paymentOrder.keyId,
        }
      : booking.razorpayOrderId
        ? {
            orderId: booking.razorpayOrderId,
            amount: Math.round(Number(booking.price) * 100),
            amountInRupees: Number(booking.price),
            currency: 'INR',
            keyId: this.razorpayService.getKeyId(),
          }
        : null;

    return {
      id: booking.id,
      bookingReference: booking.bookingReference,
      price: booking.price,
      date: formattedDate,
      slotTime: booking.slotTime,
      availableSlotTime: booking.slotTime,
      mode: booking.mode,
      patientDetails: {
        patientName: booking.patientName,
        age: booking.age,
        gender: booking.gender,
        phone: booking.phone,
        reason: booking.reason || null,
      },
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      notes: booking.notes || null,
      userId: booking.userId || null,
      payment: paymentInfo,
      razorpayOrderId: booking.razorpayOrderId || null,
      razorpayPaymentId: booking.razorpayPaymentId || null,
      doctor: booking.doctor
        ? {
            id: booking.doctor.id,
            fullName: booking.doctor.fullName,
            profileImage: booking.doctor.profileImage || null,
            specialization: booking.doctor.specialization?.name || null,
          }
        : null,
      provider: booking.provider
        ? {
            id: booking.provider.id,
            name: booking.provider.name,
            type: booking.provider.type,
            city: booking.provider.city || null,
            address: booking.provider.address || null,
          }
        : null,
      test: booking.test
        ? {
            id: booking.test.id,
            name: booking.test.name,
            code: booking.test.code || null,
          }
        : null,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  /**
   * Generate human-readable unique booking reference (e.g., HP-BK-20261030-A8F2)
   */
  private generateBookingReference(): string {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `HP-BK-${datePart}-${randomPart}`;
  }

  /**
   * POST /api/v1/bookings
   * Create a new booking with price, date, available slot time, mode, patient details,
   * and automatically generates a Razorpay Order ID for checkout.
   */
  async create(dto: CreateBookingDto, userId?: string) {
    // 1. Resolve Patient Details (nested object or flat fields)
    const patientName = dto.patientDetails?.patientName || dto.patientName;
    const age = dto.patientDetails?.age ?? dto.age;
    const gender = dto.patientDetails?.gender || dto.gender;
    const phone = dto.patientDetails?.phone || dto.phone;
    const reason = dto.patientDetails?.reason || dto.reason;

    if (!patientName || patientName.trim() === '') {
      throw new BadRequestException(
        'Patient name is required (patientName or patientDetails.patientName).',
      );
    }
    if (age === undefined || age === null || isNaN(age)) {
      throw new BadRequestException('Patient age is required (age or patientDetails.age).');
    }
    if (!gender) {
      throw new BadRequestException('Patient gender is required (gender or patientDetails.gender).');
    }
    if (!phone || phone.trim() === '') {
      throw new BadRequestException('Patient phone number is required (phone or patientDetails.phone).');
    }

    // 2. Resolve Slot Time
    const slotTime = dto.availableSlotTime || dto.slotTime;
    if (!slotTime || slotTime.trim() === '') {
      throw new BadRequestException(
        'Available slot time is required (availableSlotTime or slotTime).',
      );
    }

    // 3. Resolve & validate appointment date
    const parsedDate = new Date(dto.date);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException(
        'Invalid date provided. Please use YYYY-MM-DD or ISO 8601 string.',
      );
    }

    // 4. Validate doctor relation if provided
    let providerId =
      dto.providerId && dto.providerId.trim() !== '' ? dto.providerId.trim() : null;
    const doctorId =
      dto.doctorId && dto.doctorId.trim() !== '' ? dto.doctorId.trim() : null;
    const testId =
      dto.testId && dto.testId.trim() !== '' ? dto.testId.trim() : null;

    if (doctorId) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: doctorId },
        select: { id: true, providerId: true, isActive: true },
      });
      if (!doctor) {
        throw new NotFoundException(`Doctor with ID ${doctorId} not found.`);
      }
      if (!providerId && doctor.providerId) {
        providerId = doctor.providerId;
      }
    }

    // 5. Validate provider relation if provided
    if (providerId) {
      const provider = await this.prisma.provider.findUnique({
        where: { id: providerId },
        select: { id: true },
      });
      if (!provider) {
        throw new NotFoundException(`Provider with ID ${providerId} not found.`);
      }
    }

    // 6. Validate test relation if provided
    if (testId) {
      const test = await this.prisma.test.findUnique({
        where: { id: testId },
        select: { id: true },
      });
      if (!test) {
        throw new NotFoundException(`Test with ID ${testId} not found.`);
      }
    }

    // 7. Generate a unique reference
    let bookingReference = this.generateBookingReference();
    let collision = await this.prisma.booking.findUnique({
      where: { bookingReference },
    });
    while (collision) {
      bookingReference = this.generateBookingReference();
      collision = await this.prisma.booking.findUnique({
        where: { bookingReference },
      });
    }

    // 8. Create Razorpay Order if price > 0
    let paymentOrder: RazorpayOrderResult | null = null;
    let razorpayOrderId: string | null = null;

    if (Number(dto.price) > 0) {
      try {
        paymentOrder = await this.razorpayService.createOrder(
          Number(dto.price),
          bookingReference,
          {
            patientName: patientName.trim(),
            phone: phone.trim(),
            reason: reason ? reason.slice(0, 100) : 'Medical Appointment',
          },
        );
        razorpayOrderId = paymentOrder.orderId;
      } catch (err: any) {
        this.logger.error(
          `Could not generate Razorpay order for ${bookingReference}: ${err?.message}`,
        );
        // Continue booking creation so appointment is preserved, payment can be retried
      }
    }

    // 9. Persist the booking
    const booking = await this.prisma.booking.create({
      data: {
        bookingReference,
        userId: userId || null,
        doctorId: doctorId || null,
        providerId: providerId || null,
        testId: testId || null,
        price: Number(dto.price),
        date: parsedDate,
        slotTime: slotTime.trim(),
        mode: dto.mode,
        patientName: patientName.trim(),
        age: Number(age),
        gender,
        phone: phone.trim(),
        reason: reason?.trim() || null,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        razorpayOrderId,
        notes: dto.notes?.trim() || null,
      },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            specialization: { select: { name: true } },
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
            city: true,
            address: true,
          },
        },
        test: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return ApiResponseHelper.success(
      'Booking created successfully',
      this.formatBookingResponse(booking, paymentOrder || undefined),
    );
  }

  /**
   * POST /api/v1/bookings/:id/payment/order
   * Create / re-create Razorpay order for pending booking
   */
  async createPaymentOrder(idOrReference: string, userId?: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: idOrReference }, { bookingReference: idOrReference }],
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking '${idOrReference}' not found.`);
    }

    if (userId && booking.userId && booking.userId !== userId) {
      throw new ForbiddenException('You do not have permission to pay for this booking.');
    }

    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Booking is already paid.');
    }

    const order = await this.razorpayService.createOrder(
      booking.price,
      booking.bookingReference,
      {
        bookingId: booking.id,
        patientName: booking.patientName,
      },
    );

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: { razorpayOrderId: order.orderId },
    });

    return ApiResponseHelper.success('Razorpay order created successfully', {
      orderId: order.orderId,
      amount: order.amount,
      amountInRupees: order.amountInRupees,
      currency: order.currency,
      keyId: order.keyId,
      bookingReference: booking.bookingReference,
    });
  }

  /**
   * POST /api/v1/bookings/:id/payment/verify
   * Verify Razorpay payment signature and mark booking as CONFIRMED & PAID
   */
  async verifyPayment(idOrReference: string, dto: VerifyPaymentDto, userId?: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: idOrReference }, { bookingReference: idOrReference }],
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking '${idOrReference}' not found.`);
    }

    if (userId && booking.userId && booking.userId !== userId) {
      throw new ForbiddenException('You do not have permission to verify this booking.');
    }

    // Verify HMAC signature
    const isValid = this.razorpayService.verifyPaymentSignature(
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature,
    );

    if (!isValid) {
      throw new BadRequestException('Payment verification failed. Invalid Razorpay signature.');
    }

    // Update booking in DB
    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        razorpayOrderId: dto.razorpayOrderId,
        razorpayPaymentId: dto.razorpayPaymentId,
        razorpaySignature: dto.razorpaySignature,
      },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            specialization: { select: { name: true } },
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
            city: true,
            address: true,
          },
        },
        test: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return ApiResponseHelper.success(
      'Payment verified successfully. Booking is now confirmed!',
      this.formatBookingResponse(updated),
    );
  }

  /**
   * GET /api/v1/bookings/my-bookings
   * Retrieve list of bookings for the logged-in patient
   */
  async findMyBookings(dto: GetBookingsDto, userId: string) {
    const {
      page = 1,
      limit = 10,
      status,
      mode,
      search,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = dto;

    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {
      userId,
    };

    if (status) {
      where.status = status;
    }

    if (mode) {
      where.mode = mode;
    }

    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) {
        where.date.gte = new Date(fromDate);
      }
      if (toDate) {
        where.date.lte = new Date(toDate);
      }
    }

    if (search) {
      where.OR = [
        { bookingReference: { contains: search } },
        { patientName: { contains: search } },
        { phone: { contains: search } },
        { doctor: { fullName: { contains: search } } },
        { provider: { name: { contains: search } } },
      ];
    }

    const [total, bookings] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          doctor: {
            select: {
              id: true,
              fullName: true,
              profileImage: true,
              specialization: { select: { name: true } },
            },
          },
          provider: {
            select: {
              id: true,
              name: true,
              type: true,
              city: true,
              address: true,
            },
          },
          test: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
    ]);

    const items = bookings.map((b) => this.formatBookingResponse(b));

    return ApiResponseHelper.success('Bookings fetched successfully', {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  }

  /**
   * GET /api/v1/bookings/:id
   * Retrieve booking details by UUID or booking reference
   */
  async findOne(idOrReference: string, userId?: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: idOrReference }, { bookingReference: idOrReference }],
      },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            specialization: { select: { name: true } },
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
            city: true,
            address: true,
          },
        },
        test: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking '${idOrReference}' not found.`);
    }

    // If request is authenticated, ensure the user owns the booking unless guest
    if (userId && booking.userId && booking.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this booking.');
    }

    return ApiResponseHelper.success(
      'Booking details retrieved successfully',
      this.formatBookingResponse(booking),
    );
  }

  /**
   * PATCH /api/v1/bookings/:id/cancel
   * Cancel an appointment booking
   */
  async cancel(idOrReference: string, userId?: string, cancelReason?: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: idOrReference }, { bookingReference: idOrReference }],
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking '${idOrReference}' not found.`);
    }

    if (userId && booking.userId && booking.userId !== userId) {
      throw new ForbiddenException('You do not have permission to cancel this booking.');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled.');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Completed bookings cannot be cancelled.');
    }

    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED,
        notes: cancelReason
          ? `${booking.notes ? booking.notes + ' | ' : ''}Cancelled: ${cancelReason}`
          : booking.notes,
      },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            specialization: { select: { name: true } },
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
            city: true,
            address: true,
          },
        },
        test: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return ApiResponseHelper.success(
      'Booking cancelled successfully',
      this.formatBookingResponse(updated),
    );
  }
}
