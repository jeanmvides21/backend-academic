import { PartialType } from '@nestjs/mapped-types';
import { CreateAsignaturaDto } from './create-asignatura.dto';
import { IsOptional, IsString, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';

export class UpdateAsignaturaDto extends PartialType(CreateAsignaturaDto) {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxclasessemana?: number;
}

