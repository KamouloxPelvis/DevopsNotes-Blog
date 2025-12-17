import { Router } from 'express';
import { Thread } from '../models/Thread';
import { requireAdmin } from '../middleware/auth';
import { Reply } from '../models/Reply';

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


// POST /api/forum/threads (admin uniquement pour l'instant)
router.post('/threads', requireAdmin, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    const thread = new Thread({
      title,
      content,
      tags,
      createdAt: new Date(),
    });
    
    await thread.save();
    return res.status(201).json(thread);
  } catch (err) {
    return res.status(500).json({ message: 'Error creating thread' });
  }
});

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
router.post('/threads/:id/replies', requireAdmin, async (req, res) => {
  try {
    const { content } = req.body;
    const threadId = req.params.id;

    const reply = new Reply({
      content,
      thread: threadId,
      createdAt: new Date(),
    });

    await reply.save();
    return res.status(201).json(reply);
  } catch (err) {
    return res.status(500).json({ message: 'Error creating reply' });
  }
});

export default router;
