import { config } from 'dotenv';
import { resolve } from 'path';

// In development, prefer .env over stray shell env vars (e.g. accidental Render DATABASE_URL)
if (process.env.NODE_ENV !== 'production') {
  config({ path: resolve(process.cwd(), '.env'), override: true });
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Create NestJS app with rawBody enabled to capture raw signatures for Paystack webhook verification
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Trust Render/proxy X-Forwarded-For so rate limits apply per client IP
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? clientUrl : true,
    credentials: true,
  });

  // Enforce global input validation and transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // Strip unvalidated fields
      transform: true,       // Auto-transform payloads to DTO instances
      forbidNonWhitelisted: true,
    }),
  );

  // Setup Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Eventful Ticketing Platform API')
    .setDescription(
      'Eventful is a high-performance backend for discovering, booking, paying, verifying, and analytics for events.\n\n' +
      '### Role Privileges:\n' +
      '- **CREATOR**: Create events, view attendee listings, scan ticket QR codes, track payments, view analytics dashboard.\n' +
      '- **EVENTEE**: View events, book and pay for tickets, view ticket QR codes, set custom reminders.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your Bearer Access Token retrieved from Auth endpoints',
        in: 'header',
      },
      'bearer', // Name of authorization parameter
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  const dbHost = (() => {
    try {
      return new URL(process.env.DATABASE_URL || '').host;
    } catch {
      return 'unknown';
    }
  })();

  console.log(`🚀 Eventful Backend is running on: http://localhost:${port}`);
  console.log(`🗄️  Database host: ${dbHost}`);
  console.log(`📚 Swagger Documentation is available on: http://localhost:${port}/docs`);
}
bootstrap();
