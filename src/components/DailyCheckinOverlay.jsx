import React, { useState, useEffect } from 'react';

const DailyCheckinOverlay = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const lastCheckin = localStorage.getItem('nini_last_checkin');
    
    if (lastCheckin !== today) {
      // Show checkin after a short delay so it doesn't pop up instantly
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleResponse = (isGood) => {
    const today = new Date().toLocaleDateString();
    localStorage.setItem('nini_last_checkin', today);
    setIsVisible(false);
    onComplete(isGood);
  };

  if (!isVisible) return null;

  return (
    <div className="checkin-overlay">
      <div className="checkin-card">
        <h2>Hey... 🥺</h2>
        <p>Before we hang out, how was your day today?</p>
        <div className="checkin-buttons">
          <button className="action-btn" style={{background: 'rgba(74, 222, 128, 0.2)', borderColor: 'rgba(74, 222, 128, 0.5)'}} onClick={() => handleResponse(true)}>
            Good 😊
          </button>
          <button className="action-btn" style={{background: 'rgba(248, 113, 113, 0.2)', borderColor: 'rgba(248, 113, 113, 0.5)'}} onClick={() => handleResponse(false)}>
            Bad 😔
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyCheckinOverlay;
