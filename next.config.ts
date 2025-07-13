import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Content-Type, Accept, Authorization, x-api-key, Mcp-Session-Id, Last-Event-ID",
          },
          {
            key: "Access-Control-Expose-Headers",
            value: "Content-Type, Authorization, x-api-key, Mcp-Session-Id",
          },
          { key: "Cache-Control", value: "no-cache, no-transform" },
          { key: "Connection", value: "keep-alive" },
        ],
      },
    ];
  },
};

export default nextConfig;
