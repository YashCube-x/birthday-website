/* ═══════════════════════════════════════
   app.js — Three.js floating hearts bg
═══════════════════════════════════════ */

'use strict';

// ─── Three.js Background ───
(function () {
  const canvas = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 500);
  camera.position.z = 40;

  // ── Heart sprite texture ──
  const hc = document.createElement('canvas');
  hc.width = hc.height = 64;
  const cx = hc.getContext('2d');
  cx.fillStyle = 'hsl(345,70%,60%)';
  cx.beginPath();
  for (let t = 0; t <= Math.PI * 2; t += 0.01) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t));
    t < 0.01 ? cx.moveTo(32 + x*1.7, 30 + y*1.7)
             : cx.lineTo(32 + x*1.7, 30 + y*1.7);
  }
  cx.fill();
  const heartTex = new THREE.CanvasTexture(hc);

  // ── Particles ──
  const COUNT = 150;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(COUNT * 3);
  const vel   = [];

  for (let i = 0; i < COUNT; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 90;
    pos[i*3+1] = (Math.random() - 0.5) * 70;
    pos[i*3+2] = (Math.random() - 0.5) * 20;
    vel.push({
      x: (Math.random() - 0.5) * 0.03,
      y:  Math.random() * 0.04 + 0.01,
    });
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.8,
    map: heartTex,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // ── Resize ──
  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }
  window.addEventListener('resize', resize);
  resize();

  // ── Loop ──
  let frame = 0;
  function loop() {
    requestAnimationFrame(loop);
    frame++;
    const p = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      p[i*3]   += vel[i].x;
      p[i*3+1] += vel[i].y;
      if (p[i*3+1] > 40)  p[i*3+1] = -40;
      if (p[i*3]   >  50) p[i*3]   = -50;
      if (p[i*3]   < -50) p[i*3]   =  50;
    }
    geo.attributes.position.needsUpdate = true;
    mat.opacity = 0.3 + Math.sin(frame * 0.04) * 0.15;
    renderer.render(scene, camera);
  }
  loop();
})();

/* ═══════════════════════════════════════════════
   SCREEN NAVIGATION + SCREEN 2 LOGIC
═══════════════════════════════════════════════ */
(function () {
  const s1          = document.getElementById('screen-1');
  const s2          = document.getElementById('screen-2');
  const threeCanvas = document.getElementById('three-canvas');
  const continueBtn = document.getElementById('continueBtn');
  const yesBtn      = document.getElementById('yesBtn');
  const noBtn       = document.getElementById('noBtn');

  /* ── Confetti seeder ── */
  function seedConfetti() {
    const layer  = document.getElementById('confettiLayer');
    if (!layer || layer.childElementCount > 0) return;   // only once
    const colors = ['#ff6b9d','#ffcc02','#7c3aed','#00e5ff','#ff4500','#adff2f','#ff69b4','#ffd700','#4ade80'];
    for (let i = 0; i < 55; i++) {
      const dot = document.createElement('div');
      dot.className = 'confetti-dot';
      const size = Math.random() * 7 + 3;
      dot.style.cssText = `
        width:  ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        top:  ${Math.random() * 100}%;
      `;
      layer.appendChild(dot);
    }
  }

  /* ── Navigate to Screen 2 ── */
  function showScreen2() {
    s1.classList.add('s-screen--hidden');
    s2.classList.remove('s-screen--hidden');
    threeCanvas.style.transition = 'opacity 0.4s ease';
    threeCanvas.style.opacity    = '0';
    seedConfetti();
  }

  /* ── Navigate back to Screen 1 ── */
  function showScreen1() {
    s2.classList.add('s-screen--hidden');
    s1.classList.remove('s-screen--hidden');
    threeCanvas.style.opacity = '1';
  }

  continueBtn.addEventListener('click', showScreen2);

  /* YES button — open Screen 4 */
  const s4 = document.getElementById('screen-4');
  const s5 = document.getElementById('screen-5');
  const s6 = document.getElementById('screen-6');
  const s7 = document.getElementById('screen-7');
  const s8 = document.getElementById('screen-8');
  const gbOpen = document.getElementById('gbOpenBtn');
  const gbLove = document.getElementById('gbLoveImg');
  const BOUQUET_MSG = {
    roses:      { hand: 'roses for<br>my Monika!',       line: '“The love of my life”',          b: 'my heart is yours',  c: 'i love you, always' },
    tulips:     { hand: 'tulips for<br>my cutie!',        line: '“My favourite smile”',           b: 'you make me happy',  c: 'my best friend' },
    sunflowers: { hand: 'sunflowers for<br>my sunshine!', line: '“The brightest part of my day”', b: "i'm your #1 fan",    c: 'my favorite person' }
  };
  const BOUQUET_IMG = { roses: 'assets/bouquet-roses.png', tulips: 'assets/bouquet-tulips.png', sunflowers: 'assets/bouquet-sunflowers.png' };
  let selectedBouquet = null;
  yesBtn.addEventListener('click', function () {
    s2.classList.add('s-screen--hidden');
    s4.classList.remove('s-screen--hidden');
  });

  document.getElementById('llBackBtn').addEventListener('click', function () {
    s5.classList.add('s-screen--hidden');
    s4.classList.remove('s-screen--hidden');
  });

  /* Screen 6 — bouquet selection */
  const bbOpts = document.querySelectorAll('.bb-opt');
  const bbNext = document.getElementById('bbNextBtn');
  bbOpts.forEach(function (opt) {
    opt.addEventListener('click', function () {
      selectedBouquet = opt.dataset.bouquet;
      document.body.dataset.bouquet = selectedBouquet;
      bbOpts.forEach(o => {
        o.classList.toggle('is-selected', o === opt);
        o.setAttribute('aria-checked', o === opt ? 'true' : 'false');
      });
      bbNext.disabled = false;
    });
  });
  bbNext.addEventListener('click', function () {
    if (!selectedBouquet) return;
    document.body.dataset.bouquet = selectedBouquet;
    document.getElementById('sbBouquetImg').src = BOUQUET_IMG[selectedBouquet];
    document.getElementById('sbBouquetImg').alt = selectedBouquet;
    const m = BOUQUET_MSG[selectedBouquet];
    document.getElementById('sbHand').innerHTML = m.hand;
    document.getElementById('sbLine').textContent = m.line;
    document.getElementById('sbB').textContent = m.b;
    document.getElementById('sbC').textContent = m.c;
    s6.classList.add('s-screen--hidden');
    s7.classList.remove('s-screen--hidden');
  });
  document.getElementById('bbBackBtn').addEventListener('click', function () {
    s6.classList.add('s-screen--hidden');
    s4.classList.remove('s-screen--hidden');
  });

  document.getElementById('sbBackBtn').addEventListener('click', function () {
    s7.classList.add('s-screen--hidden');
    s6.classList.remove('s-screen--hidden');
  });

  gbOpen.addEventListener('click', function () {
    gbOpen.hidden = true; gbLove.hidden = false;
  });
  document.getElementById('gbBackBtn').addEventListener('click', function () {
    if (!gbLove.hidden) { gbOpen.hidden = false; gbLove.hidden = true; return; }
    gbAudio.pause();
    s8.classList.add('s-screen--hidden');
    s4.classList.remove('s-screen--hidden');
  });

  /* Music player */
  const gbAudio = document.getElementById('gbAudio');
  const gbPlay  = document.getElementById('gbPlayBtn');
  const gbFill  = document.getElementById('gbBarFill');
  function setPlayIcon() { gbPlay.textContent = gbAudio.paused ? '▶' : '❚❚'; gbPlay.setAttribute('aria-label', gbAudio.paused ? 'Play' : 'Pause'); }
  gbPlay.addEventListener('click', function () {
    if (gbAudio.paused) gbAudio.play().catch(setPlayIcon); else gbAudio.pause();
  });
  gbAudio.addEventListener('play',  setPlayIcon);
  gbAudio.addEventListener('pause', setPlayIcon);
  gbAudio.loop = true;
  gbAudio.addEventListener('ended', function () { gbFill.style.width = '0'; setPlayIcon(); });
  gbAudio.addEventListener('timeupdate', function () {
    if (gbAudio.duration) gbFill.style.width = (gbAudio.currentTime / gbAudio.duration * 100) + '%';
  });

  /* Letter photos — hover zooms 3x into the centre of the screen */
  if (window.matchMedia('(hover: hover)').matches) {
    const inside = (x, y, r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    s5.querySelectorAll('.polaroid').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        if (card.classList.contains('is-zoom')) return;
        const orig = card.getBoundingClientRect();
        const area = card.closest('.grid-paper').getBoundingClientRect();
        card.style.setProperty('--dx', (area.left + area.width / 2 - (orig.left + orig.width / 2)) + 'px');
        card.style.setProperty('--dy', (area.top + area.height / 2 - (orig.top + orig.height / 2)) + 'px');
        card.classList.add('is-zoom');
        function onMove(e) {
          if (inside(e.clientX, e.clientY, orig) || inside(e.clientX, e.clientY, card.getBoundingClientRect())) return;
          card.classList.remove('is-zoom');
          document.removeEventListener('mousemove', onMove);
        }
        document.addEventListener('mousemove', onMove);
      });
    });
  }

  /* Back buttons — Screen 2 → 1, Screen 4 → 2 */
  document.getElementById('s2BackBtn').addEventListener('click', showScreen1);
  document.getElementById('s4BackBtn').addEventListener('click', function () {
    s4.classList.add('s-screen--hidden');
    s2.classList.remove('s-screen--hidden');
  });

  /* Gift selection (visual state only) */
  document.querySelectorAll('.gift-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.gift-btn').forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      if (btn.dataset.gift === 'giftbox') {
        gbOpen.hidden = false; gbLove.hidden = true;
        s4.classList.add('s-screen--hidden');
        s8.classList.remove('s-screen--hidden');
      }
      if (btn.dataset.gift === 'bouquet') {
        s4.classList.add('s-screen--hidden');
        s6.classList.remove('s-screen--hidden');
      }
      if (btn.dataset.gift === 'envelope') {
        s4.classList.add('s-screen--hidden');
        s5.classList.remove('s-screen--hidden');
      }
    });
  });

  /* NO button — open Screen 9; TRY AGAIN returns to Screen 2 */
  const s9 = document.getElementById('screen-9');
  noBtn.addEventListener('click', function () {
    s2.classList.add('s-screen--hidden');
    s9.classList.remove('s-screen--hidden');
  });
  document.getElementById('noRetryBtn').addEventListener('click', function () {
    s9.classList.add('s-screen--hidden');
    s2.classList.remove('s-screen--hidden');
  });

  /* Confetti burst on YES */
  function burstConfetti() {
    const colors = ['#ff6b9d','#ffcc02','#c084fc','#34d399','#60a5fa','#fb923c','#f472b6'];
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size  = Math.random() * 10 + 5;
      el.style.cssText = `
        position:fixed; top:-10px; left:${Math.random()*100}vw;
        width:${size}px; height:${size}px;
        background:${color}; border-radius:${Math.random()>0.5?'50%':'2px'};
        z-index:999; pointer-events:none;
        animation: confettiFall ${Math.random()*2+1.5}s ${Math.random()*0.8}s ease-in forwards;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }
  }

  /* Keyboard: Escape goes back */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') showScreen1();
  });
})();


