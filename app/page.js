"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function RealFlightSim() {
  const mountRef = useRef(null);
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const [thr, setThr] = useState(1.5);
  const moveRef = useRef({ x: 0, y: 0 });
  const planeRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 200, 5000);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6), new THREE.DirectionalLight(0xffffff, 1));
    scene.add(new THREE.GridHelper(50000, 150, 0x0044ff, 0x002288));

    // --- REALISTIC AEROPLANE DESIGN ---
    const plane = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, metalness: 0.3, roughness: 0.3 });
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 });

    // Fuselage (Body)
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.5, 10, 18), bodyMat);
    fuselage.rotation.x = Math.PI / 2;
    plane.add(fuselage);

    // Nose Cone
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), bodyMat);
    nose.position.z = -5;
    nose.scale.set(1, 0.9, 1.2);
    plane.add(nose);

    // Main Wings
    const wing = new THREE.Mesh(new THREE.BoxGeometry(16, 0.15, 3.5), bodyMat);
    wing.position.z = 0.5;
    plane.add(wing);

    // Two Engines
    const engineGeo = new THREE.CylinderGeometry(0.55, 0.45, 2, 12);
    const engineL = new THREE.Mesh(engineGeo, engineMat);
    engineL.rotation.x = Math.PI / 2;
    engineL.position.set(-4.5, -0.7, 0);
    const engineR = engineL.clone();
    engineR.position.x = 4.5;
    plane.add(engineL, engineR);

    // Tail Assembly
    const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3, 2), bodyMat);
    tailFin.position.set(0, 1.5, 4);
    const rearWings = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 1.5), bodyMat);
    rearWings.position.z = 4.2;
    plane.add(tailFin, rearWings);

    scene.add(plane);
    plane.position.y = 400;
    planeRef.current = plane;

    let yaw = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      if (planeRef.current) {
        // Anti-Blue Screen Rotation
        const p = THREE.MathUtils.clamp(moveRef.current.y * 0.4, -0.5, 0.5);
        const r = -moveRef.current.x * 0.7;
        yaw -= moveRef.current.x * 0.015;

        planeRef.current.rotation.set(p, yaw, r);
        planeRef.current.translateZ(-thr);

        // Fixed Follow Camera
        const camPos = new THREE.Vector3(0, 10, 28).applyMatrix4(planeRef.current.matrixWorld);
        camera.position.copy(camPos);
        camera.lookAt(planeRef.current.position);
      }
      renderer.render(scene, camera);
    };
    animate();
    return () => { if(mountRef.current) mountRef.current.innerHTML = ""; };
  }, [thr]);

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
      
      {/* HUD Panel */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', color: '#0f0', fontFamily: 'monospace', fontSize: '18px', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px' }}>
        ALT: {planeRef.current ? Math.round(planeRef.current.position.y) : 0} FT | SPD: {Math.round(thr * 130)} KTS
      </div>

      {/* Joystick */}
      <div onTouchMove={handleJoy} onTouchEnd={() => {setJoy({x:0,y:0}); moveRef.current={x:0,y:0}}}
        style={{ position: 'absolute', bottom: '60px', left: '60px', width: '120px', height: '120px', borderRadius: '50%', border: '4px solid white', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '50%', position: 'absolute', left: '35px', top: '35px', transform: `translate(${joy.x}px, ${joy.y}px)`, boxShadow: '0 0 15px white' }} />
      </div>

      {/* Throttle (Speed) */}
      <div style={{ position: 'absolute', bottom: '60px', right: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input type="range" min="0.5" max="6.0" step="0.1" value={thr} orient="vertical" onChange={(e) => setThr(parseFloat(e.target.value))} style={{ appearance: 'slider-vertical', height: '220px', width: '40px' }} />
        <span style={{ color: 'white', marginTop: '10px', fontWeight: 'bold', fontSize: '14px' }}>THROTTLE</span>
      </div>
    </div>
  );
}
