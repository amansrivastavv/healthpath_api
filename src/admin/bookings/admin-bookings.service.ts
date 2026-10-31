import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetAdminBookingsDto } from './dto/get-admin-bookings.dto';
import { UpdateAdminBookingDto } from './dto/update-admin-booking.dto';
import { UpdateAdminBookingStatusDto } from './dto/update-admin-booking-status.dto';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { BookingStatus, PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class AdminBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to format booking record into standard response format
   */
  private formatBookingResponse(booking: any) {
    const formattedDate =
      booking.date instanceof Date
        ? booking.date.toISOString().split('T')[0]
        : String(booking.date);

    return {
      id: booking.id,
      bookingReference: booking.bookingReference,
      price: Number(booking.price),
      date: formattedDate,
      slotTime: booking.slotTime,
      mode: booking.mode,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      patientDetails: {
        patientName: booking.patientName,
        age: booking.age,
        gender: booking.gender,
        phone: booking.phone,
        reason: booking.reason || null,
      },
      user: booking.user
        ? {
            id: booking.user.id,
            fullName: booking.user.fullName,
            email: booking.user.email,
            phoneNumber: booking.user.phoneNumber || null,
          }
        : null,
      doctor: booking.doctor
        ? {
            id: booking.doctor.id,
            fullName: booking.doctor.fullName,
            profileImage: booking.doctor.profileImage || null,
            specialization: booking.doctor.specialization?.name || null,
            consultationFee: booking.doctor.consultationFee ?? null,
          }
        : null,
      provider: booking.provider
        ? {
            id: booking.provider.id,
            name: booking.provider.name,
            type: booking.provider.type,
            city: booking.provider.city || null,
            state: booking.provider.state || null,
            address: booking.provider.address || null,
            phone: booking.provider.phone || null,
          }
        : null,
      test: booking.test
        ? {
            id: booking.test.id,
            name: booking.test.name,
            code: booking.test.code || null,
            price: booking.test.price ?? null,
          }
        : null,
      notes: booking.notes || null,
      razorpayOrderId: booking.razorpayOrderId || null,
      razorpayPaymentId: booking.razorpayPaymentId || null,
      razorpaySignature: booking.razorpaySignature || null,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  /**
   * Common relation include object for queries
   */
  private get bookingInclude() {
    return {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
      doctor: {
        select: {
          id: true,
          fullName: true,
          profileImage: true,
          consultationFee: true,
          specialization: { select: { name: true } },
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
          type: true,
          city: true,
          state: true,
          address: true,
          phone: true,
        },
      },
      test: {
        select: {
          id: true,
          name: true,
          code: true,
          price: true,
        },
      },
    };
  }

  /**
   * Retrieve all bookings with admin filtering, search, pagination, and summary counters
   */
  async findAll(dto: GetAdminBookingsDto) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      status,
      paymentStatus,
      mode,
      search,
      doctorId,
      providerId,
      testId,
      userId,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = dto;

    const where: Prisma.BookingWhereInput = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (mode) where.mode = mode;
    if (doctorId) where.doctorId = doctorId;
    if (providerId) where.providerId = providerId;
    if (testId) where.testId = testId;
    if (userId) where.userId = userId;

    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) {
        where.date.gte = new Date(fromDate);
      }
      if (toDate) {
        // Set end of day to cover full day filter
        const endDay = new Date(toDate);
        endDay.setHours(23, 59, 59, 999);
        where.date.lte = endDay;
      }
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { bookingReference: { contains: term } },
        { patientName: { contains: term } },
        { phone: { contains: term } },
        { doctor: { fullName: { contains: term } } },
        { provider: { name: { contains: term } } },
        { user: { email: { contains: term } } },
        { user: { fullName: { contains: term } } },
      ];
    }

    // Parallel fetch: count, paginated list, and status counts for summary
    const [
      total,
      bookings,
      pendingCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      revenueResult,
    ] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: this.bookingInclude,
      }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.PENDING } }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.CONFIRMED } }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.COMPLETED } }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.CANCELLED } }),
      this.prisma.booking.aggregate({
        where: { ...where, paymentStatus: PaymentStatus.PAID },
        _sum: { price: true },
      }),
    ]);

    const items = bookings.map((b) => this.formatBookingResponse(b));

    return ApiResponseHelper.success('Bookings retrieved successfully', {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: {
        totalBookings: total,
        pending: pendingCount,
        confirmed: confirmedCount,
        completed: completedCount,
        cancelled: cancelledCount,
        totalRevenue: revenueResult._sum.price || 0,
      },
    });
  }

  /**
   * Retrieve a single booking by UUID or booking reference
   */
  async findOne(idOrReference: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: idOrReference }, { bookingReference: idOrReference }],
      },
      include: this.bookingInclude,
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID or Reference '${idOrReference}' not found`);
    }

    return ApiResponseHelper.success(
      'Booking retrieved successfully',
      this.formatBookingResponse(booking),
    );
  }

  /**
   * Edit/Update an existing booking
   */
  async update(idOrReference: string, dto: UpdateAdminBookingDto) {
    const existing = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: idOrReference }, { bookingReference: idOrReference }],
      },
    });

    if (!existing) {
      throw new NotFoundException(`Booking with ID or Reference '${idOrReference}' not found`);
    }

    // Validate relationships if changing them
    if (dto.doctorId) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: dto.doctorId },
      });
      if (!doctor) {
        throw new BadRequestException(`Doctor with ID '${dto.doctorId}' not found`);
      }
    }

    if (dto.providerId) {
      const provider = await this.prisma.provider.findUnique({
        where: { id: dto.providerId },
      });
      if (!provider) {
        throw new BadRequestException(`Provider with ID '${dto.providerId}' not found`);
      }
    }

    if (dto.testId) {
      const test = await this.prisma.test.findUnique({
        where: { id: dto.testId },
      });
      if (!test) {
        throw new BadRequestException(`Test with ID '${dto.testId}' not found`);
      }
    }

    // Parse appointment date if supplied
    let parsedDate: Date | undefined;
    if (dto.date) {
      parsedDate = new Date(dto.date);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid date format provided for date');
      }
    }

    const updated = await this.prisma.booking.update({
      where: { id: existing.id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.paymentStatus !== undefined && { paymentStatus: dto.paymentStatus }),
        ...(parsedDate !== undefined && { date: parsedDate }),
        ...(dto.slotTime !== undefined && { slotTime: dto.slotTime }),
        ...(dto.mode !== undefined && { mode: dto.mode }),
        ...(dto.patientName !== undefined && { patientName: dto.patientName }),
        ...(dto.age !== undefined && { age: dto.age }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.reason !== undefined && { reason: dto.reason }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.doctorId !== undefined && { doctorId: dto.doctorId }),
        ...(dto.providerId !== undefined && { providerId: dto.providerId }),
        ...(dto.testId !== undefined && { testId: dto.testId }),
        ...(dto.razorpayOrderId !== undefined && { razorpayOrderId: dto.razorpayOrderId }),
        ...(dto.razorpayPaymentId !== undefined && { razorpayPaymentId: dto.razorpayPaymentId }),
        ...(dto.razorpaySignature !== undefined && { razorpaySignature: dto.razorpaySignature }),
      },
      include: this.bookingInclude,
    });

    return ApiResponseHelper.success(
      'Booking updated successfully',
      this.formatBookingResponse(updated),
    );
  }

  /**
   * Quick status update for booking status, payment status, and notes
   */
  async updateStatus(idOrReference: string, dto: UpdateAdminBookingStatusDto) {
    const existing = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: idOrReference }, { bookingReference: idOrReference }],
      },
    });

    if (!existing) {
      throw new NotFoundException(`Booking with ID or Reference '${idOrReference}' not found`);
    }

    const updated = await this.prisma.booking.update({
      where: { id: existing.id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.paymentStatus !== undefined && { paymentStatus: dto.paymentStatus }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: this.bookingInclude,
    });

    return ApiResponseHelper.success(
      'Booking status updated successfully',
      this.formatBookingResponse(updated),
    );
  }

  /**
   * Delete a booking by UUID or booking reference
   */
  async remove(idOrReference: string) {
    const existing = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id: idOrReference }, { bookingReference: idOrReference }],
      },
    });

    if (!existing) {
      throw new NotFoundException(`Booking with ID or Reference '${idOrReference}' not found`);
    }

    await this.prisma.booking.delete({
      where: { id: existing.id },
    });

    return ApiResponseHelper.success('Booking deleted successfully');
  }
}
