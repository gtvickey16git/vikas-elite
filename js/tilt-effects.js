/**
 * VIKAS.ELITE // 3D Card Gyroscope Tilt & Interactive Cursor Reticle
 */

// 1. 3D Card Tilt Effect
function init3DTilt() {
  const tiltCards = document.querySelectorAll('.tilt-card, .magazine-card, .project-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

// 2. Custom Cyber Reticle Cursor
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const dot = document.querySelector('.custom-cursor-dot');

  if (!cursor || !dot) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    requestAnimationFrame(renderCursor);
  }

  renderCursor();

  // Hover states on interactive elements
  const hoverables = document.querySelectorAll('a, button, input, textarea, .cmd-chip, .filter-chip, .tilt-card');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('active');
      if (window.cyberAudio) window.cyberAudio.playHover();
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('active');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  init3DTilt();
  initCustomCursor();
});
