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
      .select('*')
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
        throw new ConflictException(
          'El horario se solapa con otro horario existente para este usuario en el mismo día',
        );
      }
    }

    const { data, error } = await supabase
      .from('schedules')
      .insert([createHorarioDto])
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
        .select('*')
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
          throw new ConflictException(
            'El horario se solapa con otro horario existente para este usuario en el mismo día',
          );
        }
      }
    }

    const { data, error } = await supabase
      .from('schedules')
      .update(updateHorarioDto)
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

