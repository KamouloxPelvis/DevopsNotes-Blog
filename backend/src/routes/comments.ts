import express from 'express';
import { getCommentsBySlug, addComment, deleteComment } from '../controllers/commentController';
import { requireAuth } from '../middleware/auth'; // Ton middleware actuel

const router = express.Router();

// GET /api/comments/:slug
router.get('/:slug', getCommentsBySlug);

// POST /api/comments (nécessite d'être connecté)
router.post('/', requireAuth, addComment);

router.delete('/:id', requireAuth, deleteComment);

export default router;