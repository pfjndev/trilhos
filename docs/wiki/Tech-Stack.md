# Tech Stack

Trilhos is built with modern web technologies chosen for performance, developer experience, and type safety.

---

## Core Framework

### Next.js 16

**Purpose:** React framework with App Router

**Why Next.js?**
- **App Router** - Modern routing with React Server Components
- **Turbopack** - Lightning-fast bundler for development
- **Server Actions** - Type-safe server mutations without API routes
- **Automatic code splitting** - Optimized bundle sizes
- **Image optimization** - Built-in `<Image>` component
- **Edge & Serverless** - Flexible deployment options

**Key Features Used:**
- App Router with file-based routing
- React Server Components for data fetching
- Server Actions for mutations
- Middleware for route protection
- Dynamic imports for client-side libraries (Leaflet)

📚 **Learn more:** [Next.js App Router Documentation](https://nextjs.org/docs/app)

---

### React 19

**Purpose:** UI library

**Why React 19?**
- **Server Components** - Reduce client-side JavaScript
- **Optimistic UI** - Built-in support for optimistic updates
- **Improved Suspense** - Better loading state management
- **use() hook** - Consume promises and context
- **Form Actions** - Enhanced form handling

**Key Features Used:**
- Client Components for interactivity
- Server Components for data rendering
- Hooks (useState, useEffect, useMemo, useCallback)
- Custom hooks for GPS tracking
- Suspense boundaries for async components

📚 **Learn more:** [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)

---

### TypeScript 5

**Purpose:** Type-safe development

**Why TypeScript?**
- **Static typing** - Catch errors at compile time
- **Intellisense** - Better IDE autocomplete
- **Refactoring safety** - Confidence when changing code
- **Documentation** - Types serve as inline docs
- **Strict mode** - Maximum type safety

**Configuration:**
- Strict mode enabled
- Path aliases (`@/*`)
- Drizzle type inference
- Next.js type extensions

📚 **Learn more:** [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## UI & Styling

### Tailwind CSS 4

**Purpose:** Utility-first CSS framework

**Why Tailwind?**
- **Utility classes** - No context switching between files
- **Design consistency** - Constrained design tokens
- **Minimal CSS** - Only ships used classes
- **Dark mode** - Built-in class-based dark mode
- **Responsive** - Mobile-first breakpoints

**Configuration:**
- Custom color palette
- CSS variables for theming
- Safe area support for mobile notches
- Custom font (Geist Sans/Mono)

📚 **Learn more:** [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

### shadcn/ui

**Purpose:** Component library

**Why shadcn/ui?**
- **Copy-paste components** - Own your code, no black box
- **Radix primitives** - Accessibility built-in
- **Customizable** - Tailwind-based styling
- **TypeScript** - Full type safety
- **No runtime** - Components are just React + Tailwind

**Components Used:**
- Button, Input, Label - Forms
- Card - Route cards
- Alert Dialog - Confirmations
- Dropdown Menu - User menu

📚 **Learn more:** [shadcn/ui Documentation](https://ui.shadcn.com/)

---

### Radix UI

**Purpose:** Accessible component primitives

**Why Radix?**
- **WAI-ARIA compliant** - Full keyboard navigation
- **Unstyled** - Bring your own styles
- **Composable** - Build complex components
- **Tested** - Battle-tested primitives

**Primitives Used:**
- Dialog - Save route modal
- Dropdown Menu - User menu
- Alert Dialog - Delete confirmations

📚 **Learn more:** [Radix UI Documentation](https://www.radix-ui.com/)

---

### Additional UI Libraries

| Library | Purpose | Why? |
|---------|---------|------|
| [Lucide React](https://lucide.dev/) | Icon library | Consistent, tree-shakeable icons |
| [next-themes](https://github.com/pacocoursey/next-themes) | Theme management | System-aware dark mode |
| [class-variance-authority](https://cva.style/) | Component variants | Type-safe variant management |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Class merging | Merge Tailwind classes correctly |
| [clsx](https://github.com/lukeed/clsx) | Class names | Conditional class construction |
| [Geist Font](https://vercel.com/font) | Typography | Modern, readable font family |

---

## Database & ORM

### PostgreSQL 16

**Purpose:** Relational database

**Why PostgreSQL?**
- **ACID compliance** - Data integrity guaranteed
- **JSON support** - Store route points efficiently
- **Performance** - Handles millions of records
- **Mature ecosystem** - Reliable, well-supported
- **Open source** - No vendor lock-in

**Features Used:**
- JSON columns for location points
- Foreign keys with cascading
- Timestamps (auto-updated)
- UUID primary keys for users

📚 **Learn more:** [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

### Drizzle ORM

**Purpose:** Type-safe ORM

**Why Drizzle?**
- **TypeScript-first** - Inferred types from schema
- **Lightweight** - Small runtime overhead
- **SQL-like** - Familiar query syntax
- **Type safety** - Compile-time query validation
- **Migrations** - Automatic migration generation

**Configuration:**
- Schema in `app/db/schema.ts`
- Type inference with `$inferSelect` / `$inferInsert`
- Drizzle Studio for database GUI
- Push-based migrations

📚 **Learn more:** [Drizzle ORM Documentation](https://orm.drizzle.team/)

---

### drizzle-kit

**Purpose:** Database migrations

**Features:**
- Generate migrations from schema
- Push schema to database (dev mode)
- Drizzle Studio (database GUI)
- Introspect existing databases

📚 **Learn more:** [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)

---

## Authentication

### NextAuth.js v5 (Auth.js)

**Purpose:** Authentication framework

**Why NextAuth.js?**
- **Multiple providers** - Credentials, OAuth, magic links
- **Session management** - Secure JWT or database sessions
- **Type-safe** - Full TypeScript support
- **Middleware** - Protect routes easily
- **Callbacks** - Customize auth flow

**Configuration:**
- Database sessions with Drizzle adapter
- Credentials provider (email/password)
- Google OAuth provider
- GitHub OAuth provider
- Route protection middleware

📚 **Learn more:** [Auth.js Documentation](https://authjs.dev/)

---

### Supporting Libraries

| Library | Purpose |
|---------|---------|
| [@auth/drizzle-adapter](https://authjs.dev/getting-started/adapters/drizzle) | Database adapter for NextAuth |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing (10 rounds) |
| [Zod](https://zod.dev/) | Input validation schemas |

---

## Mapping

### Leaflet

**Purpose:** Interactive maps

**Why Leaflet?**
- **Lightweight** - Only 42KB gzipped
- **Mobile-friendly** - Touch gestures, pinch zoom
- **Extensible** - Plugin ecosystem
- **No API keys** - Works with free tile providers
- **Open source** - MIT licensed

**Features Used:**
- TileLayer with OpenStreetMap
- Polyline for route visualization
- Marker for current position
- Panning and zooming
- Dynamic loading (CSR only)

📚 **Learn more:** [Leaflet Documentation](https://leafletjs.com/)

---

### OpenStreetMap

**Purpose:** Map tiles and reverse geocoding

**Why OpenStreetMap?**
- **Free** - No usage limits or API keys
- **Open data** - Community-maintained
- **Global coverage** - Worldwide map data
- **Nominatim API** - Free reverse geocoding

**APIs Used:**
- Tile Layer: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- Nominatim: `https://nominatim.openstreetmap.org/reverse`

📚 **Learn more:** [OpenStreetMap Documentation](https://wiki.openstreetmap.org/)

---

## Additional Libraries

### Utilities

| Library | Purpose |
|---------|---------|
| [date-fns](https://date-fns.org/) | Date formatting and manipulation |

### Development Tools

| Tool | Purpose |
|------|---------|
| [ESLint](https://eslint.org/) | Code linting |
| [Prettier](https://prettier.io/) | Code formatting (optional) |
| [Turbopack](https://turbo.build/pack) | Fast development bundler |

---

## Why This Stack?

### Type Safety First

Every layer has TypeScript:
- **Database** → Drizzle infers types from schema
- **Backend** → Server Actions with typed inputs/outputs
- **Frontend** → React components with prop types
- **Forms** → Zod schemas validate runtime data

### Modern React Patterns

- **Server Components** - Default server rendering
- **Client Components** - Only when needed
- **Server Actions** - Type-safe mutations
- **Suspense** - Async data loading

### Developer Experience

- **Hot reload** - Instant feedback (Turbopack)
- **Type inference** - Less manual typing
- **Path aliases** - Clean imports (`@/*`)
- **Component library** - Copy-paste ready components

### Performance

- **Minimal JavaScript** - Server Components reduce bundle
- **Automatic splitting** - Per-route code splitting
- **Image optimization** - Next.js optimizes images
- **Efficient queries** - Drizzle generates optimized SQL

### Open Source

All technologies are:
- ✅ Open source
- ✅ Well-documented
- ✅ Actively maintained
- ✅ Community-supported

---

## Next Steps

- 🏗️ **[Architecture Overview](Architecture-Overview.md)** - See how it all fits together
- 📂 **[Project Structure](Project-Structure.md)** - Navigate the codebase
- 🛠️ **[Development Guide](Development-Guide.md)** - Start building

---

**Questions?** Check our [GitHub Discussions](https://github.com/your-username/trilhos/discussions) or explore the [Component Reference](Component-Reference.md).
