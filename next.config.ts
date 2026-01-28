import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Optimize for performance as per SRS requirements (3s load time)
  experimental: {
    optimizePackageImports: ["lucide-react", "@monaco-editor/react"],
  },
};

export default nextConfig;
