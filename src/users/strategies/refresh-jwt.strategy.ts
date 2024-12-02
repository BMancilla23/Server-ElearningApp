import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IPayload } from '../interfaces/payload.interface';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => req.cookies.refreshToken,
      secretOrKey: configService.get<string>('jwt.secret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: IPayload) {
    if (!req.cookies.refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    return payload; // No validación adicional en la base de datos
  }
}
