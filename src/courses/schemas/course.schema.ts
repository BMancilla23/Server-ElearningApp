import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Feedback } from 'src/feedbacks/schemas/feedback.schema';
import { Section } from 'src/sections/schemas/section.schema';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({
    type: Object,
    default: {
      public_id: null,
      url: 'https://huyphujapan.com/o/com.lvv.common.media.m.web/images/poster.png',
    },
  })
  thumbnail: object;

  @Prop({
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  })
  level: string;

  @Prop({ type: Number, required: true })
  price: number;

  /*   @Prop()
  tags: [String]; */

  /*   @Prop()
  level: String; */

  /*   @Prop({ required: true })
  videlLength: Number; */

  /*   @Prop({ required: true })
  videoPlayer: String; */

  @Prop({ type: String, required: true })
  category: String;

  /*   @Prop()
  reviews: [String]; */

  @Prop({
    default: 'No requiere ninguna',
  })
  prerequisites: [String];

  /*   @Prop()
  rating: Number;
 */
  /*  @Prop()
  links: [String]; */

  @Prop({
    type: [Types.ObjectId],
    ref: 'Comment',
    default: [],
  })
  questions: Comment[];

  @Prop({
    type: [Types.ObjectId],
    ref: 'Feedback',
    default: [],
  })
  reviews: Feedback[];

  @Prop({
    type: [Types.ObjectId],
    ref: 'Section',
    default: [],
  })
  sections: Section[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
