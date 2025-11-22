import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { MysqlService } from '../mysql/mysql.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private mysqlService: MysqlService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    // Verificar si la cédula ya existe
    const existingCedula = await this.mysqlService.queryOne(
      'SELECT id FROM usuario WHERE cedula = ?',
      [createUsuarioDto.cedula],
    );

    if (existingCedula) {
      throw new ConflictException('Ya existe un estudiante con esa cédula');
    }

    // Verificar si el correo ya existe
    const existingCorreo = await this.mysqlService.queryOne(
      'SELECT id FROM usuario WHERE correo = ?',
      [createUsuarioDto.correo],
    );

    if (existingCorreo) {
      throw new ConflictException('Ya existe un estudiante con ese correo electrónico');
    }

    const result = await this.mysqlService.execute(
      'INSERT INTO usuario (cedula, nombre, correo, telefono, rol, password) VALUES (?, ?, ?, ?, ?, ?)',
      [
        createUsuarioDto.cedula,
        createUsuarioDto.nombre,
        createUsuarioDto.correo,
        createUsuarioDto.telefono,
        createUsuarioDto.rol || 'estudiante',
        createUsuarioDto.password,
      ],
    );

    const newUsuario = await this.findOne((result as any).insertId);
    return newUsuario;
  }

  async findAll() {
    const usuarios = await this.mysqlService.query(
      'SELECT * FROM usuario ORDER BY id ASC',
    );
    return usuarios;
  }

  async findOne(id: number) {
    const usuario = await this.mysqlService.queryOne(
      'SELECT * FROM usuario WHERE id = ?',
      [id],
    );

    if (!usuario) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }

    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    // Verificar si el usuario existe
    await this.findOne(id);

    // Si se actualiza la cédula, verificar que no esté en uso
    if (updateUsuarioDto.cedula) {
      const existingCedula = await this.mysqlService.queryOne(
        'SELECT id FROM usuario WHERE cedula = ? AND id != ?',
        [updateUsuarioDto.cedula, id],
      );

      if (existingCedula) {
        throw new ConflictException('Ya existe un estudiante con esa cédula');
      }
    }

    // Si se actualiza el correo, verificar que no esté en uso
    if (updateUsuarioDto.correo) {
      const existingCorreo = await this.mysqlService.queryOne(
        'SELECT id FROM usuario WHERE correo = ? AND id != ?',
        [updateUsuarioDto.correo, id],
      );

      if (existingCorreo) {
        throw new ConflictException('Ya existe un estudiante con ese correo electrónico');
      }
    }

    // Construir query de actualización dinámicamente
    const fields: string[] = [];
    const values: any[] = [];

    if (updateUsuarioDto.cedula !== undefined) {
      fields.push('cedula = ?');
      values.push(updateUsuarioDto.cedula);
    }
    if (updateUsuarioDto.nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(updateUsuarioDto.nombre);
    }
    if (updateUsuarioDto.correo !== undefined) {
      fields.push('correo = ?');
      values.push(updateUsuarioDto.correo);
    }
    if (updateUsuarioDto.telefono !== undefined) {
      fields.push('telefono = ?');
      values.push(updateUsuarioDto.telefono);
    }
    if (updateUsuarioDto.rol !== undefined) {
      fields.push('rol = ?');
      values.push(updateUsuarioDto.rol);
    }
    if (updateUsuarioDto.password !== undefined) {
      fields.push('password = ?');
      values.push(updateUsuarioDto.password);
    }

    if (fields.length === 0) {
      return await this.findOne(id);
    }

    values.push(id);
    await this.mysqlService.execute(
      `UPDATE usuario SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );

    return await this.findOne(id);
  }

  async remove(id: number) {
    // Verificar si el usuario existe
    await this.findOne(id);

    // Verificar si tiene horarios asociados
    const horarios = await this.mysqlService.query(
      'SELECT id FROM schedules WHERE id_usuario = ? LIMIT 1',
      [id],
    );

    if (horarios && horarios.length > 0) {
      throw new ConflictException(
        'No se puede eliminar el estudiante porque tiene horarios asociados',
      );
    }

    await this.mysqlService.execute('DELETE FROM usuario WHERE id = ?', [id]);

    return { message: 'Estudiante eliminado correctamente' };
  }
}

