import { Schema, model } from 'mongoose';

const threadSchema = new Schema({
  title:   { type: String, required: true },
  content: { type: String, required: true },
  author:  { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  replies: [{ type: Schema.Types.ObjectId, ref: 'Reply' }],
  createdAt: { type: Date, default: Date.now },
  editedAt: { type: Date }, 
  },
  { timestamps: true }  
);  


export const Thread = model('Thread', threadSchema);
