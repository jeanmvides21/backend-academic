import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @IsEmail()
  correo: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;
}

