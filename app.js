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

  /* Continue — hearts flood the whole screen, then the next page opens */
  let heartBusy = false;
  function heartFlood(done) {
    if (heartBusy) return;
    heartBusy = true;
    const layer = document.createElement('div');
    layer.className = 'heart-flood';
    const size = Math.max(64, Math.min(innerWidth, innerHeight) / 5);
    const cols = Math.ceil(innerWidth / size) + 1, rows = Math.ceil(innerHeight / size) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const h = document.createElement('span');
        h.className = 'flood-heart';
        h.textContent = '❤';
        h.style.cssText = 'left:' + (c * size - size / 3) + 'px;top:' + (r * size - size / 3) + 'px;' +
          'font-size:' + (size * 1.5) + 'px;animation-delay:' + (Math.random() * 0.7).toFixed(2) + 's;' +
          'color:hsl(' + (335 + Math.random() * 20) + ',80%,' + (45 + Math.random() * 15) + '%)';
        layer.appendChild(h);
      }
    }
    document.body.appendChild(layer);
    setTimeout(function () { done(); layer.classList.add('fade'); }, 1250);   // screen is fully covered
    setTimeout(function () { layer.remove(); heartBusy = false; }, 1850);
  }
  continueBtn.addEventListener('click', function () { heartFlood(showScreen2); });

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
    photoAudio.pause();
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

  /* Letter photos — each photo has its own song */
  const photoAudio = new Audio();
  photoAudio.loop = true;
  function playSong(card) {
    const src = card.querySelector('img').dataset.song;
    if (!src) return;
    if (!photoAudio.src.endsWith(src)) photoAudio.src = src;
    photoAudio.currentTime = 0;
    photoAudio.play().catch(function () {});
  }
  function stopSong() { photoAudio.pause(); }
  s5.querySelectorAll('.polaroid').forEach(function (card) {
    card.addEventListener('click', function () {      // touch devices: tap to play / pause
      if (window.matchMedia('(hover: hover)').matches) return;
      if (photoAudio.paused || !photoAudio.src.endsWith(card.querySelector('img').dataset.song)) playSong(card); else stopSong();
    });
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
        playSong(card);
        function onMove(e) {
          if (inside(e.clientX, e.clientY, orig) || inside(e.clientX, e.clientY, card.getBoundingClientRect())) return;
          card.classList.remove('is-zoom');
          stopSong();
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
      heartFlood(function () {
        s4.classList.add('s-screen--hidden');
        if (btn.dataset.gift === 'giftbox') { gbOpen.hidden = false; gbLove.hidden = true; s8.classList.remove('s-screen--hidden'); }
        if (btn.dataset.gift === 'bouquet') s6.classList.remove('s-screen--hidden');
        if (btn.dataset.gift === 'envelope') s5.classList.remove('s-screen--hidden');
      });
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




/* ═══════════════════════════════════════════════
   BALLOONS → CAKE → BIRTHDAY SONG, AND PHOTO PUZZLE
═══════════════════════════════════════════════ */
(function () {
  const $ = id => document.getElementById(id);
  const s8 = $('screen-8'), s10 = $('screen-10'), s11 = $('screen-11');
  const show = (from, to) => { from.classList.add('s-screen--hidden'); to.classList.remove('s-screen--hidden'); };

  /* ── Shared sound helpers (Web Audio, no files needed) ── */
  let actx = null;
  const ctx = () => (actx = actx || new (window.AudioContext || window.webkitAudioContext)());
  function pop() {
    const c = ctx(), len = c.sampleRate * 0.12, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = c.createBufferSource(); src.buffer = buf; src.connect(c.destination); src.start();
  }
  // "Happy Birthday to You" melody (public domain) — used if assets/happy-birthday.mp3 is missing
  function playMelody() {
    const c = ctx(), f = { G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784 };
    const seq = [['G4',.75],['G4',.25],['A4',1],['G4',1],['C5',1],['B4',2],
                 ['G4',.75],['G4',.25],['A4',1],['G4',1],['D5',1],['C5',2],
                 ['G4',.75],['G4',.25],['G5',1],['E5',1],['C5',1],['B4',1],['A4',2],
                 ['F5',.75],['F5',.25],['E5',1],['C5',1],['D5',1],['C5',2]];
    let t = c.currentTime + 0.1; const beat = 0.42;
    seq.forEach(function (n) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle'; o.frequency.value = f[n[0]];
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + n[1] * beat);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + n[1] * beat + 0.05);
      t += n[1] * beat;
    });
  }
  const bday = new Audio('assets/happy-birthday.mp3');
  function playBirthday() {
    bday.currentTime = 0;
    bday.play().catch(playMelody);                      // file missing → built-in melody
  }

  /* ── Navigation: I LOVE YOU card → balloons ── */
  $('gbLoveImg').style.cursor = 'pointer';
  $('gbLoveImg').addEventListener('click', function () { show(s8, s10); startBalloons(); });
  $('bnBackBtn').addEventListener('click', function () { bday.pause(); stopMic(); show(s10, s8); });

  /* ── Balloons ── */
  const field = $('bnField');
  let popped = 0, total = 0;
  function startBalloons() {
    $('bnStage').hidden = false; $('ckStage').hidden = true;
    field.innerHTML = ''; popped = 0; total = 9;
    for (let i = 0; i < total; i++) {
      const b = document.createElement('button');
      b.className = 'balloon';
      b.setAttribute('aria-label', 'Balloon');
      b.style.setProperty('--h', (i * 40 + 330) % 360);
      b.style.left = (6 + (i % 5) * 18 + (i > 4 ? 9 : 0)) + '%';
      b.style.top = (i > 4 ? 50 : 8) + '%';
      b.style.animationDelay = (i * 0.25) + 's';
      b.addEventListener('click', function () {
        pop(); b.classList.add('popped');
        setTimeout(function () { b.remove(); }, 250);
        if (++popped === total) setTimeout(startCake, 500);
      });
      field.appendChild(b);
    }
  }

  /* ── Cake: blow (mic or tap) → cut → song ── */
  let stream = null, micTimer = null, blown = false, cut = false;
  function stopMic() {
    clearInterval(micTimer); micTimer = null;
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  }
  function startCake() {
    $('bnStage').hidden = true; $('ckStage').hidden = false;
    blown = cut = false;
    $('cake').classList.remove('cut');
    $('candles').classList.remove('out');
    $('knife').hidden = true;
    $('ckHeading').textContent = 'Make a wish & blow the candles!';
    $('ckHint').textContent = 'Blow into your mic 🎤';
    $('ckBlowBtn').hidden = false; $('ckPuzzleBtn').hidden = true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) {
      stream = st;
      const an = ctx().createAnalyser(); an.fftSize = 512;
      ctx().createMediaStreamSource(st).connect(an);
      const data = new Uint8Array(an.fftSize); let hits = 0;
      micTimer = setInterval(function () {
        an.getByteTimeDomainData(data);
        let sum = 0; for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
        hits = Math.sqrt(sum / data.length) > 0.12 ? hits + 1 : 0;
        if (hits >= 3) blowOut();
      }, 80);
    }).catch(function () { $('ckHint').textContent = 'Mic not available — tap the button 👇'; });
  }
  function blowOut() {
    if (blown) return;
    blown = true; stopMic();
    $('candles').classList.add('out');
    $('ckBlowBtn').hidden = true;
    $('ckHeading').textContent = 'Now cut the cake! 🎂';
    $('ckHint').textContent = 'Tap the cake to cut it';
    $('knife').hidden = false;
  }
  $('ckBlowBtn').addEventListener('click', blowOut);
  $('candles').addEventListener('click', function (e) { e.stopPropagation(); blowOut(); });
  $('cake').addEventListener('click', function () {
    if (!blown || cut) return;
    cut = true;
    $('cake').classList.add('cut');
    $('knife').hidden = true;
    $('ckHeading').textContent = 'Happy Birthday Monika! 🎉';
    $('ckHint').textContent = '';
    $('ckPuzzleBtn').hidden = false;
    playBirthday();
  });
  $('ckPuzzleBtn').addEventListener('click', function () { bday.pause(); show(s10, s11); initPuzzle(); });

  /* ── Sliding photo puzzle (3 x 3) ── */
  const PHOTOS = [1, 2, 3, 4, 5, 6].map(n => 'assets/photo-' + n + '.jpg');
  const board = $('pzBoard'), msg = $('pzMsg');
  let current = PHOTOS[0], tiles = [], moves = 0, solved = false, tileImg = '';

  $('pzBackBtn').addEventListener('click', function () { show(s11, s10); });
  $('pzShuffle').addEventListener('click', function () { shuffle(); });

  function initPuzzle() {
    const th = $('pzThumbs');
    if (!th.childElementCount) PHOTOS.forEach(function (src) {
      const b = document.createElement('button'); b.className = 'pz-thumb';
      b.innerHTML = '<img alt="" src="' + src + '">';
      b.addEventListener('click', function () { setPhoto(src); });
      th.appendChild(b);
    });
    setPhoto(current);
  }
  function setPhoto(src) {
    current = src;
    document.querySelectorAll('.pz-thumb').forEach((b, i) => b.classList.toggle('is-selected', PHOTOS[i] === src));
    const img = new Image();
    img.onload = function () {                           // crop to a centred square so tiles never stretch
      try {
        const side = Math.min(img.width, img.height), cv = document.createElement('canvas');
        cv.width = cv.height = 900;
        cv.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) * 0.8, side, side, 0, 0, 900, 900);
        tileImg = cv.toDataURL('image/jpeg', 0.9);
      } catch (e) { tileImg = src; }
      shuffle();
    };
    img.src = src;
  }
  function shuffle() {
    tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];               // tiles[pos] = piece id, 8 = empty
    let empty = 8, prev = -1;
    for (let i = 0; i < 120; i++) {                      // random legal moves keep it solvable
      const opts = neighbours(empty).filter(p => p !== prev);
      const pick = opts[Math.floor(Math.random() * opts.length)];
      tiles[empty] = tiles[pick]; tiles[pick] = 8; prev = empty; empty = pick;
    }
    if (tiles.every((t, i) => t === i)) return shuffle();
    moves = 0; solved = false; msg.textContent = 'Slide the tiles to rebuild the photo';
    render();
  }
  function neighbours(pos) {
    const r = Math.floor(pos / 3), c = pos % 3, out = [];
    if (r > 0) out.push(pos - 3); if (r < 2) out.push(pos + 3);
    if (c > 0) out.push(pos - 1); if (c < 2) out.push(pos + 1);
    return out;
  }
  function render() {
    board.innerHTML = '';
    board.classList.toggle('is-solved', solved);
    tiles.forEach(function (id, pos) {
      const t = document.createElement('div');
      t.className = 'pz-tile' + (id === 8 && !solved ? ' is-empty' : '');
      if (id !== 8 || solved) {
        t.style.backgroundImage = 'url(' + tileImg + ')';
        t.style.backgroundPosition = ((id % 3) * 50) + '% ' + (Math.floor(id / 3) * 50) + '%';
      }
      t.addEventListener('click', function () { move(pos); });
      let sx = 0, sy = 0;                                // swipe support
      t.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; });
      t.addEventListener('pointerup', function (e) {
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.max(Math.abs(dx), Math.abs(dy)) > 25) { e.preventDefault(); t.dataset.swiped = '1'; move(pos); }
      });
      board.appendChild(t);
    });
  }
  function move(pos) {
    if (solved) return;
    const empty = tiles.indexOf(8);
    if (!neighbours(empty).includes(pos)) return;
    tiles[empty] = tiles[pos]; tiles[pos] = 8; moves++;
    solved = tiles.every((t, i) => t === i);
    if (solved) msg.textContent = '🎉 You did it in ' + moves + ' moves!';
    render();
  }
})();
