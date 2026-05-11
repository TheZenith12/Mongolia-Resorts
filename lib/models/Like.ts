import { Schema, model, models } from 'mongoose';

const LikeSchema = new Schema({
  user_id:    { type: String, required: true },
  place_id:   { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});
LikeSchema.index({ user_id: 1, place_id: 1 }, { unique: true });

export const Like = models.Like || model('Like', LikeSchema);
