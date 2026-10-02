/**
 * Приём ответов анкеты с сайта-приглашения в Google Таблицу.
 * Установка — см. README.md (Расширения → Apps Script → Развернуть как веб-приложение).
 */
const SHEET_NAME = 'Гости';
const HEADERS = ['Дата', 'Аты-жөнү', 'Жооп', 'Адам саны'];

// сколько человек придёт по каждому варианту ответа
const GUESTS = {
  'Албетте, келем': 1,
  'Жубайым менен келем': 2,
  'Келе албайм': 0,
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const name = String(data.name || '').trim().slice(0, 200);
    const answer = String(data.answer || '').trim();
    if (!name || !(answer in GUESTS)) return json({ ok: false, error: 'bad request' });

    getSheet().appendRow([new Date(), name, answer, GUESTS[answer]]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// открыть URL веб-приложения в браузере — проверка, что всё развёрнуто
function doGet() {
  return json({ ok: true, sheet: SHEET_NAME });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.getRange('A:A').setNumberFormat('dd.MM.yyyy HH:mm');
    // итог в шапке: сколько всего гостей придёт
    sh.getRange('F1').setValue('Бардыгы:');
    sh.getRange('G1').setFormula('=SUM(D2:D)');
  }
  return sh;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
