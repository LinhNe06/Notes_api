import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

import type { UploadedImageFile } from './uploaded-image-file.type';

@Injectable()
export class StorageService {
  private s3Client?: S3Client;

  constructor(private readonly configService: ConfigService) {}

  async uploadNoteImage(userId: string, file: UploadedImageFile) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new BadRequestException('Image must be smaller than 5MB');
    }

    const bucket = this.getRequiredConfig('S3_BUCKET');
    const publicBaseUrl = this.getRequiredConfig('S3_PUBLIC_BASE_URL');
    const fileExtension = extname(file.originalname) || '.jpg';
    const key = `notes/${userId}/${randomUUID()}${fileExtension}`;

    await this.getS3Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      key,
      url: `${publicBaseUrl.replace(/\/$/, '')}/${key}`,
    };
  }

  private getS3Client() {
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        region: this.configService.get<string>('S3_REGION', 'auto'),
        endpoint: this.configService.get<string>('S3_ENDPOINT'),
        credentials: {
          accessKeyId:
            this.getRequiredConfig('S3_ACCESS_KEY_ID'),
          secretAccessKey: this.getRequiredConfig('S3_SECRET_ACCESS_KEY'),
        },
        forcePathStyle: true,
      });
    }

    return this.s3Client;
  }

  private getRequiredConfig(key: string) {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new InternalServerErrorException(
        `Missing ${key} environment variable`,
      );
    }

    return value;
  }
}
