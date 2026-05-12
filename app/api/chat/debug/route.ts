import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { ManagerAssignment, Conversation } from '@/lib/models';

// GET /api/chat/debug — Manager-ийн assignment шалгах (dev only)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = session.user as any;
  if (!['super_admin', 'manager'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const assignment = await ManagerAssignment.findOne({ manager_id: user.id }).lean();
  const assignedPlaceId = (assignment as any)?.place_id ?? null;

  const allConvs = await Conversation.find({}).select('place_id user_name subject').limit(10).lean();

  return NextResponse.json({
    user_id:         user.id,
    user_role:       user.role,
    assignment:      assignment ?? null,
    assigned_place_id: assignedPlaceId,
    all_conversations_sample: allConvs.map((c: any) => ({
      id:       c._id.toString(),
      place_id: c.place_id,
      subject:  c.subject,
      user:     c.user_name,
    })),
    filter_used: assignedPlaceId ? { place_id: assignedPlaceId } : 'no assignment',
  });
}
