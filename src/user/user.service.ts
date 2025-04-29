import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, users } from '@prisma/client';
import { SignupDto } from 'src/auth/dtos/auth.dto';
import { ERRORS } from 'src/utils/errors';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  createUser = async ({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    address,
  }: SignupDto) => {
    const emailExists = await this.prismaService.users.findUnique({
      where: {
        email,
      },
    });
    if (emailExists) {
      throw new BadRequestException(ERRORS.EMAIL_TAKEN);
    }
    const hashedPassword = await argon.hash(password);
    const user = await this.prismaService.users.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        password: hashedPassword,
        phone_number: phoneNumber,
        address,
      },
    });
    return user;
  };

  async findUserByEmail(email: string, select?: Prisma.usersSelect) {
    return this.prismaService.users.findUnique({
      where: { email },
      select,
    });
  }

  async findAll(): Promise<users[]> {
    return this.prismaService.users.findMany();
  }
}
