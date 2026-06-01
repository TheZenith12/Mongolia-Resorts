'use client';

import { useState } from 'react';
import { Save, Smartphone, Building2, CreditCard, User, Phone, Loader2, CheckCircle2, Copy, Check, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updatePlacePaymentSettings } from '@/lib/actions/places';
import type { PlacePaymentSettings } from '@/lib/actions/places';

interface Props {
  placeId: string;
  placeName: string;
  initialSettings: PlacePaymentSettings;
}

const BANKS = [
  'Хаан банк',
  'Голомт банк',
  'Төрийн банк',
  'Хас банк',
  'Капитал банк',
  'Богд банк',
  'Транс банк',
  'Чингис хаан банк',
  'Ариг банк',
  'Мости банк',
  'Өөр',
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  if (!text) return null;
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1 text-forest-400 hover:text-forest-700 transition-colors"
      title="Хуулах"
    >
      {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
    </button>
  );
}

export default function PaymentSettingsClient({ placeId, placeName, initialSettings }: Props) {
  const [form, setForm] = useState<PlacePaymentSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [qrUploading, setQrUploading] = useState(false);

  function set(key: keyof PlacePaymentSettings, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        set('qpay_qr_image', data.url);
        toast.success('QR зураг оруулагдлаа');
      }
    } catch { toast.error('Upload алдаа'); }
    finally { setQrUploading(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePlacePaymentSettings(placeId, form);
      toast.success('Төлбөрийн тохиргоо хадгалагдлаа!');
      setSaved(true);
    } catch (err: any) {
      toast.error(err.message ?? 'Хадгалж чадсангүй');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">Төлбөрийн тохиргоо</h1>
        <p className="text-forest-500 text-sm mt-1">
          <span className="font-medium text-forest-700">{placeName}</span> — QPay болон банкны дансны мэдээлэл
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">

        {/* QPay */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-1 flex items-center gap-2">
            <Smartphone size={17} className="text-green-600" /> QPay
          </h2>
          <p className="text-xs text-forest-400 mb-4">
            QPay merchant код оруулна уу. Хэрэглэгч захиалга хийхдээ QPay QR дансаа баталгаажуулахад ашиглана.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">
                Merchant код / утасны дугаар
              </label>
              <div className="relative">
                <Smartphone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
                <input
                  value={form.qpay_merchant_code}
                  onChange={e => set('qpay_merchant_code', e.target.value)}
                  className="input-field pl-9"
                  placeholder="99xxxxxx эсвэл QPay merchant ID"
                />
              </div>
            </div>

            {/* QR Image upload */}
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">
                QPay QR зураг <span className="text-forest-400 font-normal">(заавал биш — оруулсан бол тэрийг харуулна)</span>
              </label>
              {form.qpay_qr_image ? (
                <div className="flex items-start gap-3">
                  <img src={form.qpay_qr_image} alt="QPay QR" className="w-32 h-32 rounded-xl border border-gray-200 object-contain bg-white p-1" />
                  <button
                    type="button"
                    onClick={() => set('qpay_qr_image', '')}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 mt-1"
                  >
                    <X size={13} /> Устгах
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl hover:border-green-400 transition-colors text-sm text-forest-500">
                  {qrUploading
                    ? <><Loader2 size={15} className="animate-spin" /> Оруулж байна...</>
                    : <><Upload size={15} /> QR зураг оруулах</>
                  }
                  <input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} disabled={qrUploading} />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Bank transfer */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-1 flex items-center gap-2">
            <Building2 size={17} className="text-blue-600" /> Банкны шилжүүлэг
          </h2>
          <p className="text-xs text-forest-400 mb-4">
            Хэрэглэгч "Банкны шилжүүлэг" сонгоход энэ дансруу шилжүүлэх мэдээлэл харагдана.
          </p>
          <div className="space-y-4">
            {/* Bank name */}
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5 flex items-center gap-1.5">
                <Building2 size={13} /> Банкны нэр
              </label>
              <select
                value={form.bank_name}
                onChange={e => set('bank_name', e.target.value)}
                className="input-field"
              >
                <option value="">— Банк сонгох —</option>
                {BANKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Account number */}
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5 flex items-center gap-1.5">
                <CreditCard size={13} /> Дансны дугаар
              </label>
              <div className="relative">
                <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
                <input
                  value={form.bank_account_number}
                  onChange={e => set('bank_account_number', e.target.value)}
                  className="input-field pl-9 pr-9"
                  placeholder="1234567890"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <CopyButton text={form.bank_account_number} />
                </div>
              </div>
            </div>

            {/* Account name */}
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5 flex items-center gap-1.5">
                <User size={13} /> Дансны эзэмшигчийн нэр
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
                <input
                  value={form.bank_account_name}
                  onChange={e => set('bank_account_name', e.target.value)}
                  className="input-field pl-9"
                  placeholder="Овог нэр"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5 flex items-center gap-1.5">
                <Phone size={13} /> Утасны дугаар <span className="text-forest-400 font-normal">(мобайл банкинд)</span>
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
                <input
                  value={form.bank_phone}
                  onChange={e => set('bank_phone', e.target.value)}
                  className="input-field pl-9"
                  placeholder="99xxxxxx"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        {(form.bank_name || form.bank_account_number || form.bank_account_name) && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-1.5">
              <Building2 size={14} /> Хэрэглэгчид харагдах байдал
            </h3>
            <div className="space-y-2 text-sm">
              {form.bank_name && (
                <div className="flex justify-between">
                  <span className="text-blue-600">Банк:</span>
                  <span className="font-semibold text-blue-900">{form.bank_name}</span>
                </div>
              )}
              {form.bank_account_number && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-600">Данс:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-blue-900 tracking-wide">{form.bank_account_number}</span>
                    <CopyButton text={form.bank_account_number} />
                  </div>
                </div>
              )}
              {form.bank_account_name && (
                <div className="flex justify-between">
                  <span className="text-blue-600">Нэр:</span>
                  <span className="font-semibold text-blue-900">{form.bank_account_name}</span>
                </div>
              )}
              {form.bank_phone && (
                <div className="flex justify-between">
                  <span className="text-blue-600">Утас:</span>
                  <span className="font-semibold text-blue-900">{form.bank_phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {saved && (
            <div className="flex items-center gap-1.5 text-green-600 text-sm">
              <CheckCircle2 size={15} /> Амжилттай хадгалагдлаа
            </div>
          )}
          <div className="ml-auto">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Хадгалж байна...</>
              ) : (
                <><Save size={15} /> Хадгалах</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
