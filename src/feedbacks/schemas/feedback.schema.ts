import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Course } from 'src/courses/schemas/course.schema';
import { User } from 'src/users/schemas/user.schema';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ default: null, min: 0, max: 5 })
  rating: number;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  course: Course;

  // Parent ID para comentarios/respuestas
  @Prop({ type: Types.ObjectId, ref: 'Feedback', default: null })
  parent_id: Feedback | null;

  @Prop({
    type: [Types.ObjectId],
    ref: 'Feedback',
    default: [], // Referencias a respuestas
  })
  children: Feedback[];
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
