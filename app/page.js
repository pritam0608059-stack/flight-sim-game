"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Game() {
  const mountRef = useRef(null);
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const move = useRef({ x: 0, y: 0 });
  const speed = useRef(0.8);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8), new THREE.DirectionalLight(0xffffff, 1));

    // Ground/Water
    const water = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), new THREE.MeshStandardMaterial({ color: 0x0044ff }));
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // Simple Plane
    const plane = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    body.rotation.x = Math.PI/2;
    plane.add(body);
    scene.add(plane);
    plane.position.y = 50;

    const animate = () => {
      requestAnimationFrame(animate);
      plane.rotation.x = THREE.MathUtils.clamp(plane.rotation.x + move.current.y * 0.02, -0.6, 0.6);
      plane.rotation.y -= move.current.x * 0.02;
      plane.translateZ(-speed.current);

      camera.position.copy(new THREE.Vector3(0, 5, 15).applyMatrix4(plane.matrixWorld));
      camera.lookAt(plane.position);
      renderer.render(scene, camera);
    };
    animate();
    return () => { if(mountRef.current) mountRef.current.innerHTML = ""; };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', touchAction: 'none' }}>
      <div ref={mountRef} />
      <div onTouchMove={(e) => {
        const t = e.touches;
        const dx = t.clientX - 100;
        const dy = t.clientY - (window.innerHeight - 100);
        setJoy({ x: dx/2, y: dy/2 });
        move.current = { x: dx/50, y: dy/50 };
      }} onTouchEnd={() => {setJoy({x:0,y:0}); move.current={x:0,y:0}}}
      style={{ position:'absolute', bottom:'50px', left:'50px', width:'100px', height:'100px', borderRadius:'50%', border:'2px solid white', background:'rgba(255,255,255,0.2)' }}>
        <div style={{ width:'40px', height:'40px', background:'#fff', borderRadius:'50%', position:'absolute', left:'30px', top:'30px', transform:`translate(${joy.x}px, ${joy.y}px)` }} />
      </div>
    </div>
  );
  }
  
