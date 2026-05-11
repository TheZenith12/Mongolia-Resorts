'use server';

import { connectDB } from '@/lib/mongodb';
import { Room, ManagerAssignment } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';

// ── Auth guard ────────────────────────────────────────────────────────────────

async function getRoomAuthContext(placeId: string) {
  await connectDB();
  const sessionUser = await getCurrentUser();
  if (!sessionUser) throw new Error('Нэвтрэх шаардлагатай');

  const role = sessionUser.role;
  if (!['super_admin', 'manager'].includes(role)) {
    throw new Error('Эрх хүрэлцэхгүй');
  }

  // Manager бол зөвхөн өөрт оноогдсон газар
  if (role === 'manager') {
    const assignment = await ManagerAssignment.findOne({ manager_id: sessionUser.id }).lean();
    const assignedPlaceId = (assignment as any)?.place_id ?? sessionUser.assigned_place_id;
    if (!assignedPlaceId || assignedPlaceId !== placeId) {
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
  await connectDB();
  const rooms = await Room.find({ place_id: placeId })
    .sort({ price_per_night: 1 })
    .lean();
  return rooms.map((r: any) => ({
    ...r,
    id:         r._id.toString(),
    created_at: r.created_at?.toISOString(),
    updated_at: r.updated_at?.toISOString(),
  }));
}

export async function createRoom(payload: RoomPayload) {
  await getRoomAuthContext(payload.place_id);
  const room = await Room.create({
    ...payload,
    description: payload.description || null,
    cover_image: payload.cover_image || null,
  });
  revalidatePath(`/admin/places/${payload.place_id}/edit`);
  revalidatePath(`/places/${payload.place_id}`);
  const r = room.toObject();
  return { ...r, id: r._id.toString() };
}

export async function updateRoom(id: string, placeId: string, payload: Partial<RoomPayload>) {
  await getRoomAuthContext(placeId);
  await Room.findByIdAndUpdate(id, { ...payload });
  revalidatePath(`/admin/places/${placeId}/edit`);
  revalidatePath(`/places/${placeId}`);
}

export async function deleteRoom(id: string, placeId: string) {
  await getRoomAuthContext(placeId);
  await Room.findByIdAndDelete(id);
  revalidatePath(`/admin/places/${placeId}/edit`);
  revalidatePath(`/places/${placeId}`);
}
