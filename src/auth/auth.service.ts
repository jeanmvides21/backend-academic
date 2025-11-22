import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const supabase = this.supabaseService.getClient();

    // Buscar usuario por correo y contraseña (sin encriptar por simplicidad)
    const { data: user, error } = await supabase
      .from('usuario')
      .select('id, cedula, nombre, correo, telefono, rol, password')
      .eq('correo', loginDto.correo)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    // Verificar contraseña (comparación directa sin hash por simplicidad)
    if (user.password !== loginDto.password) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    // Retornar datos del usuario sin la contraseña
    const response = {
      id: user.id,
      cedula: user.cedula,
      nombre: user.nombre,
      correo: user.correo,
      telefono: user.telefono,
      rol: user.rol,
    };
    
    console.log('Login exitoso - Usuario:', user.nombre, '- Rol:', user.rol);
    
    return response;
  }

  async validateUser(id: number): Promise<LoginResponseDto> {
    const supabase = this.supabaseService.getClient();

    const { data: user, error } = await supabase
      .from('usuario')
      .select('id, cedula, nombre, correo, telefono, rol')
      .eq('id', id)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }
}

