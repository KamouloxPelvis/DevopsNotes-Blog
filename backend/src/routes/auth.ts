// backend/src/routes/auth.ts
import express from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

const authRouter = express.Router();

// Au moins 6 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial, pas d'espace
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{6,}$/;

// ---------- SIGNUP ----------
authRouter.post('/signup', async (req, res) => {
  const { email, password, pseudo } = req.body;

  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

  if (!jwtSecret) {
    return res.status(500).json({ message: 'Auth not configured' });
  }

  // 1) validations basiques
  if (!email || !password || !pseudo) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  if (pseudo.trim().length < 3) {
    return res.status(400).json({
      message: 'Username must be at least 3 characters long.',
    });
  }

  if (!PASSWORD_REGEX.test(password)) {
    return res.status(400).json({
      message:
        'Password must be at least 6 characters and contain 1 uppercase letter, 1 digit and 1 special character.',
    });
  }

  try {
    // 2) Email déjà utilisé ?
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // 3) Création de l'utilisateur (mot de passe hashé via pre('save'))
    const user = new User({
      email,
      pseudo,
      password,
      role: 'member',
    });

    await user.save();

    // 4) Générer un token pour connecter automatiquement l'utilisateur
    const payload = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      pseudo: user.pseudo,
    };

    const options: SignOptions = { expiresIn: jwtExpiresIn as any };
    const token = jwt.sign(payload, jwtSecret as string, options);

    return res.status(201).json({ token, user: payload });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Signup failed' });
  }
});

// ---------- LOGIN ----------
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

  if (!jwtSecret) {
    return res.status(500).json({ message: 'Auth not configured' });
  }

  try {
    // 1) Cas admin .env
    if (
      adminEmail &&
      adminPassword &&
      email === adminEmail &&
      password === adminPassword
    ) {
      type AdminPayload = {
        id: string;
        role: 'admin';
        email: string;
        pseudo: string;
      };

      const payload: AdminPayload = {
        id: 'admin',
        role: 'admin',
        email,
        pseudo: 'Administrator',
      };
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
      role: user.role,
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

export default authRouter;
