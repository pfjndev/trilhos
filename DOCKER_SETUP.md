# Docker Setup

This project uses Docker with Caddy for HTTPS reverse proxy. Development and production environments are fully separated.

## Quick Start

### Development (with hot reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

Access at: `https://localhost`

### Production

```bash
docker compose up --build
```

## Architecture

### Development

```text
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│     caddy       │──▶│       web       │   │    database     │
│   (HTTPS:443)   │   │  (Next.js dev)  │   │  (PostgreSQL)   │
│  Local TLS CA   │   │  Hot reload ✓   │   │                 │
└─────────────────┘   └─────────────────┘   └─────────────────┘
                        trilhos-dev-network
```

### Production

```text
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│     caddy       │──▶│       web       │   │    database     │
│   (HTTPS:443)   │   │ (Next.js prod)  │   │  (PostgreSQL)   │
│  Let's Encrypt  │   │  Optimized ✓    │   │                 │
└─────────────────┘   └─────────────────┘   └─────────────────┘
                       trilhos-docker-network
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Database
DB_HOST=database
DB_PORT=5432
DB_NAME=trilhos
DB_USER=trilhos
DB_PASSWORD=your-secure-password

# Production only
DOMAIN=yourdomain.com
```

## Development Details

### Hot Reload

The development setup mounts your source code as a volume, enabling hot reload:

- Source changes are detected automatically via `WATCHPACK_POLLING`
- No rebuild required for code changes
- Only rebuild when dependencies change: `docker compose -f docker-compose.dev.yml up --build`

### HTTPS with Self-Signed Certificates

Caddy automatically generates self-signed certificates using its internal CA. This enables:

- Geolocation API testing (requires HTTPS)
- Service worker development
- Secure cookie testing

The first time you access `https://localhost`, your browser will show a certificate warning. Accept it to proceed.

## Mobile Device Testing

To test on mobile devices connected to your local network:

### 1. Find Your Mac's IP Address

```bash
ipconfig getifaddr en0
```

### 2. Access From Mobile

Navigate to `https://<your-mac-ip>` on your mobile device.

### 3. Trust the Certificate

Since Caddy uses a local CA, you need to trust it on your mobile device:

#### Export the Root CA Certificate

```bash
docker compose -f docker-compose.dev.yml cp \
    caddy:/data/caddy/pki/authorities/local/root.crt \
    ./caddy-root.crt
```

#### Install on iOS

1. AirDrop or email the `caddy-root.crt` file to your device
2. Open the file and follow prompts to install the profile
3. Go to Settings > General > About > Certificate Trust Settings
4. Enable full trust for the Caddy root certificate

#### Install on Android

1. Transfer `caddy-root.crt` to your device
2. Go to Settings > Security > Install from storage
3. Select the certificate file
4. Name it "Caddy Local" and confirm

## Production Details

### Automatic HTTPS

In production, Caddy automatically:

- Obtains Let's Encrypt certificates
- Handles certificate renewals
- Redirects HTTP to HTTPS

Set the `DOMAIN` environment variable to your domain:

```env
DOMAIN=yourdomain.com
```

### DNS Requirements

Ensure your domain's DNS records point to your server before starting:

```bash
# Verify DNS
dig +short yourdomain.com
```

### Ports

Ensure ports 80 and 443 are open and forwarded to your server.

## Commands Reference

| Command | Description |
|---------|-------------|
| `docker compose -f docker-compose.dev.yml up` | Start development |
| `docker compose -f docker-compose.dev.yml up --build` | Rebuild and start dev |
| `docker compose -f docker-compose.dev.yml down` | Stop development |
| `docker compose -f docker-compose.dev.yml logs -f web` | View Next.js logs |
| `docker compose up` | Start production |
| `docker compose up --build` | Rebuild and start prod |
| `docker compose down` | Stop production |
| `docker compose logs -f caddy` | View Caddy logs |

## Troubleshooting

### Hot Reload Not Working

1. Ensure `WATCHPACK_POLLING` is set (already configured in compose file)
2. Check that volumes are mounted correctly:
   ```bash
   docker compose -f docker-compose.dev.yml exec web ls -la /app
   ```

### Certificate Issues

Regenerate Caddy's certificates by removing its data volume:

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up
```

### Database Connection Issues

Verify the database is running:

```bash
docker compose -f docker-compose.dev.yml ps database
docker compose -f docker-compose.dev.yml logs database
```

### Port Conflicts

If ports 80 or 443 are in use:

```bash
# Check what's using the ports
lsof -i :80
lsof -i :443

# Stop conflicting services or change ports in compose file
```

## File Structure

```
├── docker-compose.yml        # Production configuration
├── docker-compose.dev.yml    # Development configuration (standalone)
├── Dockerfile                # Production multi-stage build
├── Dockerfile.dev            # Development with hot reload
└── caddy/
    ├── Caddyfile             # Production Caddy config
    └── Caddyfile.dev         # Development Caddy config
```
