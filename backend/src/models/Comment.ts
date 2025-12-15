import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  article: Types.ObjectId;      // référence à l'article
  authorName: string;
  content: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    article: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    authorName: { type: String, required: true, trim: true, maxlength: 80 },
    content: { type: String, required: true, minlength: 3, maxlength: 2000 },
  },
  { timestamps: true }
);

export const Comment = model<IComment>('Comment', commentSchema);
