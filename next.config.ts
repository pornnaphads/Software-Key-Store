import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/softkeystore-uploads/products/**",
      },
    ],
  },
};

export default nextConfig;
