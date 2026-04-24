import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Монгол Нутаг — Амралт & Байгалийн Үзэсгэлэн',
    short_name: 'Монгол Нутаг',
    description: 'Монголын амралтын газар, байгалийн үзэсгэлэнт газруудыг нэг дороос хайж захиалаарай.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9f4ed',
    theme_color: '#1a4731',
    lang: 'mn',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['travel', 'lifestyle'],
  };
}
