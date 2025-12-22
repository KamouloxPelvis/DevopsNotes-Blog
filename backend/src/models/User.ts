import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  pseudo: string;
  password: string;
  role: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  pseudo: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'member' },
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
