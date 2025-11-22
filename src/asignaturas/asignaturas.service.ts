import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { MysqlService } from '../mysql/mysql.service';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { UpdateAsignaturaDto } from './dto/update-asignatura.dto';

@Injectable()
export class AsignaturasService {
  constructor(private mysqlService: MysqlService) {}

  async create(createAsignaturaDto: CreateAsignaturaDto) {
    // Verificar si el nombre ya existe
    const existingAsignatura = await this.mysqlService.queryOne(
      'SELECT id FROM asignatura WHERE nombre = ?',
      [createAsignaturaDto.nombre],
    );

    if (existingAsignatura) {
      throw new ConflictException('Ya existe una asignatura con ese nombre');
    }

    const result = await this.mysqlService.execute(
      'INSERT INTO asignatura (nombre, descripcion, maxclasessemana) VALUES (?, ?, ?)',
      [
        createAsignaturaDto.nombre,
        createAsignaturaDto.descripcion || null,
        createAsignaturaDto.maxclasessemana || 1,
      ],
    );

    const newAsignatura = await this.findOne((result as any).insertId);
    return newAsignatura;
  }

  async findAll() {
    const asignaturas = await this.mysqlService.query(
      'SELECT * FROM asignatura ORDER BY id ASC',
    );
    return asignaturas;
  }

  async findOne(id: number) {
    const asignatura = await this.mysqlService.queryOne(
      'SELECT * FROM asignatura WHERE id = ?',
      [id],
    );

    if (!asignatura) {
      throw new NotFoundException(`Asignatura con ID ${id} no encontrada`);
    }

    return asignatura;
  }

  async update(id: number, updateAsignaturaDto: UpdateAsignaturaDto) {
    // Verificar si la asignatura existe
    await this.findOne(id);

    // Si se actualiza el nombre, verificar que no esté en uso
    if (updateAsignaturaDto.nombre) {
      const existingAsignatura = await this.mysqlService.queryOne(
        'SELECT id FROM asignatura WHERE nombre = ? AND id != ?',
        [updateAsignaturaDto.nombre, id],
      );

      if (existingAsignatura) {
        throw new ConflictException('Ya existe una asignatura con ese nombre');
      }
    }

    // Construir query de actualización dinámicamente
    const fields: string[] = [];
    const values: any[] = [];

    if (updateAsignaturaDto.nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(updateAsignaturaDto.nombre);
    }
    if (updateAsignaturaDto.descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(updateAsignaturaDto.descripcion);
    }
    if (updateAsignaturaDto.maxclasessemana !== undefined) {
      fields.push('maxclasessemana = ?');
      values.push(updateAsignaturaDto.maxclasessemana);
    }

    if (fields.length === 0) {
      return await this.findOne(id);
    }

    values.push(id);
    await this.mysqlService.execute(
      `UPDATE asignatura SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );

    return await this.findOne(id);
  }

  async remove(id: number) {
    // Verificar si la asignatura existe
    await this.findOne(id);

    // Verificar si tiene horarios asociados
    const horarios = await this.mysqlService.query(
      'SELECT id FROM schedules WHERE id_asignatura = ? LIMIT 1',
      [id],
    );

    if (horarios && horarios.length > 0) {
      throw new ConflictException(
        'No se puede eliminar la asignatura porque tiene horarios asociados',
      );
    }

    await this.mysqlService.execute('DELETE FROM asignatura WHERE id = ?', [id]);

    return { message: 'Asignatura eliminada correctamente' };
  }
}

