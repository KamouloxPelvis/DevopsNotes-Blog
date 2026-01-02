import express from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { upload } from '../utils/upload';
import { User } from '../models/User';
import crypto from 'node:crypto';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/mailer';

const authRouter = express.Router();

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{6,}$/;

// ---------- SIGNUP ----------
authRouter.post('/signup', upload.single('avatar'), async (req, res) => {
  const { email, password, pseudo } = req.body;
  
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email déjà utilisé' });

    const existingPseudo = await User.findOne({ pseudo });
    if (existingPseudo) return res.status(400).json({ message: 'Ce pseudo est déjà pris' });

    // Génération du token de vérification
    const vToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      email,
      pseudo,
      password,
      role: 'member',
      avatarUrl: req.file ? `/uploads/${req.file.filename}` : '',
      isVerified: false, // Important : non vérifié par défaut
      verificationToken: vToken
    });

    await user.save();

    // TENTATIVE D'ENVOI DE MAIL (Isolée pour ne pas faire crash la route)
    try {
      await sendVerificationEmail(user.email, vToken);
    } catch (mailErr) {
      console.error("Erreur SMTP :", mailErr);
      // On informe l'utilisateur que le compte est créé mais qu'il y a un souci de mail
      return res.status(201).json({ 
        message: 'Compte créé, mais nous n\'avons pas pu envoyer l\'email de confirmation. Contactez l\'admin.' 
      });
    }

    return res.status(201).json({ 
      message: 'Inscription réussie ! Veuillez vérifier vos emails.' 
    });

  } catch (err) {
    console.error("Erreur Inscription :", err);
    return res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});

// ---------- VERIFY EMAIL ----------
authRouter.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  try {

    let user = await User.findOne({ verificationToken: token });
    if (!user) {

      return res.status(400).json({ message: 'Ce lien a déjà été utilisé ou est invalide.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res.json({ message: 'Compte activé ! Vous pouvez maintenant vous connecter.' });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur lors de la validation.' });
  }
});

// ---------- FORGOT PASSWORD ----------
authRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 heure
      await user.save();
      await sendResetPasswordEmail(user.email, token);
    }
    // Message identique même si l'user n'existe pas (sécurité)
    res.json({ message: 'Si ce compte existe, un email a été envoyé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ---------- RESET PASSWORD ----------
authRouter.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) return res.status(400).json({ message: 'Token invalide ou expiré.' });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors du changement.' });
  }
});

// ---------- LOGIN ----------
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

  if (!jwtSecret) return res.status(500).json({ message: 'Auth not configured' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Identifiants invalides' });

    // VÉRIFICATION DU STATUT ISVERIFIED
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
    return res.json({ token, user: payload });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

export default authRouter;