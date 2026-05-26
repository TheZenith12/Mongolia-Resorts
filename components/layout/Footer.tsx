'use client';

import Link from 'next/link';
import { Leaf, Phone, Mail, MapPin, Facebook, Instagram, Plus } from 'lucide-react';
import { useLang } from '@/lib/lang-context';

export default function Footer() {
  const { tr } = useLang();

  return (
    <footer className="bg-forest-950 text-forest-300 mt-24">

      {/* ── CTA Banner ──────────────────────────────────── */}
      <div className="border-b border-forest-800">
        <div className="page-container py-14">
          <div className="bg-gradient-to-br from-forest-800 to-forest-900 rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <Plus size={12} /> {tr('footer_submit')}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-3 leading-tight">
                {tr('submit_title')}
              </h2>
              <p className="text-forest-300 text-sm sm:text-base leading-relaxed max-w-lg">
                {tr('submit_desc')}
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col sm:items-end gap-3">
              <Link
                href="/places/submit"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-7 py-3.5 rounded-2xl transition-colors text-sm whitespace-nowrap"
              >
                <Plus size={16} /> {tr('footer_submit')}
              </Link>
              <p className="text-xs text-forest-500 text-center sm:text-right">
                {tr('submit_notice')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-forest-700 rounded-xl flex items-center justify-center">
                <Leaf size={18} className="text-amber-300" />
              </div>
              <span className="font-display text-xl font-semibold text-white">Монгол Нутаг</span>
            </div>
            <p className="text-sm leading-relaxed text-forest-400 max-w-xs">
              {tr('footer_tagline')}
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-9 h-9 bg-forest-800 rounded-lg flex items-center justify-center hover:bg-forest-700 transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-forest-800 rounded-lg flex items-center justify-center hover:bg-forest-700 transition-colors">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-white font-semibold mb-4 text-lg">{tr('footer_places')}</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/places?type=resort', label: tr('footer_resorts') },
                { href: '/places?type=nature', label: tr('footer_nature') },
                { href: '/map',               label: tr('footer_map') },
                { href: '/places/submit',     label: tr('footer_submit') },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-amber-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-white font-semibold mb-4 text-lg">{tr('footer_contact')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-amber-400 flex-shrink-0" />
                <span>+976 9900-0000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-amber-400 flex-shrink-0" />
                <span>info@mongolnudag.mn</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Улаанбаатар хот, Монгол Улс</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-forest-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-forest-500">
          <span>© 2025 Монгол Нутаг. {tr('footer_rights')}</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-forest-300 transition-colors">Нууцлалын бодлого</Link>
            <Link href="/terms" className="hover:text-forest-300 transition-colors">Үйлчилгээний нөхцөл</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
