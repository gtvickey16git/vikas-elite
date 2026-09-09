/**
 * VIKAS.ELITE // Interactive CLI Terminal Simulator (vikas-cli v2.0)
 */

class CyberTerminal {
  constructor() {
    this.terminalBody = document.getElementById('terminal-body');
    this.terminalOutput = document.getElementById('terminal-output');
    this.terminalInput = document.getElementById('terminal-input');
    this.history = [];
    this.historyIndex = -1;

    this.commands = {
      help: () => this.cmdHelp(),
      whoami: () => this.cmdWhoami(),
      college: () => this.cmdCollege(),
      skills: () => this.cmdSkills(),
      projects: () => this.cmdProjects(),
      socials: () => this.cmdSocials(),
      instagram: () => this.cmdInstagram(),
      matrix: () => this.cmdMatrix(),
      hack: () => this.cmdHack(),
      clear: () => this.cmdClear(),
      sudo: () => `<span class="t-warn">[ACCESS DENIED]</span> Biometric clearance level 5 required for root execution. Contact Vikas (@gt__vickey) for authorization token.`,
      about: () => this.cmdWhoami(),
      contact: () => this.cmdSocials(),
      date: () => `<span class="t-cyan">SYSTEM TIME:</span> ${new Date().toUTCString()} | Status: All Defense Perimeters Active.`
    };

    this.init();
  }

  init() {
    if (!this.terminalInput) return;

    // Welcome banner
    this.printInitialGreeting();

    // Input listeners
    this.terminalInput.addEventListener('keydown', (e) => {
      if (window.cyberAudio) window.cyberAudio.playKeypress();

      if (e.key === 'Enter') {
        const inputVal = this.terminalInput.value.trim();
        if (inputVal) {
          this.executeCommand(inputVal);
          this.history.push(inputVal);
          this.historyIndex = this.history.length;
          this.terminalInput.value = '';
        }
      } else if (e.key === 'ArrowUp') {
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.terminalInput.value = this.history[this.historyIndex];
        }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.terminalInput.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.terminalInput.value = '';
        }
        e.preventDefault();
      }
    });

    // Quick chips listener
    document.querySelectorAll('.cmd-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const cmd = chip.getAttribute('data-cmd');
        if (cmd) {
          if (window.cyberAudio) window.cyberAudio.playClick();
          this.executeCommand(cmd);
        }
      });
    });
  }

  printInitialGreeting() {
    const greeting = `
<div class="terminal-output-line"><span class="t-success">VIKAS_SECURITY_OS [Version 2.4.0-release]</span></div>
<div class="terminal-output-line"><span class="t-cyan">AUTHENTICATED USER:</span> guest@cvrce-cyberlab</div>
<div class="terminal-output-line"><span class="t-warn">Type 'help' or click the quick command chips above to explore.</span></div>
<hr style="border: 0; border-top: 1px dashed rgba(0, 255, 157, 0.2); margin: 10px 0;">
    `;
    this.terminalOutput.innerHTML = greeting;
  }

  executeCommand(rawCmd) {
    const parts = rawCmd.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Render entered command line
    const cmdRow = document.createElement('div');
    cmdRow.className = 'terminal-output-line';
    cmdRow.innerHTML = `<span class="t-prompt-prefix">vikas@cvrce:~$</span> <span class="t-cmd-text">${this.escapeHTML(rawCmd)}</span>`;
    this.terminalOutput.appendChild(cmdRow);

    // Process output
    const responseRow = document.createElement('div');
    responseRow.className = 't-system-response';

    if (this.commands[cmd]) {
      const output = this.commands[cmd](args);
      if (output !== null) {
        responseRow.innerHTML = output;
        this.terminalOutput.appendChild(responseRow);
      }
    } else {
      if (window.cyberAudio) window.cyberAudio.playError();
      responseRow.innerHTML = `<span class="t-error">command not found: "${this.escapeHTML(cmd)}"</span>. Type <span class="t-success">'help'</span> for list of commands.`;
      this.terminalOutput.appendChild(responseRow);
    }

    this.scrollToBottom();
  }

  cmdHelp() {
    return `
<div class="t-cyan">AVAILABLE SYSTEM COMMANDS:</div>
<table style="width: 100%; border-collapse: collapse; margin-top: 6px;">
  <tr><td style="color: var(--accent-primary); width: 120px;">help</td><td>Display this interactive command index</td></tr>
  <tr><td style="color: var(--accent-primary);">whoami</td><td>Display identity dossier & academic profile</td></tr>
  <tr><td style="color: var(--accent-primary);">college</td><td>Details on CVR College of Engineering & Cyber Labs</td></tr>
  <tr><td style="color: var(--accent-primary);">skills</td><td>Inspect cybersecurity tooling & proficiencies</td></tr>
  <tr><td style="color: var(--accent-primary);">projects</td><td>Review top offensive/defensive cybersecurity tools</td></tr>
  <tr><td style="color: var(--accent-primary);">socials</td><td>List official social links (Instagram, GitHub, LinkedIn)</td></tr>
  <tr><td style="color: var(--accent-primary);">instagram</td><td>Open Vikas's official Instagram profile (@gt__vickey)</td></tr>
  <tr><td style="color: var(--accent-primary);">matrix</td><td>Toggle holographic Matrix digital rain canvas</td></tr>
  <tr><td style="color: var(--accent-primary);">hack</td><td>Simulate interactive penetration testing exploit sequence</td></tr>
  <tr><td style="color: var(--accent-primary);">clear</td><td>Clear terminal screen buffer</td></tr>
  <tr><td style="color: var(--accent-primary);">sudo</td><td>Request superuser root escalation</td></tr>
</table>
    `;
  }

  cmdWhoami() {
    return `
<div class="t-cyan">=== [ PERSONNEL DOSSIER: VIKAS ] ===</div>
<div><strong style="color: #fff;">NAME:</strong> Vikas (Alias: vikas.elite / @vickey_theelite)</div>
<div><strong style="color: #fff;">SCHOOLING:</strong> St. Joseph's School (Foundational Education)</div>
<div><strong style="color: #fff;">COLLEGE:</strong> CVR College of Engineering, Hyderabad</div>
<div><strong style="color: #fff;">ACADEMIC STATUS:</strong> 2nd Year B.Tech (Cybersecurity)</div>
<div><strong style="color: #fff;">CORE FOCUS:</strong> Ethical Hacking, Web & Network Penetration Testing, Threat Intelligence, Cryptanalysis</div>
<div><strong style="color: #fff;">QUOTE:</strong> "If your life requires you to walk through hell, walk like you own the hell."</div>
    `;
  }

  cmdCollege() {
    return `
<div class="t-cyan">=== [ ACADEMIC & INSTITUTIONAL PROFILE ] ===</div>
<div>🏫 <strong>Schooling:</strong> St. Joseph's School</div>
<div>🏛️ <strong>Undergraduate College:</strong> CVR College of Engineering (Autonomous), Hyderabad</div>
<div>🎓 <strong>Department:</strong> Computer Science & Engineering (Cybersecurity)</div>
<div>📅 <strong>Standing:</strong> 2nd Year B.Tech (Class of 2028)</div>
<div>🔬 <strong>Active Lab Work:</strong> Advanced Network Security Lab, Cryptography Workbench, Linux Kernel Forensics.</div>
    `;
  }

  cmdSkills() {
    return `
<div class="t-cyan">=== [ SECURITY ARSENAL // PROFICIENCIES ] ===</div>
<div>🔹 <strong>Offensive Security:</strong> Burp Suite Pro, Metasploit, Nmap, OWASP Top 10, SQLMap, Gobuster</div>
<div>🔹 <strong>Defensive & SOC:</strong> Wireshark, Snort IDS/IPS, Linux Hardening, iptables, SIEM basics</div>
<div>🔹 <strong>Forensics & Crypto:</strong> Autopsy, Volatility, Hashcat, John the Ripper, Ghidra, Steganography</div>
<div>🔹 <strong>Programming:</strong> Python (Automation & Scapy), Bash Scripting, C/C++, JavaScript, SQL</div>
<div>🔹 <strong>Environments:</strong> Kali Linux, Arch, Ubuntu Server, Docker, VMware Workstation</div>
    `;
  }

  cmdProjects() {
    return `
<div class="t-cyan">=== [ FEATURED PROJECTS & REPOSITORIES ] ===</div>
<div>1. <strong style="color: var(--accent-primary);">ZeroDay Sentry</strong> - AI-Powered Network Anomaly & Intrusion Detection System</div>
<div>2. <strong style="color: var(--accent-primary);">Vanguard CTF Toolkit</strong> - Automated Reconnaissance & OSINT Enumeration Suite</div>
<div>3. <strong style="color: var(--accent-primary);">StegoShield</strong> - High-Entropy LSB Payload Concealment & Steganalysis</div>
<div>4. <strong style="color: var(--accent-primary);">PacketPulse</strong> - Real-Time Web-Based Live Packet Sniffer & Flow Inspector</div>
<div>5. <strong style="color: var(--accent-primary);">CVR CyberLab Sandbox</strong> - 25+ College CTF Practice Challenges & Writeups</div>
    `;
  }

  cmdSocials() {
    return `
<div class="t-cyan">=== [ VERIFIED COMMUNICATIONS ] ===</div>
<div>📧 <strong>Direct Email:</strong> <a href="mailto:gtvickey16@gmail.com" style="color: var(--accent-primary); text-decoration: underline;">gtvickey16@gmail.com</a></div>
<div>📸 <strong>Contact Instagram:</strong> <a href="https://instagram.com/vickey_theelite" target="_blank" style="color: #ff5e98; text-decoration: underline;">@vickey_theelite (Contact Page Profile)</a></div>
<div>📸 <strong>Personal Instagram:</strong> <a href="https://instagram.com/gt__vickey" target="_blank" style="color: #ff5e98; text-decoration: underline;">@gt__vickey (Main Profile)</a></div>
<div>💻 <strong>GitHub:</strong> <a href="https://github.com" target="_blank" style="color: var(--accent-primary); text-decoration: underline;">github.com/vikas-elite</a></div>
<div>💼 <strong>LinkedIn:</strong> <a href="https://linkedin.com" target="_blank" style="color: var(--accent-secondary); text-decoration: underline;">linkedin.com/in/vikas-cybersecurity</a></div>
    `;
  }

  cmdInstagram(args) {
    if (args && args[0] && args[0].toLowerCase().includes('gt')) {
      window.open('https://instagram.com/gt__vickey', '_blank');
      return `<span class="t-success">[SUCCESS]</span> Redirecting to <a href="https://instagram.com/gt__vickey" target="_blank" style="color: #ff5e98;">@gt__vickey</a>...`;
    }
    window.open('https://instagram.com/vickey_theelite', '_blank');
    return `<span class="t-success">[SUCCESS]</span> Redirecting to official contact Instagram <a href="https://instagram.com/vickey_theelite" target="_blank" style="color: #ff5e98;">@vickey_theelite</a> (also available: <a href="https://instagram.com/gt__vickey" target="_blank" style="color: #ff5e98;">@gt__vickey</a>)...`;
  }

  cmdMatrix() {
    const canvas = document.getElementById('matrix-canvas');
    if (canvas) {
      canvas.classList.toggle('matrix-active');
      const isActive = canvas.classList.contains('matrix-active');
      return `<span class="t-success">[MATRIX MODE]</span> ${isActive ? 'Full-screen digital rain activated. Type matrix again to minimize.' : 'Standard view restored.'}`;
    }
    return 'Matrix canvas not found.';
  }

  cmdHack() {
    const hackSteps = [
      '[+] Initializing Port Scan on target 192.168.1.104...',
      '[+] Open ports detected: 22/SSH, 80/HTTP, 443/HTTPS, 8080/APACHE...',
      '[+] Running Vulnerability Exploit Check: CVE-2024-XXXX...',
      '[+] Payload injected: Buffer overflow bypassed ASLR & DEP...',
      '[+] Root privilege escalation successful! Reverse TCP shell established on port 4444.',
      '<span class="t-success">[FLAG CAPTURED]: CVR{v1k4s_3l1t3_m4st3r_h4ck3r_2026}</span>'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < hackSteps.length) {
        const stepRow = document.createElement('div');
        stepRow.className = 'terminal-output-line';
        stepRow.innerHTML = hackSteps[stepIndex];
        this.terminalOutput.appendChild(stepRow);
        this.scrollToBottom();
        if (window.cyberAudio) window.cyberAudio.playKeypress();
        stepIndex++;
      } else {
        clearInterval(interval);
        if (window.cyberAudio) window.cyberAudio.playSuccess();
      }
    }, 400);

    return '<span class="t-warn">[EXPLOIT SEQUENCE LAUNCHED]</span> Executing automated penetration script...';
  }

  cmdClear() {
    this.terminalOutput.innerHTML = '';
    return null;
  }

  scrollToBottom() {
    if (this.terminalBody) {
      this.terminalBody.scrollTop = this.terminalBody.scrollHeight;
    }
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

// Matrix Canvas Rain Effect
function initMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+-/<>~ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(5, 8, 14, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff9d';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = chars.charAt(Math.floor(Math.random() * chars.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 35);

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  window.cyberTerminal = new CyberTerminal();
  initMatrixRain();
});
