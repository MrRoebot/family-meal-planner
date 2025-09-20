import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
  // Ensure static optimization for pages without getServerSideProps
  staticPageGenerationTimeout: 60,
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  // Build performance optimizations
  poweredByHeader: false,
};

export default nextConfig;
