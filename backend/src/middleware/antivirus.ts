import { Request, Response, NextFunction } from 'express';
import ClamScan from 'clamscan';

export const antivirusScan = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  try {
    const scanner = await new ClamScan().init({
      clamdscan: {
        host: process.env.CLAMAV_HOST || 'clamav',
        port: 3310,
        timeout: 60000
      }
    });

    const { is_infected, viruses } = await scanner.scan_stream(req.file.buffer);

    if (is_infected) {
      console.error(`🚨 Malware détecté dans ${req.file.originalname}: ${viruses.join(', ')}`);
      return res.status(403).json({ message: "Fichier dangereux détecté et bloqué." });
    }

    next(); // Si tout est OK, on passe à la suite (l'upload R2)
  } catch (error) {
    console.error("Erreur scanner ClamAV:", error);
    // En cas d'erreur du scanner, on bloque par sécurité (Fail-safe)
    res.status(500).json({ message: "Erreur lors de l'analyse de sécurité." });
  }
};