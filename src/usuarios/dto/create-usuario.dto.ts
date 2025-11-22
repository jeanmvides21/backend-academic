import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  cedula: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(7)
  @MaxLength(20)
  telefono: string;
}

