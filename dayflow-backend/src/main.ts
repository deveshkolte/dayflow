import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Global validation prevents malformed requests from reaching business logic.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  // All API failures use the same envelope as successful responses.
  app.useGlobalFilters(new HttpExceptionFilter());
  // The frontend is a separate local origin, so its API calls need explicit CORS access.
  app.enableCors({ origin: process.env.CLIENT_URL?.split(',').map((value) => value.trim()) ?? true });
  app.setGlobalPrefix('api');
  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`DayFlow backend listening on http://localhost:${port} (health: http://localhost:${port}/api/health)`);
}

bootstrap();
