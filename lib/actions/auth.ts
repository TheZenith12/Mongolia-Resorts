'use server';

import { connectDB } from '@/lib/mongodb';
import { User, Booking, Like, Review, Place, AvailabilityBlock } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth-server';
import type { BookingFormData } from '@/lib/types';
import { calculateNights } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, fullName: string): Promise<void> {
  await connectDB();
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new Error('Энэ и-мэйл бүртгэлтэй байна');
  const hashed = await bcrypt.hash(password, 12);
  await User.create({ email: email.toLowerCase(), password: hashed, full_name: fullName });
}

export async function signOut(): Promise<void> {
  redirect('/auth/login');
}

export async function getCurrentProfile() {
  try {
    await connectDB();
    const sessionUser = await getCurrentUser();
    if (!sessionUser) return null;
    const user = await User.findById(sessionUser.id).lean();
    if (!user) return null;
    return {
      id:         (user as any)._id.toString(),
      email:      (user as any).email,
      full_name:  (user as any).full_name ?? null,
      phone:      (user as any).phone ?? null,
      avatar_url: (user as any).avatar_url ?? null,
      role:       (user as any).role,
      created_at: (user as any).created_at?.toISOString() ?? new Date().toISOString(),
      updated_at: (user as any).updated_at?.toISOString() ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function updateProfile(data: {
  full_name: string;
  phone: string;
  avatar_url?: string;
}): Promise<void> {
  await connectDB();
  const sessionUser = await getCurrentUser();
  if (!sessionUser) throw new Error('Нэвтрэх шаардлагатай');

  await User.findByIdAndUpdate(sessionUser.id, {
    full_name:  data.full_name,
    phone:      data.phone,
    ...(data.avatar_url !== undefined && { avatar_url: data.avatar_url }),
  });

  revalidatePath('/profile/bookings');
  revalidatePath('/profile/edit');
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export async function createBooking(formData: BookingFormData) {
  await connectDB();
  const sessionUser = await getCurrentUser();

  const place = await Place.findById(formData.place_id).lean();
  if (!place) throw new Error('Газар олдсонгүй');
  if (!(place as any).price_per_night) throw new Error('Энэ газар захиалах боломжгүй');

  const nights = calculateNights(formData.check_in, formData.check_out);
  if (nights < 1) throw new Error('Буцах огноо буруу байна');

  const total_amount = ((place as any).price_per_night as number) * nights * formData.guest_count;

  const booking = await Booking.create({
    place_id:       formData.place_id,
    guest_name:     formData.guest_name,
    guest_phone:    formData.guest_phone,
    guest_email:    formData.guest_email ?? null,
    guest_count:    formData.guest_count,
    check_in:       formData.check_in,
    check_out:      formData.check_out,
    nights,
    payment_method: formData.payment_method,
    notes:          formData.notes ?? null,
    user_id:        sessionUser?.id ?? null,
    total_amount,
    payment_status: 'pending',
    status:         'pending',
  });

  revalidatePath('/profile/bookings');

  const doc = booking.toObject();
  return {
    ...doc,
    id: doc._id.toString(),
    place_id: doc.place_id,
    created_at: doc.created_at?.toISOString(),
    updated_at: doc.updated_at?.toISOString(),
  };
}

export async function getUserBookings() {
  try {
    await connectDB();
    const sessionUser = await getCurrentUser();
    if (!sessionUser) return [];

    const bookings = await Booking.find({ user_id: sessionUser.id })
      .sort({ created_at: -1 })
      .lean();

    // Fetch places for each booking
    const placeIds = Array.from(new Set(bookings.map((b: any) => b.place_id).filter(Boolean)));
    const places = await Place.find({ _id: { $in: placeIds } }).lean();
    const placeMap = new Map(places.map((p: any) => [p._id.toString(), p]));

    return bookings.map((b: any) => {
      const place = placeMap.get(b.place_id);
      return {
        ...b,
        id:         b._id.toString(),
        created_at: b.created_at?.toISOString(),
        updated_at: b.updated_at?.toISOString(),
        place: place ? {
          id:          (place as any)._id.toString(),
          name:        (place as any).name,
          cover_image: (place as any).cover_image ?? null,
          type:        (place as any).type,
        } : null,
      };
    });
  } catch {
    return [];
  }
}

export async function cancelBooking(id: string): Promise<{ refunded: boolean }> {
  await connectDB();
  const sessionUser = await getCurrentUser();
  if (!sessionUser) throw new Error('Нэвтрэх шаардлагатай');

  const booking = await Booking.findOne({ _id: id, user_id: sessionUser.id }).lean();
  if (!booking) throw new Error('Захиалга олдсонгүй');
  if ((booking as any).status === 'cancelled') throw new Error('Захиалга аль хэдийн цуцлагдсан байна');
  if ((booking as any).status === 'completed') throw new Error('Дууссан захиалгыг цуцлах боломжгүй');

  let refunded = false;

  if (
    (booking as any).payment_status === 'paid' &&
    (booking as any).payment_method === 'stripe' &&
    (booking as any).payment_intent
  ) {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
    try {
      await stripe.refunds.create({ payment_intent: (booking as any).payment_intent });
      refunded = true;
    } catch {
      // Stripe refund failed — still cancel, admin handles manually
    }
  }

  await Booking.findByIdAndUpdate(id, {
    status: 'cancelled',
    payment_status: refunded ? 'refunded' : (booking as any).payment_status,
  });

  revalidatePath('/profile/bookings');
  return { refunded };
}

export async function getBookedDateRanges(
  placeId: string,
  roomId?: string
): Promise<Array<{ check_in: string; check_out: string }>> {
  try {
    await connectDB();
    const today = new Date().toISOString().split('T')[0];

    const bookingFilter: any = {
      place_id: placeId,
      status:   { $in: ['pending', 'confirmed'] },
      check_out: { $gte: today },
    };
    if (roomId) bookingFilter.room_id = roomId;

    const [bookings, blocks] = await Promise.all([
      Booking.find(bookingFilter).select('check_in check_out').lean(),
      AvailabilityBlock.find({ place_id: placeId, end_date: { $gte: today } })
        .select('start_date end_date').lean(),
    ]);

    const booked = bookings.map((b: any) => ({ check_in: b.check_in, check_out: b.check_out }));
    const blocked = blocks.map((b: any) => ({ check_in: b.start_date, check_out: b.end_date }));

    return [...booked, ...blocked];
  } catch {
    return [];
  }
}

// ── Likes ─────────────────────────────────────────────────────────────────────

export async function toggleLike(placeId: string): Promise<boolean> {
  await connectDB();
  const sessionUser = await getCurrentUser();
  if (!sessionUser) throw new Error('Нэвтрэх шаардлагатай');

  const existing = await Like.findOne({ user_id: sessionUser.id, place_id: placeId });

  if (existing) {
    await Like.deleteOne({ user_id: sessionUser.id, place_id: placeId });
    revalidatePath('/');
    revalidatePath('/places');
    revalidatePath(`/places/${placeId}`);
    revalidatePath('/profile/bookings');
    return false;
  } else {
    await Like.create({ user_id: sessionUser.id, place_id: placeId });
    revalidatePath('/');
    revalidatePath('/places');
    revalidatePath(`/places/${placeId}`);
    revalidatePath('/profile/bookings');
    return true;
  }
}

export async function getUserLikes(): Promise<string[]> {
  try {
    await connectDB();
    const sessionUser = await getCurrentUser();
    if (!sessionUser) return [];
    const likes = await Like.find({ user_id: sessionUser.id }).select('place_id').lean();
    return likes.map((l: any) => l.place_id);
  } catch {
    return [];
  }
}

export async function getUserLikedPlaces() {
  try {
    await connectDB();
    const sessionUser = await getCurrentUser();
    if (!sessionUser) return [];

    const likes = await Like.find({ user_id: sessionUser.id })
      .sort({ created_at: -1 })
      .lean();

    const placeIds = likes.map((l: any) => l.place_id).filter(Boolean);
    const places = await Place.find({ _id: { $in: placeIds }, is_published: true }).lean();

    return places.map((p: any) => ({
      ...p,
      id:         p._id.toString(),
      images:     p.images ?? [],
      created_at: p.created_at?.toISOString(),
      updated_at: p.updated_at?.toISOString(),
    }));
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
  await connectDB();
  const sessionUser = await getCurrentUser();
  if (!sessionUser) throw new Error('Нэвтрэх шаардлагатай');

  const userDoc = await User.findById(sessionUser.id).lean();

  await Review.create({
    place_id: placeId,
    user_id:  sessionUser.id,
    rating,
    title,
    body,
    user: {
      full_name:  (userDoc as any)?.full_name ?? sessionUser.name ?? '',
      avatar_url: (userDoc as any)?.avatar_url ?? sessionUser.image ?? '',
    },
  });

  // Update place rating
  const reviews = await Review.find({ place_id: placeId }).select('rating').lean();
  const count = reviews.length;
  const avg = count > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / count
    : 0;

  await Place.findByIdAndUpdate(placeId, {
    rating_avg:   Math.round(avg * 10) / 10,
    rating_count: count,
  });

  revalidatePath(`/places/${placeId}`);
}
