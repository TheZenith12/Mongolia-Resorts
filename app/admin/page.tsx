// app/admin/page.tsx
// REPLACE the entire file with this

import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server';
import { getCurrentProfile } from '@/lib/actions/auth';
import {
  MapPin, CalendarCheck, Star, Eye, TrendingUp,
  Building2, Leaf, DollarSign,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

async function getDashboardStats(role: string, userId: string) {
  try {
    const admin = createAdminClient();

    if (role === 'super_admin') {
      const [placesRes, bookingsRes, reviewsRes, statsRes] = await Promise.all([
        (admin.from('places') as any).select('id, type, view_count, is_published', { count: 'exact' }),
        (admin.from('bookings') as any).select('total_amount, status, payment_status', { count: 'exact' }),
        (admin.from('reviews') as any).select('id', { count: 'exact' }),
        (admin.from('site_stats') as any).select('key, value'),
      ]);

      const places   = placesRes.data ?? [];
      const bookings = bookingsRes.data ?? [];
      const paidBookings = bookings.filter((b: any) => b.payment_status === 'paid');
      const totalRevenue = paidBookings.reduce((a: number, b: any) => a + b.total_amount, 0);
      const statsMap: Record<string, number> = {};
      (statsRes.data ?? []).forEach((s: any) => { statsMap[s.key] = s.value; });

      return {
        isManager: false,
        places:          placesRes.count ?? 0,
        publishedPlaces: places.filter((p: any) => p.is_published).length,
        resorts:         places.filter((p: any) => p.type === 'resort').length,
        nature:          places.filter((p: any) => p.type === 'nature').length,
        bookings:        bookingsRes.count ?? 0,
        paidBookings:    paidBookings.length,
        totalRevenue,
        reviews:         reviewsRes.count ?? 0,
        totalViews:      places.reduce((a: number, p: any) => a + (p.view_count ?? 0), 0),
        siteViews:       statsMap['total_views'] ?? 0,
        placeName:       null,
      };
    }

    // Manager: зөвхөн өөрийн газрын статистик
    const { data: assignment } = await (admin.from('manager_assigned_place') as any)
      .select('place_id, places(name, view_count, is_published)')
      .eq('manager_id', userId)
      .maybeSingle();

    if (!assignment) {
      return { isManager: true, places: 0, bookings: 0, reviews: 0, totalRevenue: 0, placeName: null, paidBookings: 0, totalViews: 0, publishedPlaces: 0, resorts: 0, nature: 0, siteViews: 0 };
    }

    const placeId = assignment.place_id;
    const [bookingsRes, reviewsRes] = await Promise.all([
      (admin.from('bookings') as any).select('total_amount, payment_status', { count: 'exact' }).eq('place_id', placeId),
      (admin.from('reviews') as any).select('id', { count: 'exact' }).eq('place_id', placeId),
    ]);

    const bookings = bookingsRes.data ?? [];
    const paidBookings = bookings.filter((b: any) => b.payment_status === 'paid');
    const totalRevenue = paidBookings.reduce((a: number, b: any) => a + b.total_amount, 0);

    return {
      isManager:       true,
      placeName:       assignment.places?.name ?? null,
      places:          1,
      publishedPlaces: assignment.places?.is_published ? 1 : 0,
      bookings:        bookingsRes.count ?? 0,
      paidBookings:    paidBookings.length,
      totalRevenue,
      reviews:         reviewsRes.count ?? 0,
      totalViews:      assignment.places?.view_count ?? 0,
      resorts: 0, nature: 0, siteViews: 0,
    };
  } catch {
    return {
      isManager: false,
      places: 0, publishedPlaces: 0, resorts: 0, nature: 0,
      bookings: 0, paidBookings: 0, totalRevenue: 0,
      reviews: 0, totalViews: 0, siteViews: 0, placeName: null,
    };
  }
}

export default async function AdminDashboard() {
  const profileRaw = await getCurrentProfile();
  if (!profileRaw) return null;
  const profile = profileRaw as any;

  const role = profile.role;
  const stats = await getDashboardStats(role, profile.id as string);

  const cards = stats.isManager
    ? [
        { label: 'Нийт захиалга',   value: stats.bookings,            icon: CalendarCheck, color: 'bg-blue-500' },
        { label: 'Орлого',          value: formatPrice(stats.totalRevenue), icon: DollarSign,   color: 'bg-green-500' },
        { label: 'Сэтгэгдэл',       value: stats.reviews,             icon: Star,          color: 'bg-amber-500' },
        { label: 'Үзэлт',           value: stats.totalViews,          icon: Eye,           color: 'bg-purple-500' },
      ]
    : [
        { label: 'Нийт газар',       value: stats.places,             icon: MapPin,        color: 'bg-forest-600' },
        { label: 'Нийт захиалга',    value: stats.bookings,           icon: CalendarCheck, color: 'bg-blue-500' },
        { label: 'Нийт орлого',      value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'bg-green-500' },
        { label: 'Сэтгэгдэл',        value: stats.reviews,            icon: Star,          color: 'bg-amber-500' },
      ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          {stats.isManager ? `${stats.placeName ?? 'Миний газар'} — Самбар` : 'Самбар'}
        </h1>
        <p className="text-forest-500 text-sm mt-1">
          {stats.isManager ? 'Зөвхөн таны газрын мэдээлэл' : 'Нийт систем'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
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
    </div>
  );
}