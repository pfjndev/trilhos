# Trilhos Wiki

Welcome to the **Trilhos** documentation! This wiki provides comprehensive guides for getting started, understanding the architecture, and contributing to the project.

## 🚀 Quick Navigation

### Getting Started
- **[Getting Started](Getting-Started.md)** - Installation, environment setup, and first run
- **[Tech Stack](Tech-Stack.md)** - Technologies and libraries used

### Architecture & Design
- **[Architecture Overview](Architecture-Overview.md)** - System design, database schema, and authentication
- **[Project Structure](Project-Structure.md)** - Directory layout and file organization

### API Reference
- **[Component Reference](Component-Reference.md)** - UI components catalog
- **[Hooks Reference](Hooks-Reference.md)** - Custom React hooks
- **[Server Actions Reference](Server-Actions-Reference.md)** - Backend actions and mutations

### Development
- **[Development Guide](Development-Guide.md)** - Code style, patterns, and best practices
- **[Docker Setup](Docker-Setup.md)** - Local HTTPS development for mobile testing

### Deployment
- **[Deployment Guide](Deployment-Guide.md)** - Production deployment and configuration

---

## 📱 About Trilhos

**Trilhos** (Portuguese for "tracks" or "trails") is a privacy-respecting GPS route tracking Progressive Web App built with Next.js. Track your outdoor activities, save routes with automatic location-based naming, and view your activity history.

### Key Features

- **Real-time GPS Tracking** - High-accuracy location tracking using browser Geolocation API
- **Interactive Maps** - Leaflet-based maps with live position and route visualization
- **Auto-generated Route Names** - Reverse geocoding via OpenStreetMap Nominatim
- **Route Statistics** - Distance (Haversine formula), duration, speed calculations
- **User Authentication** - Email/password + OAuth (Google, GitHub)
- **Dark Mode** - System-aware theme with persistent preference
- **Mobile-first Design** - Responsive UI with safe area handling

### Technology Stack

Built with modern web technologies:

- **Next.js 16** with App Router and React 19
- **TypeScript** (strict mode)
- **Tailwind CSS 4** + shadcn/ui components
- **PostgreSQL** + Drizzle ORM
- **NextAuth.js v5** for authentication
- **Leaflet** for interactive maps

---

## 🤝 Contributing

We welcome contributions! Please read the [Development Guide](Development-Guide.md) for:

- Code style guidelines
- Component and hook patterns
- Server Action conventions
- Error handling best practices

---

## 📄 License

This project is open source. See the repository for license details.

---

## 🔗 Links

- [GitHub Repository](https://github.com/your-username/trilhos)
- [Report Issues](https://github.com/your-username/trilhos/issues)
- [Discussions](https://github.com/your-username/trilhos/discussions)

---

**Need help?** Start with the [Getting Started](Getting-Started.md) guide or join the discussion on GitHub!
