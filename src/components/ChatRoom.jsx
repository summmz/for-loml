import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limitToLast,
  serverTimestamp,
} from 'firebase/firestore';
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
  const unsubRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Real-time listener
  useEffect(() => {
    if (!isOpen || !identity) return;

    const q = query(
      collection(db, 'chat_messages'),
      orderBy('createdAt'),
      limitToLast(100)
    );

    unsubRef.current = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(scrollToBottom, 50);
    });

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [isOpen, identity, scrollToBottom]);

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
      await addDoc(collection(db, 'chat_messages'), {
        text,
        uid: identity.uid,
        senderName: identity.name,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Chat send error:', err);
      setDraft(text);
    } finally {
      setSending(false);
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
