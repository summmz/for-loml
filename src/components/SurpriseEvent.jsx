import React, { useState, useEffect } from 'react';

const SurpriseEvent = ({ onCollect }) => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    // Check for random event every 2 minutes
    const interval = setInterval(() => {
      // 20% chance of a care package appearing
      if (Math.random() < 0.2 && !position) {
        // Random position on screen, avoiding edges
        const x = Math.floor(Math.random() * 70) + 15;
        const y = Math.floor(Math.random() * 70) + 15;
        setPosition({ x, y });
        
        // Disappear after 15 seconds if not clicked
        setTimeout(() => setPosition(null), 15000);
      }
    }, 120000); 

    return () => clearInterval(interval);
  }, [position]);

  if (!position) return null;

  const handleClick = () => {
    setPosition(null);
    onCollect();
  };

  return (
    <div 
      className="care-package"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      onClick={handleClick}
      title="A care package for Nini!"
    >
      🎁
    </div>
  );
};

export default SurpriseEvent;
