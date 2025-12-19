import express from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User'; 
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

  // --- NOUVELLE ROUTE SIGNUP MEMBER ---
router.post('/signup', async (req, res) => {
  console.log('HIT /api/auth/signup with body:', req.body);
  const { email, password, pseudo } = req.body;
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

  if (!jwtSecret) {
    return res.status(500).json({ message: 'Auth not configured' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const existingPseudo = await User.findOne({ pseudo });
    if (existingPseudo) {
      return res.status(409).json({ message: 'Pseudo already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed,
      role: 'member',
      pseudo,
    });
    await user.save();

    const payload = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      pseudo: user.pseudo,
    };

    const options: SignOptions = {
      expiresIn: jwtExpiresIn as any,
    };

    const token = jwt.sign(payload, jwtSecret as string, options);

    return res.status(201).json({
      token,
      user: { id: user._id, role: user.role, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Signup failed' });
  }
});

router.post('/login-member', async (req, res) => {
  const { email, password } = req.body;
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

  if (!jwtSecret) {
    return res.status(500).json({ message: 'Auth not configured' });
  }

  try {
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
      role: user.role,
      email: user.email,
      pseudo: user.pseudo
    };

    const options: SignOptions = { expiresIn: jwtExpiresIn as any };
    const token = jwt.sign(payload, jwtSecret as string, options);

    return res.json({
      token,
      user: { id: user._id, 
              role: user.role, 
              email: user.email,
              pseudo: user.pseudo },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
});


export default router;
