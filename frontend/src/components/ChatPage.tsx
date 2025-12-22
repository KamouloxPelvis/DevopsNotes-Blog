import { useEffect, useState, FormEvent } from 'react';
import { getChatSocket } from '../api/chatSocket';
import { useToast } from '../context/ToastContext';
import '../styles/ChatPage.css';

type ChatMessage = {
  room: string;
  text: string;
  fromId?: string;
  fromPseudo?: string;
  at: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [room, setRoom] = useState('General');
  const { showToast } = useToast();

  useEffect(() => {
    const socket = getChatSocket();
    setMessages([]);

    const controller = new AbortController();

    async function loadHistory() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/chat/messages?room=${room}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          console.error('Error loading history:', res.status);
          showToast({
            type: 'error',
            message: 'Failed to load chat history.',
          });
          return;
        }
        const data: ChatMessage[] = await res.json();
        setMessages(data);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error('Error loading history', e);
          showToast({
            type: 'error',
            message: 'Failed to load chat history.',
          });
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

        // écouter une erreur socket globale
    const errorHandler = (err: any) => {
      console.error('Socket error:', err);
      showToast({
        type: 'error',
        message: 'Chat connection error. Messages may not be delivered.',
      });
    };
    socket.on('connect_error', errorHandler);
    socket.on('error', errorHandler);

    return () => {
      controller.abort();
      socket.off('chat:message', handler);
    };
  }, [room, showToast]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const socket = getChatSocket();
    socket.emit('chat:message', { room, text: trimmed });
    setText('');
    try {
      socket.emit('chat:message', { room, text: trimmed });
      setText('');
    } catch (err) {
      console.error('Send message error:', err);
      showToast({
        type: 'error',
        message: 'Failed to send message.',
      });
    }
  }

  // TODO: récupère le pseudo courant dans ton auth context si tu veux un isMe fiable
  const currentPseudo = 'Administrator';

  return (
    <div className="page-card chat-container">
      <h1 className="page-title">Chat rooms</h1>

      <div className="chat-header">
        <div>
          <label htmlFor="room-select" className="chat-header-label">
            Room:
          </label>
          <select
            id="room-select"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="chat-room-select"
          >
            <option value="General">General</option>
            <option value="DevOps Room">DevOps Room</option>
            <option value="Relax">Relax room</option>
          </select>
        </div>

        <span className="chat-header-hint">
          Messages are public in the selected room
        </span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            No messages yet in #{room}. Start the conversation!
          </div>
        )}

        {messages.map((m, idx) => {
          const isMe = m.fromPseudo === currentPseudo;
          return (
            <div
              key={idx}
              className={
                'chat-message-row ' + (isMe ? 'me' : 'other')
              }
            >
              <div
                className={
                  'chat-bubble ' + (isMe ? 'me' : 'other')
                }
              >
                <div className="chat-bubble-header">
                  <span
                    className={
                      'chat-bubble-author ' + (isMe ? 'me' : 'other')
                    }
                  >
                    {m.fromPseudo ?? 'anonymous'}
                  </span>
                  <span
                    className={
                      'chat-bubble-time ' + (isMe ? 'me' : 'other')
                    }
                  >
                    {new Date(m.at).toLocaleTimeString()}
                  </span>
                </div>
                <div>{m.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="chat-input-row">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message #${room}`}
            className="chat-input"
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ paddingInline: '1rem' }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
