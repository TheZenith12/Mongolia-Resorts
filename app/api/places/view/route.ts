import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    // Allow 30 views per IP per minute (enough for browsing, not for abuse)
    const rl = rateLimit(`view:${ip}`, 30, 60_000);
    if (!rl.success) return NextResponse.json({ ok: false }, { status: 429 });

    const { place_id } = await req.json();
    if (!place_id || typeof place_id !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const admin = createAdminClient();

    // Try RPC first, fallback to manual update
    const { error: rpcError } = await (admin.rpc as any)('increment_view_count', { place_id });

    if (rpcError) {
      // Fallback: direct update if the RPC function doesn't exist yet
      await (admin.from('places') as any)
        .update({ view_count: (admin as any).raw('view_count + 1') })
        .eq('id', place_id);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
