# Docker HTTPS Setup for Geolocation Testing

## Overview

This setup enables testing the Geolocation API on mobile devices by providing HTTPS access through nginx reverse proxy on the `trilhos-docker-network`.

## Architecture

```text
[Mobile Device] --> HTTPS:443 --> [nginx:alpine] --> HTTP:3000 --> [Next.js App]
                                        |
                                  trilhos-docker-network
```

## Components

### 1. nginx (Reverse Proxy)

- **Image**: `nginx:alpine`
- **Ports**: 80 (HTTP redirect), 443 (HTTPS)
- **Config**: [nginx/nginx.conf](nginx/nginx.conf)
  - TLS 1.2/1.3 support
  - Security headers (HSTS, X-Frame-Options, etc.)
  - Proxies to internal `web:3000` service
  - Auto-redirects HTTP to HTTPS

### 2. Next.js Application

- **Image**: Built from [Dockerfile](Dockerfile)
- **Internal Port**: 3000 (not exposed to host)
- **Network**: `trilhos-docker-network`
- **Healthcheck**: wget on [http://localhost:3000](http://localhost:3000)

### 3. SSL Certificates

- **Location**: `nginx/ssl/` (git-ignored)
- **Type**: Self-signed (development only)
- **Generation**: Run `./nginx/generate-ssl.sh`
- **Validity**: 365 days
- **SANs**: localhost, 127.0.0.1, common private IP ranges

## Quick Start

1. **Generate SSL certificates** (first time only):

   ```bash
   ./nginx/generate-ssl.sh
   ```

2. **Start services**:

   ```bash
   docker compose up --build
   ```

3. **Access from phone**:

   - Find Mac IP: `ipconfig getifaddr en0`
   - Navigate to: `https://<your-ip>`
   - Accept certificate warning

## Development Mode

For hot-reload during development:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

This mounts your source code and runs `next dev` with file watching enabled.

## Security Notes

- **Self-signed certificates** will trigger browser warnings
- Users must manually accept the certificate to enable geolocation
- For production, replace with valid certificates (Let's Encrypt, etc.)
- Current nginx config uses strong ciphers and modern TLS protocols

## Troubleshooting

### Geolocation still not working?

- Ensure you're using HTTPS (not HTTP)
- Accept the certificate warning in your browser
- Check browser console for errors

### Certificate issues?

- Regenerate: `rm -rf nginx/ssl && ./nginx/generate-ssl.sh`
- Ensure the IP you're accessing is covered by SANs in the cert

### Container issues?

- Check logs: `docker compose logs nginx` or `docker compose logs web`
- Verify network: `docker network inspect trilhos-docker-network`
