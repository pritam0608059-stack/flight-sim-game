"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// Aapki banayi hui files ko yahan bula rahe hain
import { createAeroplane } from '../components/Aeroplane';
import { createMap } from '../components/Map';

export default function Game() {
  const mountRef = useRef(null);
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const [thr, setThr] = useState(2.0); // Default speed
  const moveRef = useRef({ x: 0, y: 0 });
  const planeRef = useRef(null);

  useEffect(() => {
    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 30000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(500, 1000, 500);
    scene.add(sun);

    // 3. Map & Plane Bulana (Aapki files se)
    createMap(scene); //components/Map.js se
    const plane = createAeroplane(); //components/Aeroplane.js se
    scene.add(plane);
    plane.position.y = 500; // Start high to see the map
    planeRef.current = plane;

    let yaw = 0;

    // 4. Game Loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (planeRef.current) {
        // BLUE SCREEN FIX: Rotation control
        const p = THREE.MathUtils.clamp(moveRef.current.y * 0.45, -0.6, 0.6);
        const r = -moveRef.current.x * 0.7;
        yaw -= moveRef.current.x * 0.02;

        planeRef.current.rotation.set(p, yaw, r);
        planeRef.current.translateZ(-thr);

        // Fixed Camera Follow (Safe Distance)
        const camOffset = new THREE.Vector3(0, 12, 35).applyMatrix4(planeRef.current.matrixWorld);
        camera.position.copy(camOffset);
        camera.lookAt(planeRef.current.position);
      }
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => { if(mountRef.current) mountRef.current.innerHTML = ""; };
  }, [thr]);

  // Joystick Logic
  const handleJoy = (e) => {
    const t = e.touches;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = t.clientX - (rect.left + rect.width / 2);
    const dy = t.clientY - (rect.top + rect.height / 2);
    const lim = 45;
    const d = Math.sqrt(dx*dx + dy*dy);
    if (d === 0) return;
    const nx = d > lim ? (dx/d)*lim : dx;
    const ny = d > lim ? (dy/d)*lim : dy;
    setJoy({ x: nx, y: ny });
    moveRef.current = { x: nx / lim, y: ny / lim };
  };

  return (
    <div style={{ width: '100vw', height: '100vh', touchAction: 'none', background: '#000', overflow: 'hidden' }}>
      <div ref={mountRef} />
      
      {/* HUD indicators */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'white', background: 'rgba(0,0,0,0.5)', padding: '10px', fontFamily: 'monospace' }}>
        ALT: {planeRef.current ? Math.round(planeRef.current.position.y) : 0} FT | SPEED: {Math.round(thr * 100)}
      </div>

      {/* Joystick */}
      <div onTouchMove={handleJoy} onTouchEnd={() => {setJoy({x:0,y:0}); moveRef.current={x:0,y:0}}}
        style={{ position: 'absolute', bottom: '60px', left: '60px', width: '110px', height: '110px', borderRadius: '50%', border: '3px solid white', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '50%', position: 'absolute', left: '30px', top: '30px', transform: `translate(${joy.x}px, ${joy.y}px)` }} />
      </div>

      {/* Speed Slider (Throttle) */}
      <div style={{ position: 'absolute', bottom: '60px', right: '60px' }}>
        <input type="range" min="0.5" max="10" step="0.1" value={thr} orient="vertical" onChange={(e) => setThr(parseFloat(e.target.value))} style={{ appearance: 'slider-vertical', height: '220px', width: '40px' }} />
      </div>
    </div>
  );
}
