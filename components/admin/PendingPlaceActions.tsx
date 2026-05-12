'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { reviewPlace } from '@/lib/actions/places';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function PendingPlaceActions({ placeId }: { placeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');

  async function approve() {
    setLoading('approve');
    try {
      await reviewPlace(placeId, 'approve');
      toast.success('Газар зөвшөөрөгдлөө!');
      router.refresh();
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setLoading(null); }
  }

  async function reject() {
    if (!reason.trim()) { toast.error('Татгалзах шалтгаан оруулна уу'); return; }
    setLoading('reject');
    try {
      await reviewPlace(placeId, 'reject', reason.trim());
      toast.success('Газар татгалзагдлаа');
      setShowReject(false);
      router.refresh();
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setLoading(null); }
  }

  if (showReject) {
    return (
      <div className="flex items-center gap-2">
        <input
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Татгалзах шалтгаан..."
          className="input-field text-xs py-1.5 w-48"
          autoFocus
        />
        <button onClick={reject} disabled={!!loading}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50">
          {loading === 'reject' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
          Татгалзах
        </button>
        <button onClick={() => setShowReject(false)}
          className="text-xs text-forest-400 hover:text-forest-600">Болих</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={approve} disabled={!!loading}
        className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50">
        {loading === 'approve' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
        Зөвшөөрөх
      </button>
      <button onClick={() => setShowReject(true)} disabled={!!loading}
        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 disabled:opacity-50">
        <XCircle size={12} /> Татгалзах
      </button>
    </div>
  );
}
