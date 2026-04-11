// app/admin/places/[id]/edit/page.tsx
// REPLACE the entire file with this

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server';
import { redirect, notFound } from 'next/navigation';
import PlaceForm from '@/components/admin/PlaceForm';

export default async function EditPlacePage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  const role = (profile as any)?.role;

  if (!['super_admin', 'manager'].includes(role)) redirect('/');

  const admin = createAdminClient();

  // Manager бол зөвхөн өөрт оноогдсон газраа засаж чадна
  if (role === 'manager') {
    const { data: assignment } = await (admin.from('manager_assigned_place') as any)
      .select('place_id')
      .eq('manager_id', user.id)
      .maybeSingle();

    // Оноогдсон газар нь params.id-тэй таарахгүй бол хандалт хориглох
    if (!assignment || assignment.place_id !== params.id) {
      // 403 - дүрслэхэд энгийн redirect
      redirect('/admin');
    }
  }

  const { data: place } = await (admin.from('places') as any)
    .select('*')
    .eq('id', params.id)
    .single();

  if (!place) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-forest-900 mb-6">
        Газар засах: {place.name}
      </h1>
      <PlaceForm place={place} mode="edit" />
    </div>
  );
}