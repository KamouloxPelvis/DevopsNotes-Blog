import { Router } from 'express';
import { Article } from '../models/Article';
import { generateSlug } from '../utils/slug';
import { requireAdmin } from '../middleware/requireAdmin';


const router = Router();

// GET /api/articles
router.get('/', async (_req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: 'Error fetching articles' });
  }
});

router.get('/tags', async (req, res) => {
  const tags = await Article.distinct('tags');
  res.json(tags.flat());  // ["docker", "terraform", "sccm"]
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
    const { title, content, imageUrl, tags = [] } = req.body;

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
      tags: tags || []
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
    const { title, imageUrl, content, tags = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.title = title;
    article.imageUrl = imageUrl || article.imageUrl;
    article.content = content;
    
    if (Array.isArray(tags)) article.tags = tags;

    // Si tu veux régénérer le slug quand le titre change :
    article.slug = generateSlug(title);

    await article.save ();

    return res.json(article);
  } catch (err) {
    console.error(err);
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