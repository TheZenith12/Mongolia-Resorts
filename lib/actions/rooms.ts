'use server';

import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

// ── Auth guard ────────────────────────────────────────────────────────────────

async function getRoomAuthContext(placeId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Нэвтрэх шаардлагатай');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  const role = (profile as any)?.role as string;

  if (!['super_admin', 'manager'].includes(role)) {
    throw new Error('Эрх хүрэлцэхгүй');
  }

  // Manager бол зөвхөн өөрт оноогдсон газар
  if (role === 'manager') {
    const admin = createAdminClient();
    const { data: assignment } = await (admin.from('manager_assigned_place') as any)
      .select('place_id')
      .eq('manager_id', user.id)
      .maybeSingle();
    if (!assignment || assignment.place_id !== placeId) {
      throw new Error('Энэ газрын өрөөг засах эрх байхгүй');
    }
  }

  return { role };
}

// ── Room CRUD ─────────────────────────────────────────────────────────────────

export interface RoomPayload {
  place_id: string;
  name: string;
  description?: string;
  price_per_night: number;
  capacity: number;
  quantity: number;
  cover_image?: string;
  amenities: string[];
  is_available: boolean;
}

export async function getRooms(placeId: string) {
  const admin = createAdminClient();
  const { data, error } = await (admin.from('rooms') as any)
    .select('*')
    .eq('place_id', placeId)
    .order('price_per_night', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createRoom(payload: RoomPayload) {
  await getRoomAuthContext(payload.place_id);
  const admin = createAdminClient();
  const { data, error } = await (admin.from('rooms') as any)
    .insert({
      ...payload,
      description:  payload.description  || null,
      cover_image:  payload.cover_image  || null,
      updated_at:   new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/places/${payload.place_id}/edit`);
  revalidatePath(`/places/${payload.place_id}`);
  return data;
}

export async function updateRoom(id: string, placeId: string, payload: Partial<RoomPayload>) {
  await getRoomAuthContext(placeId);
  const admin = createAdminClient();
  const { error } = await (admin.from('rooms') as any)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/places/${placeId}/edit`);
  revalidatePath(`/places/${placeId}`);
}

export async function deleteRoom(id: string, placeId: string) {
  await getRoomAuthContext(placeId);
  const admin = createAdminClient();
  const { error } = await (admin.from('rooms') as any).delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/places/${placeId}/edit`);
  revalidatePath(`/places/${placeId}`);
}
