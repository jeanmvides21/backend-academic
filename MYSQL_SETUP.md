# Configuración de MySQL con XAMPP

## Pasos para Configurar la Base de Datos

### 1. Iniciar XAMPP

1. Abre el Panel de Control de XAMPP
2. Inicia el servicio **MySQL** (haz clic en "Start")
3. Verifica que MySQL esté corriendo en el puerto 3306

### 2. Crear la Base de Datos

Tienes dos opciones:

#### Opción A: Usando phpMyAdmin (Recomendado)

1. Abre tu navegador y ve a: `http://localhost/phpmyadmin`
2. Haz clic en "Nueva" (New) en el menú lateral
3. Nombre de la base de datos: `gestion_academica`
4. Intercalación: `utf8mb4_unicode_ci`
5. Haz clic en "Crear"
6. Selecciona la base de datos `gestion_academica`
7. Ve a la pestaña "SQL"
8. Copia y pega el contenido del archivo `database/database_setup_mysql.sql`
9. Haz clic en "Continuar" o presiona F5

#### Opción B: Usando la línea de comandos

```bash
# Conectarse a MySQL (sin contraseña por defecto en XAMPP)
mysql -u root -p

# O si no tiene contraseña:
mysql -u root

# Ejecutar el script
source C:/Users/ONEIDA MOLINARES/Desktop/app/backend-academic/database/database_setup_mysql.sql
```

### 3. Configurar Variables de Entorno

1. Copia el archivo `env.example` a `.env` en la raíz del backend:
   ```bash
   cp env.example .env
   ```

2. Edita el archivo `.env` con tus credenciales de MySQL:

```env
# MySQL Configuration (XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # Deja vacío si no tienes contraseña en XAMPP
DB_NAME=gestion_academica

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Verificar la Conexión

1. Inicia el servidor backend:
   ```bash
   npm run start:dev
   ```

2. Deberías ver en la consola:
   ```
   Conexión a MySQL establecida correctamente
   Application is running on: http://localhost:3000/api
   ```

### 5. Probar los Endpoints

Puedes probar el login con:
- Correo: `admin@admin.com`
- Contraseña: `admin123`

## Credenciales de Prueba

### Administrador
- Correo: `admin@admin.com`
- Contraseña: `admin123`

### Estudiantes
- Correo: `juan.perez@correo.com`
- Contraseña: `password123`

## Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"

Si tienes contraseña configurada en MySQL:
1. Edita el archivo `.env`
2. Agrega la contraseña en `DB_PASSWORD=tu_contraseña`

### Error: "Can't connect to MySQL server"

1. Verifica que MySQL esté corriendo en XAMPP
2. Verifica que el puerto sea 3306
3. Verifica que `DB_HOST=localhost` en el `.env`

### Error: "Unknown database 'gestion_academica'"

1. Asegúrate de haber ejecutado el script SQL
2. Verifica que el nombre de la base de datos coincida en el `.env`

## Notas Importantes

- El script SQL crea automáticamente la base de datos `gestion_academica`
- Las contraseñas están almacenadas sin encriptar (solo para propósitos académicos)
- El script incluye datos de prueba (usuarios, asignaturas y horarios)

