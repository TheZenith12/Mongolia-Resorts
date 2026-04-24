import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/bookings/[id]/messages
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminClient();
  const { data, error } = await (admin.from('booking_messages') as any)
    .select('*')
    .eq('booking_id', params.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/bookings/[id]/messages
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: 'Мессеж хоосон байна' }, { status: 400 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  const role = (profile as any)?.role ?? 'user';

  const admin = createAdminClient();
  const { data, error } = await (admin.from('booking_messages') as any)
    .insert({ booking_id: params.id, sender_id: user.id, sender_role: role, message: message.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
