use client";
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

  const handleTouch = (dir, start) => setControls(prev => ({ ...prev, [dir]: start }));

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div ref={mountRef} />
      <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <button onTouchStart={() => handleTouch('up', true)} onTouchEnd={() => handleTouch('up', false)} onMouseDown={() => handleTouch('up', true)} onMouseUp={() => handleTouch('up', false)} style={btnStyle}>UP</button>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onTouchStart={() => handleTouch('left', true)} onTouchEnd={() => handleTouch('left', false)} onMouseDown={() => handleTouch('left', true)} onMouseUp={() => handleTouch('left', false)} style={btnStyle}>LEFT</button>
          <button onTouchStart={() => handleTouch('right', true)} onTouchEnd={() => handleTouch('right', false)} onMouseDown={() => handleTouch('right', true)} onMouseUp={() => handleTouch('right', false)} style={btnStyle}>RIGHT</button>
        </div>
        <button onTouchStart={() => handleTouch('down', true)} onTouchEnd={() => handleTouch('down', false)} onMouseDown={() => handleTouch('down', true)} onMouseUp={() => handleTouch('down', false)} style={btnStyle}>DOWN</button>
      </div>
    </div>
  );
}

const btnStyle = {
  width: '70px', height: '70px', background: 'rgba(255,255,255,0.7)', border: '2px solid black', borderRadius: '50%', fontWeight: 'bold', fontSize: '14px', touchAction: 'none'
};
        
