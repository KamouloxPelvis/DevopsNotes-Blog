import { Schema, model } from 'mongoose';

const threadSchema = new Schema({
  title:   { type: String, required: true },
  content: { type: String, required: true },
  author:  { type: Schema.Types.ObjectId, ref: 'User', required: false }, // Pour l'instant l'auteur est optionnel (admin seulement)
  tags:    [String],
  replies: [{ type: Schema.Types.ObjectId, ref: 'Reply' }],
  createdAt: { type: Date, default: Date.now },
});

export const Thread = model('Thread', threadSchema);
