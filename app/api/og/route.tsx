import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Default Open Graph / Twitter share image (1200×630), QEV-branded.
 * Used as the fallback preview for pages without their own image (home, cars,
 * brands, country pages). Detail pages (listings/news) override with their real
 * photo. Latin-only text so it renders without bundling an Arabic font.
 */
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #060d20 0%, #0e3a8a 48%, #1aa6e8 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand mark — the four dots used across the site */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 34 }}>
          {[1, 0.78, 0.56, 0.34].map((o, i) => (
            <div key={i} style={{ width: 26, height: 26, borderRadius: 999, background: 'white', opacity: o }} />
          ))}
        </div>

        <div style={{ fontSize: 168, fontWeight: 900, letterSpacing: 8, lineHeight: 1 }}>QEV</div>
        <div style={{ fontSize: 44, fontWeight: 700, marginTop: 18, opacity: 0.95 }}>
          Electric &amp; Chinese Cars
        </div>
        <div style={{ fontSize: 30, marginTop: 22, opacity: 0.72 }}>
          News · Models · Marketplace · qev.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
