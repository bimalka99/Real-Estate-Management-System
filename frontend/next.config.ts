import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Backend's local file storage for uploaded property photos (dev only —
        // swap/remove once image storage moves to a cloud host).
        protocol: "http",
        hostname: "localhost",
        port: "5112",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
