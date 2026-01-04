import { Request, Response } from 'express';
import { Comment } from '../models/Comment';

export const getCommentsBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    // On récupère les commentaires et on "populate" l'auteur pour avoir son nom/photo
    const comments = await Comment.find({ articleSlug: slug })
      .populate('author', 'username avatar') 
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