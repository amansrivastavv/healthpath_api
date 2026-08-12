import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { R2Service } from '../../r2/r2.service';
import { ApiResponseHelper } from '../../common/utils/response.util';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class AdminDocumentsService {
  private readonly logger = new Logger(AdminDocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  async createForProvider(providerId: string, dto: CreateDocumentDto, file?: Express.Multer.File) {
    const provider = await this.prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    let url = dto.documentUrl;
    if (file) {
      const uploadResult = await this.r2Service.upload(
        {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
        },
        'documents/providers',
      );
      url = uploadResult.url;
    }

    if (!url) {
      throw new BadRequestException('Either a document file or documentUrl must be provided');
    }

    const document = await this.prisma.verificationDocument.create({
      data: {
        providerId,
        documentType: dto.documentType,
        documentUrl: url,
        notes: dto.notes,
        verificationStatus: dto.verificationStatus ?? VerificationStatus.PENDING,
      },
    });

    this.logger.log(`Created document ${document.id} for provider ${providerId}`);
    return ApiResponseHelper.success('Provider verification document uploaded successfully', document);
  }

  async getForProvider(providerId: string) {
    const provider = await this.prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const documents = await this.prisma.verificationDocument.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponseHelper.success('Provider verification documents fetched successfully', documents);
  }

  async createForDoctor(doctorId: string, dto: CreateDocumentDto, file?: Express.Multer.File) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    let url = dto.documentUrl;
    if (file) {
      const uploadResult = await this.r2Service.upload(
        {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
        },
        'documents/doctors',
      );
      url = uploadResult.url;
    }

    if (!url) {
      throw new BadRequestException('Either a document file or documentUrl must be provided');
    }

    const document = await this.prisma.verificationDocument.create({
      data: {
        doctorId,
        documentType: dto.documentType,
        documentUrl: url,
        notes: dto.notes,
        verificationStatus: dto.verificationStatus ?? VerificationStatus.PENDING,
      },
    });

    this.logger.log(`Created document ${document.id} for doctor ${doctorId}`);
    return ApiResponseHelper.success('Doctor verification document uploaded successfully', document);
  }

  async getForDoctor(doctorId: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const documents = await this.prisma.verificationDocument.findMany({
      where: { doctorId },
      orderBy: { createdAt: 'desc' },
    });

    return ApiResponseHelper.success('Doctor verification documents fetched successfully', documents);
  }

  async update(documentId: string, dto: UpdateDocumentDto, file?: Express.Multer.File) {
    const document = await this.prisma.verificationDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    let url = dto.documentUrl;
    if (file) {
      const uploadResult = await this.r2Service.upload(
        {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
        },
        'documents/verification',
      );
      url = uploadResult.url;
    }

    const updated = await this.prisma.verificationDocument.update({
      where: { id: documentId },
      data: {
        ...(dto.documentType && { documentType: dto.documentType }),
        ...(url && { documentUrl: url }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.verificationStatus && { verificationStatus: dto.verificationStatus }),
      },
    });

    this.logger.log(`Updated document ${documentId}`);
    return ApiResponseHelper.success('Verification document updated successfully', updated);
  }

  async remove(documentId: string) {
    const document = await this.prisma.verificationDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.prisma.verificationDocument.delete({
      where: { id: documentId },
    });

    this.logger.log(`Deleted document ${documentId}`);
    return ApiResponseHelper.success('Verification document deleted successfully');
  }
}
