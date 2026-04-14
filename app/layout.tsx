import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const BASE_URL = 'https://mongolia-reso.vercel.app/'; // Custom domain тавьсны дараа өөрчил

export const viewport: Viewport = {
  themeColor: '#1a4731',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'Монгол Нутаг — Амралт & Байгалийн Үзэсгэлэн',
    template: '%s | Монгол Нутаг',
  },

  description:
    'Монголын хамгийн том амралтын платформ. Хөвсгөл, Баян-Өлгий, Өмнөговь болон бусад аймгийн амралтын газар, байгалийн үзэсгэлэнт газруудыг нэг дороос хайж, онлайн захиалаарай.',

  keywords: [
    'монгол амралт',
    'монголын амралтын газар',
    'байгалийн үзэсгэлэн монгол',
    'хөвсгөл аяллын газар',
    'монгол нутаг',
    'resort mongolia',
    'mongolia nature travel',
    'монгол захиалга',
    'амралтын газар захиалах',
  ],

  authors: [{ name: 'Монгол Нутаг', url: BASE_URL }],
  creator: 'Монгол Нутаг',
  publisher: 'Монгол Нутаг',

  // Google Search Console verification
  verification: {
    google: 'H7wLte1yCA4rtrUPTPfz-oZv79ML-WFZ29',
  },

  // Canonical + alternates
  alternates: {
    canonical: BASE_URL,
    languages: { 'mn-MN': BASE_URL },
  },

  // Open Graph — social share
  openGraph: {
    type: 'website',
    locale: 'mn_MN',
    url: BASE_URL,
    siteName: 'Монгол Нутаг',
    title: 'Монгол Нутаг — Амралт & Байгалийн Үзэсгэлэн',
    description:
      'Монголын хамгийн том амралтын платформ. Амралтын газар, байгалийн үзэсгэлэнт газруудыг нэг дороос хайж захиалаарай.',
    images: [
      {
        url: '/og-default.jpg', // /public/og-default.jpg — 1200x630px зураг тавь
        width: 1200,
        height: 630,
        alt: 'Монгол Нутаг — Монголын хамгийн том амралтын платформ',
      },
    ],
  },

  // Twitter / X card
  twitter: {
    card: 'summary_large_image',
    title: 'Монгол Нутаг — Амралт & Байгалийн Үзэсгэлэн',
    description: 'Монголын амралтын газар, байгалийн үзэсгэлэнт газруудыг нэг дороос хайж захиалаарай.',
    images: ['/og-default.jpg'],
  },

  // Favicon / icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },

  // PWA manifest
  manifest: '/manifest.json',

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'Outfit', sans-serif",
              fontSize: '14px',
              borderRadius: '12px',
              background: '#0f2d1e',
              color: '#f9f4ed',
              border: '1px solid rgba(255,255,255,0.08)',
            },
            success: { iconTheme: { primary: '#4fa377', secondary: '#f9f4ed' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#f9f4ed' } },
          }}
        />
      </body>
    </html>
  );
}
