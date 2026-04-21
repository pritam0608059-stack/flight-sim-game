"use client";
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Game() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(2, 0.5, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light, new THREE.AmbientLight(0x404040));

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      plane.rotation.y += 0.01;
      plane.rotation.x += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', color: 'white', padding: '20px', background: 'rgba(0,0,0,0.3)' }}>
        <h1>3D Game Loading...</h1>
        <p>Agar box ghoom raha hai, toh game chal gaya!</p>
      </div>
    </div>
  );
}

"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Game() {
  const mountRef = useRef(null);
  const [controls, setControls] = useState({ up: false, down: false, left: false, right: false });

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const grid = new THREE.GridHelper(1000, 100, 0x000000, 0x555555);
    scene.add(grid);

    const geometry = new THREE.BoxGeometry(2, 0.5, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.y = 5;
    scene.add(plane);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 5);
    scene.add(light, new THREE.AmbientLight(0x404040));

    let speed = 0.2;

    const animate = () => {
      requestAnimationFrame(animate);

      // Controls logic for both Mobile and Desktop
      if (controls.up) plane.rotation.x -= 0.03;
      if (controls.down) plane.rotation.x += 0.03;
      if (controls.left) plane.rotation.z += 0.03;
      if (controls.right) plane.rotation.z -= 0.03;

      plane.translateZ(-speed);

      camera.position.set(plane.position.x, plane.position.y + 2, plane.position.z + 6);
      camera.lookAt(plane.position);

      renderer.render(scene, camera);
    };
    animate();

    return () => { if (mountRef.current) mountRef.current.removeChild(renderer.domElement); };
  }, [controls]);

  // Touch handlers for Mobile
  const handleTouch = (dir, start) => setControls(prev => ({ ...prev, [dir]: start }));

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div ref={mountRef} />
      
      {/* Mobile Control Buttons */}
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'grid', gap: '10px' }}>
        <button onTouchStart={() => handleTouch('up', true)} onTouchEnd={() => handleTouch('up', false)} style={btnStyle}>UP</button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onTouchStart={() => handleTouch('left', true)} onTouchEnd={() => handleTouch('left', false)} style={btnStyle}>LEFT</button>
          <button onTouchStart={() => handleTouch('right', true)} onTouchEnd={() => handleTouch('right', false)} style={btnStyle}>RIGHT</button>
        </div>
        <button onTouchStart={() => handleTouch('down', true)} onTouchEnd={() => handleTouch('down', false)} style={btnStyle}>DOWN</button>
      </div>
    </div>
  );
}

const btnStyle = {
  width: '60px', height: '60px', background: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '10px', fontWeight: 'bold'
};
