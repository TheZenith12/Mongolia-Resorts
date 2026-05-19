import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Place } from '@/lib/models';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 1) return NextResponse.json([]);

  try {
    await connectDB();
    const docs = await Place.find({
      is_published: true,
      $or: [
        { name:       { $regex: q, $options: 'i' } },
        { short_desc: { $regex: q, $options: 'i' } },
        { province:   { $regex: q, $options: 'i' } },
        { address:    { $regex: q, $options: 'i' } },
        { district:   { $regex: q, $options: 'i' } },
      ],
    })
      .select('_id slug name type province cover_image')
      .sort({ rating_avg: -1 })
      .limit(8)
      .lean();

    const data = docs.map((p: any) => ({
      id:          p.slug ?? p._id.toString(),
      name:        p.name,
      type:        p.type,
      province:    p.province ?? null,
      cover_image: p.cover_image ?? null,
    }));

    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
