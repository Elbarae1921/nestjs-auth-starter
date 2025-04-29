import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, users } from '@prisma/client';
import { SignupDto } from 'src/auth/dtos/auth.dto';
import { ERRORS } from 'src/utils/errors';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findOne<T extends Prisma.usersSelect>(id: string, select: T) {
    return this.prismaService.users.findUnique({
      where: { id },
      select,
    });
  }

  createUser = async ({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    address,
    latitude,
    longitude,
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
        latitude,
        longitude,
      },
    });
    return user;
  };

  async findUserByEmail<T extends Prisma.usersSelect>(
    email: string,
    select?: T,
  ) {
    return this.prismaService.users.findUnique({
      where: { email },
      select,
    });
  }

  async findAll(): Promise<users[]> {
    return this.prismaService.users.findMany();
  }

  updateUser = async (id: string, updateUserDto: UpdateUserDto) => {
    const updatedUser = await this.prismaService.users.update({
      where: {
        id,
      },
      data: {
        ...updateUserDto,
      },
    });
    return updatedUser;
  };
}
