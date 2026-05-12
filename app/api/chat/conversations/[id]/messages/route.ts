import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Conversation, ChatMessage } from '@/lib/models';

// GET /api/chat/conversations/[id]/messages
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  await connectDB();

  const conv = await Conversation.findById(params.id).lean();
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isAdmin = ['super_admin', 'manager'].includes(user.role);
  if (!isAdmin && (conv as any).user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const messages = await ChatMessage.find({ conversation_id: params.id })
    .sort({ created_at: 1 })
    .lean();

  // Уншсан гэж тэмдэглэх
  if (isAdmin) {
    await ChatMessage.updateMany(
      { conversation_id: params.id, sender_role: 'user', is_read: false },
      { $set: { is_read: true } }
    );
    await Conversation.findByIdAndUpdate(params.id, { $set: { unread_admin: 0 } });
  } else {
    await ChatMessage.updateMany(
      { conversation_id: params.id, sender_role: { $in: ['super_admin', 'manager'] }, is_read: false },
      { $set: { is_read: true } }
    );
    await Conversation.findByIdAndUpdate(params.id, { $set: { unread_user: 0 } });
  }

  return NextResponse.json({
    conversation: {
      id:         (conv as any)._id.toString(),
      user_name:  (conv as any).user_name ?? 'Хэрэглэгч',
      subject:    (conv as any).subject,
      status:     (conv as any).status,
    },
    messages: messages.map((m: any) => ({
      id:          m._id.toString(),
      sender_id:   m.sender_id,
      sender_name: m.sender_name ?? '',
      sender_role: m.sender_role,
      content:     m.content,
      is_read:     m.is_read,
      created_at:  m.created_at?.toISOString() ?? null,
    })),
  });
}

// POST /api/chat/conversations/[id]/messages — мессеж илгээх
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Мессеж хоосон байна' }, { status: 400 });
  }

  await connectDB();

  const conv = await Conversation.findById(params.id).lean();
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isAdmin = ['super_admin', 'manager'].includes(user.role);
  if (!isAdmin && (conv as any).user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const msg = await ChatMessage.create({
    conversation_id: params.id,
    sender_id:       user.id,
    sender_name:     user.name ?? user.email,
    sender_role:     user.role ?? 'user',
    content:         content.trim(),
  });

  // Update conversation last message + unread counts
  const isAdminSender = isAdmin;
  await Conversation.findByIdAndUpdate(params.id, {
    last_message_at: new Date(),
    last_message:    content.trim().slice(0, 100),
    status:          'open',
    $inc: isAdminSender ? { unread_user: 1 } : { unread_admin: 1 },
  });

  return NextResponse.json({
    id:          msg._id.toString(),
    sender_id:   msg.sender_id,
    sender_name: msg.sender_name,
    sender_role: msg.sender_role,
    content:     msg.content,
    is_read:     msg.is_read,
    created_at:  msg.created_at?.toISOString() ?? null,
  }, { status: 201 });
}
