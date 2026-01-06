import mongoose, { Schema, Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: any;
  imageUrl?: string;
  status: string;
  tags?: string[];
  excerpt?: string;
  author?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // CORRECTION : On définit comme 'number' pour autoriser les calculs (+=, -=)
  likes: number; 
  likedBy: mongoose.Types.ObjectId[];
  views: number;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: Schema.Types.Mixed, required: true },
    imageUrl: { type: String, required: false },
    excerpt: { type: String, maxlength: 300 },
    // Mongoose comprend ici que c'est un Number avec une valeur par défaut
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
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
        lowercase: true,
      }],
  },
  { timestamps: true },     
);

export const Article = mongoose.model<IArticle>('Article', ArticleSchema);