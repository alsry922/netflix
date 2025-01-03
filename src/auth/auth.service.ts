import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRoleEnum } from '../user/const/user-role.enum';
import { envVariableKeys } from '../common/const/env.const';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async register(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (user) {
      throw new BadRequestException('이미 가입한 이메일 입니다.');
    }

    const hash = await bcrypt.hash(password, this.configService.get<number>('HASH_ROUNDS'));

    await this.userRepository.save({
      email,
      password: hash,
    });

    return this.userRepository.findOne({ where: { email } });
  }

  async login(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    const user = await this.authenticate(email, password);

    return {
      refreshToken: await this.issueToken(user, true),
      accessToken: await this.issueToken(user, false),
    };
  }

  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }

    const passOk = await bcrypt.compare(password, user.password);

    if (!passOk) {
      throw new BadRequestException('잘못된 로그인 정보입니다.');
    }
    return user;
  }

  // todo payload가 issueToken으로 넘어오는 경우 id 프로퍼티는 존재하지 않음
  async issueToken(user: { id: number; role: UserRoleEnum }, isRefreshToken: boolean) {
    const refreshTokenSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    const accessTokenSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
    return await this.jwtService.signAsync(
      {
        id: user.id,
        role: user.role,
        type: isRefreshToken ? 'refresh' : 'access',
      },
      {
        secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefreshToken ? '30d' : '24h',
      },
    );
  }

  parseBasicToken(rawToken: string) {
    const basicSplit = rawToken.split(' ');
    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [basic, token] = basicSplit;

    if (basic.toLowerCase() !== 'basic') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const decoded = Buffer.from(token, 'base64').toString('utf-8');

    const tokenSplit = decoded.split(':');

    if (tokenSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [email, password] = tokenSplit;

    return {
      email,
      password,
    };
  }

  async parseBearerToken(rawToken: string, isRefreshToken: boolean) {
    const basicSplit = rawToken.split(' ');
    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [bearer, token] = basicSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>(
        isRefreshToken ? envVariableKeys.refreshTokenSecret : envVariableKeys.accessTokenSecret,
      ),
    });

    if (isRefreshToken) {
      if (payload.type !== 'refresh') {
        throw new BadRequestException('Refresh 토큰을 입력해주세요');
      }
    } else {
      if (payload.type !== 'access') {
        throw new BadRequestException('Access 토큰을 입력해주세요');
      }
    }

    return payload;
  }

  async tokenBlock(token: string) {
    const payload = this.jwtService.decode(token);
    const expiryDate = new Date(payload['exp'] * 1000).getTime();
    const now = Date.now();
    const ttlMs = Math.max(expiryDate - now, 1); // 밀리초 단위 유지

    await this.cacheManager.set(`BLOCK_TOKEN_${token}`, payload, ttlMs);

    return true;
  }
}
