import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server';
import PlaceDetailClient from '@/components/places/PlaceDetailClient';
import { buildPlaceMetadata, buildPlaceSchema, buildBreadcrumbSchema } from '@/lib/seo';
import type { Place } from '@/lib/types';

interface PlacePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('places')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!data) return { title: 'Газар олдсонгүй' };
  return buildPlaceMetadata(data as Place);
}

export default async function PlacePage({ params }: PlacePageProps) {
  const supabase = await createServerSupabaseClient();

  const { data: place, error } = await supabase
    .from('places')
    .select('*, reviews(*, user:profiles(id, full_name))')
    .eq('id', params.id)
    .single();

  if (error || !place) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  let likedIds: string[] = [];
  if (user) {
    const { data: likes } = await supabase
      .from('likes')
      .select('place_id')
      .eq('user_id', user.id);
    likedIds = likes?.map((l: any) => l.place_id) ?? [];
  }

  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;
  }

  // View count — admin client (RLS bypass)
  const adminClient = createAdminClient();
  (adminClient.rpc as any)('increment_view_count', { place_id: params.id })
    .then(() => {}).catch(() => {});

  // JSON-LD structured data — Google-д газрыг зөв таниулна
  const placeSchema = buildPlaceSchema(place as Place);
  const breadcrumbSchema = buildBreadcrumbSchema(place as Place);

  return (
    <>
      {/* Structured Data — Google-д place мэдээлэл дамжуулна */}
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
      />
    </>
  );
}
