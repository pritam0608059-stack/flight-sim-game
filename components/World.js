import * as THREE from 'three';

export function setupScene(scene) {
  // Ocean
  const water = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), new THREE.MeshStandardMaterial({ color: 0x0044ff }));
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  // Mountains & Clouds
  for (let i = 0; i < 50; i++) {
    const h = Math.random() * 80 + 20;
    const m = new THREE.Mesh(new THREE.ConeGeometry(30, h, 4), new THREE.MeshStandardMaterial({ color: 0x4b3621 }));
    m.position.set(Math.random()*4000-2000, h/2, Math.random()*4000-2000);
    scene.add(m);

    const c = new THREE.Mesh(new THREE.SphereGeometry(20, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
    c.position.set(Math.random()*4000-2000, 300, Math.random()*4000-2000);
    c.scale.set(3, 0.5, 2);
    scene.add(c);
  }
}

export function createPlaneModel() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 6), mat);
  body.rotation.x = Math.PI / 2;
  const wing = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 2.5), mat);
  group.add(body, wing);
  return group;
                }
    
