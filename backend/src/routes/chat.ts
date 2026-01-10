import express from 'express';
import { Message } from '../models/Message'; 

const chatRouter = express.Router();

chatRouter.get('/messages', async (req, res) => {
  try {
    const { room } = req.query;
    const messages = await Message.find({ room: room as string })
      .populate('author', 'pseudo avatarUrl')
      .sort({ at: 1 });

    // On formate pour le frontend
    const formatted = messages.map((m: any) => ({
      room: m.room,
      text: m.text,
      fromPseudo: m.author?.pseudo || 'Anonyme',
      fromAvatar: m.author?.avatarUrl || '',
      at: m.at,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Erreur historique chat:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default chatRouter;