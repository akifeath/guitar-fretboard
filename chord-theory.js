/* \u81EA\u52A8\u751F\u6210\uFF1A\u7531 chord-theory.mjs \u8F6C\u6362\u800C\u6765\uFF08\u53BB\u6389 export\uFF0C\u6302\u5230 window.ChordTheory\uFF09\u3002
   \u8FD9\u4E2A\u6587\u4EF6\u4E0D\u8981\u624B\u6539 \u2014\u2014 \u6539 chord-theory.mjs \u540E\u8DD1 node build.mjs\u3002
   \u8F6C\u6362\u65F6\u975E ASCII \u5B57\u7B26\u5DF2\u5168\u90E8\u8F6C\u6210 \uXXXX\uFF0C\u4EFB\u4F55\u7F16\u7801\u4E0B\u6253\u5F00\u90FD\u4E0D\u4F1A\u4E71\u7801\u3002 */
(function (global) {
'use strict';
/* ============================================================================
 *  \u548C\u5F26\u7406\u8BBA\u5C42\uFF08\u7EAF\u903B\u8F91\uFF0C\u96F6 DOM \u4F9D\u8D56\uFF09
 *
 *  \u8FD9\u4E00\u5C42\u53EA\u505A\u56DB\u4EF6\u4E8B\uFF1A
 *    1) \u7528\u516C\u5F0F\u5B9A\u4E49\u548C\u5F26\u8D28\u91CF\uFF08\u4E0D\u9884\u5B58\u4EFB\u4F55\u6307\u578B\uFF09
 *    2) \u628A\u548C\u5F26\u540D\u89E3\u6790\u6210\u7ED3\u6784\u5316\u8868\u8FBE\uFF08\u6839\u97F3 + \u8D28\u91CF + \u53EF\u9009\u4F4E\u97F3\uFF09
 *    3) \u628A\u4EFB\u610F\u516D\u5F26\u6392\u5E03\u5206\u6790\u6210\u5019\u9009\u548C\u5F26\uFF08\u53EF\u89E3\u91CA\u3001\u4FDD\u7559\u6B67\u4E49\uFF09
 *    4) \u6309\u5224\u5B9A\u5BBD\u5EA6\u5224\u5206\uFF0C\u5E76\u751F\u6210\u786E\u5B9A\u6027\u7684\u53C2\u8003\u6392\u5E03
 *
 *  \u5B83\u88AB\u4E24\u5904\u6D88\u8D39\uFF1A
 *    - \u6D4F\u89C8\u5668\uFF1Abuild.mjs \u628A\u672C\u6587\u4EF6\u8F6C\u6210 chord-theory.js\uFF08ASCII \u8F6C\u4E49\u3001\u5265\u6389 export\u3001
 *      \u6302\u5230 window.ChordTheory\uFF09\uFF0Cindex.html \u7528\u666E\u901A <script> \u52A0\u8F7D\u3002
 *    - \u6D4B\u8BD5\uFF1Atests/chord-theory-test.mjs \u76F4\u63A5 import \u8FD9\u4E2A .mjs \u6E90\u6587\u4EF6\u3002
 *
 *  \u26A0 \u672C\u6587\u4EF6\u91CC\u4E0D\u80FD\u51FA\u73B0\u4EFB\u4F55 DOM / window / localStorage \u8BBF\u95EE\uFF0C
 *    \u5426\u5219\u6D4F\u89C8\u5668\u4EA7\u7269\u548C node \u6D4B\u8BD5\u4F1A\u5206\u53C9\u3002
 * ========================================================================== */

/* ---------------------------------------------------------------
 *  \u57FA\u7840\u5DE5\u5177
 * --------------------------------------------------------------- */

/** \u628A\u4EFB\u610F\u6574\u6570\u6298\u7B97\u6210 0\u201311 \u7684\u97F3\u7EA7 */
function pc(n) {
  return ((n % 12) + 12) % 12;
}

function clampInt(v, lo, hi, dflt) {
  const n = Math.round(Number(v));
  if (!isFinite(n)) return dflt;
  return Math.max(lo, Math.min(hi, n));
}

/** \u5347\u53F7\u5199\u6CD5\uFF08\u4E0E app.src.js \u7684 SEMI / SHARP \u4FDD\u6301\u4E00\u81F4\uFF0C\u4E0D\u5728\u8FD9\u91CC\u53E6\u7ACB\u4E00\u5957\uFF09 */
const PC_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PC_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** \u6807\u51C6\u8C03\u5F26\uFF1Aindex 0 = 6 \u5F26\uFF08\u6700\u4F4E\uFF09\uFF0Cindex 5 = 1 \u5F26\u3002\u4E0E app.src.js \u7684 STRINGS \u540C\u6E90 */
const STANDARD_TUNING = [40, 45, 50, 55, 59, 64];

/** \u6307\u677F\u7269\u7406\u4E0A\u9650\uFF08\u4E0E board-svg.js \u7684 maxFretSupported \u4E00\u81F4\uFF09 */
const MAX_FRET = 21;

/** \u548C\u5F26\u7EC3\u4E60\u8303\u56F4\u5141\u8BB8\u7684\u4E0A\u9650\uFF08\u9996\u53D1\u53EA\u5230 12 \u54C1\uFF0C\u4E0E\u7269\u7406\u4E0A\u9650\u89E3\u8026\uFF09 */
const CHORD_RANGE_OPTIONS = ['0-5', '0-7', '0-12'];

/** \u53C2\u8003\u6392\u5E03\u7B97\u6CD5\u7248\u672C\u53F7\u3002\u5386\u53F2\u8BB0\u5F55\u91CC\u53EA\u5B58\u7248\u672C\u53F7\uFF0C\u4E0D\u5B58\u6392\u5E03\u672C\u4F53\u3002
 *  \u4EE5\u540E\u5982\u679C\u6539\u7B97\u6CD5\uFF0C\u65E7\u8BB0\u5F55\u8981\u6309\u65E7\u7248\u672C\u590D\u7B97\uFF0C\u4E0D\u80FD\u76F4\u63A5\u7528\u65B0\u7B97\u6CD5\u91CD\u65B0\u89E3\u91CA\u3002 */
const REF_VOICING_VERSION = 1;

function pcName(p, flat) {
  return (flat ? PC_NAMES_FLAT : PC_NAMES_SHARP)[pc(p)];
}

/* ---------------------------------------------------------------
 *  \u548C\u5F26\u8D28\u91CF\u76EE\u5F55
 *
 *  pcs       \u2014\u2014 \u76F8\u5BF9\u6839\u97F3\u7684\u97F3\u7EA7\uFF080\u201311\uFF09\u3002\u516C\u5F0F\u672C\u8EAB\uFF0C\u4E0D\u542B\u4EFB\u4F55\u6307\u578B\u4FE1\u606F\u3002
 *  required  \u2014\u2014 \u5FC5\u987B\u4FDD\u7559\u7684\u97F3\uFF08\u7F3A\u4E86\u5C31\u4E0D\u662F\u8FD9\u4E2A\u548C\u5F26\uFF09
 *  omittable \u2014\u2014 \u6807\u51C6\u5409\u4ED6\u5B9E\u8DF5\u91CC\u5141\u8BB8\u7701\u7565\u7684\u97F3\uFF08\u901A\u5E38\u662F\u4E94\u97F3\uFF09
 *  suffix    \u2014\u2014 \u663E\u793A\u540E\u7F00\uFF08'' \u8868\u793A\u5927\u4E09\u548C\u5F26\u4EC0\u4E48\u90FD\u4E0D\u5199\uFF09
 *
 *  \u26A0 \u7A33\u5B9A\u6807\u8BC6\uFF08id\uFF09\u4E00\u7ECF\u53D1\u5E03\u5C31\u4E0D\u518D\u6539\uFF1A\u5361\u7247\u952E\u3001\u5386\u53F2\u8BB0\u5F55\u3001\u5907\u4EFD\u90FD\u5B58 id\u3002
 *    \u663E\u793A\u540E\u7F00\u53EF\u4EE5\u6539\uFF0Cid \u4E0D\u80FD\u6539\u3002
 * --------------------------------------------------------------- */

const QUALITY_CATALOG = [
  { id: 'maj',  suffix: '',      label: '\u5927\u4E09\u548C\u5F26', pcs: [0, 4, 7],       required: [0, 4],       omittable: [7] },
  { id: 'min',  suffix: 'm',     label: '\u5C0F\u4E09\u548C\u5F26', pcs: [0, 3, 7],       required: [0, 3],       omittable: [7] },
  { id: '7',    suffix: '7',     label: '\u5C5E\u4E03\u548C\u5F26', pcs: [0, 4, 7, 10],   required: [0, 4, 10],   omittable: [7] },
  { id: 'maj7', suffix: 'maj7',  label: '\u5927\u4E03\u548C\u5F26', pcs: [0, 4, 7, 11],   required: [0, 4, 11],   omittable: [7] },
  { id: 'm7',   suffix: 'm7',    label: '\u5C0F\u4E03\u548C\u5F26', pcs: [0, 3, 7, 10],   required: [0, 3, 10],   omittable: [7] },
  { id: 'sus2', suffix: 'sus2',  label: '\u6302\u4E8C\u548C\u5F26', pcs: [0, 2, 7],       required: [0, 2],       omittable: [7] },
  { id: 'sus4', suffix: 'sus4',  label: '\u6302\u56DB\u548C\u5F26', pcs: [0, 5, 7],       required: [0, 5],       omittable: [7] },
  { id: 'dim',  suffix: 'dim',   label: '\u51CF\u4E09\u548C\u5F26', pcs: [0, 3, 6],       required: [0, 3, 6],    omittable: [] },
  { id: 'aug',  suffix: 'aug',   label: '\u589E\u4E09\u548C\u5F26', pcs: [0, 4, 8],       required: [0, 4, 8],    omittable: [] },
  { id: 'add9', suffix: 'add9',  label: '\u52A0\u4E5D\u548C\u5F26', pcs: [0, 2, 4, 7],    required: [0, 2, 4],    omittable: [7] },
];

/** \u51FA\u9898\u6C60\u53EA\u5F00\u8FD9 6 \u79CD\uFF08\u5206\u6790\u5668\u652F\u6301 10 \u79CD\uFF0C\u4E24\u8005\u662F\u72EC\u7ACB\u914D\u7F6E\uFF09 */
const DEFAULT_POOL_QUALITIES = ['maj', 'min', '7', 'm7', 'sus4', 'dim'];

const QUALITY_BY_ID = {};
QUALITY_CATALOG.forEach((q) => { QUALITY_BY_ID[q.id] = q; });

function qualityById(id) {
  return QUALITY_BY_ID[id] || null;
}

const QUALITY_IDS = QUALITY_CATALOG.map((q) => q.id);

/* ---------------------------------------------------------------
 *  \u548C\u5F26\u540D\u89E3\u6790
 * --------------------------------------------------------------- */

/* \u7CBE\u786E\u522B\u540D\u8868\uFF08\u5927\u5C0F\u5199\u654F\u611F\uFF1AM7 = \u5927\u4E03\uFF0Cm7 = \u5C0F\u4E03\uFF0C\u8FD9\u4E00\u5BF9\u5FC5\u987B\u5206\u5F00\uFF09 */
const ALIAS_EXACT = {
  '': 'maj',
  'maj': 'maj', 'major': 'maj', 'Major': 'maj', 'MAJ': 'maj', 'M': 'maj',
  'm': 'min', 'min': 'min', 'minor': 'min', 'Minor': 'min', 'MIN': 'min', '-': 'min',
  '7': '7', 'dom7': '7', 'Dom7': '7',
  'maj7': 'maj7', 'Maj7': 'maj7', 'MAJ7': 'maj7', 'M7': 'maj7', 'ma7': 'maj7',
  'm7': 'm7', 'min7': 'm7', 'Min7': 'm7', '-7': 'm7',
  'sus': 'sus4', 'sus4': 'sus4', 'Sus4': 'sus4',
  'sus2': 'sus2', 'Sus2': 'sus2',
  'dim': 'dim', 'Dim': 'dim',
  'aug': 'aug', 'Aug': 'aug', '+': 'aug',
  'add9': 'add9', 'Add9': 'add9',
};

/* \u5C0F\u5199\u56DE\u9000\u8868\uFF1A\u53EA\u5728\u7CBE\u786E\u5339\u914D\u5931\u8D25\u65F6\u7528\u3002
   \u6784\u9020\u65F6\u5982\u679C\u4E24\u4E2A\u522B\u540D\u5C0F\u5199\u540E\u6307\u5411\u4E0D\u540C\u8D28\u91CF\uFF0C\u5C31\u628A\u8FD9\u4E2A\u952E\u6807\u4E3A\u51B2\u7A81\u5E76\u5254\u9664\uFF0C
   \u907F\u514D "M7" \u88AB\u964D\u6210 "m7" \u8FD9\u79CD\u9759\u9ED8\u6539\u4E49\u3002 */
const ALIAS_LOWER = (() => {
  const out = {};
  const conflicted = {};
  Object.keys(ALIAS_EXACT).forEach((k) => {
    const lower = k.toLowerCase();
    if (!lower) return;                       // \u7A7A\u4E32\u5355\u72EC\u5904\u7406
    const target = ALIAS_EXACT[k];
    if (conflicted[lower]) return;
    if (out[lower] && out[lower] !== target) { delete out[lower]; conflicted[lower] = true; return; }
    out[lower] = target;
  });
  return out;
})();

function lookupQuality(token) {
  if (Object.prototype.hasOwnProperty.call(ALIAS_EXACT, token)) return ALIAS_EXACT[token];
  const lower = String(token || '').toLowerCase();
  if (Object.prototype.hasOwnProperty.call(ALIAS_LOWER, lower)) return ALIAS_LOWER[lower];
  return null;
}

/**
 * \u628A\u7528\u6237\u8F93\u5165\u7684\u548C\u5F26\u540D\u6807\u51C6\u5316\u6210\u7ED3\u6784\u5316\u8868\u8FBE\u3002
 * \u63A5\u53D7\uFF1AC\u3001Cmaj\u3001C major\u3001Cm\u3001C-\u3001C7\u3001Cmaj7\u3001C\u25B37\u3001Cm7\u3001Csus4\u3001Cdim\u3001C\u00B0\u3001Caug\u3001C+\u3001
 *       Cadd9\u3001C#m7\u3001Dbm\u3001C/E\u3001C\u266Fm\uFF08\u5168\u89D2/Unicode \u5347\u964D\u53F7\u4E5F\u8BA4\uFF09
 * \u8FD4\u56DE\uFF1A{ ok:true, rootPc, qualityId, bassPc, flat, input }
 *      \u6216 { ok:false, reason, ... }\u2014\u2014reason \u7528\u4E8E\u7ED9\u7528\u6237\u53EF\u64CD\u4F5C\u7684\u63D0\u793A\uFF0C\u4E0D\u662F\u5185\u90E8\u9519\u8BEF\u7801\u3002
 */
function parseChordName(input) {
  if (typeof input !== 'string') return { ok: false, reason: 'empty' };
  let s = input.trim();
  if (!s) return { ok: false, reason: 'empty' };

  /* \u7EDF\u4E00\u5347\u964D\u53F7\u4E0E\u5E38\u89C1\u8BB0\u53F7 */
  s = s
    .replace(/[\u266F\uFF03]/g, '#')
    .replace(/[\u266D\uFF42]/g, 'b')
    .replace(/[\u25B3\u0394]/g, 'maj')
    .replace(/[\u00B0\u00BA]/g, 'dim')
    .replace(/\s+/g, '');

  /* \u4F4E\u97F3\uFF08\u659C\u6760\u548C\u5F26\uFF09\uFF1AC/E\u3001Am7/G\u3002\u5199\u4E86\u659C\u6760\u5C31\u5FC5\u987B\u8DDF\u4E00\u4E2A\u5408\u6CD5\u4F4E\u97F3\u3002 */
  let bassPart = null;
  const slash = s.indexOf('/');
  if (slash >= 0) {
    bassPart = s.slice(slash + 1);
    s = s.slice(0, slash);
    if (!bassPart) return { ok: false, reason: 'badBass', input };
  }

  const m = /^([A-Ga-g])([#b]?)(.*)$/.exec(s);
  if (!m) return { ok: false, reason: 'noRoot', input };

  const letter = m[1].toUpperCase();
  const acc = m[2] || '';
  const rest = m[3] || '';
  const rootPc = pc(LETTER_PC[letter] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0));

  const qualityId = lookupQuality(rest);
  if (!qualityId) {
    return { ok: false, reason: 'unknownQuality', input, rootPc, token: rest };
  }

  let bassPc = null;
  if (bassPart) {
    const bm = /^([A-Ga-g])([#b]?)$/.exec(bassPart);
    if (!bm) return { ok: false, reason: 'badBass', input, rootPc, qualityId, bassToken: bassPart };
    bassPc = pc(LETTER_PC[bm[1].toUpperCase()] + (bm[2] === '#' ? 1 : bm[2] === 'b' ? -1 : 0));
  }

  return {
    ok: true,
    input,
    rootPc,
    qualityId,
    bassPc,
    flat: acc === 'b' || (bassPart ? /b$/.test(bassPart) : false),
  };
}

/** \u7ED3\u6784\u5316\u8868\u8FBE \u2192 \u663E\u793A\u540D\u3002flat=true \u65F6\u7528\u964D\u53F7\u5199\u6CD5 */
function formatChordName(rootPc, qualityId, opts) {
  const q = qualityById(qualityId);
  if (!q) return '?';
  const o = opts || {};
  const flat = !!o.flat;
  let name = pcName(rootPc, flat) + q.suffix;
  if (o.bassPc != null && pc(o.bassPc) !== pc(rootPc)) {
    name += '/' + pcName(o.bassPc, flat);
  }
  return name;
}

/* ---------------------------------------------------------------
 *  \u6392\u5E03\u8868\u8FBE
 *
 *  \u5185\u90E8\u4E00\u5F8B\u7528\u300C\u516D\u4E2A\u6570\u300D\u8868\u793A\uFF1Aindex 0 = 6 \u5F26\uFF0Cindex 5 = 1 \u5F26\uFF1B
 *    -1 = \u9759\u97F3\uFF08muted\uFF09
 *     0 = \u7A7A\u5F26\uFF08open\uFF09
 *   1..21 = \u6309\u7B2C\u51E0\u54C1\uFF08fretted\uFF09
 *  \u8FD9\u4E2A\u5F62\u72B6\u548C chordHistory.arrangement \u7684\u5B57\u7B26\u4E32\u4E00\u4E00\u5BF9\u5E94\uFF0C
 *  \u4E5F\u548C\u754C\u9762\u7684\u4E09\u6001\u76F4\u63A5\u5BF9\u5E94\uFF0C\u907F\u514D\u591A\u5957\u8868\u793A\u4E92\u8F6C\u65F6\u51FA\u9519\u3002
 * --------------------------------------------------------------- */

/** \u5355\u4E2A\u683C\u7684\u8BED\u4E49\uFF1A'muted' | 'open' | 'fretted' */
function stateOf(fret) {
  if (fret == null || fret < 0) return 'muted';
  if (fret === 0) return 'open';
  return 'fretted';
}

/** \u6392\u5E03\u5B57\u7B26\u4E32\uFF1A'x,3,2,0,1,0'\uFF086 \u5F26 \u2192 1 \u5F26\uFF09 */
function formatArrangement(frets) {
  return (frets || []).map((f) => (f == null || f < 0 ? 'x' : String(f))).join(',');
}

/**
 * \u89E3\u6790\u6392\u5E03\u5B57\u7B26\u4E32\u3002\u4E25\u683C\u6821\u9A8C\uFF1A\u5FC5\u987B 6 \u6BB5\u3001\u6BCF\u6BB5\u662F 'x' \u6216 0..21 \u7684\u6574\u6570\u3002
 * \u4EFB\u4F55\u4E0D\u5408\u6CD5\u90FD\u8FD4\u56DE null\uFF08\u8C03\u7528\u65B9\u4E22\u5F03\u8BE5\u6761\u5386\u53F2\uFF0C\u800C\u4E0D\u662F\u8BA9\u6574\u4EFD\u5907\u4EFD\u5931\u6548\uFF09\u3002
 */
function parseArrangement(str) {
  if (typeof str !== 'string') return null;
  const parts = str.split(',');
  if (parts.length !== 6) return null;
  const out = [];
  for (let i = 0; i < 6; i++) {
    const t = parts[i].trim();
    if (t === 'x' || t === 'X') { out.push(-1); continue; }
    if (!/^\d{1,2}$/.test(t)) return null;
    const n = Number(t);
    if (n < 0 || n > MAX_FRET) return null;
    out.push(n);
  }
  return out;
}

/**
 * \u628A\u591A\u79CD\u8F93\u5165\u5F62\u72B6\u5F52\u4E00\u6210\u300C\u516D\u4E2A\u6570\u300D\uFF1A
 *   - 'x,3,2,0,1,0' \u5B57\u7B26\u4E32
 *   - [-1, 3, 2, 0, 1, 0] \u6570\u5B57\u6570\u7EC4
 *   - [{kind:'muted'}, {kind:'fretted', fret:3}, {kind:'open'}, \u2026] \u5BF9\u8C61\u6570\u7EC4
 * \u957F\u5EA6\u4E0D\u662F 6 \u6216\u542B\u975E\u6CD5\u503C \u2192 null\u3002
 */
function normalizeArrangement(input) {
  if (input == null) return null;
  if (typeof input === 'string') return parseArrangement(input);
  if (Array.isArray(input)) {
    if (input.length !== 6) return null;
    const out = [];
    for (let i = 0; i < 6; i++) {
      const it = input[i];
      if (it == null) { out.push(-1); continue; }
      if (typeof it === 'number') {
        if (!isFinite(it) || it < -1 || it > MAX_FRET) return null;
        out.push(Math.round(it));
        continue;
      }
      if (typeof it === 'object') {
        const kind = it.kind || it.state;
        if (kind === 'muted') { out.push(-1); continue; }
        if (kind === 'open') { out.push(0); continue; }
        if (kind === 'fretted') {
          const f = Math.round(Number(it.fret));
          if (!isFinite(f) || f < 1 || f > MAX_FRET) return null;
          out.push(f);
          continue;
        }
        return null;
      }
      return null;
    }
    return out;
  }
  return null;
}

/* ---------------------------------------------------------------
 *  \u6392\u5E03 \u2192 \u97F3\u9AD8
 * --------------------------------------------------------------- */

/**
 * \u628A\u6392\u5E03\u8F6C\u6210\u53D1\u58F0\u5217\u8868\u3002\u9759\u97F3\u5F26\u5B8C\u5168\u4E0D\u53C2\u4E0E\uFF0C\u7A7A\u5F26\u4E0E\u9759\u97F3\u4E25\u683C\u533A\u5206\u3002
 * \u8FD4\u56DE { notes:[{stringIndex,stringNumber,fret,midi,pc}], pcs, lowest }
 * \u5176\u4E2D lowest \u662F\u300C\u6700\u4F4E\u53D1\u58F0\u97F3\u300D\uFF1B\u5168\u9759\u97F3\u65F6 lowest \u4E3A null\u3002
 */
function soundingNotes(frets, tuning) {
  const t = tuning || STANDARD_TUNING;
  const notes = [];
  for (let i = 0; i < 6; i++) {
    const f = frets[i];
    if (f == null || f < 0) continue;
    const midi = t[i] + f;
    notes.push({ stringIndex: i, stringNumber: 6 - i, fret: f, midi: midi, pc: pc(midi) });
  }
  /* \u97F3\u9AD8\u6392\u5E8F\uFF1Amidi \u5C0F\u7684\u662F\u66F4\u4F4E\u97F3\uFF1B\u540C\u97F3\u9AD8\u65F6\u5F26\u53F7\u5927\u7684\uFF08\u66F4\u7C97\u7684\u5F26\uFF09\u7B97\u66F4\u4F4E */
  const sorted = notes.slice().sort((a, b) => (a.midi - b.midi) || (b.stringIndex - a.stringIndex));
  const pcs = [];
  notes.forEach((n) => { if (pcs.indexOf(n.pc) < 0) pcs.push(n.pc); });
  pcs.sort((a, b) => a - b);
  return { notes, pcs, lowest: sorted.length ? sorted[0] : null };
}

/* ---------------------------------------------------------------
 *  \u6392\u5E03\u5206\u6790\uFF1A\u4EFB\u610F\u516D\u5F26\u6392\u5E03 \u2192 \u5019\u9009\u548C\u5F26\u5217\u8868
 *
 *  \u8FD9\u662F\u6574\u4E2A\u548C\u5F26\u6A21\u5F0F\u7684\u6838\u5FC3\u3002\u5B83\u4E0D\u8BA4\u8BC6\u300C\u9898\u76EE\u300D\uFF0C\u53EA\u8BA4\u8BC6\u6392\u5E03\uFF0C
 *  \u6240\u4EE5\u300C\u540D\u79F0 \u2192 \u6307\u677F\u300D\u7684\u5224\u5206\u548C\u300C\u6307\u677F \u2192 \u540D\u79F0\u300D\u7684\u51FA\u9898\u90FD\u7528\u5B83\u3002
 * --------------------------------------------------------------- */

const W_EXTRA = 1000;        // \u516C\u5F0F\u5916\u7684\u97F3\uFF1A\u51E0\u4E4E\u4E00\u7968\u5426\u51B3
const W_MISSING_REQ = 100;   // \u7F3A\u5FC5\u8981\u97F3\uFF1A\u5F88\u4E25\u91CD
const W_MISSING_OMIT = 10;   // \u7F3A\u53EF\u7701\u7565\u97F3\uFF1A\u8F7B\u5FAE
const W_ROOT_PRESENT = 50;   // \u6839\u97F3\u5728\u6392\u5E03\u91CC
const W_LOWEST_ROOT = 20;    // \u6700\u4F4E\u97F3\u5C31\u662F\u6839\u97F3\uFF08\u539F\u4F4D\uFF09
const W_MATCHED = 2;         // \u8986\u76D6\u5EA6

/**
 * @param {string|number[]|object[]} arrangement \u4EFB\u610F\u5F62\u72B6\u7684\u516D\u5F26\u6392\u5E03
 * @param {object} [opts] { tuning }
 * @returns {{
 *   ok:boolean, reason?:string,
 *   frets:number[], notes:object[], pcs:number[],
 *   lowest:object|null, lowestPc:number|null,
 *   candidates:object[], ambiguous:boolean
 * }}
 */
function analyzeArrangement(arrangement, opts) {
  const frets = normalizeArrangement(arrangement);
  if (!frets) return { ok: false, reason: 'badArrangement', candidates: [], ambiguous: false };

  const o = opts || {};
  const sound = soundingNotes(frets, o.tuning);

  if (!sound.notes.length) {
    return {
      ok: true, reason: 'noSound',
      frets: frets, notes: [], pcs: [], lowest: null, lowestPc: null,
      candidates: [], ambiguous: false,
    };
  }

  const played = sound.pcs;
  const playedSet = new Set(played);
  const lowestPc = sound.lowest ? sound.lowest.pc : null;

  const candidates = [];
  for (let root = 0; root < 12; root++) {
    for (let qi = 0; qi < QUALITY_CATALOG.length; qi++) {
      const q = QUALITY_CATALOG[qi];
      const formula = q.pcs.map((p) => pc(root + p));
      const formulaSet = new Set(formula);
      const requiredAbs = q.required.map((p) => pc(root + p));
      const omittableAbs = q.omittable.map((p) => pc(root + p));

      const matched = formula.filter((p) => playedSet.has(p));
      const missing = formula.filter((p) => !playedSet.has(p));
      const extra = played.filter((p) => !formulaSet.has(p));
      const missingRequired = requiredAbs.filter((p) => !playedSet.has(p));
      const missingOmittable = omittableAbs.filter((p) => !playedSet.has(p) && !missingRequired.includes(p));

      /* \u53EA\u4FDD\u7559\u300C\u503C\u5F97\u89E3\u91CA\u300D\u7684\u5019\u9009\uFF1A\u51B2\u7A81\u97F3\u8D85\u8FC7 2 \u4E2A\u7684\u7EC4\u5408\u5BF9\u7528\u6237\u6CA1\u6709\u610F\u4E49 */
      if (extra.length > 2) continue;

      const rootPresent = playedSet.has(pc(root));
      const lowestIsRoot = lowestPc === pc(root);

      let score = 0;
      score -= extra.length * W_EXTRA;
      score -= missingRequired.length * W_MISSING_REQ;
      score -= missingOmittable.length * W_MISSING_OMIT;
      if (rootPresent) score += W_ROOT_PRESENT;
      if (lowestIsRoot) score += W_LOWEST_ROOT;
      score += matched.length * W_MATCHED;

      const fullMatch = extra.length === 0 && missing.length === 0;
      const omitMatch = extra.length === 0 && missingRequired.length === 0 && missing.length > 0;

      candidates.push({
        rootPc: root,
        qualityId: q.id,
        name: formatChordName(root, q.id, { bassPc: lowestPc, flat: o.flat }),
        plainName: formatChordName(root, q.id, { flat: o.flat }),
        score: score,
        matched: matched,
        missing: missing,
        missingRequired: missingRequired,
        missingOmittable: missingOmittable,
        extra: extra,
        rootPresent: rootPresent,
        lowestIsRoot: lowestIsRoot,
        inversion: lowestPc != null && lowestPc !== pc(root) ? lowestPc : null,
        fullMatch: fullMatch,
        omitMatch: omitMatch,
        partial: !fullMatch && !omitMatch,
      });
    }
  }

  /* \u6392\u5E8F\uFF1A\u5206\u6570\u9AD8\u7684\u5728\u524D\uFF1B\u540C\u5206\u65F6\u6309\u6839\u97F3\u3001\u8D28\u91CF id \u6392\uFF0C\u4FDD\u8BC1\u7ED3\u679C\u7A33\u5B9A\u53EF\u590D\u73B0 */
  candidates.sort((a, b) => (b.score - a.score)
    || (a.rootPc - b.rootPc)
    || (a.qualityId < b.qualityId ? -1 : a.qualityId > b.qualityId ? 1 : 0));

  /* \u6B67\u4E49 = \u524D\u4E24\u540D\u540C\u5206\u3002\u8FD9\u91CC\u4E0D\u66FF\u7528\u6237\u505A\u51B3\u5B9A\uFF0C\u628A\u6B67\u4E49\u539F\u6837\u4FDD\u7559\u3002 */
  const ambiguous = candidates.length >= 2 && candidates[0].score === candidates[1].score;

  return {
    ok: true,
    frets: frets,
    notes: sound.notes,
    pcs: played,
    lowest: sound.lowest,
    lowestPc: lowestPc,
    candidates: candidates,
    ambiguous: ambiguous,
  };
}

/* ---------------------------------------------------------------
 *  \u53C2\u8003\u6392\u5E03\uFF08\u53EA\u7ED9\u300C\u540D\u79F0 \u2192 \u6307\u677F\u300D\u7528\u6765\u53D1\u58F0\u548C\u6559\u5B66\u793A\u8303\uFF09
 *
 *  \u26A0 \u5B83\u4E0D\u662F\u6807\u51C6\u7B54\u6848\u3002\u5224\u5206\u6C38\u8FDC\u8D70 judgeBuild()\uFF0C\u4E0D\u8981\u6C42\u7528\u6237\u590D\u523B\u8FD9\u5957\u6307\u578B\u3002
 *  \u540C\u4E00\u548C\u5F26\u3001\u540C\u4E00\u8303\u56F4\u3001\u540C\u4E00\u7B97\u6CD5\u7248\u672C \u2192 \u6C38\u8FDC\u540C\u4E00\u7ED3\u679C\uFF08\u786E\u5B9A\u6027\uFF09\u3002
 * --------------------------------------------------------------- */

function cmpScore(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

/** \u5728\u7ED9\u5B9A\u7A97\u53E3\u5185\u642D\u4E00\u4E2A\u6392\u5E03\uFF1B\u642D\u4E0D\u51FA\u5408\u6CD5\u7ED3\u6784\u8FD4\u56DE null
 *
 *  \u26A0 \u8FD9\u91CC\u662F\u7A77\u4E3E\u641C\u7D22\uFF0C\u4E0D\u662F\u8D2A\u5FC3\u3002
 *
 *  \u65E9\u671F\u7684\u8D2A\u5FC3\u7248\u672C\uFF08\u6BCF\u6839\u5F26\u4F9D\u6B21\u6311\u300C\u6536\u76CA\u6700\u5927\u300D\u7684\u97F3\uFF09\u6709\u4E2A\u81F4\u547D\u7F3A\u9677\uFF1A
 *  \u5B83\u4F1A\u4E3A\u4E86\u5148\u8865\u9F50\u4E00\u4E2A\u5FC5\u8981\u97F3\uFF0C\u628A\u67D0\u6839\u5F26\u4E0A\u300C\u552F\u4E00\u80FD\u5230\u53E6\u4E00\u4E2A\u97F3\u300D\u7684\u4F4D\u7F6E\u5360\u6389\uFF0C
 *  \u7ED3\u679C\u97F3\u7EA7\u6570\u51D1\u4E0D\u591F 3 \u4E2A\uFF0C\u6574\u7EC4\u88AB\u5224\u5B9A\u4E3A\u65E0\u89E3\u3002
 *  \u5B9E\u4F8B\uFF1AD#sus4 \u5728 0\u20135 \u54C1\u5185\uFF0C3 \u5F26\u65E2\u80FD\u5728 1 \u54C1\u7ED9 G#\u3001\u53C8\u80FD\u5728 3 \u54C1\u7ED9 A#\uFF1B
 *  \u8D2A\u5FC3\u5148\u62FF G#\uFF0CA# \u5C31\u518D\u6CA1\u6709\u522B\u7684\u5F26\u80FD\u53D1\uFF082 \u5F26/1 \u5F26\u5728 0\u20135 \u54C1\u5185\u90FD\u6CA1\u6709 A#\uFF09\uFF0C
 *  \u4E8E\u662F\u8FD4\u56DE noVoicing \u2014\u2014 \u4F46 x,x,1,3,4,4 \u662F\u771F\u5B9E\u53EF\u7528\u7684\u6392\u5E03\u3002
 *
 *  \u6240\u4EE5\u6539\u6210\uFF1A\u6BCF\u6839\u5F26\u7684\u5019\u9009 = \u300C\u95F7\u97F3\u300D+\u300C\u7A97\u53E3\u5185\u6BCF\u4E2A\u4E0D\u540C\u97F3\u7EA7\u7684\u6700\u4F4E\u90A3\u4E00\u683C\u300D\uFF0C
 *  \u7136\u540E DFS \u7A77\u4E3E\u3002\u5355\u5F26\u5019\u9009\u901A\u5E38 \u2264 4 \u4E2A\u3001\u6DF1\u5EA6 5\uFF0C\u6700\u574F 1024 \u79CD\u7EC4\u5408\uFF0C
 *  \u4E00\u65E6\u627E\u5230\u300C\u5FC5\u8981\u97F3\u9F50\u5168 + \u97F3\u7EA7\u6570\u6EE1 + \u65E0\u5185\u90E8\u7A7A\u6D1E\u300D\u5C31\u63D0\u524D\u7ED3\u675F\u3002
 */
function buildInWindow(tuning, formula, required, rootPc, lowestIdx, lo, hi) {
  const frets = [-1, -1, -1, -1, -1, -1];

  /* \u6700\u4F4E\u53D1\u58F0\u97F3\u5FC5\u987B\u662F\u6839\u97F3\uFF1A\u5728 lowestIdx \u8FD9\u6839\u5F26\u4E0A\u627E\u4E00\u4E2A\u7A97\u53E3\u5185\u7684\u6839\u97F3\u683C */
  let rootFret = null;
  for (let f = lo; f <= hi; f++) {
    if (pc(tuning[lowestIdx] + f) === rootPc) { rootFret = f; break; }
  }
  if (rootFret == null) return null;
  frets[lowestIdx] = rootFret;

  const formulaSet = new Set(formula);
  const requiredSet = new Set(required);

  /* \u6BCF\u6839\u5F26\u7684\u5019\u9009\uFF1A\u95F7\u97F3 + \u6BCF\u4E2A\u53EF\u8FBE\u97F3\u7EA7\u7684\u6700\u4F4E\u683C */
  const options = [];
  for (let i = lowestIdx + 1; i < 6; i++) {
    const byPc = new Map();
    for (let f = lo; f <= hi; f++) {
      const p = pc(tuning[i] + f);
      if (!formulaSet.has(p)) continue;
      if (!byPc.has(p)) byPc.set(p, f);   // \u540C\u4E00\u97F3\u7EA7\u53D6\u6700\u4F4E\u683C
    }
    const opts = [{ fret: -1, pc: null }];
    byPc.forEach((f, p) => opts.push({ fret: f, pc: p }));
    options.push(opts);
  }

  let best = null;

  const finish = (fretArr) => {
    const covered = new Set([rootPc]);
    fretArr.forEach((f, i) => {
      if (i === lowestIdx) return;
      if (f >= 0) covered.add(pc(tuning[i] + f));
    });
    const missingRequired = required.filter((p) => !covered.has(p)).length;
    const mutedCount = fretArr.filter((f) => f < 0).length;
    const soundingCount = 6 - mutedCount;
    const openCount = fretArr.filter((f) => f === 0).length;

    let minFreted = Infinity;
    let maxFreted = -1;
    fretArr.forEach((f) => {
      if (f > 0) { if (f < minFreted) minFreted = f; if (f > maxFreted) maxFreted = f; }
    });
    const realSpan = maxFreted >= 0 ? maxFreted - minFreted : 0;

    let innerHole = 0;
    let firstSounding = -1;
    let lastSounding = -1;
    for (let i = 0; i < 6; i++) {
      if (fretArr[i] >= 0) { if (firstSounding < 0) firstSounding = i; lastSounding = i; }
    }
    if (firstSounding >= 0) {
      for (let i = firstSounding; i <= lastSounding; i++) if (fretArr[i] < 0) innerHole++;
    }

    return {
      frets: fretArr.slice(),
      missingRequired: missingRequired,
      distinctCount: covered.size,
      mutedCount: mutedCount,
      soundingCount: soundingCount,
      openCount: openCount,
      innerHole: innerHole,
      realSpan: realSpan,
      span: hi - lo,
      lowestString: lowestIdx,
    };
  };

  const dfs = (depth) => {
    if (depth === options.length) {
      const cand = finish(frets);
      /* \u6392\u5E8F\u53E3\u5F84\u4E0E referenceVoicing \u4FDD\u6301\u4E00\u81F4\uFF1A
         \u5FC5\u8981\u97F3 \u2192 \u97F3\u7EA7\u6570 \u2192 \u65E0\u5185\u90E8\u7A7A\u6D1E \u2192 \u53D1\u58F0\u5F26\u591A \u2192 \u8DE8\u5EA6\u5C0F \u2192 \u7A7A\u5F26\u591A \u2192 \u95F7\u5F26\u5C11 */
      const score = [cand.missingRequired, -cand.distinctCount, cand.innerHole,
        -cand.soundingCount, cand.realSpan, -cand.openCount, cand.mutedCount];
      if (!best || cmpScore(score, best.score) < 0) best = { score: score, v: cand };
      /* \u26A0 \u8FD9\u91CC\u523B\u610F\u4E0D\u505A\u300C\u627E\u5230\u5B8C\u7F8E\u89E3\u5C31\u63D0\u524D\u8FD4\u56DE\u300D\u7684\u4F18\u5316\u3002
         \u8BD5\u8FC7\uFF1A\u4E00\u65E6\u300C\u5FC5\u8981\u97F3\u9F50 + \u97F3\u7EA7\u6570\u6EE1 + \u65E0\u7A7A\u6D1E\u300D\u5C31 break\uFF0C
         \u7ED3\u679C\u7B2C\u4E00\u4E2A\u6EE1\u8DB3\u8BE5\u6761\u4EF6\u7684\u89E3\u4F1A\u62A2\u5728\u300C\u53D1\u58F0\u5F26\u66F4\u591A\u300D\u7684\u89E3\u4E4B\u524D\u8FD4\u56DE \u2014\u2014
         \u4F8B\u5982 C#maj \u4F1A\u751F\u6210\u53EA\u6709 3 \u6839\u5F26\u7684 x,4,3,1,x,x\uFF0C
         \u800C x,4,3,1,2,x\uFF082 \u5F26 2 \u54C1\u4E5F\u662F C#\uFF09\u660E\u660E\u66F4\u9971\u6EE1\u3002
         \u7A77\u4E3E\u7A7A\u95F4\u5F88\u5C0F\uFF08\u5355\u7A97\u53E3\u6700\u574F 4^5 = 1024\uFF09\uFF0C\u4E0D\u503C\u5F97\u4E3A\u8FD9\u70B9\u6027\u80FD\u727A\u7272\u6392\u5E8F\u6B63\u786E\u6027\u3002 */
      return;
    }
    const stringIdx = lowestIdx + 1 + depth;
    for (const opt of options[depth]) {
      frets[stringIdx] = opt.fret;
      dfs(depth + 1);
      frets[stringIdx] = -1;
    }
  };

  dfs(0);
  return best ? best.v : null;
}

/**
 * \u751F\u6210\u53C2\u8003\u6392\u5E03\u3002
 * @param {number} rootPc 0\u201311
 * @param {string} qualityId \u7A33\u5B9A\u6807\u8BC6
 * @param {object} [opts] { tuning, minFret, maxFret, maxSpan, flat }
 * @returns {{ok:boolean, reason?:string, frets?:number[], arrangement?:string, \u2026}}
 */
function referenceVoicing(rootPc, qualityId, opts) {
  const q = qualityById(qualityId);
  if (!q) return { ok: false, reason: 'unknownQuality' };

  const o = opts || {};
  const tuning = o.tuning || STANDARD_TUNING;
  const minFret = clampInt(o.minFret, 0, MAX_FRET, 0);
  const maxFret = clampInt(o.maxFret, 0, MAX_FRET, 12);
  const maxSpan = clampInt(o.maxSpan, 0, 12, 4);

  const formula = q.pcs.map((p) => pc(rootPc + p));
  const required = q.required.map((p) => pc(rootPc + p));

  let best = null;
  for (let lowestIdx = 0; lowestIdx < 6; lowestIdx++) {
    for (let lo = minFret; lo <= maxFret; lo++) {
      for (let span = 0; span <= maxSpan; span++) {
        const hi = Math.min(maxFret, lo + span);
        if (hi < lo) continue;
        const v = buildInWindow(tuning, formula, required, rootPc, lowestIdx, lo, hi);
        if (!v) continue;
        /* \u6392\u5E8F\u4F18\u5148\u7EA7\uFF08\u4ECE\u786C\u5230\u8F6F\uFF09\uFF1A
           1) \u5FC5\u8981\u97F3\u5FC5\u987B\u9F50\uFF08\u7F3A\u4E00\u4E2A\u5C31\u51FA\u5C40\uFF09
           2) \u97F3\u7EA7\u8D8A\u591A\u8D8A\u597D\uFF08\u4E09\u97F3\u548C\u5F26\u81F3\u5C11\u8981 3 \u4E2A\u4E0D\u540C\u97F3\u7EA7\uFF09
           3) \u53D1\u58F0\u533A\u4E0D\u80FD\u6709\u7A7A\u6D1E\uFF08\u4E2D\u95F4\u95F7\u6389\u7684\u5F26\u6309\u4E0D\u54CD\uFF0C\u4E5F\u4E0D\u50CF\u548C\u5F26\uFF09
           4) \u53D1\u58F0\u5F26\u6570\u591A\uFF08\u548C\u5F26\u8981\u6709\u539A\u5EA6\uFF09\u2014\u2014 \u53EA\u662F\u504F\u597D\uFF0C\u4E0D\u662F\u786C\u6027\u6DD8\u6C70
           5) \u6309\u54C1\u8DE8\u5EA6\u5C0F\uFF08\u771F\u5B9E\u6307\u578B\u4E00\u4E2A\u624B\u4F4D\u5185\uFF09
           6) \u7A7A\u5F26\u591A\uFF08\u5F00\u653E\u628A\u4F4D\u66F4\u597D\u5F39\u3001\u4E5F\u66F4\u597D\u542C\uFF09
           7) \u628A\u4F4D\u4F4E
           8) \u95F7\u5F26\u5C11
           \u26A0 \u8FD9\u91CC\u53EA\u505A\u300C\u751F\u6210\u300D\uFF0C\u4E0D\u662F\u5224\u5206\u6807\u51C6\uFF1A\u7528\u6237\u6309\u522B\u7684\u6307\u578B\u4E5F\u7B97\u5BF9\u3002 */
        const score = [v.missingRequired, -v.distinctCount, v.innerHole, -v.soundingCount, v.realSpan, -v.openCount, lo, v.mutedCount];
        if (!best || cmpScore(score, best.score) < 0) best = { score: score, v: v };
      }
    }
  }

  if (!best) return { ok: false, reason: 'noVoicing' };
  const v = best.v;
  /* \u786C\u6027\u95E8\u69DB\u53EA\u6709\u4E24\u6761\uFF1A
     - \u76EE\u6807\u548C\u5F26\u7684\u5FC5\u8981\u97F3\u5FC5\u987B\u9F50\uFF08\u7F3A\u4E09\u97F3/\u7F3A\u4E03\u97F3\u7684\u300C\u53C2\u8003\u6392\u5E03\u300D\u662F\u9519\u7684\u793A\u8303\uFF09
     - \u97F3\u7EA7\u6570 \u2265 3\uFF08\u5C11\u4E8E 3 \u4E2A\u97F3\u7EA7\u4E0D\u6784\u6210\u548C\u5F26\uFF09
     \u53D1\u58F0\u5F26\u6570\u3001\u5185\u90E8\u7A7A\u6D1E\u3001\u8DE8\u5EA6\u90FD\u53EA\u662F\u6392\u5E8F\u504F\u597D\uFF0C\u4E0D\u518D\u6DD8\u6C70\u3002 */
  if (v.missingRequired > 0) return { ok: false, reason: 'missingRequiredTone' };
  if (v.distinctCount < MIN_DISTINCT_PCS) return { ok: false, reason: 'tooFewTones' };

  return {
    ok: true,
    rootPc: pc(rootPc),
    qualityId: qualityId,
    frets: v.frets,
    arrangement: formatArrangement(v.frets),
    span: v.realSpan,
    soundingCount: v.soundingCount,
    distinctCount: v.distinctCount,
    innerHole: v.innerHole,
    lowestString: 6 - v.lowestString,
    lowestIsRoot: true,
    version: REF_VOICING_VERSION,
  };
}

/** \u8FD9\u4E2A\u548C\u5F26\u5728\u7ED9\u5B9A\u8303\u56F4\u5185\u80FD\u4E0D\u80FD\u751F\u6210\u5408\u6CD5\u53C2\u8003\u6392\u5E03\uFF08\u51FA\u9898\u6C60\u7528\uFF09 */
function feasibleInRange(rootPc, qualityId, opts) {
  return referenceVoicing(rootPc, qualityId, opts).ok === true;
}

/* ---------------------------------------------------------------
 *  \u5408\u6CD5\u6392\u5E03\u6C60\uFF08\u300C\u6307\u677F \u2192 \u540D\u79F0\u300D\u7684\u9898\u76EE\u6765\u6E90\uFF09
 *
 *  \u53EA\u8003\u53C2\u8003\u6392\u5E03\u7B49\u4E8E\u53EA\u8003\u4E00\u4E2A\u6307\u578B\u3002\u771F\u5B9E\u7EC3\u4E60\u91CC\u540C\u4E00\u548C\u5F26\u6709\u5927\u91CF\u6307\u578B\uFF0C
 *  \u6240\u4EE5\u8FD9\u91CC\u6309\u7EA6\u675F\u751F\u6210\u4E00\u6279\u5408\u6CD5\u6392\u5E03\uFF0C\u518D\u7528\u5206\u6790\u5668\u590D\u6838\u300C\u5B83\u786E\u5B9E\u80FD\u88AB\u8BA4\u56DE\u76EE\u6807\u548C\u5F26\u300D\u3002
 *
 *  \u7EA6\u675F\uFF08\u4E0E\u5DF2\u786E\u8BA4\u7684 \u00A77 \u4E00\u81F4\uFF09\uFF1A
 *    - \u97F3\u7EA7\u96C6\u5408\u4E0E\u76EE\u6807\u548C\u5F26\u516C\u5F0F\u76F8\u5BB9\uFF08\u65E0\u51B2\u7A81\u97F3\uFF09
 *    - \u81F3\u5C11 3 \u4E2A\u4E0D\u540C\u97F3\u7EA7
 *    - \u6240\u6709\u6309\u54C1\u5728\u8303\u56F4\u5185
 *    - \u53D1\u58F0\u533A\u6CA1\u6709\u5185\u90E8\u7A7A\u6D1E\uFF08\u4E2D\u95F4\u95F7\u6389\u7684\u5F26\u6309\u4E0D\u51FA\u6765\uFF09
 *    - \u6309\u54C1\u8DE8\u5EA6 \u2264 maxSpan
 *  \u4E0D\u8981\u6C42\u4F4E\u97F3\u662F\u6839\u97F3 \u2014\u2014 \u8F6C\u4F4D\u6392\u5E03\u6B63\u662F\u8981\u7EC3\u7684\u4E1C\u897F\u3002
 * --------------------------------------------------------------- */

/**
 * \u679A\u4E3E\u67D0\u548C\u5F26\u5728\u8303\u56F4\u5185\u7684\u5408\u6CD5\u6392\u5E03\u3002
 *
 * \u26A0 \u8FD4\u56DE\u7684\u662F\u300C\u97F3\u7EA7\u5408\u6CD5\u300D\u7684\u6392\u5E03\uFF0C**\u4E0D\u4E00\u5B9A\u9002\u5408\u5F53\u9898\u76EE**\uFF1A
 *   \u5B9E\u6D4B 0\u20135 \u54C1 6 \u8D28\u91CF \u00D7 12 \u6839\u97F3\u5171 5083 \u4E2A\u5408\u6CD5\u6392\u5E03\uFF0C\u5176\u4E2D 1810 \u4E2A\uFF0836%\uFF09
 *   \u867D\u7136\u5305\u542B\u76EE\u6807\u548C\u5F26\uFF0C\u4F46\u5206\u6790\u5668\u628A\u5B83\u5224\u7ED9\u4E86\u53E6\u4E00\u4E2A\u548C\u5F26
 *   \uFF08\u5178\u578B\uFF1AC7 \u7701\u7565\u4E03\u97F3\u7684\u6392\u5E03\uFF0C\u97F3\u7EA7\u96C6\u5408\u5C31\u662F C \u5927\u4E09\uFF09\u3002
 *   \u51FA\u9898\u5FC5\u987B\u518D\u7528 eligibleVoicings() \u8FC7\u4E00\u904D\u300C\u76EE\u6807\u5FC5\u987B\u662F\u9996\u9009\u300D\u3002
 *
 * @param {number} rootPc
 * @param {string} qualityId
 * @param {object} [opts] { maxFret, maxSpan, limit, minSounding, maxSounding, tuning }
 *   limit\uFF1A\u6700\u591A\u8FD4\u56DE\u591A\u5C11\u4E2A\u6392\u5E03\u3002**\u4F20 Infinity \u8868\u793A\u4E0D\u9650**\uFF08\u679A\u4E3E\u5168\u90E8\uFF09\u3002
 *          \u6CE8\u610F\u5B83\u662F\u300C\u6BCF\u4E2A (root, quality) \u7EC4\u5408\u300D\u7684\u4E0A\u9650\uFF0C\u4E0D\u662F\u5168\u5C40\u4E0A\u9650\u3002
 *          \u66FE\u7ECF\u751F\u4EA7\u9898\u6C60\u4F20\u4E86 160\uFF0C\u628A 11 \u4E2A\u4E03\u548C\u5F26\u7EC4\u5408\u622A\u65AD\u3001\u5171\u4E22 730 \u4E2A\u5408\u6CD5\u6392\u5E03\uFF0C
 *          \u800C\u4E14\u4E22\u7684\u662F\u904D\u5386\u987A\u5E8F\u9760\u540E\u7684\u4E00\u6279\uFF08\u504F\u5411\u516D\u5F26\u5168\u54CD\uFF09\uFF0C\u6240\u4EE5\u9ED8\u8BA4\u503C\u6539\u6210\u4E86 Infinity\u3002
 * @returns {Array<{frets:number[], arrangement:string, lowestPc:number, inverted:boolean, soundingCount:number, span:number}>}
 */
function enumerateVoicings(rootPc, qualityId, opts) {
  const q = qualityById(qualityId);
  if (!q) return [];
  const o = opts || {};
  const tuning = o.tuning || STANDARD_TUNING;
  const maxFret = clampInt(o.maxFret, 1, MAX_FRET, 12);
  const maxSpan = clampInt(o.maxSpan, 0, 12, 4);
  /* Infinity \u5355\u72EC\u653E\u884C\uFF1AclampInt \u4F1A\u628A Infinity \u5939\u6210\u4E0A\u9650\u503C\uFF0C
     \u90A3\u6837\u300C\u4E0D\u9650\u300D\u5C31\u53D8\u6210\u4E86\u300C\u6700\u591A 5000 \u4E2A\u300D\uFF0C\u4ECD\u662F\u9759\u9ED8\u622A\u65AD\u3002 */
  const limit = o.limit === Infinity
    ? Infinity
    : clampInt(o.limit, 1, 100000, Infinity);
  const minSounding = clampInt(o.minSounding, 3, 6, 3);
  const maxSounding = clampInt(o.maxSounding, 3, 6, 6);

  const formula = q.pcs.map((p) => pc(rootPc + p));
  const formulaSet = new Set(formula);

  /* \u6BCF\u6839\u5F26\u7684\u5019\u9009\uFF1A\u95F7\u97F3 + \u7A97\u53E3\u5185\u6BCF\u4E2A\u53EF\u8FBE\u97F3\u7EA7\u7684\u6700\u4F4E\u683C\uFF08\u7A97\u53E3\u7531 min/maxSpan \u51B3\u5B9A\uFF09 */
  const out = [];
  const frets = [-1, -1, -1, -1, -1, -1];

  const evaluate = () => {
    const sound = soundingNotes(frets, tuning);
    if (!sound.notes.length) return null;
    const pcs = new Set(sound.pcs);
    /* \u5FC5\u987B\u65E0\u51B2\u7A81\u97F3\uFF0C\u4E14\u516C\u5F0F\u97F3\u7EA7\u81F3\u5C11\u8986\u76D6 3 \u4E2A */
    if (pcs.size < 3) return null;
    for (const p of sound.pcs) if (!formulaSet.has(p)) return null;
    if (sound.notes.length < minSounding || sound.notes.length > maxSounding) return null;

    /* \u53D1\u58F0\u533A\u4E0D\u80FD\u6709\u5185\u90E8\u7A7A\u6D1E */
    let first = -1;
    let last = -1;
    for (let i = 0; i < 6; i++) {
      if (frets[i] >= 0) { if (first < 0) first = i; last = i; }
    }
    for (let i = first; i <= last; i++) if (frets[i] < 0) return null;

    /* \u6309\u54C1\u8DE8\u5EA6 */
    let minF = Infinity;
    let maxF = -1;
    frets.forEach((f) => { if (f > 0) { if (f < minF) minF = f; if (f > maxF) maxF = f; } });
    const span = maxF >= 0 ? maxF - minF : 0;
    if (span > maxSpan) return null;

    return {
      frets: frets.slice(),
      arrangement: formatArrangement(frets),
      lowestPc: sound.lowest ? sound.lowest.pc : null,
      inverted: sound.lowest ? sound.lowest.pc !== pc(rootPc) : false,
      soundingCount: sound.notes.length,
      span: span,
    };
  };

  /* \u9010\u5F26\u7A77\u4E3E\uFF08\u6BCF\u5F26\u5019\u9009 \u2264 maxFret+1 \u4E2A\uFF0C6 \u5F26\u6700\u591A 7^6 = 117649\uFF0C\u52A0\u526A\u679D\u53EF\u63A7\uFF09 */
  const perString = [];
  for (let i = 0; i < 6; i++) {
    const list = [{ fret: -1 }];
    const seen = new Set();
    for (let f = 0; f <= maxFret; f++) {
      const p = pc(tuning[i] + f);
      if (!formulaSet.has(p)) continue;
      if (seen.has(p)) continue;       // \u540C\u4E00\u5F26\u540C\u4E00\u97F3\u7EA7\u53EA\u53D6\u6700\u4F4E\u683C\uFF0C\u907F\u514D\u5927\u91CF\u540C\u8D28\u6392\u5E03
      seen.add(p);
      list.push({ fret: f });
    }
    perString.push(list);
  }

  const rec = (i) => {
    if (out.length >= limit) return;
    if (i === 6) {
      const v = evaluate();
      if (v) out.push(v);
      return;
    }
    for (const opt of perString[i]) {
      frets[i] = opt.fret;
      rec(i + 1);
      if (out.length >= limit) return;
    }
    frets[i] = -1;
  };
  rec(0);
  return out;
}

/**
 * \u51FA\u9898\u53EF\u7528\u7684\u6392\u5E03\uFF1A\u5728 enumerateVoicings \u7684\u57FA\u7840\u4E0A\u518D\u8FC7\u4E00\u9053
 * \u300C\u76EE\u6807\u548C\u5F26\u5FC5\u987B\u662F\u5206\u6790\u5668\u7684\u9996\u9009\uFF08\u5E72\u51C0\u5019\u9009\u91CC\u7684\u7B2C\u4E00\u540D\uFF09\u300D\u3002
 *
 * \u4E3A\u4EC0\u4E48\u5FC5\u987B\u8FC7\u6EE4\uFF1A\u5982\u679C\u76EE\u6807\u53EA\u662F\u6B21\u9009\uFF0C\u540C\u4E00\u9053\u9898\u5C31\u4F1A\u6709\u4E24\u4E2A\u90FD\u8BF4\u5F97\u901A\u7684\u7B54\u6848\uFF0C
 * \u5355\u9009\u5224\u5B9A\u5FC5\u7136\u51A4\u6789\u7528\u6237\u3002
 *
 * opts.inPlaceOnly\uFF1A\u53EA\u4FDD\u7559\u539F\u4F4D\u6392\u5E03\uFF08\u6700\u4F4E\u97F3\u662F\u6839\u97F3\uFF09\u3002
 *   - \u9009\u62E9\u9898\uFF08choice\uFF09\u5FC5\u987B\u4E3A true\uFF1A\u9009\u62E9\u9898\u65E0\u6CD5\u8868\u8FBE C/E \u8FD9\u6837\u7684\u8F6C\u4F4D\uFF0C
 *     \u800C strict \u5224\u5B9A\u8981\u6C42\u300C\u6CA1\u5199\u4F4E\u97F3 = \u539F\u4F4D\u300D\uFF0C\u8F6C\u4F4D\u6392\u5E03\u4F1A\u628A\u552F\u4E00\u7B54\u6848\u5224\u6210 wrongInversion\u3002
 *   - \u81EA\u7531\u8F93\u5165\uFF08input\uFF09+ strict \u53EF\u4EE5\u4E3A false\uFF1A\u7528\u6237\u80FD\u5199 C/E\uFF0C\u8F6C\u4F4D\u6392\u5E03\u4E5F\u80FD\u6B63\u786E\u8868\u8FBE\u3002
 *   - loose \u6052\u4E3A false\uFF1Aloose \u4E0D\u770B\u4F4E\u97F3\u3002
 */
function eligibleVoicings(rootPc, qualityId, opts) {
  const o = opts || {};
  const inPlaceOnly = o.inPlaceOnly === true;
  const all = enumerateVoicings(rootPc, qualityId, o);
  const out = [];
  for (const v of all) {
    if (inPlaceOnly && v.inverted) continue;
    const a = analyzeArrangement(v.arrangement, o);
    if (!a.ok || !a.candidates.length) continue;
    const clean = a.candidates.filter((c) => c.extra.length === 0);
    if (!clean.length) continue;
    const top = clean[0];
    if (top.rootPc !== pc(rootPc) || top.qualityId !== qualityId) continue;
    out.push(v);
  }
  return out;
}

/* ---------------------------------------------------------------
 *  \u5224\u5206
 *
 *  \u9519\u8BEF\u5206\u7C7B\uFF0814 \u9879\uFF0C\u7A33\u5B9A\u6807\u8BC6\uFF0C\u8FDB\u5386\u53F2\u4E0E\u7EDF\u8BA1\uFF09\uFF1A
 *    noSound / tooFewTones / missingRoot / missingThird / missingSeventh /
 *    missingSus / extraConflict / wrongRoot / wrongQuality / wrongInversion /
 *    wrongBassOnly / unparsableName / ambiguousSkipped / skipped
 * --------------------------------------------------------------- */

const ERROR_CODES = [
  'noSound', 'tooFewTones',
  'missingRoot', 'missingThird', 'missingSeventh', 'missingSus',
  'extraConflict',
  'wrongRoot', 'wrongQuality', 'wrongInversion', 'wrongBassOnly',
  'unparsableName', 'ambiguousSkipped', 'skipped',
];

/** \u7EDF\u8BA1\u5206\u7EC4\uFF1A\u97F3\u7EA7\u96C6\u5408\u9519 vs \u6392\u5E03/\u8F6C\u4F4D\u9519\u3002
 *  noSound \u4E0D\u5F52\u5165\u4EFB\u4F55\u4E00\u7C7B\uFF08\u5B83\u662F\u300C\u5B8C\u5168\u6CA1\u5165\u624B\u300D\uFF0C\u4E0D\u662F\u7406\u8BBA\u9519\uFF09\u3002 */
const ERROR_GROUPS = {
  pitchSet: ['tooFewTones', 'missingRoot', 'missingThird', 'missingSeventh', 'missingSus', 'extraConflict', 'wrongRoot', 'wrongQuality'],
  layout: ['wrongInversion', 'wrongBassOnly'],
  neutral: ['noSound', 'unparsableName', 'ambiguousSkipped', 'skipped'],
};

const MIN_DISTINCT_PCS = 3;

function targetOf(target) {
  if (!target) return null;
  const rootPc = target.rootPc != null ? pc(target.rootPc) : (target.root != null ? pc(target.root) : null);
  const qualityId = target.qualityId || target.quality || null;
  if (rootPc == null || !qualityById(qualityId)) return null;
  return { rootPc: rootPc, qualityId: qualityId };
}

/**
 * \u300C\u540D\u79F0 \u2192 \u6307\u677F\u300D\u5224\u5206\u3002
 * @param {*} arrangement \u516D\u5F26\u6392\u5E03
 * @param {{rootPc:number, qualityId:string}} target \u76EE\u6807\u548C\u5F26
 * @param {'strict'|'standard'|'loose'} width \u5224\u5B9A\u5BBD\u5EA6
 * @param {object} [opts] { tuning }
 */
function judgeBuild(arrangement, target, width, opts) {
  const t = targetOf(target);
  const w = width === 'strict' || width === 'loose' ? width : 'standard';
  const base = {
    width: w, errors: [], missing: [], extra: [], missingRequired: [],
    distinctPcs: 0, playedPcs: [], lowestPc: null, inversion: null,
  };
  if (!t) return Object.assign({}, base, { ok: false, reason: 'badTarget' });

  const info = analyzeArrangement(arrangement, opts);
  if (!info.ok) return Object.assign({}, base, { ok: false, reason: info.reason });

  const q = qualityById(t.qualityId);
  const formula = q.pcs.map((p) => pc(t.rootPc + p));
  const formulaSet = new Set(formula);
  const requiredAbs = q.required.map((p) => pc(t.rootPc + p));
  const omittableAbs = q.omittable.map((p) => pc(t.rootPc + p));
  const played = info.pcs;
  const playedSet = new Set(played);

  const errors = [];
  const missing = formula.filter((p) => !playedSet.has(p));
  const extra = played.filter((p) => !formulaSet.has(p));
  const missingRequired = requiredAbs.filter((p) => !playedSet.has(p));

  const distinctPcs = played.length;
  const lowestPc = info.lowestPc;
  const inversion = lowestPc != null && lowestPc !== t.rootPc ? lowestPc : null;

  const out = Object.assign({}, base, {
    ok: false,
    errors: errors,
    missing: missing,
    extra: extra,
    missingRequired: missingRequired,
    distinctPcs: distinctPcs,
    playedPcs: played,
    lowestPc: lowestPc,
    inversion: inversion,
    target: { rootPc: t.rootPc, qualityId: t.qualityId },
  });

  /* 1) \u5B8C\u5168\u6CA1\u53D1\u58F0 */
  if (!info.notes.length) {
    errors.push('noSound');
    return out;
  }

  /* 2) \u4E0D\u540C\u97F3\u7EA7\u4E0D\u591F */
  if (distinctPcs < MIN_DISTINCT_PCS) {
    errors.push('tooFewTones');
    return out;
  }

  /* 3) \u51B2\u7A81\u97F3 */
  if (extra.length) errors.push('extraConflict');

  /* 4) \u7F3A\u5FC5\u8981\u97F3\uFF1A\u6309\u300C\u7F3A\u7684\u662F\u54EA\u4E2A\u529F\u80FD\u300D\u5206\u7C7B\uFF0C\u65B9\u4FBF\u53CD\u9988\u76F4\u63A5\u8BF4\u4EBA\u8BDD */
  if (missingRequired.length) {
    const has = (p) => missingRequired.includes(pc(t.rootPc + p));
    if (has(0)) errors.push('missingRoot');
    if (q.id === 'sus2' || q.id === 'sus4') {
      if (has(q.id === 'sus2' ? 2 : 5)) errors.push('missingSus');
    } else if (has(3) || has(4)) {
      errors.push('missingThird');
    }
    if (has(10) || has(11)) errors.push('missingSeventh');
    /* \u7F3A\u7684\u662F\u53EF\u7701\u7565\u97F3\uFF08\u5982\u4E94\u97F3\uFF09\u65F6\u4E0D\u6253\u5177\u4F53\u7801\uFF1A
       \u53CD\u9988\u91CC\u7528 missing \u6570\u7EC4\u8BF4\u660E\uFF0C\u7EDF\u8BA1\u91CC\u4E0D\u8BA1\u5165\u5177\u4F53\u9519\u8BEF\u7C7B\u578B\u3002 */
  }

  /* 5) \u6309\u5BBD\u5EA6\u7ED9\u7ED3\u8BBA */
  if (w === 'strict') {
    /* \u4E25\u683C\uFF1A\u516C\u5F0F\u91CC\u6240\u6709\u97F3\u90FD\u8981\u6709\uFF0C\u4E14\u4E0D\u80FD\u6709\u516C\u5F0F\u5916\u7684\u97F3 */
    out.ok = extra.length === 0 && missing.length === 0;
  } else if (w === 'standard') {
    /* \u6807\u51C6\uFF1A\u5FC5\u8981\u97F3\u9F50\u5168\u3001\u65E0\u51B2\u7A81\u97F3\uFF1B\u53EF\u7701\u7565\u97F3\u5141\u8BB8\u7F3A */
    out.ok = extra.length === 0 && missingRequired.length === 0;
  } else {
    /* \u5BBD\u677E\uFF1A\u53EA\u8981\u6240\u6709\u53D1\u58F0\u90FD\u5728\u516C\u5F0F\u5185\uFF0C\u7F3A\u4EC0\u4E48\u5728\u53CD\u9988\u91CC\u8BF4 */
    out.ok = extra.length === 0;
  }

  if (out.ok) out.errors = [];
  return out;
}

/**
 * \u751F\u6210\u300C\u6307\u677F \u2192 \u540D\u79F0\u300D\u9009\u62E9\u9898\u3002
 *
 * \u9898\u76EE\u6392\u5E03\u4ECE\u300C\u5408\u6CD5\u6392\u5E03\u6C60\u300D\u91CC\u6311\uFF0C\u800C\u4E0D\u662F\u53EA\u7528\u53C2\u8003\u6392\u5E03 \u2014\u2014
 * \u771F\u5B9E\u5409\u4ED6\u7EC3\u4E60\u91CC\u540C\u4E00\u548C\u5F26\u6709\u5927\u91CF\u6307\u578B\uFF080\u20135 \u54C1\u5185 C \u5927\u4E09\u5C31\u6709 225 \u4E2A\u5408\u6CD5\u6392\u5E03\uFF0C
 * \u5176\u4E2D 187 \u4E2A\u662F\u8F6C\u4F4D\uFF09\uFF0C\u53EA\u8003\u53C2\u8003\u6392\u5E03\u7B49\u4E8E\u53EA\u8003\u4E00\u4E2A\u6307\u578B\u3002
 *
 * \u9009\u9879\u89C4\u5219\uFF08\u5DF2\u786E\u8BA4\u89C4\u683C\uFF09\uFF1A
 *   - \u9009\u9879\u5168\u90E8\u6765\u81EA\u5206\u6790\u5668\u7684\u771F\u5B9E\u5019\u9009\uFF0C\u4E0D\u968F\u673A\u9020\u65E0\u5173\u548C\u5F26\u540D
 *   - \u6B63\u786E\u7B54\u6848 = \u65E0\u51B2\u7A81\u97F3\u7684\u5019\u9009\uFF08clean\uFF09\uFF1B\u6709\u591A\u4E2A\u65F6\u5141\u8BB8\u591A\u4E2A\u6B63\u786E\u7B54\u6848
 *   - \u5E72\u6270\u9879\u53EF\u4EE5\u5E26\u51B2\u7A81\u97F3 \u2014\u2014 \u90A3\u6B63\u662F\u300C\u770B\u8D77\u6765\u50CF\u4F46\u4E0D\u6210\u7ACB\u300D\u7684\u597D\u5E72\u6270\u9879
 *   - \u4E0D\u8DB3 minOptions \u65F6\u4E0D\u51D1\u6570\uFF08\u5B81\u53EF\u5C11\u7ED9\u51E0\u4E2A\u9009\u9879\uFF09
 *
 * @param {number[]} arrangement \u516D\u5F26\u6392\u5E03\uFF08-1 \u9759\u97F3 / 0 \u7A7A\u5F26 / 1..21 \u54C1\uFF09
 * @param {'strict'|'loose'} width \u8BC6\u522B\u5224\u5B9A\u5BBD\u5EA6
 * @param {object} [opts] { minOptions, maxOptions, flat, inputMode }
 *        inputMode = true \u65F6\u8868\u793A\u300C\u81EA\u7531\u8F93\u5165\u300D\u9898\uFF1A\u5141\u8BB8\u8F6C\u4F4D\u6392\u5E03\uFF0C\u7B54\u6848\u96C6\u91CC\u5E26 bassPc\uFF0C
 *        \u9009\u62E9\u9898\uFF08\u9ED8\u8BA4\uFF09\u5219\u6392\u9664\u8F6C\u4F4D\u3002
 */
function buildIdentificationQuestion(arrangement, width, opts) {
  const o = opts || {};
  const w = width === 'loose' ? 'loose' : 'strict';
  const inputMode = o.inputMode === true;
  const minOptions = Math.max(2, clampInt(o.minOptions, 2, 8, 4));
  const maxOptions = Math.max(minOptions, clampInt(o.maxOptions, 2, 8, 6));
  const flat = !!o.flat;

  const info = analyzeArrangement(arrangement, o);
  if (!info.ok) return { ok: false, reason: info.reason };
  if (!info.notes.length) return { ok: false, reason: 'noSound', info };

  const clean = info.candidates.filter((c) => c.extra.length === 0);
  if (!clean.length) return { ok: false, reason: 'noCleanCandidate', info };

  /* \u2014\u2014 \u6B63\u786E\u7B54\u6848\u96C6 \u2014\u2014
     strict\uFF1A\u8981\u6C42\u300C\u5C31\u662F\u5B83\u300D\u2014\u2014 \u53D6\u65E0\u51B2\u7A81\u4E14\u97F3\u7EA7\u5B8C\u6574\uFF08fullMatch\uFF09\u7684\u5019\u9009\uFF1B
             \u82E5\u4E00\u4E2A\u90FD\u6CA1\u6709\uFF08\u4F8B\u5982\u7F3A\u4E94\u97F3\u7684\u6392\u5E03\uFF09\uFF0C\u9000\u56DE\u6240\u6709\u5E72\u51C0\u5019\u9009\u3002
     loose \uFF1A\u4EFB\u4F55\u65E0\u51B2\u7A81\u5019\u9009\u90FD\u7B97\u5BF9\uFF08\u5141\u8BB8\u7701\u7565\u97F3\uFF09\u3002
     \u591A\u4E2A\u540C\u5206\u5019\u9009 \u2192 \u5168\u90E8\u5217\u4E3A\u6B63\u786E\u7B54\u6848\uFF0C\u4E0D\u5F3A\u884C\u6307\u5B9A\u552F\u4E00\u3002

     \u26A0 strict \u7684\u300C\u4F4E\u97F3\u6761\u4EF6\u300D\u5728\u51FA\u9898\u65F6\u5C31\u8FC7\u6EE4\u6389\uFF0C\u800C\u4E0D\u662F\u7559\u5230\u5224\u5B9A\u65F6\uFF1A
       strict \u5224\u5B9A\u8981\u6C42\u300C\u7528\u6237\u6CA1\u5199\u4F4E\u97F3 = \u539F\u4F4D\u300D\uFF0C\u6240\u4EE5\u8F6C\u4F4D\u6392\u5E03\u5728 strict \u4E0B
       \u4E0D\u80FD\u628A\u6839\u97F3\u5217\u4E3A\u552F\u4E00\u7B54\u6848\uFF08\u7528\u6237\u6CA1\u6CD5\u5728\u9009\u62E9\u9898\u91CC\u8868\u8FBE /E\uFF09\u3002
       \u8F6C\u4F4D\u6392\u5E03\u5728 strict \u4E0B\u7528\u300C\u4F4E\u97F3\u97F3\u7EA7\u300D\u4F5C\u4E3A\u7B54\u6848\u7684\u989D\u5916\u9650\u5B9A\uFF1A
       \u82E5\u6700\u4F4E\u97F3\u4E0D\u662F\u6839\u97F3\uFF0Cstrict \u4E0B\u8BE5\u6392\u5E03\u53EA\u80FD\u7531\u300C\u5199\u660E\u4F4E\u97F3\u300D\u7684\u81EA\u7531\u8F93\u5165\u7B54\u5BF9\uFF0C
       \u56E0\u6B64\u9009\u62E9\u9898\u9636\u6BB5\u4E0D\u628A\u8F6C\u4F4D\u6392\u5E03\u7EB3\u5165 strict \u9898\u6C60 \u2014\u2014 \u7531 eligibleVoicings
       \u5728\u51FA\u9898\u524D\u7528 lowestIsRoot \u8FC7\u6EE4\u3002 */
  let answerCands;
  if (w === 'strict') {
    const full = clean.filter((c) => c.fullMatch);
    answerCands = full.length ? full : clean;
    /* strict \u5224\u5B9A\u8981\u6C42\u300C\u7528\u6237\u6CA1\u5199\u4F4E\u97F3 = \u6700\u4F4E\u97F3\u662F\u6839\u97F3\u300D\u3002
       - \u9009\u62E9\u9898\uFF1A\u65E0\u6CD5\u8868\u8FBE /E\uFF0C\u53EA\u80FD\u51FA\u539F\u4F4D\u6392\u5E03 \u2192 \u8FC7\u6EE4\u6389\u8F6C\u4F4D
       - \u81EA\u7531\u8F93\u5165\uFF1A\u7528\u6237\u80FD\u5199 C/E \u2192 \u4FDD\u7559\u8F6C\u4F4D\uFF0C\u7B54\u6848\u96C6\u91CC\u5E26 bassPc */
    if (!inputMode) {
      answerCands = answerCands.filter((c) => c.rootPc === info.lowestPc);
      if (!answerCands.length) return { ok: false, reason: 'inversionNotSelectable', info };
    }
  } else {
    answerCands = clean;
  }

  /* \u6B63\u786E\u7B54\u6848\u4E4B\u95F4\u5982\u679C\u53EA\u662F\u300C\u540C\u6839\u97F3\u540C\u8D28\u91CF\u4F46\u4F4E\u97F3\u4E0D\u540C\u300D\uFF0C\u5408\u5E76\u6210\u4E00\u4E2A\u9009\u9879 */
  const answerKeySet = new Set();
  const answers = [];
  answerCands.forEach((c) => {
    const k = c.rootPc + ':' + c.qualityId;
    if (answerKeySet.has(k)) return;
    answerKeySet.add(k);
    /* \u81EA\u7531\u8F93\u5165 + strict\uFF1A\u7B54\u6848\u91CC\u5E26\u4E0A\u5B9E\u9645\u6700\u4F4E\u97F3\uFF0C\u7528\u6237\u9700\u8981\u5199 C/E \u624D\u7B97\u5BF9 */
    const needBass = inputMode && w === 'strict' && !c.lowestIsRoot;
    answers.push({
      rootPc: c.rootPc,
      qualityId: c.qualityId,
      name: formatChordName(c.rootPc, c.qualityId, { flat: flat, bassPc: needBass ? info.lowestPc : null }),
      bassPc: needBass ? info.lowestPc : null,
    });
  });

  /* \u2014\u2014 \u5E72\u6270\u9879 \u2014\u2014
     \u4F18\u5148\u53D6\u300C\u5E72\u51C0\u4F46\u4E0D\u5165\u9009\u7B54\u6848\u300D\u7684\u5019\u9009\uFF0C\u4E0D\u591F\u518D\u7528\u5E26\u51B2\u7A81\u97F3\u7684\u5019\u9009\u3002
     \u4E24\u8005\u90FD\u6765\u81EA\u5206\u6790\u5668\u771F\u5B9E\u8F93\u51FA\u3002 */
  const distractors = [];
  const usedKeys = new Set(answerKeySet);
  const pushDistractor = (c) => {
    const k = c.rootPc + ':' + c.qualityId;
    if (usedKeys.has(k)) return;
    usedKeys.add(k);
    distractors.push({
      rootPc: c.rootPc,
      qualityId: c.qualityId,
      name: formatChordName(c.rootPc, c.qualityId, { flat: flat }),
      hasConflict: c.extra.length > 0,
    });
  };
  clean.forEach((c) => { if (distractors.length + answers.length < maxOptions) pushDistractor(c); });
  if (answers.length + distractors.length < minOptions) {
    /* \u5E72\u51C0\u5019\u9009\u4E0D\u591F\uFF1A\u7528\u5E26\u51B2\u7A81\u97F3\u7684\u5019\u9009\u8865\uFF08\u5B83\u4EEC\u4ECD\u662F\u5206\u6790\u5668\u7B97\u51FA\u6765\u7684\u771F\u5B9E\u89E3\u91CA\uFF09 */
    info.candidates.forEach((c) => {
      if (answers.length + distractors.length < minOptions) pushDistractor(c);
    });
  }

  const options = answers.map((a) => ({ rootPc: a.rootPc, qualityId: a.qualityId, name: a.name, correct: true }))
    .concat(distractors.slice(0, Math.max(0, maxOptions - answers.length))
      .map((d) => ({ rootPc: d.rootPc, qualityId: d.qualityId, name: d.name, correct: false })));

  /* \u9009\u9879\u987A\u5E8F\u56FA\u5B9A\u6253\u4E71\uFF08\u7528\u786E\u5B9A\u6027\u6D17\u724C\uFF0C\u907F\u514D\u540C\u4E00\u9898\u6BCF\u6B21\u5237\u65B0\u987A\u5E8F\u90FD\u4E0D\u540C\uFF09 */
  const seed = info.frets.reduce((s, f) => ((s * 31) + (f + 2)) % 1000003, 7);
  const shuffled = deterministicShuffle(options, seed);

  return {
    ok: true,
    arrangement: info.frets.slice(),
    arrangementText: formatArrangement(info.frets),
    pcs: info.pcs.slice(),
    lowestPc: info.lowestPc,
    inversion: info.lowestPc != null && !answers.some((a) => a.rootPc === info.lowestPc)
      ? info.lowestPc : null,
    width: w,
    options: shuffled,
    answers: answers,
    ambiguous: answers.length > 1,
    candidateCount: info.candidates.length,
    cleanCount: clean.length,
  };
}

/** \u786E\u5B9A\u6027\u6D17\u724C\uFF08\u540C\u4E00 seed \u6C38\u8FDC\u540C\u4E00\u7ED3\u679C\uFF0C\u4FBF\u4E8E\u6D4B\u8BD5\u4E0E\u590D\u76D8\uFF09 */
function deterministicShuffle(items, seed) {
  const arr = items.slice();
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr;
}

/**
 * \u300C\u6307\u677F \u2192 \u540D\u79F0\u300D\u5224\u5206\uFF08\u9636\u6BB5\u4E09\u7528\uFF0C\u8FD9\u91CC\u5148\u628A\u89C4\u5219\u5B9A\u6B7B\uFF0C\u907F\u514D\u4EE5\u540E\u53E6\u8D77\u4E00\u5957\uFF09\u3002
 * @param {*} arrangement \u9898\u76EE\u6392\u5E03
 * @param {{rootPc:number, qualityId:string, bassPc?:number|null}} answer \u7528\u6237\u7B54\u6848
 * @param {'strict'|'loose'} width \u8BC6\u522B\u5BBD\u5EA6
 */
function judgeIdentification(arrangement, answer, width, opts) {
  const w = width === 'loose' ? 'loose' : 'strict';
  const base = { width: w, errors: [], ok: false, candidates: [], ambiguous: false };
  const info = analyzeArrangement(arrangement, opts);
  if (!info.ok) return Object.assign({}, base, { reason: info.reason });
  if (!info.notes.length) {
    return Object.assign({}, base, { errors: ['noSound'], candidates: [], ambiguous: false });
  }

  const ansRoot = answer && answer.rootPc != null ? pc(answer.rootPc) : null;
  const ansQ = answer && (answer.qualityId || answer.quality) || null;
  if (ansRoot == null || !qualityById(ansQ)) {
    return Object.assign({}, base, { errors: ['unparsableName'], candidates: info.candidates, ambiguous: info.ambiguous });
  }

  const out = Object.assign({}, base, { candidates: info.candidates, ambiguous: info.ambiguous });

  /* \u53EA\u6709\u300C\u6CA1\u6709\u51B2\u7A81\u97F3\u300D\u7684\u5019\u9009\u624D\u7B97\u5BF9\u5F97\u4E0A\u7684\u89E3\u91CA\u3002
     \u8FD9\u4E00\u70B9\u4EE5\u524D\u6F0F\u4E86\uFF1A\u76F4\u63A5\u62FF candidates[0] \u6BD4\u5BF9\u6839\u97F3/\u8D28\u91CF/\u4F4E\u97F3\uFF0C
     \u53EF\u662F\u6392\u5E03\u91CC\u82E5\u542B\u6709\u516C\u5F0F\u5916\u7684\u97F3\uFF0Ccandidates[0] \u672C\u8EAB\u5C31\u5E26\u7740 extra \u2014\u2014
     \u4E8E\u662F\u300C\u6839\u672C\u4E0D\u662F\u8FD9\u4E2A\u548C\u5F26\u7684\u6392\u5E03\u300D\u4E5F\u4F1A\u88AB\u5224\u5BF9
     \uFF08\u5B9E\u6D4B 0\u20135 \u54C1\u5168\u57DF\u626B\u63CF 117649 \u79CD\u6392\u5E03\u91CC 44200 \u4F8B\u8BEF\u5224\uFF09\u3002
     \u5224\u5B9A\u5FC5\u987B\u4EE5\u300C\u5E72\u51C0\u5019\u9009\u300D\u4E3A\u51C6\uFF0C\u800C\u4E0D\u662F\u300C\u5206\u6570\u6700\u9AD8\u7684\u90A3\u4E2A\u300D\u3002 */
  const clean = info.candidates.filter((c) => c.extra.length === 0);
  const ansCand = clean.find((c) => c.rootPc === ansRoot && c.qualityId === ansQ) || null;

  /* \u6574\u4E2A\u6392\u5E03\u8FDE\u4E00\u4E2A\u5E72\u51C0\u89E3\u91CA\u90FD\u6CA1\u6709\uFF1A\u5B83\u4E0D\u6784\u6210\u4EFB\u4F55\u548C\u5F26\uFF0C\u7B54\u6848\u65E0\u4ECE\u5BF9\u4E0A */
  if (!clean.length) {
    out.errors.push('extraConflict');
    return out;
  }

  if (w === 'strict') {
    /* \u4E25\u683C\u8BC6\u522B = \u8FD9\u4E2A\u6392\u5E03\u300C\u5C31\u662F\u300D\u7528\u6237\u7B54\u7684\u90A3\u4E2A\u548C\u5F26\u3002
     *
     * \u26A0 \u5224\u5B9A\u6807\u51C6\u5FC5\u987B\u4E0E buildIdentificationQuestion() \u7684\u7B54\u6848\u96C6\u5B8C\u5168\u4E00\u81F4\uFF0C
     *   \u5426\u5219\u4F1A\u51FA\u73B0\u300C\u9009\u9879\u91CC\u6807\u7EFF\u3001\u70B9\u4E0B\u53BB\u5374\u5224\u9519\u300D\u8FD9\u79CD\u81EA\u76F8\u77DB\u76FE\u7684\u754C\u9762
     *   \uFF08\u5B9E\u6D4B\u8E29\u5230\uFF1AAm7 \u7684\u6392\u5E03\u7701\u7565\u4E94\u97F3\uFF0C\u51FA\u9898\u5668\u628A\u5B83\u5217\u4E3A\u7B54\u6848\uFF0C
     *    \u4F46\u65E7\u5224\u5B9A\u8981\u6C42 fullMatch\uFF0C\u4E8E\u662F\u540C\u4E00\u9053\u9898\u65E2\u6807\u5BF9\u53C8\u5224\u9519\uFF09\u3002
     *
     * \u89C4\u5219\uFF1A
     *   - \u5FC5\u987B\u662F\u5E72\u51C0\u5019\u9009\uFF08\u97F3\u7EA7\u5168\u5728\u516C\u5F0F\u5185\uFF09
     *   - \u5FC5\u987B\u51FA\u73B0\u5728\u300C\u4E25\u683C\u7B54\u6848\u96C6\u300D\u91CC \u2014\u2014 \u5373 fullMatch \u4F18\u5148\uFF0C\u6CA1\u6709 fullMatch
     *     \u65F6\u9000\u56DE\u6240\u6709\u5E72\u51C0\u5019\u9009\uFF08\u4E0E\u51FA\u9898\u5668\u540C\u4E00\u53E3\u5F84\uFF09
     *   - \u4F4E\u97F3\u6761\u4EF6\uFF1A\u7528\u6237\u5199\u4E86\u4F4E\u97F3\u5C31\u5FC5\u987B\u7B49\u4E8E\u5B9E\u9645\u6700\u4F4E\u97F3\uFF1B\u6CA1\u5199\u5C31\u8981\u6C42\u539F\u4F4D */
    if (!ansCand) {
      const anySameQuality = clean.some((c) => c.qualityId === ansQ);
      out.errors.push(anySameQuality ? 'wrongRoot' : 'wrongQuality');
      return out;
    }
    const strictAnswers = (() => {
      const full = clean.filter((c) => c.fullMatch);
      return full.length ? full : clean;
    })();
    if (!strictAnswers.includes(ansCand)) {
      out.errors.push('wrongQuality');
      return out;
    }
    const bassOk = (answer.bassPc == null)
      ? ansCand.lowestIsRoot
      : pc(answer.bassPc) === info.lowestPc;
    if (!bassOk) {
      out.errors.push(answer.bassPc == null ? 'wrongInversion' : 'wrongBassOnly');
      return out;
    }
    out.ok = true;
    return out;
  }

  /* \u5BBD\u677E\u8BC6\u522B = \u7528\u6237\u7B54\u7684\u548C\u5F26\u662F\u8FD9\u4E2A\u6392\u5E03\u7684\u5408\u6CD5\u89E3\u91CA\u4E4B\u4E00\uFF08\u5141\u8BB8\u7701\u7565\u97F3\u3001\u4E0D\u770B\u4F4E\u97F3\uFF09 */
  if (ansCand) { out.ok = true; return out; }
  const anySameQuality = clean.some((c) => c.qualityId === ansQ);
  out.errors.push(anySameQuality ? 'wrongRoot' : 'wrongQuality');
  return out;
}

/* ---------------------------------------------------------------
 *  \u7EDF\u8BA1\u53E3\u5F84\uFF08\u7EAF\u51FD\u6570\uFF0C\u4F9B\u754C\u9762\u548C\u6D4B\u8BD5\u5171\u7528\uFF0C\u907F\u514D\u4E24\u5904\u5404\u7B97\u4E00\u904D\uFF09
 *
 *  \u89C4\u5219\uFF1A
 *    - ok === null\uFF08\u8DF3\u9898 / \u6B67\u4E49\u8DF3\u8FC7\uFF09\u4E0D\u8FDB\u666E\u901A\u6B63\u786E\u7387\u5206\u6BCD\uFF0C\u5355\u72EC\u8BA1\u6570
 *    - \u8D85\u65F6\u7B54\u5BF9\u8FDB\u6B63\u786E\u7387\uFF0C\u4F46\u4E0D\u8FDB\u5E73\u5747\u53CD\u5E94\u65F6\u95F4\uFF08ms \u4E3A null\uFF09
 *    - ms \u4E3A null \u7684\u6837\u672C\u4E00\u5F8B\u4E0D\u8FDB\u5E73\u5747\u53CD\u5E94\u65F6\u95F4
 * --------------------------------------------------------------- */
function summarizeHistory(records) {
  const list = Array.isArray(records) ? records : [];
  let judged = 0;      // \u8FDB\u5165\u6B63\u786E\u7387\u5206\u6BCD\u7684\u6761\u6570
  let correct = 0;
  let skipped = 0;
  let ambigSkipped = 0;
  let timedOut = 0;
  let timedOutCorrect = 0;
  let msSum = 0;
  let msCount = 0;

  list.forEach((r) => {
    if (!r) return;
    if (r.ok === null) {
      if (r.ambigSkipped) ambigSkipped++; else skipped++;
      return;
    }
    judged++;
    if (r.ok) correct++;
    if (r.timedOut) {
      timedOut++;
      if (r.ok) timedOutCorrect++;
    }
    if (typeof r.ms === 'number' && isFinite(r.ms) && !r.timedOut) {
      msSum += r.ms;
      msCount++;
    }
  });

  return {
    total: list.length,
    judged: judged,
    correct: correct,
    accuracy: judged ? correct / judged : null,
    skipped: skipped,
    ambigSkipped: ambigSkipped,
    timedOut: timedOut,
    timedOutCorrect: timedOutCorrect,
    avgMs: msCount ? msSum / msCount : null,
    msSamples: msCount,
  };
}

/* \u5BFC\u51FA\u8868 */
global.ChordTheory = {
  pc: pc,
  pcName: pcName,
  qualityById: qualityById,
  parseChordName: parseChordName,
  formatChordName: formatChordName,
  stateOf: stateOf,
  formatArrangement: formatArrangement,
  parseArrangement: parseArrangement,
  normalizeArrangement: normalizeArrangement,
  soundingNotes: soundingNotes,
  analyzeArrangement: analyzeArrangement,
  referenceVoicing: referenceVoicing,
  feasibleInRange: feasibleInRange,
  enumerateVoicings: enumerateVoicings,
  eligibleVoicings: eligibleVoicings,
  judgeBuild: judgeBuild,
  buildIdentificationQuestion: buildIdentificationQuestion,
  judgeIdentification: judgeIdentification,
  summarizeHistory: summarizeHistory,
  PC_NAMES_SHARP: PC_NAMES_SHARP,
  PC_NAMES_FLAT: PC_NAMES_FLAT,
  STANDARD_TUNING: STANDARD_TUNING,
  MAX_FRET: MAX_FRET,
  CHORD_RANGE_OPTIONS: CHORD_RANGE_OPTIONS,
  REF_VOICING_VERSION: REF_VOICING_VERSION,
  QUALITY_CATALOG: QUALITY_CATALOG,
  DEFAULT_POOL_QUALITIES: DEFAULT_POOL_QUALITIES,
  QUALITY_IDS: QUALITY_IDS,
  ERROR_CODES: ERROR_CODES,
  ERROR_GROUPS: ERROR_GROUPS,
  MIN_DISTINCT_PCS: MIN_DISTINCT_PCS
};
})(typeof window !== "undefined" ? window : this);
