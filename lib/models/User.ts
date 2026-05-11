import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  _id: string;
  email: string;
  password: string; // bcrypt hashed
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'user' | 'manager' | 'super_admin';
  assigned_place_id?: string; // for manager role
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>({
  email:             { type: String, required: true, unique: true, lowercase: true },
  password:          { type: String, required: true },
  full_name:         { type: String, default: '' },
  phone:             { type: String },
  avatar_url:        { type: String },
  role:              { type: String, enum: ['user', 'manager', 'super_admin'], default: 'user' },
  assigned_place_id: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const User = models.User || model<IUser>('User', UserSchema);
