import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsOptional, IsString, IsEmail, MinLength, MaxLength, IsIn } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  cedula?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  @IsIn(['admin', 'estudiante'])
  rol?: 'admin' | 'estudiante';

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password?: string;
}

