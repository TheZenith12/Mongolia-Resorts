import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, PasswordResetToken } from '@/lib/models';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token?.trim()) {
      return NextResponse.json({ error: 'Token байхгүй' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой' }, { status: 400 });
    }

    await connectDB();

    const record = await PasswordResetToken.findOne({ token }).lean() as any;

    if (!record) {
      return NextResponse.json({ error: 'Токен хүчингүй байна' }, { status: 400 });
    }
    if (record.used) {
      return NextResponse.json({ error: 'Энэ холбоос аль хэдийн ашиглагдсан байна' }, { status: 400 });
    }
    if (new Date() > new Date(record.expires_at)) {
      return NextResponse.json({ error: 'Холбоосны хугацаа дууссан байна. Дахин хүсэлт илгээнэ үү.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    await User.findOneAndUpdate(
      { email: record.email },
      { password: hashed }
    );

    // Mark token as used
    await PasswordResetToken.findByIdAndUpdate(record._id, { used: true });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('reset-password error:', err);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
