import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // 允许通过 127.0.0.1 / localhost 访问 dev 资源，避免预览面板白屏（Next.js 16 dev 安全策略）
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
