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
import { AsignaturasService } from './asignaturas.service';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { UpdateAsignaturaDto } from './dto/update-asignatura.dto';

@Controller('asignaturas')
export class AsignaturasController {
  constructor(private readonly asignaturasService: AsignaturasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAsignaturaDto: CreateAsignaturaDto) {
    return this.asignaturasService.create(createAsignaturaDto);
  }

  @Get()
  findAll() {
    return this.asignaturasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asignaturasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsignaturaDto: UpdateAsignaturaDto,
  ) {
    return this.asignaturasService.update(id, updateAsignaturaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asignaturasService.remove(id);
  }
}

