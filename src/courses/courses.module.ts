import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UsersModule } from 'src/users/users.module';
import { SectionsModule } from 'src/sections/sections.module';
import { LessonsModule } from 'src/lessons/lessons.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema } from './schemas/course.schema';
import { SectionSchema } from 'src/sections/schemas/section.schema';
import { LessonSchema } from 'src/lessons/schemas/lesson.schema';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  imports: [
    CloudinaryModule,
    UsersModule,
    SectionsModule,
    LessonsModule,
    MongooseModule.forFeature([
      {
        name: 'Course',
        schema: CourseSchema,
      },
      {
        name: 'Section',
        schema: SectionSchema,
      },
      {
        name: 'Lesson',
        schema: LessonSchema,
      },
    ]),
  ],
})
export class CoursesModule {}
