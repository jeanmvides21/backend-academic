export class LoginResponseDto {
  id: number;
  cedula: string;
  nombre: string;
  correo: string;
  telefono: string;
  rol: 'admin' | 'estudiante';
  token?: string; // Para futuras implementaciones con JWT
}

