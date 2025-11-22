import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { MysqlService } from '../mysql/mysql.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private mysqlService: MysqlService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // Buscar usuario por correo y contraseña (sin encriptar por simplicidad)
    const user = await this.mysqlService.queryOne(
      'SELECT id, cedula, nombre, correo, telefono, rol, password FROM usuario WHERE correo = ?',
      [loginDto.correo],
    );

    if (!user) {
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
    const user = await this.mysqlService.queryOne(
      'SELECT id, cedula, nombre, correo, telefono, rol FROM usuario WHERE id = ?',
      [id],
    );

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }
}

