import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import articlesRouter from './routes/articles';

dotenv.config(); // charge .env

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/articles', articlesRouter);

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
