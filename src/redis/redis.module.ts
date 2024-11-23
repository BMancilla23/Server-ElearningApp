import { RedisModule as IoRedisModule } from '@nestjs-modules/ioredis';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    IoRedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.get<string>('redis.uri'),
        tls: {
          rejectUnauthorized: false, // Necesario para Upstash ya que no tiene certificado autofirmado
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [IoRedisModule],
})
export class RedisModule {}
