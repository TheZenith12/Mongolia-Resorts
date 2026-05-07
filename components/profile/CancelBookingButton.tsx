'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cancelBooking } from '@/lib/actions/auth';
import { toast } from 'react-hot-toast';

interface Props {
  bookingId: string;
  paymentStatus: string;
}

export default function CancelBookingButton({ bookingId, paymentStatus }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    try {
      const { refunded } = await cancelBooking(bookingId);
      if (refunded) {
        toast.success('Захиалга цуцлагдаж, мөнгө буцааж шилжүүлэх хүсэлт илгээгдлээ');
      } else {
        toast.success('Захиалга цуцлагдлаа');
      }
      setConfirming(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-forest-600">
          {paymentStatus === 'paid' ? 'Мөнгө буцаах уу?' : 'Цуцлах уу?'}
        </span>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-xs px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? <Loader2 size={11} className="animate-spin" /> : null}
          Тийм
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="text-xs px-3 py-1 bg-forest-100 text-forest-600 rounded-lg hover:bg-forest-200"
        >
          Үгүй
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 text-red-500 text-xs font-medium hover:text-red-600 transition-colors"
    >
      <X size={12} /> Цуцлах
    </button>
  );
}
