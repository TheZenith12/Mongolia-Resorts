'use client';

import { useState } from 'react';
import { Plus, Trash2, Loader2, CalendarX } from 'lucide-react';
import { createAvailabilityBlock, deleteAvailabilityBlock } from '@/lib/actions/places';
import { toast } from 'react-hot-toast';

interface Block {
  id: string;
  place_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

interface Props {
  placeId: string;
  initialBlocks: Block[];
}

function formatD(d: string) {
  return new Intl.DateTimeFormat('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d));
}

function nightsBetween(a: string, b: string) {
  return Math.max(0, Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

export default function AvailabilityClient({ placeId, initialBlocks }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [reason, setReason]       = useState('');
  const [adding, setAdding]       = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate || !endDate) { toast.error('Огноо сонгоно уу'); return; }
    if (endDate < startDate)    { toast.error('Дуусах огноо буруу байна'); return; }
    setAdding(true);
    try {
      await createAvailabilityBlock(placeId, startDate, endDate, reason);
      const newBlock: Block = {
        id: crypto.randomUUID(),
        place_id: placeId,
        start_date: startDate,
        end_date: endDate,
        reason: reason || null,
        created_at: new Date().toISOString(),
      };
      setBlocks(prev => [...prev, newBlock].sort((a, b) => a.start_date.localeCompare(b.start_date)));
      setStartDate(''); setEndDate(''); setReason('');
      toast.success('Огноо блоклогдлоо');
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteAvailabilityBlock(id);
      setBlocks(prev => prev.filter(b => b.id !== id));
      toast.success('Блок устгагдлаа');
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-forest-900 flex items-center gap-2">
          <CalendarX size={24} /> Огноо блоклох
        </h1>
        <p className="text-forest-500 text-sm mt-1">
          Засвар, чөлөөт цаг болон бусад шалтгаанаар захиалгыг хаах огноог тохируулна уу.
        </p>
      </div>

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-forest-900 mb-4">Шинэ блок нэмэх</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-forest-500 mb-1.5">Эхлэх огноо</label>
            <input
              type="date" min={today} value={startDate}
              onChange={e => { setStartDate(e.target.value); if (endDate < e.target.value) setEndDate(e.target.value); }}
              className="input-field py-2 text-sm" required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-forest-500 mb-1.5">Дуусах огноо</label>
            <input
              type="date" min={startDate || today} value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="input-field py-2 text-sm" required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-forest-500 mb-1.5">Шалтгаан (заавал биш)</label>
            <input
              type="text" value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Жишээ: Засвар хийлт"
              className="input-field py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={adding} className="btn-primary w-full py-2.5 text-sm justify-center">
              {adding
                ? <><Loader2 size={14} className="animate-spin" /> Нэмж байна...</>
                : <><Plus size={14} /> Блок нэмэх</>}
            </button>
          </div>
        </form>
      </div>

      {/* Block list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-forest-900">Идэвхтэй блокууд</h2>
          <p className="text-xs text-forest-400 mt-0.5">{blocks.length} блок</p>
        </div>

        {blocks.length === 0 ? (
          <div className="text-center py-16 text-forest-400 text-sm">
            <CalendarX size={32} className="mx-auto mb-3 opacity-30" />
            Блоклосон огноо байхгүй байна
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Эхлэх огноо', 'Дуусах огноо', 'Хоног', 'Шалтгаан', ''].map(h => (
                  <th key={h} className="text-left px-6 py-3.5 text-xs font-semibold text-forest-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {blocks.map(b => (
                <tr key={b.id} className="hover:bg-gray-50/40">
                  <td className="px-6 py-4 text-sm text-forest-900">{formatD(b.start_date)}</td>
                  <td className="px-6 py-4 text-sm text-forest-900">{formatD(b.end_date)}</td>
                  <td className="px-6 py-4 text-sm text-forest-500">{nightsBetween(b.start_date, b.end_date)} хоног</td>
                  <td className="px-6 py-4 text-sm text-forest-500">{b.reason ?? '—'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(b.id)}
                      disabled={deletingId === b.id}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-40"
                    >
                      {deletingId === b.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Trash2 size={13} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Note about migration */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
        <strong>⚠️ Анхаарна уу:</strong> Энэ функц ажиллахын тулд{' '}
        <code className="bg-amber-100 px-1 rounded">supabase/availability_blocks.sql</code> файлыг
        Supabase SQL Editor дээр ажиллуулах хэрэгтэй.
      </div>
    </div>
  );
}
