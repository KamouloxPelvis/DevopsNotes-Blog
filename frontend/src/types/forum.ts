export interface Reply {
  _id: string;
  content: string;
  createdAt: string;
}

export interface ForumThread {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    _id: string;
    email: string;
    role: 'admin' | 'member';
  };
  createdAt: string;
  editedAt: string;
}
