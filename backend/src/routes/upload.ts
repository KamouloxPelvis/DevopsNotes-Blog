import express from 'express';
import multer from 'multer';
import { uploadToR2 } from '../services/r2Service'; 
import { antivirusScan } from '../middleware/antivirus';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// ROUTE UNIFIÉE (Tiptap, Chat, etc.)
router.post('/upload', upload.single('file'), antivirusScan, async (req, res) => {
  try {
    const folder = req.body.folder || 'general'; // Permet de classer (avatars, articles, etc.)
    const fileUrl = await uploadToR2(req.file!, folder);
    res.json({ imageUrl: fileUrl, url: fileUrl });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'envoi vers R2" });
  }
});

// COMPATIBILITÉ EDITORJS
router.post('/upload-editorjs', upload.single('image'), antivirusScan, async (req, res) => {
  try {
    const imageUrl = await uploadToR2(req.file!, 'editor');
    res.json({ success: 1, file: { url: imageUrl } });
  } catch (error) {
    res.status(500).json({ success: 0 });
  }
});

export default router;