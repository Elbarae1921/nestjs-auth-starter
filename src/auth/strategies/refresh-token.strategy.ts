import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/app.config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(readonly configService: ConfigService<AppConfig>) {
    super({
      // Use this if using Bearer tokens
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshTokenStrategy.extractRefreshTokenFromCookies,
      ]),
      secretOrKey: `${configService.get('jwtRefreshSecret')}`,
      passReqToCallback: true,
    });
  }

  // Remove if using Bearer tokens
  private static extractRefreshTokenFromCookies = (
    req: Request,
  ): string | null => {
    /* eslint-disable */
    const fastifyReq = req as any;

    // Must call unsignCookie to validate and extract the value
    if (typeof fastifyReq.unsignCookie === 'function') {
      const raw = fastifyReq.cookies?.refreshToken;
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

  // Use this if using Bearer tokens
  // validate(req: Request, payload: any) {
  //   const refreshToken = req.headers.authorization
  //     ?.replace('Bearer', '')
  //     .trim();
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  //   return { ...payload, refreshToken };
  // }
  validate(req: any, payload: { email: string; sub: string }) {
    return {
      ...payload,
      // eslint-disable-next-line
      refreshToken: req.unsignCookie(req.cookies?.refreshToken).value,
    };
  }
}
