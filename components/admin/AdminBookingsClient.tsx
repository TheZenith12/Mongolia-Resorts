'use client';

import { useState } from 'react';
import { formatDate, formatPrice } from '@/lib/utils';
import BookingChat from './BookingChat';
import { MessageCircle, X } from 'lucide-react';

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

const paymentColors: Record<string, string> = {
  pending:  'bg-yellow-50 text-yellow-600',
  paid:     'bg-green-50 text-green-600',
  failed:   'bg-red-50 text-red-600',
  refunded: 'bg-gray-50 text-gray-600',
};

export default function AdminBookingsClient({ bookings, currentUserId }: AdminBookingsClientProps) {
  const [chatBooking, setChatBooking] = useState<any | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">Захиалгууд</h1>
        <p className="text-forest-500 text-sm mt-1">{bookings.length} захиалга</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Зочин', 'Газар', 'Огноо', 'Дүн', 'Төлбөр', 'Статус', 'Чат'].map(h => (
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
                    {b.payment_status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`badge text-xs ${statusColors[b.status] ?? ''}`}>
                    {b.status}
                  </span>
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
          <div className="text-center py-16 text-forest-400 text-sm">Захиалга байхгүй байна</div>
        )}
      </div>

      {/* Chat panel */}
      {chatBooking && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-forest-900">{chatBooking.guest_name} — мессеж</h3>
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
