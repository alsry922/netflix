import { BadRequestException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from '../../common/const/env.const';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      next();
      return;
    }

    try {
      const token = this.validateBearerToken(authHeader);

      const decodedPayload = this.jwtService.decode(token);

      if (decodedPayload.type !== 'refresh' && decodedPayload.type !== 'access') {
        throw new UnauthorizedException('잘못된 토큰입니다');
      }

      const secret = this.configService.get<string>(
        decodedPayload.type === 'refresh' ? envVariableKeys.refreshTokenSecret : envVariableKeys.accessTokenSecret,
      );

      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      req.user = payload;
      next();
    } catch (e) {
      next();
    }
  }

  private validateBearerToken(authHeader: string) {
    const authHeaderSplit = authHeader.split(' ');
    if (authHeaderSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [bearer, token] = authHeaderSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }
    return token;
  }
}
