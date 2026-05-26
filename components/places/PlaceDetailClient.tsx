"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Star,
  Eye,
  Heart,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  Tent,
  Leaf,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  formatPrice,
  getPlaceTypeLabel,
  getRelativeTime,
  getInitials,
  cn,
} from "@/lib/utils";
import { toggleLike } from "@/lib/actions/auth";
import { toast } from "react-hot-toast";
import BookingPanel from "@/components/places/BookingPanel";
import ReviewsSection from "@/components/places/ReviewsSection";
import ShareButton from "@/components/places/ShareButton";
import SeasonInfoCard from "@/components/places/SeasonInfo";
import WeatherWidget from "@/components/places/WeatherWidget";
import type { SeasonInfo } from "@/lib/seasons";

export default function PlaceDetailClient({
  place,
  initialLiked,
  profile,
  similarPlaces = [],
  season,
}: any) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(place.like_count ?? 0);
  const [imageIndex, setImageIndex] = useState(0);
  const isResort = place.type === "resort";

  // Track view — fire after mount so it doesn't block page load
  useEffect(() => {
    fetch('/api/places/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ place_id: place.id }),
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place.id]);

  const allImages = [
    ...(place.cover_image ? [place.cover_image] : []),
    ...(place.images ?? []),
  ];

  async function handleLike() {
    if (!profile) {
      toast.error("Нэвтрэх шаардлагатай");
      router.push("/auth/login");
      return;
    }
    try {
      const isNowLiked = await toggleLike(place.id);
      setLiked(isNowLiked);
      setLikeCount((c: number) => isNowLiked ? c + 1 : c - 1);
    } catch {
      toast.error("Алдаа гарлаа");
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="page-container pt-8 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-forest-500 text-sm hover:text-forest-700 transition-colors"
        >
          <ArrowLeft size={16} /> Буцах
        </Link>
      </div>

      {/* Image gallery */}
      <div className="page-container mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 h-56 sm:h-72 lg:h-[28rem]">
          <div className="relative lg:col-span-3 rounded-2xl overflow-hidden bg-forest-100">
            {allImages[imageIndex] ? (
              <Image
                src={allImages[imageIndex]}
                alt={place.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {isResort ? (
                  <Tent size={64} className="text-forest-300" />
                ) : (
                  <Leaf size={64} className="text-forest-300" />
                )}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/40 via-transparent to-transparent" />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  disabled={imageIndex === 0}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() =>
                    setImageIndex((i) => Math.min(allImages.length - 1, i + 1))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  disabled={imageIndex === allImages.length - 1}
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIndex(i)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        i === imageIndex ? "bg-white w-5" : "bg-white/50",
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="hidden lg:grid lg:col-span-2 grid-rows-2 gap-3">
            {allImages.slice(1, 3).map((img, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden bg-forest-100 cursor-pointer"
                onClick={() => setImageIndex(i + 1)}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="page-container pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
              <div>
                <div
                  className={cn(
                    "badge mb-3",
                    isResort
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-forest-50 text-forest-700 border-forest-200",
                  )}
                >
                  {isResort ? "🏕" : "🌿"} {getPlaceTypeLabel(place.type)}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-forest-950 leading-tight">
                  {place.name}
                </h1>
                {place.address && (
                  <div className="flex items-center gap-2 mt-3 text-forest-500">
                    <MapPin size={15} />
                    <span className="text-sm">{place.address}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ShareButton title={place.name} />
                <button
                  onClick={handleLike}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
                    liked
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-white border-forest-200 text-forest-500 hover:border-red-200 hover:text-red-500",
                  )}
                >
                  <Heart size={15} fill={liked ? "currentColor" : "none"} />
                  {likeCount}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-forest-100">
              {place.rating_avg > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className={cn(
                          s <= Math.round(place.rating_avg)
                            ? "text-amber-400 fill-amber-400"
                            : "text-forest-200 fill-forest-200",
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-forest-800">
                    {Number(place.rating_avg).toFixed(1)}
                  </span>
                  <span className="text-forest-500 text-sm">
                    ({place.rating_count} үнэлгээ)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-forest-500 text-sm">
                <Eye size={15} /> {place.view_count?.toLocaleString() ?? 0}{" "}
                үзэлт
              </div>
              {isResort && place.price_per_night && (
                <div className="flex items-center gap-1.5 text-forest-700 font-semibold">
                  <Calendar size={15} />
                  {formatPrice(place.price_per_night)} / шөнө
                </div>
              )}
            </div>

            {/* Description */}
            {place.description && (
              <div className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-forest-900 mb-4">
                  Тайлбар
                </h2>
                <div className="text-forest-600 leading-relaxed space-y-3">
                  {place.description
                    .split("\n")
                    .map((para: string, i: number) => (
                      <p key={i}>{para}</p>
                    ))}
                </div>
              </div>
            )}

            {/* Contact */}
            {(place.phone || place.email || place.website) && (
              <div className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-forest-900 mb-4">
                  Холбоо барих
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {place.phone && (
                    <a
                      href={`tel:${place.phone}`}
                      className="flex items-center gap-3 p-4 bg-white rounded-xl border border-forest-100 hover:border-forest-300 transition-colors"
                    >
                      <div className="w-10 h-10 bg-forest-50 rounded-lg flex items-center justify-center">
                        <Phone size={18} className="text-forest-600" />
                      </div>
                      <div>
                        <div className="text-xs text-forest-400">Утас</div>
                        <div className="text-sm font-medium text-forest-800">
                          {place.phone}
                        </div>
                      </div>
                    </a>
                  )}
                  {place.email && (
                    <a
                      href={`mailto:${place.email}`}
                      className="flex items-center gap-3 p-4 bg-white rounded-xl border border-forest-100 hover:border-forest-300 transition-colors"
                    >
                      <div className="w-10 h-10 bg-forest-50 rounded-lg flex items-center justify-center">
                        <Mail size={18} className="text-forest-600" />
                      </div>
                      <div>
                        <div className="text-xs text-forest-400">И-мэйл</div>
                        <div className="text-sm font-medium text-forest-800 truncate">
                          {place.email}
                        </div>
                      </div>
                    </a>
                  )}
                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-white rounded-xl border border-forest-100 hover:border-forest-300 transition-colors"
                    >
                      <div className="w-10 h-10 bg-forest-50 rounded-lg flex items-center justify-center">
                        <Globe size={18} className="text-forest-600" />
                      </div>
                      <div>
                        <div className="text-xs text-forest-400">Вэбсайт</div>
                        <div className="text-sm font-medium text-forest-800">
                          Нээх
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Map */}
            {place.latitude && place.longitude && (
              <div className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-forest-900 mb-4">
                  Байршил
                </h2>
                <div className="h-72 rounded-2xl overflow-hidden border border-forest-100">
                  <iframe
                    title={`${place.name} байршил`}
                    src={`https://maps.google.com/maps?q=${place.latitude},${place.longitude}&z=13&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-3 text-sm inline-flex items-center gap-2"
                >
                  <MapPin size={15} /> Google Maps-ээр заалт авах
                </a>
              </div>
            )}

            {/* Video */}
            {place.video_url && (
              <div className="mb-10">
                <h2 className="font-display text-2xl font-semibold text-forest-900 mb-4">
                  Бичлэг
                </h2>
                <div className="rounded-2xl overflow-hidden border border-forest-100 bg-forest-950">
                  <video
                    src={place.video_url}
                    controls
                    className="w-full max-h-96 object-contain"
                    poster={place.cover_image ?? undefined}
                  >
                    Таны браузер видео дэмждэггүй байна.
                  </video>
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewsSection
              placeId={place.id}
              reviews={place.reviews ?? []}
              profile={profile}
            />
          </div>

          {/* Booking panel — mobile: агуулгын дараа, desktop: sticky sidebar */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="lg:sticky lg:top-24 space-y-4">
              <BookingPanel place={place} profile={profile} />
              {place.province && (
                <WeatherWidget province={place.province} />
              )}
              {season && (
                <SeasonInfoCard season={season} />
              )}
            </div>
          </div>
        </div>

        {/* Similar places */}
        {similarPlaces.length > 0 && (
          <div className="mt-16 pt-10 border-t border-forest-100">
            <h2 className="font-display text-3xl font-semibold text-forest-900 mb-6">
              Төстэй газрууд
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similarPlaces.map((sp: any) => (
                <a
                  key={sp.id}
                  href={`/places/${sp.id}`}
                  className="card overflow-hidden group card-hover"
                >
                  <div className="relative h-44 bg-forest-100">
                    {sp.cover_image ? (
                      <Image
                        src={sp.cover_image}
                        alt={sp.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">
                        {sp.type === 'resort' ? '🏕' : '🌿'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/50 via-transparent to-transparent" />
                    {sp.rating_avg > 0 && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 glass px-2 py-1 rounded-lg">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-forest-900">
                          {Number(sp.rating_avg).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-semibold text-forest-900 leading-tight mb-1 line-clamp-1">
                      {sp.name}
                    </h3>
                    {sp.province && (
                      <div className="flex items-center gap-1 text-forest-500 text-xs mb-2">
                        <MapPin size={11} /> {sp.province}
                      </div>
                    )}
                    {sp.price_per_night && (
                      <div className="text-sm font-semibold text-amber-600">
                        {formatPrice(sp.price_per_night)}
                        <span className="text-forest-400 font-normal text-xs"> / шөнө</span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
