export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Place } from '@/lib/models';

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ count: 0 });
  }

  await connectDB();
  const count = await Place.countDocuments({ status: 'pending' });
  return NextResponse.json({ count });
}
