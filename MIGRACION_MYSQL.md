# Migración de PostgreSQL (Supabase) a MySQL (XAMPP)

## Cambios Realizados

### 1. Script SQL para MySQL
- **Archivo creado:** `database/database_setup_mysql.sql`
- **Cambios principales:**
  - `SERIAL` → `INT AUTO_INCREMENT`
  - `TIMESTAMP WITHOUT TIME ZONE` → `TIMESTAMP`
  - Eliminados triggers de PostgreSQL (MySQL actualiza `updated_at` automáticamente)
  - `TEXT` → `VARCHAR(20)` para el campo `dia` en schedules
  - Engine `InnoDB` y charset `utf8mb4_unicode_ci`

### 2. Servicio MySQL
- **Archivos creados:**
  - `src/mysql/mysql.service.ts` - Servicio para conexión y consultas MySQL
  - `src/mysql/mysql.module.ts` - Módulo global de MySQL
- **Funcionalidades:**
  - Pool de conexiones
  - Métodos `query()`, `queryOne()`, `execute()`
  - Manejo de errores

### 3. Servicios Actualizados

#### UsuariosService
- Reemplazado `SupabaseService` por `MysqlService`
- Consultas SQL directas en lugar de queries de Supabase
- Mantiene todas las validaciones

#### AsignaturasService
- Reemplazado `SupabaseService` por `MysqlService`
- Consultas SQL directas
- Mantiene todas las validaciones

#### HorariosService
- Reemplazado `SupabaseService` por `MysqlService`
- JOINs SQL para obtener relaciones (usuario, asignatura)
- Formateo de respuestas para mantener compatibilidad con el frontend
- Mantiene validación de solapamiento

#### AuthService
- Reemplazado `SupabaseService` por `MysqlService`
- Consultas SQL directas para login

#### JwtStrategy
- Actualizado para usar `MysqlService` (aunque JWT no está completamente implementado)

### 4. Módulos Actualizados
- `app.module.ts` - Reemplazado `SupabaseModule` por `MysqlModule`
- `auth.module.ts` - Eliminada dependencia de `SupabaseModule`
- Todos los módulos ahora usan `MysqlModule` (global)

### 5. Configuración
- `env.example` - Actualizado con variables de MySQL
- Variables requeridas:
  - `DB_HOST=localhost`
  - `DB_PORT=3306`
  - `DB_USER=root`
  - `DB_PASSWORD=` (vacío por defecto en XAMPP)
  - `DB_NAME=gestion_academica`

### 6. Dependencias
- **Instalado:** `mysql2` (driver MySQL para Node.js)
- **Eliminado:** Dependencia de `@supabase/supabase-js` (aunque el paquete sigue en package.json, ya no se usa)

## Archivos Modificados

1. `database/database_setup_mysql.sql` - **NUEVO**
2. `src/mysql/mysql.service.ts` - **NUEVO**
3. `src/mysql/mysql.module.ts` - **NUEVO**
4. `src/usuarios/usuarios.service.ts` - **MODIFICADO**
5. `src/asignaturas/asignaturas.service.ts` - **MODIFICADO**
6. `src/horarios/horarios.service.ts` - **MODIFICADO**
7. `src/auth/auth.service.ts` - **MODIFICADO**
8. `src/auth/strategies/jwt.strategy.ts` - **MODIFICADO**
9. `src/app.module.ts` - **MODIFICADO**
10. `src/auth/auth.module.ts` - **MODIFICADO**
11. `env.example` - **MODIFICADO**

## Archivos que NO se Eliminaron

Los siguientes archivos de Supabase se mantienen pero ya no se usan:
- `src/supabase/supabase.service.ts`
- `src/supabase/supabase.module.ts`

Puedes eliminarlos si lo deseas, pero no afectan el funcionamiento.

## Próximos Pasos

1. **Crear archivo .env:**
   ```bash
   cp env.example .env
   ```

2. **Configurar credenciales en .env:**
   - Ajusta `DB_PASSWORD` si tu MySQL tiene contraseña
   - Verifica que `DB_NAME=gestion_academica`

3. **Ejecutar el script SQL:**
   - Usa phpMyAdmin o línea de comandos
   - Ejecuta `database/database_setup_mysql.sql`

4. **Iniciar el servidor:**
   ```bash
   npm run start:dev
   ```

5. **Verificar la conexión:**
   - Deberías ver: "Conexión a MySQL establecida correctamente"

## Notas Importantes

- El formato de las respuestas se mantiene compatible con el frontend
- Todas las validaciones y reglas de negocio se mantienen
- La validación de solapamiento de horarios funciona igual
- Los endpoints REST no cambian, solo la base de datos subyacente

