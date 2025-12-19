import { Schema, model } from 'mongoose';

const replySchema = new Schema({
  content: { type: String, required: true },
  thread: { type: Schema.Types.ObjectId, ref: 'Thread' },
  authorId: { type: String, required: true},
  authorPseudo: {type: String, required: true},
  createdAt: { type: Date, default: Date.now }
});
export const Reply = model('Reply', replySchema);
