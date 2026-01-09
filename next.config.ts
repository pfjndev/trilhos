import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    const devOrigin = process.env.DEV_CORS_ORIGIN ?? "http://localhost:3000";
    const prodOrigin = process.env.CORS_ALLOWED_ORIGIN ?? devOrigin;
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
