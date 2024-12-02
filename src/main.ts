import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix para las rutas
  app.setGlobalPrefix('api/v1');

  // Configurar el validador de datos
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );

  // Cookies
  app.use(cookieParser());
  const logger = new Logger('Main');

  // Obtener las configuraciones globales
  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port');

  //Habilitar cors
  app.enableCors({
    origin: configService.get<string>('app.origin'), // Frontend origin
    credentials: true,
  });

  // Iniciar el servidor
  await app.listen(port);
  logger.log(`Server started on port ${port}`);
}
bootstrap();
