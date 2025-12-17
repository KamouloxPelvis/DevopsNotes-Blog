import express from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

  if (!adminEmail || !adminPassword || !jwtSecret) {
    return res.status(500).json({ message: 'Auth not configured' });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  type AdminPayload = { role: 'admin'; email: string };
  const payload: AdminPayload = { role: 'admin', email };

  const options: SignOptions = {
    expiresIn: jwtExpiresIn as any, // voire dans .env 
  };

  const token = jwt.sign(payload, jwtSecret as string, options);
    return res.json({ token });
  });

export default router;
