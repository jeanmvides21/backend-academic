import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { MysqlService } from '../../mysql/mysql.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private mysqlService: MysqlService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    const user = await this.mysqlService.queryOne(
      'SELECT id, nombre, correo FROM usuario WHERE id = ?',
      [payload.sub],
    );

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return { userId: user.id, correo: user.correo, nombre: user.nombre };
  }
}

