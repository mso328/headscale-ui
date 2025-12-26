# Headscale UI - Setup con Docker

## Inicio Rápido

### 1. Construir y ejecutar con Docker Compose

```bash
docker-compose -f docker-compose.example.yml up --build
```

### 2. Acceder a la UI

Abre tu navegador en `http://localhost:3000`

### 3. Configurar desde la UI

1. Ve a **Settings** en la interfaz web
2. Configura:
   - **Headscale URL**: `http://headscale:8080` (nombre del servicio en Docker)
   - **API Key**: Tu API key de Headscale

### 4. Generar API Key de Headscale

Si necesitas generar una API key:

```bash
docker exec headscale headscale apikeys create
```

## Arquitectura

```
┌──────────────┐         ┌────────────────┐         ┌─────────────┐
│   Navegador  │◄───────►│  Headscale UI  │◄───────►│  Headscale  │
│              │         │   (Node.js)    │         │   (API)     │
│ localhost:   │  HTTP   │   Container    │  HTTP   │  Container  │
│    3000      │         │                │         │ (interno)   │
└──────────────┘         └────────────────┘         └─────────────┘
                         Red Docker: headscale-net
```

**Cómo funciona:**
1. Configuras la URL y API Key desde la UI (se guarda en localStorage)
2. El navegador envía peticiones al servidor Node.js de la UI
3. El servidor Node.js actúa como proxy y hace las peticiones a Headscale
4. Headscale está en la misma red Docker, por lo que es accesible usando su nombre de servicio

## Build solo de la UI

Si solo quieres construir el contenedor de la UI:

```bash
docker build -f docker/production/dockerfile.node -t headscale-ui:latest .
```

Ejecutar:

```bash
docker run -d \
  --name headscale-ui \
  --network headscale-net \
  -p 3000:3000 \
  headscale-ui:latest
```

**Importante**: Asegúrate de que el contenedor esté en la misma red que Headscale para que pueda acceder a `http://headscale:8080`

## Troubleshooting

### No puedo conectar con Headscale

1. Verifica que ambos contenedores estén en la misma red:
   ```bash
   docker network inspect headscale-net
   ```

2. Prueba la conectividad desde el contenedor de la UI:
   ```bash
   docker exec headscale-ui wget -O- http://headscale:8080/health
   ```

3. Verifica los logs:
   ```bash
   docker logs headscale-ui
   docker logs headscale
   ```

### Error: "Failed to fetch from Headscale"

- Comprueba que la URL en Settings sea correcta: `http://headscale:8080`
- Verifica que el API Key sea válido
- Revisa que Headscale esté corriendo: `docker ps`

### Puerto 3000 ya en uso

Cambia el puerto en el docker-compose:

```yaml
ports:
  - "8080:3000"  # Ahora accede en localhost:8080
```

## Desarrollo

Para desarrollo local sin Docker:

```bash
npm install
npm run dev
```

Luego configura en Settings:
- URL: `http://localhost:8080` (o donde corre tu Headscale local)
- API Key: Tu API key

## Notas de Seguridad

- La UI envía la URL y API Key al servidor proxy en cada petición
- El proxy del servidor hace las peticiones a Headscale
- **Usa HTTPS** si expones la UI a internet
- Considera añadir autenticación adicional si es necesario
