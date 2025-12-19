import { useEffect, useState, FormEvent } from 'react';
import { getChatSocket } from '../api/chatSocket';

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
  const [room, setRoom] = useState('general');

  useEffect(() => {
    const socket = getChatSocket();

    socket.emit('chat:join', room);

    const handler = (msg: ChatMessage) => {
      if (msg.room === room) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('chat:message', handler);

    return () => {
      socket.off('chat:message', handler);
    };
  }, [room]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const socket = getChatSocket();
    socket.emit('chat:message', { room, text: trimmed });
    setText('');
  }

  return (
    <div className="page-card">
      <h1>Chat rooms</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Room:
          <select value={room} onChange={(e) => setRoom(e.target.value)}>
            <option value="general">general</option>
            <option value="devops">devops</option>
            <option value="random">random</option>
          </select>
        </label>
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '0.75rem',
          marginBottom: '0.75rem',
          maxHeight: 300,
          overflowY: 'auto',
        }}
      >
        {messages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: '0.35rem', fontSize: '0.9rem' }}>
            <strong>{m.fromPseudo ?? 'anonymous'}</strong>{' '}
            <span style={{ color: '#6b7280' }}>
              [{new Date(m.at).toLocaleTimeString()}]
            </span>{' '}
            : {m.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message #${room}`}
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </div>
  );
}
