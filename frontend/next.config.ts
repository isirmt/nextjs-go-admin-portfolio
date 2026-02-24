import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: false,
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
