// app/admin/bookings/page.tsx
// REPLACE the entire file with this
// (хэрэв файл байхгүй бол шинэ үүсгэх)

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { formatDate, formatPrice } from '@/lib/utils';

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
    // Бүх захиалга
    const { data } = await (admin.from('bookings') as any)
      .select('*, place:places(name)')
      .order('created_at', { ascending: false })
      .limit(100);
    bookings = data ?? [];

  } else if (role === 'manager') {
    // Зөвхөн өөрийн газрын захиалга
    const { data: assignment } = await (admin.from('manager_assigned_place') as any)
      .select('place_id')
      .eq('manager_id', user.id)
      .maybeSingle();

    if (assignment?.place_id) {
      const { data } = await (admin.from('bookings') as any)
        .select('*, place:places(name)')
        .eq('place_id', assignment.place_id)
        .order('created_at', { ascending: false })
        .limit(100);
      bookings = data ?? [];
    }
  }

  const statusColors: Record<string, string> = {
    pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
    confirmed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">Захиалгууд</h1>
        <p className="text-forest-500 text-sm mt-1">{bookings.length} захиалга</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Зочин', 'Газар', 'Огноо', 'Дүн', 'Статус'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-forest-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.map((b: any) => (
              <tr key={b.id} className="hover:bg-gray-50/40">
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-forest-900">{b.guest_name}</div>
                  <div className="text-xs text-forest-400">{b.guest_phone}</div>
                </td>
                <td className="px-5 py-4 text-sm text-forest-700">{b.place?.name ?? '—'}</td>
                <td className="px-5 py-4 text-xs text-forest-500">
                  {b.check_in} → {b.check_out}
                </td>
                <td className="px-5 py-4 text-sm font-medium text-forest-700">
                  {formatPrice(b.total_amount)}
                </td>
                <td className="px-5 py-4">
                  <span className={`badge text-xs ${statusColors[b.status] ?? ''}`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div className="text-center py-16 text-forest-400 text-sm">Захиалга байхгүй байна</div>
        )}
      </div>
    </div>
  );
}