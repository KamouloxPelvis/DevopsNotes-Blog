import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  articleSlug: string;
  author: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  articleSlug: { type: String, required: true, index: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);