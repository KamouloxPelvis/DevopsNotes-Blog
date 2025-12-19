import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true },
  password: { 
    type: String, 
    required: true },
  role: { 
    type: String, 
    enum: ['visitor', 'admin', 'member'], 
    default: 'member' }, 
  pseudo: {                      
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
});

export const User = model('User', userSchema);
