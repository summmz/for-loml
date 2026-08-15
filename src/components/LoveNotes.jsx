import React, { useEffect, useState } from 'react';

// Pre-written notes from him — add/edit freely, they unlock one per day.
const notesFromHim = [
  "hey jaanu... just wanted you to know I'm thinking about you rn 🤍",
  "you don't say it but I know when you're having a rough day. I see you. I'm proud of you.",
  "reminder: you're doing better than you think you are 🫂",
  "I made this dumb app because I wanted a way to bug you even when I'm busy. worth it.",
  "if today's hard, that's okay. text me, or just yell into this app, I'll see it eventually 😭",
  "you make ordinary days feel like less of a grind. thank you for that.",
  "I'm bad at saying this stuff out loud so here it is in writing: I really really like you.",
  "whatever's stressing you out rn — it's temporary. you're not.",
  "this is just a note to say good morning / good night, whichever it is when you're reading this 🤍",
  "I'm grateful for you more than my texting habits probably show lol 💋",
];

const NOTES_KEY = 'nini_notes_state';

const loadNotesState = () => {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { unlocked: 1, lastUnlockDay: null, seen: 0, sent: [] };
};

const saveNotesState = (s) => {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(s));
  } catch {}
};

// Call once per app load — unlocks the next note if a new day has started.
export const maybeUnlockDailyNote = () => {
  const s = loadNotesState();
  const today = new Date().toDateString();
  if (s.lastUnlockDay !== today && s.unlocked < notesFromHim.length) {
    s.unlocked += 1;
    s.lastUnlockDay = today;
    saveNotesState(s);
  } else if (s.lastUnlockDay === null) {
    s.lastUnlockDay = today;
    saveNotesState(s);
  }
  return s;
};

export const getUnreadNoteCount = () => {
  const s = loadNotesState();
  return Math.max(0, s.unlocked - s.seen);
};

const LoveNotes = ({ isOpen, onClose, ntfyTopic }) => {
  const [tab, setTab] = useState('from-him');
  const [state, setState] = useState(loadNotesState);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Mark unlocked notes as "seen" once she actually opens that tab
  useEffect(() => {
    if (isOpen && tab === 'from-him' && state.seen < state.unlocked) {
      const next = { ...state, seen: state.unlocked };
      setState(next);
      saveNotesState(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tab]);

  if (!isOpen) return null;

  const unlockedNotes = notesFromHim.slice(0, state.unlocked);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const title = encodeURIComponent('left you a note 💌');
      await fetch(`https://ntfy.sh/${ntfyTopic}?title=${title}&tags=love_letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: text,
      });
    } catch {
      // still save it locally even if the network request fails
    }
    const next = { ...state, sent: [{ text, at: Date.now() }, ...state.sent].slice(0, 30) };
    setState(next);
    saveNotesState(next);
    setDraft('');
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };

  return (
    <div className="nini-modal-overlay" onClick={onClose}>
      <div className="nini-modal-card notes-card" onClick={(e) => e.stopPropagation()}>
        <h2>Notes 💌</h2>
        <p className="modal-sub">Little things, saved for you two.</p>

        <div className="notes-tabs">
          <button
            className={`notes-tab ${tab === 'from-him' ? 'active' : ''}`}
            onClick={() => setTab('from-him')}
          >
            From him
          </button>
          <button
            className={`notes-tab ${tab === 'to-him' ? 'active' : ''}`}
            onClick={() => setTab('to-him')}
          >
            Leave a note
          </button>
        </div>

        {tab === 'from-him' ? (
          <div className="notes-list">
            {unlockedNotes
              .slice()
              .reverse()
              .map((text, i) => (
                <div key={i} className="note-bubble">
                  {text}
                </div>
              ))}
            {state.unlocked < notesFromHim.length && (
              <p className="notes-hint">A new note unlocks tomorrow 🤍</p>
            )}
          </div>
        ) : (
          <div className="notes-compose">
            <p className="modal-sub" style={{ marginBottom: 10 }}>
              He'll get this as a real notification.
            </p>
            <textarea
              className="notes-textarea"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Say something for him to find..."
              maxLength={300}
              rows={4}
            />
            <button
              className="modal-save-btn"
              onClick={handleSend}
              disabled={!draft.trim() || sending}
            >
              {sending ? 'Sending...' : sent ? 'Sent 💌' : 'Send 💌'}
            </button>

            {state.sent.length > 0 && (
              <div className="notes-sent-history">
                <p className="notes-hint">Sent before:</p>
                {state.sent.slice(0, 5).map((n, i) => (
                  <div key={i} className="note-bubble sent">
                    {n.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button className="modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default LoveNotes;
