import { registerAs } from '@nestjs/config';

// RegisterAs es una función que recibe un nombre y devuelve un objeto de configuración
export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
}));
