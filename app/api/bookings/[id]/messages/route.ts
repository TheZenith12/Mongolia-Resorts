import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Message } from '@/lib/models';

// GET /api/bookings/[id]/messages
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const messages = await Message.find({ booking_id: params.id })
      .sort({ created_at: 1 })
      .lean();
    const data = messages.map((m: any) => ({
      ...m,
      id:         m._id.toString(),
      created_at: m.created_at?.toISOString(),
    }));
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/bookings/[id]/messages
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: 'Мессеж хоосон байна' }, { status: 400 });

  const sessionUser = session.user as any;
  const role = sessionUser.role ?? 'user';

  await connectDB();
  const doc = await Message.create({
    booking_id:  params.id,
    sender_id:   sessionUser.id,
    sender_role: role,
    message:     message.trim(),
  });

  const m = doc.toObject();
  return NextResponse.json({ ...m, id: m._id.toString() });
}
