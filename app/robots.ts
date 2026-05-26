import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          // Search param-тай хуудасны duplicate-г хаана
          '/*?search=*',
          '/*?page=*',
          '/*?minPrice=*',
          '/*?maxPrice=*',
          '/*?minRating=*',
          '/*?sort=*',
          '/*?tab=*',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
