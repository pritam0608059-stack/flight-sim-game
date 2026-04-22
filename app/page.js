"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function GeoFS_Final_Stable() {
  const mountRef = useRef(null);
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const [throttle, setThrottle] = useState(0.8);
  const move = useRef({ x: 0, y: 0 });
  const speed = useRef(0.8);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 100, 2500);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8), new THREE.DirectionalLight(0xffffff, 1));

    // ENVIRONMENT
    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), new THREE.MeshStandardMaterial({ color: 0x0055ff }));
    ocean.rotation.x = -Math.PI / 2;
    scene.add(ocean);

    for (let i = 0; i < 40; i++) {
      const island = new THREE.Mesh(new THREE.ConeGeometry(50, 30, 4), new THREE.MeshStandardMaterial({ color: 0x228b22 }));
      island.position.set(Math.random() * 6000 - 3000, 0, Math.random() * 6000 - 3000);
      scene.add(island);
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(25, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
      cloud.position.set(island.position.x, 300, island.position.z);
      cloud.scale.set(4, 0.6, 2);
      scene.add(cloud);
    }

    // PLANE
    const plane = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 7, 16), mat);
    body.rotation.x = Math.PI / 2;
    const wings = new THREE.Mesh(new THREE.BoxGeometry(14, 0.1, 2.8), mat);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 1.5), mat);
    tail.position.z = 3;
    plane.add(body, wings, tail);
    scene.add(plane);
    plane.position.y = 200;

    let pitch = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      // Fixed Blue Screen Logic: Limit Pitch
      pitch = THREE.MathUtils.clamp(pitch + move.current.y * 0.02, -0.6, 0.6);
      plane.rotation.set(pitch, plane.rotation.y - move.current.x * 0.02, -move.current.x * 0.6);
      plane.translateZ(-speed.current);

      const camOffset = new THREE.Vector3(0, 10, 30).applyMatrix4(plane.matrixWorld);
      camera.position.copy(camOffset);
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
    const d = Math.sqrt(dx*dx+dy*dy);
    const nx = d > lim ? (dx/d)*lim : dx;
    const ny = d > lim ? (dy/d)*lim : dy;
    setJoy({ x: nx, y: ny });
    move.current = { x: nx / lim, y: ny / lim };
  };

  return (
    <div style={{ width: '100vw', height: '100vh', touchAction: 'none', overflow: 'hidden' }}>
      <div ref={mountRef} />
      {/* JOYSTICK */}
      <div onTouchMove={handleJoy} onTouchEnd={() => {setJoy({x:0,y:0}); move.current={x:0,y:0}}}
        style={{ position: 'absolute', bottom: '50px', left: '50px', width: '120px', height: '120px', borderRadius: '50%', border: '4px solid white', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '50%', position: 'absolute', left: '35px', top: '35px', transform: `translate(${joy.x}px, ${joy.y}px)` }} />
      </div>
      {/* SPEED */}
      <div style={{ position: 'absolute', bottom: '50px', right: '50px' }}>
        <input type="range" min="0.2" max="5.0" step="0.1" orient="vertical" onChange={(e) => { setThrottle(e.target.value); speed.current = parseFloat(e.target.value); }} style={{ appearance: 'slider-vertical', height: '200px' }} />
      </div>
    </div>
  );
}
