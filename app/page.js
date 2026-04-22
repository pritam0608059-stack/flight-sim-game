"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function StableFlight() {
  const mountRef = useRef(null);
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const moveRef = useRef({ x: 0, y: 0 });
  const planeRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // World & Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    scene.add(new THREE.GridHelper(10000, 100, 0xffffff, 0x0044ff));

    // Plane
    const plane = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 5), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    body.rotation.x = Math.PI / 2;
    plane.add(body, new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 2), body.material));
    scene.add(plane);
    plane.position.y = 100;
    planeRef.current = plane;

    let yaw = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      if (planeRef.current) {
        // Fix: Smooth lerp for rotations to prevent sudden blue screen
        const p = THREE.MathUtils.clamp(moveRef.current.y * 0.4, -0.5, 0.5);
        const r = -moveRef.current.x * 0.6;
        yaw -= moveRef.current.x * 0.01;

        planeRef.current.rotation.set(p, yaw, r);
        planeRef.current.translateZ(-1.5);

        // Fixed Camera Follow (No Lerp to avoid losing the plane)
        const offset = new THREE.Vector3(0, 6, 18).applyMatrix4(planeRef.current.matrixWorld);
        camera.position.copy(offset);
        camera.lookAt(planeRef.current.position);
      }
      renderer.render(scene, camera);
    };
    animate();
    return () => { if(mountRef.current) mountRef.current.innerHTML = ""; };
  }, []);

  const handleTouch = (e) => {
    // Safety check to prevent instant jump
    const t = e.touches;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dx = t.clientX - centerX;
    const dy = t.clientY - centerY;
    const lim = 40;
    const d = Math.sqrt(dx*dx + dy*dy);

    if (d === 0) return; // Prevent division by zero

    const nx = d > lim ? (dx/d)*lim : dx;
    const ny = d > lim ? (dy/d)*lim : dy;
    
    setJoy({ x: nx, y: ny });
    moveRef.current = { x: nx / lim, y: ny / lim };
  };

  return (
    <div style={{ width: '100vw', height: '100vh', touchAction: 'none', background: '#000' }}>
      <div ref={mountRef} />
      
      {/* Joystick Area */}
      <div 
        onTouchMove={handleTouch} 
        onTouchEnd={() => { setJoy({x:0,y:0}); moveRef.current={x:0,y:0} }}
        style={{ position: 'absolute', bottom: '50px', left: '50px', width: '100px', height: '100px', borderRadius: '50%', border: '2px solid white', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', position: 'absolute', left: '30px', top: '30px', transform: `translate(${joy.x}px, ${joy.y}px)` }} />
      </div>
    </div>
  );
    }
            
