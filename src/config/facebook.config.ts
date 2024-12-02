import { registerAs } from '@nestjs/config';

export default registerAs('facebook', () => ({
  clientId: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackUrl: process.env.FACEBOOK_CALLBACK_URL,
}));
