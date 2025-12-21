import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import http from 'http';
import { Server } from 'socket.io';
import jwt  from 'jsonwebtoken';

import commentRoutes from './routes/comments';
import articlesRouter from './routes/articles';
import forumRouter from './routes/forum'
import authRouter from './routes/auth';
import { upload } from './utils/upload';
import { requireAdmin } from './middleware/auth';

dotenv.config(); // charge .env

const app = express();

// Middlewares généraux
app.use(cors());
app.use(express.json());

// Dossier d'upload commun (backend/uploads)
const uploadDir = path.join(process.cwd(), 'uploads');
console.log('UPLOAD DIR =', uploadDir);

// Servir les fichiers uploadés
app.use('/uploads', express.static(uploadDir));

// Routes API et Auth
app.use('/api', commentRoutes);
app.use('/api/auth', authRouter);
app.use('/api/articles', articlesRouter);

// Routes Forum
app.use('/api/forum', forumRouter);

// Route d'upload d'images (protégée admin)
app.post('/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  return res.status(201).json({ imageUrl });
});

// Route du forum
app.use('/api/forum', forumRouter);

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
    console.log(
      'MongoDB connected',
      mongoose.connection.host,
      mongoose.connection.name
    );

    // Route de healthcheck
    app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    // --- HTTP server + Socket.IO ---
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    type JwtPayload = {
      id?: string;
      role?: string;
      email?: string;
      pseudo?: string;
    };

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token as string | undefined;
      const jwtSecret = process.env.JWT_SECRET;

      if (!token || !jwtSecret) {
        return next(new Error('Unauthorized'));
      }

      try {
        const payload = jwt.verify(token, jwtSecret) as JwtPayload;
        (socket as any).user = payload;
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });

    io.on('connection', (socket) => {
      const user = (socket as any).user as JwtPayload;
      console.log('Socket connected:', user.pseudo, user.id);

      socket.join('general');

      socket.on('chat:join', (room: string) => {
        socket.join(room);
        socket.emit('chat:joined', { room });
      });

      socket.on('chat:message', ({ room, text }) => {
        if (!text || typeof text !== 'string') return;
        const msg = {
          room: room || 'general',
          text,
          fromId: user.id,
          fromPseudo: user.pseudo,
          at: new Date().toISOString(),
        };
        io.to(msg.room).emit('chat:message', msg);
      });
    });

    server.listen(PORT, () => {
      console.log(`Server + socket.IO² running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
