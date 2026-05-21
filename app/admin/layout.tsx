import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ManagerAssignment, Place } from '@/lib/models';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/admin');
  }

  const user = session.user as any;
  const role = user.role;

  if (!['super_admin', 'manager'].includes(role)) {
    redirect('/');
  }

  // Manager-ийн оноогдсон газрыг авах
  let assignedPlaceId: string | null = user.assigned_place_id ?? null;
  let assignedPlaceName: string | null = null;

  if (role === 'manager') {
    try {
      await connectDB();
      if (!assignedPlaceId) {
        const assignment = await ManagerAssignment.findOne({ manager_id: user.id }).lean();
        assignedPlaceId = (assignment as any)?.place_id ?? null;
      }
      if (assignedPlaceId) {
        const place = await Place.findById(assignedPlaceId).select('name').lean();
        assignedPlaceName = (place as any)?.name ?? null;
      }
    } catch { /* ignore */ }
  }

  const profile = {
    id:        user.id,
    email:     user.email,
    full_name: user.name,
    avatar_url: user.image,
    role,
  };

  return (
    <div className="flex min-h-screen bg-forest-950">
      <AdminSidebar
        profile={profile as any}
        assignedPlaceId={assignedPlaceId}
        assignedPlaceName={assignedPlaceName}
      />
      <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        {role === 'manager' && !assignedPlaceId && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h3 className="font-semibold text-amber-800 mb-1">Газар оноогдоогүй байна</h3>
            <p className="text-amber-700 text-sm">
              Super Admin таньд газар оноогоогүй байна. Администраторт хандана уу.
            </p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
