// app/admin/layout.tsx
// REPLACE the entire file

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div style={{padding:'40px',fontFamily:'monospace',background:'#0a1a10',color:'#fff',minHeight:'100vh'}}>
        <h2>❌ Нэвтрэх шаардлагатай</h2>
        <p style={{color:'#f87171'}}>{userError?.message ?? 'Session олдсонгүй'}</p>
        <a href="/auth/login" style={{color:'#4ade80'}}>→ Login хуудас руу очих</a>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return (
      <div style={{padding:'40px',fontFamily:'monospace',background:'#0a1a10',color:'#fff',minHeight:'100vh'}}>
        <h2>❌ Profile байхгүй</h2>
        <p>User ID: {user.id}</p>
      </div>
    );
  }

  const role = (profile as any).role;

  if (!['super_admin', 'manager'].includes(role)) {
    return (
      <div style={{padding:'40px',fontFamily:'monospace',background:'#0a1a10',color:'#fff',minHeight:'100vh'}}>
        <h2>❌ Эрх байхгүй</h2>
        <p>Одоогийн role: <strong style={{color:'#fbbf24'}}>{role}</strong></p>
        <a href="/" style={{color:'#4ade80'}}>→ Нүүр хуудас руу очих</a>
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

    // ⚠️ Газар оноогдоогүй бол REDIRECT ХИЙХГҮЙ — зүгээр мессеж харуулна
    // (redirect loop-оос сэргийлэх)
    if (assignment) {
      assignedPlaceId = assignment.place_id;
      assignedPlaceName = assignment.places?.name ?? null;
    }
  }

  return (
    <div className="flex min-h-screen bg-forest-950">
      <AdminSidebar
        profile={profile as any}
        assignedPlaceId={assignedPlaceId}
        assignedPlaceName={assignedPlaceName}
      />
      <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        {/* Manager-т газар оноогдоогүй бол warning харуулах — redirect хийхгүй */}
        {role === 'manager' && !assignedPlaceId && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-semibold text-amber-800 mb-1">⚠️ Газар оноогдоогүй байна</h3>
            <p className="text-amber-700 text-sm">
              Super Admin таньд газар оноогоогүй байна. Администраторт хандана уу.
            </p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}