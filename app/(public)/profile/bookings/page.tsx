import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCurrentProfile } from '@/lib/actions/auth';
import { getUserBookings, getUserLikedPlaces } from '@/lib/actions/auth';
import { formatPrice } from '@/lib/utils';
import { MapPin, ArrowRight, Heart, Settings, Tent, Leaf } from 'lucide-react';
import ProfileTabs from '@/components/profile/ProfileTabs';
import BookingsListClient from '@/components/profile/BookingsListClient';

export default async function MyBookingsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/auth/login?redirect=/profile/bookings');

  const tab = searchParams.tab === 'favorites' ? 'favorites' : 'bookings';

  const [bookings, likedPlaces] = await Promise.all([
    getUserBookings(),
    getUserLikedPlaces(),
  ]);

  return (
    <div className="page-container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-4xl font-semibold text-forest-900">
            {profile.full_name ?? 'Хэрэглэгч'}
          </h1>
          <Link
            href="/profile/edit"
            className="flex items-center gap-1.5 text-sm text-forest-500 hover:text-forest-700 transition-colors"
          >
            <Settings size={15} /> Профайл засах
          </Link>
        </div>

        {/* Tabs */}
        <ProfileTabs
          activeTab={tab}
          bookingCount={bookings.length}
          favoriteCount={likedPlaces.length}
        />

        {/* Bookings Tab */}
        {tab === 'bookings' && (
          <div className="mt-6">
            <BookingsListClient initialBookings={bookings as any} />
          </div>
        )}

        {/* Favorites Tab */}
        {tab === 'favorites' && (
          <>
            <p className="text-forest-500 mb-6 text-sm mt-6">{likedPlaces.length} дуртай газар</p>
            {likedPlaces.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="flex justify-center mb-4"><Heart size={48} className="text-red-200" /></div>
                <h2 className="font-display text-2xl font-semibold text-forest-700 mb-2">
                  Дуртай газар байхгүй байна
                </h2>
                <p className="text-forest-500 mb-6 text-sm">
                  Газрын картан дахь зүрхний товчийг дарж дуртай газраа хадгалаарай
                </p>
                <Link href="/places" className="btn-primary">Газар хайх</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {likedPlaces.map((place) => (
                  <div key={place.id} className="card overflow-hidden group">
                    <div className="relative h-40 bg-forest-100">
                      {place.cover_image ? (
                        <Image
                          src={place.cover_image}
                          alt={place.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className={`absolute inset-0 flex items-center justify-center ${place.type === 'resort' ? 'text-amber-300' : 'text-forest-300'}`}>
                          {place.type === 'resort' ? <Tent size={40} /> : <Leaf size={40} />}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/50 via-transparent to-transparent" />
                      {place.price_per_night && (
                        <div className="absolute bottom-3 left-3 glass px-2.5 py-1 rounded-lg">
                          <span className="text-forest-900 text-xs font-semibold">
                            {formatPrice(place.price_per_night)}
                            <span className="text-forest-500 font-normal"> / шөнө</span>
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
                        <Heart size={12} className="text-white" fill="currentColor" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-lg font-semibold text-forest-900 leading-tight mb-1 line-clamp-1">
                        {place.name}
                      </h3>
                      {place.province && (
                        <div className="flex items-center gap-1.5 text-forest-500 text-xs mb-3">
                          <MapPin size={11} />
                          <span>{place.province}{(place as any).district ? `, ${(place as any).district}` : ''}</span>
                        </div>
                      )}
                      <Link
                        href={`/places/${(place as any).slug ?? place.id}`}
                        className="flex items-center gap-1 text-forest-700 text-xs font-medium hover:text-forest-900 transition-colors"
                      >
                        Дэлгэрэнгүй <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
