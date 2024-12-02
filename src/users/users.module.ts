import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from 'src/mail/mail.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    JwtStrategy,
    RefreshJwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
  ],
  imports: [
    ConfigModule,
    CloudinaryModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    // definimos el módulo de passport para que pueda utilizar jwt
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Registramos el modulo jwt con configuracion asincrona
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn') || '1h',
        },
      }),
    }),
    // Registramos el módulo de mail
    MailModule,
  ],

  exports: [PassportModule, JwtModule],
})
export class UsersModule {}
