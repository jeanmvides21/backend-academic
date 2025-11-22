import { Module } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { HorariosController } from './horarios.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AsignaturasModule } from '../asignaturas/asignaturas.module';

@Module({
  imports: [UsuariosModule, AsignaturasModule],
  controllers: [HorariosController],
  providers: [HorariosService],
})
export class HorariosModule {}

