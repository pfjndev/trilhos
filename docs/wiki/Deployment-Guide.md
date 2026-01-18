# Deployment Guide

Production deployment options and configuration for Trilhos.

---

## Deployment Options

| Platform | Difficulty | Cost | Best For |
|----------|------------|------|----------|
| **Vercel** | ⭐ Easy | Free tier available | Quick deployment, serverless |
| **Self-hosted (Docker)** | ⭐⭐⭐ Moderate | VPS costs | Full control, custom setup |
| **Railway** | ⭐⭐ Easy | Pay-as-you-go | Managed PostgreSQL + Next.js |
| **DigitalOcean App Platform** | ⭐⭐ Easy | Starts at $5/mo | Simplicity + control |

---

## Vercel Deployment (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- PostgreSQL database (see [Database Providers](#database-providers))

---

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your **trilhos** repository
4. Click **Import**

---

### Step 3: Configure Environment Variables

In the Vercel project settings, add the following environment variables:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `AUTH_SECRET` | Generate with `npx auth secret` | ✅ Yes |
| `AUTH_TRUST_HOST` | `true` | ✅ Yes (for reverse proxy) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID | ⬜ Optional |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | ⬜ Optional |
| `AUTH_GITHUB_ID` | GitHub OAuth app client ID | ⬜ Optional |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app client secret | ⬜ Optional |

**Example `DATABASE_URL`:**
```
postgresql://user:password@host:5432/database?sslmode=require
```

---

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL (e.g., `trilhos.vercel.app`)

---

### Step 5: Run Database Migrations

After first deployment, run migrations:

**Option A: Vercel CLI**
```bash
vercel env pull .env.local
npx drizzle-kit push
```

**Option B: Direct Connection**
```bash
# Set DATABASE_URL from Vercel
export DATABASE_URL="postgresql://..."
npx drizzle-kit push
```

---

### Step 6: Configure Custom Domain (Optional)

1. Go to **Project Settings > Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

---

### Vercel Build Configuration

Vercel auto-detects Next.js. No additional configuration needed, but you can customize:

**vercel.json** (optional):
```json
{
  "buildCommand": "npx drizzle-kit push && next build",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

## Database Providers

### Recommended Options

#### Neon (Recommended)

- **Free tier:** 0.5 GB storage, autoscaling
- **Postgres-compatible** with connection pooling
- **Setup:** [neon.tech](https://neon.tech)

**Connection string format:**
```
postgresql://user:password@ep-name.region.neon.tech/database?sslmode=require
```

---

#### Supabase

- **Free tier:** 500 MB database, 50,000 monthly users
- **Includes:** Auth (alternative to NextAuth), Storage, Real-time
- **Setup:** [supabase.com](https://supabase.com)

**Connection string format:**
```
postgresql://postgres:password@db.project.supabase.co:5432/postgres
```

---

#### Railway

- **Pay-as-you-go:** $0.000463/GB-hour
- **Includes:** PostgreSQL + Next.js hosting
- **Setup:** [railway.app](https://railway.app)

---

#### Vercel Postgres

- **Managed by Vercel** (powered by Neon)
- **Integration:** One-click setup in Vercel dashboard
- **Pricing:** Free tier available

---

## OAuth Configuration

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   ```
   https://yourdomain.com/api/auth/callback/google
   https://vercel-deployment-url.vercel.app/api/auth/callback/google
   ```
7. Copy **Client ID** and **Client Secret**
8. Add to Vercel environment variables:
   - `AUTH_GOOGLE_ID=<client-id>`
   - `AUTH_GOOGLE_SECRET=<client-secret>`

---

### GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** > **New OAuth App**
3. Fill in:
   - **Application name:** Trilhos
   - **Homepage URL:** `https://yourdomain.com`
   - **Authorization callback URL:** `https://yourdomain.com/api/auth/callback/github`
4. Click **Register application**
5. Click **Generate a new client secret**
6. Add to Vercel environment variables:
   - `AUTH_GITHUB_ID=<client-id>`
   - `AUTH_GITHUB_SECRET=<client-secret>`

---

## Self-Hosted Deployment (Docker)

For full control, deploy using Docker on a VPS.

### Prerequisites

- VPS with Docker installed (Ubuntu 22.04 recommended)
- Domain name pointed to VPS IP
- Ports 80 and 443 open

---

### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/trilhos.git
cd trilhos
```

---

### Step 2: Configure Environment

Create `.env.production`:

```env
DATABASE_URL=postgresql://postgres:password@database:5432/trilhos
AUTH_SECRET=<generate-with-npx-auth-secret>
AUTH_TRUST_HOST=true
AUTH_GOOGLE_ID=<optional>
AUTH_GOOGLE_SECRET=<optional>
AUTH_GITHUB_ID=<optional>
AUTH_GITHUB_SECRET=<optional>
```

---

### Step 3: Update Caddyfile

Edit `caddy/Caddyfile`:

```
yourdomain.com {
    reverse_proxy web:3000
}
```

Caddy will automatically obtain Let's Encrypt SSL certificates.

---

### Step 4: Deploy

```bash
docker compose up -d --build
```

---

### Step 5: Run Migrations

```bash
docker compose exec web npx drizzle-kit push
```

---

### Step 6: Verify

Visit `https://yourdomain.com` - should see Trilhos!

---

### Docker Compose Updates

To update after code changes:

```bash
git pull origin main
docker compose up -d --build
```

---

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | NextAuth encryption secret | Generate with `npx auth secret` |

---

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `AUTH_TRUST_HOST` | Trust reverse proxy (Vercel, Caddy) | `false` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID | - |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | - |
| `AUTH_GITHUB_ID` | GitHub OAuth app client ID | - |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app client secret | - |
| `NODE_ENV` | Environment mode | `production` |

---

## Production Checklist

### Before Deployment

- [ ] Set `AUTH_SECRET` (generate fresh, don't reuse dev secret)
- [ ] Configure `DATABASE_URL` with production database
- [ ] Set up OAuth providers (Google, GitHub) with production callback URLs
- [ ] Review database schema (run migrations)
- [ ] Test locally with production build: `npm run build && npm run start`

---

### After Deployment

- [ ] Verify HTTPS is working
- [ ] Test user registration and login
- [ ] Test OAuth providers
- [ ] Test GPS tracking on mobile device
- [ ] Test route creation and saving
- [ ] Check error logs (Vercel dashboard or Docker logs)
- [ ] Set up monitoring (optional - Vercel Analytics, Sentry)

---

### Security

- [ ] Use strong `AUTH_SECRET` (min 32 characters)
- [ ] Enable database SSL (`?sslmode=require` in `DATABASE_URL`)
- [ ] Set secure environment variables (never commit to Git)
- [ ] Review CORS settings (if adding custom API routes)
- [ ] Enable rate limiting (Vercel Pro, or custom middleware)

---

## Monitoring & Logging

### Vercel Analytics

Enable in Vercel dashboard:
- **Analytics** - Page views, performance
- **Speed Insights** - Core Web Vitals
- **Logs** - Runtime logs

---

### Error Tracking

**Sentry Integration:**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add to environment variables:
```env
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
```

---

## Performance Optimization

### Database Connection Pooling

For serverless (Vercel), use connection pooler:

**Neon:**
```
postgresql://user:password@ep-name.region.neon.tech/db?sslmode=require&pooler=true
```

**Supabase:**
```
postgresql://user:password@db.project.supabase.co:6543/postgres?pgbouncer=true
```

---

### Caching

Next.js automatic caching works out of the box:
- Static pages cached at CDN edge
- `revalidatePath()` updates cache after mutations
- Server Components cached by default

---

### Image Optimization

Images are automatically optimized by Next.js:
- WebP conversion
- Responsive sizes
- Lazy loading

No additional configuration needed.

---

## Troubleshooting

### Build Fails on Vercel

**Check build logs:**
1. Go to Vercel dashboard > Deployments
2. Click failed deployment
3. View build logs

**Common issues:**
- Missing environment variables
- TypeScript errors
- Database connection during build (ensure migrations run separately)

---

### Database Connection Errors

**Error:** "connect ECONNREFUSED"

**Solutions:**
- Verify `DATABASE_URL` is correct
- Check database is accessible from deployment platform
- Ensure SSL mode is set: `?sslmode=require`

---

### OAuth Not Working

**Error:** "Callback URL mismatch"

**Solutions:**
- Verify callback URL in OAuth provider settings matches deployment URL
- Format: `https://yourdomain.com/api/auth/callback/google`
- Add both production and preview URLs (Vercel preview deployments)

---

## Rollback

### Vercel

1. Go to **Deployments**
2. Find previous working deployment
3. Click **...** > **Promote to Production**

### Docker

```bash
# Revert to previous commit
git revert HEAD
docker compose up -d --build
```

---

## Next Steps

- 🔐 **[Getting Started](Getting-Started.md)** - Local development setup
- 🐳 **[Docker Setup](Docker-Setup.md)** - Development with HTTPS
- 📊 **Monitor** - Set up analytics and error tracking
- 🚀 **Scale** - Consider caching, CDN, database optimization

---

**Questions?** Check [GitHub Discussions](https://github.com/your-username/trilhos/discussions) or [open an issue](https://github.com/your-username/trilhos/issues).
