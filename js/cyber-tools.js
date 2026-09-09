/**
 * VIKAS.ELITE // Cybersecurity Interactive Mini-Tools Engine
 * Real-time Password Entropy & Crack Estimator, Crypto Hasher, and Cipher Tools
 */

// 1. PASSWORD ENTROPY & CRACK TIME CALCULATOR
function initPasswordAnalyzer() {
  const input = document.getElementById('pwd-input');
  const fillBar = document.getElementById('pwd-meter-fill');
  const timeDisplay = document.getElementById('pwd-crack-time');
  const entropyDisplay = document.getElementById('pwd-entropy');
  const strengthBadge = document.getElementById('pwd-strength-badge');

  if (!input || !fillBar) return;

  input.addEventListener('input', () => {
    const pwd = input.value;
    if (!pwd) {
      fillBar.style.width = '0%';
      fillBar.className = 'crack-meter-fill';
      timeDisplay.textContent = 'Enter a password above...';
      entropyDisplay.textContent = '0 bits';
      strengthBadge.textContent = 'NO INPUT';
      strengthBadge.style.color = 'var(--text-muted)';
      return;
    }

    // Determine character pool size
    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) pool += 33;

    // Calculate Entropy: E = L * log2(pool)
    const entropy = Math.round(pwd.length * Math.log2(pool || 1));
    entropyDisplay.textContent = `${entropy} bits`;

    // Total combinations: N^L
    const combinations = Math.pow(pool, pwd.length);
    // Standard RTX 4090 GPU cluster rate: ~100 Billion hashes/sec (10^11)
    const hashesPerSec = 100000000000;
    const seconds = combinations / (2 * hashesPerSec);

    // Format human readable time
    const timeStr = formatCrackTime(seconds);
    timeDisplay.textContent = `RTX 4090 Cluster: ${timeStr}`;

    // Update Meter Bar & Badge
    if (entropy < 40) {
      fillBar.style.width = '25%';
      fillBar.className = 'crack-meter-fill';
      strengthBadge.textContent = 'VULNERABLE';
      strengthBadge.style.color = 'var(--accent-highlight)';
    } else if (entropy < 65) {
      fillBar.style.width = '60%';
      fillBar.className = 'crack-meter-fill medium';
      strengthBadge.textContent = 'MODERATE';
      strengthBadge.style.color = 'var(--accent-amber)';
    } else {
      fillBar.style.width = '100%';
      fillBar.className = 'crack-meter-fill strong';
      strengthBadge.textContent = 'FORTRESS SECURE';
      strengthBadge.style.color = 'var(--accent-primary)';
    }
  });
}

function formatCrackTime(seconds) {
  if (seconds < 0.001) return 'Instant (< 1 millisecond)';
  if (seconds < 1) return 'Less than 1 second';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 3153600000000) return `${Math.round(seconds / 31536000000)} centuries`;
  return 'Over 10 Trillion Years (Beyond Universe Age)';
}

// 2. CRYPTO HASHER & BASE64 TOOL
async function generateSHA256(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function initCryptoHasher() {
  const input = document.getElementById('hasher-input');
  const shaDisplay = document.getElementById('sha256-output');
  const b64Display = document.getElementById('b64-output');

  if (!input || !shaDisplay) return;

  input.addEventListener('input', async () => {
    const text = input.value;
    if (!text) {
      shaDisplay.textContent = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (empty string)';
      b64Display.textContent = 'Waiting for input...';
      return;
    }

    try {
      const sha = await generateSHA256(text);
      shaDisplay.textContent = sha;
      b64Display.textContent = btoa(unescape(encodeURIComponent(text)));
    } catch (e) {
      console.error(e);
    }
  });

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        navigator.clipboard.writeText(targetEl.textContent.trim());
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> COPIED!';
        if (window.cyberAudio) window.cyberAudio.playSuccess();
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 1500);
      }
    });
  });
}

// 3. CAESAR CIPHER TOOL
function initCaesarCipher() {
  const input = document.getElementById('cipher-input');
  const shift = document.getElementById('cipher-shift');
  const shiftVal = document.getElementById('cipher-shift-val');
  const output = document.getElementById('cipher-output');

  if (!input || !shift || !output) return;

  function updateCipher() {
    const text = input.value;
    const s = parseInt(shift.value, 10);
    shiftVal.textContent = s;

    let res = '';
    for (let i = 0; i < text.length; i++) {
      let c = text.charCodeAt(i);
      if (c >= 65 && c <= 90) {
        res += String.fromCharCode(((c - 65 + s) % 26) + 65);
      } else if (c >= 97 && c <= 122) {
        res += String.fromCharCode(((c - 97 + s) % 26) + 97);
      } else {
        res += text.charAt(i);
      }
    }
    output.textContent = res || 'Result will appear here...';
  }

  input.addEventListener('input', updateCipher);
  shift.addEventListener('input', updateCipher);
}

document.addEventListener('DOMContentLoaded', () => {
  initPasswordAnalyzer();
  initCryptoHasher();
  initCaesarCipher();
});
