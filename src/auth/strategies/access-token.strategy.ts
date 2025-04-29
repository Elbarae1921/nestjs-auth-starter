import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from 'src/config/app.config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UserService,
    readonly configService: ConfigService<AppConfig>,
  ) {
    super({
      // Use this if using Bearer tokens
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        AccessTokenStrategy.extractAccessTokenFromCookies,
      ]),
      secretOrKey: `${configService.get('jwtAccessSecret')}`,
    });
  }

  // Remove if using Bearer tokens
  private static extractAccessTokenFromCookies = (
    req: Request,
  ): string | null => {
    /* eslint-disable */
    const fastifyReq = req as any;

    // Must call unsignCookie to validate and extract the value
    if (typeof fastifyReq.unsignCookie === 'function') {
      const raw = fastifyReq.cookies?.accessToken;
      if (!raw) return null;
      const { value, valid } = fastifyReq.unsignCookie(raw);

      if (valid && value) {
        return value;
      } else {
        return null;
      }
    }

    return null;
  };
  /* eslint-enable */

  validate = async (validationPayload: { email: string; sub: string }) => {
    return await this.usersService.findUserByEmail(validationPayload.email);
  };
}
