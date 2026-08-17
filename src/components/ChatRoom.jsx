import React, { useState, useEffect, useRef } from 'react';
import { ref as dbRef, push, onValue, off, set, get } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

const IDENTITY_KEY = 'nini_chat_identity';
const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👍'];

const loadIdentity = () => {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const saveIdentity = (identity) => {
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch {}
};

const generateUid = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36);

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        let w = img.width;
        let h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round((h / w) * MAX); w = MAX; }
          else { w = Math.round((w / h) * MAX); h = MAX; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        }, 'image/jpeg', 0.7);
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });

const REPLY_SWIPE_THRESHOLD = 80;

const ChatRoom = ({ isOpen, onClose }) => {
  const [identity, setIdentity] = useState(loadIdentity);
  const [nameInput, setNameInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [otherLastSeen, setOtherLastSeen] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [swipeState, setSwipeState] = useState({ msgId: null, offset: 0, isMine: false });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const swipeRef = useRef({ active: false, msgId: null, startX: 0, startY: 0, locked: false, offset: 0, msg: null });

  // Real-time listener + read status tracking
  useEffect(() => {
    if (!isOpen || !identity) return;

    const msgsRef = dbRef(db, 'chat_messages');
    const readStatusRef = dbRef(db, 'chat_read_status');

    set(dbRef(db, `chat_read_status/${identity.uid}/lastSeenAt`), Date.now());

    const unsubRead = onValue(readStatusRef, (snap) => {
      const data = snap.val();
      if (!data) { setOtherLastSeen(null); return; }
      const other = Object.entries(data).find(([uid]) => uid !== identity.uid);
      setOtherLastSeen(other ? other[1]?.lastSeenAt : null);
    });

    const unsubscribe = onValue(msgsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) { setMessages([]); return; }
      const list = Object.entries(data).map(([id, msg]) => ({ id, ...msg }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setMessages(list);

      list.forEach((msg) => {
        if (msg.uid !== identity.uid && !msg.deleted && !(msg.readBy && msg.readBy[identity.uid])) {
          set(dbRef(db, `chat_messages/${msg.id}/readBy/${identity.uid}`), Date.now());
        }
      });

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });

    return () => {
      off(msgsRef, 'value', unsubscribe);
      off(readStatusRef, 'value', unsubRead);
    };
  }, [isOpen, identity]);

  useEffect(() => {
    if (isOpen && identity) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen, identity]);

  // Dismiss context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const dismiss = (e) => {
      if (e.target.closest('.chatroom-context-menu')) return;
      setContextMenu(null);
    };
    const timer = setTimeout(() => {
      document.addEventListener('click', dismiss);
      document.addEventListener('contextmenu', dismiss);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', dismiss);
      document.removeEventListener('contextmenu', dismiss);
    };
  }, [contextMenu]);

  const handlePickName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const id = { uid: generateUid(), name: trimmed };
    saveIdentity(id);
    setIdentity(id);
  };

  // --- Message actions ---

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX || 100, window.innerWidth - 290);
    const y = Math.max(8, (e.clientY || 200) - 90);
    setContextMenu({ msgId: msg.id, isMine: msg.uid === identity.uid, msg, x, y });
  };

  // Unified pointer handlers: swipe-to-reply + long-press for context menu
  const handlePointerDown = (e, msg) => {
    swipeRef.current = {
      active: true, msgId: msg.id, startX: e.clientX, startY: e.clientY,
      locked: false, offset: 0, msg,
    };

    longPressTimerRef.current = setTimeout(() => {
      const s = swipeRef.current;
      if (s.locked) return;
      s.active = false;
      const x = Math.min(e.clientX, window.innerWidth - 290);
      const y = Math.max(8, e.clientY - 90);
      setContextMenu({ msgId: msg.id, isMine: msg.uid === identity.uid, msg, x, y });
    }, 500);

    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };

  const handlePointerMove = (e) => {
    const s = swipeRef.current;
    if (!s.active) return;

    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;

    if (!s.locked) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        s.locked = true;
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      } else if (Math.abs(dy) > 8) {
        s.active = false;
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
        return;
      }
    }

    if (s.locked) {
      const isMine = s.msg.uid === identity.uid;
      const offset = isMine
        ? Math.min(0, Math.max(-150, dx))
        : Math.max(0, Math.min(150, dx));
      s.offset = offset;
      setSwipeState({ msgId: s.msgId, offset, isMine });
    }
  };

  const handlePointerUp = (e) => {
    const s = swipeRef.current;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

    if (s.locked && Math.abs(s.offset) >= REPLY_SWIPE_THRESHOLD) {
      handleReply(s.msg);
    }

    s.active = false;
    s.locked = false;
    s.offset = 0;
    setSwipeState({ msgId: null, offset: 0, isMine: false });

    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  const handleUnsend = async (msgId) => {
    setContextMenu(null);
    try {
      await set(dbRef(db, `chat_messages/${msgId}/deleted`), true);
    } catch (err) {
      console.error('Unsend error:', err);
    }
  };

  const handleReact = async (msgId, emoji) => {
    setContextMenu(null);
    const path = `chat_messages/${msgId}/reactions/${emoji}/${identity.uid}`;
    try {
      const snap = await get(dbRef(db, path));
      if (snap.exists()) {
        await set(dbRef(db, path), null);
      } else {
        await set(dbRef(db, path), true);
      }
    } catch (err) {
      console.error('React error:', err);
    }
  };

  const handleReply = (msg) => {
    setContextMenu(null);
    setReplyTo({
      id: msg.id,
      text: msg.text || (msg.media ? `[${msg.media.type === 'image' ? 'Photo' : 'Video'}]` : ''),
      senderName: msg.senderName,
    });
    inputRef.current?.focus();
  };

  // --- Media ---

  const handleMediaSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('File too large (max 20MB)');
      e.target.value = '';
      return;
    }
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    const preview = URL.createObjectURL(file);
    setMediaPreview({ file, preview, type });
    e.target.value = '';
  };

  const removeMediaPreview = () => {
    if (mediaPreview?.preview) URL.revokeObjectURL(mediaPreview.preview);
    setMediaPreview(null);
  };

  const uploadMedia = async (file, type) => {
    const ext = type === 'video' ? 'mp4' : 'jpg';
    const fileName = `${identity.uid}/${Date.now()}.${ext}`;
    const sRef = storageRef(storage, `chat_media/${fileName}`);
    const snapshot = await uploadBytes(sRef, file);
    return getDownloadURL(snapshot.ref);
  };

  // --- Send ---

  const handleSend = async () => {
    const text = draft.trim();
    if ((!text && !mediaPreview) || sending) return;
    setSending(true);

    const msgData = {
      text: text || null,
      uid: identity.uid,
      senderName: identity.name,
      createdAt: Date.now(),
    };

    if (replyTo) {
      msgData.replyTo = { id: replyTo.id, text: replyTo.text, senderName: replyTo.senderName };
      setReplyTo(null);
    }

    if (mediaPreview) {
      setUploading(true);
      try {
        const file = mediaPreview.type === 'image'
          ? await compressImage(mediaPreview.file)
          : mediaPreview.file;
        const url = await uploadMedia(file, mediaPreview.type);
        msgData.media = { type: mediaPreview.type, url, name: mediaPreview.file.name };
      } catch (err) {
        console.error('Media upload error:', err);
        setSending(false);
        setUploading(false);
        return;
      }
      removeMediaPreview();
      setUploading(false);
    }

    setDraft('');

    try {
      await push(dbRef(db, 'chat_messages'), msgData);
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

  const cancelReply = () => setReplyTo(null);

  if (!isOpen) return null;

  // Name picker
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
          <button className="modal-save-btn" onClick={handlePickName} disabled={!nameInput.trim()}>
            Let's chat 💬
          </button>
          <button className="modal-close-btn" onClick={onClose}>Nevermind</button>
        </div>
      </div>
    );
  }

  return (
    <div className="nini-modal-overlay" onClick={onClose}>
      <div className="nini-modal-card chatroom-card" onClick={(e) => e.stopPropagation()}>
        <div className="chatroom-header">
          <h2>Chat 💬</h2>
          <button className="chatroom-change-name" onClick={() => { setIdentity(null); setNameInput(''); }}>
            Change name
          </button>
        </div>

        <div className="chatroom-messages" onContextMenu={(e) => e.preventDefault()}>
          {messages.length === 0 && (
            <p className="chatroom-empty">Say something... the conversation starts here 🤍</p>
          )}
          {messages.map((msg) => {
            const isMe = msg.uid === identity.uid;

            if (msg.deleted) {
              return (
                <div key={msg.id} className={`chatroom-bubble ${isMe ? 'mine' : 'theirs'} chatroom-unsent`}>
                  <span className="chatroom-unsent-text">🚫 Message unsent</span>
                </div>
              );
            }

            let statusLabel = null;
            if (isMe) {
              const iHaveReadBy = msg.readBy && Object.keys(msg.readBy).length > 0;
              if (iHaveReadBy) {
                const readAt = Object.values(msg.readBy)[0];
                const d = new Date(readAt);
                const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                statusLabel = <span className="chatroom-status seen">Seen {time}</span>;
              } else if (otherLastSeen) {
                statusLabel = <span className="chatroom-status delivered">Delivered</span>;
              } else {
                statusLabel = <span className="chatroom-status sent">Sent</span>;
              }
            }

            const reactionEntries = msg.reactions
              ? Object.entries(msg.reactions).filter(([, users]) => users && Object.keys(users).filter((k) => users[k]).length > 0)
              : [];

            const isSwiping = swipeState.msgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`chatroom-bubble ${isMe ? 'mine' : 'theirs'}${isSwiping ? ' swiping' : ''}`}
                style={isSwiping ? { transform: `translateX(${swipeState.offset}px)` } : undefined}
                onPointerDown={(e) => handlePointerDown(e, msg)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onContextMenu={(e) => handleContextMenu(e, msg)}
              >
                <div
                  className="chatroom-swipe-icon"
                  style={{
                    opacity: isSwiping ? Math.min(1, Math.abs(swipeState.offset) / REPLY_SWIPE_THRESHOLD) : 0,
                  }}
                >
                  ↩
                </div>
                {msg.replyTo && (
                  <div className="chatroom-reply-quote">
                    <span className="reply-quote-name">{msg.replyTo.senderName}</span>
                    <span className="reply-quote-text">{msg.replyTo.text}</span>
                  </div>
                )}

                {!isMe && <span className="chatroom-sender">{msg.senderName}</span>}

                {msg.media && (
                  <div className="chatroom-media">
                    {msg.media.type === 'image' ? (
                      <img src={msg.media.url} alt={msg.media.name || 'Photo'} loading="lazy" />
                    ) : (
                      <video src={msg.media.url} controls preload="metadata" />
                    )}
                  </div>
                )}

                {msg.text && <span className="chatroom-text">{msg.text}</span>}

                {isMe && statusLabel}

                {reactionEntries.length > 0 && (
                  <div className="chatroom-reactions">
                    {reactionEntries.map(([emoji, users]) => {
                      const uids = Object.keys(users).filter((k) => users[k]);
                      const count = uids.length;
                      const iReacted = uids.includes(identity.uid);
                      return (
                        <button
                          key={emoji}
                          className={`chatroom-reaction-pill ${iReacted ? 'reacted' : ''}`}
                          onClick={(e) => { e.stopPropagation(); handleReact(msg.id, emoji); }}
                        >
                          {emoji}{count > 1 && <span className="reaction-count">{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply preview bar */}
        {replyTo && (
          <div className="chatroom-reply-bar">
            <div className="reply-bar-content">
              <span className="reply-bar-label">Replying to {replyTo.senderName}</span>
              <span className="reply-bar-text">{replyTo.text}</span>
            </div>
            <button className="reply-bar-close" onClick={cancelReply}>✕</button>
          </div>
        )}

        {/* Media preview */}
        {mediaPreview && (
          <div className="chatroom-media-preview">
            {mediaPreview.type === 'image' ? (
              <img src={mediaPreview.preview} alt="Preview" />
            ) : (
              <video src={mediaPreview.preview} />
            )}
            <button className="media-preview-remove" onClick={removeMediaPreview}>✕</button>
          </div>
        )}

        <div className="chatroom-input-bar">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="chatroom-file-input"
            onChange={handleMediaSelect}
          />
          <button
            className="chatroom-attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploading}
            title="Attach photo or video"
          >
            +
          </button>
          <input
            ref={inputRef}
            className="chatroom-input"
            type="text"
            placeholder={replyTo ? 'Reply...' : 'Type a message...'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            maxLength={500}
          />
          <button
            className="chatroom-send"
            onClick={handleSend}
            disabled={(!draft.trim() && !mediaPreview) || sending}
          >
            {uploading ? '...' : '↑'}
          </button>
        </div>

        <button className="modal-close-btn" onClick={onClose}>Close</button>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="chatroom-context-overlay" onClick={(e) => { e.stopPropagation(); setContextMenu(null); }} />
          <div
            className="chatroom-context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div className="context-reactions">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="context-reaction-btn"
                  onClick={(e) => { e.stopPropagation(); handleReact(contextMenu.msgId, emoji); }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="context-actions">
              {contextMenu.isMine && (
                <button
                  className="context-action-btn context-unsend"
                  onClick={(e) => { e.stopPropagation(); handleUnsend(contextMenu.msgId); }}
                >
                  Unsend
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatRoom;
