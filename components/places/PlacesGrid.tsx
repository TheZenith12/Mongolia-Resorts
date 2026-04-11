'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import PlaceCard from './PlaceCard';
import { toggleLike } from '@/lib/actions/auth';
import { toast } from 'react-hot-toast';
import type { Place } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlacesGridProps {
  places: Place[];
  likedIds: string[];
  pagination: { page: number; totalPages: number; count: number };
  searchParams: Record<string, string | undefined>;
}

export default function PlacesGrid({ places, likedIds, pagination, searchParams }: PlacesGridProps) {
  const router = useRouter();
  const [liked, setLiked] = useState<Set<string>>(new Set(likedIds));
  // Optimistic like_count: place.id -> current count
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(
    Object.fromEntries(places.map((p) => [p.id, p.like_count]))
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleLike(placeId: string) {
    if (loadingId) return; // prevent double-click
    setLoadingId(placeId);

    // Optimistic update
    const wasLiked = liked.has(placeId);
    setLiked((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(placeId); else next.add(placeId);
      return next;
    });
    setLikeCounts((prev) => ({
      ...prev,
      [placeId]: Math.max(0, (prev[placeId] ?? 0) + (wasLiked ? -1 : 1)),
    }));

    try {
      const result = await toggleLike(placeId);
      // Sync with server result (in case of mismatch)
      setLiked((prev) => {
        const next = new Set(prev);
        if (result) next.add(placeId); else next.delete(placeId);
        return next;
      });
      toast.success(result ? '❤️ Хадгаллаа' : 'Хадгалалтаас хасагдлаа');
    } catch {
      // Rollback on error
      setLiked((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(placeId); else next.delete(placeId);
        return next;
      });
      setLikeCounts((prev) => ({
        ...prev,
        [placeId]: Math.max(0, (prev[placeId] ?? 0) + (wasLiked ? 1 : -1)),
      }));
      toast.error('Нэвтрэх шаардлагатай');
      router.push('/auth/login');
    } finally {
      setLoadingId(null);
    }
  }

  if (!places.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <SearchX size={48} className="text-forest-200 mb-4" />
        <h3 className="font-display text-2xl font-semibold text-forest-700 mb-2">
          Газар олдсонгүй
        </h3>
        <p className="text-forest-500 text-sm">
          Хайлтын нөхцөлийг өөрчлөөд дахин оролдоно уу
        </p>
      </div>
    );
  }

  function buildPageUrl(page: number) {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v != null)) as Record<string, string>
    );
    params.set('page', String(page));
    return `/places?${params.toString()}`;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place, i) => (
          <div
            key={place.id}
            className="animate-fade-up opacity-0"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
          >
            <PlaceCard
              place={{ ...place, like_count: likeCounts[place.id] ?? place.like_count }}
              liked={liked.has(place.id)}
              onLike={handleLike}
              likeLoading={loadingId === place.id}
            />
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <a
            href={buildPageUrl(pagination.page - 1)}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-xl border transition-colors',
              pagination.page <= 1
                ? 'border-forest-100 text-forest-300 cursor-not-allowed pointer-events-none'
                : 'border-forest-200 text-forest-600 hover:bg-forest-50'
            )}
          >
            <ChevronLeft size={18} />
          </a>

          {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => {
            const p = i + 1;
            return (
              <a
                key={p}
                href={buildPageUrl(p)}
                className={cn(
                  'w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium border transition-colors',
                  p === pagination.page
                    ? 'bg-forest-700 text-white border-forest-700'
                    : 'border-forest-200 text-forest-600 hover:bg-forest-50'
                )}
              >
                {p}
              </a>
            );
          })}

          <a
            href={buildPageUrl(pagination.page + 1)}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-xl border transition-colors',
              pagination.page >= pagination.totalPages
                ? 'border-forest-100 text-forest-300 cursor-not-allowed pointer-events-none'
                : 'border-forest-200 text-forest-600 hover:bg-forest-50'
            )}
          >
            <ChevronRight size={18} />
          </a>
        </div>
      )}
    </>
  );
}
