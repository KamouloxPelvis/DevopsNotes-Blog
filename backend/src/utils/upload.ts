import { Router, Request, Response } from 'express';
import path from 'path';
import multer from 'multer';

// 1. Configuration du stockage (Ton code actuel, très bien)
const uploadDir = path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Nettoyage du nom de fichier pour éviter les caractères bizarres
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const unique = Date.now();
    cb(null, `${base}_${unique}${ext}`);
  },
});

export const upload = multer({ storage });

// 2. Création du Routeur
const router = Router();

// 3. Définition de la route POST /upload
// C'est ici que la magie opère : on dit "sur cette route, utilise 'upload.single' puis renvoie la réponse"
router.post('/upload', upload.single('file'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'Aucun fichier uploadé' });
    return;
  }
  
  // On renvoie l'URL relative (celle qui sera utilisée par le frontend)
  // ex: /uploads/mon-image_123456.png
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

export const uploadRoutes = router;