import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto, SigninResponseDto } from './dtos/auth.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AccessTokenGuard } from './guards/access-token.guard';
import { users } from '@prisma/client';
import { User } from './decorators/user.decorator';
import { RequestWithRefreshToken } from './types/RequestWithUser';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/app.config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  @Post('signup')
  async signup(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SigninResponseDto> {
    const tokens = await this.authService.signup(signupDto);
    res
      .cookie(
        'accessToken',
        tokens.accessToken,
        this.configService.get('cookieConfig') ?? {},
      )
      .cookie(
        'refreshToken',
        tokens.refreshToken,
        this.configService.get('cookieConfig') ?? {},
      )
      .send(tokens);
    return tokens;
  }

  @Post('signin')
  async signin(
    @Body() signinDto: SigninDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SigninResponseDto> {
    const tokens = await this.authService.signIn(signinDto);
    res
      .cookie(
        'accessToken',
        tokens.accessToken,
        this.configService.get('cookieConfig') ?? {},
      )
      .cookie(
        'refreshToken',
        tokens.refreshToken,
        this.configService.get('cookieConfig') ?? {},
      )
      .send(tokens);
    return tokens;
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(@User() user: users, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(user);
    res
      .clearCookie('accessToken', this.configService.get('cookieConfig') ?? {})
      .clearCookie('refreshToken', this.configService.get('cookieConfig') ?? {})
      .send({ message: 'Logged out successfully' });
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(
    @Req() req: RequestWithRefreshToken,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SigninResponseDto> {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    res
      .cookie(
        'accessToken',
        tokens.accessToken,
        this.configService.get('cookieConfig') ?? {},
      )
      .cookie(
        'refreshToken',
        tokens.refreshToken,
        this.configService.get('cookieConfig') ?? {},
      )
      .send(tokens);
    return tokens;
  }
}
