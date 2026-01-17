/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  // Allow listed origins to access Next.js dev assets (for LAN testing)
  // See: https://nextjs.org/docs/api-reference/next.config.js/allowedDevOrigins
  allowedDevOrigins: ['http://localhost:3000', 'http://192.168.1.2:3000'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'api.example.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 90],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Silence webpack/turbopack config warning - webpack obfuscation only runs in production builds
  turbopack: {},
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path((?!auth/).*)',
        destination: 'http://127.0.0.1:8082/api/:path*',
      },
    ];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Note: webpack-based obfuscation removed because Next.js 16 uses Turbopack/SWC.
  // Keeping build config minimal to avoid incompatible Webpack plugins that
  // interfere with source maps, Sentry, and modern bundlers.
  // Hide source maps in production
  productionBrowserSourceMaps: false,
  // Security headers (HSTS, X-Frame-Options, etc.) — CSP is applied dynamically in middleware
  async headers() {
    const headers = [
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
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'geolocation=(), microphone=(), camera=()',
      },
    ];

    // Add HSTS only in production
    if (process.env.NODE_ENV === 'production') {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      });
    }

    return [
      {
        source: '/(.*)',
        headers,
      },
    ];
  },
  // Add a small webpack alias to shim `next/link` to a compatibility wrapper
  // during development so legacy `<Link><a/></Link>` patterns don't crash.
  webpack: (config, { dev, isServer }) => {
    try {
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias['next/link'] = path.resolve(__dirname, 'compat-next-link.tsx');
    } catch (e) {
      // fall back silently if aliasing fails
    }
    return config;
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

// Make sure adding Sentry options is the last code to run before exporting
module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
