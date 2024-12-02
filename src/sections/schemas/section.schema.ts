import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Course } from 'src/courses/schemas/course.schema';
import { Lesson } from 'src/lessons/schemas/lesson.schema';

export type SectionDocument = Section & Document;

@Schema({ timestamps: true })
export class Section {
  @Prop({ required: true })
  title: String;

  @Prop({ required: true })
  description: String;

  @Prop({ required: true })
  order: Number;

  @Prop({
    type: Types.ObjectId,
    ref: 'Course',
  })
  course: Course;

  @Prop({
    type: [Types.ObjectId],
    ref: 'Lesson',
    default: [],
  })
  lessons: Lesson[];
}

export const SectionSchema = SchemaFactory.createForClass(Section);
