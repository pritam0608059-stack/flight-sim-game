"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Game() {
  const mountRef = useRef(null);
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const move = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x00bfff); // Deep Sky Blue
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(10, 20, 10);
    scene.add(sun, new THREE.AmbientLight(0xffffff, 0.7));

    scene.add(new THREE.GridHelper(2000, 50, 0xffffff, 0x000000));

    // NEON PLANE
    const plane = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 4), new THREE.MeshStandardMaterial({color: 0x39FF14}));
    body.rotation.x = Math.PI/2;
    const wings = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 1.5), new THREE.MeshStandardMaterial({color: 0x39FF14}));
    plane.add(body, wings);
    scene.add(plane);
    plane.position.y = 20;

    const animate = () => {
      requestAnimationFrame(animate);
      plane.rotation.x += move.current.y * 0.04;
      plane.rotation.z -= move.current.x * 0.05;
      plane.translateZ(-0.8);
      camera.position.lerp(new THREE.Vector3(0, 5, 12).applyMatrix4(plane.matrixWorld), 0.1);
      camera.lookAt(plane.position);
      renderer.render(scene, camera);
    };
    animate();
  }, []);

  const touch = (e) => {
    const t = e.touches;
    const dx = t.clientX - window.innerWidth/2;
    const dy = t.clientY - (window.innerHeight - 100);
    const d = Math.sqrt(dx*dx+dy*dy);
    const lim = 50;
    const nx = d > lim ? (dx/d)*lim : dx;
    const ny = d > lim ? (dy/d)*lim : dy;
    setJoy({ x: nx, y: ny });
    move.current = { x: nx/lim, y: ny/lim };
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', touchAction: 'none' }}>
      <div ref={mountRef} />
      <div onTouchMove={touch} onTouchEnd={() => {setJoy({x:0,y:0}); move.current={x:0,y:0}}}
           style={{ position:'absolute', bottom:'40px', left:'50%', transform:'translateX(-50%)', width:'120px', height:'120px', borderRadius:'50%', border:'4px solid white', background:'rgba(255,255,255,0.2)' }}>
        <div style={{ width:'50px', height:'50px', background:'#fff', borderRadius:'50%', position:'absolute', left:'35px', top:'35px', transform:`translate(${joy.x}px, ${joy.y}px)` }} />
      </div>
    </div>
  );
}
