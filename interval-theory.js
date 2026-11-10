/* \u81EA\u52A8\u751F\u6210\uFF1A\u7531 interval-theory.mjs \u8F6C\u6362\u800C\u6765\uFF08\u53BB\u6389 export\uFF0C\u6302\u5230 window.IntervalTheory\uFF09\u3002
   \u8FD9\u4E2A\u6587\u4EF6\u4E0D\u8981\u624B\u6539 \u2014\u2014 \u6539 interval-theory.mjs \u540E\u8DD1 node build.mjs\u3002
   \u8F6C\u6362\u65F6\u975E ASCII \u5B57\u7B26\u5DF2\u5168\u90E8\u8F6C\u6210 \uXXXX\uFF0C\u4EFB\u4F55\u7F16\u7801\u4E0B\u6253\u5F00\u90FD\u4E0D\u4F1A\u4E71\u7801\u3002 */
(function (global) {
'use strict';
/* =========================================================================
 *  \u97F3\u7A0B\u6A21\u5F0F\uFF1A\u7EAF\u903B\u8F91\u5C42\uFF08\u96F6 DOM\uFF0C\u53EF\u88AB node \u76F4\u63A5 import \u6D4B\u8BD5\uFF09
 *
 *  \u89C4\u683C\u6765\u6E90\uFF1AINTERVAL-MODE-PLAN.md v11\uFF08D1\u2013D50 \u5168\u90E8\u5B9A\u6848\uFF09\u3002
 *  \u672C\u6587\u4EF6\u53EA\u505A\u300C\u4F4D\u7F6E \u2194 \u97F3\u9AD8 \u2194 \u97F3\u7A0B\u300D\u7684\u786E\u5B9A\u6027\u8BA1\u7B97\uFF0C\u4E0D\u542B\u4EFB\u4F55\u754C\u9762\u72B6\u6001\u3002
 *
 *  \u26A0 \u6784\u5EFA\u7EA6\u675F\uFF08\u89C1 build.mjs\uFF09\uFF1A
 *    \u53EA\u5141\u8BB8 `export function name(` \u548C `export const NAME` \u4E24\u79CD\u5BFC\u51FA\u5F62\u5F0F\uFF0C
 *    \u4E14\u5FC5\u987B\u9876\u683C\u4E66\u5199\u3002\u5176\u4ED6\u5F62\u5F0F\u4F1A\u8BA9 build.mjs \u629B\u9519\u3002
 * ========================================================================= */

/* ---------------------------------------------------------------
 *  1. \u57FA\u7840\u5E38\u91CF
 * --------------------------------------------------------------- */

/* \u6807\u51C6\u8C03\u5F26\uFF1A6 \u5F26 \u2192 1 \u5F26\u7684 MIDI\uFF08E2 A2 D3 G3 B3 E4\uFF09 */
const STRING_MIDI = { 6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64 };

/* \u5F26\u53F7\u4ECE\u7C97\u5230\u7EC6\uFF0C\u4E0E\u73B0\u6709\u7A0B\u5E8F\u7684\u904D\u5386\u987A\u5E8F\u4E00\u81F4\uFF086\u21921\uFF09\u3002
   \u00A74.5 \u7684 tie-breaker \u8981\u6C42\u300C\u5F26\u53F7 6\u21921\u300D\uFF0C\u76F4\u63A5\u590D\u7528\u8FD9\u4E2A\u987A\u5E8F\u3002 */
const STRING_ORDER = [6, 5, 4, 3, 2, 1];

/* \u6307\u677F\u7269\u7406\u4E0A\u9650\uFF08\u4E0E board.svg \u4E00\u81F4\uFF09 */
const MAX_FRET = 21;

/* \u4E00\u8F6E\u5185\u8FD1\u671F\u7A97\u53E3\uFF08\u4E0E\u73B0\u6709 RECENT_WINDOW \u4E00\u81F4\uFF09 */
const RECENT_WINDOW = 8;

/* \u5C0F\u6837\u672C\u5148\u9A8C\u6536\u7F29\u5F3A\u5EA6\uFF08D47/D48\uFF1Ak=3\uFF0C\u5199\u6B7B\uFF0C\u4E0D\u63D0\u4F9B\u8BBE\u7F6E\u9879\uFF09 */
const SHRINK_K = 3;

/* \u65B0\u5361\u7247\u521D\u59CB\u6743\u91CD\uFF08\u4E0E\u73B0\u6709 NEW_POSITION_WEIGHT \u4E00\u81F4\uFF09 */
const NEW_CARD_WEIGHT = 3;

/* ---------------------------------------------------------------
 *  2. \u97F3\u7A0B\u76EE\u5F55\uFF0813 \u6761\uFF0C\u00A76.2\uFF09
 *
 *  dir: true  = \u6709\u4E0A\u4E0B\u884C\u4E4B\u5206\uFF0812 \u6761\uFF09
 *  dir: false = \u65E0\u65B9\u5411\uFF08\u4EC5\u7EAF\u4E00\u5EA6\uFF09
 * --------------------------------------------------------------- */

const INTERVALS = [
  { id: 'unison', name: '\u7EAF\u4E00\u5EA6', semi: 0, degree: 1, quality: 'perfect', hasDir: false },
  { id: 'm2', name: '\u5C0F\u4E8C\u5EA6', semi: 1, degree: 2, quality: 'minor', hasDir: true },
  { id: 'M2', name: '\u5927\u4E8C\u5EA6', semi: 2, degree: 2, quality: 'major', hasDir: true },
  { id: 'm3', name: '\u5C0F\u4E09\u5EA6', semi: 3, degree: 3, quality: 'minor', hasDir: true },
  { id: 'M3', name: '\u5927\u4E09\u5EA6', semi: 4, degree: 3, quality: 'major', hasDir: true },
  { id: 'P4', name: '\u7EAF\u56DB\u5EA6', semi: 5, degree: 4, quality: 'perfect', hasDir: true },
  { id: 'TT', name: '\u4E09\u5168\u97F3', semi: 6, degree: 4, quality: 'tritone', hasDir: true },
  { id: 'P5', name: '\u7EAF\u4E94\u5EA6', semi: 7, degree: 5, quality: 'perfect', hasDir: true },
  { id: 'm6', name: '\u5C0F\u516D\u5EA6', semi: 8, degree: 6, quality: 'minor', hasDir: true },
  { id: 'M6', name: '\u5927\u516D\u5EA6', semi: 9, degree: 6, quality: 'major', hasDir: true },
  { id: 'm7', name: '\u5C0F\u4E03\u5EA6', semi: 10, degree: 7, quality: 'minor', hasDir: true },
  { id: 'M7', name: '\u5927\u4E03\u5EA6', semi: 11, degree: 7, quality: 'major', hasDir: true },
  { id: 'octave', name: '\u7EAF\u516B\u5EA6', semi: 12, degree: 8, quality: 'perfect', hasDir: true },
];

const INTERVAL_IDS = INTERVALS.map((x) => x.id);

/* \u57FA\u7840\u97F3\u7A0B\u9884\u8BBE\uFF08D17\uFF1A8 \u6761\uFF0C\u4E0D\u542B\u7EAF\u4E00\u5EA6\uFF09 */
const PRESET_BASIC = ['M3', 'm3', 'P5', 'P4', 'octave', 'M2', 'm7', 'M7'];

/* \u5168\u90E8\u97F3\u7A0B\u9884\u8BBE\uFF08\u73A9\u6CD5 A = 13 \u6761\uFF1B\u73A9\u6CD5 B \u8C03\u7528\u65F6\u4F1A\u88AB\u5254\u9664 unison\uFF09 */
const PRESET_ALL = INTERVAL_IDS.slice();

/* \u73A9\u6CD5 A \u9ED8\u8BA4\u96C6\u5408 = \u57FA\u7840 8 + \u7EAF\u4E00\u5EA6\uFF08\u00A76.2-4\uFF0C\u5171 9 \u6761\uFF09 */
const DEFAULT_A_SET = PRESET_BASIC.concat(['unison']);

/* \u73A9\u6CD5 B \u9ED8\u8BA4\u96C6\u5408 = \u57FA\u7840 8\uFF08\u7EAF\u4E00\u5EA6\u6C38\u4E45\u6392\u9664\uFF0CD18\uFF09 */
const DEFAULT_B_SET = PRESET_BASIC.slice();

const BY_ID = {};
INTERVALS.forEach((x) => { BY_ID[x.id] = x; });

/* ---------------------------------------------------------------
 *  3. \u97F3\u7A0B\u76EE\u5F55\u67E5\u8BE2
 * --------------------------------------------------------------- */

function intervalById(id) {
  return BY_ID[String(id || '')] || null;
}

function intervalName(id) {
  const it = intervalById(id);
  return it ? it.name : '';
}

/* \u534A\u97F3\u6570\uFF080\u201312\uFF09\u2192 \u97F3\u7A0B ID\uFF1B\u8D85\u51FA\u8303\u56F4\u8FD4\u56DE null */
function idOfSemitones(semi) {
  const n = Math.abs(Number(semi));
  for (let i = 0; i < INTERVALS.length; i++) {
    if (INTERVALS[i].semi === n) return INTERVALS[i].id;
  }
  return null;
}

/* \u97F3\u7A0B ID \u2192 \u534A\u97F3\u6570\uFF1B\u672A\u77E5\u8FD4\u56DE null */
function semitonesOf(id) {
  const it = intervalById(id);
  return it ? it.semi : null;
}

/* \u628A\u4EFB\u610F\u8F93\u5165\u6E05\u6D17\u6210\u5408\u6CD5\u7684\u542F\u7528\u96C6\u5408\uFF1A\u53BB\u91CD\u3001\u5254\u9664\u672A\u77E5 ID\u3001\u6309\u76EE\u5F55\u987A\u5E8F\u6392\u5E8F\u3002
   forPlayB=true \u65F6\u6C38\u4E45\u5254\u9664 unison\uFF08D18\uFF1AUI \u4E0D\u63D0\u4F9B\u3001\u81EA\u5B9A\u4E49\u4E5F\u52A0\u4E0D\u8FDB\uFF09\u3002 */
function normalizeSet(list, forPlayB) {
  const seen = {};
  (Array.isArray(list) ? list : []).forEach((id) => {
    if (BY_ID[id]) seen[id] = true;
  });
  if (forPlayB) delete seen.unison;
  return INTERVAL_IDS.filter((id) => seen[id]);
}

/* \u5019\u9009\u7B54\u6848\u6570 C\uFF08\u00A76.3-8\uFF09\uFF1A\u6709\u65B9\u5411\u7684\u97F3\u7A0B\u5404\u8D21\u732E\u4E0A\u884C/\u4E0B\u884C\u4E24\u4E2A\u7B54\u6848\uFF0C
   \u7EAF\u4E00\u5EA6\u53EA\u8D21\u732E\u4E00\u4E2A\u3002 */
function candidateCount(set) {
  let n = 0;
  normalizeSet(set, false).forEach((id) => {
    n += BY_ID[id].hasDir ? 2 : 1;
  });
  return n;
}

/* \u9009\u9879\u6570\u91CF\u63A7\u4EF6\u7684\u4E0A\u9650 = min(12, C)\uFF08\u00A76.3-8\uFF09 */
function maxOptionCount(set) {
  return Math.min(12, candidateCount(set));
}

/* ---------------------------------------------------------------
 *  4. \u4F4D\u7F6E \u2194 \u97F3\u9AD8
 * --------------------------------------------------------------- */

function midiAt(string, fret) {
  const base = STRING_MIDI[string];
  if (base === undefined) return null;
  return base + Number(fret);
}

function pitchClass(midi) {
  return ((Number(midi) % 12) + 12) % 12;
}

function sameCell(a, b) {
  return !!a && !!b && Number(a.s) === Number(b.s) && Number(a.f) === Number(b.f);
}

function cellKey(s, f) {
  return 's' + Number(s) + 'f' + Number(f);
}

/* ---------------------------------------------------------------
 *  5. \u97F3\u7A0B\u5173\u7CFB\uFF08\u00A73.3 / \u00A78\uFF09
 * --------------------------------------------------------------- */

/* \u4E24\u4E2A\u5B9E\u9645\u97F3\u9AD8\u4E4B\u95F4\u7684\u6709\u5411\u5173\u7CFB\u3002
   \u8FD4\u56DE { delta, abs, dir, id }\uFF1A
     delta \u6709\u7B26\u53F7\u534A\u97F3\u5DEE\uFF08target - start\uFF09
     dir   'up' | 'down' | 'none'\uFF08delta === 0\uFF09
     id    \u97F3\u7A0B ID\uFF1B|delta| > 12 \u65F6\u4E3A null\uFF08\u590D\u97F3\u7A0B\uFF0Cv1 \u4E0D\u652F\u6301\uFF09 */
function relationOf(startMidi, targetMidi) {
  const delta = Number(targetMidi) - Number(startMidi);
  const abs = Math.abs(delta);
  const dir = delta > 0 ? 'up' : (delta < 0 ? 'down' : 'none');
  return { delta: delta, abs: abs, dir: dir, id: idOfSemitones(abs) };
}

/* ---------------------------------------------------------------
 *  6. \u5F62\u72B6\u7EF4\u5EA6\uFF08\u00A712.3.1\uFF09
 *
 *  shape = 'd<\u5F26\u8DDD>g<\u662F\u5426\u8DE8 G-B>'\uFF0C\u4F8B\u5982 'd0g0'\uFF08\u540C\u5F26\uFF09\u3001'd1g1'\uFF08\u76F8\u90BB\u5F26\u4E14\u8DE8 G-B\uFF09\u3002
 *  G-B \u8FB9\u754C\uFF1A\u6807\u51C6\u8C03\u5F26\u91CC G(3)\u2192B(2) \u662F\u5927\u4E09\u5EA6\uFF0C\u5176\u4F59\u76F8\u90BB\u5F26\u662F\u7EAF\u56DB\u5EA6\u3002
 * --------------------------------------------------------------- */

function crossesGB(s1, s2) {
  const a = Number(s1);
  const b = Number(s2);
  if (a === b) return false;
  return Math.min(a, b) <= 2 && Math.max(a, b) >= 3;
}

function stringDistance(s1, s2) {
  return Math.abs(Number(s1) - Number(s2));
}

/* \u5F62\u72B6\u952E\u3002\u8FD4\u56DE null \u8868\u793A\u4E0D\u8BE5\u53C2\u4E0E shape \u5206\u7C7B\uFF08\u8DE8\u516B\u5EA6\u73A9\u6CD5 B\uFF09\u3002 */
function shapeOf(s1, s2) {
  return 'd' + stringDistance(s1, s2) + 'g' + (crossesGB(s1, s2) ? 1 : 0);
}

/* ---------------------------------------------------------------
 *  7. \u5361\u7247\u952E\uFF08\u00A712.3 / D39 / D46\uFF09
 *
 *  i:<play>:<intervalId>:<dir>:<mode>[:<shape>]
 *    play  a | b
 *    dir   up | down | none
 *    mode  exact | equiv
 *    shape \u73A9\u6CD5 A \u4E0E\u73A9\u6CD5 B \u7CBE\u786E\u6A21\u5F0F\u624D\u6709\uFF1B\u73A9\u6CD5 B \u8DE8\u516B\u5EA6\u6A21\u5F0F\u6CA1\u6709\uFF08D46\uFF09
 * --------------------------------------------------------------- */

function cardKey(play, intervalId, dir, mode, shape) {
  const base = 'i:' + play + ':' + intervalId + ':' + dir + ':' + mode;
  return shape ? base + ':' + shape : base;
}

function parseCardKey(key) {
  const m = /^i:([ab]):([A-Za-z0-9]+):(up|down|none):(exact|equiv)(?::(d\dg[01]))?$/.exec(String(key || ''));
  if (!m) return null;
  return { play: m[1], interval: m[2], dir: m[3], mode: m[4], shape: m[5] || null };
}

/* ---------------------------------------------------------------
 *  8. \u9009\u9879\u6807\u7B7E\uFF08\u00A73.2 / \u00A76.3\uFF09
 * --------------------------------------------------------------- */

/* \u300C\u4E0A\u884C\u5927\u4E09\u5EA6\u300D\u300C\u4E0B\u884C\u7EAF\u4E94\u5EA6\u300D\uFF1B\u7EAF\u4E00\u5EA6\u65E0\u65B9\u5411\u524D\u7F00\u3002 */
function optionLabel(intervalId, dir) {
  const it = intervalById(intervalId);
  if (!it) return '';
  if (!it.hasDir) return it.name;
  return (dir === 'down' ? '\u4E0B\u884C' : '\u4E0A\u884C') + it.name;
}

function optionKey(intervalId, dir) {
  const it = intervalById(intervalId);
  if (!it) return '';
  return it.hasDir ? intervalId + ':' + (dir === 'down' ? 'down' : 'up') : intervalId;
}

/* ---------------------------------------------------------------
 *  9. \u9009\u9879\u751F\u6210\uFF08\u00A76.3\uFF09
 *
 *  \u5019\u9009\u7A7A\u95F4 = \u6BCF\u4E2A\u6709\u65B9\u5411\u97F3\u7A0B\u7684 up/down \u4E24\u4E2A\u7B54\u6848 + \u7EAF\u4E00\u5EA6\u4E00\u4E2A\u7B54\u6848\u3002
 *  \u5E72\u6270\u9879\u6309\u4F18\u5148\u7EA7\u9636\u68AF\u53D6\uFF1A
 *    1) \u540C\u97F3\u7A0B\u53CD\u5411      \u8003\u65B9\u5411
 *    2) \u534A\u97F3\u76F8\u90BB\u540C\u5411    \u8003\u8DDD\u79BB
 *    3) \u6027\u8D28\u76F8\u8FD1\u540C\u5411    \u5927\u2194\u5C0F / \u7EAF\u2194\u4E09\u5168\u97F3
 *    4) \u540C\u5411\u8FDC\u8DDD\u79BB      \u534A\u97F3\u5DEE >= 4
 * --------------------------------------------------------------- */

/* \u679A\u4E3E\u67D0\u4E2A\u542F\u7528\u96C6\u5408\u4E0B\u7684\u5168\u90E8\u5019\u9009\u7B54\u6848 */
function allCandidates(set) {
  const out = [];
  normalizeSet(set, false).forEach((id) => {
    const it = BY_ID[id];
    if (it.hasDir) {
      out.push({ id: id, dir: 'up' });
      out.push({ id: id, dir: 'down' });
    } else {
      out.push({ id: id, dir: 'none' });
    }
  });
  return out;
}

function sameOption(a, b) {
  return a && b && a.id === b.id && a.dir === b.dir;
}

/* \u7EAF\u4E00\u5EA6\u7684\u5E72\u6270\u9879\uFF1A\u6309\u300C\u4E0E 0 \u5BB9\u6613\u6DF7\u6DC6\u300D\u6392\u5E8F\uFF08\u00A76.3-4\uFF09 */
const UNISON_DISTRACTORS = ['m2', 'M2', 'octave', 'TT', 'm3', 'M3', 'P4', 'P5', 'm6', 'M6', 'm7', 'M7'];

/* \u751F\u6210\u73A9\u6CD5 A \u7684\u9009\u9879\u96C6\u5408\u3002
 *  correct: { id, dir }
 *  set:     \u542F\u7528\u96C6\u5408
 *  count:   \u671F\u671B\u9009\u9879\u6570\uFF08\u4F1A\u88AB clamp \u5230 1..min(12, C)\uFF09
 *  rng:     \u53EF\u9009\uFF0C() => [0,1)\uFF0C\u4FBF\u4E8E\u6D4B\u8BD5\u6CE8\u5165\u786E\u5B9A\u6027\u968F\u673A
 * \u8FD4\u56DE\u6570\u7EC4\uFF08\u5DF2\u6253\u6563\uFF09\uFF0C\u7B2C\u4E00\u4E2A\u4E0D\u4FDD\u8BC1\u662F\u6B63\u786E\u7B54\u6848\u3002 */
function buildOptions(correct, set, count, rng) {
  const rand = typeof rng === 'function' ? rng : Math.random;
  const cands = allCandidates(set);
  const target = Math.max(1, Math.min(Number(count) || 4, cands.length));

  const picked = [correct];
  const has = (o) => picked.some((p) => sameOption(p, o));

  const correctIt = intervalById(correct.id);
  const correctSemi = correctIt ? correctIt.semi : 0;

  /* \u9636\u68AF 1\uFF1A\u540C\u97F3\u7A0B\u53CD\u5411 */
  const ladder1 = cands.filter((c) => c.id === correct.id && c.dir !== correct.dir);
  /* \u9636\u68AF 2\uFF1A\u534A\u97F3\u76F8\u90BB\u540C\u5411 */
  const ladder2 = cands.filter((c) => {
    if (c.dir !== correct.dir) return false;
    const s = BY_ID[c.id].semi;
    return Math.abs(s - correctSemi) === 1;
  });
  /* \u9636\u68AF 3\uFF1A\u6027\u8D28\u76F8\u8FD1\u540C\u5411\uFF08\u5927\u2194\u5C0F\uFF0C\u7EAF\u2194\u4E09\u5168\u97F3\uFF09 */
  const ladder3 = cands.filter((c) => {
    if (c.dir !== correct.dir) return false;
    if (c.id === correct.id) return false;
    const q = BY_ID[c.id].quality;
    const cq = correctIt ? correctIt.quality : '';
    if ((cq === 'major' && q === 'minor') || (cq === 'minor' && q === 'major')) return true;
    if ((cq === 'perfect' && q === 'tritone') || (cq === 'tritone' && q === 'perfect')) return true;
    return false;
  });
  /* \u9636\u68AF 4\uFF1A\u540C\u5411\u8FDC\u8DDD\u79BB\uFF08\u534A\u97F3\u5DEE >= 4\uFF09 */
  const ladder4 = cands.filter((c) => {
    if (c.dir !== correct.dir) return false;
    if (c.id === correct.id) return false;
    return Math.abs(BY_ID[c.id].semi - correctSemi) >= 4;
  });

  const ladders = [ladder1, ladder2, ladder3, ladder4];
  if (!correctIt || !correctIt.hasDir) {
    /* \u7EAF\u4E00\u5EA6\u9898\uFF1A\u6309\u300C\u5BB9\u6613\u6DF7\u6DC6\u300D\u7684\u56FA\u5B9A\u987A\u5E8F\u8865\u5E72\u6270\u9879 */
    ladders.length = 0;
    UNISON_DISTRACTORS.forEach((id) => {
      ladders.push(cands.filter((c) => c.id === id));
    });
    /* \u515C\u5E95\uFF1A\u5176\u4F59\u4EFB\u4F55\u5019\u9009 */
    ladders.push(cands.filter((c) => c.id !== correct.id));
  }

  const tryPush = (c) => {
    if (picked.length >= target) return;
    if (has(c)) return;
    picked.push(c);
  };

  for (let i = 0; i < ladders.length && picked.length < target; i++) {
    const pool = ladders[i].slice();
    /* \u540C\u9636\u68AF\u5185\u968F\u673A\u987A\u5E8F\uFF0C\u907F\u514D\u6BCF\u6B21\u90FD\u662F\u540C\u4E00\u4E2A\u5E72\u6270\u9879 */
    for (let j = pool.length - 1; j > 0; j--) {
      const k = Math.floor(rand() * (j + 1));
      const t = pool[j]; pool[j] = pool[k]; pool[k] = t;
    }
    for (let j = 0; j < pool.length && picked.length < target; j++) tryPush(pool[j]);
  }

  /* \u515C\u5E95\uFF1A\u4ECE\u5269\u4F59\u5019\u9009\u91CC\u968F\u673A\u8865\u6EE1\uFF08\u4FDD\u8BC1\u300C\u663E\u793A\u6570\u91CF === \u8BBE\u7F6E\u503C\u300D\uFF09 */
  if (picked.length < target) {
    const rest = cands.filter((c) => !has(c));
    for (let j = rest.length - 1; j > 0; j--) {
      const k = Math.floor(rand() * (j + 1));
      const t = rest[j]; rest[j] = rest[k]; rest[k] = t;
    }
    for (let j = 0; j < rest.length && picked.length < target; j++) tryPush(rest[j]);
  }

  /* \u6253\u6563 */
  for (let j = picked.length - 1; j > 0; j--) {
    const k = Math.floor(rand() * (j + 1));
    const t = picked[j]; picked[j] = picked[k]; picked[k] = t;
  }
  return picked;
}

/* ---------------------------------------------------------------
 *  10. \u73A9\u6CD5 A \u5224\u5B9A\uFF08\u00A73.3\uFF09
 *
 *  \u65B9\u5411\u4E0E\u97F3\u7A0B\u540C\u65F6\u5224\u5B9A\uFF1A\u7B54\u5BF9\u5FC5\u987B\u65B9\u5411\u6B63\u786E\u4E14\u97F3\u7A0B\u6B63\u786E\u3002
 * --------------------------------------------------------------- */

function judgeA(chosen, correct) {
  if (!chosen) return { ok: false, error: 'unanswered' };
  if (sameOption(chosen, correct)) return { ok: true, error: null };
  if (chosen.id === correct.id && chosen.dir !== correct.dir) {
    return { ok: false, error: 'direction' };
  }
  if (chosen.dir === correct.dir) return { ok: false, error: 'interval' };
  return { ok: false, error: 'both' };
}

/* ---------------------------------------------------------------
 *  11. \u73A9\u6CD5 B\uFF1A\u5408\u6CD5\u76EE\u6807\u679A\u4E3E\uFF08\u00A74.3 / \u00A78.3\uFF09
 *
 *  start:  { s, f }
 *  opts:   { intervalId, dir, mode, strings, maxFret }
 *          mode = 'exact' | 'equiv'
 *          dir  = 'up' | 'down'
 *  \u8FD4\u56DE\u6309\u300C\u00A74.5 \u4E3B\u7B54\u6848\u89C4\u5219\u300D\u6392\u597D\u5E8F\u7684\u76EE\u6807\u6570\u7EC4\uFF08\u7B2C\u4E00\u4E2A\u5C31\u662F\u4E3B\u7B54\u6848\uFF09\u3002
 * --------------------------------------------------------------- */

function enumerateTargets(start, opts) {
  const o = opts || {};
  const it = intervalById(o.intervalId);
  if (!it || !it.hasDir) return [];
  const strings = (Array.isArray(o.strings) && o.strings.length ? o.strings : STRING_ORDER)
    .map(Number).filter((n) => STRING_MIDI[n] !== undefined);
  const maxFret = Number.isFinite(Number(o.maxFret)) ? Number(o.maxFret) : 12;
  const dir = o.dir === 'down' ? 'down' : 'up';
  const mode = o.mode === 'equiv' ? 'equiv' : 'exact';
  /* \u53EF\u9009\u97F3\u7EA7\u8FC7\u6EE4\uFF08\u97F3\u7A0B\u6A21\u5F0F\u81EA\u5DF1\u7684\u5347\u964D\u8C03\u5F00\u5173\uFF09\uFF1A\u8D77\u70B9\u4E0E\u76EE\u6807\u90FD\u5FC5\u987B\u5728\u96C6\u5408\u91CC\u3002
     \u4E0D\u7ED9 pcs \u65F6\u884C\u4E3A\u5B8C\u5168\u4E0D\u53D8\uFF08\u65E7\u8C03\u7528\u70B9 / \u65E7\u6D4B\u8BD5\uFF09\u3002 */
  const pcs = Array.isArray(o.pcs) && o.pcs.length ? o.pcs.map(Number) : null;

  const startMidi = midiAt(start.s, start.f);
  if (startMidi === null) return [];
  if (pcs && pcs.indexOf(pitchClass(startMidi)) < 0) return [];

  const out = [];
  for (let i = 0; i < strings.length; i++) {
    const s = strings[i];
    for (let f = 0; f <= maxFret; f++) {
      if (s === Number(start.s) && f === Number(start.f)) continue;
      const m = midiAt(s, f);
      if (pcs && pcs.indexOf(pitchClass(m)) < 0) continue;
      const delta = m - startMidi;
      if (dir === 'up' && !(delta > 0)) continue;
      if (dir === 'down' && !(delta < 0)) continue;

      let ok = false;
      if (mode === 'exact') {
        ok = Math.abs(delta) === it.semi;
      } else {
        /* \u8DE8\u516B\u5EA6\uFF1A\u97F3\u7EA7\u5339\u914D\u5373\u53EF\uFF0C\u65B9\u5411\u5DF2\u5728\u4E0A\u65B9\u4E25\u683C\u7EA6\u675F */
        ok = (pitchClass(m) === (pitchClass(startMidi) + (dir === 'up' ? it.semi : -it.semi) + 120) % 12);
      }
      if (ok) out.push({ s: s, f: f, midi: m });
    }
  }
  return sortByMainRule(out, start);
}

/* ---------------------------------------------------------------
 *  12. \u4E3B\u7B54\u6848\u89C4\u5219\uFF08\u00A74.5 / D31\uFF09
 *
 *  1) \u540C\u5F26\u4F18\u5148
 *  2) \u54C1\u8DDD\u6700\u5C0F
 *  3) \u5F26\u8DDD\u6700\u5C0F
 *  4) \u54C1\u8DDD\u6700\u5C0F
 *  5) \u5F26\u53F7 6\u21921\u3001\u54C1\u4F4D 0\u219212
 *
 *  \u53EA\u4F9D\u8D56\u9898\u76EE\u4E0E\u5019\u9009\u96C6\uFF0C\u7EDD\u4E0D\u53C2\u8003\u7528\u6237\u70B9\u51FB\u3002
 * --------------------------------------------------------------- */

function sortByMainRule(targets, start) {
  const s0 = Number(start.s);
  const f0 = Number(start.f);
  const stringRank = (s) => STRING_ORDER.indexOf(Number(s));
  return (targets || []).slice().sort((a, b) => {
    const aSame = Number(a.s) === s0 ? 0 : 1;
    const bSame = Number(b.s) === s0 ? 0 : 1;
    if (aSame !== bSame) return aSame - bSame;

    const aFret = Math.abs(Number(a.f) - f0);
    const bFret = Math.abs(Number(b.f) - f0);
    if (aFret !== bFret) return aFret - bFret;

    const aStr = stringDistance(a.s, s0);
    const bStr = stringDistance(b.s, s0);
    if (aStr !== bStr) return aStr - bStr;

    /* \u5F26\u53F7 6\u21921 */
    const ar = stringRank(a.s);
    const br = stringRank(b.s);
    if (ar !== br) return ar - br;

    /* \u54C1\u4F4D 0\u219212 */
    return Number(a.f) - Number(b.f);
  });
}

/* ---------------------------------------------------------------
 *  13. \u73A9\u6CD5 B \u5224\u5B9A\uFF08\u00A74.3\uFF09
 * --------------------------------------------------------------- */

function judgeB(pick, targets, start, opts) {
  if (!pick) return { ok: false, error: 'unanswered' };
  const list = targets || [];
  const hit = list.some((t) => sameCell(t, pick));
  if (hit) return { ok: true, error: null };

  const o = opts || {};
  const it = intervalById(o.intervalId);
  const startMidi = midiAt(start.s, start.f);
  const pickMidi = midiAt(pick.s, pick.f);
  const rel = relationOf(startMidi, pickMidi);
  const wantDir = o.dir === 'down' ? 'down' : 'up';

  /* \u65B9\u5411\u53CD\u4E86 */
  if (it && rel.abs === it.semi && rel.dir !== wantDir) {
    return { ok: false, error: 'direction', actual: rel };
  }
  /* \u97F3\u7EA7\u5BF9\u4E86\u4F46\u516B\u5EA6\u4E0D\u5BF9\uFF08\u4EC5\u7CBE\u786E\u6A21\u5F0F\uFF09 */
  if (it && o.mode !== 'equiv') {
    const wantPc = (pitchClass(startMidi) + (wantDir === 'up' ? it.semi : -it.semi) + 120) % 12;
    if (pitchClass(pickMidi) === wantPc && rel.dir === wantDir) {
      return { ok: false, error: 'octave', actual: rel };
    }
  }
  return { ok: false, error: 'position', actual: rel };
}

/* ---------------------------------------------------------------
 *  14. \u73A9\u6CD5 A \u9898\u6C60\u679A\u4E3E\uFF08\u00A73.5\uFF09
 *
 *  \u679A\u4E3E\u8303\u56F4\u5185\u5168\u90E8\u300C\u4E24\u4E2A\u4E0D\u540C\u4F4D\u7F6E\u300D\u7684\u7EC4\u5408\uFF0C\u6309 (intervalId, dir, shape) \u5F52\u7EC4\u3002
 *  \u8FD4\u56DE\u6570\u7EC4\uFF0C\u6BCF\u9879 { id, dir, shape, pairs: [{ a:{s,f}, b:{s,f}, delta }] }
 * --------------------------------------------------------------- */

function enumeratePairs(opts) {
  const o = opts || {};
  const set = normalizeSet(o.set, false);
  const strings = (Array.isArray(o.strings) && o.strings.length ? o.strings : STRING_ORDER)
    .map(Number).filter((n) => STRING_MIDI[n] !== undefined);
  const maxFret = Number.isFinite(Number(o.maxFret)) ? Number(o.maxFret) : 12;
  /* \u53EF\u9009\u97F3\u7EA7\u8FC7\u6EE4\uFF08\u97F3\u7A0B\u6A21\u5F0F\u81EA\u5DF1\u7684\u5347\u964D\u8C03\u5F00\u5173\uFF09\uFF1A
     \u7ED9\u4E86 pcs \u5C31\u8981\u6C42\u4E24\u7AEF\u7684\u97F3\u7EA7\u90FD\u5728\u96C6\u5408\u91CC\uFF1B\u4E0D\u7ED9\uFF08\u65E7\u8C03\u7528\u70B9\u3001\u65E7\u6D4B\u8BD5\uFF09\u884C\u4E3A\u5B8C\u5168\u4E0D\u53D8\u3002 */
  const pcs = Array.isArray(o.pcs) && o.pcs.length ? o.pcs.map(Number) : null;

  const groups = {};
  for (let i = 0; i < strings.length; i++) {
    for (let f1 = 0; f1 <= maxFret; f1++) {
      const m1 = midiAt(strings[i], f1);
      if (pcs && pcs.indexOf(pitchClass(m1)) < 0) continue;
      for (let j = 0; j < strings.length; j++) {
        for (let f2 = 0; f2 <= maxFret; f2++) {
          if (i === j && f1 === f2) continue;
          const m2 = midiAt(strings[j], f2);
          if (pcs && pcs.indexOf(pitchClass(m2)) < 0) continue;
          const rel = relationOf(m1, m2);
          if (!rel.id) continue;              // |delta| > 12\uFF0C\u590D\u97F3\u7A0B\uFF0C\u6392\u9664
          if (set.indexOf(rel.id) < 0) continue;
          const shape = shapeOf(strings[i], strings[j]);
          const key = rel.id + '|' + rel.dir + '|' + shape;
          if (!groups[key]) {
            groups[key] = { id: rel.id, dir: rel.dir, shape: shape, pairs: [] };
          }
          groups[key].pairs.push({
            a: { s: strings[i], f: f1 },
            b: { s: strings[j], f: f2 },
            delta: rel.delta,
          });
        }
      }
    }
  }
  return Object.keys(groups).map((k) => groups[k]);
}

/* ---------------------------------------------------------------
 *  15. \u73A9\u6CD5 A \u4E00\u8F6E\u9898\u76EE\u7684\u914D\u989D\u4E0E\u9898\u5E8F\uFF08\u00A77.5 / \u00A77.6\uFF09
 *
 *  size:       \u672C\u8F6E\u9898\u91CF
 *  unisonOn:   \u542F\u7528\u96C6\u5408\u662F\u5426\u5305\u542B\u7EAF\u4E00\u5EA6
 *
 *  \u8FD4\u56DE { unisonCount, upCount, downCount }\u3002
 *    unisonCount = unisonOn ? 1 : 0\uFF08\u9898\u91CF >= 5 \u6052\u6210\u7ACB\uFF0C\u56E0\u4E3A\u9898\u91CF\u4E0B\u9650\u662F 5\uFF09
 *    D = size - unisonCount
 *    up = ceil(D/2), down = floor(D/2)
 * --------------------------------------------------------------- */

function directionQuota(size, unisonOn) {
  const n = Math.max(0, Math.floor(Number(size) || 0));
  const unisonCount = (unisonOn && n >= 5) ? 1 : 0;
  const D = Math.max(0, n - unisonCount);
  const upCount = Math.ceil(D / 2);
  const downCount = Math.floor(D / 2);
  return { unisonCount: unisonCount, upCount: upCount, downCount: downCount, directionTotal: D };
}

/* \u6253\u6563\u9898\u5E8F\uFF0C\u5E76\u4FDD\u8BC1\u300C\u4E0D\u51FA\u73B0\u8FDE\u7EED 3 \u9053\u540C\u5411\u300D\u3002
 *  items: [{ dir: 'up'|'down'|'none', ... }]
 *  rng:   \u53EF\u9009\u968F\u673A\u6E90
 *  \u7EAF\u4E00\u5EA6\uFF08none\uFF09\u4E0D\u53C2\u4E0E\u8FDE\u7EED\u540C\u5411\u5224\u65AD\uFF0C\u4F4D\u7F6E\u4E5F\u968F\u673A\u63D2\u5165\u3002
 *
 *  \u5B9E\u73B0\uFF1A\u53CD\u590D\u6253\u6563\u76F4\u5230\u6CA1\u6709\u4E09\u8FDE\uFF08\u5E26\u5C1D\u8BD5\u4E0A\u9650\uFF09\uFF0C\u6700\u540E\u518D\u8DD1\u4E00\u904D\u4FEE\u590D\u3002
 *  \u5355\u7EAF\u300C\u6253\u6563 + \u4EA4\u6362\u4FEE\u590D\u300D\u5728\u6781\u7AEF\u914D\u6BD4\u4E0B\u4F1A\u6F0F\uFF08\u4F8B\u5982\u53EA\u5269\u540C\u5411\u5143\u7D20\u53EF\u6362\uFF09\uFF0C
 *  \u6240\u4EE5\u7528\u91CD\u8BD5 + \u515C\u5E95\u91CD\u5EFA\u4E24\u5C42\u4FDD\u8BC1\u3002 */
function shuffleWithoutTriple(items, rng) {
  const rand = typeof rng === 'function' ? rng : Math.random;
  const src = (items || []).slice();
  const dirOf = (x) => (x && (x.dir === 'up' || x.dir === 'down') ? x.dir : null);

  const hasTriple = (list) => {
    for (let i = 2; i < list.length; i++) {
      const a = dirOf(list[i - 2]);
      const b = dirOf(list[i - 1]);
      const c = dirOf(list[i]);
      if (a && a === b && b === c) return true;
    }
    return false;
  };

  const shuffle = (list) => {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const k = Math.floor(rand() * (i + 1));
      const t = out[i]; out[i] = out[k]; out[k] = t;
    }
    return out;
  };

  /* \u2460 \u76F4\u63A5\u6253\u6563\uFF1A\u5927\u591A\u6570\u914D\u6BD4\u4E00\u6B21\u5C31\u591F */
  let best = null;
  for (let attempt = 0; attempt < 40; attempt++) {
    const cand = shuffle(src);
    if (!hasTriple(cand)) return cand;
    if (!best) best = cand;
  }

  /* \u2461 \u515C\u5E95\uFF1A\u6309\u300C\u5C3D\u91CF\u4EA4\u66FF\u300D\u7684\u65B9\u5F0F\u91CD\u5EFA\u3002
     \u628A up / down \u5206\u6210\u4E24\u7EC4\uFF0C\u8F6E\u6D41\u53D6\uFF1Bnone \u5747\u5300\u63D2\u5165\u3002 */
  const ups = src.filter((x) => x.dir === 'up');
  const downs = src.filter((x) => x.dir === 'down');
  const nones = src.filter((x) => x.dir !== 'up' && x.dir !== 'down');

  const built = [];
  let ui = 0;
  let di = 0;
  /* \u54EA\u4E00\u7EC4\u66F4\u591A\uFF0C\u5C31\u5148\u4ECE\u54EA\u4E00\u7EC4\u53D6\uFF0C\u907F\u514D\u672B\u5C3E\u5806\u79EF */
  let takeUp = ups.length >= downs.length;
  while (ui < ups.length || di < downs.length) {
    if (takeUp && ui < ups.length) { built.push(ups[ui++]); }
    else if (!takeUp && di < downs.length) { built.push(downs[di++]); }
    else if (ui < ups.length) { built.push(ups[ui++]); }
    else if (di < downs.length) { built.push(downs[di++]); }
    takeUp = !takeUp;
  }

  /* none \u5747\u5300\u63D2\u8FDB\u53BB\uFF08\u4E0D\u6253\u65AD\u4EFB\u4F55\u4E09\u8FDE\u5224\u65AD\uFF0C\u4F46\u4ECD\u8981\u907F\u514D\u5168\u5806\u5728\u672B\u5C3E\uFF09 */
  nones.forEach((x, i) => {
    const at = Math.min(built.length, Math.floor((i + 1) * built.length / (nones.length + 1)));
    built.splice(at, 0, x);
  });

  return built;
}

/* ---------------------------------------------------------------
 *  16. \u81EA\u9002\u5E94\u6743\u91CD\uFF08\u00A712.3.2 / D47\u2013D50\uFF09
 *
 *  \u4E0E\u73B0\u6709 positionWeight \u540C\u4E00\u9AA8\u67B6\uFF0C\u4F46\uFF1A
 *    - n \u7528 recent.length\uFF08\u4E0D\u662F a+e\uFF09
 *    - \u5411\u4E2D\u6027\u5148\u9A8C 0.5 \u6536\u7F29\uFF0Ck = 3
 *  \u8FD4\u56DE\u7684\u662F\u300C\u57FA\u7840\u6743\u91CD\u300D\uFF0C\u4E0D\u542B due \u4E0E\u51B7\u5374\u4FEE\u6B63\u3002
 * --------------------------------------------------------------- */

function intervalBaseWeight(card) {
  if (!card || (!card.a && !card.e)) return NEW_CARD_WEIGHT;
  const a = Number(card.a) || 0;
  const e = Number(card.e) || 0;
  const total = Math.max(1, a + e);
  const hist = (e + 1) / (total + 2);          // Beta(1,1) \u5E73\u6ED1
  const recent = Array.isArray(card.recent) ? card.recent.slice(-RECENT_WINDOW) : [];
  const rec = recent.length ? recent.filter((x) => !x).length / recent.length : hist;

  const raw = 0.55 * hist + 0.45 * rec;
  const n = recent.length;                      // D49\uFF1A\u7528\u8FD1\u671F\u7A97\u53E3\u6837\u672C\u91CF
  const score = (n * raw + SHRINK_K * 0.5) / (n + SHRINK_K);
  return clampNum(0.65 + 11.5 * Math.pow(score, 1.45), 0.25, 18);
}

/* \u5B8C\u6574\u8C03\u5EA6\u6743\u91CD = \u57FA\u7840\u6743\u91CD \u00D7 due \u4FEE\u6B63 \u00D7 \u51B7\u5374\u4FEE\u6B63\u3002
   \u4E0E\u73B0\u6709 positionWeight \u7684\u4FEE\u6B63\u5C42\u4FDD\u6301\u4E00\u81F4\uFF0C\u53EA\u66FF\u6362 score \u90A3\u4E00\u5C42\u3002 */
function intervalWeight(card, now) {
  let w = intervalBaseWeight(card);
  if (!card) return w;
  const t = Number.isFinite(Number(now)) ? Number(now) : Date.now();
  if (card.due) {
    const dueAge = t - card.due;
    if (dueAge >= 0) w *= 1 + Math.min(1.5, dueAge / (24 * 60 * 60000));
    else w *= Math.max(0.35, 1 - Math.min(0.65, -dueAge / (12 * 60000)));
  }
  if (card.last && t - card.last < 2 * 60000 && (!card.due || card.due > t)) w *= 0.35;
  return clampNum(w, 0.25, 18);
}

function clampNum(v, lo, hi) {
  const n = Number(v);
  if (!isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

/* ---------------------------------------------------------------
 *  17. \u63CF\u8FF0\u6027\u5DE5\u5177\uFF08\u53CD\u9988\u6587\u6848\u7528\uFF09
 * --------------------------------------------------------------- */

/* \u6709\u7B26\u53F7\u534A\u97F3\u5DEE \u2192 '+4' / '-4' / '0' */
function formatDelta(delta) {
  const n = Number(delta) || 0;
  if (n === 0) return '0';
  return (n > 0 ? '+' : '') + n;
}

/* \u65B9\u5411\u4E2D\u6587 */
function dirLabel(dir) {
  if (dir === 'up') return '\u4E0A\u884C';
  if (dir === 'down') return '\u4E0B\u884C';
  return '\u65E0\u65B9\u5411';
}

/* \u4F4D\u7F6E\u63CF\u8FF0\uFF1A'5 \u5F26 3 \u54C1' */
function cellLabel(cell) {
  if (!cell) return '\u2014';
  return Number(cell.s) + ' \u5F26 ' + Number(cell.f) + ' \u54C1';
}

/* \u54C1\u533A\uFF08\u9AD8\u628A\u4F4D\u52A0\u65F6\u7528\uFF09\uFF1A0\u20133 / 4\u20137 / 8+ */
function fretZone(fret) {
  const f = Number(fret) || 0;
  if (f <= 3) return 0;
  if (f <= 7) return 1;
  return 2;
}

/* \u9AD8\u628A\u4F4D\u52A0\u65F6\uFF08\u6CBF\u7528\u73B0\u6709\u6863\u4F4D\uFF1A+0 / +1.5 / +3\uFF0C\u6700\u7EC8 clamp \u5230 2..40\uFF09 */
const ZONE_SLACK = [0, 1.5, 3];

function withFretSlack(base, fret) {
  const b = Number(base);
  if (!isFinite(b)) return b;
  return clampNum(b + ZONE_SLACK[fretZone(fret)], 2, 40);
}

/* \u5BFC\u51FA\u8868 */
global.IntervalTheory = {
  intervalById: intervalById,
  intervalName: intervalName,
  idOfSemitones: idOfSemitones,
  semitonesOf: semitonesOf,
  normalizeSet: normalizeSet,
  candidateCount: candidateCount,
  maxOptionCount: maxOptionCount,
  midiAt: midiAt,
  pitchClass: pitchClass,
  sameCell: sameCell,
  cellKey: cellKey,
  relationOf: relationOf,
  crossesGB: crossesGB,
  stringDistance: stringDistance,
  shapeOf: shapeOf,
  cardKey: cardKey,
  parseCardKey: parseCardKey,
  optionLabel: optionLabel,
  optionKey: optionKey,
  allCandidates: allCandidates,
  buildOptions: buildOptions,
  judgeA: judgeA,
  enumerateTargets: enumerateTargets,
  sortByMainRule: sortByMainRule,
  judgeB: judgeB,
  enumeratePairs: enumeratePairs,
  directionQuota: directionQuota,
  shuffleWithoutTriple: shuffleWithoutTriple,
  intervalBaseWeight: intervalBaseWeight,
  intervalWeight: intervalWeight,
  formatDelta: formatDelta,
  dirLabel: dirLabel,
  cellLabel: cellLabel,
  fretZone: fretZone,
  withFretSlack: withFretSlack,
  STRING_MIDI: STRING_MIDI,
  STRING_ORDER: STRING_ORDER,
  MAX_FRET: MAX_FRET,
  RECENT_WINDOW: RECENT_WINDOW,
  SHRINK_K: SHRINK_K,
  NEW_CARD_WEIGHT: NEW_CARD_WEIGHT,
  INTERVALS: INTERVALS,
  INTERVAL_IDS: INTERVAL_IDS,
  PRESET_BASIC: PRESET_BASIC,
  PRESET_ALL: PRESET_ALL,
  DEFAULT_A_SET: DEFAULT_A_SET,
  DEFAULT_B_SET: DEFAULT_B_SET,
  ZONE_SLACK: ZONE_SLACK
};
})(typeof window !== "undefined" ? window : this);
