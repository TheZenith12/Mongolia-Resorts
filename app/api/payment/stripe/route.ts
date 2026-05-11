import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/mongodb';
import { Booking, Place } from '@/lib/models';
import { rateLimit } from '@/lib/rate-limit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    const rl = rateLimit(`stripe:${ip}`, 10, 60_000);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Хэт олон хүсэлт. 1 минутын дараа дахин оролдоно уу.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const { booking_id } = await req.json();

    await connectDB();
    const booking = await Booking.findById(booking_id).lean();
    if (!booking) return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });

    const place = await Place.findById((booking as any).place_id).select('name cover_image').lean();

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency:     'mnt',
          unit_amount:  (booking as any).total_amount * 100,
          product_data: {
            name:        (place as any)?.name ?? 'Захиалга',
            description: `${(booking as any).nights ?? 1} шөнө · ${(booking as any).guest_count} хүн`,
            images:      (place as any)?.cover_image ? [(place as any).cover_image] : [],
          },
        },
        quantity: 1,
      }],
      metadata: { booking_id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking_id}/confirmation?stripe=success`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking_id}/payment?stripe=cancel`,
    });

    // Save session id to booking
    await Booking.findByIdAndUpdate(booking_id, { payment_intent: session.id });

    return NextResponse.json({ checkout_url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
