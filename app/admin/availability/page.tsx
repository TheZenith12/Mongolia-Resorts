import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/auth';
import { getAvailabilityBlocks } from '@/lib/actions/places';
import { connectDB } from '@/lib/mongodb';
import { ManagerAssignment } from '@/lib/models';
import AvailabilityClient from '@/components/admin/AvailabilityClient';

async function getManagerPlaceId(userId: string): Promise<string | null> {
  await connectDB();
  const assignment = await ManagerAssignment.findOne({ manager_id: userId }).lean();
  return (assignment as any)?.place_id ?? null;
}

export default async function AvailabilityPage() {
  const profile = await getCurrentProfile() as any;
  if (!profile) redirect('/auth/login');
  if (!['super_admin', 'manager'].includes(profile.role)) redirect('/admin');

  const placeId = profile.role === 'manager'
    ? await getManagerPlaceId(profile.id)
    : null;

  if (!placeId) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h2 className="font-semibold text-amber-800 mb-1">Газар оноогдоогүй байна</h2>
        <p className="text-amber-700 text-sm">Super Admin таньд газар оноогоогүй байна.</p>
      </div>
    );
  }

  const blocks = await getAvailabilityBlocks(placeId);

  return <AvailabilityClient placeId={placeId} initialBlocks={blocks} />;
}
