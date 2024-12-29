import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // { logger: [] 특정 로그 레벨 이상만 콘솔에 보이도록 한다.}
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 기본값 false(true 설정 시, 요청 데이터에서 우리가 dto에 정의하지 않은 프로퍼티들을 요청 객체에서 자동으로 제거
      forbidNonWhitelisted: true, // 기본값 false(true 설정 시, 요청데이터에서 우리가 정의하지 않은 값들이 있다면 error(400)를 반환한다.
      transform: true, // 요청 데이터를 자동으로 DTO 클래스 인스턴스로 변환한다.(우리가 정의한 dto 타입으로 형변환, deserialization)
      transformOptions: {
        enableImplicitConversion: true, // 타입을 기반으로 동적으로 타입 변경을 해달라
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
