'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, Image as ImageIcon, FileText, Phone, Globe,
  Loader2, ArrowLeft, CheckCircle, Upload, X, Tent, Leaf
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { submitPlace } from '@/lib/actions/places';

const PROVINCES = [
  'Архангай','Баян-Өлгий','Баянхонгор','Булган','Говь-Алтай',
  'Говьсүмбэр','Дархан-Уул','Дорноговь','Дорнод','Дундговь',
  'Завхан','Орхон','Өвөрхангай','Өмнөговь','Сэлэнгэ',
  'Сүхбаатар','Төв','Увс','Ховд','Хэнтий','Хөвсгөл',
];

export default function PlaceSubmitForm() {
  const router = useRouter();
  const [step, setStep]       = useState<'form' | 'done'>('form');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName]         = useState('');
  const [type, setType]         = useState<'nature' | 'resort'>('nature');
  const [province, setProvince] = useState('');
  const [address, setAddress]   = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone]       = useState('');
  const [website, setWebsite]   = useState('');
  const [images, setImages]     = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState('');

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Upload алдаа');
    return data.url;
  }

  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        const url = await uploadFile(f);
        urls.push(url);
      }
      if (!coverImage && urls.length) setCoverImage(urls[0]);
      setImages(prev => [...prev, ...urls]);
      toast.success(`${urls.length} зураг нэмэгдлээ`);
    } catch {
      toast.error('Зураг upload хийхэд алдаа гарлаа');
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImages(prev => prev.filter(u => u !== url));
    if (coverImage === url) setCoverImage(images.find(u => u !== url) ?? '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim())     { toast.error('Нэрийг оруулна уу'); return; }
    if (!province)        { toast.error('Аймаг сонгоно уу'); return; }
    if (!description.trim()) { toast.error('Тайлбар оруулна уу'); return; }

    setLoading(true);
    try {
      await submitPlace({
        name: name.trim(),
        type,
        province,
        address: address.trim(),
        description: description.trim(),
        phone: phone.trim(),
        website: website.trim(),
        cover_image: coverImage,
        images,
      });
      setStep('done');
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'done') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="font-display text-3xl font-semibold text-forest-900 mb-3">
            Амжилттай илгээгдлээ!
          </h2>
          <p className="text-forest-600 mb-2">
            Таны нэмсэн газар <strong>админд хянуулахаар</strong> илгээгдлээ.
          </p>
          <p className="text-forest-500 text-sm mb-8">
            Админ хянаж зөвшөөрсний дараа таны газар нийтэд харагдана.
            Ихэнхдээ 24–48 цагт хянагддаг.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/')} className="btn-secondary">
              Нүүр хуудас руу
            </button>
            <button onClick={() => { setStep('form'); setName(''); setDescription(''); setImages([]); setCoverImage(''); }} className="btn-primary">
              Дахин нэмэх
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-forest-500 hover:text-forest-700 transition-colors mb-6">
        <ArrowLeft size={15} /> Буцах
      </button>

      <h1 className="font-display text-3xl font-semibold text-forest-900 mb-2">
        Газар нэмэх
      </h1>
      <p className="text-forest-500 mb-8">
        Та мэддэг байгалийн үзэсгэлэнт газар, амралтын газраа нэмж, бусдад танилцуулаарай.
        Мэдээллийг нэмсний дараа <strong>AdminAdmin зөвшөөрсний дараа</strong> нийтлэгдэнэ.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Төрөл */}
        <div>
          <label className="block text-sm font-medium text-forest-700 mb-2">Газрын төрөл</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'nature', icon: <Leaf size={16} />, label: 'Байгалийн газар', desc: 'Нуур, уул, хүрхрээ гэх мэт' },
              { value: 'resort', icon: <Tent size={16} />, label: 'Амралтын газар', desc: 'Гэр кэмп, ресорт, жуулчны баaz' },
            ].map(t => (
              <button key={t.value} type="button"
                onClick={() => setType(t.value as any)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  type === t.value
                    ? 'border-forest-600 bg-forest-50'
                    : 'border-forest-100 hover:border-forest-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-forest-900 text-sm">{t.icon}{t.label}</div>
                <div className="text-xs text-forest-500 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Нэр */}
        <div>
          <label className="block text-sm font-medium text-forest-700 mb-1.5">
            Газрын нэр <span className="text-red-500">*</span>
          </label>
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Жишээ: Хөвсгөл нуур, Хан Хужирт ресорт..."
            className="input-field" required
          />
        </div>

        {/* Аймаг */}
        <div>
          <label className="block text-sm font-medium text-forest-700 mb-1.5">
            Аймаг <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
            <select value={province} onChange={e => setProvince(e.target.value)}
              className="input-field pl-10" required>
              <option value="">Аймаг сонгоно уу</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Хаяг */}
        <div>
          <label className="block text-sm font-medium text-forest-700 mb-1.5">Дэлгэрэнгүй байршил</label>
          <input
            value={address} onChange={e => setAddress(e.target.value)}
            placeholder="Жишээ: Хатгал сум, Мөрөн хотоос 100км"
            className="input-field"
          />
        </div>

        {/* Тайлбар */}
        <div>
          <label className="block text-sm font-medium text-forest-700 mb-1.5">
            Тайлбар <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FileText size={15} className="absolute left-3.5 top-4 text-forest-400 pointer-events-none" />
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Энэ газрын талаар дэлгэрэнгүй бичнэ үү. Яагаад онцгой вэ? Юу хийж болдог вэ? Хэрхэн хүрэх вэ?"
              className="input-field pl-10 min-h-[140px] resize-y"
              required
            />
          </div>
        </div>

        {/* Зураг */}
        <div>
          <label className="block text-sm font-medium text-forest-700 mb-2">Зураг</label>
          <label className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
            uploading ? 'border-forest-300 bg-forest-50' : 'border-forest-200 hover:border-forest-400 hover:bg-forest-50'
          }`}>
            {uploading ? (
              <><Loader2 size={24} className="text-forest-400 animate-spin" /><span className="text-sm text-forest-500">Upload хийж байна...</span></>
            ) : (
              <><Upload size={24} className="text-forest-400" /><span className="text-sm text-forest-600 font-medium">Зураг сонгох</span><span className="text-xs text-forest-400">JPG, PNG, WebP — олон зураг нэг дор нэмж болно</span></>
            )}
            <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" disabled={uploading} />
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {images.map((url, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden aspect-video bg-forest-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {url === coverImage && (
                    <div className="absolute top-1 left-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">Нүүр</div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                    {url !== coverImage && (
                      <button type="button" onClick={() => setCoverImage(url)}
                        className="text-[10px] bg-white text-forest-800 px-2 py-1 rounded font-medium">
                        Нүүр болгох
                      </button>
                    )}
                    <button type="button" onClick={() => removeImage(url)}
                      className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Холбоо барих */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-forest-700 mb-1.5">Утас</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+976 9900-0000" className="input-field pl-10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-forest-700 mb-1.5">Вэбсайт</label>
            <div className="relative">
              <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
              <input value={website} onChange={e => setWebsite(e.target.value)}
                placeholder="https://..." className="input-field pl-10" />
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Анхаар:</strong> Газрын мэдээллийг илгээсний дараа админ 24–48 цагт хянаж зөвшөөрнө.
          Зөвшөөрөгдсөн тохиолдолд таны газар нийтэд харагдана.
        </div>

        <button type="submit" disabled={loading}
          className="btn-primary w-full py-3.5 text-base disabled:opacity-50">
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <Loader2 size={16} className="animate-spin" /> Илгээж байна...
            </span>
          ) : 'Газар илгээх'}
        </button>
      </form>
    </div>
  );
}
