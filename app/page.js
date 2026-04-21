"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function FlightSim() {
  const mountRef = useRef(null);
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const move = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x00bfff);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(10, 50, 10);
    scene.add(sun);

    const grid = new THREE.GridHelper(5000, 100, 0xffffff, 0x000000);
    scene.add(grid);

    // PLANE MODEL
    const plane = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x39FF14 }); // Neon Green
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4), mat);
    body.rotation.x = Math.PI/2;
    const wings = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 1.5), mat);
    plane.add(body, wings);
    scene.add(plane);
    plane.position.y = 30; // Ground se upar

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Control Handling
      plane.rotation.x += move.current.y * 0.02; // Pitch
      plane.rotation.z -= move.current.x * 0.04; // Roll
      plane.rotation.y -= move.current.x * 0.02; // Yaw
      
      plane.translateZ(-0.7); // Constant Speed

      // Camera Fix: Ye plane ke hamesha peeche rahega
      const idealOffset = new THREE.Vector3(0, 4, 12).applyMatrix4(plane.matrixWorld);
      camera.position.copy(idealOffset);
      camera.lookAt(plane.position);

      renderer.render(scene, camera);
    };
    animate();
    
    return () => { if(mountRef.current) mountRef.current.innerHTML = ""; };
  }, []);

  const handleTouch = (e) => {
    const t = e.touches;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let dx = t.clientX - centerX;
    let dy = t.clientY - centerY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const limit = 40;

    if (dist > limit) { dx *= limit/dist; dy *= limit/dist; }
    
    setJoy({ x: dx, y: dy });
    move.current = { x: dx / limit, y: dy / limit };
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', touchAction: 'none', overflow: 'hidden' }}>
      <div ref={mountRef} />
      
      {/* Joystick UI */}
      <div 
        onTouchMove={handleTouch} 
        onTouchEnd={() => {setJoy({x:0,y:0}); move.current={x:0,y:0}}}
        style={{ 
          position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', 
          width: '100px', height: '100px', borderRadius: '50%', border: '3px solid white', 
          background: 'rgba(255,255,255,0.2)', zIndex: 10 
        }}
      >
        <div style={{ 
          width: '40px', height: '40px', background: 'white', borderRadius: '50%', 
          position: 'absolute', left: '30px', top: '30px', 
          transform: `translate(${joy.x}px, ${joy.y}px)` 
        }} />
      </div>
    </div>
  );
}
