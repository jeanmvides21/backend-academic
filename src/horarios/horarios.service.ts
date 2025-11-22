import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AsignaturasService } from '../asignaturas/asignaturas.service';

@Injectable()
export class HorariosService {
  constructor(
    private supabaseService: SupabaseService,
    private usuariosService: UsuariosService,
    private asignaturasService: AsignaturasService,
  ) {}

  private validateTimeRange(horaInicio: string, horaFin: string) {
    const [hInicio, mInicio] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);

    const inicioMinutos = hInicio * 60 + mInicio;
    const finMinutos = hFin * 60 + mFin;

    if (finMinutos <= inicioMinutos) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la hora de inicio',
      );
    }
  }

  private checkTimeOverlap(
    horaInicio1: string,
    horaFin1: string,
    horaInicio2: string,
    horaFin2: string,
  ): boolean {
    const [h1Inicio, m1Inicio] = horaInicio1.split(':').map(Number);
    const [h1Fin, m1Fin] = horaFin1.split(':').map(Number);
    const [h2Inicio, m2Inicio] = horaInicio2.split(':').map(Number);
    const [h2Fin, m2Fin] = horaFin2.split(':').map(Number);

    const inicio1 = h1Inicio * 60 + m1Inicio;
    const fin1 = h1Fin * 60 + m1Fin;
    const inicio2 = h2Inicio * 60 + m2Inicio;
    const fin2 = h2Fin * 60 + m2Fin;

    // Verificar solapamiento: dos intervalos se solapan si
    // inicio1 < fin2 && inicio2 < fin1
    return inicio1 < fin2 && inicio2 < fin1;
  }

  private async validateMaxClasesSemana(
    idAsignatura: number,
    idUsuario: number,
    excludeHorarioId?: number,
  ) {
    const asignatura = await this.asignaturasService.findOne(idAsignatura);
    const supabase = this.supabaseService.getClient();

    // Contar horarios de esta asignatura para este usuario en la semana
    let query = supabase
      .from('schedules')
      .select('id', { count: 'exact' })
      .eq('id_asignatura', idAsignatura)
      .eq('id_usuario', idUsuario);

    if (excludeHorarioId) {
      query = query.neq('id', excludeHorarioId);
    }

    const { count } = await query;
    const totalHorarios = count || 0;

    // Si estamos creando un nuevo horario (no excluyendo ninguno), sumar 1
    const totalConNuevo = excludeHorarioId ? totalHorarios : totalHorarios + 1;

    if (totalConNuevo > asignatura.maxclasessemana) {
      throw new ConflictException(
        `La asignatura "${asignatura.nombre}" solo permite ${asignatura.maxclasessemana} clase(s) por semana. Ya tiene ${totalHorarios} horario(s) asignado(s).`,
      );
    }
  }

  async create(createHorarioDto: CreateHorarioDto) {
    const supabase = this.supabaseService.getClient();

    // Validar que el usuario existe
    await this.usuariosService.findOne(createHorarioDto.id_usuario);

    // Validar que la asignatura existe
    await this.asignaturasService.findOne(createHorarioDto.id_asignatura);

    // Validar rango de horas
    this.validateTimeRange(createHorarioDto.hora_inicio, createHorarioDto.hora_fin);

    // Validar máximo de clases por semana
    await this.validateMaxClasesSemana(
      createHorarioDto.id_asignatura,
      createHorarioDto.id_usuario,
    );

    // Verificar solapamiento de horarios
    const { data: horariosMismoDia } = await supabase
      .from('schedules')
      .select(`
        *,
        asignatura:asignatura(*)
      `)
      .eq('id_usuario', createHorarioDto.id_usuario)
      .eq('dia', createHorarioDto.dia);

    if (horariosMismoDia) {
      const tieneSolapamiento = horariosMismoDia.some((horario) =>
        this.checkTimeOverlap(
          createHorarioDto.hora_inicio,
          createHorarioDto.hora_fin,
          horario.hora_inicio,
          horario.hora_fin,
        ),
      );

      if (tieneSolapamiento) {
        const horarioConflicto = horariosMismoDia.find((horario) =>
          this.checkTimeOverlap(
            createHorarioDto.hora_inicio,
            createHorarioDto.hora_fin,
            horario.hora_inicio,
            horario.hora_fin,
          ),
        );
        
        throw new ConflictException(
          `El horario se cruza con ${horarioConflicto?.asignatura?.nombre || 'otra asignatura'} (${horarioConflicto?.hora_inicio.substring(0, 5)} - ${horarioConflicto?.hora_fin.substring(0, 5)})`,
        );
      }
    }

    // Normalizar formato de hora para PostgreSQL (HH:MM:SS)
    const normalizarHora = (hora: string): string => {
      if (!hora) return hora;
      // Remover espacios en blanco
      hora = hora.trim();
      // Si viene en formato HH:MM, agregar :00
      if (hora.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        return hora + ':00';
      }
      // Si ya viene en formato HH:MM:SS, retornar tal cual
      if (hora.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)) {
        return hora;
      }
      return hora;
    };

    // Validar que las horas estén en el rango permitido (06:00 - 22:00)
    const validarRangoHora = (hora: string, campo: string): void => {
      const horaFormateada = normalizarHora(hora);
      const [horas, minutos] = horaFormateada.split(':').map(Number);
      
      if (horas < 6 || horas > 22 || (horas === 22 && minutos > 0)) {
        throw new BadRequestException(
          `${campo} debe estar entre 06:00 y 22:00. Valor recibido: ${hora}`
        );
      }
    };

    validarRangoHora(createHorarioDto.hora_inicio, 'hora_inicio');
    validarRangoHora(createHorarioDto.hora_fin, 'hora_fin');

    const horarioNormalizado = {
      ...createHorarioDto,
      hora_inicio: normalizarHora(createHorarioDto.hora_inicio),
      hora_fin: normalizarHora(createHorarioDto.hora_fin),
    };

    const { data, error } = await supabase
      .from('schedules')
      .insert([horarioNormalizado])
      .select(`
        *,
        usuario:usuario(*),
        asignatura:asignatura(*)
      `)
      .single();

    if (error) {
      throw new BadRequestException(`Error al crear horario: ${error.message}`);
    }

    return data;
  }

  async findAll() {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        usuario:usuario(*),
        asignatura:asignatura(*)
      `)
      .order('dia', { ascending: true })
      .order('hora_inicio', { ascending: true });

    if (error) {
      throw new BadRequestException(`Error al obtener horarios: ${error.message}`);
    }

    return data;
  }

  async findOne(id: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        usuario:usuario(*),
        asignatura:asignatura(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }

    return data;
  }

  async findByUsuario(idUsuario: number) {
    const supabase = this.supabaseService.getClient();

    // Verificar que el usuario existe
    await this.usuariosService.findOne(idUsuario);

    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        usuario:usuario(*),
        asignatura:asignatura(*)
      `)
      .eq('id_usuario', idUsuario)
      .order('dia', { ascending: true })
      .order('hora_inicio', { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Error al obtener horarios del usuario: ${error.message}`,
      );
    }

    return data;
  }

  async update(id: number, updateHorarioDto: UpdateHorarioDto) {
    const supabase = this.supabaseService.getClient();

    // Verificar que el horario existe
    const horarioActual = await this.findOne(id);

    const idUsuario = updateHorarioDto.id_usuario || horarioActual.id_usuario;
    const idAsignatura =
      updateHorarioDto.id_asignatura || horarioActual.id_asignatura;
    const dia = updateHorarioDto.dia || horarioActual.dia;
    const horaInicio = updateHorarioDto.hora_inicio || horarioActual.hora_inicio;
    const horaFin = updateHorarioDto.hora_fin || horarioActual.hora_fin;

    // Validar que el usuario existe (si se actualiza)
    if (updateHorarioDto.id_usuario) {
      await this.usuariosService.findOne(updateHorarioDto.id_usuario);
    }

    // Validar que la asignatura existe (si se actualiza)
    if (updateHorarioDto.id_asignatura) {
      await this.asignaturasService.findOne(updateHorarioDto.id_asignatura);
    }

    // Validar rango de horas
    if (updateHorarioDto.hora_inicio || updateHorarioDto.hora_fin) {
      this.validateTimeRange(horaInicio, horaFin);
    }

    // Validar máximo de clases por semana
    if (
      updateHorarioDto.id_asignatura ||
      updateHorarioDto.id_usuario
    ) {
      await this.validateMaxClasesSemana(idAsignatura, idUsuario, id);
    }

    // Verificar solapamiento de horarios (excluyendo el actual)
    if (updateHorarioDto.hora_inicio || updateHorarioDto.hora_fin || updateHorarioDto.dia) {
      const { data: horariosMismoDia } = await supabase
        .from('schedules')
        .select(`
          *,
          asignatura:asignatura(*)
        `)
        .eq('id_usuario', idUsuario)
        .eq('dia', dia)
        .neq('id', id);

      if (horariosMismoDia) {
        const tieneSolapamiento = horariosMismoDia.some((horario) =>
          this.checkTimeOverlap(
            horaInicio,
            horaFin,
            horario.hora_inicio,
            horario.hora_fin,
          ),
        );

        if (tieneSolapamiento) {
          const horarioConflicto = horariosMismoDia.find((horario) =>
            this.checkTimeOverlap(
              horaInicio,
              horaFin,
              horario.hora_inicio,
              horario.hora_fin,
            ),
          );
          
          throw new ConflictException(
            `El horario se cruza con ${horarioConflicto?.asignatura?.nombre || 'otra asignatura'} (${horarioConflicto?.hora_inicio.substring(0, 5)} - ${horarioConflicto?.hora_fin.substring(0, 5)})`,
          );
        }
      }
    }

    // Normalizar formato de hora para PostgreSQL si se están actualizando
    const normalizarHora = (hora: string): string => {
      if (!hora) return hora;
      hora = hora.trim();
      if (hora.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        return hora + ':00';
      }
      if (hora.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)) {
        return hora;
      }
      return hora;
    };

    const horarioActualizado: any = { ...updateHorarioDto };
    
    // Normalizar y validar horas si se están actualizando
    if (horarioActualizado.hora_inicio) {
      horarioActualizado.hora_inicio = normalizarHora(horarioActualizado.hora_inicio);
      const [horas, minutos] = horarioActualizado.hora_inicio.split(':').map(Number);
      if (horas < 6 || horas > 22 || (horas === 22 && minutos > 0)) {
        throw new BadRequestException(
          `hora_inicio debe estar entre 06:00 y 22:00. Valor recibido: ${updateHorarioDto.hora_inicio}`
        );
      }
    }
    
    if (horarioActualizado.hora_fin) {
      horarioActualizado.hora_fin = normalizarHora(horarioActualizado.hora_fin);
      const [horas, minutos] = horarioActualizado.hora_fin.split(':').map(Number);
      if (horas < 6 || horas > 22 || (horas === 22 && minutos > 0)) {
        throw new BadRequestException(
          `hora_fin debe estar entre 06:00 y 22:00. Valor recibido: ${updateHorarioDto.hora_fin}`
        );
      }
    }

    const { data, error } = await supabase
      .from('schedules')
      .update(horarioActualizado)
      .eq('id', id)
      .select(`
        *,
        usuario:usuario(*),
        asignatura:asignatura(*)
      `)
      .single();

    if (error) {
      throw new BadRequestException(`Error al actualizar horario: ${error.message}`);
    }

    return data;
  }

  async remove(id: number) {
    const supabase = this.supabaseService.getClient();

    // Verificar que el horario existe
    await this.findOne(id);

    const { error } = await supabase.from('schedules').delete().eq('id', id);

    if (error) {
      throw new BadRequestException(`Error al eliminar horario: ${error.message}`);
    }

    return { message: 'Horario eliminado correctamente' };
  }
}

