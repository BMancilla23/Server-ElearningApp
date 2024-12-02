import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Section } from 'src/sections/schemas/section.schema';

export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({
    type: String,
    default:
      'https://huyphujapan.com/o/com.lvv.common.media.m.web/images/poster.png',
  })
  videoUrl: string;

  @Prop({ type: Number, required: true })
  order: number;

  @Prop({ type: String, required: true })
  duration: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Section',
  })
  section: Section;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
