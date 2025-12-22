import { Router } from 'express';
import { Message } from '../models/Message';

const router = Router();

// GET /api/chat/messages?room=general
router.get('/messages', async (req, res) => {
  const room = (req.query.room as string) || 'general';

  try {
    const messages = await Message.find({ room })
      .sort({ at: 1 })
      .limit(200); // limite d'historique

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

export default router;
