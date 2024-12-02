import { IsString, Length, Matches } from 'class-validator';

export class VerifyOtpUserDto {
  @IsString()
  @Length(6, 6, { message: 'El OTP debe tener exactamente 6 dígitos' })
  @Matches(/^\d+$/, { message: 'El OTP solo debe contener números' })
  otp: string;
}
