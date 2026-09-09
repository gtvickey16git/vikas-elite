/**
 * BG-SLIDESHOW.JS — 3D Background Slideshow with Smooth Up-to-Bottom Motion
 * Vikas Elite Portfolio
 *
 * Ensures images NEVER disappear on scroll.
 */

(function () {
  'use strict';

  // ─── All background images ──────────────────────────────────────────────────
  const BG_IMAGES = [
    'assets/images/bg6.jpg',
    'assets/images/bg9.jpg',
    'assets/images/bg7.jpg',
    'assets/images/bg8.jpg',
    'assets/images/bg1.jpg',
    'assets/images/bg3.jpg',
    'assets/images/bg4.jpg',
    'assets/images/bg5.jpg',
    'assets/images/bg2.jpg',
    'assets/images/dp_main.jpg',
    'assets/images/dp_contact.jpg',
  ];

  const INTERVAL_MS   = 2000;  // Switch every 2 seconds
  const FADE_DURATION = 900;   // 900ms ultra-smooth 3D transition
  const BASE_SCALE    = 1.08;

  // ─── Build DOM ─────────────────────────────────────────────────────────────
  function buildDOM() {
    const oldWrap = document.getElementById('bg-slide-wrapper');
    if (oldWrap) oldWrap.remove();
    const oldOverlay = document.getElementById('bg-overlay');
    if (oldOverlay) oldOverlay.remove();

    // Fixed background container — ALWAYS 100vw x 100vh, never translates off-screen
    const wrapper = document.createElement('div');
    wrapper.id = 'bg-slide-wrapper';
    Object.assign(wrapper.style, {
      position:       'fixed',
      top:            '0',
      left:           '0',
      width:          '100vw',
      height:         '100vh',
      zIndex:         '-3',
      overflow:       'hidden',
      perspective:    '1200px',
      pointerEvents:  'none',
    });

    // Two layers for A/B vertical 3D gliding swap
    const layerA = makeLayer('bg-layer-a');
    const layerB = makeLayer('bg-layer-b');

    wrapper.appendChild(layerA);
    wrapper.appendChild(layerB);

    // Cyber overlay with light purple/gold ambient tint & high contrast
    const overlay = document.createElement('div');
    overlay.id = 'bg-overlay';
    Object.assign(overlay.style, {
      position:       'fixed',
      top:            '0',
      left:           '0',
      width:          '100vw',
      height:         '100vh',
      zIndex:         '-2',
      background:     'radial-gradient(ellipse at center, rgba(12, 6, 24, 0.40) 0%, rgba(8, 4, 18, 0.62) 55%, rgba(4, 2, 10, 0.80) 100%)',
      backdropFilter: 'contrast(1.10) brightness(0.96)',
      WebkitBackdropFilter: 'contrast(1.10) brightness(0.96)',
      pointerEvents:  'none',
    });

    document.body.prepend(overlay);
    document.body.prepend(wrapper);

    return { layerA, layerB };
  }

  function makeLayer(id) {
    const el = document.createElement('div');
    el.id = id;
    Object.assign(el.style, {
      position:           'absolute',
      top:                '-8%',
      left:               '-8%',
      width:              '116%',
      height:             '116%',
      backgroundSize:     'cover',
      backgroundPosition: 'center center',
      backgroundRepeat:   'no-repeat',
      filter:             'contrast(1.12) saturate(1.15) brightness(0.94)',
      transform:          `translate3d(0, 0, 0) scale(${BASE_SCALE})`,
      transformStyle:     'preserve-3d',
      willChange:         'transform, opacity',
      transition:         `opacity ${FADE_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1), transform ${FADE_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`,
      opacity:            '0',
    });
    return el;
  }

  // ─── Preload images ─────────────────────────────────────────────────────────
  function preload(urls) {
    urls.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }

  // ─── Slideshow Core (Up-to-Bottom 3D Motion) ────────────────────────────────
  function startSlideshow(layerA, layerB) {
    let idx  = 0;
    let useA = true;

    // Show first image immediately
    layerA.style.backgroundImage = `url('${BG_IMAGES[0]}')`;
    layerA.style.opacity = '1';
    layerA.style.transform = `translate3d(0, 0, 0) scale(${BASE_SCALE}) rotateX(0deg)`;

    setInterval(() => {
      idx = (idx + 1) % BG_IMAGES.length;

      const incoming = useA ? layerB : layerA;
      const outgoing = useA ? layerA : layerB;

      // Prepare incoming image starting at the top
      incoming.style.transition = 'none';
      incoming.style.backgroundImage = `url('${BG_IMAGES[idx]}')`;
      incoming.style.opacity = '0';
      incoming.style.transform = `translate3d(0, -35px, 15px) scale(${BASE_SCALE + 0.03}) rotateX(2.5deg)`;

      // Animate: incoming slides down into view, outgoing glides down and fades
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          incoming.style.transition = `opacity ${FADE_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1), transform ${FADE_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`;
          outgoing.style.transition = `opacity ${FADE_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1), transform ${FADE_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`;

          incoming.style.opacity = '1';
          incoming.style.transform = `translate3d(0, 0, 0) scale(${BASE_SCALE}) rotateX(0deg)`;

          outgoing.style.opacity = '0';
          outgoing.style.transform = `translate3d(0, 35px, -15px) scale(${BASE_SCALE - 0.03}) rotateX(-2.5deg)`;
        });
      });

      useA = !useA;
    }, INTERVAL_MS);
  }

  // ─── Subtle Scroll Tilt (Clamped so image never leaves viewport) ────────────
  function startParallax() {
    let targetY = 0;
    let currentY = 0;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animate() {
      currentY = lerp(currentY, targetY, 0.08);
      const maxScroll = document.body.scrollHeight - window.innerHeight || 1;
      const progress  = currentY / maxScroll; // 0 to 1

      const rotX = (progress - 0.5) * 4; // Subtle 3D tilt ±2deg
      const wrapper = document.getElementById('bg-slide-wrapper');
      if (wrapper) {
        wrapper.style.transform = `rotateX(${rotX}deg)`;
      }

      requestAnimationFrame(animate);
    }

    window.addEventListener('scroll', () => {
      targetY = window.scrollY;
    }, { passive: true });

    animate();
  }

  // ─── Init ───────────────────────────────────────────────────────────────────
  function init() {
    preload(BG_IMAGES);
    const { layerA, layerB } = buildDOM();
    startSlideshow(layerA, layerB);
    startParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
