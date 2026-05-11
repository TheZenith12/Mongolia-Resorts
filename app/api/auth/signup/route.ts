import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'И-мэйл, нууц үг оруулна уу' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Нууц үг 6 тэмдэгтээс дээш байх ёстой' }, { status: 400 });
    }
    await connectDB();
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return NextResponse.json({ error: 'Энэ и-мэйл бүртгэлтэй байна' }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 12);
    await User.create({ email: email.toLowerCase(), password: hashed, full_name: full_name ?? '' });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
