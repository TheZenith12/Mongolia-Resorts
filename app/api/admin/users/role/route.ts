import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User, ManagerAssignment } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sessionUser = session.user as any;
    if (sessionUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { user_id, role, place_id } = await req.json();

    // Manager болгохдоо place_id заавал шаарддаг
    if (role === 'manager' && !place_id) {
      return NextResponse.json(
        { error: 'Manager болгохдоо газар заавал сонгоно уу' },
        { status: 400 }
      );
    }

    await connectDB();

    // Role шинэчлэх
    await User.findByIdAndUpdate(user_id, { role });

    // Manager болгож байгаа бол газар оноох
    if (role === 'manager' && place_id) {
      await ManagerAssignment.findOneAndUpdate(
        { manager_id: user_id },
        { manager_id: user_id, place_id, assigned_by: sessionUser.id, assigned_at: new Date() },
        { upsert: true, new: true }
      );
    }

    // Manager-аас өөр role болгож байгаа бол оноогдолтыг устга
    if (role !== 'manager') {
      await ManagerAssignment.deleteOne({ manager_id: user_id });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
