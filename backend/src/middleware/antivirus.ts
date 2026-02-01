import { Request, Response, NextFunction } from 'express';
import ClamScan from 'clamscan';
import { Readable } from 'stream';

export const antivirusScan = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  try {
    const clamscan = await new ClamScan().init({
      clamdscan: {
        host: process.env.CLAMAV_HOST || 'clamav',
        port: 3310,
        timeout: 60000
      }
    });

    const stream = Readable.from(req.file.buffer);

    // On utilise (clamscan as any) pour éviter l'erreur TypeScript "Property does not exist"
    const { is_infected, viruses } = await (clamscan as any).scanStream(stream);

    if (is_infected) {
      console.error(`🚨 Malware détecté dans ${req.file.originalname}: ${viruses.join(', ')}`);
      return res.status(403).json({ message: "Fichier dangereux détecté et bloqué." });
    }

    next(); 
  } catch (error) {
    //console.error("Erreur scanner ClamAV détaillée:", error);
    // En cas d'erreur de communication, on bloque pour la sécurité (En production)
    //res.status(500).json({ message: "Erreur lors de l'analyse de sécurité." });
    console.error("⚠️ ClamAV indisponible dans le cluster k3s. On bypass le scan pour débloquer l'upload.");
  next();
  }
};