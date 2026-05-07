'use server';

import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export interface SiteSettings {
  site_name:  string;
  site_phone: string;
  site_email: string;
  site_url:   string;
  fb_url:     string;
  ig_url:     string;
}

const DEFAULTS: SiteSettings = {
  site_name:  'Монгол Нутаг',
  site_phone: '+976 9900-0000',
  site_email: 'info@mongolnudag.mn',
  site_url:   'https://mongolnudag.mn',
  fb_url:     '',
  ig_url:     '',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from('site_settings') as any)
      .select('key, value');
    if (error || !data) return DEFAULTS;

    const map: Record<string, string> = {};
    (data as { key: string; value: string }[]).forEach(row => {
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

export async function updateSiteSettings(settings: SiteSettings): Promise<void> {
  // Super admin эрх шалгах
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Нэвтрэх шаардлагатай');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if ((profile as any)?.role !== 'super_admin') {
    throw new Error('Зөвхөн Super Admin тохиргоо өөрчилж чадна');
  }

  const admin = createAdminClient();
  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value: value ?? '',
    updated_at: new Date().toISOString(),
  }));

  const { error } = await (admin.from('site_settings') as any)
    .upsert(rows, { onConflict: 'key' });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/settings');
}
