'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, Tent, Leaf, Eye } from 'lucide-react';
import { MONGOLIAN_PROVINCES } from '@/lib/types';
import type { SiteStats } from '@/lib/types';
import { cn } from '@/lib/utils';
import SearchAutocomplete from '@/components/search/SearchAutocomplete';
import { useLang } from '@/lib/lang-context';

interface HeroSectionProps {
  stats: SiteStats;
}

export default function HeroSection({ stats }: HeroSectionProps) {
  const router = useRouter();
  const { tr } = useLang();
  const [search, setSearch]     = useState('');
  const [type, setType]         = useState<'all' | 'resort' | 'nature'>('all');
  const [province, setProvince] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  function buildParams() {
    const params = new URLSearchParams();
    if (search)          params.set('search', search);
    if (type !== 'all')  params.set('type', type);
    if (province)        params.set('province', province);
    if (minPrice)        params.set('minPrice', minPrice);
    if (maxPrice)        params.set('maxPrice', maxPrice);
    return params.toString();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/places?${buildParams()}`);
  }

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/13.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/60 via-forest-950/40 to-forest-950/80" />
        {/* Decorative grain */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
        />
      </div>

      <div className="relative z-10 page-container w-full pt-20 pb-16">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-400/20 border border-amber-400/30 rounded-full mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 text-xs font-medium tracking-wide">
              {stats.total_places}+ {tr('hero_badge')}
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[1.08] mb-6 animate-fade-up">
            {tr('hero_heading1')} <br />
            <span className="text-amber-300 italic">{tr('hero_heading2')}</span> {tr('hero_heading3')} <br />
            {tr('hero_heading4')}
          </h1>

          <p className="text-forest-200 text-lg leading-relaxed mb-10 max-w-xl animate-fade-up delay-200">
            {tr('hero_sub')}
          </p>

          {/* Search form */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 animate-fade-up delay-300">
            {/* Type filter */}
            <div className="flex gap-2 mb-4">
              {[
                { value: 'all',    label: tr('hero_all') },
                { value: 'resort', label: tr('hero_resort') },
                { value: 'nature', label: tr('hero_nature') },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value as any)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    type === opt.value
                      ? 'bg-white text-forest-800 shadow-sm'
                      : 'text-white/80 hover:bg-white/10'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {/* Name search — autocomplete */}
                <SearchAutocomplete
                  value={search}
                  onChange={setSearch}
                  onSearch={() => router.push(`/places?${buildParams()}`)}
                  className="sm:col-span-1"
                />

                {/* Province */}
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-400/40 appearance-none"
                  >
                    <option value="">{tr('hero_province')}</option>
                    {MONGOLIAN_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
                </div>

                {/* Price range */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400 text-xs">₮</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder={tr('hero_min_price')}
                      className="w-full pl-7 pr-2 py-3 bg-white rounded-xl text-sm text-forest-900 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-400/40"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400 text-xs">₮</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder={tr('hero_max_price')}
                      className="w-full pl-7 pr-2 py-3 bg-white rounded-xl text-sm text-forest-900 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-400/40"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-amber w-full py-3.5">
                <Search size={16} />
                {tr('hero_search')}
              </button>
            </form>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8 mt-12 animate-fade-up delay-500">
          {[
            { value: stats.total_resorts, label: tr('stat_resorts'), icon: <Tent  size={22} /> },
            { value: stats.total_nature,  label: tr('stat_nature'),  icon: <Leaf  size={22} /> },
            { value: stats.total_views,   label: tr('stat_views'),   icon: <Eye   size={22} /> },
          ].map((s) => (
            <div key={s.label} className="text-white">
              <div className="flex items-center gap-2 font-display text-3xl font-semibold text-amber-300">
                <span className="text-amber-300">{s.icon}</span>
                {s.value.toLocaleString()}
              </div>
              <div className="text-forest-300 text-sm mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-7 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
