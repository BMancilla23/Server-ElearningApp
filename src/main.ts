import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');

  // Obtener las configuraciones globales
  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port');

  //Habilitar cors
  app.enableCors({
    origin: configService.get<string>('app.origin'),
  });

  // Iniciar el servidor
  await app.listen(port);
  logger.log(`Server started on port ${port}`);
}
bootstrap();
