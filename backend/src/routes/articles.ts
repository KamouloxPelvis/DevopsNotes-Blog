import { Router } from 'express';
import { Article } from '../models/Article';
import { generateSlug } from '../utils/slug';
import { requireAdmin } from '../middleware/requireAdmin';


const router = Router();

// GET /api/articles
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 6, 1);
    const skip = (page - 1) * limit;

    const query = {}; // ou { status: 'published' } si tu veux filtrer

    const [items, total] = await Promise.all([
      Article.find(query)
        .sort({ createdAt: -1 })   // plus récents en premier
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

// READ one article by slug
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    return res.json(article);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching article' });
  }
});

// CREATE article
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
    

    const article = await Article.create({
      title,
      slug,
      imageUrl,
      content,
      tags: tags || [],
      status,
    });

    return res.status(201).json(article);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creating article' });
  }
});


// UPDATE by slug
router.put('/:slug', requireAdmin, async (req, res) => {
  try {
    console.log('--- PUT /api/articles/:slug ---');
    console.log('params.slug =', req.params.slug);
    console.log('body =', req.body);

    const { title, imageUrl, content, tags = [], status } = req.body;

    const article = await Article.findOne({ slug: req.params.slug });
    console.log('Found article?', !!article);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

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


// DELETE by slug
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