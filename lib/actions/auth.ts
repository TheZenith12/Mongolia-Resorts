'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { BookingFormData, Booking, Place} from '@/lib/types';
import { calculateNights } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  redirect('/');
}

export async function signUp(email: string, password: string, fullName: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw new Error(error.message);
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function getSession() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}

export async function getCurrentProfile() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    return data;
  } catch {
    return null;
  }
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export async function createBooking(formData: BookingFormData): Promise<Booking> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: place } = await supabase
    .from('places')
    .select('price_per_night, name')
    .eq('id', formData.place_id)
    .single();

  if (!place) throw new Error('Газар олдсонгүй');
  if (!(place as any).price_per_night) throw new Error('Энэ газар захиалах боломжгүй');

  const nights = calculateNights(formData.check_in, formData.check_out);
  if (nights < 1) throw new Error('Буцах огноо буруу байна');

  const total_amount = ((place as any).price_per_night as number) * nights * formData.guest_count;

  const { data, error } = await (supabase
    .from('bookings') as any)
    .insert({
      place_id:       formData.place_id,
      guest_name:     formData.guest_name,
      guest_phone:    formData.guest_phone,
      guest_email:    formData.guest_email ?? null,
      guest_count:    formData.guest_count,
      check_in:       formData.check_in,
      check_out:      formData.check_out,
      payment_method: formData.payment_method,
      notes:          formData.notes ?? null,
      user_id:        user?.id ?? null,
      total_amount,
      payment_status: 'pending',
      status:         'pending',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/profile/bookings');
  return data as Booking;
}

export async function getUserBookings(): Promise<Booking[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('bookings')
      .select('*, place:places(id, name, cover_image, type)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return (data as Booking[]) ?? [];
  } catch {
    return [];
  }
}

export async function cancelBooking(id: string): Promise<{ refunded: boolean }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Нэвтрэх шаардлагатай');

  const { data: booking } = await (supabase.from('bookings') as any)
    .select('status, payment_status, payment_method, payment_intent, total_amount')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!booking) throw new Error('Захиалга олдсонгүй');
  if (booking.status === 'cancelled') throw new Error('Захиалга аль хэдийн цуцлагдсан байна');
  if (booking.status === 'completed') throw new Error('Дууссан захиалгыг цуцлах боломжгүй');

  let refunded = false;

  if (booking.payment_status === 'paid' && booking.payment_method === 'stripe' && booking.payment_intent) {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
    try {
      await stripe.refunds.create({ payment_intent: booking.payment_intent });
      refunded = true;
    } catch {
      // Stripe refund failed — still cancel the booking, admin can handle manually
    }
  }

  const { error } = await (supabase.from('bookings') as any)
    .update({
      status: 'cancelled',
      payment_status: refunded ? 'refunded' : booking.payment_status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/profile/bookings');
  return { refunded };
}

export async function getBookedDateRanges(
  placeId: string,
  roomId?: string
): Promise<Array<{ check_in: string; check_out: string }>> {
  try {
    const supabase = await createServerSupabaseClient();
    const today = new Date().toISOString().split('T')[0];

    let bookingQuery = (supabase.from('bookings') as any)
      .select('check_in, check_out')
      .eq('place_id', placeId)
      .in('status', ['pending', 'confirmed'])
      .gte('check_out', today);
    if (roomId) bookingQuery = bookingQuery.eq('room_id', roomId);

    // Also fetch manager-blocked dates
    const [bookingRes, blocksRes] = await Promise.all([
      bookingQuery,
      (supabase.from('availability_blocks') as any)
        .select('start_date, end_date')
        .eq('place_id', placeId)
        .gte('end_date', today)
        .catch(() => ({ data: [] })),
    ]);

    const booked = (bookingRes.data ?? []) as Array<{ check_in: string; check_out: string }>;
    const blocked = ((blocksRes as any).data ?? []).map((b: any) => ({
      check_in: b.start_date,
      check_out: b.end_date,
    }));

    return [...booked, ...blocked];
  } catch {
    return [];
  }
}

export async function updateProfile(data: {
  full_name: string;
  phone: string;
  avatar_url?: string;
}): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Нэвтрэх шаардлагатай');

  const { error } = await (supabase
    .from('profiles') as any)
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/profile/bookings');
  revalidatePath('/profile/edit');
}

// ── Likes ─────────────────────────────────────────────────────────────────────

export async function toggleLike(placeId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Нэвтрэх шаардлагатай');

  const { data: existing } = await supabase
    .from('likes')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('place_id', placeId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('likes').delete().eq('user_id', user.id).eq('place_id', placeId);
    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/places');
    revalidatePath(`/places/${placeId}`);
    revalidatePath('/profile/favorites');
    return false;
  } else {
    const { error } = await (supabase.from('likes') as any).insert({ user_id: user.id, place_id: placeId });
    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/places');
    revalidatePath(`/places/${placeId}`);
    revalidatePath('/profile/favorites');
    return true;
  }
}

export async function getUserLikes(): Promise<string[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('likes')
      .select('place_id')
      .eq('user_id', user.id);
    return (data ?? []).map((l: { place_id: string }) => l.place_id);
  } catch {
    return [];
  }
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function createReview(
  placeId: string,
  rating: number,
  title: string,
  body: string
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Нэвтрэх шаардлагатай');
  const { error } = await (supabase
    .from('reviews') as any)
    .insert({ place_id: placeId, user_id: user.id, rating, title, body });
  if (error) throw new Error(error.message);
  revalidatePath(`/places/${placeId}`);
}

// ── Liked Places ──────────────────────────────────────────────────────────────

export async function getUserLikedPlaces(): Promise<Place[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from('likes')
      .select('place:places(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return (data ?? []).map((l: any) => l.place).filter(Boolean) as Place[];
  } catch {
    return [];
  }
}
