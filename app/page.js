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
      
