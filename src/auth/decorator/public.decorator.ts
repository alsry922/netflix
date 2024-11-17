import { Reflector } from '@nestjs/core';

export const Public = Reflector.createDecorator({
  key: 'isPublic',
  transform: (value: boolean) => value ?? true, //값이 없으면 true 반환
});
