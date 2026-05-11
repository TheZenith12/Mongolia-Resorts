import { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
  booking_id:  { type: String, required: true, index: true },
  sender_id:   String,
  sender_role: { type: String, enum: ['user', 'manager', 'super_admin'] },
  message:     { type: String, required: true },
  is_read:     { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Message = models.Message || model('Message', MessageSchema);
