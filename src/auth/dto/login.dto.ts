import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(3)
  password: string;
}
