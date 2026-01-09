import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  pseudo: string;
  password: string;
  role: string;
  avatarUrl?: string;
  birthday?: Date;
  location?: {
    city?: string;
    country?: string;
  };
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  pseudo: { type: String, required: true, unique: true }, // unique: true ajouté
  password: { type: String, required: true },
  role: { type: String, default: 'member' },
  avatarUrl: { type: String },
  birthday: { type: Date },
  location: {
    city: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

// Hash du mot de passe avant save si modifié
UserSchema.pre<IUser>('save', async function () {
  const user = this;

  if (!user.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

export const User = mongoose.model<IUser>('User', UserSchema);
