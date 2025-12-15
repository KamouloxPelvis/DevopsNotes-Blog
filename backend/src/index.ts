import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';

import articlesRouter from './routes/articles';
import authRouter from './routes/auth';
import { upload } from './utils/upload';
import { requireAdmin } from './middleware/requireAdmin';

dotenv.config(); // charge .env

const app = express();

// Middlewares généraux
app.use(cors());
app.use(express.json());

// Routes API et Auth
app.use('/api/auth', authRouter);
app.use('/api/articles', articlesRouter);

// Route d'upload d'images (protégée admin)
app.post('/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  return res.status(201).json({ imageUrl });
});

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Lecture des variables d'environnement
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env');
}

// Connexion MongoDB Atlas puis lancement du serveur
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected', mongoose.connection.host, 
      mongoose.connection.name);

    // Route de healthcheck
    app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


