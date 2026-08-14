import React from 'react';

const Character = ({ face, message, isMessageVisible, bounce, onTouch, touchAnim, burst, burstKey }) => {
  return (
    <div className="character-display">
      <div className="character-target-glow" style={{ opacity: 0, transition: 'opacity 0.2s' }}></div>
      {touchAnim && burst && (
        <div key={burstKey} className="burst">
          {burst.map((emoji, i) => (
            <span key={i} className={`burst-item burst-item-${i}`}>{emoji}</span>
          ))}
        </div>
      )}
      <div
        className={`character ${bounce ? 'bouncing' : ''} ${touchAnim ? `anim-${touchAnim}` : ''}`}
        onClick={onTouch}
        onTouchStart={onTouch}
      >
        {face}
      </div>
      <div className={`message-bubble ${!isMessageVisible ? 'hidden' : ''}`}>
        {message}
      </div>
    </div>
  );
};

export default Character;
