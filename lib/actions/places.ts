'use server';

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server';
import type { Place, PlaceFormData, PlacesFilter, PaginatedResponse, SiteStats } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ── Availability Blocks ────────────────────────────────────────────────────────

export async function getAvailabilityBlocks(placeId: string): Promise<Array<{
  id: string; place_id: string; start_date: string; end_date: string; reason: string | null; created_at: string;
}>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await (supabase.from('availability_blocks') as any)
      .select('*')
      .eq('place_id', placeId)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true });
    return data ?? [];
  } catch { return []; }
}

export async function createAvailabilityBlock(
  placeId: string, startDate: string, endDate: string, reason: string
): Promise<void> {
  const { user, role, assignedPlaceId } = await getAuthContext();
  if (role !== 'super_admin' && role !== 'manager') throw new Error('Эрх хүрэлцэхгүй');
  if (role === 'manager' && assignedPlaceId !== placeId) throw new Error('Эрх хүрэлцэхгүй');

  const supabase = await createServerSupabaseClient();
  const { error } = await (supabase.from('availability_blocks') as any)
    .insert({ place_id: placeId, start_date: startDate, end_date: endDate, reason: reason || null, created_by: user.id });
  if (error) throw new Error(error.message);
  revalidatePath('/admin/availability');
}

export async function deleteAvailabilityBlock(id: string): Promise<void> {
  const { role, assignedPlaceId } = await getAuthContext();
  if (role !== 'super_admin' && role !== 'manager') throw new Error('Эрх хүрэлцэхгүй');

  const supabase = await createServerSupabaseClient();

  let query = (supabase.from('availability_blocks') as any).delete().eq('id', id);
  if (role === 'manager' && assignedPlaceId) {
    query = (supabase.from('availability_blocks') as any).delete().eq('id', id).eq('place_id', assignedPlaceId);
  }
  const { error } = await query;
  if (error) throw new Error(error.message);
  revalidatePath('/admin/availability');
}

// ── Booking Status (Admin/Manager) ────────────────────────────────────────────

export async function updateBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'cancelled' | 'completed'
): Promise<void> {
  const { role, assignedPlaceId } = await getAuthContext();
  if (role !== 'super_admin' && role !== 'manager') throw new Error('Эрх хүрэлцэхгүй');

  const supabase = await createServerSupabaseClient();

  let query = (supabase.from('bookings') as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  if (role === 'manager') {
    if (!assignedPlaceId) throw new Error('Танд газар оноогдоогүй байна');
    query = query.eq('place_id', assignedPlaceId);
  }

  const { error } = await query;
  if (error) throw new Error(error.message);
  revalidatePath('/admin/bookings');
}

// ── Auth Context Helper ────────────────────────────────────────────────────────

async function getAuthContext() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Нэвтрэх шаардлагатай');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  const role = (profile as any)?.role as string;

  let assignedPlaceId: string | null = null;
  if (role === 'manager') {
    const admin = createAdminClient();
    const { data: assignment } = await (admin.from('manager_assigned_place') as any)
      .select('place_id')
      .eq('manager_id', user.id)
      .maybeSingle();
    assignedPlaceId = assignment?.place_id ?? null;
  }

  return { user, role, assignedPlaceId };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY: PaginatedResponse<Place> = { data: [], count: 0, page: 1, pageSize: 12, totalPages: 0 };

// ── Public Actions ─────────────────────────────────────────────────────────────

export async function getPlaces(filter: PlacesFilter = {}): Promise<PaginatedResponse<Place>> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      type, search, province, minPrice, maxPrice, minRating,
      page = 1, pageSize = 12,
      sortBy = 'created_at', sortOrder = 'desc',
    } = filter;

    let query = supabase
      .from('places')
      .select('*', { count: 'exact' })
      .eq('is_published', true);

    if (type)      query = query.eq('type', type);
    if (province)  query = query.eq('province', province);
    if (minPrice)  query = query.gte('price_per_night', minPrice);
    if (maxPrice)  query = query.lte('price_per_night', maxPrice);
    if (minRating) query = query.gte('rating_avg', minRating);
    if (search)    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,address.ilike.%${search}%`);

    const from = (page - 1) * pageSize;
    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, from + pageSize - 1);

    if (error) return EMPTY;
    return {
      data: (data as Place[]) ?? [],
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  } catch {
    return EMPTY;
  }
}

export async function getPlace(id: string): Promise<Place | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('places')
      .select('*, manager:profiles(id, full_name, avatar_url), reviews(*, user:profiles(id, full_name, avatar_url))')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as Place;
  } catch {
    return null;
  }
}

export async function incrementViewCount(placeId: string): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    await (supabase.rpc as any)('increment_view_count', { place_id: placeId });
  } catch { /* silence */ }
}

export async function getSiteStats(): Promise<SiteStats> {
  const fallback: SiteStats = { total_views: 0, total_places: 0, total_resorts: 0, total_nature: 0, total_users: 0, total_bookings: 0 };
  try {
    const supabase = await createServerSupabaseClient();

    const [statsRes, placesRes] = await Promise.all([
      supabase.from('site_stats').select('key, value'),
      supabase.from('places').select('type, view_count').eq('is_published', true),
    ]);

    const places = (placesRes.data ?? []) as Array<{ type: string; view_count: number }>;

    // sum view_count from places directly — reliable even if site_stats is empty
    const viewsFromPlaces = places.reduce((sum, p) => sum + (p.view_count ?? 0), 0);

    const statsMap: Record<string, number> = {};
    (statsRes.data ?? []).forEach((row: { key: string; value: number }) => {
      statsMap[row.key] = row.value;
    });

    // prefer site_stats if it has a non-zero value, else fall back to sum of place view_counts
    const totalViews = (statsMap['total_views'] && statsMap['total_views'] > 0)
      ? statsMap['total_views']
      : viewsFromPlaces;

    return {
      total_views:    totalViews,
      total_places:   places.length,
      total_resorts:  places.filter(p => p.type === 'resort').length,
      total_nature:   places.filter(p => p.type === 'nature').length,
      total_users:    statsMap['total_users'] ?? 0,
      total_bookings: 0,
    };
  } catch {
    return fallback;
  }
}

export async function getSimilarPlaces(
  placeId: string,
  type: string,
  province: string | null,
  limit = 4
): Promise<Place[]> {
  try {
    const supabase = await createServerSupabaseClient();

    // 1st priority: same type + same province
    if (province) {
      const { data } = await supabase
        .from('places')
        .select('*')
        .eq('is_published', true)
        .eq('type', type)
        .eq('province', province)
        .neq('id', placeId)
        .order('rating_avg', { ascending: false })
        .limit(limit);
      if (data && data.length >= 2) return data as Place[];
    }

    // 2nd priority: same type, any province
    const { data } = await supabase
      .from('places')
      .select('*')
      .eq('is_published', true)
      .eq('type', type)
      .neq('id', placeId)
      .order('rating_avg', { ascending: false })
      .limit(limit);
    return (data ?? []) as Place[];
  } catch {
    return [];
  }
}

export async function getFeaturedPlaces(limit = 6): Promise<Place[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('rating_avg', { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data as Place[]) ?? [];
  } catch {
    return [];
  }
}

export async function getAdminPlaces(filter: PlacesFilter = {}): Promise<PaginatedResponse<Place>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { page = 1, pageSize = 20, search, type } = filter;
    let query = supabase.from('places').select('*, manager:profiles(id, full_name)', { count: 'exact' });
    if (type)   query = query.eq('type', type);
    if (search) query = query.ilike('name', `%${search}%`);
    const from = (page - 1) * pageSize;
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) return EMPTY;
    return {
      data: (data as Place[]) ?? [],
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  } catch {
    return EMPTY;
  }
}

// ── Admin / Manager Actions ────────────────────────────────────────────────────

export async function createPlace(formData: PlaceFormData): Promise<Place> {
  const { role, user } = await getAuthContext();

  if (role !== 'super_admin') {
    throw new Error('Зөвхөн Super Admin газар үүсгэж чадна');
  }

  const admin = createAdminClient();
  const { data, error } = await (admin.from('places') as any)
    .insert({ ...formData, created_by: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/admin/places');
  revalidatePath('/');
  return data as Place;
}

export async function updatePlace(id: string, formData: PlaceFormData) {
  const { role, assignedPlaceId } = await getAuthContext();

  if (role === 'manager') {
    if (assignedPlaceId !== id) throw new Error('Энэ газрыг засах эрх байхгүй');
  } else if (role !== 'super_admin') {
    throw new Error('Эрх хүрэлцэхгүй');
  }

  const admin = createAdminClient();
  const { error } = await (admin.from('places') as any)
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/places');
  revalidatePath(`/admin/places/${id}/edit`);
  revalidatePath(`/places/${id}`);
}

export async function deletePlace(id: string) {
  const { role } = await getAuthContext();

  if (role === 'manager') throw new Error('Manager газар устгах эрхгүй');
  if (role !== 'super_admin') throw new Error('Эрх хүрэлцэхгүй');

  const admin = createAdminClient();
  const { error } = await (admin.from('places') as any).delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/places');
  redirect('/admin/places');
}

export async function togglePublish(id: string, isPublished: boolean) {
  const { role, assignedPlaceId } = await getAuthContext();

  // Manager зөвхөн өөрийн газрын publish-г өөрчилж чадна
  if (role === 'manager') {
    if (assignedPlaceId !== id) throw new Error('Энэ газрыг засах эрх байхгүй');
  } else if (role !== 'super_admin') {
    throw new Error('Эрх хүрэлцэхгүй');
  }

  const admin = createAdminClient();
  const { error } = await (admin.from('places') as any)
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/places');
  revalidatePath(`/places/${id}`);
}