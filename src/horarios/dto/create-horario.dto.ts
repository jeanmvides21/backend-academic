import {
  IsString,
  IsInt,
  IsEnum,
  Matches,
  Min,
} from 'class-validator';

export enum DiaSemana {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIERCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO',
}

export class CreateHorarioDto {
  @IsEnum(DiaSemana)
  dia: DiaSemana;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'hora_inicio debe tener el formato HH:MM (24 horas)',
  })
  hora_inicio: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'hora_fin debe tener el formato HH:MM (24 horas)',
  })
  hora_fin: string;

  @IsInt()
  @Min(1)
  id_usuario: number;

  @IsInt()
  @Min(1)
  id_asignatura: number;
}

