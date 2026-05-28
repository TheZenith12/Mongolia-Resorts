'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Leaf, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token') ?? '';

  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [done,        setDone]        = useState(false);

  useEffect(() => {
    if (!token) router.replace('/auth/forgot-password');
  }, [token, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой');
      return;
    }
    if (password !== confirm) {
      toast.error('Нууц үг тохирохгүй байна');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Алдаа гарлаа');
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch {
      toast.error('Алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Сул', 'Дунд', 'Хүчтэй'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-green-500'];

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

          {!token ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle size={18} className="flex-shrink-0" />
              Токен олдсонгүй. Та дахин нууц үг сэргээх хүсэлт илгээнэ үү.
            </div>
          ) : done ? (
            /* ── Success ── */
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h1 className="font-display text-3xl font-semibold text-forest-900 mb-3">
                Нууц үг шинэчлэгдлээ!
              </h1>
              <p className="text-forest-500 mb-2">
                Таны нууц үг амжилттай солигдлоо.
              </p>
              <p className="text-forest-400 text-sm mb-8">
                3 секундын дараа нэвтрэх хуудас руу шилжинэ...
              </p>
              <Link href="/auth/login" className="btn-primary">
                Нэвтрэх
              </Link>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <h1 className="font-display text-4xl font-semibold text-forest-900 mb-2">
                Шинэ нууц үг
              </h1>
              <p className="text-forest-500 mb-8">
                Шинэ нууц үгээ оруулна уу. Хамгийн багадаа 6 тэмдэгт байх ёстой.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1.5">
                    Шинэ нууц үг
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Шинэ нууц үгээ оруулна уу"
                      className="input-field pl-10 pr-10"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-600"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3].map(i => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= strength ? strengthColor[strength] : 'bg-forest-100'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-green-600'}`}>
                        {strengthLabel[strength]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1.5">
                    Нууц үг давтах
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Нууц үгийг дахин оруулна уу"
                      className={`input-field pl-10 pr-10 ${
                        confirm && confirm !== password
                          ? 'border-red-300 focus:ring-red-300/30'
                          : confirm && confirm === password
                          ? 'border-green-300 focus:ring-green-300/30'
                          : ''
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-600"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p className="text-xs text-red-500 mt-1">Нууц үг тохирохгүй байна</p>
                  )}
                  {confirm && confirm === password && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Тохирч байна
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirm}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Хадгалж байна...
                    </span>
                  ) : 'Нууц үг шинэчлэх'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
