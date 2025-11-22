import {
  IsString,
  IsInt,
  IsEnum,
  Matches,
  Min,
} from 'class-validator';

export enum DiaSemana {
  LUNES = 'Lunes',
  MARTES = 'Martes',
  MIERCOLES = 'Miércoles',
  JUEVES = 'Jueves',
  VIERNES = 'Viernes',
  SABADO = 'Sábado',
  DOMINGO = 'Domingo',
}

export class CreateHorarioDto {
  @IsEnum(DiaSemana)
  dia: DiaSemana;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'hora_inicio debe tener el formato HH:MM o HH:MM:SS (24 horas)',
  })
  hora_inicio: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'hora_fin debe tener el formato HH:MM o HH:MM:SS (24 horas)',
  })
  hora_fin: string;

  @IsInt()
  @Min(1)
  id_usuario: number;

  @IsInt()
  @Min(1)
  id_asignatura: number;
}

