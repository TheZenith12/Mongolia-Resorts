import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Room } from '@/lib/models';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const rooms = await Room.find({ place_id: params.id, is_available: true })
      .sort({ price_per_night: 1 })
      .lean();

    const data = rooms.map((r: any) => ({
      id:             r._id.toString(),
      place_id:       r.place_id,
      name:           r.name,
      description:    r.description ?? null,
      price_per_night: r.price_per_night,
      capacity:       r.capacity,
      quantity:       r.quantity,
      cover_image:    r.cover_image ?? null,
      amenities:      r.amenities ?? [],
      is_available:   r.is_available,
    }));

    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
