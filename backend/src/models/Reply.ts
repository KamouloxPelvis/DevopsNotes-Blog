import { Schema, model } from 'mongoose';

const replySchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  thread: { type: Schema.Types.ObjectId, ref: 'Thread' },
  createdAt: { type: Date, default: Date.now }
});
export const Reply = model('Reply', replySchema);
