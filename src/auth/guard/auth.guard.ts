import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorator/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  // reflector는 nestjs에서 자동으로 주입 받을 수 있음
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    // 만약에 public decoration이 돼있으면 모든 로직을 bypass

    // handler 문맥에서, Public 데코레이터를 가져온다.(Public 데코레이터의 인자로 입력한 값을 반환하게 된다)
    // Public 데코레이터의 인자로 아무 값도 넣지 않았으면 빈 객체가 반환된다.
    const isPublic = this.reflector.get(Public, context.getHandler());

    console.log(isPublic, typeof isPublic);

    if (isPublic) {
      return true;
    }

    // 요청에서 user 객체가 존재하는지 확인한다.
    const request = context.switchToHttp().getRequest();

    return !(!request.user || request.user.type !== 'access');
  }
}
