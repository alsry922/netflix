import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from '../../common/const/env.const';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      next();
      return;
    }

    const token = this.validateBearerToken(authHeader);

    const blockedToken = await this.cacheManager.get(`BLOCK_TOKEN_${token}`);

    if (blockedToken) {
      throw new UnauthorizedException('차단된 토큰입니다!');
    }
    const tokenKey = `TOKEN_${token}`;
    const cachedPayload = await this.cacheManager.get(tokenKey);
    if (cachedPayload) {
      req.user = cachedPayload;
      return next();
    }
    const decodedPayload = this.jwtService.decode(token);
    if (decodedPayload.type !== 'refresh' && decodedPayload.type !== 'access') {
      throw new UnauthorizedException('잘못된 토큰입니다!');
    }

    const secret = this.configService.get<string>(
      decodedPayload.type === 'refresh' ? envVariableKeys.refreshTokenSecret : envVariableKeys.accessTokenSecret,
    );

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      const expiryDate = new Date(payload.exp * 1000);
      const today = new Date();

      const timeDifferenceInMillis = expiryDate.getTime() - today.getTime();
      const ttl = timeDifferenceInMillis - 2000;
      if (ttl > 0) {
        await this.cacheManager.set(tokenKey, payload, ttl);
      }

      req.user = payload;
      next();
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료됐습니다.');
      }
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
