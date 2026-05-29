'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import Map, { Marker, Popup, NavigationControl, type MapRef } from 'react-map-gl/maplibre';
import { MapPin, X, ArrowRight, Star, Search } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import type { Place } from '@/lib/types';
import 'maplibre-gl/dist/maplibre-gl.css';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

// Монгол улсын төв
const MONGOLIA_CENTER = { lng: 103.8467, lat: 46.8625 };

interface Props {
  places: Place[];
}

export default function MapPageClient({ places }: Props) {
  const mapRef = useRef<MapRef>(null);
  const [selected, setSelected]   = useState<Place | null>(null);
  const [filter, setFilter]       = useState<'all' | 'resort' | 'nature'>('all');
  const [search, setSearch]       = useState('');
  const [viewState, setViewState] = useState({ longitude: MONGOLIA_CENTER.lng, latitude: MONGOLIA_CENTER.lat, zoom: 5 });

  const filtered = useMemo(() =>
    places.filter(p =>
      p.latitude && p.longitude &&
      p.latitude  >= -90  && p.latitude  <= 90  &&
      p.longitude >= -180 && p.longitude <= 180 &&
      (filter === 'all' || p.type === filter) &&
      (search ? p.name.toLowerCase().includes(search.toLowerCase()) : true)
    ),
    [places, filter, search]
  );

  function flyTo(place: Place) {
    if (!place.latitude || !place.longitude) return;
    mapRef.current?.flyTo({ center: [place.longitude, place.latitude], zoom: 12, duration: 800 });
  }

  function handleSelect(place: Place) {
    setSelected(prev => prev?.id === place.id ? null : place);
    flyTo(place);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Controls */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-forest-100 flex-wrap">
        <h1 className="font-display text-xl font-semibold text-forest-900">Газрын зураг</h1>

        <div className="flex gap-1.5 ml-2">
          {[
            { value: 'all',    label: 'Бүгд' },
            { value: 'resort', label: '🏕 Амралт' },
            { value: 'nature', label: '🌿 Байгаль' },
          ].map(opt => (
            <button key={opt.value} onClick={() => setFilter(opt.value as any)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filter === opt.value ? 'bg-forest-700 text-white' : 'bg-forest-50 text-forest-600 hover:bg-forest-100'
              )}>
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Газар хайх..." className="input-field pl-8 w-44 text-sm py-1.5" />
        </div>

        <span className="text-xs text-forest-500">{filtered.length} газар</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden sm:block w-64 bg-white border-r border-forest-100 overflow-y-auto flex-shrink-0">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-forest-400 text-sm">
              <MapPin size={28} className="mx-auto mb-2 opacity-40" /> Газар олдсонгүй
            </div>
          ) : (
            <div className="divide-y divide-forest-50">
              {filtered.map(place => (
                <button key={place.id} onClick={() => handleSelect(place)}
                  className={cn(
                    'w-full flex items-start gap-3 p-4 text-left transition-all hover:bg-forest-50',
                    selected?.id === place.id ? 'bg-forest-50 border-l-2 border-forest-600' : ''
                  )}>
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm',
                    place.type === 'resort' ? 'bg-amber-50' : 'bg-forest-50')}>
                    {place.type === 'resort' ? '🏕' : '🌿'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-forest-900 text-sm leading-tight truncate">{place.name}</div>
                    {place.province && (
                      <div className="flex items-center gap-1 text-forest-400 text-xs mt-0.5">
                        <MapPin size={10} /> {place.province}
                      </div>
                    )}
                    {place.rating_avg > 0 && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                        <Star size={10} fill="currentColor" /> {place.rating_avg.toFixed(1)}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={e => setViewState(e.viewState)}
            mapStyle={STYLE_URL}
            style={{ width: '100%', height: '100%' }}
            attributionControl={false}
          >
            <NavigationControl position="top-right" />

            {filtered.map(place => (
              <Marker
                key={place.id}
                longitude={place.longitude!}
                latitude={place.latitude!}
                anchor="bottom"
                onClick={e => { e.originalEvent.stopPropagation(); handleSelect(place); }}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-sm cursor-pointer transition-transform hover:scale-110',
                  selected?.id === place.id ? 'scale-125' : '',
                  place.type === 'resort' ? 'bg-amber-500' : 'bg-forest-600'
                )}>
                  {place.type === 'resort' ? '🏕' : '🌿'}
                </div>
              </Marker>
            ))}

            {selected && selected.latitude && selected.longitude && (
              <Popup
                longitude={selected.longitude}
                latitude={selected.latitude}
                anchor="top"
                onClose={() => setSelected(null)}
                closeButton={false}
                offset={16}
              >
                <div className="w-64 p-3">
                  <button onClick={() => setSelected(null)}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                    <X size={11} />
                  </button>
                  <div className="flex gap-3 mb-3">
                    {selected.cover_image ? (
                      <img src={selected.cover_image} alt={selected.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-forest-50 flex items-center justify-center text-2xl flex-shrink-0">
                        {selected.type === 'resort' ? '🏕' : '🌿'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-forest-900 text-sm leading-tight">{selected.name}</div>
                      {selected.province && (
                        <div className="text-xs text-forest-400 mt-0.5">{selected.province}</div>
                      )}
                      {selected.price_per_night && (
                        <div className="text-sm font-semibold text-amber-600 mt-1">
                          {formatPrice(selected.price_per_night)}/шөнө
                        </div>
                      )}
                      {selected.rating_avg > 0 && (
                        <div className="flex items-center gap-1 text-xs text-amber-500 mt-0.5">
                          <Star size={10} fill="currentColor" /> {selected.rating_avg.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-center py-1.5 px-2 rounded-lg border border-forest-200 text-xs text-forest-700 hover:bg-forest-50 transition-colors">
                      Замын заалт
                    </a>
                    <Link href={`/places/${selected.slug ?? selected.id}`}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-forest-700 text-white text-xs hover:bg-forest-600 transition-colors">
                      Дэлгэрэнгүй <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </div>
    </div>
  );
}
