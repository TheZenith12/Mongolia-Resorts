import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Review, Place } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    if (!['super_admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { reviewId } = await req.json();
    await connectDB();

    const review = await Review.findById(reviewId).lean();
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    await Review.findByIdAndDelete(reviewId);

    // Recalculate place rating
    const placeId = (review as any).place_id;
    const reviews = await Review.find({ place_id: placeId }).select('rating').lean();
    const count = reviews.length;
    const avg = count > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / count
      : 0;

    await Place.findByIdAndUpdate(placeId, {
      rating_avg:   count > 0 ? Math.round(avg * 10) / 10 : 0,
      rating_count: count,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
