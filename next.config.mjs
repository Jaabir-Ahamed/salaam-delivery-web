/** @type {import('next').NextConfig} */

/**
 * Next.js Configuration for Salaam Food Pantry Delivery System
 * 
 * This configuration file sets up the Next.js application for production deployment.
 * It includes optimizations for performance, security, and compatibility.
 */

const nextConfig = {
  /**
   * Enable experimental features for better performance
   * - optimizePackageImports: Optimizes package imports for smaller bundles
   */
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  /**
   * Image optimization settings
   * - domains: Allow images from external domains (Salaam Food Pantry logo)
   * - formats: Support modern image formats for better performance
   */
  images: {
    domains: ['images.squarespace-cdn.com'],
    formats: ['image/webp', 'image/avif'],
  },

  /**
   * Security headers for production deployment
   * - X-Frame-Options: Prevent clickjacking attacks
   * - X-Content-Type-Options: Prevent MIME type sniffing
   * - Referrer-Policy: Control referrer information
   * - Permissions-Policy: Control browser features
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  /**
   * Redirects for better user experience
   * - Redirect root to dashboard for authenticated users
   * Note: Disabled for development to prevent routing conflicts
   */
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/dashboard',
  //       permanent: false,
  //     },
  //   ]
  // },

  /**
   * Webpack configuration for optimizations
   * - Bundle analyzer for development (optional)
   */
  webpack: (config, { dev, isServer }) => {
    // Add bundle analyzer in development (optional)
    if (dev && !isServer) {
      // Uncomment to analyze bundle size
      // const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      // config.plugins.push(
      //   new BundleAnalyzerPlugin({
      //     analyzerMode: 'static',
      //     openAnalyzer: false,
      //   })
      // )
    }

    return config
  },

  /**
   * TypeScript configuration
   * - Enable strict type checking
   */
  typescript: {
    // Enable type checking during build
    ignoreBuildErrors: false,
  },

  /**
   * ESLint configuration
   * - Enable linting during build
   */
  eslint: {
    // Enable ESLint during build
    ignoreDuringBuilds: false,
  },

  /**
   * Output configuration for static export (if needed)
   * - Uncomment for static site generation
   */
  // output: 'export',

  /**
   * Trailing slash configuration
   * - Disabled for cleaner URLs
   */
  trailingSlash: false,

  /**
   * Powered by header
   * - Disabled for security
   */
  poweredByHeader: false,
}

export default nextConfig
