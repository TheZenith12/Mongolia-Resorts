import { notFound, redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Booking, Place } from '@/lib/models';
import { getCurrentProfile } from '@/lib/actions/auth';
import PaymentClient from '@/components/booking/PaymentClient';

async function getBooking(id: string) {
  await connectDB();
  const booking = await Booking.findById(id).lean();
  if (!booking) return null;

  const place = await Place.findById((booking as any).place_id)
    .select('_id name cover_image price_per_night type qpay_merchant_code qpay_qr_image bank_name bank_account_number bank_account_name bank_phone')
    .lean();

  return {
    ...(booking as any),
    id:         (booking as any)._id.toString(),
    created_at: (booking as any).created_at?.toISOString(),
    updated_at: (booking as any).updated_at?.toISOString(),
    place: place ? {
      id:                   (place as any)._id.toString(),
      name:                 (place as any).name,
      cover_image:          (place as any).cover_image ?? null,
      price_per_night:      (place as any).price_per_night ?? null,
      type:                 (place as any).type,
      qpay_merchant_code:   (place as any).qpay_merchant_code ?? null,
      qpay_qr_image:        (place as any).qpay_qr_image ?? null,
      bank_name:            (place as any).bank_name ?? null,
      bank_account_number:  (place as any).bank_account_number ?? null,
      bank_account_name:    (place as any).bank_account_name ?? null,
      bank_phone:           (place as any).bank_phone ?? null,
    } : null,
  };
}

export default async function PaymentPage({ params }: { params: { id: string } }) {
  const [booking, profile] = await Promise.all([
    getBooking(params.id),
    getCurrentProfile(),
  ]);

  if (!booking) notFound();
  if (booking.payment_status === 'paid') redirect(`/booking/${params.id}/confirmation`);

  return <PaymentClient booking={booking as any} profile={profile} />;
}
