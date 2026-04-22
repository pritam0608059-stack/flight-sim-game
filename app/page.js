"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function FlightSimulator() {
  const mountRef = useRef(null);
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const move = useRef({ x: 0, y: 0 });
  const speed = useRef(1.5);

  useEffect(() => {
    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(100, 200, 100);
    scene.add(sun);

    // 3. World (Ocean & Ground Grid)
    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), new THREE.MeshStandardMaterial({ color: 0x0044ff }));
    ocean.rotation.x = -Math.PI / 2;
    scene.add(ocean);

    const grid = new THREE.GridHelper(20000, 100, 0xffffff, 0x0033aa);
    scene.add(grid);

    // 4. Realistic Plane Model
    const plane = new THREE.Group();
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 6), whiteMat);
    body.rotation.x = Math.PI / 2;
    const wings = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 2.5), whiteMat);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 1), whiteMat);
    tail.position.z = 2.8;
    plane.add(body, wings, tail);
    scene.add(plane);
    plane.position.y = 100;

    // 5. Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Movement Logic - Limit rotation to fix "Blue Screen"
      const targetPitch = move.current.y * 0.5; // Max 30 degrees
      const targetRoll = -move.current.x * 0.6; 
      
      plane.rotation.x = THREE.MathUtils.lerp(plane.rotation.x, targetPitch, 0.1);
      plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, targetRoll, 0.1);
      plane.rotation.y -= move.current.x * 0.02;
      
      plane.translateZ(-speed.current);

      // Camera: Smooth follow behind plane
      const camOffset = new THREE.Vector3(0, 7, 20).applyMatrix4(plane.matrixWorld);
      camera.position.lerp(camOffset, 0.1);
      camera.lookAt(plane.position);

      renderer.render(scene, camera);
    };
    animate();

    return () => { if(mountRef.current) mountRef.current.innerHTML = ""; };
  }, []);

  // Joystick Logic
  const handleTouch = (e) => {
    const t = e.touches;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = t.clientX - (rect.left + rect.width / 2);
    const dy = t.clientY - (rect.top + rect.height / 2);
    const limit = 40;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const nx = dist > limit ? (dx/dist)*limit : dx;
    const ny = dist > limit ? (dy/dist)*limit : dy;
    setJoy({ x: nx, y: ny });
    move.current = { x: nx / limit, y: ny / limit };
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', touchAction: 'none', background: '#000' }}>
      <div ref={mountRef} />
      
      {/* Flight HUD */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'white', fontFamily: 'monospace', fontSize: '18px', textShadow: '2px 2px black' }}>
        SPEED: 140 KTS<br/>
        ALT: {Math.round(joy.y * -5 + 300)} FT
      </div>

      {/* Joystick */}
      <div onTouchMove={handleTouch} onTouchEnd={() => {setJoy({x:0,y:0}); move.current={x:0,y:0}}}
        style={{ position: 'absolute', bottom: '50px', left: '50px', width: '100px', height: '100px', borderRadius: '50%', border: '3px solid white', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', position: 'absolute', left: '27.5px', top: '27.5px', transform: `translate(${joy.x}px, ${joy.y}px)` }} />
      </div>
    </div>
  );
}
