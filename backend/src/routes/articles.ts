import { Router, Request, Response } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { Article } from '../models/Article';
import { upload } from '../utils/upload';
import { generateSlug } from '../utils/slug';
import { getCommentsCount } from '../controllers/articleController';
import { uploadToR2 } from '../services/r2Service';
import fs from 'fs';
import path from 'path';

const router = Router();

// --- 1. GET ALL (Paginé) ---
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 6, 1);
    const skip = (page - 1) * limit;
    
    const query = {}; 

    const [items, total] = await Promise.all([
      Article.find(query)
        .select('title slug excerpt imageUrl likes likedBy views tags status createdAt author')
        .populate('author', 'pseudo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Article.countDocuments(query),
    ]);

    res.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching articles' });
  }
});

// --- 2. GET SINGLE ---
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug })
      .populate('author', 'pseudo');

    if (!article) return res.status(404).json({ message: 'Article not found' });
    return res.json(article); 
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching article' });
  }
});

// --- 3. POST (Create) ---
router.post('/', requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { title, content, tags, status = 'draft' } = req.body;
    
    // 1. Validation de base
    if (!title || !content) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // 2. Gestion du Slug
    const slug = generateSlug(title);
    const existing = await Article.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Title already exists' });
    }

    // 3. Gestion de l'image (Optimisation Sharp + Upload R2)
    let imageUrl = req.body.imageUrl || ''; // Valeur par défaut si rien n'est fourni

    if (req.file) {
      // On utilise r2Service qui :
      // - Redimensionne en 1600px
      // - Convertit en WebP
      // - Upload sur Cloudflare
      imageUrl = await uploadToR2(req.file);
    }

    // 4. Génération de l'extrait
    const excerpt = content.slice(0, 200).replace(/[#*`]/g, '') + '...';

    // 5. Création de l'article en base de données
    const article = await Article.create({
      title,
      slug,
      imageUrl: imageUrl, // On utilise l'URL finale (R2 ou body)
      content,
      excerpt,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',') : []),
      status,
      author: req.user?.id
    });

    return res.status(201).json(article);
  } catch (err) {
    console.error("Erreur création article:", err);
    return res.status(500).json({ message: 'Error creating article' });
  }
});

// --- 4. ❤️ LIKE (Unique & Toggle) ---
router.post('/:slug/like', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Connectez-vous pour liker" });

    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ message: 'Article not found' });

    // Vérification si l'utilisateur est déjà dans le tableau likedBy
    const hasLiked = article.likedBy.includes(userId as any);

    if (hasLiked) {
      // S'il a déjà liké, on retire son like (Unlike)
      article.likedBy = article.likedBy.filter(id => id.toString() !== userId);
      article.likes = Math.max(0, article.likes - 1);
    } else {
      // Sinon, on ajoute l'utilisateur
      article.likedBy.push(userId as any);
      article.likes += 1;
    }

    await article.save();
    return res.json({ likes: article.likes, hasLiked: !hasLiked });
  } catch (err) {
    return res.status(500).json({ message: 'Like operation failed' });
  }
});

// --- 5. PUT (Update) ---
router.put('/:slug', requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { title, content, tags, status } = req.body;
    const article = await Article.findOne({ slug: req.params.slug });
    
    if (!article) return res.status(404).json({ message: 'Article not found' });

    // Mise à jour du contenu et de l'extrait
    if (content) {
      article.excerpt = content.slice(0, 200).replace(/[#*`]/g, '') + '...';
      article.content = content;
    }
    
    // Mise à jour du titre
    if (title) article.title = title;

    // GESTION DE L'IMAGE (Optimisation WebP + R2)
    if (req.file) {
      // On utilise le service R2 qui compresse et convertit en WebP
      article.imageUrl = await uploadToR2(req.file);
    } else if (req.body.imageUrl === '') {
        article.imageUrl = '';
    }

    // Mise à jour des tags et du statut
    if (tags) article.tags = Array.isArray(tags) ? tags : tags.split(',');
    if (status) article.status = status;

    await article.save();
    return res.json(article);
  } catch (err) {
    console.error("Erreur update article:", err);
    return res.status(500).json({ message: 'Error updating article' });
  }
});

// --- 7. DELETE ---
router.delete('/:slug', requireAdmin, async (req: Request, res: Response) => {
  try {
    const article = await Article.findOneAndDelete({ slug: req.params.slug });
    if (!article) return res.status(404).json({ message: 'Article not found' });
    
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting article' });
  }
});

// Get le nombre de commentaires pour un article
router.get('/:slug/comments/count', getCommentsCount);

export default router;