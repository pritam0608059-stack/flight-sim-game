"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function GeoFS_Pro() {
  const mountRef = useRef(null);
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const [throttle, setThrottle] = useState(0.8);
  const move = useRef({ x: 0, y: 0 });
  const speed = useRef(0.8);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Aasman
    scene.fog = new THREE.Fog(0x87ceeb, 10, 1500);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(100, 200, 100);
    scene.add(sun);

    // 1. NEELA PANI (Ocean)
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(10000, 10000),
      new THREE.MeshStandardMaterial({ color: 0x0044ff, roughness: 0.2 })
    );
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // 2. PAHAD aur PED (Mountains & Trees)
    for (let i = 0; i < 50; i++) {
      const h = Math.random() * 60 + 20;
      const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(30, h, 4),
        new THREE.MeshStandardMaterial({ color: 0x4b3621 }) // Brown Mountains
      );
      mountain.position.set(Math.random() * 2000 - 1000, h/2, Math.random() * 2000 - 1000);
      scene.add(mountain);

      // Chote Ped
      const tree = new THREE.Mesh(
        new THREE.CylinderGeometry(0, 3, 7),
        new THREE.MeshStandardMaterial({ color: 0x006400 })
      );
      tree.position.set(mountain.position.x + 10, 3.5, mountain.position.z + 10);
      scene.add(tree);
    }

    // 3. BADAL (Clouds)
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
    for (let i = 0; i < 40; i++) {
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(15, 8, 8), cloudMat);
      cloud.position.set(Math.random() * 3000 - 1500, 150 + Math.random() * 100, Math.random() * 3000 - 1500);
      cloud.scale.set(3, 1, 2);
      scene.add(cloud);
    }

    // 4. REAL PLANE MODEL (White & Red)
    const plane = new THREE.Group();
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const redMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.5, 6), whiteMat);
    body.rotation.x = Math.PI / 2;
    const wing = new THREE.Mesh(new THREE.BoxGeometry(11, 0.1, 2.2), whiteMat);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 1.2), whiteMat);
    tail.position.z = 2.6;
    const rudder = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 1.2), redMat);
    rudder.position.set(0, 0.8, 2.6);

    plane.add(body, wing, tail, rudder);
    scene.add(plane);
    plane.position.y = 100; // Unchai par start

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Control Handling
      plane.rotation.x += move.current.y * 0.035; 
      plane.rotation.z -= move.current.x * 0.05;
      plane.rotation.y -= move.current.x * 0.02;
      
      plane.translateZ(-speed.current);

      // Camera Follow
      const camPos = new THREE.Vector3(0, 6, 20).applyMatrix4(plane.matrixWorld);
      camera.position.lerp(camPos, 0.1);
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
    const lim = 45;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const nx = dist > lim ? (dx/dist)*lim : dx;
    const ny = dist > lim ? (dy/dist)*lim : dy;
    setJoy({ x: nx, y: ny });
    move.current = { x: nx / lim, y: ny / lim };
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', touchAction: 'none', overflow: 'hidden' }}>
      <div ref={mountRef} />
      
      {/* Flight Stats (HUD) */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'white', fontFamily: 'monospace', textShadow: '2px 2px black' }}>
        THR: {(speed.current * 100).toFixed(0)}%<br/>
        ALT: {Math.round(joy.y * -2 + 200)}m
      </div>

      {/* JOYSTICK (Left) */}
      <div onTouchMove={handleJoy} onTouchEnd={() => {setJoy({x:0,y:0}); move.current={x:0,y:0}}}
        style={{ position: 'absolute', bottom: '50px', left: '50px', width: '110px', height: '110px', borderRadius: '50%', border: '3px solid white', background: 'rgba(255,255,255,0.2)' }}>
        <div style={{ width: '45px', height: '45px', background: 'white', borderRadius: '50%', position: 'absolute', left: '32.5px', top: '32.5px', transform: `translate(${joy.x}px, ${joy.y}px)` }} />
      </div>

      {/* THROTTLE (Right Slider) */}
      <div style={{ position: 'absolute', bottom: '50px', right: '50px', height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <input type="range" min="0.2" max="3.0" step="0.1" value={throttle} orient="vertical"
          onChange={(e) => { setThrottle(e.target.value); speed.current = parseFloat(e.target.value); }}
          style={{ appearance: 'slider-vertical', width: '30px', height: '150px' }} />
        <b style={{ color: 'white', marginTop: '10px' }}>SPEED</b>
      </div>
    </div>
  );
}
