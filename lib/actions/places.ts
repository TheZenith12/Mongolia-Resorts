'use server';

import { connectDB } from '@/lib/mongodb';
import { Place, Booking, Review, AvailabilityBlock, ManagerAssignment } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth-server';
import type { PlaceFormData, PlacesFilter, PaginatedResponse, SiteStats } from '@/lib/types';
import type { Place as PlaceType } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { toSlug } from '@/lib/slug';
import { sendPlaceApproved, sendPlaceRejected } from '@/lib/email';

// ── Slug хэрэгслүүд ────────────────────────────────────────────────────────────
async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = toSlug(name);
  let slug = base;
  let suffix = 2;
  while (true) {
    const q: any = { slug };
    if (excludeId) q._id = { $ne: excludeId };
    const existing = await Place.findOne(q).select('_id').lean();
    if (!existing) break;
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

// ── Auth Context Helper ────────────────────────────────────────────────────────

async function getAuthContext() {
  await connectDB();
  const sessionUser = await getCurrentUser();
  if (!sessionUser) throw new Error('Нэвтрэх шаардлагатай');

  const role = sessionUser.role;
  let assignedPlaceId: string | null = sessionUser.assigned_place_id ?? null;

  if (role === 'manager' && !assignedPlaceId) {
    const assignment = await ManagerAssignment.findOne({ manager_id: sessionUser.id }).lean();
    assignedPlaceId = (assignment as any)?.place_id ?? null;
  }

  return { user: sessionUser, role, assignedPlaceId };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY: PaginatedResponse<PlaceType> = { data: [], count: 0, page: 1, pageSize: 12, totalPages: 0 };

// ── Availability Blocks ────────────────────────────────────────────────────────

export async function getAvailabilityBlocks(placeId: string): Promise<Array<{
  id: string; place_id: string; start_date: string; end_date: string; reason: string | null; created_at: string;
}>> {
  try {
    await connectDB();
    const today = new Date().toISOString().split('T')[0];
    const blocks = await AvailabilityBlock.find({
      place_id: placeId,
      end_date: { $gte: today },
    }).sort({ start_date: 1 }).lean();

    return blocks.map((b: any) => ({
      id:         b._id.toString(),
      place_id:   b.place_id,
      start_date: b.start_date,
      end_date:   b.end_date,
      reason:     b.reason ?? null,
      created_at: b.created_at?.toISOString() ?? new Date().toISOString(),
    }));
  } catch { return []; }
}

export async function createAvailabilityBlock(
  placeId: string, startDate: string, endDate: string, reason: string
): Promise<void> {
  const { user, role, assignedPlaceId } = await getAuthContext();
  if (role !== 'super_admin' && role !== 'manager') throw new Error('Эрх хүрэлцэхгүй');
  if (role === 'manager' && assignedPlaceId !== placeId) throw new Error('Эрх хүрэлцэхгүй');

  await AvailabilityBlock.create({
    place_id:   placeId,
    start_date: startDate,
    end_date:   endDate,
    reason:     reason || null,
    created_by: user.id,
  });
  revalidatePath('/admin/availability');
}

export async function deleteAvailabilityBlock(id: string): Promise<void> {
  const { role, assignedPlaceId } = await getAuthContext();
  if (role !== 'super_admin' && role !== 'manager') throw new Error('Эрх хүрэлцэхгүй');

  if (role === 'manager' && assignedPlaceId) {
    const block = await AvailabilityBlock.findById(id).lean();
    if (!block || (block as any).place_id !== assignedPlaceId) {
      throw new Error('Энэ блокийг устгах эрх байхгүй');
    }
  }

  await AvailabilityBlock.findByIdAndDelete(id);
  revalidatePath('/admin/availability');
}

// ── Booking Status (Admin/Manager) ────────────────────────────────────────────

export async function updateBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'cancelled' | 'completed'
): Promise<void> {
  const { role, assignedPlaceId } = await getAuthContext();
  if (role !== 'super_admin' && role !== 'manager') throw new Error('Эрх хүрэлцэхгүй');

  const filter: any = { _id: bookingId };
  if (role === 'manager') {
    if (!assignedPlaceId) throw new Error('Танд газар оноогдоогүй байна');
    filter.place_id = assignedPlaceId;
  }

  await Booking.findOneAndUpdate(filter, { status });
  revalidatePath('/admin/bookings');
}

// ── Public Actions ─────────────────────────────────────────────────────────────

export async function getPlaces(filter: PlacesFilter = {}): Promise<PaginatedResponse<PlaceType>> {
  try {
    await connectDB();
    const {
      type, search, province, minPrice, maxPrice, minRating,
      page = 1, pageSize = 12,
      sortBy = 'created_at', sortOrder = 'desc',
    } = filter;

    const query: any = { is_published: true };
    if (type)      query.type = type;
    if (province)  query.province = province;
    if (minPrice)  query.price_per_night = { ...query.price_per_night, $gte: minPrice };
    if (maxPrice)  query.price_per_night = { ...query.price_per_night, $lte: maxPrice };
    if (minRating) query.rating_avg = { $gte: minRating };
    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address:     { $regex: search, $options: 'i' } },
        { province:    { $regex: search, $options: 'i' } },
      ];
    }

    const sortField = sortBy === 'created_at' ? 'created_at' : sortBy;
    const sortDir   = sortOrder === 'asc' ? 1 : -1;
    const skip      = (page - 1) * pageSize;

    const [docs, count] = await Promise.all([
      Place.find(query).sort({ [sortField]: sortDir }).skip(skip).limit(pageSize).lean(),
      Place.countDocuments(query),
    ]);

    const data = docs.map((p: any) => ({
      ...p,
      id:         p._id.toString(),
      images:     p.images ?? [],
      like_count: 0,
      created_at: p.created_at?.toISOString() ?? new Date().toISOString(),
      updated_at: p.updated_at?.toISOString() ?? new Date().toISOString(),
    })) as PlaceType[];

    return { data, count, page, pageSize, totalPages: Math.ceil(count / pageSize) };
  } catch {
    return EMPTY;
  }
}

export async function getPlace(id: string): Promise<PlaceType | null> {
  try {
    await connectDB();
    const place = await Place.findById(id).lean();
    if (!place) return null;

    const reviews = await Review.find({ place_id: id }).sort({ created_at: -1 }).lean();

    const reviewsFormatted = reviews.map((r: any) => ({
      id:         r._id.toString(),
      place_id:   r.place_id,
      user_id:    r.user_id ?? null,
      booking_id: r.booking_id ?? null,
      rating:     r.rating,
      title:      r.title ?? null,
      body:       r.body ?? null,
      images:     r.images ?? [],
      is_verified: r.is_verified ?? false,
      created_at: r.created_at?.toISOString() ?? new Date().toISOString(),
      user:       r.user ?? null,
    }));

    return {
      ...(place as any),
      id:         (place as any)._id.toString(),
      images:     (place as any).images ?? [],
      like_count: 0,
      created_at: (place as any).created_at?.toISOString() ?? new Date().toISOString(),
      updated_at: (place as any).updated_at?.toISOString() ?? new Date().toISOString(),
      reviews:    reviewsFormatted,
    } as PlaceType;
  } catch {
    return null;
  }
}

export async function incrementViewCount(placeId: string): Promise<void> {
  try {
    await connectDB();
    await Place.findByIdAndUpdate(placeId, { $inc: { view_count: 1 } });
  } catch { /* silence */ }
}

export async function getSiteStats(): Promise<SiteStats> {
  const fallback: SiteStats = { total_views: 0, total_places: 0, total_resorts: 0, total_nature: 0, total_users: 0, total_bookings: 0 };
  try {
    await connectDB();
    const { User: UserModel } = await import('@/lib/models');
    const [places, totalUsers, totalBookings] = await Promise.all([
      Place.find({ is_published: true }).select('type view_count').lean(),
      UserModel.countDocuments(),
      Booking.countDocuments(),
    ]);

    return {
      total_views:    places.reduce((sum, p: any) => sum + (p.view_count ?? 0), 0),
      total_places:   places.length,
      total_resorts:  places.filter((p: any) => p.type === 'resort').length,
      total_nature:   places.filter((p: any) => p.type === 'nature').length,
      total_users:    totalUsers,
      total_bookings: totalBookings,
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
): Promise<PlaceType[]> {
  try {
    await connectDB();
    const excludeId = placeId;

    // 1st priority: same type + same province
    if (province) {
      const docs = await Place.find({
        is_published: true, type, province, _id: { $ne: excludeId },
      }).sort({ rating_avg: -1 }).limit(limit).lean();
      if (docs.length >= 2) {
        return docs.map((p: any) => ({
          ...p, id: p._id.toString(), images: p.images ?? [], like_count: 0,
          created_at: p.created_at?.toISOString(), updated_at: p.updated_at?.toISOString(),
        })) as PlaceType[];
      }
    }

    // 2nd priority: same type, any province
    const docs = await Place.find({
      is_published: true, type, _id: { $ne: excludeId },
    }).sort({ rating_avg: -1 }).limit(limit).lean();

    return docs.map((p: any) => ({
      ...p, id: p._id.toString(), images: p.images ?? [], like_count: 0,
      created_at: p.created_at?.toISOString(), updated_at: p.updated_at?.toISOString(),
    })) as PlaceType[];
  } catch {
    return [];
  }
}

export async function getFeaturedPlaces(limit = 6): Promise<PlaceType[]> {
  try {
    await connectDB();
    const docs = await Place.find({ is_published: true, is_featured: true })
      .sort({ rating_avg: -1 }).limit(limit).lean();
    return docs.map((p: any) => ({
      ...p, id: p._id.toString(), images: p.images ?? [], like_count: 0,
      created_at: p.created_at?.toISOString(), updated_at: p.updated_at?.toISOString(),
    })) as PlaceType[];
  } catch {
    return [];
  }
}

export async function getAdminPlaces(filter: PlacesFilter = {}): Promise<PaginatedResponse<PlaceType>> {
  try {
    await connectDB();
    const { page = 1, pageSize = 20, search, type } = filter;
    const query: any = {};
    if (type)   query.type = type;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (page - 1) * pageSize;
    const [docs, count] = await Promise.all([
      Place.find(query).sort({ created_at: -1 }).skip(skip).limit(pageSize).lean(),
      Place.countDocuments(query),
    ]);

    const data = docs.map((p: any) => ({
      ...p, id: p._id.toString(), images: p.images ?? [], like_count: 0,
      created_at: p.created_at?.toISOString(), updated_at: p.updated_at?.toISOString(),
    })) as PlaceType[];

    return { data, count, page, pageSize, totalPages: Math.ceil(count / pageSize) };
  } catch {
    return EMPTY;
  }
}

// ── Admin / Manager Actions ────────────────────────────────────────────────────

export async function createPlace(formData: PlaceFormData): Promise<PlaceType> {
  const { role, user } = await getAuthContext();
  if (role !== 'super_admin') throw new Error('Зөвхөн Super Admin газар үүсгэж чадна');

  const slug = await generateUniqueSlug(formData.name);
  const place = await Place.create({ ...formData, slug, created_by: user.id });
  revalidatePath('/admin/places');
  revalidatePath('/');
  const p = place.toObject();
  return {
    ...p, id: p._id.toString(), images: p.images ?? [], like_count: 0,
    created_at: p.created_at?.toISOString(), updated_at: p.updated_at?.toISOString(),
  } as PlaceType;
}

export async function updatePlace(id: string, formData: PlaceFormData) {
  const { role, assignedPlaceId } = await getAuthContext();
  if (role === 'manager') {
    if (assignedPlaceId !== id) throw new Error('Энэ газрыг засах эрх байхгүй');
  } else if (role !== 'super_admin') {
    throw new Error('Эрх хүрэлцэхгүй');
  }

  const existing = await Place.findById(id).select('name slug').lean() as any;
  const needsNewSlug = existing && formData.name && formData.name !== existing.name;
  const slug = needsNewSlug ? await generateUniqueSlug(formData.name, id) : undefined;
  await Place.findByIdAndUpdate(id, { ...formData, ...(slug ? { slug } : {}) });
  revalidatePath('/admin/places');
  revalidatePath(`/admin/places/${id}/edit`);
  revalidatePath(`/places/${existing?.slug ?? id}`);
}

export async function deletePlace(id: string) {
  const { role } = await getAuthContext();
  if (role === 'manager') throw new Error('Manager газар устгах эрхгүй');
  if (role !== 'super_admin') throw new Error('Эрх хүрэлцэхгүй');

  await Place.findByIdAndDelete(id);
  revalidatePath('/admin/places');
  redirect('/admin/places');
}

export async function togglePublish(id: string, isPublished: boolean) {
  const { role, assignedPlaceId } = await getAuthContext();
  if (role === 'manager') {
    if (assignedPlaceId !== id) throw new Error('Энэ газрыг засах эрх байхгүй');
  } else if (role !== 'super_admin') {
    throw new Error('Эрх хүрэлцэхгүй');
  }

  await Place.findByIdAndUpdate(id, { is_published: isPublished });
  revalidatePath('/admin/places');
  revalidatePath(`/places/${id}`);
}

// ── Хэрэглэгч газар илгээх ────────────────────────────────────────────────────
export async function submitPlace(data: {
  name: string;
  type: 'nature' | 'resort';
  province: string;
  address?: string;
  description: string;
  phone?: string;
  website?: string;
  cover_image?: string;
  images?: string[];
}) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) throw new Error('Нэвтрэх шаардлагатай');

  const slug = await generateUniqueSlug(data.name);

  await Place.create({
    ...data,
    slug,
    is_published: false,
    is_featured:  false,
    status:       'pending',
    submitted_by:       user.id,
    submitted_by_name:  user.name,
    submitted_by_email: user.email,
    rating_avg:   0,
    rating_count: 0,
    view_count:   0,
    like_count:   0,
  });

  revalidatePath('/admin/places');
}

// ── Admin: газар зөвшөөрөх / татгалзах ───────────────────────────────────────
export async function reviewPlace(id: string, action: 'approve' | 'reject', reason?: string) {
  const { role } = await getAuthContext();
  if (role !== 'super_admin') throw new Error('Эрх хүрэлцэхгүй');

  const place = await Place.findById(id).lean() as any;

  if (action === 'approve') {
    await Place.findByIdAndUpdate(id, {
      status:       'approved',
      is_published: true,
      reject_reason: null,
    });
    // Email мэдэгдэл
    if (place?.submitted_by_email && place?.submitted_by_name) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      await sendPlaceApproved({
        to:            place.submitted_by_email,
        submitterName: place.submitted_by_name,
        placeName:     place.name,
        placeUrl:      `${appUrl}/places/${place.slug ?? id}`,
      });
    }
  } else {
    const rejectReason = reason ?? 'Шалтгаан заагдаагүй';
    await Place.findByIdAndUpdate(id, {
      status:        'rejected',
      is_published:  false,
      reject_reason: rejectReason,
    });
    // Email мэдэгдэл
    if (place?.submitted_by_email && place?.submitted_by_name) {
      await sendPlaceRejected({
        to:            place.submitted_by_email,
        submitterName: place.submitted_by_name,
        placeName:     place.name,
        reason:        rejectReason,
      });
    }
  }

  revalidatePath('/admin/places');
  revalidatePath(`/places/${id}`);
}

// ── Төлбөрийн тохиргоо ─────────────────────────────────────────────────────────

export interface PlacePaymentSettings {
  qpay_merchant_code:  string;
  qpay_qr_image:       string;
  bank_name:           string;
  bank_account_number: string;
  bank_account_name:   string;
  bank_phone:          string;
}

export async function getPlacePaymentSettings(placeId: string): Promise<PlacePaymentSettings> {
  await connectDB();
  const place = await Place.findById(placeId)
    .select('qpay_merchant_code qpay_qr_image bank_name bank_account_number bank_account_name bank_phone')
    .lean() as any;
  return {
    qpay_merchant_code:  place?.qpay_merchant_code  ?? '',
    qpay_qr_image:       place?.qpay_qr_image       ?? '',
    bank_name:           place?.bank_name           ?? '',
    bank_account_number: place?.bank_account_number ?? '',
    bank_account_name:   place?.bank_account_name   ?? '',
    bank_phone:          place?.bank_phone          ?? '',
  };
}

export async function updatePlacePaymentSettings(
  placeId: string,
  data: PlacePaymentSettings,
): Promise<void> {
  const { role, user } = await getAuthContext();
  await connectDB();

  // Manager зөвхөн өөрийн оноогдсон газрынхаа тохиргоог засна
  if (role === 'manager') {
    const assignment = await ManagerAssignment.findOne({ manager_id: user.id }).lean() as any;
    if (!assignment || assignment.place_id?.toString() !== placeId) {
      throw new Error('Энэ газрын тохиргоог засах эрх байхгүй');
    }
  } else if (role !== 'super_admin') {
    throw new Error('Эрх хүрэлцэхгүй');
  }

  await Place.findByIdAndUpdate(placeId, {
    qpay_merchant_code:  data.qpay_merchant_code  ?? '',
    qpay_qr_image:       data.qpay_qr_image       ?? '',
    bank_name:           data.bank_name           ?? '',
    bank_account_number: data.bank_account_number ?? '',
    bank_account_name:   data.bank_account_name   ?? '',
    bank_phone:          data.bank_phone          ?? '',
  });

  revalidatePath(`/places/${placeId}`);
  revalidatePath('/admin/payment');
}
