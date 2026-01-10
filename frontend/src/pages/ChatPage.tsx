import { useEffect, useState, FormEvent, useRef } from 'react';
import { getChatSocket } from '../api/chatSocket';
import { useToast } from '../context/ToastContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ChatPage.css';

type ChatMessage = {
  room: string;
  text: string;
  fromId?: string;
  fromPseudo?: string;
  fromAvatar?: string;
  at: string;
};

export default function ChatPage() {
  // --- 1. HOOKS TOUJOURS EN PREMIER ---
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [room, setRoom] = useState('General');
  const { showToast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';
  const R2_PUBLIC_URL = 'https://resources.devopsnotes.org';

  // --- 2. LOGIQUE DE SCROLL ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- 3. LOGIQUE DU SOCKET ET DE L'HISTORIQUE ---
  useEffect(() => {
    // On ne lance le socket que si l'utilisateur est chargé et connecté
    if (loading || !user) return;

    const socket = getChatSocket();
    setMessages([]);
    const controller = new AbortController();

    async function loadHistory() {
      try {
        const res = await fetch(
          `${API_URL}/chat/messages?room=${room}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('History failed');
        const data: ChatMessage[] = await res.json();
        setMessages(data);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          showToast({ type: 'error', message: 'Impossible de charger l\'historique.' });
        }
      }
    }

    loadHistory();
    socket.emit('chat:join', room);

    const handler = (msg: ChatMessage) => {
      if (msg.room === room) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('chat:message', handler);

    return () => {
      controller.abort();
      socket.off('chat:message', handler);
    };
  }, [room, user, loading, showToast, API_URL]);

  // --- 4. GESTION DES AFFICHAGES CONDITIONNELS (Après les Hooks) ---
  if (loading) {
    return <div className="chat-loading">Vérification de la session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Ici, 'user' est garanti d'exister
  const currentPseudo = user.pseudo;

  // --- 5. FONCTIONS UTILITAIRES ---
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayMonthYear = new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
    const hoursMinutes = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return ` - ${dayMonthYear} ${hoursMinutes}`;
  };

  const getAvatarSrc = (m: ChatMessage) => {
    if (m.fromAvatar) {
      return m.fromAvatar.startsWith('http') 
        ? m.fromAvatar 
        : `${R2_PUBLIC_URL}/${m.fromAvatar}`;
    }
    const initials = encodeURIComponent(m.fromPseudo || '?');
    return `https://ui-avatars.com/api/?name=${initials}&background=2563eb&color=fff`;
  };

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !user) return;

    const socket = getChatSocket();
    // On envoie l'ID de l'auteur pour que le backend enregistre correctement le message
    socket.emit('chat:message', { 
      room, 
      text: trimmed,
      author: user.id 
    });
    setText('');
  }

  // --- 6. LE RENDU JSX ---
  return (
    <div className="chat-page-wrapper">
      {/* Sidebar : Navigation entre les salons */}
      <div className="chat-sidebar">
        <button 
          aria-label="Retour aux articles" 
          className="back-btn" 
          onClick={() => navigate('/articles')}
        >
          ← Retour
        </button>
        <h3>Salons</h3>
        <div className="room-list">
          {['General', 'DevOps Room', 'Relax'].map((r) => (
            <button 
              key={r} 
              className={`room-item ${room === r ? 'active' : ''}`}
              onClick={() => setRoom(r)}
            >
              # {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        <header className="chat-main-header">
          <h2>#{room}</h2>
          <span className="user-info">
            Connecté en tant que <strong>{currentPseudo}</strong>
          </span>
        </header>

        {/* 3/ Conteneur des messages avec gestion du scroll */}
        <div className="chat-messages-container">
          {messages.length === 0 && (
            <div className="chat-empty">Aucun message ici. Soyez le premier !</div>
          )}
          
          {messages.map((m, idx) => {
            // 2/ Détermination si le message vient de l'utilisateur connecté
            const isMe = m.fromPseudo === currentPseudo;
            return (
              <div key={idx} className={`message-row ${isMe ? 'is-me' : ''}`}>
                <img 
                  src={getAvatarSrc(m)} 
                  alt={m.fromPseudo} 
                  className="message-avatar-img" 
                />
                
                <div className="message-content">
                  <div className="message-info">
                    <span className="message-author">{m.fromPseudo}</span>
                    <span className="message-time-full">
                      {formatFullDate(m.at)}
                    </span>
                  </div>
                  <div className="message-text">{m.text}</div>
                </div>
              </div>
            );
          })}
          {/* Ancre pour le scroll automatique vers le bas */}
          <div ref={messagesEndRef} />
        </div>

        {/* 1/ Zone d'input améliorée avec boutons de fonctionnalités */}
        <div className="chat-input-wrapper">
          <form className="chat-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Envoyer un message dans #${room}`}
            />
            <button 
              aria-label="Envoyer le message" 
              type="submit" 
              className="send-btn" 
              disabled={!text.trim()}
            >
              Envoyer
            </button>
          </form>

          {/* Barre d'actions sous l'input pour l'UX */}
          <div className="chat-input-actions">
            <button type="button" className="action-btn" title="Émojis">😊</button>
            <button type="button" className="action-btn" title="Joindre un fichier">📎</button>
            <button type="button" className="action-btn" title="Code snippet">{'< >'}</button>
            <button type="button" className="action-btn" title="Mentionner">@</button>
          </div>
        </div>
      </div>
    </div>
  )};