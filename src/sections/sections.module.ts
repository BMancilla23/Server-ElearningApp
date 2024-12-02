import { Module } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SectionSchema } from './schemas/section.schema';

@Module({
  controllers: [SectionsController],
  providers: [SectionsService],
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Section',
        schema: SectionSchema,
      },
    ]),
  ],
})
export class SectionsModule {}
