import { Suspense } from 'react';
import type { Metadata } from 'next';
import PlacesSection from '@/components/home/PlacesSection';
import { PlaceCardSkeleton } from '@/components/places/PlaceCard';

const BASE_URL = 'https://mongolia-reso.vercel.app/';

interface PlacesPageProps {
  searchParams: {
    type?: string;
    search?: string;
    province?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
    sort?: string;
  };
}

export async function generateMetadata({ searchParams }: PlacesPageProps): Promise<Metadata> {
  const type = searchParams.type;
  const province = searchParams.province;
  const search = searchParams.search;

  let title = 'Бүх газрууд';
  let description = 'Монголын амралтын газар болон байгалийн үзэсгэлэнт газруудыг хайх';

  if (type === 'resort') {
    title = 'Амралтын газрууд';
    description = 'Монголын шилдэг амралтын газруудыг хайж, онлайн захиалаарай. Бүх аймгаар хайх боломжтой.';
  } else if (type === 'nature') {
    title = 'Байгалийн үзэсгэлэнт газрууд';
    description = 'Монголын байгалийн гайхамшигт газруудыг нэг дороос олж аялалаа төлөвлөөрэй.';
  }

  if (province) {
    title = `${province} — ${title}`;
    description = `${province} аймгийн ${type === 'resort' ? 'амралтын газрууд' : 'байгалийн үзэсгэлэнт газрууд'}. Онлайн захиалга хийх боломжтой.`;
  }

  if (search) {
    title = `"${search}" — хайлтын үр дүн`;
  }

  const canonical = new URL(`${BASE_URL}/places`);
  if (type) canonical.searchParams.set('type', type);
  if (province) canonical.searchParams.set('province', province);

  return {
    title,
    description,
    alternates: { canonical: canonical.toString() },
    openGraph: {
      title: `${title} | Монгол Нутаг`,
      description,
      url: canonical.toString(),
    },
  };
}

function PlacesSkeleton() {
  return (
    <section className="page-container py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <PlaceCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export default function PlacesPage({ searchParams }: PlacesPageProps) {
  return (
    <Suspense fallback={<PlacesSkeleton />}>
      <PlacesSection searchParams={searchParams} />
    </Suspense>
  );
}
