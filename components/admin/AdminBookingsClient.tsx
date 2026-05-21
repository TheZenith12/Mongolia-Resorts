'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import BookingChat from './BookingChat';
import { MessageCircle, X, Check, CheckCheck, Ban, ChevronDown, MapPin } from 'lucide-react';
import { updateBookingStatus } from '@/lib/actions/places';
import { toast } from 'react-hot-toast';

interface AdminBookingsClientProps {
  bookings: any[];
  currentUserId: string;
}

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
};
const statusLabels: Record<string, string> = {
  pending: 'Хүлээгдэж буй', confirmed: 'Батлагдсан', cancelled: 'Цуцлагдсан', completed: 'Дууссан',
};
const paymentColors: Record<string, string> = {
  pending:  'bg-yellow-50 text-yellow-600',
  paid:     'bg-green-50 text-green-600',
  failed:   'bg-red-50 text-red-600',
  refunded: 'bg-gray-50 text-gray-600',
};
const paymentLabels: Record<string, string> = {
  pending: 'Хүлээгдэж буй', paid: 'Төлөгдсөн', failed: 'Амжилтгүй', refunded: 'Буцаагдсан',
};

function BookingStatusActions({ booking, onUpdate }: { booking: any; onUpdate: (id: string, status: string) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (booking.status === 'cancelled' || booking.status === 'completed') return null;

  const actions = [
    booking.status !== 'confirmed'  && { status: 'confirmed',  label: 'Батлах',   icon: <Check size={12} />,      cls: 'text-green-600 hover:bg-green-50' },
    booking.status === 'confirmed'  && { status: 'completed',  label: 'Дуусгах',  icon: <CheckCheck size={12} />, cls: 'text-blue-600 hover:bg-blue-50' },
    { status: 'cancelled', label: 'Цуцлах', icon: <Ban size={12} />, cls: 'text-red-600 hover:bg-red-50' },
  ].filter(Boolean) as Array<{ status: string; label: string; icon: React.ReactNode; cls: string }>;

  async function handle(status: string) {
    setLoading(true);
    setOpen(false);
    try {
      await updateBookingStatus(booking.id, status as 'confirmed' | 'cancelled' | 'completed');
      onUpdate(booking.id, status);
      toast.success(`Захиалга ${status === 'confirmed' ? 'батлагдлаа' : status === 'completed' ? 'дуусгагдлаа' : 'цуцлагдлаа'}`);
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-forest-50 text-forest-600 hover:bg-forest-100 transition-colors disabled:opacity-50"
      >
        Үйлдэл <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl border border-gray-100 shadow-lg z-20 py-1">
          {actions.map(a => (
            <button
              key={a.status}
              onClick={() => handle(a.status)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${a.cls}`}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminBookingsClient({ bookings: initialBookings, currentUserId }: AdminBookingsClientProps) {
  const [chatBooking, setChatBooking] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>(initialBookings);

  function handleStatusUpdate(id: string, status: string) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl lg:text-3xl font-semibold text-forest-900">Захиалгууд</h1>
        <p className="text-forest-500 text-sm mt-0.5">{bookings.length} захиалга</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* ── Mobile card list (< lg) ── */}
        <div className="lg:hidden divide-y divide-gray-50">
          {bookings.map((b: any) => (
            <div key={b.id} className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-forest-900">{b.guest_name}</div>
                  <div className="text-xs text-forest-400">{b.guest_phone}</div>
                  {b.place?.name && (
                    <div className="text-xs text-forest-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />{b.place.name}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setChatBooking(chatBooking?.id === b.id ? null : b)}
                    className="w-7 h-7 rounded-lg bg-forest-50 text-forest-600 hover:bg-forest-100 flex items-center justify-center"
                  >
                    <MessageCircle size={13} />
                  </button>
                  <BookingStatusActions booking={b} onUpdate={handleStatusUpdate} />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-forest-500">{b.check_in} → {b.check_out}</span>
                <span className="text-xs font-semibold text-forest-700">{formatPrice(b.total_amount)}</span>
                <span className={`badge text-[10px] py-0 ${statusColors[b.status] ?? ''}`}>
                  {statusLabels[b.status] ?? b.status}
                </span>
                <span className={`badge text-[10px] py-0 ${paymentColors[b.payment_status] ?? ''}`}>
                  {paymentLabels[b.payment_status] ?? b.payment_status}
                </span>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="text-center py-12 text-forest-400 text-sm">Захиалга байхгүй байна</div>
          )}
        </div>

        {/* ── Desktop table (lg+) ── */}
        <table className="hidden lg:table w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Зочин', 'Газар', 'Огноо', 'Дүн', 'Төлбөр', 'Статус', 'Үйлдэл', 'Чат'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-forest-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.map((b: any) => (
              <tr key={b.id} className="hover:bg-gray-50/40">
                <td className="px-5 py-4">
                  <div className="text-sm font-medium text-forest-900">{b.guest_name}</div>
                  <div className="text-xs text-forest-400">{b.guest_phone}</div>
                </td>
                <td className="px-5 py-4 text-sm text-forest-700">{b.place?.name ?? '—'}</td>
                <td className="px-5 py-4 text-xs text-forest-500">
                  <div>{b.check_in}</div>
                  <div>{b.check_out}</div>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-forest-700">
                  {formatPrice(b.total_amount)}
                </td>
                <td className="px-5 py-4">
                  <span className={`badge text-xs ${paymentColors[b.payment_status] ?? ''}`}>
                    {paymentLabels[b.payment_status] ?? b.payment_status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`badge text-xs ${statusColors[b.status] ?? ''}`}>
                    {statusLabels[b.status] ?? b.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <BookingStatusActions booking={b} onUpdate={handleStatusUpdate} />
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => setChatBooking(chatBooking?.id === b.id ? null : b)}
                    className="w-8 h-8 rounded-lg bg-forest-50 text-forest-600 hover:bg-forest-100 flex items-center justify-center transition-colors"
                  >
                    <MessageCircle size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div className="hidden lg:block text-center py-16 text-forest-400 text-sm">Захиалга байхгүй байна</div>
        )}
      </div>

      {/* Chat panel */}
      {chatBooking && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-forest-900 text-sm">{chatBooking.guest_name} — мессеж</h3>
              <p className="text-xs text-forest-400">{chatBooking.place?.name} · {chatBooking.check_in} → {chatBooking.check_out}</p>
            </div>
            <button onClick={() => setChatBooking(null)} className="text-forest-400 hover:text-forest-600">
              <X size={18} />
            </button>
          </div>
          <BookingChat bookingId={chatBooking.id} currentUserId={currentUserId} />
        </div>
      )}
    </div>
  );
}
