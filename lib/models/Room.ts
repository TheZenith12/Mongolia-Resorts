import { Schema, model, models } from 'mongoose';

const RoomSchema = new Schema({
  place_id:        { type: String, required: true, index: true },
  name:            { type: String, required: true },
  description:     String,
  price_per_night: { type: Number, required: true },
  capacity:        { type: Number, default: 2 },
  quantity:        { type: Number, default: 1 },
  cover_image:     String,
  amenities:       [String],
  is_available:    { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Room = models.Room || model('Room', RoomSchema);
