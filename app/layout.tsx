import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl = 'https://center-this-div.vercel.app';

export const metadata: Metadata = {
  title: 'Can You Center This Div?',
  description: 'The most over-engineered centering challenge on the internet. JARVIS-style HUD. Sub-pixel precision. Global leaderboard. 0 successes. Ever.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: 'Can You Center This Div?',
    description: 'Drag a div to the exact center of the screen. Threshold: 0.0001px. Nobody has ever succeeded.',
    type: 'website',
    url: siteUrl,
    siteName: 'DIV//CENTER',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Can You Center This Div? JARVIS-style HUD with crosshairs, target rings, and a div element slightly off-center.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Can You Center This Div?',
    description: 'Sub-pixel precision centering. 0.0001px threshold. 0 global successes. Ever.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  authors: [{ name: 'RAXXO Studios', url: 'https://raxxo.shop' }],
  keywords: ['center div', 'CSS game', 'centering challenge', 'web game', 'pixel precision', 'CSS centering', 'developer game', 'JARVIS HUD', 'impossible game', 'leaderboard'],
  alternates: { canonical: siteUrl },
  category: 'game',
};

export const viewport: Viewport = {
  themeColor: '#1f1f21',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Can You Center This Div?',
              url: siteUrl,
              description: 'A precision CSS centering game with a 0.0001px success threshold. JARVIS-style HUD, global leaderboard, Earth Scale distance mapping.',
              applicationCategory: 'Game',
              operatingSystem: 'Any',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
              author: { '@type': 'Organization', name: 'RAXXO Studios', url: 'https://raxxo.shop' },
              image: `${siteUrl}/og-image.png`,
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
