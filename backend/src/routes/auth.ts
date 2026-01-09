import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import crypto from 'node:crypto';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/mailer';
import { requireAuth } from '../middleware/auth';

const authRouter = express.Router();

// ---------- CHECK SESSION (Essentiel pour React) ----------

authRouter.get('/me', requireAuth, (req, res) => {
  // Le middleware requireAuth a déjà vérifié le token dans le cookie
  // et a injecté les infos dans req.user
  return res.json({ user: req.user });
});

// Configuration des options de cookie (Réutilisable)
const COOKIE_OPTIONS = {
  httpOnly: true,                         // Empêche l'accès via JS (Sécurité XSS)
  secure: process.env.NODE_ENV === 'production', // Uniquement HTTPS en prod
  sameSite: 'strict' as const,            // Protection contre CSRF
  maxAge: 24 * 60 * 60 * 1000             // 24 heures
};

// ---------- SIGNUP ----------
authRouter.post('/signup', upload.single('avatar'), async (req, res) => {
  const { email, password, pseudo } = req.body;
  
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email déjà utilisé' });

    const existingPseudo = await User.findOne({ pseudo });
    if (existingPseudo) return res.status(400).json({ message: 'Ce pseudo est déjà pris' });

    const vToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      email,
      pseudo,
      password, // Le hashing doit être géré dans le hook 'pre-save' du modèle User
      role: 'member',
      avatarUrl: req.file ? `/uploads/${req.file.filename}` : '', // Correction chemin statique
      isVerified: false,
      verificationToken: vToken
    });

    await user.save();

    try {
      await sendVerificationEmail(user.email, vToken);
    } catch (mailErr) {
      console.error("Erreur SMTP :", mailErr);
      return res.status(201).json({ 
        message: 'Compte créé, mais erreur d\'envoi d\'email. Contactez le support.' 
      });
    }

    return res.status(201).json({ message: 'Inscription réussie ! Vérifiez vos emails.' });
  } catch (err) {
    console.error("Erreur Inscription :", err);
    return res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});

// ---------- LOGIN (Version avec Cookies) ----------
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';

  if (!jwtSecret) return res.status(500).json({ message: 'Auth not configured' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Identifiants invalides' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Veuillez confirmer votre adresse email.' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Identifiants invalides' });

    const payload = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      pseudo: user.pseudo,
      avatarUrl: user.avatarUrl
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn as any });

    // ENVOI DU TOKEN VIA COOKIE SÉCURISÉ
    res.cookie('token', token, COOKIE_OPTIONS);

    // On renvoie quand même les infos user pour le state React, mais SANS le token
    return res.json({ user: payload });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

// ---------- LOGOUT ----------
authRouter.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Déconnecté' });
});

// ---------- VERIFY EMAIL / FORGOT / RESET (Inchangés mais fonctionnels) ----------
authRouter.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  try {
    let user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: 'Lien invalide.' });
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    return res.json({ message: 'Compte activé !' });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur validation.' });
  }
});

authRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = new Date(Date.now() + 3600000);
      await user.save();
      await sendResetPasswordEmail(user.email, token);
    }
    res.json({ message: 'Si ce compte existe, un email a été envoyé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
    if (!user) return res.status(400).json({ message: 'Token expiré.' });
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Mot de passe réinitialisé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur reset.' });
  }
});

export default authRouter;