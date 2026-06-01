import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Place, ManagerAssignment } from '@/lib/models';
import { formatPrice, getPlaceTypeLabel, getPlaceTypeColor } from '@/lib/utils';
import { Plus, MapPin, Clock, User, Tent, Leaf } from 'lucide-react';
import AdminPlaceActions from '@/components/admin/AdminPlaceActions';
import PendingPlaceActions from '@/components/admin/PendingPlaceActions';
import { redirect } from 'next/navigation';

export default async function AdminPlacesPage({
  searchParams,
}: {
  searchParams: { page?: string; type?: string; search?: string; tab?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/login');

  const user = session.user as any;
  const role = user.role;
  const tab  = searchParams.tab ?? 'all';

  await connectDB();
  let places: any[]  = [];
  let pending: any[] = [];
  let count = 0;

  if (role === 'super_admin') {
    const pendingDocs = await Place.find({ status: 'pending' }).sort({ created_at: -1 }).lean();
    pending = pendingDocs.map((p: any) => ({
      ...p, id: p._id.toString(),
      images:     p.images ?? [],
      created_at: p.created_at?.toISOString(),
    }));

    const query: any = { status: { $ne: 'pending' } };
    if (searchParams.type)   query.type = searchParams.type;
    if (searchParams.search) query.name = { $regex: searchParams.search, $options: 'i' };

    const docs = await Place.find(query).sort({ created_at: -1 }).lean();
    count = docs.length;
    places = docs.map((p: any) => ({
      ...p,
      id:         p._id.toString(),
      images:     p.images ?? [],
      created_at: p.created_at?.toISOString(),
      updated_at: p.updated_at?.toISOString(),
    }));

  } else if (role === 'manager') {
    const assignment = await ManagerAssignment.findOne({ manager_id: user.id }).lean();
    const assignedPlaceId = (assignment as any)?.place_id ?? user.assigned_place_id;

    if (assignedPlaceId) {
      const place = await Place.findById(assignedPlaceId).lean();
      if (place) {
        count = 1;
        places = [{ ...(place as any), id: (place as any)._id.toString(), images: (place as any).images ?? [], created_at: (place as any).created_at?.toISOString(), updated_at: (place as any).updated_at?.toISOString() }];
      }
    }
  } else {
    redirect('/');
  }

  const showPending = role === 'super_admin' && tab === 'pending';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-semibold text-forest-900">
            {role === 'manager' ? 'Миний газар' : 'Газрууд'}
          </h1>
          <p className="text-forest-500 text-sm mt-0.5">{count} нийт газар</p>
        </div>
        {role === 'super_admin' && (
          <Link href="/admin/places/new" className="btn-primary text-sm py-2 px-3 lg:px-4">
            <Plus size={16} />
            <span className="hidden sm:inline">Шинэ газар нэмэх</span>
            <span className="sm:hidden">Нэмэх</span>
          </Link>
        )}
      </div>

      {/* Tabs */}
      {role === 'super_admin' && (
        <div className="flex gap-2 mb-5">
          <Link href="/admin/places?tab=all"
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab !== 'pending' ? 'bg-forest-800 text-white' : 'bg-white text-forest-600 border border-forest-200 hover:border-forest-400'
            }`}>
            Бүгд ({count})
          </Link>
          <Link href="/admin/places?tab=pending"
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              tab === 'pending' ? 'bg-amber-500 text-white' : 'bg-white text-forest-600 border border-forest-200 hover:border-forest-400'
            }`}>
            <Clock size={14} />
            Хүлээгдэж буй
            {pending.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                tab === 'pending' ? 'bg-white/30 text-white' : 'bg-amber-500 text-white'
              }`}>{pending.length}</span>
            )}
          </Link>
        </div>
      )}

      {/* Search */}
      {role === 'super_admin' && !showPending && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
          <form className="flex flex-col sm:flex-row gap-2">
            <input name="search" defaultValue={searchParams.search}
              placeholder="Нэрээр хайх..." className="input-field flex-1 text-sm py-2" />
            <select name="type" defaultValue={searchParams.type ?? ''} className="input-field sm:w-44 text-sm py-2">
              <option value="">Бүгд</option>
              <option value="resort">Амралтын газар</option>
              <option value="nature">Байгалийн газар</option>
            </select>
            <button type="submit" className="btn-primary text-sm py-2">Хайх</button>
          </form>
        </div>
      )}

      {/* Pending places */}
      {showPending ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {pending.length === 0 ? (
            <div className="text-center py-16 text-forest-400 text-sm">
              <Clock size={32} className="mx-auto mb-3 text-forest-200" />
              Хүлээгдэж буй газар байхгүй байна
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pending.map(place => (
                <div key={place.id} className="p-4 flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-forest-100 flex-shrink-0">
                    {place.cover_image ? (
                      <Image src={place.cover_image} alt={place.name} width={56} height={56} className="object-cover w-full h-full" unoptimized />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${place.type === 'resort' ? 'text-amber-400' : 'text-forest-400'}`}>
                        {place.type === 'resort' ? <Tent size={24} /> : <Leaf size={24} />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-forest-900 text-sm truncate">{place.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-forest-500">
                          {place.province && <span className="flex items-center gap-1"><MapPin size={10} />{place.province}</span>}
                          <span className="flex items-center gap-1"><User size={10} />{place.submitted_by_name ?? 'Хэрэглэгч'}</span>
                        </div>
                        {place.description && (
                          <p className="text-xs text-forest-600 mt-1.5 line-clamp-2">{place.description}</p>
                        )}
                      </div>
                      <PendingPlaceActions placeId={place.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* ── Mobile card list (< lg) ── */}
          <div className="lg:hidden divide-y divide-gray-50">
            {places.map((place) => (
              <div key={place.id} className="p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-forest-100 flex-shrink-0">
                  {place.cover_image ? (
                    <Image src={place.cover_image} alt={place.name} width={48} height={48} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${place.type === 'resort' ? 'text-amber-400' : 'text-forest-400'}`}>
                      {place.type === 'resort' ? <Tent size={20} /> : <Leaf size={20} />}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-forest-900 truncate">{place.name}</div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {place.province && (
                      <span className="text-xs text-forest-400 flex items-center gap-0.5">
                        <MapPin size={10} />{place.province}
                      </span>
                    )}
                    <span className={`badge text-[10px] py-0 ${place.is_published ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {place.is_published ? 'Нийтлэгдсэн' : 'Ноорог'}
                    </span>
                    {place.price_per_night && (
                      <span className="text-xs text-forest-600 font-medium">{formatPrice(place.price_per_night)}</span>
                    )}
                  </div>
                </div>
                <AdminPlaceActions place={place} />
              </div>
            ))}
            {places.length === 0 && (
              <div className="text-center py-12 text-forest-400 text-sm">
                {role === 'manager' ? 'Оноогдсон газар байхгүй байна' : 'Газар байхгүй байна'}
              </div>
            )}
          </div>

          {/* ── Desktop table (lg+) ── */}
          <table className="hidden lg:table w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Газар', 'Төрөл', 'Байршил', 'Үнэ', 'Статус', 'Үйлдэл'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-forest-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {places.map((place) => (
                <tr key={place.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-forest-100 flex-shrink-0">
                        {place.cover_image ? (
                          <Image src={place.cover_image} alt={place.name} width={48} height={48} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${place.type === 'resort' ? 'text-amber-400' : 'text-forest-400'}`}>
                            {place.type === 'resort' ? <Tent size={20} /> : <Leaf size={20} />}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-forest-900 text-sm">{place.name}</div>
                        <div className="text-xs text-forest-400 mt-0.5">{place.view_count ?? 0} үзэлт</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`badge text-xs ${getPlaceTypeColor(place.type)}`}>{getPlaceTypeLabel(place.type)}</span>
                  </td>
                  <td className="px-4 py-4">
                    {place.province ? (
                      <div className="flex items-center gap-1 text-forest-500 text-xs"><MapPin size={12} /> {place.province}</div>
                    ) : <span className="text-forest-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-forest-700 text-sm font-medium">
                      {place.price_per_night ? formatPrice(place.price_per_night) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`badge text-xs ${place.is_published
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {place.is_published ? 'Нийтлэгдсэн' : 'Ноорог'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <AdminPlaceActions place={place} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {places.length === 0 && (
            <div className="hidden lg:block text-center py-16 text-forest-400 text-sm">
              {role === 'manager' ? 'Оноогдсон газар байхгүй байна' : 'Газар байхгүй байна'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
