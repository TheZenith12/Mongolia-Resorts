'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface Suggestion {
  id: string;
  name: string;
  type: 'resort' | 'nature';
  province: string | null;
  cover_image: string | null;
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (v: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  className?: string;
}

export default function SearchAutocomplete({
  value,
  onChange,
  onSearch,
  placeholder = 'Нэрээр хайх...',
  className = '',
}: SearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading]         = useState(false);
  const [open, setOpen]               = useState(false);
  const [active, setActive]           = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const router      = useRouter();

  // Outside click → close
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 1) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
      setActive(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 280);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      goTo(suggestions[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function goTo(s: Suggestion) {
    setOpen(false);
    router.push(`/places/${s.id}`);
  }

  function handleSubmit() {
    setOpen(false);
    onSearch?.();
  }

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none z-10" />
      {loading && (
        <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-forest-400 animate-spin z-10" />
      )}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-sm text-forest-900 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-400/40"
      />

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-forest-100 shadow-xl z-50 overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(s)}
              onMouseEnter={() => setActive(i)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                active === i ? 'bg-forest-50' : 'hover:bg-forest-50/60'
              }`}
            >
              {s.cover_image ? (
                <img
                  src={s.cover_image}
                  alt={s.name}
                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-forest-100 flex items-center justify-center text-lg flex-shrink-0">
                  {s.type === 'resort' ? '🏕' : '🌿'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-forest-900 truncate">{s.name}</div>
                {s.province && (
                  <div className="flex items-center gap-1 text-xs text-forest-400 mt-0.5">
                    <MapPin size={10} /> {s.province}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-forest-400 flex-shrink-0">
                {s.type === 'resort' ? 'Амралт' : 'Байгаль'}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-forest-500 hover:bg-forest-50 border-t border-forest-100 transition-colors"
          >
            <Search size={13} />
            <span>
              "<span className="font-medium text-forest-700">{value}</span>" хайх
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
