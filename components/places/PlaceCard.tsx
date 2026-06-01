'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Eye, Heart, Tent, Leaf, ArrowRight } from 'lucide-react';
import { cn, formatPrice, getPlaceTypeLabel } from '@/lib/utils';
import type { Place } from '@/lib/types';
import { useLang } from '@/lib/lang-context';

interface PlaceCardProps {
  place: Place;
  liked?: boolean;
  onLike?: (id: string) => void;
  likeLoading?: boolean;
  className?: string;
}

export default function PlaceCard({ place, liked = false, onLike, likeLoading = false, className }: PlaceCardProps) {
  const { tr } = useLang();
  const isResort = place.type === 'resort';

  return (
    <article className={cn('card card-hover group relative', className)}>
      {/* Image */}
      <div className="relative h-32 sm:h-52 overflow-hidden bg-forest-100">
        {place.cover_image ? (
          <Image
            src={place.cover_image}
            alt={place.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-forest-100">
            {isResort
              ? <Tent size={48} className="text-forest-300" />
              : <Leaf size={48} className="text-forest-300" />}
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent" />

        {/* Type badge */}
        <div className={cn(
          'absolute top-2 left-2 badge text-[10px] sm:top-3 sm:left-3 sm:text-[11px]',
          isResort
            ? 'bg-amber-50/90 text-amber-800 border-amber-200/60'
            : 'bg-forest-50/90 text-forest-700 border-forest-200/60'
        )}>
          {isResort ? <Tent size={10} /> : <Leaf size={10} />} {getPlaceTypeLabel(place.type)}
        </div>

        {/* Like button */}
        {onLike && (
          <button
            onClick={(e) => { e.preventDefault(); if (!likeLoading) onLike(place.id); }}
            disabled={likeLoading}
            className={cn(
              'absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center',
              'transition-all duration-200 backdrop-blur-sm',
              likeLoading ? 'opacity-60 cursor-not-allowed bg-white/80' :
              liked
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-forest-400 hover:text-red-500'
            )}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Price badge (resort only) */}
        {isResort && place.price_per_night && (
          <div className="absolute bottom-3 left-3 glass px-2.5 py-1 rounded-lg">
            <span className="text-forest-900 text-xs font-semibold">
              {formatPrice(place.price_per_night)}
              <span className="text-forest-500 font-normal"> {tr('per_night')}</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-4">
        <h3 className="font-display text-sm sm:text-xl font-semibold text-forest-900 leading-tight mb-1 sm:mb-1.5 line-clamp-2">
          {place.name}
        </h3>

        {/* Location */}
        {place.province && (
          <div className="flex items-center gap-1 text-forest-500 text-[10px] sm:text-xs mb-1.5 sm:mb-2">
            <MapPin size={10} className="flex-shrink-0" />
            <span className="truncate">{place.province}</span>
          </div>
        )}

        {/* Description — мобайлд нуунa */}
        {place.short_desc && (
          <p className="hidden sm:block text-forest-600 text-sm leading-relaxed line-clamp-2 mb-3">
            {place.short_desc}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-forest-100">
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Rating */}
            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs">
              <Star size={10} className="text-amber-400 fill-amber-400" />
              <span className="font-semibold text-forest-800">
                {place.rating_avg > 0 ? place.rating_avg.toFixed(1) : '—'}
              </span>
            </div>

            {/* Likes */}
            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-forest-400">
              <Heart size={10} />
              <span>{place.like_count}</span>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/places/${place.slug ?? place.id}`}
            className="flex items-center gap-0.5 text-forest-700 text-[10px] sm:text-xs font-medium hover:text-forest-900 transition-colors"
          >
            <span className="hidden sm:inline">{tr('view_detail')}</span>
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </article>
  );
}

// Skeleton loader
export function PlaceCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-32 sm:h-52 shimmer-loading" />
      <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3">
        <div className="h-6 w-3/4 shimmer-loading rounded-lg" />
        <div className="h-4 w-1/2 shimmer-loading rounded-lg" />
        <div className="h-4 w-full shimmer-loading rounded-lg" />
        <div className="h-4 w-2/3 shimmer-loading rounded-lg" />
      </div>
    </div>
  );
}
