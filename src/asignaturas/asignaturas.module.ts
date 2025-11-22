import { Module } from '@nestjs/common';
import { AsignaturasService } from './asignaturas.service';
import { AsignaturasController } from './asignaturas.controller';

@Module({
  controllers: [AsignaturasController],
  providers: [AsignaturasService],
  exports: [AsignaturasService],
})
export class AsignaturasModule {}

