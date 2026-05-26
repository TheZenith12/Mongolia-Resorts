'use server';

import { connectDB } from '@/lib/mongodb';
import { Coupon } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';

// ── Купон шалгах (нийтийн) ───────────────────────────────────────────────────
export async function validateCoupon(code: string, amount: number, placeId?: string) {
  await connectDB();
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() }).lean() as any;

  if (!coupon)           return { valid: false, message: 'Купон олдсонгүй' };
  if (!coupon.is_active) return { valid: false, message: 'Купон идэвхгүй байна' };

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, message: 'Купоны хугацаа дууссан' };
  }

  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return { valid: false, message: 'Купоны хэрэглэх хязгаар дууссан' };
  }

  if (amount < coupon.min_amount) {
    return {
      valid: false,
      message: `Купон хэрэглэхийн тулд захиалгын дүн ₮${coupon.min_amount.toLocaleString()}-аас дээш байх шаардлагатай`,
    };
  }

  if (coupon.place_id && placeId && coupon.place_id !== placeId) {
    return { valid: false, message: 'Энэ купон уг газарт хамаарахгүй' };
  }

  const discount = coupon.type === 'percent'
    ? Math.round(amount * coupon.value / 100)
    : coupon.value;

  const finalDiscount = Math.min(discount, amount);

  return {
    valid:       true,
    couponId:    coupon._id.toString(),
    code:        coupon.code,
    type:        coupon.type as 'percent' | 'fixed',
    value:       coupon.value,
    discount:    finalDiscount,
    finalAmount: amount - finalDiscount,
    message:     coupon.type === 'percent'
      ? `${coupon.value}% хөнгөлөлт — ₮${finalDiscount.toLocaleString()} хасагдлаа`
      : `₮${coupon.value.toLocaleString()} хөнгөлөлт`,
  };
}

// ── Купон хэрэглэх (захиалга үүсгэхэд дуудагдана) ──────────────────────────
export async function useCoupon(couponId: string) {
  await connectDB();
  await Coupon.findByIdAndUpdate(couponId, { $inc: { uses_count: 1 } });
}

// ── Admin CRUD ───────────────────────────────────────────────────────────────
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'super_admin') throw new Error('Эрх хүрэлцэхгүй');
}

export async function getCoupons() {
  await connectDB();
  await requireAdmin();
  const docs = await Coupon.find().sort({ created_at: -1 }).lean();
  return docs.map((c: any) => ({
    id:          c._id.toString(),
    code:        c.code,
    type:        c.type,
    value:       c.value,
    min_amount:  c.min_amount,
    max_uses:    c.max_uses,
    uses_count:  c.uses_count,
    expires_at:  c.expires_at?.toISOString() ?? null,
    is_active:   c.is_active,
    place_id:    c.place_id ?? null,
    description: c.description ?? '',
    created_at:  c.created_at?.toISOString(),
  }));
}

export async function createCoupon(data: {
  code: string; type: 'percent' | 'fixed'; value: number;
  min_amount?: number; max_uses?: number | null; expires_at?: string;
  is_active?: boolean; place_id?: string; description?: string;
}) {
  await connectDB();
  await requireAdmin();
  await Coupon.create({
    ...data,
    code:       data.code.toUpperCase().trim(),
    expires_at: data.expires_at ? new Date(data.expires_at) : null,
    max_uses:   data.max_uses ?? null,
  });
  revalidatePath('/admin/coupons');
}

export async function updateCoupon(id: string, data: Partial<{
  is_active: boolean; max_uses: number | null; expires_at: string;
}>) {
  await connectDB();
  await requireAdmin();
  await Coupon.findByIdAndUpdate(id, {
    ...data,
    expires_at: data.expires_at ? new Date(data.expires_at) : undefined,
  });
  revalidatePath('/admin/coupons');
}

export async function deleteCoupon(id: string) {
  await connectDB();
  await requireAdmin();
  await Coupon.findByIdAndDelete(id);
  revalidatePath('/admin/coupons');
}
