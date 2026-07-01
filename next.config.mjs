import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Serve images straight from Cloudflare (cdn.qev.app) instead of Vercel's
    // Image Optimization, which was returning 402 (monthly quota exhausted) and
    // breaking newly-added covers. Images are already re-encoded + CDN-cached, so
    // Vercel optimization is redundant and costly for an image-heavy catalog.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.qev.app',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.qev.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudflarestorage.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.qev.app';
    return [
      {
        source: '/sitemap.xml',
        destination: `${apiUrl}/sitemap.xml`,
      },
      {
        source: '/robots.txt',
        destination: `${apiUrl}/robots.txt`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
