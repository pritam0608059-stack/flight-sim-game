import * as THREE from 'three';

export function createAeroplane() {
  const plane = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.4, roughness: 0.2 });

  // Body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.4, 10, 16), bodyMat);
  body.rotation.x = Math.PI / 2;
  
  // Wings
  const wings = new THREE.Mesh(new THREE.BoxGeometry(16, 0.1, 3.5), bodyMat);
  
  // Tail
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3, 2), bodyMat);
  tail.position.set(0, 1.5, 4);

  plane.add(body, wings, tail);
  return plane;
}
