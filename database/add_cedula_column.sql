-- Script SQL para agregar la columna cedula a la tabla usuario
-- Ejecutar este script en Supabase SQL Editor

-- 1. Agregar la columna cedula
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS cedula VARCHAR(20);

-- 2. Hacer la columna NOT NULL y UNIQUE (después de agregar valores)
-- Primero, actualizar registros existentes con valores temporales si es necesario
UPDATE usuario SET cedula = 'CED-' || id::text WHERE cedula IS NULL;

-- 3. Ahora agregar las restricciones
ALTER TABLE usuario ALTER COLUMN cedula SET NOT NULL;
ALTER TABLE usuario ADD CONSTRAINT unique_cedula UNIQUE (cedula);

-- 4. Crear un índice para búsquedas rápidas por cédula
CREATE INDEX IF NOT EXISTS idx_usuario_cedula ON usuario(cedula);

-- 5. Verificar los cambios
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'usuario'
ORDER BY ordinal_position;

