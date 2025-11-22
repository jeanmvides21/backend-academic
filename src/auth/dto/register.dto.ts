import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MaxLength(20)
  telefono?: string;
}

