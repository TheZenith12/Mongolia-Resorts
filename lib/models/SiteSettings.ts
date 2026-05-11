import { Schema, model, models } from 'mongoose';

const SiteSettingsSchema = new Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: String, default: '' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const SiteSettings = models.SiteSettings || model('SiteSettings', SiteSettingsSchema);
