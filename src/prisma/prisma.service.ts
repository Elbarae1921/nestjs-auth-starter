import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      omit: {
        users: {
          password: true,
          refresh_token: true,
        },
      },
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
