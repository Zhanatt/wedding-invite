/* ===== Настройки ===== */
const CONFIG = {
  // URL веб-приложения Google Apps Script (см. README.md). Пока пусто — форма не отправится.
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbydwGkepympC928jy6cGSgv1FNuXsst2tgmQKmBZGsPPjXKUw7qOJfvT7RnRN6P1fHC/exec',
  // Вариант без Apps Script: Google Форма, привязанная к таблице (см. README.md).
  // Если задан formId — ответы идут в форму, rsvpEndpoint не нужен.
  googleForm: { formId: '', nameEntry: '', answerEntry: '' },
  // Музыка играет через встроенный плеер YouTube (ничего не скачивается).
  // Пусто — берётся файл audio/theme.mp3, если он есть.
  youtubeId: '', // играет файл audio/theme.mp3 (Неля — Кыз узатуу)
  youtubeStart: 0, // с какой секунды играть (и при повторе)
  // Файл audio/theme.mp3 включается прямо по нажатию на конверт (YouTube так не умеет).
  // Чтобы играл файл — положите его в audio/ и сделайте youtubeId: ''.
  audioStart: 29,
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

const WEEKDAYS = {
  ky: ['Дш', 'Шш', 'Шр', 'Бш', 'Жм', 'Иш', 'Жк'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
};

/* ===== Календарь ===== */
function renderCalendar(lang) {
  const { year, month, mark } = CONFIG.calendar;
  const first = (new Date(year, month - 1, 1).getDay() + 6) % 7; // понедельник = 0
  const days = new Date(year, month, 0).getDate();
  let cells = WEEKDAYS[lang].map(d => `<span class="cal-wd">${d}</span>`).join('');
  for (let i = 0; i < first; i++) cells += '<span class="cal-day"></span>';
  for (let d = 1; d <= days; d++) {
    cells += d === mark ? `<span class="cal-day cal-day-mark">${d}</span>` : `<span class="cal-day">${d}</span>`;
  }
  document.getElementById('cal').innerHTML = cells;
}

/* ===== Кыргызский орнамент «кочкор мүйүз»: раскрывается, как росток ===== */
(function ornaments() {
  // мотив 120×60: стебель снизу, бутон, нижние и верхние завитки-рога; --d — задержка прорисовки
  const motif = [
    ['M60 58V30', 0],
    ['M60 46C54 40 44 42 44 50 44 55 50 56 52 52', .35], ['M60 46C66 40 76 42 76 50 76 55 70 56 68 52', .35],
    ['M60 30C60 14 46 6 34 10 22 14 20 30 30 36 38 41 46 34 42 27 39 22 32 24 33 29', .55],
    ['M60 30C60 14 74 6 86 10 98 14 100 30 90 36 82 41 74 34 78 27 81 22 88 24 87 29', .55],
    ['M60 30C56 24 56 18 60 12 64 18 64 24 60 30', 1],
  ];
  const paths = (list, sw) => list.map(([d, delay]) => `<path d="${d}" pathLength="1" stroke-width="${sw}" style="--d:${delay}s"/>`).join('');
  const horns = `<svg viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><g class="orn-grow">${paths(motif, 1.6)}</g></svg>`;
  const band = `<svg viewBox="0 0 300 44" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    ${paths([['M112 31H20', .2], ['M188 31H280', .2],
      ['M20 31c-7 0-10-7-5-9 4-1.5 6 3 3 4.5', 1.1], ['M280 31c7 0 10-7 5-9-4-1.5-6 3-3 4.5', 1.1],
      ['M70 31c-1-5 1-9 5-10 0 5-2 8-5 10', 1.25], ['M230 31c1-5-1-9-5-10 0 5 2 8 5 10', 1.25]], 1.1)}
    <g transform="translate(112.8 -5) scale(.62)"><g class="orn-grow">${paths(motif, 1.8)}</g></g>
  </svg>`;
  document.querySelectorAll('.orn-horns').forEach(el => { el.innerHTML = horns; });
  document.querySelectorAll('.orn-band').forEach(el => { el.innerHTML = band; });
  // на конверте раскрывается сразу после загрузки
  setTimeout(() => document.querySelectorAll('.envelope .orn').forEach(el => el.classList.add('is-in')), 350);
})();

/* ===== Язык: кыргызский по умолчанию, русский по кнопке ===== */
const RU = {
  sound: 'Включить / выключить музыку',
  kyz: 'Кыз узатуу', open: 'Нажмите, чтобы открыть',
  greet: 'Уважаемые гости!',
  invite: 'Приглашаем вас на кыз узатуу нашей дочери <span class="name">Сани-Рабиги</span>! Разделите с нами радость, дайте своё благословение и будьте нашими дорогими гостями!',
  scroll: 'Листайте вниз',
  dayTitle: 'День тоя', calNote: 'Воскресенье, в 16:00',
  until: 'До тоя осталось', uD: 'дней', uH: 'часов', uM: 'минут', uS: 'секунд',
  program: 'Программа тоя',
  p2: 'Начало тоя', p3: 'Праздничный дастархан', p4: 'Праздничная программа', p5: 'Завершение вечера',
  venue: 'Место проведения', city: 'г. Токмок', map: 'Открыть карту',
  wait: 'С нетерпением ждём вас!<br>С уважением, хозяйка тоя:',
  rsvp: 'Анкета', rsvpSub: 'Пожалуйста, подтвердите своё присутствие',
  nameLabel: 'Ваше имя и фамилия', namePh: 'Например: Асель Мамбетова',
  question: 'Если придёте с супругом(ой), укажите имена обоих',
  a1: 'Обязательно приду', a2: 'Придём с супругом(ой)', a3: 'Не смогу прийти',
  submit: 'Отправить ответ',
};
const TEXTS_RU = {
  sending: 'Отправляем…',
  done: 'Спасибо! Ваш ответ принят.',
  error: 'Произошла ошибка. Попробуйте ещё раз.',
  needName: 'Укажите ваше имя',
  needAnswer: 'Выберите ответ',
};
let LANG = 'ky';
const texts = () => (LANG === 'ru' ? TEXTS_RU : CONFIG.texts);

function setLang(lang) {
  LANG = lang === 'ru' ? 'ru' : 'ky';
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (el.dataset.ky === undefined) el.dataset.ky = el.innerHTML; // кыргызский текст — из самой разметки
    el.innerHTML = LANG === 'ru' ? RU[el.dataset.i18n] ?? el.dataset.ky : el.dataset.ky;
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(';').forEach(pair => {
      const [attr, key] = pair.split(':');
      const store = 'ky' + attr.replace(/-/g, '');
      if (el.dataset[store] === undefined) el.dataset[store] = el.getAttribute(attr);
      el.setAttribute(attr, LANG === 'ru' ? RU[key] ?? el.dataset[store] : el.dataset[store]);
    });
  });
  document.querySelectorAll('.lang [data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)));
  renderCalendar(LANG);
  const note = document.querySelector('.form-note');
  if (note) note.textContent = '';
  try { localStorage.setItem('lang', LANG); } catch (e) { /* приватный режим — просто не запоминаем */ }
}
(function langSwitch() {
  const box = document.querySelector('.lang');
  // нажатие на переключатель не должно запускать музыку и открывать конверт
  ['pointerdown', 'touchstart'].forEach(ev => box.addEventListener(ev, e => e.stopPropagation(), { passive: true }));
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-lang]');
    if (b) { e.stopPropagation(); setLang(b.dataset.lang); }
  });
  let saved = 'ky';
  try { saved = localStorage.getItem('lang') || 'ky'; } catch (e) { /* нет доступа к хранилищу */ }
  setLang(saved);
  // переключатель виден наверху страницы и прячется при прокрутке
  const onScroll = () => document.body.classList.toggle('scrolled', scrollY > 80);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
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

  input.addEventListener('input', () => input.classList.remove('invalid'));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = input.value.trim();
    const answer = (form.querySelector('input[name="answer"]:checked') || {}).value;
    if (!name) { input.classList.add('invalid'); note.textContent = texts().needName; input.focus(); return; }
    if (!answer) { note.textContent = texts().needAnswer; return; }
    const gf = CONFIG.googleForm;
    if (!CONFIG.rsvpEndpoint && !gf.formId) { note.textContent = texts().error; console.warn('Не задан ни rsvpEndpoint, ни googleForm — см. README.md'); return; }

    btn.disabled = true;
    note.textContent = texts().sending;
    try {
      if (gf.formId) {
        // Google Forms не отдаёт CORS-заголовки — ответ «непрозрачный», считаем отправку успешной
        const body = new URLSearchParams({ [`entry.${gf.nameEntry}`]: name, [`entry.${gf.answerEntry}`]: answer });
        await fetch(`https://docs.google.com/forms/d/e/${gf.formId}/formResponse`, { method: 'POST', mode: 'no-cors', body });
        box.innerHTML = `<p class="form-done">${texts().done}</p>`;
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
      box.innerHTML = `<p class="form-done">${texts().done}</p>`;
    } catch (err) {
      console.error(err);
      note.textContent = texts().error;
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
    const r = a * Math.PI / 180; return `<circle cx="${(x + Math.cos(r) * 34).toFixed(1)}" cy="${(y + Math.sin(r) * 34).toFixed(1)}" r="30" fill="${c}"/>`;
  }).join('')}<circle cx="${x}" cy="${y}" r="19" fill="#d9a441"/></g>`;
  const CROWN = `<g class="bird-crown">
    <ellipse cx="585" cy="88" rx="44" ry="19" transform="rotate(-50 585 88)" fill="#6f8a5c"/>
    <ellipse cx="795" cy="10" rx="44" ry="19" transform="rotate(10 795 10)" fill="#6f8a5c"/>
    ${flower(551, 145, '#f2b8c6')}${flower(626, 56, '#fff5e1')}${flower(735, 16, '#f2b8c6')}${flower(850, 36, '#fff5e1')}
  </g>`;
  const BOW = `<g class="bird-bow"><path d="M800 272l130 58-130 58zM1060 272l-130 58 130 58z" fill="#fff"/><circle cx="930" cy="330" r="32" fill="#fff"/></g>`;
  // силуэт птицы с картинки: тело (голова, клюв, грудка, хвост) + крыло с тремя перьями;
  // сложенное крыло ровно дополняет тело до исходного силуэта. outline — кремовый контур вокруг всего
  const shapes = cls => `<g class="${cls}">
    <path class="bird-body" d="M322 680C260 725 160 775 20 768C120 840 240 862 340 860C620 858 840 710 940 450C970 370 982 310 978 243C1040 200 1075 160 1100 121C1055 142 1010 154 965 160C1020 125 1055 80 1072 28C1020 60 970 78 918 90C860 28 800 18 758 18C630 18 530 120 532 240C532 255 535 272 538 287C500 410 420 570 322 680Z"/>
    <path class="bird-wing" d="M538 287C360 275 210 200 100 57C60 120 55 180 67 230C80 280 115 320 157 344C120 340 85 330 55 313C52 390 85 450 122 490C150 510 185 525 223 529C190 536 160 538 129 532C150 600 200 660 270 678C290 680 305 680 322 680C480 700 650 500 538 287Z"/>
  </g>`;
  const svg = extra => `<svg viewBox="0 0 1120 880" aria-hidden="true">${shapes('bird-outline')}${shapes('bird-fill')}${extra}</svg>`;
  const W = 60, FOOT_X = W * 380 / 1120, FOOT_Y = W * 860 / 1120; // точка, которой птица касается опоры (низ грудки), в px
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
    const home = { x: a.x + r * 1.30, y: a.y + r * .5 };
    trace.style.transform = `translate3d(${(home.x - FOOT_X).toFixed(1)}px, ${(home.y - FOOT_Y).toFixed(1)}px, 0)`;
    const pl = docPos(perchLine), pw = perchLine.offsetWidth;
    const land = { x: pl.x + pw * 50 / 260, y: pl.y + pw * 9 / 260 };
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
    // лёгкое парение; корпус держится ровно, клюв чуть вверх — птица летит, а не падает
    const bob = settled ? 0 : Math.sin(t * 2.4) * 2.5;
    st.rot += ((settled ? 0 : Math.max(-10, Math.min(4, -5 - vy * .25 - Math.abs(vx) * .3))) - st.rot) * .1;
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
