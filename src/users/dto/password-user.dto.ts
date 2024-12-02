import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class PasswordUserDto {
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minSymbols: 1,
  })
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minSymbols: 1,
  })
  newPassword: string;
}
