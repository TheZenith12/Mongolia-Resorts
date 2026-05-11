import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Place } from '@/lib/models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json([], { status: 401 });

    const sessionUser = session.user as any;
    if (sessionUser.role !== 'super_admin') {
      return NextResponse.json([], { status: 403 });
    }

    await connectDB();
    const docs = await Place.find({}).select('_id name').sort({ name: 1 }).lean();
    const data = docs.map((p: any) => ({ id: p._id.toString(), name: p.name }));

    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
