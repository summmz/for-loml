import React, { useEffect } from 'react';

const CuddleOverlay = ({ isActive }) => {
  useEffect(() => {
    if (!isActive) return;

    // Pulse haptics on supported devices (Android, etc.)
    const interval = setInterval(() => {
      if (navigator.vibrate) {
        navigator.vibrate([100, 80, 100]); // double pulse heartbeat
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className={`cuddle-overlay ${isActive ? 'active' : ''}`}>
      <div className="cuddle-container">
        <div className="cuddle-heart-wrapper">
          <div className="cuddle-glow"></div>
          <span className="cuddle-heart">💖</span>
        </div>
        <h2 className="cuddle-text">Cuddling... 🫂</h2>
        <p className="cuddle-sub">Keep holding to fill the attention bar 💗</p>
      </div>
    </div>
  );
};

export default CuddleOverlay;