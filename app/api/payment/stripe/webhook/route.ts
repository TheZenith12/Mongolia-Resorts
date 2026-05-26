import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/mongodb';
import { Booking, Place } from '@/lib/models';
import { sendBookingConfirmation } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  await connectDB();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        payment_status: 'paid',
        status:         'confirmed',
        payment_intent: session.payment_intent as string,
      });

      // Email мэдэгдэл
      const booking = await Booking.findById(bookingId).lean() as any;
      if (booking?.guest_email) {
        const place = await Place.findById(booking.place_id).select('name').lean() as any;
        await sendBookingConfirmation({
          to:          booking.guest_email,
          guestName:   booking.guest_name,
          placeName:   place?.name ?? 'Газар',
          checkIn:     booking.check_in,
          checkOut:    booking.check_out,
          nights:      booking.nights,
          totalAmount: booking.total_amount,
          bookingId:   bookingId,
        });
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, { payment_status: 'failed' });
    }
  }

  return NextResponse.json({ received: true });
}
