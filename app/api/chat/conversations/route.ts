import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Conversation, ChatMessage, Place, ManagerAssignment } from '@/lib/models';
import { isObjectId } from '@/lib/slug';

// GET /api/chat/conversations
// super_admin → бүгд
// manager     → зөвхөн өөрийн place_id-тай chat-ууд
// user        → зөвхөн өөрийнх
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  await connectDB();

  let filter: Record<string, any> = {};

  if (user.role === 'super_admin') {
    // Бүх chat харна
    filter = {};
  } else if (user.role === 'manager') {
    // Зөвхөн өөрийн газартай холбоотой chat
    const assignment = await ManagerAssignment.findOne({ manager_id: user.id }).lean();
    const assignedPlaceId = (assignment as any)?.place_id?.toString() ?? null;
    if (!assignedPlaceId) return NextResponse.json([]);
    filter = { place_id: assignedPlaceId };
  } else {
    // Хэрэглэгч зөвхөн өөрийнхийг
    filter = { user_id: user.id };
  }

  const convs = await Conversation.find(filter)
    .sort({ last_message_at: -1 })
    .limit(50)
    .lean();

  return NextResponse.json(convs.map((c: any) => ({
    id:              c._id.toString(),
    user_id:         c.user_id,
    user_name:       c.user_name ?? 'Хэрэглэгч',
    user_email:      c.user_email ?? '',
    subject:         c.subject,
    status:          c.status,
    place_id:        c.place_id ?? null,
    place_name:      c.place_name ?? null,
    last_message_at: c.last_message_at?.toISOString() ?? null,
    last_message:    c.last_message ?? '',
    unread_user:     c.unread_user ?? 0,
    unread_admin:    c.unread_admin ?? 0,
    created_at:      c.created_at?.toISOString() ?? null,
  })));
}

// POST /api/chat/conversations — user шинэ яриа үүсгэнэ
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const { subject, first_message, place_id } = await req.json();

  if (!first_message?.trim()) {
    return NextResponse.json({ error: 'Мессеж хоосон байна' }, { status: 400 });
  }

  await connectDB();

  // Амралтын газрын нэр авах — зөвхөн хүчинтэй ObjectId байвал query хийнэ
  let placeName: string | null = null;
  if (place_id && isObjectId(place_id)) {
    const place = await Place.findById(place_id).select('name').lean();
    placeName = (place as any)?.name ?? null;
  }

  const autoSubject = place_id
    ? (placeName ? `${placeName} — асуулт` : 'Амралтын газрын асуулт')
    : (subject?.trim() || 'Ерөнхий асуулт');

  const conv = await Conversation.create({
    user_id:         user.id,
    user_name:       user.name ?? user.email,
    user_email:      user.email,
    subject:         autoSubject,
    status:          'open',
    last_message_at: new Date(),
    last_message:    first_message.trim().slice(0, 100),
    unread_admin:    1,
    place_id:        place_id ?? null,
    place_name:      placeName,
  });

  await ChatMessage.create({
    conversation_id: conv._id.toString(),
    sender_id:       user.id,
    sender_name:     user.name ?? user.email,
    sender_role:     'user',
    content:         first_message.trim(),
  });

  return NextResponse.json({
    id:         conv._id.toString(),
    place_id:   place_id ?? null,
    place_name: placeName,
  }, { status: 201 });
}
