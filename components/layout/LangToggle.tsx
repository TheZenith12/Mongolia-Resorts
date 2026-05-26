'use client';

import { Globe } from 'lucide-react';
import { useLang } from '@/lib/lang-context';

export default function LangToggle() {
  const { lang, setLang } = useLang();

  function toggle() {
    setLang(lang === 'mn' ? 'en' : 'mn');
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
