import {
  ClassSerializerInterceptor,
  Controller,
  Headers,
  Post,
  UseGuards,
  UseInterceptors,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { Public } from './decorator/public.decorator';
import { Authorization } from './decorator/authorization.decorator';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiBearerAuth()
@ApiTags('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // authorization: Basic token
  @Public()
  @ApiBasicAuth()
  @Post('register')
  registerUser(@Authorization() token: string) {
    return this.authService.register(token);
  }

  @Public()
  @ApiBasicAuth()
  @Post('login')
  loginUser(@Authorization() token: string) {
    return this.authService.login(token);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login/passport')
  async loginUserPassport(@Request() req) {
    const token = {
      refreshToken: await this.authService.issueToken(req.user, true),
      accessToken: await this.authService.issueToken(req.user, false),
    };
    return token;
  }

  @Post('token/access')
  async rotateAccessToken(@Request() req) {
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  async private(@Request() req) {
    return req.user;
  }

  @Post('token/block')
  async blockToken(@Body('token') token: string) {
    return await this.authService.tokenBlock(token);
  }
}
