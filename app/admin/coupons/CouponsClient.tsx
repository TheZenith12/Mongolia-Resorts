'use client';

import { useState } from 'react';
import { Plus, Tag, Trash2, ToggleLeft, ToggleRight, Loader2, Copy } from 'lucide-react';
import { createCoupon, deleteCoupon, updateCoupon } from '@/lib/actions/coupons';
import { toast } from 'react-hot-toast';

interface Coupon {
  id: string; code: string; type: 'percent' | 'fixed'; value: number;
  min_amount: number; max_uses: number | null; uses_count: number;
  expires_at: string | null; is_active: boolean;
  place_id: string | null; description: string; created_at: string;
}

export default function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [code, setCode]             = useState('');
  const [type, setType]             = useState<'percent' | 'fixed'>('percent');
  const [value, setValue]           = useState('');
  const [minAmount, setMinAmount]   = useState('');
  const [maxUses, setMaxUses]       = useState('');
  const [expiresAt, setExpiresAt]   = useState('');
  const [description, setDesc]      = useState('');

  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setCode(code);
  }

  async function handleCreate() {
    if (!code.trim() || !value) { toast.error('Код болон утга оруулна уу'); return; }
    setLoading(true);
    try {
      await createCoupon({
        code,
        type,
        value:      parseFloat(value),
        min_amount: minAmount ? parseFloat(minAmount) : 0,
        max_uses:   maxUses ? parseInt(maxUses) : null,
        expires_at: expiresAt || undefined,
        description,
      });
      toast.success('Купон үүслээ');
      setShowForm(false);
      setCode(''); setValue(''); setMinAmount(''); setMaxUses(''); setExpiresAt(''); setDesc('');
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(coupon: Coupon) {
    try {
      await updateCoupon(coupon.id, { is_active: !coupon.is_active });
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
    } catch { toast.error('Алдаа'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Купон устгах уу?')) return;
    try {
      await deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success('Устгагдлаа');
    } catch { toast.error('Алдаа'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-forest-900">Купонууд</h1>
          <p className="text-forest-500 text-sm mt-1">{coupons.length} купон</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Купон нэмэх
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-forest-100 p-6 mb-6">
          <h2 className="font-semibold text-forest-900 mb-4">Шинэ купон</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-forest-500 mb-1 block">Купон код</label>
              <div className="flex gap-2">
                <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="SUMMER2025" className="input-field uppercase flex-1" />
                <button onClick={generateCode} className="px-3 py-2 bg-forest-100 text-forest-700 rounded-xl text-xs font-medium hover:bg-forest-200">
                  Авто
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-forest-500 mb-1 block">Төрөл</label>
              <div className="flex gap-2">
                {[
                  { value: 'percent', label: '% Хувь' },
                  { value: 'fixed',   label: '₮ Тогтмол' },
                ].map(t => (
                  <button key={t.value} onClick={() => setType(t.value as any)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                      type === t.value ? 'bg-forest-700 text-white border-forest-700' : 'border-forest-200 text-forest-600 hover:border-forest-400'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-forest-500 mb-1 block">
                {type === 'percent' ? 'Хувь (%)' : 'Дүн (₮)'}
              </label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)}
                placeholder={type === 'percent' ? '10' : '5000'} className="input-field" />
            </div>

            <div>
              <label className="text-xs font-medium text-forest-500 mb-1 block">Хамгийн бага захиалга (₮)</label>
              <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)}
                placeholder="0" className="input-field" />
            </div>

            <div>
              <label className="text-xs font-medium text-forest-500 mb-1 block">Хэрэглэх хязгаар (хоосон = хязгааргүй)</label>
              <input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)}
                placeholder="100" className="input-field" />
            </div>

            <div>
              <label className="text-xs font-medium text-forest-500 mb-1 block">Дуусах огноо</label>
              <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                className="input-field" />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-forest-500 mb-1 block">Тайлбар</label>
              <input value={description} onChange={e => setDesc(e.target.value)}
                placeholder="Зуны урамшуулал" className="input-field" />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Үүсгэх
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Болих</button>
          </div>
        </div>
      )}

      {/* List */}
      {coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-forest-100 p-12 text-center">
          <Tag size={32} className="mx-auto mb-3 text-forest-300" />
          <p className="text-forest-500">Купон байхгүй байна</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-forest-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-forest-50 border-b border-forest-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-forest-600">Код</th>
                <th className="text-left px-4 py-3 font-medium text-forest-600">Хөнгөлөлт</th>
                <th className="text-left px-4 py-3 font-medium text-forest-600 hidden sm:table-cell">Ашигласан</th>
                <th className="text-left px-4 py-3 font-medium text-forest-600 hidden md:table-cell">Дуусах</th>
                <th className="text-left px-4 py-3 font-medium text-forest-600">Төлөв</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-50">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-forest-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-forest-900 bg-forest-100 px-2 py-0.5 rounded text-xs">
                        {c.code}
                      </code>
                      <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Хуулагдлаа'); }}
                        className="text-forest-400 hover:text-forest-600">
                        <Copy size={12} />
                      </button>
                    </div>
                    {c.description && <div className="text-xs text-forest-400 mt-0.5">{c.description}</div>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-amber-600">
                    {c.type === 'percent' ? `${c.value}%` : `₮${c.value.toLocaleString()}`}
                    {c.min_amount > 0 && (
                      <div className="text-xs text-forest-400 font-normal">≥₮{c.min_amount.toLocaleString()}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-forest-600 hidden sm:table-cell">
                    {c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-forest-500 hidden md:table-cell">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString('mn-MN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(c)} className="transition-colors">
                      {c.is_active
                        ? <ToggleRight size={22} className="text-green-500" />
                        : <ToggleLeft size={22} className="text-forest-300" />
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(c.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
