import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { formatDate, formatPrice } from '@/lib/utils';
import AdminBookingsClient from '@/components/admin/AdminBookingsClient';

export default async function AdminBookingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  const role = (profile as any)?.role;
  if (!['super_admin', 'manager'].includes(role)) redirect('/');

  const admin = createAdminClient();
  let bookings: any[] = [];

  if (role === 'super_admin') {
    const { data } = await (admin.from('bookings') as any)
      .select('*, place:places(name)')
      .order('created_at', { ascending: false })
      .limit(100);
    bookings = data ?? [];
  } else if (role === 'manager') {
    const { data: assignment } = await (admin.from('manager_assigned_place') as any)
      .select('place_id').eq('manager_id', user.id).maybeSingle();
    if (assignment?.place_id) {
      const { data } = await (admin.from('bookings') as any)
        .select('*, place:places(name)')
        .eq('place_id', assignment.place_id)
        .order('created_at', { ascending: false })
        .limit(100);
      bookings = data ?? [];
    }
  }

  return (
    <AdminBookingsClient
      bookings={bookings}
      currentUserId={user.id}
    />
  );
}
