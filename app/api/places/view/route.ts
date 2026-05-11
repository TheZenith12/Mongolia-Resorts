import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Place } from '@/lib/models';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    // Allow 30 views per IP per minute
    const rl = rateLimit(`view:${ip}`, 30, 60_000);
    if (!rl.success) return NextResponse.json({ ok: false }, { status: 429 });

    const { place_id } = await req.json();
    if (!place_id || typeof place_id !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await connectDB();
    await Place.findByIdAndUpdate(place_id, { $inc: { view_count: 1 } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
