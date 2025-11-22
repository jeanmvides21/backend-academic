import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const supabase = this.supabaseService.getClient();

    // Verificar si el correo ya existe
    const { data: existingUser } = await supabase
      .from('usuario')
      .select('id')
      .eq('correo', createUsuarioDto.correo)
      .single();

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const { data, error } = await supabase
      .from('usuario')
      .insert([createUsuarioDto])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al crear usuario: ${error.message}`);
    }

    return data;
  }

  async findAll() {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw new BadRequestException(`Error al obtener usuarios: ${error.message}`);
    }

    return data;
  }

  async findOne(id: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return data;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const supabase = this.supabaseService.getClient();

    // Verificar si el usuario existe
    await this.findOne(id);

    // Si se actualiza el correo, verificar que no esté en uso
    if (updateUsuarioDto.correo) {
      const { data: existingUser } = await supabase
        .from('usuario')
        .select('id')
        .eq('correo', updateUsuarioDto.correo)
        .neq('id', id)
        .single();

      if (existingUser) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }
    }

    const { data, error } = await supabase
      .from('usuario')
      .update(updateUsuarioDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al actualizar usuario: ${error.message}`);
    }

    return data;
  }

  async remove(id: number) {
    const supabase = this.supabaseService.getClient();

    // Verificar si el usuario existe
    await this.findOne(id);

    // Verificar si tiene horarios asociados
    const { data: horarios } = await supabase
      .from('schedules')
      .select('id')
      .eq('id_usuario', id)
      .limit(1);

    if (horarios && horarios.length > 0) {
      throw new ConflictException(
        'No se puede eliminar el usuario porque tiene horarios asociados',
      );
    }

    const { error } = await supabase.from('usuario').delete().eq('id', id);

    if (error) {
      throw new BadRequestException(`Error al eliminar usuario: ${error.message}`);
    }

    return { message: 'Usuario eliminado correctamente' };
  }
}

