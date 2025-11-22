import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const supabase = this.supabaseService.getClient();

    // Verificar si el correo ya existe
    const { data: existingUser } = await supabase
      .from('usuario')
      .select('id')
      .eq('correo', registerDto.correo)
      .single();

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crear usuario
    const { data: user, error } = await supabase
      .from('usuario')
      .insert([
        {
          nombre: registerDto.nombre,
          correo: registerDto.correo,
          telefono: registerDto.telefono,
          password: hashedPassword,
        },
      ])
      .select('id, nombre, correo, telefono')
      .single();

    if (error) {
      throw new BadRequestException(`Error al registrar usuario: ${error.message}`);
    }

    // Generar token JWT
    const payload = { sub: user.id, correo: user.correo };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        telefono: user.telefono,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const supabase = this.supabaseService.getClient();

    // Buscar usuario por correo
    const { data: user, error } = await supabase
      .from('usuario')
      .select('id, nombre, correo, telefono, password')
      .eq('correo', loginDto.correo)
      .single();

    if (error || !user || !user.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const payload = { sub: user.id, correo: user.correo };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        telefono: user.telefono,
      },
    };
  }
}

