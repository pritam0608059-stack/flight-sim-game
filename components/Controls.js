"use client";
import React, { useState } from 'react';

export default function Controls({ onMove, onThrottle }) {
  const [joy, setJoy] = useState({ x: 0, y: 0 });

  const handleTouch = (e) => {
    const t = e.touches;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = t.clientX - centerX;
    let dy = t.clientY - centerY;
    const limit = 40;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > limit) { dx *= limit / dist; dy *= limit / dist; }
    setJoy({ x: dx, y: dy });
    onMove({ x: dx / limit, y: dy / limit });
  };

  const resetJoy = () => {
    setJoy({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  return (
    <>
      {/* Joystick Area */}
      <div onTouchMove={handleTouch} onTouchEnd={resetJoy}
        style={{ position: 'absolute', bottom: '40px', left: '40px', width: '100px', height: '100px', borderRadius: '50%', border: '3px solid white', background: 'rgba(255,255,255,0.1)', zIndex: 100 }}>
        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', position: 'absolute', left: '27px', top: '27px', transform: `translate(${joy.x}px, ${joy.y}px)`, boxShadow: '0 0 15px white' }} />
      </div>

      {/* Throttle Slider */}
      <div style={{ position: 'absolute', bottom: '40px', right: '40px', zIndex: 100 }}>
        <input type="range" min="0.1" max="4.0" step="0.1" orient="vertical" 
          onChange={(e) => onThrottle(parseFloat(e.target.value))}
          style={{ appearance: 'slider-vertical', width: '30px', height: '180px' }} />
      </div>
    </>
  );
}
