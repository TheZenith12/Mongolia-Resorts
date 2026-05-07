'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Facebook, Twitter, MessageCircle, Link2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShareButtonProps {
  title: string;
  url?: string;
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const pageUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl   = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(title);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: pageUrl });
        return;
      } catch {}
    }
    setOpen(!open);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    toast.success('Холбоос хуулагдлаа');
    setTimeout(() => { setCopied(false); setOpen(false); }, 2000);
  }

  const socials = [
    {
      label: 'Facebook',
      icon: <Facebook size={15} />,
      color: 'hover:bg-blue-50 hover:text-blue-600',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: 'Twitter / X',
      icon: <Twitter size={15} />,
      color: 'hover:bg-sky-50 hover:text-sky-500',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      label: 'WhatsApp',
      icon: <MessageCircle size={15} />,
      color: 'hover:bg-green-50 hover:text-green-600',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-forest-200 bg-white text-forest-500 text-sm font-medium hover:border-forest-400 hover:text-forest-700 transition-all"
        title="Хуваалцах"
      >
        <Share2 size={15} /> Хуваалцах
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl border border-forest-100 shadow-xl z-50 py-1.5 overflow-hidden">
          {socials.map(s => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm text-forest-600 transition-colors ${s.color}`}
            >
              {s.icon} {s.label}
            </a>
          ))}
          <div className="border-t border-forest-100 mt-1 pt-1">
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-forest-600 hover:bg-forest-50 transition-colors"
            >
              {copied ? <Check size={15} className="text-green-500" /> : <Link2 size={15} />}
              {copied ? 'Хуулагдлаа!' : 'Холбоос хуулах'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
