# Guía de Instalación Rápida

## Paso 1: Instalar Dependencias

```bash
npm install
```

## Paso 2: Configurar Variables de Entorno

1. Copia el archivo `env.example` a `.env`:
```bash
cp env.example .env
```

2. Edita el archivo `.env` con tus credenciales de Supabase:
   - Obtén tu `SUPABASE_URL` y `SUPABASE_KEY` desde el dashboard de Supabase
   - Configura un `JWT_SECRET` seguro para producción

## Paso 3: Configurar Base de Datos en Supabase

1. Ve a tu proyecto en Supabase
2. Abre el SQL Editor
3. Ejecuta el script SQL que está en `database/schema.sql`

Este script creará:
- Tabla `usuario`
- Tabla `asignatura`
- Tabla `schedules`
- Índices para optimización
- Triggers para actualizar `updated_at` automáticamente

## Paso 4: Ejecutar la Aplicación

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

## Verificar que Funciona

Puedes probar el endpoint raíz:
```bash
curl http://localhost:3000/api
```

Deberías recibir: `Backend API - Gestión de Usuarios, Asignaturas y Horarios`

## Próximos Pasos

Consulta el archivo `README.md` para ver todos los endpoints disponibles y ejemplos de uso.

