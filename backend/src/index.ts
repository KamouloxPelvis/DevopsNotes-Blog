import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { createServer } from 'http'; // Requis pour Socket.io
import { Server } from 'socket.io';

// Import des routes
import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import { uploadRoutes } from './utils/upload'; 
import chatRoutes from './routes/chat';
import forumRoutes from './routes/forum';
import commentRoutes from './routes/comments';

dotenv.config();

const app = express();
const httpServer = createServer(app); // On crée le serveur HTTP

// Configuration de Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 
              'http://127.0.0.1:3000',
              'http://localhost:5000',
              'http://devopsnotes.org',
              'https://devopsnotes.org',
              'https://www.devopsnotes.org',
              'https://devopsnotes.org/api',
              'https://www.devopsnotes.org/api',
            ], 
    credentials: true
  }
});

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:3000', 
            'http://127.0.0.1:3000',
            'http://localhost:5000',
            'devopsnotes.org',
            'http://devopsnotes.org',
            'https://devopsnotes.org',
            'https://www.devopsnotes.org',
            'https://devopsnotes.org/api'
          ],
  credentials: true
}));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

// --- SERVIR LES IMAGES (Correction 404) ---
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- ROUTES API ---
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api', uploadRoutes); // Utilise maintenant le Routeur corrigé
app.use('/api/chat', chatRoutes);
app.use('/api/forum', forumRoutes);

// --- LOGIQUE SOCKET.IO AVEC AUTHENTIFICATION ---
io.on('connection', (socket) => {
  // 1. Récupération de l'utilisateur via le token passé dans "auth"
  const token = socket.handshake.auth.token;
  let userData: any = null;

  try {
    if (token) {
      // Décodage du token pour obtenir les infos utilisateur
      userData = jwt.verify(token, process.env.JWT_SECRET || 'votre_cle_secrete');
      console.log(`📱 ${userData.pseudo} s'est connecté au chat`);
    }
  } catch (err) {
    console.log('⚠️ Connexion socket sans token valide (Anonyme)');
  }

  // 2. Rejoindre un salon
  socket.on('chat:join', (room) => {
    socket.join(room);
    console.log(`👤 ${userData?.pseudo || 'Anonyme'} a rejoint le salon: ${room}`);
  });

  // 3. Écouter et diffuser les messages
  socket.on('chat:message', (data) => {
    console.log('💬 Message reçu de', userData?.pseudo, ':', data.text);
    
    const fullMessage = {
      room: data.room,
      text: data.text,
      fromId: userData?.id || socket.id,
      fromPseudo: userData?.pseudo || 'Anonyme',
      at: new Date().toISOString()
    };

    io.to(data.room).emit('chat:message', fullMessage);
  });

  socket.on('disconnect', () => {
    console.log(`📴 ${userData?.pseudo || 'Un utilisateur'} s'est déconnecté`);
  });
});

// --- CONNEXION MONGODB ET LANCEMENT ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ ERREUR CRITIQUE : MONGO_URI n\'est pas définie dans le .env');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas Connecté');
    httpServer.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion MongoDB Atlas :', err.message);
  });