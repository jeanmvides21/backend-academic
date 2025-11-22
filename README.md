# Backend NestJS con Supabase

Backend desarrollado con NestJS y Supabase para la gestión de usuarios, asignaturas y horarios.

## Características

- ✅ CRUD completo de Usuarios
- ✅ CRUD completo de Asignaturas
- ✅ CRUD completo de Horarios
- ✅ Obtener horarios por usuario
- ✅ Manejo de errores global
- ✅ Autenticación JWT (opcional)
- ✅ Validación de datos con class-validator
- ✅ CORS habilitado

## Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Cuenta de Supabase

## Instalación

1. Clonar el repositorio o navegar al directorio del proyecto

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales de Supabase:
```
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_clave_anon_de_supabase
JWT_SECRET=tu_secret_key_para_jwt
JWT_EXPIRES_IN=24h
PORT=3000
```

## Configuración de la Base de Datos en Supabase

Ejecuta los siguientes scripts SQL en el SQL Editor de Supabase:

### 1. Tabla `usuario`
```sql
CREATE TABLE usuario (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Tabla `asignatura`
```sql
CREATE TABLE asignatura (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  maxClasesSemana INTEGER NOT NULL CHECK (maxClasesSemana >= 1 AND maxClasesSemana <= 10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Tabla `schedules`
```sql
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  dia VARCHAR(20) NOT NULL CHECK (dia IN ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO')),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  id_asignatura INTEGER NOT NULL REFERENCES asignatura(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_hora_fin_after_inicio CHECK (hora_fin > hora_inicio)
);
```

### 4. Índices para mejorar el rendimiento
```sql
CREATE INDEX idx_schedules_usuario ON schedules(id_usuario);
CREATE INDEX idx_schedules_asignatura ON schedules(id_asignatura);
CREATE INDEX idx_schedules_dia ON schedules(dia);
```

### 5. Habilitar Row Level Security (RLS) - Opcional
Si deseas usar RLS, puedes configurarlo según tus necesidades de seguridad.

## Ejecutar la Aplicación

### Modo desarrollo:
```bash
npm run start:dev
```

### Modo producción:
```bash
npm run build
npm run start:prod
```

La aplicación estará disponible en `http://localhost:3000/api`

## Endpoints de la API

### Autenticación (JWT - Opcional)

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### Usuarios

- `GET /api/usuarios` - Obtener todos los usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios` - Crear nuevo usuario
- `PATCH /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Asignaturas

- `GET /api/asignaturas` - Obtener todas las asignaturas
- `GET /api/asignaturas/:id` - Obtener asignatura por ID
- `POST /api/asignaturas` - Crear nueva asignatura
- `PATCH /api/asignaturas/:id` - Actualizar asignatura
- `DELETE /api/asignaturas/:id` - Eliminar asignatura

### Horarios

- `GET /api/horarios` - Obtener todos los horarios
- `GET /api/horarios/:id` - Obtener horario por ID
- `GET /api/horarios/usuario/:idUsuario` - Obtener horarios por usuario
- `POST /api/horarios` - Crear nuevo horario
- `PATCH /api/horarios/:id` - Actualizar horario
- `DELETE /api/horarios/:id` - Eliminar horario

## Ejemplos de Uso

### Crear un Usuario
```bash
POST /api/usuarios
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "telefono": "123456789"
}
```

### Crear una Asignatura
```bash
POST /api/asignaturas
Content-Type: application/json

{
  "nombre": "Matemáticas",
  "descripcion": "Curso de matemáticas básicas",
  "maxClasesSemana": 3
}
```

### Crear un Horario
```bash
POST /api/horarios
Content-Type: application/json

{
  "dia": "LUNES",
  "hora_inicio": "08:00",
  "hora_fin": "10:00",
  "id_usuario": 1,
  "id_asignatura": 1
}
```

### Obtener Horarios por Usuario
```bash
GET /api/horarios/usuario/1
```

## Validaciones Implementadas

- **Usuarios**: Validación de correo único, formato de email válido
- **Asignaturas**: Validación de nombre único, máximo de clases por semana (1-10)
- **Horarios**: 
  - Validación de rango de horas (hora_fin > hora_inicio)
  - Validación de máximo de clases por semana según la asignatura
  - Prevención de solapamiento de horarios para el mismo usuario en el mismo día
  - Validación de existencia de usuario y asignatura

## Manejo de Errores

El sistema incluye un filtro global de excepciones que captura y formatea todos los errores de manera consistente:

```json
{
  "statusCode": 404,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/usuarios/999",
  "message": "Usuario con ID 999 no encontrado"
}
```

## Autenticación JWT (Opcional)

Para proteger rutas con JWT, usa el guard `JwtAuthGuard`:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Get('protected')
getProtectedData() {
  return 'Esta ruta está protegida';
}
```

## Estructura del Proyecto

```
src/
├── app.module.ts
├── main.ts
├── auth/              # Módulo de autenticación JWT
├── usuarios/          # Módulo de usuarios
├── asignaturas/       # Módulo de asignaturas
├── horarios/          # Módulo de horarios
├── supabase/          # Configuración de Supabase
└── common/            # Utilidades comunes (filtros, interceptores, DTOs)
```

## Tecnologías Utilizadas

- **NestJS**: Framework de Node.js
- **Supabase**: Backend as a Service (BaaS)
- **TypeScript**: Lenguaje de programación
- **class-validator**: Validación de DTOs
- **Passport JWT**: Autenticación JWT
- **bcrypt**: Hash de contraseñas

## Licencia

MIT

