/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: (process.env.ALLOWED_IMAGE_DOMAINS || "")
      .split(",")
      .map((domain) => domain.trim())
      .filter(Boolean)
      .map((domain) => ({
        protocol: "https",
        hostname: domain,
      })),
  },
  eslint: {
    // Lint is run explicitly in CI; don't fail production builds on style.
    ignoreDuringBuilds: true,
  },
  // Standalone output is for the Dockerfile, which copies .next/standalone and
  // runs server.js. Vercel builds its own serverless output and this setting
  // only gets in the way there, so the Docker build opts in explicitly
  // (BUILD_STANDALONE=true) rather than every build paying for it.
  ...(process.env.BUILD_STANDALONE === "true" ? { output: "standalone" } : {}),
}

export default nextConfig
