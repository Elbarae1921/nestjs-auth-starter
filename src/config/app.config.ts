import { registerAs } from '@nestjs/config';

const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '5000', 10),
  databaseHost: process.env.DATABASE_HOST ?? 'localhost',
  databasePort: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  databaseUser: process.env.DATABASE_USER ?? 'postgres',
  databasePassword: process.env.DATABASE_PASSWORD ?? 'postgres',
  databaseName: process.env.DATABASE_NAME ?? 'postgres',
}));

export type AppConfig = ReturnType<typeof appConfig>;

export default appConfig;
