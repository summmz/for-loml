import React, { useState, useRef, useEffect } from 'react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://stream.zeno.fm/f3wvbbqmdg8uv');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    
    if (isPlaying) {
      audioRef.current.play().catch(e => {
        console.log("Audio play blocked by browser:", e);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div className="music-player-inline">
      <div className="music-player-left">
        <span className="music-icon">{isPlaying ? '🎵' : '🎧'}</span>
        <div className="music-info">
          <span className="music-title">{isPlaying ? 'Lo-Fi Vibes' : 'Lo-Fi Music'}</span>
          <span className="music-status">{isPlaying ? '♪ playing...' : 'tap to play'}</span>
        </div>
      </div>
      <button
        className={`music-toggle-btn ${isPlaying ? 'playing' : ''}`}
        onClick={() => setIsPlaying(!isPlaying)}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
    </div>
  );
};

export default MusicPlayer;
