import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS config
  app.enableCors({
    origin: (origin, callback) => {
      // If no origin (like mobile apps, curl, postman, server-to-server), allow it
      if (!origin) {
        callback(null, true);
        return;
      }
      
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://inventory-management-khaki-iota.vercel.app',
      ];
      
      // Parse custom allowed origins from env if configured
      if (process.env.ALLOWED_ORIGINS) {
        const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
        allowedOrigins.push(...envOrigins);
      }
      
      const isAllowed = 
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') || // Allows all Vercel previews/branches
        /^http:\/\/localhost:\d+$/.test(origin); // Allows any local development port
        
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Swagger Documentation configuration
  const config = new DocumentBuilder()
    .setTitle('Inventory Management API')
    .setDescription('Backend REST API service documentation for the Inventory Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`NestJS server running at http://localhost:${port}`);
  logger.log(`Swagger Interactive documentation available at http://localhost:${port}/api/docs`);
}
bootstrap();
