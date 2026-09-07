// ===== הודעת תודה אחרי שליחת טופס יצירת קשר =====
(function () {
  const successEl = document.getElementById('formSuccess');
  if (!successEl) return;
  if (new URLSearchParams(window.location.search).get('sent') === '1') {
    successEl.hidden = false;
    successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
})();

// ===== ניווט נייד =====
(function () {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }
})();

// ===== משחק זיכרון =====
(function () {
  const grid = document.getElementById('memoryGrid');
  if (!grid) return;

  const statusEl = document.getElementById('memoryStatus');
  const resetBtn = document.getElementById('memoryReset');
  const icons = ['🎵', '🎸', '🥁', '🎤', '🎹', '🎺', '🌟', '🌍'];

  let first = null;
  let lock = false;
  let matches = 0;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildBoard() {
    grid.innerHTML = '';
    first = null;
    lock = false;
    matches = 0;
    statusEl.textContent = 'נסו למצוא זוגות!';

    const deck = shuffle([...icons, ...icons]);
    deck.forEach((icon) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'memory-tile';
      tile.dataset.icon = icon;
      tile.textContent = '❓';
      tile.setAttribute('aria-label', 'קלף זיכרון, לחצו כדי לחשוף');
      tile.addEventListener('click', () => onTileClick(tile));
      grid.appendChild(tile);
    });
  }

  function onTileClick(tile) {
    if (lock) return;
    if (tile.classList.contains('flipped') || tile.classList.contains('matched')) return;

    tile.classList.add('flipped');
    tile.textContent = tile.dataset.icon;

    if (!first) {
      first = tile;
      return;
    }

    if (first.dataset.icon === tile.dataset.icon) {
      first.classList.add('matched');
      tile.classList.add('matched');
      first = null;
      matches++;
      if (matches === icons.length) {
        statusEl.textContent = '🎉 כל הכבוד! מצאתם את כל הזוגות!';
      }
      return;
    }

    lock = true;
    setTimeout(() => {
      tile.classList.remove('flipped');
      tile.textContent = '❓';
      first.classList.remove('flipped');
      first.textContent = '❓';
      first = null;
      lock = false;
    }, 700);
  }

  resetBtn.addEventListener('click', buildBoard);
  buildBoard();
})();

// ===== סיימון הצלילים =====
(function () {
  const startBtn = document.getElementById('simonStart');
  if (!startBtn) return;

  const statusEl = document.getElementById('simonStatus');
  const pads = Array.from(document.querySelectorAll('.simon-pad'));
  const colors = ['red', 'blue', 'green', 'yellow'];
  const freq = { red: 220, blue: 277, green: 330, yellow: 392 };

  let sequence = [];
  let playerStep = 0;
  let playing = false;
  let audioCtx = null;

  function playTone(color) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq[color];
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (err) {
      // דפדפן ללא תמיכה באודיו - ממשיכים בלי צליל
    }
  }

  function litPad(color, duration) {
    const pad = pads.find((p) => p.dataset.pad === color);
    pad.classList.add('lit');
    playTone(color);
    setTimeout(() => pad.classList.remove('lit'), duration);
  }

  function playSequence() {
    playing = true;
    playerStep = 0;
    statusEl.textContent = 'שימו לב לרצף...';
    let i = 0;
    const interval = setInterval(() => {
      litPad(sequence[i], 750);
      i++;
      if (i >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          playing = false;
          statusEl.textContent = 'עכשיו תורכם! חזרו על הרצף';
        }, 900);
      }
    }, 1200);
  }

  function nextRound() {
    sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    playSequence();
  }

  function onPadClick(color) {
    if (playing) return;
    litPad(color, 300);

    if (color !== sequence[playerStep]) {
      statusEl.textContent = `😅 אופס! הגעתם לשלב ${sequence.length}. לחצו "התחילו" לנסות שוב`;
      sequence = [];
      playerStep = 0;
      return;
    }

    playerStep++;
    if (playerStep === sequence.length) {
      statusEl.textContent = `⭐ מעולה! שלב ${sequence.length} הושלם`;
      setTimeout(nextRound, 900);
    }
  }

  pads.forEach((pad) => {
    pad.addEventListener('click', () => onPadClick(pad.dataset.pad));
  });

  startBtn.addEventListener('click', () => {
    sequence = [];
    playerStep = 0;
    nextRound();
  });
})();
