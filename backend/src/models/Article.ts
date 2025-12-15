import mongoose, { Schema, Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  status: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    imageUrl: { type: String, required: false },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    tags: [{ 
        type: String, 
        lowercase: true, // "docker", "terraform" etc.
      }],
    },
  { timestamps: true }
);

export const Article = mongoose.model<IArticle>('Article', ArticleSchema);