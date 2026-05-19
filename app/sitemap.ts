export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 цаг тутамд шинэчлэнэ

import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Place } from '@/lib/models';
import { BASE_URL } from '@/lib/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await connectDB();
    const docs = await Place.find({ is_published: true })
      .select('_id slug updated_at type')
      .lean();

    const placeUrls: MetadataRoute.Sitemap = docs.map((place: any) => ({
      url:             `${BASE_URL}/places/${place.slug ?? place._id.toString()}`,
      lastModified:    new Date(place.updated_at ?? Date.now()),
      changeFrequency: 'weekly',
      priority:        place.type === 'resort' ? 0.9 : 0.8,
    }));

    return [
      { url: BASE_URL,                         lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
      { url: `${BASE_URL}/places`,             lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
      { url: `${BASE_URL}/places?type=resort`, lastModified: new Date(), changeFrequency: 'daily',  priority: 0.85 },
      { url: `${BASE_URL}/places?type=nature`, lastModified: new Date(), changeFrequency: 'daily',  priority: 0.85 },
      { url: `${BASE_URL}/map`,                lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
      ...placeUrls,
    ];
  } catch {
    return [
      { url: BASE_URL,             lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
      { url: `${BASE_URL}/places`, lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
    ];
  }
}
