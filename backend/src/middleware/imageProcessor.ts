import { NextFunction, Response } from 'express';

export const processImage = async (req: any, res: Response, next: NextFunction) => {
  // 1. Si pas de fichier, on passe
  if (!req.file) return next();

  // 2. VÉRIFICATION : On ne traite QUE les images
  // Si c'est un PDF ou autre, on saute Sharp pour ne pas crash
  const isImage = req.file.mimetype.startsWith('image/');
  if (!isImage) {
    console.log(`ℹ️ Fichier non-image détecté (${req.file.mimetype}), skip Sharp.`);
    return next();
  }

  try {
    // ... Ta logique Sharp ici ...
    next();
  } catch (error) {
    console.error("Erreur Sharp:", error);
    next(); 
  }
};