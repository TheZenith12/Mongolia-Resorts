import { getCurrentProfile } from '@/lib/actions/auth';
import { formatDate, getInitials } from '@/lib/utils';
import { Star, CheckCircle } from 'lucide-react';
import AdminReviewActions from '@/components/admin/AdminReviewActions';
import { connectDB } from '@/lib/mongodb';
import { Review, Place, User, ManagerAssignment } from '@/lib/models';

async function getReviews(role: string, userId: string) {
  await connectDB();

  if (role === 'super_admin') {
    const reviews = await Review.find({}).sort({ created_at: -1 }).limit(100).lean();
    const placeIds = Array.from(new Set(reviews.map((r: any) => r.place_id).filter(Boolean)));
    const userIds  = Array.from(new Set(reviews.map((r: any) => r.user_id).filter(Boolean)));

    const [places, users] = await Promise.all([
      Place.find({ _id: { $in: placeIds } }).select('_id name').lean(),
      User.find({ _id: { $in: userIds } }).select('_id full_name').lean(),
    ]);

    const placeMap = new Map(places.map((p: any) => [p._id.toString(), p.name]));
    const userMap  = new Map(users.map((u: any) => [u._id.toString(), u.full_name]));

    return reviews.map((r: any) => ({
      ...r,
      id:         r._id.toString(),
      created_at: r.created_at?.toISOString(),
      place:      { id: r.place_id, name: placeMap.get(r.place_id) ?? 'Газар' },
      user:       r.user ?? { full_name: userMap.get(r.user_id) ?? 'Хэрэглэгч' },
    }));
  }

  // Manager: зөвхөн өөрийн газрын reviews
  const assignment = await ManagerAssignment.findOne({ manager_id: userId }).lean();
  const placeId = (assignment as any)?.place_id;
  if (!placeId) return [];

  const reviews = await Review.find({ place_id: placeId }).sort({ created_at: -1 }).limit(100).lean();
  const place = await Place.findById(placeId).select('name').lean();
  const userIds = Array.from(new Set(reviews.map((r: any) => r.user_id).filter(Boolean)));
  const users = await User.find({ _id: { $in: userIds } }).select('_id full_name').lean();
  const userMap = new Map(users.map((u: any) => [u._id.toString(), u.full_name]));

  return reviews.map((r: any) => ({
    ...r,
    id:         r._id.toString(),
    created_at: r.created_at?.toISOString(),
    place:      { id: placeId, name: (place as any)?.name ?? 'Газар' },
    user:       r.user ?? { full_name: userMap.get(r.user_id) ?? 'Хэрэглэгч' },
  }));
}

export default async function AdminReviewsPage() {
  const profileRaw = await getCurrentProfile();
  if (!profileRaw) return null;
  const profile = profileRaw as any;

  const reviews = await getReviews(profile.role, profile.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">Сэтгэгдлүүд</h1>
        <p className="text-forest-500 text-sm mt-1">{reviews.length} нийт сэтгэгдэл</p>
      </div>

      <div className="space-y-4">
        {reviews.map((review: any) => (
          <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 text-sm font-semibold">
                    {getInitials(review.user?.full_name)}
                  </div>
                  <div>
                    <span className="font-medium text-forest-900 text-sm">
                      {review.user?.full_name ?? 'Хэрэглэгч'}
                    </span>
                    <span className="text-forest-400 text-xs mx-1.5">•</span>
                    <span className="text-forest-500 text-xs">{review.place?.name ?? 'Газар'}</span>
                  </div>
                  {review.is_verified && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      <CheckCircle size={11} /> Баталгаажсан
                    </span>
                  )}
                </div>

                <div className="flex gap-0.5 mb-2">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={14}
                      className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                  ))}
                  <span className="ml-1.5 text-xs font-semibold text-forest-800">{review.rating}/5</span>
                </div>

                {review.title && <p className="font-semibold text-forest-800 text-sm mb-1">{review.title}</p>}
                {review.body  && <p className="text-forest-600 text-sm leading-relaxed">{review.body}</p>}
                <p className="text-forest-400 text-xs mt-2">{formatDate(review.created_at)}</p>
              </div>

              <AdminReviewActions reviewId={review.id} isVerified={review.is_verified} />
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-forest-400 text-sm">
            Сэтгэгдэл байхгүй байна
          </div>
        )}
      </div>
    </div>
  );
}
