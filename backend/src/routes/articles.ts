import { Router, Request, Response } from 'express';
import multer from 'multer'; // Import direct pour remplacer l'ancien utils
import { requireAdmin, requireAuth } from '../middleware/auth';
import { Article } from '../models/Article';
import { generateSlug } from '../utils/slug';
import { getCommentsCount, incrementViews } from '../controllers/articleController';
import { antivirusScan } from '../middleware/antivirus';
import { processImage } from '../middleware/imageProcessor';
import { uploadToR2 } from '../services/r2Service';

const router = Router();

// Configuration de Multer en mémoire (Buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite à 5MB
});

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
router.post('/', requireAdmin, upload.single('image'), antivirusScan, processImage, async (req: Request, res: Response) => {
  try {
    const { title, content, tags, status = 'draft' } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const slug = generateSlug(title);
    const existing = await Article.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Title already exists' });
    }

    let imageUrl = req.body.imageUrl || ''; 

    // Gestion de l'upload initial avec timestamp
    if (req.file) {
      const uploadedUrl = await uploadToR2(req.file);
      // Uniformisation avec le paramètre de version ?v=
      imageUrl = `${uploadedUrl}?v=${Date.now()}`;
    }

    const excerpt = content.slice(0, 200).replace(/[#*`]/g, '') + '...';

    const article = await Article.create({
      title,
      slug,
      imageUrl, 
      content,
      excerpt,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : []),
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

    const hasLiked = article.likedBy.includes(userId as any);

    if (hasLiked) {
      article.likedBy = article.likedBy.filter(id => id.toString() !== userId);
      article.likes = Math.max(0, article.likes - 1);
    } else {
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
router.put('/:slug', requireAdmin, upload.single('image'), antivirusScan, processImage, async (req: Request, res: Response) => {
  try {
    const { title, content, tags, status, imageUrl: bodyImageUrl } = req.body; // Récupérer imageUrl du body
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ message: 'Article not found' });

    if (content) {
      article.excerpt = content.slice(0, 200).replace(/[#*`]/g, '') + '...';
      article.content = content;
    }
    if (title) article.title = title;

    // --- LOGIQUE CORRIGÉE ---
    if (req.file) {
      // Cas 1 : Nouveau fichier envoyé dans le formulaire
      const uploadedUrl = await uploadToR2(req.file);
      
      console.log(`✅ Image article uploadée dans R2: ${uploadedUrl}`);

      article.imageUrl = `${uploadedUrl}?v=${Date.now()}`;
    } else if (bodyImageUrl !== undefined) {
      // Cas 2 : On reçoit une URL (venant de l'upload préalable ou l'URL existante)
      // Si bodyImageUrl est une chaîne vide, cela supprimera l'image.
      article.imageUrl = bodyImageUrl;
    }

    if (tags) {
      article.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim());
    }
    if (status) article.status = status;

    await article.save();
    return res.json(article);
  } catch (err) {
    console.error("Erreur update article:", err);
    return res.status(500).json({ message: 'Error updating article' });
  }
});

// --- 6. DELETE ---
router.delete('/:slug', requireAdmin, async (req: Request, res: Response) => {
  try {
    const article = await Article.findOneAndDelete({ slug: req.params.slug });
    if (!article) return res.status(404).json({ message: 'Article not found' });
    
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting article' });
  }
});

// 7. Incrémenter les vues d'un article
router.get('/:slug/comments/count', getCommentsCount);

// 8. Route pour incrémenter les vues
router.post('/:slug/view', incrementViews);

export default router;