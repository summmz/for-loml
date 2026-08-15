import React, { useRef } from 'react';

const Controls = ({ onAction, onFlirt, onNeedYou, onFeedClick, onCuddleStart, onCuddleEnd, onCallClick, callName, isCuddling }) => {
  const cuddleTimerRef = useRef(null);
  const cuddleActiveRef = useRef(false);

  const beginCuddle = () => {
    if (cuddleTimerRef.current) return;
    cuddleTimerRef.current = setTimeout(() => {
      cuddleTimerRef.current = null;
      cuddleActiveRef.current = true;
      onCuddleStart();
    }, 400);
  };

  const endCuddle = () => {
    if (cuddleTimerRef.current) {
      clearTimeout(cuddleTimerRef.current);
      cuddleTimerRef.current = null;
    }
    if (cuddleActiveRef.current) {
      cuddleActiveRef.current = false;
      onCuddleEnd();
    }
  };

  return (
    <>
      <div className="actions">
        <button onClick={onFeedClick} className="action-btn">🍕 Feed</button>
        <button onClick={() => onAction('pat')} className="action-btn">✋ Pat</button>
        <button onClick={() => onAction('sleep')} className="action-btn">💤 Sleep</button>
      </div>

      <div className="flirt-section" style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
        <button onClick={onFlirt} className="glow-btn">Do Not Press</button>
        <button onClick={onCallClick} className="glow-btn" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}>📞 Call {callName}</button>
      </div>

      <div className="need-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%' }}>
        <button 
          onMouseDown={beginCuddle}
          onMouseUp={endCuddle}
          onMouseLeave={endCuddle}
          onTouchStart={(e) => { e.preventDefault(); beginCuddle(); }}
          onTouchMove={(e) => e.preventDefault()}
          onTouchEnd={endCuddle}
          onTouchCancel={endCuddle}
          onContextMenu={(e) => e.preventDefault()}
          className={`need-btn ${isCuddling ? 'cuddling' : ''}`}
          style={{ 
            background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', 
            width: '100%',
            WebkitTouchCallout: 'none',
            WebkitUserDrag: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            touchAction: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {isCuddling ? 'Cuddling... 💖' : '🫂 Hold to Cuddle'}
        </button>
        <button onClick={onNeedYou} className="need-btn" style={{ width: '100%' }}>💗 I need you</button>
        <p className="need-hint">Tap to tell him you need him</p>
      </div>
    </>
  );
};

export default Controls;
