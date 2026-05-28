import { Schema, model, models } from 'mongoose';

const PasswordResetTokenSchema = new Schema({
  email:      { type: String, required: true, index: true },
  token:      { type: String, required: true, unique: true },
  expires_at: { type: Date,   required: true },
  used:       { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at' } });

export const PasswordResetToken = models.PasswordResetToken || model('PasswordResetToken', PasswordResetTokenSchema);
