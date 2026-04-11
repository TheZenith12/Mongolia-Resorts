// app/api/admin/users/role/route.ts
// REPLACE the entire file with this

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Super admin эсэхийг шалгах
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single();
    if ((profile as any)?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { user_id, role, place_id } = await req.json();

    // Manager болгохдоо place_id заавал шаарддаг
    if (role === 'manager' && !place_id) {
      return NextResponse.json(
        { error: 'Manager болгохдоо газар заавал сонгоно уу' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Role шинэчлэх
    const { error: roleError } = await (admin.from('profiles') as any)
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', user_id);
    if (roleError) throw roleError;

    // Manager болгож байгаа бол газар оноох
    if (role === 'manager' && place_id) {
      // Хуучин оноогдолт байвал устга, шинэ оруулах (upsert)
      const { error: assignError } = await (admin.from('manager_assigned_place') as any)
        .upsert(
          { manager_id: user_id, place_id, assigned_by: user.id, assigned_at: new Date().toISOString() },
          { onConflict: 'manager_id' }
        );
      if (assignError) throw assignError;
    }

    // Manager-аас өөр role болгож байгаа бол оноогдолтыг устга
    if (role !== 'manager') {
      await (admin.from('manager_assigned_place') as any)
        .delete()
        .eq('manager_id', user_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}