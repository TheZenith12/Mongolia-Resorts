import { Schema, model, models } from 'mongoose';

const ChatMessageSchema = new Schema({
  conversation_id: { type: String, required: true, index: true },
  sender_id:       String,
  sender_name:     String,
  sender_role:     { type: String, enum: ['user', 'manager', 'super_admin'], required: true },
  content:         { type: String, required: true },
  is_read:         { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const ChatMessage = models.ChatMessage || model('ChatMessage', ChatMessageSchema);
