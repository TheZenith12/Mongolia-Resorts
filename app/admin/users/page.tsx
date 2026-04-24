import { createAdminClient } from '@/lib/supabase-server';
import { getCurrentProfile } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { formatDate, getInitials } from '@/lib/utils';
import AdminUserRoleChange from '@/components/admin/AdminUserRoleChange';

async function getUsers() {
  const admin = createAdminClient();

  // Auth users — бүх бүртгэлтэй хэрэглэгч (service role шаардана)
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 });

  // Profiles — байж болно, байхгүй байж болно
  const { data: profiles } = await (admin.from('profiles') as any)
    .select('*, manager_assigned_place(place_id, places(name))')
    .in('id', authUsers.map((u) => u.id));

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  return authUsers.map((u) => {
    const profile = profileMap.get(u.id) as any;
    return {
      id:         u.id,
      email:      u.email ?? '',
      full_name:  profile?.full_name ?? (u.user_metadata as any)?.full_name ?? '—',
      phone:      profile?.phone ?? '—',
      role:       profile?.role ?? 'user',
      created_at: u.created_at,
      manager_assigned_place: profile?.manager_assigned_place ?? [],
    };
  });
}

export default async function AdminUsersPage() {
  const profile = await getCurrentProfile();
  if (!profile || (profile as any).role !== 'super_admin') redirect('/admin');

  const users = await getUsers();

  const roleColors: Record<string, string> = {
    super_admin: 'bg-red-50 text-red-700 border-red-200',
    manager:     'bg-blue-50 text-blue-700 border-blue-200',
    user:        'bg-gray-50 text-gray-600 border-gray-200',
  };
  const roleLabels: Record<string, string> = {
    super_admin: '👑 Super Admin',
    manager:     '🔑 Manager',
    user:        '👤 Хэрэглэгч',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">Хэрэглэгчид</h1>
        <p className="text-forest-500 text-sm mt-1">{users.length} нийт хэрэглэгч</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Хэрэглэгч', 'И-мэйл', 'Эрх', 'Оноогдсон газар', 'Бүртгүүлсэн', 'Тохиргоо'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-forest-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user: any) => {
              const assignedPlace   = user.manager_assigned_place?.[0]?.places?.name ?? null;
              const assignedPlaceId = user.manager_assigned_place?.[0]?.place_id ?? null;
              return (
                <tr key={user.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 text-sm font-semibold">
                        {getInitials(user.full_name)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-forest-900">{user.full_name ?? '—'}</div>
                        <div className="text-xs text-forest-400">{user.phone ?? '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-forest-600 font-mono">{user.email || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`badge text-xs ${roleColors[user.role] ?? ''}`}>
                      {roleLabels[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    {assignedPlace ? (
                      <span className="text-forest-700 font-medium">🏕 {assignedPlace}</span>
                    ) : (
                      <span className="text-forest-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-forest-500">{formatDate(user.created_at)}</td>
                  <td className="px-5 py-4">
                    <AdminUserRoleChange
                      userId={user.id}
                      currentRole={user.role}
                      assignedPlaceId={assignedPlaceId}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-16 text-forest-400 text-sm">Хэрэглэгч байхгүй байна</div>
        )}
      </div>
    </div>
  );
}
