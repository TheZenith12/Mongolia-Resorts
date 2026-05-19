import mongoose, { Schema, model, models } from 'mongoose';

const PlaceSchema = new Schema({
  type:            { type: String, enum: ['resort', 'nature'], required: true },
  name:            { type: String, required: true },
  slug:            { type: String, unique: true, sparse: true },
  description:     String,
  short_desc:      String,
  price_per_night: Number,
  phone:           String,
  email:           String,
  website:         String,
  latitude:        Number,
  longitude:       Number,
  address:         String,
  province:        String,
  district:        String,
  cover_image:     String,
  images:          [String],
  video_url:       String,
  is_published:    { type: Boolean, default: false },
  is_featured:     { type: Boolean, default: false },
  rating_avg:      { type: Number, default: 0 },
  rating_count:    { type: Number, default: 0 },
  view_count:      { type: Number, default: 0 },
  like_count:      { type: Number, default: 0 },
  manager_id:      String,
  created_by:      String,
  // Хэрэглэгчийн илгээсэн газар
  status:              { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
  submitted_by:        String,   // user_id
  submitted_by_name:   String,
  submitted_by_email:  String,
  reject_reason:       String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

PlaceSchema.index({ slug: 1 });
PlaceSchema.index({ province: 1 });
PlaceSchema.index({ type: 1 });
PlaceSchema.index({ is_published: 1, rating_avg: -1 });
PlaceSchema.index({ name: 'text', description: 'text', address: 'text', province: 'text' });

export const Place = models.Place || model('Place', PlaceSchema);
