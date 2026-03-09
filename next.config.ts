import withPWA from "next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "154.26.131.31" },
      { protocol: "https", hostname: "154.26.131.31" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "api.task.urelaa.com" },
      { protocol: "http", hostname: "api.task.urelaa.com" },
    ],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
