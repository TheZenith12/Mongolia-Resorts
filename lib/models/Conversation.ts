import { Schema, model, models } from 'mongoose';

const ConversationSchema = new Schema({
  user_id:        { type: String, required: true, index: true },
  user_name:      String,
  user_email:     String,
  subject:        { type: String, default: 'Ерөнхий асуулт' },
  status:         { type: String, enum: ['open', 'closed'], default: 'open' },
  last_message_at: { type: Date, default: Date.now },
  last_message:   String,
  unread_user:    { type: Number, default: 0 },
  unread_admin:   { type: Number, default: 0 },
  // Амралтын газартай холбоотой chat
  place_id:       { type: String, default: null, index: true },
  place_name:     { type: String, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Conversation = models.Conversation || model('Conversation', ConversationSchema);
