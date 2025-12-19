export interface Reply {
  _id: string;
  content: string;
  createdAt: string;
  authorId?: string;
  authorPseudo?: string;
}

export interface ForumThread {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  editedAt?: string;
  tags?: string[];
  authorId?: string;     
  authorPseudo?: string;
}
