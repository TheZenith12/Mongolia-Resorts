import { Suspense } from 'react';
import type { Metadata } from 'next';
import PlacesSection from '@/components/home/PlacesSection';
import { PlaceCardSkeleton } from '@/components/places/PlaceCard';

export const metadata: Metadata = {
  title: 'Бүх газрууд — Монгол Нутаг',
  description: 'Монголын амралтын газар болон байгалийн үзэсгэлэнт газруудыг хайх',
};

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
