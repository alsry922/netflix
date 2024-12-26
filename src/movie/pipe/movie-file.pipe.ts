import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { join } from 'node:path';
import { v4 } from 'uuid';
import { rename } from 'node:fs/promises';

@Injectable()
export class MovieFilePipe implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>> {
  constructor(
    private readonly options: {
      maxSize: number;
      mimeType: string;
    },
  ) {}

  async transform(value: Express.Multer.File, metadata: ArgumentMetadata): Promise<Express.Multer.File> {
    if (!value) {
      throw new BadRequestException('movie 필드는 필수입니다.');
    }
    const byteSize = this.options.maxSize * 1000000;

    if (value.size > byteSize) {
      throw new BadRequestException(`${this.options.maxSize}MB 이하의 사이즈만 업로드 가능합니다.`);
    }

    if (value.mimetype !== this.options.mimeType) {
      throw new BadRequestException(`${this.options.mimeType}만 업로드 가능합니다.`);
    }

    console.log('Console:: value', value);
    const split = value.originalname.split('.');

    let extension = 'mp4';

    if (split.length > 1) {
      extension = split[split.length - 1];
    }
    const filename = `${v4()}_${Date.now()}.${extension}`;
    const newPath = join(value.destination, filename);
    await rename(value.path, newPath);

    return {
      ...value,
      filename,
      path: newPath,
    };
  }
}