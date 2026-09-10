/**
 * BUGATTI-MECHANISMS.JS
 * All Three.js 3D mechanism scenes + scroll animations + preloader
 * Sections: Car Explorer, W16 Engine, Turbo, Exhaust, Silencer, Spoiler, Doors, Interior
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // GLOBAL VARIABLES
  // ═══════════════════════════════════════════════════════════════════════════
  const COPPER = 0xc47b4d;
  const CARBON = 0x111114;
  const CHROME = 0x94a3b8;
  const DARK_STEEL = 0x333338;
  const RED = 0xff0022;
  const WHITE = 0xffffff;

  const sections = [];
  let currentSection = 0;

  // Car scene
  let carScene, carCamera, carRenderer, carGroup;
  let doorLeftGroup, doorRightGroup, wheels = [];
  let headlightBeamLeft, headlightBeamRight, taillightGlow, taillightPointLight;
  let isDoorsOpen = false, doorsProgress = 0, targetDoorsProgress = 0;

  // W16 Engine
  let w16Scene, w16Camera, w16Renderer, w16Pistons = [], w16Crankshaft, w16RPM = 3500, w16Time = 0;

  // Turbo
  let turboScene, turboCamera, turboRenderer, turbineBlades = [], turboRPM = 0;

  // Exhaust
  let exhaustScene, exhaustCamera, exhaustRenderer, exhaustParticles = [];

  // Silencer
  let silencerScene, silencerCamera, silencerRenderer, silencerWaves = [];

  // Spoiler
  let spoilerScene, spoilerCamera, spoilerRenderer, spoilerWing, spoilerAngle = 0;

  // Doors
  let doorsScene, doorsCamera, doorsRenderer, doorsCarGroup, doorsLeft, doorsRight, doorProgress2 = 0;

  // Interior
  let interiorScene, interiorCamera, interiorRenderer;

  // ═══════════════════════════════════════════════════════════════════════════
  // PRELOADER
  // ═══════════════════════════════════════════════════════════════════════════
  function runPreloader() {
    const fill = document.getElementById('preloaderFill');
    const preloader = document.getElementById('preloader-bugatti');
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          if (preloader) preloader.classList.add('hidden');
          initAllScenes();
          initScrollAnimations();
          initNavDots();
        }, 400);
      }
      if (fill) fill.style.width = progress + '%';
    }, 80);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MATERIAL HELPERS
  // ═══════════════════════════════════════════════════════════════════════════
  function copperMat() {
    return new THREE.MeshStandardMaterial({ color: COPPER, roughness: 0.22, metalness: 0.88 });
  }
  function carbonMat() {
    return new THREE.MeshStandardMaterial({ color: CARBON, roughness: 0.4, metalness: 0.4 });
  }
  function chromeMat() {
    return new THREE.MeshStandardMaterial({ color: CHROME, metalness: 0.9, roughness: 0.2 });
  }
  function steelMat() {
    return new THREE.MeshStandardMaterial({ color: DARK_STEEL, metalness: 0.8, roughness: 0.3 });
  }
  function glassMat() {
    return new THREE.MeshPhysicalMaterial({ color: 0x0a0a10, metalness: 0.1, roughness: 0.1, transparent: true, opacity: 0.85 });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE FACTORY
  // ═══════════════════════════════════════════════════════════════════════════
  function createScene(containerId, camPos, camLookAt) {
    const container = document.getElementById(containerId);
    if (!container || typeof THREE === 'undefined') return null;

    const w = container.clientWidth || 600;
    const h = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.035);

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(camPos[0], camPos[1], camPos[2]);
    if (camLookAt) camera.lookAt(camLookAt[0], camLookAt[1], camLookAt[2]);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Standard lights
    scene.add(new THREE.AmbientLight(0xfff5ea, 0.8));
    const key = new THREE.DirectionalLight(0xfffaed, 2.0);
    key.position.set(5, 7, 5);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd48b59, 1.5);
    rim.position.set(-5, 3, -4);
    scene.add(rim);

    // Resize handler
    const resizeHandler = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', resizeHandler);

    return { scene, camera, renderer, container };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. 3D CAR EXPLORER
  // ═══════════════════════════════════════════════════════════════════════════
  function initCarExplorer() {
    const s = createScene('bugatti-3d-canvas', [5.2, 2.2, 4.8]);
    if (!s) return;
    carScene = s.scene; carCamera = s.camera; carRenderer = s.renderer;

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x050403, roughness: 0.25, metalness: 0.8 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    carScene.add(ground);

    carGroup = new THREE.Group();
    carScene.add(carGroup);

    buildChironPurSport();
    setupCarInteractions(s.container);
    setupCarControls();
  }

  function buildChironPurSport() {
    const cp = copperMat(), cb = carbonMat(), gl = glassMat();
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85 });
    const rimM = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, metalness: 0.9, roughness: 0.2 });
    const brakeMat = new THREE.MeshStandardMaterial({ color: 0xd31027, roughness: 0.3 });

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.58, 4.4), cp);
    body.position.set(0, 0.46, 0); body.castShadow = true;
    carGroup.add(body);

    // Front nose
    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.2, 5), cp);
    hood.rotation.x = Math.PI / 2; hood.rotation.y = Math.PI;
    hood.position.set(0, 0.44, 1.7);
    carGroup.add(hood);

    // Grille
    const grille = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 16, 32, Math.PI), cb);
    grille.position.set(0, 0.35, 2.22); grille.rotation.z = Math.PI;
    carGroup.add(grille);

    // Red "16" emblem
    const emblem = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.02), new THREE.MeshBasicMaterial({ color: 0xff1122 }));
    emblem.position.set(0, 0.34, 2.21);
    carGroup.add(emblem);

    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.44, 1.9), gl);
    cabin.position.set(0, 0.88, -0.1);
    carGroup.add(cabin);

    // C-Line
    [-1, 1].forEach(side => {
      const cLine = new THREE.Mesh(
        new THREE.TorusGeometry(0.65, 0.04, 8, 24, Math.PI * 1.3),
        new THREE.MeshStandardMaterial({ color: 0xe29d6f, metalness: 0.9, roughness: 0.2 })
      );
      cLine.position.set(side * 0.98, 0.65, -0.15);
      cLine.rotation.y = side * Math.PI / 2;
      carGroup.add(cLine);
    });

    // Doors
    doorLeftGroup = new THREE.Group();
    doorLeftGroup.position.set(-0.95, 0.65, 0.4);
    doorLeftGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 1.1), cp).translateX(0).translateY(-0.1).translateZ(-0.4));
    carGroup.add(doorLeftGroup);

    doorRightGroup = new THREE.Group();
    doorRightGroup.position.set(0.95, 0.65, 0.4);
    doorRightGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 1.1), cp).translateX(0).translateY(-0.1).translateZ(-0.4));
    carGroup.add(doorRightGroup);

    // Rear wing
    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.04, 0.45), cb);
    wing.position.set(0, 1.05, -2.05);
    carGroup.add(wing);
    [-0.55, 0.55].forEach(x => {
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.45, 8), cb);
      pylon.position.set(x, 0.85, -2.02); pylon.rotation.x = -0.2;
      carGroup.add(pylon);
    });
    [-1.15, 1.15].forEach(x => {
      const ep = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.16, 0.46), cb);
      ep.position.set(x, 1.05, -2.05);
      carGroup.add(ep);
    });

    // Exhaust
    const tiMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.2, metalness: 0.95, emissive: 0x1d4ed8, emissiveIntensity: 0.4 });
    [-0.12, 0.12].forEach(x => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.35, 16), tiMat);
      pipe.position.set(x, 0.35, -2.25); pipe.rotation.x = Math.PI / 2;
      carGroup.add(pipe);
    });

    // Diffuser
    carGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 0.5), cb).translateY(0.25).translateZ(-2.15));

    // Headlights
    const hlMat = new THREE.MeshBasicMaterial({ color: WHITE });
    [-0.72, 0.72].forEach((x, i) => {
      for (let j = 0; j < 4; j++) {
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.05), hlMat);
        led.position.set(x + (x > 0 ? -j * 0.07 : j * 0.07), 0.54, 2.1 - j * 0.02);
        carGroup.add(led);
      }
      const spot = new THREE.SpotLight(WHITE, 3.5, 12, Math.PI / 6, 0.4);
      spot.position.set(x, 0.55, 2.15);
      spot.target.position.set(x * 1.2, 0.1, 7);
      carScene.add(spot.target); carScene.add(spot);
      if (i === 0) headlightBeamLeft = spot; else headlightBeamRight = spot;
    });

    // Taillight
    taillightGlow = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.035, 0.04), new THREE.MeshBasicMaterial({ color: RED }));
    taillightGlow.position.set(0, 0.58, -2.21);
    carGroup.add(taillightGlow);
    taillightPointLight = new THREE.PointLight(RED, 2.8, 4);
    taillightPointLight.position.set(0, 0.6, -2.4);
    carGroup.add(taillightPointLight);

    // Wheels
    wheels = [];
    [
      { x: -0.96, y: 0.36, z: 1.35, r: 0.36, w: 0.28 },
      { x: 0.96, y: 0.36, z: 1.35, r: 0.36, w: 0.28 },
      { x: -0.98, y: 0.38, z: -1.35, r: 0.38, w: 0.35 },
      { x: 0.98, y: 0.38, z: -1.35, r: 0.38, w: 0.35 },
    ].forEach(pos => {
      const wg = new THREE.Group();
      wg.position.set(pos.x, pos.y, pos.z);
      wg.add(new THREE.Mesh(new THREE.CylinderGeometry(pos.r, pos.r, pos.w, 24), tireMat).rotateZ(Math.PI / 2));
      wg.add(new THREE.Mesh(new THREE.CylinderGeometry(pos.r * 0.75, pos.r * 0.75, pos.w + 0.01, 16), rimM).rotateZ(Math.PI / 2));
      for (let s = 0; s < 5; s++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(pos.r * 0.68, 0.04, 0.02), cp);
        spoke.rotation.x = (s * Math.PI) / 2.5;
        wg.add(spoke);
      }
      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.08), brakeMat);
      caliper.position.y = pos.r * 0.32;
      wg.add(caliper);
      carGroup.add(wg);
      wheels.push(wg);
    });

    // Engine block visible
    const eb = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.9), steelMat());
    eb.position.set(0, 0.62, -0.85);
    carGroup.add(eb);
  }

  function setupCarInteractions(container) {
    let isDragging = false, prevX = 0, prevY = 0;
    container.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
    window.addEventListener('mouseup', () => isDragging = false);
    container.addEventListener('mousemove', e => {
      if (!isDragging || !carGroup) return;
      carGroup.rotation.y += (e.clientX - prevX) * 0.008;
      carCamera.position.y = Math.max(0.8, Math.min(4.5, carCamera.position.y - (e.clientY - prevY) * 0.008));
      prevX = e.clientX; prevY = e.clientY;
    });
    container.addEventListener('touchstart', e => { if (e.touches.length === 1) { prevX = e.touches[0].clientX; } }, { passive: true });
    container.addEventListener('touchmove', e => { if (e.touches.length === 1 && carGroup) { carGroup.rotation.y += (e.touches[0].clientX - prevX) * 0.008; prevX = e.touches[0].clientX; } }, { passive: true });
  }

  function setupCarControls() {
    const btn = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
    btn('btn-car-orbit', () => { carCamera.position.set(5.2, 2.2, 4.8); if (carGroup) carGroup.rotation.set(0, 0, 0); });
    btn('btn-car-doors', () => { isDoorsOpen = !isDoorsOpen; targetDoorsProgress = isDoorsOpen ? 1 : 0; });
    btn('btn-car-engine', () => { carCamera.position.set(0, 3.4, -2.8); if (carGroup) carGroup.rotation.y = Math.PI; });
    btn('btn-car-aero', () => { carCamera.position.set(0, 1.8, -4.5); if (carGroup) carGroup.rotation.y = 0; });
    btn('btn-toggle-front-lights', () => {
      const on = headlightBeamLeft && headlightBeamLeft.intensity > 0;
      if (headlightBeamLeft) headlightBeamLeft.intensity = on ? 0 : 3.5;
      if (headlightBeamRight) headlightBeamRight.intensity = on ? 0 : 3.5;
    });
    btn('btn-toggle-back-lights', () => {
      const on = taillightPointLight && taillightPointLight.intensity > 0;
      if (taillightPointLight) taillightPointLight.intensity = on ? 0 : 2.8;
      if (taillightGlow) taillightGlow.material.color.setHex(on ? 0x220005 : RED);
    });
  }

  function animateCar() {
    if (!carRenderer) return;
    doorsProgress += (targetDoorsProgress - doorsProgress) * 0.08;
    if (doorLeftGroup) {
      doorLeftGroup.rotation.z = -doorsProgress * 0.75;
      doorLeftGroup.rotation.y = doorsProgress * 0.35;
      doorLeftGroup.position.y = 0.65 + doorsProgress * 0.28;
    }
    if (doorRightGroup) {
      doorRightGroup.rotation.z = doorsProgress * 0.75;
      doorRightGroup.rotation.y = -doorsProgress * 0.35;
      doorRightGroup.position.y = 0.65 + doorsProgress * 0.28;
    }
    if (carGroup) carGroup.rotation.y += 0.002;
    carRenderer.render(carScene, carCamera);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. W16 ENGINE SIMULATOR
  // ═══════════════════════════════════════════════════════════════════════════
  function initW16Engine() {
    const s = createScene('w16-engine-canvas', [0, 3.5, 5.5], [0, 0, 0]);
    if (!s) return;
    w16Scene = s.scene; w16Camera = s.camera; w16Renderer = s.renderer;

    // Purple accent light
    const accent = new THREE.PointLight(0xa855f7, 0.8, 10);
    accent.position.set(0, 4, 0);
    w16Scene.add(accent);

    // Crankshaft
    w16Crankshaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 3.8, 16),
      chromeMat()
    );
    w16Crankshaft.rotation.z = Math.PI / 2;
    w16Scene.add(w16Crankshaft);

    // Engine block housing
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x222225, metalness: 0.7, roughness: 0.4, transparent: true, opacity: 0.3 });
    const block = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.5, 3.6), blockMat);
    block.position.y = 0.3;
    w16Scene.add(block);

    // 16 Pistons: 4 banks × 4 cylinders
    const bankAngles = [-0.75, -0.25, 0.25, 0.75];
    const pistonHeadMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const cylinderWallMat = new THREE.MeshStandardMaterial({ color: 0x444448, metalness: 0.6, roughness: 0.4, transparent: true, opacity: 0.25 });

    w16Pistons = [];
    bankAngles.forEach((angle, bankIdx) => {
      for (let cyl = 0; cyl < 4; cyl++) {
        const pg = new THREE.Group();

        // Cylinder wall (transparent)
        const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.1, 16, 1, true), cylinderWallMat);
        wall.position.y = 0.2;
        pg.add(wall);

        // Piston crown
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.22, 16), pistonHeadMat);
        pg.add(crown);

        // Connecting rod
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), rodMat);
        rod.position.y = -0.55;
        pg.add(rod);

        // Combustion flash
        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), flameMat);
        flame.position.y = 0.28;
        flame.visible = false;
        pg.add(flame);

        const zPos = -1.35 + cyl * 0.9;
        pg.position.set(0, 0, zPos);
        pg.rotation.z = angle;
        w16Scene.add(pg);

        w16Pistons.push({ group: pg, flame, bank: bankIdx, cylinder: cyl, baseAngle: angle, phase: (cyl * Math.PI / 2) + (bankIdx * Math.PI / 4) });
      }
    });

    // RPM slider
    const slider = document.getElementById('w16-rpm-slider');
    const display = document.getElementById('w16-rpm-display');
    if (slider) {
      slider.addEventListener('input', e => {
        w16RPM = parseInt(e.target.value, 10);
        if (display) display.textContent = w16RPM.toLocaleString() + ' RPM';
      });
    }
  }

  function animateW16() {
    if (!w16Renderer) return;
    const speed = (w16RPM / 60) * 0.003;
    w16Time += speed;

    if (w16Crankshaft) w16Crankshaft.rotation.x = w16Time * Math.PI * 2;

    const pistonDots = document.querySelectorAll('.piston-dot');
    w16Pistons.forEach((p, idx) => {
      const stroke = Math.sin(w16Time * Math.PI * 2 + p.phase);
      const dist = 0.85 + stroke * 0.45;
      const sinA = Math.sin(-p.baseAngle);
      const cosA = Math.cos(-p.baseAngle);
      p.group.position.x = sinA * dist;
      p.group.position.y = cosA * dist;
      p.flame.visible = stroke > 0.88;

      // Update piston indicator dots
      if (pistonDots[idx]) {
        if (stroke > 0.88) pistonDots[idx].classList.add('firing');
        else pistonDots[idx].classList.remove('firing');
      }
    });

    w16Renderer.render(w16Scene, w16Camera);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. TURBOCHARGER
  // ═══════════════════════════════════════════════════════════════════════════
  function initTurbo() {
    const s = createScene('turbo-canvas', [3, 2, 3], [0, 0, 0]);
    if (!s) return;
    turboScene = s.scene; turboCamera = s.camera; turboRenderer = s.renderer;

    // Blue accent light
    const blueLight = new THREE.PointLight(0x3b82f6, 1.5, 8);
    blueLight.position.set(0, 3, 0);
    turboScene.add(blueLight);

    // Build 4 turbochargers
    const turboPositions = [
      { x: -0.8, z: -0.6 }, { x: 0.8, z: -0.6 },
      { x: -0.8, z: 0.6 }, { x: 0.8, z: 0.6 }
    ];

    turbineBlades = [];
    turboPositions.forEach((pos, idx) => {
      const turboGroup = new THREE.Group();
      turboGroup.position.set(pos.x, 0, pos.z);

      // Housing
      const housing = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.12, 16, 32),
        new THREE.MeshStandardMaterial({ color: 0x555560, metalness: 0.85, roughness: 0.25 })
      );
      turboGroup.add(housing);

      // Inlet scroll (snail shape)
      const inlet = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.06, 8, 24, Math.PI * 1.5),
        steelMat()
      );
      inlet.rotation.x = Math.PI / 2;
      turboGroup.add(inlet);

      // Turbine blades group
      const bladesGroup = new THREE.Group();
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0xc0c8d4, metalness: 0.95, roughness: 0.1 });
      for (let i = 0; i < 12; i++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.06), bladeMat);
        blade.rotation.z = (i * Math.PI * 2) / 12;
        blade.position.set(Math.cos((i * Math.PI * 2) / 12) * 0.14, Math.sin((i * Math.PI * 2) / 12) * 0.14, 0);
        bladesGroup.add(blade);
      }
      // Center hub
      bladesGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), chromeMat()));
      turboGroup.add(bladesGroup);
      turbineBlades.push(bladesGroup);

      // Label
      const labelColors = [0x3b82f6, 0x3b82f6, 0xef4444, 0xef4444];
      const glow = new THREE.PointLight(labelColors[idx], 0.6, 2);
      glow.position.set(0, 0.5, 0);
      turboGroup.add(glow);

      turboScene.add(turboGroup);
    });

    // Center interconnect pipes
    const pipeMat = chromeMat();
    [{ from: [-0.8, 0, -0.6], to: [0.8, 0, -0.6] }, { from: [-0.8, 0, 0.6], to: [0.8, 0, 0.6] }].forEach(p => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 8), pipeMat);
      pipe.position.set(0, 0, p.from[2]);
      pipe.rotation.z = Math.PI / 2;
      turboScene.add(pipe);
    });
  }

  function animateTurbo() {
    if (!turboRenderer) return;
    turboRPM += (w16RPM * 20 - turboRPM) * 0.02;
    const spinSpeed = turboRPM * 0.00001;
    turbineBlades.forEach(bg => { bg.rotation.z += spinSpeed; });

    // Update boost bar
    const boostPct = Math.min(100, (turboRPM / 150000) * 100);
    const boostBar = document.getElementById('boostFill');
    const boostVal = document.getElementById('boostValue');
    if (boostBar) boostBar.style.width = boostPct + '%';
    if (boostVal) boostVal.textContent = (boostPct * 0.0285).toFixed(2) + ' BAR';

    turboRenderer.render(turboScene, turboCamera);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. EXHAUST SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════
  function initExhaust() {
    const s = createScene('exhaust-canvas', [2.5, 1.5, 3], [0, 0, 0]);
    if (!s) return;
    exhaustScene = s.scene; exhaustCamera = s.camera; exhaustRenderer = s.renderer;

    // Red accent
    const redLight = new THREE.PointLight(0xef4444, 1.2, 8);
    redLight.position.set(0, 2, -2);
    exhaustScene.add(redLight);

    // Exhaust manifold headers (from engine)
    const headerMat = new THREE.MeshStandardMaterial({ color: 0x884422, metalness: 0.7, roughness: 0.4, emissive: 0x331100, emissiveIntensity: 0.3 });
    for (let i = 0; i < 8; i++) {
      const header = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8 + Math.random() * 0.4, 8), headerMat);
      header.position.set(-0.4 + (i % 4) * 0.25, 0.4, 1.2 - Math.floor(i / 4) * 0.3);
      header.rotation.x = Math.PI * 0.35;
      header.rotation.z = (Math.random() - 0.5) * 0.3;
      exhaustScene.add(header);
    }

    // Catalytic converters (2 boxes)
    const catMat = new THREE.MeshStandardMaterial({ color: 0x666670, metalness: 0.6, roughness: 0.35 });
    [-0.25, 0.25].forEach(x => {
      const cat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.5), catMat);
      cat.position.set(x, 0.15, 0.3);
      exhaustScene.add(cat);
    });

    // Main pipes leading to rear
    const tiMat = new THREE.MeshStandardMaterial({
      color: 0x4488cc, roughness: 0.2, metalness: 0.95,
      emissive: 0x1a3355, emissiveIntensity: 0.3
    });
    [-0.15, -0.05, 0.05, 0.15].forEach(x => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0, 12), tiMat);
      pipe.position.set(x, 0.12, -0.7);
      pipe.rotation.x = Math.PI / 2;
      exhaustScene.add(pipe);
    });

    // Quad exit tips
    const tipMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.15, metalness: 0.95, emissive: 0x1d4ed8, emissiveIntensity: 0.5 });
    [-0.15, -0.05, 0.05, 0.15].forEach(x => {
      const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.2, 16), tipMat);
      tip.position.set(x, 0.12, -1.8);
      tip.rotation.x = Math.PI / 2;
      exhaustScene.add(tip);
    });

    // Exhaust particles
    exhaustParticles = [];
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xff6622, transparent: true, opacity: 0.6 });
    for (let i = 0; i < 60; i++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.015 + Math.random() * 0.02, 6, 6), particleMat.clone());
      p.position.set(
        (Math.random() - 0.5) * 0.3,
        0.12 + (Math.random() - 0.5) * 0.1,
        -1.9 - Math.random() * 1.5
      );
      p.userData = { speed: 0.01 + Math.random() * 0.02, startZ: -1.9, maxZ: -3.5 };
      exhaustScene.add(p);
      exhaustParticles.push(p);
    }
  }

  function animateExhaust() {
    if (!exhaustRenderer) return;

    // Animate particles
    exhaustParticles.forEach(p => {
      p.position.z -= p.userData.speed;
      p.material.opacity *= 0.995;
      p.position.x += (Math.random() - 0.5) * 0.003;
      p.position.y += (Math.random() - 0.5) * 0.002;
      if (p.position.z < p.userData.maxZ || p.material.opacity < 0.05) {
        p.position.set((Math.random() - 0.5) * 0.3, 0.12 + (Math.random() - 0.5) * 0.1, p.userData.startZ);
        p.material.opacity = 0.4 + Math.random() * 0.4;
      }
    });

    // Update temp gauge
    const temp = 380 + Math.sin(Date.now() * 0.001) * 80 + w16RPM * 0.05;
    const tempFill = document.getElementById('exhaustTempFill');
    const tempVal = document.getElementById('exhaustTempValue');
    if (tempFill) tempFill.style.width = Math.min(100, (temp / 1050) * 100) + '%';
    if (tempVal) tempVal.textContent = Math.round(temp) + '°C';

    exhaustRenderer.render(exhaustScene, exhaustCamera);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. SILENCER
  // ═══════════════════════════════════════════════════════════════════════════
  function initSilencer() {
    const s = createScene('silencer-canvas', [2.5, 1.5, 3], [0, 0, 0]);
    if (!s) return;
    silencerScene = s.scene; silencerCamera = s.camera; silencerRenderer = s.renderer;

    // Silencer body (main chamber)
    const shellMat = new THREE.MeshStandardMaterial({ color: 0x555560, metalness: 0.7, roughness: 0.3, transparent: true, opacity: 0.35 });
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 2.0, 24), shellMat);
    shell.rotation.z = Math.PI / 2;
    silencerScene.add(shell);

    // Internal baffles
    const baffleMat = new THREE.MeshStandardMaterial({ color: 0x888890, metalness: 0.6, roughness: 0.4 });
    for (let i = 0; i < 5; i++) {
      const baffle = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.02, 24), baffleMat);
      baffle.rotation.z = Math.PI / 2;
      baffle.position.x = -0.8 + i * 0.4;
      silencerScene.add(baffle);

      // Perforations (small holes)
      for (let h = 0; h < 6; h++) {
        const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8), new THREE.MeshBasicMaterial({ color: 0x000000 }));
        const angle = (h * Math.PI * 2) / 6;
        hole.position.set(-0.8 + i * 0.4, Math.sin(angle) * 0.2, Math.cos(angle) * 0.2);
        hole.rotation.z = Math.PI / 2;
        silencerScene.add(hole);
      }
    }

    // Internal perforated pipe
    const perfPipeMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.7, roughness: 0.3, transparent: true, opacity: 0.5 });
    const perfPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 16, 1, true), perfPipeMat);
    perfPipe.rotation.z = Math.PI / 2;
    silencerScene.add(perfPipe);

    // Inlet and outlet pipes
    const pipeMat = chromeMat();
    const inlet = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 12), pipeMat);
    inlet.rotation.z = Math.PI / 2;
    inlet.position.x = -1.4;
    silencerScene.add(inlet);

    const outlet = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 12), pipeMat);
    outlet.rotation.z = Math.PI / 2;
    outlet.position.x = 1.4;
    silencerScene.add(outlet);

    // Resonator chambers
    [-0.5, 0.5].forEach(x => {
      const resChamber = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.4, 16),
        new THREE.MeshStandardMaterial({ color: 0x444448, metalness: 0.6, roughness: 0.4, transparent: true, opacity: 0.4 })
      );
      resChamber.position.set(x, -0.35, 0);
      silencerScene.add(resChamber);

      // Connect pipe
      const conn = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8), pipeMat);
      conn.position.set(x, -0.2, 0);
      silencerScene.add(conn);
    });

    // Sound wave visualization rings
    silencerWaves = [];
    for (let i = 0; i < 8; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.1 + i * 0.08, 0.01, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0xc47b4d, transparent: true, opacity: 0.3 })
      );
      ring.position.x = 1.8;
      ring.rotation.y = Math.PI / 2;
      ring.userData = { baseScale: 1, phase: i * 0.5 };
      silencerScene.add(ring);
      silencerWaves.push(ring);
    }
  }

  function animateSilencer() {
    if (!silencerRenderer) return;

    const t = Date.now() * 0.002;
    silencerWaves.forEach((ring, i) => {
      const wave = Math.sin(t + ring.userData.phase) * 0.5 + 0.5;
      ring.scale.setScalar(1 + wave * 0.5);
      ring.material.opacity = 0.1 + wave * 0.25;
      ring.position.x = 1.8 + i * 0.12 + wave * 0.1;
    });

    silencerRenderer.render(silencerScene, silencerCamera);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. ACTIVE SPOILER
  // ═══════════════════════════════════════════════════════════════════════════
  function initSpoiler() {
    const s = createScene('spoiler-canvas', [3, 2, 4], [0, 0.5, 0]);
    if (!s) return;
    spoilerScene = s.scene; spoilerCamera = s.camera; spoilerRenderer = s.renderer;

    // Rear body section
    const rearBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 1.6), copperMat());
    rearBody.position.set(0, 0, 0);
    spoilerScene.add(rearBody);

    // Wing pivot group
    const wingPivot = new THREE.Group();
    wingPivot.position.set(0, 0.4, -0.6);
    spoilerScene.add(wingPivot);
    spoilerWing = wingPivot;

    // Wing blade
    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 0.5), carbonMat());
    wing.position.set(0, 0.3, 0);
    wingPivot.add(wing);

    // Endplates
    [-1.2, 1.2].forEach(x => {
      const ep = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.5), carbonMat());
      ep.position.set(x, 0.3, 0);
      wingPivot.add(ep);
    });

    // Support pylons
    [-0.5, 0.5].forEach(x => {
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.35, 8), carbonMat());
      pylon.position.set(x, 0.15, 0.1);
      wingPivot.add(pylon);
    });

    // Hydraulic actuators
    const actuatorMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 });
    [-0.3, 0.3].forEach(x => {
      const actuator = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), actuatorMat);
      actuator.position.set(x, 0.1, 0.2);
      wingPivot.add(actuator);

      // Piston rod (chrome)
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.25, 8), chromeMat());
      rod.position.set(x, -0.05, 0.2);
      wingPivot.add(rod);
    });

    // Airflow arrows
    for (let i = 0; i < 5; i++) {
      const arrow = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.15, 6),
        new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.3 })
      );
      arrow.rotation.x = -Math.PI / 2;
      arrow.position.set(-0.8 + i * 0.4, 0.8, 0.8);
      spoilerScene.add(arrow);
    }

    // Angle mode buttons
    document.querySelectorAll('.angle-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.angle-mode').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        spoilerAngle = parseFloat(btn.dataset.angle);
        const angleDisplay = document.getElementById('spoilerAngle');
        if (angleDisplay) angleDisplay.textContent = spoilerAngle + '°';
      });
    });
  }

  function animateSpoiler() {
    if (!spoilerRenderer || !spoilerWing) return;
    const targetRad = (spoilerAngle * Math.PI) / 180;
    spoilerWing.rotation.x += (targetRad - spoilerWing.rotation.x) * 0.05;
    spoilerRenderer.render(spoilerScene, spoilerCamera);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. DOORS
  // ═══════════════════════════════════════════════════════════════════════════
  function initDoors() {
    const s = createScene('doors-canvas', [4, 2.5, 4], [0, 0.5, 0]);
    if (!s) return;
    doorsScene = s.scene; doorsCamera = s.camera; doorsRenderer = s.renderer;

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshStandardMaterial({ color: 0x050403, roughness: 0.3, metalness: 0.7 })
    );
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01;
    doorsScene.add(ground);

    doorsCarGroup = new THREE.Group();
    doorsScene.add(doorsCarGroup);

    // Simplified car body
    const cp = copperMat(), cb = carbonMat(), gl = glassMat();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 3.6), cp);
    body.position.y = 0.4;
    doorsCarGroup.add(body);

    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 1.6), gl);
    cabin.position.y = 0.8;
    doorsCarGroup.add(cabin);

    // Interior (black)
    const interiorMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.8 });
    const seats = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.2, 0.8), interiorMat);
    seats.position.set(0, 0.55, 0);
    doorsCarGroup.add(seats);

    // Steering wheel
    const steeringWheel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 8, 24), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5 }));
    steeringWheel.position.set(-0.3, 0.7, 0.3);
    steeringWheel.rotation.x = Math.PI * 0.35;
    doorsCarGroup.add(steeringWheel);

    // Doors
    doorsLeft = new THREE.Group();
    doorsLeft.position.set(-0.95, 0.55, 0.3);
    const ld = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 1.0), cp);
    ld.position.set(0, 0, -0.3);
    doorsLeft.add(ld);
    // Door interior panel
    const ldInner = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.9), interiorMat);
    ldInner.position.set(0.05, 0, -0.3);
    doorsLeft.add(ldInner);
    doorsCarGroup.add(doorsLeft);

    doorsRight = new THREE.Group();
    doorsRight.position.set(0.95, 0.55, 0.3);
    const rd = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 1.0), cp);
    rd.position.set(0, 0, -0.3);
    doorsRight.add(rd);
    const rdInner = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.9), interiorMat);
    rdInner.position.set(-0.05, 0, -0.3);
    doorsRight.add(rdInner);
    doorsCarGroup.add(doorsRight);

    // Auto-animate doors on scroll (handled in scroll section)
  }

  function animateDoors() {
    if (!doorsRenderer) return;

    // Smooth door animation
    const target = doorProgress2;
    if (doorsLeft) {
      doorsLeft.rotation.z = -(target * 0.8);
      doorsLeft.rotation.y = target * 0.35;
      doorsLeft.position.y = 0.55 + target * 0.3;
    }
    if (doorsRight) {
      doorsRight.rotation.z = target * 0.8;
      doorsRight.rotation.y = -(target * 0.35);
      doorsRight.position.y = 0.55 + target * 0.3;
    }

    if (doorsCarGroup) doorsCarGroup.rotation.y += 0.003;
    doorsRenderer.render(doorsScene, doorsCamera);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. INTERIOR
  // ═══════════════════════════════════════════════════════════════════════════
  function initInterior() {
    const s = createScene('interior-canvas', [0, 1.2, 2.5], [0, 0.5, 0]);
    if (!s) return;
    interiorScene = s.scene; interiorCamera = s.camera; interiorRenderer = s.renderer;

    // Warm interior lighting
    const warmLight = new THREE.PointLight(0xc47b4d, 0.8, 5);
    warmLight.position.set(0, 2, 0);
    interiorScene.add(warmLight);

    const blackLeather = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.75, metalness: 0.1 });
    const carbonTrim = carbonMat();
    const aluminumCtrl = new THREE.MeshStandardMaterial({ color: 0xaabbcc, metalness: 0.9, roughness: 0.15 });

    // Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(2, 3), blackLeather);
    floor.rotation.x = -Math.PI / 2;
    interiorScene.add(floor);

    // Center console
    const console_ = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 1.8), carbonTrim);
    console_.position.set(0, 0.2, 0);
    interiorScene.add(console_);

    // Seats
    [-0.45, 0.45].forEach(x => {
      // Seat base
      const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.7), blackLeather);
      seatBase.position.set(x, 0.15, 0);
      interiorScene.add(seatBase);
      // Seat back
      const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.6, 0.08), blackLeather);
      seatBack.position.set(x, 0.45, -0.34);
      seatBack.rotation.x = -0.15;
      interiorScene.add(seatBack);
      // Headrest
      const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.08), blackLeather);
      headrest.position.set(x, 0.8, -0.38);
      interiorScene.add(headrest);
      // Side bolsters
      [-0.22, 0.22].forEach(bx => {
        const bolster = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.08), blackLeather);
        bolster.position.set(x + bx, 0.45, -0.32);
        interiorScene.add(bolster);
      });
    });

    // Steering wheel
    const sw = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.018, 12, 32), blackLeather);
    sw.position.set(-0.3, 0.55, 0.5);
    sw.rotation.x = Math.PI * 0.35;
    interiorScene.add(sw);
    // Steering column
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), aluminumCtrl);
    col.position.set(-0.3, 0.4, 0.65);
    col.rotation.x = Math.PI * 0.35;
    interiorScene.add(col);

    // Dashboard
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.4), carbonTrim);
    dash.position.set(0, 0.6, 0.85);
    interiorScene.add(dash);

    // Instrument cluster (glowing)
    const clusterMat = new THREE.MeshBasicMaterial({ color: 0xc47b4d });
    const cluster = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.15), clusterMat);
    cluster.position.set(-0.3, 0.62, 0.84);
    interiorScene.add(cluster);

    // Infotainment screen
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x111122 });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.12), screenMat);
    screen.position.set(0.15, 0.62, 0.84);
    interiorScene.add(screen);

    // Gear selector
    const gearKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.08, 12), aluminumCtrl);
    gearKnob.position.set(0, 0.38, 0.2);
    interiorScene.add(gearKnob);

    // Aluminum dial controls on console
    for (let i = 0; i < 4; i++) {
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12), aluminumCtrl);
      dial.position.set(0, 0.35, -0.2 + i * 0.18);
      interiorScene.add(dial);
    }
  }

  function animateInterior() {
    if (!interiorRenderer) return;
    // Slow orbit
    const t = Date.now() * 0.0003;
    interiorCamera.position.x = Math.sin(t) * 1.5;
    interiorCamera.position.z = Math.cos(t) * 2.5;
    interiorCamera.lookAt(0, 0.5, 0);
    interiorRenderer.render(interiorScene, interiorCamera);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MASTER ANIMATION LOOP
  // ═══════════════════════════════════════════════════════════════════════════
  function masterAnimate() {
    requestAnimationFrame(masterAnimate);
    animateCar();
    animateW16();
    animateTurbo();
    animateExhaust();
    animateSilencer();
    animateSpoiler();
    animateDoors();
    animateInterior();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCROLL ANIMATIONS (GSAP ScrollTrigger)
  // ═══════════════════════════════════════════════════════════════════════════
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Scroll progress bar
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const bar = document.getElementById('scrollProgress');
        if (bar) bar.style.width = (self.progress * 100) + '%';
      }
    });

    // Show nav after hero
    ScrollTrigger.create({
      trigger: '#sec-3d-car',
      start: 'top 80%',
      onEnter: () => document.getElementById('bugattiNav')?.classList.add('visible'),
      onLeaveBack: () => document.getElementById('bugattiNav')?.classList.remove('visible'),
    });

    // Reveal animations for each mechanism section
    document.querySelectorAll('.mechanism-split').forEach(split => {
      const visual = split.querySelector('.mechanism-visual');
      const info = split.querySelector('.mechanism-info');
      const isReverse = split.classList.contains('reverse');

      if (visual) {
        visual.classList.add(isReverse ? 'reveal-right' : 'reveal-left');
        ScrollTrigger.create({
          trigger: visual,
          start: 'top 85%',
          onEnter: () => visual.classList.add('revealed'),
        });
      }
      if (info) {
        info.classList.add(isReverse ? 'reveal-left' : 'reveal-right');
        ScrollTrigger.create({
          trigger: info,
          start: 'top 85%',
          onEnter: () => info.classList.add('revealed'),
        });
      }
    });

    // Doors scroll-driven opening
    ScrollTrigger.create({
      trigger: '#sec-doors',
      start: 'top 80%',
      end: 'bottom 20%',
      onUpdate: (self) => {
        doorProgress2 = self.progress;
      }
    });

    // Light cards reveal
    ['#frontLightCard', '#rearLightCard'].forEach((sel, i) => {
      const el = document.querySelector(sel);
      if (el) {
        el.classList.add(i === 0 ? 'reveal-left' : 'reveal-right');
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          onEnter: () => el.classList.add('revealed'),
        });
      }
    });

    // Specs table rows
    document.querySelectorAll('.specs-table tr').forEach((row, i) => {
      row.classList.add('reveal-up');
      row.style.transitionDelay = (i * 0.05) + 's';
      ScrollTrigger.create({
        trigger: row,
        start: 'top 90%',
        onEnter: () => row.classList.add('revealed'),
      });
    });

    // Interior features
    document.querySelectorAll('.interior-feature').forEach((feat, i) => {
      feat.classList.add('reveal-up');
      feat.style.transitionDelay = (i * 0.1) + 's';
      ScrollTrigger.create({
        trigger: feat,
        start: 'top 90%',
        onEnter: () => feat.classList.add('revealed'),
      });
    });

    // Active section tracking
    document.querySelectorAll('.section').forEach((section, idx) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => updateActiveSection(idx),
        onEnterBack: () => updateActiveSection(idx),
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NAV DOTS
  // ═══════════════════════════════════════════════════════════════════════════
  function initNavDots() {
    const container = document.getElementById('navDots');
    if (!container) return;
    const sectionEls = document.querySelectorAll('.section');
    sectionEls.forEach((sec, i) => {
      const dot = document.createElement('div');
      dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
      dot.dataset.section = i;
      dot.addEventListener('click', () => {
        sec.scrollIntoView({ behavior: 'smooth' });
      });
      container.appendChild(dot);
    });
  }

  function updateActiveSection(idx) {
    currentSection = idx;
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HERO PARTICLES
  // ═══════════════════════════════════════════════════════════════════════════
  function initHeroParticles() {
    const canvas = document.createElement('canvas');
    const container = document.getElementById('heroParticles');
    if (!container) return;
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 123, 77, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════════════
  function initAllScenes() {
    initHeroParticles();
    initCarExplorer();
    initW16Engine();
    initTurbo();
    initExhaust();
    initSilencer();
    initSpoiler();
    initDoors();
    initInterior();
    masterAnimate();
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPreloader);
  } else {
    runPreloader();
  }
})();
