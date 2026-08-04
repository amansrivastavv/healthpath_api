import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import * as path from 'path';

export interface UploadFileOptions {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export interface UploadResult {
  key: string;
  url: string;
}

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'R2_SECRET_ACCESS_KEY',
    );
    this.bucketName = this.configService.get<string>('R2_BUCKET', '');
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL', '');

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });
  }

  async upload(
    file: UploadFileOptions,
    folderPrefix: string = 'uploads',
  ): Promise<UploadResult> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file input for upload');
    }

    const ext = path.extname(file.originalname);
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const key = `${folderPrefix}/${Date.now()}-${uniqueId}${ext}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const url = this.getPublicUrl(key);
      this.logger.log(`File uploaded successfully to R2: ${key}`);

      return { key, url };
    } catch (error: any) {
      this.logger.error(`R2 Upload failed for key: ${key}`, error.stack);
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  async delete(key: string): Promise<void> {
    if (!key) return;

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      this.logger.log(`File deleted successfully from R2: ${key}`);
    } catch (error: any) {
      this.logger.error(`R2 Delete failed for key: ${key}`, error.stack);
      throw new BadRequestException(`File deletion failed: ${error.message}`);
    }
  }

  async replace(
    oldKey: string,
    newFile: UploadFileOptions,
    folderPrefix: string = 'uploads',
  ): Promise<UploadResult> {
    if (oldKey) {
      await this.delete(oldKey).catch((err) =>
        this.logger.warn(
          `Failed to delete old file during replace: ${err.message}`,
        ),
      );
    }
    return this.upload(newFile, folderPrefix);
  }

  getPublicUrl(key: string): string {
    const baseUrl = this.publicUrl.replace(/\/$/, '');
    const cleanKey = key.replace(/^\//, '');
    return `${baseUrl}/${cleanKey}`;
  }
}
