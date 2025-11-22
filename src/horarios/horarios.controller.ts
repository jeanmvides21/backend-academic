import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';

@Controller('horarios')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createHorarioDto: CreateHorarioDto) {
    return this.horariosService.create(createHorarioDto);
  }

  @Get()
  findAll() {
    return this.horariosService.findAll();
  }

  @Get('usuario/:idUsuario')
  findByUsuario(@Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.horariosService.findByUsuario(idUsuario);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.horariosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHorarioDto: UpdateHorarioDto,
  ) {
    return this.horariosService.update(id, updateHorarioDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.horariosService.remove(id);
  }
}

