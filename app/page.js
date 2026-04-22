"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function GeoFS_Master_Version() {
  const mountRef = useRef(null);
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const [throttle, setThrottle] = useState(1.0);
  const moveRef = useRef({ x: 0, y: 0 });
  const speedRef = useRef(1.0);

  useEffect(() => {
    // 1. SCENE & RENDERER SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Realistic Sky Blue
    scene.fog = new THREE.Fog(0x87ceeb, 100, 4000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 2. LIGHTING
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(500, 1000, 500);
    scene.add(sun);

    // 3. WORLD ENVIRONMENT (Ocean & Speed Grid)
    const ocean = new THREE.Mesh(
      new THREE.PlaneGeometry(30000, 30000),
      new THREE.MeshStandardMaterial({ color: 0x0055ff, roughness: 0.1 })
    );
    ocean.rotation.x = -Math.PI / 2;
    scene.add(ocean);

    const grid = new THREE.GridHelper(30000, 150, 0xffffff, 0x0033aa);
    grid.position.y = 0.5;
    scene.add(grid);

    // 4. DETAILED PLANE MODEL (GeoFS Style)
    const plane = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xcc0000 });

    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 8, 16), bodyMat);
    fuselage.rotation.x = Math.PI / 2;
    
    const wings = new THREE.Mesh(new THREE.BoxGeometry(15, 0.1, 3), bodyMat);
    
    const tail = new THREE.Mesh(new THREE.BoxGeometry(5, 0.1, 1.5), bodyMat);
    tail.position.z = 3.5;
    
    const rudder = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.5, 1.5), accentMat);
    rudder.position.set(0, 1.2, 3.5);

    plane.add(fuselage, wings, tail, rudder);
    scene.add(plane);
    plane.position.y = 250;

    // 5. FLIGHT PHYSICS VARIABLES
    let pitch = 0;
    let roll = 0;
    let yaw = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      // CLAMPED ROTATION: To prevent Blue Screen
      // Max pitch limited to ~35 degrees
      pitch = THREE.MathUtils.clamp(pitch + moveRef.current.y * 0.025, -0.6, 0.6);
      roll = THREE.MathUtils.lerp(roll, -moveRef.current.x * 0.8, 0.1); 
      yaw -= moveRef.current.x * 0.02;

      plane.rotation.set(pitch, yaw, roll);
      plane.translateZ(-speedRef.current);

      // RIGID THIRD-PERSON CAMERA
      const camOffset = new THREE.Vector3(0, 10, 30).applyMatrix4(plane.matrixWorld);
      camera.position.copy(camOffset);
      camera.lookAt(plane.position);

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if(mountRef.current) mountRef.current.innerHTML = "";
    };
  }, []);

  const handleJoy = (e) => {
    const t = e.touches;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = t.clientX - (rect.left + rect.width / 2);
    const dy = t.clientY - (rect.top + rect.height / 2);
    const lim = 50;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const nx = dist > lim ? (dx/dist)*lim : dx;
    const ny = dist > lim ? (dy/dist)*lim : dy;
    setJoy({ x: nx, y: ny });
    moveRef.current = { x: nx / lim, y: ny / lim };
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', overflow: 'hidden', touchAction: 'none' }}>
      <div ref={mountRef} />
      
      {/* HUD Indicators */}
      <div style={{ position: 'absolute', top: '30px', left: '30px', color: '#0f0', fontFamily: 'monospace', fontSize: '18px', background: 'rgba(0,0,0,0.5)', padding: '10px', border: '1px solid #0f0' }}>
        IAS: {Math.round(speedRef.current * 140)} KTS<br/>
        ALT: {Math.round(planeRef?.current?.position.y || 1200)} FT
      </div>

      {/* PRO JOYSTICK */}
      <div onTouchMove={handleJoy} onTouchEnd={() => {setJoy({x:0,y:0}); moveRef.current={x:0,y:0}}}
        style={{ position: 'absolute', bottom: '60px', left: '60px', width: '120px', height: '120px', borderRadius: '50%', border: '4px solid white', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '50%', position: 'absolute', left: '35px', top: '35px', transform: `translate(${joy.x}px, ${joy.y}px)`, boxShadow: '0 0 20px white' }} />
      </div>

      {/* POWER THROTTLE */}
      <div style={{ position: 'absolute', bottom: '60px', right: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input type="range" min="0.5" max="5.0" step="0.1" value={throttle} orient="vertical"
          onChange={(e) => { setThrottle(e.target.value); speedRef.current = parseFloat(e.target.value); }}
          style={{ appearance: 'slider-vertical', width: '40px', height: '220px' }} />
        <b style={{ color: 'white', marginTop: '15px' }}>THROTTLE</b>
      </div>
    </div>
  );
}
