import { useState } from 'react';

const ChatInput = ({ onSend, isThinking }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chat-section">
      <div className="chat-bar">
        <input
          id="chat-input"
          className="chat-input"
          type="text"
          placeholder={isThinking ? 'Nini is typing...' : 'Say something...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isThinking}
        />
        <button
          id="chat-send-btn"
          className={`chat-send-btn ${isThinking ? 'thinking' : ''}`}
          onClick={handleSend}
          disabled={isThinking}
        >
          {isThinking ? '💭' : '↑'}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
