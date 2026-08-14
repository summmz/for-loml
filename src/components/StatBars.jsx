import React from 'react';

const StatBars = ({ stats }) => {
  const getBackgroundColor = (value, type) => {
    if (value < 30) return '#ff6b6b';
    if (type === 'hunger') return '#ff9a9e';
    if (type === 'attention') return '#a1c4fd';
    if (type === 'energy') return '#d4fc79';
    return '#ccc';
  };

  return (
    <div className="stats-container">
      <div className="stat">
        <label>Hunger</label>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${stats.hunger}%`, 
              backgroundColor: getBackgroundColor(stats.hunger, 'hunger') 
            }}>
          </div>
        </div>
      </div>
      <div className="stat">
        <label>Attention</label>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${stats.attention}%`, 
              backgroundColor: getBackgroundColor(stats.attention, 'attention') 
            }}>
          </div>
        </div>
      </div>
      <div className="stat">
        <label>Energy</label>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${stats.energy}%`, 
              backgroundColor: getBackgroundColor(stats.energy, 'energy') 
            }}>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatBars;
