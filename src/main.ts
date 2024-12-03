import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 기본값 false(true 설정 시, 요청 데이터에서 우리가 dto에 정의하지 않은 값들은 검증하지 않는다.
      forbidNonWhitelisted: true, // 기본값 false(true 설정 시, 요청데이터에서 우리가 정의하지 않은 값들이 있다면 error를 반환한다.
      transform: true, // 이 옵션을 주지 않으면 요청데이터가 우리가 정의한 dto 타입으로 형변환이 이루어지지 않음(deserialization)
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
