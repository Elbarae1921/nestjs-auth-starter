import { CookieOptions } from 'express';

const appConfig = () => ({
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'secret',
  port: parseInt(process.env.PORT ?? '5000', 10),
  databaseHost: process.env.DATABASE_HOST ?? 'localhost',
  databasePort: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  databaseUser: process.env.DATABASE_USER ?? 'postgres',
  databasePassword: process.env.DATABASE_PASSWORD ?? 'postgres',
  databaseName: process.env.DATABASE_NAME ?? 'postgres',
  cookieSecret: process.env.COOKIE_SECRET ?? 'secret',
  cookieConfig: {
    path: '/',
    httpOnly: true,
    secure:
      process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test',
    sameSite: 'strict',
    expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
    domain: process.env.COOKIE_DOMAIN ?? 'localhost',
    signed: true,
  } satisfies CookieOptions,
});

export type AppConfig = ReturnType<typeof appConfig>;

export default appConfig;
