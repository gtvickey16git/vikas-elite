/**
 * BUGATTI-SCENE.JS — 3D Bugatti Chiron Pur Sport & W16 Engine Simulator
 * Vikas Elite Portfolio // Mechanisms Showcase
 *
 * Features:
 *  - Procedural Three.js 3D Bugatti Chiron Pur Sport in Copper/Bronze metallic + Carbon Fiber
 *  - High-intensity WHITE Quad-LED Headlights with directional beams
 *  - Intense RED continuous full-width LED Taillight blade
 *  - Animated Scissor / Dihedral Doors (opening on scroll or click)
 *  - Michelin Pilot Sport Cup 2R Tires & Magnesium Wheels with Red Brake Calipers
 *  - Pur Sport 1.9m fixed carbon wing and dual 3D-printed titanium exhaust
 *  - Dedicated W16 16-Piston Reciprocating Mechanical Engine Simulator
 */

(function () {
  'use strict';

  let carScene, carCamera, carRenderer;
  let carGroup, doorLeftGroup, doorRightGroup, wheels = [], exhaustGlow, headlightBeamLeft, headlightBeamRight;
  let taillightGlow, taillightPointLight;
  let isDoorsOpen = false;
  let doorsProgress = 0;
  let targetDoorsProgress = 0;
  let isHeadlightsOn = true;
  let isTaillightsOn = true;

  // W16 Engine Simulator Variables
  let w16Scene, w16Camera, w16Renderer;
  let pistons = [], crankshaft, w16RPM = 3500;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. INIT MAIN 3D BUGATTI CHIRON PUR SPORT
  // ─────────────────────────────────────────────────────────────────────────────
  function initBugattiCar() {
    const container = document.getElementById('bugatti-3d-canvas');
    if (!container || typeof THREE === 'undefined') return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 540;

    carScene = new THREE.Scene();
    carScene.fog = new THREE.FogExp2(0x000000, 0.04);

    carCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    carCamera.position.set(5.2, 2.2, 4.8);

    carRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    carRenderer.setSize(width, height);
    carRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    carRenderer.shadowMap.enabled = true;
    carRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(carRenderer.domElement);

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.9);
    carScene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    keyLight.position.set(6, 8, 6);
    keyLight.castShadow = true;
    carScene.add(keyLight);

    const copperRimLight = new THREE.DirectionalLight(0xd48b59, 2.0);
    copperRimLight.position.set(-6, 4, -5);
    carScene.add(copperRimLight);

    const violetFill = new THREE.PointLight(0xa855f7, 1.2, 15);
    violetFill.position.set(0, 5, 0);
    carScene.add(violetFill);

    // Ground mirror plane
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x050403,
      roughness: 0.25,
      metalness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    carScene.add(ground);

    // Build the car
    buildChironPurSport();

    // Mouse drag interaction
    setupCarInteractions(container);

    // Button controls
    setupToolbarControls();

    // Resize
    window.addEventListener('resize', () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      carCamera.aspect = w / h;
      carCamera.updateProjectionMatrix();
      carRenderer.setSize(w, h);
    });

    animateCar();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BUILD CHIRON PUR SPORT MESHES
  // ─────────────────────────────────────────────────────────────────────────────
  function buildChironPurSport() {
    carGroup = new THREE.Group();
    carScene.add(carGroup);

    // Materials
    // Copper / Rose Gold Metallic Lacquer (matching user's uploaded image)
    const copperPaintMat = new THREE.MeshStandardMaterial({
      color: 0xc47b4d,
      roughness: 0.22,
      metalness: 0.88,
    });

    // Exposed Carbon Fiber Material
    const carbonFiberMat = new THREE.MeshStandardMaterial({
      color: 0x111114,
      roughness: 0.4,
      metalness: 0.4,
    });

    // Smoked Glass for Cockpit & Windshield
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0a10,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });

    // Wheel rubber & rim materials
    const tireRubberMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, metalness: 0.9, roughness: 0.2 });
    const brakeCaliperMat = new THREE.MeshStandardMaterial({ color: 0xd31027, roughness: 0.3 }); // Red Bugatti Caliper

    // 1. Main Monocoque Body
    const bodyGeo = new THREE.BoxGeometry(2.0, 0.58, 4.4);
    const bodyMesh = new THREE.Mesh(bodyGeo, copperPaintMat);
    bodyMesh.position.set(0, 0.46, 0);
    bodyMesh.castShadow = true;
    carGroup.add(bodyMesh);

    // Front Nose / Horseshoe Hood
    const hoodGeo = new THREE.ConeGeometry(0.95, 1.2, 5);
    const hoodMesh = new THREE.Mesh(hoodGeo, copperPaintMat);
    hoodMesh.rotation.x = Math.PI / 2;
    hoodMesh.rotation.y = Math.PI;
    hoodMesh.position.set(0, 0.44, 1.7);
    carGroup.add(hoodMesh);

    // Signature Bugatti Horseshoe Grille with red "16" inside
    const grilleOuterGeo = new THREE.TorusGeometry(0.35, 0.05, 16, 32, Math.PI);
    const grilleMesh = new THREE.Mesh(grilleOuterGeo, carbonFiberMat);
    grilleMesh.position.set(0, 0.35, 2.22);
    grilleMesh.rotation.z = Math.PI;
    carGroup.add(grilleMesh);

    // Red "16" emblem inside grille
    const emblem16Geo = new THREE.BoxGeometry(0.24, 0.18, 0.02);
    const emblem16Mat = new THREE.MeshBasicMaterial({ color: 0xff1122 });
    const emblem16 = new THREE.Mesh(emblem16Geo, emblem16Mat);
    emblem16.position.set(0, 0.34, 2.21);
    carGroup.add(emblem16);

    // Roof & Cockpit Cabin
    const cabinGeo = new THREE.BoxGeometry(1.4, 0.44, 1.9);
    const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
    cabinMesh.position.set(0, 0.88, -0.1);
    carGroup.add(cabinMesh);

    // Bugatti Signature C-Line (Alloy / Copper trim along cabin side)
    [-1, 1].forEach(side => {
      const cLineGeo = new THREE.TorusGeometry(0.65, 0.04, 8, 24, Math.PI * 1.3);
      const cLineMat = new THREE.MeshStandardMaterial({ color: 0xe29d6f, metalness: 0.9, roughness: 0.2 });
      const cLine = new THREE.Mesh(cLineGeo, cLineMat);
      cLine.position.set(side * 0.98, 0.65, -0.15);
      cLine.rotation.y = side * Math.PI / 2;
      carGroup.add(cLine);
    });

    // 2. Scissor / Dihedral Doors (Rigged with pivot groups)
    doorLeftGroup = new THREE.Group();
    doorLeftGroup.position.set(-0.95, 0.65, 0.4);
    const leftDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 1.1), copperPaintMat);
    leftDoorPanel.position.set(0, -0.1, -0.4);
    doorLeftGroup.add(leftDoorPanel);
    carGroup.add(doorLeftGroup);

    doorRightGroup = new THREE.Group();
    doorRightGroup.position.set(0.95, 0.65, 0.4);
    const rightDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 1.1), copperPaintMat);
    rightDoorPanel.position.set(0, -0.1, -0.4);
    doorRightGroup.add(rightDoorPanel);
    carGroup.add(doorRightGroup);

    // 3. Pur Sport 1.9-Meter Fixed Carbon Rear Wing
    const wingGeo = new THREE.BoxGeometry(2.3, 0.04, 0.45);
    const wingMesh = new THREE.Mesh(wingGeo, carbonFiberMat);
    wingMesh.position.set(0, 1.05, -2.05);

    // Dual Angled Support Pylons
    [-0.55, 0.55].forEach(xPos => {
      const pylonGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.45, 8);
      const pylon = new THREE.Mesh(pylonGeo, carbonFiberMat);
      pylon.position.set(xPos, 0.85, -2.02);
      pylon.rotation.x = -0.2;
      carGroup.add(pylon);
    });

    // Wing Endplates
    [-1.15, 1.15].forEach(xPos => {
      const endplateGeo = new THREE.BoxGeometry(0.03, 0.16, 0.46);
      const endplate = new THREE.Mesh(endplateGeo, carbonFiberMat);
      endplate.position.set(xPos, 1.05, -2.05);
      carGroup.add(endplate);
    });
    carGroup.add(wingMesh);

    // 4. Titanium Dual Center Exhaust with Heat Blue Glow
    const exhaustGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.35, 16);
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.2,
      metalness: 0.95,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.4,
    });
    [-0.12, 0.12].forEach(x => {
      const pipe = new THREE.Mesh(exhaustGeo, titaniumMat);
      pipe.position.set(x, 0.35, -2.25);
      pipe.rotation.x = Math.PI / 2;
      carGroup.add(pipe);
    });

    // Rear Diffuser
    const diffuserGeo = new THREE.BoxGeometry(1.8, 0.18, 0.5);
    const diffuserMesh = new THREE.Mesh(diffuserGeo, carbonFiberMat);
    diffuserMesh.position.set(0, 0.25, -2.15);
    carGroup.add(diffuserMesh);

    // 5. LIGHTING: Front Quad-LED White Headlights
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-0.72, 0.72].forEach((xSide, i) => {
      // 4 horizontal LED blocks
      for (let j = 0; j < 4; j++) {
        const ledGeo = new THREE.BoxGeometry(0.06, 0.035, 0.05);
        const led = new THREE.Mesh(ledGeo, headlightMat);
        led.position.set(xSide + (xSide > 0 ? -j * 0.07 : j * 0.07), 0.54, 2.1 - j * 0.02);
        carGroup.add(led);
      }

      // Forward SpotLight beam
      const spot = new THREE.SpotLight(0xffffff, 3.5, 12, Math.PI / 6, 0.4);
      spot.position.set(xSide, 0.55, 2.15);
      spot.target.position.set(xSide * 1.2, 0.1, 7);
      carScene.add(spot.target);
      carScene.add(spot);
      if (i === 0) headlightBeamLeft = spot;
      else headlightBeamRight = spot;
    });

    // 6. LIGHTING: Rear Full-Width Continuous Red LED Blade
    const taillightGeo = new THREE.BoxGeometry(1.85, 0.035, 0.04);
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
    taillightGlow = new THREE.Mesh(taillightGeo, taillightMat);
    taillightGlow.position.set(0, 0.58, -2.21);
    carGroup.add(taillightGlow);

    taillightPointLight = new THREE.PointLight(0xff0022, 2.8, 4);
    taillightPointLight.position.set(0, 0.6, -2.4);
    carGroup.add(taillightPointLight);

    // 7. Michelin Pilot Sport Cup 2R Tires & Magnesium Wheels
    const wheelPositions = [
      { x: -0.96, y: 0.36, z: 1.35, isFront: true },  // Front Left
      { x: 0.96,  y: 0.36, z: 1.35, isFront: true },  // Front Right
      { x: -0.98, y: 0.38, z: -1.35, isFront: false }, // Rear Left (wider)
      { x: 0.98,  y: 0.38, z: -1.35, isFront: false }, // Rear Right (wider)
    ];

    wheels = [];
    wheelPositions.forEach((pos, idx) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos.x, pos.y, pos.z);

      const radius = pos.isFront ? 0.36 : 0.38;
      const width = pos.isFront ? 0.28 : 0.35; // Wider rear 355/25 R21

      // Rubber Tire
      const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 24);
      const tire = new THREE.Mesh(tireGeo, tireRubberMat);
      tire.rotation.z = Math.PI / 2;
      wheelGroup.add(tire);

      // Magnesium Rim
      const rimGeo = new THREE.CylinderGeometry(radius * 0.75, radius * 0.75, width + 0.01, 16);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      // Aero-blades on wheels
      for (let s = 0; s < 5; s++) {
        const spokeGeo = new THREE.BoxGeometry(radius * 0.68, 0.04, 0.02);
        const spoke = new THREE.Mesh(spokeGeo, copperPaintMat);
        spoke.rotation.x = (s * Math.PI) / 2.5;
        spoke.position.set(pos.x > 0 ? width / 2 : -width / 2, 0, 0);
        wheelGroup.add(spoke);
      }

      // Red Caliper & Brake Disc
      const discGeo = new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, 0.04, 16);
      const disc = new THREE.Mesh(discGeo, new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9 }));
      disc.rotation.z = Math.PI / 2;
      wheelGroup.add(disc);

      const caliperGeo = new THREE.BoxGeometry(0.12, 0.18, 0.08);
      const caliper = new THREE.Mesh(caliperGeo, brakeCaliperMat);
      caliper.position.set(0, radius * 0.32, 0);
      wheelGroup.add(caliper);

      carGroup.add(wheelGroup);
      wheels.push(wheelGroup);
    });

    // 8. Visible Mid-Engine Bay W16 Block
    const engineBlockGeo = new THREE.BoxGeometry(0.9, 0.3, 0.9);
    const engineBlockMat = new THREE.MeshStandardMaterial({ color: 0x333338, metalness: 0.8, roughness: 0.3 });
    const engineBlock = new THREE.Mesh(engineBlockGeo, engineBlockMat);
    engineBlock.position.set(0, 0.62, -0.85);
    carGroup.add(engineBlock);

    // Carbon Intake plenums
    [-0.22, 0.22].forEach(xp => {
      const plenumGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 12);
      const plenum = new THREE.Mesh(plenumGeo, carbonFiberMat);
      plenum.rotation.x = Math.PI / 2;
      plenum.position.set(xp, 0.78, -0.85);
      carGroup.add(plenum);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CAR INTERACTIONS & CAMERA CONTROLS
  // ─────────────────────────────────────────────────────────────────────────────
  function setupCarInteractions(container) {
    let isDragging = false;
    let prevX = 0, prevY = 0;

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    container.addEventListener('mousemove', (e) => {
      if (!isDragging || !carGroup) return;
      const deltaX = e.clientX - prevX;
      const deltaY = e.clientY - prevY;

      carGroup.rotation.y += deltaX * 0.008;
      carCamera.position.y = Math.max(0.8, Math.min(4.5, carCamera.position.y - deltaY * 0.008));

      prevX = e.clientX;
      prevY = e.clientY;
    });

    // Touch support
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && carGroup) {
        const deltaX = e.touches[0].clientX - prevX;
        carGroup.rotation.y += deltaX * 0.008;
        prevX = e.touches[0].clientX;
      }
    }, { passive: true });

    // Scroll-driven Door Opening & Wheel Rotation
    window.addEventListener('scroll', () => {
      const section = document.getElementById('mechanisms');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (rect.top < viewportHeight && rect.bottom > 0) {
        const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height)));

        // Open doors in mid-scroll stage
        if (progress > 0.28 && progress < 0.75) {
          targetDoorsProgress = 1;
        } else if (!isDoorsOpen) {
          targetDoorsProgress = 0;
        }

        // Spin wheels slowly on scroll
        wheels.forEach(w => {
          w.rotation.x += 0.04;
        });
      }
    }, { passive: true });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TOOLBAR CONTROLS & PRESET CAMERAS
  // ─────────────────────────────────────────────────────────────────────────────
  function setupToolbarControls() {
    // 1. Orbit 360
    const btnOrbit = document.getElementById('btn-car-orbit');
    if (btnOrbit) {
      btnOrbit.addEventListener('click', () => {
        carCamera.position.set(5.2, 2.2, 4.8);
        if (carGroup) carGroup.rotation.set(0, 0, 0);
      });
    }

    // 2. Open / Close Doors
    const btnDoors = document.getElementById('btn-car-doors');
    if (btnDoors) {
      btnDoors.addEventListener('click', () => {
        isDoorsOpen = !isDoorsOpen;
        targetDoorsProgress = isDoorsOpen ? 1 : 0;
        btnDoors.classList.toggle('active', isDoorsOpen);
        btnDoors.innerHTML = isDoorsOpen 
          ? '<i class="fas fa-door-closed"></i> Close Scissor Doors' 
          : '<i class="fas fa-door-open"></i> Open Scissor Doors';
      });
    }

    // 3. Inspect W16 Engine
    const btnEngine = document.getElementById('btn-car-engine');
    if (btnEngine) {
      btnEngine.addEventListener('click', () => {
        carCamera.position.set(0, 3.4, -2.8);
        if (carGroup) carGroup.rotation.y = Math.PI;
      });
    }

    // 4. Tires & Wheels Focus
    const btnTires = document.getElementById('btn-car-tires');
    if (btnTires) {
      btnTires.addEventListener('click', () => {
        carCamera.position.set(2.4, 0.8, 2.2);
        if (carGroup) carGroup.rotation.y = 0.5;
      });
    }

    // 5. Aero Wing & Exhaust
    const btnAero = document.getElementById('btn-car-aero');
    if (btnAero) {
      btnAero.addEventListener('click', () => {
        carCamera.position.set(0, 1.8, -4.5);
        if (carGroup) carGroup.rotation.y = 0;
      });
    }

    // 6. Toggle Headlights (White)
    const btnHeadlights = document.getElementById('btn-toggle-front-lights');
    if (btnHeadlights) {
      btnHeadlights.addEventListener('click', () => {
        isHeadlightsOn = !isHeadlightsOn;
        if (headlightBeamLeft) headlightBeamLeft.intensity = isHeadlightsOn ? 3.5 : 0;
        if (headlightBeamRight) headlightBeamRight.intensity = isHeadlightsOn ? 3.5 : 0;
        btnHeadlights.classList.toggle('front-light-active', isHeadlightsOn);
      });
    }

    // 7. Toggle Taillight (Red)
    const btnTaillights = document.getElementById('btn-toggle-back-lights');
    if (btnTaillights) {
      btnTaillights.addEventListener('click', () => {
        isTaillightsOn = !isTaillightsOn;
        if (taillightPointLight) taillightPointLight.intensity = isTaillightsOn ? 2.8 : 0;
        if (taillightGlow) taillightGlow.material.color.setHex(isTaillightsOn ? 0xff0022 : 0x220005);
        btnTaillights.classList.toggle('back-light-active', isTaillightsOn);
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CAR ANIMATION LOOP
  // ─────────────────────────────────────────────────────────────────────────────
  function animateCar() {
    requestAnimationFrame(animateCar);

    // Smooth door lerp
    doorsProgress += (targetDoorsProgress - doorsProgress) * 0.08;
    if (doorLeftGroup && doorRightGroup) {
      // Rotate upward and forward like iconic dihedral doors
      doorLeftGroup.rotation.z = -doorsProgress * 0.75;
      doorLeftGroup.rotation.y = doorsProgress * 0.35;
      doorLeftGroup.position.y = 0.65 + doorsProgress * 0.28;

      doorRightGroup.rotation.z = doorsProgress * 0.75;
      doorRightGroup.rotation.y = -doorsProgress * 0.35;
      doorRightGroup.position.y = 0.65 + doorsProgress * 0.28;
    }

    // Idle rotation when not dragging
    if (carGroup) {
      carGroup.rotation.y += 0.003;
    }

    carRenderer.render(carScene, carCamera);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. DEDICATED W16 16-PISTON MECHANICAL ENGINE SIMULATOR
  // ─────────────────────────────────────────────────────────────────────────────
  function initW16EngineSimulator() {
    const container = document.getElementById('w16-engine-canvas');
    if (!container || typeof THREE === 'undefined') return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 380;

    w16Scene = new THREE.Scene();
    w16Camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    w16Camera.position.set(0, 3.2, 5.2);
    w16Camera.lookAt(0, 0, 0);

    w16Renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    w16Renderer.setSize(width, height);
    w16Renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(w16Renderer.domElement);

    // Lights
    const amb = new THREE.AmbientLight(0xfff0e5, 1.2);
    w16Scene.add(amb);
    const dir = new THREE.DirectionalLight(0xd48b59, 2.5);
    dir.position.set(4, 6, 4);
    w16Scene.add(dir);

    // Build the 16 Pistons in W-Configuration (4 banks of 4 pistons)
    buildW16Pistons();

    // RPM Slider
    const slider = document.getElementById('w16-rpm-slider');
    const rpmVal = document.getElementById('w16-rpm-display');
    if (slider) {
      slider.addEventListener('input', (e) => {
        w16RPM = parseInt(e.target.value, 10);
        if (rpmVal) rpmVal.textContent = `${w16RPM.toLocaleString()} RPM`;
      });
    }

    animateW16Engine();
  }

  function buildW16Pistons() {
    pistons = [];

    // Crankshaft Center Bar
    const crankGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.6, 16);
    const crankMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    crankshaft = new THREE.Mesh(crankGeo, crankMat);
    crankshaft.rotation.z = Math.PI / 2;
    w16Scene.add(crankshaft);

    // Materials
    const pistonHeadMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

    // 4 cylinder banks at W-Angles: -45°, -15°, +15°, +45°
    const bankAngles = [-0.75, -0.25, 0.25, 0.75]; // radians

    bankAngles.forEach((angle, bankIdx) => {
      for (let cylinder = 0; cylinder < 4; cylinder++) {
        const pistonGroup = new THREE.Group();

        // Piston Crown
        const crownGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.22, 16);
        const crown = new THREE.Mesh(crownGeo, pistonHeadMat);
        pistonGroup.add(crown);

        // Connecting Rod
        const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8);
        const rod = new THREE.Mesh(rodGeo, rodMat);
        rod.position.y = -0.55;
        pistonGroup.add(rod);

        // Combustion spark flash at top of stroke
        const flameGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.y = 0.25;
        flame.visible = false;
        pistonGroup.add(flame);

        // Position along the longitudinal crankshaft (-1.5 to +1.5)
        const zPos = -1.35 + cylinder * 0.9;
        pistonGroup.position.set(0, 0, zPos);
        pistonGroup.rotation.z = angle;

        w16Scene.add(pistonGroup);

        pistons.push({
          group: pistonGroup,
          flame: flame,
          bank: bankIdx,
          cylinder: cylinder,
          baseAngle: angle,
          phase: (cylinder * Math.PI / 2) + (bankIdx * Math.PI / 4),
        });
      }
    });
  }

  let w16Time = 0;
  function animateW16Engine() {
    requestAnimationFrame(animateW16Engine);

    const speedFactor = (w16RPM / 60) * 0.003;
    w16Time += speedFactor;

    // Rotate crankshaft
    if (crankshaft) {
      crankshaft.rotation.x = w16Time * Math.PI * 2;
    }

    // Animate each of the 16 pistons
    pistons.forEach(p => {
      const stroke = Math.sin(w16Time * Math.PI * 2 + p.phase);
      const strokeDist = 0.85 + stroke * 0.45;

      // Move along its radial bank vector
      const sinA = Math.sin(-p.baseAngle);
      const cosA = Math.cos(-p.baseAngle);

      p.group.position.x = sinA * strokeDist;
      p.group.position.y = cosA * strokeDist;

      // Combustion flash near Top Dead Center
      p.flame.visible = stroke > 0.88;
    });

    w16Renderer.render(w16Scene, w16Camera);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DOM READY INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────────
  function init() {
    initBugattiCar();
    initW16EngineSimulator();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
