import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/auth';
import AdminSettingsClient from '@/components/admin/AdminSettingsClient';
import { getSiteSettings } from '@/lib/actions/settings';

export default async function AdminSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile || (profile as any).role !== 'super_admin') redirect('/admin');

  const settings = await getSiteSettings();

  return <AdminSettingsClient profile={profile} initialSettings={settings} />;
}
