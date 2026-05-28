'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Leaf, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Алдаа гарлаа');
        return;
      }
      setSent(true);
    } catch {
      toast.error('Алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left decorative panel */}
      <div className="hidden lg:block relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-forest-950/80 to-forest-800/60" />
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-forest-700/60 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <Leaf size={18} className="text-amber-300" />
            </div>
            <span className="font-display text-xl text-white font-semibold">Монгол Нутаг</span>
          </Link>
          <div>
            <h2 className="font-display text-5xl text-white font-semibold leading-tight mb-4">
              Байгалийн гоо <br /> үзэсгэлэнг <br />
              <span className="text-amber-300 italic">мэдрээрэй</span>
            </h2>
            <p className="text-forest-300 text-lg">
              1000+ амралтын газар, байгалийн үзэсгэлэнт газрыг нэг дороос захиалаарай
            </p>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-8 bg-cream">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-forest-700 rounded-xl flex items-center justify-center">
              <Leaf size={18} className="text-amber-300" />
            </div>
            <span className="font-display text-xl text-forest-900 font-semibold">Монгол Нутаг</span>
          </Link>

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-forest-500 hover:text-forest-700 transition-colors mb-6"
          >
            <ArrowLeft size={15} /> Нэвтрэх хуудас руу буцах
          </Link>

          {sent ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h1 className="font-display text-3xl font-semibold text-forest-900 mb-3">
                Имэйл илгээгдлээ!
              </h1>
              <p className="text-forest-500 mb-2">
                <strong className="text-forest-700">{email}</strong> хаяг руу нууц үг сэргээх холбоос илгээгдлээ.
              </p>
              <p className="text-forest-400 text-sm mb-8">
                Имэйлийнхээ inbox-г шалгана уу. Холбоос <strong>1 цаг</strong>-ийн дараа хүчингүй болно.
              </p>
              <Link href="/auth/login" className="btn-primary">
                Нэвтрэх хуудас руу буцах
              </Link>
              <p className="text-forest-400 text-xs mt-6">
                Имэйл ирсэнгүй юу?{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-forest-600 underline hover:text-forest-800"
                >
                  Дахин илгээх
                </button>
              </p>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <h1 className="font-display text-4xl font-semibold text-forest-900 mb-2">
                Нууц үг мартсан
              </h1>
              <p className="text-forest-500 mb-8">
                Бүртгэлтэй и-мэйл хаягаа оруулна уу. Нууц үг сэргээх холбоос илгээгдэх болно.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1.5">И-мэйл хаяг</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="taний@email.com"
                      className="input-field pl-10"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Илгээж байна...
                    </span>
                  ) : 'Холбоос илгээх'}
                </button>
              </form>

              <p className="text-center mt-6 text-sm text-forest-500">
                Нууц үгээ санасан уу?{' '}
                <Link href="/auth/login" className="text-forest-700 font-semibold hover:underline">
                  Нэвтрэх
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
