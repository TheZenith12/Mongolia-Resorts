import { Schema, model, models } from 'mongoose';

const BookingSchema = new Schema({
  place_id:          { type: String, required: true, index: true },
  room_id:           String,
  user_id:           String,
  guest_name:        { type: String, required: true },
  guest_phone:       { type: String, default: '' },
  guest_email:       String,
  guest_count:       { type: Number, default: 1 },
  check_in:          { type: String, required: true },
  check_out:         { type: String, required: true },
  nights:            { type: Number, default: 1 },
  total_amount:      { type: Number, required: true },
  status:            { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  payment_method:    { type: String, enum: ['stripe', 'qpay'] },
  payment_status:    { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  payment_intent:    String,
  qpay_invoice_id:   String,
  notes:             String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Booking = models.Booking || model('Booking', BookingSchema);
