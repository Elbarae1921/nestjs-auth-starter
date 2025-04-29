/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { toLowerCase, trim } from 'src/utils/helpers';

export class SigninDto {
  @IsEmail()
  @Transform(({ value }) => trim(value))
  @Transform(({ value }) => toLowerCase(value))
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SignupDto {
  @IsString()
  @Transform(({ value }) => trim(value))
  @Transform(({ value }) => toLowerCase(value))
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @Transform(({ value }) => trim(value))
  @Transform(({ value }) => toLowerCase(value))
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @Transform(({ value }) => trim(value))
  @Transform(({ value }) => toLowerCase(value))
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message: 'password too weak',
  // }) TODO: remove comment it later
  password: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}

export class SigninResponseDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
