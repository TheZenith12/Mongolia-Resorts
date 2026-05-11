import { NextRequest, NextResponse } from 'next/server';

// This callback route was used by Supabase OAuth. With NextAuth, OAuth callbacks
// are handled by /api/auth/[...nextauth]. This route is kept as a redirect stub.
export async function GET(req: NextRequest) {
  const { origin } = new URL(req.url);
  return NextResponse.redirect(`${origin}/`);
}
