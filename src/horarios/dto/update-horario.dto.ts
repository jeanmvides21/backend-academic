import { PartialType } from '@nestjs/mapped-types';
import { CreateHorarioDto, DiaSemana } from './create-horario.dto';
import { IsOptional, IsString, IsInt, IsEnum, Matches, Min } from 'class-validator';

export class UpdateHorarioDto extends PartialType(CreateHorarioDto) {
  @IsOptional()
  @IsEnum(DiaSemana)
  dia?: DiaSemana;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'hora_inicio debe tener el formato HH:MM (24 horas)',
  })
  hora_inicio?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'hora_fin debe tener el formato HH:MM (24 horas)',
  })
  hora_fin?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_usuario?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_asignatura?: number;
}

