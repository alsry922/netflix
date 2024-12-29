import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class DefaultLogger extends ConsoleLogger {
  warn(message: any, ...optionalParams): void {
    console.log('---- WARN LOG ----');
    super.warn(message, ...optionalParams);
  }

  error(message: any, ...optionalParams) {
    console.log('---- ERROR LOG ----');
    super.error(message, ...optionalParams);
  }
}
