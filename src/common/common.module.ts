import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'node:path';
import e from 'express';
import { v4 } from 'uuid';
import { TasksService } from './tasks.service';
import { DefaultLogger } from './logger/default.logger';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'temp'),
        filename(req: e.Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) {
          const split = file.originalname.split('.');
          let extension = 'mp4';
          if (split.length > 1) {
            extension = split[split.length - 1];
          }
          callback(null, `${v4()}_${Date.now()}.${extension}`);
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService, TasksService, DefaultLogger],
  exports: [CommonService, DefaultLogger],
})
export class CommonModule {}
