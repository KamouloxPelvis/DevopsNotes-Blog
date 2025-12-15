import express from 'express';
import { Comment } from '../models/Comment';
import { Article } from '../models/Article';

const router = express.Router();

// GET /api/articles/:slug/comments
router.get('/articles/:slug/comments', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug }).select('_id');
  if (!article) return res.status(404).json({ message: 'Article not found' });

  const comments = await Comment
    .find({ article: article._id })
    .sort({ createdAt: -1 });

  res.json(comments);
});

// GET /api/articles/:slug/comments/count
router.get('/articles/:slug/comments/count', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug }).select('_id');
  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }

  const count = await Comment.countDocuments({ article: article._id });
  return res.json({ count });
});


// POST /api/articles/:slug/comments
router.post('/articles/:slug/comments', async (req, res) => {
  const { authorName, content } = req.body;
  if (!authorName || !content) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const article = await Article.findOne({ slug: req.params.slug }).select('_id');
  if (!article) return res.status(404).json({ message: 'Article not found' });

  const comment = new Comment({
    article: article._id,
    authorName,
    content,
  });

  await comment.save();
  res.status(201).json(comment);
});

export default router;
