import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  /**
   * LocalStrategy
   *
   * validate: username, password
   *
   * return -> Request()
   */
  async validate(username: string, password: string) {
    const user = await this.authService.authenticate(username, password);

    return user;
  }
}
