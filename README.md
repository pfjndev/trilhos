# trilhos-next

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Docker with HTTPS

The project includes nginx as a reverse proxy with HTTPS support for testing the Geolocation API on mobile devices.

### First-time setup

Generate a self-signed SSL certificate:

```bash
./nginx/generate-ssl.sh
```

### Run the application

- Production mode with HTTPS:
  - `docker compose up --build`
  - Access via [https://localhost](https://localhost) or https://LAN_IP from your phone
  - Nginx proxies requests to the Next.js app on the `geoloc-docker-network`
  
- Dev mode with hot reload:
  - `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build`
  - Mounts source code for live updates

### Test from your phone (LAN)

1. Generate SSL certificates: `./nginx/generate-ssl.sh`
2. Find your LAN IP (examples: macOS: `ipconfig getifaddr en0`, Linux: `hostname -I`, Windows: `ipconfig`)
3. Start the containers: `docker compose up --build`
4. On your phone, navigate to `https://LAN_IP`
5. Accept the self-signed certificate warning (required for geolocation API)

**Note**: The Geolocation API requires a secure context (HTTPS). Self-signed certificates will show a browser warning that you must accept. For production, use valid certificates from Let's Encrypt or a trusted CA.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
