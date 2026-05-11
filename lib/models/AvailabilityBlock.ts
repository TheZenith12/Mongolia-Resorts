import { Schema, model, models } from 'mongoose';

const AvailabilityBlockSchema = new Schema({
  place_id:   { type: String, required: true, index: true },
  start_date: { type: String, required: true },
  end_date:   { type: String, required: true },
  reason:     String,
  created_by: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const AvailabilityBlock = models.AvailabilityBlock || model('AvailabilityBlock', AvailabilityBlockSchema);
