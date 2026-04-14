import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase-server';

const BASE_URL = 'https://mongolia-reso.vercel.app/';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  // Бүх published газруудыг авах
  const { data: places } = await admin
    .from('places')
    .select('id, updated_at, type')
    .eq('is_published', true);

  const placeUrls: MetadataRoute.Sitemap = (places ?? []).map((place) => ({
    url: `${BASE_URL}/places/${place.id}`,
    lastModified: new Date(place.updated_at),
    changeFrequency: 'weekly',
    priority: place.type === 'resort' ? 0.9 : 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/places`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/places?type=resort`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/places?type=nature`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/map`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...placeUrls,
  ];
}
