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
