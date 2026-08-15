// Lets notes sent from your end show up in her app in real time, without
// waiting for a code deploy. Uses ntfy.sh — the same free service the
// "I need you" button and "Leave a note" tab already use — but on its own
// topic, so what she sends to you and what you send to her never cross.
//
// How you actually send one, no code required:
//   - open public/send-note.html (works as a standalone page, see that file), or
//   - open https://ntfy.sh/<your topic> in any browser and publish a message, or
//   - use the official ntfy app/CLI to publish to the same topic
//
// Her app polls this topic on load and periodically after that, so a note
// generally shows up within a couple minutes without her doing anything.

const SINCE_KEY = 'nini_live_notes_since';
const STATE_KEY = 'nini_live_notes_state';
const MAX_STORED = 50;

const loadState = () => {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { notes: [], seen: 0 };
};

const saveState = (s) => {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(s));
  } catch {}
};

const getSince = () => {
  try {
    const v = localStorage.getItem(SINCE_KEY);
    if (v) return v;
  } catch {}
  // First run ever: only pick up the last 24h of history on this topic,
  // not however far back ntfy.sh happens to cache it.
  return '24h';
};

const setSince = (unixSeconds) => {
  try {
    localStorage.setItem(SINCE_KEY, String(unixSeconds));
  } catch {}
};

/**
 * Polls the topic for anything new, merges it into local state, and returns
 * the updated state ({ notes, seen }). Fails quietly on any network hiccup
 * or missing topic — never throws, never blocks the rest of the app.
 */
export async function pollLiveNotes(topic) {
  if (!topic) return loadState();
  try {
    const since = getSince();
    const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=${since}`);
    if (!res.ok) return loadState();
    const text = await res.text();
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    const state = loadState();
    const existingIds = new Set(state.notes.map((n) => n.id));
    let latestTime = 0;

    for (const line of lines) {
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        continue;
      }
      if (msg.event !== 'message' || !msg.message) continue;
      if (msg.time) latestTime = Math.max(latestTime, msg.time);
      if (existingIds.has(msg.id)) continue;
      state.notes.push({
        id: msg.id,
        text: msg.message,
        time: (msg.time || Date.now() / 1000) * 1000,
      });
    }

    if (latestTime) setSince(latestTime + 1);
    if (state.notes.length > MAX_STORED) {
      const trimmed = state.notes.length - MAX_STORED;
      state.notes = state.notes.slice(trimmed);
      state.seen = Math.max(0, state.seen - trimmed);
    }
    saveState(state);
    return state;
  } catch {
    return loadState();
  }
}

export const getLiveNotesState = loadState;

export const markLiveNotesSeen = () => {
  const s = loadState();
  const next = { ...s, seen: s.notes.length };
  saveState(next);
  return next;
};

export const getUnreadLiveNoteCount = () => {
  const s = loadState();
  return Math.max(0, s.notes.length - s.seen);
};
