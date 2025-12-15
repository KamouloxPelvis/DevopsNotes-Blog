export interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  tags?: string[];
  status?: 'draft' | 'published';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export {};