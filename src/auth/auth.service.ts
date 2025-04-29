import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { users } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import * as argon from 'argon2';
import { ERRORS } from 'src/utils/errors';
import { SigninDto, SignupDto } from './dtos/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppConfig } from 'src/config/app.config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService<AppConfig>,
    private prismaService: PrismaService,
  ) {}

  async signIn({ email, password }: SigninDto) {
    const user = await this.userService.findUserByEmail(email, {
      password: true,
      id: true,
      email: true,
    });
    if (!user) {
      throw new ForbiddenException(ERRORS.BAD_CREDENTIALS);
    }
    const passwordsMatch = await argon.verify(user.password, password);
    if (!passwordsMatch) {
      throw new ForbiddenException(ERRORS.BAD_CREDENTIALS);
    }
    const tokens = await this.signTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  signup = async (signupDto: SignupDto) => {
    const user = await this.userService.createUser(signupDto);
    const tokens = await this.signTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  };

  signTokens = async (user: Pick<users, 'id' | 'email'>) => {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '6h',
        secret: this.configService.get('jwtAccessSecret'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: this.configService.get('jwtRefreshSecret'),
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  };

  updateRefreshToken = async (userId: string, refreshToken: string) => {
    const hashedRefreshToken = await argon.hash(refreshToken);
    await this.prismaService.users.update({
      where: { id: userId },
      data: { refresh_token: hashedRefreshToken },
    });
  };

  refreshTokens = async (userId: string, refreshToken: string) => {
    const user = await this.prismaService.users.findUnique({
      where: { id: userId },
      select: {
        refresh_token: true,
        id: true,
        email: true,
      },
    });
    if (!user || !user.refresh_token)
      throw new ForbiddenException(ERRORS.ACCESS_DENIED);
    const refreshTokenMatches = await argon.verify(
      user.refresh_token,
      refreshToken,
    );

    if (!refreshTokenMatches)
      throw new ForbiddenException(ERRORS.ACCESS_DENIED);
    const tokens = await this.signTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  };

  logout = async (user: users) => {
    return await this.prismaService.users.update({
      where: { id: user.id },
      data: { refresh_token: null },
    });
  };
}
