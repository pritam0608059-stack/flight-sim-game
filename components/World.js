import * as THREE from 'three';

export function createWorld(scene) {
  // Ocean
  const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(20000, 20000),
    new THREE.MeshStandardMaterial({ color: 0x0044ff, roughness: 0.1 })
  );
  ocean.rotation.x = -Math.PI / 2;
  scene.add(ocean);

  // Mountains & Clouds
  for (let i = 0; i < 50; i++) {
    const h = Math.random() * 100 + 20;
    const mountain = new THREE.Mesh(new THREE.ConeGeometry(40, h, 4), new THREE.MeshStandardMaterial({ color: 0x4b3621 }));
    mountain.position.set(Math.random() * 4000 - 2000, h/2, Math.random() * 4000 - 2000);
    scene.add(mountain);

    const cloud = new THREE.Mesh(new THREE.SphereGeometry(20, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }));
    cloud.position.set(Math.random() * 4000 - 2000, 250 + Math.random() * 100, Math.random() * 4000 - 2000);
    cloud.scale.set(3, 0.6, 2);
    scene.add(cloud);
  }
}

export function createPlane() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.4, 6), mat);
  body.rotation.x = Math.PI/2;
  const wings = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 2.5), mat);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 1.2), mat);
  tail.position.z = 2.8;
  group.add(body, wings, tail);
  return group;
}
