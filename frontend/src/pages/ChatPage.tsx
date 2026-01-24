import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { getChatSocket } from '../api/chatSocket';
import { useAuth } from '../context/AuthContext';
import '../styles/ChatPage.css';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeRoom, setActiveRoom] = useState('Général');
  const [rooms] = useState(['Général', 'Salon DevOps | DevSecOps', 'Relax']);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const socket = getChatSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- CONFIGURATION R2 (Frontend uniquement) ---
  const R2_PUBLIC_URL = "https://resources.devopsnotes.org";

  const commonEmojis = ['😊', '😂', '🚀', '🔥', '💻', '👍', '🙌', '🤔', '✅', '❌'];

  // --- LOGIQUE SOCKET & HISTORY ---
  useEffect(() => {
    socket.emit('chat:join', activeRoom);

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`https://devopsnotes.org/api/chat/messages?room=${activeRoom}`, { 
          withCredentials: true 
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Erreur historique:", err);
      }
    };
    fetchHistory();

    const handleNewMessage = (msg: any) => {
      if (msg.room === activeRoom) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('chat:message', handleNewMessage);
    return () => { socket.off('chat:message', handleNewMessage); };
  }, [activeRoom, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- ACTIONS ---
  const handleSend = () => {
    if (!inputValue.trim()) return;
    socket.emit('chat:message', { room: activeRoom, text: inputValue });
    setInputValue('');
    setShowEmojiPicker(false);
  };

  const insertCodeBlock = () => {
    setInputValue(prev => `${prev}\` \``);
  };

  const addEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  /*const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'attachments');

    try {
      const res = await axios.post('https://devopsnotes.org/api/upload', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // On construit l'URL complète ici pour le message
      const uploadedImageUrl = `${R2_PUBLIC_URL}/${res.data.imageUrl || res.data.url}`;
      socket.emit('chat:message', { room: activeRoom, text: uploadedImageUrl });
    } catch (err) {
      console.error("Upload failed", err);
    }
  };*/

  const handleMentionClick = () => {
    setInputValue(prev => prev + '@');
    // Optionnel : on redonne le focus à l'input après le clic
    const inputElement = document.querySelector('.chat-input-area input') as HTMLInputElement;
    inputElement?.focus();
  };

  const handleRoomChange = (room: string) => {
  setActiveRoom(room);
  setIsSidebarOpen(false); // Ferme la sidebar sur mobile après sélection
};

  return (
    <div className="chat-page-wrapper">

      {/* Bouton Toggle Mobile (uniquement visible sur mobile) */}
      <button className="mobile-room-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? '✕ Fermer' : '# Salons'}
      </button>

      <aside className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <button className="back-btn" onClick={() => window.history.back()}>← Retour</button>
      <h3>Salons</h3>
      {rooms.map(room => (
        <button 
          key={room}
          className={`room-item ${activeRoom === room ? 'active' : ''}`}
          onClick={() => handleRoomChange(room)} // Utilise la nouvelle fonction
        >
            # {room}
          </button>
        ))}
      </aside>

      <main className="chat-main">
        <header className="chat-main-header">
          <h2>#{activeRoom}</h2>
          <span className="message-time-full">Connecté en tant que {user?.pseudo || 'Invité'}</span>
        </header>

        <div className="chat-messages-container">
          {messages.length === 0 && <div className="chat-empty">Aucun message dans ce salon...</div>}
          {messages.map((m, idx) => {
            // LOGIQUE DE RÉPARATION DE L'URL AVATAR
            const avatarPath = m.fromAvatar;
            const fullAvatarUrl = avatarPath && avatarPath.startsWith('http') 
              ? avatarPath 
              : avatarPath 
                ? `${R2_PUBLIC_URL}/${avatarPath}` 
                : '/default-avatar.png';

            return (
              <div key={idx} className={`message-row ${m.fromPseudo === 'Greg_Devops' ? 'is-me' : ''}`}>
                <img 
                  src={fullAvatarUrl} 
                  alt="avatar" 
                  className="message-avatar-img" 
                  onError={(e) => {(e.target as HTMLImageElement).src = '/default-avatar.png'}}
                />
                <div className="message-content">
                  <div className="message-info">
                    <span className="message-author">{m.fromPseudo}</span>
                    <span className="message-time-full">{new Date(m.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="message-text">
                    {/* Détection basique pour afficher les images uploadées */}
                    {m.text.startsWith('http') && m.text.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                      <img src={m.text} alt="upload" className="chat-inline-img" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '5px' }} />
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-wrapper">
          {showEmojiPicker && (
            <div className="emoji-picker-popup">
              {commonEmojis.map(emoji => (
                <span key={emoji} onClick={() => addEmoji(emoji)} style={{ cursor: 'pointer' }}>{emoji}</span>
              ))}
            </div>
          )}

          <div className="chat-input-area">
            {/*<input 
              type="file" 
              ref={fileInputRef} 
             {style={{ display: 'none' }} 
              onChange={handleFileUpload} 
              accept="image/*"
            />*/}
            <input 
              type="text" 
              placeholder={`Envoyer un message dans #${activeRoom}`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="send-btn" onClick={handleSend}>Envoyer</button>
          </div>

          <div className="chat-input-actions">
            <button className="action-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
            <button className="action-btn" onClick={() => fileInputRef.current?.click()}>📎</button>
            <button className="action-btn" onClick={insertCodeBlock}>{"< >"}</button>
            <button className="action-btn" onClick={handleMentionClick}>@</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;