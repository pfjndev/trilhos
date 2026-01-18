# Getting Started

This guide will help you set up Trilhos for local development in just a few minutes.

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Download |
|-------------|---------|----------|
| **Node.js** | 18.x or later | [nodejs.org](https://nodejs.org/) |
| **npm** | Comes with Node.js | - |
| **PostgreSQL** | 14.x or later | [postgresql.org](https://www.postgresql.org/download/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

### Verify Installation

```bash
node --version  # Should be 18.x or higher
npm --version
psql --version  # Should be 14.x or higher
git --version
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/trilhos.git
cd trilhos
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, Drizzle ORM, and more.

---

## Environment Variables

Trilhos uses environment variables for configuration. Create a `.env.local` file in the project root:

### Create from Template

```bash
cp .env.example .env.local
```

### Configure Variables

Open `.env.local` and set the following:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `AUTH_SECRET` | ✅ Yes | NextAuth secret for session encryption |
| `AUTH_GOOGLE_ID` | ⬜ No | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | ⬜ No | Google OAuth client secret |
| `AUTH_GITHUB_ID` | ⬜ No | GitHub OAuth app client ID |
| `AUTH_GITHUB_SECRET` | ⬜ No | GitHub OAuth app client secret |

### Example `.env.local`

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trilhos

# Authentication (generate with: npx auth secret)
AUTH_SECRET=your-generated-secret-here

# Optional OAuth Providers
# AUTH_GOOGLE_ID=your-google-client-id
# AUTH_GOOGLE_SECRET=your-google-client-secret
# AUTH_GITHUB_ID=your-github-client-id
# AUTH_GITHUB_SECRET=your-github-client-secret
```

### Generate AUTH_SECRET

```bash
npx auth secret
```

Copy the generated value to your `.env.local` file.

---

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Using psql
createdb trilhos

# Or with psql command
psql -U postgres -c "CREATE DATABASE trilhos;"
```

### 2. Run Migrations

```bash
npx drizzle-kit push
```

This applies the database schema defined in `app/db/schema.ts`.

### 3. (Optional) Seed Test Data

```bash
npm run db:seed
```

This creates sample users and routes for testing.

---

## Running the App

### Development Mode

```bash
npm run dev
```

The app will start on [http://localhost:3000](http://localhost:3000).

**Features in development mode:**
- ✅ Hot module replacement (HMR)
- ✅ Turbopack for faster builds
- ✅ Detailed error messages
- ✅ Source maps

### Production Build

```bash
# Build the app
npm run build

# Start production server
npm run start
```

Production mode runs optimized builds with:
- ✅ Minified code
- ✅ Server-side rendering (SSR)
- ✅ Static generation where applicable
- ✅ Image optimization

---

## HTTPS for Mobile Development

> **Important:** The browser Geolocation API requires HTTPS in production. For local development on mobile devices, you need HTTPS.

### Option 1: Docker with Caddy (Recommended)

Use our Docker setup with Caddy reverse proxy for automatic HTTPS:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Access at: `https://localhost`

📚 **Full guide:** See [Docker Setup](Docker-Setup.md) for mobile device testing and certificate installation.

### Option 2: ngrok (Quick Testing)

```bash
# Install ngrok
npm install -g ngrok

# Start dev server
npm run dev

# In another terminal, expose it
ngrok http 3000
```

Use the HTTPS URL provided by ngrok on your mobile device.

---

## Verify Installation

### 1. Check the Home Page

Navigate to [http://localhost:3000](http://localhost:3000). You should see:
- Login/Register buttons (if not authenticated)
- Map placeholder
- Theme toggle in header

### 2. Create an Account

1. Click **Register**
2. Fill in name, email, and password
3. Submit the form
4. You'll be redirected to the home page

### 3. Test GPS Tracking (Desktop)

> **Note:** Desktop browsers may not have GPS, but can simulate location.

1. Open browser DevTools
2. Go to **Sensors** (Chrome) or **Responsive Design Mode** (Firefox)
3. Set a custom location
4. Click **Start Tracking** in Trilhos

---

## Next Steps

Now that you have Trilhos running locally:

- 📖 **[Architecture Overview](Architecture-Overview.md)** - Understand the system design
- 🏗️ **[Project Structure](Project-Structure.md)** - Navigate the codebase
- 🛠️ **[Development Guide](Development-Guide.md)** - Start contributing
- 🐳 **[Docker Setup](Docker-Setup.md)** - Test on mobile devices

---

## Troubleshooting

### Database Connection Error

**Error:** `Error: connect ECONNREFUSED`

**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   psql -U postgres -c "SELECT version();"
   ```
2. Check your `DATABASE_URL` in `.env.local`
3. Ensure the database exists:
   ```bash
   psql -U postgres -l | grep trilhos
   ```

### Port 3000 Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Missing Dependencies

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Drizzle Push Fails

**Error:** `Failed to connect to database`

**Solution:**
1. Verify PostgreSQL is running
2. Check credentials in `DATABASE_URL`
3. Ensure database exists (create it if needed)

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx drizzle-kit push` | Apply database migrations |
| `npx drizzle-kit studio` | Open Drizzle Studio (DB GUI) |
| `npm run db:seed` | Seed database with test data |

---

**Need more help?** Check the [Docker Setup](Docker-Setup.md) guide for HTTPS on mobile, or visit our [GitHub Discussions](https://github.com/your-username/trilhos/discussions).
