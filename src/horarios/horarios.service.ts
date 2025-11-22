import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { MysqlService } from '../mysql/mysql.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AsignaturasService } from '../asignaturas/asignaturas.service';

@Injectable()
export class HorariosService {
  constructor(
    private mysqlService: MysqlService,
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

    // Contar horarios de esta asignatura para este usuario en la semana
    let query = 'SELECT COUNT(*) as count FROM schedules WHERE id_asignatura = ? AND id_usuario = ?';
    const params: any[] = [idAsignatura, idUsuario];

    if (excludeHorarioId) {
      query += ' AND id != ?';
      params.push(excludeHorarioId);
    }

    const result = await this.mysqlService.queryOne(query, params);
    const totalHorarios = result?.count || 0;

    // Si estamos creando un nuevo horario (no excluyendo ninguno), sumar 1
    const totalConNuevo = excludeHorarioId ? totalHorarios : totalHorarios + 1;

    if (totalConNuevo > asignatura.maxclasessemana) {
      throw new ConflictException(
        `La asignatura "${asignatura.nombre}" solo permite ${asignatura.maxclasessemana} clase(s) por semana. Ya tiene ${totalHorarios} horario(s) asignado(s).`,
      );
    }
  }

  async create(createHorarioDto: CreateHorarioDto) {
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
    const horariosMismoDia = await this.mysqlService.query(
      `SELECT s.*, a.nombre as asignatura_nombre 
       FROM schedules s 
       LEFT JOIN asignatura a ON s.id_asignatura = a.id 
       WHERE s.id_usuario = ? AND s.dia = ?`,
      [createHorarioDto.id_usuario, createHorarioDto.dia],
    );

    if (horariosMismoDia && horariosMismoDia.length > 0) {
      const tieneSolapamiento = horariosMismoDia.some((horario: any) =>
        this.checkTimeOverlap(
          createHorarioDto.hora_inicio,
          createHorarioDto.hora_fin,
          horario.hora_inicio,
          horario.hora_fin,
        ),
      );

      if (tieneSolapamiento) {
        const horarioConflicto = horariosMismoDia.find((horario: any) =>
          this.checkTimeOverlap(
            createHorarioDto.hora_inicio,
            createHorarioDto.hora_fin,
            horario.hora_inicio,
            horario.hora_fin,
          ),
        );
        
        const horaInicioStr = horarioConflicto?.hora_inicio?.substring(0, 5) || '';
        const horaFinStr = horarioConflicto?.hora_fin?.substring(0, 5) || '';
        
        throw new ConflictException(
          `El horario se cruza con ${horarioConflicto?.asignatura_nombre || 'otra asignatura'} (${horaInicioStr} - ${horaFinStr})`,
        );
      }
    }

    // Normalizar formato de hora para MySQL (HH:MM:SS)
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

    const horaInicioNormalizada = normalizarHora(createHorarioDto.hora_inicio);
    const horaFinNormalizada = normalizarHora(createHorarioDto.hora_fin);

    const result = await this.mysqlService.execute(
      'INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES (?, ?, ?, ?, ?)',
      [
        createHorarioDto.dia,
        horaInicioNormalizada,
        horaFinNormalizada,
        createHorarioDto.id_usuario,
        createHorarioDto.id_asignatura,
      ],
    );

    const newHorario = await this.findOne((result as any).insertId);
    return newHorario;
  }

  async findAll() {
    const horarios = await this.mysqlService.query(
      `SELECT s.*, 
              u.id as usuario_id, u.cedula as usuario_cedula, u.nombre as usuario_nombre, 
              u.correo as usuario_correo, u.telefono as usuario_telefono, u.rol as usuario_rol,
              a.id as asignatura_id, a.nombre as asignatura_nombre, a.descripcion as asignatura_descripcion, 
              a.maxclasessemana as asignatura_maxclasessemana
       FROM schedules s
       LEFT JOIN usuario u ON s.id_usuario = u.id
       LEFT JOIN asignatura a ON s.id_asignatura = a.id
       ORDER BY s.dia ASC, s.hora_inicio ASC`,
    );

    // Formatear la respuesta para que coincida con el formato anterior
    return horarios.map((h: any) => ({
      id: h.id,
      dia: h.dia,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      id_usuario: h.id_usuario,
      id_asignatura: h.id_asignatura,
      created_at: h.created_at,
      updated_at: h.updated_at,
      usuario: h.usuario_id ? {
        id: h.usuario_id,
        cedula: h.usuario_cedula,
        nombre: h.usuario_nombre,
        correo: h.usuario_correo,
        telefono: h.usuario_telefono,
        rol: h.usuario_rol,
      } : null,
      asignatura: h.asignatura_id ? {
        id: h.asignatura_id,
        nombre: h.asignatura_nombre,
        descripcion: h.asignatura_descripcion,
        maxclasessemana: h.asignatura_maxclasessemana,
      } : null,
    }));
  }

  async findOne(id: number) {
    const horario = await this.mysqlService.queryOne(
      `SELECT s.*, 
              u.id as usuario_id, u.cedula as usuario_cedula, u.nombre as usuario_nombre, 
              u.correo as usuario_correo, u.telefono as usuario_telefono, u.rol as usuario_rol,
              a.id as asignatura_id, a.nombre as asignatura_nombre, a.descripcion as asignatura_descripcion, 
              a.maxclasessemana as asignatura_maxclasessemana
       FROM schedules s
       LEFT JOIN usuario u ON s.id_usuario = u.id
       LEFT JOIN asignatura a ON s.id_asignatura = a.id
       WHERE s.id = ?`,
      [id],
    );

    if (!horario) {
      throw new NotFoundException(`Horario con ID ${id} no encontrado`);
    }

    // Formatear la respuesta
    return {
      id: horario.id,
      dia: horario.dia,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      id_usuario: horario.id_usuario,
      id_asignatura: horario.id_asignatura,
      created_at: horario.created_at,
      updated_at: horario.updated_at,
      usuario: horario.usuario_id ? {
        id: horario.usuario_id,
        cedula: horario.usuario_cedula,
        nombre: horario.usuario_nombre,
        correo: horario.usuario_correo,
        telefono: horario.usuario_telefono,
        rol: horario.usuario_rol,
      } : null,
      asignatura: horario.asignatura_id ? {
        id: horario.asignatura_id,
        nombre: horario.asignatura_nombre,
        descripcion: horario.asignatura_descripcion,
        maxclasessemana: horario.asignatura_maxclasessemana,
      } : null,
    };
  }

  async findByUsuario(idUsuario: number) {
    // Verificar que el usuario existe
    await this.usuariosService.findOne(idUsuario);

    const horarios = await this.mysqlService.query(
      `SELECT s.*, 
              u.id as usuario_id, u.cedula as usuario_cedula, u.nombre as usuario_nombre, 
              u.correo as usuario_correo, u.telefono as usuario_telefono, u.rol as usuario_rol,
              a.id as asignatura_id, a.nombre as asignatura_nombre, a.descripcion as asignatura_descripcion, 
              a.maxclasessemana as asignatura_maxclasessemana
       FROM schedules s
       LEFT JOIN usuario u ON s.id_usuario = u.id
       LEFT JOIN asignatura a ON s.id_asignatura = a.id
       WHERE s.id_usuario = ?
       ORDER BY s.dia ASC, s.hora_inicio ASC`,
      [idUsuario],
    );

    // Formatear la respuesta
    return horarios.map((h: any) => ({
      id: h.id,
      dia: h.dia,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      id_usuario: h.id_usuario,
      id_asignatura: h.id_asignatura,
      created_at: h.created_at,
      updated_at: h.updated_at,
      usuario: h.usuario_id ? {
        id: h.usuario_id,
        cedula: h.usuario_cedula,
        nombre: h.usuario_nombre,
        correo: h.usuario_correo,
        telefono: h.usuario_telefono,
        rol: h.usuario_rol,
      } : null,
      asignatura: h.asignatura_id ? {
        id: h.asignatura_id,
        nombre: h.asignatura_nombre,
        descripcion: h.asignatura_descripcion,
        maxclasessemana: h.asignatura_maxclasessemana,
      } : null,
    }));
  }

  async update(id: number, updateHorarioDto: UpdateHorarioDto) {
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
      const horariosMismoDia = await this.mysqlService.query(
        `SELECT s.*, a.nombre as asignatura_nombre 
         FROM schedules s 
         LEFT JOIN asignatura a ON s.id_asignatura = a.id 
         WHERE s.id_usuario = ? AND s.dia = ? AND s.id != ?`,
        [idUsuario, dia, id],
      );

      if (horariosMismoDia && horariosMismoDia.length > 0) {
        const tieneSolapamiento = horariosMismoDia.some((horario: any) =>
          this.checkTimeOverlap(
            horaInicio,
            horaFin,
            horario.hora_inicio,
            horario.hora_fin,
          ),
        );

        if (tieneSolapamiento) {
          const horarioConflicto = horariosMismoDia.find((horario: any) =>
            this.checkTimeOverlap(
              horaInicio,
              horaFin,
              horario.hora_inicio,
              horario.hora_fin,
            ),
          );
          
          const horaInicioStr = horarioConflicto?.hora_inicio?.substring(0, 5) || '';
          const horaFinStr = horarioConflicto?.hora_fin?.substring(0, 5) || '';
          
          throw new ConflictException(
            `El horario se cruza con ${horarioConflicto?.asignatura_nombre || 'otra asignatura'} (${horaInicioStr} - ${horaFinStr})`,
          );
        }
      }
    }

    // Normalizar formato de hora para MySQL si se están actualizando
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

    // Construir query de actualización dinámicamente
    const fields: string[] = [];
    const values: any[] = [];

    if (updateHorarioDto.dia !== undefined) {
      fields.push('dia = ?');
      values.push(updateHorarioDto.dia);
    }
    if (updateHorarioDto.hora_inicio !== undefined) {
      const horaNormalizada = normalizarHora(updateHorarioDto.hora_inicio);
      const [horas, minutos] = horaNormalizada.split(':').map(Number);
      if (horas < 6 || horas > 22 || (horas === 22 && minutos > 0)) {
        throw new BadRequestException(
          `hora_inicio debe estar entre 06:00 y 22:00. Valor recibido: ${updateHorarioDto.hora_inicio}`
        );
      }
      fields.push('hora_inicio = ?');
      values.push(horaNormalizada);
    }
    if (updateHorarioDto.hora_fin !== undefined) {
      const horaNormalizada = normalizarHora(updateHorarioDto.hora_fin);
      const [horas, minutos] = horaNormalizada.split(':').map(Number);
      if (horas < 6 || horas > 22 || (horas === 22 && minutos > 0)) {
        throw new BadRequestException(
          `hora_fin debe estar entre 06:00 y 22:00. Valor recibido: ${updateHorarioDto.hora_fin}`
        );
      }
      fields.push('hora_fin = ?');
      values.push(horaNormalizada);
    }
    if (updateHorarioDto.id_usuario !== undefined) {
      fields.push('id_usuario = ?');
      values.push(updateHorarioDto.id_usuario);
    }
    if (updateHorarioDto.id_asignatura !== undefined) {
      fields.push('id_asignatura = ?');
      values.push(updateHorarioDto.id_asignatura);
    }

    if (fields.length > 0) {
      values.push(id);
      await this.mysqlService.execute(
        `UPDATE schedules SET ${fields.join(', ')} WHERE id = ?`,
        values,
      );
    }

    return await this.findOne(id);
  }

  async remove(id: number) {
    // Verificar que el horario existe
    await this.findOne(id);

    await this.mysqlService.execute('DELETE FROM schedules WHERE id = ?', [id]);

    return { message: 'Horario eliminado correctamente' };
  }
}

