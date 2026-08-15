import React, { useState, useRef } from 'react';

const foods = [
  { emoji: '🧋', name: 'Boba' },
  { emoji: '🍕', name: 'Pizza' },
  { emoji: '🍣', name: 'Sushi' },
  { emoji: '🍩', name: 'Donut' }
];

const FeedDrawer = ({ isOpen, onClose, onFeed, onDragStateChange }) => {
  const [drag, setDrag] = useState({ isDragging: false, x: 0, y: 0, food: '' });
  const offsetRef = useRef({ x: 0, y: 0 });

  if (!isOpen && !drag.isDragging) return null;

  const checkOverPet = (clientX, clientY) => {
    const petElement = document.querySelector('.character');
    if (!petElement) return false;
    const rect = petElement.getBoundingClientRect();
    // Use a generous hit zone (2x the element size) for easier feeding
    const padding = 30;
    return (
      clientX >= rect.left - padding &&
      clientX <= rect.right + padding &&
      clientY >= rect.top - padding &&
      clientY <= rect.bottom + padding
    );
  };

  const setGlow = (show) => {
    const glowElement = document.querySelector('.character-target-glow');
    if (glowElement) glowElement.style.opacity = show ? '1' : '0';
  };

  // --- Touch handlers ---
  const handleTouchStart = (food, e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const cardRect = e.currentTarget.getBoundingClientRect();
    // Calculate where within the card the user touched
    offsetRef.current = {
      x: touch.clientX - (cardRect.left + cardRect.width / 2),
      y: touch.clientY - (cardRect.top + cardRect.height / 2),
    };
    setDrag({ isDragging: true, x: touch.clientX, y: touch.clientY, food: food.emoji });
    onDragStateChange(true);
  };

  const handleTouchMove = (e) => {
    if (!drag.isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    setDrag(prev => ({ ...prev, x: touch.clientX, y: touch.clientY }));
    setGlow(checkOverPet(touch.clientX, touch.clientY));
  };

  const handleTouchEnd = (e) => {
    if (!drag.isDragging) return;
    const fed = checkOverPet(drag.x, drag.y);
    setGlow(false);
    if (fed) {
      onFeed(drag.food);
    }
    setDrag({ isDragging: false, x: 0, y: 0, food: '' });
    onDragStateChange(false);
    if (fed) onClose();
  };

  // --- Mouse handlers ---
  const handleMouseDown = (food, e) => {
    e.preventDefault();
    const cardRect = e.currentTarget.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - (cardRect.left + cardRect.width / 2),
      y: e.clientY - (cardRect.top + cardRect.height / 2),
    };

    const startDrag = (moveEvent) => {
      setDrag({ isDragging: true, x: moveEvent.clientX, y: moveEvent.clientY, food: food.emoji });
      onDragStateChange(true);
      setGlow(checkOverPet(moveEvent.clientX, moveEvent.clientY));
    };

    const endDrag = (upEvent) => {
      document.removeEventListener('mousemove', startDrag);
      document.removeEventListener('mouseup', endDrag);
      const fed = checkOverPet(upEvent.clientX, upEvent.clientY);
      setGlow(false);
      if (fed) onFeed(food.emoji);
      setDrag({ isDragging: false, x: 0, y: 0, food: '' });
      onDragStateChange(false);
      if (fed) onClose();
    };

    document.addEventListener('mousemove', startDrag);
    document.addEventListener('mouseup', endDrag);
  };

  return (
    <>
      <div className={`feed-drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      
      <div className={`feed-drawer ${isOpen ? 'active' : ''}`}>
        <div className="drawer-header">
          <h3 className="drawer-title">Feed Nini 🍕</h3>
          <p className="drawer-subtitle">Drag and drop a treat directly onto Nini to feed her!</p>
        </div>
        
        <div className="food-grid">
          {foods.map((food, i) => (
            <div 
              key={i} 
              className="food-card"
              onTouchStart={(e) => handleTouchStart(food, e)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={(e) => handleMouseDown(food, e)}
            >
              <span className="food-emoji">{food.emoji}</span>
              <span className="food-name">{food.name}</span>
            </div>
          ))}
        </div>
      </div>

      {drag.isDragging && (
        <div 
          className="drag-clone"
          style={{ 
            left: `${drag.x}px`, 
            top: `${drag.y}px`,
          }}
        >
          {drag.food}
        </div>
      )}
    </>
  );
};

export default FeedDrawer;
