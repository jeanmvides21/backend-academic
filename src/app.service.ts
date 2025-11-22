import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Backend API - Gestión de Usuarios, Asignaturas y Horarios';
  }
}

