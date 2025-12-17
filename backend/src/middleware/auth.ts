import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization; // "Bearer xxx"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.substring('Bearer '.length);
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({ message: 'Auth not configured' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as { role?: string; email?: string };
    (req as any).user = payload;           // <<< on pose l'utilisateur
    next();                                // <<< pas de check de rôle ici
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as { role?: string };
    if (!user || !user.role || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    requireRole(['admin'])(req, res, next);
  });
}

