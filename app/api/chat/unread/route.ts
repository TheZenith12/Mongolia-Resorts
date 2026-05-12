import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Conversation, ManagerAssignment } from '@/lib/models';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ count: 0 });

  const user = session.user as any;
  await connectDB();

  let count = 0;

  if (user.role === 'super_admin') {
    // Admin: бүх chat-ийн unread
    const result = await Conversation.aggregate([
      { $group: { _id: null, total: { $sum: '$unread_admin' } } },
    ]);
    count = result[0]?.total ?? 0;

  } else if (user.role === 'manager') {
    // Manager: зөвхөн өөрийн газрын unread
    const assignment = await ManagerAssignment.findOne({ manager_id: user.id }).lean();
    const assignedPlaceId = (assignment as any)?.place_id ?? null;
    if (assignedPlaceId) {
      const result = await Conversation.aggregate([
        { $match: { place_id: assignedPlaceId } },
        { $group: { _id: null, total: { $sum: '$unread_admin' } } },
      ]);
      count = result[0]?.total ?? 0;
    }

  } else {
    // User: өөрт хариулагдаагүй мессеж
    const result = await Conversation.aggregate([
      { $match: { user_id: user.id } },
      { $group: { _id: null, total: { $sum: '$unread_user' } } },
    ]);
    count = result[0]?.total ?? 0;
  }

  return NextResponse.json({ count });
}
