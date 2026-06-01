'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Globe, Tent, Leaf, Star } from 'lucide-react';
import { MONGOLIAN_PROVINCES } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/lang-context';

interface PlacesFilterSidebarProps {
  current: {
    type?: string; province?: string; minPrice?: string; maxPrice?: string;
    minRating?: string; search?: string;
  };
}

export default function PlacesFilterSidebar({ current }: PlacesFilterSidebarProps) {
  const router = useRouter();
  const { tr } = useLang();

  const [type, setType]           = useState(current.type ?? '');
  const [province, setProvince]   = useState(current.province ?? '');
  const [minPrice, setMinPrice]   = useState(current.minPrice ?? '');
  const [maxPrice, setMaxPrice]   = useState(current.maxPrice ?? '');
  const [minRating, setMinRating] = useState(current.minRating ?? '');
  const [priceOpen, setPriceOpen] = useState(true);
  const [provOpen, setProvOpen]   = useState(true);
  const [ratingOpen, setRatingOpen] = useState(true);

  const activeCount = [type, province, minPrice, maxPrice, minRating].filter(Boolean).length;

  const RATING_OPTIONS = [
    { value: '',  label: tr('filter_rating_all') },
    { value: '4', label: '4+' },
    { value: '3', label: '3+' },
    { value: '2', label: '2+' },
  ];

  function apply() {
    const params = new URLSearchParams();
    if (type)      params.set('type', type);
    if (province)  params.set('province', province);
    if (minPrice)  params.set('minPrice', minPrice);
    if (maxPrice)  params.set('maxPrice', maxPrice);
    if (minRating) params.set('minRating', minRating);
    if (current.search) params.set('search', current.search);
    router.push(`/places?${params.toString()}`);
  }

  function reset() {
    setType(''); setProvince(''); setMinPrice(''); setMaxPrice(''); setMinRating('');
    router.push('/places');
  }

  return (
    <div className="card p-5 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 font-semibold text-forest-900">
          <SlidersHorizontal size={16} /> {tr('filter_title')}
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-forest-700 text-white text-[10px] flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={reset} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
            <X size={12} /> {tr('filter_reset')}
          </button>
        )}
      </div>

      {/* Type filter */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-forest-500 uppercase tracking-wide mb-2.5">
          {tr('filter_type')}
        </label>
        <div className="space-y-2">
          {[
            { value: '',       label: tr('filter_all'),    icon: <Globe size={14} /> },
            { value: 'resort', label: tr('filter_resort'), icon: <Tent  size={14} /> },
            { value: 'nature', label: tr('filter_nature'), icon: <Leaf  size={14} /> },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all',
                type === opt.value
                  ? 'bg-forest-700 text-white font-medium'
                  : 'text-forest-600 hover:bg-forest-50'
              )}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Province filter */}
      <div className="mb-5 border-t border-forest-100 pt-5">
        <button
          onClick={() => setProvOpen(!provOpen)}
          className="w-full flex items-center justify-between text-xs font-semibold text-forest-500 uppercase tracking-wide mb-2.5"
        >
          {tr('filter_province')}
          {provOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {provOpen && (
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="input-field text-sm py-2"
          >
            <option value="">{tr('filter_all_prov')}</option>
            {MONGOLIAN_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}
      </div>

      {/* Rating filter */}
      <div className="mb-5 border-t border-forest-100 pt-5">
        <button
          onClick={() => setRatingOpen(!ratingOpen)}
          className="w-full flex items-center justify-between text-xs font-semibold text-forest-500 uppercase tracking-wide mb-2.5"
        >
          {tr('filter_rating')}
          {ratingOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {ratingOpen && (
          <div className="space-y-1.5">
            {RATING_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setMinRating(opt.value)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left transition-all',
                  minRating === opt.value
                    ? 'bg-amber-500 text-white font-medium'
                    : 'text-forest-600 hover:bg-forest-50'
                )}
              >
                {opt.value ? <Star size={12} className={minRating === opt.value ? 'fill-white' : 'fill-amber-400 text-amber-400'} /> : null}
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price range */}
      <div className="mb-5 border-t border-forest-100 pt-5">
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="w-full flex items-center justify-between text-xs font-semibold text-forest-500 uppercase tracking-wide mb-2.5"
        >
          {tr('filter_price')}
          {priceOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {priceOpen && (
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400 text-xs">₮</span>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder={tr('hero_min_price')}
                className="input-field pl-7 text-sm py-2"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400 text-xs">₮</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder={tr('hero_max_price')}
                className="input-field pl-7 text-sm py-2"
              />
            </div>
          </div>
        )}
      </div>

      <button onClick={apply} className="btn-primary w-full text-sm">
        {tr('filter_apply')}
      </button>
    </div>
  );
}
