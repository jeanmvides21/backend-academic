import { IsString, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateAsignaturaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  maxclasessemana: number;
}

