import { registerAs } from '@nestjs/config';

export default registerAs('google', () => ({
  clientID: process.env.GOOGLE_APP_ID,
  clientSecret: process.env.GOOGLE_APP_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}));
