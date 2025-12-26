# Headscale UI - Backend Proxy Configuration

## Cambios realizados

Se ha modificado la aplicación para que todas las llamadas API se ejecuten desde el backend (servidor Node.js) en lugar del navegador. Esto permite acceder a URLs internas de Docker que no son accesibles desde el navegador del cliente.

## Arquitectura

**Antes:**
```
Navegador → Headscale API (IP interna Docker) ❌
```

**Ahora:**
```
Navegador (con URL/API Key) → Node.js Server (Proxy) → Headscale API (IP interna Docker) ✅
```

## Características

- ✅ **Configuración desde la UI**: La URL de Headscale y API Key se configuran desde la interfaz web (igual que antes)
- ✅ **Proxy en el backend**: Las peticiones se hacen desde el servidor Node.js, no desde el navegador
- ✅ **Acceso a IPs internas**: El servidor puede acceder a contenedores Docker internos
- ✅ **Sin variables de entorno**: No necesitas configurar archivos `.env`

## Configuración

### 1. Configuración en la UI

La configuración se realiza igual que antes, desde la interfaz web en la sección Settings:

1. **Headscale URL**: La URL interna de Docker (ej: `http://headscale:8080`)
2. **API Key**: Tu API key de Headscale

Estos valores se guardan en `localStorage` y se envían al proxy del servidor con cada petición.

### 2. Docker Compose

Ejemplo de `docker-compose.yml`:

```yaml
version: '3.8'

services:
  headscale:
    image: headscale/headscale:latest
    container_name: headscale
    networks:
      - headscale-net
    # ... resto de configuración de headscale

  headscale-ui:
    build:
      context: .
      dockerfile: docker/production/dockerfile.node
    container_name: headscale-ui
    ports:
      - "3000:3000"
    networks:
      - headscale-net
    depends_on:
      - headscale
    restart: unless-stopped

networks:
  headscale-net:
    driver: bridge
```

**Nota**: No necesitas pasar variables de entorno. La configuración se hace desde la UI web.

### 3. Desarrollo Local

Para desarrollo:

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:8080`

Luego configura la URL de Headscale y API Key desde la interfaz web en Settings.

### 4. Producción

```bash
# Build
npm run build

# Iniciar en producción (requiere adapter-node)
node build/index.js
```

O usando Docker:

```bash
docker build -f docker/production/dockerfile.node -t headscale-ui .
docker run -p 3000:3000 headscale-ui
```

Luego accede a `http://localhost:3000` y configura desde Settings.

## Cambios Técnicos

### 1. Adapter de SvelteKit
- Cambiado de `@sveltejs/adapter-static` a `@sveltejs/adapter-node`
- Esto habilita SSR (Server-Side Rendering) y API routes

### 2. API Proxy
- Nueva ruta: `/api/proxy/+server.js`
- Acepta parámetro `endpoint` en query string
- Soporta métodos: GET, POST, DELETE
- Recibe URL y API Key desde headers del cliente (`X-Headscale-Url` y `X-Headscale-Api-Key`)

### 3. Cliente API
- `apiFunctions.svelte` modificado para usar el proxy
- Sigue usando `localStorage` para URL y API Key (configuración desde la UI)
- Envía credenciales al proxy en cada petición
- Todas las llamadas van a `/api/proxy?endpoint=...`

## Seguridad

✅ **Ventajas:**
- El navegador puede acceder a IPs internas de Docker a través del proxy
- Comunicación directa dentro de la red Docker
- Configuración dinámica sin recompilar

⚠️ **Consideraciones:**
- La API Key viaja desde el navegador al proxy (considera HTTPS)
- Si expones a internet, añade autenticación/autorización adicional
- El proxy tiene acceso a la red interna de Docker

## Troubleshooting

### Error: "Headscale URL and API Key are required"
- Verifica que hayas configurado la URL y API Key desde Settings en la UI
- Comprueba la consola del navegador para ver si localStorage tiene los valores

### Error: "Failed to fetch from Headscale"
- Verifica que el contenedor pueda alcanzar Headscale en la red Docker
- Comprueba que la URL sea correcta: `http://nombre-contenedor:puerto`
- Verifica que el API Key sea válido

### La UI carga pero no muestra datos
- Abre la consola del navegador para ver errores
- Verifica los logs del servidor: `docker logs headscale-ui`
- Comprueba que el servidor Node.js esté corriendo

## Migración desde versión anterior

Si tenías la versión estática anterior:

1. **Construye de nuevo:**
   ```bash
   npm install
   npm run build
   ```

2. **Actualiza tu Docker Compose:**
   - Usa el nuevo `dockerfile.node`
   - Cambia el puerto expuesto de 443/8443 a 3000
   - **No necesitas** variables de entorno (la configuración sigue siendo desde la UI)

3. **La configuración en la UI permanece igual:**
   - Sigue configurando URL y API Key desde Settings
   - Usa la IP interna de Docker (ej: `http://headscale:8080`)
