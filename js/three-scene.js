/**
 * VIKAS.ELITE // Three.js 3D WebGL Graphics Engine
 * Powers the Hero Cyber Core Hologram & Bottom Interactive 3D Cyber Shield Lab
 */

// 1. HERO 3D CYBER CORE
function initHero3D() {
  const container = document.getElementById('webgl-canvas-hero');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || container.parentElement.clientWidth;
  const height = container.clientHeight || 500;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Group for all core elements
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  // Theme colors
  let primaryColor = 0x00ff9d;
  let secondaryColor = 0x00e5ff;

  // Outer Holographic Wireframe Sphere
  const sphereGeo = new THREE.IcosahedronGeometry(2.4, 2);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: primaryColor,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  coreGroup.add(sphereMesh);

  // Inner Solid Crystal Core
  const innerGeo = new THREE.OctahedronGeometry(1.2, 0);
  const innerMat = new THREE.MeshBasicMaterial({
    color: secondaryColor,
    wireframe: true,
    transparent: true,
    opacity: 0.8
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  coreGroup.add(innerMesh);

  // Orbiting Cyber Rings
  const ring1Geo = new THREE.TorusGeometry(3.2, 0.02, 16, 100);
  const ring1Mat = new THREE.MeshBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.6 });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 3;
  coreGroup.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(3.8, 0.015, 16, 100);
  const ring2Mat = new THREE.MeshBasicMaterial({ color: secondaryColor, transparent: true, opacity: 0.4 });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.y = Math.PI / 4;
  coreGroup.add(ring2);

  // Floating Cyber Particles
  const particleCount = 200;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 12;
    positions[i + 1] = (Math.random() - 0.5) * 12;
    positions[i + 2] = (Math.random() - 0.5) * 12;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: primaryColor,
    size: 0.05,
    transparent: true,
    opacity: 0.7
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    mouseX = (e.clientX - windowHalfX) * 0.0005;
    mouseY = (e.clientY - windowHalfY) * 0.0005;
  });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Rotate core elements
    sphereMesh.rotation.y = elapsedTime * 0.2;
    sphereMesh.rotation.x = elapsedTime * 0.1;

    innerMesh.rotation.y = -elapsedTime * 0.4;
    innerMesh.rotation.z = elapsedTime * 0.2;

    ring1.rotation.z = elapsedTime * 0.25;
    ring2.rotation.x = -elapsedTime * 0.15;

    particles.rotation.y = elapsedTime * 0.05;

    // Smooth mouse follow
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    coreGroup.rotation.y = targetX * 2;
    coreGroup.rotation.x = targetY * 2;

    renderer.render(scene, camera);
  }

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    const w = container.clientWidth || container.parentElement.clientWidth;
    const h = container.clientHeight || 500;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Update theme colors dynamically
  window.update3DTheme = (colorHex, secHex) => {
    sphereMat.color.setHex(colorHex);
    ring1Mat.color.setHex(colorHex);
    particleMat.color.setHex(colorHex);
    innerMat.color.setHex(secHex);
    ring2Mat.color.setHex(secHex);
  };
}

// 2. BOTTOM 3D CYBER SHIELD LAB
function initBottomLab3D() {
  const container = document.getElementById('webgl-canvas-bottom');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth;
  const height = container.clientHeight || 420;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Create Torus Knot Cyber Shield
  let knotGeo = new THREE.TorusKnotGeometry(1.5, 0.4, 100, 16, 2, 3);
  let knotMat = new THREE.MeshStandardMaterial({
    color: 0x00ff9d,
    emissive: 0x003322,
    roughness: 0.3,
    metalness: 0.8,
    wireframe: true
  });
  let knotMesh = new THREE.Mesh(knotGeo, knotMat);
  scene.add(knotMesh);

  // Surrounding Particle Field
  const pCount = 350;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);

  for (let i = 0; i < pCount * 3; i += 3) {
    pPos[i] = (Math.random() - 0.5) * 10;
    pPos[i + 1] = (Math.random() - 0.5) * 10;
    pPos[i + 2] = (Math.random() - 0.5) * 10;
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x00e5ff,
    size: 0.04,
    transparent: true,
    opacity: 0.6
  });
  const pField = new THREE.Points(pGeo, pMat);
  scene.add(pField);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x00ff9d, 2, 50);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x00e5ff, 2, 50);
  pointLight2.position.set(-5, -5, 5);
  scene.add(pointLight2);

  // Controls state
  let rotSpeed = 0.015;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  // Mouse drag to rotate 3D model
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  container.addEventListener('mousemove', (e) => {
    const deltaMove = {
      x: e.offsetX - previousMousePosition.x,
      y: e.offsetY - previousMousePosition.y
    };

    if (isDragging) {
      const deltaRotationQuaternion = new THREE.Quaternion()
        .setFromEuler(new THREE.Euler(
          deltaMove.y * 0.01,
          deltaMove.x * 0.01,
          0,
          'XYZ'
        ));
      knotMesh.quaternion.multiplyQuaternions(deltaRotationQuaternion, knotMesh.quaternion);
    }

    previousMousePosition = { x: e.offsetX, y: e.offsetY };
  });

  // Wireframe toggle
  const wireframeToggle = document.getElementById('lab-wireframe-toggle');
  if (wireframeToggle) {
    wireframeToggle.addEventListener('change', (e) => {
      knotMat.wireframe = e.target.checked;
      if (window.cyberAudio) window.cyberAudio.playClick();
    });
  }

  // Speed slider
  const speedSlider = document.getElementById('lab-speed-slider');
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      rotSpeed = parseFloat(e.target.value);
    });
  }

  // Animation Loop
  function renderLab() {
    requestAnimationFrame(renderLab);

    if (!isDragging) {
      knotMesh.rotation.x += rotSpeed;
      knotMesh.rotation.y += rotSpeed * 1.5;
    }

    pField.rotation.y -= rotSpeed * 0.3;

    renderer.render(scene, camera);
  }

  renderLab();

  // Resize handler
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight || 420;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initHero3D();
  initBottomLab3D();
});
