import express from 'express';
import multer from 'multer';
import { uploadToR2 } from '../services/r2Service'; 

const router = express.Router();

// On utilise memoryStorage : l'image ne touche jamais le disque local
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite à 5Mo pour protéger la RAM
});

router.post('/upload-editorjs', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: 0, message: "Aucun fichier reçu" });
    }

    // Envoi direct vers Cloudflare R2
    const imageUrl = await uploadToR2(req.file);

    // Réponse au format Editor.js (json)
    res.json({
      success: 1,
      file: {
        url: imageUrl
      }
    });
  } catch (error) {
    console.error("Erreur Upload R2:", error);
    res.status(500).json({ success: 0, message: "Erreur lors de l'envoi vers le cloud" });
  }
});

export default router;