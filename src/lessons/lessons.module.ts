import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonSchema } from './schemas/lesson.schema';

@Module({
  controllers: [LessonsController],
  providers: [LessonsService],
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Lesson',
        schema: LessonSchema,
      },
    ]),
  ],

  exports: [MongooseModule],
})
export class LessonsModule {}
