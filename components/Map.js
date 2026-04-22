import * as THREE from 'three';

export function createMap(scene) {
  const loader = new THREE.TextureLoader();
  const groundTex = loader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg'); 
  groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;
  groundTex.repeat.set(1000, 1000); 

  const groundGeo = new THREE.PlaneGeometry(100000, 100000);
  const groundMat = new THREE.MeshStandardMaterial({ map: groundTex });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
}
