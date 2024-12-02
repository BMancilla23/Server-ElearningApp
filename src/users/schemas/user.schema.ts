import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../enums/role.enum';
import { Course } from 'src/courses/schemas/course.schema';
import { Feedback } from 'src/feedbacks/schemas/feedback.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      delete ret.password;
      /*  delete ret.otpHash;
      delete ret.otpExpiresAt; */
      delete ret.socialId;
      delete ret.__v;
    },
  },
})
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, lowercase: true, unique: true })
  email: string;

  @Prop({
    required: function () {
      return !this.provider;
    },
    select: false,
  })
  password: string;

  @Prop({
    type: Object,
    default: {
      public_id: '',
      url: 'https://huyphujapan.com/o/com.lvv.common.media.m.web/images/avatar.png',
    },
  })
  avatar: {
    public_id: string;
    url: string;
  };

  @Prop({ enum: Role, default: Role.USER })
  role: Role;

  @Prop({ default: false })
  isVerified: boolean;

  /*  @Prop({ select: false })
  otpHash: string; // Hash del código de verificación

  @Prop()
  otpExpiresAt: Date; // Fecha de expiración del código de verificación */
  @Prop({ enum: ['local', 'google', 'facebook'], default: 'local' })
  provider: string;

  @Prop({ select: false })
  socialId?: string;

  /*  @Prop([String])
  courses: string[]; */

  /* @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Course'})
  course: Course */

  @Prop({
    type: [Types.ObjectId],
    ref: 'Course',
    default: [],
  })
  courses: Course[];

  @Prop({
    type: [Types.ObjectId],
    ref: 'Feedback',
    default: [],
  })
  feedback: Feedback[];
}

// Creamos la interfaz de usuario
export const UserSchema = SchemaFactory.createForClass(User);
