import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Booking, Place } from '@/lib/models';
import ConfirmationClient from '@/components/booking/ConfirmationClient';

async function getBooking(id: string) {
  await connectDB();
  const booking = await Booking.findById(id).lean();
  if (!booking) return null;

  const place = await Place.findById((booking as any).place_id)
    .select('_id name cover_image province')
    .lean();

  return {
    ...(booking as any),
    id:         (booking as any)._id.toString(),
    created_at: (booking as any).created_at?.toISOString(),
    updated_at: (booking as any).updated_at?.toISOString(),
    place: place ? {
      id:          (place as any)._id.toString(),
      name:        (place as any).name,
      cover_image: (place as any).cover_image ?? null,
      province:    (place as any).province ?? null,
    } : null,
  };
}

export default async function ConfirmationPage({ params }: { params: { id: string } }) {
  const booking = await getBooking(params.id);
  if (!booking) notFound();

  return <ConfirmationClient booking={booking} />;
}
