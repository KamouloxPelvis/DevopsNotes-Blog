export interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  imageUrl?: string;
  likes?: number;
  likedBy: string[];
  views?: number;   
  createdAt: string;
  updatedAt: string;
}

export {};