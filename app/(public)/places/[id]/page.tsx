import { notFound, redirect, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Place, Review, Like, User } from '@/lib/models';
import PlaceDetailClient from '@/components/places/PlaceDetailClient';
import { buildPlaceMetadata, buildPlaceSchema, buildBreadcrumbSchema } from '@/lib/seo';
import { getSimilarPlaces } from '@/lib/actions/places';
import { isObjectId } from '@/lib/slug';
import type { Place as PlaceType } from '@/lib/types';
import { getSeasonInfo } from '@/lib/seasons';
import SeasonInfoCard from '@/components/places/SeasonInfo';
import WeatherWidget from '@/components/places/WeatherWidget';

interface PlacePageProps {
  params: { id: string };
}

async function findPlace(idOrSlug: string) {
  if (isObjectId(idOrSlug)) return Place.findById(idOrSlug).lean();
  return Place.findOne({ slug: idOrSlug }).lean();
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  try {
    await connectDB();
    const doc = await findPlace(params.id);
    if (!doc) return { title: 'Газар олдсонгүй' };
    const p = {
      ...(doc as any),
      id:         (doc as any)._id.toString(),
      images:     (doc as any).images ?? [],
      like_count: 0,
      created_at: (doc as any).created_at?.toISOString(),
      updated_at: (doc as any).updated_at?.toISOString(),
    };
    const meta = buildPlaceMetadata(p as PlaceType);
    // ObjectId URL-ээр хандсан бол metadata-д canonical slug руу заана
    if (isObjectId(params.id) && (doc as any).slug) {
      return {
        ...meta,
        robots: { index: false, follow: true }, // ObjectId URL indexed болохгүй
      };
    }
    return meta;
  } catch {
    return { title: 'Газар олдсонгүй' };
  }
}

export default async function PlacePage({ params }: PlacePageProps) {
  await connectDB();

  const doc = await findPlace(params.id);
  if (!doc) notFound();

  // ObjectId-аар хандсан бол slug руу 308 permanent redirect (SEO canonical)
  const p = doc as any;
  if (p.slug && isObjectId(params.id)) {
    permanentRedirect(`/places/${p.slug}`);
  }

  const reviews = await Review.find({ place_id: params.id }).sort({ created_at: -1 }).lean();
  const reviewsFormatted = reviews.map((r: any) => ({
    id:         r._id.toString(),
    place_id:   r.place_id,
    user_id:    r.user_id ?? null,
    booking_id: r.booking_id ?? null,
    rating:     r.rating,
    title:      r.title ?? null,
    body:       r.body ?? null,
    images:     r.images ?? [],
    is_verified: r.is_verified ?? false,
    created_at: r.created_at?.toISOString() ?? new Date().toISOString(),
    user:       r.user ?? null,
  }));

  const place = {
    ...(doc as any),
    id:         (doc as any)._id.toString(),
    images:     (doc as any).images ?? [],
    like_count: 0,
    created_at: (doc as any).created_at?.toISOString(),
    updated_at: (doc as any).updated_at?.toISOString(),
    reviews:    reviewsFormatted,
  };

  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;

  let likedIds: string[] = [];
  let profile = null;

  if (sessionUser?.id) {
    const [likes, userDoc] = await Promise.all([
      Like.find({ user_id: sessionUser.id }).select('place_id').lean(),
      User.findById(sessionUser.id).select('full_name phone avatar_url role').lean(),
    ]);
    likedIds = likes.map((l: any) => l.place_id);
    if (userDoc) {
      profile = {
        id:         (userDoc as any)._id.toString(),
        email:      sessionUser.email,
        full_name:  (userDoc as any).full_name ?? null,
        phone:      (userDoc as any).phone ?? null,
        avatar_url: (userDoc as any).avatar_url ?? null,
        role:       (userDoc as any).role,
        created_at: (userDoc as any).created_at?.toISOString() ?? new Date().toISOString(),
        updated_at: (userDoc as any).updated_at?.toISOString() ?? new Date().toISOString(),
      };
    }
  }

  const similarPlaces = await getSimilarPlaces(
    params.id,
    (place as any).type,
    (place as any).province,
    4
  ).catch(() => []);

  const placeSchema       = buildPlaceSchema(place as PlaceType);
  const breadcrumbSchema  = buildBreadcrumbSchema(place as PlaceType);
  const season            = getSeasonInfo((place as any).type, (place as any).province);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PlaceDetailClient
        place={place as any}
        initialLiked={likedIds.includes((place as any).id)}
        profile={profile}
        similarPlaces={similarPlaces}
        season={season}
      />
    </>
  );
}
