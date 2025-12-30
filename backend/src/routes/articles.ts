import { Router } from 'express';
import { Article } from '../models/Article';
import { generateSlug } from '../utils/slug';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/articles - Liste paginée
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 6, 1);
    const skip = (page - 1) * limit;
    const query = {}; // ou { status: 'published' } si tu veux filtrer

    const [items, total] = await Promise.all([
      Article.find(query)
        .select('title slug excerpt imageUrl likes views tags status createdAt author')
        .populate('author', 'pseudo')  // ✅ FIX author
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
    console.error(err);
    res.status(500).json({ message: 'Error fetching articles' });
  }
});

// GET /api/articles/:slug - Article unique
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug })
      .populate('author', 'pseudo');  // ✅ FIX author

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    return res.json(article);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching article' });
  }
});

// POST /api/articles - Créer article
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, content, imageUrl, tags = [], status = 'draft' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const slug = generateSlug(title);

    const existing = await Article.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'An article with this title already exists' });
    }

    const excerpt = content.slice(0, 200).replace(/[#*`]/g, '') + '...';  // ✅ Auto-excerpt

    const article = await Article.create({
      title,
      slug,
      imageUrl,
      content,
      excerpt,  // ✅ Sauvegarde excerpt
      tags: tags || [],
      status,
    });

    return res.status(201).json(article);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creating article' });
  }
});

// PUT /api/articles/:slug - Modifier article
router.put('/:slug', requireAdmin, async (req, res) => {
  try {
    console.log('--- PUT /api/articles/:slug ---');
    console.log('params.slug =', req.params.slug);
    console.log('body =', req.body);

    const { title, imageUrl, content, tags = [], status } = req.body;

    const article = await Article.findOne({ slug: req.params.slug });
    
    if (!article) {  // ✅ VÉRIF AVANT modifications
      return res.status(404).json({ message: 'Article not found' });
    }

    // ✅ Excerpt APRÈS vérif
    const excerpt = content.slice(0, 200).replace(/[#*`]/g, '') + '...';
    article.excerpt = excerpt;

    article.title = title ?? article.title;
    if (imageUrl) {
      article.imageUrl = imageUrl;
    }
    
    article.content = content ?? article.content;
    
    if (Array.isArray(tags)) {
      article.tags = tags;
    }

    console.log('Status before =', article.status);
    if (status === 'draft' || status === 'published') {
      article.status = status;
    }
    console.log('Status after  =', article.status);

    await article.save();
    console.log('Article saved');

    return res.json(article);
  } catch (err) {
    console.error('Error in PUT /api/articles/:slug', err);
    return res.status(500).json({ message: 'Error updating article' });
  }
});

// 👁️ views
router.put('/:slug/view', async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    res.json({ views: article.views });
  } catch (error) {
    res.status(500).json({ error: 'Erreur vue' });
  }
});

// ❤️ Like (increment numeric counter)
router.post('/:slug/like', async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { likes: 1 } },      // ✅ simple numeric increment
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    return res.json({ likes: article.likes ?? 0 });
  } catch (err) {
    console.error('Error like:', err);
    return res.status(500).json({ message: 'Like failed' });
  }
});


// ❤️ Like (auth requise)
router.put('/:slug/like', requireAuth, async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    res.json({ likes: article.likes });
  } catch (error) {
    res.status(500).json({ error: 'Erreur like' });
  }
});

// DELETE /api/articles/:slug
router.delete('/:slug', requireAdmin, async (req, res) => {
  try {
    const article = await Article.findOneAndDelete({ slug: req.params.slug });
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error deleting article' });
  }
});

export default router;

