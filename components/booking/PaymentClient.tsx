'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CreditCard, Smartphone, Shield, CheckCircle, ArrowLeft,
  Calendar, Users,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Booking, Profile } from '@/lib/types';
import { useLang } from '@/lib/lang-context';

interface PaymentClientProps {
  booking: Booking & { place: any };
  profile: Profile | null;
}

const MOCK_BANK_URLS = [
  { name: 'Хаан Банк',   logo: 'https://qpay.mn/q/logo/khan.png',   link: '#' },
  { name: 'Голомт Банк', logo: 'https://qpay.mn/q/logo/golomt.png', link: '#' },
  { name: 'Хас Банк',    logo: 'https://qpay.mn/q/logo/xac.png',    link: '#' },
  { name: 'ТД Банк',     logo: 'https://qpay.mn/q/logo/tdb.png',    link: '#' },
  { name: 'Богд Банк',   logo: 'https://qpay.mn/q/logo/bogd.png',   link: '#' },
  { name: 'Төрийн Банк', logo: 'https://qpay.mn/q/logo/state.png',  link: '#' },
];

export default function PaymentClient({ booking, profile }: PaymentClientProps) {
  const router = useRouter();
  const { tr } = useLang();
  const [method] = useState<'stripe' | 'qpay'>(booking.payment_method ?? 'qpay');
  const [step, setStep] = useState<'review' | 'processing' | 'qpay_scan'>('review');
  const [qpayData, setQpayData] = useState<any>(null);

  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleQPayPayment() {
    setLoading(true);
    try {
      const res = await fetch('/api/payment/qpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id }),
      });
      const data = await res.json();
      if (res.ok && data.qr_image) {
        setQpayData(data);
      } else {
        const qrContent = `QPay|${booking.id}|${booking.total_amount}|MongolNutar`;
        setQpayData({
          invoice_id: `DEMO-${booking.id.slice(0, 8).toUpperCase()}`,
          qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=208x208&data=${encodeURIComponent(qrContent)}&color=1a5c2e&bgcolor=ffffff&margin=10`,
          qr_image: null,
          urls: MOCK_BANK_URLS,
          demo: true,
        });
      }
      setStep('qpay_scan');
    } catch {
      const qrContent = `QPay|${booking.id}|${booking.total_amount}|MongolNutar`;
      setQpayData({
        invoice_id: `DEMO-${booking.id.slice(0, 8).toUpperCase()}`,
        qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=208x208&data=${encodeURIComponent(qrContent)}&color=1a5c2e&bgcolor=ffffff&margin=10`,
        qr_image: null,
        urls: MOCK_BANK_URLS,
        demo: true,
      });
      setStep('qpay_scan');
    } finally {
      setLoading(false);
    }
  }

  async function handleStripePayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStep('processing');
    try {
      const res = await fetch('/api/payment/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.checkout_url;
    } catch (err: any) {
      toast.error(err.message ?? 'Error');
      setStep('review');
    } finally {
      setLoading(false);
    }
  }

  async function checkQPayStatus() {
    if (!qpayData) return;
    if (qpayData.demo) {
      toast.success(tr('pay_paid') + ' ✓');
      router.push(`/booking/${booking.id}/confirmation`);
      return;
    }
    try {
      const res = await fetch(`/api/payment/qpay/check?invoice_id=${qpayData.invoice_id}&booking_id=${booking.id}`);
      const data = await res.json();
      if (data.paid) {
        toast.success(tr('pay_paid') + ' ✓');
        router.push(`/booking/${booking.id}/confirmation`);
      } else {
        toast.error('Төлбөр хийгдээгүй байна. Дахин шалгана уу.');
      }
    } catch {
      toast.error('Шалгах үед алдаа гарлаа');
    }
  }

  const nights = booking.nights ?? 1;

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="page-container max-w-4xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-forest-500 text-sm mb-6 hover:text-forest-700 transition-colors"
        >
          <ArrowLeft size={16} /> {tr('pay_back')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Payment form */}
          <div className="lg:col-span-3">
            <div className="card p-6">
              <h1 className="font-display text-2xl font-semibold text-forest-900 mb-6">
                {tr('pay_title')}
              </h1>

              {step === 'review' && (
                <>
                  {method === 'qpay' ? (
                    <div>
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
                        <Smartphone size={22} className="text-blue-600" />
                        <div>
                          <div className="font-semibold text-blue-800 text-sm">{tr('pay_qpay_label')}</div>
                          <div className="text-blue-600 text-xs mt-0.5">{tr('pay_qpay_sub')}</div>
                        </div>
                      </div>
                      <p className="text-forest-600 text-sm mb-6 leading-relaxed">
                        {tr('pay_qpay_desc')}
                      </p>
                      <button
                        onClick={handleQPayPayment}
                        disabled={loading}
                        className="btn-primary w-full py-4"
                      >
                        {loading ? tr('pay_processing') : tr('pay_qpay_btn')}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleStripePayment}>
                      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100 mb-6">
                        <CreditCard size={22} className="text-purple-600" />
                        <div>
                          <div className="font-semibold text-purple-800 text-sm">{tr('pay_card_label')}</div>
                          <div className="text-purple-600 text-xs">Visa / Mastercard / American Express</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-forest-700 mb-1.5">{tr('pay_card_num')}</label>
                          <input
                            value={cardNum}
                            onChange={(e) => setCardNum(e.target.value.replace(/\D/g, '').slice(0, 16)
                              .replace(/(.{4})/g, '$1 ').trim())}
                            placeholder="0000 0000 0000 0000"
                            className="input-field font-mono tracking-wider"
                            maxLength={19}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-forest-700 mb-1.5">{tr('pay_card_name')}</label>
                          <input
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="BATBOLD B"
                            className="input-field uppercase"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-forest-700 mb-1.5">{tr('pay_card_expiry')}</label>
                            <input
                              value={expiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                                setExpiry(v);
                              }}
                              placeholder="MM/YY"
                              className="input-field font-mono"
                              maxLength={5}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-forest-700 mb-1.5">CVC</label>
                            <input
                              value={cvc}
                              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              placeholder="•••"
                              className="input-field font-mono"
                              maxLength={4}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-6">
                        {loading ? tr('pay_processing') : `💳 ${formatPrice(booking.total_amount)}`}
                      </button>
                    </form>
                  )}
                </>
              )}

              {step === 'processing' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-forest-200 border-t-forest-600 rounded-full animate-spin mb-4" />
                  <p className="text-forest-700 font-medium">{tr('pay_processing')}</p>
                  <p className="text-forest-400 text-sm mt-1">{tr('pay_do_not_close')}</p>
                </div>
              )}

              {step === 'qpay_scan' && qpayData && (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Smartphone size={14} className="text-white" />
                    </div>
                    <span className="font-semibold text-forest-900 text-sm">QPay</span>
                    {qpayData.demo && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">DEMO</span>
                    )}
                  </div>

                  <div className="bg-white border-4 border-forest-100 rounded-2xl p-3 mb-4 shadow-sm">
                    {qpayData.qr_image ? (
                      <img src={`data:image/png;base64,${qpayData.qr_image}`} alt="QPay QR" className="w-52 h-52" />
                    ) : (
                      <img
                        src={qpayData.qr_url}
                        alt="QPay QR"
                        className="w-52 h-52"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `https://api.qrserver.com/v1/create-qr-code/?size=208x208&data=${encodeURIComponent('QPay:MongolNutar')}&margin=10`;
                        }}
                      />
                    )}
                  </div>

                  <p className="text-forest-600 text-sm text-center mb-1 max-w-xs">
                    {tr('pay_scan_desc')}
                  </p>
                  <p className="font-bold text-forest-900 text-lg mb-4">
                    {formatPrice(booking.total_amount)}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-5 w-full max-w-xs">
                    {(qpayData.urls ?? MOCK_BANK_URLS).slice(0, 6).map((url: any, i: number) => (
                      <a
                        key={i}
                        href={url.link}
                        className="flex flex-col items-center gap-1.5 p-2.5 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                      >
                        {url.logo ? (
                          <img
                            src={url.logo}
                            alt={url.name}
                            className="w-8 h-8 rounded-lg object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Smartphone size={14} className="text-blue-600" />
                          </div>
                        )}
                        <span className="text-[10px] text-gray-600 text-center leading-tight">{url.name}</span>
                      </a>
                    ))}
                  </div>

                  <button onClick={checkQPayStatus} className="btn-primary w-full max-w-xs flex items-center justify-center gap-2">
                    <CheckCircle size={16} /> {tr('pay_check')}
                  </button>

                  <p className="text-xs text-forest-400 mt-3 text-center">
                    {tr('pay_invoice')}: <span className="font-mono">{qpayData.invoice_id}</span>
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mt-5 text-xs text-forest-400">
                <Shield size={13} /> {tr('pay_ssl')}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-2">
            <div className="card p-5 sticky top-24">
              <h2 className="font-semibold text-forest-900 mb-4 text-xs uppercase tracking-widest text-forest-500">
                {tr('pay_order_title')}
              </h2>

              {booking.place?.cover_image && (
                <div className="relative h-36 rounded-xl overflow-hidden mb-4">
                  <Image src={booking.place.cover_image} alt={booking.place.name} fill className="object-cover" />
                </div>
              )}

              <div className="font-display text-xl font-semibold text-forest-900 mb-3">
                {booking.place?.name}
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-forest-600">
                  <Calendar size={14} className="text-forest-400 flex-shrink-0" />
                  <span>{formatDate(booking.check_in)} — {formatDate(booking.check_out)}</span>
                </div>
                <div className="flex items-center gap-2 text-forest-600">
                  <Users size={14} className="text-forest-400 flex-shrink-0" />
                  <span>
                    {booking.guest_count} {tr('pay_guests')} · {nights} {tr('pay_nights')}
                  </span>
                </div>
              </div>

              <div className="border-t border-forest-100 mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-forest-600">
                  <span>{formatPrice(booking.place?.price_per_night)} × {nights} {tr('pay_nights')}</span>
                </div>
                <div className="flex justify-between text-forest-600">
                  <span>{booking.guest_count} {tr('pay_guests')}</span>
                </div>
                <div className="flex justify-between font-semibold text-forest-900 text-base pt-2 border-t border-forest-100">
                  <span>{tr('pay_total')}</span>
                  <span className="text-amber-600">{formatPrice(booking.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
