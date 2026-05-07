'use client';

import { useState } from 'react';
import { User, Phone, Camera, Loader2, Check } from 'lucide-react';
import { updateProfile } from '@/lib/actions/auth';
import { toast } from 'react-hot-toast';
import type { Profile } from '@/lib/types';

interface Props {
  profile: Profile;
}

export default function ProfileEditForm({ profile }: Props) {
  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Зураг байршуулах алдаа');
      setAvatarUrl(data.url);
      toast.success('Зураг байршуулагдлаа');
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) { toast.error('Нэр оруулна уу'); return; }
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName.trim(), phone: phone.trim(), avatar_url: avatarUrl || undefined });
      setSaved(true);
      toast.success('Профайл хадгалагдлаа');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  }

  const initials = (fullName || profile.full_name || '?')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Профайл зураг"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-forest-100 border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-forest-600">
              {initials}
            </div>
          )}
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-forest-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-forest-800 transition-colors shadow-md">
            {uploading ? (
              <Loader2 size={14} className="animate-spin text-white" />
            ) : (
              <Camera size={14} className="text-white" />
            )}
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={uploading} />
          </label>
        </div>
        <p className="text-xs text-forest-400">Профайл зураг солих</p>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-forest-700 mb-1.5">Нэр</label>
          <div className="relative">
            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Таны нэр"
              className="input-field pl-9"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-forest-700 mb-1.5">Утасны дугаар</label>
          <div className="relative">
            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="99xxxxxx"
              className="input-field pl-9"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-forest-700 mb-1.5">Имэйл</label>
          <input
            type="email"
            value={profile.id}
            disabled
            className="input-field opacity-50 cursor-not-allowed bg-forest-50 text-forest-400 text-sm"
            placeholder="Имэйл өөрчлөх боломжгүй"
          />
          <p className="text-xs text-forest-400 mt-1">Имэйл хаяг өөрчлөх боломжгүй</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || uploading}
        className="btn-primary w-full py-3 justify-center disabled:opacity-50"
      >
        {saving ? (
          <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Хадгалж байна...</span>
        ) : saved ? (
          <span className="flex items-center gap-2"><Check size={16} /> Хадгалагдлаа</span>
        ) : (
          'Хадгалах'
        )}
      </button>
    </form>
  );
}
