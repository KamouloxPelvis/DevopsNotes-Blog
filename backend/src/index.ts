import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { createServer } from 'http'; // Requis pour Socket.io
import { Server } from 'socket.io';
import * as Sentry from "@sentry/node";
import "./instruments";

// Import des routes
import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import uploadRoutes from './routes/upload'; 
import chatRoutes from './routes/chat';
import forumRoutes from './routes/forum';
import commentRoutes from './routes/comments';
import seoRoutes from './routes/seo';

// Import du modèle Message (nécessaire pour la logique de sauvegarde)
import { Message } from './models/Message';

dotenv.config();

const app = express();
const httpServer = createServer(app); // On crée le serveur HTTP

// Configuration de Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000',
              'https://devopsnotes.org',
              'https://blog.devopsnotes.org',
              'https://www.devopsnotes.org',
              "https://resources.devopsnotes.org",
            ], 
    credentials: true
  }
});

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:3000',
            'https://devopsnotes.org',
            'https://blog.devopsnotes.org',
            'https://www.devopsnotes.org',
            "https://resources.devopsnotes.org",
          ],
  credentials: true
}));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'", 
          "data:",
          "https://*.cloudflare.com", 
          "https://*.r2.cloudflarestorage.com",
          "https://resources.devopsnotes.org",
          'https://blog.devopsnotes.org',
          'https://www.devopsnotes.org', 
        ],
        connectSrc: [
          "'self'",
          "https://*.cloudflare.com",
          "https://resources.devopsnotes.org",
          'https://blog.devopsnotes.org',
          'https://www.devopsnotes.org',
          'https://devopsnotes.org', 
          "wss://devopsnotes.org",
          "wss://*.devopsnotes.org",
        ],
        upgradeInsecureRequests: null, 
      }
    },
  })
);

// --- ROUTES API ---
app.use('/api', uploadRoutes); // ROUTE IMAGES R2
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/seo', seoRoutes);

// --- Monitoring erreurs avec Sentry ---
Sentry.setupExpressErrorHandler(app);

app.get("/api/debug-sentry", (req, res) => {
  throw new Error("Test Sentry Kamal - " + new Date().toISOString());
});

// --- LOGIQUE SOCKET.IO ---

io.on('connection', (socket) => {
  // 1. RÉCUPÉRATION DU TOKEN DEPUIS LES COOKIES
  // Le frontend utilise des cookies HTTP-Only pour le token
  const cookies = cookie.parse(socket.handshake.headers.cookie || '');
  const token = cookies.token; 
  
  let userData: any = null;

  try {
    if (token) {
      userData = jwt.verify(token, process.env.JWT_SECRET || 'votre_cle_secrete');
    }
  } catch (err) {
    console.log('⚠️ Token invalide ou expiré');
  }

  socket.on('chat:join', (room) => {
    socket.join(room);
  });

  socket.on('chat:message', async (data) => {
    try {
      // 2. SÉCURITÉ : On bloque si l'utilisateur n'est pas authentifié
      if (!userData || !userData.id) {
        console.log('🚫 Message refusé : utilisateur non connecté');
        return;
      }

      // 3. SAUVEGARDE DANS MONGODB (format author)
      const newMessage = new Message({
        room: data.room,
        text: data.text,
        author: userData.id, 
        at: new Date()
      });

      await newMessage.save();

      // 4. POPULATE & BROADCAST
      const populated = await Message.findById(newMessage._id)
        .populate('author', 'pseudo avatarUrl');

      if (populated) {
        
        const messageToBroadcast = {
          room: populated.room,
          text: populated.text,
          fromPseudo: (populated.author as any).pseudo,
          fromAvatar: (populated.author as any).avatarUrl,
          at: populated.at.toISOString()
        };

        io.to(data.room).emit('chat:message', messageToBroadcast);
      }
    } catch (err) {
      console.error('❌ Erreur sauvegarde socket:', err);
    }
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