import { Request, Response } from 'express';
import { Comment } from '../models/Comment';

export const getCommentsBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    // On récupère les commentaires et on "populate" l'auteur pour avoir son nom/photo
    const comments = await Comment.find({ articleSlug: slug })
      .populate('author', 'pseudo avatarUrl') 
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des commentaires" });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { articleSlug, content } = req.body;

    // Ton middleware requireAuth garantit que req.user existe ici
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non identifié" });
    }

    const newComment = new Comment({
      articleSlug,
      content,
      author: req.user.id // Utilisation propre grâce à ton interface JwtUserPayload
    });

    await newComment.save();
    
    const populatedComment = await newComment.populate('author', 'username avatar');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: "Impossible de poster le commentaire" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable" });
    }

    // On récupère l'utilisateur depuis la requête (injecté par requireAuth)
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ message: "Utilisateur non identifié" });
    }

    // Vérification : Auteur du commentaire OU Admin
    // On utilise .toString() car comment.author est un ObjectId
    const isAuthor = comment.author.toString() === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    await Comment.findByIdAndDelete(id);
    res.json({ message: "Commentaire supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};