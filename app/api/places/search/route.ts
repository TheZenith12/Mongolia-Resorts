import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 1) return NextResponse.json([]);

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('places')
      .select('id, name, type, province, cover_image')
      .eq('is_published', true)
      .or(`name.ilike.%${q}%,province.ilike.%${q}%,address.ilike.%${q}%`)
      .order('rating_avg', { ascending: false })
      .limit(6);

    if (error) return NextResponse.json([]);
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json([]);
  }
}
