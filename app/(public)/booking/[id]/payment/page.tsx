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
    .select('_id name cover_image price_per_night type')
    .lean();

  return {
    ...(booking as any),
    id:         (booking as any)._id.toString(),
    created_at: (booking as any).created_at?.toISOString(),
    updated_at: (booking as any).updated_at?.toISOString(),
    place: place ? {
      id:             (place as any)._id.toString(),
      name:           (place as any).name,
      cover_image:    (place as any).cover_image ?? null,
      price_per_night: (place as any).price_per_night ?? null,
      type:           (place as any).type,
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
