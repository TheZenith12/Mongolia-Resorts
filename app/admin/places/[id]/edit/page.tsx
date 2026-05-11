import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import { Place, ManagerAssignment } from '@/lib/models';
import PlaceForm from '@/components/admin/PlaceForm';

export default async function EditPlacePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');

  const user = session.user as any;
  const role = user.role;

  if (!['super_admin', 'manager'].includes(role)) redirect('/');

  await connectDB();

  // Manager бол зөвхөн өөрт оноогдсон газраа засаж чадна
  if (role === 'manager') {
    const assignment = await ManagerAssignment.findOne({ manager_id: user.id }).lean();
    const assignedPlaceId = (assignment as any)?.place_id ?? user.assigned_place_id;
    if (!assignedPlaceId || assignedPlaceId !== params.id) {
      redirect('/admin');
    }
  }

  const place = await Place.findById(params.id).lean();
  if (!place) notFound();

  const placeData = {
    ...(place as any),
    id: (place as any)._id.toString(),
    images: (place as any).images ?? [],
    created_at: (place as any).created_at?.toISOString(),
    updated_at: (place as any).updated_at?.toISOString(),
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-forest-900 mb-6">
        Газар засах: {(place as any).name}
      </h1>
      <PlaceForm place={placeData} mode="edit" />
    </div>
  );
}
