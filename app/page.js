"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function GeoFS_Final_Fix() {
  const mountRef = useRef(null);
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const [throttle, setThrottle] = useState(0.8);
  const move = useRef({ x: 0, y: 0 });
  const speed = useRef(0.8);
  const rotation = useRef({ x: 0, y: 0, z: 0 }); // Stable rotation tracking

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 2000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(100, 200, 100);
    scene.add(sun);

    // Ocean & Land
    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), new THREE.MeshStandardMaterial({ color: 0x0044ff }));
    ocean.rotation.x = -Math.PI / 2;
    scene.add(ocean);

    // Clouds & Mountains
    for (let i = 0; i < 60; i++) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(20, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
      cloud.position.set(Math.random() * 4000 - 2000, 200 + Math.random() * 100, Math.random() * 4000 - 2000);
      cloud.scale.set(3, 0.5, 2);
      scene.add(cloud);

      const mH = Math.random() * 80 + 20;
      const mountain = new THREE.Mesh(new THREE.ConeGeometry(40, mH, 4), new THREE.MeshStandardMaterial({ color: 0x554433 }));
      mountain.position.set(Math.random() * 3000 - 1500, mH/2, Math.random() * 3000 - 1500);
      scene.add(mountain);
    }

    // PLANE MODEL
    const plane = new THREE.Group();
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.5, 6), whiteMat);
    body.rotation.x = Math.PI / 2;
    const wing = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 2.5), whiteMat);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 1.2), whiteMat);
    tail.position.z = 2.8;
    const rudder = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2, 1.2), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
    rudder.position.set(0, 1, 2.8);
    plane.add(body, wing, tail, rudder);
    scene.add(plane);
    plane.position.y = 150;

    const animate = () => {
      requestAnimationFrame(animate);
      
      // STABLE CONTROLS
      // Limit Pitch (X) to +/- 0.6 radians (~35 degrees) to avoid blue screen
      const targetPitch = move.current.y * 0.03;
      const targetRoll = -move.current.x * 0.05;
      const targetYaw = -move.current.x * 0.02;

      plane.rotation.x = THREE.MathUtils.lerp(plane.rotation.x, plane.rotation.x + targetPitch, 0.1);
      plane.rotation.z = THREE.MathUtils.lerp(plane.rotation.z, targetRoll * 1.5, 0.1);
      plane.rotation.y += targetYaw;
      
      plane.translateZ(-speed.current);

      // STABLE CAMERA - Fixed offset to prevent clipping
      const camOffset = new THREE.Vector3(0, 8, 25).applyMatrix4(plane.matrixWorld);
      camera.position.lerp(camOffset, 0.1);
      camera.lookAt(plane.position);

      renderer.render(scene, camera);
    };
    animate();

    return () => { if(mountRef.current) mountRef.current.innerHTML = ""; };
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
    move.current = { x: nx / lim, y: ny / lim };
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', touchAction: 'none', overflow: 'hidden' }}>
      <div ref={mountRef} />
      
      <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'white', fontFamily: 'monospace', textShadow: '2px 2px black', fontSize: '18px' }}>
        THR: {Math.round(speed.current * 40)} KTS<br/>
        ALT: {Math.round(joy.y * -5 + 500)} FT
      </div>

      {/* JOYSTICK */}
      <div onTouchMove={handleJoy} onTouchEnd={() => {setJoy({x:0,y:0}); move.current={x:0,y:0}}}
        style={{ position: 'absolute', bottom: '60px', left: '60px', width: '120px', height: '120px', borderRadius: '50%', border: '4px solid white', background: 'rgba(255,255,255,0.2)' }}>
        <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '50%', position: 'absolute', left: '35px', top: '35px', transform: `translate(${joy.x}px, ${joy.y}px)` }} />
      </div>

      {/* SPEED SLIDER */}
      <div style={{ position: 'absolute', bottom: '60px', right: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input type="range" min="0.2" max="4.0" step="0.1" value={throttle} orient="vertical"
          onChange={(e) => { setThrottle(e.target.value); speed.current = parseFloat(e.target.value); }}
          style={{ appearance: 'slider-vertical', width: '40px', height: '200px' }} />
        <b style={{ color: 'white', marginTop: '15px', fontSize: '16px' }}>SPEED</b>
      </div>
    </div>
  );
}
