import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //class-validator 적용을 위해 추가
  //ValidationPipe 생성자의 파라미터로 옵션을 넣을 수 있음
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, //기본값은 false, true 설정 시, 요청데이터에서 우리가 dto에 정의하지 않은 값들이 넘어오면, 그 값들은 빼서 처리한다.
      forbidNonWhitelisted: true, //기본값음 false, true 설정 시, 요청데이터에서 우리가 dto에 정의하지 않은 값들이 넘어오면 error를 뱉겠다.
      //굳이 error까지 낼 필요가 있나 해서, 얘는 설정 안하는 경우도 많음. 타이트하게 제약을 걸고 싶다면 그냥 true 해도 괜찮음.
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
