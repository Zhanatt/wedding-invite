/* ===== Настройки ===== */
const CONFIG = {
  // URL веб-приложения Google Apps Script (см. README.md). Пока пусто — форма не отправится.
  rsvpEndpoint: '',
  // Вариант без Apps Script: Google Форма, привязанная к таблице (см. README.md).
  // Если задан formId — ответы идут в форму, rsvpEndpoint не нужен.
  googleForm: { formId: '', nameEntry: '', answerEntry: '' },
  weddingDate: '2026-10-17T16:00:00+06:00',
  calendar: { year: 2026, month: 10, mark: 17 },
  texts: {
    sending: 'Жөнөтүлүүдө…',
    done: 'Рахмат! Жообуңуз кабыл алынды.',
    error: 'Ката кетти. Кайра аракет кылыңыз.',
    needName: 'Аты-жөнүңүздү жазыңыз',
    needAnswer: 'Жоопту тандаңыз',
  },
};

const MONTHS = ['ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ', 'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'];
const WEEKDAYS = ['дүй', 'шей', 'шар', 'бей', 'жум', 'иш', 'жек'];

/* ===== Календарь ===== */
(function renderCalendar() {
  const { year, month, mark } = CONFIG.calendar;
  const first = (new Date(year, month - 1, 1).getDay() + 6) % 7; // понедельник = 0
  const days = new Date(year, month, 0).getDate();
  let cells = WEEKDAYS.map(d => `<span class="cal-wd">${d}</span>`).join('');
  for (let i = 0; i < first; i++) cells += '<span class="cal-day"></span>';
  for (let d = 1; d <= days; d++) {
    cells += d === mark
      ? `<span class="cal-day"><span class="cal-day-mark" aria-hidden="true"></span>${d}</span>`
      : `<span class="cal-day">${d}</span>`;
  }
  document.getElementById('cal').innerHTML =
    `<div class="cal-head"><span>${MONTHS[month - 1]}</span><span>${year}</span></div><div class="cal-rule"></div><div class="cal-grid">${cells}</div>`;
})();

/* ===== Появление элементов по скроллу ===== */
function startReveal() {
  const canvas = document.querySelector('.canvas');
  let pending = Array.from(document.querySelectorAll('[data-anim]:not(.is-in)'));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    pending.forEach(el => el.classList.add('is-in'));
    return;
  }
  let frame = 0;
  const check = () => {
    frame = 0;
    const top = canvas.getBoundingClientRect().top + scrollY;
    const edge = scrollY + innerHeight - 40;
    pending = pending.filter(el => {
      const y = top + el.offsetTop; // позиция без учёта transform
      if (y >= edge) return true;
      if (y < scrollY) el.classList.add('is-instant'); // уже проскроллили — без анимации
      el.classList.add('is-in');
      return false;
    });
    if (!pending.length) ['scroll', 'resize', 'orientationchange'].forEach(e => removeEventListener(e, schedule));
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(check); };
  ['scroll', 'resize', 'orientationchange'].forEach(e => addEventListener(e, schedule, { passive: true }));
  check();
}

/* ===== Музыка ===== */
const audio = document.getElementById('theme');
const soundBtn = document.querySelector('.sound-btn');
let userMuted = false;
function setPlaying(on) {
  soundBtn.dataset.playing = String(on);
  soundBtn.setAttribute('aria-pressed', String(on));
}
function tryPlay() {
  if (userMuted) return;
  audio.play().then(() => setPlaying(true), err => {
    if (err && err.name === 'NotSupportedError') soundBtn.style.display = 'none';
  });
}
// ошибка загрузки могла случиться ещё до запуска скрипта — проверяем и сейчас, и потом
const hideSound = () => { soundBtn.style.display = 'none'; };
if (audio.error) hideSound();
audio.addEventListener('error', hideSound);
soundBtn.addEventListener('click', e => {
  e.stopPropagation();
  if (audio.paused) { userMuted = false; tryPlay(); }
  else { userMuted = true; audio.pause(); setPlaying(false); }
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
  const el = document.getElementById('countdown');
  const target = new Date(CONFIG.weddingDate).getTime();
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60); s %= 60;
    el.textContent = `${pad(d)} : ${pad(h)} : ${pad(m)} : ${pad(s)}`;
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
