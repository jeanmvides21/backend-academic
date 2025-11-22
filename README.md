# Backend - Sistema de Gestión Académica

API REST desarrollada con NestJS para la gestión de horarios académicos.

## Requisitos Previos

Se requiere tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** (viene incluido con Node.js)
- **XAMPP** (para MySQL)
- **MySQL** (incluido en XAMPP)

## Instalación

1. Abrir una terminal en la carpeta `backend-academic`

2. Instalar las dependencias del proyecto:
```bash
npm install
```

Este comando descargará e instalará todas las librerías necesarias (NestJS, MySQL, JWT, etc.)

## Configuración de la Base de Datos

1. Iniciar XAMPP y asegurarse de que MySQL esté corriendo

2. Abrir phpMyAdmin en el navegador: **http://localhost/phpmyadmin**

3. Crear una nueva base de datos llamada `gestion_academica`:


4. Ejecutar el script SQL:
   - Seleccionar la base de datos `gestion_academica`
   - Ir a la pestaña "Importar"
   - Hacer clic en "Elegir archivo" y seleccionar: `database/database_setup_mysql.sql`
   - Hacer clic en "Continuar"

   Esto creará las tablas y datos de prueba necesarios.

## Ejecución

Para iniciar el servidor en modo desarrollo:

```bash
npm run start:dev
```

El servidor estará disponible en: **http://localhost:3000**

**Nota:** El backend tiene habilitado CORS para permitir requests desde el frontend. Todas las rutas tienen el prefijo `/api`, por lo que los endpoints completos son: `http://localhost:3000/api/*`


## Credenciales de Acceso

### Administrador
- **Correo:** `admin@admin.com`
- **Contraseña:** `admin123`

### Estudiantes
Para los estudiantes, el correo es el mismo que está registrado en la base de datos y la contraseña es:
- **Contraseña:** `password123`

Ejemplos de estudiantes de prueba:
- `juan.perez@example.com` / `password123`
- `maria.lopez@example.com` / `password123`
- `carlos.martinez@example.com` / `password123`

## Verificar que Funciona

1. Abre Postman

2. Prueba el endpoint de login:
   - URL: `http://localhost:3000/auth/login`
   - Método: POST
   - Headers: `Content-Type: application/json`
   - Body (JSON):
   ```json
   {
     "correo": "admin@admin.com",
     "password": "admin123"
   }
   ```

3. Si se recibe una respuesta con `access_token`, el backend está funcionando correctamente.

## Compilación para Producción

Para generar los archivos compilados:

```bash
npm run build
```

Para ejecutar en producción:

```bash
npm run start:prod
```

## Estructura del Proyecto

```
backend-academic/
├── src/
│   ├── auth/              # Módulo de autenticación
│   ├── usuarios/          # Módulo de usuarios
│   ├── asignaturas/       # Módulo de asignaturas
│   ├── horarios/          # Módulo de horarios
│   ├── mysql/             # Servicio de base de datos
│   └── common/            # Utilidades compartidas
├── database/
│   └── database_setup_mysql.sql  # Script de base de datos
├── package.json
└── README.md
```

## Endpoints Principales

### Autenticación
- `POST /auth/login` - Iniciar sesión

### Usuarios
- `GET /usuarios` - Listar usuarios
- `GET /usuarios/:id` - Obtener usuario por ID
- `POST /usuarios` - Crear usuario
- `PATCH /usuarios/:id` - Actualizar usuario
- `DELETE /usuarios/:id` - Eliminar usuario

### Asignaturas
- `GET /asignaturas` - Listar asignaturas
- `GET /asignaturas/:id` - Obtener asignatura por ID
- `POST /asignaturas` - Crear asignatura
- `PATCH /asignaturas/:id` - Actualizar asignatura
- `DELETE /asignaturas/:id` - Eliminar asignatura

### Horarios
- `GET /horarios` - Listar horarios
- `GET /horarios/:id` - Obtener horario por ID
- `GET /horarios/usuario/:idUsuario` - Horarios por usuario
- `POST /horarios` - Crear horario
- `PATCH /horarios/:id` - Actualizar horario
- `DELETE /horarios/:id` - Eliminar horario

**Nota:** Todos los endpoints excepto `/auth/login` requieren autenticación JWT. Incluye el token en el header: `Authorization: Bearer <token>`

## Tecnologías Utilizadas

### Framework y Lenguaje
- **NestJS 10.3.0** - Framework Node.js progresivo basado en TypeScript
- **TypeScript 5.3.3** - Superset de JavaScript con tipado estático

### Base de Datos
- **MySQL 8.0+** - Sistema de gestión de bases de datos relacional
- **mysql2 3.15.3** - Driver MySQL para Node.js con soporte async/await

### Autenticación y Seguridad
- **@nestjs/jwt 10.2.0** - Integración JWT para autenticación
- **@nestjs/passport 10.0.3** - Estrategias de autenticación
- **passport-jwt 4.0.1** - Estrategia JWT para Passport
- **bcrypt 5.1.1** - Hashing de contraseñas

### Validación
- **class-validator 0.14.0** - Validación basada en decoradores
- **class-transformer 0.5.1** - Transformación de objetos

### Utilidades
- **@nestjs/config 3.1.1** - Gestión de configuración y variables de entorno
- **rxjs 7.8.1** - Programación reactiva

## Datos Importantes

### Configuración de Base de Datos

El servicio MySQL (`src/mysql/mysql.service.ts`) utiliza valores por defecto si no se configuran variables de entorno:

- **Host:** `localhost` (por defecto)
- **Puerto:** `3306` (por defecto)
- **Usuario:** `root` (por defecto)
- **Contraseña:** vacía (por defecto)
- **Base de datos:** `gestion_academica` (por defecto)


### Reglas de Negocio

1. **Validación de Solapamiento de Horarios:**
   - No se pueden crear horarios que se solapen para el mismo estudiante
   - El sistema valida automáticamente antes de crear o actualizar un horario

2. **Máximo de Clases por Semana:**
   - Cada asignatura tiene un límite de clases por semana
   - El sistema valida que no se exceda este límite

3. **Validaciones de Datos:**
   - Cédula única por usuario
   - Correo único por usuario
   - Nombre de asignatura único

### Estructura de Base de Datos

- **Tabla `usuario`:** Almacena estudiantes y administradores
- **Tabla `asignatura`:** Almacena las asignaturas disponibles
- **Tabla `schedules`:** Almacena los horarios con relaciones a usuario y asignatura

### Autenticación

- Se utiliza JWT (JSON Web Tokens) para autenticación
- El token se genera al hacer login y debe incluirse en todas las peticiones protegidas
- El token expira después de 24 horas (configurable)

### CORS

- CORS está habilitado globalmente en `main.ts` para permitir requests desde cualquier origen

### Prefijo de Rutas

- Todas las rutas tienen el prefijo `/api` configurado globalmente
- Ejemplo: `/auth/login` se accede como `/api/auth/login`


