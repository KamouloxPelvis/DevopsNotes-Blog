import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import articlesRouter from './routes/articles';
import { Article } from '../src/models/Article';
import { upload } from './utils/upload';

dotenv.config(); // charge .env

const app = express();

// Middlewares généraux
app.use(cors());
app.use(express.json());

// Routes API
app.use('/api/articles', articlesRouter);

// Route d'upload d'images
app.post('/upload', upload.single('file'), (req, res) => {
if (!req.file) {
  return res.status(400).json({ message: 'No file uploaded' });
}

  const imageUrl = `/uploads/${req.file.filename}`;
  return  res.status(201).json({ imageUrl });
});

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Lecture des variables d'environnement
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env');
}

// Connexion MongoDB Atlas
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');

    // Routes de test
    app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    // Lancement du serveur
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
  
    // Suppression d'un article
    app.delete('/api/articles/:slug', async (req, res) => {
      try {
        const { slug } = req.params;
        const deleted = await Article.findOneAndDelete({ slug });

        if (!deleted) {
          return res.status(404).json({ message: 'Article not found' });
        }

        res.status(204).send(); // pas de contenu
      } catch (err) {
        res.status(500).json({ message: 'Server error' });
      }
    });

    // Modification d'un article
    app.put('/api/articles/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const updated = await Article.findOneAndUpdate(
      { slug },
      { title, content },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

