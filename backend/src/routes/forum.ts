import { Router } from 'express';
import { Thread } from '../models/Thread';
import { Reply } from '../models/Reply';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/forum/threads
router.get('/threads', async (req, res) => {
  const threads = await Thread.find()
    .sort({ createdAt: -1 });
  res.json(threads);
});

// GET /api/forum/threads/:id
router.get('/threads/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    return res.json(thread);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching thread' });
  }
});


// POST /api/forum/threads
router.post(
  '/threads',
  requireAuth,
  requireRole(['member', 'admin']),
  async (req, res) => {

    console.log('HIT POST /api/forum/threads, user =', (req as any).user);
    const user = (req as any).user as { id?: string; pseudo?: string };
    const { title, content, tags } = req.body;

    try {

      const thread = new Thread({
        title,
        content,
        tags,
        authorId: user.id,
        authorPseudo: user.pseudo,
        createdAt: new Date(),
      });

      await thread.save();
      return res.status(201).json(thread);
    } catch (err) {
      console.error('Error creating thread', err);
      return res.status(500).json({ message: 'Error creating thread' });
    }
  }
);


// GET /api/forum/threads/:id/replies
router.get('/threads/:id/replies', async (req, res) => {
  try {
    const replies = await Reply.find({ thread: req.params.id })
      .sort({ createdAt: 1 });
    return res.json(replies);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching replies' });
  }
});

// POST /api/forum/threads/:id/replies  (admin-only V1)
router.post('/threads/:id/replies', 
  requireAuth,
  requireRole(['member', 'admin']), 
  async (req, res) => {
    try {
      const { content } = req.body;
      const threadId = req.params.id;
      const user = (req as any).user as { id?: string, pseudo?: string };

       if (!content || !content.trim()) {
        return res
          .status(400)
          .json({ message: 'You have to write something in order to reply' });
      }

      const reply = new Reply({
        content,
        thread: threadId,
        authorId: user.id,
        authorPseudo: user.pseudo,
        createdAt: new Date(),
      });

    await reply.save();
    return res.status(201).json(reply);
  } catch (err) {
    return res.status(500).json({ message: 'Error creating reply' });
  }
});

// EDIT thread (admin only)
router.put('/threads/:id', requireAuth, async (req, res) => {
  const { title, content } = req.body;
  const user = (req as any).user as { id?: string; role?: string };

  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    if (thread.author?.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Only author or admin can edit this thread' });
    }

    if (title !== undefined) thread.title = title;
    if (content !== undefined) thread.content = content;

    thread.set('editedAt', new Date());
    await thread.save();

    return res.json(thread);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update thread' });
  }
});

// DELETE thread (admin only)
router.delete('/threads/:id', requireAuth, async (req, res) => {
  const user = (req as any).user as { id?: string; role?: string };

  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    if (thread.author?.toString() !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Only author or admin can delete this thread' });
    } 

    await Thread.findByIdAndDelete(req.params.id);

    return res.json({ message: 'Thread deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete thread' });
  }
});


export default router;
