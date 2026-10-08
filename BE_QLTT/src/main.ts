import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MysqlExceptionFilter } from './common/filters/mysql-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  if (!process.env.JWT_SECRET?.trim()) {
    throw new Error(
      'Thiếu biến môi trường JWT_SECRET. Sao chép .env.example thành .env và đặt một chuỗi bí mật riêng.',
    );
  }

  const app = await NestFactory.create(AppModule);

  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',').map((o) => o.trim()) : true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.useGlobalFilters(new MysqlExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Library Management API')
    .setDescription('API for managing library resources')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
