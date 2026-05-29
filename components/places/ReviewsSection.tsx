'use client';

import { useState } from 'react';
import { Star, MessageSquare, Camera, X, Loader2 } from 'lucide-react';
import { createReview } from '@/lib/actions/auth';
import { toast } from 'react-hot-toast';
import { getRelativeTime, getInitials } from '@/lib/utils';
import type { Review, Profile } from '@/lib/types';
import { useLang } from '@/lib/lang-context';

interface ReviewsSectionProps {
  placeId: string;
  reviews: Review[];
  profile: Profile | null;
}

export default function ReviewsSection({ placeId, reviews, profile }: ReviewsSectionProps) {
  const { tr } = useLang();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [uploadingImg, setUploadingImg] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingImg(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.url) urls.push(data.url);
      }
      setReviewImages(prev => [...prev, ...urls].slice(0, 4));
    } catch { toast.error('Upload error'); }
    finally { setUploadingImg(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { toast.error('⭐'); return; }
    if (!body)   { toast.error(tr('reviews_body_placeholder')); return; }

    setLoading(true);
    try {
      await createReview(placeId, rating, title, body, reviewImages);
      setLocalReviews([
        {
          id: Date.now().toString(),
          place_id: placeId,
          user_id: profile?.id ?? null,
          booking_id: null,
          rating,
          title: title || null,
          body,
          images: reviewImages,
          is_verified: false,
          created_at: new Date().toISOString(),
          user: profile ?? undefined,
        },
        ...localReviews,
      ]);
      setRating(0); setTitle(''); setBody(''); setReviewImages([]);
      toast.success(tr('reviews_submit') + ' ✓');
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  const avg = localReviews.length
    ? (localReviews.reduce((a, r) => a + r.rating, 0) / localReviews.length).toFixed(1)
    : '—';

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-display text-2xl font-semibold text-forest-900">{tr('reviews_title')}</h2>
        <span className="badge bg-forest-50 text-forest-700 border-forest-200">
          ⭐ {avg} · {localReviews.length} {tr('reviews_count')}
        </span>
      </div>

      {/* Write review */}
      {profile ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-forest-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-forest-600 flex items-center justify-center text-white text-sm font-semibold">
              {getInitials(profile.full_name)}
            </div>
            <span className="font-medium text-forest-800 text-sm">{profile.full_name}</span>
          </div>

          {/* Star rating */}
          <div className="flex gap-1.5 mb-4">
            {[1,2,3,4,5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={s <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-forest-200'}
                />
              </button>
            ))}
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={tr('reviews_title_placeholder')}
            className="input-field mb-3"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={tr('reviews_body_placeholder')}
            rows={3}
            className="input-field resize-none mb-3"
            required
          />
          {/* Image upload */}
          <div className="mb-3">
            {reviewImages.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {reviewImages.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => setReviewImages(prev => prev.filter((_, j) => j !== i))}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {reviewImages.length < 4 && (
              <label className="inline-flex items-center gap-1.5 text-xs text-forest-500 hover:text-forest-700 cursor-pointer py-1.5 px-3 rounded-lg border border-forest-200 hover:border-forest-400 transition-colors">
                {uploadingImg
                  ? <><Loader2 size={13} className="animate-spin" /> {tr('reviews_uploading')}</>
                  : <><Camera size={13} /> {tr('reviews_add_photo')}</>
                }
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploadingImg} />
              </label>
            )}
          </div>

          <button type="submit" disabled={loading || uploadingImg} className="btn-primary text-sm disabled:opacity-50">
            {loading ? tr('reviews_adding') : tr('reviews_submit')}
          </button>
        </form>
      ) : (
        <div className="bg-forest-50 rounded-2xl border border-forest-100 p-5 mb-8 flex items-center gap-3">
          <MessageSquare size={20} className="text-forest-400" />
          <span className="text-forest-600 text-sm">
            {tr('reviews_login')}{' '}
            <a href="/auth/login" className="text-forest-700 font-semibold underline">{tr('reviews_login_link')}</a>
          </span>
        </div>
      )}

      {/* Review list */}
      <div className="space-y-5">
        {localReviews.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-forest-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 text-sm font-semibold">
                  {getInitials(r.user?.full_name)}
                </div>
                <div>
                  <div className="font-medium text-forest-800 text-sm">{r.user?.full_name ?? 'Хэрэглэгч'}</div>
                  <div className="text-xs text-forest-400">{getRelativeTime(r.created_at)}</div>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={13} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-forest-200'} />
                ))}
              </div>
            </div>
            {r.title && <p className="font-semibold text-forest-800 text-sm mb-1">{r.title}</p>}
            {r.body  && <p className="text-forest-600 text-sm leading-relaxed">{r.body}</p>}
            {r.images && r.images.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {r.images.map((img: string, i: number) => (
                  <a key={i} href={img} target="_blank" rel="noopener noreferrer"
                    className="w-16 h-16 rounded-xl overflow-hidden block">
                    <img src={img} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        {localReviews.length === 0 && (
          <div className="text-center py-10 text-forest-400">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">{tr('reviews_empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
