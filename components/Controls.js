"use client";
import React, { useState } from 'react';

export default function Controls({ onMove, onThrottle }) {
  const [joy, setJoy] = useState({ x: 0, y: 0 });

  const handleTouch = (e) => {
    const t = e.touches;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = t.clientX - (rect.left + rect.width / 2);
    const dy = t.clientY - (rect.top + rect.height / 2);
    const limit = 40;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const nx = dist > limit ? (dx/dist)*limit : dx;
    const ny = dist > limit ? (dy/dist)*limit : dy;
    setJoy({ x: nx, y: ny });
    onMove({ x: nx / limit, y: ny / limit });
  };

  return (
    <>
      <div onTouchMove={handleTouch} onTouchEnd={() => {setJoy({x:0,y:0}); onMove({x:0,y:0})}}
        style={{ position: 'absolute', bottom: '40px', left: '40px', width: '100px', height: '100px', borderRadius: '50%', border: '3px solid white', background: 'rgba(255,255,255,0.1)', zIndex: 100 }}>
        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', position: 'absolute', left: '30px', top: '30px', transform: `translate(${joy.x}px, ${joy.y}px)` }} />
      </div>
      <div style={{ position: 'absolute', bottom: '40px', right: '40px', zIndex: 100 }}>
        <input type="range" min="0.2" max="4.0" step="0.1" orient="vertical" onChange={(e) => onThrottle(parseFloat(e.target.value))} style={{ appearance: 'slider-vertical', height: '180px' }} />
      </div>
    </>
  );
}
