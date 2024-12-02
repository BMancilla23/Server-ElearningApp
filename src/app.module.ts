import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  appConfig,
  cloudinaryConfig,
  databaseConfig,
  facebookConfig,
  googleConfig,
  jwtConfig,
  mailConfig,
  redisConfig,
} from './config';
/* import { RedisModule } from './redis/redis.module'; */
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CommonModule } from './common/common.module';
import { CoursesModule } from './courses/courses.module';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';

import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { SectionsModule } from './sections/sections.module';
import { LessonsModule } from './lessons/lessons.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        jwtConfig,
        mailConfig,
        facebookConfig,
        googleConfig,
        cloudinaryConfig,
      ],
      isGlobal: true,
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),
    /* RedisModule, */
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    RedisModule,
    MailModule,
    CloudinaryModule,
    CommonModule,
    CoursesModule,

    FeedbacksModule,

    SectionsModule,

    LessonsModule,
  ],
  providers: [
    {
      provide: 'APP_PIPE',
      useFactory: () => ({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
  ],
})
export class AppModule {}
