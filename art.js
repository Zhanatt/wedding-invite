/* Собственные SVG-иллюстрации. Вставляются в элементы с data-art="…".
   Если в слоте (.slot) лежит своя картинка из img/ — она заменит рисунок. */
(function () {
  const O = '#636b48';

  // ветка с листьями (линейная графика)
  function sprig(flip) {
    const t = flip ? ' transform="translate(152 0) scale(-1 1)"' : '';
    return `<svg viewBox="0 0 152 96"><g class="line-art soft"${t}>
      <path d="M4 92C30 80 52 62 70 44S104 14 128 8"/>
      <path d="M40 72c-6-10-4-20 4-26 4 9 3 19-4 26Z"/><path d="M40 72c9 3 18 0 22-8-9-3-17 0-22 8Z"/>
      <path d="M62 52c-5-10-2-19 6-24 3 9 1 18-6 24Z"/><path d="M62 52c9 2 17-2 20-10-9-2-16 2-20 10Z"/>
      <path d="M86 32c-3-9 0-17 8-21 2 8-1 16-8 21Z"/><path d="M86 32c8 1 15-3 17-10-8-1-14 3-17 10Z"/>
      <path d="M20 84c-3-7-1-13 4-17 2 6 1 12-4 17Z"/>
      <circle cx="132" cy="8" r="5"/><path d="M127 8c-3-5 0-9 5-9s8 4 5 9"/><path d="M132 3c0-3 3-4 5-2"/>
      <path d="M108 20c4-6 10-7 14-4"/><circle cx="112" cy="40" r="1.4"/><circle cx="120" cy="34" r="1"/>
    </g></svg>`;
  }

  // птица в полёте / сидящая
  function bird(perch) {
    // колибри: голова справа, длинный клюв, хвост-веер слева
    const tail = `<path d="M22 31 4 26l5 6-6 4 7 1-3 6 15-9Z" fill="#7d8558"/>`;
    const body = `<path d="M20 32c4-6 14-9 24-8 4 0 7 2 8 5 1 4-2 7-6 8-9 3-19 3-26-5Z" fill="${O}"/>
      <circle cx="47" cy="27" r="5.4" fill="${O}"/><circle cx="48.6" cy="26" r="1.1" fill="#f7f0e4"/>
      <path d="M52 26.4 68 22.6l-15.6 5.6Z" fill="${O}"/>
      <path d="M36 34c3 2 7 2 10 0" stroke="#c9cfae" stroke-width="1.2" fill="none" opacity=".7"/>`;
    const wing = perch
      ? `<path class="wing" d="M24 30c6-2 14-2 20 1-6 4-14 5-20-1Z" fill="#8f976a"/>`
      : `<path class="wing" d="M28 28C24 16 28 6 38 1c2 10 0 20-6 27Z" fill="#8f976a"/>
         <path class="wing" d="M34 27c2-9 8-15 16-17-1 8-6 14-14 18Z" fill="#a3aa7e" opacity=".8"/>`;
    const legs = perch ? `<path d="M34 38v6M38 38v6" stroke="${O}" stroke-width="1.2"/>` : '';
    return `<svg viewBox="0 0 70 50">${tail}${wing}${body}${legs}</svg>`;
  }

  // два кольца — вместо фото рук на первом экране
  const hero = `<svg viewBox="0 0 320 182"><g class="line-art">
      <ellipse cx="140" cy="104" rx="38" ry="38"/><ellipse cx="140" cy="104" rx="33" ry="33" opacity=".5"/>
      <ellipse cx="184" cy="96" rx="38" ry="38"/><ellipse cx="184" cy="96" rx="33" ry="33" opacity=".5"/>
      <path d="M176 58l8-12 8 12-8 6Z"/><path d="M176 58h16M184 46v18" opacity=".6"/>
      <path d="M220 40l3-8 3 8 8 3-8 3-3 8-3-8-8-3Z" opacity=".7"/>
      <path d="M100 52l2-5 2 5 5 2-5 2-2 5-2-5-5-2Z" opacity=".5"/>
    </g></svg>`;

  // банкетный стол
  const banquet = `<svg viewBox="0 0 305 203"><g class="line-art soft" style="opacity:.75">
      <path d="M20 120l250-40 20 8-250 44Z"/><path d="M40 132v50M270 92v60M150 112v58M60 128v40"/>
      <path d="M20 120v8l20 4 250-44v-8"/>
      ${[0, 1, 2, 3, 4].map(i => { const x = 50 + i * 48, y = 118 - i * 8; return `<path d="M${x} ${y}v-36M${x + 6} ${y - 1}v-46M${x - 6} ${y + 1}v-28"/><path d="M${x} ${y - 36}c-2-4 2-6 0-9M${x + 6} ${y - 47}c-2-4 2-6 0-9"/>`; }).join('')}
      ${[0, 1, 2, 3, 4, 5].map(i => { const x = 36 + i * 44, y = 116 - i * 7; return `<circle cx="${x}" cy="${y}" r="9"/><circle cx="${x + 8}" cy="${y - 4}" r="7"/><circle cx="${x - 7}" cy="${y - 3}" r="6"/>`; }).join('')}
      ${[0, 1, 2, 3].map(i => { const x = 70 + i * 60, y = 150 - i * 10; return `<ellipse cx="${x}" cy="${y - 22}" rx="11" ry="15"/><path d="M${x - 9} ${y - 10}v34M${x + 9} ${y - 10}v34M${x - 9} ${y + 2}h18"/>`; }).join('')}
    </g></svg>`;

  // люстра с гирляндой
  const chandelier = `<svg viewBox="0 0 320 320"><g class="line-art soft" style="opacity:.7">
      <path d="M0 40c50 30 110 36 160 30s110-20 160-40"/>
      ${Array.from({ length: 16 }, (_, i) => { const x = 10 + i * 20, y = 46 + Math.sin(i / 2.3) * 14; return `<circle cx="${x}" cy="${y}" r="${7 + (i % 3) * 2}"/><circle cx="${x}" cy="${y}" r="3"/>`; }).join('')}
      <path d="M240 70v60"/><path d="M200 140h80l-10 14h-60Z"/><path d="M210 154c0 40 18 70 30 86 12-16 30-46 30-86"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${214 + i * 10} 156l-2 ${30 + (i % 3) * 14}"/><circle cx="${212 + i * 10}" cy="${190 + (i % 3) * 14}" r="2.5"/>`).join('')}
      <path d="M240 240v14"/><path d="M236 254l4 10 4-10Z"/>
      <path d="M200 140c-8-4-10-12-4-16M280 140c8-4 10-12 4-16"/>
    </g></svg>`;

  // иконки программы
  const prog = {
    'prog-table': `<svg viewBox="0 0 163 159"><g class="line-art" style="opacity:.8">
      <path d="M10 118l130-62"/><path d="M14 134l136-64"/>
      <ellipse cx="36" cy="112" rx="18" ry="9"/><ellipse cx="36" cy="112" rx="11" ry="5"/>
      <ellipse cx="86" cy="88" rx="18" ry="9"/><ellipse cx="86" cy="88" rx="11" ry="5"/>
      <path d="M58 70c-6 0-8 10-4 14h8c4-4 2-14-4-14ZM58 84v14M53 98h10"/>
      <path d="M110 52c-6 0-8 10-4 14h8c4-4 2-14-4-14ZM110 66v14M105 80h10"/>
      <circle cx="122" cy="32" r="10"/><circle cx="134" cy="26" r="8"/><circle cx="112" cy="24" r="7"/><circle cx="126" cy="16" r="6"/>
      <path d="M124 42v14M30 40l26-10 4 22-26 10Z"/>
    </g></svg>`,
    'prog-plate': `<svg viewBox="0 0 130 88"><g class="line-art" style="opacity:.8">
      <ellipse cx="65" cy="44" rx="34" ry="34"/><ellipse cx="65" cy="44" rx="26" ry="26"/>
      <path d="M55 30h20v28H55Z"/><path d="M58 36h14M58 41h14M58 46h10"/>
      <path d="M57 58c-6 4-12 10-8 14M73 58c6 4 12 10 8 14M60 58c4 4 6 4 10 0"/>
      <path d="M18 14v24c0 4 4 6 4 6v34M14 14v18M22 14v18"/>
      <path d="M108 14c6 0 6 20 0 28v36"/><path d="M118 14c4 6 4 18 0 24v40"/>
    </g></svg>`,
    'prog-couple': `<svg viewBox="0 0 87 160"><g class="line-art" style="opacity:.8">
      <circle cx="32" cy="18" r="8"/><circle cx="50" cy="22" r="7"/>
      <path d="M50 15c4-3 9 0 9 5"/>
      <path d="M26 28c-6 12-6 30-4 48l4 50M38 28c4 14 6 30 4 48l-4 50"/>
      <path d="M44 30c-2 14 0 26 4 34-14 30-24 60-28 90h60c-4-34-14-64-26-90 4-10 4-22 2-34"/>
      <path d="M38 50c4 4 8 4 12 0"/>
    </g></svg>`,
    'prog-cake': `<svg viewBox="0 0 94 102"><g class="line-art" style="opacity:.8">
      <path d="M47 46c-14-12-30-4-28 8 2 10 16 18 28 26 12-8 26-16 28-26 2-12-14-20-28-8Z"/>
      <path d="M12 60v20c0 10 16 18 35 18s35-8 35-18V60"/>
      ${Array.from({ length: 9 }, (_, i) => `<circle cx="${14 + i * 8.2}" cy="${82 + Math.sin(i / 1.4) * 4}" r="3.5"/>`).join('')}
      <path d="M40 40c4-6 10-6 14 0M47 34v-8M44 26c2-3 4-3 6 0"/>
      <circle cx="36" cy="58" r="2"/><circle cx="58" cy="58" r="2"/>
    </g></svg>`,
    'prog-car': `<svg viewBox="0 0 131 88"><g class="line-art" style="opacity:.85">
      <path d="M8 58c0-10 6-16 18-18l16-14c10-6 34-6 44 0l12 12c14 2 26 6 26 18v8H8Z"/>
      <path d="M46 28l-8 12h52l-8-12"/><path d="M64 26v14"/>
      <circle cx="32" cy="66" r="11"/><circle cx="32" cy="66" r="4"/>
      <circle cx="102" cy="66" r="11"/><circle cx="102" cy="66" r="4"/>
      <path d="M4 50h10M118 48h10"/>
      <path d="M58 46c-6-8-14-6-12 0 2 4 12 2 12 0Zm0 0c6-8 14-6 12 0-2 4-12 2-12 0Zm0 0c-4 8-8 18-14 26M58 46c4 8 8 18 14 26"/>
    </g></svg>`,
  };

  // пунктирный маршрут программы, сердце-петля в конце
  const timeline = `<svg viewBox="0 0 156 727" style="overflow:visible"><path d="M116 2C96 14 78 18 67 24 40 70 62 140 44 190c-8 44 6 92 12 114 26 16 58 14 56 30-2 20-22 26-25 38-24 12-34 30-32 38 14 34 56 52 52 76-6 40-96 34-104 94-6 48 40 70 70 66 28-4 40-30 26-46s-36-6-36 10 24 32 46 40c22 6 40 8 54 4"
      fill="none" stroke="${O}" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="0.1 3.2"/>
      <circle cx="67" cy="24" r="2.2" fill="none" stroke="${O}" stroke-width=".8"/>
      <circle cx="56" cy="304" r="2.2" fill="none" stroke="${O}" stroke-width=".8"/>
      <circle cx="87" cy="372" r="2.2" fill="none" stroke="${O}" stroke-width=".8"/>
      <circle cx="108" cy="488" r="2.2" fill="none" stroke="${O}" stroke-width=".8"/></svg>`;

  const pin = `<svg viewBox="0 0 35 47"><path d="M17.5 46S2 28.6 2 17.2C2 8.4 9 1.5 17.5 1.5S33 8.4 33 17.2C33 28.6 17.5 46 17.5 46Z" fill="${O}"/><circle cx="17.5" cy="16.5" r="6" fill="#f7f0e4"/></svg>`;

  const ringsPhoto = `<svg viewBox="0 0 320 192" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="#f7f0e4" stroke-width="2">
      <ellipse cx="120" cy="120" rx="46" ry="30"/><ellipse cx="120" cy="114" rx="46" ry="30" opacity=".5"/>
      <ellipse cx="180" cy="110" rx="40" ry="26"/><ellipse cx="180" cy="104" rx="40" ry="26" opacity=".5"/>
      <path d="M174 80l6-10 6 10-6 5Z"/></g></svg>`;

  // конверт: клапан + сургучная печать с инициалами
  const envelope = `<svg viewBox="-200 -300 720 1185" aria-hidden="true">
      <defs>
        <filter id="flap-shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#2f331f" flood-opacity=".35"/></filter>
        <radialGradient id="wax" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fbf5ea"/><stop offset=".7" stop-color="#ece0c9"/><stop offset="1" stop-color="#d9c9ab"/></radialGradient>
        <linearGradient id="flap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a724e"/><stop offset="1" stop-color="#666e4a"/></linearGradient>
      </defs>
      <path d="M-200 -300H520V200L160 330-200 200Z" fill="url(#flap)" filter="url(#flap-shadow)"/>
      <g class="seal">
        <path d="M172 274c14 0 22 6 32 10 12 6 20 14 22 28 2 10 6 18 4 30-2 14-10 22-18 32-8 8-20 12-34 14-12 2-24 0-34-6-12-6-22-14-26-26-4-10-6-22-4-34 2-12 8-24 18-32 10-10 24-16 40-16Z" fill="url(#wax)"/>
        <circle cx="168" cy="338" r="50" fill="none" stroke="#d3c19f" stroke-width="2.5"/>
        <circle cx="168" cy="338" r="44" fill="none" stroke="#fffaf0" stroke-width="1" opacity=".7"/>
        <text x="168" y="352" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-size="38" fill="#c9b690">Б·М</text>
        <g fill="none" stroke="#c9b690" stroke-width="1.6" stroke-linecap="round">
          <path d="M136 312c10-6 20-6 30 0M170 312c10-6 20-6 30 0"/><path d="M140 368c16 8 40 8 56 0"/>
        </g>
      </g>
    </svg>`;

  const art = {
    'floral-left': sprig(false), 'floral-right': sprig(true),
    'bird-fly': bird(false), 'bird-perch': bird(true),
    hero, banquet, chandelier, timeline, pin, envelope, 'rings-photo': ringsPhoto, ...prog,
  };

  document.querySelectorAll('[data-art]').forEach(el => {
    const svg = art[el.dataset.art];
    if (svg) el.insertAdjacentHTML('afterbegin', svg);
    const img = el.querySelector(':scope > img');
    if (!img) return;
    const ok = () => el.classList.add('has-img');
    if (img.complete && img.naturalWidth) ok();
    else { img.addEventListener('load', ok); img.addEventListener('error', () => img.remove()); }
  });
})();
