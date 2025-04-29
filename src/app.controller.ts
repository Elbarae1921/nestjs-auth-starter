import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { users } from '@prisma/client';
import { AccessTokenGuard } from './auth/guards/access-token.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(AccessTokenGuard)
  @Get('users')
  async getUsers(): Promise<users[]> {
    const users = await this.prismaService.users.findMany();
    return users;
  }
}
