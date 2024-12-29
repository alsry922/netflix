import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { readdir, unlink } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { DefaultLogger } from './logger/default.logger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class TasksService {
  // private readonly logger = new Logger(TasksService.name);

  constructor(
    // private readonly logger: DefaultLogger,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  // @Cron('*/5 * * * * *')
  // logEverySecond() {
  //   this.logger.fatal('FATAL 레벨 로그', null, TasksService.name);
  //   this.logger.error('ERROR 레벨 로그', null, TasksService.name);
  //   this.logger.warn('WARN 레벨 로그', TasksService.name);
  //   this.logger.log('LOG 레벨 로그', TasksService.name);
  //   this.logger.debug('DEBUG 레벨 로그', TasksService.name);
  //   this.logger.verbose('VERBOSE 레벨 로그', TasksService.name);
  // }

  // @Cron('* * * * * *')
  async eraseOrphanFiles() {
    const files = await readdir(join(process.cwd(), 'public', 'temp'));

    const deleteFilesTargets = files.filter((file) => {
      const filename = parse(file).name;
      const split = filename.split('_');
      if (split.length !== 2) {
        return true;
      }

      try {
        const uploadDate = new Date(parseInt(split[split.length - 1]));
        const dayInMilSec = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const uploadDateInMilSec = uploadDate.getTime();
        return now - uploadDateInMilSec > dayInMilSec;
      } catch (e) {
        return true;
      }
    });
    Promise.all(
      deleteFilesTargets.map((file) => {
        unlink(join(process.cwd(), 'public', 'temp', file));
      }),
    );
  }
}
