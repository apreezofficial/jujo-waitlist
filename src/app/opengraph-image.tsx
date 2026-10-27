import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';

export const alt =
  'Jujo AI helps businesses grow their socials and turn leads into sales.';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const logo = await readFile(
    join(process.cwd(), 'public', 'jujo-mark.png')
  );

  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          padding: '64px 76px',
          background:
            'linear-gradient(135deg, #effcf4 0%, #d9f5e4 48%, #9ee3b7 100%)',
          color: '#063b29',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 520,
            height: 520,
            right: -160,
            top: -170,
            borderRadius: '50%',
            background: 'rgba(0, 150, 73, 0.16)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: 360,
            height: 360,
            right: 80,
            bottom: -250,
            borderRadius: '50%',
            background: 'rgba(0, 107, 56, 0.14)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: 14,
            height: 760,
            left: 900,
            top: -80,
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.42)',
            transform: 'rotate(22deg)',
          }}
        />

        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <img src={logoSrc} width={62} height={54} alt="" />

            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: -1,
              }}
            >
              Jujo
            </div>

            <div
              style={{
                marginLeft: 8,
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(255, 255, 255, 0.68)',
                color: '#007c3e',
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              AI for business
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: 880,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: 74,
                fontWeight: 800,
                lineHeight: 1.03,
                letterSpacing: -3,
              }}
            >
              <span>Grow your socials.</span>
              <span>Turn leads into sales.</span>
            </div>

            <div
              style={{
                display: 'flex',
                maxWidth: 820,
                marginTop: 28,
                color: '#285843',
                fontSize: 27,
                lineHeight: 1.35,
              }}
            >
              Jujo AI is your professional business assistant, helping you
              grow online and convert more customers without disrupting how
              your business works.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              padding: '15px 24px',
              borderRadius: 999,
              background: '#063b29',
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            Join the waitlist
          </div>
        </div>
      </div>
    ),
    size
  );
}
