import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
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
    const payload = jwt.verify(token, jwtSecret) as { role?: string };
    if (payload.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // éventuellement: (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
