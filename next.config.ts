import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizePackageImports: ["three"],
  },

  // The 2026 rebuild moved the small demos to /lab and gave /projects to the
  // real catalogue. These keep every previously shared link working.
  async redirects() {
    return [
      { source: "/projects/all", destination: "/projects", permanent: true },
      { source: "/websites", destination: "/projects", permanent: true },
      { source: "/FAQ", destination: "/aboutMe", permanent: true },
      { source: "/landingPageExamples", destination: "/lab/pages", permanent: true },
      { source: "/landingPageExamples/:slug", destination: "/lab/pages/:slug", permanent: true },
      { source: "/projects/downloader", destination: "/lab", permanent: true },
      ...["calculator", "dictionary", "ecommerce", "parallax", "perspective", "randomPlayer", "toDo"].map(
        eachSlug => ({
          source: `/projects/${eachSlug}`,
          destination: `/lab/${eachSlug}`,
          permanent: true,
        }),
      ),
    ]
  },
}

export default nextConfig
