'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar, Users, ArrowRight, RefreshCw,
  CheckCircle2, Clock, XCircle, BadgeCheck, Loader2,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { cancelBooking } from '@/lib/actions/auth';
import { toast } from 'react-hot-toast';
import { useLang } from '@/lib/lang-context';

interface Booking {
  id: string;
  status: string;
  payment_status: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  nights: number;
  total_amount: number;
  updated_at?: string;
  place?: {
    name: string;
    cover_image?: string;
    type?: string;
    price_per_night?: number;
  };
}

interface Props {
  initialBookings: Booking[];
}

// Status config
const STATUS_CONFIG = {
  confirmed: {
    banner: 'bg-gradient-to-r from-green-500 to-emerald-600',
    badge:  'bg-green-100 text-green-800 border-green-300',
    icon:   CheckCircle2,
    iconColor: 'text-white',
    ring:   'ring-2 ring-green-400/40',
  },
  pending: {
    banner: 'bg-gradient-to-r from-amber-400 to-orange-500',
    badge:  'bg-amber-50 text-amber-700 border-amber-200',
    icon:   Clock,
    iconColor: 'text-white',
    ring:   'ring-2 ring-amber-300/40',
  },
  cancelled: {
    banner: 'bg-gradient-to-r from-red-400 to-rose-500',
    badge:  'bg-red-50 text-red-700 border-red-200',
    icon:   XCircle,
    iconColor: 'text-white',
    ring:   '',
  },
  completed: {
    banner: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    badge:  'bg-blue-50 text-blue-700 border-blue-200',
    icon:   BadgeCheck,
    iconColor: 'text-white',
    ring:   '',
  },
} as const;

function CancelButton({ bookingId, paymentStatus, tr }: {
  bookingId: string;
  paymentStatus: string;
  tr: (k: any) => string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    try {
      const { refunded } = await cancelBooking(bookingId);
      toast.success(refunded ? tr('prof_cancel_refund') : tr('prof_cancel'));
      setConfirming(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-forest-600">
          {paymentStatus === 'paid' ? tr('prof_cancel_refund') : tr('prof_cancel_q')}
        </span>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-xs px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
        >
          {loading && <Loader2 size={11} className="animate-spin" />}
          {tr('prof_yes')}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="text-xs px-3 py-1 bg-forest-100 text-forest-600 rounded-lg hover:bg-forest-200"
        >
          {tr('prof_no')}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 text-red-500 text-xs font-medium hover:text-red-600 transition-colors"
    >
      <XCircle size={13} /> {tr('prof_cancel')}
    </button>
  );
}

export default function BookingsListClient({ initialBookings }: Props) {
  const { tr } = useLang();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Map status key to i18n key
  function statusMsg(status: string) {
    if (status === 'confirmed') return tr('bstatus_confirmed_msg');
    if (status === 'pending')   return tr('bstatus_pending_msg');
    if (status === 'cancelled') return tr('bstatus_cancelled_msg');
    if (status === 'completed') return tr('bstatus_completed_msg');
    return status;
  }
  function statusSub(status: string) {
    if (status === 'confirmed') return tr('bstatus_confirmed_sub');
    if (status === 'pending')   return tr('bstatus_pending_sub');
    if (status === 'cancelled') return tr('bstatus_cancelled_sub');
    if (status === 'completed') return tr('bstatus_completed_sub');
    return '';
  }
  function statusLabel(status: string) {
    if (status === 'confirmed') return tr('bstatus_confirmed');
    if (status === 'pending')   return tr('bstatus_pending');
    if (status === 'cancelled') return tr('bstatus_cancelled');
    if (status === 'completed') return tr('bstatus_completed');
    return status;
  }
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    router.refresh();
    // Give time for server to revalidate
    await new Promise(r => setTimeout(r, 800));
    setLastRefreshed(new Date());
    setRefreshing(false);
  }, [router]);

  // Auto-refresh every 30s if any booking is pending
  useEffect(() => {
    const hasPending = bookings.some(b => b.status === 'pending');
    if (!hasPending) return;
    const t = setInterval(handleRefresh, 30_000);
    return () => clearInterval(t);
  }, [bookings, handleRefresh]);

  // Sync when server refreshes (Next.js router.refresh updates props)
  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  if (bookings.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-5xl mb-4">🏕</div>
        <h2 className="font-display text-2xl font-semibold text-forest-700 mb-2">
          {tr('prof_no_bookings')}
        </h2>
        <p className="text-forest-500 mb-6 text-sm">{tr('prof_no_bookings_sub')}</p>
        <Link href="/places" className="btn-primary">{tr('prof_search')}</Link>
      </div>
    );
  }

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div>
      {/* Auto-refresh notice for pending bookings */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <div className="flex items-center gap-2 text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
            {pendingCount} {tr('bstatus_pending_msg').toLowerCase()}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-800 font-medium"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {tr('bstatus_refresh')}
          </button>
        </div>
      )}

      <div className="space-y-5">
        {bookings.map((booking) => {
          const place = booking.place;
          const cfg = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
          const StatusIcon = cfg.icon;

          return (
            <div key={booking.id} className={`card overflow-hidden ${cfg.ring}`}>
              {/* Status banner */}
              <div className={`${cfg.banner} px-5 py-3.5 flex items-center gap-3`}>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <StatusIcon size={18} className={cfg.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm leading-tight">
                    {statusMsg(booking.status)}
                  </div>
                  <div className="text-white/80 text-xs mt-0.5 leading-tight">
                    {statusSub(booking.status)}
                  </div>
                </div>
                {booking.status === 'pending' && (
                  <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-white text-[11px] font-medium">{tr('bstatus_pending')}</span>
                  </div>
                )}
              </div>

              {/* Booking content */}
              <div className="p-5">
                <div className="flex gap-4">
                  {/* Place image */}
                  <div className="flex-shrink-0">
                    {place?.cover_image ? (
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden">
                        <Image src={place.cover_image} alt={place.name ?? ''} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-forest-50 flex items-center justify-center text-3xl">
                        {place?.type === 'resort' ? '🏕' : '🌿'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg sm:text-xl font-semibold text-forest-900 leading-tight mb-2">
                      {place?.name ?? '—'}
                    </h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-forest-500 mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-forest-400" />
                        {formatDate(booking.check_in)} — {formatDate(booking.check_out)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={12} className="text-forest-400" />
                        {booking.guest_count} {tr('pay_guests')} · {booking.nights} {tr('pay_nights')}
                      </span>
                    </div>

                    {/* Price + actions */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-forest-900 text-base">
                          {formatPrice(booking.total_amount)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {booking.status === 'confirmed' && (
                          <Link
                            href={`/places`}
                            className="flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-800 transition-colors"
                          >
                            {tr('prof_view_detail')} <ArrowRight size={12} />
                          </Link>
                        )}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <CancelButton
                            bookingId={booking.id}
                            paymentStatus={booking.payment_status}
                            tr={tr}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Refresh footer */}
      <div className="mt-6 flex items-center justify-between text-xs text-forest-400">
        <span>
          {tr('bstatus_last_updated')}: {lastRefreshed.toLocaleTimeString()}
        </span>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 hover:text-forest-600 transition-colors"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {tr('bstatus_refresh')}
        </button>
      </div>
    </div>
  );
}
