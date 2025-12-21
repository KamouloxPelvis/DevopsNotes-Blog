// backend/routes/auth.ts
import express from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

  if (!jwtSecret) {
    return res.status(500).json({ message: 'Auth not configured' });
  }

  try {
    // 1) Cas admin .env
    if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
      type AdminPayload = {
        id: string;
        role: 'admin';
        email: string;
        pseudo : string;
      };

      const payload: AdminPayload = { id: 'admin', 
                                      role: 'admin', 
                                      email, 
                                      pseudo: 'Administrator' };
      const options: SignOptions = { expiresIn: jwtExpiresIn as any };

      const token = jwt.sign(payload, jwtSecret as string, options);
      return res.json({ token, user: payload });
    }

    // 2) Cas member en base
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user._id.toString(),
      role: user.role,           // 'member' (ou autre)
      email: user.email,
      pseudo: user.pseudo,
    };

    const options: SignOptions = { expiresIn: jwtExpiresIn as any };
    const token = jwt.sign(payload, jwtSecret as string, options);

    return res.json({
      token,
      user: payload,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

 export default router;