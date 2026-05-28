'use client';

import Link from 'next/link';
import {
  CheckCircle2, Calendar, Users, MapPin, ArrowRight, Home, Clock, XCircle, BadgeCheck,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { useLang } from '@/lib/lang-context';

interface Props {
  booking: any;
}

const STATUS_CONFIG = {
  confirmed: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bg:   'bg-green-100',
    pillBg: 'bg-green-50 border-green-200 text-green-700',
    dot:  'bg-green-500',
  },
  pending: {
    icon: Clock,
    color: 'text-amber-600',
    bg:   'bg-amber-100',
    pillBg: 'bg-amber-50 border-amber-200 text-amber-700',
    dot:  'bg-amber-500',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600',
    bg:   'bg-red-100',
    pillBg: 'bg-red-50 border-red-200 text-red-700',
    dot:  'bg-red-500',
  },
  completed: {
    icon: BadgeCheck,
    color: 'text-blue-600',
    bg:   'bg-blue-100',
    pillBg: 'bg-blue-50 border-blue-200 text-blue-700',
    dot:  'bg-blue-500',
  },
} as const;

export default function ConfirmationClient({ booking }: Props) {
  const { tr } = useLang();

  const status = (booking.status as keyof typeof STATUS_CONFIG) || 'pending';
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;

  function statusMsg() {
    if (status === 'confirmed') return tr('bstatus_confirmed_msg');
    if (status === 'cancelled') return tr('bstatus_cancelled_msg');
    if (status === 'completed') return tr('bstatus_completed_msg');
    return tr('conf_title');
  }

  function statusSub() {
    if (status === 'confirmed') return tr('bstatus_confirmed_sub');
    if (status === 'cancelled') return tr('bstatus_cancelled_sub');
    if (status === 'completed') return tr('bstatus_completed_sub');
    return tr('conf_sub');
  }

  function statusLabel() {
    if (booking.payment_status === 'paid') return tr('pay_paid');
    return tr('pay_wait');
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className={`w-20 h-20 ${cfg.bg} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <StatusIcon size={40} className={cfg.color} />
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-forest-900 mb-3 leading-tight">
          {statusMsg()}
        </h1>
        <p className="text-forest-500 mb-2 leading-relaxed">{statusSub()}</p>

        {/* Booking number */}
        <p className="text-forest-400 text-sm mb-8">
          {tr('conf_booking_num')}:{' '}
          <code className="font-mono text-forest-700 bg-forest-50 px-2 py-0.5 rounded-lg text-sm">
            #{booking.id.slice(-8).toUpperCase()}
          </code>
        </p>

        {/* Summary card */}
        <div className="card p-6 text-left mb-6">
          {booking.place && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-forest-100">
              {booking.place.cover_image && (
                <img
                  src={booking.place.cover_image}
                  alt={booking.place.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div>
                <div className="font-display text-lg font-semibold text-forest-900">
                  {booking.place.name}
                </div>
                {booking.place.province && (
                  <div className="flex items-center gap-1 text-forest-500 text-xs mt-0.5">
                    <MapPin size={11} /> {booking.place.province}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5 text-forest-600">
              <Calendar size={15} className="text-forest-400 flex-shrink-0" />
              <span>{formatDate(booking.check_in)} — {formatDate(booking.check_out)}</span>
            </div>
            <div className="flex items-center gap-2.5 text-forest-600">
              <Users size={15} className="text-forest-400 flex-shrink-0" />
              <span>
                {booking.guest_count} {tr('pay_guests')} · {booking.nights ?? 1} {tr('pay_nights')}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-forest-100">
              <span className="font-semibold text-forest-900">{tr('pay_total')}</span>
              <span className="font-bold text-amber-600 text-base">
                {formatPrice(booking.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Status pill */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium mb-8 ${cfg.pillBg}`}>
          <span className={`w-2 h-2 rounded-full ${cfg.dot} ${status === 'pending' ? 'animate-pulse' : ''}`} />
          {statusLabel()}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/profile/bookings" className="btn-primary">
            {tr('conf_my_bookings')} <ArrowRight size={15} />
          </Link>
          <Link href="/" className="btn-secondary">
            <Home size={15} /> {tr('conf_home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
