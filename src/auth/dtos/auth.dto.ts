import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const signinSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
});

export class SigninDto extends createZodDto(signinSchema) {}

const signupSchema = z.object({
  firstName: z.string().trim().toLowerCase(),
  lastName: z.string().trim().toLowerCase(),
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(8)
    .regex(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
      message: 'password too weak',
    }),
  phoneNumber: z.string().min(10),
  address: z.string().trim().toLowerCase(),
});

export class SignupDto extends createZodDto(signupSchema) {}

const signinResponseSchema = z.object({
  refreshToken: z.string(),
  accessToken: z.string(),
});

export class SigninResponseDto extends createZodDto(signinResponseSchema) {}
