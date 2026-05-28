import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Place } from '@/lib/models';
import { isObjectId } from '@/lib/slug';

// GET /api/places/[id]/info — slug or ObjectId → { id, name }
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const place = isObjectId(id)
      ? await Place.findById(id).select('_id name').lean()
      : await Place.findOne({ slug: id }).select('_id name').lean();

    if (!place) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      id:   (place as any)._id.toString(),
      name: (place as any).name,
    });
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
