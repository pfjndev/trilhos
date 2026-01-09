import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  async headers() {
    const devOrigin = process.env.DEV_CORS_ORIGIN ?? "local-origin.dev";
    // In production, do not fall back to the development origin; use an explicit value or a safe default.
    const prodOrigin = process.env.CORS_ALLOWED_ORIGIN ?? "";
    const corsOrigin = process.env.NODE_ENV === "production" ? prodOrigin : devOrigin;
    
    const commonHeaders = [
      { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
      { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
    ];
    
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: corsOrigin },
          ...commonHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;
