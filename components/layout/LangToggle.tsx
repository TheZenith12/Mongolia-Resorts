'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function LangToggle() {
  const [lang, setLang] = useState<'mn' | 'en'>('mn');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as 'mn' | 'en' | null;
    if (saved) setLang(saved);
  }, []);

  function toggle() {
    const next = lang === 'mn' ? 'en' : 'mn';
    setLang(next);
    localStorage.setItem('lang', next);
    // Reload-гүйгээр document-ийн lang attr-г өөрчилнө
    document.documentElement.lang = next === 'mn' ? 'mn-MN' : 'en-US';
    // Custom event дамжуулна
    window.dispatchEvent(new CustomEvent('langchange', { detail: next }));
  }

  return (
    <button
      onClick={toggle}
      title={lang === 'mn' ? 'Switch to English' : 'Монгол хэл рүү солих'}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-forest-50 text-forest-600 hover:text-forest-800 transition-colors text-xs font-medium"
    >
      <Globe size={14} />
      {lang === 'mn' ? 'EN' : 'МН'}
    </button>
  );
}
