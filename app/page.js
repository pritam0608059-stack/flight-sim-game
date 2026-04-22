"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function FlightSim() {
  const mountRef = useRef(null);
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const [throttle, setThrottle] = useState(1.0);
  
  // Refs to handle movement without re-renders
  const moveRef = useRef({ x: 0, y: 0 });
  const speedRef = useRef(1.0);
  const planeRef = useRef(null); // Fixing the ReferenceError

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 100, 4000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8), new THREE.DirectionalLight(0xffffff, 1));

    // Ground/Grid
    const grid = new THREE.GridHelper(20000, 100, 0xffffff, 0x0044ff);
    scene.add(grid);

    // Plane Model
    const plane = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.5, 7), mat);
    body.rotation.x = Math.PI / 2;
    const wing = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 2.8), mat);
    plane.add(body, wing);
    scene.add(plane);
    plane.position.y = 200;
    
    // Assigning to Ref to fix ReferenceError
    planeRef.current = plane;

    let pitch = 0;
    let yaw = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      
      if (planeRef.current) {
        // Safe Rotation (Clamp prevents Blue Screen)
        pitch = THREE.MathUtils.clamp(pitch + moveRef.current.y * 0.02, -0.6, 0.6);
        yaw -= moveRef.current.x * 0.02;
        
        planeRef.current.rotation.set(pitch, yaw, -moveRef.current.x * 0.6);
        planeRef.current.translateZ(-speedRef.current);

        // Camera Follow
        const camPos = new THREE.Vector3(0, 10, 30).applyMatrix4(planeRef.current.matrixWorld);
        camera.position.lerp(camPos, 0.1);
        camera.lookAt(planeRef.current.position);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, []);

  const handleJoy = (e) => {
    const t = e.touches;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = t.clientX - (rect.left + rect.width / 2);
    const dy = t.clientY - (rect.top + rect.height / 2);
    const lim = 40;
    const d = Math.sqrt(dx*dx + dy*dy);
    const nx = d > lim ? (dx/d)*lim : dx;
    const ny = d > lim ? (dy/d)*lim : dy;
    setJoy({ x: nx, y: ny });
    moveRef.current = { x: nx / lim, y: ny / lim };
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', overflow: 'hidden', touchAction: 'none' }}>
      <div ref={mountRef} />
      
      {/* Flight Stats */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', color: '#0f0', fontFamily: 'monospace', fontSize: '18px', background: 'rgba(0,0,0,0.5)', padding: '10px' }}>
        ALT: {planeRef.current ? Math.round(planeRef.current.position.y) : 0} FT
      </div>

      {/* Joystick */}
      <div onTouchMove={handleJoy} onTouchEnd={() => {setJoy({x:0,y:0}); moveRef.current={x:0,y:0}}}
        style={{ position: 'absolute', bottom: '50px', left: '50px', width: '100px', height: '100px', borderRadius: '50%', border: '3px solid white', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', position: 'absolute', left: '30px', top: '30px', transform: `translate(${joy.x}px, ${joy.y}px)` }} />
      </div>

      {/* Throttle */}
      <div style={{ position: 'absolute', bottom: '50px', right: '50px' }}>
        <input type="range" min="0.5" max="5.0" step="0.1" value={throttle} orient="vertical"
          onChange={(e) => { setThrottle(e.target.value); speedRef.current = parseFloat(e.target.value); }}
          style={{ appearance: 'slider-vertical', width: '40px', height: '180px' }} />
      </div>
    </div>
  );
                                               }
      
