# Docker Setup

Docker setup with Caddy reverse proxy for HTTPS development, enabling Geolocation API testing on mobile devices.

---

## Why Docker for Trilhos?

The browser Geolocation API requires HTTPS in production. For local development on mobile devices, we need:

- ✅ HTTPS with valid certificates
- ✅ Network access from mobile devices
- ✅ Hot module reload during development

**Solution:** Docker Compose with Caddy reverse proxy provides automatic HTTPS with minimal configuration.

---

## Quick Start

### Development Mode

**Start all services:**
```bash
docker compose -f docker-compose.dev.yml up --build
```

**Access the app:**
- Desktop: `https://localhost`
- Mobile: `https://<your-computer-ip>`

**Stop services:**
```bash
docker compose -f docker-compose.dev.yml down
```

---

### Production Mode

```bash
docker compose up --build
```

---

## Architecture

### Development Setup

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│     caddy       │──▶│       web       │   │    database     │
│   (HTTPS:443)   │   │  (Next.js dev)  │   │  (PostgreSQL)   │
│  Local TLS CA   │   │  Hot reload ✓   │   │                 │
└─────────────────┘   └─────────────────┘   └─────────────────┘
                        trilhos-dev-network
```

**Services:**
- **caddy** - Reverse proxy with automatic HTTPS (local CA)
- **web** - Next.js development server (Turbopack)
- **database** - PostgreSQL 16

**Features:**
- Hot module reload
- Volume mounts for live code changes
- Local HTTPS certificates
- Database persistence

---

### Production Setup

```
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│     caddy       │──▶│       web       │   │    database     │
│   (HTTPS:443)   │   │ (Next.js prod)  │   │  (PostgreSQL)   │
│  Let's Encrypt  │   │  Optimized ✓    │   │                 │
└─────────────────┘   └─────────────────┘   └─────────────────┘
                       trilhos-docker-network
```

**Features:**
- Production build
- Let's Encrypt SSL certificates
- Optimized bundles
- Database persistence

---

## Mobile Device Testing

### Step 1: Find Your Computer's IP Address

**macOS:**
```bash
ipconfig getifaddr en0
```

**Windows:**
```bash
ipconfig
```

Look for "IPv4 Address" under your active network adapter (usually "Wi-Fi" or "Ethernet").

**Linux:**
```bash
hostname -I
```

Or use `ip addr show` to see all network interfaces.

**Example output:** `192.168.1.100`

---

### Step 2: Access from Mobile

On your mobile device, navigate to:

```
https://<your-computer-ip>
```

Example: `https://192.168.1.100`

**Note:** Ensure your mobile device is on the same Wi-Fi network as your computer.

---

### Step 3: Trust the Certificate

Since Caddy uses a local Certificate Authority in development, you need to install and trust the root certificate on your mobile device.

#### Export the Certificate

```bash
docker compose -f docker-compose.dev.yml cp \
    caddy:/data/caddy/pki/authorities/local/root.crt \
    ./caddy-root.crt
```

This creates `caddy-root.crt` in your project directory.

---

#### Install on iOS

1. **Transfer the file** to your iPhone/iPad:
   - AirDrop (recommended)
   - Email attachment
   - Upload to iCloud Drive
   - USB transfer via Finder

2. **Install the profile:**
   - Tap the `.crt` file
   - Go to **Settings > Profile Downloaded**
   - Tap **Install** (enter passcode if prompted)
   - Tap **Install** again to confirm

3. **Enable full trust:**
   - Go to **Settings > General > About**
   - Scroll to **Certificate Trust Settings**
   - Enable **"Caddy Local"** (or whatever name you gave it)
   - Tap **Continue**

4. **Verify:** Navigate to `https://<your-computer-ip>` - no certificate warning!

---

#### Install on Android

1. **Transfer the file** to your Android device:
   - Email attachment
   - Google Drive
   - USB transfer

2. **Install the certificate:**
   - Go to **Settings > Security > Advanced > Encryption & credentials**
   - Tap **Install a certificate**
   - Select **CA certificate**
   - Tap **Install anyway** (warning about security)
   - Navigate to the downloaded `.crt` file
   - Name it "Caddy Local"
   - Tap **OK**

3. **Verify:** Navigate to `https://<your-computer-ip>` - no certificate warning!

**Note:** Android 11+ requires apps to explicitly trust user certificates. Mobile browsers should work fine.

---

## Docker Commands Reference

| Command | Description |
|---------|-------------|
| `docker compose -f docker-compose.dev.yml up` | Start development services |
| `docker compose -f docker-compose.dev.yml up --build` | Rebuild and start dev |
| `docker compose -f docker-compose.dev.yml down` | Stop development services |
| `docker compose -f docker-compose.dev.yml down -v` | Stop and remove volumes (fresh start) |
| `docker compose -f docker-compose.dev.yml logs -f web` | View Next.js logs (follow mode) |
| `docker compose -f docker-compose.dev.yml logs -f caddy` | View Caddy logs |
| `docker compose -f docker-compose.dev.yml logs -f database` | View PostgreSQL logs |
| `docker compose -f docker-compose.dev.yml exec web sh` | Shell into Next.js container |
| `docker compose -f docker-compose.dev.yml exec database psql -U postgres` | PostgreSQL shell |
| `docker compose up` | Start production services |
| `docker compose up --build` | Rebuild and start production |
| `docker compose down` | Stop production services |

---

## Configuration Files

### docker-compose.dev.yml

Development configuration with hot reload:

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app  # Mount source code for hot reload
      - /app/node_modules  # Exclude node_modules
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@database:5432/trilhos
      - WATCHPACK_POLLING=true  # Enable hot reload
```

---

### Dockerfile.dev

Development container with source code mounting:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]
```

---

### Caddyfile.dev

Development Caddy configuration with local TLS:

```
localhost {
    reverse_proxy web:3000
    tls internal
}
```

---

## Troubleshooting

### Hot Reload Not Working

**Symptom:** Code changes don't reflect in browser.

**Solutions:**

1. **Check environment variable:**
   ```bash
   docker compose -f docker-compose.dev.yml exec web env | grep WATCHPACK
   ```
   Should show: `WATCHPACK_POLLING=true`

2. **Verify volume mounting:**
   ```bash
   docker compose -f docker-compose.dev.yml exec web ls -la /app
   ```
   Should show your source files.

3. **Restart containers:**
   ```bash
   docker compose -f docker-compose.dev.yml restart web
   ```

---

### Certificate Issues

**Symptom:** Browser shows "Your connection is not private" error.

**Solutions:**

1. **Re-export and install certificate:**
   ```bash
   docker compose -f docker-compose.dev.yml down -v
   docker compose -f docker-compose.dev.yml up
   docker compose -f docker-compose.dev.yml cp caddy:/data/caddy/pki/authorities/local/root.crt ./caddy-root.crt
   ```
   Then reinstall on mobile device.

2. **Clear browser cache and hard reload:**
   - Chrome: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

3. **Check Caddy logs:**
   ```bash
   docker compose -f docker-compose.dev.yml logs caddy
   ```

---

### Database Connection Issues

**Symptom:** App shows "Database connection error".

**Solutions:**

1. **Check if database is running:**
   ```bash
   docker compose -f docker-compose.dev.yml ps database
   ```
   Should show status "Up".

2. **View database logs:**
   ```bash
   docker compose -f docker-compose.dev.yml logs database
   ```

3. **Test connection manually:**
   ```bash
   docker compose -f docker-compose.dev.yml exec web npx drizzle-kit push
   ```

4. **Reset database:**
   ```bash
   docker compose -f docker-compose.dev.yml down -v
   docker compose -f docker-compose.dev.yml up
   docker compose -f docker-compose.dev.yml exec web npx drizzle-kit push
   ```

---

### Port Conflicts

**Symptom:** Error: "port is already allocated".

**Solutions:**

1. **Check what's using the port:**
   ```bash
   lsof -i :80
   lsof -i :443
   ```

2. **Stop conflicting services:**
   - macOS: Stop Apache or nginx if running
   - Windows: Stop IIS if running

3. **Change ports** (optional):
   Edit `docker-compose.dev.yml`:
   ```yaml
   ports:
     - "8080:80"
     - "8443:443"
   ```
   Then access at `https://localhost:8443`

---

### Can't Access from Mobile

**Symptom:** Mobile device can't connect to `https://<your-ip>`.

**Solutions:**

1. **Verify same network:**
   - Computer and mobile must be on same Wi-Fi
   - Corporate networks may block device-to-device communication

2. **Check firewall:**
   - macOS: System Preferences > Security & Privacy > Firewall > Allow Docker
   - Windows: Allow Docker in Windows Firewall

3. **Verify Caddy is listening:**
   ```bash
   docker compose -f docker-compose.dev.yml exec caddy netstat -tuln | grep 443
   ```

---

## Performance Tips

### Faster Builds

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker compose -f docker-compose.dev.yml up --build
```

### Reduce Volume Sync Overhead

For large `node_modules`, exclude them:

```yaml
volumes:
  - .:/app
  - /app/node_modules
  - /app/.next  # Also exclude Next.js cache
```

---

## Next Steps

- 📱 **Test GPS** - Enable location in mobile browser settings
- 🚀 **Deploy** - See [Deployment Guide](Deployment-Guide.md) for production
- 🛠️ **Develop** - Check [Development Guide](Development-Guide.md) for code patterns
- ✅ **Verify** - Test tracking, route saving, and authentication

---

**Questions?** Check the [Getting Started](Getting-Started.md) guide or join [GitHub Discussions](https://github.com/your-username/trilhos/discussions).
