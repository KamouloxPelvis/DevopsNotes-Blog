/**
 * Interface représentant l'auteur d'un commentaire.
 * Correspond au .populate('author', 'username avatar') du backend.
 */
export interface CommentAuthor {
  _id: string;
  username: string; // Utilise 'username' pour correspondre à ton backend
  avatar?: string;  // Optionnel, récupéré via ton populate
}

/**
 * Interface principale pour un Commentaire.
 */
export interface IComment {
  _id: string;
  content: string;
  article: string;   // ID de l'article associé
  articleSlug: string; // Slug utilisé pour la recherche
  author: CommentAuthor; // Objet auteur peuplé par la BDD
  createdAt: string;
  updatedAt: string;
}

/**
 * Type utilisé pour la création d'un nouveau commentaire (Payload)
 */
export type CreateCommentInput = Pick<IComment, 'content' | 'article'>;