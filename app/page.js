"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function GeoFS_Fixed_Final() {
  const mountRef = useRef(null);
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const [thr, setThr] = useState(1.5); // Speed Control State
  const moveRef = useRef({ x: 0, y: 0 });
  const planeRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8), new THREE.DirectionalLight(0xffffff, 1));
    scene.add(new THREE.GridHelper(20000, 100, 0xffffff, 0x0044ff));

    // Realistic Plane Model
    const plane = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 7), mat);
    body.rotation.x = Math.PI / 2;
    plane.add(body, new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 3), mat));
    scene.add(plane);
    plane.position.y = 300;
    planeRef.current = plane;

    let yaw = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      if (planeRef.current) {
        // Strict Pitch/Roll limit to fix Blue Screen
        const p = THREE.MathUtils.clamp(moveRef.current.y * 0.4, -0.5, 0.5);
        const r = -moveRef.current.x * 0.6;
        yaw -= moveRef.current.x * 0.015;

        planeRef.current.rotation.set(p, yaw, r);
        planeRef.current.translateZ(-thr); // Speed using Throttle

        // Hard Camera Follow: Plane se 25 units peeche (Blue screen se door)
        const camPos = new THREE.Vector3(0, 10, 25).applyMatrix4(planeRef.current.matrixWorld);
        camera.position.copy(camPos);
        camera.lookAt(planeRef.current.position);
      }
      renderer.render(scene, camera);
    };
    animate();
    return () => { if(mountRef.current) mountRef.current.innerHTML = ""; };
  }, [thr]); // Re-run if throttle changes

  const handleJoy = (e) => {
    const t = e.touches;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = t.clientX - (rect.left + rect.width / 2);
    const dy = t.clientY - (rect.top + rect.height / 2);
    const lim = 40;
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
      
      {/* Flight HUD */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', color: '#0f0', fontFamily: 'monospace', fontSize: '18px', background: 'rgba(0,0,0,0.5)', padding: '10px' }}>
        SPEED: {Math.round(thr * 100)} KTS<br/>
        ALT: {planeRef.current ? Math.round(planeRef.current.position.y) : 0} FT
      </div>

      {/* JOYSTICK */}
      <div onTouchMove={handleJoy} onTouchEnd={() => {setJoy({x:0,y:0}); moveRef.current={x:0,y:0}}}
        style={{ position: 'absolute', bottom: '50px', left: '50px', width: '100px', height: '100px', borderRadius: '50%', border: '2px solid white', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', position: 'absolute', left: '30px', top: '30px', transform: `translate(${joy.x}px, ${joy.y}px)` }} />
      </div>

      {/* SPEED CONTROL (THROTTLE) */}
      <div style={{ position: 'absolute', bottom: '50px', right: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input type="range" min="0.5" max="5.0" step="0.1" value={thr} orient="vertical"
          onChange={(e) => setThr(parseFloat(e.target.value))}
          style={{ appearance: 'slider-vertical', width: '40px', height: '180px' }} />
        <span style={{ color: 'white', marginTop: '10px', fontWeight: 'bold' }}>SPEED</span>
      </div>
    </div>
  );
}
