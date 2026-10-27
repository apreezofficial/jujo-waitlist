import { ImageResponse } from 'next/og';

export const alt = 'Jujo – sell more without big ad budgets. Join the waitlist.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: 'linear-gradient(135deg, #eaf6ff 0%, #bfe0ff 55%, #5eaeff 100%)',
          color: '#0f1a24',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: '#111418',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontWeight: 800,
              color: '#ffffff',
            }}
          >
            J
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>Jujo</div>
        </div>
        <div style={{ fontSize: 74, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2, maxWidth: 960 }}>
          Growth is coming. Built for Nigerian businesses.
        </div>
        <div style={{ fontSize: 30, marginTop: 28, color: '#334155', maxWidth: 900 }}>
          Join the waitlist and be first to try Jujo.
        </div>
      </div>
    ),
    size
  );
}