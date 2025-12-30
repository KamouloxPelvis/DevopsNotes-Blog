import { Router } from 'express';
import { Thread } from '../models/Thread';
import { Reply } from '../models/Reply';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/forum/threads - Liste threads
router.get('/threads', async (req, res) => {
  try {
    const threads = await Thread.find()
      .populate('authorId', 'pseudo')
      .sort({ createdAt: -1 });
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching threads' });
  }
});

// GET /api/forum/threads/:id - Thread unique
router.get('/threads/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate('authorId', 'pseudo');
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    return res.json(thread);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching thread' });
  }
});

// POST /api/forum/threads - Créer thread
router.post('/threads', requireAuth, requireRole(['member', 'admin']), async (req, res) => {
  console.log('HIT POST /api/forum/threads, user =', (req as any).user);
  const user = (req as any).user as { id?: string; pseudo?: string };
  const { title, content, tags } = req.body;

  try {
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: 'Title and content required' });
    }

    const thread = new Thread({
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
      authorId: user.id,
      authorPseudo: user.pseudo,
      createdAt: new Date(),
    });

    await thread.save();
    const populatedThread = await Thread.findById(thread._id).populate('authorId', 'pseudo');
    return res.status(201).json(populatedThread);
  } catch (err) {
    console.error('Error creating thread', err);
    return res.status(500).json({ message: 'Error creating thread' });
  }
});

// PUT /api/forum/threads/:id - Éditer thread
router.put('/threads/:id', requireAuth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const user = (req as any).user as { id?: string; role?: string };

    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    // Vérif author/admin
    if (thread.authorId?.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Only author or admin can edit this thread' });
    }

    const updatedThread = await Thread.findByIdAndUpdate(
      req.params.id,
      { 
        title: title?.trim(),
        content: content?.trim(),
        tags: tags || [],
        editedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('authorId', 'pseudo');

    res.json(updatedThread);
  } catch (err: any) {
    console.error('Edit error:', err);
    res.status(500).json({ message: 'Error updating thread' });
  }
});

// DELETE /api/forum/threads/:id - Supprimer thread
router.delete('/threads/:id', requireAuth, async (req, res) => {
  const user = (req as any).user as { id?: string; role?: string };

  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    if (thread.authorId?.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Only author or admin can delete this thread' });
    }

    await Thread.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Thread deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete thread' });
  }
});

// GET /api/forum/threads/:id/replies - Récup replies
router.get('/threads/:id/replies', async (req, res) => {
  try {
    const replies = await Reply.find({ thread: req.params.id })
      .populate('authorId', 'pseudo')
      .sort({ createdAt: 1 });
    return res.json(replies);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching replies' });
  }
});

// POST /api/forum/threads/:id/replies - Créer reply
router.post('/threads/:id/replies', requireAuth, requireRole(['member', 'admin']), async (req, res) => {
  try {
    const { content } = req.body;
    const threadId = req.params.id;
    const user = (req as any).user as { id?: string, pseudo?: string };

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'You have to write something in order to reply' });
    }

    const reply = new Reply({
      content: content.trim(),
      thread: threadId,
      authorId: user.id,
      authorPseudo: user.pseudo,
      createdAt: new Date(),
    });

    await reply.save();
    const populatedReply = await Reply.findById(reply._id).populate('authorId', 'pseudo');
    return res.status(201).json(populatedReply);
  } catch (err) {
    console.error('Reply error:', err);
    return res.status(500).json({ message: 'Error creating reply' });
  }
});

export default router;
