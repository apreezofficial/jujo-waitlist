import './global.css';
import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '../lib/site';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: SITE_TITLE,

  description: SITE_DESCRIPTION,

  applicationName: 'Jujo',

  alternates: {
    canonical: '/',
  },

  openGraph: {
    type: 'website',
    siteName: 'Jujo',
    locale: 'en_NG',
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },

  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: '/jujo-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#eaf8f0',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en-NG">
      <body className={`${inter.className} ${display.variable}`}>
        {children}
      </body>
    </html>
  );
}
