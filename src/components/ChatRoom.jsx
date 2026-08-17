import React, { useState, useEffect, useRef } from 'react';
import { ref, push, onValue, off } from 'firebase/database';
import { db } from '../firebase';

const MESSAGES_KEY = 'nini_chat_identity';

const loadIdentity = () => {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const saveIdentity = (identity) => {
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(identity));
  } catch {}
};

const generateUid = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36);

const ChatRoom = ({ isOpen, onClose }) => {
  const [identity, setIdentity] = useState(loadIdentity);
  const [nameInput, setNameInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Real-time listener
  useEffect(() => {
    if (!isOpen || !identity) return;

    const msgsRef = ref(db, 'chat_messages');

    const unsubscribe = onValue(msgsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setMessages([]);
        return;
      }
      const list = Object.entries(data).map(([id, msg]) => ({ id, ...msg }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setMessages(list);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });

    return () => off(msgsRef, 'value', unsubscribe);
  }, [isOpen, identity]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && identity) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, identity]);

  const handlePickName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const id = { uid: generateUid(), name: trimmed };
    saveIdentity(id);
    setIdentity(id);
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft('');
    try {
      await push(ref(db, 'chat_messages'), {
        text,
        uid: identity.uid,
        senderName: identity.name,
        createdAt: Date.now(),
      });
    } catch (err) {
      console.error('Chat send error:', err);
      setDraft(text);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  // Name picker screen
  if (!identity) {
    return (
      <div className="nini-modal-overlay" onClick={onClose}>
        <div className="nini-modal-card chatroom-card" onClick={(e) => e.stopPropagation()}>
          <h2>Chat 💬</h2>
          <p className="modal-sub">Pick a name so they know it's you.</p>
          <input
            className="field-input"
            type="text"
            placeholder="Your name..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePickName()}
            maxLength={20}
            autoFocus
          />
          <button
            className="modal-save-btn"
            onClick={handlePickName}
            disabled={!nameInput.trim()}
          >
            Let's chat 💬
          </button>
          <button className="modal-close-btn" onClick={onClose}>
            Nevermind
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nini-modal-overlay" onClick={onClose}>
      <div className="nini-modal-card chatroom-card" onClick={(e) => e.stopPropagation()}>
        <div className="chatroom-header">
          <h2>Chat 💬</h2>
          <button className="chatroom-change-name" onClick={() => {
            setIdentity(null);
            setNameInput('');
          }}>
            Change name
          </button>
        </div>

        <div className="chatroom-messages">
          {messages.length === 0 && (
            <p className="chatroom-empty">Say something... the conversation starts here 🤍</p>
          )}
          {messages.map((msg) => {
            const isMe = msg.uid === identity.uid;
            return (
              <div
                key={msg.id}
                className={`chatroom-bubble ${isMe ? 'mine' : 'theirs'}`}
              >
                {!isMe && <span className="chatroom-sender">{msg.senderName}</span>}
                <span className="chatroom-text">{msg.text}</span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatroom-input-bar">
          <input
            ref={inputRef}
            className="chatroom-input"
            type="text"
            placeholder="Type a message..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            maxLength={500}
          />
          <button
            className="chatroom-send"
            onClick={handleSend}
            disabled={!draft.trim() || sending}
          >
            ↑
          </button>
        </div>

        <button className="modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
