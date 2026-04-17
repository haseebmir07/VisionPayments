// ============================================================
// Vision Glass & Interior — User Model
// ============================================================

import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { IUser } from '@/types';

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  if (this.passwordHash === 'oauth-no-password') return;

  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Instance method: compare password
UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  if (this.passwordHash === 'oauth-no-password') return false;
  return bcrypt.compare(candidate, this.passwordHash);
};

// Prevent model recompilation in dev
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
