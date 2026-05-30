import { getCurrentProfile } from '@/lib/actions/auth';
import { connectDB } from '@/lib/mongodb';
import { Place, Booking, Review, ManagerAssignment } from '@/lib/models';
import { CalendarCheck, Star, Eye, DollarSign, MapPin, TrendingUp, Users, Clock } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import Link from 'next/link';

async function getDashboardData(role: string, userId: string) {
  try {
    await connectDB();

    if (role === 'super_admin') {
      const [places, bookings, reviewCount, recentBookings] = await Promise.all([
        Place.find({}).select('type view_count is_published').lean(),
        Booking.find({}).select('total_amount payment_status created_at status guest_name guest_phone check_in check_out').lean(),
        Review.countDocuments(),
        Booking.find({})
          .select('guest_name guest_phone check_in check_out status payment_status total_amount')
          .sort({ created_at: -1 }).limit(5).lean(),
      ]);

      const paidBookings = bookings.filter((b: any) => b.payment_status === 'paid');

      return {
        isManager: false, placeName: null, assignedPlaceId: null,
        places:          places.length,
        publishedPlaces: places.filter((p: any) => p.is_published).length,
        bookings:        bookings.length,
        paidBookings:    paidBookings.length,
        totalRevenue:    paidBookings.reduce((a, b: any) => a + b.total_amount, 0),
        reviews:         reviewCount,
        totalViews:      places.reduce((a, p: any) => a + (p.view_count ?? 0), 0),
        monthlyRevenue:  getMonthlyRevenue(paidBookings as any[]),
        recentBookings:  recentBookings.map((b: any) => ({
          ...b, id: b._id.toString(), created_at: b.created_at?.toISOString(),
        })),
        occupancyRate:   null,
      };
    }

    // Manager
    const assignment = await ManagerAssignment.findOne({ manager_id: userId }).lean();
    if (!assignment) {
      return {
        isManager: true, placeName: null, assignedPlaceId: null,
        places: 0, publishedPlaces: 0, bookings: 0,
        paidBookings: 0, totalRevenue: 0, reviews: 0, totalViews: 0,
        monthlyRevenue: [], recentBookings: [], occupancyRate: null,
      };
    }

    const placeId = (assignment as any).place_id;
    const [place, bookings, reviewCount, recentBookings] = await Promise.all([
      Place.findById(placeId).select('name view_count').lean(),
      Booking.find({ place_id: placeId }).select('total_amount payment_status created_at status check_in check_out').lean(),
      Review.countDocuments({ place_id: placeId }),
      Booking.find({ place_id: placeId })
        .select('guest_name guest_phone check_in check_out status payment_status total_amount')
        .sort({ created_at: -1 }).limit(5).lean(),
    ]);

    const paidBookings = bookings.filter((b: any) => b.payment_status === 'paid');
    const confirmedBookings = bookings.filter((b: any) => ['confirmed', 'pending'].includes(b.status));

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    let bookedDays = 0;
    confirmedBookings.forEach((b: any) => {
      const cin  = new Date(b.check_in);
      const cout = new Date(b.check_out);
      const start = cin < thirtyDaysAgo ? thirtyDaysAgo : cin;
      const end   = cout > today ? today : cout;
      if (end > start) {
        bookedDays += Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }
    });
    const occupancyRate = Math.min(100, Math.round((bookedDays / 30) * 100));

    return {
      isManager:      true,
      placeName:      (place as any)?.name ?? null,
      assignedPlaceId: placeId,
      places: 1, publishedPlaces: 1,
      bookings:       bookings.length,
      paidBookings:   paidBookings.length,
      totalRevenue:   paidBookings.reduce((a, b: any) => a + b.total_amount, 0),
      reviews:        reviewCount,
      totalViews:     (place as any)?.view_count ?? 0,
      monthlyRevenue: getMonthlyRevenue(paidBookings as any[]),
      recentBookings: recentBookings.map((b: any) => ({
        ...b,
        id:         b._id.toString(),
        created_at: b.created_at?.toISOString(),
      })),
      occupancyRate,
    };
  } catch {
    return {
      isManager: false, placeName: null, assignedPlaceId: null,
      places: 0, publishedPlaces: 0, bookings: 0,
      paidBookings: 0, totalRevenue: 0, reviews: 0, totalViews: 0,
      monthlyRevenue: [], recentBookings: [], occupancyRate: null,
    };
  }
}

function getMonthlyRevenue(paidBookings: any[]): Array<{ month: string; revenue: number }> {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = 0;
  }
  paidBookings.forEach((b: any) => {
    const d = new Date(b.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (months[key] !== undefined) months[key] += b.total_amount;
  });
  const MN_MONTHS = ['1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар','7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар'];
  return Object.entries(months).map(([key, revenue]) => ({
    month: MN_MONTHS[parseInt(key.split('-')[1]) - 1],
    revenue,
  }));
}

function RevenueChart({ data }: { data: Array<{ month: string; revenue: number }> }) {
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="flex items-end gap-2 h-32 pt-4">
      {data.map((d, i) => {
        const heightPct = (d.revenue / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div className="relative w-full flex items-end justify-center" style={{ height: '96px' }}>
              <div
                className="w-full bg-forest-600 rounded-t-lg transition-all duration-500 group-hover:bg-forest-500"
                style={{ height: `${Math.max(heightPct, 2)}%` }}
              />
              {d.revenue > 0 && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-forest-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatPrice(d.revenue)}
                </div>
              )}
            </div>
            <span className="text-[9px] text-forest-400 text-center leading-tight">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-blue-50 text-blue-700',
};
const statusLabels: Record<string, string> = {
  pending: 'Хүлээгдэж буй', confirmed: 'Батлагдсан', cancelled: 'Цуцлагдсан', completed: 'Дууссан',
};

export default async function AdminDashboard() {
  const profileRaw = await getCurrentProfile();
  if (!profileRaw) return null;
  const profile = profileRaw as any;
  const stats = await getDashboardData(profile.role, profile.id as string);

  const statCards = stats.isManager
    ? [
        { label: 'Нийт захиалга',  value: stats.bookings,                  icon: CalendarCheck, color: 'bg-blue-500' },
        { label: 'Орлого',          value: formatPrice(stats.totalRevenue),  icon: DollarSign,    color: 'bg-green-500' },
        { label: 'Сэтгэгдэл',       value: stats.reviews,                   icon: Star,          color: 'bg-amber-500' },
        { label: 'Үзэлт',           value: stats.totalViews,                icon: Eye,           color: 'bg-purple-500' },
      ]
    : [
        { label: 'Нийт газар',      value: stats.places,                    icon: MapPin,        color: 'bg-forest-600' },
        { label: 'Нийт захиалга',   value: stats.bookings,                  icon: CalendarCheck, color: 'bg-blue-500' },
        { label: 'Нийт орлого',     value: formatPrice(stats.totalRevenue),  icon: DollarSign,    color: 'bg-green-500' },
        { label: 'Сэтгэгдэл',       value: stats.reviews,                   icon: Star,          color: 'bg-amber-500' },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-semibold text-forest-900">
          {stats.isManager && stats.placeName ? `${stats.placeName} — Самбар` : 'Самбар'}
        </h1>
        <p className="text-forest-500 text-sm mt-0.5">
          {stats.isManager ? 'Таны газрын мэдээлэл' : 'Нийт систем'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="text-2xl font-bold text-forest-900">{card.value}</div>
              <div className="text-xs text-forest-500 mt-1">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Revenue chart — both manager and super_admin */}
      {stats.monthlyRevenue.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-forest-900 flex items-center gap-2">
                <TrendingUp size={16} className="text-forest-500" /> Сарын орлого
              </h2>
              <span className="text-xs text-forest-400">Сүүлийн 6 сар</span>
            </div>
            <RevenueChart data={stats.monthlyRevenue} />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
            <p className="text-xs font-semibold text-forest-500 uppercase tracking-wide mb-3">Хурдан холбоос</p>
            {(stats.isManager
              ? [
                  { href: '/admin/bookings',    label: 'Захиалгууд',   icon: CalendarCheck },
                  { href: '/admin/availability', label: 'Огноо блоклох', icon: Clock },
                  { href: '/admin/reviews',      label: 'Сэтгэгдлүүд',  icon: Star },
                ]
              : [
                  { href: '/admin/bookings',  label: 'Захиалгууд',    icon: CalendarCheck },
                  { href: '/admin/places',    label: 'Газрууд',       icon: MapPin },
                  { href: '/admin/users',     label: 'Хэрэглэгчид',   icon: Users },
                ]
            ).map(l => (
              <Link key={l.href} href={l.href}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-forest-50 text-sm text-forest-700 transition-colors">
                <l.icon size={14} className="text-forest-400" /> {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {stats.isManager && stats.occupancyRate !== null && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 max-w-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users size={15} className="text-forest-500" />
            <span className="text-sm font-semibold text-forest-900">Дүүргэлт (30 хоног)</span>
          </div>
          <div className="text-3xl font-bold text-forest-900 mb-2">{stats.occupancyRate}%</div>
          <div className="w-full bg-forest-100 rounded-full h-2">
            <div className="bg-forest-600 h-2 rounded-full transition-all duration-700"
              style={{ width: `${stats.occupancyRate}%` }} />
          </div>
          <p className="text-xs text-forest-400 mt-2">Сүүлийн 30 хоногт</p>
        </div>
      )}

      {stats.recentBookings.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-forest-900">Сүүлийн захиалгууд</h2>
            <Link href="/admin/bookings" className="text-xs text-forest-500 hover:text-forest-700">
              Бүгдийг харах →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentBookings.map((b: any) => (
              <div key={b.id} className="px-4 lg:px-6 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-forest-900">{b.guest_name}</div>
                  <div className="text-xs text-forest-400">{b.guest_phone}</div>
                </div>
                <div className="text-xs text-forest-500 hidden sm:block">
                  {formatDate(b.check_in)} → {formatDate(b.check_out)}
                </div>
                <div className="text-sm font-medium text-forest-700 hidden sm:block">
                  {formatPrice(b.total_amount)}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[b.status] ?? ''}`}>
                  {statusLabels[b.status] ?? b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
