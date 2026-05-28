import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, PasswordResetToken } from '@/lib/models';
import { sendPasswordReset } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email?.trim()) {
      return NextResponse.json({ error: 'И-мэйл хоосон байна' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() }).lean();

    // Security: always return success even if user not found
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Invalidate existing tokens for this email
    await PasswordResetToken.updateMany(
      { email: email.toLowerCase(), used: false },
      { used: true }
    );

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordResetToken.create({
      email: email.toLowerCase().trim(),
      token,
      expires_at,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

    await sendPasswordReset({ to: email.toLowerCase().trim(), resetUrl });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('forgot-password error:', err);
    return NextResponse.json({ error: 'Алдаа гарлаа' }, { status: 500 });
  }
}
