import { Schema, model } from 'mongoose';

const threadSchema = new Schema({
  title:   { type: String, required: true },
  content: { type: String, required: true },
  author:  { type: Schema.Types.ObjectId, ref: 'User', required: false }, 
  replies: [{ type: Schema.Types.ObjectId, ref: 'Reply' }],
  authorId: { type: String, required: true},
  authorPseudo: {type: String, required: true},
  createdAt: { type: Date, default: Date.now },
  editedAt: { type: Date }, 
  },
  { timestamps: true }  
);  


export const Thread = model('Thread', threadSchema);
