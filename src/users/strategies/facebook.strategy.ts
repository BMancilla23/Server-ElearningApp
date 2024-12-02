import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Profile, Strategy } from 'passport-facebook';
import { IUserProfile } from '../interfaces/userProfile.interface';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('facebook.clientId'),
      clientSecret: configService.get<string>('facebook.clientSecret'),
      callbackURL: configService.get<string>('facebook.callbackUrl'),
      profileFields: ['id', 'emails', 'displayName', 'photos'], // Fields
      scope: ['email', 'public_profile'], // Scopes
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile | undefined,
    done: (err: any, user: any, info?: any) => void,
  ) {
    try {
      if (!profile) {
        throw new Error('Facebook profile is undefined');
      }
      /*  console.log('Facebook profile', profile);

      console.log('Raw profile:', profile._raw);
      console.log('JSON profile:', profile._json); */

      const { id, emails, photos, displayName } = profile;

      const userProfile: IUserProfile = {
        provider: 'facebook',
        providerId: id,
        email:
          emails && emails.length > 0 ? emails[0].value : 'No email available',
        name: displayName,
        picture: photos[0].value,
      };
      done(null, userProfile);
    } catch (error) {
      console.error('Error in facebook strategy', error);
      done(error, null);
    }
  }
}
