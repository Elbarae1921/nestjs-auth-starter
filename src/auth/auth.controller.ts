import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto, SigninResponseDto } from './dtos/auth.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AccessTokenGuard } from './guards/access-token.guard';
import { users } from '@prisma/client';
import { User } from './decorators/user.decorator';
import { RequestWithUser } from './types/RequestWithUser';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupDto: SignupDto): Promise<SigninResponseDto> {
    return this.authService.signup(signupDto);
  }

  @Post('signin')
  signin(@Body() signinDto: SigninDto): Promise<SigninResponseDto> {
    return this.authService.signIn(signinDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(@User() user: users) {
    await this.authService.logout(user);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(@Req() req: RequestWithUser): Promise<SigninResponseDto> {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return await this.authService.refreshTokens(userId, refreshToken);
  }
}
