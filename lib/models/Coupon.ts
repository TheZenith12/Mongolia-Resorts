import { Schema, model, models } from 'mongoose';

const CouponSchema = new Schema({
  code:          { type: String, required: true, uppercase: true, trim: true },
  type:          { type: String, enum: ['percent', 'fixed'], required: true },
  value:         { type: Number, required: true },   // % эсвэл ₮
  min_amount:    { type: Number, default: 0 },        // хамгийн бага захиалгын дүн
  max_uses:      { type: Number, default: null },     // null = хязгааргүй
  uses_count:    { type: Number, default: 0 },
  expires_at:    { type: Date, default: null },
  is_active:     { type: Boolean, default: true },
  place_id:      { type: String, default: null },     // null = бүх газарт
  description:   String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

CouponSchema.index({ code: 1 });

export const Coupon = models.Coupon || model('Coupon', CouponSchema);
