import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { UpdateAsignaturaDto } from './dto/update-asignatura.dto';

@Injectable()
export class AsignaturasService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createAsignaturaDto: CreateAsignaturaDto) {
    const supabase = this.supabaseService.getClient();

    // Verificar si el nombre ya existe
    const { data: existingAsignatura } = await supabase
      .from('asignatura')
      .select('id')
      .eq('nombre', createAsignaturaDto.nombre)
      .single();

    if (existingAsignatura) {
      throw new ConflictException('Ya existe una asignatura con ese nombre');
    }

    const { data, error } = await supabase
      .from('asignatura')
      .insert([createAsignaturaDto])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al crear asignatura: ${error.message}`);
    }

    return data;
  }

  async findAll() {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('asignatura')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw new BadRequestException(`Error al obtener asignaturas: ${error.message}`);
    }

    return data;
  }

  async findOne(id: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('asignatura')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Asignatura con ID ${id} no encontrada`);
    }

    return data;
  }

  async update(id: number, updateAsignaturaDto: UpdateAsignaturaDto) {
    const supabase = this.supabaseService.getClient();

    // Verificar si la asignatura existe
    await this.findOne(id);

    // Si se actualiza el nombre, verificar que no esté en uso
    if (updateAsignaturaDto.nombre) {
      const { data: existingAsignatura } = await supabase
        .from('asignatura')
        .select('id')
        .eq('nombre', updateAsignaturaDto.nombre)
        .neq('id', id)
        .single();

      if (existingAsignatura) {
        throw new ConflictException('Ya existe una asignatura con ese nombre');
      }
    }

    const { data, error } = await supabase
      .from('asignatura')
      .update(updateAsignaturaDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al actualizar asignatura: ${error.message}`);
    }

    return data;
  }

  async remove(id: number) {
    const supabase = this.supabaseService.getClient();

    // Verificar si la asignatura existe
    await this.findOne(id);

    // Verificar si tiene horarios asociados
    const { data: horarios } = await supabase
      .from('schedules')
      .select('id')
      .eq('id_asignatura', id)
      .limit(1);

    if (horarios && horarios.length > 0) {
      throw new ConflictException(
        'No se puede eliminar la asignatura porque tiene horarios asociados',
      );
    }

    const { error } = await supabase.from('asignatura').delete().eq('id', id);

    if (error) {
      throw new BadRequestException(`Error al eliminar asignatura: ${error.message}`);
    }

    return { message: 'Asignatura eliminada correctamente' };
  }
}

