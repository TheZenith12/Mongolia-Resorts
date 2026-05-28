import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ManagerAssignment, Place } from '@/lib/models';
import { getPlacePaymentSettings } from '@/lib/actions/places';
import PaymentSettingsClient from '@/components/admin/PaymentSettingsClient';

export default async function AdminPaymentPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login?callbackUrl=/admin/payment');

  const user = session.user as any;
  const role = user.role;

  if (!['super_admin', 'manager'].includes(role)) redirect('/');

  await connectDB();

  let placeId: string | null = null;
  let placeName = '';

  if (role === 'manager') {
    const assignment = await ManagerAssignment.findOne({ manager_id: user.id }).lean() as any;
    placeId = assignment?.place_id?.toString() ?? null;
    if (!placeId) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 max-w-lg">
          <h2 className="font-semibold text-amber-800 mb-2">Газар оноогдоогүй байна</h2>
          <p className="text-amber-700 text-sm">
            Таньд газар оноогдоогүй байна. Super Admin-д хандана уу.
          </p>
        </div>
      );
    }
    const place = await Place.findById(placeId).select('name').lean() as any;
    placeName = place?.name ?? '';
  } else {
    // super_admin: query param-аар placeId авна, эсвэл эхний газрыг ашиглана
    const place = await Place.findOne({ is_published: true }).select('name').lean() as any;
    placeId = place?._id?.toString() ?? null;
    placeName = place?.name ?? '';
    if (!placeId) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 max-w-lg">
          <p className="text-amber-700 text-sm">Газар олдсонгүй.</p>
        </div>
      );
    }
  }

  const settings = await getPlacePaymentSettings(placeId!);

  return (
    <PaymentSettingsClient
      placeId={placeId!}
      placeName={placeName}
      initialSettings={settings}
    />
  );
}
