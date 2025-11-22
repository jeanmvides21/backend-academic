-- =====================================================
-- Sistema de Gestión Académica - Base de Datos
-- =====================================================
-- PostgreSQL 15+
-- Script completo para creación de tablas y datos de prueba
-- =====================================================

-- Eliminar tablas existentes (si existen)
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS asignatura CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;

-- Eliminar función si existe
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- FUNCIONES
-- =====================================================

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLA: usuario (estudiantes y administradores)
-- =====================================================

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'estudiante',
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_rol CHECK (rol IN ('admin', 'estudiante'))
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_usuario_cedula ON usuario(cedula);
CREATE INDEX idx_usuario_correo ON usuario(correo);
CREATE INDEX idx_usuario_rol ON usuario(rol);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_usuario_updated_at
    BEFORE UPDATE ON usuario
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios de tabla
COMMENT ON TABLE usuario IS 'Tabla de usuarios del sistema (estudiantes y administradores)';
COMMENT ON COLUMN usuario.cedula IS 'Cédula o identificación única del usuario';
COMMENT ON COLUMN usuario.rol IS 'Rol del usuario: admin o estudiante';
COMMENT ON COLUMN usuario.password IS 'Contraseña del usuario (sin encriptar para simplicidad académica)';

-- =====================================================
-- TABLA: asignatura
-- =====================================================

CREATE TABLE asignatura (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    maxclasessemana INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_maxclases CHECK (maxclasessemana >= 1 AND maxclasessemana <= 10)
);

-- Índices
CREATE INDEX idx_asignatura_nombre ON asignatura(nombre);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_asignatura_updated_at
    BEFORE UPDATE ON asignatura
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE asignatura IS 'Tabla de asignaturas del sistema académico';
COMMENT ON COLUMN asignatura.maxclasessemana IS 'Máximo de clases permitidas por semana para esta asignatura';

-- =====================================================
-- TABLA: schedules (horarios)
-- =====================================================

CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    dia TEXT NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    id_usuario INTEGER NOT NULL,
    id_asignatura INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    
    -- Foreign Keys
    CONSTRAINT fk_schedules_usuario 
        FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_schedules_asignatura 
        FOREIGN KEY (id_asignatura) 
        REFERENCES asignatura(id) 
        ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT check_dia CHECK (
        dia IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')
    ),
    CONSTRAINT check_hora_inicio CHECK (
        hora_inicio >= '06:00:00' AND hora_inicio <= '22:00:00'
    ),
    CONSTRAINT check_hora_fin CHECK (
        hora_fin >= '06:00:00' AND hora_fin <= '22:00:00'
    ),
    CONSTRAINT check_hora_valida CHECK (
        hora_fin > hora_inicio
    )
);

-- Índices para optimizar consultas
CREATE INDEX idx_schedules_usuario ON schedules(id_usuario);
CREATE INDEX idx_schedules_asignatura ON schedules(id_asignatura);
CREATE INDEX idx_schedules_dia ON schedules(dia);
CREATE INDEX idx_schedules_usuario_dia ON schedules(id_usuario, dia);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE schedules IS 'Tabla de horarios académicos';
COMMENT ON COLUMN schedules.dia IS 'Día de la semana del horario';
COMMENT ON COLUMN schedules.hora_inicio IS 'Hora de inicio de la clase';
COMMENT ON COLUMN schedules.hora_fin IS 'Hora de finalización de la clase';

-- =====================================================
-- DATOS DE PRUEBA
-- =====================================================

-- Insertar usuarios de prueba
INSERT INTO usuario (cedula, nombre, correo, telefono, rol, password) VALUES
-- Administrador
('ADMIN001', 'Administrador', 'admin@admin.com', '0000000000', 'admin', 'admin123'),

-- Estudiantes
('1001234567', 'Juan Pérez García', 'juan.perez@correo.com', '3001234567', 'estudiante', 'password123'),
('1002345678', 'María López Rodríguez', 'maria.lopez@correo.com', '3002345678', 'estudiante', 'password123'),
('1003456789', 'Carlos Martínez Silva', 'carlos.martinez@correo.com', '3003456789', 'estudiante', 'password123'),
('1004567890', 'Ana Gómez Torres', 'ana.gomez@correo.com', '3004567890', 'estudiante', 'password123'),
('1005678901', 'Luis Hernández Díaz', 'luis.hernandez@correo.com', '3005678901', 'estudiante', 'password123');

-- Insertar asignaturas de prueba
INSERT INTO asignatura (nombre, descripcion, maxclasessemana) VALUES
('Matemáticas', 'Curso de matemáticas básicas y avanzadas', 5),
('Física', 'Introducción a la física clásica y moderna', 4),
('Química', 'Fundamentos de química general', 3),
('Programación', 'Desarrollo de software con múltiples lenguajes', 5),
('Base de Datos', 'Diseño e implementación de bases de datos', 3),
('Inglés', 'Inglés conversacional y técnico', 2),
('Historia', 'Historia universal y latinoamericana', 2),
('Educación Física', 'Actividad física y deportes', 2);

-- Insertar horarios de prueba
-- Horarios para Juan Pérez (id_usuario: 2)
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
-- Lunes
('Lunes', '08:00:00', '10:00:00', 2, 1),     -- Matemáticas
('Lunes', '10:00:00', '12:00:00', 2, 2),     -- Física
('Lunes', '14:00:00', '16:00:00', 2, 4),     -- Programación

-- Martes
('Martes', '08:00:00', '10:00:00', 2, 3),    -- Química
('Martes', '10:00:00', '12:00:00', 2, 1),    -- Matemáticas
('Martes', '14:00:00', '16:00:00', 2, 5),    -- Base de Datos

-- Miércoles
('Miércoles', '08:00:00', '10:00:00', 2, 4), -- Programación
('Miércoles', '10:00:00', '12:00:00', 2, 2), -- Física
('Miércoles', '14:00:00', '16:00:00', 2, 6), -- Inglés

-- Jueves
('Jueves', '08:00:00', '10:00:00', 2, 1),    -- Matemáticas
('Jueves', '10:00:00', '12:00:00', 2, 3),    -- Química
('Jueves', '14:00:00', '16:00:00', 2, 4),    -- Programación

-- Viernes
('Viernes', '08:00:00', '10:00:00', 2, 5),   -- Base de Datos
('Viernes', '10:00:00', '12:00:00', 2, 1),   -- Matemáticas
('Viernes', '14:00:00', '16:00:00', 2, 8);   -- Educación Física

-- Horarios para María López (id_usuario: 3)
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('Lunes', '08:00:00', '10:00:00', 3, 2),     -- Física
('Lunes', '10:00:00', '12:00:00', 3, 1),     -- Matemáticas
('Martes', '08:00:00', '10:00:00', 3, 4),    -- Programación
('Martes', '14:00:00', '16:00:00', 3, 3),    -- Química
('Miércoles', '08:00:00', '10:00:00', 3, 5), -- Base de Datos
('Jueves', '10:00:00', '12:00:00', 3, 6),    -- Inglés
('Viernes', '08:00:00', '10:00:00', 3, 7);   -- Historia

-- Horarios para Carlos Martínez (id_usuario: 4)
INSERT INTO schedules (dia, hora_inicio, hora_fin, id_usuario, id_asignatura) VALUES
('Lunes', '14:00:00', '16:00:00', 4, 1),     -- Matemáticas
('Martes', '08:00:00', '10:00:00', 4, 2),    -- Física
('Miércoles', '10:00:00', '12:00:00', 4, 4), -- Programación
('Jueves', '14:00:00', '16:00:00', 4, 3),    -- Química
('Viernes', '08:00:00', '10:00:00', 4, 5);   -- Base de Datos

-- =====================================================
-- CONSULTAS DE VERIFICACIÓN
-- =====================================================

-- Verificar usuarios creados
-- SELECT id, cedula, nombre, correo, rol FROM usuario ORDER BY id;

-- Verificar asignaturas creadas
-- SELECT id, nombre, maxclasessemana FROM asignatura ORDER BY id;

-- Verificar horarios creados
-- SELECT s.id, u.nombre as estudiante, a.nombre as asignatura, s.dia, s.hora_inicio, s.hora_fin
-- FROM schedules s
-- JOIN usuario u ON s.id_usuario = u.id
-- JOIN asignatura a ON s.id_asignatura = a.id
-- ORDER BY u.nombre, s.dia;

-- Verificar horarios de un estudiante específico
-- SELECT s.dia, s.hora_inicio, s.hora_fin, a.nombre as asignatura
-- FROM schedules s
-- JOIN asignatura a ON s.id_asignatura = a.id
-- WHERE s.id_usuario = 2
-- ORDER BY 
--     CASE s.dia 
--         WHEN 'Lunes' THEN 1
--         WHEN 'Martes' THEN 2
--         WHEN 'Miércoles' THEN 3
--         WHEN 'Jueves' THEN 4
--         WHEN 'Viernes' THEN 5
--         WHEN 'Sábado' THEN 6
--         WHEN 'Domingo' THEN 7
--     END,
--     s.hora_inicio;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Contraseñas almacenadas sin encriptar (solo para propósitos académicos)
-- 2. Las horas están en formato 24 horas
-- 3. Los días de la semana están en español
-- 4. Se incluye validación de solapamiento en el backend
-- 5. Las relaciones entre tablas usan ON DELETE CASCADE

