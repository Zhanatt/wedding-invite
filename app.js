/* ===== Настройки ===== */
const CONFIG = {
  // URL веб-приложения Google Apps Script (см. README.md). Пока пусто — форма не отправится.
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbydwGkepympC928jy6cGSgv1FNuXsst2tgmQKmBZGsPPjXKUw7qOJfvT7RnRN6P1fHC/exec',
  // Вариант без Apps Script: Google Форма, привязанная к таблице (см. README.md).
  // Если задан formId — ответы идут в форму, rsvpEndpoint не нужен.
  googleForm: { formId: '', nameEntry: '', answerEntry: '' },
  // Музыка играет через встроенный плеер YouTube (ничего не скачивается).
  // Пусто — берётся файл audio/theme.mp3, если он есть.
  youtubeId: '', // играет файл audio/theme.mp3 (JAX 02.14 — Өзгөчө күн)
  youtubeStart: 7, // с какой секунды играть (и при повторе)
  // Файл audio/theme.mp3 включается прямо по нажатию на конверт (YouTube так не умеет).
  // Чтобы играл файл — положите его в audio/ и сделайте youtubeId: ''.
  audioStart: 7,
  weddingDate: '2026-10-25T16:00:00+06:00',
  calendar: { year: 2026, month: 10, mark: 25 },
  texts: {
    sending: 'Жөнөтүлүүдө…',
    done: 'Рахмат! Жообуңуз кабыл алынды.',
    error: 'Ката кетти. Кайра аракет кылыңыз.',
    needName: 'Аты-жөнүңүздү жазыңыз',
    needAnswer: 'Жоопту тандаңыз',
  },
};

const WEEKDAYS = ['Дш', 'Шш', 'Шр', 'Бш', 'Жм', 'Иш', 'Жк'];

/* ===== Календарь ===== */
(function renderCalendar() {
  const { year, month, mark } = CONFIG.calendar;
  const first = (new Date(year, month - 1, 1).getDay() + 6) % 7; // понедельник = 0
  const days = new Date(year, month, 0).getDate();
  let cells = WEEKDAYS.map(d => `<span class="cal-wd">${d}</span>`).join('');
  for (let i = 0; i < first; i++) cells += '<span class="cal-day"></span>';
  for (let d = 1; d <= days; d++) {
    cells += d === mark ? `<span class="cal-day cal-day-mark">${d}</span>` : `<span class="cal-day">${d}</span>`;
  }
  document.getElementById('cal').innerHTML = cells;
})();

/* ===== Появление элементов по скроллу ===== */
function startReveal() {
  const items = document.querySelectorAll('[data-anim]:not(.is-in)');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
}

/* ===== Музыка ===== */
const soundBtn = document.querySelector('.sound-btn');
let userMuted = false;
const hideSound = () => { soundBtn.style.display = 'none'; };
function setPlaying(on) {
  soundBtn.dataset.playing = String(on);
  soundBtn.setAttribute('aria-pressed', String(on));
}

// единый интерфейс плеера: play() / pause() / isPaused()
const music = CONFIG.youtubeId ? youtubeMusic(CONFIG.youtubeId) : fileMusic(document.getElementById('theme'));

function fileMusic(audio) {
  // ошибка загрузки могла случиться ещё до запуска скрипта — проверяем и сейчас, и потом
  if (audio.error) hideSound();
  audio.addEventListener('error', hideSound);
  const START = CONFIG.audioStart || 0;
  audio.loop = false;
  audio.addEventListener('ended', () => { audio.currentTime = START; audio.play(); }); // повтор тоже с START
  return {
    play: () => {
      if (audio.currentTime < START) audio.currentTime = START;
      return audio.play().then(() => setPlaying(true), err => { if (err && err.name === 'NotSupportedError') hideSound(); });
    },
    pause: () => { audio.pause(); setPlaying(false); },
    isPaused: () => audio.paused,
  };
}

function youtubeMusic(id) {
  document.getElementById('theme').remove();
  let player = null, wantPlay = false;
  const box = document.createElement('div');
  box.id = 'yt-music';
  // YouTube не запускает плеер меньше 200×200 — делаем его полноразмерным, но прозрачным и под содержимым
  box.style.cssText = 'position:fixed;left:0;bottom:0;width:200px;height:200px;opacity:0;pointer-events:none;z-index:-1';
  box.innerHTML = '<div id="yt-player"></div>';
  document.body.appendChild(box);

  const START = CONFIG.youtubeStart || 0;
  const ready = () => player && player.playVideo;
  const isOn = () => ready() && [YT.PlayerState.PLAYING, YT.PlayerState.BUFFERING].includes(player.getPlayerState());
  // кнопка «играет» только когда реально слышно звук
  const refresh = () => setPlaying(!!(isOn() && !player.isMuted()));

  // Браузеры включают звук только по нажатию. Если музыка стартовала беззвучно
  // (плеер не успел загрузиться к нажатию на конверт), звук включится от следующего касания.
  const gestures = ['pointerup', 'touchend', 'keydown'];
  function unlock() {
    if (!ready() || !wantPlay || userMuted) return;
    player.unMute();
    if (!isOn()) player.playVideo();
    setTimeout(() => { refresh(); if (isOn() && !player.isMuted()) gestures.forEach(g => removeEventListener(g, unlock, true)); }, 400);
  }
  const armUnlock = () => gestures.forEach(g => addEventListener(g, unlock, true));

  function start() {
    if (player.getCurrentTime() < START) player.seekTo(START, true);
    player.playVideo();
  }

  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('yt-player', {
      width: 200, height: 200, videoId: id,
      playerVars: { autoplay: 0, controls: 0, start: START, playsinline: 1, disablekb: 1, rel: 0 },
      events: {
        onReady: () => {
          player.setVolume(70);
          // нажатие уже было, а плеер только загрузился — без звука браузер не даст, включим звук по касанию
          if (wantPlay && !userMuted) { player.mute(); start(); armUnlock(); }
        },
        onStateChange: e => {
          if (e.data === YT.PlayerState.ENDED && wantPlay) { player.seekTo(START, true); player.playVideo(); }
          refresh();
        },
        onError: hideSound, // видео удалено или владелец запретил встраивание (101/150)
      },
    });
  };
  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  s.onerror = hideSound;
  document.head.appendChild(s);

  return {
    play: () => {
      wantPlay = true;
      if (!ready()) return; // запустится в onReady
      player.unMute();
      start();
      setTimeout(() => {
        refresh();
        // браузер не дал стартовать со звуком — играем беззвучно, звук включится по следующему касанию
        if (wantPlay && !userMuted && (!isOn() || player.isMuted())) { player.mute(); start(); armUnlock(); }
      }, 1500);
    },
    pause: () => { wantPlay = false; if (ready()) player.pauseVideo(); setPlaying(false); },
    isPaused: () => soundBtn.dataset.playing !== 'true',
  };
}

function tryPlay() {
  if (!userMuted) music.play();
}
soundBtn.addEventListener('click', e => {
  e.stopPropagation();
  if (music.isPaused()) { userMuted = false; music.play(); }
  else { userMuted = true; music.pause(); }
});
['pointerdown', 'touchstart', 'scroll'].forEach(ev => addEventListener(ev, tryPlay, { once: true, passive: true }));

/* ===== Конверт ===== */
(function envelope() {
  const env = document.querySelector('.envelope');
  const block = e => { if (env.dataset.open === 'false') e.preventDefault(); };
  const keys = e => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key) && env.dataset.open === 'false') {
      e.preventDefault();
      if (e.key === ' ') open();
    }
  };
  function open() {
    if (env.dataset.open === 'true') return;
    env.dataset.open = 'true';
    env.setAttribute('aria-hidden', 'true');
    env.tabIndex = -1;
    document.body.classList.remove('locked');
    removeEventListener('wheel', block);
    removeEventListener('touchmove', block);
    removeEventListener('keydown', keys);
    scrollTo(0, 0);
    tryPlay();
    startReveal();
  }
  addEventListener('wheel', block, { passive: false });
  addEventListener('touchmove', block, { passive: false });
  addEventListener('keydown', keys);
  env.addEventListener('click', open);
  env.focus({ preventScroll: true });
})();

/* ===== Таймер ===== */
(function countdown() {
  const cells = {};
  document.querySelectorAll('#countdown [data-unit]').forEach(el => { cells[el.dataset.unit] = el; });
  const target = new Date(CONFIG.weddingDate).getTime();
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60); s %= 60;
    cells.d.textContent = pad(d); cells.h.textContent = pad(h);
    cells.m.textContent = pad(m); cells.s.textContent = pad(s);
  };
  tick();
  setInterval(tick, 1000);
})();

/* ===== Анкета → Google Таблица ===== */
(function rsvp() {
  const box = document.getElementById('rsvp');
  const form = box.querySelector('form');
  const input = form.elements.name;
  const btn = form.querySelector('.form-submit');
  const note = form.querySelector('.form-note');
  const T = CONFIG.texts;

  input.addEventListener('input', () => input.classList.remove('invalid'));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = input.value.trim();
    const answer = (form.querySelector('input[name="answer"]:checked') || {}).value;
    if (!name) { input.classList.add('invalid'); note.textContent = T.needName; input.focus(); return; }
    if (!answer) { note.textContent = T.needAnswer; return; }
    const gf = CONFIG.googleForm;
    if (!CONFIG.rsvpEndpoint && !gf.formId) { note.textContent = T.error; console.warn('Не задан ни rsvpEndpoint, ни googleForm — см. README.md'); return; }

    btn.disabled = true;
    note.textContent = T.sending;
    try {
      if (gf.formId) {
        // Google Forms не отдаёт CORS-заголовки — ответ «непрозрачный», считаем отправку успешной
        const body = new URLSearchParams({ [`entry.${gf.nameEntry}`]: name, [`entry.${gf.answerEntry}`]: answer });
        await fetch(`https://docs.google.com/forms/d/e/${gf.formId}/formResponse`, { method: 'POST', mode: 'no-cors', body });
        box.innerHTML = `<p class="form-done">${T.done}</p>`;
        return;
      }
      // text/plain — «простой» запрос без preflight, Apps Script его принимает
      const res = await fetch(CONFIG.rsvpEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ name, answer, page: location.href }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.error || res.status);
      box.innerHTML = `<p class="form-done">${T.done}</p>`;
    } catch (err) {
      console.error(err);
      note.textContent = T.error;
      btn.disabled = false;
    }
  });
})();

/* ===== Птички: невеста вылетает из арки (остаётся бежевый след) и летит к жениху у таймера ===== */
(function birds() {
  const arch = document.querySelector('.arch');
  const perchLine = document.querySelector('.perch-line');
  if (!arch || !perchLine) return;

  const flower = (x, y, c) => `<g class="bird-flower">${[0, 72, 144, 216, 288].map(a => {
    const r = a * Math.PI / 180; return `<circle cx="${(x + Math.cos(r) * 2.7).toFixed(2)}" cy="${(y + Math.sin(r) * 2.7).toFixed(2)}" r="2.4" fill="${c}"/>`;
  }).join('')}<circle cx="${x}" cy="${y}" r="1.5" fill="#d9a441"/></g>`;
  const CROWN = `<g class="bird-crown">
    <ellipse cx="62" cy="15" rx="3.4" ry="1.6" transform="rotate(-40 62 15)" fill="#6f8a5c"/>
    <ellipse cx="80" cy="13" rx="3.4" ry="1.6" transform="rotate(35 80 13)" fill="#6f8a5c"/>
    ${flower(58, 20, '#f2b8c6')}${flower(65, 13.5, '#fff5e1')}${flower(73, 11, '#f2b8c6')}${flower(81, 14.5, '#fff5e1')}
  </g>`;
  const BOW = `<g class="bird-bow"><path d="M69 41.5l7 4.5-7 4.5zM83 41.5l-7 4.5 7 4.5z" fill="#fff"/><circle cx="76" cy="46" r="2.1" fill="#fff"/></g>`;
  // пухлая птичка: тельце + голова + хвостик + крылышко; outline — кремовый контур вокруг всего силуэта
  const shapes = cls => `<g class="${cls}">
    <path class="bird-tail" d="M26 42C16 40 9 35 4 31c2 9 5 17 10 22 4 3 10 3 13 1z"/>
    <ellipse cx="48" cy="48" rx="28" ry="21"/>
    <circle cx="70" cy="30" r="16"/>
    <path class="bird-wing" d="M55 43C47 34 31 34 23 44c7 11 23 13 32-1z"/>
  </g>`;
  const svg = extra => `<svg viewBox="0 0 100 80" aria-hidden="true">
    ${shapes('bird-outline')}
    <g class="bird-legs"><path d="M42 67l-2 10M53 67v10"/></g>
    ${shapes('bird-fill')}
    <path class="bird-beak" d="M84.5 27.5l8.5 3.2-8.5 3.3z"/>
    <g class="bird-face">
      <circle cx="75.5" cy="27" r="3.6" fill="#fff"/><circle cx="76.3" cy="27.4" r="2.4" fill="#2a0a10"/><circle cx="77.1" cy="26.4" r=".9" fill="#fff"/>
      <ellipse cx="75" cy="36" rx="3.6" ry="2.2" fill="#f2a5b5" opacity=".85"/>
    </g>
    ${extra}
  </svg>`;
  const W = 72, FOOT_X = W * .475, FOOT_Y = W * .77; // точка лапок в px
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // жених уже сидит на орнаменте внизу
  const groom = document.createElement('div');
  groom.className = 'bird bird-groom is-landed';
  groom.innerHTML = svg(BOW);
  perchLine.appendChild(groom);

  const bride = document.createElement('div');
  bride.className = 'bird bird-bride';
  bride.innerHTML = svg(CROWN);
  document.body.appendChild(bride);
  const trace = document.createElement('div');
  trace.className = 'bird bird-trace';
  trace.innerHTML = svg(CROWN);
  document.body.appendChild(trace);

  // позиция в документе без учёта transform (у блоков, появляющихся по скроллу, он временно сдвинут)
  const docPos = el => { let x = 0, y = 0; for (let n = el; n; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; } return { x, y }; };
  const page = document.querySelector('.page');
  const st = { x: null, y: null, rot: 0 };

  let raf = 0;
  const t0 = performance.now();
  function frame(now) {
    raf = 0;
    const t = (now - t0) / 1000;
    const a = docPos(arch), r = arch.offsetWidth / 2;
    const home = { x: a.x + r * 1.42, y: a.y + r * .62 };
    trace.style.transform = `translate3d(${(home.x - FOOT_X).toFixed(1)}px, ${(home.y - FOOT_Y).toFixed(1)}px, 0)`;
    const pl = docPos(perchLine), pw = perchLine.offsetWidth;
    const land = { x: pl.x + pw * 40 / 220, y: pl.y + pw * 9 / 220 };
    const pageW = page.offsetWidth, pageL = docPos(page).x, vh = innerHeight;

    let tx, ty, mode;
    if (scrollY <= 12 && !reduce) { tx = home.x; ty = home.y; mode = 'home'; }
    else if (land.y <= scrollY + vh - 70 || scrollY >= document.documentElement.scrollHeight - vh - 4 || reduce) { tx = land.x; ty = land.y; mode = 'land'; }
    else {
      mode = 'fly';
      ty = Math.min(land.y, Math.max(home.y, scrollY + vh * .42));
      tx = pageL + pageW * .7 + Math.sin(t * .7) * pageW * .09; // плавно покачивается по правой стороне
    }
    if (st.x === null) { st.x = tx; st.y = ty; }
    const k = reduce ? 1 : .05;
    const vx = (tx - st.x) * k, vy = (ty - st.y) * k;
    st.x += vx; st.y += vy;
    const settled = mode !== 'fly' && Math.hypot(tx - st.x, ty - st.y) < 1.5;
    if (settled) { st.x = tx; st.y = ty; }
    const bob = settled ? 0 : Math.sin(t * 2.4) * 4;
    st.rot += ((settled ? 0 : Math.max(-18, Math.min(24, vy * 1.6 - vx * .4))) - st.rot) * .12;
    const flip = !settled && vx < -1.2;
    bride.classList.toggle('is-flying', !settled);
    bride.classList.toggle('is-home', mode === 'home' && settled);
    bride.classList.toggle('is-landed', mode === 'land' && settled);
    trace.classList.toggle('is-shown', !(mode === 'home' && settled));
    perchLine.classList.toggle('is-together', mode === 'land' && settled);
    bride.style.transform = `translate3d(${(st.x - FOOT_X).toFixed(1)}px, ${(st.y - FOOT_Y + bob).toFixed(1)}px, 0) rotate(${st.rot.toFixed(1)}deg) scaleX(${flip ? -1 : 1})`;
    if (!settled) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  ['scroll', 'resize', 'orientationchange'].forEach(e => addEventListener(e, kick, { passive: true }));
  document.fonts && document.fonts.ready.then(kick);
  kick();
})();
