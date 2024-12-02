import { IsEmail, IsString, Matches } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email: string;
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  )
  password: string;
}
