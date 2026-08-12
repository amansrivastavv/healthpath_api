import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminDocumentsService } from './admin-documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { AdminJwtGuard } from '../guards/admin-jwt.guard';
import { DocumentResponseDto, DocumentListResponseDto } from './dto/document-response.dto';
import { EmptyResponseDto } from '../../app/auth/dto/user-response.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('Admin - Documents')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@Controller({
  version: '1',
})
export class AdminDocumentsController {
  constructor(private readonly documentsService: AdminDocumentsService) {}

  @Post('admin/providers/:providerId/documents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload verification document for a provider' })
  @ApiParam({ name: 'providerId', description: 'Provider UUID' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiSuccessResponse(DocumentResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Document uploaded successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed or missing file')
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Provider not found')
  createForProvider(
    @Param('providerId', new ParseUUIDPipe({ version: '4' })) providerId: string,
    @Body() dto: CreateDocumentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.documentsService.createForProvider(providerId, dto, file);
  }

  @Get('admin/providers/:providerId/documents')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all verification documents for a provider' })
  @ApiParam({ name: 'providerId', description: 'Provider UUID' })
  @ApiSuccessResponse(DocumentListResponseDto, {
    status: HttpStatus.OK,
    description: 'Documents fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Provider not found')
  getForProvider(@Param('providerId', new ParseUUIDPipe({ version: '4' })) providerId: string) {
    return this.documentsService.getForProvider(providerId);
  }

  @Post('admin/doctors/:doctorId/documents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload verification document for a doctor' })
  @ApiParam({ name: 'doctorId', description: 'Doctor UUID' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiSuccessResponse(DocumentResponseDto, {
    status: HttpStatus.CREATED,
    description: 'Document uploaded successfully',
  })
  @ApiErrorResponse(HttpStatus.BAD_REQUEST, 'Validation failed or missing file')
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Doctor not found')
  createForDoctor(
    @Param('doctorId', new ParseUUIDPipe({ version: '4' })) doctorId: string,
    @Body() dto: CreateDocumentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.documentsService.createForDoctor(doctorId, dto, file);
  }

  @Get('admin/doctors/:doctorId/documents')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all verification documents for a doctor' })
  @ApiParam({ name: 'doctorId', description: 'Doctor UUID' })
  @ApiSuccessResponse(DocumentListResponseDto, {
    status: HttpStatus.OK,
    description: 'Documents fetched successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Doctor not found')
  getForDoctor(@Param('doctorId', new ParseUUIDPipe({ version: '4' })) doctorId: string) {
    return this.documentsService.getForDoctor(doctorId);
  }

  @Put('admin/documents/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update verification status or details of a document' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiSuccessResponse(DocumentResponseDto, {
    status: HttpStatus.OK,
    description: 'Document updated successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Document not found')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateDocumentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.documentsService.update(id, dto, file);
  }

  @Delete('admin/documents/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a verification document' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiSuccessResponse(EmptyResponseDto, {
    status: HttpStatus.OK,
    description: 'Document deleted successfully',
  })
  @ApiErrorResponse(HttpStatus.NOT_FOUND, 'Document not found')
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.documentsService.remove(id);
  }
}
