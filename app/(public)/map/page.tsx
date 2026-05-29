import dynamic from 'next/dynamic';
import { getPlaces } from '@/lib/actions/places';

export const metadata = { title: 'Газрын зураг' };

// maplibre-gl нь browser-only library тул SSR-г унтраана
const MapPageClient = dynamic(() => import('@/components/map/MapPageClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[calc(100vh-8rem)] bg-cream">
      <div className="flex flex-col items-center gap-3 text-forest-400">
        <div className="w-10 h-10 border-2 border-forest-300 border-t-forest-600 rounded-full animate-spin" />
        <span className="text-sm">Газрын зураг ачааллаж байна...</span>
      </div>
    </div>
  ),
});

export default async function MapPage() {
  const { data: places } = await getPlaces({ pageSize: 200 });
  return <MapPageClient places={places} />;
}
