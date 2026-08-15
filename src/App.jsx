import { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import Character from './components/Character';
import StatBars from './components/StatBars';
import Controls from './components/Controls';
import ChatInput from './components/ChatInput';
import CuddleOverlay from './components/CuddleOverlay';
import CallOverlay from './components/CallOverlay';
import FeedDrawer from './components/FeedDrawer';
import MusicPlayer from './components/MusicPlayer';
import DailyCheckinOverlay from './components/DailyCheckinOverlay';
import SurpriseEvent from './components/SurpriseEvent';
import './index.css';
// Optional: reference texts (chat_history.txt is gitignored — works without it)
const chatStyleFiles = import.meta.glob('./assets/chat_history.txt', { query: '?raw', import: 'default', eager: true });
const chatStyle = chatStyleFiles[Object.keys(chatStyleFiles)[0]] || '';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'missing' });


const flirtMessages = [
    "You look really cute today, just saying.",
    "Stop distracting me.",
    "100% chance we should get pizza tonight.",
    "Are you always this pretty, or is today special?",
    "You're my favorite notification.",
    "I'd pause my game for you.",
    "You owe me a kiss for pressing this.",
    "Stop being so adorable, it's illegal.",
    "Vibe check: You passed. Flawlessly.",
    "You know I have a massive crush on you, right?",
    "Come here.",
    "I was just thinking about you.",
    "Your smile is literally unfair.",
    "Can you stop being cute for like, one second?",
    "I bet you look cute reading this.",
    "Thinking about your lips rn.",
    "You're the only person I'd share my food with.",
    "You make me smile just by existing.",
    "You owe me a cuddle.",
    "I kind of want to hold your hand.",
    "You're my favorite distraction.",
    "I could look at you all day.",
    "Stop being so perfect.",
    "You're too cute for your own good.",
    "Are you free later? We need to do nothing together.",
    "Your laugh is my favorite sound.",
    "Just a reminder: you're gorgeous.",
    "You give me butterflies.",
    "I literally can't stop thinking about you.",
    "I want to squish your face.",
    "You're the best part of my day.",
    "I miss you. Come here.",
    "You're kind of amazing, you know that?",
    "Let's stay in bed all day.",
    "You're so pretty it actually hurts.",
    "Send me a selfie, I need a serotonin boost.",
    "I want to kiss you right now.",
    "You're looking real kissable today.",
    "You make my heart do a little happy dance.",
    "Can I just keep you?",
    "I'm obsessed with you.",
    "You're the cutest thing I've ever seen.",
    "I dare you to come over.",
    "You're my favorite problem.",
    "I want all your attention.",
    "You're the only text I actually want to reply to.",
    "I have a big crush on you.",
    "You're dangerously cute.",
    "I just wanted to remind you how cute you are.",
    "I want to lay on your chest.",
    "You're literally glowing.",
    "I'd let you win any argument.",
    "You make me so happy.",
    "Can you come over? Like, right now.",
    "I want to hold you.",
    "You're honestly the best.",
    "I'm staring at my screen smiling like an idiot.",
    "I need some of your time.",
    "You're my happy place.",
    "Let's just cuddle and ignore the world.",
    "You're a 10/10.",
    "I just want to kiss your face.",
    "I love annoying you.",
    "You're too hot, it's distracting.",
    "You're the cutie I was looking for.",
    "I just want to be next to you.",
    "You make my day better.",
    "I'd give you the last slice of pizza.",
    "You're so fun to look at.",
    "I'd travel across the city just for a hug.",
    "I want to trace your jawline.",
    "You're my favorite person to bother.",
    "I'm craving you.",
    "You're literally a work of art.",
    "I want to steal all your hoodies.",
    "You're the main reason I check my phone.",
    "You have no idea how much I like you.",
    "I want to play with your hair.",
    "You make me feel some type of way.",
    "Let's do a movie marathon and cuddle.",
    "You're so attractive it's stupid.",
    "I want to wake up next to you.",
    "You're my absolute favorite.",
    "I need a hug. From you. Now.",
    "You're looking extra cute today.",
    "I just want to hear your voice.",
    "I want to be the reason you smile today.",
    "You're so charming.",
    "I just want to stare at you.",
    "You make my heart race.",
    "I'd pick you over sleep.",
    "You're honestly so precious.",
    "I want to hold you tight.",
    "You're so fine.",
    "I'm lucky to know you.",
    "I just want to be around you.",
    "You're a total vibe.",
    "I want to kiss every part of your face.",
    "You're the only one I see.",
    "I just want to snuggle you.",
    "You're too sweet.",
    "I want to make you smile.",
    "You're so fun to be around.",
    "I'd totally let you steal the covers.",
    "You're honestly my favorite.",
    "I just want to hold you close.",
    "You make me laugh so much.",
    "I want to give you all the kisses.",
    "You're so dreamy.",
    "I just want to be lazy with you.",
    "If you keep this up I'm gonna have to kiss you.",
    "I'm officially requesting your presence.",
    "Why are you so perfect?",
    "I want to fall asleep on you.",
    "You're looking really good.",
    "I just want to hold your face.",
    "You give me the best kind of feeling.",
    "I want to be annoying together.",
    "You're the reason I'm smiling.",
    "I want to take you out.",
    "You're so effortlessly beautiful.",
    "I just want to be near you.",
    "You're my favorite thought.",
    "I want to give you a big squeeze.",
    "You're the cutest.",
    "I want to hear you laugh.",
    "You're so mesmerizing.",
    "I want to kiss you awake.",
    "You're looking extremely huggable.",
    "I want to spend all my time with you.",
    "You're my favorite kind of crazy.",
    "I just want to pull you close.",
    "You're so breathtaking.",
    "I want to be yours.",
    "You're the sweetest thing.",
    "I just want to kiss you soft and slow.",
    "You're looking like a snack.",
    "I want to keep you all to myself.",
    "You're my favorite view.",
    "I just want to hold you in my arms.",
    "You're so lovely.",
    "I want to make you mine.",
    "You're a whole mood.",
    "I just want to kiss those lips.",
    "You're so fascinating.",
    "I want to get lost in your eyes.",
    "You're the best thing ever.",
    "I just want to cuddle you so hard.",
    "You're so alluring.",
    "I want to make you blush."
];

const idleMessages = {
  happy: [
    "Hi 🥺 just checking you're still there.",
    "You're my favourite person, you know that?",
    "Being cute is literally your superpower.",
    "I was just thinking about you. Again.",
    "Still here. Still adorable. How.",
    "Pay attention to me 🥺",
    "Come closer.",
    "Are you even real?",
    "Your presence is enough, honestly.",
    "I don't know what I'd do without you 🤍",
  ],
  love: [
    "You make me so happy I don't know what to do with myself.",
    "I'm in a really good mood and it's entirely your fault.",
    "Being this happy should be illegal.",
    "I just want to hold your hand forever.",
    "You're genuinely everything.",
    "I think about you constantly. It's a problem.",
    "You're the kind of person I'd give up sleep for.",
    "My heart literally goes brr when I see you.",
    "You're too good to be true.",
    "I keep smiling for no reason and it's you. It's always you.",
  ],
  flirty: [
    "I'd let you take the aux cord.",
    "You're looking extra cute right now.",
    "You can't just be this attractive and not expect consequences.",
    "Stop. You're too much.",
    "I'm not staring, you're just very interesting to look at.",
    "You owe me one (1) kiss.",
    "My vibe rn: completely distracted by you.",
    "Just came here to say you're fine. Okay bye.",
    "Your energy is literally illegal.",
    "I'd pause everything just for you.",
  ],
  sad: [
    "I'm so hungry... please feed me 🍕",
    "Hello?? Anyone there?? 😭",
    "I'm running on empty over here.",
    "A little attention would be nice rn...",
    "I'm not crying. Okay I'm crying a little. 😭",
    "Nini needs love. ASAP.",
    "This is neglect. I'm reporting this.",
    "The bars are LOW and so am I.",
    "Feed me and maybe I'll forgive you.",
    "I just want to be taken care of 😔",
  ],
  sleepy: [
    "Zzz... still thinking about you tho.",
    "So sleepy... but you're worth staying awake for.",
    "Half asleep. Still cute. Don't @ me.",
    "Dreaming of us being lazy together.",
    "Let me nap on your shoulder... zzz.",
    "Low energy. Need cuddles.",
    "5 more minutes 😴",
    "The sleep deprivation is real.",
  ],
  neutral: [
    "Just vibing.",
    "Nothing to report. Everything is fine.",
    "Neutral mood. Send snacks.",
    "Just waiting for something fun to happen.",
  ],
};

const faces = {
  happy: '🥺',
  sad: '😭',
  neutral: '😐',
  sleepy: '😴',
  flirty: '😏',
  love: '🥰'
};

const moodAnimations = {
  happy: 'bounce',
  love: 'heartbeat',
  flirty: 'wiggle',
  sad: 'shake',
  sleepy: 'droop',
  neutral: 'shrug',
};

const moodBursts = {
  happy: ['✨', '⭐', '💫', '✨'],
  love: ['💗', '💖', '💘', '💕'],
  flirty: ['😏', '💜', '✨', '💫'],
  sad: ['🥺', '💧', '😢'],
  sleepy: ['💤', '😴', '💤'],
  neutral: ['·', '◦', '·'],
};

const reactionFaces = {
  happy: ['🥺', '😊', '🙂', '😆', '😜', '🤗', '😁'],
  love: ['🥰', '😚', '😘', '🥺', '😊', '🤭'],
  flirty: ['😏', '😉', '😜', '😳', '🤭', '😌'],
  sad: ['😭', '🥹', '😢', '😿', '🥺', '😔'],
  sleepy: ['😴', '🥱', '😪', '😫', '😌'],
  neutral: ['😐', '😑', '🙄', '🤨', '😶'],
};

const getMoodFace = (s) => {
  if (s.hunger < 20 || s.attention < 20 || s.energy < 20) return faces.sad;
  if (s.hunger > 80 && s.attention > 80) return faces.love;
  if (s.attention > 80) return faces.flirty;
  return faces.happy;
};

const touchMessages = {
  happy: [
    "Hehe 😊", "That tickles!", "Again! Again!", "You're my favorite 🥰",
    "Keep going, I like it ✨", "hehehehe", "ok ok you win 😌", "I'm so happy rn",
    "Do it again do it again!", "You make me smile too much", "This is the best part of my day",
    "I could stay like this forever", "you're literally the best", "hehe, don't stop",
    "I love when you do that", "okay that was cute of you", "someone's clingy today~",
    "nope, not complaining", "you always know how to cheer me up", "you're my serotonin boost",
    "this is perfect", "best feeling ever", "I'm giggling like an idiot",
    "stop being so adorable", "more more more", "you spoil me too much", "happy happy happy",
    "I feel 100% again", "you fixed my whole mood", "my favorite person fr",
    "you make everything better", "I'd stay here all day", "okay fine, I'll forgive you for everything",
    "you're dangerous for my heart", "my face hurts from smiling", "keep those hands busy",
    "you're so good to me", "I love this vibe", "best day ever thanks to you", "don't ever stop"
  ],
  love: [
    "Mmm, love you 💗", "Keep doing that...", "This is nice 🥰", "My heart's doing flips 💘",
    "I'm so into you rn", "you're everything to me", "I'd do anything for you",
    "you've got my whole heart", "I think I'm obsessed with you", "you're my home",
    "I feel so safe with you", "you make love easy", "I want to hold you forever",
    "you're the best thing that's happened to me", "I'd wait forever for you",
    "my heart is so full", "I love the way you care", "you're mine and I'm yours",
    "I'd give you everything", "you're my always", "I'm so lucky to have you",
    "you make my heart soft", "I love you more every day", "you're my favorite person in the world",
    "I want to build a life with you", "you're perfect to me", "my heart beats for you",
    "I'd cross oceans for you", "you're my dream come true", "I'm falling for you all over again",
    "you're the reason I believe in love", "I want all of you", "you're my peace",
    "I'd choose you in every life", "you're etched in my heart", "I love everything about you",
    "you're my greatest love", "I'd give up anything for you", "you make me feel so loved",
    "you're my forever person"
  ],
  flirty: [
    "Oh you~ 😏", "Careful, I might fall for you.", "Tempting me? 😏", "Keep touching, I dare you.",
    "You're gonna make me blush", "I like where this is going", "you're too smooth",
    "keep that up and see what happens", "you're trouble, you know that?",
    "I'm not complaining one bit", "you have my full attention now",
    "come closer, I won't bite... maybe", "oh you're bold today", "I like this side of you",
    "you're asking for trouble", "that's a dangerous game you're playing", "I'm hooked on you",
    "you know exactly what you're doing", "keep going, I'm enjoying this",
    "you're making this hard", "I could get used to this", "be careful what you wish for",
    "you started this, now finish it", "I'm yours if you want me", "you're playing with fire",
    "I like the way you touch", "you're so bold, I love it", "don't stop now",
    "I'm into you, if it wasn't obvious", "you're irresistible", "I'd let you get away with anything",
    "watch it, I might kiss you", "you're the prettiest tease", "I like your hands on me",
    "you're too much for me", "I'd lose every game just to watch you win",
    "you're driving me crazy", "I want you all to myself", "you're dangerously charming",
    "say less, come here"
  ],
  sad: [
    "Finally some attention 🥺", "More... please 🥺", "I needed that 😢",
    "don't leave me alone", "I was getting lonely", "please stay with me",
    "I'm not okay without you", "I missed you so much", "that helps a little",
    "keep me company", "I'm fragile rn, be gentle", "you noticed me 🥺",
    "I really needed this", "please don't go", "I feel a bit better now",
    "I was so down", "you always save me", "hold me close", "I hate being alone",
    "thank you for being here", "I'm sad, distract me", "you make it hurt less",
    "stay a little longer", "I need you more than you know", "don't let go",
    "I'm in my feels today", "you're my comfort", "I feel so empty without you",
    "please stay", "I love that you care"
  ],
  sleepy: [
    "Mmm... five more minutes 😴", "Don't stop... sleepy happy 💤", "Zzz... but good zzz.",
    "so sleepy...", "I could fall asleep on you", "too comfy to move",
    "nap time soon... or now", "you make me feel safe enough to sleep",
    "blink blink... why so sleepy", "I'm melting into you", "warm... cozy... zzz",
    "my eyes are heavy", "one more touch and I'm out", "sleepy but happy",
    "I'll sleep so good tonight", "carry me to bed?", "I'm half asleep already",
    "shhh, I'm drifting", "you're my pillow now", "soft... sleepy... content",
    "I don't want to wake up from this", "dreaming of you already", "zzz... this is the best",
    "goodnight energy rn", "I'd sleep in your arms"
  ],
  neutral: [
    "Oh, hi.", "Hello there.", "You poked me!", "Hm?", "that's a thing you did",
    "interesting choice", "okay, noted.", "I see you", "yes? can I help you?",
    "you have my attention", "well, that happened", "I'm here, I guess",
    "oh, you again", "what's up", "mm, okay", "you're persistent", "another one?",
    "sure, why not", "I felt that", "weirdo (affectionate)", "that's a choice",
    "noted and filed", "hm, interesting", "you know I can feel that, right?",
    "okay okay, I'm here"
  ],
};

function App() {
  const [stats, setStats] = useState({ hunger: 50, attention: 50, energy: 50 });
  const [message, setMessage] = useState('');
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [isFlirting, setIsFlirting] = useState(false);
  const [characterFace, setCharacterFace] = useState(faces.happy);
  const [bounce, setBounce] = useState(false);
  const [touchAnim, setTouchAnim] = useState(null);
  const [burstKey, setBurstKey] = useState(0);
  const [actionFace, setActionFace] = useState(null);
  
  const messageTimeoutRef = useRef(null);
  const flirtLastIndexRef = useRef(-1);
  const idleTimerRef = useRef(null);
  const idleLastIndexRef = useRef(-1);
  const currentMoodRef = useRef('happy');
  const chatHistoryRef = useRef([]);
  const touchTimeoutRef = useRef(null);
  const lastTouchRef = useRef(0);
  const touchFaceTimeoutRef = useRef(null);
  const touchLastRef = useRef(null);
  const generatingRef = useRef(false);
  const bounceTimeoutRef = useRef(null);
  const actionFaceTimeoutRef = useRef(null);
  const moodOverrideRef = useRef(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isCuddling, setIsCuddling] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isFeedOpen, setIsFeedOpen] = useState(false);
  const [isDraggingFood, setIsDraggingFood] = useState(false);

  // Derive normal face based on stats, also track current mood
  useEffect(() => {
    if (actionFace) {
      setCharacterFace(actionFace);
      return;
    }
    if (isFlirting) return;

    // Keep the last action's mood/face for a few seconds after pressing a button
    if (moodOverrideRef.current && Date.now() < moodOverrideRef.current.expiresAt) {
      setCharacterFace(moodOverrideRef.current.face);
      currentMoodRef.current = moodOverrideRef.current.mood;
      return;
    }

    let mood = 'happy';
    if (stats.hunger < 20 || stats.attention < 20 || stats.energy < 20) {
      setCharacterFace(faces.sad);
      mood = 'sad';
    } else if (stats.hunger > 80 && stats.attention > 80) {
      setCharacterFace(faces.love);
      mood = 'love';
    } else if (stats.attention > 80) {
      setCharacterFace(faces.flirty);
      mood = 'flirty';
    } else {
      setCharacterFace(faces.happy);
      mood = 'happy';
    }
    currentMoodRef.current = mood;
  }, [stats, isFlirting, actionFace]);

  // Idle timer — shows a mood-appropriate message after 10s of no interaction
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (isFlirting || generatingRef.current) return;
      const mood = currentMoodRef.current;
      const pool = idleMessages[mood] || idleMessages.happy;
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * pool.length);
      } while (newIndex === idleLastIndexRef.current && pool.length > 1);
      idleLastIndexRef.current = newIndex;
      showMessage(pool[newIndex], 5000);
      // Keep sending mood-based messages every 10s while idle
      resetIdleTimer();
    }, 10000);
  };

  // Start idle timer on mount
  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
      if (touchFaceTimeoutRef.current) clearTimeout(touchFaceTimeoutRef.current);
      if (bounceTimeoutRef.current) clearTimeout(bounceTimeoutRef.current);
      if (actionFaceTimeoutRef.current) clearTimeout(actionFaceTimeoutRef.current);
    };
  }, []);

  // Time-of-Day Background Theme
  useEffect(() => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      document.body.classList.remove('theme-morning', 'theme-afternoon', 'theme-evening', 'theme-night');
      if (hour >= 6 && hour < 12) {
        document.body.classList.add('theme-morning');
      } else if (hour >= 12 && hour < 18) {
        document.body.classList.add('theme-afternoon');
      } else if (hour >= 18 && hour < 22) {
        document.body.classList.add('theme-evening');
      } else {
        document.body.classList.add('theme-night');
      }
    };
    
    updateTheme();
    const interval = setInterval(updateTheme, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);



  // Virtual Cuddle accumulation logic
  useEffect(() => {
    if (!isCuddling) return;

    const interval = setInterval(() => {
      setStats(prev => {
        const nextAttention = Math.min(100, prev.attention + 3);
        if (nextAttention >= 100 && prev.attention < 100) {
          showMessage("I'm so warm... love cuddling with you 💋", 3000);
        }
        return {
          ...prev,
          attention: nextAttention
        };
      });
      // Trigger heartbeat animation
      setTouchAnim(null);
      setTimeout(() => setTouchAnim('heartbeat'), 10);
    }, 1200);

    return () => {
      clearInterval(interval);
      setTouchAnim(null);
    };
  }, [isCuddling]);

  // Handle Drag Feed drop
  const handleFeed = (foodEmoji) => {
    resetIdleTimer();
    triggerAnimation();
    
    setTouchAnim('bounce');
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    touchTimeoutRef.current = setTimeout(() => setTouchAnim(null), 900);
    setBurstKey((k) => k + 1);
    
    const showActionFace = (face, mood) => {
      setActionFace(face);
      moodOverrideRef.current = { mood, face, expiresAt: Date.now() + 3000 };
      if (actionFaceTimeoutRef.current) clearTimeout(actionFaceTimeoutRef.current);
      actionFaceTimeoutRef.current = setTimeout(() => setActionFace(null), 2500);
    };

    setStats(prev => {
      const updated = { ...prev };
      updated.hunger = Math.min(100, prev.hunger + 20);
      if (updated.hunger >= 100) {
        showMessage(`I'm full from ${foodEmoji}! now feed me kisses. 💋`);
        showActionFace(faces.flirty, 'flirty');
      } else {
        showMessage(`Yummy ${foodEmoji} 🍕`);
        showActionFace(faces.happy, 'happy');
      }
      return updated;
    });
  };

  // Stat decay interval
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const newStats = {
          hunger: Math.max(0, prev.hunger - 1),
          attention: Math.max(0, prev.attention - 1),
          energy: Math.max(0, prev.energy - 0.5)
        };
        
        if (newStats.hunger === 0 && newStats.attention === 0 && newStats.energy === 0) {
          if (!isMessageVisible) {
             showMessage("I miss you... 😭", 5000);
          }
        }
        return newStats;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [isMessageVisible]);

  const showMessage = (msg, duration = 3000, flirtLock = false) => {
    setMessage(msg);
    setIsMessageVisible(true);
    
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    
    messageTimeoutRef.current = setTimeout(() => {
      setIsMessageVisible(false);
      if (flirtLock) setIsFlirting(false);
      // After message fades, restart the idle timer
      resetIdleTimer();
    }, duration);
  };

  // Cloned-voice TTS: prefer the local Coqui XTTS server, fall back to
  // the browser's built-in speechSynthesis if it's not running.
  const speakNini = async (text) => {
    const serverUrl = import.meta.env.VITE_TTS_SERVER || 'http://127.0.0.1:5001';
    try {
      const res = await fetch(
        `${serverUrl}/tts?text=${encodeURIComponent(text)}&voice=nini.wav`,
        { signal: AbortSignal.timeout(20000) }
      );
      if (!res.ok) throw new Error(`TTS server returned ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // Hint for Indian accent if available
      utterance.pitch = 1.1; // Slightly higher pitch for cuteness
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const triggerAnimation = () => {
    setBounce(false);
    setTimeout(() => setBounce(true), 10);
    if (bounceTimeoutRef.current) clearTimeout(bounceTimeoutRef.current);
    bounceTimeoutRef.current = setTimeout(() => setBounce(false), 900);
  };

  const handleTouch = () => {
    const now = Date.now();
    if (now - lastTouchRef.current < 400) return;
    lastTouchRef.current = now;

    resetIdleTimer();
    const mood = currentMoodRef.current;
    setTouchAnim(moodAnimations[mood] || 'bounce');
    setBurstKey((k) => k + 1);
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    touchTimeoutRef.current = setTimeout(() => setTouchAnim(null), 1100);

    // Change expression based on mood
    const facePool = reactionFaces[mood] || reactionFaces.happy;
    setCharacterFace(facePool[Math.floor(Math.random() * facePool.length)]);
    if (touchFaceTimeoutRef.current) clearTimeout(touchFaceTimeoutRef.current);
    touchFaceTimeoutRef.current = setTimeout(() => {
      if (!isFlirting) setCharacterFace(getMoodFace(stats));
    }, 1300);

    const pool = touchMessages[mood] || touchMessages.happy;
    let msg;
    do {
      msg = pool[Math.floor(Math.random() * pool.length)];
    } while (msg === touchLastRef.current && pool.length > 1);
    touchLastRef.current = msg;
    showMessage(msg, 2000);
  };

  const handleAction = (type) => {
    resetIdleTimer(); // Reset idle timer on every interaction
    triggerAnimation();

    const showActionFace = (face, mood) => {
      setActionFace(face);
      moodOverrideRef.current = { mood, face, expiresAt: Date.now() + 3000 };
      if (actionFaceTimeoutRef.current) clearTimeout(actionFaceTimeoutRef.current);
      actionFaceTimeoutRef.current = setTimeout(() => setActionFace(null), 2500);
    };

    setStats(prev => {
      const updated = { ...prev };
      if (type === 'feed') {
        updated.hunger = Math.min(100, prev.hunger + 15);
        if (updated.hunger >= 100) {
          showMessage("I'm full... now feed me kisses. 💋");
          showActionFace(faces.flirty, 'flirty');
        } else {
          showMessage("Yummy 🍕");
          showActionFace(faces.happy, 'happy');
        }
      } else if (type === 'pat') {
        updated.attention = Math.min(100, prev.attention + 15);
        if (updated.attention >= 100) {
          showMessage("Attention levels at 100%. I am obsessed with you.");
          showActionFace(faces.love, 'love');
        } else {
          showMessage("More pats pls 🥺");
          showActionFace(faces.love, 'love');
        }
      } else if (type === 'sleep') {
        updated.energy = Math.min(100, prev.energy + 20);
        if (updated.energy >= 100) {
          showMessage("All rested! Let's hang out.");
          showActionFace(faces.happy, 'happy');
        } else {
          showMessage("Zzz... dreaming of you.");
          showActionFace(faces.sleepy, 'sleepy');
        }
      }
      return updated;
    });
  };

  const handleChat = async (userMessage) => {
    resetIdleTimer();

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      showMessage("Add your Gemini API key to the .env file first! 🔑", 4000);
      return;
    }

    setIsThinking(true);
    generatingRef.current = true;

    const mood = currentMoodRef.current;
    const moodDescriptions = {
      happy: 'happy and content, feeling warm and affectionate',
      love: 'absolutely head over heels, very lovey-dovey and clingy',
      flirty: 'flirty and playful, a little cheeky',
      sad: 'sad and needy, low on energy and attention, a bit dramatic about it',
      sleepy: 'very sleepy and slow, half-awake, still sweet but drowsy',
      neutral: 'calm and chill, just vibing',
    };

    const systemPrompt = `You are roleplaying as Sumit, talking to your girlfriend.
Your goal is to sound EXACTLY like him.

CRITICAL BEHAVIORAL RULES:
1. Speak strictly in casual romanized Hindi/Punjabi and short English. Never use formal proper English.
2. Ignore grammar and punctuation. Do not use periods or commas. Use lowercase mostly.
3. Keep it VERY short. 1-6 words maximum per message. He texts in tiny bursts.
4. Core Vocabulary you MUST use:
   - Agreeing: "Mhmmm", "Yessss", "Ji jaanu", "Okay jaanu"
   - Affection: "Kissi", "Kissi krdo", "Cuddle krna", "Mere pas ajao", "My cutuuuuuuu"
   - Whining/Teasing: "haw", "😭", "Chup", "Meri mrzi😛", "Stfu", "Muh kyu bnaya"
5. Emojis to overuse at the end of texts: 😭, 💋, 😔, 😋, 👉👈, 🫂, 😛, ☹️. NEVER use standard emojis like 🙂 or 👍.
6. If she says something sweet, spam "💋" or "😭".
7. ACTUALLY REPLY to her current message. Do not just throw out random phrases. Filter a logical reply through his specific vocabulary.
8. Current mood: ${moodDescriptions[mood] || moodDescriptions.happy}.

Reference texts (match this exact vibe):
---
${chatStyle.split('\n').slice(0, 500).join('\n')}
---`;

    // Build conversation history for context
    const contents = [
      ...chatHistoryRef.current,
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    // Show typing indicator right away so it doesn't feel like nothing's happening
    setMessage('Nini is thinking...');
    setIsMessageVisible(true);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);

    try {
      const stream = await ai.models.generateContentStream({
        model: 'gemini-3.5-flash-lite',
        config: { 
          systemInstruction: systemPrompt,
          temperature: 0.8,
        },
        contents,
      });

      let reply = '';
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          reply += text;
          // Stream the reply into the bubble as it's generated
          if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
          setMessage(reply);
          setIsMessageVisible(true);
        }
      }

      reply = reply.trim() || "...";

      // Save to history (keep last 20 messages to avoid token bloat)
      chatHistoryRef.current = [
        ...contents,
        { role: 'model', parts: [{ text: reply }] },
      ].slice(-20);

      // Feature 7: TTS Voice Response
      if (stats.attention > 80 && reply.length < 50) {
        speakNini(reply);
      }

      // Show reply in speech bubble + trigger animation
      showMessage(reply, 7000);
      triggerAnimation();
      // Briefly show love/flirty face during reply
      if (!isFlirting) {
        setCharacterFace(mood === 'sad' ? faces.sad : Math.random() > 0.5 ? faces.flirty : faces.love);
        setIsFlirting(true);
        setTimeout(() => setIsFlirting(false), 7000);
      }
    } catch (err) {
      console.error('Gemini error:', err);
      const errMsg = err?.message || String(err);
      if (errMsg.includes('API_KEY') || errMsg.includes('403') || errMsg.includes('401')) {
        showMessage("Invalid API key — check your .env file 🔑", 5000);
      } else if (errMsg.includes('quota') || errMsg.includes('429')) {
        showMessage("Rate limited! Try again in a moment 😅", 4000);
      } else {
        showMessage(`Error: ${errMsg.slice(0, 60)}`, 5000);
      }
    } finally {
      setIsThinking(false);
      generatingRef.current = false;
    }
  };

  const needYouUntilRef = useRef(0);

  const handleNeedYou = async () => {
    const now = Date.now();
    if (now < needYouUntilRef.current) {
      showMessage("He's on his way 💗 try again in a sec", 2000);
      return;
    }
    needYouUntilRef.current = now + 3000; // only block rapid double-taps

    resetIdleTimer();
    triggerAnimation();

    const topic = import.meta.env.VITE_NTFY_TOPIC || 'nini-needs-u-7x9q';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const title = encodeURIComponent('cutuu needs you 💗');
    const url = `https://ntfy.sh/${topic}?title=${title}&priority=high&tags=heart`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: `She needs you 💗 (${time})`,
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      showMessage("Sent! He knows you need him 💗", 2500);
    } catch (err) {
      console.error('Need-you notify failed:', err);
      showMessage("Couldn't send — try again 😅", 2500);
    }
  };


  const handleFlirt = () => {
    resetIdleTimer(); // Reset idle timer on every interaction
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * flirtMessages.length);
    } while (newIndex === flirtLastIndexRef.current && flirtMessages.length > 1);
    
    flirtLastIndexRef.current = newIndex;
    
    setIsFlirting(true);
    setCharacterFace(Math.random() > 0.5 ? faces.flirty : faces.love);
    showMessage(flirtMessages[newIndex], 8000, true);
    triggerAnimation();
  };

  return (
    <>
    <div className="game-container">
      <header>
        <h1>Take Care of Nini 🤍</h1>
        <p className="subtitle">Keep the stats high or I'll get sad.</p>
      </header>
      
      <Character 
        face={characterFace} 
        message={message} 
        isMessageVisible={isMessageVisible} 
        bounce={bounce} 
        onTouch={handleTouch}
        touchAnim={touchAnim}
        burst={moodBursts[currentMoodRef.current] || moodBursts.happy}
        burstKey={burstKey}
      />

      <StatBars stats={stats} />
      
      <Controls 
        onAction={handleAction} 
        onFlirt={handleFlirt} 
        onNeedYou={handleNeedYou} 
        onFeedClick={() => setIsFeedOpen(true)}
        onCuddleStart={() => setIsCuddling(true)}
        onCuddleEnd={() => setIsCuddling(false)}
        onCallClick={() => setIsCallActive(true)}
        isCuddling={isCuddling}
      />
      <ChatInput onSend={handleChat} isThinking={isThinking} />
      <MusicPlayer />

      <CuddleOverlay isActive={isCuddling} />
      <CallOverlay isActive={isCallActive} onClose={() => setIsCallActive(false)} />
      <FeedDrawer 
        isOpen={isFeedOpen} 
        onClose={() => setIsFeedOpen(false)} 
        onFeed={handleFeed}
        onDragStateChange={setIsDraggingFood}
      />
    </div>

    {/* Overlays outside game-container */}
    <DailyCheckinOverlay onComplete={(isGood) => {
      if (!isGood) {
        setStats(prev => ({ ...prev, attention: 100 }));
        showMessage("Aww, come here... let me cuddle you until you feel better 🥺💗", 6000);
        setIsCuddling(true);
        setTimeout(() => setIsCuddling(false), 5000);
      } else {
        showMessage("Yay! I'm so glad you had a good day! 🥰", 4000);
      }
    }} />
    <SurpriseEvent onCollect={() => {
      setStats({ hunger: 100, attention: 100, energy: 100 });
      showMessage("A care package! You're the best! 🎁✨", 5000);
    }} />
    </>
  );
}

export default App;

