import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { CreateDoctorAvailabilityDto } from './dto/create-doctor-availability.dto';
import { UpdateDoctorAvailabilityDto } from './dto/update-doctor-availability.dto';

@Injectable()
export class AdminAvailabilityService {
  private readonly logger = new Logger(AdminAvailabilityService.name);

  constructor(private readonly prisma: PrismaService) {}

  private parseTimeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async create(doctorId: string, dto: CreateDoctorAvailabilityDto) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const start = this.parseTimeToMinutes(dto.startTime);
    const end = this.parseTimeToMinutes(dto.endTime);

    if (start >= end) {
      throw new BadRequestException('startTime must be earlier than endTime');
    }

    if (dto.breakStart && dto.breakEnd) {
      const bStart = this.parseTimeToMinutes(dto.breakStart);
      const bEnd = this.parseTimeToMinutes(dto.breakEnd);

      if (bStart >= bEnd) {
        throw new BadRequestException('breakStart must be earlier than breakEnd');
      }

      if (bStart < start || bEnd > end) {
        throw new BadRequestException('Break time must fall within startTime and endTime');
      }
    }

    const availability = await this.prisma.doctorAvailability.create({
      data: {
        doctorId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        slotDuration: dto.slotDuration ?? 30,
        breakStart: dto.breakStart,
        breakEnd: dto.breakEnd,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });

    this.logger.log(`Created availability ${availability.id} for doctor ${doctorId}`);
    return ApiResponseHelper.success('Doctor availability created successfully', availability);
  }

  async findAll(doctorId: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const availabilities = await this.prisma.doctorAvailability.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return ApiResponseHelper.success('Doctor availability schedules fetched successfully', availabilities);
  }

  async update(doctorId: string, availabilityId: string, dto: UpdateDoctorAvailabilityDto) {
    const availability = await this.prisma.doctorAvailability.findFirst({
      where: { id: availabilityId, doctorId },
    });

    if (!availability) {
      throw new NotFoundException('Availability schedule not found for this doctor');
    }

    const startTime = dto.startTime ?? availability.startTime;
    const endTime = dto.endTime ?? availability.endTime;
    const start = this.parseTimeToMinutes(startTime);
    const end = this.parseTimeToMinutes(endTime);

    if (start >= end) {
      throw new BadRequestException('startTime must be earlier than endTime');
    }

    const updated = await this.prisma.doctorAvailability.update({
      where: { id: availabilityId },
      data: {
        ...(dto.dayOfWeek && { dayOfWeek: dto.dayOfWeek }),
        ...(dto.startTime && { startTime: dto.startTime }),
        ...(dto.endTime && { endTime: dto.endTime }),
        ...(dto.slotDuration !== undefined && { slotDuration: dto.slotDuration }),
        ...(dto.breakStart !== undefined && { breakStart: dto.breakStart }),
        ...(dto.breakEnd !== undefined && { breakEnd: dto.breakEnd }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    this.logger.log(`Updated availability ${availabilityId} for doctor ${doctorId}`);
    return ApiResponseHelper.success('Doctor availability updated successfully', updated);
  }

  async remove(doctorId: string, availabilityId: string) {
    const availability = await this.prisma.doctorAvailability.findFirst({
      where: { id: availabilityId, doctorId },
    });

    if (!availability) {
      throw new NotFoundException('Availability schedule not found for this doctor');
    }

    await this.prisma.doctorAvailability.update({
      where: { id: availabilityId },
      data: { isActive: false },
    });

    this.logger.log(`Soft-deleted availability ${availabilityId} for doctor ${doctorId}`);
    return ApiResponseHelper.success('Doctor availability deleted successfully');
  }
}
