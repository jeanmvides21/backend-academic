import { IsString, IsEmail, MinLength, MaxLength, IsIn } from 'class-validator';

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

  @IsString()
  @IsIn(['admin', 'estudiante'])
  rol: 'admin' | 'estudiante';

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}

