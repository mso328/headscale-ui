# Sistema de Autenticación - Headscale UI

## Características

✅ **Seguridad completa:**
- Contraseñas encriptadas con bcrypt (hash + salt)
- Base de datos SQLite local
- Sesiones con JWT en cookies HttpOnly
- Protección de todas las rutas excepto login
- Cookies seguras con SameSite=strict

## Uso

### 1. Crear primer usuario administrador

Antes de iniciar la aplicación por primera vez, crea un usuario admin:

```bash
npm run create-admin
```

El script te pedirá:
- **Username** (mínimo 3 caracteres)
- **Password** (mínimo 8 caracteres)
- **Confirmar password**

Ejemplo:
```
=================================
  Headscale UI - Create Admin   
=================================

Create a new admin user:

Username: admin
Password: ********
Confirm password: ********

✅ User created successfully!
   Username: admin
   User ID: 1

🔐 You can now login with these credentials.
```

### 2. Iniciar la aplicación

```bash
npm run dev
```

O en producción:
```bash
npm run build
node build/index.js
```

### 3. Login

La aplicación te redirigirá automáticamente a `/login` si no estás autenticado.

Ingresa con las credenciales creadas anteriormente.

### 4. Logout

Haz clic en el botón "Logout" en la parte inferior de la barra lateral.

## Arquitectura

### Base de datos

La base de datos SQLite se crea automáticamente en `data/auth.db` con dos tablas:

**users**
- id (PRIMARY KEY)
- username (UNIQUE)
- password_hash (bcrypt)
- created_at
- last_login

**sessions**
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- token (JWT)
- expires_at
- created_at

### Flujo de autenticación

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ POST /api/auth/login
       │ {username, password}
       ↓
┌─────────────────┐
│  Auth Endpoint  │
└──────┬──────────┘
       │ Verify credentials
       │ bcrypt.compare()
       ↓
┌─────────────────┐
│    Database     │
└──────┬──────────┘
       │ Create JWT token
       │ Save session
       ↓
┌─────────────────┐
│  Set Cookie     │
│  HttpOnly       │
│  Secure         │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│  Redirect home  │
└─────────────────┘
```

### Protección de rutas

El archivo `hooks.server.js` verifica la autenticación en cada petición:

1. Lee el token de la cookie
2. Verifica el JWT
3. Comprueba que la sesión existe y no ha expirado
4. Si es válida, permite el acceso
5. Si no, redirige a `/login`

**Rutas públicas:**
- `/login`
- `/api/auth/login`

**Rutas protegidas:**
- Todo lo demás

## Seguridad

### Contraseñas

- Encriptadas con bcrypt (10 rounds)
- Nunca se almacenan en texto plano
- No se transmiten al cliente

### Tokens

- JWT firmado con clave secreta
- Almacenado en cookie HttpOnly (no accesible desde JavaScript)
- Expiración de 7 días
- Sesión verificada en cada request

### Cookies

```javascript
{
  httpOnly: true,        // No accesible desde JS
  secure: true,          // Solo HTTPS en producción
  sameSite: 'strict',    // Protección CSRF
  maxAge: 7 días
}
```

### Recomendaciones

1. **En producción**, define una clave JWT segura:
   ```bash
   export JWT_SECRET="tu-clave-secreta-muy-larga-y-aleatoria"
   ```

2. **Usa HTTPS** siempre en producción

3. **Backup de la base de datos**:
   ```bash
   cp data/auth.db data/auth.db.backup
   ```

4. **Permisos del archivo de base de datos**:
   ```bash
   chmod 600 data/auth.db
   ```

## Añadir más usuarios

Puedes ejecutar el script múltiples veces para crear más usuarios:

```bash
npm run create-admin
```

El script detectará que ya existen usuarios y te preguntará si quieres continuar.

## Cambiar contraseña

Actualmente debes hacerlo desde la base de datos. Puedes crear un endpoint o script adicional si lo necesitas.

## Docker

En el Dockerfile, el directorio `data/` debe ser persistente:

```dockerfile
VOLUME ["/app/data"]
```

O en docker-compose:

```yaml
volumes:
  - ./data:/app/data
```

## Troubleshooting

### No puedo hacer login

1. Verifica que el usuario existe:
   ```bash
   sqlite3 data/auth.db "SELECT * FROM users;"
   ```

2. Revisa los logs del servidor

3. Verifica que las cookies estén habilitadas en el navegador

### Error: "Username already exists"

El usuario ya fue creado. Intenta con otro nombre o elimina el usuario existente de la base de datos.

### Sesión expirada

Las sesiones duran 7 días. Después debes hacer login de nuevo. Las sesiones expiradas se limpian automáticamente cada hora.

### Base de datos bloqueada

Si obtienes errores de "database is locked", asegúrate de que solo una instancia de la aplicación esté corriendo.
