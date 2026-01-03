import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import http from 'http';
import jwt  from 'jsonwebtoken';
import helmet from 'helmet';

import authRouter from './routes/auth';
import { requireAdmin } from './middleware/auth';

import commentRoutes from './routes/comments';
import articlesRouter from './routes/articles';
import forumRouter from './routes/forum'

import { upload } from './utils/upload';
import { Server } from 'socket.io';

import { Message } from './models/Message';
import chatRouter from './routes/chat';

const app = express();

const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

const allowedOrigins = [
  "http://localhost:3000",
  "http://113.30.191.17:3000",
  "http://devopsnotes.org",
  "https://devopsnotes.org",
  "https://www.devopsnotes.org"
];


// Middlewares de Parsing et Sécurité 
app.use(express.json());
app.use(
  '/api',
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      // autoriser les outils type Postman (origin null)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Dossier d'upload commun (backend/uploads)
const uploadDir = path.join(__dirname, '..', 'uploads');

// Servir les fichiers uploadés
app.use('/api/uploads', express.static(uploadDir));

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

// Routes Chat
app.use('/api/chat', chatRouter);

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
        origin: FRONTEND_ORIGIN,
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

    // Connexion serveur du chat socket.io

    io.on('connection', (socket) => {
      const user = (socket as any).user as JwtPayload;
      console.log('Socket connected:', user.pseudo, user.id);

      socket.join('General');

      socket.on('chat:join', (room: string) => {
        socket.join(room);
        socket.emit('chat:joined', { room });
      });

      socket.on('chat:message', async ({ room, text }) => {
        if (!text || typeof text !== 'string') return;

        const msg = {
          room: room || 'General',
          text,
          fromId: user.id,
          fromPseudo: user.pseudo,
          at: new Date(),
        };

        try { 
        const saved = await Message.create(msg);
        // on renvoie le document sauvegardé (avec _id, Date réelle, etc.)
        io.to(saved.room).emit('chat:message', {
          room: saved.room,
          text: saved.text,
          fromId: saved.fromId,
          fromPseudo: saved.fromPseudo,
          at: saved.at.toISOString(),
        });
      } catch (err) {
        console.error('Error saving chat messages', err);
      }
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
