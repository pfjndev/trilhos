# Trilhos

> GPS route tracking PWA built with Next.js

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**Trilhos** (Portuguese for "tracks" or "trails") is a privacy-respecting GPS route tracking Progressive Web App. Track your outdoor activities in real-time, save routes with automatic location-based naming, and view your activity history.

---

## 📸 Screenshots

---

## Screenshots

### Login

<p align="center">
  <img src="docs/screenshots/login-light.webp" width="300" alt="Login - Light Mode" />
  <img src="docs/screenshots/login-dark.webp" width="300" alt="Login - Dark Mode" />
</p>

### Register

<p align="center">
  <img src="docs/screenshots/register-light.webp" width="300" alt="Register - Light Mode" />
  <img src="docs/screenshots/register-dark.webp" width="300" alt="Register - Dark Mode" />
</p>

### Home (GPS Tracking)

<p align="center">
  <img src="docs/screenshots/home-light.webp" width="300" alt="Home - Light Mode" />
  <img src="docs/screenshots/home-dark.webp" width="300" alt="Home - Dark Mode" />
</p>

### Activity Feed

<p align="center">
  <img src="docs/screenshots/activity-light.webp" width="300" alt="Activity Feed - Light Mode" />
  <img src="docs/screenshots/activity-dark.webp" width="300" alt="Activity Feed - Dark Mode" />
</p>

### Route History

<p align="center">
  <img src="docs/screenshots/history-light.webp" width="300" alt="Route History - Light Mode" />
  <img src="docs/screenshots/history-dark.webp" width="300" alt="Route History - Dark Mode" />
</p>

### Route Details

<p align="center">
  <img src="docs/screenshots/details-light.webp" width="300" alt="Route Details - Light Mode" />
  <img src="docs/screenshots/details-dark.webp" width="300" alt="Route Details - Dark Mode" />
</p>

---

## ✨ Features

- **Real-time GPS Tracking** - High-accuracy location tracking using browser Geolocation API
- **Interactive Maps** - Leaflet-based maps with live position and route visualization
- **Auto-generated Route Names** - Reverse geocoding via OpenStreetMap Nominatim
- **Route Statistics** - Distance (Haversine formula), duration, average speed
- **Route History** - Personal history of all completed routes
- **Activity Feed** - Community feed showing routes from all users
- **User Authentication** - Email/password + OAuth (Google, GitHub)
- **Dark Mode** - System-aware theme with persistent preference
- **Mobile-first Design** - Responsive UI with safe area handling for notched devices

---

## 🚀 Tech Stack

**Core:** Next.js 16 · React 19 · TypeScript 5 · PostgreSQL 16

**UI:** Tailwind CSS 4 · shadcn/ui · Radix UI · Lucide Icons

**Backend:** Drizzle ORM · NextAuth.js v5 · Server Actions

**Maps:** Leaflet · OpenStreetMap

📚 **Full details:** See the [Tech Stack wiki page](docs/wiki/Tech-Stack.md)

---

## ⚡ Quick Start

```bash
# Clone and install
git clone https://github.com/your-username/trilhos.git
cd trilhos
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and AUTH_SECRET

# Setup database
npx drizzle-kit push

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**For mobile testing with HTTPS:** See the [Docker Setup guide](docs/wiki/Docker-Setup.md)

---

## 📖 Documentation

Comprehensive documentation is available in the wiki:

### Getting Started
- **[Getting Started](docs/wiki/Getting-Started.md)** - Installation and setup
- **[Tech Stack](docs/wiki/Tech-Stack.md)** - Technologies and libraries
- **[Project Structure](docs/wiki/Project-Structure.md)** - Directory layout

### Architecture & API
- **[Architecture Overview](docs/wiki/Architecture-Overview.md)** - System design and data flow
- **[Component Reference](docs/wiki/Component-Reference.md)** - UI components catalog
- **[Hooks Reference](docs/wiki/Hooks-Reference.md)** - Custom React hooks
- **[Server Actions Reference](docs/wiki/Server-Actions-Reference.md)** - Backend actions

### Development & Deployment
- **[Development Guide](docs/wiki/Development-Guide.md)** - Code style and patterns
- **[Docker Setup](docs/wiki/Docker-Setup.md)** - Local HTTPS development
- **[Deployment Guide](docs/wiki/Deployment-Guide.md)** - Production deployment

---

## 🤝 Contributing

We welcome contributions! Please see the [Development Guide](docs/wiki/Development-Guide.md) for:

- Code style guidelines
- Component patterns
- Server Action conventions
- Testing guidelines

---

## 📄 License

This project is open source. See LICENSE for details.

---

## 🔗 Links

- [Documentation Wiki](docs/wiki/Home.md)
- [Report Issues](https://github.com/your-username/trilhos/issues)
- [Discussions](https://github.com/your-username/trilhos/discussions)

---

**Built with ❤️ using Next.js, React, and TypeScript**
