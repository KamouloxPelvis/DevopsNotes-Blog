import express from 'express';
import multer from 'multer';
import { uploadToR2 } from '../services/r2Service'; 

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// NOUVELLE ROUTE POUR TIPTAP (TON ÉDITEUR ACTUEL)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }

    // Envoi vers Cloudflare R2
    const imageUrl = await uploadToR2(req.file);

    // Format attendu par ton frontend : { imageUrl: "https://..." }
    res.json({ imageUrl });
  } catch (error) {
    console.error("Erreur Upload R2:", error);
    res.status(500).json({ message: "Erreur lors de l'envoi vers R2" });
  }
});

// On garde l'ancienne pour la compatibilité si besoin
router.post('/upload-editorjs', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = await uploadToR2(req.file!);
    res.json({ success: 1, file: { url: imageUrl } });
  } catch (error) {
    res.status(500).json({ success: 0 });
  }
});

export default router;