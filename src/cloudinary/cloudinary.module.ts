import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary/cloudinary';

@Module({
  providers: [CloudinaryService, CloudinaryProvider],
  imports: [ConfigModule],
  exports: [CloudinaryService, CloudinaryProvider],
})
export class CloudinaryModule {}
