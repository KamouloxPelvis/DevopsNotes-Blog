import mongoose, { Schema, Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  status: string;
  tags?: string[];
  excerpt?: string;
  author?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 }

}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    imageUrl: { type: String, required: false },
    excerpt: { type: String, maxlength: 300 },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }, 
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
  { timestamps: true },     

);


export const Article = mongoose.model<IArticle>('Article', ArticleSchema);