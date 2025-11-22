# Backend - Sistema de Gestión Académica

API REST desarrollada con NestJS para la gestión de horarios académicos.

## Tecnologías

- NestJS 10.x
- TypeScript 5.x
- Supabase (PostgreSQL)
- class-validator
- class-transformer

## Estructura del Proyecto

```
src/
├── auth/                      # Autenticación
│   ├── dto/                   # Data Transfer Objects
│   ├── auth.controller.ts     # Controlador de autenticación
│   ├── auth.service.ts        # Lógica de negocio
│   └── auth.module.ts         # Módulo de autenticación
│
├── usuarios/                  # Gestión de estudiantes
│   ├── dto/
│   ├── usuarios.controller.ts
│   ├── usuarios.service.ts
│   └── usuarios.module.ts
│
├── asignaturas/              # Gestión de asignaturas
│   ├── dto/
│   ├── asignaturas.controller.ts
│   ├── asignaturas.service.ts
│   └── asignaturas.module.ts
│
├── horarios/                 # Gestión de horarios
│   ├── dto/
│   ├── horarios.controller.ts
│   ├── horarios.service.ts
│   └── horarios.module.ts
│
├── supabase/                 # Cliente Supabase
│   ├── supabase.service.ts
│   └── supabase.module.ts
│
├── common/                   # Utilidades comunes
│   ├── filters/              # Filtros de excepciones
│   └── interceptors/         # Interceptores HTTP
│
├── app.module.ts             # Módulo principal
└── main.ts                   # Punto de entrada
```

## Configuración

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration (Credenciales de prueba)
SUPABASE_URL=https://zzonvngelvlczxxrfpjg.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6b252bmdlbHZsY3p4eHJmcGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDgxMzksImV4cCI6MjA3OTMyNDEzOX0.exRbczJiJfRTOccH2_oVnKgqJmpwCds2n2QIcM83imc

# Server Configuration
PORT=3000
NODE_ENV=development


### Instalación

```bash
npm install
```

### Ejecución

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start
```

## Endpoints de la API

### Autenticación
```
POST   /api/auth/login
Body: { correo: string, password: string }
Response: { id, cedula, nombre, correo, telefono, rol }
```

### Usuarios (Estudiantes)
```
GET    /api/usuarios
GET    /api/usuarios/:id
POST   /api/usuarios
Body: { cedula, nombre, correo, telefono, rol, password }
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id
```

### Asignaturas
```
GET    /api/asignaturas
GET    /api/asignaturas/:id
POST   /api/asignaturas
Body: { nombre, descripcion, maxclasessemana }
PUT    /api/asignaturas/:id
DELETE /api/asignaturas/:id
```

### Horarios
```
GET    /api/horarios
GET    /api/horarios/:id
POST   /api/horarios
Body: { dia, hora_inicio, hora_fin, id_usuario, id_asignatura }
PUT    /api/horarios/:id
DELETE /api/horarios/:id
```

## Validaciones

### CreateUsuarioDto
- cedula: string (5-20 caracteres)
- nombre: string (2-100 caracteres)
- correo: email válido
- telefono: string (7-20 caracteres)
- rol: 'admin' | 'estudiante'
- password: string (6-50 caracteres)

### CreateAsignaturaDto
- nombre: string (2-100 caracteres)
- descripcion: string opcional (máx 500 caracteres)
- maxclasessemana: número entre 1 y 10

### CreateHorarioDto
- dia: enum válido (Lunes-Domingo)
- hora_inicio: formato HH:mm
- hora_fin: formato HH:mm
- id_usuario: número positivo
- id_asignatura: número positivo

## Reglas de Negocio

### Horarios
1. No puede haber solapamiento de horarios para el mismo estudiante
2. No se puede exceder el límite de clases por semana de una asignatura
3. La hora de fin debe ser posterior a la hora de inicio
4. Las horas deben estar entre 06:00 y 22:00

### Usuarios
1. La cédula debe ser única
2. El correo debe ser único
3. La contraseña no se encripta (para simplicidad académica)

## Estructura de Base de Datos

Ver archivo `database/database_setup.sql` para la estructura completa.

## Manejo de Errores

La API utiliza códigos HTTP estándar:

- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 409: Conflict

Formato de respuesta de error:
```json
{
  "statusCode": 400,
  "message": "Mensaje de error descriptivo",
  "error": "Bad Request"
}
```

## Interceptores

### TransformInterceptor
Envuelve todas las respuestas exitosas:
```json
{
  "data": { ... },
  "success": true
}
```

## Pruebas

```bash
# Pruebas unitarias
npm run test

# Pruebas e2e
npm run test:e2e

# Cobertura
npm run test:cov
```
