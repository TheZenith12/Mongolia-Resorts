'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, CreditCard, Smartphone, ArrowRight, Lock, Loader2, User, Phone, Copy, Check, Building2 } from 'lucide-react';
import { formatPrice, calculateNights } from '@/lib/utils';
import { createBooking, getBookedDateRanges } from '@/lib/actions/auth';
import { toast } from 'react-hot-toast';
import { useLang } from '@/lib/lang-context';

interface Room {
  id: string;
  name: string;
  description: string;
  price_per_night: number;
  capacity: number;
  quantity: number;
  cover_image: string;
  amenities: string[];
  is_available: boolean;
}

export default function BookingPanel({ place, profile }: any) {
  const router = useRouter();
  const { tr } = useLang();
  const isResort = place.type === 'resort';

  const [rooms, setRooms]             = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [checkIn, setCheckIn]   = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests]     = useState(1);
  const [payMethod, setPayMethod] = useState<'bank' | 'qpay'>('qpay');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    });
  }
  const [loading, setLoading]   = useState(false);

  // Зочны мэдээлэл — profile-аас авч, засах боломжтой
  const [guestName,  setGuestName]  = useState(profile?.full_name ?? '');
  const [guestPhone, setGuestPhone] = useState(profile?.phone ?? '');

  const [bookedRanges, setBookedRanges] = useState<Array<{ check_in: string; check_out: string }>>([]);
  const [dateConflict, setDateConflict] = useState(false);

  const today  = new Date().toISOString().split('T')[0];
  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
  const price  = selectedRoom?.price_per_night ?? place.price_per_night ?? 0;
  const baseTotal = nights * price * (selectedRoom ? 1 : guests);
  const total     = baseTotal;

  function hasConflict(cin: string, cout: string): boolean {
    return bookedRanges.some(r => cin < r.check_out && cout > r.check_in);
  }

  useEffect(() => {
    if (!isResort) return;
    fetch(`/api/places/${place.id}/rooms`)
      .then(r => r.json())
      .then(data => { setRooms(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => setLoadingRooms(false));
  }, [place.id, isResort]);

  useEffect(() => {
    getBookedDateRanges(place.id, selectedRoom?.id).then(setBookedRanges);
  }, [place.id, selectedRoom?.id]);

  useEffect(() => {
    if (checkIn && checkOut) setDateConflict(hasConflict(checkIn, checkOut));
    else setDateConflict(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn, checkOut, bookedRanges]);

  async function handleBook() {
    if (!profile) {
      toast.error(tr('book_login'));
      router.push(`/auth/login?redirect=/places/${place.id}`);
      return;
    }
    if (!guestName.trim())  { toast.error(tr('book_name')); return; }
    if (!guestPhone.trim()) { toast.error(tr('book_phone')); return; }
    if (!checkIn || !checkOut) { toast.error(tr('book_checkin')); return; }
    if (nights < 1)  { toast.error(tr('book_checkout')); return; }
    if (rooms.length > 0 && !selectedRoom) { toast.error(tr('book_room')); return; }
    if (dateConflict) { toast.error(tr('book_conflict')); return; }

    setLoading(true);
    try {
      const booking = await createBooking({
        place_id:       place.id,
        guest_name:     guestName.trim(),
        guest_phone:    guestPhone.trim(),
        guest_email:    profile.email,
        guest_count:    selectedRoom ? selectedRoom.capacity : guests,
        check_in:       checkIn,
        check_out:      checkOut,
        payment_method: payMethod,
        notes:          undefined,
      });
      toast.success(tr('book_submit') + ' ✓');
      router.push(`/booking/${(booking as any).id}/payment`);
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  if (!isResort) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center text-xl">🌿</div>
          <div>
            <div className="font-semibold text-forest-900 text-sm">{tr('book_free_place')}</div>
            <div className="text-xs text-forest-500">{tr('place_free')}</div>
          </div>
        </div>
        <p className="text-forest-600 text-sm leading-relaxed mb-4">
          {tr('book_free_desc')}
        </p>
        {place.latitude && place.longitude && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
            target="_blank" rel="noopener noreferrer"
            className="btn-primary w-full justify-center"
          >
            {tr('book_direction')} <ArrowRight size={15} />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-display text-xl font-semibold text-forest-900 mb-4">{tr('book_title')}</h3>

      {/* Room selection */}
      {loadingRooms ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={18} className="animate-spin text-forest-400" />
        </div>
      ) : rooms.length > 0 ? (
        <div className="mb-4">
          <label className="block text-xs font-medium text-forest-500 uppercase tracking-wide mb-2">{tr('book_room')}</label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {rooms.map(room => (
              <button
                key={room.id} type="button"
                onClick={() => setSelectedRoom(selectedRoom?.id === room.id ? null : room)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedRoom?.id === room.id
                    ? 'border-forest-600 bg-forest-50'
                    : 'border-forest-100 hover:border-forest-300 bg-white'
                }`}
              >
                {room.cover_image ? (
                  <img src={room.cover_image} alt={room.name} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-10 rounded-lg bg-forest-100 flex items-center justify-center text-lg flex-shrink-0">🛏</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-medium text-forest-900 text-sm leading-tight">{room.name}</span>
                    <span className="font-bold text-amber-600 text-sm flex-shrink-0">{formatPrice(room.price_per_night)}</span>
                  </div>
                  <div className="text-xs text-forest-500 mt-0.5">👥 {room.capacity} хүн · 🏨 {room.quantity} өрөө</div>
                </div>
                {selectedRoom?.id === room.id && (
                  <div className="w-5 h-5 rounded-full bg-forest-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-forest-50 rounded-xl">
          <div className="text-sm font-semibold text-forest-900">
            {formatPrice(place.price_per_night)}<span className="text-forest-400 font-normal text-xs"> {tr('per_night')}</span>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {/* Guest info */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-forest-500 mb-1 block">{tr('book_name')}</label>
            <div className="relative">
              <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
              <input
                type="text"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder={tr('book_name')}
                className="input-field pl-8 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-forest-500 mb-1 block">{tr('book_phone')}</label>
            <div className="relative">
              <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
              <input
                type="tel"
                value={guestPhone}
                onChange={e => setGuestPhone(e.target.value)}
                placeholder="99xxxxxx"
                className="input-field pl-8 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-forest-500 mb-1 block">{tr('book_checkin')}</label>
            <div className="relative">
              <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
              <input type="date" min={today} value={checkIn} onChange={e => setCheckIn(e.target.value)}
                className="input-field pl-8 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-forest-500 mb-1 block">{tr('book_checkout')}</label>
            <div className="relative">
              <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
              <input type="date" min={checkIn || today} value={checkOut} onChange={e => setCheckOut(e.target.value)}
                className="input-field pl-8 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Guests — only if no room */}
        {!selectedRoom && (
          <div>
            <label className="text-xs font-medium text-forest-500 mb-1 block">{tr('book_guests')}</label>
            <div className="relative">
              <Users size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
              <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                className="input-field pl-8 py-2 text-sm appearance-none">
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} хүн</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Date conflict */}
        {dateConflict && (
          <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
            {tr('book_conflict')}
          </div>
        )}

        {/* Payment method */}
        <div>
          <label className="text-xs font-medium text-forest-500 mb-2 block">{tr('book_payment')}</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'qpay', label: 'QPay',              icon: <Smartphone size={14} /> },
              { value: 'bank', label: tr('book_bank'),      icon: <Building2 size={14} /> },
            ].map(pm => (
              <button key={pm.value} type="button" onClick={() => setPayMethod(pm.value as any)}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm font-medium transition-all ${
                  payMethod === pm.value
                    ? 'bg-forest-700 text-white border-forest-700'
                    : 'bg-white text-forest-600 border-forest-200 hover:border-forest-400'
                }`}>
                {pm.icon} {pm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bank details — shown when bank transfer selected */}
        {payMethod === 'bank' && (place.bank_account_number || place.bank_name) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-xs mb-2.5">
              <Building2 size={13} /> {tr('book_bank_details')}
            </div>
            <div className="space-y-1.5 text-sm">
              {place.bank_name && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 text-xs">{tr('book_bank_name')}</span>
                  <span className="font-semibold text-blue-900 text-xs">{place.bank_name}</span>
                </div>
              )}
              {place.bank_account_number && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 text-xs">{tr('book_bank_account')}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-blue-900 tracking-wide text-sm">{place.bank_account_number}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(place.bank_account_number, 'account')}
                      className="p-0.5 text-blue-400 hover:text-blue-700 transition-colors"
                    >
                      {copiedField === 'account' ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              )}
              {place.bank_account_name && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 text-xs">{tr('book_bank_holder')}</span>
                  <span className="font-semibold text-blue-900 text-xs">{place.bank_account_name}</span>
                </div>
              )}
              {place.bank_phone && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 text-xs">{tr('book_bank_phone')}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-blue-900 text-xs">{place.bank_phone}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(place.bank_phone, 'phone')}
                      className="p-0.5 text-blue-400 hover:text-blue-700 transition-colors"
                    >
                      {copiedField === 'phone' ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[10px] text-blue-500 mt-2.5 leading-relaxed">
              {tr('book_bank_note')}
            </p>
          </div>
        )}

        {/* QPay info */}
        {payMethod === 'qpay' && place.qpay_merchant_code && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2.5">
            <Smartphone size={15} className="text-green-600 flex-shrink-0" />
            <div className="text-xs text-green-700">
              <span className="font-semibold">QPay: </span>{place.qpay_merchant_code}
            </div>
          </div>
        )}

      </div>

      {/* Price summary */}
      {nights > 0 && price > 0 && (
        <div className="bg-forest-50 rounded-xl p-3 mb-4 text-sm space-y-1.5">
          {selectedRoom && (
            <div className="flex justify-between text-forest-600">
              <span>{selectedRoom.name}</span>
            </div>
          )}
          <div className="flex justify-between text-forest-600">
            <span>{formatPrice(price)} × {nights} {tr('book_nights')}</span>
            <span>{formatPrice(baseTotal)}</span>
          </div>
          <div className="flex justify-between font-semibold text-forest-900 pt-1.5 border-t border-forest-200">
            <span>{tr('book_total')}</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleBook}
        disabled={loading || dateConflict}
        className="btn-amber w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> {tr('book_processing')}
          </span>
        ) : <>{tr('book_submit')} <ArrowRight size={16} /></>}
      </button>

      <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-forest-400">
        <Lock size={11} /> {tr('book_secure')}
      </div>
    </div>
  );
}
