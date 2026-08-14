import React, { useState } from 'react';

const foods = [
  { emoji: '🧋', name: 'Boba' },
  { emoji: '🍕', name: 'Pizza' },
  { emoji: '🍣', name: 'Sushi' },
  { emoji: '🍩', name: 'Donut' }
];

const FeedDrawer = ({ isOpen, onClose, onFeed, onDragStateChange }) => {
  const [drag, setDrag] = useState({ isDragging: false, x: 0, y: 0, food: '' });

  if (!isOpen && !drag.isDragging) return null;

  const handleTouchStart = (food, e) => {
    const touch = e.touches[0];
    setDrag({
      isDragging: true,
      x: touch.clientX,
      y: touch.clientY,
      food: food.emoji
    });
    onDragStateChange(true);
  };

  const handleTouchMove = (e) => {
    if (!drag.isDragging) return;
    const touch = e.touches[0];
    setDrag(prev => ({
      ...prev,
      x: touch.clientX,
      y: touch.clientY
    }));

    // Check collision with pet
    const petElement = document.querySelector('.character');
    if (petElement) {
      const rect = petElement.getBoundingClientRect();
      const isOverPet = 
        touch.clientX >= rect.left && 
        touch.clientX <= rect.right && 
        touch.clientY >= rect.top && 
        touch.clientY <= rect.bottom;
      
      const glowElement = document.querySelector('.character-target-glow');
      if (glowElement) {
        glowElement.style.opacity = isOverPet ? '1' : '0';
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (!drag.isDragging) return;
    
    const petElement = document.querySelector('.character');
    let fed = false;

    if (petElement) {
      const rect = petElement.getBoundingClientRect();
      const clientX = drag.x;
      const clientY = drag.y;

      const isOverPet = 
        clientX >= rect.left && 
        clientX <= rect.right && 
        clientY >= rect.top && 
        clientY <= rect.bottom;

      if (isOverPet) {
        onFeed(drag.food);
        fed = true;
      }
    }

    const glowElement = document.querySelector('.character-target-glow');
    if (glowElement) {
      glowElement.style.opacity = '0';
    }

    setDrag({ isDragging: false, x: 0, y: 0, food: '' });
    onDragStateChange(false);
    if (fed) {
      onClose();
    }
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
              onMouseDown={(e) => {
                const moveHandler = (moveEvent) => {
                  setDrag({
                    isDragging: true,
                    x: moveEvent.clientX,
                    y: moveEvent.clientY,
                    food: food.emoji
                  });
                  onDragStateChange(true);
                  
                  const petElement = document.querySelector('.character');
                  if (petElement) {
                    const rect = petElement.getBoundingClientRect();
                    const isOver = 
                      moveEvent.clientX >= rect.left && 
                      moveEvent.clientX <= rect.right && 
                      moveEvent.clientY >= rect.top && 
                      moveEvent.clientY <= rect.bottom;
                    const glow = document.querySelector('.character-target-glow');
                    if (glow) glow.style.opacity = isOver ? '1' : '0';
                  }
                };
                
                const upHandler = (upEvent) => {
                  document.removeEventListener('mousemove', moveHandler);
                  document.removeEventListener('mouseup', upHandler);
                  
                  const petElement = document.querySelector('.character');
                  let fed = false;
                  if (petElement) {
                    const rect = petElement.getBoundingClientRect();
                    const isOver = 
                      upEvent.clientX >= rect.left && 
                      upEvent.clientX <= rect.right && 
                      upEvent.clientY >= rect.top && 
                      upEvent.clientY <= rect.bottom;
                    if (isOver) {
                      onFeed(food.emoji);
                      fed = true;
                    }
                  }
                  const glow = document.querySelector('.character-target-glow');
                  if (glow) glow.style.opacity = '0';
                  
                  setDrag({ isDragging: false, x: 0, y: 0, food: '' });
                  onDragStateChange(false);
                  if (fed) onClose();
                };
                
                document.addEventListener('mousemove', moveHandler);
                document.addEventListener('mouseup', upHandler);
              }}
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
            top: `${drag.y}px` 
          }}
        >
          {drag.food}
        </div>
      )}
    </>
  );
};

export default FeedDrawer;
