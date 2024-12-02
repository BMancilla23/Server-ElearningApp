import { PassportStrategy } from '@nestjs/passport';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { VerifyCallback, Strategy, Profile } from 'passport-google-oauth20';
import { IUserProfile } from '../interfaces/userProfile.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('google.clientID'),
      clientSecret: configService.get<string>('google.clientSecret'),
      callbackURL: configService.get<string>('google.callbackURL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
      if (!profile) {
        throw new Error('Google profile is undefined');
      }

      const { id, emails, displayName, photos, provider } = profile;

      const userProfile: IUserProfile = {
        provider: provider,
        providerId: id,
        email: emails[0].value,
        name: displayName,
        picture: photos[0].value,
      };
      done(null, userProfile);
    } catch (error) {
      console.error('Error in google strategy', error);
      done(error, null);
    }
  }
}
