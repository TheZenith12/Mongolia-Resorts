import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Booking, Place, ManagerAssignment } from '@/lib/models';
import AdminBookingsClient from '@/components/admin/AdminBookingsClient';

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');

  const user = session.user as any;
  const role = user.role;
  if (!['super_admin', 'manager'].includes(role)) redirect('/');

  await connectDB();
  let bookings: any[] = [];

  if (role === 'super_admin') {
    const docs = await Booking.find({}).sort({ created_at: -1 }).limit(100).lean();
    const placeIds = Array.from(new Set(docs.map((b: any) => b.place_id).filter(Boolean)));
    const places = await Place.find({ _id: { $in: placeIds } }).select('_id name').lean();
    const placeMap = new Map(places.map((p: any) => [p._id.toString(), { name: p.name }]));

    bookings = docs.map((b: any) => ({
      ...b,
      id:         b._id.toString(),
      created_at: b.created_at?.toISOString(),
      updated_at: b.updated_at?.toISOString(),
      place:      placeMap.get(b.place_id) ?? null,
    }));

  } else if (role === 'manager') {
    const assignment = await ManagerAssignment.findOne({ manager_id: user.id }).lean();
    const assignedPlaceId = (assignment as any)?.place_id ?? user.assigned_place_id;

    if (assignedPlaceId) {
      const [docs, place] = await Promise.all([
        Booking.find({ place_id: assignedPlaceId }).sort({ created_at: -1 }).limit(100).lean(),
        Place.findById(assignedPlaceId).select('name').lean(),
      ]);
      const placeName = { name: (place as any)?.name ?? null };
      bookings = docs.map((b: any) => ({
        ...b,
        id:         b._id.toString(),
        created_at: b.created_at?.toISOString(),
        updated_at: b.updated_at?.toISOString(),
        place:      placeName,
      }));
    }
  }

  return (
    <AdminBookingsClient
      bookings={bookings}
      currentUserId={user.id}
    />
  );
}
