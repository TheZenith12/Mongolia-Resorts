'use server';

import { connectDB } from '@/lib/mongodb';
import { SiteSettings } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';

// Keep old name as alias for backward compatibility
export type SiteSettings = SiteSettingsData;

export interface SiteSettingsData {
  site_name:  string;
  site_phone: string;
  site_email: string;
  site_url:   string;
  fb_url:     string;
  ig_url:     string;
}

const DEFAULTS: SiteSettingsData = {
  site_name:  'Монгол Нутаг',
  site_phone: '+976 9900-0000',
  site_email: 'info@mongolnudag.mn',
  site_url:   'https://mongolnudag.mn',
  fb_url:     '',
  ig_url:     '',
};

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    await connectDB();
    const rows = await SiteSettings.find({}).lean();
    if (!rows || rows.length === 0) return DEFAULTS;

    const map: Record<string, string> = {};
    rows.forEach((row: any) => {
      map[row.key] = row.value ?? '';
    });

    return {
      site_name:  map['site_name']  ?? DEFAULTS.site_name,
      site_phone: map['site_phone'] ?? DEFAULTS.site_phone,
      site_email: map['site_email'] ?? DEFAULTS.site_email,
      site_url:   map['site_url']   ?? DEFAULTS.site_url,
      fb_url:     map['fb_url']     ?? DEFAULTS.fb_url,
      ig_url:     map['ig_url']     ?? DEFAULTS.ig_url,
    };
  } catch {
    return DEFAULTS;
  }
}

export async function updateSiteSettings(settings: SiteSettingsData): Promise<void> {
  // Super admin эрх шалгах
  await connectDB();
  const sessionUser = await getCurrentUser();
  if (!sessionUser) throw new Error('Нэвтрэх шаардлагатай');
  if (sessionUser.role !== 'super_admin') {
    throw new Error('Зөвхөн Super Admin тохиргоо өөрчилж чадна');
  }

  const ops = Object.entries(settings).map(([key, value]) =>
    SiteSettings.findOneAndUpdate(
      { key },
      { key, value: value ?? '' },
      { upsert: true, new: true }
    )
  );
  await Promise.all(ops);
  revalidatePath('/admin/settings');
}
