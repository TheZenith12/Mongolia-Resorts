import { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema({
  place_id:   { type: String, required: true, index: true },
  user_id:    String,
  booking_id: String,
  rating:     { type: Number, required: true, min: 1, max: 5 },
  title:      String,
  comment:    String,
  body:       String,
  images:     [String],
  is_verified: { type: Boolean, default: false },
  user:       { full_name: String, avatar_url: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Review = models.Review || model('Review', ReviewSchema);
