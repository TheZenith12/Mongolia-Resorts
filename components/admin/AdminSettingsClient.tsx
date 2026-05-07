'use client';

import { useState } from 'react';
import { Save, Globe, Phone, Facebook, Instagram, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Profile } from '@/lib/types';
import { updateSiteSettings } from '@/lib/actions/settings';
import type { SiteSettings } from '@/lib/actions/settings';

interface Props {
  profile: Profile;
  initialSettings: SiteSettings;
}

export default function AdminSettingsClient({ profile, initialSettings }: Props) {
  const [form, setForm] = useState<SiteSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: keyof SiteSettings, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.site_name.trim()) { toast.error('Сайтын нэр хоосон байна'); return; }
    setLoading(true);
    try {
      await updateSiteSettings(form);
      toast.success('Тохиргоо амжилттай хадгалагдлаа!');
      setSaved(true);
    } catch (err: any) {
      toast.error(err.message ?? 'Хадгалж чадсангүй');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">Тохиргоо</h1>
        <p className="text-forest-500 text-sm mt-1">Сайтын ерөнхий тохиргоо</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {/* Site info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-4 flex items-center gap-2">
            <Globe size={17} /> Сайтын мэдээлэл
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Сайтын нэр *</label>
              <input
                value={form.site_name}
                onChange={e => set('site_name', e.target.value)}
                className="input-field"
                placeholder="Монгол Нутаг"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Домэйн</label>
              <input
                value={form.site_url}
                onChange={e => set('site_url', e.target.value)}
                className="input-field"
                placeholder="https://mongolnudag.mn"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-4 flex items-center gap-2">
            <Phone size={17} /> Холбоо барих
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Утас</label>
              <input
                value={form.site_phone}
                onChange={e => set('site_phone', e.target.value)}
                className="input-field"
                placeholder="+976 9900-0000"
              />
              <p className="text-xs text-forest-400 mt-1">Footer болон холбоо барих хэсэгт харагдана</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">И-мэйл</label>
              <input
                type="email"
                value={form.site_email}
                onChange={e => set('site_email', e.target.value)}
                className="input-field"
                placeholder="info@mongolnudag.mn"
              />
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-4 flex items-center gap-2">
            <Facebook size={17} /> Сошиал медиа
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5 flex items-center gap-1.5">
                <Facebook size={14} /> Facebook
              </label>
              <input
                value={form.fb_url}
                onChange={e => set('fb_url', e.target.value)}
                className="input-field"
                placeholder="https://facebook.com/mongolnudag"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5 flex items-center gap-1.5">
                <Instagram size={14} /> Instagram
              </label>
              <input
                value={form.ig_url}
                onChange={e => set('ig_url', e.target.value)}
                className="input-field"
                placeholder="https://instagram.com/mongolnudag"
              />
            </div>
          </div>
        </div>

        {/* Admin profile info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-4">Миний профайл</h2>
          <div className="p-4 bg-forest-50 rounded-xl text-sm text-forest-700 space-y-1.5">
            <p><span className="text-forest-500">Нэр:</span> <strong>{(profile as any).full_name ?? '—'}</strong></p>
            <p><span className="text-forest-500">Эрх:</span> <strong className="text-amber-600">👑 Super Admin</strong></p>
            <p><span className="text-forest-500">ID:</span> <code className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-forest-100">{profile.id}</code></p>
          </div>
          <div className="mt-3">
            <a href="/profile/edit" className="text-sm text-forest-600 hover:underline">
              → Профайл засах
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saved && (
            <div className="flex items-center gap-1.5 text-green-600 text-sm">
              <CheckCircle2 size={15} /> Амжилттай хадгалагдлаа
            </div>
          )}
          <div className="ml-auto">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Хадгалж байна...</>
              ) : (
                <><Save size={15} /> Хадгалах</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
