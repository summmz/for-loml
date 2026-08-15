import React, { useState, useEffect, useRef } from 'react';

const boyfriendDialogues = [
  { time: 1, text: "hey baby 💋", sender: 'boyfriend' },
  { time: 3, text: "mna kra tha call krne ko? 😛 bss miss kr rha tha bhot", sender: 'boyfriend' },
  { time: 7, text: "kya kr rahi ho? did you eat yet? 🥺", sender: 'boyfriend' },
  { time: 11, text: "paani b pi lena time se, Dumbo 😋", sender: 'boyfriend' },
  { time: 15, text: "chalo gym jana hai abb... bhot sara kissi aapko 💋💋💋", sender: 'boyfriend' },
  { time: 19, text: "love you so much jaanu, good boy banke rahungaa 🫂 bye bye!", sender: 'boyfriend' }
];

const CallOverlay = ({ isActive, onClose }) => {
  const [callState, setCallState] = useState('ringing'); // 'ringing' | 'connected' | 'ended'
  const [seconds, setSeconds] = useState(0);
  const [dialogue, setDialogue] = useState([]);
  const logEndRef = useRef(null);

  // Reset state when call starts
  useEffect(() => {
    if (isActive) {
      setCallState('ringing');
      setSeconds(0);
      setDialogue([]);
    }
  }, [isActive]);

  // Call timer
  useEffect(() => {
    if (callState !== 'connected') return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callState]);

  // Dialogue triggers
  useEffect(() => {
    if (callState !== 'connected') return;

    const dialogItem = boyfriendDialogues.find(d => d.time === seconds);
    if (dialogItem) {
      setDialogue(prevDlg => [...prevDlg, dialogItem]);
    }
  }, [seconds, callState]);

  // Auto hang up after the conversation ends (at 23 seconds)
  useEffect(() => {
    if (callState !== 'connected' || seconds < 23) return;

    setCallState('ended');
    const timeout = setTimeout(() => onClose(), 1500);
    return () => clearTimeout(timeout);
  }, [seconds, callState, onClose]);

  // Scroll to bottom of chat log when dialogue updates
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dialogue]);

  if (!isActive) return null;

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = () => {
    setCallState('connected');
  };

  const handleDecline = () => {
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className={`call-overlay ${isActive ? 'active' : ''}`}>
      <div className="call-info">
        <div className="call-avatar-wrapper">
          {callState === 'ringing' && <div className="call-avatar-ring"></div>}
          <div className="call-avatar">👦🏻</div>
        </div>
        <h2 className="call-name">Nini 🤍</h2>
        <p className="call-status">
          {callState === 'ringing' && "Incoming call..."}
          {callState === 'connected' && formatTime(seconds)}
          {callState === 'ended' && "Call ended"}
        </p>
      </div>

      {callState === 'connected' && (
        <div className="call-log-container">
          {dialogue.map((item, index) => (
            <div key={index} className={`call-bubble ${item.sender}`}>
              {item.text}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      )}

      <div className="call-actions">
        {callState === 'ringing' ? (
          <>
            <button onClick={handleDecline} className="call-btn decline">
              📞
            </button>
            <button onClick={handleAnswer} className="call-btn answer">
              📞
            </button>
          </>
        ) : (
          <button onClick={handleDecline} className="call-btn decline" style={{ transform: 'rotate(135deg)' }}>
            📞
          </button>
        )}
      </div>
    </div>
  );
};

export default CallOverlay;
