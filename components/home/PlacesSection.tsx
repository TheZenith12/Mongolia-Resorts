import { getPlaces } from '@/lib/actions/places';
import { getUserLikes } from '@/lib/actions/auth';
import PlacesGrid from '@/components/places/PlacesGrid';
import PlacesSectionHeader from '@/components/places/PlacesSectionHeader';

interface PlacesSectionProps {
  searchParams: {
    type?: string;
    search?: string;
    province?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    page?: string;
    sort?: string;
  };
}

export default async function PlacesSection({ searchParams }: PlacesSectionProps) {
  const page = parseInt(searchParams.page ?? '1', 10);

  const [result, likedIds] = await Promise.all([
    getPlaces({
      type:      searchParams.type as 'resort' | 'nature' | undefined,
      search:    searchParams.search,
      province:  searchParams.province,
      minPrice:  searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
      maxPrice:  searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
      minRating: searchParams.minRating ? parseFloat(searchParams.minRating) : undefined,
      page,
      pageSize:  12,
      sortBy:    (searchParams.sort as 'created_at' | 'price_per_night' | 'rating_avg' | 'view_count') ?? 'created_at',
      sortOrder: 'desc',
    }).catch(() => ({ data: [], count: 0, page: 1, pageSize: 12, totalPages: 0 })),
    getUserLikes().catch(() => []),
  ]);

  if (result.count === 0 && !searchParams.search && !searchParams.type) {
    return (
      <section className="page-container py-16">
        <div className="text-center py-20 bg-white rounded-2xl border border-forest-100">
          <div className="text-5xl mb-4">🔧</div>
          <h2 className="font-display text-2xl font-semibold text-forest-700 mb-3">
            MongoDB тохируулах шаардлагатай
          </h2>
          <p className="text-forest-500 text-sm max-w-md mx-auto leading-relaxed">
            <code className="bg-forest-50 px-2 py-1 rounded text-forest-700">.env.local</code> файлд
            MongoDB холболтын мэдээллийг оруулна уу.
          </p>
          <div className="mt-6 text-left inline-block bg-forest-950 text-green-300 rounded-xl px-6 py-4 text-sm font-mono">
            <div className="text-forest-400 text-xs mb-2"># .env.local</div>
            <div>MONGODB_URI=<span className="text-amber-300">mongodb+srv://user:pass@cluster.mongodb.net/db</span></div>
            <div>NEXTAUTH_SECRET=<span className="text-amber-300">your-secret-key</span></div>
            <div>NEXTAUTH_URL=<span className="text-amber-300">http://localhost:3000</span></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <PlacesSectionHeader
        type={searchParams.type}
        count={result.count}
        currentSort={searchParams.sort}
      />

      <PlacesGrid
        places={result.data}
        likedIds={likedIds}
        pagination={{
          page:       result.page,
          totalPages: result.totalPages,
          count:      result.count,
        }}
        searchParams={searchParams}
      />
    </section>
  );
}
