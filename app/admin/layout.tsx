// app/admin/layout.tsx
// REPLACE the entire file with this

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div style={{padding: '40px', fontFamily: 'monospace', background: '#0a1a10', color: '#fff', minHeight: '100vh'}}>
        <h2>❌ User байхгүй байна</h2>
        <p style={{color: '#f87171'}}>Шалтгаан: {userError?.message ?? 'Session олдсонгүй'}</p>
        <br/>
        <a href="/auth/login" style={{color: '#4ade80'}}>→ Login хуудас руу очих</a>
      </div>
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return (
      <div style={{padding: '40px', fontFamily: 'monospace', background: '#0a1a10', color: '#fff', minHeight: '100vh'}}>
        <h2>❌ Profile байхгүй байна</h2>
        <p>User ID: {user.id}</p>
        <p>Email: {user.email}</p>
        <p style={{color: '#f87171'}}>Profile алдаа: {profileError?.message}</p>
      </div>
    );
  }

  const role = (profile as any).role;

  if (!['super_admin', 'manager'].includes(role)) {
    return (
      <div style={{padding: '40px', fontFamily: 'monospace', background: '#0a1a10', color: '#fff', minHeight: '100vh'}}>
        <h2>❌ Эрх байхгүй</h2>
        <p>Email: {user.email}</p>
        <p>Одоогийн role: <strong style={{color: '#fbbf24'}}>{role}</strong></p>
        <p style={{color: '#f87171'}}>Admin эрх шаардлагатай</p>
        <br/>
        <a href="/" style={{color: '#4ade80'}}>→ Нүүр хуудас руу очих</a>
      </div>
    );
  }

  // Manager-ийн оноогдсон газрыг авах
  let assignedPlaceId: string | null = null;
  let assignedPlaceName: string | null = null;

  if (role === 'manager') {
    const admin = createAdminClient();
    const { data: assignment } = await (admin.from('manager_assigned_place') as any)
      .select('place_id, places(name)')
      .eq('manager_id', user.id)
      .maybeSingle();

    if (!assignment) {
      // Manager боловч газар оноогдоогүй бол
      return (
        <div style={{padding: '40px', fontFamily: 'monospace', background: '#0a1a10', color: '#fff', minHeight: '100vh'}}>
          <h2>⚠️ Газар оноогдоогүй байна</h2>
          <p>Таны бүртгэлд газар оноогдоогүй байна.</p>
          <p style={{color: '#fbbf24'}}>Super Admin-аас газар оноолгоно уу.</p>
        </div>
      );
    }

    assignedPlaceId = assignment.place_id;
    assignedPlaceName = assignment.places?.name ?? null;
  }

  return (
    <div className="flex min-h-screen bg-forest-950">
      <AdminSidebar
        profile={profile as any}
        assignedPlaceId={assignedPlaceId}
        assignedPlaceName={assignedPlaceName}
      />
      <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}