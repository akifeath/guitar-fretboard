/* =========================================================================
 *  \u5409\u4ED6\u6307\u677F\u8BB0\u5FC6\u8BAD\u7EC3
 *  Canvas \u6307\u677F + \u97F3\u540D\u9009\u9879 / \u6307\u677F\u70B9\u51FB + \u9650\u65F6 + \u9057\u5FD8\u66F2\u7EBF\u6392\u9898 + \u771F\u5B9E\u6728\u5409\u4ED6\u91C7\u6837
 *  \u6240\u6709\u4E2D\u6587\u7528 \u \u8F6C\u4E49\uFF0C\u907F\u514D\u6587\u4EF6\u7F16\u7801\u95EE\u9898\uFF1B\u6D4F\u89C8\u5668\u76F4\u63A5\u52A0\u8F7D\u5373\u53EF\u3002
 * ========================================================================= */
(() => {
  'use strict';

  /* ---------------------------------------------------------------
   *  \u5E38\u91CF\u4E0E\u57FA\u7840\u6570\u636E
   * --------------------------------------------------------------- */
  const STORAGE_KEY = 'guitar-fretboard-trainer:v1';
  /* \u5B58\u6863\u7ED3\u6784\u7248\u672C\uFF08\u4E0E BACKUP_VERSION \u662F\u4E24\u4E2A\u7EF4\u5EA6\uFF0C\u4E0D\u8981\u6DF7\uFF09\u3002
     2 = \u4FA7\u680F\u56DB\u9762\u677F\u91CD\u6784\uFF1A\u65B0\u589E modeStats / posUnitStats / card.hist\uFF0C
         \u65E7\u5B58\u6863\u91CC\u7684\u5B66\u4E60\u6570\u636E\u53E3\u5F84\u4E0D\u540C\uFF0Cload() \u4F1A\u4E00\u6B21\u6027\u6E05\u7A7A\uFF08settings \u4FDD\u7559\uFF09\u3002
     3 = \u6309\u6A21\u5F0F\u6E05\u7A7A\u5B66\u4E60\u6570\u636E\uFF1Ahistory \u6761\u76EE\u65B0\u589E m\uFF08note | pos\uFF09\u7528\u4E8E\u5224\u65AD\u683C\u5B50\u5F52\u5C5E\u3002
         2 \u53CA\u66F4\u65E9\u7684\u5B58\u6863\u91CC history \u6CA1\u6709 m\uFF0C\u5361\u7247\u4E0E\u5386\u53F2\u65E0\u6CD5\u6309\u6A21\u5F0F\u62C6\u5206\uFF0C
         load() \u4F1A\u4E00\u6B21\u6027\u6E05\u7A7A\u5168\u90E8\u5B66\u4E60\u6570\u636E\uFF08settings \u4FDD\u7559\uFF09\u3002 */
  const SCHEMA_VERSION = 3;
  const SEMI = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const SHARP = { 'C#': 'C\u266F', 'D#': 'D\u266F', 'F#': 'F\u266F', 'G#': 'G\u266F', 'A#': 'A\u266F' };
  const FLAT = { 'C#': 'D\u266D', 'D#': 'E\u266D', 'F#': 'G\u266D', 'G#': 'A\u266D', 'A#': 'B\u266D' };
  const NATURAL = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  // 6 \u5F26\uFF08\u6700\u7C97\u3001\u6700\u4F4E\u97F3\uFF09\u2192 1 \u5F26\uFF08\u6700\u7EC6\uFF09
  const STRINGS = [
    { n: 6, midi: 40, name: 'E' },
    { n: 5, midi: 45, name: 'A' },
    { n: 4, midi: 50, name: 'D' },
    { n: 3, midi: 55, name: 'G' },
    { n: 2, midi: 59, name: 'B' },
    { n: 1, midi: 64, name: 'E' },
  ];

  // E2 \u2192 D5 \u6BCF\u4E2A\u534A\u97F3\u90FD\u6709\u91C7\u6837\uFF1A\u4F4E\u97F3\u533A\u7528\u539F\u58F0\uFF08\u957F\u5EF6\u97F3\uFF09\uFF0C\u9AD8\u97F3\u533A\u7528\u539F\u58F0\uFF0C\u907F\u514D\u53D8\u8C03\u9020\u6210\u7684\u673A\u68B0\u611F
  const SAMPLE_NOTES = [
    'E2', 'F2', 'Fs2', 'G2', 'Gs2', 'A2', 'As2', 'B2',
    'C3', 'Cs3', 'D3', 'Ds3', 'E3', 'F3', 'Fs3', 'G3', 'Gs3', 'A3', 'As3', 'B3',
    'C4', 'Cs4', 'D4', 'Ds4', 'E4', 'F4', 'Fs4', 'G4', 'Gs4', 'A4', 'As4', 'B4',
    'C5', 'Cs5', 'D5',
  ];
  const SAMPLE_BASE = 'samples/acoustic/';
  // \u53D8\u8C03\u6821\u6B63\uFF08\u97F3\u5206/\u534A\u97F3\uFF09\uFF1A\u5347\u8C03\u4F1A\u628A\u91C7\u6837\u97F3\u51C6\u62C9\u4F4E\uFF0C\u8FD9\u91CC\u505A\u8865\u507F\uFF0C\u4FDD\u8BC1\u9AD8\u628A\u4F4D\u97F3\u9AD8\u51C6\u786E
  const RATE_CORRECTION_CENTS_PER_SEMI = 1.4;

  const DEFAULT_SETTINGS = {
    /* \u7B54\u9898\u8303\u56F4\u6309\u6A21\u5F0F\u5404\u81EA\u72EC\u7ACB\uFF1A
         noteRange \u2014\u2014 \u97F3\u540D\u6A21\u5F0F\uFF1BposRange \u2014\u2014 \u627E\u4F4D\u7F6E\u6A21\u5F0F\u3002
       range \u53EA\u4F5C\u517C\u5BB9\u5B57\u6BB5\u4FDD\u7559\uFF08\u65E7\u5B58\u6863 / \u5916\u90E8\u811A\u672C\u8BFB\u5B83\u65F6\u7ED9\u4E2A\u503C\uFF09\uFF0C
       \u5B9E\u9645\u751F\u6548\u7684\u662F\u5F53\u524D\u6A21\u5F0F\u5BF9\u5E94\u7684\u90A3\u4E2A\u3002 */
    range: '0-12',          // \u517C\u5BB9\u5B57\u6BB5\uFF1A\u7B49\u4E8E\u5F53\u524D\u6A21\u5F0F\u7684\u8303\u56F4\uFF08\u89C1 syncLegacyRange\uFF09
    noteRange: '0-12',      // 1-5 | 0-12 | 0-15 | 0-21
    posRange: '0-12',       // 1-5 | 0-12 | 0-15 | 0-21
    strings: [6, 5, 4, 3, 2, 1],
    mode: 'note',           // note | pos | chord
    time: 10,               // \u6BCF\u9898\u9650\u65F6\uFF08\u79D2\uFF09\uFF1B'inf' = \u4E0D\u9650\u65F6
    timePerString: {},      // \u6BCF\u6839\u5F26\u5355\u72EC\u9650\u65F6\uFF08\u79D2\uFF09\uFF0C\u7F3A\u7701\u7528 time
    timePerFret: 'range',   // range\uFF1A\u7B54\u9898\u8303\u56F4\u5185\u7EDF\u4E00\u9650\u65F6\uFF1B'fret'\uFF1A0\u20133 \u54C1\u8F83\u5FEB\u30014\u20137 \u54C1\u4E2D\u7B49\u30018 \u54C1\u4EE5\u4E0A\u8F83\u6162
    startMode: 'manual',    // manual\uFF1A\u6253\u5F00\u9875\u9762\u540E\u70B9\u201C\u5F00\u59CB\u7EC3\u4E60\u201D\u624D\u8BA1\u65F6\uFF1Bauto\uFF1A\u51FA\u9898\u5373\u8BA1\u65F6\uFF08\u4EC5\u97F3\u540D\u6A21\u5F0F\uFF09
    size: 10,               // \u4E00\u8F6E\u9898\u91CF
    accidental: 'sharp',    // sharp | flat \u2014\u2014 \u6DF7\u5408\u65F6\u7684\u97F3\u540D\u5199\u6CD5\u504F\u597D\uFF08\u266F / \u266D\uFF09
    accidentalMode: 'both', // \u517C\u5BB9\u5B57\u6BB5\uFF08\u7531 accSel \u6D3E\u751F\uFF09
    accSel: { nat: true, sharp: true, flat: true },   // \u9898\u76EE\u5347\u964D\u8C03\uFF08\u591A\u9009\uFF09\uFF1A\u81EA\u7136\u97F3 / \u5347\u53F7 / \u964D\u53F7
    optionCount: 7,         // \u97F3\u540D\u9009\u9879\u4E2A\u6570 2\u201312
    pauseOnWrong: true,     // \u7B54\u9519\u540E\u5148\u505C\u4F4F\uFF0C\u53EF\u5148\u91CD\u542C\u6B63\u786E\u7684\u58F0\u97F3\u518D\u8FDB\u5165\u4E0B\u4E00\u9898
    autoStartOnNext: true,  // \u70B9\u201C\u4E0B\u4E00\u9898 / Enter\u201D\u540E\uFF1A\u76F4\u63A5\u5F00\u59CB\u5012\u8BA1\u65F6\uFF08\u4E0D\u7528\u518D\u70B9\u5F00\u59CB\uFF09
    autoNextOnCorrect: false, // \u7B54\u5BF9\u540E\u81EA\u52A8\u8FDB\u5165\u4E0B\u4E00\u9898\u5E76\u76F4\u63A5\u5F00\u59CB\u8BA1\u65F6
    debugMode: false,       // \u662F\u5426\u663E\u793A\u9876\u90E8\u8C03\u8BD5\u680F
    autoPlay: true,
    /* \u58F0\u97F3\u6309\u6A21\u5F0F\u72EC\u7ACB\uFF1A\u6BCF\u4E2A\u6A21\u5F0F\u5404\u6709\u4E00\u5BF9 muted / volume\uFF08\u89C1 SOUND_FIELDS\uFF09\u3002
       \u4E0B\u9762\u8FD9\u4E24\u4E2A\u53EA\u662F\u517C\u5BB9\u5B57\u6BB5\uFF0C\u6C38\u8FDC\u7B49\u4E8E\u300C\u5F53\u524D\u6A21\u5F0F\u300D\u7684\u90A3\u4E00\u5BF9\uFF08\u89C1 syncLegacySound\uFF09\uFF0C
       \u65E7\u811A\u672C / \u65E7\u6D4B\u8BD5\u8BFB settings.muted \u65F6\u62FF\u5230\u7684\u662F\u5F53\u524D\u6A21\u5F0F\u7684\u503C\u3002 */
    volume: 70,             // \u517C\u5BB9\u5B57\u6BB5\uFF1A\u7B49\u4E8E\u5F53\u524D\u6A21\u5F0F\u7684\u97F3\u91CF
    muted: false,           // \u517C\u5BB9\u5B57\u6BB5\uFF1A\u7B49\u4E8E\u5F53\u524D\u6A21\u5F0F\u7684\u9759\u97F3\u72B6\u6001
    noteMuted: false,
    noteVolume: 70,
    posMuted: false,
    posVolume: 70,
    chordMuted: false,
    chordVolume: 70,
    intervalMuted: false,
    intervalVolume: 70,
    novelty: 'mix',         // mix | new | familiar
    autoSection: true,
    posClickSound: true,    // \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1A\u70B9\u9009\u683C\u5B50\u65F6\u53D1\u58F0\uFF08\u4EC5\u521D\u6B21\u9009\u4E2D\u53D1\u58F0\uFF0C\u53D6\u6D88\u4E0D\u53D1\u58F0\uFF09
    posFreeClick: false,    // \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1A\u968F\u610F\u70B9\u51FB\uFF08\u8C03\u8BD5\uFF09\u2014\u2014\u70B9\u54EA\u54CD\u54EA\uFF0C\u4E0D\u51FA\u6807\u8BB0
    posShowAllNames: false, // \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1A\u663E\u793A\u5168\u90E8\u683C\u5B50\u7684\u97F3\u540D\uFF08\u8C03\u8BD5\uFF09
    /* \u2014\u2014 \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1A\u4E24\u79CD\u73A9\u6CD5\uFF08\u4E0E\u97F3\u7A0B\u7684 intervalPlay \u540C\u4E00\u5957\u601D\u8DEF\uFF09\u2014\u2014
       a = \u5355\u5F26\u627E\u5168\u97F3\uFF1A\u4E00\u9898 =\u300C\u67D0\u5F26\u4E0A\u7684\u67D0\u97F3\u300D\uFF0C\u627E\u51FA\u8BE5\u5F26\u4E0A\u5B83\u7684\u5168\u90E8\u683C\uFF081\u20132 \u4E2A\uFF09\uFF0C
           \u6CBF\u7528\u300C\u4E00\u8F6E N \u9898\u300D\u7684\u56DE\u5408\u7ED3\u6784\uFF08size \u751F\u6548\uFF0C\u7ED3\u675F\u51FA\u73B0\u300C\u672C\u8F6E\u5B8C\u6210\u300D\uFF09\u3002
       b = \u6307\u677F\u627E\u5168\u97F3\uFF1A\u4E00\u9898 =\u300C\u67D0\u4E2A\u97F3\u300D\uFF0C\u627E\u51FA\u5B83\u5728\u5168\u90E8\u52FE\u9009\u5F26\u4E0A\u7684\u5168\u90E8\u683C\uFF086\u20137 \u4E2A\uFF09\uFF0C
           \u4E00\u9898\u5373\u4E00\u56DE\u5408\uFF08size \u4E0D\u751F\u6548\uFF0C\u6C38\u4E0D\u51FA\u73B0\u300C\u672C\u8F6E\u5B8C\u6210\u300D\uFF09\u3002
       \u8FD9\u4E24\u4E2A\u5B57\u6BB5\u4E0E\u97F3\u540D / \u548C\u5F26 / \u97F3\u7A0B\u7684\u8BBE\u7F6E\u5B8C\u5168\u72EC\u7ACB\u3002 */
    posPlay: 'b',              // a | b\uFF08\u9ED8\u8BA4 b\uFF1AA \u5BF9\u65B0\u624B\u592A\u96BE\uFF09
    posStartMode: 'manual',    // \u627E\u4F4D\u7F6E\u6A21\u5F0F\u81EA\u5DF1\u7684\u300C\u5F00\u59CB\u65B9\u5F0F\u300D\uFF08\u4E0E\u97F3\u540D/\u548C\u5F26\u4E92\u4E0D\u5F71\u54CD\uFF09
    /* \u63A8\u8FDB\u5F00\u5173\u5728 pos \u4E0B\u7528\u81EA\u5DF1\u7684\u4E00\u4EFD\uFF0C\u907F\u514D\u6539\u8FD9\u91CC\u628A\u97F3\u540D\u6A21\u5F0F\u7684\u5168\u5C40\u9ED8\u8BA4\u5E26\u8DD1\uFF08Q44\uFF09\u3002
       B \u4E0B\u9ED8\u8BA4\u5173\u95ED \u2014\u2014 \u6BCF\u9898\u90FD\u8981\u7528\u6237\u81EA\u5DF1\u70B9\u4E00\u6B21\u300C\u5F00\u59CB\u300D\u3002 */
    posAutoStartOnNext: false, // \u70B9\u300C\u4E0B\u4E00\u9898\u300D\u540E\u662F\u5426\u76F4\u63A5\u5F00\u59CB\u4E0B\u4E00\u9898
    posAutoNextOnCorrect: false, // \u7B54\u5BF9\u540E\u662F\u5426\u81EA\u52A8\u8FDB\u5165\u4E0B\u4E00\u9898

    /* \u2014\u2014 \u548C\u5F26\u6A21\u5F0F \u2014\u2014
       \u9898\u5E93\u5316\u6539\u9020\uFF08\u7B56\u5212\u4E66 \u00A73\u2013\u00A78\uFF09\uFF1A\u9898\u76EE\u4E0D\u518D\u7531\u5206\u6790\u5668\u5B9E\u65F6\u679A\u4E3E\uFF0C\u6539\u4E3A\u4ECE
       chord-bank-data.js \u7684 8,437 \u9053\u4EBA\u7C7B\u6307\u6CD5\u91CC\u62BD\u3002\u56E0\u6B64\uFF1A
         chordDir \u9000\u5316\u4E3A\u300C\u7531 chordPlay \u6D3E\u751F\u7684\u517C\u5BB9\u5B57\u6BB5\u300D\uFF08a\u2192n2f / b\u2192f2n\uFF09\uFF0C
         chordWidthBuild / chordWidthId / chordAnswer \u540C\u6837\u53EA\u4E3A\u65E7\u5B58\u6863\u5F80\u8FD4\u4FDD\u7559\uFF0C
         \u5224\u5206\u4E00\u5F8B\u300C\u9010\u5F26\u5168\u7B49\u9898\u5E93\u90A3\u4E00\u6761\u300D\u4E0E\u300C\u6BD4 (\u8D28\u91CF,\u6839\u97F3)\u300D\u3002 */
    chordRange: '0-12',             // 0-5 | 0-7 | 0-12\uFF08\u4E0E\u6307\u677F\u7269\u7406\u4E0A\u9650 21 \u54C1\u89E3\u8026\uFF09
                                    // \u9ED8\u8BA4 0-12\uFF1A\u9898\u5E93 8,437 \u9053\u9898\u5168\u90E8\u843D\u5728 0\u201312 \u54C1\u5185\uFF0C\u6536\u7A84\u7B49\u4E8E\u81EA\u5DF1\u780D\u9898\u91CF
    chordRoots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],   // \u6839\u97F3 pitch class \u591A\u9009
    /* 18 \u79CD\u8D28\u91CF\u5168\u5F00\uFF08\u7B56\u5212\u4E66 \u00A73.6\uFF1A\u8D28\u91CF\u8F74 18 \u4E2A chip\uFF0C\u9ED8\u8BA4\u5168\u9009\uFF09 */
    chordQualities: ['5', '6', '7', '7sus4', '9', 'add9', 'aug', 'dim', 'dim7',
      'm6', 'm7', 'm7b5', 'maj', 'maj7', 'min', 'mM7', 'sus2', 'sus4'],
    chordWidthBuild: 'standard',    // \u5DF2\u5E9F\u5F03\uFF1A\u5224\u5206\u6539\u4E3A\u9010\u5F26\u5168\u7B49\uFF0C\u4EC5\u4FDD\u7559\u5B57\u6BB5\u505A\u65E7\u5B58\u6863\u5F80\u8FD4
    chordWidthId: 'strict',         // \u5DF2\u5E9F\u5F03\uFF0C\u540C\u4E0A
    chordTime: { n2f: 20, f2n: 12 },// \u4E24\u4E2A\u73A9\u6CD5\u7684\u9650\u65F6\uFF08\u79D2\uFF09\uFF0C\u72EC\u7ACB\u5B57\u6BB5
    chordDir: 'n2f',                // \u517C\u5BB9\u5B57\u6BB5\uFF0C\u7531 chordPlay \u6D3E\u751F\uFF08a\u2192n2f\uFF0Cb\u2192f2n\uFF09
    chordPlay: 'a',                 // a = \u770B\u540D\u5B57\u6446\u6307\u677F\uFF1Bb = \u770B\u6307\u677F\u9009\u540D\u5B57\uFF08\u7B56\u5212\u4E66 \u00A74.7\uFF09
    chordSize: 10,                  // \u4E00\u8F6E\u9898\u91CF
    chordStrings: [],               // \u53D1\u58F0\u5F26\u6570\u7B5B\u9009\uFF083/4/5/6\uFF09\uFF0C\u7A7A\u6570\u7EC4 = \u5168\u90E8
    chordPosition: 'all',           // all | low\uFF081\u20133 \u54C1\uFF09| mid\uFF084\u20137 \u54C1\uFF09| high\uFF088 \u54C1\u4EE5\u4E0A\uFF09
    chordTechnique: 'all',          // all | barre | open | none\uFF08\u4E09\u6001\u4E92\u65A5\uFF0C\u7B56\u5212\u4E66 \u00A73.6\uFF09
    chordStyle: 'general',          // \u97F3\u4E50\u98CE\u683C\uFF1Ageneral/pop/rock/jazz/classical/other
    chordAEffort: 'common',         // A \u73A9\u6CD5\u504F\u597D\uFF1Acommon \u5E38\u7528 | easy \u7701\u529B\u4F18\u5148
    chordWrongOnly: false,          // \u9898\u91CF\u6863\uFF1A\u53EA\u770B\u300C\u6211\u7684\u9519\u9898\u300D
    chordAnswer: 'choice',          // \u5DF2\u5E9F\u5F03\uFF1A\u81EA\u7531\u8F93\u5165\u5DF2\u79FB\u9664\uFF08\u7B56\u5212\u4E66\u65E0\u6B64\u73A9\u6CD5\uFF09
    chordStrum: 'strum',            // strum\uFF08\u5411\u4E0B 6\u21921\uFF09| strumUp\uFF08\u5411\u4E0A 1\u21926\uFF09| block\uFF08\u540C\u65F6\uFF09
    chordPreview: 'reference',      // reference | off\uFF08\u53EA\u63A7\u5236\u51FA\u9898\u65F6\u7684\u81EA\u52A8\u64AD\u653E\uFF09
    chordRevealPlay: 'wrongOnly',   // wrongOnly | always | off\uFF08\u7B54\u6848\u63ED\u6653\u540E\u7684\u64AD\u653E\uFF09
    chordListenDuringAnswer: true,  // \u7B54\u9898\u4E2D\u662F\u5426\u5141\u8BB8\u624B\u52A8\u8BD5\u542C\u5F53\u524D\u6392\u5E03
    chordStartMode: 'manual',       // manual | auto\uFF08\u548C\u5F26\u81EA\u5DF1\u7684\u5F00\u59CB\u65B9\u5F0F\uFF0C\u4E0E\u97F3\u540D/\u627E\u4F4D\u7F6E\u4E92\u4E0D\u5F71\u54CD\uFF09
    chordAutoStartOnNext: true,     // \u70B9\u300C\u4E0B\u4E00\u9898\u300D\u540E\u662F\u5426\u76F4\u63A5\u5F00\u59CB\uFF08\u548C\u5F26\u81EA\u5DF1\u7684\u5F00\u5173\uFF09
    chordAutoNextOnCorrect: false,  // \u7B54\u5BF9\u540E\u81EA\u52A8\u4E0B\u4E00\u9898\uFF08\u548C\u5F26\u81EA\u5DF1\u7684\u5F00\u5173\uFF09
    chordAccidental: 'sharp',       // \u548C\u5F26\u540D\u7684\u97F3\u540D\u5199\u6CD5\uFF1Asharp | flat\uFF08\u72EC\u7ACB\u4E8E\u97F3\u540D\u6A21\u5F0F\u7684\u300C\u97F3\u540D\u663E\u793A\u5199\u6CD5\u300D\uFF09
    chordNameLang: 'both',          // en | both | zh\uFF1A\u9898\u9762\u82F1\u6587\u4E3B\u884C + \u4E2D\u6587\u6B21\u884C\uFF08\u7B56\u5212\u4E66 \u00A74.9\uFF09
    chordClickSound: true,          // \u7B54\u9898\u4E2D\u70B9\u5F26\u662F\u5426\u53D1\u58F0\uFF08\u4E0E\u627E\u4F4D\u7F6E\u7684\u70B9\u9009\u53D1\u58F0\u5404\u81EA\u72EC\u7ACB\uFF09
    /* A / B \u4E24\u79CD\u73A9\u6CD5\u5404\u81EA\u7684\u504F\u597D\uFF08\u7B56\u5212\u4E66 \u00A74.8\uFF1A\u5B57\u6BB5\u524D\u7F00\u9694\u79BB\uFF0C\u7EDD\u4E0D\u590D\u7528\uFF09 */
    chordASound: true,              // A\uFF1A\u4F5C\u7B54\u540E\u64AD\u4F60\u6446\u7684\u6392\u5E03
    chordAListen: true,             // A\uFF1A\u7B54\u9898\u4E2D\u5141\u8BB8\u8BD5\u542C
    chordAListenAnswer: true,       // A\uFF1A\u4EA4\u5377\u524D\u5141\u8BB8\u300C\u542C\u6B63\u786E\u7B54\u6848\u300D\uFF08\u9898\u5361\u4E0A\u7684 \uD83C\uDFA7 \u8BD5\u542C\u7B54\u6848\uFF09
    chordAHint: 'second',           // A\uFF1Afirst \u7B2C\u4E00\u6B21\u9519\u5C31\u9010\u5F26\u8BF4 / second \u7B2C\u4E8C\u6B21\u624D\u8BF4 / off \u4E0D\u7ED9
    chordAPreview: 'off',           // A\uFF1A\u51FA\u9898\u65F6\u81EA\u52A8\u64AD\u4E00\u904D\u53C2\u8003\u6392\u5E03\uFF08off | reference\uFF09
    chordBOptionCount: 4,           // B\uFF1A\u9009\u9879\u4E2A\u6570 3\u20136
    chordBDistractor: 'mixed',      // B\uFF1A\u5E72\u6270\u9879\u6765\u6E90 sameRoot | sameQuality | mixed
    chordBSound: true,              // B\uFF1A\u4F5C\u7B54\u540E\u64AD\u9898\u9762\u6392\u5E03
    chordBReveal: 'wrongOnly',      // B\uFF1AwrongOnly | always | off
    chordBHint: 'second',           // B\uFF1A\u9519\u4E24\u6B21\u540E\u6392\u9664\u4E00\u4E2A\u9519\u8BEF\u9009\u9879\uFF08second | off\uFF09
    chordBStrict: false,            // B\uFF1A\u53EA\u51FA\u300C\u5355\u4E00\u540D\u5B57\u300D\u7684\u9898\uFF084,968 / 5,828\uFF09
    chordAutoBarreHint: true,       // \u542B\u6A2A\u6309\u7684\u9898\u7B54\u9519\u540E\u81EA\u52A8\u5C55\u5F00\u6A2A\u6309\u624B\u6CD5\u63D0\u793A\uFF08\u7B56\u5212\u4E66 \u00A77.2\uFF09

    /* \u2014\u2014 \u97F3\u7A0B\u6A21\u5F0F\uFF08\u89C4\u683C\uFF1AINTERVAL-MODE-PLAN v11\uFF1B\u5168\u90E8\u5B57\u6BB5\u72EC\u7ACB\uFF0C\u7EDD\u4E0D\u4E0E\u5176\u4ED6\u6A21\u5F0F\u5171\u7528\uFF09\u2014\u2014 */
    intervalPlay: 'a',                 // a = \u4E24\u70B9\u5224\u97F3\u7A0B\uFF1Bb = \u8D77\u70B9+\u97F3\u7A0B\u627E\u4F4D\u7F6E
    intervalRange: '0-12',             // 0-12 | 0-15 | 0-21\uFF08\u65E0 1-5\uFF0CD35\uFF09
    intervalStrings: [6, 5, 4, 3, 2, 1],   // \u72EC\u7ACB\u5F26\u9009\u62E9\uFF08D37\uFF09
    intervalSetA: null,                // \u73A9\u6CD5 A \u97F3\u7A0B\u96C6\u5408\uFF1Bnull = \u7528\u9ED8\u8BA4\uFF08\u57FA\u7840 8 + \u7EAF\u4E00\u5EA6\uFF09
    intervalSetB: null,                // \u73A9\u6CD5 B \u97F3\u7A0B\u96C6\u5408\uFF1Bnull = \u7528\u9ED8\u8BA4\uFF08\u57FA\u7840 8\uFF0C\u6C38\u4E45\u6392\u9664\u7EAF\u4E00\u5EA6\uFF09
    intervalOptionCount: 4,            // \u73A9\u6CD5 A \u9009\u9879\u6570 4\u201312\uFF08D28 \u9ED8\u8BA4 4\uFF0C\u4E0A\u9650\u968F\u96C6\u5408\u6536\u7F29\uFF09
    intervalDirB: 'up',                // \u73A9\u6CD5 B \u65B9\u5411\uFF1Aup | down | random\uFF08D4 \u9ED8\u8BA4 up\uFF09
    intervalEquiv: false,              // \u73A9\u6CD5 B\uFF1A\u5141\u8BB8\u8DE8\u516B\u5EA6\u5339\u914D\uFF08\u53EA\u5F71\u54CD B\uFF0CD1\uFF09
    intervalShowRootName: true,        // \u73A9\u6CD5 B\uFF1A\u663E\u793A\u8D77\u70B9\u97F3\u540D\uFF08D5\uFF09
    intervalClickSound: false,         // \u73A9\u6CD5 B\uFF1A\u70B9\u9009\u53D1\u58F0\uFF08\u9ED8\u8BA4\u5173\uFF0CD22\uFF09
    intervalTimeA: 10,                 // \u73A9\u6CD5 A \u9650\u65F6\uFF08\u79D2\uFF09\uFF0C\u9ED8\u8BA4 10
    intervalTimeB: 15,                 // \u73A9\u6CD5 B \u9650\u65F6\uFF08\u79D2\uFF09\uFF0C\u9ED8\u8BA4 15
    intervalTimeTarget: 'a',           // \u8BBE\u7F6E\u9762\u677F\u6B63\u5728\u7F16\u8F91\u54EA\u4E00\u6863\u9650\u65F6\uFF1Aa | b
    intervalPerFret: false,            // \u9AD8\u628A\u4F4D\u52A0\u65F6\u5F00\u5173\uFF08D27\uFF0C\u72EC\u7ACB\u4E8E timePerFret\uFF09
    intervalSize: 10,                  // \u4E00\u8F6E\u9898\u91CF 5\u201350\uFF08D36\uFF09
    intervalStartMode: 'manual',       // manual | auto\uFF08D34\uFF0C\u72EC\u7ACB\u4E8E startMode\uFF09
    intervalAutoNextOnCorrect: false,  // \u7B54\u5BF9\u540E\u81EA\u52A8\u4E0B\u4E00\u9898\uFF08D34\uFF09
    intervalAutoStartNext: true,       // \u70B9\u300C\u4E0B\u4E00\u9898\u300D\u540E\u662F\u5426\u81EA\u52A8\u5F00\u59CB\uFF08\u72EC\u7ACB\u4E8E intervalStartMode\uFF09
    intervalNovelty: 'mix',            // \u51FA\u9898\u503E\u5411\uFF1Amix \u6DF7\u5408 | new \u4F18\u5148\u65B0\u9898 | familiar \u4F18\u5148\u719F\u7684
    intervalAutoSection: true,         // \u6539\u8303\u56F4/\u5F26/\u97F3\u7A0B\u96C6\u5408\u540E\u7ACB\u5373\u5F00\u65B0\u4E00\u8F6E
    intervalPreview: 'on',             // \u51FA\u9898\u81EA\u52A8\u64AD\u653E\uFF08\u53EA\u64AD\u8D77\u70B9\u97F3\uFF09
    intervalListenDuringAnswer: true,  // \u7B54\u9898\u4E2D\u5141\u8BB8\u91CD\u542C\u8D77\u70B9\u97F3
    intervalAccidental: 'sharp',       // \u97F3\u7A0B\u9898\u9762\u97F3\u540D\u7684\u5199\u6CD5\uFF1Asharp | flat\uFF08\u72EC\u7ACB\u4E8E\u97F3\u540D\u6A21\u5F0F\u7684\u300C\u97F3\u540D\u663E\u793A\u5199\u6CD5\u300D\uFF09
    /* \u97F3\u7A0B\u6A21\u5F0F\u81EA\u5DF1\u7684\u5347\u964D\u8C03\u5F00\u5173\uFF08\u72EC\u7ACB\u4E8E\u97F3\u540D/\u627E\u4F4D\u7F6E\u7684 accSel\uFF0C\u9ED8\u8BA4\u4E09\u9879\u5168\u5F00\uFF1D\u4FDD\u6301\u539F\u6709\u5168\u97F3\u7EA7\u884C\u4E3A\uFF09 */
    intervalAccSel: { nat: true, sharp: true, flat: true },
  };

  // \u9057\u5FD8\u66F2\u7EBF\u95F4\u9694\uFF08\u5206\u949F\uFF09\uFF1A\u7B54\u5BF9\u4E00\u6B21\u5347\u4E00\u7EA7\uFF1B1 = \u7B54\u9519\u540E\u7684\u201C\u91CD\u5B66\u201D
  const SRS_INTERVALS = [2, 10, 60 * 24, 60 * 72, 60 * 24 * 7, 60 * 24 * 15, 60 * 24 * 30, 60 * 24 * 60];
  const LEVEL_LABEL = ['\u672A\u63A5\u89E6', '\u91CD\u5B66\u4E2D', '\u521D\u5B66', '\u719F\u6089', '\u826F\u597D', '\u7A33\u56FA', '\u7CBE\u901A', '\u5927\u5E08'];

  /* ---------------------------------------------------------------
   *  \u6BCF\u9898\u9650\u65F6\uFF1A\u6309\u201C\u5F26 + \u54C1\u533A\u201D\u51B3\u5B9A
   * --------------------------------------------------------------- */
  function fretZone(f) {
    if (f <= 3) return 0;   // \u5F00\u653E\u628A\u4F4D
    if (f <= 7) return 1;   // \u7B2C 2 \u628A\u4F4D
    return 2;               // \u9AD8\u628A\u4F4D
  }
  const ZONE_SLACK = [0, 1.5, 3];   // \u76F8\u5BF9\u57FA\u7840\u9650\u65F6\u7684\u589E\u52A0\u79D2\u6570

  /* \u627E\u4F4D\u7F6E\u6A21\u5F0F\u7684\u9650\u65F6\uFF1A\u9898\u76EE\u7684\u300C\u96BE\u5EA6\u300D\u4E0E\u683C\u5B50\u843D\u5728\u7B2C\u51E0\u54C1\u65E0\u5173 \u2014\u2014
     \u540C\u4E00\u4E2A\u97F3\u540D\u5728 2 \u54C1\u8FD8\u662F 9 \u54C1\uFF0C\u8981\u505A\u7684\u52A8\u4F5C\u5B8C\u5168\u4E00\u6837\uFF08\u628A\u8BE5\u97F3\u540D\u5728\u8303\u56F4\u5185\u7684
     \u5168\u90E8\u683C\u5B50\u70B9\u9F50\uFF09\uFF0C\u9AD8\u628A\u4F4D\u52A0\u65F6\u53EA\u4F1A\u8BA9\u62BD\u5230\u9AD8\u628A\u4F4D\u7684\u9898\u83AB\u540D\u591A\u7ED9 3 \u79D2\u3002
     \u6240\u4EE5 pos \u4E0B\u76F4\u63A5\u8DF3\u8FC7 timePerFret \u7684\u52A0\u65F6\uFF08\u4E0D\u662F\u9690\u85CF UI\uFF0C\u662F\u4ECE\u903B\u8F91\u4E0A\u5173\u6389\uFF0C
     \u8001\u5B58\u6863\u91CC timePerFret:'fret' \u4E5F\u4E0D\u4F1A\u5077\u5077\u751F\u6548\uFF09\u3002
     \u97F3\u7A0B\u6A21\u5F0F\u8D70\u81EA\u5DF1\u7684 intervalLimitFor / intervalPerFret\uFF0C\u5B8C\u5168\u4E0D\u53D7\u5F71\u54CD\u3002 */
  function timeLimitFor(s, f) {
    const st = store.settings;
    // \u65E0\u9650\u65F6\u957F\uFF08\u5012\u8BA1\u65F6\u9009\u9879\u4E4B\u4E00\uFF09\uFF1A\u6C38\u8FDC\u4E0D\u8D85\u65F6
    if (st.time === 'inf') return Infinity;
    /* \u627E\u4F4D\u7F6E\u73A9\u6CD5 B\uFF1A\u4E00\u9898\u626B\u6574\u5757\u6307\u677F\uFF0C\u6CA1\u6709\u300C\u67D0\u4E00\u6839\u5F26\u300D\u53EF\u8C08\uFF0C
       \u6309\u5F26\u9650\u65F6\u4E5F\u5C31\u6CA1\u6709\u5BF9\u8C61\uFF08\u8001\u5B58\u6863\u91CC\u914D\u8FC7\u7684\u503C\u540C\u6837\u4E0D\u751F\u6548\uFF09\u3002 */
    const posB = st.mode === 'pos' && st.posPlay !== 'a';
    const perString = !posB && st.timePerString && st.timePerString[s];
    const base = perString ? Number(perString) : Number(st.time) || 10;
    if (st.mode === 'pos') return base;
    if (st.timePerFret === 'fret') return clamp(base + ZONE_SLACK[fretZone(f)], 2, 40);
    return base;
  }
  // \u5269\u4F59\u65F6\u95F4 / \u6BD4\u4F8B\uFF08\u65E0\u9650\u65F6\u957F\u8FD4\u56DE Infinity / 1\uFF09
  function leftMs() {
    if (round.limit === Infinity) return Infinity;
    return Math.max(0, round.deadline - nowMs());
  }
  function totalLimitMs() { return round.limit === Infinity ? Infinity : round.limit * 1000; }
  function limitLabel(sec) {
    if (sec === 'inf' || sec === Infinity) return '\u4E0D\u9650\u65F6';
    return fmtSec(Number(sec));
  }
  function fmtSec(v) { return (Math.round(v * 10) / 10) + ' \u79D2'; }
  function fmtShort(v) { return (Math.round(v * 10) / 10) + '\u79D2'; }

  /* ---------------------------------------------------------------
   *  \u5DE5\u5177\u51FD\u6570
   * --------------------------------------------------------------- */
  const $ = (sel) => document.querySelector(sel);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const nowMs = () => Date.now();
  const pcOf = (midi) => ((midi % 12) + 12) % 12;

  /* \u97F3\u540D\u5199\u6CD5\uFF1A\u9898\u76EE\u201C\u53EA\u51FA\u5347\u53F7\u201D\u65F6\u56FA\u5B9A\u5199 \u266F\uFF0C\u201C\u53EA\u51FA\u964D\u53F7\u201D\u65F6\u56FA\u5B9A\u5199 \u266D\uFF1B\u6DF7\u5408\u6A21\u5F0F\u6309\u7528\u6237\u504F\u597D */
  function displayAccidental() {
    const sel = accSel();
    if (!sel.flat && sel.sharp) return 'sharp';
    if (sel.flat && !sel.sharp) return 'flat';
    return store.settings.accidental;
  }
  function noteName(pc) {
    const n = SEMI[pc];
    if (displayAccidental() === 'flat' && FLAT[n]) return FLAT[n];
    return SHARP[n] || n;
  }
  function noteNameSharp(pc) { return SHARP[SEMI[pc]] || SEMI[pc]; }
  /* \u548C\u5F26\u6A21\u5F0F\u81EA\u5DF1\u7684\u97F3\u540D\u5199\u6CD5\uFF08\u72EC\u7ACB\u4E8E\u97F3\u540D/\u627E\u4F4D\u7F6E\u7684\u300C\u97F3\u540D\u663E\u793A\u5199\u6CD5\u300D\uFF0C\u4E5F\u72EC\u7ACB\u4E8E\u97F3\u7A0B\uFF09 */
  function chordAccidental() {
    return store.settings.chordAccidental === 'flat' ? 'flat' : 'sharp';
  }
  /* \u97F3\u7A0B\u6A21\u5F0F\u81EA\u5DF1\u7684\u97F3\u540D\u5199\u6CD5\uFF1A\u4F18\u5148\u670D\u4ECE\u97F3\u7A0B\u81EA\u5DF1\u7684\u5347\u964D\u8C03\u5F00\u5173\uFF08\u53EA\u51FA\u5347\u53F7\u5C31\u5199 \u266F\uFF09\uFF0C
     \u6DF7\u5408\u65F6\u6309\u97F3\u7A0B\u81EA\u5DF1\u7684\u5199\u6CD5\u504F\u597D\uFF0C\u5B8C\u5168\u4E0D\u770B\u97F3\u540D\u6A21\u5F0F\u7684 accidental\u3002 */
  function intervalAccidental() {
    const sel = intervalAccSel();
    if (!sel.flat && sel.sharp) return 'sharp';
    if (sel.flat && !sel.sharp) return 'flat';
    return store.settings.intervalAccidental === 'flat' ? 'flat' : 'sharp';
  }
  function intervalNoteName(pc) {
    const n = SEMI[pc];
    if (intervalAccidental() === 'flat' && FLAT[n]) return FLAT[n];
    return SHARP[n] || n;
  }
  // \u7B54\u6848\u6309\u201C\u9898\u76EE\u7684\u5199\u6CD5\u201D\u663E\u793A\uFF1A\u5347\u53F7\u9898\u5199 \u266F\u3001\u964D\u53F7\u9898\u5199 \u266D\u3001\u81EA\u7136\u97F3\u65E0\u6240\u8C13
  function noteNameFor(pc, spelling) {
    if (spelling === 'flat' && FLAT[SEMI[pc]]) return FLAT[SEMI[pc]];
    return noteNameSharp(pc);
  }
  const NATURAL_PCS = [0, 2, 4, 5, 7, 9, 11];

  // \u5F53\u524D\u201C\u9898\u76EE\u5347\u964D\u8C03\u201D\u7684\u9009\u62E9\uFF08\u591A\u9009\uFF09\uFF1A{ nat, sharp, flat }\uFF0C\u81F3\u5C11\u4FDD\u7559\u4E00\u9879
  function accSel() {
    const s = store.settings;
    if (!s.accSel) s.accSel = { nat: true, sharp: true, flat: true };
    return s.accSel;
  }
  // \u5F53\u524D\u9898\u76EE\u8BBE\u7F6E\u4E0B\u5141\u8BB8\u51FA\u73B0\u7684\u97F3\u7EA7\u96C6\u5408\uFF08\u81EA\u7136\u97F3 / \u5347\u53F7 / \u964D\u53F7\u4EFB\u610F\u7EC4\u5408\uFF09
  function allowedPcs() {
    const sel = accSel();
    const out = [];
    if (sel.nat) NATURAL_PCS.forEach((p) => out.push(p));
    if (sel.sharp) [1, 6, 10].forEach((p) => { if (out.indexOf(p) < 0) out.push(p); });
    if (sel.flat) [3, 8, 10].forEach((p) => { if (out.indexOf(p) < 0) out.push(p); });   // A\u266F / B\u266D \u540C\u97F3\uFF0C\u53EA\u7B97\u4E00\u6B21
    return out.sort((a, b) => a - b);
  }
  // \u7531\u65E7\u8BBE\u7F6E / \u8C03\u8BD5\u6761\u6309\u94AE\u751F\u6210\u591A\u9009\u7EC4\u5408
  function accSelFromMode(mode) {
    if (mode === 'natural') return { nat: true, sharp: false, flat: false };
    if (mode === 'sharp') return { nat: true, sharp: true, flat: false };
    if (mode === 'flat') return { nat: true, sharp: false, flat: true };
    if (mode === 'sharpflat') return { nat: true, sharp: true, flat: true };   // \u5347\u53F7 + \u964D\u53F7\u90FD\u51FA\u73B0
    return { nat: true, sharp: true, flat: true };
  }
  function accModeName() {
    const sel = accSel();
    const parts = [];
    if (sel.nat) parts.push('\u81EA\u7136\u97F3');
    if (sel.sharp) parts.push('\u5347\u53F7');
    if (sel.flat) parts.push('\u964D\u53F7');
    if (parts.length === 3) return '\u266F\u266D \u5168\u90E8';
    return parts.join(' + ') || '\u81EA\u7136\u97F3';
  }

  /* \u2014\u2014 \u97F3\u7A0B\u6A21\u5F0F\u81EA\u5DF1\u7684\u5347\u964D\u8C03\u5F00\u5173 \u2014\u2014
     \u4E0E\u97F3\u540D/\u627E\u4F4D\u7F6E\u7684 accSel \u5B8C\u5168\u72EC\u7ACB\uFF1A\u4E24\u4E2A\u5B57\u6BB5\u4E92\u4E0D\u5F71\u54CD\uFF0C\u97F3\u7A0B\u6539\u8FD9\u91CC\u4E0D\u4F1A\u52A8\u97F3\u540D\u51FA\u9898\uFF0C
     \u53CD\u4E4B\u4EA6\u7136\u3002\u9ED8\u8BA4\u4E09\u9879\u5168\u5F00\uFF0C\u7B49\u4E8E\u4FDD\u6301\u539F\u6709\u300C\u5168\u97F3\u7EA7\u300D\u51FA\u9898\u8303\u56F4\u3002 */
  function intervalAccSel() {
    const s = store.settings;
    if (!s.intervalAccSel || typeof s.intervalAccSel !== 'object') {
      s.intervalAccSel = { nat: true, sharp: true, flat: true };
    }
    return s.intervalAccSel;
  }
  function intervalAccModeName() {
    const sel = intervalAccSel();
    const parts = [];
    if (sel.nat) parts.push('\u81EA\u7136\u97F3');
    if (sel.sharp) parts.push('\u5347\u53F7');
    if (sel.flat) parts.push('\u964D\u53F7');
    if (parts.length === 3) return '\u266F\u266D \u5168\u90E8';
    return parts.join(' + ') || '\u81EA\u7136\u97F3';
  }
  /* \u97F3\u7A0B\u51FA\u9898\u5141\u8BB8\u7684\u97F3\u7EA7\u96C6\u5408\u3002\u4E0E allowedPcs() \u540C\u4E00\u5957\u97F3\u7EA7\u5B9A\u4E49\uFF0C\u4F46\u8BFB\u7684\u662F\u97F3\u7A0B\u81EA\u5DF1\u7684\u5F00\u5173\u3002
     \u6CE8\u610F\uFF1A\u4E09\u9879\u5168\u5173\u65F6\u9000\u56DE\u81EA\u7136\u97F3\uFF08\u4E0E\u97F3\u540D\u6A21\u5F0F\u300C\u4E24\u4E2A\u5F00\u5173\u90FD\u5173\u6389 = \u53EA\u51FA\u81EA\u7136\u97F3\u300D\u4E00\u81F4\uFF09\uFF0C
     \u7EDD\u4E0D\u8FD4\u56DE\u7A7A\u6570\u7EC4 \u2014\u2014 \u7A7A\u96C6\u5408\u4F1A\u8BA9\u6574\u8F6E\u65E0\u9898\u53EF\u51FA\u3002 */
  function intervalAllowedPcs() {
    const sel = intervalAccSel();
    const out = [];
    if (sel.nat) NATURAL_PCS.forEach((p) => out.push(p));
    if (sel.sharp) [1, 6, 10].forEach((p) => { if (out.indexOf(p) < 0) out.push(p); });
    if (sel.flat) [3, 8, 10].forEach((p) => { if (out.indexOf(p) < 0) out.push(p); });   // A\u266F / B\u266D \u540C\u97F3\uFF0C\u53EA\u7B97\u4E00\u6B21
    if (!out.length) NATURAL_PCS.forEach((p) => out.push(p));
    return out.sort((a, b) => a - b);
  }
  /* \u628A\u4EFB\u610F\u6765\u6E90\u7684 {nat,sharp,flat} \u5F52\u4E00\u6210\u5408\u6CD5\u503C\uFF08\u7F3A\u9879\u6309 true \u8865\uFF0C\u81F3\u5C11\u7559\u4E00\u9879\uFF09\u3002
     \u5B58\u6863\u3001\u5BFC\u5165\u5907\u4EFD\u3001\u8BBE\u7F6E\u9762\u677F\u90FD\u8D70\u8FD9\u4E00\u4EFD\uFF0C\u907F\u514D\u4E09\u5904\u5404\u5199\u4E00\u904D\u89C4\u5219\u3002 */
  function normalizeAccSel(raw) {
    const r = raw && typeof raw === 'object' ? raw : {};
    const sel = {
      nat: r.nat === undefined ? true : r.nat === true,
      sharp: r.sharp === true,
      flat: r.flat === true,
    };
    if (!sel.nat && !sel.sharp && !sel.flat) sel.nat = true;
    return sel;
  }
  function posKey(s, f) { return 's' + s + 'f' + f; }
  function midiOf(s, f) {
    const st = STRINGS.find((x) => x.n === s);
    return st.midi + f;
  }

  /* \u5728\u6307\u677F\u4E0A\u627E\u4E00\u4E2A\u300C\u97F3\u7EA7 = pc\u3001\u4E14\u4E0D\u662F correctCell\u300D\u7684\u683C\u5B50\uFF0C\u7528\u4E8E\u6807\u51FA\u7528\u6237\u7B54\u9519\u7684\u4F4D\u7F6E\u3002
     \u4F18\u5148\u540C\u4E00\u6839\u5F26\uFF08\u7528\u6237\u591A\u534A\u662F\u542C\u9519\u5F26/\u770B\u9519\u4F4D\u7F6E\uFF09\uFF0C\u5426\u5219\u53D6\u6700\u8FD1\u7684\u5F26\u3002
     \u8FD4\u56DE null \u8868\u793A\u627E\u4E0D\u5230\uFF08\u7406\u8BBA\u4E0A\u4E0D\u4F1A\uFF1A12 \u4E2A\u97F3\u7EA7\u5728 0\u201312 \u54C1\u5185\u90FD\u81F3\u5C11\u51FA\u73B0\u4E00\u6B21\uFF09\u3002 */
  function cellForPc(pc, correctCell) {
    const maxF = rangeFretMax();
    let best = null;
    let bestScore = Infinity;
    for (const st of STRINGS) {
      for (let f = 0; f <= maxF; f++) {
        if (pcOf(midiOf(st.n, f)) !== pc) continue;
        if (correctCell && st.n === correctCell.s && f === correctCell.f) continue;
        /* \u8BC4\u5206\uFF1A\u540C\u5F26\u4F18\u5148\uFF08\u6743\u91CD 0\uFF09\uFF0C\u7136\u540E\u6309\u5F26\u8DDD + \u54C1\u8DDD\u53D6\u6700\u8FD1 */
        const ds = correctCell ? Math.abs(st.n - correctCell.s) : 0;
        const df = correctCell ? Math.abs(f - correctCell.f) : 0;
        const score = ds * 100 + df;
        if (score < bestScore) { bestScore = score; best = { s: st.n, f: f }; }
      }
    }
    return best;
  }
  function fmtClock(ts) {
    const d = new Date(ts);
    const hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    if (new Date().toDateString() === d.toDateString()) return hm;
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + hm;
  }
  function fmtRelative(ms) {
    const diff = ms - nowMs();
    if (diff <= 0) return '\u73B0\u5728';
    const m = Math.round(diff / 60000);
    if (m < 60) return m + ' \u5206\u949F\u540E';
    const h = Math.round(m / 60);
    if (h < 24) return h + ' \u5C0F\u65F6\u540E';
    return Math.round(h / 24) + ' \u5929\u540E';
  }
  function fmtInterval(min) {
    if (min < 60) return Math.round(min) + ' \u5206\u949F';
    if (min < 60 * 24) return Math.round(min / 60) + ' \u5C0F\u65F6';
    return Math.round(min / 1440) + ' \u5929';
  }
  function shuffle(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = r[i]; r[i] = r[j]; r[j] = t;
    }
    return r;
  }

  /* ---------------------------------------------------------------
   *  \u6301\u4E45\u5316\u5B58\u50A8
   * --------------------------------------------------------------- */
  /* \u6A21\u5F0F\u7EA7\u7D2F\u8BA1\u7684\u4E00\u4EFD\u7A7A\u7EDF\u8BA1\u3002\u56DB\u4E2A\u6A21\u5F0F\u5404\u4E00\u4EFD\uFF0C\u5F62\u72B6\u5B8C\u5168\u4E00\u81F4 \u2014\u2014
     \u4FA7\u680F\u56FE2 \u7684\u56DB\u683C\u53EA\u8BA4\u8FD9\u56DB\u4E2A\u5B57\u6BB5\uFF0C\u522B\u5904\u4E0D\u8981\u518D\u53E6\u5B58\u4E00\u4EFD\u3002 */
  function blankModeStat() {
    return { right: 0, wrong: 0, streak: 0, bestCombo: 0 };
  }
  function blankModeStats() {
    return { note: blankModeStat(), pos: blankModeStat(), chord: blankModeStat(), interval: blankModeStat() };
  }
  const MODE_STAT_KEYS = ['note', 'pos', 'chord', 'interval'];

  /* \u628A\u4EFB\u610F\u810F\u503C\u6D17\u6210\u4E00\u4EFD\u5408\u6CD5\u7684\u6A21\u5F0F\u7D2F\u8BA1\uFF08\u7F3A\u9879\u8865 0\uFF0C\u8D1F\u6570\u5F52 0\uFF0CbestCombo \u4E0D\u5C0F\u4E8E streak\uFF09 */
  function normalizeModeStat(raw) {
    const r = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const num = (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    };
    const out = {
      right: num(r.right),
      wrong: num(r.wrong),
      streak: num(r.streak),
      bestCombo: num(r.bestCombo),
    };
    if (out.bestCombo < out.streak) out.bestCombo = out.streak;
    return out;
  }

  /* \u56DB\u4EFD\u6A21\u5F0F\u7D2F\u8BA1\u4E00\u8D77\u6D17\uFF08\u5BFC\u5165\u5907\u4EFD / \u8BFB\u5B58\u6863\u5171\u7528\uFF09 */
  function normalizeModeStats(raw) {
    const out = blankModeStats();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    MODE_STAT_KEYS.forEach((m) => { out[m] = normalizeModeStat(raw[m]); });
    return out;
  }

  let store = {
    /* \u5B58\u6863\u7ED3\u6784\u7248\u672C\uFF1A2 = \u4FA7\u680F\u91CD\u6784\uFF08\u56FE2/\u56FE3/\u56FE1/\u56FE4 \u56DB\u5757\u9762\u677F\uFF09\u90A3\u4E00\u7248\u3002
       \u5C0F\u4E8E\u5B83\u7684\u5B58\u6863\u5728\u5B66\u4E60\u6570\u636E\u4E0A\u4E0D\u53EF\u6BD4\uFF0Cload() \u4F1A\u6574\u4F53\u6E05\u7A7A\u4E00\u6B21\uFF08\u4FDD\u7559 settings\uFF09\u3002 */
    schemaVersion: SCHEMA_VERSION,
    settings: Object.assign({}, DEFAULT_SETTINGS),
    cards: {}, history: [],
    /* \u6A21\u5F0F\u7EA7\u7D2F\u8BA1\uFF08\u56FE2 \u7684\u56DB\u683C\uFF09\uFF1A\u56DB\u4E2A\u6A21\u5F0F\u5404\u4E00\u4EFD\uFF0C\u5237\u65B0\u4E0D\u5F52\u96F6\u3002
       \u627E\u4F4D\u7F6E\u53EA\u6709\u73A9\u6CD5 A \u5199\u8FD9\u4E00\u4EFD \u2014\u2014 \u73A9\u6CD5 B \u7684\u56FE2 \u662F\u300C\u672C\u9898\u300D\u89C6\u89D2\uFF08D62\uFF09\u3002 */
    modeStats: blankModeStats(),
    /* \u627E\u4F4D\u7F6E\u5355\u4F4D\u7EDF\u8BA1\uFF08\u56FE1 / \u56FE4 \u7684\u6570\u636E\u6E90\uFF09\uFF1A\u952E = posUnitKey()\u3002
       A = ps<\u5F26>n<\u97F3\u7EA7>\uFF08\u300C4 \u5F26 \u00B7 C\u300D\uFF09\uFF0CB = pn<\u97F3\u7EA7>\uFF08\u300CC \u00B7 \u5168\u6307\u677F\u300D\uFF09\u3002 */
    posUnitStats: {},
    /* \u627E\u4F4D\u7F6E\u73A9\u6CD5 B \u7684\u672C\u56DE\u5408\u7EDF\u8BA1\uFF1A
       done / full \u662F\u7D2F\u8BA1\uFF08\u4FDD\u7559\u65E7\u5B57\u6BB5\uFF09\uFF1Bstreak / bestCombo \u6309\u300C\u672C\u9898\u5168\u5BF9\u300D\u8BA1\uFF1B
       last = \u672C\u9898\u6210\u7EE9\u5FEB\u7167\uFF0C\u7B54\u5B8C\u5199\u4E00\u6B21\u3001\u70B9\u300C\u4E0B\u4E00\u9898\u300D\u6E05\u6210 null\uFF08D67\uFF09\u3002 */
    posBStats: { done: 0, full: 0, streak: 0, bestCombo: 0, last: null },
    /* \u627E\u4F4D\u7F6E\u6700\u8FD1\u82E5\u5E72\u9898\u7684\u7CBE\u7B80\u8BB0\u5F55\uFF08\u8DE8 A/B\u3001\u9000\u51FA\u6A21\u5F0F\u3001\u5237\u65B0\u90FD\u4E0D\u6E05\u96F6\uFF09\u3002
       \u4FA7\u680F\u5DF2\u4E0D\u518D\u8BFB\u5B83\uFF0C\u4FDD\u7559\u662F\u56E0\u4E3A __gft.posRecent() \u4E0E\u82E5\u5E72\u6D4B\u8BD5\u4ECD\u5728\u7528\uFF1B
       \u65B0\u4EE3\u7801\u8981\u300C\u672C\u9898\u6210\u7EE9\u300D\u8BF7\u8BFB posBStats.last\uFF0C\u8981\u300C\u5355\u4F4D\u5386\u53F2\u300D\u8BF7\u8BFB posUnitStats\u3002 */
    posRecent: [],
    /* \u627E\u4F4D\u7F6E\u6A21\u5F0F\u7684\u590D\u4E60\u5361\u7247\uFF08\u4E0E\u97F3\u540D\u6A21\u5F0F\u5F7B\u5E95\u5206\u5F00\u7684\u4E00\u5957\uFF09\u3002
       \u952E\u4ECD\u7528 's<\u5F26>f<\u54C1>'\uFF0C\u4F46\u5B58\u5728\u72EC\u7ACB map \u91CC\uFF0C\u4E0D\u548C store.cards \u62A2\u540C\u4E00\u6279\u952E\uFF1A
       \u4EE5\u524D\u4E24\u6A21\u5F0F\u5171\u7528 store.cards\uFF0C\u5BFC\u81F4\u300C\u6E05\u7A7A\u627E\u4F4D\u7F6E\u5B66\u4E60\u6570\u636E\u300D\u8981\u4E48\u6E05\u4E0D\u5E72\u51C0
       \uFF08\u6015\u8BEF\u5220\u97F3\u540D\u7684\u8FDB\u5EA6\uFF09\uFF0C\u8981\u4E48\u628A\u97F3\u540D\u7684\u5361\u4E00\u8D77\u5220\u6389\u3002\u5206\u5F00\u4E4B\u540E\u5C31\u5404\u6E05\u5404\u7684\u3002 */
    posCards: {},
    /* \u548C\u5F26\u6A21\u5F0F\u72EC\u7ACB\u547D\u540D\u7A7A\u95F4\uFF1A\u7EDD\u4E0D\u4E0E\u5355\u97F3\u7684 cards / history \u6DF7\u7528\u3002
       chordCards \u7684\u952E\u662F 'c:<rootPc>:<qualityId>'\uFF0C\u4E0E 's<\u5F26>f<\u54C1>' \u5B8C\u5168\u4E0D\u540C\u7684\u5F62\u72B6\u3002
       \u9898\u5E93\u5316\u4E4B\u540E\uFF0C\u9898\u76EE\u7C92\u5EA6\u662F\u300C\u4E00\u6761\u6307\u6CD5\u300D\u800C\u4E0D\u662F\u300C\u4E00\u4E2A (\u6839\u97F3,\u8D28\u91CF) \u7EC4\u5408\u300D\uFF0C
       \u6240\u4EE5\u53E6\u5F00\u4E00\u4EFD\u6309\u9898\u7EDF\u8BA1\uFF1AchordRows \u7684\u952E\u662F 'r:<\u9898\u5E93\u884C\u4E0B\u6807>'\u3002 */
    chordCards: {}, chordHistory: [],
    chordRows: {},
    /* \u97F3\u7A0B\u6A21\u5F0F\u72EC\u7ACB\u547D\u540D\u7A7A\u95F4\uFF1A\u952E\u5F62\u5982 'i:a:M3:up:exact:d1g0'\uFF0C\u4E0E\u4E0A\u9762\u4E24\u8005\u90FD\u4E0D\u540C\u3002 */
    intervalCards: {}, intervalHistory: [],
  };

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (raw) {
        store.settings = Object.assign({}, DEFAULT_SETTINGS, raw.settings || {});
        // \u8FC1\u79FB\uFF1A\u65E7\u7248\u201C\u4EC5\u81EA\u7136\u97F3\u201D\u8303\u56F4 \u2192 \u65B0\u7684\u201C\u9898\u76EE\u5347\u964D\u8C03\u201D
        if (store.settings.range === 'natural') {
          store.settings.range = '0-12';
          store.settings.accidentalMode = 'natural';
          store.settings.accSel = { nat: true, sharp: false, flat: false };
        }
        /* \u8FC1\u79FB\uFF1A\u65E7\u7248\u66FE\u6709\u300C0-24 \u54C1\u300D\u9009\u9879\uFF0C\u73B0\u5DF2\u6539\u4E3A\u300C0-21 \u54C1\u300D
           \uFF0824 \u54C1\u8D85\u51FA board.svg \u7684\u6307\u677F\u56FE\u5F62\u8303\u56F4\uFF0C21 \u54C1\u521A\u597D\u8986\u76D6\uFF09\u3002
           \u5B58\u91CF\u6570\u636E\u91CC\u82E5\u8FD8\u662F 0-24\uFF0C\u8FD9\u91CC\u987A\u624B\u6362\u6210 0-21\uFF0C\u907F\u514D\u51FA\u73B0\u65E0\u6548\u503C\u3002 */
        if (store.settings.range === '0-24') store.settings.range = '0-21';
        /* \u8FC1\u79FB\uFF1A\u8303\u56F4\u4ECE\u300C\u5168\u5C40\u4E00\u4E2A\u300D\u62C6\u6210\u300C\u6309\u6A21\u5F0F\u5404\u4E00\u4E2A\u300D\u3002
           \u65E7\u5B58\u6863\u53EA\u6709 range \u2014\u2014 \u628A\u5B83\u540C\u65F6\u7ED9\u4E24\u4E2A\u6A21\u5F0F\uFF0C\u884C\u4E3A\u4E0E\u5347\u7EA7\u524D\u4E00\u81F4\uFF1B
           \u65B0\u5B58\u6863\u91CC\u4E24\u4E2A\u5B57\u6BB5\u90FD\u5728\uFF0C\u5C31\u4E0D\u52A8\u5B83\u4EEC\u3002 */
        if (typeof store.settings.noteRange !== 'string') {
          store.settings.noteRange = store.settings.range || '0-12';
        }
        if (typeof store.settings.posRange !== 'string') {
          store.settings.posRange = store.settings.range || '0-12';
        }
        // \u8FC1\u79FB\uFF1A\u65E7\u7248\u5355\u4E00\u6A21\u5F0F \u2192 \u591A\u9009\u7EC4\u5408
        if (!store.settings.accSel) {
          store.settings.accSel = accSelFromMode(store.settings.accidentalMode || 'both');
        }
        /* \u97F3\u7A0B\u6A21\u5F0F\u81EA\u5DF1\u7684\u5347\u964D\u8C03\u5F00\u5173\uFF1A\u65E7\u5B58\u6863\u6CA1\u6709\u8FD9\u4E2A\u5B57\u6BB5 \u2192 \u9ED8\u8BA4\u4E09\u9879\u5168\u5F00\uFF0C
           \u7B49\u4E8E\u4FDD\u6301\u5347\u7EA7\u524D\u300C\u5168\u97F3\u7EA7\u300D\u7684\u51FA\u9898\u8303\u56F4\uFF08\u4E0D\u6539\u884C\u4E3A\uFF09\u3002\u810F\u503C\u53EA\u505A\u5E03\u5C14\u5F52\u4E00\u3002 */
        store.settings.intervalAccSel = normalizeAccSel(store.settings.intervalAccSel);
        /* \u97F3\u7A0B\u9650\u65F6\u9762\u677F\u6B63\u5728\u7F16\u8F91\u7684\u90A3\u4E00\u6863\uFF08a | b\uFF09\uFF1A\u65E7\u5B58\u6863\u6CA1\u6709\u8FD9\u4E2A\u5B57\u6BB5\uFF0C
           Object.assign \u5DF2\u8865\u6210\u9ED8\u8BA4 'a'\uFF1B\u8FD9\u91CC\u53EA\u628A\u4E0D\u8BA4\u8BC6\u7684\u810F\u503C\u5F52\u4E00\u3002 */
        if (store.settings.intervalTimeTarget !== 'b') store.settings.intervalTimeTarget = 'a';
        /* \u9636\u6BB5\u56DB\u65B0\u589E\u7684\u4E09\u4E2A\u97F3\u9891\u8BBE\u7F6E\uFF1AObject.assign \u5DF2\u7ECF\u628A\u7F3A\u5B57\u6BB5\u8865\u6210\u9ED8\u8BA4\u503C\uFF0C
           \u8FD9\u91CC\u53EA\u628A\u300C\u5B58\u91CF\u91CC\u5B58\u5728\u4F46\u503C\u4E0D\u8BA4\u8BC6\u300D\u7684\u60C5\u51B5\u5F52\u4E00\uFF0C\u907F\u514D\u51FA\u73B0
           \u4E00\u4E2A\u65E2\u4E0D\u662F strum/strumUp/block\u3001\u4E5F\u4E0D\u662F wrongOnly/always/off \u7684\u810F\u503C
           \u6084\u6084\u8BA9\u64AD\u653E\u903B\u8F91\u8D70\u5230\u610F\u6599\u4E4B\u5916\u7684\u5206\u652F\u3002 */
        if (['strum', 'strumUp', 'block'].indexOf(store.settings.chordStrum) < 0) {
          store.settings.chordStrum = 'strum';
        }
        if (['wrongOnly', 'always', 'off'].indexOf(store.settings.chordRevealPlay) < 0) {
          store.settings.chordRevealPlay = 'wrongOnly';
        }
        if (typeof store.settings.chordListenDuringAnswer !== 'boolean') {
          store.settings.chordListenDuringAnswer = true;
        }
        if (typeof store.settings.chordAListenAnswer !== 'boolean') {
          store.settings.chordAListenAnswer = true;
        }
        /* \u9650\u65F6\u4E09\u6001\u5F52\u4E00\uFF1A'inf' \u8868\u793A\u4E0D\u9650\u65F6\uFF0C\u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u539F\u6587\uFF1B
           \u6570\u5B57\u578B\u810F\u503C\u5939\u5230\u5408\u6CD5\u533A\u95F4\uFF0C\u5176\u4F59\u56DE\u843D\u5230\u9ED8\u8BA4\u503C\u3002 */
        store.settings.chordTime = {
          n2f: chordTimeOf(store.settings, 'n2f'),
          f2n: chordTimeOf(store.settings, 'f2n'),
        };
        store.settings.intervalTimeA = intervalTimeOf(store.settings.intervalTimeA, 10);
        store.settings.intervalTimeB = intervalTimeOf(store.settings.intervalTimeB, 15);
        if (!Array.isArray(store.settings.strings) || !store.settings.strings.length) {
          store.settings.strings = DEFAULT_SETTINGS.strings.slice();
        }
        /* \u8FC1\u79FB\uFF1A\u58F0\u97F3\u4ECE\u300C\u5168\u5C40\u4E00\u4E2A muted / volume\u300D\u62C6\u6210\u300C\u6309\u6A21\u5F0F\u5404\u4E00\u5BF9\u300D\u3002
           \u65E7\u5B58\u6863\u91CC\u53EA\u6709\u5168\u5C40\u5B57\u6BB5 \u2014\u2014 \u628A\u5B83\u843D\u5230\u5F53\u65F6\u90A3\u4E2A\u6A21\u5F0F\u4E0A\uFF0C\u5176\u4F59\u6A21\u5F0F\u7528\u9ED8\u8BA4\u503C\uFF1B
           \u884C\u4E3A\u4E0E\u5347\u7EA7\u524D\u4E00\u81F4\uFF08\u5347\u7EA7\u524D\u56DB\u4E2A\u6A21\u5F0F\u672C\u6765\u5C31\u5171\u7528\u8FD9\u4E00\u4EFD\uFF09\u3002
           \u65B0\u5B58\u6863\u91CC\u516B\u4E2A\u5B57\u6BB5\u90FD\u5728\uFF0C\u5C31\u53EA\u505A\u503C\u6E05\u6D17\uFF0C\u4E0D\u52A8\u5B83\u4EEC\u7684\u76F8\u5BF9\u5173\u7CFB\u3002 */
        migrateModeSound(raw.settings || {});
        syncLegacySound();
        /* \u2014\u2014 \u5B66\u4E60\u6570\u636E\uFF1A\u7ED3\u6784\u7248\u672C\u4E0D\u8DB3\u65F6\u6574\u4F53\u6E05\u7A7A\uFF08D36\uFF09\u2014\u2014
           \u4FA7\u680F\u91CD\u6784\u628A\u7EDF\u8BA1\u53E3\u5F84\u4ECE\u300Chistory \u73B0\u7B97\u300D\u6362\u6210\u4E86 modeStats / posUnitStats\uFF0C
           \u65E7\u5B58\u6863\u91CC\u7684\u6570\u5B57\u65E2\u5BF9\u4E0D\u4E0A\u65B0\u53E3\u5F84\uFF0C\u4E5F\u5168\u662F\u6D4B\u8BD5\u671F\u9057\u7559\u6570\u636E\uFF0C\u6240\u4EE5\u4E00\u6B21\u6027\u6E05\u6389\u3002
           settings\uFF08\u9898\u91CF / \u5F26 / \u8303\u56F4 / \u58F0\u97F3\u504F\u597D\uFF09\u4FDD\u7559\uFF0C\u4E0D\u6E05\u3002 */
        if (Number(raw.schemaVersion) >= SCHEMA_VERSION) {
          store.cards = raw.cards || {};
          store.history = Array.isArray(raw.history) ? raw.history.slice(-300) : [];
          /* \u548C\u5F26\u6570\u636E\uFF1A\u65E7\u5B58\u6863\u91CC\u6CA1\u6709\u8FD9\u4E24\u4E2A\u5B57\u6BB5\uFF0C\u521D\u59CB\u5316\u4E3A\u7A7A\u7ED3\u6784\uFF0C\u7EDD\u4E0D\u56E0\u6B64\u8BA9\u6574\u4E2A store \u52A0\u8F7D\u5931\u8D25\u3002
             \u5177\u4F53\u6E05\u6D17\uFF08\u975E\u6CD5\u952E\u3001\u672A\u77E5\u8D28\u91CF\u3001\u8D8A\u754C\u7B49\u7EA7\uFF09\u4EA4\u7ED9 repairCards()\uFF0C\u4E0E\u5355\u97F3\u5361\u7247\u540C\u4E00\u5904\u5904\u7406\u3002 */
          store.chordCards = (raw.chordCards && typeof raw.chordCards === 'object' && !Array.isArray(raw.chordCards))
            ? raw.chordCards : {};
          store.chordHistory = Array.isArray(raw.chordHistory) ? raw.chordHistory.slice(-CHORD_HISTORY_LIMIT) : [];
          /* \u6309\u9898\u7EDF\u8BA1\uFF08\u9898\u5E93\u5316\u540E\u65B0\u589E\uFF09\uFF1A\u65E7\u5B58\u6863\u6CA1\u6709\u8FD9\u4E2A\u5B57\u6BB5\uFF0C\u7A7A\u5BF9\u8C61\u8D77\u6B65\u5373\u53EF\u3002
             \u6E05\u6D17\u4EA4\u7ED9 repairChordRows()\u3002 */
          store.chordRows = (raw.chordRows && typeof raw.chordRows === 'object' && !Array.isArray(raw.chordRows))
            ? raw.chordRows : {};
          /* \u97F3\u7A0B\u6570\u636E\uFF1A\u65E7\u5B58\u6863\u6CA1\u6709\u8FD9\u4E24\u4E2A\u5B57\u6BB5\uFF0C\u521D\u59CB\u5316\u4E3A\u7A7A\u7ED3\u6784\u3002
             \u6E05\u6D17\u4EA4\u7ED9 repairCards() \u91CC\u7684 repairIntervalCards() / repairIntervalHistory()\u3002 */
          store.intervalCards = (raw.intervalCards && typeof raw.intervalCards === 'object' && !Array.isArray(raw.intervalCards))
            ? raw.intervalCards : {};
          store.intervalHistory = Array.isArray(raw.intervalHistory) ? raw.intervalHistory.slice(-INTERVAL_HISTORY_LIMIT) : [];
          /* \u4FA7\u680F\u7EDF\u8BA1\uFF1A\u56DB\u6A21\u5F0F\u7D2F\u8BA1 + \u627E\u4F4D\u7F6E\u5355\u4F4D\u7EDF\u8BA1 + \u73A9\u6CD5 B \u7684\u672C\u56DE\u5408\u5FEB\u7167 */
          store.modeStats = normalizeModeStats(raw.modeStats);
          store.posUnitStats = normalizePosUnitStats(raw.posUnitStats);
          store.posBStats = normalizePosBStats(raw.posBStats);
          store.posRecent = Array.isArray(raw.posRecent) ? raw.posRecent.slice(-POS_RECENT_LIMIT) : [];
          /* \u627E\u4F4D\u7F6E\u81EA\u5DF1\u7684\u5361\u7247\uFF1A\u65E7\u5B58\u6863\u6CA1\u6709\u8FD9\u4E2A\u5B57\u6BB5\uFF0C\u7A7A\u5BF9\u8C61\u8D77\u6B65\uFF08\u65E7\u6570\u636E\u5728 store.cards \u91CC
             \u7684\u90A3\u6279\u627E\u4F4D\u7F6E\u8FDB\u5EA6\u4E0D\u518D\u8FC1\u79FB \u2014\u2014 \u7A0B\u5E8F\u8FD8\u5728\u6D4B\u8BD5\u671F\uFF0C\u6E05\u6389\u66F4\u5E72\u51C0\uFF09\u3002 */
          store.posCards = (raw.posCards && typeof raw.posCards === 'object' && !Array.isArray(raw.posCards))
            ? raw.posCards : {};
        } else {
          wipeLearningData();
          /* \u8FC1\u79FB\u540E\u7ACB\u523B\u843D\u76D8\uFF1A\u5426\u5219\u7528\u6237\u5728\u4E0B\u4E00\u6B21 save() \u4E4B\u524D\u5173\u6389\u9875\u9762\uFF0C\u4E0B\u6B21\u8FDB\u6765\u53C8\u8981\u6E05\u4E00\u904D */
          flushSave();
        }
        store.schemaVersion = SCHEMA_VERSION;
      }
    } catch (e) {
      console.warn('\u8BFB\u53D6\u672C\u5730\u6570\u636E\u5931\u8D25', e);
    }
  }

  /* \u6E05\u7A7A\u5168\u90E8\u5B66\u4E60\u6570\u636E\uFF08\u4FDD\u7559 settings\uFF09\u3002
     \u4E09\u5904\u5171\u7528\uFF1A\u7ED3\u6784\u7248\u672C\u8FC1\u79FB\u3001\u8BBE\u7F6E\u91CC\u7684\u300C\u91CD\u7F6E\u5168\u90E8\u5B66\u4E60\u6570\u636E\u300D\u3001\u4FA7\u680F\u4E4B\u5916\u7684\u6574\u4F53\u91CD\u7F6E\u3002
     \u6CE8\u610F\u8FD9\u91CC\u4E0D\u78B0\u4EFB\u4F55 DOM \u2014\u2014 \u8C03\u7528\u65B9\u81EA\u5DF1\u51B3\u5B9A\u8981\u4E0D\u8981\u91CD\u6E32\u67D3\u3002 */
  function wipeLearningData() {
    store.cards = {};
    store.history = [];
    store.chordCards = {};
    store.chordHistory = [];
    store.chordRows = {};
    store.intervalCards = {};
    store.intervalHistory = [];
    store.modeStats = blankModeStats();
    store.posUnitStats = {};
    store.posBStats = { done: 0, full: 0, streak: 0, bestCombo: 0, last: null };
    store.posRecent = [];
    store.posCards = {};
    /* \u4E09\u4E2A\u6A21\u5F0F\u5404\u81EA\u7684\u300C\u5F53\u524D\u8FDE\u5BF9 / \u6700\u4F73\u8FDE\u5BF9\u300D\u5185\u5B58\u503C\u4E5F\u5F52\u96F6\uFF0C
       \u5426\u5219\u6E05\u5B8C\u6570\u636E\u4FA7\u680F\u8FD8\u4F1A\u663E\u793A\u4E0A\u4E00\u8F6E\u7684\u6700\u4F73\u8FDE\u5BF9 */
    round.streak = 0; round.bestStreak = 0; round.results = []; round.lastKey = null;
    chordRound.streak = 0; chordRound.bestStreak = 0; chordRound.results = []; chordRound.lastKey = null;
    intervalRound.streak = 0; intervalRound.bestStreak = 0; intervalRound.results = []; intervalRound.lastKey = null;
  }

  /* \u53EA\u6E05\u300C\u67D0\u4E00\u4E2A\u6A21\u5F0F\u300D\u81EA\u5DF1\u7684\u5B66\u4E60\u6570\u636E\uFF08\u7B2C 11 \u6761\uFF1A\u91CD\u7F6E\u5165\u53E3\u7684\u53EF\u89C1\u72B6\u6001\u4E0E\u8BED\u4E49\u8981\u5BF9\u4E0A\uFF09\u3002
     \u6570\u636E\u5F52\u5C5E\uFF1A
       chord    \u2192 chordCards / chordHistory / modeStats.chord
       interval \u2192 intervalCards / intervalHistory / modeStats.interval
       note     \u2192 store.cards\uFF08\u97F3\u540D\u81EA\u5DF1\u7684\u5361\u7247\uFF09+ history \u91CC m='note' \u7684\u8BB0\u5F55 + modeStats.note
       pos      \u2192 store.posCards\uFF08\u627E\u4F4D\u7F6E\u81EA\u5DF1\u7684\u5361\u7247\uFF09+ history \u91CC m='pos' \u7684\u8BB0\u5F55 + modeStats.pos
                  + posUnitStats / posBStats / posRecent\uFF08\u627E\u4F4D\u7F6E\u72EC\u6709\uFF09
     \u4E24\u4E2A\u6A21\u5F0F\u7684\u5361\u7247\u5206\u522B\u5B58\u5728 store.cards / store.posCards \u91CC\uFF0C\u952E\u5F62\u72B6\u76F8\u540C\u4F46\u4E92\u4E0D\u53EF\u89C1\uFF0C
     \u6240\u4EE5\u8FD9\u91CC\u53EF\u4EE5\u5404\u6E05\u5404\u7684\uFF0C\u4E0D\u9700\u8981\u518D\u4ECE history \u53CD\u63A8\u300C\u8FD9\u5F20\u5361\u662F\u8C01\u7EC3\u7684\u300D\u3002 */
  function resetModeData(mode) {
    const m = (mode === 'pos' || mode === 'chord' || mode === 'interval') ? mode : 'note';
    if (m === 'chord') {
      store.chordCards = {};
      store.chordHistory = [];
      store.chordRows = {};
      store.modeStats.chord = blankModeStat();
      chordRound.streak = 0; chordRound.bestStreak = 0; chordRound.results = []; chordRound.lastKey = null;
      /* \u5F53\u524D\u8FD9\u4E00\u8F6E\u8FD8\u5728\uFF1A\u56FE3 \u6309\u300C\u5168\u90E8\u90FD\u662F\u65B0\u9898\u300D\u91CD\u5EFA\u5FEB\u7167\uFF0C\u5426\u5219\u4FA7\u680F\u505C\u5728\u65E7\u53E3\u5F84\u3002 */
      chordRound.snapshot = freezeSnapshot(chordRound.queue || [], 'chord');
      /* \u6E05\u7A7A\u5FC5\u987B\u81EA\u5DF1\u843D\u76D8\uFF1A\u8C03\u7528\u65B9\uFF08\u8C03\u8BD5\u6761 / \u8BBE\u7F6E\u9875\u4E24\u4E2A\u5165\u53E3\uFF09\u90FD\u53EF\u80FD\u9A6C\u4E0A\u79BB\u5F00\uFF0C
         \u7B49\u4E0B\u4E00\u6B21 save() \u7684 150ms \u9632\u6296\u6216 beforeunload \u515C\u5E95\uFF0C\u4F1A\u7559\u4E0B\u300C\u5185\u5B58\u5DF2\u7A7A\u3001
         localStorage \u8FD8\u662F\u65E7\u6570\u300D\u7684\u7A97\u53E3\uFF0C\u5D29\u6E83\u6216\u591A\u6807\u7B7E\u5C31\u4F1A\u628A\u65E7\u8BB0\u5F55\u5E26\u56DE\u6765\u3002 */
      flushSave();
      return;
    }
    if (m === 'interval') {
      store.intervalCards = {};
      store.intervalHistory = [];
      store.modeStats.interval = blankModeStat();
      intervalRound.streak = 0; intervalRound.bestStreak = 0; intervalRound.results = []; intervalRound.lastKey = null;
      intervalRound.snapshot = freezeSnapshot(intervalRound.queue || [], 'interval', (item) => item.cardKey);
      intervalAPoolCache = { key: '', list: [] };
      intervalBPoolCache = { key: '', list: [] };
      flushSave();
      return;
    }
    if (m === 'pos') {
      /* \u627E\u4F4D\u7F6E\u6709\u81EA\u5DF1\u7684\u4E00\u5957\u5361\u7247\uFF0C\u6574\u4EFD\u6E05\u6389\u5373\u53EF\uFF0C\u4E0D\u4F1A\u78B0\u5230\u97F3\u540D\u7684\u8FDB\u5EA6\u3002 */
      store.posCards = {};
      store.posUnitStats = {};
      store.posBStats = { done: 0, full: 0, streak: 0, bestCombo: 0, last: null };
      store.posRecent = [];
      store.history = store.history.filter((h) => (h.m || 'note') !== 'pos');
      store.modeStats.pos = blankModeStat();
      round.snapshot = posPlayA() && store.settings.mode === 'pos'
        ? freezeSnapshot(round.queue || [], 'pos')
        : null;
      round.streak = 0; round.bestStreak = 0; round.results = []; round.lastKey = null;
      flushSave();
      return;
    }
    /* note\uFF1Astore.cards \u73B0\u5728\u53EA\u88C5\u97F3\u540D\u81EA\u5DF1\u7684\u5361\u7247\uFF0C\u6574\u4EFD\u6E05\u6389\u5373\u53EF\u3002 */
    store.cards = {};
    store.history = store.history.filter((h) => (h.m || 'note') !== 'note');
    store.modeStats.note = blankModeStat();
    round.snapshot = freezeSnapshot(round.queue || [], 'note');
    round.streak = 0; round.bestStreak = 0; round.results = []; round.lastKey = null;
    flushSave();
  }

  /* \u300C\u91CD\u7F6E\u5168\u90E8\u6570\u636E\u300D= \u5B66\u4E60\u8BB0\u5F55 + \u8BBE\u7F6E\u4E00\u8D77\u56DE\u9ED8\u8BA4\uFF08\u4E3B\u9875\u53F3\u4E0B\u89D2\u90A3\u4E2A\u5165\u53E3\uFF09\u3002
     \u4E0E resetModeData() \u7684\u533A\u522B\uFF1A\u90A3\u4E2A\u53EA\u6E05\u4E00\u4E2A\u6A21\u5F0F\u3001\u7EDD\u4E0D\u78B0 settings\uFF1B
     \u8FD9\u4E2A\u662F\u6574\u4EFD\u91CD\u6765\uFF0C\u6240\u4EE5\u8BBE\u7F6E\u4E5F\u8981\u56DE\u843D DEFAULT_SETTINGS\u3002
     \u4E0D\u7528 JSON \u6DF1\u62F7\u8D1D\u4F1A\u51FA\u4E8B\uFF1ADEFAULT_SETTINGS \u91CC\u7684 accSel / intervalAccSel \u662F\u5BF9\u8C61\uFF0C
     Object.assign \u53EA\u642C\u5F15\u7528\uFF0C\u4E4B\u540E\u6539\u8BBE\u7F6E\u4F1A\u628A\u9ED8\u8BA4\u503C\u8868\u672C\u8EAB\u6539\u6389\u3002 */
  function resetEverything() {
    wipeLearningData();
    store.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    store.schemaVersion = SCHEMA_VERSION;
    /* \u4E09\u4E2A\u6C60\u7F13\u5B58\u662F\u6309\u300C\u8BBE\u7F6E\u6307\u7EB9\u300D\u7F13\u5B58\u7684\u9898\u6C60\uFF0C\u8BBE\u7F6E\u56DE\u5230\u9ED8\u8BA4\u540E\u6307\u7EB9\u5168\u53D8\uFF0C\u7559\u7740\u53EA\u4F1A\u62D6\u6162\u9996\u9898 */
    chordPoolCache = { key: '', list: [] };
    intervalAPoolCache = { key: '', list: [] };
    intervalBPoolCache = { key: '', list: [] };
    /* \u517C\u5BB9\u5B57\u6BB5\uFF1Arange / muted / volume \u5FC5\u987B\u8DDF\u5F53\u524D\u6A21\u5F0F\uFF08\u91CD\u7F6E\u540E\u662F\u97F3\u540D\uFF09\u5BF9\u9F50 */
    syncLegacyRange();
    syncLegacySound();
    /* \u4E09\u9053\u9898\u961F\u5217\u91CC\u7684\u9898\u662F\u6309\u65E7\u8BBE\u7F6E\u62BD\u7684\uFF0C\u5361\u7247\u53C8\u521A\u88AB\u6E05\u7A7A\uFF1B\u76F4\u63A5\u9000\u56DE\u300C\u8FD8\u6CA1\u51FA\u9898\u300D\u7684\u521D\u59CB\u6001\uFF0C
       \u4E0B\u6B21\u8FDB\u5165\u4EFB\u4E00\u6A21\u5F0F\u65F6 enterMode() \u4F1A\u7528\u65B0\u8BBE\u7F6E\u91CD\u5F00\u4E00\u8F6E\u3002 */
    round.queue = []; round.idx = 0; round.current = null; round.state = 'idle';
    chordRound.queue = []; chordRound.idx = 0; chordRound.current = null; chordRound.state = 'idle';
    intervalRound.queue = []; intervalRound.idx = 0; intervalRound.current = null; intervalRound.state = 'idle';
    /* \u7ACB\u523B\u843D\u76D8\uFF0C\u4E0D\u8D70 save() \u7684 150ms \u9632\u6296\uFF1A\u91CD\u7F6E\u540E\u7528\u6237\u5F88\u53EF\u80FD\u76F4\u63A5\u5173\u9875\u9762 */
    flushSave();
    /* UI \u590D\u4F4D\uFF1A\u8BBE\u7F6E\u9762\u677F\u6240\u6709\u63A7\u4EF6\u3001\u56DB\u5757\u6307\u677F\u7684\u53EF\u89C6\u91CE\u3001\u4FA7\u680F\u3001\u4E3B\u9875\u8FDB\u5EA6\u6761 */
    syncSettingsUI();
    computeLayout();
    fitCanvas();
    applyModeView();
    updateSoundStatus();
    refreshHome();
  }

  /** \u6A21\u5F0F\u540D\uFF08\u786E\u8BA4\u6846 / \u53CD\u9988\u6587\u6848\u7528\uFF09 */
  function modeLabel(mode) {
    if (mode === 'pos') return '\u627E\u4F4D\u7F6E\u6A21\u5F0F';
    if (mode === 'chord') return '\u548C\u5F26\u6A21\u5F0F';
    if (mode === 'interval') return '\u97F3\u7A0B\u6A21\u5F0F';
    return '\u97F3\u540D\u6A21\u5F0F';
  }

  /* \u627E\u4F4D\u7F6E\u5355\u4F4D\u7EDF\u8BA1\u7684\u6E05\u6D17\uFF1A\u952E\u5FC5\u987B\u662F posUnitKey() \u7684\u5F62\u72B6\uFF0C\u6570\u503C\u5F52\u4F4D\uFF0Chist/recent \u622A\u65AD */
  function normalizePosUnitStats(raw) {
    const out = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    const num = (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    };
    Object.keys(raw).forEach((k) => {
      if (!/^p[sn]\d+n\d+$/.test(k) && !/^pn\d+$/.test(k)) return;
      const r = raw[k];
      if (!r || typeof r !== 'object' || Array.isArray(r)) return;
      out[k] = {
        n: num(r.n), right: num(r.right), wrong: num(r.wrong),
        lvl: clamp(num(r.lvl), 0, SRS_INTERVALS.length),
        streak: num(r.streak), bestCombo: num(r.bestCombo),
        recent: normalizeBoolList(r.recent, RECENT_WINDOW),
        hist: normalizeBoolList(r.hist, HIST_LIMIT),
        histFull: r.histFull === true,
        last: num(r.last),
      };
    });
    return out;
  }

  /* \u73A9\u6CD5 B \u7684\u672C\u56DE\u5408\u7EDF\u8BA1\u6E05\u6D17\uFF1Alast \u7ED3\u6784\u4E0D\u5408\u6CD5\u5C31\u7F6E null\uFF08\u5B81\u53EF\u663E\u793A\u300C\u2014\u300D\u4E5F\u4E0D\u80FD\u534A\u622A\uFF09 */
  function normalizePosBStats(raw) {
    const r = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const num = (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    };
    const out = {
      done: num(r.done), full: num(r.full),
      streak: num(r.streak), bestCombo: num(r.bestCombo),
      last: null,
    };
    if (out.bestCombo < out.streak) out.bestCombo = out.streak;
    const last = r.last;
    if (last && typeof last === 'object' && Array.isArray(last.cells)) {
      const cells = last.cells.filter((c) => c && typeof c === 'object' && Number.isFinite(Number(c.s)) && Number.isFinite(Number(c.f)))
        .map((c) => ({ s: Number(c.s), f: Number(c.f), ok: c.ok === true }));
      out.last = {
        right: num(last.right), wrong: num(last.wrong),
        ok: last.ok === true, cells: cells,
      };
    }
    return out;
  }

  /* \u5E03\u5C14\u5217\u8868\u6E05\u6D17\uFF1A\u975E\u6570\u7EC4 \u2192 []\uFF0C\u8D85\u957F\u53D6\u5C3E\u90E8\uFF0C\u5143\u7D20\u4E00\u5F8B !!x */
  function normalizeBoolList(raw, limit) {
    if (!Array.isArray(raw)) return [];
    return raw.slice(-limit).map((x) => !!x);
  }

  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 150);
  }
  function flushSave() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
    catch (e) { console.warn('\u4FDD\u5B58\u5931\u8D25', e); }
  }

  function getCard(key) {
    if (!store.cards[key]) {
      // \u4ECE key\uFF08"s3f5"\uFF09\u8FD8\u539F\u5F26\u548C\u54C1\uFF1B\u540C\u65F6\u6E05\u6389\u65E7\u7248\u672C\u7559\u4E0B\u7684\u7A7A\u58F3\u8BB0\u5F55
      const m = /^s(\d+)f(\d+)$/.exec(key);
      store.cards[key] = {
        s: m ? Number(m[1]) : 0, f: m ? Number(m[2]) : 0,
        lvl: 0, due: 0, last: 0, a: 0, e: 0, cn: 0, best: 0, recent: [],
        /* hist = \u56FE1\u300C\u8FD1\u671F\u8868\u73B0\u300D\u7528\u7684\u5B8C\u6574\u5386\u53F2\uFF08\u2264HIST_LIMIT\uFF09\uFF0Crecent \u4ECD\u53EA\u7ED9\u6743\u91CD\u7528 */
        hist: [], histFull: false,
      };
    }
    return store.cards[key];
  }

  /* \u627E\u4F4D\u7F6E\u6A21\u5F0F\u81EA\u5DF1\u7684\u5361\u7247\uFF1A\u4E0E\u97F3\u540D\u6A21\u5F0F\u5B8C\u5168\u5206\u5F00\u7684\u4E00\u5957
     \uFF08\u97F3\u540D = store.cards\uFF0C\u627E\u4F4D\u7F6E = store.posCards\uFF0C\u952E\u5F62\u72B6\u76F8\u540C\u4F46\u4E92\u4E0D\u53EF\u89C1\uFF09\u3002 */
  function getPosCard(key) {
    if (!store.posCards[key]) {
      const m = /^s(\d+)f(\d+)$/.exec(key);
      store.posCards[key] = {
        s: m ? Number(m[1]) : 0, f: m ? Number(m[2]) : 0,
        lvl: 0, due: 0, last: 0, a: 0, e: 0, cn: 0, best: 0, recent: [],
        hist: [], histFull: false,
      };
    }
    return store.posCards[key];
  }

  // \u6E05\u7406\u6CA1\u6709\u6709\u6548\u4F4D\u7F6E\u7684\u5361\u7247\uFF08\u65E7\u7248\u672C bug \u7559\u4E0B\u7684\u7A7A\u58F3\uFF09\uFF0C\u907F\u514D\u590D\u4E60\u5217\u8868/\u7EDF\u8BA1\u62A5\u9519
  function repairCards() {
    let fixed = 0;
    Object.keys(store.cards).forEach((k) => {
      const m = /^s(\d+)f(\d+)$/.exec(k);
      const c = store.cards[k];
      if (!m || !c) { delete store.cards[k]; fixed++; return; }
      const str = Number(m[1]);
      const fret = Number(m[2]);
      if (!c.s) { c.s = str; fixed++; }
      /* \u26A0 0 \u54C1\uFF08\u7A7A\u5F26\uFF09\u662F\u5408\u6CD5\u4F4D\u7F6E\uFF0C\u4E0D\u80FD\u5F53\u6210\u300C\u7F3A\u5931\u300D\u8865\u56DE key \u91CC\u7684\u54C1\u6570\uFF1A
         \u65E7\u5199\u6CD5\u662F `if (c.f === 0 && !c.f)`\uFF0C\u6761\u4EF6\u6052\u5047\uFF0C\u5C5E\u4E8E\u6B7B\u4EE3\u7801\uFF1B
         \u800C\u771F\u6B63\u8BE5\u4FEE\u7684\u662F\u300Cf \u4E0D\u662F\u6570\u5B57\u300D\u8FD9\u4E00\u79CD\u3002 */
      if (typeof c.f !== 'number' || !Number.isFinite(c.f)) { c.f = fret; fixed++; }
      if (typeof c.lvl !== 'number' || c.lvl > SRS_INTERVALS.length) { c.lvl = clamp(Number(c.lvl) || 0, 0, SRS_INTERVALS.length); fixed++; }
      /* hist\uFF1A\u975E\u6570\u7EC4\u8865\u7A7A\uFF0C\u8D85\u957F\u622A\u5C3E\uFF0C\u5143\u7D20\u4E00\u5F8B\u5E03\u5C14\uFF08\u65E7\u5B58\u6863\u6CA1\u6709\u8FD9\u4E2A\u5B57\u6BB5\uFF09 */
      if (!Array.isArray(c.hist)) { c.hist = []; fixed++; }
      else if (c.hist.length > HIST_LIMIT) { c.hist = c.hist.slice(-HIST_LIMIT); fixed++; }
      if (c.hist.some((x) => typeof x !== 'boolean')) { c.hist = c.hist.map((x) => !!x); fixed++; }
      if (typeof c.histFull !== 'boolean') { c.histFull = c.hist.length >= HIST_LIMIT; fixed++; }
    });
    /* \u627E\u4F4D\u7F6E\u81EA\u5DF1\u7684\u5361\u7247\u8D70\u540C\u4E00\u5957\u6E05\u6D17\uFF08\u4E24\u5957 map \u7ED3\u6784\u5B8C\u5168\u76F8\u540C\uFF09 */
    Object.keys(store.posCards).forEach((k) => {
      const m = /^s(\d+)f(\d+)$/.exec(k);
      const c = store.posCards[k];
      if (!m || !c) { delete store.posCards[k]; fixed++; return; }
      const str = Number(m[1]);
      const fret = Number(m[2]);
      if (!c.s) { c.s = str; fixed++; }
      if (typeof c.f !== 'number' || !Number.isFinite(c.f)) { c.f = fret; fixed++; }
      if (typeof c.lvl !== 'number' || c.lvl > SRS_INTERVALS.length) { c.lvl = clamp(Number(c.lvl) || 0, 0, SRS_INTERVALS.length); fixed++; }
      if (!Array.isArray(c.hist)) { c.hist = []; fixed++; }
      else if (c.hist.length > HIST_LIMIT) { c.hist = c.hist.slice(-HIST_LIMIT); fixed++; }
      if (c.hist.some((x) => typeof x !== 'boolean')) { c.hist = c.hist.map((x) => !!x); fixed++; }
      if (typeof c.histFull !== 'boolean') { c.histFull = c.hist.length >= HIST_LIMIT; fixed++; }
    });
    fixed += repairChordCards();
    fixed += repairChordHistory();
    fixed += repairChordRows();
    fixed += repairIntervalCards();
    fixed += repairIntervalHistory();
    if (fixed) { flushSave(); console.info('\u4FEE\u590D\u5361\u7247\u8BB0\u5F55', fixed, '\u5904'); }
  }

  /* ---------------------------------------------------------------
   *  \u548C\u5F26\u6A21\u5F0F\uFF1A\u6570\u636E\u5951\u7EA6\u4E0E\u57FA\u7840\u5DE5\u5177
   *
   *  \u8FD9\u4E00\u5C42\u53EA\u505A\u300C\u5F62\u72B6\u4E0E\u6E05\u6D17\u300D\uFF0C\u7406\u8BBA\u8BA1\u7B97\u5168\u90E8\u4EA4\u7ED9 window.ChordTheory
   *  \uFF08chord-theory.mjs \u7684\u6D4F\u89C8\u5668\u4EA7\u7269\uFF0C\u7EAF\u903B\u8F91\u3001\u53EF\u88AB node \u6D4B\u8BD5\u76F4\u63A5 import\uFF09\u3002
   * --------------------------------------------------------------- */
  const CHORD_HISTORY_LIMIT = 300;
  /* \u952E\u683C\u5F0F\uFF1Ac:<rootPc>:<qualityId>
     \u26A0 qualityId \u91CC\u6709\u7EAF\u6570\u5B57\u7684\u7A33\u5B9A\u6807\u8BC6\uFF08\u5C5E\u4E03\u548C\u5F26\u7684 id \u5C31\u662F '7'\uFF09\uFF0C
       \u6240\u4EE5\u8FD9\u91CC\u5FC5\u987B\u662F\u300C\u5B57\u6BCD\u6216\u6570\u5B57\u5F00\u5934\u300D\uFF0C\u4E0D\u80FD\u5199\u6210 [a-z] \u5F00\u5934 \u2014\u2014
       \u5199\u6210 [a-z] \u4F1A\u628A\u6240\u6709\u5C5E\u4E03\u548C\u5F26\u7684\u5361\u7247\u548C\u5386\u53F2\u9759\u9ED8\u5224\u4E3A\u975E\u6CD5\u5E76\u4E22\u5F03\u3002 */
  /* \u952E\u5F62\u5982 c:<\u6839\u97F3pc>:<\u8D28\u91CFid>\u3002\u8D28\u91CF id \u91CC\u65E2\u6709\u7EAF\u6570\u5B57\uFF08'7'\uFF09\u4E5F\u6709\u5927\u5C0F\u5199\u6DF7\u6392
     \uFF08'mM7'\u3001'm7b5'\u3001'add9'\u3001'7sus4'\uFF09\uFF0C\u6240\u4EE5\u7B2C\u4E8C\u6BB5\u5FC5\u987B\u5141\u8BB8 A-Z\uFF0C
     \u5426\u5219 mM7 \u7684\u5361\u7247\u4F1A\u88AB\u5224\u6210\u975E\u6CD5\u952E\uFF1Aseen \u5199\u4E0D\u8FDB\u3001\u7EDF\u8BA1\u6574\u7C7B\u4E22\u5931\u3002 */
  const CHORD_KEY_RE = /^c:(1[01]|\d):([A-Za-z0-9][A-Za-z0-9]*)$/;

  function chordKey(rootPc, qualityId) {
    return 'c:' + pcOf(rootPc) + ':' + qualityId;
  }

  function parseChordKey(key) {
    const m = CHORD_KEY_RE.exec(String(key || ''));
    if (!m) return null;
    return { root: Number(m[1]), quality: m[2] };
  }

  function chordTheory() {
    return (typeof window !== 'undefined' && window.ChordTheory) ? window.ChordTheory : null;
  }

  /**
   * \u8D28\u91CF id \u662F\u5426\u5408\u6CD5\u3002
   *
   * \u4E24\u5957\u6765\u6E90\u90FD\u8981\u8BA4\uFF1A
   *   \u2460 \u5206\u6790\u5668\uFF08ChordTheory\uFF09\u7684 10 \u79CD \u2014\u2014 \u548C\u5F26\u540D\u89E3\u6790\u3001\u5386\u53F2\u6E05\u6D17\u4ECD\u9760\u5B83\uFF1B
   *   \u2461 \u9898\u5E93\uFF08CQB\uFF09\u7684 18 \u79CD \u2014\u2014 \u9898\u5E93\u91CC\u6709 5 / 6 / m6 / mM7 / 7sus4 / 9 / dim7 / m7b5
   *      \u8FD9 8 \u79CD\u5206\u6790\u5668\u4E0D\u8BA4\u8BC6\u3002\u53EA\u8BA4 \u2460 \u4F1A\u628A\u8FD9\u4E9B\u9898\u7684\u77E5\u8BC6\u5361\u5F53\u6210\u810F\u6570\u636E\u5220\u6389\u3002
   */
  function validQuality(id) {
    const T = chordTheory();
    if (T && T.qualityById(id)) return true;
    return bankQualityIndex(id) >= 0;
  }

  /** \u53D6\uFF08\u6216\u521B\u5EFA\uFF09\u4E00\u5F20\u548C\u5F26\u5361\u7247\u3002\u952E\u975E\u6CD5\u65F6\u8FD4\u56DE null\uFF0C\u7EDD\u4E0D\u5199\u5165\u5783\u573E\u952E\u3002 */
  function getChordCard(key) {
    const parsed = parseChordKey(key);
    if (!parsed || !validQuality(parsed.quality)) return null;
    if (!store.chordCards[key]) {
      store.chordCards[key] = {
        root: parsed.root, quality: parsed.quality,
        seen: 0, lvl: 0, due: 0, last: 0, a: 0, e: 0, cn: 0, best: 0, recent: [],
        hist: [], histFull: false,
      };
    }
    return store.chordCards[key];
  }

  /** \u6E05\u6D17\u548C\u5F26\u5361\u7247\uFF1A\u952E\u975E\u6CD5\u3001\u8D28\u91CF\u672A\u77E5\u3001\u6570\u503C\u8D8A\u754C\u90FD\u5C31\u5730\u4FEE\uFF0C\u4E0D\u4E22\u6574\u4EFD store */
  function repairChordCards() {
    let fixed = 0;
    if (!store.chordCards || typeof store.chordCards !== 'object' || Array.isArray(store.chordCards)) {
      store.chordCards = {};
      return 1;
    }
    Object.keys(store.chordCards).forEach((k) => {
      const parsed = parseChordKey(k);
      const c = store.chordCards[k];
      if (!parsed || !validQuality(parsed.quality) || !c || typeof c !== 'object') {
        delete store.chordCards[k];
        fixed++;
        return;
      }
      const num = (v) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : 0);
      if (c.root !== parsed.root) { c.root = parsed.root; fixed++; }
      if (c.quality !== parsed.quality) { c.quality = parsed.quality; fixed++; }
      ['seen', 'due', 'last', 'a', 'e', 'cn', 'best'].forEach((f) => {
        if (typeof c[f] !== 'number' || !isFinite(c[f]) || c[f] < 0) { c[f] = num(c[f]); fixed++; }
      });
      if (typeof c.lvl !== 'number' || c.lvl < 0 || c.lvl > SRS_INTERVALS.length) {
        c.lvl = clamp(Number(c.lvl) || 0, 0, SRS_INTERVALS.length);
        fixed++;
      }
      if (c.best > SRS_INTERVALS.length) { c.best = SRS_INTERVALS.length; fixed++; }
      if (!Array.isArray(c.recent)) { c.recent = []; fixed++; }
      else if (c.recent.length > RECENT_WINDOW) { c.recent = c.recent.slice(-RECENT_WINDOW); fixed++; }
      if (!Array.isArray(c.hist)) { c.hist = []; fixed++; }
      else if (c.hist.length > HIST_LIMIT) { c.hist = c.hist.slice(-HIST_LIMIT); fixed++; }
      if (c.hist.some((x) => typeof x !== 'boolean')) { c.hist = c.hist.map((x) => !!x); fixed++; }
      if (typeof c.histFull !== 'boolean') { c.histFull = c.hist.length >= HIST_LIMIT; fixed++; }
    });
    return fixed;
  }

  /** \u6E05\u6D17\u548C\u5F26\u5386\u53F2\uFF1A\u975E\u6CD5\u6392\u5E03\u4E32\u3001\u672A\u77E5\u8D28\u91CF\u3001\u5BBD\u5EA6\u4E0E\u65B9\u5411\u4E0D\u5339\u914D\u7684\u8BB0\u5F55\u6574\u6761\u4E22\u5F03 */
  function repairChordHistory() {
    let fixed = 0;
    const T = chordTheory();
    if (!Array.isArray(store.chordHistory)) { store.chordHistory = []; return 1; }
    const before = store.chordHistory.length;
    store.chordHistory = store.chordHistory.filter((r) => {
      if (!r || typeof r !== 'object') return false;
      if (r.dir !== 'n2f' && r.dir !== 'f2n') return false;
      if (typeof r.root !== 'number' || r.root < 0 || r.root > 11) return false;
      if (!validQuality(r.quality)) return false;
      if (T && typeof r.arrangement === 'string' && !T.parseArrangement(r.arrangement)) return false;
      /* \u5224\u5206\u5BBD\u5EA6\u5DF2\u5E9F\u5F03\uFF08\u7B56\u5212\u4E66 \u00A76\uFF1A\u5224\u5206 = \u9010\u5F26\u5168\u7B49\u9898\u5E93\u90A3\u4E00\u6761\uFF09\u3002
         \u65E7\u8BB0\u5F55\u91CC\u53EF\u80FD\u8FD8\u5E26 width\uFF0C\u503C\u5408\u6CD5\u5C31\u7559\u7740\uFF1B\u6CA1\u6709 width \u4E5F\u5FC5\u987B\u662F\u5408\u6CD5\u8BB0\u5F55\u3002 */
      if (r.width != null && r.width !== 'strict' && r.width !== 'standard' && r.width !== 'loose') return false;
      /* ok \u7684\u4E09\u6001\u4E0E\u8DF3\u8FC7\u6807\u8BB0\u5FC5\u987B\u81EA\u6D3D */
      const isSkip = r.skipped === true || r.ambigSkipped === true;
      if (r.ok === null && !isSkip) return false;
      if (r.ok !== null && isSkip) return false;
      if (r.skipped === true && r.ambigSkipped === true) return false;
      if (r.timedOut === true && r.ok !== true && r.ok !== false) return false;
      return true;
    }).slice(-CHORD_HISTORY_LIMIT);
    fixed += before - store.chordHistory.length;
    return fixed;
  }

  /* \u6E05\u6D17\u6309\u9898\u7EDF\u8BA1\uFF1A\u952E\u5F62\u5982 r:<\u884C\u4E0B\u6807>\uFF0C\u4E0B\u6807\u5FC5\u987B\u843D\u5728\u9898\u5E93\u8303\u56F4\u5185 */
  function repairChordRows() {
    let fixed = 0;
    if (!store.chordRows || typeof store.chordRows !== 'object' || Array.isArray(store.chordRows)) {
      store.chordRows = {};
      return 1;
    }
    const total = bankData() ? bankData().A.length : 0;
    Object.keys(store.chordRows).forEach((k) => {
      const m = /^r:(\d+)$/.exec(k);
      const st = store.chordRows[k];
      if (!m || !st || typeof st !== 'object' || Number(m[1]) >= total) {
        delete store.chordRows[k];
        fixed++;
        return;
      }
      ['s', 'w', 't'].forEach((f) => {
        if (typeof st[f] !== 'number' || !isFinite(st[f]) || st[f] < 0) { st[f] = 0; fixed++; }
      });
      if (!Array.isArray(st.r)) { st.r = []; fixed++; }
      else if (st.r.length > RECENT_WINDOW) { st.r = st.r.slice(-RECENT_WINDOW); fixed++; }
    });
    return fixed;
  }

  /* \u548C\u5F26\u6A21\u5F0F\u8303\u56F4 \u2192 \u6700\u5927\u54C1\u6570 */
  function chordRangeFretMax() {
    const r = String(store.settings.chordRange || '0-5');
    const n = Number(r.split('-')[1]);
    return isFinite(n) ? clamp(n, 1, 21) : 5;
  }

  /* =================================================================
   *  \u97F3\u7A0B\u6A21\u5F0F\uFF1A\u6570\u636E\u5951\u7EA6\u4E0E\u57FA\u7840\u5DE5\u5177
   *
   *  \u7406\u8BBA\u8BA1\u7B97\u5168\u90E8\u4EA4\u7ED9 window.IntervalTheory\uFF08interval-theory.mjs \u7684\u6D4F\u89C8\u5668\u4EA7\u7269\uFF09\u3002
   *  \u8FD9\u4E00\u5C42\u53EA\u505A\u300C\u5F62\u72B6\u4E0E\u6E05\u6D17\u300D\uFF0C\u4E0E\u548C\u5F26\u6A21\u5F0F\u540C\u4E00\u5957\u5206\u5C42\u65B9\u5F0F\u3002
   * ================================================================= */

  const INTERVAL_HISTORY_LIMIT = 300;   // \u4E0E\u73B0\u6709\u6A21\u5F0F\u5BF9\u9F50\uFF08D40\uFF09

  /* \u97F3\u7A0B\u5361\u7247\u952E\uFF1Ai:<play>:<intervalId>:<dir>:<mode>[:<shape>] */
  const INTERVAL_KEY_RE = /^i:([ab]):([A-Za-z0-9]+):(up|down|none):(exact|equiv)(?::(d\dg[01]))?$/;

  function intervalTheory() {
    return (typeof window !== 'undefined' && window.IntervalTheory) ? window.IntervalTheory : null;
  }

  /* \u5361\u7247\u8BBF\u95EE\uFF1A\u6309\u9700\u521B\u5EFA\uFF08D45\uFF0C\u6CBF\u7528\u73B0\u6709 getCard \u8BED\u4E49\uFF09 */
  function getIntervalCard(key) {
    if (!store.intervalCards[key]) {
      store.intervalCards[key] = {
        lvl: 0, due: 0, last: 0, a: 0, e: 0, cn: 0, best: 0, recent: [],
        hist: [], histFull: false,
      };
    }
    return store.intervalCards[key];
  }

  /* \u6E05\u6D17\u97F3\u7A0B\u5361\u7247\uFF1A\u975E\u6CD5\u952E\u3001\u672A\u77E5\u97F3\u7A0B\u3001\u8D8A\u754C\u7B49\u7EA7\u4E00\u5F8B\u4E22\u5F03\u6216\u5F52\u4F4D */
  function repairIntervalCards() {
    let fixed = 0;
    const T = intervalTheory();
    if (!store.intervalCards || typeof store.intervalCards !== 'object' || Array.isArray(store.intervalCards)) {
      store.intervalCards = {};
      return 1;
    }
    Object.keys(store.intervalCards).forEach((k) => {
      const m = INTERVAL_KEY_RE.exec(k);
      const c = store.intervalCards[k];
      if (!m || !c || typeof c !== 'object') { delete store.intervalCards[k]; fixed++; return; }
      if (T && !T.intervalById(m[2])) { delete store.intervalCards[k]; fixed++; return; }
      if (typeof c.lvl !== 'number' || c.lvl < 0 || c.lvl > SRS_INTERVALS.length) {
        c.lvl = clamp(Number(c.lvl) || 0, 0, SRS_INTERVALS.length);
        fixed++;
      }
      if (typeof c.best !== 'number' || c.best > SRS_INTERVALS.length) {
        c.best = clamp(Number(c.best) || 0, 0, SRS_INTERVALS.length);
        fixed++;
      }
      if (!Array.isArray(c.recent)) { c.recent = []; fixed++; }
      else if (c.recent.length > RECENT_WINDOW) { c.recent = c.recent.slice(-RECENT_WINDOW); fixed++; }
      if (!Array.isArray(c.hist)) { c.hist = []; fixed++; }
      else if (c.hist.length > HIST_LIMIT) { c.hist = c.hist.slice(-HIST_LIMIT); fixed++; }
      if (c.hist.some((x) => typeof x !== 'boolean')) { c.hist = c.hist.map((x) => !!x); fixed++; }
      if (typeof c.histFull !== 'boolean') { c.histFull = c.hist.length >= HIST_LIMIT; fixed++; }
    });
    return fixed;
  }

  /* \u6E05\u6D17\u97F3\u7A0B\u5386\u53F2\uFF1A\u975E\u6CD5\u73A9\u6CD5/\u97F3\u7A0B/\u65B9\u5411/\u89C4\u5219\u6574\u6761\u4E22\u5F03 */
  function repairIntervalHistory() {
    let fixed = 0;
    const T = intervalTheory();
    if (!Array.isArray(store.intervalHistory)) { store.intervalHistory = []; return 1; }
    const before = store.intervalHistory.length;
    store.intervalHistory = store.intervalHistory.filter((r) => {
      if (!r || typeof r !== 'object') return false;
      if (r.play !== 'a' && r.play !== 'b') return false;
      if (T && !T.intervalById(r.interval)) return false;
      if (r.dir !== 'up' && r.dir !== 'down' && r.dir !== 'none') return false;
      if (r.mode !== 'exact' && r.mode !== 'equiv') return false;
      if (r.ok !== true && r.ok !== false && r.ok !== null) return false;
      return true;
    }).slice(-INTERVAL_HISTORY_LIMIT);
    fixed += before - store.intervalHistory.length;
    return fixed;
  }

  /* ---------------------------------------------------------------
   *  \u548C\u5F26\u9898\u5E93\uFF08\u7B56\u5212\u4E66 \u00A72 / \u00A73\uFF09
   *
   *  8,437 \u9053\u9898 = 8,437 \u6761\u4EBA\u7C7B\u6307\u6CD5\u3002\u4E00\u884C\u5C31\u662F\u4E00\u9053\u9898\uFF1A
   *    \u81EA\u5E26\u7B54\u6848\uFF08\u90A3\u6761\u6307\u6CD5\uFF09+ \u81EA\u5E26\u9489\u5B50\uFF08\u54EA\u51E0\u6839\u5F26\u5FC5\u987B\u4E0E\u539F\u6837\u4E00\u81F4\uFF09
   *  \u9898\u5E93\u7531 \u548C\u5F26\u6307\u578B\u5E93/\u51FA\u9898\u6A21\u5F0F/\u5DE5\u5177/\u751F\u6210\u9898\u5E93.js \u4ECE \u7B56\u5212\u6570\u636E/*.csv \u751F\u6210\uFF0C
   *  \u6784\u5EFA\u671F\u8F6C\u6210\u7EAF ASCII \u7684 chord-bank-data.js\uFF0C\u8FD0\u884C\u65F6\u6302\u5728 window.CQB\u3002
   *
   *  \u8FD9\u4E00\u5C42\u53EA\u628A\u884C\u6570\u636E\u5C55\u5F00\u6210\u53EF\u7528\u5BF9\u8C61\uFF1A\u4E0D\u5224\u5206\u3001\u4E0D\u6E32\u67D3\u3001\u4E0D\u8BFB\u8BBE\u7F6E\u3002
   * --------------------------------------------------------------- */
  const BANK_B36 = '0123456789abcdefghijklmnopqrstuvwxyz';

  /** \u9898\u5E93\u662F\u5426\u5C31\u7EEA \u2014\u2014 \u6574\u4E2A\u548C\u5F26\u6A21\u5F0F\u7684\u524D\u63D0 */
  function bankData() {
    const B = window.CQB;
    return (B && Array.isArray(B.A) && Array.isArray(B.Q) && Array.isArray(B.N)) ? B : null;
  }

  /** \u6253\u5305\u6307\u6CD5\uFF1A`-` \u8868\u793A\u4E0D\u54CD\uFF0C\u5176\u4F59\u5B57\u7B26\u662F base36 \u7684\u54C1\u6570\uFF080 = \u7A7A\u5F26\uFF09 */
  function bankUnpack(pack) {
    const out = [];
    for (let i = 0; i < pack.length; i += 1) {
      const ch = pack.charAt(i);
      out.push(ch === '-' ? -1 : BANK_B36.indexOf(ch));
    }
    return out;
  }

  /** \u6A2A\u6309\uFF1A\u53D1\u58F0\u533A\u91CC\u6BCF\u6839\u5F26\u90FD \u2265 F\uFF0C\u4E14\u81F3\u5C11\u4E24\u6839\u6B63\u597D = F\uFF08\u4E0E\u7B56\u5212\u4E66\u540C\u7B97\u6CD5\uFF09 */
  function bankBarre(fr) {
    let lo = -1;
    let hi = -1;
    for (let i = 0; i < 6; i += 1) {
      if (fr[i] >= 0) {
        if (lo < 0) lo = i;
        hi = i;
      }
    }
    if (lo < 0) return 0;
    for (let f = 1; f <= 15; f += 1) {
      let hit = 0;
      let ok = true;
      for (let i = lo; i <= hi; i += 1) {
        if (fr[i] < f) { ok = false; break; }
        if (fr[i] === f) hit += 1;
      }
      if (ok && hit >= 2) return f;
    }
    return 0;
  }

  /** \u5C55\u5F00\u9898\u5E93\uFF1A\u6BCF\u884C\u8865\u4E0A\u6D3E\u751F\u5B57\u6BB5\uFF0C\u5176\u4F59\u51FD\u6570\u53EA\u8BFB\u8FD9\u91CC */
  let bankRowsCache = null;

  function bankRows() {
    if (bankRowsCache) return bankRowsCache;
    const B = bankData();
    if (!B) { bankRowsCache = []; return bankRowsCache; }
    const list = [];
    B.A.forEach((row, idx) => {
      const qi = row[0];
      const pc = row[1];
      const fr = bankUnpack(row[5]);
      const pins = String(row[4] || '').split('-').filter(Boolean).map(Number);
      const flags = row[7] || 0;
      let mx = 0;
      let mn = 0;
      let sounding = 0;
      let openN = 0;
      for (let i = 0; i < 6; i += 1) {
        const f = fr[i];
        if (f < 0) continue;
        sounding += 1;
        if (f === 0) openN += 1;
        if (f > mx) mx = f;
        if (f > 0 && (mn === 0 || f < mn)) mn = f;
      }
      list.push({
        i: idx,
        qi: qi,
        q: B.Q[qi][0],
        quality: B.Q[qi][0],
        pc: pc,
        root: pc,
        mask: row[2],
        minF: row[3],
        pins: pins,
        pack: row[5],
        srcs: row[6] || 1,
        flags: flags,
        fr: fr,
        maxF: mx,
        minPress: mn,
        sc: sounding,
        openN: openN,
        isOpen: openN > 0,
        barre: bankBarre(fr),
        band: (flags >> 2) & 7,
        best: (flags & 1) === 1,
        common: (flags & 2) === 2,
        cell: qi * 12 + pc,
        key: chordKey(pc, B.Q[qi][0]),
        rk: 'r:' + idx
      });
    });
    bankRowsCache = list;
    return list;
  }

  /** B \u6C60 / \u4E25\u683C\u6C60\u7684\u6210\u5458\u4E0B\u6807\uFF08\u9898\u5E93\u751F\u6210\u65F6\u5DF2\u7ECF\u7B97\u597D\uFF0C\u8FD9\u91CC\u53EA\u505A\u96C6\u5408\uFF09 */
  let chordBPoolSet = null;
  let chordSPoolSet = null;

  function chordPoolSets() {
    const B = bankData();
    if (!chordBPoolSet || !chordSPoolSet) {
      chordBPoolSet = new Set(B ? B.B : []);
      chordSPoolSet = new Set(B ? B.S : []);
    }
    return { b: chordBPoolSet, s: chordSPoolSet };
  }

  /* -------------------- \u97F3\u4E50\u98CE\u683C\uFF08\u7B56\u5212\u4E66 \u00A73.8\uFF09 -------------------- */
  const CHORD_STYLE_ORDER = ['general', 'pop', 'rock', 'jazz', 'classical', 'other'];
  const CHORD_STYLE_NAME = {
    general: '\u901A\u7528', pop: '\u6D41\u884C', rock: '\u6447\u6EDA', jazz: '\u7235\u58EB', classical: '\u53E4\u5178', other: '\u5176\u4ED6'
  };
  /* \u4E8C\u503C\u79FB\u9664\uFF1A\u53EA\u4FDD\u7559\u300C\u8BED\u6599\u660E\u786E\u4E3A\u96F6\u300D\u7684\u4E24\u6761\u3002\u987A\u5E8F\u662F\u300C\u5148\u79FB\u9664\u3001\u518D\u4E58\u6743\u91CD\u300D\u3002 */
  const CHORD_STYLE_REMOVE = { rock: ['9'], jazz: ['5'] };
  /* \u516D\u9884\u8BBE\u6743\u91CD\uFF1A[\u901A\u7528, \u6D41\u884C, \u6447\u6EDA, \u7235\u58EB, \u53E4\u5178, \u5176\u4ED6]\uFF1B\u8868\u5916\u7684 6 \u79CD\u65E0\u8BED\u6599\u8D28\u91CF\u6052 1.0 */
  const CHORD_STYLE_W = {
    maj: [1, 1.2, 1.5, 0.7, 1.2, 1],
    min: [1, 1.2, 1.3, 0.8, 1.1, 1],
    7: [1, 1.1, 0.7, 2.2, 1, 1],
    m7: [1, 1.1, 0.6, 1.8, 0.8, 1],
    maj7: [1, 0.9, 0.5, 1.5, 1.2, 1],
    m7b5: [1, 0.6, 0.3, 1.4, 0.6, 1],
    dim7: [1, 0.6, 0.3, 1.2, 1, 1],
    dim: [1, 0.6, 0.4, 0.8, 1.3, 1],
    aug: [1, 0.5, 0.3, 0.9, 0.7, 1],
    5: [1, 0.9, 1.7, 0.15, 0.3, 1],
    sus2: [1, 1, 0.6, 0.9, 0.5, 1],
    sus4: [1, 1, 0.6, 0.9, 0.5, 1]
  };

  function chordStyleCol(style) {
    const i = CHORD_STYLE_ORDER.indexOf(style);
    return i < 0 ? 0 : i;
  }

  function chordStyleRemoved(qid, style) {
    const list = CHORD_STYLE_REMOVE[style];
    return !!(list && list.indexOf(qid) >= 0);
  }

  function chordStyleWeight(qid, style) {
    const w = CHORD_STYLE_W[qid];
    if (!w) return 1;
    return w[chordStyleCol(style)];
  }

  /* -------------------- \u4E94\u6761\u7B5B\u9009\u8F74\uFF08\u7B56\u5212\u4E66 \u00A73.0 A\uFF09 -------------------- */
  function chordRowPosition(r) {
    if (r.minF <= 3) return 'low';
    if (r.minF <= 7) return 'mid';
    return 'high';
  }

  function chordRowTechnique(r) {
    if (r.barre > 0) return 'barre';
    if (r.isOpen) return 'open';
    return 'none';
  }

  function chordPlayMode() {
    return store.settings.chordPlay === 'b' ? 'b' : 'a';
  }

  /** \u6211\u7684\u9519\u9898\uFF1A\u8FD9\u9053\u9898\u9519\u8FC7\u81F3\u5C11\u4E00\u6B21\uFF08\u6309\u9898\u5E93\u884C\u7EDF\u8BA1\uFF0C\u952E r:<\u884C\u4E0B\u6807>\uFF09 */
  function chordRowWrong(r) {
    const st = store.chordRows && store.chordRows[r.rk];
    return !!(st && st.w > 0);
  }

  /**
   * \u4E00\u884C\u9898\u662F\u5426\u6EE1\u8DB3\u5F53\u524D\u8BBE\u7F6E\u3002
   * skip \u7528\u6765\u7B97\u300C\u4E0A\u4E0B\u6587\u8BA1\u6570\u300D\uFF1A\u628A\u67D0\u4E00\u6839\u8F74\u6392\u9664\u5728\u5916\uFF0C\u95EE\u300C\u5047\u8BBE\u53EA\u6309\u5176\u5B83\u8F74\uFF0C\u8FD9\u4E2A\u503C\u8FD8\u5269\u51E0\u9898\u300D\u3002
   *
   * \u7A7A\u6570\u7EC4\u7684\u8BED\u4E49\u662F\u300C\u4E00\u4E2A\u90FD\u4E0D\u9009\u300D\u2014\u2014\u4E09\u6761\u591A\u9009\u8F74\uFF08\u8D28\u91CF / \u6839\u97F3 / \u5F26\u6570\uFF09\u4E00\u81F4\u3002
   * \u9ED8\u8BA4\u503C\u7ED9\u7684\u662F\u300C\u5168\u9009\u300D\uFF0C\u6240\u4EE5\u7528\u6237\u628A\u6700\u540E\u4E00\u9897\u82AF\u7247\u4E5F\u53D6\u6D88\u52FE\u9009\u65F6\uFF0C
   * \u9898\u6C60\u5F52\u96F6\u3001\u4FA7\u680F\u663E\u793A\u300C\u5F53\u524D 0 \u9898\u300D\u5E76\u7ED9\u51FA\u653E\u5BBD\u5EFA\u8BAE\uFF08\u7B56\u5212\u4E66 \u00A77.1\uFF09\uFF0C
   * \u4E0D\u4F1A\u88AB\u8BEF\u5F53\u6210\u300C\u4E0D\u8FC7\u6EE4\u300D\u800C\u6084\u6084\u51FA\u9898\u3002
   */
  function chordRowMatch(r, s, skip) {
    if (skip !== 'quality') {
      if (chordStyleRemoved(r.q, s.chordStyle)) return false;
      const quals = Array.isArray(s.chordQualities) ? s.chordQualities : [];
      if (quals.indexOf(r.q) < 0) return false;
    }
    if (skip !== 'root') {
      const roots = Array.isArray(s.chordRoots) ? s.chordRoots : [];
      if (roots.indexOf(r.pc) < 0) return false;
    }
    if (skip !== 'strings') {
      const strs = Array.isArray(s.chordStrings) ? s.chordStrings : [];
      if (strs.length && strs.indexOf(r.sc) < 0) return false;
    }
    if (skip !== 'position' && s.chordPosition && s.chordPosition !== 'all') {
      if (chordRowPosition(r) !== s.chordPosition) return false;
    }
    if (skip !== 'technique' && s.chordTechnique && s.chordTechnique !== 'all') {
      if (chordRowTechnique(r) !== s.chordTechnique) return false;
    }
    if (skip !== 'wrong' && s.chordWrongOnly && !chordRowWrong(r)) return false;
    if (r.maxF > chordRangeFretMax()) return false;
    if (chordPlayMode() === 'a') {
      if (s.chordAEffort === 'easy' && !r.best) return false;
    } else {
      const sets = chordPoolSets();
      if (!sets.b.has(r.i)) return false;
      if (s.chordBStrict && !sets.s.has(r.i)) return false;
    }
    return true;
  }

  /* ---------------------------------------------------------------
   *  \u548C\u5F26\u6A21\u5F0F\uFF1A\u6709\u6548\u51FA\u9898\u6C60
   *
   *  \u6C60\u5B50\u91CC\u73B0\u5728\u88C5\u7684\u662F\u300C\u9898\u300D\uFF08\u4E00\u884C\u4E00\u6761\u6307\u6CD5\uFF09\uFF0C\u4E0D\u518D\u662F\u300C\u6839\u97F3 \u00D7 \u8D28\u91CF\u300D\u7EC4\u5408\u3002
   *  \u6539\u8BBE\u7F6E\u540E\u7ACB\u5373\u91CD\u7B97\uFF1B\u51FA\u5230\u4E00\u534A\u6539\u8BBE\u7F6E\u4E0D\u4F1A\u628A\u5F53\u524D\u9898\u6362\u6210\u522B\u7684\u3002
   * --------------------------------------------------------------- */
  let chordPoolCache = { key: '', list: [] };

  /* \u4FA7\u680F\u4E0E\u8BBE\u7F6E\u91CC\u7684\u8D28\u91CF\u987A\u5E8F\uFF1A\u6309\u771F\u5B9E\u66F2\u76EE\u91CC\u7684\u5E38\u7528\u5EA6\u6392\uFF0C\u4E0D\u6309\u9898\u5E93\u4E0B\u6807\u3002
     \u9898\u5E93\u4E0B\u6807\uFF080=5 \u2026 17=sus4\uFF09\u662F\u751F\u6210\u5668\u5185\u90E8\u987A\u5E8F\uFF0C\u76F4\u63A5\u62FF\u6765\u6392\u4F1A\u8BA9\u300C\u5F3A\u529B\u548C\u5F26\u300D
     \u6392\u5728\u7B2C\u4E00\u4F4D\uFF0C\u4E0E\u7EC3\u4E60\u8005\u7684\u76F4\u89C9\u76F8\u53CD\u3002 */
  const CHORD_QUALITY_ORDER = [
    'maj', 'min', '7', 'm7', 'maj7', 'sus4', 'sus2', '6',
    'm6', 'add9', 'm7b5', 'dim7', 'mM7', '7sus4', '9', 'aug', 'dim', '5'
  ];
  const CHORD_QUALITY_LABEL = {
    maj: '\u5927\u4E09', min: '\u5C0F\u4E09', 7: '\u5C5E\u4E03', m7: '\u5C0F\u4E03', maj7: '\u5927\u4E03',
    sus4: 'sus4', sus2: 'sus2', 6: '6', m6: 'm6', add9: 'add9',
    m7b5: 'm7\u266D5', dim7: 'dim7', mM7: 'mM7', '7sus4': '7sus4',
    9: '9', aug: 'aug', dim: 'dim', 5: '5'
  };

  /** \u8D28\u91CF id \u2192 \u9898\u5E93\u4E0B\u6807\uFF08\u627E\u4E0D\u5230\u8FD4\u56DE -1\uFF09 */
  function bankQualityIndex(id) {
    const B = bankData();
    if (!B) return -1;
    for (let i = 0; i < B.Q.length; i += 1) if (B.Q[i][0] === id) return i;
    return -1;
  }

  /** \u6309 CHORD_QUALITY_ORDER \u6392\u597D\u7684\u9898\u5E93\u8D28\u91CF\u4E0B\u6807\u6570\u7EC4 */
  function bankQualityOrder() {
    const out = [];
    CHORD_QUALITY_ORDER.forEach((id) => {
      const qi = bankQualityIndex(id);
      if (qi >= 0) out.push(qi);
    });
    /* \u515C\u5E95\uFF1A\u9898\u5E93\u91CC\u82E5\u6709\u8868\u5916\u8D28\u91CF\uFF0C\u8FFD\u52A0\u5728\u540E\u9762\uFF0C\u7EDD\u4E0D\u4E22 */
    const B = bankData();
    if (B) {
      for (let i = 0; i < B.Q.length; i += 1) if (out.indexOf(i) < 0) out.push(i);
    }
    return out;
  }

  function chordQualityLabelOf(qid) {
    if (CHORD_QUALITY_LABEL[qid]) return CHORD_QUALITY_LABEL[qid];
    const qi = bankQualityIndex(qid);
    const B = bankData();
    return (qi >= 0 && B) ? B.Q[qi][1] : qid;
  }

  /**
   * \u4E0A\u4E0B\u6587\u8BA1\u6570\uFF08\u7B56\u5212\u4E66 \u00A73.6.1 \u94C1\u5F8B\uFF09\u3002
   * \u6BCF\u4E00\u8F74\u7684\u6BCF\u4E2A\u53D6\u503C\u90FD\u95EE\u540C\u4E00\u53E5\u8BDD\uFF1A\u300C\u5176\u5B83\u8F74\u90FD\u6309\u5F53\u524D\u6761\u4EF6\uFF0C\u53EA\u628A\u8FD9\u4E00\u8F74\u6362\u6210\u8BE5\u503C\uFF0C\u8FD8\u5269\u51E0\u9898\u300D\u3002
   * \u7B97\u51FA\u6765\u662F 0 \u7684 chip \u8981\u7F6E\u7070\u4E0D\u53EF\u70B9 \u2014\u2014 \u5426\u5219\u7528\u6237\u70B9\u4E0B\u53BB\u4F1A\u6389\u8FDB\u300C0 \u9898\u300D\u7684\u6B7B\u8DEF\u3002
   * \u6CE8\u610F\uFF1A\u672C\u8F74**\u5DF2\u9009**\u7684\u90A3\u4E9B\u503C\u5373\u4F7F\u7B97\u51FA 0 \u4E5F\u4E0D\u80FD\u7F6E\u7070\uFF0C\u5426\u5219\u7528\u6237\u6CA1\u6CD5\u53D6\u6D88\u5B83\u3002
   */
  function chordContextCounts() {
    const out = {
      quality: {}, root: {}, strings: {}, position: {}, technique: {},
      wrong: { all: 0, wrong: 0 }, total: 0
    };
    if (!bankData()) return out;
    const s = store.settings;
    const rows = bankRows();
    const inRange = [];
    for (let i = 0; i < rows.length; i += 1) {
      if (rows[i].maxF <= chordRangeFretMax()) inRange.push(rows[i]);
    }
    out.total = inRange.length;

    const CH_Q = bankQualityOrder();
    for (let i = 0; i < CH_Q.length; i += 1) out.quality[bankData().Q[CH_Q[i]][0]] = 0;
    for (let r = 0; r < 12; r += 1) out.root[r] = 0;
    [3, 4, 5, 6].forEach((n) => { out.strings[n] = 0; });
    ['low', 'mid', 'high'].forEach((k) => { out.position[k] = 0; });
    ['barre', 'open', 'none'].forEach((k) => { out.technique[k] = 0; });

    for (let i = 0; i < inRange.length; i += 1) {
      const r = inRange[i];
      if (chordRowMatch(r, s, 'quality')) out.quality[r.q] = (out.quality[r.q] || 0) + 1;
      if (chordRowMatch(r, s, 'root')) out.root[r.pc] = (out.root[r.pc] || 0) + 1;
      if (chordRowMatch(r, s, 'strings')) out.strings[r.sc] = (out.strings[r.sc] || 0) + 1;
      if (chordRowMatch(r, s, 'position')) {
        const p = chordRowPosition(r);
        out.position[p] = (out.position[p] || 0) + 1;
      }
      if (chordRowMatch(r, s, 'technique')) {
        const t = chordRowTechnique(r);
        out.technique[t] = (out.technique[t] || 0) + 1;
      }
      /* \u300C\u9898\u91CF\u6863\u300D\u8FD9\u4E00\u8F74\u6362\u6210\u67D0\u4E2A\u503C\u65F6\u8FD8\u5269\u51E0\u9898\uFF1A\u4E24\u6761\u90FD\u8981\u7B97\uFF0C\u4E0D\u80FD\u4E8C\u9009\u4E00 \u2014\u2014
         \u5426\u5219\u5F53\u524D\u6CA1\u5F00\u300C\u6211\u7684\u9519\u9898\u300D\u65F6\uFF0C\u300C\u5168\u90E8\u300D\u90A3\u9897\u82AF\u7247\u4F1A\u663E\u793A 0\uFF0C
         \u770B\u7740\u50CF\u9898\u5E93\u7A7A\u4E86\uFF08\u7B56\u5212\u4E66 \u00A73.1.2\uFF1A\u6570\u5B57\u56DE\u7B54\u300C\u6362\u6210\u6211\u4F1A\u6709\u591A\u5C11\u9898\u300D\uFF09\u3002 */
      if (chordRowMatch(r, s, 'wrong')) out.wrong.all += 1;
      if (chordRowMatch(r, s, 'wrong') && chordRowWrong(r)) out.wrong.wrong += 1;
    }
    return out;
  }

  function chordPoolKey() {
    const s = store.settings;
    return [
      chordPlayMode(),
      chordPlayMode() === 'a' ? (s.chordAEffort === 'easy' ? 'easy' : 'common')
        : (s.chordBStrict ? 'strict' : 'full'),
      String(s.chordRange || '0-5'),
      String(s.chordStyle || 'general'),
      (Array.isArray(s.chordRoots) ? s.chordRoots : []).join(','),
      (Array.isArray(s.chordQualities) ? s.chordQualities : []).join(','),
      (Array.isArray(s.chordStrings) ? s.chordStrings : []).join(','),
      String(s.chordPosition || 'all'),
      String(s.chordTechnique || 'all'),
      s.chordWrongOnly ? 'wrong' : ''
    ].join('|');
  }

  function chordPool() {
    if (!bankData()) return [];
    const key = chordPoolKey();
    if (chordPoolCache.key === key) return chordPoolCache.list;
    const s = store.settings;
    const list = bankRows().filter((r) => chordRowMatch(r, s, null));
    chordPoolCache = { key: key, list: list };
    return list;
  }

  /** \u4E3A\u4EC0\u4E48\u6C60\u662F\u7A7A\u7684 \u2014\u2014 \u9010\u8F74\u8BD5\u4E00\u904D\uFF0C\u8BF4\u6E05\u662F\u54EA\u4E00\u9879\u628A\u9898\u6390\u6389\u7684 */
  function chordPoolDiagnosis() {
    if (!bankData()) return '\u548C\u5F26\u9898\u5E93\u672A\u8F7D\u5165\uFF08chord-bank-data.js \u6CA1\u52A0\u8F7D\u6210\u529F\uFF09\u3002';
    const s = store.settings;
    const all = bankRows();
    const inRange = all.filter((r) => r.maxF <= chordRangeFretMax());
    if (!inRange.length) {
      return '0\u2013' + chordRangeFretMax() + ' \u54C1\u5185\u6CA1\u6709\u9898\u5E93\u91CC\u7684\u4EFB\u4F55\u6307\u6CD5\u3002\u8BF7\u628A\u8303\u56F4\u653E\u5BBD\u5230 0\u201312 \u54C1\u3002';
    }
    /* \u5148\u67E5\u300C\u6574\u6761\u8F74\u90FD\u7A7A\u7740\u300D\uFF1A\u8FD9\u7C7B\u7A7A\u96C6\u7684\u771F\u6B63\u539F\u56E0\u5C31\u662F\u90A3\u4E00\u8F74\uFF0C\u8BF4\u522B\u7684\u90FD\u662F\u8BEF\u5BFC */
    const empties = [
      [Array.isArray(s.chordQualities) ? s.chordQualities : [], '\u548C\u5F26\u8D28\u91CF', '\u4E00\u4E2A\u8D28\u91CF\u90FD\u6CA1\u9009'],
      [Array.isArray(s.chordRoots) ? s.chordRoots : [], '\u6839\u97F3', '\u4E00\u4E2A\u6839\u97F3\u90FD\u6CA1\u9009'],
      [Array.isArray(s.chordStrings) ? s.chordStrings : [], '\u53D1\u58F0\u5F26\u6570', '\u4E00\u4E2A\u5F26\u6570\u90FD\u6CA1\u9009']
    ];
    for (let i = 0; i < empties.length; i += 1) {
      if (!empties[i][0].length) {
        return empties[i][2] + '\u3002\u70B9\u300C\u56DE\u5230\u5168\u90E8\u300D\u6216\u81F3\u5C11\u52FE\u4E00\u4E2A' + empties[i][1] + '\u3002';
      }
    }
    const axes = [
      ['quality', '\u548C\u5F26\u8D28\u91CF'],
      ['root', '\u6839\u97F3'],
      ['strings', '\u53D1\u58F0\u5F26\u6570'],
      ['position', '\u628A\u4F4D'],
      ['technique', '\u6280\u5DE7'],
      ['wrong', '\u6211\u7684\u9519\u9898']
    ];
    for (let i = 0; i < axes.length; i += 1) {
      const axis = axes[i][0];
      const label = axes[i][1];
      if (inRange.some((r) => chordRowMatch(r, s, axis))) continue;
      return label + ' \u8FD9\u4E00\u9879\u628A\u9898\u5168\u6392\u9664\u4E86\u3002\u70B9\u300C\u56DE\u5230\u5168\u90E8\u300D\u6216\u653E\u5BBD\u8FD9\u4E00\u9879\u3002';
    }
    const mode = chordPlayMode();
    if (mode === 'b') {
      if (s.chordBStrict) {
        return '\u4E25\u683C\u9898\u6C60\u5728\u5F53\u524D\u7684\u5176\u5B83\u6761\u4EF6\u4E0B\u6CA1\u6709\u9898\u3002\u5173\u6389\u300C\u53EA\u51FA\u5355\u4E00\u540D\u5B57\u7684\u9898\u300D\u4F1A\u591A\u51FA '
          + (chordPoolSets().b.size - chordPoolSets().s.size) + ' \u9053\u3002';
      }
      return '\u9009\u62E9\u9898\u6C60\uFF08' + chordPoolSets().b.size + ' \u9053\uFF09\u5728\u5F53\u524D\u7684\u5176\u5B83\u6761\u4EF6\u4E0B\u6CA1\u6709\u9898\u3002';
    }
    return '\u5F53\u524D\u8BBE\u7F6E\u4E0B\u6CA1\u6709\u53EF\u51FA\u7684\u9898\u3002';
  }

  /* ---------------------------------------------------------------
   *  \u97F3\u9891\u5F15\u64CE\uFF1A\u771F\u5B9E\u6728\u5409\u4ED6\u91C7\u6837 + \u6CDB\u97F3\u5C42 + \u6DF7\u54CD
   * --------------------------------------------------------------- */
  const audio = {
    ctx: null, master: null, dry: null, reverb: null, harmonic: null,
    buffers: new Map(),
    // file:// \u4E0B\u7528 <audio> \u5143\u7D20 + MediaElementAudioSourceNode \u64AD\u653E\uFF08fetch \u88AB CORS \u62E6\u622A\u65F6\u7684\u901A\u8DEF\uFF09
    elementNodes: new Map(),
    sources: new Set(),
    ready: false,
    loading: false,         // \u6B63\u5728\u8BFB\u53D6\u91C7\u6837
    initError: '',
    lastError: '',
    loadingPromise: null,
    failed: [],
    useFallback: false,     // Web Audio \u4E0D\u53EF\u7528\u65F6\u6539\u7528 <audio> \u5143\u7D20
    lastMidi: 64,
    fallbackEl: null,

    // \u91C7\u6837\u540D "Cs3" \u2192 midi
    sampleMidi(name) {
      const m = name.match(/^([A-G])(s?)(\d)$/);
      if (!m) return 0;
      const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]];
      return base + (m[2] === 's' ? 1 : 0) + (Number(m[3]) + 1) * 12;
    },

    init() {
      if (this.loadingPromise) return this.loadingPromise;
      this.loading = true;
      this.loadingPromise = (async () => {
        try {
          await this.initCore();
        } catch (e) {
          // \u521D\u59CB\u5316\u4EFB\u4F55\u4E00\u6B65\u5931\u8D25\uFF0C\u90FD\u8981\u843D\u5230\u660E\u786E\u72B6\u6001\uFF0C\u7EDD\u4E0D\u80FD\u4E00\u76F4\u5361\u5728\u201C\u52A0\u8F7D\u4E2D\u201D
          console.warn('\u97F3\u9891\u521D\u59CB\u5316\u5931\u8D25', e);
          this.initError = (e && e.message) || String(e);
        } finally {
          this.loading = false;
          updateSoundStatus();
        }
      })();
      return this.loadingPromise;
    },

    async initCore() {
      {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) {
          // \u8001\u6D4F\u89C8\u5668/\u53D7\u9650\u73AF\u5883\uFF1A\u9000\u56DE <audio> \u64AD\u653E\uFF08\u4E0D\u80FD\u53D8\u8C03\uFF0C\u4F46\u81F3\u5C11\u80FD\u542C\u5230\u58F0\u97F3\uFF09
          this.useFallback = true;
          this.failed.push('\u6D4F\u89C8\u5668\u4E0D\u652F\u6301 Web Audio\uFF0C\u5DF2\u5207\u6362\u4E3A\u5185\u7F6E\u64AD\u653E\u5668');
          updateSoundStatus();
          return;
        }
        // \u5C3D\u65E9\u521B\u5EFA\u5E76\u89E3\u9501 AudioContext\uFF1A\u8981\u5728\u7528\u6237\u624B\u52BF\u671F\u95F4 resume\uFF0C\u5426\u5219\u4E4B\u540E\u6240\u6709\u53D1\u58F0\u90FD\u4F1A\u88AB\u6D4F\u89C8\u5668\u6302\u8D77
        this.ctx = new Ctx({ latencyHint: 'interactive' });
        if (this.ctx.state === 'suspended') { try { this.ctx.resume(); } catch (e) { /* ignore */ } }
        // \u9501\u5C4F/\u5207\u540E\u53F0\u4F1A\u8BA9 AudioContext \u81EA\u52A8\u6302\u8D77\uFF0C\u5207\u56DE\u6765\u65F6\u8981\u53CA\u65F6\u6062\u590D
        this.ctx.addEventListener('statechange', () => { if (this.ctx.state === 'suspended' && audioInitStarted) { try { this.ctx.resume(); } catch (e) { /* ignore */ } } });

        this.master = this.ctx.createGain();
        /* \u521D\u59CB\u589E\u76CA\u53D6\u300C\u5F53\u524D\u6A21\u5F0F\u300D\u7684\u6709\u6548\u97F3\u91CF\uFF0C\u800C\u4E0D\u662F\u5168\u5C40\u517C\u5BB9\u5B57\u6BB5 */
        {
          const s0 = soundOf(store.settings.mode);
          this.master.gain.value = s0.muted ? 0 : clamp(s0.volume, 0, 100) / 100;
        }

        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.value = -20;
        comp.knee.value = 14;
        comp.ratio.value = 3;
        comp.attack.value = 0.004;
        comp.release.value = 0.22;
        this.master.connect(comp);
        comp.connect(this.ctx.destination);

        // \u623F\u95F4\u6DF7\u54CD\uFF1A\u53CD\u5411\u6307\u6570\u8870\u51CF\u566A\u58F0\u8109\u51B2
        this.reverb = this.ctx.createConvolver();
        this.reverb.buffer = this.makeImpulse(1.9, 2.6);
        const wet = this.ctx.createGain();
        wet.gain.value = 0.2;
        this.reverb.connect(wet);
        wet.connect(comp);

        this.dry = this.ctx.createGain();
        this.dry.gain.value = 1;
        this.dry.connect(this.master);
        const send = this.ctx.createGain();
        send.gain.value = 1;
        this.dry.connect(send);
        send.connect(this.reverb);

        // \u6CDB\u97F3\u5C42\uFF1A\u8865\u8DB3\u9AD8\u628A\u4F4D\uFF08\u5347\u8C03\u540E\uFF09\u7F3A\u5931\u7684\u9AD8\u9891\u6CDB\u97F3\uFF0C\u8BA9\u62E8\u5F26\u97F3\u66F4\u771F\u5B9E
        this.harmonic = this.ctx.createGain();
        this.harmonic.gain.value = 0.12;
        this.dry.connect(this.harmonic);
        this.harmonic.connect(this.master);

        // \u5148\u52A0\u8F7D\u6700\u5E38\u7528\u7684\u4E2D\u97F3\u533A\uFF0C\u8BA9\u7B2C\u4E00\u58F0\u5C3D\u5FEB\u80FD\u54CD\uFF1B\u5176\u4F59\u653E\u5728\u540E\u53F0\u52A0\u8F7D
        // \u6CE8\u610F\uFF1Adata:/blob: \u662F\u5DF2\u7ECF\u5185\u5D4C\u7684\u91C7\u6837\uFF0C\u4E0D\u9700\u8981\u518D\u4E0B\u8F7D
        const load = (name) => new Promise((resolve) => {
          const midi = this.sampleMidi(name);
          if (this.buffers.has(midi)) { resolve(true); return; }
          const url = (typeof SAMPLE_DATA !== 'undefined' && SAMPLE_DATA && SAMPLE_DATA[name])
            ? SAMPLE_DATA[name]
            : SAMPLE_BASE + name + '.mp3';
          fetch(url)
            .then((res) => {
              if (!res.ok) throw new Error(name + '.mp3 HTTP ' + res.status);
              return res.arrayBuffer();
            })
            .then((arr) => this.ctx.decodeAudioData(arr))
            .then((buf) => {
              this.buffers.set(midi, buf);
              if (!this.ready) { this.ready = true; updateSoundStatus(); }
              resolve(true);
            })
            .catch((e) => {
              // \u8BB0\u4E0B\u662F\u4E0B\u8F7D\u5931\u8D25\u8FD8\u662F\u89E3\u7801\u5931\u8D25\uFF0C\u72B6\u6001\u680F\u91CC\u7ED9\u7528\u6237\u660E\u786E\u63D0\u793A
              this.lastError = (e && e.message ? e.message : String(e));
              this.failed.push(name);
              resolve(false);
            });
        });
        const midiOfSample = (n) => this.sampleMidi(n);
        // \u5DF2\u5185\u5D4C\u7684\u91C7\u6837\u4F18\u5148\u52A0\u8F7D\uFF0C\u5176\u6B21\u624D\u662F\u8FD1\u4E2D\u97F3\u533A
        const embedded = (n) => (typeof SAMPLE_DATA !== 'undefined' && SAMPLE_DATA && SAMPLE_DATA[n]) ? 0 : 1;
        const priority = SAMPLE_NOTES.slice().sort((a, b) =>
          (embedded(a) - embedded(b)) ||
          (Math.abs(midiOfSample(a) - 60) - Math.abs(midiOfSample(b) - 60)));
        const first = priority.slice(0, 12);
        const rest = priority.slice(12);
        // file:// \u76F4\u63A5\u6253\u5F00\u65F6 fetch \u4E00\u5B9A\u88AB CORS \u62E6\uFF0C\u522B\u767D\u8DD1\u4E00\u8F6E\uFF1A\u76F4\u63A5\u8D70 <audio> \u5143\u7D20\u901A\u8DEF
        const isFileProtocol = (typeof location !== 'undefined' && location.protocol === 'file:');
        if (isFileProtocol) {
          this.loadMode = 'element';
          await this.loadViaAudioElement(priority.join(','));
          this.ready = this.elementNodes.size > 0;
          this.failed = [];
          updateSoundStatus();
          return;
        }
        for (const name of first) { await load(name); updateSoundStatus(); }   // \u9010\u4E2A\u52A0\u8F7D\uFF1A\u79D2\u7EA7\u5C31\u80FD\u51FA\u58F0
        this.ready = this.buffers.size > 0;
        // \u524D 12 \u4E2A\u5168\u90E8\u5931\u8D25\uFF08\u4F8B\u5982\u90E8\u7F72\u5728\u9650\u5236 fetch \u7684\u73AF\u5883\uFF09\u2192 \u6362 <audio> \u5143\u7D20\u65B9\u5F0F\u91CD\u8BD5
        if (!this.ready) {
          const okEl = await this.loadViaAudioElement(priority.join(','));
          this.ready = this.buffers.size > 0 || this.elementNodes.size > 0;
          if (okEl && this.ready) { this.loadMode = 'element'; this.failed = []; }
        }
        // \u540E\u53F0\u8865\u9F50\u5176\u4F59\u97F3\u9AD8
        (async () => {
          for (const name of rest) await load(name);
          updateSoundStatus();
        })();
      }
    },

    /* \u5907\u7528\u52A0\u8F7D\u65B9\u5F0F\uFF1A<audio> \u5143\u7D20\u4E0D\u53D7 fetch \u7684\u672C\u5730\u6587\u4EF6\u9650\u5236\uFF08file:// \u6253\u5F00\u65F6\u7528\uFF09 */
    loadViaAudioElement(names) {
      const list = String(names).split(',');
      // file:// \u4E0B\u4E0D\u80FD\u7ED9\u5A92\u4F53\u5143\u7D20\u8BBE crossOrigin\uFF1A\u6D4F\u89C8\u5668\u4F1A\u53D1\u8D77\u5E26 CORS \u7684\u8BF7\u6C42\uFF0C
      // \u672C\u5730\u6587\u4EF6\u6CA1\u6709 Access-Control-Allow-Origin \u5934\uFF0C\u52A0\u8F7D\u76F4\u63A5\u88AB\u62D2\uFF08loadeddata \u6C38\u8FDC\u4E0D\u89E6\u53D1\uFF09\u3002
      const isFile = (typeof location !== 'undefined' && location.protocol === 'file:');
      const one = (name) => new Promise((resolve) => {
        const midi = this.sampleMidi(name);
        if (this.buffers.has(midi)) { resolve(true); return; }
        try {
          const el = new Audio();
          el.preload = 'auto';
          if (!isFile) el.crossOrigin = 'anonymous';
          el.src = (typeof SAMPLE_DATA !== 'undefined' && SAMPLE_DATA && SAMPLE_DATA[name]) ? SAMPLE_DATA[name] : SAMPLE_BASE + name + '.mp3';
          const done = (fn) => { clearTimeout(timer); fn(); };
          const timer = setTimeout(() => done(() => resolve(false)), 8000);
          el.addEventListener('loadeddata', () => {
            // file:// \u4E0B fetch/XHR \u90FD\u88AB\u62E6\uFF0C\u53EA\u6709\u5143\u7D20\u672C\u8EAB\u80FD\u8BFB\uFF1A
            // \u76F4\u63A5\u4FDD\u5B58\u5143\u7D20\u3001\u7528\u7EAF <audio> \u64AD\u653E\uFF08\u4E0D\u80FD\u63A5\u8FDB Web Audio\uFF0C\u5426\u5219\u8DE8\u6E90\u4F1A\u9759\u97F3\uFF09
            if (isFile) {
              this.elementNodes.set(midi, { el: el });
              if (!this.ready) { this.ready = true; this.loadMode = 'element'; updateSoundStatus(); }
              done(() => resolve(true));
              return;
            }
            // \u7EBF\u4E0A\u73AF\u5883\uFF1A\u80FD fetch \u5C31\u8F6C\u6210 AudioBuffer\uFF0C\u64AD\u653E\u63A7\u5236\u66F4\u7075\u6D3B
            fetch(el.src)
              .then((r) => r.arrayBuffer())
              .then((a) => this.ctx.decodeAudioData(a))
              .then((buf) => { this.buffers.set(midi, buf); if (!this.ready) { this.ready = true; updateSoundStatus(); } done(() => resolve(true)); })
              .catch(() => done(() => resolve(false)));
          }, { once: true });
          el.addEventListener('error', () => done(() => resolve(false)), { once: true });
          el.load();
        } catch (e) { resolve(false); }
      });
      return Promise.allSettled(list.map(one)).then((rs) => rs.some((r) => r.value));
    },

    makeImpulse(seconds, decay) {
      const rate = this.ctx.sampleRate;
      const len = Math.floor(rate * seconds);
      const buf = this.ctx.createBuffer(2, len, rate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) {
          const t = i / len;
          const attack = i < rate * 0.01 ? i / (rate * 0.01) : 1;
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * attack;
        }
      }
      return buf;
    },

    nearestBuffer(midi) {
      let best = null;
      let bestDist = Infinity;
      this.buffers.forEach((buf, m) => {
        const d = Math.abs(m - midi);
        if (d < bestDist) { bestDist = d; best = { midi: m, buf: buf }; }
      });
      return best;
    },

    /** \u5143\u7D20\u901A\u8DEF\uFF1A\u627E\u6700\u63A5\u8FD1\u7684\u97F3\u9AD8\u91C7\u6837 */
    nearestElement(midi) {
      let best = null;
      let bestDist = Infinity;
      this.elementNodes.forEach((node, m) => {
        const d = Math.abs(m - midi);
        if (d < bestDist) { bestDist = d; best = { midi: m, node: node }; }
      });
      return best;
    },

    /**
     * \u5143\u7D20\u901A\u8DEF\u64AD\u653E\uFF08file:// \u76F4\u63A5\u6253\u5F00\u65F6\u4F7F\u7528\uFF09\u3002
     * \u5173\u952E\uFF1A\u7EDD\u4E0D\u80FD\u628A\u5143\u7D20\u63A5\u8FDB Web Audio\u3002file:// \u4E0B\u97F3\u9891\u88AB\u6D4F\u89C8\u5668\u89C6\u4F5C\u8DE8\u6E90\u6570\u636E\uFF0C
     * MediaElementAudioSourceNode \u4F1A\u9759\u97F3\u8F93\u51FA\u3001captureStream \u8FD8\u4F1A\u629B SecurityError\u3002
     * \u6240\u4EE5\u8FD9\u91CC\u7528\u7EAF <audio> \u64AD\u653E\uFF1A\u58F0\u97F3\u76F4\u63A5\u8D70\u6D4F\u89C8\u5668\u8F93\u51FA\uFF0C\u53D8\u8C03\u9760 playbackRate\u3002
     */
    playElementNode(near, midi, vel, opts) {
      const o = opts || {};
      const el = near.node.el;
      const semis = midi - near.midi;
      const cents = semis > 0 ? semis * RATE_CORRECTION_CENTS_PER_SEMI : 0;
      /* \u5EF6\u8FDF\u8D77\u64AD\u7684\u4EE4\u724C\uFF1AstopChord() \u4F1A\u628A\u5B83 +1\uFF0C\u5C4A\u65F6\u8FD8\u5728\u7B49 canplay \u7684\u56DE\u8C03\u5FC5\u987B\u653E\u5F03\u3002
         \u6CA1\u6709\u8FD9\u9053\u95F8\uFF0C\u300C\u505C\u300D\u4E4B\u540E\u5143\u7D20\u5C31\u7EEA\u4ECD\u7136\u4F1A\u81EA\u5DF1\u54CD\u8D77\u6765\u3002 */
      const token = this.elementPlayToken;
      /* \u5355\u97F3\u6A21\u5F0F\u540C\u4E00\u65F6\u523B\u53EA\u54CD\u4E00\u4E2A\uFF1A\u5176\u5B83\u5143\u7D20\u5148\u505C\u6389\uFF0C\u907F\u514D\u53E0\u97F3\u3002
         \u548C\u5F26\uFF08poly\uFF09\u5FC5\u987B\u8DF3\u8FC7\u8FD9\u4E00\u6B65\u2014\u2014\u5426\u5219\u6BCF\u6839\u5F26\u8D77\u64AD\u90FD\u4F1A\u6390\u6389\u524D\u4E00\u6839\uFF0C
         5 \u6839\u5F26\u7684\u548C\u5F26\u542C\u8D77\u6765\u53EA\u5269\u6700\u540E\u4E00\u4E2A\u97F3\uFF08\u5386\u53F2 bug\uFF09\u3002 */
      if (!o.poly) {
        this.elementNodes.forEach((node) => {
          if (node.el !== el && !node.el.paused) { try { node.el.pause(); } catch (e) {} }
        });
      }
      const go = () => {
        if (token !== this.elementPlayToken) return;
        /* \u548C\u5F26\u91CC\u4E24\u6839\u5F26\u53EF\u80FD\u843D\u5230\u540C\u4E00\u4E2A\u91C7\u6837\uFF08\u540C\u5EA6\u3001\u6216\u90FD\u8D85\u51FA\u91C7\u6837\u97F3\u57DF\uFF09\uFF1A
           \u540C\u4E00\u6279\u5DF2\u7ECF\u628A\u5B83\u8D77\u64AD\u8FC7\u4E86\u5C31\u4E0D\u8981\u518D\u8D77\u4E00\u904D\uFF0C\u5426\u5219\u4F1A\u628A\u5148\u54CD\u7684\u90A3\u6839\u6390\u6389\u3002
           \u4F46\u522B\u7684\u6765\u6E90\uFF08\u4E0A\u4E00\u6279\u3001\u5355\u97F3\u9884\u89C8\uFF09\u8D77\u64AD\u7684\u5143\u7D20\u8981\u91CD\u65B0\u8D77\u64AD\uFF0C\u4E0D\u80FD\u88AB\u8BEF\u5224\u3002 */
        if (o.poly && el.__chordBatch === o.batchId && !el.paused) return;
        try {
          /* \u5143\u7D20\u901A\u8DEF\u6CA1\u6709 Web Audio \u589E\u76CA\u8282\u70B9\uFF1A\u97F3\u91CF\u548C\u9759\u97F3\u5FC5\u987B\u6309\u300C\u5F53\u524D\u6A21\u5F0F\u300D\u5199\u56DE\u5143\u7D20\uFF0C
             \u5426\u5219\u4E00\u4E2A\u6A21\u5F0F\u9759\u97F3\u4F1A\u628A\u5176\u5B83\u6A21\u5F0F\u4E00\u8D77\u9759\u6389\uFF08\u5386\u53F2 bug\uFF09\u3002 */
          const snd = soundOf(store.settings.mode);
          el.playbackRate = Math.pow(2, semis / 12 + cents / 1200);
          el.volume = clamp(clamp(snd.volume, 0, 100) / 100, 0, 1) * clamp(vel, 0, 1);
          el.muted = !!snd.muted;
          el.currentTime = 0;
          if (o.poly) el.__chordBatch = o.batchId;
          const p = el.play();
          if (p && p.catch) p.catch(() => updateSoundStatus('\u6D4F\u89C8\u5668\u963B\u6B62\u4E86\u58F0\u97F3\uFF0C\u8BF7\u70B9\u4E00\u4E0B\u9875\u9762\u540E\u518D\u8BD5'));
          flashListenBtn();
        } catch (e) { /* \u5FFD\u7565\u5355\u6B21\u64AD\u653E\u5931\u8D25 */ }
      };
      // \u5143\u7D20\u5C1A\u672A\u5C31\u7EEA\u65F6\u7B49\u5B83 readyState \u591F\u4E86\u518D\u64AD
      if (el.readyState >= 2) { go(); return; }
      const onReady = () => { el.removeEventListener('canplay', onReady); go(); };
      el.addEventListener('canplay', onReady);
    },

    /**
     * \u6309\u97F3\u9AD8\uFF08midi\uFF09\u5F39\u594F\uFF0C\u6A21\u62DF\u4E00\u6B21\u771F\u5B9E\u7684\u62E8\u5F26\uFF1A
     *   \u91C7\u6837\u4E3B\u4F53\uFF08\u4FDD\u7559\u5F55\u97F3\u957F\u5EA6\uFF09\u2192 \u63A5\u5165\u589E\u76CA\u5305\u7EDC \u2192 \u5FEB\u901F\u6DE1\u5165/\u6DE1\u51FA\u6D88\u9664\u70B9\u51FB\u97F3
     *   \u5347\u8C03\u65F6\u7528\u5FAA\u73AF\u5EF6\u957F\u5C3E\u97F3\uFF1B\u5347 1\u20133 \u4E2A\u534A\u97F3\u7684\u529B\u5EA6\u548C\u4EAE\u5EA6\u8865\u507F\uFF1B\u6CDB\u97F3\u5C42\u8865\u9AD8\u9891\u3002
     * \u8FD4\u56DE\u662F\u5426\u6210\u529F\u3002
     */
    play(midi, velocity, opts) {
      const vel = velocity === undefined ? 0.86 : velocity;
      this.lastMidi = midi;
      if (this.useFallback) { playViaElement(midi); return true; }
      // file:// \u76F4\u63A5\u6253\u5F00\u65F6\u8D70\u7EAF <audio> \u5143\u7D20\u901A\u8DEF\uFF08\u4E0D\u4F9D\u8D56 AudioContext\uFF0C\u4E5F\u4E0D\u4F1A\u56E0\u8DE8\u6E90\u9759\u97F3\uFF09
      if (this.loadMode === 'element' && this.elementNodes.size) {
        const near = this.nearestElement(midi);
        if (!near) return false;
        this.playElementNode(near, midi, vel, opts);
        return true;
      }
      if (!this.ctx) return false;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      if (!this.ready) {
        // \u91C7\u6837\u8FD8\u6CA1\u52A0\u8F7D\u5B8C\u65F6\uFF0C\u5148\u8BB0\u4E0B\u6765\uFF0C\u52A0\u8F7D\u5B8C\u6210\u540E\u8865\u653E
        const ctxReady = this.loadingPromise;
        (ctxReady || Promise.resolve()).then(() => {
          if (this.ready && this.lastMidi === midi) this.play(midi, vel);
        });
        return false;
      }
      const near = this.nearestBuffer(midi);
      if (!near) return false;

      const t0 = this.ctx.currentTime + 0.01;
      const semis = midi - near.midi;
      const absSemis = Math.abs(semis);

      // \u97F3\u5206\u6821\u6B63\uFF1A\u5347\u8C03\u65F6\u91C7\u6837\u97F3\u51C6\u4F1A\u504F\u4F4E\uFF0C\u6309\u534A\u97F3\u6570\u8865\u507F
      const cents = semis > 0 ? semis * RATE_CORRECTION_CENTS_PER_SEMI : 0;
      const rate = Math.pow(2, semis / 12 + cents / 1200);

      // \u81F3\u5C11\u54CD 2.4 \u79D2\uFF1B\u5347\u8C03\u540E\u91C7\u6837\u53D8\u77ED\u65F6\u5FAA\u73AF\u5EF6\u957F\uFF0C\u907F\u514D\u9AD8\u628A\u4F4D\u88AB\u622A\u65AD
      const recDur = near.buf.duration / rate;
      const targetDur = 2.4;
      const loop = recDur < targetDur;
      const playDur = loop ? targetDur + Math.random() * 0.3 : recDur;

      const src = this.ctx.createBufferSource();
      src.buffer = near.buf;
      src.playbackRate.value = rate;
      if (loop) {
        src.loop = true;
        src.loopStart = Math.max(0, near.buf.duration * 0.4);
        src.loopEnd = near.buf.duration - 0.02;
      }

      // \u8D77\u97F3\u5931\u771F\u8865\u507F\uFF1A\u97F3\u9AD8\u8D8A\u9AD8\uFF0C\u81EA\u7136\u97F3\u91CF\u8D8A\u5F31\uFF0C\u7A0D\u4F5C\u8865\u507F
      let gain = vel * (0.92 + Math.min(absSemis, 7) * 0.012);
      // \u97F3\u8272\u8865\u507F\uFF1A\u5347\u8C03\u540E\u9AD8\u9891\u53D8\u4EAE\uFF0C\u7528\u4F4E\u901A\u67D4\u5316\u5E76\u7565\u964D\u97F3\u91CF\uFF1B\u964D\u8C03\u540E\u9AD8\u9891\u4E0D\u8DB3\uFF0C\u7528\u9AD8\u901A\u524A\u53BB\u6D51\u6D4A
      let filter;
      if (semis > 0) {
        filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200 + 11200 / (1 + semis * 0.28);
        filter.Q.value = 0.35;
        gain *= 1 - Math.min(semis, 7) * 0.012;
      } else if (semis < 0) {
        filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 40 + absSemis * 18;
        filter.Q.value = 0.4;
      }

      const g = this.ctx.createGain();
      const attack = 0.003;
      const peak = gain;
      const sustain = peak * (semis > 0 ? 0.55 : 0.62);
      const tRelease = t0 + Math.min(playDur, 2.4) * 0.7;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + attack);
      g.gain.setTargetAtTime(sustain, t0 + attack, 0.22);       // \u62E8\u5F26\u540E\u80FD\u91CF\u5FEB\u901F\u4E0B\u964D
      g.gain.setTargetAtTime(0.0001, tRelease, 0.3);             // \u5C3E\u90E8\u81EA\u7136\u6D88\u5931

      const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      const chainOut = this.dry;
      let stopAt = t0 + Math.min(playDur, 2.4) + 1.6;

      if (filter) {
        src.connect(filter);
        filter.connect(g);
      } else {
        src.connect(g);
      }
      if (pan) {
        pan.pan.value = (Math.random() * 2 - 1) * 0.07;
        g.connect(pan);
        pan.connect(chainOut);
      } else {
        g.connect(chainOut);
      }

      src.start(t0);
      src.stop(stopAt);
      const self = this;
      src.onended = () => { self.sources.delete(src); self.gcSource(src); };
      this.sources.add(src);

      // \u6CDB\u97F3\u5C42\uFF1A\u540C\u4E00\u6837\u672C\u5347\u516B\u5EA6\u3001\u6781\u4F4E\u97F3\u91CF\u3001\u5FEB\u901F\u8870\u51CF \u2014\u2014 \u62E8\u5F26\u77AC\u95F4\u7684\u660E\u4EAE\u201C\u62E8\u7247\u58F0\u201D
      if (semis > 1) {
        const hs = this.ctx.createBufferSource();
        hs.buffer = near.buf;
        hs.playbackRate.value = rate * 2;
        const hg = this.ctx.createGain();
        const hLevel = peak * Math.min(0.28, 0.12 + semis * 0.03);
        hg.gain.setValueAtTime(0.0001, t0);
        hg.gain.linearRampToValueAtTime(hLevel, t0 + 0.004);
        hg.gain.setTargetAtTime(0.0001, t0 + 0.05, 0.07);
        hs.connect(hg);
        hg.connect(this.harmonic);
        hs.start(t0);
        hs.stop(t0 + 0.45);
        hs.onended = () => { self.sources.delete(hs); self.gcSource(hs); };
        this.sources.add(hs);
      }

      flashListenBtn();
      return true;
    },

    // \u4E3B\u52A8\u65AD\u5F00\u8282\u70B9\uFF0C\u907F\u514D\u957F\u65F6\u95F4\u7EC3\u4E60\u65F6\u8282\u70B9\u5806\u79EF
    gcSource(src) {
      try { src.disconnect(); } catch (e) { /* ignore */ }
    },

    stopAll() {
      this.sources.forEach((s) => { try { s.stop(); } catch (e) { /* ignore */ } });
      this.sources.clear();
    },

    /* ---------------------------------------------------------------
     *  \u548C\u5F26\u64AD\u653E\uFF1A\u4E00\u6B21\u53EA\u5141\u8BB8\u4E00\u4E2A\u6D3B\u8DC3\u6279\u6B21
     *
     *  \u8BBE\u8BA1\u8981\u6C42\uFF08\u5DF2\u786E\u8BA4\u89C4\u683C\uFF09\uFF1A
     *    - \u65B0\u8BF7\u6C42\u5148\u505C\u6389\u5E76\u6E05\u7406\u65E7\u6279\u6B21\uFF0C\u518D\u521B\u5EFA\u65B0\u6279\u6B21\uFF08\u7EDD\u4E0D\u91CD\u53E0\uFF09
     *    - \u6240\u6709\u8282\u70B9\u90FD\u80FD\u8FFD\u6EAF\u5230\u6240\u5C5E\u6279\u6B21\uFF08chordBatch.nodes\uFF09
     *    - \u65E7\u6279\u6B21\u7684\u7ED3\u675F\u56DE\u8C03\u4E0D\u5F97\u8BEF\u6E05\u65B0\u6279\u6B21\u7684\u8282\u70B9\uFF08\u6BD4\u5BF9 batchId\uFF09
     *    - \u64AD\u653E\u5B8C\u6210\u4E0E\u4E3B\u52A8\u505C\u6B62\u90FD\u5FC5\u987B\u6E05\u7406\u5BF9\u5E94\u6279\u6B21\u7684\u8D44\u6E90
     *    - \u9759\u97F3\u5F26\u4E0D\u521B\u5EFA\u97F3\u6E90\uFF0C\u4E5F\u4E0D\u5360\u7528\u626B\u5F26\u95F4\u9694
     * --------------------------------------------------------------- */
    chordBatch: null,
    chordBatchSeq: 0,
    /* \u5143\u7D20\u901A\u8DEF\uFF08file://\uFF09\u5EF6\u8FDF\u8D77\u64AD\u7684\u4EE4\u724C\uFF1A\u6BCF\u6B21 stopChord \u9012\u589E\uFF0C
       \u7528\u6765\u4F5C\u5E9F\u300C\u7B49 canplay \u518D\u64AD\u300D\u7684\u56DE\u8C03\uFF08\u89C1 playElementNode\uFF09\u3002 */
    elementPlayToken: 0,
    /* \u6700\u8FD1\u4E00\u6B21\u548C\u5F26\u64AD\u653E\u5B9E\u9645\u6392\u51FA\u7684\u5E8F\u5217\uFF08\u8BCA\u65AD\u7528\uFF0C\u89C1 window.__gft.chordAudio.lastPlan\uFF09 */
    lastChordPlan: null,

    /** \u505C\u6389\u5F53\u524D\u548C\u5F26\u6279\u6B21\u5E76\u6E05\u7406\u5B83\u521B\u5EFA\u7684\u5168\u90E8\u8282\u70B9 */
    stopChord() {
      /* \u5148\u4F5C\u5E9F\u6240\u6709\u300C\u7B49 canplay \u518D\u64AD\u300D\u7684\u5EF6\u8FDF\u56DE\u8C03\uFF1A\u5373\u4F7F\u5F53\u524D\u6CA1\u6709\u6279\u6B21\uFF0C
         \u5355\u4E2A\u97F3\u7684\u5143\u7D20\u901A\u8DEF\u5EF6\u8FDF\u8D77\u64AD\u4E5F\u5FC5\u987B\u4E00\u5E76\u653E\u5F03\u3002 */
      this.elementPlayToken++;
      const b = this.chordBatch;
      if (!b) return;
      this.chordBatch = null;
      /* \u964D\u7EA7\u901A\u8DEF\uFF08file://\uFF09\u7528\u5B9A\u65F6\u5668\u9010\u4E2A\u8D77\u64AD\uFF1A\u5FC5\u987B\u5728\u8FD9\u91CC\u53D6\u6D88\uFF0C
         \u5426\u5219\u300C\u6253\u65AD\u300D\u53EA\u662F\u4E0D\u521B\u5EFA\u65B0\u8282\u70B9\uFF0C\u5F85\u89E6\u53D1\u7684\u5B9A\u65F6\u5668\u8FD8\u4F1A\u7EE7\u7EED\u54CD\u3002 */
      if (b.timers) {
        b.timers.forEach((t) => { try { clearTimeout(t); } catch (e) { /* ignore */ } });
        b.timers.length = 0;
      }
      /* \u964D\u7EA7\u901A\u8DEF\u5DF2\u7ECF\u8D77\u64AD\u7684 <audio> \u5143\u7D20\u6CA1\u6709 stop()\uFF0C
         \u5FC5\u987B\u663E\u5F0F pause() \u624D\u80FD\u771F\u7684\u9759\u97F3 \u2014\u2014 \u5426\u5219\u6253\u65AD\u4E4B\u540E\u90A3\u6839\u5F26\u4F1A\u4E00\u76F4\u54CD\u5230\u91C7\u6837\u7ED3\u675F\u3002
         \uFF08Web Audio \u901A\u8DEF\u7684\u8282\u70B9\u4E0B\u9762\u4F1A\u7528 n.stop() \u5904\u7406\u3002\uFF09 */
      if (this.loadMode === 'element' && this.elementNodes.size) {
        this.elementNodes.forEach((node) => {
          if (!node.el.paused) { try { node.el.pause(); } catch (e) { /* ignore */ } }
        });
      }
      b.nodes.forEach((n) => {
        try { n.stop(); } catch (e) { /* \u5DF2\u7ED3\u675F */ }
        try { this.sources.delete(n); } catch (e) { /* ignore */ }
        try { n.disconnect(); } catch (e) { /* ignore */ }
      });
      b.nodes.length = 0;
      if (b.gains) {
        b.gains.forEach((g) => { try { g.disconnect(); } catch (e) { /* ignore */ } });
        b.gains.length = 0;
      }
    },

    /**
     * \u64AD\u653E\u4E00\u7EC4\u548C\u5F26\u97F3\u3002
     *
     * @param {Array<number|{midi:number,stringNumber?:number}>} midis
     *        \u97F3\u9AD8\u5217\u8868\u3002**\u987A\u5E8F\u5373\u626B\u5F26\u987A\u5E8F**\uFF1A\u8C03\u7528\u65B9\u5FC5\u987B\u6309\u5F26\u5E8F\u4F20\uFF086 \u5F26 \u2192 1 \u5F26\uFF09\uFF0C
     *        \u4E0D\u8981\u5148\u6309\u97F3\u9AD8\u6392\u5E8F\u518D\u4F20\u8FDB\u6765 \u2014\u2014 \u626B\u5F26\u662F\u7269\u7406\u52A8\u4F5C\uFF0C\u4E0E\u97F3\u9AD8\u9AD8\u4F4E\u65E0\u5173\u3002
     *        \u4E5F\u53EF\u4EE5\u4F20\u5E26 stringNumber \u7684\u5BF9\u8C61\uFF0C\u672C\u65B9\u6CD5\u4F1A\u81EA\u5DF1\u6309\u5F26\u5E8F\u91CD\u6392\uFF0C
     *        \u8FD9\u6837\u5373\u4F7F\u8C03\u7528\u65B9\u987A\u5E8F\u4F20\u9519\u4E5F\u4E0D\u4F1A\u51FA\u9519\u3002
     * @param {object} [opts] { strum: 'strum'|'strumUp'|'block', msPerString: 18, velocity }
     *   strum   \u2014\u2014 \u5411\u4E0B\u626B\u5F26\uFF1A6 \u5F26\u5148\u54CD\uFF0C\u6309\u5F26\u53F7 6 \u2192 1
     *   strumUp \u2014\u2014 \u5411\u4E0A\u626B\u5F26\uFF1A1 \u5F26\u5148\u54CD\uFF0C\u6309\u5F26\u53F7 1 \u2192 6
     *   block   \u2014\u2014 \u540C\u65F6\u53D1\u58F0\uFF08\u65E0\u65F6\u95F4\u9519\u4F4D\uFF09
     *   \u65B9\u5411\u53EA\u7531\u5F26\u53F7\u51B3\u5B9A\uFF0C**\u6C38\u8FDC\u4E0D\u6309\u97F3\u9AD8\u6392**\uFF1A\u626B\u5F26\u662F\u7269\u7406\u52A8\u4F5C\uFF0C
     *   \u5411\u4E0A\u626B\u65F6\u6700\u4F4E\u97F3\u7684 6 \u5F26\u662F\u6700\u540E\u54CD\u7684\uFF0C\u54EA\u6015\u5B83\u97F3\u9AD8\u6700\u4F4E\u3002
     * @returns {boolean} \u662F\u5426\u6210\u529F\u542F\u52A8
     */
    playChord(midis, opts) {
      const o = opts || {};
      const strumUp = o.strum === 'strumUp';
      const block = o.strum === 'block';
      /* \u5F52\u4E00\u6210 { midi, stringNumber } \u5E76\u6309\u626B\u5F26\u65B9\u5411\u91CD\u6392\u3002
         \u6CA1\u6709 stringNumber \u7684\u6761\u76EE\u6309\u4F20\u5165\u987A\u5E8F\u5904\u7406\uFF08\u8C03\u7528\u65B9\u5DF2\u4FDD\u8BC1\u662F\u5F26\u5E8F\uFF09\u3002 */
      let list = (Array.isArray(midis) ? midis : [])
        .map((m, i) => {
          if (typeof m === 'number' && isFinite(m)) return { midi: m, stringNumber: null, order: i };
          if (m && typeof m.midi === 'number' && isFinite(m.midi)) {
            return { midi: m.midi, stringNumber: typeof m.stringNumber === 'number' ? m.stringNumber : null, order: i };
          }
          return null;
        })
        .filter(Boolean);
      if (list.some((n) => n.stringNumber !== null)) {
        /* \u5E26\u5F26\u53F7\u65F6\u6309\u5F26\u53F7\u6392\uFF1A\u5411\u4E0B 6\u21921\uFF08\u964D\u5E8F\uFF09\uFF0C\u5411\u4E0A 1\u21926\uFF08\u5347\u5E8F\uFF09\u3002
           \u6CA1\u5F26\u53F7\u7684\u6392\u5728\u6700\u540E\u4FDD\u6301\u539F\u5E8F\u3002 */
        list = list.slice().sort((a, b) => {
          const sa = a.stringNumber === null ? 99 : a.stringNumber;
          const sb = b.stringNumber === null ? 99 : b.stringNumber;
          if (sa !== sb) return strumUp ? sa - sb : sb - sa;
          return a.order - b.order;
        });
      } else if (strumUp) {
        /* \u8C03\u7528\u65B9\u6CA1\u7ED9\u5F26\u53F7\uFF08\u7EAF midi \u6570\u7EC4\uFF09\uFF1A\u5411\u4E0A\u626B\u65F6\u628A\u987A\u5E8F\u53CD\u8FC7\u6765\uFF0C
           \u81F3\u5C11\u4FDD\u8BC1\u300C\u65B9\u5411\u300D\u662F\u53EF\u611F\u77E5\u7684\u3002 */
        list = list.slice().reverse();
      }
      const seq = list.map((n) => n.midi);
      /* \u5148\u505C\u65E7\u6279\u6B21\uFF1A\u5FC5\u987B\u5728\u4EFB\u4F55\u65B0\u8282\u70B9\u521B\u5EFA\u4E4B\u524D\uFF0C\u5426\u5219\u4E24\u4E2A\u548C\u5F26\u4F1A\u53E0\u5728\u4E00\u8D77\u54CD */
      this.stopChord();
      if (!seq.length) return false;
      /* \u8BB0\u5F55\u5B9E\u9645\u6392\u51FA\u7684\u5E8F\u5217\uFF08\u6D4B\u8BD5\u7528\uFF1A\u65AD\u8A00\u65B9\u5411\u6309\u5F26\u53F7\u800C\u4E0D\u662F\u6309\u97F3\u9AD8\uFF09 */
      this.lastChordPlan = {
        mode: block ? 'block' : (strumUp ? 'strumUp' : 'strum'),
        notes: list.map((n) => ({ midi: n.midi, stringNumber: n.stringNumber })),
        at: Date.now(),
      };
      if (this.useFallback || (this.loadMode === 'element' && this.elementNodes.size)) {
        /* \u964D\u7EA7\u901A\u8DEF\uFF08file:// \u53CC\u51FB\uFF09\uFF1A\u53EA\u80FD\u9010\u4E2A <audio> \u64AD\uFF0C\u6CA1\u6709 Web Audio \u7684
           \u7CBE\u786E\u8C03\u5EA6\uFF0C\u4F46\u65B9\u5411\u8BED\u4E49\u4E00\u81F4\uFF08seq \u5DF2\u6309\u65B9\u5411\u6392\u597D\uFF09\uFF0C
           \u5E76\u4E14\u4FDD\u8BC1\u300C\u65B0\u8BF7\u6C42\u6253\u65AD\u65E7\u8BF7\u6C42\u300D\u2014\u2014\u65E7\u6279\u6B21\u7684\u5B9A\u65F6\u5668\u81EA\u5DF1\u653E\u5F03\u3002
           \u548C\u5F26\u8981\u300C\u53E0\u300D\u7740\u54CD\uFF1Apoly \u6253\u5F00\u540E playElementNode \u4E0D\u518D\u6390\u6389\u522B\u7684\u5143\u7D20\uFF1B
           \u591A\u6839\u5F26\u540C\u65F6\u54CD\u4F1A\u628A\u97F3\u91CF\u53E0\u8D77\u6765\uFF0C\u6240\u4EE5\u6309 1/\u221An \u5F52\u4E00\uFF08\u4E0E Web Audio \u901A\u8DEF\u4E00\u81F4\uFF09\u3002 */
        const batchId = ++this.chordBatchSeq;
        const batch = { id: batchId, nodes: [], gains: [], els: [], timers: [] };
        this.chordBatch = batch;
        const ms = block ? 0 : Math.max(0, Number(o.msPerString) || 18);
        const baseVel = o.velocity === undefined ? 0.86 : o.velocity;
        const vel = baseVel / Math.sqrt(seq.length);
        seq.forEach((midi, i) => {
          const t = setTimeout(() => {
            if (!this.chordBatch || this.chordBatch.id !== batchId) return;
            this.play(midi, vel, { poly: true, batchId: batchId });
          }, i * ms);
          batch.timers.push(t);
        });
        return true;
      }
      if (!this.ctx) return false;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      if (!this.ready) return false;

      const batchId = ++this.chordBatchSeq;
      const batch = { id: batchId, nodes: [], gains: [] };
      this.chordBatch = batch;

      const strum = o.strum === 'block' ? 0 : Math.max(0, Number(o.msPerString) || 18);
      const vel = o.velocity === undefined ? 0.62 : o.velocity;
      const t0 = this.ctx.currentTime + 0.02;
      const self = this;

      seq.forEach((midi, i) => {
        const near = this.nearestBuffer(midi);
        if (!near) return;

        const start = t0 + (i * strum) / 1000;
        const semis = midi - near.midi;
        const absSemis = Math.abs(semis);
        const cents = semis > 0 ? semis * RATE_CORRECTION_CENTS_PER_SEMI : 0;
        const rate = Math.pow(2, semis / 12 + cents / 1200);

        const recDur = near.buf.duration / rate;
        const playDur = recDur < 2.2 ? 2.4 : recDur;

        const src = this.ctx.createBufferSource();
        src.buffer = near.buf;
        src.playbackRate.value = rate;
        if (recDur < 2.2) {
          src.loop = true;
          src.loopStart = Math.max(0, near.buf.duration * 0.4);
          src.loopEnd = near.buf.duration - 0.02;
        }

        /* \u516D\u6839\u5F26\u540C\u65F6\u54CD\u4F1A\u88AB\u538B\u7F29\u5668\u538B\u6241\uFF1A\u5355\u97F3\u589E\u76CA\u6309\u53D1\u58F0\u6570\u91CF\u5F52\u4E00\uFF0C
           \u518D\u7559\u4E00\u70B9\u4F59\u91CF\u7ED9\u626B\u5F26\u7684\u65F6\u95F4\u9519\u4F4D\uFF08\u9519\u4F4D\u672C\u8EAB\u5C31\u4F1A\u524A\u5CF0\uFF09\u3002 */
        const n = Math.max(1, seq.length);
        let gain = vel * (0.92 + Math.min(absSemis, 7) * 0.012) / Math.sqrt(n);

        let filter = null;
        if (semis > 0) {
          filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 1200 + 11200 / (1 + semis * 0.28);
          filter.Q.value = 0.35;
          gain *= 1 - Math.min(semis, 7) * 0.012;
        } else if (semis < 0) {
          filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 40 + absSemis * 18;
          filter.Q.value = 0.4;
        }

        const g = this.ctx.createGain();
        const attack = 0.004;
        const sustain = gain * (semis > 0 ? 0.55 : 0.62);
        const tRelease = start + Math.min(playDur, 2.4) * 0.7;
        g.gain.setValueAtTime(0.0001, start);
        g.gain.linearRampToValueAtTime(gain, start + attack);
        g.gain.setTargetAtTime(sustain, start + attack, 0.22);
        g.gain.setTargetAtTime(0.0001, tRelease, 0.3);

        const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        if (filter) { src.connect(filter); filter.connect(g); } else { src.connect(g); }
        if (pan) {
          /* \u5F26\u4F4D\u8D8A\u9760\u53F3\uFF08\u9AD8\u97F3\u5F26\uFF09\u8D8A\u504F\u53F3\uFF0C\u505A\u51FA\u4E00\u70B9\u626B\u5F26\u7684\u7A7A\u95F4\u611F */
          pan.pan.value = (i / Math.max(1, n - 1) - 0.5) * 0.34;
          g.connect(pan);
          pan.connect(this.dry);
          batch.gains.push(pan);
        } else {
          g.connect(this.dry);
        }
        batch.gains.push(g);

        const stopAt = start + Math.min(playDur, 2.4) + 1.4;
        src.start(start);
        src.stop(stopAt);

        /* \u7ED3\u675F\u56DE\u8C03\u5FC5\u987B\u6BD4\u5BF9 batchId\uFF1A\u65E7\u6279\u6B21\u7684 onended \u4E0D\u80FD\u5220\u6389\u65B0\u6279\u6B21\u7684\u8282\u70B9 */
        src.onended = () => {
          self.sources.delete(src);
          self.gcSource(src);
          if (self.chordBatch && self.chordBatch.id === batchId) {
            const idx = self.chordBatch.nodes.indexOf(src);
            if (idx >= 0) self.chordBatch.nodes.splice(idx, 1);
          }
        };
        this.sources.add(src);
        batch.nodes.push(src);
      });

      if (!batch.nodes.length) { this.chordBatch = null; return false; }
      flashListenBtn();
      return true;
    },

    /** \u5F53\u524D\u662F\u5426\u6709\u548C\u5F26\u6B63\u5728\u54CD */
    chordPlaying() {
      return !!(this.chordBatch && this.chordBatch.nodes.length);
    },

    /* \u6539\u97F3\u91CF\uFF1A\u53EA\u5199\u300C\u5F53\u524D\u6A21\u5F0F\u300D\uFF08\u6216\u6307\u5B9A\u6A21\u5F0F\uFF09\u90A3\u4E00\u4EFD\uFF0C\u518D\u628A master \u540C\u6B65\u8FC7\u53BB */
    setVolume(v, mode) {
      setSoundOf(mode || store.settings.mode, { volume: v });
      this.applyModeGain();
    },

    /* \u9759\u97F3\uFF1A\u53EA\u6539\u300C\u5F53\u524D\u6A21\u5F0F\u300D\uFF08\u6216\u6307\u5B9A\u6A21\u5F0F\uFF09\u90A3\u4E00\u4EFD\uFF1B
       \u76F4\u63A5\u5728\u8F93\u51FA\u7AEF\u628A\u589E\u76CA\u964D\u5230 0\uFF0C\u7ACB\u5373\u751F\u6548\u4E14\u4E0D\u5F71\u54CD\u540E\u7EED\u6062\u590D\u97F3\u91CF\u3002 */
    setMuted(muted, mode) {
      setSoundOf(mode || store.settings.mode, { muted: !!muted });
      this.applyModeGain();
    },

    /* \u628A master \u589E\u76CA\u540C\u6B65\u5230\u300C\u5F53\u524D\u6A21\u5F0F\u7684\u6709\u6548\u97F3\u91CF\u300D\u3002
       \u56DB\u4E2A\u6A21\u5F0F\u5404\u6709\u72EC\u7ACB\u7684\u9759\u97F3 / \u97F3\u91CF\u5B57\u6BB5\uFF08\u89C1 soundOf(mode)\uFF09\uFF0C
       \u5207\u6A21\u5F0F\u3001\u6539\u8BBE\u7F6E\u3001\u70B9\u9759\u97F3\u6309\u94AE\u90FD\u8D70\u8FD9\u4E00\u4E2A\u5165\u53E3\uFF0C
       \u907F\u514D\u5404\u81EA\u76F4\u63A5\u5199 master.gain \u5BFC\u81F4\u4E92\u76F8\u8986\u76D6\u3002 */
    applyModeGain() {
      if (!this.master || !this.ctx) { this.syncElementVolume(); return; }
      const s = soundOf(store.settings.mode);
      const target = s.muted ? 0 : clamp(s.volume, 0, 100) / 100;
      this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.03);
      this.syncElementVolume();
    },

    /* \u5143\u7D20\u901A\u8DEF\u6CA1\u6709 Web Audio \u589E\u76CA\u8282\u70B9\uFF0C\u97F3\u91CF\u548C\u9759\u97F3\u76F4\u63A5\u5199\u56DE <audio> \u5143\u7D20 */
    syncElementVolume() {
      if (!this.elementNodes || !this.elementNodes.size) return;
      const s = soundOf(store.settings.mode);
      const muted = !!s.muted;
      const v = clamp(s.volume / 100, 0, 1);
      this.elementNodes.forEach((node) => {
        node.el.muted = muted;
        node.el.volume = v;
      });
    },
  };

  /* ---------------------------------------------------------------
   *  \u6BCF\u6A21\u5F0F\u72EC\u7ACB\u7684\u58F0\u97F3\u8BBE\u7F6E
   *
   *  \u4E3A\u4EC0\u4E48\u4E0D\u518D\u5171\u7528 settings.muted / settings.volume\uFF1A
   *  \u7528\u6237\u5728\u300C\u627E\u4F4D\u7F6E\u6A21\u5F0F\u300D\u91CC\u9759\u97F3\uFF0C\u4E0D\u5E94\u8BE5\u628A\u300C\u548C\u5F26\u6A21\u5F0F\u300D\u4E5F\u4E00\u8D77\u9759\u6389\u3002
   *  \u56DB\u4E2A\u6A21\u5F0F\u5404\u6709\u4E00\u5BF9 { muted, volume }\uFF0C\u90FD\u843D\u5728 settings \u91CC\u968F\u5B58\u6863\u6301\u4E45\u5316\u3002
   * --------------------------------------------------------------- */
  const SOUND_FIELDS = {
    note: { muted: 'noteMuted', volume: 'noteVolume' },
    pos: { muted: 'posMuted', volume: 'posVolume' },
    chord: { muted: 'chordMuted', volume: 'chordVolume' },
    interval: { muted: 'intervalMuted', volume: 'intervalVolume' },
  };

  /* \u53D6\u67D0\u4E2A\u6A21\u5F0F\u7684\u6709\u6548\u58F0\u97F3\u8BBE\u7F6E\uFF08\u5E26\u9ED8\u8BA4\u503C\u4E0E\u6E05\u6D17\uFF09 */
  function soundOf(mode) {
    const m = SOUND_FIELDS[mode] ? mode : 'note';
    const f = SOUND_FIELDS[m];
    const s = store.settings;
    const vol = Number(s[f.volume]);
    return {
      muted: s[f.muted] === true,
      volume: isFinite(vol) ? clamp(vol, 0, 100) : 70,
    };
  }

  /* \u5199\u67D0\u4E2A\u6A21\u5F0F\u7684\u58F0\u97F3\u8BBE\u7F6E\uFF08\u53EA\u52A8\u5B83\u81EA\u5DF1\u90A3\u4E24\u4E2A\u5B57\u6BB5\uFF09 */
  function setSoundOf(mode, patch) {
    const m = SOUND_FIELDS[mode] ? mode : 'note';
    const f = SOUND_FIELDS[m];
    const s = store.settings;
    if (patch && typeof patch.muted === 'boolean') s[f.muted] = patch.muted;
    if (patch && patch.volume !== undefined) {
      const v = Number(patch.volume);
      if (isFinite(v)) s[f.volume] = clamp(v, 0, 100);
    }
    /* \u517C\u5BB9\u5B57\u6BB5\uFF1A\u5168\u5C40 muted / volume \u8DDF\u968F\u5F53\u524D\u6A21\u5F0F\uFF0C
       \u65E7\u811A\u672C\u4E0E\u65E7\u6D4B\u8BD5\u8BFB\u5B83\u4EEC\u65F6\u4E0D\u4F1A\u62FF\u5230\u8FC7\u671F\u503C\u3002 */
    s.muted = soundOf(store.settings.mode).muted;
    s.volume = soundOf(store.settings.mode).volume;
  }

  /* \u628A\u517C\u5BB9\u5B57\u6BB5\u540C\u6B65\u6210\u5F53\u524D\u6A21\u5F0F\u7684\u503C\uFF08\u5207\u6A21\u5F0F\u65F6\u8C03\u7528\uFF09 */
  function syncLegacySound() {
    const cur = soundOf(store.settings.mode);
    store.settings.muted = cur.muted;
    store.settings.volume = cur.volume;
  }

  /* \u65E7\u5B58\u6863\u8FC1\u79FB\uFF1A\u53EA\u6709\u5168\u5C40 muted / volume \u65F6\uFF0C\u628A\u5B83\u4EEC\u843D\u5230\u300C\u5B58\u6863\u91CC\u90A3\u4E2A\u6A21\u5F0F\u300D\u4E0A\u3002
     \u5176\u4F59\u6A21\u5F0F\u4FDD\u6301\u9ED8\u8BA4\uFF08\u9ED8\u8BA4\u5C31\u662F\u300C\u4E0D\u9759\u97F3 + 70%\u300D\uFF09\uFF0C\u56E0\u6B64\u5347\u7EA7\u540E\u7528\u6237\u770B\u5230\u7684
     \u5F53\u524D\u6A21\u5F0F\u58F0\u97F3\u4E0E\u5347\u7EA7\u524D\u5B8C\u5168\u4E00\u81F4\uFF0C\u5176\u5B83\u6A21\u5F0F\u4E5F\u4E0D\u4F1A\u88AB\u8FDE\u5E26\u9759\u97F3\u3002
     target \u7F3A\u7701\u662F store.settings\uFF1B\u5BFC\u5165\u5907\u4EFD\u65F6\u4F20\u6B63\u5728\u6821\u9A8C\u7684\u4E34\u65F6\u5BF9\u8C61\uFF0C
     \u8FD9\u6837\u300C\u6821\u9A8C\u901A\u8FC7\u624D\u843D\u5730\u300D\u7684\u7EA6\u5B9A\u4E0D\u4F1A\u88AB\u7834\u574F\u3002 */
  function migrateModeSound(rawSettings, target) {
    const s = target || store.settings;
    const has = (k) => rawSettings && Object.prototype.hasOwnProperty.call(rawSettings, k);
    const anyModeField = Object.keys(SOUND_FIELDS).some((m) => {
      const f = SOUND_FIELDS[m];
      return has(f.muted) || has(f.volume);
    });
    if (!anyModeField) {
      /* \u5168\u65B0\u8FC1\u79FB\uFF1A\u5F53\u524D\u6A21\u5F0F\u7684\u8FD9\u4E00\u5BF9\u76F4\u63A5\u7EE7\u627F\u65E7\u5168\u5C40\u503C */
      const mode = SOUND_FIELDS[s.mode] ? s.mode : 'note';
      const f = SOUND_FIELDS[mode];
      s[f.muted] = s.muted === true;
      const vol = Number(s.volume);
      s[f.volume] = isFinite(vol) ? clamp(vol, 0, 100) : 70;
    }
    cleanSoundFields(s);
  }

  /* \u628A\u516B\u4E2A\u6309\u6A21\u5F0F\u7684\u58F0\u97F3\u5B57\u6BB5\u6E05\u6D17\u4E00\u904D\uFF08\u810F\u503C\u4F1A\u8BA9\u64AD\u653E\u8C03\u5EA6\u8D70\u5230\u610F\u5916\u5206\u652F\uFF09\u3002
     \u5BFC\u5165\u5907\u4EFD\u65F6\u4E5F\u8D70\u8FD9\u91CC\uFF0C\u903B\u8F91\u4E0E\u542F\u52A8\u8FC1\u79FB\u4FDD\u6301\u540C\u4E00\u4EFD\u3002 */
  function cleanSoundFields(s) {
    if (!s) return;
    Object.keys(SOUND_FIELDS).forEach((m) => {
      const f = SOUND_FIELDS[m];
      s[f.muted] = s[f.muted] === true;
      const v = Number(s[f.volume]);
      s[f.volume] = isFinite(v) ? clamp(v, 0, 100) : 70;
    });
  }

  let flashTimer = null;
  function flashListenBtn() {
    const b = $('#btnListen');
    if (!b) return;
    b.classList.add('ringing');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => b.classList.remove('ringing'), 450);
  }

  /* \u515C\u5E95\u64AD\u653E\uFF1A\u6CA1\u6709 Web Audio \u65F6\u7528 <audio> \u76F4\u63A5\u64AD\u653E\u91C7\u6837\uFF08\u81EA\u52A8\u97F3\u91CF\u8F83\u51C6\uFF09 */
  function playViaElement(midi) {
    const name = SAMPLE_NOTES.reduce((best, n) => {
      const d = Math.abs(audio.sampleMidi(n) - midi);
      return d < best.d ? { n: n, d: d } : best;
    }, { n: 'A4', d: Infinity }).n;
    const el = new Audio(SAMPLE_BASE + name + '.mp3');
    const snd = soundOf(store.settings.mode);
    el.muted = !!snd.muted;
    el.volume = clamp(clamp(snd.volume, 0, 100) / 100, 0, 1);
    el.play().then(() => flashListenBtn()).catch(() => {
      updateSoundStatus('\u6D4F\u89C8\u5668\u963B\u6B62\u4E86\u58F0\u97F3\uFF0C\u8BF7\u70B9\u4E00\u4E0B\u9875\u9762\u540E\u518D\u8BD5');
    });
  }

  function updateSoundStatus(override) {
    const el = $('#listenNote');
    if (!el) return;
    const total = SAMPLE_NOTES.length;
    if (override) { el.textContent = override; el.style.color = 'var(--red)'; return; }
    if (audio.useFallback) {
      el.textContent = '\u5DF2\u5207\u6362\u4E3A\u5185\u7F6E\u64AD\u653E\u5668\uFF08\u97F3\u9AD8\u4E0D\u505A\u53D8\u8C03\uFF09';
      el.style.color = 'var(--amber-2)';
      return;
    }
    if (audio.initError) {
      el.textContent = '\u58F0\u97F3\u521D\u59CB\u5316\u5931\u8D25\uFF08' + audio.initError + '\uFF09';
      el.style.color = 'var(--red)';
      return;
    }
    if (audio.ready) {
      const isElementMode = audio.loadMode === 'element' && audio.elementNodes && audio.elementNodes.size;
      const loaded = isElementMode ? audio.elementNodes.size : audio.buffers.size;
      const bad = isElementMode ? [] : audio.failed.filter((n) => !audio.buffers.has(audio.sampleMidi(n)));
      let txt = '\u771F\u5B9E\u6728\u5409\u4ED6\u91C7\u6837 \u00B7 \u5DF2\u52A0\u8F7D ' + loaded + ' / ' + total + ' \u4E2A\u97F3\u9AD8';
      if (isElementMode) txt += '\uFF08\u672C\u5730\u6587\u4EF6\u6A21\u5F0F\uFF09';
      if (bad.length) txt += '\uFF08' + bad.length + ' \u4E2A\u4E0D\u53EF\u7528\uFF09';
      el.textContent = txt;
      el.style.color = bad.length ? 'var(--amber-2)' : '';
      return;
    }
    if (audio.loading) {
      el.textContent = '\u58F0\u97F3\u91C7\u6837\u52A0\u8F7D\u4E2D\u2026';
      el.style.color = 'var(--amber-2)';
    } else if (!navigator.userActivation || navigator.userActivation.hasBeenActive) {
      // \u70B9\u51FB\u8FC7\u9875\u9762\u4ECD\u8BFB\u4E0D\u5230\uFF1A\u591A\u534A\u662F\u672C\u5730\u6587\u4EF6\u88AB\u62E6\u622A\uFF0C\u7ED9\u51FA\u53EF\u64CD\u4F5C\u7684\u63D0\u793A
      el.textContent = '\u65E0\u6CD5\u8BFB\u53D6\u97F3\u9891\u6587\u4EF6\uFF08' + (audio.lastError || '\u6D4F\u89C8\u5668\u62E6\u622A\u4E86\u672C\u5730\u6587\u4EF6')
        + '\uFF09\u00B7 \u8BF7\u628A index.html \u548C samples \u6587\u4EF6\u5939\u653E\u5728\u540C\u4E00\u76EE\u5F55\uFF0C\u6216\u53CC\u51FB dist/index.html';
      el.style.color = 'var(--red)';
    } else {
      el.textContent = '\u70B9\u51FB\u9875\u9762\u5373\u53EF\u52A0\u8F7D\u58F0\u97F3\uFF08\u6D4F\u89C8\u5668\u8981\u6C42\u5148\u70B9\u51FB\u624D\u80FD\u64AD\u653E\uFF09';
      el.style.color = 'var(--amber-2)';
    }
  }

  /* ---------------------------------------------------------------
   *  \u9898\u76EE\u8303\u56F4
   * --------------------------------------------------------------- */
  function buildCandidates() {
    const s = store.settings;
    const out = [];
    /* \u7528\u5F53\u524D\u6A21\u5F0F\u81EA\u5DF1\u7684\u8303\u56F4\uFF08noteRange / posRange\uFF09\uFF0C\u4E0D\u518D\u8BFB\u5171\u4EAB\u7684 range */
    const parts = currentRange().split('-');
    const a = Number(parts[0]);
    const b = Number(parts[1]);
    const allowed = allowedPcs();
    STRINGS.forEach((st) => {
      if (!s.strings.includes(st.n)) return;
      for (let f = a; f <= b; f++) {
        if (allowed.indexOf(pcOf(st.midi + f)) < 0) continue;   // \u6309\u201C\u9898\u76EE\u5347\u964D\u8C03\u201D\u7684\u591A\u9009\u8FC7\u6EE4
        out.push({ s: st.n, f: f, key: posKey(st.n, f) });
      }
    });
    return out;
  }

  /* \u5F53\u524D\u6A21\u5F0F\u5BF9\u5E94\u7684\u8303\u56F4\u5B57\u6BB5\u540D\uFF1A\u97F3\u540D \u2192 noteRange\uFF0C\u627E\u4F4D\u7F6E \u2192 posRange\u3002
     \u548C\u5F26\u6A21\u5F0F\u4E0D\u8D70\u8FD9\u91CC\uFF08\u5B83\u6709\u81EA\u5DF1\u7684 chordRange\uFF09\u3002 */
  function rangeKeyFor(mode) {
    /* \u97F3\u7A0B\u6A21\u5F0F\u6709\u72EC\u7ACB\u7684 intervalRange\uFF0C\u4E0D\u8D70\u8FD9\u91CC\uFF08\u89C1 intervalFretMax\uFF09 */
    return mode === 'pos' ? 'posRange' : 'noteRange';
  }

  /* \u5F53\u524D\u6A21\u5F0F\u7684\u8303\u56F4\u503C\uFF08\u8BFB\u4E0D\u5230\u65F6\u9000\u56DE 0-12\uFF0C\u907F\u514D\u65E7\u5B58\u6863\u7F3A\u5B57\u6BB5\u5BFC\u81F4\u6307\u677F\u7A7A\u767D\uFF09 */
  function currentRange() {
    const key = rangeKeyFor(store.settings.mode);
    const v = store.settings[key];
    if (typeof v === 'string' && /^\d+-\d+$/.test(v)) return v;
    /* \u65E7\u5B58\u6863\u53EA\u6709 range\uFF1A\u8FC1\u79FB\u5230\u5F53\u524D\u6A21\u5F0F\uFF0C\u53E6\u4E00\u4E2A\u6A21\u5F0F\u4FDD\u6301\u9ED8\u8BA4 */
    const legacy = store.settings.range;
    if (typeof legacy === 'string' && /^\d+-\d+$/.test(legacy)) return legacy;
    return '0-12';
  }

  function rangeFretMax() {
    const r = currentRange();
    if (r === 'natural') return 12;
    return Number(r.split('-')[1]);
  }

  /* \u517C\u5BB9\u5B57\u6BB5 range \u59CB\u7EC8\u8DDF\u968F\u5F53\u524D\u6A21\u5F0F\uFF0C\u5916\u90E8\u811A\u672C / \u65E7\u6D4B\u8BD5\u8BFB\u5B83\u4E0D\u4F1A\u62FF\u5230\u8FC7\u671F\u503C\u3002
     \u97F3\u7A0B\u6A21\u5F0F\u6709\u81EA\u5DF1\u7684 intervalRange\uFF0C\u4E0D\u5C5E\u4E8E note/pos \u7684\u8FD9\u5957\u517C\u5BB9\u5B57\u6BB5\uFF0C
     \u6240\u4EE5\u843D\u5728\u97F3\u7A0B\u6A21\u5F0F\u65F6\u4FDD\u6301\u539F\u503C\u4E0D\u52A8\uFF08\u907F\u514D\u628A\u97F3\u7A0B\u8303\u56F4\u5199\u8FDB note/pos \u7684\u5355\u9009\u7EC4\uFF09\u3002 */
  function syncLegacyRange() {
    if (store.settings.mode === 'interval') return;
    store.settings.range = currentRange();
  }

  /* ---------------------------------------------------------------
   *  \u300C\u5F00\u59CB\u65B9\u5F0F\u300D\u6309\u6A21\u5F0F\u5404\u5B58\u4E00\u4EFD\uFF08\u7B2C 7 \u6761\u9694\u79BB\uFF09
   *    \u97F3\u540D \u2192 startMode\uFF1B\u627E\u4F4D\u7F6E \u2192 posStartMode\uFF1B\u548C\u5F26 \u2192 chordStartMode\uFF1B
   *    \u97F3\u7A0B \u2192 intervalStartMode\uFF08\u97F3\u7A0B\u672C\u6765\u5C31\u6709\u81EA\u5DF1\u7684\u4E00\u5957\u63A7\u4EF6\uFF09\u3002
   *  \u6539\u4E00\u4E2A\u6A21\u5F0F\u4E0D\u4F1A\u8FDE\u5E26\u6539\u53E6\u4E00\u4E2A\u6A21\u5F0F\uFF0C\u8FD9\u662F\u8BBE\u7F6E\u9694\u79BB\u7684\u4E00\u90E8\u5206\u3002
   * --------------------------------------------------------------- */
  function startModeKeyFor(mode) {
    if (mode === 'pos') return 'posStartMode';
    if (mode === 'chord') return 'chordStartMode';
    if (mode === 'interval') return 'intervalStartMode';
    return 'startMode';
  }
  function startModeOf(mode) {
    return store.settings[startModeKeyFor(mode)] === 'auto' ? 'auto' : 'manual';
  }
  function modeStartMode() { return startModeOf(store.settings.mode); }

  /* \u300C\u4E0B\u4E00\u9898\u81EA\u52A8\u5F00\u59CB / \u7B54\u5BF9\u81EA\u52A8\u4E0B\u4E00\u9898\u300D\u4E5F\u6309\u6A21\u5F0F\u5404\u5B58\u4E00\u4EFD\uFF08\u7B2C 5 / 7 \u6761\uFF09\u3002
     \u97F3\u540D\uFF1AautoStartOnNext / autoNextOnCorrect\uFF08\u97F3\u540D\u81EA\u5DF1\u7684\u8001\u5B57\u6BB5\uFF09
     \u627E\u4F4D\u7F6E\uFF1AposAutoStartOnNext / posAutoNextOnCorrect\uFF08Q44\uFF09
     \u548C\u5F26\uFF1AchordAutoStartOnNext / chordAutoNextOnCorrect\uFF08\u9ED8\u8BA4\u90FD\u5173\uFF0C\u89C1 DEFAULT_SETTINGS\uFF09
     \u97F3\u7A0B\uFF1A\u4E0D\u5728\u8FD9\u5957\u63A7\u4EF6\u91CC\uFF08\u6709 intervalAutoStartNext / intervalAutoNextOnCorrect\uFF09 */
  function pushSettingsForCurrentMode() {
    const s = store.settings;
    const mode = s.mode;
    if (mode === 'pos') {
      return { startNext: s.posAutoStartOnNext === true, nextCorrect: s.posAutoNextOnCorrect === true };
    }
    if (mode === 'chord') {
      return { startNext: s.chordAutoStartOnNext === true, nextCorrect: s.chordAutoNextOnCorrect === true };
    }
    return { startNext: s.autoStartOnNext !== false, nextCorrect: s.autoNextOnCorrect === true };
  }

  /* ---------------------------------------------------------------
   *  \u6392\u9898\u6743\u91CD\uFF1A\u6309\u201C\u7B54\u9519\u7387\u201D\u51B3\u5B9A\u4E0B\u4E00\u9898\u51FA\u54EA\u4E2A\u97F3\uFF08\u4E0D\u770B\u65F6\u95F4\u3001\u4E0D\u7528\u9057\u5FD8\u66F2\u7EBF\uFF09
   *    \u7B54\u9519\u7387 = \u9519 / (\u5BF9 + \u9519)
   *    \u9519\u5F97\u8D8A\u591A \u2192 \u6743\u91CD\u8D8A\u5927\uFF1B\u4ECE\u6CA1\u7EC3\u8FC7\u7684\u4F4D\u7F6E\u7ED9\u4E00\u4E2A\u4E2D\u7B49\u504F\u9AD8\u7684\u521D\u59CB\u6743\u91CD\uFF0C\u4FDD\u8BC1\u65B0\u4F4D\u7F6E\u6709\u673A\u4F1A\u51FA\u73B0
   * --------------------------------------------------------------- */
  const NEW_POSITION_WEIGHT = 3;   // \u65B0\u4F4D\u7F6E\u7684\u521D\u59CB\u6743\u91CD\uFF08\u4FDD\u7559\u63A2\u7D22\u673A\u4F1A\uFF09
  const SAME_PC_DAMP = 0.15;       // \u4E00\u8F6E\u5185\u540C\u4E00\u4E2A\u97F3\u540D\u518D\u6B21\u51FA\u73B0\u65F6\u7684\u6743\u91CD\u6298\u6263
  const RECENT_WINDOW = 8;         // \u8FD1\u671F\u8868\u73B0\u53EA\u770B\u6700\u8FD1\u82E5\u5E72\u6B21\uFF0C\u907F\u514D\u65E7\u9519\u8BEF\u6C38\u4E45\u62D6\u7D2F
  /* \u4FA7\u680F\u56FE1\u300C\u8FD1\u671F\u8868\u73B0\u300D\u7528\u7684\u5B8C\u6574\u5386\u53F2\u4E0A\u9650\u3002\u4E0E RECENT_WINDOW \u662F\u4E24\u5957\uFF1A
     recent\uFF08\u22648\uFF09\u53EA\u5582\u6392\u9898\u6743\u91CD\u4E0E\u56FE4 \u5B9E\u65F6\u5224\u5B9A\uFF0Chist\uFF08\u226499\uFF09\u53EA\u7ED9\u56FE1 \u663E\u793A\u3002
     \u5230\u9876\u540E\u505C\u6B62\u5199\u5165\u5E76\u6807\u8BB0 histFull\uFF0C\u56FE1 \u7684\u5206\u6BCD\u9501 99 \u5E76\u52A0\u4E00\u884C\u8BF4\u660E\uFF08D57\uFF09\u3002 */
  const HIST_LIMIT = 99;
  /* \u627E\u4F4D\u7F6E\u6A21\u5F0F\u4FA7\u680F\u7528\u7684\u300C\u6700\u8FD1\u82E5\u5E72\u9898\u300D\uFF1A\u8DE8 A/B \u5207\u6362\u4E0E\u5237\u65B0\u90FD\u4E0D\u6E05\u96F6\uFF08Q43\uFF09\uFF0C
     \u53EA\u4FDD\u7559\u7CBE\u7B80\u5B57\u6BB5\uFF0C\u907F\u514D localStorage \u88AB\u9010\u683C\u660E\u7EC6\u6491\u7206\u3002 */
  const POS_RECENT_LIMIT = 60;

  /* \u5F80\u5BF9\u8C61\u7684 hist \u91CC\u8BB0\u4E00\u6761\u5B8C\u6574\u5386\u53F2\uFF08\u56FE1\u300C\u8FD1\u671F\u8868\u73B0\u300D\u552F\u4E00\u6570\u636E\u6E90\uFF09\u3002
     \u56DB\u7C7B\u5361\u7247\u5171\u7528\uFF1A\u5355\u97F3\u5361 / \u548C\u5F26\u5361 / \u97F3\u7A0B\u5361 / \u627E\u4F4D\u7F6E\u5355\u4F4D\u7EDF\u8BA1\u3002
     \u5230 HIST_LIMIT \u540E\u4E0D\u518D\u5199\u5165\uFF0C\u53EA\u6253 histFull \u6807\u8BB0 \u2014\u2014 \u56FE1 \u636E\u6B64\u628A\u5206\u6BCD\u9501 99 \u5E76\u52A0\u8BF4\u660E\u3002 */
  function pushHist(obj, ok) {
    if (!obj) return;
    if (!Array.isArray(obj.hist)) obj.hist = [];
    if (obj.hist.length >= HIST_LIMIT) { obj.histFull = true; return; }
    obj.hist.push(!!ok);
  }

  /* ---------------------------------------------------------------
   *  \u4FA7\u680F\u5199\u5165\u70B9\uFF08\u56FE2 / \u56FE1 / \u56FE3 \u7684\u552F\u4E00\u6570\u636E\u6765\u6E90\uFF09
   *
   *  \u6E32\u67D3\u5C42\u53EA\u8BFB store\uFF1B\u6240\u6709\u5B66\u4E60\u7EDF\u8BA1\u90FD\u5728\u56DB\u4E2A\u6A21\u5F0F\u7684\u5224\u5B9A\u51FD\u6570\u91CC\u5404\u5199\u4E00\u6B21\uFF0C
   *  \u4FDD\u8BC1\u300C\u4E00\u6B21\u5224\u5B9A\u53EA +1\u300D\u3002\u5199\u5728\u8FD9\u91CC\u800C\u4E0D\u662F\u6E32\u67D3\u51FD\u6570\u91CC\uFF0C\u662F\u56E0\u4E3A\u6E32\u67D3\u4F1A\u5728
   *  \u5207\u6A21\u5F0F / \u5207\u73A9\u6CD5 / \u5BFC\u5165\u5907\u4EFD\u65F6\u91CD\u590D\u89E6\u53D1\u3002
   * --------------------------------------------------------------- */

  /** \u6A21\u5F0F\u7D2F\u8BA1\uFF08\u56FE2\uFF09\uFF1A\u8D85\u65F6\u4E5F\u7B97 wrong\uFF1BbestCombo \u53EA\u589E\u4E0D\u51CF\uFF08D37 / D72\uFF09\u3002 */
  function bumpModeStats(mode, ok) {
    const key = MODE_STAT_KEYS.indexOf(mode) >= 0 ? mode : null;
    if (!key) return;
    if (!store.modeStats[key]) store.modeStats[key] = blankModeStat();
    const st = store.modeStats[key];
    if (ok) {
      st.right++;
      st.streak++;
      if (st.streak > st.bestCombo) st.bestCombo = st.streak;
    } else {
      st.wrong++;
      st.streak = 0;
    }
  }

  /** \u627E\u4F4D\u7F6E\u5355\u4F4D\u7EDF\u8BA1\uFF1A\u4E00\u9898\u8BB0\u4E00\u6761\uFF08\u4E0D\u6309\u683C\u5B50\u653E\u5927\uFF09\uFF0C\u56FE1 \u5728 pos \u4E0B\u5168\u90E8\u8BFB\u8FD9\u91CC\uFF08D61\uFF09\u3002 */
  function bumpPosUnit(key, ok) {
    if (!key) return;
    if (!store.posUnitStats[key]) {
      store.posUnitStats[key] = {
        n: 0, right: 0, wrong: 0, lvl: 0, streak: 0, bestCombo: 0,
        recent: [], hist: [], histFull: false, last: 0,
      };
    }
    const st = store.posUnitStats[key];
    st.n++;
    st.last = nowMs();
    if (ok) {
      st.right++;
      st.streak++;
      if (st.streak > st.bestCombo) st.bestCombo = st.streak;
      st.lvl = clamp((st.lvl || 0) + 1, 1, SRS_INTERVALS.length);
    } else {
      st.wrong++;
      st.streak = 0;
      st.lvl = st.lvl >= 4 ? st.lvl - 1 : 0;
    }
    st.recent = Array.isArray(st.recent) ? st.recent.slice(-(RECENT_WINDOW - 1)) : [];
    st.recent.push(!!ok);
    pushHist(st, !!ok);
  }

  /** \u8F6E\u6B21\u5FEB\u7167\uFF08\u56FE3\uFF09\uFF1A\u5F00\u8F6E\u90A3\u4E00\u523B\u51BB\u7ED3\uFF1Bplan \u53D6\u771F\u5B9E\u5165\u961F\u957F\u5EA6\uFF0C\u4E0D\u662F settings.size\uFF08D12\uFF09\u3002 */
  function freezeSnapshot(queue, mode, keyOf) {
    const keyf = keyOf || function (item) { return item.key; };
    const snap = { plan: queue.length, newKeys: new Set(), reviewKeys: new Set(), done: new Set() };
    queue.forEach((item) => {
      const k = keyf(item);
      if (!k) return;
      let reviewed = false;
      if (mode === 'pos') {
        const st = store.posUnitStats[k];
        reviewed = !!(st && st.n > 0);
      } else {
        const c = cardOfMode(mode, k);
        reviewed = !!c && ((c.a || 0) + (c.e || 0)) > 0;
      }
      if (reviewed) snap.reviewKeys.add(k); else snap.newKeys.add(k);
    });
    return snap;
  }

  /*
   * \u51FA\u9898\u6743\u91CD\u7531\u56DB\u90E8\u5206\u7EC4\u6210\uFF1A
   *  1. \u5E73\u6ED1\u540E\u7684\u7D2F\u8BA1\u9519\u8BEF\u7387\uFF1A\u6837\u672C\u5C11\u65F6\u4E0D\u4F1A\u56E0\u4E3A\u4E00\u6B21\u9519/\u5BF9\u5C31\u5267\u70C8\u53D8\u5316\uFF1B
   *  2. \u8FD1\u671F\u9519\u8BEF\u7387\uFF1A\u8FDE\u7EED\u7B54\u9519\u4F1A\u6BD4\u5F88\u4E45\u4EE5\u524D\u7684\u9519\u8BEF\u66F4\u5FEB\u63D0\u9AD8\u6743\u91CD\uFF1B
   *  3. \u5230\u671F\u52A0\u6743\uFF1A\u5230\u4E86\u590D\u4E60\u65F6\u95F4\u7684\u5361\u7247\u9010\u6E10\u4F18\u5148\uFF1B
   *  4. \u521A\u7EC3\u8FC7\u6291\u5236\uFF1A\u907F\u514D\u540C\u4E00\u4F4D\u7F6E\u8FDE\u7EED\u51FA\u73B0\uFF0C\u9664\u975E\u5B83\u5DF2\u5230\u671F\u3002
   * \u6743\u91CD\u6709\u4E0A\u4E0B\u9650\uFF0C\u9632\u6B62\u5355\u4E2A\u96BE\u70B9\u9738\u5360\u6574\u8F6E\u9898\u76EE\u3002
   */
  function positionWeight(card) {
    if (!card || (!card.a && !card.e)) return NEW_POSITION_WEIGHT;
    const total = Math.max(1, (card.a || 0) + (card.e || 0));
    const historicalErr = ((card.e || 0) + 1) / (total + 2); // Beta(1,1) \u5E73\u6ED1
    const recent = Array.isArray(card.recent) ? card.recent.slice(-RECENT_WINDOW) : [];
    const recentErr = recent.length ? recent.filter((x) => !x).length / recent.length : historicalErr;
    const errorScore = 0.55 * historicalErr + 0.45 * recentErr;
    let weight = 0.65 + 11.5 * Math.pow(errorScore, 1.45);

    const now = nowMs();
    if (card.due) {
      const dueAge = now - card.due;
      if (dueAge >= 0) weight *= 1 + Math.min(1.5, dueAge / (24 * 60 * 60000));
      else weight *= Math.max(0.35, 1 - Math.min(0.65, -dueAge / (12 * 60000)));
    }
    if (card.last && now - card.last < 2 * 60000 && (!card.due || card.due > now)) weight *= 0.35;
    return clamp(weight, 0.25, 18);
  }

  function weightedPick(items, weightOf) {
    let total = 0;
    for (let i = 0; i < items.length; i++) total += weightOf(items[i]);
    if (total <= 0) return items[Math.floor(Math.random() * items.length)];
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weightOf(items[i]);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  /** \u6309\u6743\u91CD\u62BD\u4E00\u8F6E\u9898\u76EE\uFF08\u6BCF\u4E2A\u4F4D\u7F6E\u4E00\u8F6E\u5185\u6700\u591A\u4E00\u6B21\uFF1B\u540C\u4E00\u97F3\u540D\u4F1A\u964D\u6743\u907F\u514D\u624E\u5806\uFF09
   *  excludeKeys\uFF1A\u53EF\u9009\uFF0C\u8981\u6392\u9664\u7684\u683C\u5B50 key\uFF08\u7528\u4E8E\u300C\u6362\u4E00\u9898\u65F6\u4E0D\u8981\u521A\u7B54\u8FC7\u7684\u90A3\u9053\u300D\uFF09\u3002
   *  \u8FD4\u56DE\u957F\u5EA6 = min(\u53EF\u7528\u5019\u9009\u6570, roundSize)\uFF0C\u4E0D\u4F1A\u6709\u5185\u90E8\u91CD\u590D\u3002
   *  \u4EE5\u524D refreshQuestion \u662F\u5148\u62BD\u6EE1\u518D filter \u6389\u4E0A\u4E00\u9898\uFF0C\u7ED3\u679C\u961F\u5217\u6BD4 size \u5C11\u4E00\u9053\uFF1B
   *  \u6392\u9664\u5FC5\u987B\u53D1\u751F\u5728\u62BD\u6837\u4E4B\u524D\uFF0C\u624D\u80FD\u65E2\u6EE1\u8DB3\u4E0A\u9650\u53C8\u4E0D\u7F29\u6C34\u3002 */
  function buildSchedule(roundSize, lastKey, excludeKeys) {
    const cands = buildCandidates();
    let pool = cands;
    if (store.settings.novelty === 'familiar') {
      const fam = cands.filter((c) => store.cards[c.key] && store.cards[c.key].a > 0);
      pool = fam.length >= 4 ? fam : cands;
    }
    if (excludeKeys && excludeKeys.length) {
      const ex = new Set(excludeKeys);
      pool = pool.filter((c) => !ex.has(c.key));
    }
    const used = new Set();
    const schedule = [];
    const usedPcs = new Set();

    while (schedule.length < roundSize) {
      const avail = pool.filter((c) => !used.has(c.key));
      if (!avail.length) break;
      // \u5148\u628A\u8FD9\u4E00\u8F6E\u91CC\u5DF2\u7ECF\u51FA\u73B0\u8FC7\u7684\u97F3\u540D\u6311\u51FA\u53BB\uFF08\u90FD\u6311\u5B8C\u624D\u5141\u8BB8\u91CD\u590D\uFF09
      const fresh = avail.filter((c) => !usedPcs.has(pcOf(midiOf(c.s, c.f))));
      const list = fresh.length ? fresh : avail;
      const best = weightedPick(list, (c) => {
        const w = positionWeight(store.cards[c.key]);
        const pc = pcOf(midiOf(c.s, c.f));
        const same = usedPcs.has(pc) ? SAME_PC_DAMP : 1;
        return w * same;
      });
      used.add(best.key);
      usedPcs.add(pcOf(midiOf(best.s, best.f)));
      schedule.push(best);
    }

    // \u7B2C\u4E00\u9898\u4E0D\u8981\u548C\u4E0A\u4E00\u8F6E\u6700\u540E\u4E00\u9898\u76F8\u540C
    if (schedule.length > 1 && lastKey && schedule[0].key === lastKey) {
      const tmp = schedule[0];
      schedule[0] = schedule[1];
      schedule[1] = tmp;
    }
    return schedule;
  }

  /* ---------------------------------------------------------------
   *  \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1A\u4E24\u79CD\u73A9\u6CD5
   *
   *  A \u00B7 \u5355\u5F26\u627E\u5168\u97F3\uFF1A\u4E00\u9898 =\u300C\u67D0\u5F26\u4E0A\u7684\u67D0\u97F3\u300D\uFF0C\u627E\u51FA\u8BE5\u5F26\u4E0A\u5B83\u7684\u5168\u90E8\u683C\uFF081\u20132 \u4E2A\uFF09\u3002
   *      \u6CBF\u7528\u300C\u4E00\u8F6E N \u9898\u300D\u7684\u56DE\u5408\u7ED3\u6784\uFF08size \u751F\u6548\uFF09\u3002
   *  B \u00B7 \u6307\u677F\u627E\u5168\u97F3\uFF1A\u4E00\u9898 =\u300C\u67D0\u4E2A\u97F3\u300D\uFF0C\u627E\u51FA\u5B83\u5728\u5168\u90E8\u52FE\u9009\u5F26\u4E0A\u7684\u5168\u90E8\u683C\uFF086\u20137 \u4E2A\uFF09\u3002
   *      \u4E00\u9898\u5373\u4E00\u56DE\u5408\uFF08size \u4E0D\u751F\u6548\uFF0C\u6C38\u4E0D\u51FA\u73B0\u300C\u672C\u8F6E\u5B8C\u6210\u300D\uFF09\u3002
   *
   *  \u5019\u9009\u5355\u4F4D\uFF08\u51B3\u5B9A\u300C\u4E00\u9053\u9898\u300D\u662F\u4EC0\u4E48\uFF09\uFF1A
   *    A = (\u5F26, \u97F3\u540D) \u5BF9 \u2014\u2014 \u9898\u5E93\u4ECE 7 \u4E2A\u97F3\u540D\u6269\u6210 7 \u00D7 \u5F26\u6570\uFF0C\u540C\u4E00\u97F3\u540D\u5728\u4E0D\u540C\u5F26
   *        \u662F\u4E0D\u540C\u9898\u76EE\uFF0C\u6B63\u597D\u5BF9\u5E94\u300C\u8FD9\u6839\u5F26\u4E0A\u5B83\u5728\u54EA\u300D\u8FD9\u4E00\u6B65\u6620\u5C04\u3002
   *    B = \u97F3\u540D \u2014\u2014 \u4E00\u9898\u5C31\u8981\u626B\u6574\u5757\u6307\u677F\uFF0C\u518D\u6309\u5F26\u62C6\u5206\u6CA1\u6709\u610F\u4E49\u3002
   *  \u6743\u91CD\u53D6\u8BE5\u5355\u4F4D\u4E0B**\u6700\u5F31\u90A3\u5F20\u5361**\uFF08\u9519\u5F97\u6700\u591A\u7684\u683C\u5B50\u6700\u8BE5\u7EC3\uFF09\uFF0C\u4E0E\u97F3\u540D\u6A21\u5F0F\u540C\u4E00\u5957\u3002
   * --------------------------------------------------------------- */
  function posPlayA() { return store.settings.posPlay === 'a'; }

  /* \u627E\u4F4D\u7F6E\u6A21\u5F0F\u7684\u4E09\u4E2A\u63A8\u8FDB\u5F00\u5173\uFF08Q44\uFF09\uFF1A\u5728\u8BBE\u7F6E\u91CC\u5168\u90E8\u53EF\u89C1\uFF0C\u4F46\u90FD\u8BFB pos \u81EA\u5DF1\u7684\u4E00\u4EFD\uFF0C
     \u514D\u5F97\u5728\u627E\u4F4D\u7F6E\u91CC\u6539\u4E00\u4E0B\u5C31\u628A\u97F3\u540D\u6A21\u5F0F\u7684\u5168\u5C40\u9ED8\u8BA4\u5E26\u8DD1\u3002
     \u00B7 \u7B54\u9519\u540E\u5148\u505C\u4F4F\uFF1A\u53EA\u6709\u73A9\u6CD5 A \u6709\u300C\u672C\u8F6E\u4E0B\u4E00\u9898\u300D\u53EF\u505C\uFF0CB \u4E00\u9898\u4E00\u56DE\u5408 \u2192 \u65E0\u5BF9\u8C61\uFF1B
     \u00B7 \u70B9\u4E0B\u4E00\u9898\u81EA\u52A8\u5F00\u59CB / \u7B54\u5BF9\u81EA\u52A8\u4E0B\u4E00\u9898\uFF1A\u4E24\u79CD\u73A9\u6CD5\u90FD\u6210\u7ACB\uFF0C\u9ED8\u8BA4\u5173\u3002 */
  function posPauseOnWrong() { return posPlayA() && store.settings.pauseOnWrong !== false; }
  function posAutoNextOnCorrect() { return store.settings.posAutoNextOnCorrect === true; }
  function posAutoStartOnNext() { return store.settings.posAutoStartOnNext === true; }

  /** \u5207\u6362\u627E\u4F4D\u7F6E\u73A9\u6CD5\uFF08Q39\uFF1A\u5207\u6362\u5373\u4FDD\u5B58\u5E76\u7ACB\u523B\u7528\u65B0\u73A9\u6CD5\u91CD\u5F00\u4E00\u9898\uFF0C\u4E0D\u52A8\u5361\u7247\u4E0E\u5386\u53F2\uFF09 */
  function setPosPlay(play) {
    const want = play === 'a' ? 'a' : 'b';
    if (store.settings.posPlay === want) return;
    store.settings.posPlay = want;
    save();
    syncPosSettingsUI();
    if (store.settings.mode === 'pos') startRound();   // startRound() \u5185\u90E8\u4F1A\u91CD\u6E32\u67D3\u4FA7\u680F
    else renderSidebar();
  }

  /** A \u7684\u5019\u9009\u952E\uFF1A(\u5F26, \u97F3\u540D)\uFF1BB \u7684\u5019\u9009\u952E\uFF1A\u97F3\u540D\u3002\u4E24\u8005\u5F62\u72B6\u4E0D\u540C\uFF0C\u4E0D\u4F1A\u4E92\u76F8\u6C61\u67D3\u3002 */
  function posUnitKey(s, pc) { return s == null ? 'pn' + pc : 'ps' + s + 'n' + pc; }

  /** \u67D0\u4E2A (\u5F26, \u97F3\u540D) \u5728\u7B54\u9898\u8303\u56F4\u5185\u7684\u5168\u90E8\u683C\u5B50\uFF1Bs = null \u8868\u793A\u8DE8\u5168\u90E8\u52FE\u9009\u5F26 */
  function posCellsFor(s, pc) {
    return buildCandidates().filter((c) => (s == null || c.s === s) && pcOf(midiOf(c.s, c.f)) === pc);
  }

  /** \u5F53\u524D\u73A9\u6CD5\u4E0B\u7684\u5168\u90E8\u5019\u9009\u5355\u4F4D\uFF08\u53EA\u4FDD\u7559\u300C\u8303\u56F4\u5185\u786E\u5B9E\u6709\u683C\u5B50\u300D\u7684\u90A3\u4E9B\uFF09 */
  function posUnits() {
    const out = [];
    const pcs = allowedPcs();
    if (posPlayA()) {
      const chosen = STRINGS.filter((st) => store.settings.strings.indexOf(st.n) >= 0);
      chosen.forEach((st) => {
        pcs.forEach((pc) => {
          const cells = posCellsFor(st.n, pc);
          if (!cells.length) return;      // \u7A84\u8303\u56F4\uFF08\u5982 1\u20135 \u54C1\uFF09\u91CC\u67D0\u4E9B\u97F3\u6839\u672C\u4E0D\u51FA\u73B0
          out.push({ s: st.n, pc: pc, key: posUnitKey(st.n, pc) });
        });
      });
    } else {
      pcs.forEach((pc) => {
        const cells = posCellsFor(null, pc);
        if (!cells.length) return;
        out.push({ s: null, pc: pc, key: posUnitKey(null, pc) });
      });
    }
    return out;
  }

  /** \u5355\u4F4D\u6743\u91CD = \u5B83\u540D\u4E0B\u6240\u6709\u683C\u5B50\u91CC\u6700\u5F31\uFF08\u6700\u5BB9\u6613\u9519\uFF09\u7684\u90A3\u5F20\u5361 */
  function posUnitWeight(unit) {
    const cells = posCellsFor(unit.s, unit.pc);
    let w = 0;
    cells.forEach((c) => { w = Math.max(w, positionWeight(store.posCards[posKey(c.s, c.f)])); });
    return w || NEW_POSITION_WEIGHT;
  }

  /** \u8BE5\u5355\u4F4D\u4E0B\u662F\u5426\u5DF2\u7ECF\u7EC3\u8FC7\uFF08novelty='familiar' \u7528\uFF09 */
  function posUnitSeen(unit) {
    return posCellsFor(unit.s, unit.pc).some((c) => {
      const card = store.posCards[posKey(c.s, c.f)];
      return !!card && card.a > 0;
    });
  }

  /** \u628A\u5019\u9009\u5355\u4F4D\u53D8\u6210\u4E00\u9053\u771F\u6B63\u7684\u9898\uFF1A\u5E26\u4E0A\u4EE3\u8868\u683C\uFF08\u9650\u65F6 / \u4FA7\u680F / \u6717\u8BFB\u90FD\u8981\u4E00\u683C\uFF09 */
  function posQuestionFromUnit(unit) {
    const cells = posCellsFor(unit.s, unit.pc);
    if (!cells.length) return null;
    /* \u4EE3\u8868\u683C = \u8BE5\u97F3\u6700\u4F4E\u7684\u90A3\u4E00\u683C\uFF08A \u5929\u7136\u5C31\u662F\u8BE5\u5F26\u6700\u4F4E\u683C\uFF0CB \u662F\u5168\u6307\u677F\u6700\u4F4E\u683C\uFF09\u3002
       \u5B83\u53EA\u7528\u4E8E\u9650\u65F6\u3001\u4FA7\u680F\u4E0E\u300C\u542C\u8FD9\u4E2A\u97F3\u300D\u7684\u5B9A\u4F4D\uFF0C\u5224\u5206\u6C38\u8FDC\u6309 cells \u5168\u96C6\u3002 */
    const rep = cells.reduce((a, b) => (b.f < a.f ? b : a), cells[0]);
    return {
      s: rep.s, f: rep.f, pc: unit.pc, key: unit.key,
      cells: cells.map((c) => ({ s: c.s, f: c.f })),
      card: store.posCards[posKey(rep.s, rep.f)] || null,
    };
  }

  /** \u627E\u4F4D\u7F6E\u6A21\u5F0F\u7684\u4E00\u8F6E\u9898\u76EE\uFF1A\u4E0E buildSchedule \u540C\u4E00\u5957\u6743\u91CD\u4E0E\u300C\u540C\u8F6E\u4E0D\u91CD\u590D\u300D\u89C4\u5219\uFF0C
   *  \u53EA\u662F\u62BD\u7684\u5355\u4F4D\u4ECE\u300C\u683C\u5B50\u300D\u6362\u6210\u4E86\u300C(\u5F26, \u97F3\u540D) \u5BF9 / \u97F3\u540D\u300D\u3002
   *  B \u4E0B size \u4E0D\u751F\u6548\uFF08\u4E00\u9898\u4E00\u56DE\u5408\uFF09\uFF0C\u8C03\u7528\u65B9\u4F20 1\u3002 */
  function buildPosSchedule(roundSize, lastKey, excludeKeys) {
    let pool = posUnits();
    if (store.settings.novelty === 'familiar') {
      const fam = pool.filter(posUnitSeen);
      pool = fam.length >= 4 ? fam : pool;
    }
    if (excludeKeys && excludeKeys.length) {
      const ex = new Set(excludeKeys);
      pool = pool.filter((u) => !ex.has(u.key));
    }
    const used = new Set();
    const usedPcs = new Set();
    const schedule = [];
    while (schedule.length < roundSize) {
      const avail = pool.filter((u) => !used.has(u.key));
      if (!avail.length) break;                 // \u6C60\u5B50\u62BD\u5E72 \u2192 \u5141\u8BB8\u91CD\u590D\uFF08\u4E0B\u4E00\u8F6E\u518D\u6765\uFF09
      const fresh = avail.filter((u) => !usedPcs.has(u.pc));
      const list = fresh.length ? fresh : avail;
      const best = weightedPick(list, (u) => {
        const damp = usedPcs.has(u.pc) ? SAME_PC_DAMP : 1;
        return posUnitWeight(u) * damp;
      });
      used.add(best.key);
      usedPcs.add(best.pc);
      const q = posQuestionFromUnit(best);
      if (q) schedule.push(q);
      else used.add(best.key);                  // \u7406\u8BBA\u4E0A\u4E0D\u4F1A\u53D1\u751F\uFF0C\u515C\u5E95\u9632\u6B7B\u5FAA\u73AF
    }
    if (schedule.length > 1 && lastKey && schedule[0].key === lastKey) {
      const tmp = schedule[0];
      schedule[0] = schedule[1];
      schedule[1] = tmp;
    }
    /* \u6C60\u5B50\u62BD\u5E72\u540E\u4ECD\u4E0D\u8DB3 roundSize\uFF1A\u5141\u8BB8\u91CD\u590D\u8865\u6EE1\uFF08Q25 a\uFF09\u3002
       \u7B2C\u4E8C\u8F6E\u8D77\u540C\u4E00\u9898\u53EF\u4EE5\u518D\u51FA\u73B0\uFF0C\u6743\u91CD\u7EE7\u7EED\u6309\u5F31\u9879\u8D70\u3002 */
    let guard = 0;
    while (schedule.length < roundSize && schedule.length && guard++ < roundSize * 4) {
      const q = posQuestionFromUnit(weightedPick(pool, posUnitWeight));
      if (q) schedule.push(q);
    }
    return schedule;
  }

  /* ---------------------------------------------------------------
   *  \u4E00\u8F6E\u8BAD\u7EC3\u72B6\u6001
   * --------------------------------------------------------------- */
  const round = {
    queue: [], idx: 0, results: [], current: null,
    state: 'idle', answeredAt: 0, lastClick: null,
    streak: 0, bestStreak: 0, lastKey: null, timer: null, deadline: 0,
    limit: 10, waitStart: false, startAt: 0, pendingNext: null,
    booted: false,          // DOM \u7ED1\u5B9A\u5B8C\u6210\u524D\u4E0D\u542F\u52A8\u8BA1\u65F6
    /* \u97F3\u540D\u6A21\u5F0F\u672C\u9898\u4F5C\u7B54\u7ED3\u679C\uFF1A\u7528\u6765\u5728\u6307\u677F\u4E0A\u6807\u7EA2\u300C\u4F60\u9009\u7684\u90A3\u4E2A\u4F4D\u7F6E\u300D\u3002
       chosenPc = \u7528\u6237\u9009\u7684\u97F3\u7EA7\uFF080\u201311\uFF09\uFF0C\u8D85\u65F6\u4E3A null\uFF1BlastOk = \u662F\u5426\u7B54\u5BF9\u3002 */
    chosenPc: null, lastOk: null,
    /* \u672C\u8F6E\u5B66\u4E60\u5206\u5E03\u5FEB\u7167\uFF08\u56FE3\uFF09\uFF1A\u5F00\u8F6E\u65F6\u51BB\u7ED3\uFF0C\u8F6E\u6B21\u7ED3\u675F\u540E\u4FDD\u7559\uFF08D33 / D38\uFF09 */
    snapshot: null,
  };

  function startRound() {
    if (round.timer) clearInterval(round.timer);
    if (round.pendingNext) { clearTimeout(round.pendingNext); round.pendingNext = null; }
    if (store.settings.mode === 'pos') {
      /* \u627E\u4F4D\u7F6E\uFF1A\u73A9\u6CD5 B \u4E00\u9898\u5373\u4E00\u56DE\u5408\uFF08size \u4E0D\u751F\u6548\uFF09\uFF0CA \u7167\u65E7\u6309\u9898\u91CF\u3002
         \u300C\u672C\u8F6E\u5168\u5BF9 N/M\u300D\u7684 M \u4E5F\u8DDF\u961F\u5217\u957F\u5EA6\u8D70 \u2014\u2014 B \u4E0B\u6052\u4E3A 1\u3002 */
      const n = posPlayA() ? Math.max(1, Number(store.settings.size) || 10) : 1;
      round.queue = buildPosSchedule(n, round.lastKey);
    } else {
      round.queue = buildSchedule(store.settings.size, round.lastKey);
    }
    round.idx = 0;
    round.results = [];
    round.state = 'idle';
    round.current = null;
    /* \u56FE3 \u5FEB\u7167\uFF1A\u5F00\u8F6E\u90A3\u4E00\u523B\u51BB\u7ED3\uFF08\u65B0\u9898/\u590D\u4E60\u9898 + \u771F\u5B9E\u5165\u961F\u957F\u5EA6\uFF09\u3002
       pos \u73A9\u6CD5 B \u4E00\u9898\u4E00\u56DE\u5408\uFF0C\u4E0D\u5EFA\u5FEB\u7167\uFF08\u56FE3 \u6574\u5757\u9690\u85CF\uFF0CD68\uFF09\u3002 */
    const posB = store.settings.mode === 'pos' && !posPlayA();
    round.snapshot = posB ? null : freezeSnapshot(round.queue, store.settings.mode === 'pos' ? 'pos' : 'note');
    /* \u5F53\u524D\u8FDE\u5BF9\u53EA\u5728\u672C\u8F6E\u5F00\u59CB\u65F6\u6E05\u96F6\uFF08D37\uFF09\uFF1BbestCombo \u5B58\u5728 modeStats \u91CC\uFF0C\u6C38\u4E0D\u56DE\u843D\u3002 */
    if (posB) {
      store.posBStats.streak = 0;
    } else {
      modeStatOf(store.settings.mode === 'pos' ? 'pos' : 'note').streak = 0;
    }
    renderSidebar();
    nextQuestion();
  }

  function nextQuestion(autoStart) {
    if (round.timer) clearInterval(round.timer);
    if (round.pendingNext) { clearTimeout(round.pendingNext); round.pendingNext = null; }
    if (round.idx >= round.queue.length) { finishRound(); return; }
    syncActiveBoardHost();
    const item = round.queue[round.idx];
    const isPos = store.settings.mode === 'pos';
    /* \u627E\u4F4D\u7F6E\u6A21\u5F0F\u7684\u9898\u5E26\u7684\u662F\u300C\u5355\u4F4D\u952E\u300D\uFF08\u5F26+\u97F3\u540D / \u97F3\u540D\uFF09\u4E0E cells \u5168\u96C6\uFF0C
       \u4E0D\u662F\u5355\u683C\u5361\u7247\uFF1B\u5B83\u7684 SRS \u5361\u5728 submitPositions \u91CC\u6309 cells \u9010\u683C\u5199\u3002 */
    const pc = isPos ? item.pc : pcOf(midiOf(item.s, item.f));
    const spelling = questionSpelling(pc);
    round.current = Object.assign({}, item, {
      card: isPos ? (item.card || null) : getCard(item.key),
      spelling: spelling,
    });
    round.state = 'asking';
    round.answeredAt = 0;
    round.lastClick = null;
    /* \u65B0\u9898\u5F00\u59CB\uFF1A\u6E05\u6389\u4E0A\u4E00\u9898\u7684\u4F5C\u7B54\u75D5\u8FF9\uFF0C\u5426\u5219\u4E0A\u4E00\u9898\u7684\u7EA2\u8272\u300C\u7B54\u9519\u70B9\u300D\u4F1A\u6B8B\u7559\u5230\u4E0B\u4E00\u9898 */
    round.chosenPc = null;
    round.lastOk = null;
    // \u624B\u52A8\u6A21\u5F0F\u9ED8\u8BA4\u7B49\u7528\u6237\u70B9\u201C\u5F00\u59CB\u201D\uFF1BautoStart=true \u65F6\u89C6\u4E3A\u201C\u70B9\u51FB\u4E0B\u4E00\u9898\u81EA\u52A8\u5F00\u59CB\u201D
    /* \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1A\u73A9\u6CD5 B \u4E00\u9898\u5373\u4E00\u56DE\u5408\uFF0C\u6BCF\u9898\u90FD\u505C\u5728\u906E\u7F69\u4E0A\u7B49\u4E00\u6B21\u70B9\u51FB\uFF08Q29\uFF09\uFF0C
       \u53EA\u6709\u628A\u300C\u70B9\u4E0B\u4E00\u9898\u81EA\u52A8\u5F00\u59CB\u300D\u6253\u5F00\u624D\u4F1A\u8DF3\u8FC7\uFF1B\u73A9\u6CD5 A \u7528\u627E\u4F4D\u7F6E\u81EA\u5DF1\u7684 posStartMode
       \uFF08\u7B2C 7 \u6761\uFF1A\u4E0D\u518D\u501F\u7528\u97F3\u540D\u6A21\u5F0F\u7684 startMode\uFF09\u3002 */
    round.waitStart = !autoStart && (isPos
      ? (posPlayA() ? startModeOf('pos') === 'manual' : true) || ui.screen !== 'practice'
      : (startModeOf('note') === 'manual' || ui.screen !== 'practice'));
    round.limit = timeLimitFor(item.s, item.f);
    setPrompt(round.current);
    buildOptions(round.current);
    updateFeedback('', '');
    renderSidebar();
    if (!round.booted) {
      // \u542F\u52A8\u9636\u6BB5\uFF1A\u53EA\u628A\u9762\u677F\u6446\u51FA\u6765\uFF08\u4E0D\u663E\u793A\u5F00\u59CB\u533A\u3001\u4E0D\u542F\u52A8\u8BA1\u65F6\uFF09
      const startBox = $('#startBox');
      if (startBox) startBox.hidden = true;
      applyWaitingUI(true);
      return;
    }
    if (round.waitStart) showWaitToStart();
    else { applyWaitingUI(false); beginQuestion(); }
  }

  /* \u7B49\u5F85\u5F00\u59CB\uFF1A\u9690\u85CF\u9898\u76EE\u6587\u5B57\u548C\u9009\u9879\u3001\u6307\u677F\u4E0D\u663E\u793A\u9898\u76EE\u4F4D\u7F6E\uFF1B\u5F00\u59CB\u540E\u6062\u590D */
  function applyWaitingUI(waiting) {
    const posMode = store.settings.mode === 'pos';
    const card = $('#promptCard');
    const opts = $('#optionHead') || $('.option-head');
    if (card) card.classList.toggle('masked', waiting && !posMode);
    if (opts) opts.classList.toggle('masked', waiting && !posMode);
    const box = $('#options');
    if (box) box.classList.toggle('masked', waiting && !posMode);
    document.body.classList.toggle('pre-start', waiting);
    const note = $('#posNote');
    const mask = $('#posStartMask');
    if (mask) mask.hidden = !(waiting && posMode);
    if (posMode && note) note.classList.toggle('masked', waiting);
  }

  /* \u624B\u52A8\u5F00\u59CB\u6A21\u5F0F\uFF1A\u5148\u51FA\u9898\uFF0C\u4F46\u4E0D\u8BA1\u65F6\u3001\u4E0D\u51FA\u58F0\uFF0C\u7B49\u7528\u6237\u81EA\u5DF1\u6309\u201C\u5F00\u59CB\u8BA1\u65F6\u201D */
  function showWaitToStart() {
    if (round.timer) clearInterval(round.timer);
    round.state = 'asking';
    round.deadline = 0;
    applyWaitingUI(true);
    const limitTxt = round.limit === Infinity ? '\u4E0D\u9650\u65F6' : '\u9650\u65F6 ' + fmtSec(round.limit);
    if (round.limit === Infinity) {
      $('#timerNum').textContent = '\u221E';
      $('#posTimerNum').textContent = '\u221E';
      $('#startSub').textContent = '\u4E0D\u9650\u65F6 \u00B7 \u70B9\u6309\u624D\u5F00\u59CB';
    } else {
      $('#timerNum').textContent = String(Math.round(round.limit));
      $('#posTimerNum').textContent = String(Math.round(round.limit));
      $('#startSub').textContent = '\u9650\u65F6 ' + fmtSec(round.limit) + ' \u00B7 \u70B9\u6309\u624D\u5F00\u59CB\u8BA1\u65F6';
    }
    $('#posStartSub').textContent = limitTxt + ' \u00B7 \u70B9\u4E00\u4E0B\u5F00\u59CB\u8BA1\u65F6\u5E76\u51FA\u58F0';
    ['#timerNum', '#posTimerNum'].forEach((s) => $(s).classList.add('idle'));
    ['#ringFg', '#posRingFg'].forEach((s) => {
      const ring = $(s);
      ring.style.strokeDashoffset = '0';
      ring.classList.remove('warn', 'danger');
      ring.classList.add('idle-ring');
    });
    // \u5F00\u59CB\u533A\u56FA\u5B9A\u5728\u9898\u76EE\u5361\u7247\u53F3\u4FA7\uFF08\u539F\u6765\u5012\u8BA1\u65F6\u5706\u73AF\u7684\u4F4D\u7F6E\uFF09\uFF0C\u4E0D\u518D\u8DDF\u968F\u9898\u76EE\u4F4D\u7F6E\u6F02\u79FB
    $('#startBox').hidden = false;
    // \u6E05\u6389\u4E0A\u4E00\u9898\u7684\u7B54\u6848\u75D5\u8FF9
    document.querySelectorAll('#options .opt').forEach((b) => { b.disabled = false; b.className = 'opt'; });
    updateFeedback('', '');
    syncPosUI();
    renderFretboard();
    /* \u4FA7\u680F\u8DDF\u7740\u4E00\u8D77\u56DE\u5230\u300C\u672A\u5F00\u59CB\u300D\uFF1A\u56FE1 \u7684\u8BAD\u7EC3\u5BF9\u8C61\u8981\u53D8\u56DE\u300C\uFF1F \u00B7 \uFF1F\u300D\u3002
       \u9996\u9898\u8DEF\u5F84 nextQuestion() \u5DF2\u7ECF\u5148\u753B\u8FC7\u4E00\u6B21\uFF0C\u8FD9\u91CC\u518D\u753B\u4E00\u6B21\u662F\u5E42\u7B49\u7684\uFF1B
       \u4F46\u8BBE\u7F6E\u91CC\u5207\u56DE\u624B\u52A8\u5F00\u59CB\uFF08startMode \u76D1\u542C\uFF09\u53EA\u4F1A\u8C03\u672C\u51FD\u6570\uFF0C\u9760\u8FD9\u4E00\u884C\u624D\u5237\u65B0\u3002 */
    renderSidebar();
  }

  /* \u7528\u6237\u70B9\u201C\u5F00\u59CB\u201D\u540E\uFF1A\u8BA1\u65F6 + \u51FA\u58F0 */
  function beginQuestion() {
    if (round.timer) clearInterval(round.timer);
    round.waitStart = false;
    round.state = 'asking';
    round.startAt = nowMs();
    round.infinite = round.limit === Infinity;
    round.deadline = round.infinite ? Infinity : round.startAt + round.limit * 1000;
    $('#startBox').hidden = true;
    const mask = $('#posStartMask');
    if (mask) mask.hidden = true;
    applyWaitingUI(false);
    ['#timerNum', '#posTimerNum'].forEach((s) => { const el = $(s); if (el) el.classList.remove('idle'); });
    ['#ringFg', '#posRingFg'].forEach((s) => { const el = $(s); if (el) el.classList.remove('idle-ring'); });
    startTimer();
    syncPosUI();
    renderFretboard();
    /* \u70B9\u5F00\u59CB\u540E waitStart \u5DF2\u53D8 false\uFF1A\u56FE1 \u7684\u300C\uFF1F \u00B7 \uFF1F\u300D\u8FD9\u624D\u8BE5\u6362\u6210\u771F\u5B9E\u7684\u300CN \u5F26 \u00B7 \u97F3\u540D\u300D */
    renderSidebar();
    const item = round.current;
    if (store.settings.autoPlay) {
      const key = item.key;
      ensureAudio().then(() => {
        if (round.current && round.current.key === key && round.state === 'asking' && !round.waitStart) {
          audio.play(questionToneMidi(item));
        }
      });
    }
  }

  /* \u7528\u6237\u8FD8\u6CA1\u5F00\u59CB\u8BA1\u65F6\u5C31\u70B9\u7B54\u6848\u65F6\uFF1A\u63D0\u793A\u5148\u5F00\u59CB\uFF08\u5E76\u8BA9\u5F00\u59CB\u6309\u94AE\u95EA\u4E00\u4E0B\uFF09 */
  function nudgeStart() {
    ensureAudio();
    updateFeedback('\u5148\u70B9\u300C\u5F00\u59CB\u8BA1\u65F6\u300D\u624D\u4F1A\u5F00\u59CB\u7B54\u9898\u5E76\u64AD\u653E\u58F0\u97F3\uFF08\u6309\u7A7A\u683C\u4E5F\u884C\uFF09', 'info');
    const card = $('#startBox');
    if (!card) return;
    card.classList.remove('pulse');
    void card.offsetWidth;
    card.classList.add('pulse');
  }

  function startTimer() {
    if (round.state !== 'asking') return;
    if (round.timer) clearInterval(round.timer);
    const rings = ['#ringFg', '#posRingFg'].map((s) => $(s)).filter(Boolean);
    const nums = ['#timerNum', '#posTimerNum'].map((s) => $(s)).filter(Boolean);
    const total = round.infinite ? Infinity : round.limit * 1000;
    if (round.infinite) {
      // \u4E0D\u9650\u65F6\uFF1A\u5706\u73AF\u5E38\u4EAE\uFF0C\u663E\u793A \u221E\uFF0C\u53EA\u8BB0\u5F55\u201C\u5F00\u59CB\u65F6\u523B\u201D
      nums.forEach((n) => { n.textContent = '\u221E'; n.classList.remove('idle'); });
      rings.forEach((r) => { r.style.strokeDashoffset = '0'; r.classList.remove('warn', 'danger', 'idle-ring'); });
      return;
    }
    const tick = () => {
      const left = Math.max(0, round.deadline - nowMs());
      const frac = left / total;
      rings.forEach((r) => {
        r.style.strokeDashoffset = String(213.6 * (1 - frac));
        r.classList.toggle('warn', frac <= 0.6 && frac > 0.3);
        r.classList.toggle('danger', frac <= 0.3);
      });
      nums.forEach((n) => { n.textContent = String(Math.ceil(left / 1000)); });
      if (left <= 0) {
        clearInterval(round.timer);
        round.timer = null;
        timeUp();
      }
    };
    tick();
    round.timer = setInterval(tick, 100);
  }

  function timeUp() {
    if (round.state !== 'asking') return;
    resolveAnswer(null, true, store.settings.mode === 'pos' ? { fromPos: true } : undefined);
  }

  /* ---------------------------------------------------------------
   *  \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF08\u72EC\u7ACB\u7EC3\u4E60\uFF09\uFF1A\u7ED9\u97F3\u540D\uFF0C\u5728\u6307\u677F\u4E0A\u627E\u51FA\u8BE5\u97F3\u7684\u5168\u90E8\u4F4D\u7F6E
   * --------------------------------------------------------------- */
  const pos = {
    picks: [],          // \u5DF2\u9009\u683C\u5B50 [{s,f}]\uFF0C\u6309\u9009\u62E9\u987A\u5E8F
    submitting: false,  // \u9632\u6B62\u91CD\u590D\u63D0\u4EA4
    last: null,         // \u6700\u8FD1\u4E00\u6B21\u63D0\u4EA4\u7ED3\u679C { targets, picks, missed, extra, ok }\uFF0C\u4F9B\u6307\u677F\u7ED8\u5236
  };

  /** \u5F53\u524D\u9898\u76EE\u7684\u5168\u90E8\u76EE\u6807\u683C
   *  \u627E\u4F4D\u7F6E\u6A21\u5F0F\u7684\u9898\u5728\u6392\u9898\u65F6\u5C31\u628A cells \u7B97\u597D\u4E86\uFF08A = \u8BE5\u5F26\u4E0A\u8BE5\u97F3\u540D\u7684\u683C\uFF0C
   *  B = \u5168\u6307\u677F\u8BE5\u97F3\u540D\u7684\u683C\uFF09\uFF0C\u76F4\u63A5\u7528\uFF1B\u5176\u5B83\u6A21\u5F0F\u6CA1\u6709 cells\uFF0C\u9000\u56DE\u6309\u97F3\u540D\u626B\u3002 */
  function targetPositions(q) {
    if (!q) return [];
    if (q.cells && q.cells.length) return q.cells.map((c) => ({ s: c.s, f: c.f }));
    const pc = pcOf(midiOf(q.s, q.f));
    return buildCandidates().filter((c) => pcOf(midiOf(c.s, c.f)) === pc);
  }

  /** \u6BD4\u8F83\u4E24\u4E2A\u683C\u5B50\u662F\u5426\u76F8\u540C */
  const sameCell = (a, b) => !!a && !!b && a.s === b.s && a.f === b.f;

  /** \u5207\u6362\u4E00\u4E2A\u683C\u5B50\u7684\u9009\u4E2D\u72B6\u6001\uFF08\u53EA\u5728\u7B54\u9898\u4E2D\u5141\u8BB8\uFF09
   *  \u70B9\u51FB\u53D1\u58F0\u53EA\u53D1\u751F\u5728\u201C\u521D\u6B21\u9009\u4E2D\u201D\u65F6\uFF1B\u518D\u6B21\u70B9\u51FB\u53D6\u6D88\u4E0D\u53D1\u58F0\u97F3\uFF0C\u907F\u514D\u542C\u6210\u201C\u4E24\u4E2A\u97F3\u201D\u3002
   *  \u73A9\u6CD5 A \u53EA\u8003\u4E00\u6839\u5F26\uFF1A\u5176\u5B83\u5F26\u65E2\u4E0D\u60AC\u505C\u4E5F\u70B9\u4E0D\u4E2D\uFF08Q2/Q23\uFF09\uFF0C\u70B9\u4E86\u76F4\u63A5\u5FFD\u7565\u3002 */
  function togglePick(cell) {
    if (round.state !== 'asking' || round.waitStart || !cell) return;
    if (posPlayA() && round.current && round.current.s != null && cell.s !== round.current.s) return;
    const i = pos.picks.findIndex((p) => sameCell(p, cell));
    if (i >= 0) {
      pos.picks.splice(i, 1);            // \u53D6\u6D88\u9009\u62E9\uFF1A\u4E0D\u53D1\u58F0
    } else {
      pos.picks.push({ s: cell.s, f: cell.f });
      if (store.settings.posClickSound !== false && !soundOf('pos').muted) {
        ensureAudio().then(() => audio.play(midiOf(cell.s, cell.f), 0.8));
      }
    }
    syncPosUI();
    renderFretboard();
  }

  /** \u968F\u610F\u70B9\u51FB\uFF08\u8C03\u8BD5\uFF09\uFF1A\u70B9\u54EA\u54CD\u54EA\uFF0C\u4E0D\u4EA7\u751F\u4EFB\u4F55\u6807\u8BB0 */
  function freeClickPlay(cell) {
    if (!cell) return;
    ensureAudio().then(() => audio.play(midiOf(cell.s, cell.f), 0.85));
  }

  /** \u63D0\u4EA4\uFF1A\u8981\u6C42\u9009\u4E2D\u7684\u6070\u597D\u7B49\u4E8E\u76EE\u6807\u5168\u96C6\uFF0C\u591A\u9009\u3001\u6F0F\u9009\u90FD\u7B97\u9519 */
  function submitPositions() {
    if (round.state !== 'asking' || round.waitStart || pos.submitting) return;
    const q = round.current;
    if (!q) return;
    const targets = targetPositions(q);
    const picks = pos.picks;
    const missed = targets.filter((t) => !picks.some((p) => sameCell(p, t)));
    const extra = picks.filter((p) => !targets.some((t) => sameCell(p, t)));
    const isCorrect = picks.length > 0 && missed.length === 0 && extra.length === 0;

    // \u8BB0\u5F55\u672C\u6B21\u7ED3\u679C\u4F9B\u6307\u677F\u7ED8\u5236\u4F7F\u7528
    pos.last = { targets, picks: picks.slice(), missed, extra, ok: isCorrect };
    pos.submitting = true;

    resolveAnswer(isCorrect ? pcOf(midiOf(q.s, q.f)) : null, false, { fromPos: true });
    pos.submitting = false;
  }

  /** \u91CD\u65B0\u9009\u62E9\uFF08\u7B54\u5B8C\u540E\u4E0D\u80FD\u6E05\u7A7A\uFF0C\u907F\u514D\u5237\u6EE1\u6B63\u786E\u7387\uFF09 */
  function clearPicks() {
    if (round.state !== 'asking' || round.waitStart) return;
    pos.picks = [];
    syncPosUI();
    renderFretboard();
  }

  /* =================================================================
   *  \u548C\u5F26\u6A21\u5F0F\uFF08\u72EC\u7ACB\u72B6\u6001\uFF0C\u4E0E round \u5B8C\u5168\u5E76\u884C\uFF09
   *
   *  \u4E3A\u4EC0\u4E48\u4E0D\u7528\u540C\u4E00\u4E2A round\uFF1AdrawFretboardSvg() \u91CC\u90A3\u6761\u300C\u4E0D\u4F20 id \u5C31\u628A\u6807\u8BB0
   *  \u753B\u8FDB hidden \u6307\u677F\u300D\u7684\u5386\u53F2\u6CE8\u91CA\u5C31\u662F\u300C\u4E00\u4E2A\u5BF9\u8C61\u88C5\u4E24\u79CD\u6A21\u5F0F\u300D\u7684\u540E\u679C\u3002
   *  \u548C\u5F26\u9700\u8981\u7684\u72B6\u6001\uFF08\u516D\u5F26\u4E09\u6001\u3001\u5224\u5B9A\u5BBD\u5EA6\u5FEB\u7167\u3001\u5019\u9009\u3001\u53C2\u8003\u6392\u5E03\u3001\u590D\u76D8\u9501\u5B9A\uFF09
   *  \u4E0E\u5355\u97F3\u5B8C\u5168\u4E0D\u540C\uFF0C\u6DF7\u5728 round \u4E0A\u4F1A\u8BA9 16 \u4E2A\u65E2\u6709\u6D4B\u8BD5\u968F\u65F6\u53D8\u7EA2\u3002
   *
   *  \u5141\u8BB8\u5171\u4EAB\u7684\u53EA\u6709\u7EAF\u5DE5\u5177\uFF1A\u65F6\u95F4\u683C\u5F0F\u5316\u3001\u97F3\u9891\u6E05\u7406\u3001SRS \u5E38\u91CF\u3002
   * ================================================================= */

  /** \u516D\u5F26\u72B6\u6001\uFF1Afrets[i] = -1 \u9759\u97F3 / 0 \u7A7A\u5F26 / 1..21 \u54C1\uFF1Bindex 0 = 6 \u5F26 */
  const chordRound = {
    queue: [], idx: 0, results: [], current: null,
    state: 'idle',            // idle | asking | answered
    /* \u5F53\u524D\u7EC3\u4E60\u65B9\u5411\uFF1An2f = \u548C\u5F26\u540D \u2192 \u6307\u677F\uFF1Bf2n = \u6307\u677F \u2192 \u548C\u5F26\u540D */
    dir: 'n2f',
    frets: [-1, -1, -1, -1, -1, -1],
    waitStart: false,
    startAt: 0, deadline: 0, limit: 20, infinite: false,
    timer: null, pendingNext: null,
    streak: 0, bestStreak: 0,
    lastKey: null,
    /* \u9898\u76EE\u5F00\u59CB\u65F6\u5FEB\u7167\u4E0B\u6765\u7684\u8BBE\u7F6E\uFF1A\u4E2D\u9014\u6539\u8BBE\u7F6E\u4E0D\u5F71\u54CD\u5F53\u524D\u9898 */
    snap: null,
    /* \u672C\u9898\u7684\u5224\u5B9A\u7ED3\u679C\u4E0E\u53C2\u8003\u6392\u5E03\uFF08\u4F9B\u6307\u677F\u7ED8\u5236\u4E0E\u590D\u76D8\u4F7F\u7528\uFF09 */
    verdict: null,
    reference: null,
    answeredAt: 0,
    submitted: false,         // \u662F\u5426\u5DF2\u7ECF\u63D0\u4EA4\u8FC7\uFF08\u7528\u4E8E\u9501\u5B9A\u6392\u5E03\uFF09
    lastOk: null,
    /* f2n \u4E13\u7528\uFF1A\u672C\u9898\u7684\u9009\u9879\u3001\u6B63\u786E\u7B54\u6848\u96C6\u3001\u7528\u6237\u9009\u4E86\u54EA\u4E2A */
    question: null,           // buildIdentificationQuestion \u7684\u7ED3\u679C
    chosen: null,             // \u7528\u6237\u9009\u4E2D\u7684 { rootPc, qualityId, bassPc? }
    chordInputRaw: '',        // \u81EA\u7531\u8F93\u5165\u65F6\u7684\u539F\u59CB\u6587\u672C\uFF08\u590D\u76D8\u7528\uFF09
    parseFailures: 0,         // \u672C\u9898\u65E0\u6CD5\u89E3\u6790\u7684\u63D0\u4EA4\u6B21\u6570\uFF08\u4E0D\u8BA1\u5165\u5224\u5B9A\uFF09
    snapshot: null,           // \u672C\u8F6E\u5B66\u4E60\u5206\u5E03\u5FEB\u7167\uFF08\u56FE3\uFF09

    /* \u2014\u2014 \u9898\u5E93\u5316\u6539\u9020\u65B0\u589E\uFF08\u7B56\u5212\u4E66 \u00A73\u2013\u00A78\uFF09\u2014\u2014
       \u9898\u76EE\u73B0\u5728\u662F\u300C\u9898\u5E93\u91CC\u7684\u4E00\u884C\u300D\uFF0C\u7B54\u6848\u5C31\u662F\u90A3\u4E00\u884C\uFF0C\u4E0D\u518D\u7531\u5206\u6790\u5668\u73B0\u7B97\u3002 */
    play: 'a',                // \u672C\u9898\u73A9\u6CD5\uFF1Aa = \u6446\u4F4D\uFF1Bb = \u9009\u62E9\u9898
    answer: null,             // \u6B63\u786E\u7B54\u6848\uFF08\u9898\u5E93\u90A3\u6761\u6307\u6CD5\u7684\u516D\u5F26\u72B6\u6001\uFF09
    options: [],              // B \u73A9\u6CD5\u7684\u9009\u9879\uFF08\u542B\u6B63\u786E\u7B54\u6848\uFF0C\u4F4D\u7F6E\u5DF2\u6253\u4E71\uFF09
    attempts: 0,              // \u672C\u9898\u7B54\u9519\u6B21\u6570\uFF08\u51B3\u5B9A\u63D0\u793A\u5206\u7EA7\uFF0C\u00A74.6\uFF09
    excluded: [],             // B \u73A9\u6CD5\u63D0\u793A\u6392\u9664\u6389\u7684\u9009\u9879 ['qi:pc']
    revealed: false,          // \u7528\u6237\u662F\u5426\u70B9\u8FC7\u300C\u770B\u7B54\u6848\u300D
    revealAnswer: false,      // \u662F\u5426\u628A\u7B54\u6848\u6574\u6761\u753B\u5728\u6307\u677F\u4E0A
    barres: [],               // \u7528\u6237\u753B\u4E0B\u7684\u6A2A\u6309 [{s1,s2,f}]
    preview: null,            // \u62D6\u52A8\u9884\u89C8 {s,f}
    previewBarre: null,       // \u6A2A\u6309\u62D6\u52A8\u9884\u89C8 {s1,s2,f}
    barreMode: false,         // \u89E6\u5C4F\u6A2A\u6309\u6A21\u5F0F
    lastRk: null,             // \u4E0A\u4E00\u9898\u7684\u9898\u5E93\u884C\u952E\uFF08\u907F\u514D\u540C\u9898\u8FDE\u51FA\uFF09
  };

  /** \u548C\u5F26\u67D0\u4E00\u65B9\u5411\u7684\u9650\u65F6\u8BBE\u7F6E\uFF1A'inf' \u4FDD\u7559\u4E3A\u5B57\u7B26\u4E32\uFF0C\u6570\u5B57\u7EDF\u4E00 clamp \u5230 5\u2013120 */
  function chordTimeOf(s, dir) {
    const raw = s.chordTime && s.chordTime[dir];
    if (raw === 'inf') return 'inf';
    const n = Number(raw);
    return isFinite(n) && n > 0 ? clamp(n, 5, 120) : (dir === 'f2n' ? 12 : 20);
  }

  /** \u628A\u300C\u9650\u65F6\u8BBE\u7F6E\u503C\u300D\u6362\u6210\u6BEB\u79D2/Infinity \u53EF\u7528\u7684\u79D2\u6570 */
  function limitSeconds(v) {
    return v === 'inf' ? Infinity : Number(v);
  }

  /** \u97F3\u7A0B\u67D0\u4E00\u73A9\u6CD5\u7684\u9650\u65F6\u8BBE\u7F6E\uFF1A'inf' \u4FDD\u7559\u4E3A\u5B57\u7B26\u4E32\uFF0C\u6570\u5B57 clamp \u5230 3\u201360 */
  function intervalTimeOf(raw, fallback) {
    if (raw === 'inf') return 'inf';
    const n = Number(raw);
    return isFinite(n) && n > 0 ? clamp(n, 3, 60) : fallback;
  }

  function chordSettingsSnapshot() {
    const s = store.settings;
    const play = chordPlayMode();
    return {
      play: play,
      /* dir \u73B0\u5728\u53EA\u662F play \u7684\u6D3E\u751F\uFF08a\u2192n2f / b\u2192f2n\uFF09\uFF0C\u7559\u7740\u662F\u4E3A\u4E86\u65E7\u5B58\u6863\u4E0E\u65E7\u65AD\u8A00\u8FD8\u80FD\u8BFB */
      dir: play === 'b' ? 'f2n' : 'n2f',
      range: String(s.chordRange || '0-5'),
      maxFret: chordRangeFretMax(),
      style: s.chordStyle || 'general',
      effort: s.chordAEffort === 'easy' ? 'easy' : 'common',
      nameLang: (s.chordNameLang === 'en' || s.chordNameLang === 'zh') ? s.chordNameLang : 'both',
      /* \u9650\u65F6\u4E09\u6001\uFF1A'inf' = \u4E0D\u9650\u65F6\uFF08\u5B58\u5B57\u7B26\u4E32\uFF0C\u4E0D\u80FD\u8D70 Number()\uFF0C\u5426\u5219\u4F1A\u88AB\u7B97\u6210 NaN\uFF09 */
      timeN2f: chordTimeOf(s, 'n2f'),
      timeF2n: chordTimeOf(s, 'f2n'),
      /* \u4E09\u79CD\u64AD\u653E\u65B9\u5F0F\uFF1A\u672A\u77E5\u503C\u4E00\u5F8B\u9000\u56DE strum\uFF08\u5411\u4E0B\uFF09\uFF0C\u4E0D\u9759\u9ED8\u53D8\u6210\u300C\u540C\u65F6\u53D1\u58F0\u300D */
      strum: (s.chordStrum === 'block' || s.chordStrum === 'strumUp') ? s.chordStrum : 'strum',
      preview: s.chordPreview || 'reference',
      revealPlay: (s.chordRevealPlay === 'always' || s.chordRevealPlay === 'off')
        ? s.chordRevealPlay : 'wrongOnly',
      listenDuringAnswer: s.chordListenDuringAnswer !== false,
      /* \u4EA4\u5377\u524D\u80FD\u4E0D\u80FD\u542C\u6B63\u786E\u7B54\u6848\uFF08\u9898\u5361\u4E0A\u7684 \uD83C\uDFA7\uFF09\u3002\u548C listenDuringAnswer \u662F\u4E24\u4EF6\u4E8B\uFF1A
         \u90A3\u4E2A\u7BA1\u300C\u542C\u6211\u6446\u7684\u300D\uFF0C\u8FD9\u4E2A\u7BA1\u300C\u542C\u7B54\u6848\u300D\u3002 */
      listenAnswer: s.chordAListenAnswer !== false,
      flat: chordAccidental() === 'flat',
      /* A / B \u5404\u81EA\u7684\u58F0\u97F3\u5F00\u5173\uFF08\u7B56\u5212\u4E66 \u00A74.8\uFF09 */
      soundOn: play === 'b' ? (s.chordBSound !== false) : (s.chordASound !== false),
      hint: play === 'b'
        ? (s.chordBHint || 'second')
        : (s.chordAHint || 'second'),
      revealB: s.chordBReveal || 'wrongOnly',
      optionCount: clamp(Number(s.chordBOptionCount) || 4, 3, 6),
      distractor: s.chordBDistractor || 'mixed',
      strict: !!s.chordBStrict,
      autoBarreHint: s.chordAutoBarreHint !== false,
    };
  }

  /** \u548C\u5F26\u6A21\u5F0F\u7684\u300C\u5F00\u59CB\u8BA1\u65F6\u300D\u65F6\u523B = \u5199\u5165 seen \u7684\u65F6\u523B\uFF08\u9898\u76EE\u771F\u6B63\u8FDB\u5165\u6709\u6548\u7EC3\u4E60\uFF09 */
  function chordMarkSeen() {
    const q = chordRound.current;
    if (!q) return;
    const card = getChordCard(q.key);
    if (card && !card.seen) {
      card.seen = nowMs();
      save();
    }
  }

  /** \u672C\u9898\u9650\u65F6\uFF1A\u6309\u5F53\u524D\u73A9\u6CD5\u53D6\u5BF9\u5E94\u5B57\u6BB5\uFF08A / B \u5B8C\u5168\u72EC\u7ACB\uFF09 */
  function chordLimitFor() {
    const snap = chordRound.snap;
    if (!snap) return 20;
    /* 'inf' \u2192 Infinity\uFF0C\u5176\u4F59\u8F6C\u6210\u79D2\u6570 */
    return limitSeconds(snap.dir === 'f2n' ? snap.timeF2n : snap.timeN2f);
  }

  /**
   * \u5207\u6362\u73A9\u6CD5 A \u2194 B\uFF08\u7B56\u5212\u4E66 \u00A74.8.3 \u7B2C 3 \u6761\uFF09
   *
   * \u53EA\u91CD\u5F00\u5F53\u524D\u9898\uFF1A\u4E0D\u6E05\u9519\u9898\u3001\u4E0D\u91CD\u7F6E\u8FDB\u5EA6\u3001\u4E0D\u6253\u65AD\u672C\u8F6E\u5DF2\u7B54\u8BB0\u5F55\u3002
   * \u4E24\u4E2A\u73A9\u6CD5\u7684\u8BBE\u7F6E\u9762\u677F\u5404\u81EA\u72EC\u7ACB\uFF08\u5B57\u6BB5\u524D\u7F00 a/b \u9694\u79BB\uFF09\uFF0C\u8FD9\u91CC\u53EA\u5207\u300C\u5F53\u524D\u7528\u54EA\u5957\u300D\u3002
   */
  function setChordPlay(play) {
    const want = play === 'b' ? 'b' : 'a';
    if (store.settings.chordPlay === want) return;
    store.settings.chordPlay = want;
    save();
    chordPoolCache = { key: '', list: [] };
    syncChordPlayUI();
    /* \u9650\u65F6\u7684\u5FEB\u6377\u6309\u94AE\u6309\u300C\u5F53\u524D\u73A9\u6CD5\u300D\u9AD8\u4EAE\uFF0C\u73A9\u6CD5\u4E00\u53D8\u90A3\u6761\u9AD8\u4EAE\u5C31\u5F97\u8DDF\u7740\u6362 \u2014\u2014
       \u4EE5\u524D\u53EA\u5728\u6253\u5F00\u8BBE\u7F6E\u9762\u677F\u65F6\u624D\u91CD\u7B97\uFF0C\u4E8E\u662F B \u73A9\u6CD5\u4E0B\u9AD8\u4EAE\u505C\u5728 A \u7684\u503C\u4E0A\u3002 */
    syncChordSettingsUI();
    refreshChordLimit();
    /* \u672C\u8F6E\u5DF2\u7ECF\u5728\u7B54\u9898 \u2192 \u91CD\u5F00\u5F53\u524D\u9898\uFF08\u4E0D\u662F\u65B0\u7684\u4E00\u8F6E\uFF09 */
    if (chordRound.state !== 'idle') startChordRound();
    renderSidebar();
  }

  /**
   * \u5237\u65B0 A/B \u73A9\u6CD5\u5207\u6362\u754C\u9762\uFF08\u7B56\u5212\u4E66 \u00A74.8.3 \u7B2C 2 \u6761\uFF1ADOM \u5BB9\u5668\u5206\u79BB\uFF09
   *
   * seg \u9AD8\u4EAE + \u4E24\u4E2A\u8BBE\u7F6E\u9762\u677F\u6574\u5757 hidden \u5207\u6362 \u2014\u2014 \u4E0D\u662F\u9010\u9879 hide\uFF0C
   * \u800C\u662F\u300C\u54EA\u4E2A\u73A9\u6CD5\u5C31\u53EA\u7559\u54EA\u4E00\u5757\u300D\uFF0C\u8FD9\u6837\u9762\u677F\u91CC\u4E0D\u53EF\u80FD\u6F0F\u6389\u4E00\u4E2A\u5B57\u6BB5\u3002
   */
  function syncChordPlayUI() {
    const play = chordPlayMode();
    document.querySelectorAll('#chordPlaySeg [data-play]').forEach((b) => {
      const on = b.dataset.play === play;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    const aBox = $('#chordASettings');
    const bBox = $('#chordBSettings');
    if (aBox) aBox.hidden = play !== 'a';
    if (bBox) bBox.hidden = play !== 'b';
  }

  /** B \u73A9\u6CD5\u7684\u9009\u9879\u8BBE\u7F6E\u53D8\u4E86\uFF1A\u5F53\u524D\u9898\u5982\u679C\u8FD8\u6CA1\u7B54\uFF0C\u5C31\u91CD\u65B0\u51FA\u4E00\u7EC4\u9009\u9879 */
  function resetChordChoices() {
    if ((chordRound.play || 'a') !== 'b') return;
    const item = chordRound.current;
    if (!item) return;
    if (chordRound.state !== 'asking' || chordRound.submitted) return;
    const snap = chordSettingsSnapshot();
    chordRound.options = buildBankOptions(item, snap.optionCount, snap.distractor);
    renderChordOptions();
  }

  /* \u4E00\u4E2A (\u8D28\u91CF,\u6839\u97F3) \u683C\u81F3\u5C11\u88AB\u7EC3\u8FC7\u51E0\u6B21\uFF0C\u624D\u7B97\u300C\u8FD9\u4E00\u683C\u7EC3\u5F00\u4E86\u300D\uFF0C\u8FDB\u6743\u91CD\u671F */
  const CHORD_CELL_MIN_ANSWERS = 3;

  /**
   * \u6392\u4E00\u8F6E\u9898 \u2014\u2014 \u4E09\u7EA7\u8C03\u5EA6\uFF08\u7B56\u5212\u4E66 \u00A75\uFF09
   *
   * \u65E7\u7684\u4E24\u6BB5\u5F0F\u5728 8,437 \u9053\u9898\u4E0A\u5B8C\u5168\u5931\u6548\uFF1A\u9898\u5E93\u592A\u5927\uFF0C\u5149\u662F\u300C\u5168\u90E8\u89C1\u8FC7\u4E00\u904D\u300D\u5C31\u8981
   * 844 \u8F6E\uFF0C\u7528\u6237\u4E09\u5468\u5185\u6C38\u8FDC\u5728\u94FA\u65B0\u9898\uFF0C\u9519\u9898\u6C38\u8FDC\u7B49\u4E0D\u5230\u590D\u4E60\u3002\u6240\u4EE5\u6539\u6210\uFF1A
   *   \u2460 \u7C7B\u522B\u8986\u76D6 \u2014\u2014 216 \u4E2A (\u8D28\u91CF,\u6839\u97F3) \u683C\uFF0C\u6CA1\u78B0\u8FC7\u7684\u683C\u4F18\u5148\uFF0C\u7EA6 22 \u8F6E\u94FA\u6EE1
   *   \u2461 \u683C\u5185\u8986\u76D6 \u2014\u2014 \u683C\u5B50\u91CC\u8FD8\u6709\u6CA1\u89C1\u8FC7\u7684\u9898\u5C31\u5747\u5300\u62BD\uFF08\u4E0D\u662F\u4E00\u4E2A\u683C\u8FDE\u51FA\u597D\u51E0\u9053\uFF09
   *   \u2462 \u9519\u7387\u52A0\u6743 \u2014\u2014 \u683C\u5B50\u7EC3\u5F00\uFF08\u22653 \u6B21\u4F5C\u7B54\uFF09\u4E14\u683C\u5185\u90FD\u89C1\u8FC7\u4E4B\u540E\uFF0C\u6309\u683C\u5B50\u9519\u7387\u51FA\u9898
   * \u62A4\u680F\uFF1A\u540C\u4E00\u683C\u8FDE\u7EED\u4E0D\u8D85\u8FC7 2 \u9053\uFF1B\u6743\u91CD clamp \u5728 chordCardWeight \u91CC\u3002
   */
  function buildChordSchedule(size, lastKey) {
    const pool = chordPool();
    if (!pool.length) return [];

    /* \u6C60\u5B50\u6309\u683C\u805A\u5408\uFF1Astats \u7684\u5355\u4F4D\u5FC5\u987B\u662F 216 \u683C\uFF0C\u4E0D\u662F 8,437 \u9053\u9898 \u2014\u2014
       \u6309\u9898\u7EDF\u8BA1\u7684\u8BDD\u6BCF\u4E2A\u683C\u8981\u7EC3\u51E0\u767E\u8F6E\u624D\u80FD\u770B\u51FA\u300C\u8FD9\u4E2A\u683C\u6211\u8001\u662F\u9519\u300D\u3002 */
    const byCell = new Map();
    pool.forEach((r) => {
      let arr = byCell.get(r.cell);
      if (!arr) { arr = []; byCell.set(r.cell, arr); }
      arr.push(r);
    });
    const cellStats = [];
    byCell.forEach((rows) => {
      const card = store.chordCards[rows[0].key] || null;
      let rowsSeen = 0;
      rows.forEach((r) => {
        const st = store.chordRows[r.rk];
        if (st && st.s > 0) rowsSeen += 1;
      });
      cellStats.push({
        cell: rows[0].cell,
        rows: rows,
        rowsSeen: rowsSeen,
        answers: card ? (card.a || 0) + (card.e || 0) : 0,
        card: card,
      });
    });

    const picked = [];
    const usedRow = new Set();
    const usedCell = new Set();
    /* \u540C\u4E00\u5F20\u5361\uFF08key = \u6839\u97F3 + \u8D28\u91CF\uFF09\u4E00\u8F6E\u91CC\u53EA\u51FA\u4E00\u6B21\uFF1A\u56FE3 \u7684\u300C\u5DF2\u5B8C\u6210\u300D\u662F\u6309 key
       \u53BB\u91CD\u7684\uFF08D12/D60\uFF09\uFF0C\u961F\u5217\u91CC\u82E5\u51FA\u73B0\u540C\u4E00\u4E2A key \u4E24\u6B21\uFF0Cdone.size \u5C31\u6C38\u8FDC\u8FFD\u4E0D\u4E0A
       plan\uFF0C\u8F6E\u672B\u4F1A\u505C\u5728\u300C\u5DF2\u5B8C\u6210 2 / 10\u3001\u5269\u4F59 8 \u9898\u300D\u3002rk \u6BD4 key \u7EC6\uFF08\u540C\u4E00\u5F20\u5361\u6709
       \u591A\u4E2A\u628A\u4F4D\uFF09\uFF0C\u6240\u4EE5\u8FD9\u91CC\u5FC5\u987B\u540C\u65F6\u6309 key \u53BB\u91CD\uFF0C\u4E0D\u80FD\u53EA\u6309 rk\u3002 */
    const usedKey = new Set();
    let runCell = -1;
    let runLen = 0;
    /* \u540C\u683C\u8FDE\u7EED\u8D85\u8FC7 2 \u9053\u5C31\u6362\u683C\uFF1A\u8FDE\u7740\u4E09\u9053\u540C\u4E00\u4E2A\u683C\u7684\u9898\uFF0C\u7EC3\u7684\u662F\u8BB0\u5FC6\u4E0D\u662F\u624B */
    const allowed = (cell) => !(cell === runCell && runLen >= 2);

    while (picked.length < size && picked.length < pool.length) {
      let row = null;

      /* \u2460 \u7C7B\u522B\u8986\u76D6 \u2014\u2014 \u8FD9\u4E00\u8F6E\u91CC\u6CA1\u51FA\u8FC7\u7684\u683C\u624D\u7B97\uFF0C\u5426\u5219 216 \u683C\u4F1A\u88AB\u51E0\u4E2A\u683C\u5403\u6EE1 */
      const t1 = cellStats.filter((cs) => !usedCell.has(cs.cell)
        && !(cs.card && cs.card.seen) && allowed(cs.cell));
      if (t1.length) {
        const cs = t1[Math.floor(Math.random() * t1.length)];
        const rows = cs.rows.filter((r) => !usedRow.has(r.rk) && !usedKey.has(r.key));
        if (rows.length) row = rows[Math.floor(Math.random() * rows.length)];
      }

      /* \u2461 \u683C\u5185\u8986\u76D6 \u2014\u2014 \u683C\u5B50\u91CC\u8FD8\u6CA1\u89C1\u8FC7\u7684\u9898\uFF0C\u8DE8\u683C\u5747\u5300\u62BD */
      if (!row) {
        const flat = [];
        cellStats.forEach((cs) => {
          if (!allowed(cs.cell)) return;
          cs.rows.forEach((r) => {
            if (usedRow.has(r.rk)) return;
            if (usedKey.has(r.key)) return;
            const st = store.chordRows[r.rk];
            if (st && st.s > 0) return;
            flat.push(r);
          });
        });
        if (flat.length) row = flat[Math.floor(Math.random() * flat.length)];
      }

      /* \u2462 \u9519\u7387\u52A0\u6743 \u2014\u2014 \u683C\u5B50\u7EC3\u5F00\u4E86\u624D\u9760\u6743\u91CD\uFF0C\u5426\u5219\u65B0\u683C\u4F1A\u88AB\u8001\u9519\u9898\u4E00\u76F4\u538B\u7740 */
      if (!row) {
        const t3 = cellStats.filter((cs) => allowed(cs.cell)
          && cs.answers >= CHORD_CELL_MIN_ANSWERS
          && cs.rows.some((r) => !usedRow.has(r.rk) && !usedKey.has(r.key)));
        if (t3.length) {
          const style = store.settings.chordStyle || 'general';
          const cs = weightedPick(t3, (c) => chordCardWeight(c.card)
            * chordStyleWeight(c.rows[0].q, style));
          const rows = cs.rows.filter((r) => !usedRow.has(r.rk) && !usedKey.has(r.key));
          row = rows[Math.floor(Math.random() * rows.length)];
        }
      }

      if (!row) break;
      usedRow.add(row.rk);
      usedCell.add(row.cell);
      if (row.key) usedKey.add(row.key);
      if (row.cell === runCell) runLen += 1;
      else { runCell = row.cell; runLen = 1; }
      picked.push(row);
    }

    /* \u7B2C\u4E00\u9898\u4E0D\u8981\u548C\u4E0A\u4E00\u8F6E\u6700\u540E\u4E00\u9898\u76F8\u540C */
    if (picked.length > 1 && lastKey && picked[0].rk === lastKey) {
      const t = picked[0];
      picked[0] = picked[1];
      picked[1] = t;
    }
    return picked;
  }

  /** \u548C\u5F26\u5361\u7247\u6743\u91CD\uFF1A\u7B54\u9519\u7387\u9AD8\u3001\u5230\u671F\u3001\u4E45\u672A\u7EC3 \u2192 \u6743\u91CD\u9AD8\uFF08\u5355\u4F4D\u662F\u300C\u683C\u300D\uFF0C\u4E0D\u662F\u300C\u9898\u300D\uFF09 */
  function chordCardWeight(card) {
    if (!card) return NEW_POSITION_WEIGHT;
    const total = Math.max(1, (card.a || 0) + (card.e || 0));
    const historicalErr = ((card.e || 0) + 1) / (total + 2);
    const recent = Array.isArray(card.recent) ? card.recent.slice(-RECENT_WINDOW) : [];
    const recentErr = recent.length ? recent.filter((x) => !x).length / recent.length : historicalErr;
    const errorScore = 0.55 * historicalErr + 0.45 * recentErr;
    let weight = 0.65 + 11.5 * Math.pow(errorScore, 1.45);
    const now = nowMs();
    if (card.due) {
      const dueAge = now - card.due;
      if (dueAge >= 0) weight *= 1 + Math.min(1.5, dueAge / (24 * 60 * 60000));
    }
    if (card.last && now - card.last < 2 * 60000 && (!card.due || card.due > now)) weight *= 0.35;
    /* \u7B56\u5212\u4E66 \u00A75\uFF1Aclamp 0.4\u20136\u3002\u65E7\u503C 0.25\u201318 \u4F1A\u8BA9\u4E00\u4E2A\u9519\u9898\u683C\u538B\u8FC7\u6574\u8F6E\u3002 */
    return clamp(weight, 0.4, 6);
  }

  function startChordRound() {
    if (chordRound.timer) clearInterval(chordRound.timer);
    if (chordRound.pendingNext) { clearTimeout(chordRound.pendingNext); chordRound.pendingNext = null; }
    audio.stopChord();
    chordRound.queue = buildChordSchedule(store.settings.chordSize, chordRound.lastKey);
    chordRound.idx = 0;
    chordRound.results = [];
    chordRound.state = 'idle';
    chordRound.current = null;
    chordRound.streak = 0;
    chordRound.verdict = null;
    chordRound.reference = null;
    chordRound.submitted = false;
    /* \u4E0A\u4E00\u8F6E\u7684\u9898\u540D\u4E0D\u80FD\u8DDF\u7740\u8FDB\u65B0\u8F6E\uFF1AB \u73A9\u6CD5\u7B54\u5B8C\u624D\u4F1A\u7528\u5230\u5B83\uFF0C\u7559\u7740\u53EA\u4F1A\u8BA9
       \u300C\u672C\u8F6E\u8FD8\u6CA1\u5F00\u59CB\u5C31\u6709\u4E00\u4E2A\u4E0A\u8F6E\u7684\u540D\u5B57\u300D\u8FD9\u79CD\u9690\u60A3\u7559\u5728\u72B6\u6001\u91CC\u3002 */
    chordRound.answerName = null;
    chordRound.excluded = [];
    chordRound.snapshot = freezeSnapshot(chordRound.queue, 'chord');
    modeStatOf('chord').streak = 0;
    /* \u6709\u6548\u51FA\u9898\u6C60\u4E3A\u7A7A\uFF1A\u663E\u793A\u7A7A\u72B6\u6001\u5E76\u8BF4\u660E\u539F\u56E0\uFF0C\u4E0D\u81EA\u52A8\u56DE\u9000\u7528\u6237\u8BBE\u7F6E */
    if (!chordRound.queue.length) {
      renderChordEmptyState();
      renderSidebar();
      return;
    }
    renderSidebar();
    nextChordQuestion();
  }

  /* ---------------------------------------------------------------
   *  \u9898\u5E93\u884C\u7684\u540D\u5B57\u4E0E\u300C\u5408\u6CD5\u89E3\u8BFB\u300D\uFF08B \u73A9\u6CD5\u7528\uFF09
   *
   *  \u7B56\u5212\u4E66 \u00A74.9\uFF1A\u82F1\u6587\u4E3B\u884C\u3001\u4E2D\u6587\u6B21\u884C\uFF0C\u5224\u5206\u4E0E\u8BED\u8A00\u8BBE\u7F6E\u65E0\u5173\u3002
   *  \u00A74.7.3\uFF1A\u5E72\u6270\u9879\u5FC5\u987B\u5254\u9664\u300C\u6362\u4E2A\u540D\u5B57\u4ECD\u7136\u8BF4\u5F97\u901A\u300D\u7684\u5019\u9009\uFF0C\u5426\u5219\u4F1A\u6709\u4E24\u4E2A\u6B63\u786E\u7B54\u6848\u3002
   * --------------------------------------------------------------- */
  function bankNameOf(qi, pc, flat) {
    const B = bankData();
    if (!B) return '';
    const n = B.N[qi * 12 + pcOf(pc)];
    return n ? (flat ? n[1] : n[0]) : '';
  }

  function bankNameZh(qi, pc, flat) {
    const B = bankData();
    if (!B) return '';
    const n = B.N[qi * 12 + pcOf(pc)];
    return n ? (flat ? n[3] : n[2]) : '';
  }

  function chordRowName(r) {
    return bankNameOf(r.qi, r.pc, chordAccidental() === 'flat');
  }

  /** \u548C\u5F26\u540D\u8981\u8FDB innerHTML\uFF08\u82F1\u6587\u884C + \u4E2D\u6587\u884C\u4E24\u4E2A span\uFF09\uFF0C\u5FC5\u987B\u8F6C\u4E49 */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function chordRowNameZh(r) {
    return bankNameZh(r.qi, r.pc, chordAccidental() === 'flat');
  }

  /** \u8FD9\u6761\u6307\u6CD5\u5B9E\u9645\u53D1\u51FA\u7684\u97F3\u7EA7\u96C6\u5408 */
  function bankSoundPcs(fr) {
    const T = chordTheory();
    const out = new Set();
    if (!T) return out;
    for (let i = 0; i < 6; i += 1) {
      if (fr[i] < 0) continue;
      out.add(((T.STANDARD_TUNING[i] + fr[i]) % 12 + 12) % 12);
    }
    return out;
  }

  /** (\u8D28\u91CF, \u6839\u97F3) \u8FD9\u4E2A\u540D\u5B57\u80FD\u4E0D\u80FD\u7528\u6765\u89E3\u91CA\u8FD9\u7EC4\u97F3 \u2014\u2014 \u5FC5\u542B\u97F3\u5168\u5728\uFF0C\u4E14\u6CA1\u6709\u548C\u5F26\u5916\u97F3 */
  function bankIsReading(qi, pc, pcs) {
    const B = bankData();
    if (!B) return false;
    const req = B.R[qi] || [];
    const all = B.P[qi] || [];
    for (let i = 0; i < req.length; i += 1) {
      if (!pcs.has((pc + req[i]) % 12)) return false;
    }
    const set = new Set(all.map((it) => (pc + it) % 12));
    let ok = true;
    pcs.forEach((x) => { if (!set.has(x)) ok = false; });
    return ok;
  }

  /**
   * B \u73A9\u6CD5\u7684\u5E72\u6270\u9879\uFF08\u7B56\u5212\u4E66 \u00A74.7.3\uFF09
   *   \u2460 \u540C\u6839\u97F3\u6362\u8D28\u91CF\uFF08\u6700\u5BB9\u6613\u6DF7\u7684\u90A3\u4E00\u7C7B\uFF09
   *   \u2461 \u540C\u8D28\u91CF\u6362\u6839\u97F3
   *   \u2462 \u5176\u4ED6\u8FD1\u90BB\u8865\u8DB3
   * \u4E09\u7EA7\u90FD\u5148\u5254\u9664\u300C\u6362\u8FC7\u53BB\u4ECD\u7136\u5408\u6CD5\u300D\u7684\u5019\u9009 \u2014\u2014 \u5426\u5219\u5C4F\u5E55\u4E0A\u6709\u4E24\u4E2A\u6B63\u786E\u7B54\u6848\u3002
   */
  function buildBankOptions(r, need, mode) {
    const B = bankData();
    if (!B) return [];
    const pcs = bankSoundPcs(r.fr);
    const flat = chordAccidental() === 'flat';
    const style = store.settings.chordStyle || 'general';
    const sameRoot = [];
    const sameQuality = [];
    const other = [];
    for (let qi = 0; qi < B.Q.length; qi += 1) {
      if (chordStyleRemoved(B.Q[qi][0], style)) continue;
      for (let pc = 0; pc < 12; pc += 1) {
        if (qi === r.qi && pc === r.pc) continue;
        if (bankIsReading(qi, pc, pcs)) continue;
        const item = { qi: qi, pc: pc, id: B.Q[qi][0], rootPc: pc };
        if (pc === r.pc) sameRoot.push(item);
        else if (qi === r.qi) sameQuality.push(item);
        else other.push(item);
      }
    }
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      return arr;
    };
    const want = Math.max(1, need - 1);
    let pool;
    if (mode === 'sameRoot') pool = shuffle(sameRoot).concat(shuffle(sameQuality), shuffle(other));
    else if (mode === 'sameQuality') pool = shuffle(sameQuality).concat(shuffle(sameRoot), shuffle(other));
    else {
      /* mixed\uFF1A\u4E00\u534A\u540C\u6839\u97F3\u3001\u4E00\u534A\u540C\u8D28\u91CF\uFF0C\u4E0D\u591F\u518D\u7528\u5176\u5B83\u515C\u5E95 */
      const half = Math.ceil(want / 2);
      pool = shuffle(sameRoot).slice(0, half)
        .concat(shuffle(sameQuality).slice(0, Math.max(0, want - Math.min(half, sameRoot.length))))
        .concat(shuffle(sameRoot), shuffle(sameQuality), shuffle(other));
    }
    const out = [];
    const seen = new Set();
    for (let i = 0; i < pool.length && out.length < want; i += 1) {
      const k = pool[i].qi + ':' + pool[i].pc;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(Object.assign({}, pool[i], {
        en: bankNameOf(pool[i].qi, pool[i].pc, flat),
        zh: bankNameZh(pool[i].qi, pool[i].pc, flat)
      }));
    }
    /* \u6B63\u786E\u7B54\u6848\u6DF7\u8FDB\u53BB\u518D\u6D17\u4E00\u6B21\uFF1A\u4F4D\u7F6E\u4E0D\u80FD\u6709\u89C4\u5F8B */
    const answer = {
      qi: r.qi, pc: r.pc, id: r.q, rootPc: r.pc, correct: true,
      en: chordRowName(r), zh: chordRowNameZh(r)
    };
    return shuffle(out.concat([answer]));
  }

  function nextChordQuestion(autoStart) {
    if (chordRound.timer) clearInterval(chordRound.timer);
    if (chordRound.pendingNext) { clearTimeout(chordRound.pendingNext); chordRound.pendingNext = null; }
    audio.stopChord();
    if (chordRound.idx >= chordRound.queue.length) { finishChordRound(); return; }

    const item = chordRound.queue[chordRound.idx];
    chordRound.current = item;
    chordRound.state = 'asking';
    chordRound.verdict = null;
    chordRound.submitted = false;
    chordRound.answeredAt = 0;
    chordRound.lastOk = null;
    chordRound.attempts = 0;
    chordRound.excluded = [];
    chordRound.revealed = false;
    chordRound.question = null;
    chordRound.chosen = null;
    chordRound.options = [];
    chordRound.chordInputRaw = '';
    chordRound.parseFailures = 0;
    /* \u6362\u9898\u5FC5\u987B\u628A\u672C\u9898\u7684\u6A2A\u6309\u4E0E\u62D6\u52A8\u9884\u89C8\u4E00\u8D77\u6E05\u5E72\u51C0\uFF1A
       barres \u662F\u300C\u8FD9\u4E00\u9898\u7684\u4F5C\u7B54\u300D\uFF0C\u4E0A\u4E00\u9898\u7684\u6A2A\u6309\u7559\u5230\u4E0B\u4E00\u9898\uFF0C\u7528\u6237\u4F1A\u4EE5\u4E3A
       \u65B0\u9898\u4E00\u5F00\u59CB\u5C31\u5DF2\u7ECF\u753B\u597D\u4E86\u4E00\u6839\u624B\u6307\uFF08\u800C\u4E14\u5B83\u7684\u4F4D\u7F6E\u8FD8\u6B63\u597D\u538B\u5728\u7B54\u6848\u9644\u8FD1\uFF0C
       \u770B\u7740\u50CF\u7A0B\u5E8F\u63D0\u524D\u6CC4\u9898\uFF09\u3002preview / previewBarre \u662F\u62D6\u52A8\u4E2D\u9014\u7684\u4E34\u65F6\u6001\uFF0C
       \u540C\u6837\u4E0D\u80FD\u8DE8\u9898\u5B58\u6D3B\u3002 */
    chordRound.barres = [];
    chordRound.preview = null;
    chordRound.previewBarre = null;
    board.hover = null;
    chordRound.snap = chordSettingsSnapshot();
    chordRound.play = chordRound.snap.play;
    chordRound.dir = chordRound.snap.dir;
    chordRound.limit = chordLimitFor();
    chordRound.waitStart = (startModeOf('chord') === 'manual') && !autoStart;

    /* \u7B54\u6848\u5C31\u662F\u9898\u5E93\u8FD9\u4E00\u884C\uFF1A\u4E0D\u518D\u300C\u7528\u5206\u6790\u5668\u518D\u7B97\u4E00\u6761\u53C2\u8003\u6392\u5E03\u300D */
    chordRound.answer = item.fr.slice();
    chordRound.reference = { ok: true, frets: item.fr.slice(), barre: item.barre };

    /* \u9489\u5B50\u5148\u9489\u5728\u9898\u9762\u4E0A\uFF08\u7B56\u5212\u4E66 \u00A73.1\uFF1A\u9489\u5B50\u4E0D\u662F\u9898\u578B\uFF0C\u662F\u9898\u9762\u5C5E\u6027\uFF0C\u7528\u6237\u4E0D\u7528\u6446\uFF09 */
    const base = [-1, -1, -1, -1, -1, -1];
    item.pins.forEach((s) => {
      const idx = 6 - s;
      if (idx >= 0 && idx < 6) base[idx] = item.fr[idx];
    });

    if (chordRound.play === 'a') {
      chordRound.frets = base;
    } else {
      /* B \u73A9\u6CD5\uFF1A\u9898\u9762\u5C31\u662F\u6574\u6761\u6307\u6CD5\uFF0C\u53EA\u8BFB */
      chordRound.frets = item.fr.slice();
      chordRound.options = buildBankOptions(item, chordRound.snap.optionCount, chordRound.snap.distractor);
    }

    /* \u65B0\u9898\u5F00\u59CB\uFF1A\u6E05\u6389\u4E0A\u4E00\u9898\u7684\u53CD\u9988\uFF0C\u5426\u5219\u300C\u2714 \u5BF9\u4E86\uFF1AG7sus4\u300D\u4F1A\u4E00\u76F4\u6302\u5728\u4E0B\u4E00\u9898\u4E0B\u9762\uFF0C
       \u7528\u6237\u4F1A\u4EE5\u4E3A\u8FD9\u9898\u7684\u7B54\u6848\u5DF2\u7ECF\u63ED\u6653\u4E86\uFF08\u5355\u97F3\u6A21\u5F0F nextQuestion \u91CC\u4E5F\u505A\u540C\u4E00\u4EF6\u4E8B\uFF09\u3002 */
    updateChordFeedback('', '');
    renderChordPrompt();
    renderChordOptions();
    syncChordUI();
    renderChordFretboard();
    /* current \u5230\u8FD9\u4E00\u6B65\u624D\u5C31\u4F4D\uFF1A\u56FE1 \u7684\u8BAD\u7EC3\u5BF9\u8C61\u3001\u56FE4 \u7684\u5F53\u524D\u77E5\u8BC6\u70B9\u90FD\u4F9D\u8D56\u5B83\uFF0C
       \u6240\u4EE5\u4FA7\u680F\u5FC5\u987B\u5728\u8FD9\u91CC\u8865\u4E00\u6B21\uFF08startChordRound \u90A3\u6B21\u6E32\u67D3\u65F6 current \u8FD8\u662F null\uFF09\u3002 */
    renderSidebar();

    if (chordRound.waitStart) {
      showChordWaitToStart();
    } else {
      beginChordQuestion();
    }
  }

  /** \u624B\u52A8\u5F00\u59CB\uFF1A\u7B2C\u4E00\u6B21\u70B9\u51FB\u53EA\u8D1F\u8D23\u5F00\u59CB\u8BA1\u65F6 + \u79FB\u8D70\u906E\u7F69 + \u5199 seen\uFF0C\u4E0D\u8F6C\u6362\u6210\u9009\u97F3 */
  function showChordWaitToStart() {
    const mask = $('#chordStartMask');
    if (mask) mask.hidden = false;
    const sub = $('#chordStartSub');
    if (sub) {
      sub.textContent = chordRound.limit === Infinity
        ? '\u4E0D\u9650\u65F6 \u00B7 \u70B9\u4E00\u4E0B\u5F00\u59CB'
        : '\u9650\u65F6 ' + fmtSec(chordRound.limit) + ' \u00B7 \u70B9\u4E00\u4E0B\u5F00\u59CB\u8BA1\u65F6';
    }
    const num = $('#chordTimerNum');
    if (num) {
      num.textContent = chordRound.limit === Infinity ? '\u221E' : String(Math.round(chordRound.limit));
      num.classList.add('idle');
    }
    const ring = $('#chordRingFg');
    if (ring) {
      ring.style.strokeDashoffset = '0';
      ring.classList.remove('warn', 'danger');
      ring.classList.add('idle-ring');
    }
    syncChordUI();
  }

  function beginChordQuestion() {
    if (chordRound.timer) clearInterval(chordRound.timer);
    chordRound.waitStart = false;
    chordRound.state = 'asking';
    chordRound.startAt = nowMs();
    chordRound.infinite = chordRound.limit === Infinity;
    chordRound.deadline = chordRound.infinite ? Infinity : chordRound.startAt + chordRound.limit * 1000;

    const mask = $('#chordStartMask');
    if (mask) mask.hidden = true;
    const num = $('#chordTimerNum');
    if (num) num.classList.remove('idle');
    const ring = $('#chordRingFg');
    if (ring) ring.classList.remove('idle-ring');

    /* \u9898\u76EE\u771F\u6B63\u8FDB\u5165\u6709\u6548\u7EC3\u4E60 \u2192 \u5199 seen\u3002\u5F00\u59CB\u524D\u79BB\u5F00\u4E0D\u5199\u3002 */
    chordMarkSeen();

    startChordTimer();
    syncChordUI();
    /* \u9898\u5361\u4E0E\u9009\u9879\u5728\u300C\u7B49\u5F85\u5F00\u59CB\u300D\u65F6\u662F\u906E\u4F4F\u7684\uFF0C\u5F00\u59CB\u540E\u5FC5\u987B\u91CD\u753B\u4E00\u6B21\uFF1A
       n2f \u7684\u300C\uFF1F\u300D\u8981\u6362\u6210\u771F\u5B9E\u548C\u5F26\u540D\uFF0Cf2n \u7684\u9009\u9879\u8981\u89E3\u9664\u906E\u7F69\u624D\u80FD\u70B9\u3002 */
    renderChordPrompt();
    renderChordOptions();
    renderChordFretboard();

    /* \u51FA\u9898\u65F6\u4E0D\u53D1\u58F0\uFF08\u7B56\u5212\u4E66 \u00A74.6.1\uFF09\uFF1A\u9898\u76EE\u672C\u8EAB\u4E0D\u653E\u97F3\uFF0C\u907F\u514D\u300C\u542C\u51FA\u6765\u662F\u4EC0\u4E48\u548C\u5F26\u300D\u3002
       \u53EA\u6709\u51FA\u9898\u65F6\u8BD5\u542C\uFF08chordAPreview==='reference'\uFF09\u624D\u64AD\u7B54\u6848\u90A3\u6761\u6307\u6CD5\u3002
       \u4F46\u97F3\u9891\u5F15\u64CE\u4ECD\u8981\u5728\u5F00\u59CB\u7B54\u9898\u65F6\u9884\u70ED \u2014\u2014 \u5426\u5219\u7B2C\u4E00\u6B21\u6309\u300C\u8BD5\u542C\u300D\u624D\u53BB\u5EFA
       AudioContext\uFF0C\u91C7\u6837\u6CA1\u5230\u4F4D\u5C31\u4F1A\u51FA\u73B0\u300C\u70B9\u4E86\u6CA1\u58F0\u97F3\u300D\u3002 */
    ensureAudio();
    const snapNow = chordRound.snap || chordSettingsSnapshot();
    const previewOn = (chordRound.play || 'a') === 'a' && store.settings.chordAPreview === 'reference';
    if (previewOn && snapNow.soundOn !== false) playChordAnswer();
    /* \u5F00\u59CB\u8BA1\u65F6\u540E waitStart \u53D8 false\uFF0C\u56FE1 \u7684\u300C\uFF1F \u00B7 \uFF1F\u300D\u624D\u8BE5\u6362\u6210\u771F\u5B9E\u548C\u5F26\u540D */
    renderSidebar();
  }

  function startChordTimer() {
    if (chordRound.state !== 'asking') return;
    if (chordRound.timer) clearInterval(chordRound.timer);
    const ring = $('#chordRingFg');
    const num = $('#chordTimerNum');
    const total = chordRound.infinite ? Infinity : chordRound.limit * 1000;
    if (chordRound.infinite) {
      if (num) { num.textContent = '\u221E'; num.classList.remove('idle'); }
      if (ring) { ring.style.strokeDashoffset = '0'; ring.classList.remove('warn', 'danger', 'idle-ring'); }
      return;
    }
    const tick = () => {
      const left = Math.max(0, chordRound.deadline - nowMs());
      const frac = left / total;
      if (ring) {
        ring.style.strokeDashoffset = String(213.6 * (1 - frac));
        ring.classList.toggle('warn', frac <= 0.6 && frac > 0.3);
        ring.classList.toggle('danger', frac <= 0.3);
      }
      if (num) num.textContent = String(Math.ceil(left / 1000));
      if (left <= 0) {
        clearInterval(chordRound.timer);
        chordRound.timer = null;
        chordTimeUp();
      }
    };
    tick();
    chordRound.timer = setInterval(tick, 100);
  }

  /** \u8D85\u65F6\uFF1A\u8BFB\u5F53\u524D\u516D\u5F26\u72B6\u6001\u4EA4\u7ED9 judge()\uFF0C\u7EDD\u4E0D\u628A\u300C\u8D85\u65F6\u300D\u672C\u8EAB\u5F53\u6210\u5224\u5B9A\u8F93\u5165 */
  function chordTimeUp() {
    if (chordRound.state !== 'asking') return;
    submitChord(true);
  }

  /**
   * \u516D\u5F26\u72B6\u6001 \u2192 \u5B9E\u9645\u97F3\u9AD8\u5217\u8868\uFF0C**\u6309\u5F26\u5E8F**\uFF086 \u5F26 \u2192 1 \u5F26\uFF09\uFF0C\u4E0D\u662F\u6309 MIDI \u97F3\u9AD8\u3002
   *
   * \u26A0 \u8FD9\u91CC\u4E0D\u80FD\u6309 midi \u6392\u5E8F\u3002\u626B\u5F26\u662F\u300C\u4ECE\u6700\u7C97\u7684\u5F26\u626B\u5230\u6700\u7EC6\u7684\u5F26\u300D\u8FD9\u4E2A\u7269\u7406\u52A8\u4F5C\uFF0C
   *   \u4E0E\u5404\u5F26\u5B9E\u9645\u97F3\u9AD8\u65E0\u5173\u3002\u53CD\u4F8B\uFF1A6 \u5F26 7 \u54C1 = B2(47)\u30015 \u5F26\u7A7A\u5F26 = A2(45)\uFF0C
   *   5 \u5F26\u7684 MIDI \u6BD4 6 \u5F26\u66F4\u4F4E\uFF0C\u4F46\u626B\u5F26\u4ECD\u7136\u5FC5\u987B\u5148\u54CD 6 \u5F26\u3002
   *   soundingNotes() \u8FD4\u56DE\u7684 notes \u672C\u8EAB\u5C31\u662F\u5F26\u5E8F\uFF08index 0 = 6 \u5F26\uFF09\uFF0C\u76F4\u63A5\u53D6\u7528\u3002
   *
   * \u9759\u97F3\u5F26\u5B8C\u5168\u4E0D\u51FA\u73B0\u5728\u7ED3\u679C\u91CC\uFF0C\u56E0\u6B64\u4E5F\u4E0D\u4F1A\u5360\u7528\u626B\u5F26\u7684\u65F6\u95F4\u95F4\u9694\u3002
   */
  function chordSoundingMidis(frets) {
    const T = chordTheory();
    if (!T) return [];
    const info = T.soundingNotes(frets, T.STANDARD_TUNING);
    return info.notes.map((n) => n.midi);
  }

  /** \u516D\u5F26\u72B6\u6001 \u2192 \u5E26\u5F26\u5E8F\u4FE1\u606F\u7684\u53D1\u58F0\u5217\u8868\uFF08\u6D4B\u8BD5\u4E0E\u8C03\u8BD5\u7528\uFF09 */
  function chordSoundingList(frets) {
    const T = chordTheory();
    if (!T) return [];
    return T.soundingNotes(frets, T.STANDARD_TUNING).notes.map((n) => ({
      stringNumber: n.stringNumber, stringIndex: n.stringIndex, fret: n.fret, midi: n.midi,
    }));
  }

  /** \u7528\u4E00\u5957\u6392\u5E03\u64AD\u653E\u548C\u5F26\uFF08\u53EA\u64AD\u975E\u9759\u97F3\u5F26\uFF09\u3002\u8FD9\u662F\u5E95\u5C42\u901A\u8DEF\uFF0C\u4E0D\u505A\u4EFB\u4F55\u5F00\u5173\u5224\u65AD\u3002 */
  function playChordFromFrets(frets, strum) {
    /* \u4F20\u5E26 stringNumber \u7684\u5BF9\u8C61\uFF1AplayChord \u4F1A\u6309\u5F26\u5E8F\uFF086 \u2192 1\uFF09\u91CD\u6392\uFF0C
       \u6240\u4EE5\u626B\u5F26\u987A\u5E8F\u6C38\u8FDC\u7531\u300C\u54EA\u6839\u5F26\u300D\u51B3\u5B9A\uFF0C\u4E0D\u53D7\u97F3\u9AD8\u9AD8\u4F4E\u5F71\u54CD\u3002 */
    const list = chordSoundingList(frets);
    if (!list.length) return false;
    ensureAudio().then(() => {
      audio.playChord(list, { strum: strum || 'strum', msPerString: 18 });
    });
    return true;
  }

  /**
   * \u64AD\u653E\u300C\u53C2\u8003\u6392\u5E03\u300D\u2014\u2014 \u7A0B\u5E8F\u751F\u6210\u7684\u53C2\u8003\u7B54\u6848\u3002
   *
   * \u4E24\u6761\u72EC\u7ACB\u7B56\u7565\uFF0C\u522B\u6DF7\u4E3A\u4E00\u8C08\uFF1A
   *   chordPreview    \u2014\u2014 \u51FA\u9898\u65F6\u662F\u5426\u81EA\u52A8\u64AD\uFF08reference / off\uFF09\uFF0Creason = 'auto'
   *   chordRevealPlay \u2014\u2014 \u7B54\u6848\u63ED\u6653\u540E\u662F\u5426\u64AD\uFF08wrongOnly / always / off\uFF09\uFF0C
   *                      reason = 'wrong' | 'correct' | 'timeout'
   *
   * wrongOnly \u7684\u8BED\u4E49\u6309\u7528\u6237\u786E\u8BA4\uFF1A\u7B54\u9519\u548C\u8D85\u65F6\u64AD\u653E\uFF0C\u7B54\u5BF9\u4E0D\u64AD\u653E\u3002
   *
   * \u4E0E\u7528\u6237\u7684\u5F53\u524D\u6392\u5E03\u5B8C\u5168\u65E0\u5173\uFF0C\u4E24\u8005\u4E0D\u80FD\u4E92\u76F8\u66FF\u4EE3\u3002
   */
  function playChordReference(reason) {
    const snap = chordRound.snap || chordSettingsSnapshot();
    /* \u53EA\u6709\u4E09\u4E2A\u660E\u786E\u7684\u300C\u63ED\u6653\u300D\u573A\u666F\u8D70 revealPlay \u7B56\u7565\uFF1B
       \u5176\u5B83\u4EFB\u4F55\u8C03\u7528\uFF08\u5305\u62EC\u5386\u53F2\u9057\u7559\u7684 'test' \u4E4B\u7C7B\uFF09\u90FD\u6309\u300C\u51FA\u9898\u81EA\u52A8\u64AD\u653E\u300D\u5904\u7406\uFF0C
       \u907F\u514D\u4E00\u4E2A\u672A\u77E5\u5B57\u7B26\u4E32\u6084\u6084\u7ED5\u8FC7 chordPreview \u7684\u9650\u5236\u3002 */
    const REVEAL = { wrong: 1, timeout: 1, correct: 1 };
    const why = (reason && REVEAL[reason]) ? reason : 'auto';
    if (why === 'auto') {
      if (snap.preview === 'off') return false;
    } else {
      /* \u63ED\u6653\u64AD\u653E\uFF1AwrongOnly \u4E0B\u7B54\u5BF9\u4E0D\u64AD\uFF1Balways \u5168\u64AD\uFF1Boff \u5168\u4E0D\u64AD */
      if (snap.revealPlay === 'off') return false;
      if (snap.revealPlay === 'wrongOnly' && why === 'correct') return false;
    }
    const ref = chordRound.reference;
    if (!ref || !ref.ok) return false;
    /* \u548C\u5F26\u7684\u64AD\u653E\u53EA\u542C\u548C\u5F26\u81EA\u5DF1\u7684\u4E24\u4E2A\u5F00\u5173\uFF08chordPreview / chordRevealPlay\uFF0C\u7B2C 8 \u6761\uFF09\uFF1A
       \u4EE5\u524D\u8FD9\u91CC\u8FD8\u53E0\u4E86\u4E00\u5C42\u97F3\u540D\u6A21\u5F0F\u7684 autoPlay\uFF0C\u5BFC\u81F4\u548C\u5F26\u6A21\u5F0F\u6CA1\u6709\u4EFB\u4F55\u5165\u53E3\u80FD\u6539\uFF0C
       \u5374\u5728\u300C\u97F3\u540D\u6A21\u5F0F\u5173\u6389\u81EA\u52A8\u64AD\u653E\u300D\u65F6\u88AB\u6084\u6084\u8FDE\u5750\u3002 */
    return playChordFromFrets(ref.frets, snap.strum);
  }

  /**
   * \u64AD\u653E\u300C\u5F53\u524D\u6392\u5E03\u300D\u2014\u2014 \u7528\u6237\u81EA\u5DF1\u6784\u5EFA\u7684\u90A3\u516D\u6839\u5F26\u3002
   *
   * \u26A0 \u8FD9\u662F**\u624B\u52A8**\u8BD5\u542C\uFF0C\u4E0E chordPreview\uFF08\u81EA\u52A8\u53C2\u8003\u64AD\u653E\u7B56\u7565\uFF09\u5B8C\u5168\u65E0\u5173\uFF1A
   *   \u7528\u6237\u5173\u6389\u81EA\u52A8\u53C2\u8003\u64AD\u653E\uFF0C\u53EA\u662F\u4E0D\u8BA9\u7A0B\u5E8F\u81EA\u52A8\u64AD\u7B54\u6848\uFF0C
   *   \u4E0D\u5E94\u8BE5\u8FDE\u4ED6\u81EA\u5DF1\u6309\u7684\u90A3\u51E0\u4E2A\u97F3\u90FD\u4E0D\u8BA9\u542C\u3002
   *   \u6240\u4EE5\u8FD9\u91CC\u4E0D\u68C0\u67E5 chordPreview\u3002
   *
   * chordListenDuringAnswer \u53EA\u5728\u8FD9\u91CC\u751F\u6548\uFF0C\u800C\u4E14\u53EA\u5728**\u7B54\u9898\u4E2D**\uFF1A
   *   \u7B54\u5B8C\u4E4B\u540E\u6309\u94AE\u4ECD\u7136\u53EF\u7528\uFF08\u90A3\u65F6\u5DF2\u7ECF\u63ED\u6653\uFF0C\u6CA1\u6709\u5077\u542C\u7B54\u6848\u7684\u95EE\u9898\uFF09\u3002
   *   \u5B83\u4E5F\u5B8C\u5168\u4E0D\u5F71\u54CD\u81EA\u52A8\u64AD\u653E\uFF08playChordReference\uFF09\u548C\u63ED\u6653\u64AD\u653E\u3002
   *
   * \u5B83\u4E0D\u64AD\u53C2\u8003\u6392\u5E03\u3001\u4E0D\u6539\u53D8\u5224\u5B9A / \u8BA1\u65F6 / \u5386\u53F2 / seen\u3002
   */
  function playChordSelection() {
    if (chordRound.state === 'idle') return false;
    const snap = chordRound.snap || chordSettingsSnapshot();
    const asking = chordRound.state === 'asking';
    /* \u8FD9\u4E00\u9879\u8BFB**\u5B9E\u65F6\u8BBE\u7F6E**\u800C\u4E0D\u662F\u51FA\u9898\u5FEB\u7167\uFF1A\u7528\u6237\u5728\u8BBE\u7F6E\u91CC\u628A\u5B83\u6253\u5F00\uFF0C
       \u671F\u671B\u7ACB\u523B\u80FD\u542C\uFF0C\u800C\u4E0D\u662F\u300C\u7B49\u4E0B\u4E00\u9898\u300D\u3002\u5B83\u662F\u7EAF UI \u8BB8\u53EF\uFF0C\u4E0D\u53C2\u4E0E\u5224\u5B9A\uFF0C
       \u6240\u4EE5\u4E0D\u9002\u7528\u300C\u4E2D\u9014\u6539\u8BBE\u7F6E\u4E0D\u5F71\u54CD\u5F53\u524D\u9898\u300D\u90A3\u6761\u89C4\u5219\uFF08\u90A3\u6761\u662F\u4E3A\u4E86\u5224\u9898\u516C\u5E73\uFF09\u3002

       \u73A9\u6CD5\u5316\u6539\u9020\u540E\u6309\u73A9\u6CD5\u5206\u522B\u8BFB\uFF1AA \u542C chordAListen\u3001B \u542C chordBSound \u90A3\u8FB9\u7684
       \u540C\u540D\u5F00\u5173\u4E0D\u5B58\u5728\uFF08B \u6CA1\u6709\u300C\u6211\u6446\u7684\u300D\u53EF\u542C\uFF09\uFF0C\u6CBF\u7528 chordAListen \u7684\u8BED\u4E49\u5373\u53EF\u3002 */
    const listenKey = 'chordAListen';
    const allowListen = store.settings[listenKey] !== false
      && store.settings.chordListenDuringAnswer !== false;
    if (asking && !allowListen) {
      updateChordFeedback('\u8BBE\u7F6E\u91CC\u5173\u6389\u4E86\u300C\u7B54\u9898\u4E2D\u8BD5\u542C\u300D\uFF0C\u7B54\u5B8C\u8FD9\u4E00\u9898\u5C31\u80FD\u542C', 'info');
      return false;
    }
    const strum = snap.strum || store.settings.chordStrum || 'strum';
    const ok = playChordFromFrets(chordRound.frets, strum);
    if (!ok) updateChordFeedback('\u8FD8\u6CA1\u6709\u9009\u62E9\u4EFB\u4F55\u53D1\u58F0\u5F26\uFF0C\u5148\u70B9\u51E0\u6839\u5F26\u518D\u8BD5\u542C', 'info');
    return ok;
  }

  /**
   * \u64AD\u653E\u300C\u6B63\u786E\u7B54\u6848\u90A3\u6761\u6307\u6CD5\u300D\u2014\u2014 \u7528\u6237 m05376 \u8981\u6C42\u7684\u90A3\u9897 \uD83C\uDFA7 \u8BD5\u542C\u7B54\u6848\u3002
   *
   * \u4E0E playChordSelection \u7684\u533A\u522B\uFF1A\u90A3\u4E2A\u64AD\u4F60\u81EA\u5DF1\u6446\u7684\uFF0C\u8FD9\u4E2A\u64AD\u9898\u5E93\u7B54\u6848\u3002
   * \u4E0E playChordReference \u7684\u533A\u522B\uFF1A\u90A3\u4E2A\u53D7 chordPreview / chordRevealPlay \u4E24\u6761
   * \u81EA\u52A8\u64AD\u653E\u7B56\u7565\u7BA1\uFF0C\u8FD9\u4E2A\u662F\u4E00\u6B21**\u624B\u52A8**\u70B9\u51FB\uFF0C\u53EA\u53D7 chordAListenAnswer \u4E00\u4E2A\u5F00\u5173\u7BA1\u3002
   *
   * \u4EA4\u5377\u524D\u542C\u7B54\u6848\u7B49\u4E8E\u76F4\u63A5\u542C\u7B54\u6848\uFF0C\u6240\u4EE5\u7B54\u9898\u4E2D\u8981\u7528\u6237\u660E\u786E\u5141\u8BB8\uFF08\u9ED8\u8BA4\u5141\u8BB8\uFF0C
   * \u56E0\u4E3A\u300C\u7EC3\u8033\u300D\u672C\u8EAB\u662F\u6B63\u5F53\u73A9\u6CD5\uFF09\uFF1B\u4EA4\u5377\u540E\u65E0\u6761\u4EF6\u653E\u884C \u2014\u2014 \u90A3\u65F6\u7B54\u6848\u5DF2\u7ECF\u63ED\u6653\u3002
   */
  function playChordAnswerSelection() {
    if (chordRound.state === 'idle') return false;
    if (chordRound.waitStart) return false;
    const snap = chordRound.snap || chordSettingsSnapshot();
    const asking = chordRound.state === 'asking';
    if (asking && store.settings.chordAListenAnswer === false) {
      updateChordFeedback('\u8BBE\u7F6E\u91CC\u5173\u6389\u4E86\u300C\u63D0\u4EA4\u524D\u53EF\u4EE5\u542C\u6B63\u786E\u7B54\u6848\u300D\uFF0C\u4EA4\u5377\u540E\u5C31\u80FD\u542C', 'info');
      return false;
    }
    const ans = chordRound.answer || (chordRound.current ? chordRound.current.fr : null);
    if (!ans || ans.every((f) => f < 0)) return false;
    const strum = snap.strum || store.settings.chordStrum || 'strum';
    const ok = playChordFromFrets(ans, strum);
    if (!ok) updateChordFeedback('\u7B54\u6848\u8FD9\u6761\u6307\u6CD5\u6CA1\u6709\u53EF\u53D1\u58F0\u7684\u5F26', 'info');
    return ok;
  }

  /**
   * \u63D0\u4EA4\u5E76\u5224\u5B9A\u3002\u4E24\u4E2A\u65B9\u5411\u5171\u7528\u8FD9\u4E00\u4E2A\u5165\u53E3\uFF0C\u4F46\u5224\u5B9A\u903B\u8F91\u5B8C\u5168\u4E0D\u540C\uFF1A
   *   n2f\uFF08\u548C\u5F26\u540D \u2192 \u6307\u677F\uFF09\uFF1A\u5224\u5B9A\u300C\u5F53\u524D\u6392\u5E03\u662F\u5426\u6784\u6210\u76EE\u6807\u548C\u5F26\u300D\uFF0C\u8D70 judgeBuild
   *   f2n\uFF08\u6307\u677F \u2192 \u540D\u79F0\uFF09  \uFF1A\u5224\u5B9A\u300C\u7528\u6237\u9009\u7684\u540D\u79F0\u662F\u5426\u662F\u8FD9\u9053\u6392\u5E03\u7684\u5408\u6CD5\u89E3\u91CA\u300D\uFF0C\u8D70 judgeIdentification
   * \u8D85\u65F6\u4E5F\u8D70\u8FD9\u91CC \u2014\u2014 \u5224\u5B9A\u4F9D\u636E\u6C38\u8FDC\u662F\u5185\u5BB9\uFF0CtimedOut \u53EA\u662F\u9644\u5E26\u6807\u8BB0\u3002
   */
  /**
   * A \u73A9\u6CD5\u5224\u5206\uFF1A\u9010\u5F26\u5168\u7B49\uFF08\u7B56\u5212\u4E66 \u00A76.2\uFF09\u3002
   *
   * \u7B54\u6848\u5C31\u662F\u9898\u5E93\u91CC\u90A3\u4E00\u6761\u6307\u6CD5 \u2014\u2014 \u4E0D\u91CD\u7B97\u3001\u4E0D\u8FD1\u4F3C\u3001\u4E0D\u770B\u97F3\u7EA7\u96C6\u5408\u3002
   * \u9489\u4F4F\u7684\u5F26\u5929\u7136\u76F8\u7B49\uFF08\u5B83\u4EEC\u662F\u4ECE\u7B54\u6848\u6284\u4E0B\u6765\u7684\uFF09\uFF0C\u6240\u4EE5\u8FD9\u91CC\u4E0D\u9700\u8981\u7279\u5224\u9489\u5B50\u3002
   */
  function chordJudgeAnswer(frets, answer) {
    const bad = [];
    let sounding = 0;
    for (let i = 0; i < 6; i += 1) {
      if (frets[i] >= 0) sounding += 1;
      if (frets[i] !== answer[i]) bad.push(6 - i);
    }
    const errors = [];
    if (!sounding) errors.push('noSound');
    bad.forEach((s) => errors.push('s' + s));
    return { ok: bad.length === 0, bad: bad, errors: errors, playedPcs: [] };
  }

  /**
   * \u63D0\u4EA4\u5E76\u5224\u5B9A\u3002\u4E24\u79CD\u73A9\u6CD5\u5171\u7528\u8FD9\u4E00\u4E2A\u5165\u53E3\uFF1A
   *   a\uFF08\u6446\u4F4D\uFF09\uFF1A\u9010\u5F26\u5168\u7B49\u9898\u5E93\u90A3\u4E00\u6761 \u2014\u2014 chordJudgeAnswer
   *   b\uFF08\u9009\u62E9\u9898\uFF09\uFF1A\u6BD4 (\u8D28\u91CF, \u6839\u97F3) \u2014\u2014 \u753B\u51FA\u6765\u7684\u548C\u70B9\u51FA\u6765\u7684\u90FD\u4E0D\u662F\u7B54\u6848
   * \u8D85\u65F6\u4E5F\u8D70\u8FD9\u91CC\uFF1A\u5224\u5B9A\u4F9D\u636E\u6C38\u8FDC\u662F\u5185\u5BB9\uFF0CtimedOut \u53EA\u662F\u9644\u5E26\u6807\u8BB0\u3002
   */
  function submitChord(timedOut) {
    if (chordRound.state !== 'asking' || chordRound.waitStart) return;
    if (chordRound.submitted) return;
    const item = chordRound.current;
    if (!item) return;
    const T = chordTheory();
    if (!T) return;

    chordRound.submitted = true;
    chordRound.state = 'answered';
    chordRound.answeredAt = nowMs();
    if (chordRound.timer) { clearInterval(chordRound.timer); chordRound.timer = null; }
    audio.stopChord();

    const snap = chordRound.snap || chordSettingsSnapshot();
    const play = chordRound.play || 'a';
    const frets = chordRound.frets.slice();
    const arrangement = T.formatArrangement(frets);
    const answer = chordRound.answer || item.fr;

    let verdict;
    let isCorrect;
    let answerName = chordRowName(item);

    if (play === 'b') {
      const chosen = chordRound.chosen;
      if (!chosen) {
        verdict = { ok: false, errors: ['noSound'], unanswered: true };
        isCorrect = false;
      } else {
        isCorrect = chosen.qi === item.qi && chosen.pc === item.pc;
        verdict = { ok: isCorrect, chosen: chosen, errors: isCorrect ? [] : ['wrongName'] };
      }
    } else {
      verdict = chordJudgeAnswer(frets, answer);
      isCorrect = verdict.ok === true;
    }
    chordRound.verdict = verdict;
    chordRound.answerName = answerName;

    /* B \u73A9\u6CD5\u7684\u300C\u6392\u9664\u4E00\u4E2A\u9519\u8BEF\u9009\u9879\u300D\uFF08chordBHint = first\uFF09\uFF1A
       \u7B2C\u4E00\u6B21\u9009\u9519\u4E0D\u7ED3\u7B97\uFF0C\u6392\u6389\u4E00\u4E2A\u9519\u9879\u8BA9\u7528\u6237\u518D\u9009\u4E00\u6B21\uFF1B\u7B2C\u4E8C\u6B21\u9009\u9519\u624D\u7ED3\u7B97\u3002
       \u9ED8\u8BA4\u6863 second \u4E0E off \u90FD\u662F\u300C\u4E00\u6B21\u5B9A\u6848\u300D\u2014\u2014 \u672C\u5DE5\u7A0B\u6CA1\u6709\u540C\u9898\u91CD\u8BD5\u7684\u7ED3\u7B97\u6D41\u7A0B\uFF0C
       \u65E2\u6709\u6D4B\u8BD5\u4E5F\u628A\u300C\u9009\u9519\u5373 answered\u300D\u9489\u6B7B\u4E86\uFF0C\u6240\u4EE5\u53EA\u7ED9 first \u5F00\u8FD9\u6761\u8DEF\u3002 */
    if (play === 'b' && !isCorrect && (snap.hint || 'second') === 'first'
        && chordRound.attempts === 0 && chordRound.chosen) {
      chordRound.attempts = 1;
      chordRound.submitted = false;
      chordRound.state = 'asking';
      const wrongPool = (chordRound.options || []).filter((o) => !(o.qi === item.qi && o.pc === item.pc)
        && !(o.qi === chordRound.chosen.qi && o.pc === chordRound.chosen.pc));
      if (wrongPool.length) {
        const drop = wrongPool[Math.floor(Math.random() * wrongPool.length)];
        chordRound.excluded = (chordRound.excluded || []).concat([drop.qi + ':' + drop.pc]);
        chordRound.chosen = null;
        renderChordOptions();
        updateChordFeedback('\u2718 \u4E0D\u5BF9\u3002\u5DF2\u7ECF\u6392\u9664\u4E00\u4E2A\u9519\u8BEF\u9009\u9879\uFF0C\u518D\u9009\u4E00\u6B21\u3002', 'bad');
        return;
      }
      /* \u6CA1\u6709\u53EF\u6392\u9664\u7684\u9519\u9879\uFF08\u9009\u9879\u88AB\u7528\u5149\uFF09\uFF1A\u9000\u56DE\u4E00\u6B21\u5B9A\u6848 */
      chordRound.state = 'answered';
      chordRound.submitted = true;
    }

    const elapsed = chordRound.startAt ? nowMs() - chordRound.startAt : 0;
    const totalMs = chordRound.infinite ? Infinity : chordRound.limit * 1000;
    /* \u8D85\u65F6\u6837\u672C\u4E0D\u8FDB\u5165\u666E\u901A\u5E73\u5747\u53CD\u5E94\u65F6\u95F4\uFF1B\u5FEB\u901F\u52A0\u6210\u4E5F\u53EA\u5728\u975E\u8D85\u65F6\u4E14\u7B54\u5BF9\u65F6\u7ED9 */
    const responseMs = (timedOut || chordRound.infinite) ? null
      : Math.round(clamp(elapsed, 0, totalMs));
    const fast = !timedOut && responseMs !== null && responseMs < totalMs * 0.45;

    /* \u2014\u2014 \u5361\u7247\u4E0E\u5386\u53F2 \u2014\u2014
       \u5386\u53F2\u5FC5\u987B\u72EC\u7ACB\u4E8E\u5361\u7247\u8BB0\u5F55\uFF1A\u5361\u7247\u521B\u5EFA\u5931\u8D25\uFF08\u7406\u8BBA\u4E0A\u4E0D\u8BE5\u53D1\u751F\uFF0C\u4F46\u4E0D\u80FD\u5047\u8BBE\uFF09
       \u65F6\u4E5F\u7EDD\u4E0D\u80FD\u4E22\u6389\u8FD9\u6761\u7B54\u9898\u5386\u53F2\u3002 */
    const card = getChordCard(item.key);
    if (card) {
      card.last = nowMs();
      let intervalMin;
      if (isCorrect) {
        card.a++;
        card.cn++;
        const jump = (card.a >= 3 && card.e === 0 && card.a % 2 === 1) ? 2 : 1;
        card.lvl = clamp(card.lvl + jump, 1, SRS_INTERVALS.length);
        intervalMin = SRS_INTERVALS[card.lvl - 1] * (fast ? 1.1 : 1);
        card.best = Math.max(card.best || 0, card.lvl);
        chordRound.streak++;
        chordRound.bestStreak = Math.max(chordRound.bestStreak, chordRound.streak);
      } else {
        card.e++;
        card.cn = 0;
        card.lvl = card.lvl >= 4 ? card.lvl - 1 : 0;
        intervalMin = card.lvl >= 4 ? SRS_INTERVALS[card.lvl - 1] : SRS_INTERVALS[0];
        if (timedOut) intervalMin = Math.min(intervalMin, 3);
        chordRound.streak = 0;
      }
      card.due = nowMs() + intervalMin * 60000;
      card.recent = Array.isArray(card.recent) ? card.recent.slice(-(RECENT_WINDOW - 1)) : [];
      card.recent.push(isCorrect);
      pushHist(card, isCorrect);
    }

    /* \u2014\u2014 \u9898\u7EA7\u7EDF\u8BA1\uFF08\u7B56\u5212\u4E66 \u00A75\uFF1A\u8C03\u5EA6\u4EE5\u300C\u9898\u300D\u4E3A\u5355\u4F4D\uFF0C\u4E0D\u662F\u4EE5\u300C\u683C\u300D\u4E3A\u5355\u4F4D\uFF09\u2014\u2014
       \u4E00\u683C\u6709 1\u201374 \u9053\u9898\uFF0C\u53EA\u7528\u683C\u7EA7\u9519\u7387\u4F1A\u8BA9\u540C\u683C\u91CC\u67D0\u4E00\u6761\u6C38\u8FDC\u62BD\u4E0D\u5230\u3002 */
    const rk = item.rk;
    const st = store.chordRows[rk] || (store.chordRows[rk] = { s: 0, w: 0, t: 0, r: [] });
    st.s = (st.s || 0) + 1;
    if (!isCorrect) st.w = (st.w || 0) + 1;
    st.t = nowMs();
    st.r = Array.isArray(st.r) ? st.r.slice(-(RECENT_WINDOW - 1)) : [];
    st.r.push(!!isCorrect);
    chordRound.lastRk = rk;

    /* \u56FE2 / \u56FE1 \u7684\u5199\u5165\u70B9\uFF08\u548C\u5F26\u6A21\u5F0F\uFF09\uFF1A\u4E00\u6B21\u5224\u5B9A\u53EA +1 */
    bumpModeStats('chord', !!isCorrect);

    chordRound.lastOk = isCorrect;

    const rec = {
      dir: play === 'b' ? 'f2n' : 'n2f',
      root: item.pc,
      quality: item.q,
      arrangement: arrangement,
      ok: isCorrect,
      errors: verdict.errors ? verdict.errors.slice() : [],
      t: nowMs(),
      ms: responseMs,
      refV: T.REF_VOICING_VERSION,
    };
    if (timedOut) rec.timedOut = true;
    store.chordHistory.push(rec);
    if (store.chordHistory.length > CHORD_HISTORY_LIMIT) {
      store.chordHistory = store.chordHistory.slice(-CHORD_HISTORY_LIMIT);
    }

    chordRound.results.push({
      ok: isCorrect,
      timedOut: !!timedOut,
      dir: rec.dir,
      name: answerName,
      arrangement: arrangement,
      errors: verdict.errors ? verdict.errors.slice() : [],
      ms: responseMs,
    });

    save();
    renderChordFeedback(isCorrect, timedOut, verdict);
    renderChordPrompt();
    renderChordOptions();
    renderChordFretboard();
    syncChordUI();
    renderChordReference();
    if (chordRound.snapshot && item.key) chordRound.snapshot.done.add(item.key);
    renderSidebar();

    /* \u7B54\u6848\u63ED\u6653\u64AD\u653E\uFF08\u7B56\u5212\u4E66 \u00A74.6.1\uFF09\uFF1A\u7B54\u5BF9\u7B54\u9519\u90FD\u64AD\uFF0C\u64AD\u7684\u662F**\u7B54\u6848\u90A3\u6761\u6307\u6CD5**\u3002
       \u8FD9\u4E0E\u300C\u8BD5\u542C\u6211\u6446\u7684\u300D\u662F\u4E24\u4E2A\u72EC\u7ACB\u5165\u53E3\uFF08playChordSelection\uFF09\u3002 */
    playChordAnswer(isCorrect);

    if (!isCorrect) {
      /* \u7B54\u9519\u5148\u505C\u4F4F\uFF1A\u7B2C 1 \u6B21\u9519\u53EA\u8BF4\u54EA\u51E0\u6839\u5F26\u4E0D\u5BF9\uFF0C\u7B2C 2 \u6B21\u9519\u624D\u628A\u7B54\u6848\u753B\u51FA\u6765\u3002
         \u542B\u6A2A\u6309\u7684\u9898\u81EA\u52A8\u5C55\u5F00\u6A2A\u6309\u624B\u6CD5\uFF08\u7B56\u5212\u4E66 \u00A77.2\uFF09\u3002 */
      const next = $('#chordNext');
      if (next) {
        next.hidden = false;
        next.textContent = '\u770B\u61C2\u4E86\uFF0C\u4E0B\u4E00\u9898 \u203A';
      }
      if (snap.autoBarreHint && item.barre > 0) revealBarreTips();
      return;
    }

    const nextEl = $('#chordNext');
    if (nextEl) { nextEl.hidden = false; nextEl.textContent = '\u4E0B\u4E00\u9898 \u203A'; }
    if (store.settings.chordAutoNextOnCorrect === true) {
      chordRound.pendingNext = setTimeout(() => {
        chordRound.pendingNext = null;
        if (chordRound.state !== 'answered') return;
        chordRound.idx++;
        nextChordQuestion(true);
      }, 900);
    }
  }

  /**
   * \u4F5C\u7B54\u540E\u64AD\u653E\uFF08\u7B56\u5212\u4E66 \u00A74.6.1\uFF09\uFF1A\u58F0\u97F3\u9ED8\u8BA4\u5F00\u3001\u7B54\u5BF9\u7B54\u9519\u90FD\u64AD\uFF0C
   * A \u73A9\u6CD5\u64AD**\u7528\u6237\u81EA\u5DF1\u6446\u7684\u90A3\u516D\u6839\u5F26**\uFF08\u590D\u523B\u65E7 playChordSelection \u8BED\u4E49\uFF09\uFF0C
   * B \u73A9\u6CD5\u6CA1\u6709\u300C\u7528\u6237\u7684\u6392\u5E03\u300D\uFF0C\u53EA\u80FD\u64AD\u9898\u9762\u90A3\u6761\u6307\u6CD5\u3002
   * \u51FA\u9898\u90A3\u4E00\u523B\u4E0D\u54CD \u2014\u2014 \u8FD9\u91CC\u53EA\u5728 submitChord \u4E4B\u540E\u8C03\u7528\u3002
   */
  function playChordAnswer() {
    const snap = chordRound.snap || chordSettingsSnapshot();
    if (snap.soundOn === false) return false;
    if (soundOf('chord').muted) return false;
    const play = chordRound.play || 'a';
    let frets = (play === 'b')
      ? (chordRound.current ? chordRound.current.fr : null)
      : (chordRound.frets || null);
    /* \u7528\u6237\u4E00\u6839\u5F26\u90FD\u6CA1\u6309\uFF08\u6216\u5168\u6309\u4E86\u9759\u97F3\uFF09\u65F6\u6CA1\u6709\u300C\u81EA\u5DF1\u7684\u58F0\u97F3\u300D\u53EF\u653E\uFF0C
       \u9000\u800C\u64AD\u7B54\u6848\u90A3\u6761\u6307\u6CD5 \u2014\u2014 \u5426\u5219\u7B54\u9519\u5B89\u9759\u5F97\u8BA9\u4EBA\u4EE5\u4E3A\u7A0B\u5E8F\u574F\u4E86\u3002 */
    if (!frets || frets.every((f) => f < 0)) {
      frets = chordRound.answer || (chordRound.current ? chordRound.current.fr : null);
    }
    if (!frets || frets.every((f) => f < 0)) return false;
    return playChordFromFrets(frets, snap.strum);
  }

  /** \u5C55\u5F00\u300C\u6A2A\u6309\u6309\u4E0D\u54CD\uFF1F\u300D\uFF08\u5224\u9519 + \u542B\u6A2A\u6309\u624D\u81EA\u52A8\u5C55\u5F00\uFF0C\u7B56\u5212\u4E66 \u00A77.2\uFF09 */
  function revealBarreTips() {
    const tips = $('#chordTips');
    if (tips) tips.hidden = false;
    if (tips && tips.tagName === 'DETAILS') tips.open = true;
  }

  /**
   * \u5F53\u524D\u9898\u7684\u548C\u5F26\u540D\uFF08\u82F1\u6587\u5199\u6CD5\uFF0C\u8DDF chordAccidental \u8D70\uFF09\u3002
   * \u9898\u5E93\u884C\u6709 18 \u79CD\u8D28\u91CF\uFF0C\u5206\u6790\u5668\u7684 formatChordName \u53EA\u8BA4 10 \u79CD \u2014\u2014
   * \u540D\u5B57\u4E00\u5F8B\u4ECE\u9898\u5E93\u7684 N \u8868\u53D6\uFF0C\u5224\u5206\u4E0E\u663E\u793A\u624D\u4E0D\u4F1A\u5BF9\u4E0D\u4E0A\u3002
   */
  function chordNameOf(q) {
    if (!q) return '\u2014';
    const qi = bankQualityIndex(q.quality || q.q);
    if (qi >= 0) return bankNameOf(qi, typeof q.root === 'number' ? q.root : q.pc, chordAccidental() === 'flat');
    const T = chordTheory();
    if (!T) return '\u2014';
    return T.formatChordName(q.root, q.quality, { flat: chordAccidental() === 'flat' });
  }

  /** \u4E00\u8F6E\u7ED3\u675F */
  function finishChordRound() {
    chordRound.state = 'idle';
    chordRound.current = null;
    chordRound.waitStart = false;
    if (chordRound.timer) { clearInterval(chordRound.timer); chordRound.timer = null; }
    if (chordRound.pendingNext) { clearTimeout(chordRound.pendingNext); chordRound.pendingNext = null; }
    audio.stopChord();
    const n = chordRound.results.length;
    const right = chordRound.results.filter((r) => r.ok === true).length;
    const nameEl = $('#chordName');
    if (nameEl) nameEl.textContent = '\u672C\u8F6E\u5B8C\u6210 \uD83C\uDF89';
    const sub = $('#chordSub');
    if (sub) {
      sub.textContent = '\u672C\u8F6E ' + n + ' \u9898\uFF0C\u7B54\u5BF9 ' + right
        + (n ? '\uFF0C\u6B63\u786E\u7387 ' + Math.round((right / n) * 100) + '%' : '');
    }
    const fb = $('#chordFeedback');
    if (fb) {
      fb.className = 'feedback chord-feedback info';
      fb.textContent = '\u672C\u8F6E\u7ED3\u675F\u3002\u6309 Enter \u6216\u70B9\u300C\u5F00\u59CB\u65B0\u4E00\u8F6E\u300D\u7EE7\u7EED\u3002';
    }
    const mask = $('#chordStartMask');
    if (mask) mask.hidden = true;
    chordRound.frets = [-1, -1, -1, -1, -1, -1];
    renderChordFretboard();
    syncChordUI();
    const next = $('#chordNext');
    if (next) { next.hidden = false; next.textContent = '\u5F00\u59CB\u65B0\u4E00\u8F6E \u203A'; }
    /* \u56FE3 \u4FDD\u7559\u521A\u7ED3\u675F\u90A3\u4E00\u8F6E\u7684\u5FEB\u7167\uFF08D33\uFF09\uFF0C\u56FE1/\u56FE4 \u8F6C\u7A7A\u6001\uFF08D38\uFF09 */
    renderSidebar();
  }

  /** \u7B54\u9519 / \u8D85\u65F6\u540E\u70B9\u300C\u4E0B\u4E00\u9898\u300D\u6216\u300C\u5F00\u59CB\u65B0\u4E00\u8F6E\u300D
      \u548C\u5F26\u81EA\u5DF1\u7684\u300C\u70B9\u4E0B\u4E00\u9898\u81EA\u52A8\u5F00\u59CB\u300D\u5F00\u5173\uFF08chordAutoStartOnNext\uFF09\u5728\u8FD9\u91CC\u751F\u6548 */
  function chordAdvanceNow() {
    if (chordRound.state === 'answered') {
      chordRound.idx++;
      nextChordQuestion(store.settings.chordAutoStartOnNext === true);
      return;
    }
    if (chordRound.state === 'idle') {
      startChordRound();
    }
  }

  /* =================================================================
   *  \u97F3\u7A0B\u6A21\u5F0F\uFF08\u72EC\u7ACB\u72B6\u6001\uFF0C\u4E0E round / chordRound \u5B8C\u5168\u5E76\u884C\uFF09
   *
   *  \u89C4\u683C\uFF1AINTERVAL-MODE-PLAN.md v11\u3002
   *  \u4E3A\u4EC0\u4E48\u518D\u5F00\u4E00\u4E2A\u72B6\u6001\u5BF9\u8C61\uFF1A\u548C\u5F26\u6A21\u5F0F\u90A3\u6BB5\u6CE8\u91CA\u5DF2\u7ECF\u8E29\u8FC7\u4E00\u6B21\u300C\u4E00\u4E2A\u5BF9\u8C61\u88C5\u4E24\u79CD\u6A21\u5F0F\u300D
   *  \u7684\u5751\u3002\u97F3\u7A0B\u6A21\u5F0F\u9700\u8981\u7684\u4E1C\u897F\uFF08\u4E24\u70B9\u9898 / \u8D77\u70B9\u9898 / \u76EE\u6807\u5168\u96C6 / \u4E3B\u7B54\u6848 / \u9009\u9879\u96C6\u5408 /
   *  \u8DE8\u516B\u5EA6\u89C4\u5219\uFF09\u4E0E\u5355\u97F3\u548C\u548C\u5F26\u90FD\u4E0D\u540C\uFF0C\u6DF7\u8FDB\u4EFB\u4F55\u4E00\u4E2A\u90FD\u4F1A\u8BA9\u65E2\u6709\u6D4B\u8BD5\u968F\u65F6\u53D8\u7EA2\u3002
   *
   *  \u5141\u8BB8\u5171\u4EAB\u7684\u53EA\u6709\u7EAF\u5DE5\u5177\uFF1A$()\u3001\u97F3\u9891\u3001SRS \u5E38\u91CF\u3001\u65F6\u95F4\u683C\u5F0F\u5316\u3002
   * ================================================================= */

  const intervalRound = {
    queue: [], idx: 0, results: [], current: null,
    state: 'idle',            // idle | asking | answered
    play: 'a',                // \u672C\u9898\u5C5E\u4E8E\u54EA\u4E2A\u73A9\u6CD5
    waitStart: false,
    startAt: 0, deadline: 0, limit: 10, infinite: false,
    timer: null, pendingNext: null,
    streak: 0, bestStreak: 0,
    /* \u9898\u76EE\u5F00\u59CB\u65F6\u5FEB\u7167\u4E0B\u6765\u7684\u8BBE\u7F6E\uFF1A\u4E2D\u9014\u6539\u8BBE\u7F6E\u4E0D\u5F71\u54CD\u5F53\u524D\u9898\uFF08\u00A711.4\uFF09 */
    snap: null,
    /* \u73A9\u6CD5 A \u672C\u9898\uFF1AA/B \u4E24\u70B9\u3001\u6B63\u786E\u7B54\u6848\u3001\u9009\u9879\u96C6\u5408\u3001\u7528\u6237\u6240\u9009 */
    cellA: null, cellB: null,
    correct: null,            // { id, dir }
    options: [],              // [{ id, dir }]
    chosen: null,
    /* \u73A9\u6CD5 B \u672C\u9898\uFF1A\u8D77\u70B9\u3001\u76EE\u6807\u5168\u96C6\u3001\u4E3B\u7B54\u6848\u3001\u7528\u6237\u5F85\u63D0\u4EA4\u4F4D\u7F6E */
    start: null,
    targets: [],              // \u5DF2\u6309\u4E3B\u7B54\u6848\u89C4\u5219\u6392\u5E8F
    pick: null,
    submitted: false,
    /* \u5224\u5B9A\u7ED3\u679C\u4E0E\u590D\u76D8 */
    verdict: null,
    answeredAt: 0,
    lastOk: null,
    snapshot: null,           // \u672C\u8F6E\u5B66\u4E60\u5206\u5E03\u5FEB\u7167\uFF08\u56FE3\uFF09
  };

  /* ---------- \u8BBE\u7F6E\u89E3\u6790 ---------- */

  function intervalSetA() {
    const T = intervalTheory();
    if (!T) return [];
    const raw = store.settings.intervalSetA;
    const list = Array.isArray(raw) ? raw : T.DEFAULT_A_SET;
    return T.normalizeSet(list, false);
  }

  function intervalSetB() {
    const T = intervalTheory();
    if (!T) return [];
    const raw = store.settings.intervalSetB;
    const list = Array.isArray(raw) ? raw : T.DEFAULT_B_SET;
    /* forPlayB = true\uFF1A\u6C38\u4E45\u5254\u9664 unison\uFF08D18\uFF09 */
    return T.normalizeSet(list, true);
  }

  function intervalFretMax() {
    const r = String(store.settings.intervalRange || '0-12');
    const n = Number(r.split('-')[1]);
    return isFinite(n) ? clamp(n, 1, 21) : 12;
  }

  function intervalStrings() {
    const list = Array.isArray(store.settings.intervalStrings) ? store.settings.intervalStrings : [6, 5, 4, 3, 2, 1];
    const out = list.map(Number).filter((n) => n >= 1 && n <= 6);
    return out.length ? out : [6, 5, 4, 3, 2, 1];
  }

  /* \u9009\u9879\u6570\u91CF\uFF1A\u8BBE\u7F6E\u503C\u4F1A\u88AB clamp \u5230 4..min(12, C)\uFF08D29 / \u00A76.3-8\uFF09 */
  function intervalOptionCount() {
    const T = intervalTheory();
    if (!T) return 4;
    const cap = Math.max(1, T.maxOptionCount(intervalSetA()));
    const want = Number(store.settings.intervalOptionCount) || 4;
    return clamp(Math.round(want), Math.min(4, cap), cap);
  }

  /* ---------- \u9898\u76EE\u5F00\u59CB\u65F6\u7684\u8BBE\u7F6E\u5FEB\u7167 ---------- */

  function intervalSnapshot() {
    const s = store.settings;
    const T = intervalTheory();
    const play = s.intervalPlay === 'b' ? 'b' : 'a';
    const setA = intervalSetA();
    const setB = intervalSetB();
    const set = play === 'b' ? setB : setA;
    const dirSetting = s.intervalDirB === 'down' ? 'down' : (s.intervalDirB === 'random' ? 'random' : 'up');
    return {
      play: play,
      range: String(s.intervalRange || '0-12'),
      maxFret: intervalFretMax(),
      strings: intervalStrings(),
      setA: setA,
      setB: setB,
      set: set,
      optionCount: intervalOptionCount(),
      dirSetting: dirSetting,
      equiv: play === 'b' ? !!s.intervalEquiv : false,   // \u53EA\u5F71\u54CD\u73A9\u6CD5 B\uFF08D1\uFF09
      showRootName: s.intervalShowRootName !== false,
      clickSound: !!s.intervalClickSound,
      size: clamp(Math.round(Number(s.intervalSize) || 10), 5, 50),
      startMode: s.intervalStartMode === 'auto' ? 'auto' : 'manual',
      autoNextOnCorrect: !!s.intervalAutoNextOnCorrect,
      autoStartNext: s.intervalAutoStartNext !== false,
      novelty: s.intervalNovelty === 'new' ? 'new' : (s.intervalNovelty === 'familiar' ? 'familiar' : 'mix'),
      perFret: !!s.intervalPerFret,
      timeA: intervalTimeOf(s.intervalTimeA, 10),
      timeB: intervalTimeOf(s.intervalTimeB, 15),
      preview: s.intervalPreview !== 'off',
      listenDuringAnswer: s.intervalListenDuringAnswer !== false,
      /* \u97F3\u7A0B\u81EA\u5DF1\u7684\u5347\u964D\u8C03\u5F00\u5173 \u2192 \u51FA\u9898\u5141\u8BB8\u7684\u97F3\u7EA7\u96C6\u5408\uFF08\u5FEB\u7167\u91CC\u51BB\u7ED3\uFF0C\u6539\u8BBE\u7F6E\u4E0D\u4F1A\u4E2D\u9014\u6362\u6C60\uFF09 */
      pcs: intervalAllowedPcs(),
      theory: T,
    };
  }

  /* ---------- \u5361\u7247\u952E ---------- */

  /* \u73A9\u6CD5 A\uFF1A\u6C38\u8FDC\u5E26 shape\uFF08D41/D42\uFF09 */
  function intervalCardKeyA(intervalId, dir, shape) {
    return 'i:a:' + intervalId + ':' + dir + ':exact:' + shape;
  }

  /* \u73A9\u6CD5 B\uFF1A\u7CBE\u786E\u6A21\u5F0F\u5E26 shape\uFF1B\u8DE8\u516B\u5EA6\u6A21\u5F0F\u4E0D\u5E26\uFF08D42/D46\uFF09 */
  function intervalCardKeyB(intervalId, dir, mode, shape) {
    const base = 'i:b:' + intervalId + ':' + dir + ':' + mode;
    return mode === 'exact' && shape ? base + ':' + shape : base;
  }

  /* ---------- \u81EA\u9002\u5E94\u6743\u91CD\uFF08D47\u2013D50\uFF09 ---------- */

  function intervalCardWeight(key) {
    const T = intervalTheory();
    if (!T) return 3;
    const card = store.intervalCards[key];
    if (!card) return T.NEW_CARD_WEIGHT;
    return T.intervalWeight(card, nowMs());
  }

  /* ---------- \u73A9\u6CD5 A \u9898\u6C60\uFF08\u6309 \u97F3\u7A0B \u00D7 \u65B9\u5411 \u00D7 \u5F62\u72B6 \u5206\u7EC4\uFF09 ---------- */

  let intervalAPoolCache = { key: '', list: [] };

  function intervalAPoolKey() {
    const s = intervalRound.snap || intervalSnapshot();
    /* \u97F3\u7EA7\u96C6\u5408\u5FC5\u987B\u8FDB\u7F13\u5B58\u952E\uFF1A\u5426\u5219\u6539\u4E86\u5347\u964D\u8C03\u5F00\u5173\u8FD8\u4F1A\u590D\u7528\u4E0A\u4E00\u4EFD\u300C\u5168\u97F3\u7EA7\u300D\u7684\u6C60\u3002 */
    return 'a|' + s.setA.join(',') + '|' + s.strings.join(',') + '|' + s.maxFret
      + '|' + (s.pcs || []).join(',');
  }

  function intervalAPool() {
    const s = intervalRound.snap || intervalSnapshot();
    const T = s.theory || intervalTheory();
    if (!T) return [];
    const key = intervalAPoolKey();
    if (intervalAPoolCache.key === key) return intervalAPoolCache.list;
    const list = T.enumeratePairs({ set: s.setA, strings: s.strings, maxFret: s.maxFret, pcs: s.pcs });
    intervalAPoolCache = { key: key, list: list };
    return list;
  }

  /* ---------- \u73A9\u6CD5 B \u9898\u6C60\uFF08\u8D77\u70B9 \u00D7 \u97F3\u7A0B \u00D7 \u65B9\u5411\uFF0C\u5148\u7B5B\u540E\u62BD\uFF0C\u00A77.4\uFF09 ---------- */

  let intervalBPoolCache = { key: '', list: [] };

  function intervalBPoolKey() {
    const s = intervalRound.snap || intervalSnapshot();
    /* \u65B9\u5411\u8BBE\u7F6E\u5FC5\u987B\u8FDB\u7F13\u5B58\u952E\uFF1A\u5B83\u51B3\u5B9A\u6C60\u91CC\u6709\u6CA1\u6709 down \u5206\u652F\uFF0C
       \u6F0F\u4E86\u5B83\u4F1A\u8BA9\u300C\u6539\u6210\u53EA\u5411\u4E0B\u300D\u7EE7\u7EED\u590D\u7528\u4E0A\u4E00\u4EFD\u300C\u53EA\u5411\u4E0A\u300D\u7684\u6C60\u3002 */
    return 'b|' + s.setB.join(',') + '|' + s.strings.join(',') + '|' + s.maxFret
      + '|' + s.equiv + '|' + s.dirSetting + '|' + (s.pcs || []).join(',');
  }

  /* \u8FD4\u56DE [{ cardKey, intervalId, dir, start, targets, shape }]\uFF0C
     \u53EA\u4FDD\u7559\u300C\u81F3\u5C11\u6709\u4E00\u4E2A\u5408\u6CD5\u76EE\u6807\u300D\u7684\u8D77\u70B9\uFF08\u00A77.4 \u7B2C\u4E00\u6B65\uFF09\u3002 */
  function intervalBPool() {
    const s = intervalRound.snap || intervalSnapshot();
    const T = s.theory || intervalTheory();
    if (!T) return [];
    const key = intervalBPoolKey();
    if (intervalBPoolCache.key === key) return intervalBPoolCache.list;

    const mode = s.equiv ? 'equiv' : 'exact';
    const set = s.setB;
    const strings = s.strings;
    const maxFret = s.maxFret;
    const list = [];

    /* \u679A\u4E3E\u5168\u90E8\u8D77\u70B9 */
    for (let i = 0; i < strings.length; i++) {
      const s1 = strings[i];
      for (let f1 = 0; f1 <= maxFret; f1++) {
        /* \u8D77\u70B9\u4E5F\u8981\u8FC7\u97F3\u7EA7\u8FC7\u6EE4\uFF1A\u5173\u6389\u964D\u53F7\u540E\uFF0C\u300C\u8D77\u70B9\u662F B\u266D\u300D\u7684\u9898\u4E0D\u8BE5\u518D\u51FA */
        if (s.pcs && s.pcs.length) {
          const m1 = T.midiAt(s1, f1);
          if (s.pcs.indexOf(T.pitchClass(m1)) < 0) continue;
        }
        for (let k = 0; k < set.length; k++) {
          const iv = set[k];
          /* \u65B9\u5411\u8BBE\u7F6E\uFF1Aup / down / random\uFF08random \u65F6\u4E24\u4E2A\u65B9\u5411\u90FD\u8FDB\u6C60\uFF0C\u51FA\u9898\u65F6\u518D\u5B9A\uFF09 */
          const dirs = s.dirSetting === 'random' ? ['up', 'down'] : [s.dirSetting];
          for (let d = 0; d < dirs.length; d++) {
            const dir = dirs[d];
            const targets = T.enumerateTargets({ s: s1, f: f1 }, {
              intervalId: iv, dir: dir, mode: mode, strings: strings, maxFret: maxFret, pcs: s.pcs,
            });
            if (!targets.length) continue;   // \u65E0\u89E3\u8D77\u70B9\u76F4\u63A5\u6392\u9664
            const main = targets[0];
            const shape = T.shapeOf(s1, main.s);
            list.push({
              cardKey: intervalCardKeyB(iv, dir, mode, shape),
              intervalId: iv,
              dir: dir,
              start: { s: s1, f: f1 },
              targets: targets,
              shape: shape,
            });
          }
        }
      }
    }
    intervalBPoolCache = { key: key, list: list };
    return list;
  }

  /* ---------- \u8BA1\u65F6 ---------- */

  function intervalLimitFor(cellA, cellB) {
    const s = intervalRound.snap || intervalSnapshot();
    if (!s) return 10;
    const base = limitSeconds(s.play === 'b' ? s.timeB : s.timeA);
    if (base === Infinity) return Infinity;
    if (!s.perFret) return base;
    const T = s.theory || intervalTheory();
    if (!T) return base;
    /* D24\uFF1A\u73A9\u6CD5 A \u7528 max(fretA, fretB)\uFF1B\u73A9\u6CD5 B \u7528\u8D77\u70B9\u54C1\u4F4D */
    let fret = 0;
    if (s.play === 'a') {
      const fa = cellA ? Number(cellA.f) : 0;
      const fb = cellB ? Number(cellB.f) : 0;
      fret = Math.max(fa, fb);
    } else {
      fret = cellA ? Number(cellA.f) : 0;
    }
    return T.withFretSlack(base, fret);
  }

  /* ---------- \u51FA\u9898\uFF1A\u73A9\u6CD5 A ---------- */

  /* \u6309\u914D\u989D\u6784\u9020\u4E00\u8F6E\u7684\u300C\u69FD\u4F4D\u300D\u5217\u8868\uFF1A[{ dir: 'up'|'down'|'none' }] */
  function intervalSlots(snap) {
    const T = snap.theory || intervalTheory();
    if (!T) return [];
    const unisonOn = snap.setA.indexOf('unison') >= 0;
    const q = T.directionQuota(snap.size, unisonOn);
    const slots = [];
    for (let i = 0; i < q.upCount; i++) slots.push({ dir: 'up' });
    for (let i = 0; i < q.downCount; i++) slots.push({ dir: 'down' });
    for (let i = 0; i < q.unisonCount; i++) slots.push({ dir: 'none' });
    /* \u9898\u5E8F\u6253\u6563\u4E14\u7981\u6B62\u8FDE\u7EED 3 \u540C\u5411\uFF08\u00A77.5\uFF09 */
    return T.shuffleWithoutTriple(slots);
  }

  /* \u51FA\u9898\u503E\u5411\u8FC7\u6EE4\uFF08\u72EC\u7ACB\u5B57\u6BB5 intervalNovelty\uFF0C\u53EA\u5F71\u54CD\u97F3\u7A0B\u6A21\u5F0F\uFF09\uFF1A
     - new\uFF1A\u53EA\u7559\u300C\u8FD8\u6CA1\u7B54\u5BF9\u8FC7\u300D\u7684\u5361
     - familiar\uFF1A\u53EA\u7559\u300C\u81F3\u5C11\u7B54\u5BF9\u8FC7 1 \u6B21\u300D\u7684\u5361
     - mix\uFF1A\u4E0D\u8FC7\u6EE4
     \u8FC7\u6EE4\u540E\u4E0D\u8DB3 4 \u6761\u5C31\u9000\u56DE\u5168\u6C60 \u2014\u2014 \u548C\u97F3\u540D\u6A21\u5F0F\u7684 novelty \u4E00\u6837\uFF0C\u5B81\u53EF\u51FA\u91CD\u590D\u9898\u4E5F\u4E0D\u51FA\u7A7A\u9898\u3002 */
  function intervalNoveltyFilter(list, keyOf) {
    const snap = intervalRound.snap;
    const mode = (snap && snap.novelty) || store.settings.intervalNovelty || 'mix';
    if (mode === 'mix' || !list.length) return list;
    const kept = list.filter((x) => {
      const card = store.intervalCards[keyOf(x)];
      const answered = !!card && card.a > 0;
      return mode === 'new' ? !answered : answered;
    });
    return kept.length >= 4 ? kept : list;
  }

  /* \u4ECE\u9898\u6C60\u91CC\u6309\u6743\u91CD\u6311\u4E00\u4E2A\u5206\u7EC4\uFF1Bdir \u4E3A null \u65F6\u4E0D\u9650\u65B9\u5411 */
  function intervalPickGroup(pool, dir, usedKeys) {
    const cands = pool.filter((g) => (dir ? g.dir === dir : true));
    if (!cands.length) return null;
    /* \u4F18\u5148\u6CA1\u5728\u672C\u8F6E\u7528\u8FC7\u7684\u5F62\u72B6\u7EC4\u5408\uFF0C\u907F\u514D\u4E00\u8F6E\u91CC\u540C\u4E00\u4E2A\u5F62\u72B6\u53CD\u590D\u51FA\u73B0 */
    const fresh = cands.filter((g) => !usedKeys.has(intervalCardKeyA(g.id, g.dir, g.shape)));
    const list = fresh.length ? fresh : cands;
    return weightedPick(list, (g) => intervalCardWeight(intervalCardKeyA(g.id, g.dir, g.shape)));
  }

  /* \u6784\u9020\u73A9\u6CD5 A \u7684\u4E00\u8F6E\u9898\u76EE\u961F\u5217 */
  function buildIntervalASchedule(snap) {
    const T = snap.theory || intervalTheory();
    if (!T) return [];
    const pool = intervalNoveltyFilter(intervalAPool(), (g) => intervalCardKeyA(g.id, g.dir, g.shape));
    if (!pool.length) return [];
    const slots = intervalSlots(snap);
    const used = new Set();
    const queue = [];
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const g = intervalPickGroup(pool, slot.dir, used);
      if (!g) {
        /* \u8BE5\u65B9\u5411\u51D1\u4E0D\u51FA\u9898\uFF1A\u9000\u56DE\u5230\u4EFB\u610F\u65B9\u5411\uFF08\u4E0D\u9759\u9ED8\u51CF\u9898\uFF0C\u53EA\u5728\u786E\u5B9E\u65E0\u89E3\u65F6\u964D\u7EA7\uFF09 */
        const fallback = intervalPickGroup(pool, null, used);
        if (!fallback) continue;
        queue.push(makeAQuestion(fallback, snap));
        used.add(intervalCardKeyA(fallback.id, fallback.dir, fallback.shape));
        continue;
      }
      queue.push(makeAQuestion(g, snap));
      used.add(intervalCardKeyA(g.id, g.dir, g.shape));
    }
    return queue;
  }

  /* \u7531\u5206\u7EC4 + \u968F\u673A pair \u751F\u6210\u4E00\u9053\u73A9\u6CD5 A \u9898\u76EE */
  function makeAQuestion(group, snap) {
    const pairs = group.pairs;
    const pickIdx = Math.floor(Math.random() * pairs.length);
    const p = pairs[pickIdx] || pairs[0];
    return {
      play: 'a',
      cellA: { s: p.a.s, f: p.a.f },
      cellB: { s: p.b.s, f: p.b.f },
      intervalId: group.id,
      dir: group.dir,
      shape: group.shape,
      cardKey: intervalCardKeyA(group.id, group.dir, group.shape),
      mode: 'exact',
    };
  }

  /* ---------- \u51FA\u9898\uFF1A\u73A9\u6CD5 B ---------- */

  function buildIntervalBSchedule(snap) {
    const pool = intervalNoveltyFilter(intervalBPool(), (x) => x.cardKey);
    if (!pool.length) return [];
    const size = snap.size;
    const used = new Set();
    const queue = [];
    for (let i = 0; i < size; i++) {
      const fresh = pool.filter((x) => !used.has(x.cardKey));
      const list = fresh.length ? fresh : pool;
      const chosen = weightedPick(list, (x) => intervalCardWeight(x.cardKey));
      if (!chosen) break;
      used.add(chosen.cardKey);
      queue.push({
        play: 'b',
        start: { s: chosen.start.s, f: chosen.start.f },
        intervalId: chosen.intervalId,
        dir: chosen.dir,
        mode: snap.equiv ? 'equiv' : 'exact',
        shape: chosen.shape,
        cardKey: chosen.cardKey,
        targets: chosen.targets,
      });
    }
    return queue;
  }

  /* ---------- \u4E00\u8F6E\u7684\u751F\u547D\u5468\u671F ---------- */

  function startIntervalRound() {
    if (intervalRound.timer) { clearInterval(intervalRound.timer); intervalRound.timer = null; }
    if (intervalRound.pendingNext) { clearTimeout(intervalRound.pendingNext); intervalRound.pendingNext = null; }
    audio.stopChord();

    intervalRound.snap = intervalSnapshot();
    const snap = intervalRound.snap;
    intervalRound.play = snap.play;
    intervalRound.results = [];
    intervalRound.idx = 0;
    intervalRound.state = 'idle';
    intervalRound.current = null;
    intervalRound.streak = 0;
    intervalRound.verdict = null;
    intervalRound.submitted = false;
    intervalRound.chosen = null;
    intervalRound.pick = null;

    /* \u9898\u6C60\u7F13\u5B58\u8DDF\u7740\u5FEB\u7167\u8D70 */
    intervalAPoolCache = { key: '', list: [] };
    intervalBPoolCache = { key: '', list: [] };

    const queue = snap.play === 'b' ? buildIntervalBSchedule(snap) : buildIntervalASchedule(snap);
    intervalRound.queue = queue;
    intervalRound.snapshot = freezeSnapshot(queue, 'interval', (item) => item.cardKey);
    modeStatOf('interval').streak = 0;

    if (!queue.length) {
      renderIntervalEmptyState();
      syncIntervalUI();
      renderIntervalFretboard();
      renderSidebar();
      return;
    }
    renderSidebar();
    nextIntervalQuestion();
  }

  function nextIntervalQuestion(autoStart) {
    if (intervalRound.timer) { clearInterval(intervalRound.timer); intervalRound.timer = null; }
    if (intervalRound.pendingNext) { clearTimeout(intervalRound.pendingNext); intervalRound.pendingNext = null; }
    audio.stopChord();

    if (intervalRound.idx >= intervalRound.queue.length) { finishIntervalRound(); return; }

    const item = intervalRound.queue[intervalRound.idx];
    const snap = intervalRound.snap || intervalSnapshot();
    const T = snap.theory || intervalTheory();

    intervalRound.current = item;
    intervalRound.play = item.play;
    intervalRound.state = 'asking';
    intervalRound.verdict = null;
    intervalRound.answeredAt = 0;
    intervalRound.lastOk = null;
    intervalRound.submitted = false;
    intervalRound.chosen = null;
    intervalRound.pick = null;

    if (item.play === 'a') {
      intervalRound.cellA = { s: item.cellA.s, f: item.cellA.f };
      intervalRound.cellB = { s: item.cellB.s, f: item.cellB.f };
      intervalRound.start = null;
      intervalRound.targets = [];
      intervalRound.correct = { id: item.intervalId, dir: item.dir };
      /* \u9009\u9879\uFF1A\u6B63\u786E\u7B54\u6848 + \u9636\u68AF\u5E72\u6270\u9879\uFF0C\u6570\u91CF = \u8BBE\u7F6E\u503C\uFF08\u00A76.3\uFF09 */
      intervalRound.options = T
        ? T.buildOptions(intervalRound.correct, snap.setA, snap.optionCount)
        : [intervalRound.correct];
    } else {
      intervalRound.cellA = null;
      intervalRound.cellB = null;
      intervalRound.start = { s: item.start.s, f: item.start.f };
      intervalRound.targets = item.targets || [];
      intervalRound.correct = { id: item.intervalId, dir: item.dir };
      intervalRound.options = [];
    }

    intervalRound.limit = intervalLimitFor(intervalRound.cellA || intervalRound.start, intervalRound.cellB);
    intervalRound.infinite = intervalRound.limit === Infinity;
    intervalRound.waitStart = (snap.startMode === 'manual') && !autoStart;

    renderIntervalPrompt();
    renderIntervalOptions();
    renderIntervalFeedback();
    syncIntervalUI();
    renderIntervalFretboard();
    /* \u4E0E\u548C\u5F26\u540C\u7406\uFF1A\u56FE1 \u7684\u300C\u8BAD\u7EC3\u5BF9\u8C61\u300D\u548C \u56FE4 \u7684\u5F53\u524D\u77E5\u8BC6\u70B9\u8981\u7B49 current \u5C31\u4F4D\u624D\u6709\u5185\u5BB9 */
    renderSidebar();

    if (intervalRound.waitStart) {
      showIntervalWaitToStart();
    } else {
      beginIntervalQuestion();
    }
  }

  /* \u624B\u52A8\u5F00\u59CB\uFF1A\u53EA\u51FA\u300C\u906E\u7F69 + \u5F00\u59CB\u6309\u94AE\u300D\uFF0C\u9898\u5361\u4E0E\u9009\u9879\u5FC5\u987B\u85CF\u8D77\u6765 \u2014\u2014
     \u5426\u5219\u8FD8\u6CA1\u70B9\u5F00\u59CB\u5C31\u628A\u9898\u76EE\uFF08\u97F3\u7A0B\u540D\u3001\u9009\u9879\u3001\u8D77\u70B9\uFF09\u5168\u6CC4\u9732\u4E86\u3002
     \u97F3\u540D\u6A21\u5F0F\u7528\u540C\u4E00\u5957\u601D\u8DEF\uFF1AapplyWaitingUI() \u7ED9\u9898\u5361/\u9009\u9879\u52A0 .masked\u3002 */
  function applyIntervalWaitingUI(waiting) {
    const card = $('#intervalCard');
    if (card) card.classList.toggle('masked', waiting);
    const head = $('#intervalOptionHead');
    if (head) head.classList.toggle('masked', waiting);
    const opts = $('#intervalOptions');
    if (opts) opts.classList.toggle('masked', waiting);
    /* \u5F00\u59CB\u524D\u7981\u7528\u9009\u9879\uFF0C\u5F00\u59CB\u540E\u5FC5\u987B\u91CD\u65B0\u542F\u7528 \u2014\u2014
       \u4EE5\u524D\u8FD9\u91CC\u53EA\u5199\u4E86 `if (waiting) b.disabled = true`\uFF0C
       \u7ED3\u679C\u89E3\u9664\u906E\u7F69\u540E\u6309\u94AE\u6C38\u4E45\u7981\u7528\uFF0C\u73A9\u6CD5 A \u70B9\u9009\u9879\u5B8C\u5168\u6CA1\u53CD\u5E94\u3002 */
    document.querySelectorAll('#intervalOptions .opt').forEach((b) => {
      b.disabled = waiting ? true : false;
    });
  }

  function showIntervalWaitToStart() {
    if (intervalRound.timer) { clearInterval(intervalRound.timer); intervalRound.timer = null; }
    intervalRound.state = 'asking';
    intervalRound.deadline = 0;
    const el = $('#intervalTimerNum');
    if (el) {
      el.textContent = intervalRound.limit === Infinity ? '\u221E' : String(Math.round(intervalRound.limit));
      el.classList.add('idle');
    }
    const ring = $('#intervalRingFg');
    if (ring) { ring.style.strokeDashoffset = '0'; ring.classList.remove('warn', 'danger'); ring.classList.add('idle-ring'); }
    const mask = $('#intervalStartMask');
    if (mask) mask.hidden = false;
    const sub = $('#intervalStartSub');
    if (sub) {
      sub.textContent = intervalRound.limit === Infinity
        ? '\u4E0D\u9650\u65F6 \u00B7 \u70B9\u4E00\u4E0B\u5F00\u59CB'
        : '\u9650\u65F6 ' + fmtSec(intervalRound.limit) + ' \u00B7 \u70B9\u4E00\u4E0B\u5F00\u59CB\u8BA1\u65F6';
    }
    applyIntervalWaitingUI(true);
    syncIntervalUI();
    renderIntervalFretboard();
  }

  function beginIntervalQuestion() {
    if (intervalRound.timer) { clearInterval(intervalRound.timer); intervalRound.timer = null; }
    const snap = intervalRound.snap || intervalSnapshot();
    intervalRound.waitStart = false;
    intervalRound.state = 'asking';
    intervalRound.startAt = nowMs();
    intervalRound.infinite = intervalRound.limit === Infinity;
    intervalRound.deadline = intervalRound.infinite
      ? Infinity
      : intervalRound.startAt + intervalRound.limit * 1000;

    const mask = $('#intervalStartMask');
    if (mask) mask.hidden = true;
    applyIntervalWaitingUI(false);

    /* \u51FA\u9898\u81EA\u52A8\u64AD\u653E\uFF1A\u53EA\u64AD\u8D77\u70B9\u97F3\uFF08\u00A710.2 / \u00A710.3 / \u00A710.4\uFF09 */
    if (snap.preview) playIntervalStartOnly('auto');

    tickIntervalTimer();
    intervalRound.timer = setInterval(tickIntervalTimer, 200);
    syncIntervalUI();
    renderIntervalFretboard();
  }

  function tickIntervalTimer() {
    if (intervalRound.state !== 'asking') return;
    if (intervalRound.infinite) {
      /* \u4E0D\u9650\u65F6\uFF1A\u5706\u73AF\u5E38\u4EAE\u3001\u53EA\u663E\u793A \u221E\uFF0C\u4E0D\u505A\u5012\u8BA1\u65F6\u4E5F\u4E0D\u518D\u5224\u8D85\u65F6 */
      const num = $('#intervalTimerNum');
      if (num) { num.classList.remove('idle'); num.textContent = '\u221E'; }
      const ring = $('#intervalRingFg');
      if (ring) {
        ring.style.strokeDashoffset = '0';
        ring.classList.remove('warn', 'danger', 'idle-ring');
      }
      return;
    }
    const left = Math.max(0, intervalRound.deadline - nowMs());
    const total = intervalRound.limit * 1000;
    const ratio = total > 0 ? left / total : 0;
    const el = $('#intervalTimerNum');
    if (el) {
      el.classList.remove('idle');
      el.textContent = String(Math.ceil(left / 1000));
    }
    const ring = $('#intervalRingFg');
    if (ring) {
      const C = 2 * Math.PI * 34;
      ring.style.strokeDashoffset = String(C * (1 - ratio));
      ring.classList.remove('idle-ring');
      ring.classList.toggle('warn', ratio <= 0.4 && ratio > 0.15);
      ring.classList.toggle('danger', ratio <= 0.15);
    }
    if (left <= 0) timeUpInterval();
  }

  function timeUpInterval() {
    if (intervalRound.state !== 'asking' || intervalRound.waitStart) return;
    submitInterval(true);
  }

  /* ---------- \u58F0\u97F3 ---------- */

  /* \u53EA\u64AD\u8D77\u70B9\u97F3\uFF1A\u73A9\u6CD5 A \u64AD A\uFF1B\u73A9\u6CD5 B \u64AD\u8D77\u70B9\uFF08\u00A710.2 / \u00A710.3\uFF09 */
  function playIntervalStartOnly(reason) {
    const snap = intervalRound.snap || intervalSnapshot();
    if (soundOf('interval').muted) return;
    if (reason === 'manual' && !snap.listenDuringAnswer) return;
    const cell = intervalRound.play === 'b' ? intervalRound.start : intervalRound.cellA;
    if (!cell) return;
    const midi = midiOf(cell.s, cell.f);
    ensureAudio().then(() => audio.play(midi, 0.8));
  }

  /* \u7B54\u540E\u64AD\u653E\u5B8C\u6574\u97F3\u7A0B\uFF1AA \u2192 B\uFF08\u6216 \u8D77\u70B9 \u2192 \u4E3B\u7B54\u6848\uFF09\uFF0C\u7B54\u5BF9\u7B54\u9519\u90FD\u64AD\uFF08D10/D21 \u56FA\u5B9A\u884C\u4E3A\uFF09 */
  function playIntervalReveal() {
    const snap = intervalRound.snap || intervalSnapshot();
    if (soundOf('interval').muted) return;

    let from = null;
    let to = null;
    if (intervalRound.play === 'a') {
      from = intervalRound.cellA;
      to = intervalRound.cellB;
    } else {
      from = intervalRound.start;
      const main = intervalRound.targets && intervalRound.targets.length ? intervalRound.targets[0] : null;
      to = main;
    }
    if (!from || !to) return;
    const m1 = midiOf(from.s, from.f);
    const m2 = midiOf(to.s, to.f);
    ensureAudio().then(() => {
      /* \u590D\u7528\u73B0\u6709\u548C\u5F26\u64AD\u653E\u5668\uFF1A\u5148\u8D77\u70B9\u3001\u540E\u76EE\u6807\uFF0C\u5F62\u6210\u6E05\u6670\u7684\u300C\u4E24\u4E2A\u97F3\u300D */
      audio.playChord([m1, m2], { strum: 'strum', msPerString: 450 });
    });
  }

  /* ---------- \u4F5C\u7B54 ---------- */

  /* \u73A9\u6CD5 A\uFF1A\u70B9\u9009\u9879\u5373\u5224\uFF08D6\uFF09 */
  function chooseIntervalOption(opt) {
    if (intervalRound.state !== 'asking' || intervalRound.waitStart) return;
    if (intervalRound.play !== 'a') return;
    if (intervalRound.submitted) return;
    intervalRound.chosen = opt;
    submitInterval(false);
  }

  /* \u73A9\u6CD5 B\uFF1A\u70B9\u6307\u677F\u53EA\u9009\u4E2D\uFF0C\u53EF\u6539\u9009\uFF1BEnter / \u63D0\u4EA4\u6309\u94AE\u624D\u5224\u5B9A\uFF08D6\uFF09 */
  function pickIntervalTarget(cell) {
    if (intervalRound.state !== 'asking' || intervalRound.waitStart) return;
    if (intervalRound.play !== 'b') return;
    if (intervalRound.submitted) return;
    if (!cell) return;
    const snap = intervalRound.snap || intervalSnapshot();

    const same = intervalRound.pick && sameCell(intervalRound.pick, cell);
    if (same) {
      intervalRound.pick = null;
    } else {
      intervalRound.pick = { s: cell.s, f: cell.f };
      /* \u70B9\u9009\u53D1\u58F0\uFF1A\u9ED8\u8BA4\u5173\uFF08D22\uFF09\uFF0C\u5F00\u542F\u540E\u4EC5\u9996\u6B21\u9009\u4E2D\u53D1\u58F0 */
      if (snap.clickSound && !soundOf('interval').muted) {
        const midi = midiOf(cell.s, cell.f);
        ensureAudio().then(() => audio.play(midi, 0.8));
      }
    }
    syncIntervalUI();
    renderIntervalFretboard();
  }

  function clearIntervalPick() {
    if (intervalRound.state !== 'asking' || intervalRound.waitStart) return;
    if (intervalRound.play !== 'b') return;
    if (intervalRound.submitted) return;
    intervalRound.pick = null;
    syncIntervalUI();
    renderIntervalFretboard();
  }

  /* \u7EDF\u4E00\u63D0\u4EA4\u5165\u53E3 */
  function submitInterval(timedOut) {
    if (intervalRound.state !== 'asking' || intervalRound.waitStart) return;
    if (intervalRound.submitted) return;

    const snap = intervalRound.snap || intervalSnapshot();
    const T = snap.theory || intervalTheory();
    const q = intervalRound.current;
    if (!q || !T) return;

    let ok = false;
    let error = null;
    let detail = null;

    if (intervalRound.play === 'a') {
      if (!intervalRound.chosen && !timedOut) return;   // \u8FD8\u6CA1\u9009\uFF0C\u4E0D\u5224
      const verdict = T.judgeA(intervalRound.chosen, intervalRound.correct);
      ok = verdict.ok;
      error = timedOut && !intervalRound.chosen ? 'timeout' : verdict.error;
    } else {
      if (!intervalRound.pick && !timedOut) return;
      if (!intervalRound.pick) {
        ok = false;
        error = 'timeout';
      } else {
        const verdict = T.judgeB(intervalRound.pick, intervalRound.targets, intervalRound.start, {
          intervalId: q.intervalId, dir: q.dir, mode: q.mode,
        });
        ok = verdict.ok;
        error = verdict.error;
        detail = verdict.actual || null;
      }
    }

    intervalRound.submitted = true;
    intervalRound.state = 'answered';
    intervalRound.answeredAt = nowMs();
    intervalRound.lastOk = ok;
    if (intervalRound.timer) { clearInterval(intervalRound.timer); intervalRound.timer = null; }

    const responseMs = intervalRound.infinite ? null
      : Math.round(clamp(nowMs() - intervalRound.startAt, 0, intervalRound.limit * 1000));

    /* \u5361\u7247\u66F4\u65B0\uFF08D38\uFF1A\u53EA\u6709\u5361\u7247\u53C2\u4E0E\u81EA\u9002\u5E94\uFF09 */
    updateIntervalCard(q, ok, responseMs, timedOut);

    intervalRound.verdict = { ok: ok, error: error, actual: detail, timedOut: !!timedOut };

    if (ok) {
      intervalRound.streak++;
      intervalRound.bestStreak = Math.max(intervalRound.bestStreak, intervalRound.streak);
    } else {
      intervalRound.streak = 0;
    }

    intervalRound.results.push({
      play: intervalRound.play,
      interval: q.intervalId,
      dir: q.dir,
      mode: q.mode,
      shape: q.shape || null,
      ok: ok,
      error: error,
      ms: responseMs,
      timedOut: !!timedOut,
      t: nowMs(),
      cellA: intervalRound.play === 'a' ? { s: intervalRound.cellA.s, f: intervalRound.cellA.f } : null,
      cellB: intervalRound.play === 'a' ? { s: intervalRound.cellB.s, f: intervalRound.cellB.f } : null,
      start: intervalRound.play === 'b' ? { s: intervalRound.start.s, f: intervalRound.start.f } : null,
      pick: intervalRound.pick ? { s: intervalRound.pick.s, f: intervalRound.pick.f } : null,
      chosen: intervalRound.chosen ? { id: intervalRound.chosen.id, dir: intervalRound.chosen.dir } : null,
    });

    pushIntervalHistory();
    if (intervalRound.snapshot && q.cardKey) intervalRound.snapshot.done.add(q.cardKey);
    renderIntervalFeedback();
    renderIntervalOptions();
    syncIntervalUI();
    renderIntervalFretboard();
    renderSidebar();

    /* \u7B54\u540E\u64AD\u653E\u5B8C\u6574\u97F3\u7A0B\uFF08\u7B54\u5BF9\u7B54\u9519\u90FD\u64AD\uFF09 */
    playIntervalReveal();

    /* \u81EA\u52A8\u8FDB\u5165\u4E0B\u4E00\u9898 */
    if (ok && snap.autoNextOnCorrect) {
      intervalRound.pendingNext = setTimeout(() => {
        intervalRound.pendingNext = null;
        if (intervalRound.state === 'answered') advanceInterval();
      }, 900);
    }
  }

  /* \u5361\u7247\u66F4\u65B0\uFF1A\u4E0E\u73B0\u6709 resolveAnswer \u7684 SRS \u903B\u8F91\u540C\u6784\uFF0C\u4F46\u5199 intervalCards */
  function updateIntervalCard(q, ok, responseMs, timedOut) {
    const key = q.cardKey;
    if (!key) return;
    const card = getIntervalCard(key);
    const snap = intervalRound.snap || intervalSnapshot();
    const totalMs = intervalRound.infinite ? Infinity : intervalRound.limit * 1000;
    card.last = nowMs();

    let intervalMin;
    if (ok) {
      card.a++;
      card.cn++;
      const fast = responseMs !== null && responseMs < totalMs * 0.45;
      const jump = (card.a >= 3 && card.e === 0 && card.a % 2 === 1) ? 2 : 1;
      card.lvl = clamp((card.lvl || 0) + jump, 1, SRS_INTERVALS.length);
      if (card.lvl === 1 && card.a >= 2) {
        card.lvl = clamp((card.best || 1) - 1, 1, SRS_INTERVALS.length);
      }
      intervalMin = SRS_INTERVALS[card.lvl - 1] * (fast ? 1.1 : 1);
      card.best = Math.max(card.best || 0, card.lvl);
    } else {
      card.e++;
      card.cn = 0;
      card.lvl = (card.lvl || 0) >= 4 ? card.lvl - 1 : 0;
      intervalMin = card.lvl >= 4 ? SRS_INTERVALS[card.lvl - 1] : SRS_INTERVALS[0];
      if (timedOut) intervalMin = Math.min(intervalMin, 3);
    }
    card.due = nowMs() + intervalMin * 60000;
    card.recent = Array.isArray(card.recent) ? card.recent.slice(-(RECENT_WINDOW - 1)) : [];
    card.recent.push(!!ok);
    pushHist(card, !!ok);
    /* \u56FE2 / \u56FE1 \u7684\u5199\u5165\u70B9\uFF08\u97F3\u7A0B\u6A21\u5F0F\uFF09\uFF1A\u4E00\u6B21\u5224\u5B9A\u53EA +1 */
    bumpModeStats('interval', !!ok);
  }

  /* \u5199\u97F3\u7A0B\u5386\u53F2\uFF08\u72EC\u7ACB\u547D\u540D\u7A7A\u95F4\uFF0C\u53EA\u7528\u4E8E\u5C55\u793A\uFF0CD38/D40\uFF09 */
  function pushIntervalHistory() {
    const q = intervalRound.current;
    if (!q) return;
    const v = intervalRound.verdict || {};
    const rec = {
      play: intervalRound.play,
      interval: q.intervalId,
      dir: q.dir,
      mode: q.mode,
      shape: q.shape || null,
      ok: intervalRound.lastOk === null ? null : !!intervalRound.lastOk,
      error: v.error || null,
      ms: intervalRound.infinite ? null : Math.max(0, Math.round(nowMs() - intervalRound.startAt)),
      timedOut: !!v.timedOut,
      t: nowMs(),
      cellA: intervalRound.play === 'a' && intervalRound.cellA ? [intervalRound.cellA.s, intervalRound.cellA.f] : null,
      cellB: intervalRound.play === 'a' && intervalRound.cellB ? [intervalRound.cellB.s, intervalRound.cellB.f] : null,
      start: intervalRound.play === 'b' && intervalRound.start ? [intervalRound.start.s, intervalRound.start.f] : null,
      pick: intervalRound.pick ? [intervalRound.pick.s, intervalRound.pick.f] : null,
      chosen: intervalRound.chosen ? [intervalRound.chosen.id, intervalRound.chosen.dir] : null,
    };
    store.intervalHistory.push(rec);
    if (store.intervalHistory.length > INTERVAL_HISTORY_LIMIT) {
      store.intervalHistory = store.intervalHistory.slice(-INTERVAL_HISTORY_LIMIT);
    }
    save();
  }

  /* \u4E0B\u4E00\u9898 / \u65B0\u4E00\u8F6E */
  function advanceInterval() {
    if (intervalRound.state === 'answered') {
      intervalRound.idx++;
      /* \u300C\u70B9\u4E0B\u4E00\u9898\u81EA\u52A8\u5F00\u59CB\u300D\uFF1A\u53EA\u5BF9\u300C\u624B\u52A8\u5F00\u59CB\u300D\u7684\u4EBA\u6709\u610F\u4E49 \u2014\u2014
         \u81EA\u52A8\u5F00\u59CB\u6A21\u5F0F\u4E0B waitStart \u672C\u6765\u5C31\u662F false\uFF0C\u4F20\u4EC0\u4E48\u503C\u90FD\u4E0D\u5F71\u54CD\u3002
         \u4EE5\u524D\u8FD9\u91CC\u5199\u6B7B false\uFF0C\u7B49\u4E8E\u624B\u52A8\u6A21\u5F0F\u4E0B\u70B9\u4E0B\u4E00\u9898\u6C38\u8FDC\u505C\u5728\u906E\u7F69\u4E0A\u3002 */
      nextIntervalQuestion(store.settings.intervalAutoStartNext !== false);
      return;
    }
    if (intervalRound.state === 'idle') {
      startIntervalRound();
    }
  }

  function finishIntervalRound() {
    intervalRound.state = 'idle';
    intervalRound.current = null;
    intervalRound.waitStart = false;
    if (intervalRound.timer) { clearInterval(intervalRound.timer); intervalRound.timer = null; }
    if (intervalRound.pendingNext) { clearTimeout(intervalRound.pendingNext); intervalRound.pendingNext = null; }
    audio.stopChord();

    const n = intervalRound.results.length;
    const right = intervalRound.results.filter((r) => r.ok).length;
    const title = $('#intervalTitle');
    if (title) title.textContent = '\u672C\u8F6E\u5B8C\u6210 \uD83C\uDF89';
    const sub = $('#intervalSub');
    if (sub) sub.textContent = '\u672C\u8F6E ' + n + ' \u9898\uFF0C\u7B54\u5BF9 ' + right
      + (n ? '\uFF0C\u6B63\u786E\u7387 ' + Math.round((right / n) * 100) + '%' : '');
    const fb = $('#intervalFeedback');
    if (fb) {
      fb.className = 'feedback interval-feedback info';
      fb.textContent = '\u672C\u8F6E\u7ED3\u675F\u3002\u6309 Enter \u6216\u70B9\u300C\u5F00\u59CB\u65B0\u4E00\u8F6E\u300D\u7EE7\u7EED\u3002';
    }
    const mask = $('#intervalStartMask');
    if (mask) mask.hidden = true;
    intervalRound.cellA = null;
    intervalRound.cellB = null;
    intervalRound.start = null;
    intervalRound.targets = [];
    intervalRound.pick = null;
    intervalRound.options = [];
    renderIntervalOptions();
    syncIntervalUI();
    renderIntervalFretboard();
    /* \u56FE3 \u4FDD\u7559\u521A\u7ED3\u675F\u90A3\u4E00\u8F6E\u7684\u5FEB\u7167\uFF08D33\uFF09\uFF0C\u56FE1/\u56FE4 \u8F6C\u7A7A\u6001\uFF08D38\uFF09 */
    renderSidebar();
  }

  function intervalAdvanceNow() {
    advanceInterval();
  }

  /** \u540C\u6B65\u627E\u4F4D\u7F6E\u6A21\u5F0F\u7684\u754C\u9762\uFF08\u9898\u5361\u3001\u6309\u94AE\u3001\u65F6\u95F4\uFF09 */
  function syncPosUI() {
    const q = round.current;
    const asking = round.state === 'asking';
    const playA = posPlayA();
    if (!q || round.state === 'idle') {
      /* \u73A9\u6CD5 B \u4E00\u9898\u5373\u4E00\u56DE\u5408\uFF0C\u6C38\u8FDC\u4E0D\u51FA\u73B0\u300C\u672C\u8F6E\u5B8C\u6210\u300D\uFF1B\u53EA\u6709 A \u4F1A\u8D70\u5230 idle + \u6709\u6210\u7EE9 */
      const done = round.state === 'idle' && round.results && round.results.length && playA;
      $('#posNote').textContent = done ? '\u672C\u8F6E\u5B8C\u6210 \uD83C\uDF89' : '\u2014';
      $('#posSub').textContent = done ? '\u6309 Enter \u6216\u70B9\u300C\u5F00\u59CB\u65B0\u4E00\u8F6E\u300D\u7EE7\u7EED' : '\u70B9\u51FB\u6307\u677F\u4E0A\u6240\u6709\u6B63\u786E\u7684\u683C\u5B50';
    } else {
      const pc = pcOf(midiOf(q.s, q.f));
      const name = noteNameFor(pc, q.spelling);
      const n = targetPositions(q).length;
      $('#posNote').textContent = name;
      /* \u672A\u5F00\u59CB\u65F6\u4E0D\u80FD\u62A5\u51FA\u7B54\u6848\u6570\u91CF\uFF0C\u5426\u5219\u7B49\u4E8E\u7ED9\u4E86\u63D0\u793A\uFF1B\u5F00\u59CB\u540E\u624D\u663E\u793A\u300C\u5171 N \u4E2A\u300D\u3002
         A\uFF1A\u9898\u76EE\u672C\u8EAB\u5DF2\u7ECF\u6307\u660E\u4E86\u5F26\uFF0C\u526F\u6807\u9898\u5C31\u628A\u300C\u54EA\u6839\u5F26\u7684\u54EA\u4E2A\u97F3\u300D\u5199\u5168\uFF1B
         B\uFF1A\u9898\u76EE\u662F\u300C\u67D0\u4E2A\u97F3\u300D\uFF0C\u526F\u6807\u9898\u8BF4\u660E\u5B83\u5728\u591A\u5C11\u54C1\u4EE5\u5185\u3001\u4E00\u5171\u51E0\u4E2A\u4F4D\u7F6E\u3002 */
      const scope = playA
        ? '\u627E\u51FA\u7B2C ' + q.s + ' \u5F26\u4E0A\u7684\u5168\u90E8 ' + name
        : '\u627E\u51FA\u5B83\u5728 ' + rangeFretMax() + ' \u54C1\u4EE5\u5185\u7684\u5168\u90E8 ' + n + ' \u4E2A\u4F4D\u7F6E';
      $('#posSub').textContent = round.waitStart
        ? (playA ? '\u7B2C ' + q.s + ' \u5F26 \u00B7 \u70B9\u4E0B\u65B9\u300C\u5F00\u59CB\u300D\u540E\u8BA1\u65F6\u5E76\u51FA\u58F0' : '\u70B9\u4E0B\u65B9\u300C\u5F00\u59CB\u300D\u540E\u8BA1\u65F6\u5E76\u51FA\u58F0')
        : asking
          ? (playA ? scope + '\uFF08\u5171 ' + n + ' \u4E2A\u4F4D\u7F6E\uFF09' : scope)
          : '\u7B54\u6848\u5DF2\u63ED\u6653\uFF1A\u7EFF\u8272 = \u5168\u90E8\u6B63\u786E\u4F4D\u7F6E\uFF0C\u9EC4\u8272 = \u6F0F\u9009\uFF0C\u7EA2\u8272 = \u591A\u9009';
    }
    // \u5DF2\u9009\u5217\u8868
    const list = $('#posPickedList');
    if (list) {
      if (!pos.picks.length) {
        list.innerHTML = '<span class="pos-picked-empty">\u8FD8\u6CA1\u9009</span>';
      } else {
        list.innerHTML = pos.picks.map((p) => '<span class="pos-chip">' + p.s + '\u5F26 ' + p.f + '\u54C1</span>').join('');
      }
    }
    const cnt = $('#posPickedCount');
    if (cnt) cnt.textContent = String(pos.picks.length);
    const submit = $('#posSubmit');
    if (submit) {
      submit.disabled = !asking || !pos.picks.length;
      submit.classList.toggle('ready', asking && pos.picks.length > 0);
    }
    const mask = $('#posStartMask');
    if (mask) mask.hidden = !round.waitStart;
    const clear = $('#posClear');
    if (clear) clear.disabled = !asking || round.waitStart;
    $('#posCombo').textContent = '\u8FDE\u5BF9 ' + round.streak;
    /* \u73A9\u6CD5\u5207\u6362\u6309\u94AE\u7684\u9AD8\u4EAE\uFF1A\u4E0E\u97F3\u7A0B\u6A21\u5F0F\u540C\u4E00\u5957\uFF08.seg-btn.active\uFF09 */
    document.querySelectorAll('#posPlaySeg .seg-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.play === (playA ? 'a' : 'b'));
    });
  }

  /** \u8BBE\u7F6E\u9762\u677F\u91CC\u7684\u627E\u4F4D\u7F6E\u73A9\u6CD5\u5355\u9009 + \u4F9D\u8D56\u73A9\u6CD5\u7684\u8BBE\u7F6E\u9879\u663E\u9690 */
  function syncPosSettingsUI() {
    const s = store.settings;
    const want = s.posPlay === 'a' ? 'a' : 'b';
    document.querySelectorAll('#posPlayChips input[name="posPlay"]').forEach((inp) => {
      inp.checked = inp.value === want;
    });
    /* \u540C\u6B65\u5934\u90E8\u6309\u94AE\uFF08\u53EF\u80FD\u5728\u8BBE\u7F6E\u91CC\u6539\u7684\uFF09 */
    document.querySelectorAll('#posPlaySeg .seg-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.play === want);
    });
    applySettingsScope();
  }

  /* ---------------------------------------------------------------
   *  \u4F5C\u7B54\u4E0E\u5224\u5206
   * --------------------------------------------------------------- */
  function resolveAnswer(choicePc, timedOut, opts) {
    if (round.state !== 'asking' || !round.current) return;
    if (round.waitStart) return;   // \u8FD8\u6CA1\u70B9\u201C\u5F00\u59CB\u8BA1\u65F6\u201D\uFF0C\u5148\u4E0D\u8BA1\u65F6\u4E5F\u4E0D\u5224\u5206
    const posMode = !!(opts && opts.fromPos);
    round.state = 'answered';
    round.answeredAt = nowMs();
    if (round.timer) { clearInterval(round.timer); round.timer = null; }

    const q = round.current;
    const correctPc = pcOf(midiOf(q.s, q.f));
    /* \u8D85\u65F6\u4E5F\u63ED\u6653\u7B54\u6848\uFF08Q41\uFF09\uFF1A\u8D85\u65F6\u8DEF\u5F84\u6CA1\u6709\u7ECF\u8FC7 submitPositions\uFF0Cpos.last \u8FD8\u662F\u7A7A\uFF0C
       \u6307\u677F\u4F1A\u4E00\u4E2A\u6807\u8BB0\u90FD\u4E0D\u753B\uFF0C\u7528\u6237\u53EA\u80FD\u770B\u53CD\u9988\u6761\u7684\u6587\u5B57\u3002\u8FD9\u91CC\u8865\u4E00\u4EFD\u300C\u5168\u6F0F\u300D\u7ED3\u679C\uFF0C
       \u8BA9\u6307\u677F\u7167\u5E38\u753B\u51FA\u5168\u90E8\u9EC4\u8272\u76EE\u6807\u683C\u3002 */
    if (posMode && !pos.last) {
      const tg = targetPositions(q);
      pos.last = { targets: tg, picks: [], missed: tg.slice(), extra: [], ok: false, timedOut: true };
    }
    const isCorrect = choicePc !== null && choicePc === correctPc;
    /* \u8BB0\u4E0B\u300C\u7528\u6237\u9009\u4E86\u4EC0\u4E48\u300D\u548C\u300C\u5BF9\u9519\u300D\uFF0C\u4F9B\u6307\u677F\u753B\u7B54\u9519\u6807\u8BB0\u7528\uFF08\u89C1 drawFretboardSvg\uFF09\u3002
       \u627E\u4F4D\u7F6E\u6A21\u5F0F\u4E0D\u5199\u8FD9\u4E24\u4E2A\u5B57\u6BB5\uFF1A\u5B83\u7528 pos.last \u91CC\u7684\u547D\u4E2D/\u6F0F\u9009/\u591A\u9009\u6765\u8868\u8FBE\u3002 */
    if (!posMode) {
      round.chosenPc = choicePc;
      round.lastOk = isCorrect;
    }
    const totalMs = round.infinite ? Infinity : round.limit * 1000;
    const elapsed = round.startAt ? nowMs() - round.startAt : totalMs;
    // \u4E0D\u9650\u65F6\u9898\u76EE\u6CA1\u6709\u201C\u7528\u65F6\u6BD4\u4F8B\u201D\uFF0C\u4E5F\u4E0D\u8BA1\u5165\u5E73\u5747\u7528\u65F6\uFF08\u907F\u514D\u7EDF\u8BA1\u91CC\u51FA\u73B0 Infinity/0 \u79D2\uFF09
    const responseMs = round.infinite ? null : Math.round(clamp(elapsed, 0, totalMs));

    // \u2014\u2014 \u9057\u5FD8\u66F2\u7EBF\uFF08SRS\uFF09\u66F4\u65B0 \u2014\u2014
    /* \u627E\u4F4D\u7F6E\u6A21\u5F0F\u7684 q.key \u662F\u300C\u5019\u9009\u5355\u4F4D\u952E\u300D\uFF08A = \u5F26+\u97F3\u540D\uFF0CB = \u97F3\u540D\uFF09\uFF0C\u4E0D\u662F\u683C\u5B50\u952E\uFF1B
       \u5F80 store.cards \u91CC\u5199\u4F1A\u9020\u51FA\u4E00\u5806\u6CA1\u4EBA\u8BFB\u7684\u5047\u5361\u3002\u5B83\u771F\u6B63\u7684\u590D\u4E60\u6570\u636E\u5728\u4E0B\u9762\u7684
       posMode \u5206\u652F\u91CC\u6309 cells \u9010\u683C\u5199\uFF08\u4EE3\u8868\u683C\u4E5F\u5728\u91CC\u9762\uFF09\uFF0C\u6240\u4EE5\u8FD9\u91CC\u5BF9 pos \u53EA\u8BFB\u4E0D\u5199\uFF0C
       \u907F\u514D\u540C\u4E00\u4E2A\u683C\u5B50\u5728\u4E00\u6B21\u4F5C\u7B54\u91CC\u88AB\u8BB0\u4E24\u904D\u3002 */
    const card = posMode ? getPosCard(posKey(q.s, q.f)) : getCard(q.key);
    let intervalMin;
    if (posMode) {
      intervalMin = SRS_INTERVALS[clamp(card.lvl || 1, 1, SRS_INTERVALS.length) - 1];
      if (isCorrect) {
        round.streak++;
        round.bestStreak = Math.max(round.bestStreak, round.streak);
      } else {
        round.streak = 0;
      }
    } else {
      card.s = q.s;
      card.f = q.f;
      card.last = nowMs();
      if (isCorrect) {
        card.a++;
        card.cn++;
        const fast = !round.infinite && responseMs !== null && responseMs < totalMs * 0.45;
        const jump = (card.a >= 3 && card.e === 0 && card.a % 2 === 1) ? 2 : 1;
        card.lvl = clamp(card.lvl + jump, 1, SRS_INTERVALS.length);
        // \u8FDB\u9636\u6D4B\u8BD5\uFF1A\u9519\u8FC7\u540E\u91CD\u65B0\u7B54\u5BF9\uFF0C\u53EF\u6309\u539F\u7EA7\u522B\u5FEB\u901F\u6062\u590D\uFF08\u6700\u591A 3 \u7EA7\uFF09\uFF0C\u800C\u4E0D\u662F\u4ECE 2 \u5206\u949F\u91CD\u65B0\u71AC\u4E00\u904D
        if (card.lvl === 1 && card.a >= 2 && isCorrect) {
          card.lvl = clamp((card.best || 1) - 1, 1, SRS_INTERVALS.length);
        }
        intervalMin = SRS_INTERVALS[card.lvl - 1] * (fast ? 1.1 : 1);
        card.best = Math.max(card.best || 0, card.lvl);
        round.streak++;
        round.bestStreak = Math.max(round.bestStreak, round.streak);
      } else {
        card.e++;
        card.cn = 0;
        // \u539F\u672C\u8F83\u7A33\u56FA\uFF08>= 4 \u7EA7\uFF09\u53EA\u56DE\u9000\u4E00\u7EA7\uFF0C\u5426\u5219\u9000\u56DE\u201C\u91CD\u5B66\u4E2D\u201D
        card.lvl = card.lvl >= 4 ? card.lvl - 1 : 0;
        intervalMin = card.lvl >= 4 ? SRS_INTERVALS[card.lvl - 1] : SRS_INTERVALS[0];
        if (timedOut) intervalMin = Math.min(intervalMin, 3);
        round.streak = 0;
      }
      card.due = nowMs() + intervalMin * 60000;
      card.recent = Array.isArray(card.recent) ? card.recent.slice(-(RECENT_WINDOW - 1)) : [];
      card.recent.push(!!isCorrect);
      pushHist(card, !!isCorrect);
      /* \u56FE2 / \u56FE1 \u7684\u5199\u5165\u70B9\uFF08\u97F3\u540D\u6A21\u5F0F\uFF09 */
      bumpModeStats('note', !!isCorrect);
    }

    /* \u7B54\u9519\u4E0D\u5728\u672C\u8F6E\u5185\u63D2\u9898\u3002\u4E00\u56DE\u5408 = \u4E00\u8F6E\uFF0C\u672C\u8F6E\u51FA\u4EC0\u4E48\u9898\u76EE\u5728\u5F00\u8F6E\u90A3\u4E00\u523B\u5C31\u5B9A\u6B7B\u4E86
       \uFF08round.queue \u53EA\u8BFB\uFF09\uFF0C\u4E2D\u9014\u5F80\u91CC splice \u4F1A\u8BA9\u300C\u603B\u9898\u91CF\u300D\u4E0D\u65AD\u53D8\u957F\u3001\u540C\u4E00\u4F4D\u7F6E\u7684
       \u51FA\u73B0\u6B21\u6570\u4E5F\u4E0D\u53D7\u63A7\u3002\u7B54\u9519\u53EA\u5199 SRS\uFF1Adue \u63A8\u540E 2 \u5206\u949F\u5E76\u62AC\u9AD8\u540E\u7EED\u6743\u91CD\uFF0C
       \u4E8E\u662F\u5B83\u5728**\u4E4B\u540E\u7684\u56DE\u5408**\u91CC\u66F4\u65E9\u3001\u66F4\u9891\u7E41\u5730\u56DE\u6765\u3002 */

    const result = {
      pos: posMode ? (posPlayA() ? q.s + '\u5F26 ' + noteNameFor(correctPc, q.spelling) : noteNameFor(correctPc, q.spelling)) : (q.s + '\u5F26 ' + q.f + '\u54C1'),
      s: q.s, f: q.f,
      playA: posMode ? posPlayA() : undefined,
      correct: isCorrect,
      timedOut: !!timedOut,
      fromPos: posMode,
      // \u627E\u4F4D\u7F6E\u6A21\u5F0F\u7684\u53EF\u7EDF\u8BA1\u5B57\u6BB5\uFF1A\u76EE\u6807\u6570 / \u9009\u5BF9\u6570 / \u6F0F\u9009\u6570 / \u591A\u9009\u6570 / \u9009\u4E86\u51E0\u4E2A
      posTotal: posMode && pos.last ? pos.last.targets.length : undefined,
      posHit: posMode && pos.last ? pos.last.targets.length - pos.last.missed.length : undefined,
      posMissed: posMode && pos.last ? pos.last.missed.length : undefined,
      posExtra: posMode && pos.last ? pos.last.extra.length : undefined,
      posPicked: posMode && pos.last ? pos.last.picks.length : undefined,
      chosen: posMode
        ? (pos.last ? '\u9009 ' + pos.picks.length + ' \u4E2A\u4F4D\u7F6E' : '\u672A\u4F5C\u7B54')
        : (choicePc === null ? '\u8D85\u65F6' : noteName(choicePc)),
      answer: noteNameFor(correctPc, q.spelling),
      t: nowMs(), ms: responseMs, lvl: card.lvl, interval: intervalMin,
    };
    round.results.push(result);

    /* \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1A\u540C\u4E00\u4E2A\u97F3\u7684\u201C\u5168\u90E8\u4F4D\u7F6E\u201D\u90FD\u8981\u8BB0\u8D26 \u2014\u2014
       \u5426\u5219\u590D\u4E60\u65F6\u53EA\u4F1A\u62BD\u5230\u9898\u76EE\u90A3\u4E00\u4E2A\u4F4D\u7F6E\uFF08\u5982 4 \u5F26\u7A7A\u5F26\uFF09\uFF0C\u53E6\u4E00\u5904\uFF084 \u5F26 12 \u54C1\uFF09\u6C38\u8FDC\u4E0D\u4F1A\u51FA\u73B0\u3002
       \u9996\u9875\u300C\u5355\u97F3\u5DF2\u7B54 N \u9053\u300D\u7684\u8BA1\u6570\u53E3\u5F84\uFF1A
         A\uFF08\u5355\u5F26\uFF09\uFF1A\u4E00\u9898\u53EA\u8003\u4E00\u6839\u5F26\u4E0A\u7684\u4E00\u4E2A\u97F3\u540D\uFF0C\u8BB0 1 \u6761\uFF1B
         B\uFF08\u5168\u6307\u677F\uFF09\uFF1A\u4E00\u9898\u771F\u7684\u626B\u4E86 6\u20137 \u4E2A\u683C\u5B50\uFF0C\u6BCF\u4E2A\u76EE\u6807\u683C\u8BB0 1 \u6761\u3002 */
    if (posMode && pos.last) {
      const now = nowMs();
      const touch = (cell, ok) => {
        const c = getPosCard(posKey(cell.s, cell.f));
        c.s = cell.s; c.f = cell.f; c.last = now;
        if (ok) {
          c.a++;
          c.lvl = clamp((c.lvl || 0) + 1, 1, SRS_INTERVALS.length);
          c.best = Math.max(c.best || 0, c.lvl);
          c.due = now + SRS_INTERVALS[c.lvl - 1] * 60000;
        } else {
          c.e++; c.cn = 0; c.lvl = c.lvl >= 4 ? c.lvl - 1 : 0;
          c.due = now + SRS_INTERVALS[0] * 60000;
        }
        c.recent = Array.isArray(c.recent) ? c.recent.slice(-(RECENT_WINDOW - 1)) : [];
        c.recent.push(!!ok);
        pushHist(c, !!ok);
      };
      const playA = posPlayA();
      // \u6BCF\u4E2A\u76EE\u6807\u4F4D\u7F6E\uFF1A\u6F0F\u9009\u8BB0\u9519\uFF0C\u9009\u4E2D\u8BB0\u5BF9
      pos.last.targets.forEach((t, i) => {
        const hit = !pos.last.missed.some((m) => sameCell(m, t));
        touch(t, hit);
        // A \u53EA\u8BB0\u7B2C\u4E00\u683C\uFF08\u5373\u4EE3\u8868\u683C\uFF09\u4E00\u6761\uFF1BB \u6BCF\u4E2A\u76EE\u6807\u683C\u5404\u8BB0\u4E00\u6761
        if (!playA || i === 0) {
          store.history.push({ s: t.s, f: t.f, ok: hit, t: now, ms: responseMs, lvl: getPosCard(posKey(t.s, t.f)).lvl, m: 'pos' });
        }
      });
      // \u591A\u9009\u7684\u975E\u76EE\u6807\u4F4D\u7F6E\uFF1A\u8BB0\u9519\uFF08\u4E0D\u8BA1\u5165\u300C\u7B54\u4E86\u51E0\u9053\u300D\uFF0C\u53EA\u8FDB SRS\uFF09
      pos.last.extra.forEach((e) => { touch(e, false); });
      if (store.history.length > 300) store.history = store.history.slice(-300);

      /* \u2014\u2014 \u4FA7\u680F\u5199\u5165\uFF08D51 / D62 / D63\uFF09 \u2014\u2014
         A\uFF1A\u56FE2 \u6309\u9898\u7D2F\u8BA1\uFF08modeStats.pos\uFF09\uFF0C\u56FE1 \u8BFB\u5355\u4F4D\u7EDF\u8BA1\uFF1B
         B\uFF1A\u56FE2 \u662F\u300C\u672C\u9898\u6210\u7EE9\u300D\uFF0C\u53EA\u5199 posBStats.last\uFF0C\u7EDD\u4E0D\u5199 modeStats.pos\u3002 */
      const hitCount = pos.last.targets.length - pos.last.missed.length;
      const missCount = pos.last.missed.length + pos.last.extra.length;
      bumpPosUnit(q.key, isCorrect);
      if (playA) {
        bumpModeStats('pos', isCorrect);
      } else {
        const bst = store.posBStats;
        bst.done = (bst.done || 0) + 1;
        if (isCorrect) bst.full = (bst.full || 0) + 1;
        if (isCorrect) {
          bst.streak = (bst.streak || 0) + 1;
          bst.bestCombo = Math.max(bst.bestCombo || 0, bst.streak);
        } else {
          bst.streak = 0;
        }
        bst.last = {
          right: hitCount,
          wrong: missCount,
          ok: isCorrect,
          cells: pos.last.targets.map((t) => ({
            s: t.s, f: t.f, ok: !pos.last.missed.some((m) => sameCell(m, t)),
          })),
        };
      }
    } else {
      store.history.push({ s: q.s, f: q.f, ok: isCorrect, t: result.t, ms: responseMs, lvl: card.lvl, m: 'note' });
      if (store.history.length > 300) store.history = store.history.slice(-300);
    }

    round.queue[round.idx] = Object.assign({}, q, { card: card });
    round.lastKey = q.key;
    if (round.snapshot && q.key) round.snapshot.done.add(q.key);
    save();

    // \u2014\u2014 UI \u2014\u2014
    const ansText = noteNameFor(correctPc, q.spelling);
    markOptions(choicePc, correctPc);
    renderFretboard();
    if (store.settings.mode === 'pos') {
      /* \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1A\u53CD\u9988\u5199\u5728\u81EA\u5DF1\u72EC\u7ACB\u7684\u53CD\u9988\u6761\u4E0A\uFF0C\u5E76\u7ED9\u201C\u4E0B\u4E00\u9898\u201D\u4E00\u4E2A\u72EC\u7ACB\u6309\u94AE */
      const pf = $('#posFeedback');
      const last = pos.last || { targets: targetPositions(q), picks: [], missed: targetPositions(q), extra: [] };
      const total = last.targets.length;
      const got = total - last.missed.length;
      if (isCorrect) {
        pf.className = 'feedback pos-feedback ok';
        pf.textContent = '\u2714 \u5168\u90E8\u627E\u5BF9\uFF01' + ansText + ' \u5171 ' + total + ' \u4E2A\u4F4D\u7F6E \u00B7 ' + fmtInterval(intervalMin) + '\u540E\u590D\u4E60';
      } else {
        pf.className = 'feedback pos-feedback bad';
        const parts = [];
        if (timedOut) parts.push('\u23F0 \u65F6\u95F4\u5230\uFF01');
        else parts.push('\u2718 \u6CA1\u627E\u5168\u3002');
        parts.push('\u6B63\u786E ' + total + ' \u4E2A\uFF0C\u9009\u5BF9 ' + got + ' \u4E2A');
        if (last.missed.length) parts.push('\u6F0F ' + last.missed.length + ' \u4E2A\uFF08\u9EC4\u8272\uFF09');
        if (last.extra.length) parts.push('\u591A\u9009 ' + last.extra.length + ' \u4E2A\uFF08\u7EA2\u8272\uFF09');
        pf.textContent = parts.join(' \u00B7 ');
      }
      $('#posNext').hidden = false;
      $('#posNext').textContent = !isCorrect && posPauseOnWrong() ? '\u770B\u61C2\u4E86\uFF0C\u4E0B\u4E00\u9898 \u203A' : '\u4E0B\u4E00\u9898 \u203A';
      syncPosUI();
    } else {
      const fb = $('#feedback');
      if (isCorrect) {
        fb.className = 'feedback ok';
        fb.textContent = '\u2714 \u6B63\u786E\uFF01' + q.s + ' \u5F26 ' + q.f + ' \u54C1 = ' + ansText + ' \u00B7 ' + fmtInterval(intervalMin) + '\u540E\u590D\u4E60';
      } else {
        fb.className = 'feedback bad';
        fb.textContent = timedOut
          ? '\u23F0 \u65F6\u95F4\u5230\uFF01' + q.s + ' \u5F26 ' + q.f + ' \u54C1 = ' + ansText
          : '\u2718 \u7B54\u9519\u4E86\uFF0C\u6B63\u786E\u7B54\u6848\u662F ' + ansText + '\uFF08' + q.s + ' \u5F26 ' + q.f + ' \u54C1\uFF09\u00B7 \u4E4B\u540E\u7684\u56DE\u5408\u4F1A\u66F4\u5E38\u51FA\u73B0';
      }
    }
    // \u7B54\u9519\u540E\u5148\u505C\u4F4F\uFF1A\u7528\u6237\u53EF\u4EE5\u53CD\u590D\u70B9\u300C\u518D\u542C\u4E00\u6B21\u300D\uFF0C\u786E\u8BA4\u6B63\u786E\u97F3\u540E\u518D\u9760 Enter / \u70B9\u6309\u94AE\u8FDB\u5165\u4E0B\u4E00\u9898
    const pauseOnWrong = !isCorrect && (posMode ? posPauseOnWrong() : store.settings.pauseOnWrong);
    setNextCard(pauseOnWrong ? '\u5DF2\u542C\u61C2\u4E86\uFF0C\u4E0B\u4E00\u9898 \u203A' : '\u4E0B\u4E00\u9898 \u203A',
      pauseOnWrong ? '\u5EFA\u8BAE\u5148\u6309\u7A7A\u683C\u91CD\u542C\u6B63\u786E\u7684\u58F0\u97F3' : 'Enter \u7ACB\u5373\u8FDB\u5165', true);
    renderSidebar();

    // \u518D\u542C\u4E00\u6B21\u6B63\u786E\u97F3\uFF08\u8F83\u8F7B\uFF09\uFF0C\u52A0\u6DF1\u8BB0\u5FC6
    const key = q.key;
    ensureAudio().then(() => {
      if (round.current && round.current.key === key) audio.play(questionToneMidi(q), isCorrect ? 0.65 : 0.95);
    });

    // \u7B54\u9519\u540E\u6682\u505C\uFF1A\u7528\u6237\u542C\u5B8C/\u786E\u8BA4\u540E\u6309 Enter \u6216\u70B9\u6309\u94AE\u518D\u8FDB\u5165\u4E0B\u4E00\u9898
    if (pauseOnWrong) return;

    /* \u81EA\u52A8\u8FDB\u5165\u4E0B\u4E00\u9898\uFF08Q44\uFF1Apos \u8BFB\u81EA\u5DF1\u90A3\u4EFD\u5F00\u5173\uFF09\u3002
       \u627E\u4F4D\u7F6E\u73A9\u6CD5 B \u4E00\u9898\u5373\u4E00\u56DE\u5408 \u2192 \u81EA\u52A8\u8FDB\u5165 = \u76F4\u63A5\u5F00\u65B0\u56DE\u5408\uFF0C\u800C\u4E0D\u662F idx++\u3002 */
    const autoNext = posMode ? posAutoNextOnCorrect() : store.settings.autoNextOnCorrect;
    /* A \u7528\u627E\u4F4D\u7F6E\u81EA\u5DF1\u7684 posStartMode\uFF08\u7B2C 7 \u6761\uFF1A\u4E0D\u518D\u501F\u7528\u97F3\u540D\u6A21\u5F0F\u7684 startMode\uFF09\uFF1B
       B \u4E00\u9898\u4E00\u56DE\u5408\uFF0C\u81EA\u52A8\u63A8\u8FDB\u5C31\u7B49\u4EF7\u4E8E\u300C\u4E0B\u4E00\u9898\u8981\u4E0D\u8981\u81EA\u52A8\u5F00\u59CB\u300D\uFF08Q29\uFF09\u3002 */
    const autoMode = posMode
      ? (posPlayA() ? startModeOf('pos') === 'auto' : posAutoStartOnNext())
      : startModeOf('note') === 'auto';
    if (posMode && !posPlayA() && autoNext) {
      setNextCard('\u81EA\u52A8\u4E0B\u4E00\u9898\u2026', '\u6309 Enter \u7ACB\u5373\u8FDB\u5165', true);
      round.pendingNext = setTimeout(() => {
        round.pendingNext = null;
        if (round.state !== 'answered' || !round.current || round.current.key !== key) return;
        userAdvance();
      }, 900);
      return;
    }
    if (isCorrect && autoNext) {
      setNextCard('\u81EA\u52A8\u4E0B\u4E00\u9898\u2026', '\u6309 Enter \u7ACB\u5373\u8FDB\u5165', true);
      round.pendingNext = setTimeout(() => {
        round.pendingNext = null;
        if (round.state !== 'answered' || !round.current || round.current.key !== key) return;
        round.idx++;
        nextQuestion(true);          // \u81EA\u52A8\u5F00\u59CB\u8BA1\u65F6
      }, 900);
      return;
    }

    // \u81EA\u52A8\u5F00\u59CB\u6A21\u5F0F\u4E0B\uFF1A\u7B54\u5B8C\u81EA\u52A8\u8FDB\u5165\u4E0B\u4E00\u9898\uFF08\u4E0B\u4E00\u9898\u6309\u8BBE\u7F6E\u6B63\u5E38\u5F00\u59CB\uFF09
    if (autoMode && !(isCorrect && autoNext)) {
      const delay = isCorrect ? 900 : 1600;
      setNextCard('\u4E0B\u4E00\u9898 \u203A', 'Enter \u7ACB\u5373\u8FDB\u5165', true);
      round.pendingNext = setTimeout(() => {
        round.pendingNext = null;
        if (round.state !== 'answered' || !round.current || round.current.key !== key) return;
        /* B \u4E00\u9898\u4E00\u56DE\u5408\uFF1A\u81EA\u52A8\u8FDB\u5165 = \u76F4\u63A5\u5F00\u65B0\u56DE\u5408\uFF0C\u4E0D\u80FD\u8D70 idx++\uFF08\u5426\u5219\u4F1A\u649E\u4E0A finishRound\uFF09 */
        if (posMode && !posPlayA()) { userAdvance(); return; }
        round.idx++;
        nextQuestion();
      }, delay);
    }
  }

  /* \u70B9\u51FB\u201C\u4E0B\u4E00\u9898\u201D\u65F6\uFF1A\u82E5\u5F00\u542F\u4E86\u201C\u70B9\u51FB\u4E0B\u4E00\u9898\u81EA\u52A8\u5F00\u59CB\u201D\uFF0C\u76F4\u63A5\u5F00\u59CB\u4E0B\u4E00\u9898\u8BA1\u65F6 */
  function userAdvance() {
    /* \u672C\u8F6E\u5DF2\u7ED3\u675F\uFF08state = 'idle'\uFF09\uFF1A\u6B64\u65F6\u300C\u4E0B\u4E00\u9898\u300D\u6309\u94AE\u7684\u6587\u6848\u662F\u300C\u5F00\u59CB\u65B0\u4E00\u8F6E\u300D\uFF0C
       \u70B9\u5B83/\u6309 Enter \u5E94\u8BE5\u5F00\u65B0\u4E00\u8F6E\u3002\u4EE5\u524D\u8FD9\u91CC\u76F4\u63A5 return\uFF0C\u5BFC\u81F4\u4E00\u8F6E\u7B54\u5B8C\u540E
       \u6309\u94AE\u548C Enter \u90FD\u6CA1\u53CD\u5E94\u3002 */
    if (round.state === 'idle' && !round.current) {
      setNextCard('\u4E0B\u4E00\u9898 \u203A', '', false);
      const pn = $('#posNext');
      if (pn) pn.hidden = true;
      startRound();
      return;
    }
    if (round.state !== 'answered' || !round.current) return;
    /* \u627E\u4F4D\u7F6E\u73A9\u6CD5 B\uFF1A\u4E00\u9898\u5373\u4E00\u56DE\u5408 \u2014\u2014 \u70B9\u300C\u4E0B\u4E00\u9898\u300D\u4E0D\u662F\u300C\u8FDB\u5165\u672C\u8F6E\u4E0B\u4E00\u9898\u300D\uFF0C
       \u800C\u662F\u76F4\u63A5\u5F00\u65B0\u7684\u4E00\u56DE\u5408\uFF08\u65B0\u97F3\u3001\u65B0\u8BA1\u65F6\uFF09\uFF0C\u6C38\u8FDC\u4E0D\u51FA\u73B0\u300C\u672C\u8F6E\u5B8C\u6210\u300D\u3002
       Q44\uFF1A\u4E0B\u4E00\u9898\u8981\u4E0D\u8981\u81EA\u52A8\u5F00\u59CB\uFF0C\u7531 pos \u81EA\u5DF1\u90A3\u4E2A\u5F00\u5173\u51B3\u5B9A\uFF08\u9ED8\u8BA4\u5173\uFF09\u3002 */
    if (store.settings.mode === 'pos' && !posPlayA()) {
      if (round.pendingNext) { clearTimeout(round.pendingNext); round.pendingNext = null; }
      setNextCard('\u4E0B\u4E00\u9898 \u203A', '', false);
      const pn = $('#posNext');
      if (pn) pn.hidden = true;
      /* \u300C\u672C\u9898\u6210\u7EE9\u300D\u53EA\u4FDD\u7559\u5230\u70B9\u4E0B\u4E00\u9898\u4E3A\u6B62\uFF08D67\uFF09\uFF1A\u6E05\u6389\u540E\u56FE2 \u56DE\u5230\u5168 `\u2014`\u3001
         \u56FE1 \u638C\u63E1\u533A\u56DE\u5230 `\uFF1F`\uFF0C\u4E0B\u4E00\u9898\u5F00\u59CB\u524D\u4E0D\u4F1A\u6CC4\u9732\u672C\u9898\u7684\u683C\u5B50\u4FE1\u606F\u3002 */
      if (store.posBStats) store.posBStats.last = null;
      startRound();
      const auto = posAutoStartOnNext();
      if (auto && round.current) { round.waitStart = false; applyWaitingUI(false); beginQuestion(); }
      return;
    }
    const autoStart = store.settings.mode === 'pos'
      ? posAutoStartOnNext()
      : store.settings.autoStartOnNext !== false;    if (round.pendingNext) { clearTimeout(round.pendingNext); round.pendingNext = null; }
    setNextCard('\u4E0B\u4E00\u9898 \u203A', '', false);
    round.idx++;
    if (autoStart) {
      nextQuestion(true);                 // \u8DF3\u8FC7\u7B49\u5F85\u9636\u6BB5\uFF0C\u76F4\u63A5\u8BA1\u65F6
    } else {
      nextQuestion();
    }
  }
  // Enter / \u70B9\u51FB\u201C\u4E0B\u4E00\u9898\u201D\u90FD\u8D70\u540C\u4E00\u4E2A\u5165\u53E3
  const advanceNow = userAdvance;

  function finishRound() {
    /* \u627E\u4F4D\u7F6E\u73A9\u6CD5 B \u4E00\u9898\u5373\u4E00\u56DE\u5408\uFF1A\u6C38\u8FDC\u4E0D\u8BE5\u51FA\u73B0\u300C\u672C\u8F6E\u5B8C\u6210\u300D\u3002
       \u4E07\u4E00\u8D70\u5230\u8FD9\u91CC\uFF08\u961F\u5217\u88AB\u6E05\u7A7A / \u8001\u5B58\u6863\u6062\u590D\uFF09\uFF0C\u76F4\u63A5\u5F00\u65B0\u56DE\u5408\u3002 */
    if (store.settings.mode === 'pos' && !posPlayA()) { startRound(); return; }
    const n = round.results.length;
    const right = round.results.filter((r) => r.correct).length;
    round.state = 'idle';
    round.current = null;
    round.waitStart = false;
    applyWaitingUI(false);
    if (round.timer) { clearInterval(round.timer); round.timer = null; }
    if (round.pendingNext) { clearTimeout(round.pendingNext); round.pendingNext = null; }
    renderFretboard();
    buildOptions(null);
    $('#promptText').innerHTML = '\u672C\u8F6E\u5B8C\u6210 \uD83C\uDF89';
    ['#timerNum', '#posTimerNum'].forEach((s) => { const el = $(s); if (el) { el.textContent = '\u2013'; el.classList.remove('idle'); } });
    ['#ringFg', '#posRingFg'].forEach((s) => { const el = $(s); if (el) { el.style.strokeDashoffset = '0'; el.classList.remove('idle-ring'); } });
    $('#startBox').hidden = true;
    const mask = $('#posStartMask');
    if (mask) mask.hidden = true;
    $('#combo').textContent = '\u672C\u8F6E ' + right + '/' + n;
    $('#combo').style.opacity = '1';
    const summary = '\u672C\u8F6E ' + n + ' \u9898\uFF0C\u7B54\u5BF9 ' + right + ' \u9898\uFF0C\u6B63\u786E\u7387 ' + (n ? Math.round((right / n) * 100) : 0) + '%';
    const fb = $('#feedback');
    fb.className = 'feedback info';
    fb.textContent = summary;
    const pf = $('#posFeedback');
    pf.className = 'feedback pos-feedback info';
    pf.textContent = summary;
    $('#posNote').textContent = '\u672C\u8F6E\u5B8C\u6210 \uD83C\uDF89';
    $('#posSub').textContent = '\u6309 Enter \u6216\u70B9\u300C\u5F00\u59CB\u65B0\u4E00\u8F6E\u300D\u7EE7\u7EED';
    $('#posNext').hidden = false;
    $('#posNext').textContent = '\u5F00\u59CB\u65B0\u4E00\u8F6E \u203A';
    $('#posPickedList').innerHTML = '<span class="pos-picked-empty">\u2014</span>';
    $('#posPickedCount').textContent = '0';
    $('#posSubmit').disabled = true;
    $('#posCombo').textContent = '\u672C\u8F6E ' + right + '/' + n;
    /* syncPosUI() \u7684 idle \u5206\u652F\u73B0\u5728\u81EA\u5DF1\u4F1A\u5199\u300C\u672C\u8F6E\u5B8C\u6210 \uD83C\uDF89\u300D+\u300C\u6309 Enter \u6216\u70B9\u300C\u5F00\u59CB\u65B0\u4E00\u8F6E\u300D\u7EE7\u7EED\u300D\uFF0C
       \u4E0D\u4F1A\u518D\u50CF\u4EE5\u524D\u90A3\u6837\u628A\u8FD9\u91CC\u5199\u7684\u526F\u6807\u9898\u8986\u76D6\u56DE\u300C\u70B9\u51FB\u6307\u677F\u4E0A\u6240\u6709\u6B63\u786E\u7684\u683C\u5B50\u300D\u3002 */
    syncPosUI();
    setNextCard('\u5F00\u59CB\u65B0\u4E00\u8F6E \u203A', '\u6309 Enter \u6216\u70B9\u8FD9\u91CC', true);
    /* \u8F6E\u6B21\u7ED3\u675F\uFF1A\u56FE3 \u4FDD\u7559\u521A\u7ED3\u675F\u90A3\u4E00\u8F6E\u7684\u5FEB\u7167\uFF08D33\uFF09\uFF0C\u56FE1/\u56FE4 \u8F6C\u7A7A\u6001\uFF08D38\uFF09 */
    renderSidebar();
    /* \u8F6E\u672B\u81EA\u52A8\u5F00\u4E0B\u4E00\u8F6E\uFF1A\u8BFB\u5F53\u524D\u6A21\u5F0F\u81EA\u5DF1\u7684\u300C\u5F00\u59CB\u65B9\u5F0F\u300D\uFF08\u97F3\u540D \u2192 startMode\uFF0C
       \u627E\u4F4D\u7F6E\u73A9\u6CD5 A \u2192 posStartMode\uFF09\uFF0C\u7B2C 7 \u6761\u9694\u79BB */
    if (startModeOf(store.settings.mode) !== 'manual') {
      round.pendingNext = setTimeout(() => {
        round.pendingNext = null;
        if (round.state === 'idle') startRound();
      }, 3000);
    }
  }

  /* ---------------------------------------------------------------
   *  \u9898\u76EE\u663E\u793A\u4E0E\u9009\u9879
   * --------------------------------------------------------------- */
  /** \u663E\u793A\u201C\u4E0B\u4E00\u9898\u201D\u6309\u94AE\uFF08\u53EF\u5E26 Enter \u63D0\u793A\uFF09 */
  function setNextCard(main, sub, show) {    const el = $('#nextHint');
    el.hidden = !show;
    const bar = el.parentElement;
    if (bar) bar.classList.toggle('has-next', !!show);
    if (!show) return;
    el.querySelector('.nx-main').textContent = main;
    el.querySelector('.nx-sub').textContent = sub || '';
  }

  function setPrompt(q) {
    const mode = store.settings.mode;
    $('#nextHint').hidden = true;
    $('#posNext').hidden = true;
    // \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1A\u9898\u5361\u53EA\u5199\u97F3\u540D\uFF0C\u7EDD\u4E0D\u5199\u5F26/\u54C1\uFF08\u5426\u5219\u7B49\u4E8E\u76F4\u63A5\u7ED9\u7B54\u6848\uFF09
    if (mode === 'pos') {
      pos.picks = [];
      pos.last = null;
      pos.submitting = false;
    } else {
      $('#promptText').innerHTML = '\u7B2C <span class="hl">' + q.s + '</span> \u5F26 \u00B7 \u7B2C <span class="hl">' + q.f + '</span> \u54C1';
      $('#optionTitle').textContent = '\u8FD9\u662F\u54EA\u4E2A\u97F3\uFF1F';
      $('#optionHint').textContent = '\u70B9\u51FB\u9009\u9879\u4F5C\u7B54\uFF08\u952E\u76D8 1\u20137\uFF09';
    }
    $('#combo').textContent = '\u8FDE\u5BF9 ' + round.streak;
    $('#combo').style.opacity = round.streak > 1 ? '1' : '.55';
    const pf = $('#posFeedback');
    if (pf) { pf.className = 'feedback pos-feedback'; pf.textContent = ''; }
    syncPosUI();
  }

  function buildOptions(q) {
    const box = $('#options');
    box.innerHTML = '';
    if (store.settings.mode === 'pos') return;   // \u627E\u4F4D\u7F6E\u6A21\u5F0F\u4E0D\u4F7F\u7528\u9009\u9879\u533A\uFF08\u5DF2\u6E05\u7A7A\uFF09
    if (!q) {
      box.innerHTML = '<div class="option-hint" style="padding:8px 2px">\u7B49\u5F85\u4E0B\u4E00\u8F6E\u2026</div>';
      return;
    }
    const correctPc = pcOf(midiOf(q.s, q.f));
    const requested = store.settings.optionCount === 'inf' ? Infinity : Number(store.settings.optionCount);
    let pcs;
    if (requested === Infinity) {
      // \u65E0\u9650\u9009\u9879\uFF1A\u5217\u51FA\u5168\u90E8 12 \u4E2A\u97F3\uFF08\u987A\u5E8F\u968F\u673A\uFF09\uFF0C\u6BCF\u4E2A\u90FD\u5E26\u8BD5\u542C\u6309\u94AE
      pcs = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    } else {
      pcs = makeOptionSet(correctPc, requested);
    }
    q.options = pcs;
    // \u9009\u9879\u591A\u65F6\u81EA\u52A8\u53D8\u5C0F\u5B57\uFF0C\u4FDD\u8BC1\u4E00\u884C\u653E\u5F97\u4E0B
    const n = pcs.length;
    box.style.setProperty('--opt-count', String(n));
    box.className = 'options ' + (n <= 4 ? 'few' : n <= 7 ? 'mid' : n <= 10 ? 'many' : 'max') + (requested === Infinity ? ' inf-opts' : '');
    pcs.forEach((pc, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt' + (requested === Infinity ? ' wide' : '');
      b.dataset.pc = String(pc);
      b.style.setProperty('--i', String(i));
      b.innerHTML = '<span class="kbd">' + (i < 10 ? (i + 1) : '') + '</span>' +
        '<span class="opt-main">' + noteName(pc) + '</span>' +
        '<span class="opt-snd" role="button" tabindex="-1" title="\u64AD\u653E\u8FD9\u4E2A\u97F3\uFF08\u4E0D\u5224\u5206\uFF09">' +
        '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M2 6h2.2L7.6 3v10L4.2 10H2z"/><path fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" d="M10 5.6a3.4 3.4 0 0 1 0 4.8M11.9 3.8a6 6 0 0 1 0 8.4"/></svg>' +
        '</span>';
      b.addEventListener('click', (ev) => {
        // \u70B9\u9009\u9879\u91CC\u7684\u5587\u53ED\u56FE\u6807 = \u542C\u4E00\u4E0B\u8FD9\u4E2A\u97F3\uFF0C\u4E0D\u7B97\u4F5C\u7B54
        if (ev.target.closest('.opt-snd')) { ev.stopPropagation(); playPreviewPc(pc); return; }
        if (round.state !== 'asking') return;
        if (round.waitStart) { nudgeStart(); return; }
        resolveAnswer(pc, false);
      });
      box.appendChild(b);
    });
    updateOptionHint(n);
  }

  function questionSpelling(pc) {
    // \u9898\u76EE\u7684\u5199\u6CD5\u7531\u201C\u9898\u76EE\u5347\u964D\u8C03\u201D\u7684\u591A\u9009\u51B3\u5B9A\uFF1A\u4E0D\u8BA9\u964D\u53F7\u5219\u4E00\u5F8B \u266F\uFF0C\u4E0D\u8BA9\u5347\u53F7\u5219\u4E00\u5F8B \u266D
    return displayAccidental() === 'flat' && FLAT[SEMI[pc]] ? 'flat' : 'sharp';
  }

  function updateOptionHint(n) {
    const el = $('#optionHint');
    if (!el) return;
    const maxKey = Math.min(n, 9);
    const sel = accSel();
    const accTip = (sel.nat && sel.sharp && sel.flat) ? ''
      : ' \u00B7 \u9898\u76EE\uFF1A' + accModeName() + '\u97F3';
    el.textContent = '\u70B9\u51FB\u9009\u9879\u4F5C\u7B54\uFF08\u952E\u76D8 1\u2013' + maxKey + '\uFF09\u00B7 \u70B9\u9009\u9879\u53F3\u4FA7\u5C0F\u5587\u53ED\u53EF\u8BD5\u542C' + accTip;
  }

  /**
   * \u751F\u6210\u67D0\u4E2A\u9898\u76EE\u7684\u9009\u9879\u97F3\u7EA7\uFF08\u8DDF\u968F\u201C\u9898\u76EE\u5347\u964D\u8C03\u201D\u7684\u591A\u9009\u903B\u8F91\uFF09\uFF1A
   *  \u00B7 \u7B2C 1 \u4E2A\u662F\u6B63\u786E\u7B54\u6848\uFF1B\u5176\u4F59\u4ECE\u5141\u8BB8\u7684\u97F3\u7EA7\u91CC\u968F\u673A\u53D6\uFF08\u4F18\u5148\u81EA\u7136\u97F3\uFF0C\u79BB\u6B63\u786E\u7B54\u6848\u8FD1\u7684\u66F4\u5BB9\u6613\u88AB\u9009\u4E2D\uFF09
   *  \u00B7 \u9009\u4E86\u201C\u5347\u53F7 + \u964D\u53F7\u201D\uFF1A\u5347\u964D\u9898\u76EE\u4F1A\u653E\u5165\u7B49\u97F3\u9677\u9631\uFF08\u7B54\u6848 B\u266D\uFF0C\u9009\u9879\u91CC\u5C31\u6709 A\u266F\uFF09
   *  \u00B7 \u53EA\u9009\u201C\u5347\u53F7\u201D\uFF1A\u7B54\u6848\u5199 \u266F\uFF0C\u9009\u9879\u5168\u90E8\u6309 \u266F \u663E\u793A\uFF1B\u53EA\u9009\u201C\u964D\u53F7\u201D\uFF1A\u7B54\u6848\u5199 \u266D\uFF0C\u9009\u9879\u5168\u90E8\u6309 \u266D \u663E\u793A
   */
  function makeOptionSet(correctPc, count) {
    const sel = accSel();
    const allowed = allowedPcs();
    const target = clamp(Number(count) || 7, 2, Math.min(12, allowed.length));
    const accPcs = [1, 3, 6, 8, 10];
    const isAccQuestion = accPcs.indexOf(correctPc) >= 0;
    const rest = allowed.filter((p) => p !== correctPc);

    // \u6743\u91CD\uFF1A\u79BB\u6B63\u786E\u7B54\u6848\u8D8A\u8FD1\u8D8A\u5BB9\u6613\u88AB\u9009\u4E3A\u5E72\u6270\u9879\uFF1B\u81EA\u7136\u97F3\u4F18\u5148
    const weighted = rest.map((p) => {
      const dist = Math.min(Math.abs(p - correctPc), 12 - Math.abs(p - correctPc));
      const isNat = NATURAL_PCS.indexOf(p) >= 0;
      const w = (isNat ? 1 : 0.75) * (1 / Math.pow(Math.max(dist, 0.6), 0.9));
      return { p: p, w: w };
    });

    const picked = [];
    const takeWeighted = (wanted) => {
      while (picked.length < wanted - 1 && weighted.length) {
        let total = 0;
        for (const x of weighted) total += x.w;
        let r = Math.random() * total, idx = 0;
        for (let i = 0; i < weighted.length; i++) { r -= weighted[i].w; if (r <= 0) { idx = i; break; } }
        picked.push(weighted[idx].p);
        weighted.splice(idx, 1);
      }
    };
    const fix = (p) => {
      if (picked.indexOf(p) >= 0 || p === correctPc) return;
      const k = weighted.findIndex((x) => x.p === p);
      if (k >= 0) { picked.push(p); weighted.splice(k, 1); }
    };

    if (isAccQuestion && sel.sharp && sel.flat) {
      // \u540C\u65F6\u5B66\u5347\u53F7\u548C\u964D\u53F7\uFF1A\u5B89\u6392\u4E00\u4E2A\u7B49\u97F3\u5199\u6CD5\u4F5C\u4E3A\u9677\u9631\uFF08\u5982 B\u266D \u9898\u91CC\u51FA\u73B0 A\u266F\uFF09
      const sibs = accPcs.filter((p) => p !== correctPc);
      if (sibs.length) fix(sibs[Math.floor(Math.random() * sibs.length)]);
      takeWeighted(target);
    } else if (isAccQuestion && target >= 5) {
      // \u53EA\u5B66\u4E00\u79CD\u5347\u964D\u53F7\uFF1A\u5176\u4F59\u5E72\u6270\u9879\u4EE5\u81EA\u7136\u97F3\u4E3A\u4E3B\uFF0C\u8BA9\u5347\u964D\u53F7\u7B54\u6848\u4E0D\u4F1A\u201C\u4E00\u773C\u8BA4\u51FA\u201D
      const nat = rest.filter((p) => NATURAL_PCS.indexOf(p) >= 0);
      if (nat.length) fix(nat[Math.floor(Math.random() * nat.length)]);
      takeWeighted(target);
    } else {
      takeWeighted(target);
    }
    if (picked.length < target - 1) {
      for (let p = 0; p < 12 && picked.length < target - 1; p++) {
        if (p !== correctPc && picked.indexOf(p) < 0) picked.push(p);
      }
    }
    return shuffle([correctPc].concat(picked.slice(0, target - 1)));
  }

  function markOptions(chosenPc, correctPc) {
    const opts = document.querySelectorAll('#options .opt');
    for (let i = 0; i < opts.length; i++) {
      const b = opts[i];
      const pc = Number(b.dataset.pc);
      b.disabled = true;
      if (pc === correctPc) b.classList.add('correct');
      else if (chosenPc !== null && pc === chosenPc) b.classList.add('wrong');
      else b.classList.add('dim');
    }
  }

  function updateFeedback(text, cls) {
    const fb = $('#feedback');
    fb.className = 'feedback' + (cls ? ' ' + cls : '');
    fb.textContent = text;
  }

  /* \u63D0\u793A\u5199\u8FDB\u300C\u5F53\u524D\u6A21\u5F0F\u81EA\u5DF1\u7684\u300D\u53CD\u9988\u6761\uFF1A\u56DB\u4E2A\u89C6\u56FE\u5404\u6709\u4E00\u6761 .feedback\uFF0C
     \u5199\u9519\u5143\u7D20\u7684\u8BDD\u63D0\u793A\u4F1A\u843D\u5728\u770B\u4E0D\u89C1\u7684\u89C6\u56FE\u91CC\uFF08\u4F8B\u5982\u548C\u5F26\u6A21\u5F0F\u4E0B\u5199\u8FDB #feedback\uFF09\u3002 */
  function updateModeFeedback(text, cls) {
    const mode = store.settings.mode;
    const id = mode === 'pos' ? '#posFeedback'
      : mode === 'chord' ? '#chordFeedback'
        : mode === 'interval' ? '#intervalFeedback' : '#feedback';
    const fb = $(id);
    if (!fb) { updateFeedback(text, cls); return; }
    const base = mode === 'pos' ? 'feedback pos-feedback'
      : mode === 'chord' ? 'feedback chord-feedback'
        : mode === 'interval' ? 'feedback interval-feedback' : 'feedback';
    fb.className = base + (cls ? ' ' + cls : '');
    fb.textContent = text;
  }

  /* ---------------------------------------------------------------
   *  \u4E09\u5757\u6307\u677F\u5BB9\u5668
   *
   *  \u753B\u9762\u5168\u90E8\u7531 board-svg.js \u7528 assets/guitar/board.svg \u7ED8\u5236\u3002
   *  \uFF08\u65E9\u671F\u7248\u672C\u7528 Canvas \u624B\u7ED8\uFF0C\u5DF2\u6574\u4F53\u79FB\u9664\uFF1A\u90A3\u6761\u8DEF\u5F84\u5728 SVG \u7248\u843D\u5730\u540E
   *   \u4ECE\u672A\u88AB\u6267\u884C\u8FC7\uFF0C\u7559\u7740\u53EA\u4F1A\u8BA9\u4EBA\u8BEF\u4EE5\u4E3A\u6709\u964D\u7EA7\u515C\u5E95\u3002\uFF09
   *
   *  SVG \u8F7D\u5165\u5931\u8D25\u65F6 board-svg.js \u4F1A\u653E\u5165\u4E00\u5F20\u9759\u6001 <img>\uFF1A
   *   - \u97F3\u540D\u6A21\u5F0F\u4ECD\u53EF\u4F5C\u7B54\uFF08\u5B83\u9760\u4E0B\u65B9\u97F3\u540D\u9009\u9879\uFF0C\u4E0D\u9700\u8981\u70B9\u6307\u677F\uFF09
   *   - \u627E\u4F4D\u7F6E / \u548C\u5F26\u6A21\u5F0F\u4E0D\u53EF\u7528\uFF08\u4E24\u8005\u90FD\u5FC5\u987B\u70B9\u6307\u677F\uFF09\uFF0C\u5E76\u7ED9\u51FA\u660E\u786E\u63D0\u793A
   * --------------------------------------------------------------- */
  const boardHostNote = $('#fretboard');
  const boardHostPos = $('#posFretboard');
  const boardHostChord = $('#chordFretboard');
  const boardHostInterval = $('#intervalFretboard');
  /* \u5F53\u524D\u6A21\u5F0F\u5BF9\u5E94\u7684\u5BB9\u5668\uFF08\u547D\u4E2D\u5224\u5B9A\u3001\u4E8B\u4EF6\u7ED1\u5B9A\u3001\u5C3A\u5BF8\u6D4B\u91CF\u90FD\u8BFB\u5B83\uFF09 */
  let boardHost = boardHostNote;
  let boardSvgActive = false;

  function syncActiveBoardHost() {
    const mode = store.settings.mode;
    const want = mode === 'pos' ? boardHostPos
      : (mode === 'chord' ? boardHostChord
        : (mode === 'interval' ? boardHostInterval : boardHostNote));
    if (!want) return;
    boardHost = want;
  }
  /* \u53EA\u4FDD\u7559 SVG \u6307\u677F\u771F\u6B63\u4F1A\u8BFB\u7684\u72B6\u6001\uFF1A\u60AC\u505C\u683C \u4E0E \u5F53\u524D\u8303\u56F4\u54C1\u6570\u3002
     \uFF08\u539F\u6765\u7684 W/H/rows/xNut/fretT \u7B49\u662F Canvas \u624B\u7ED8\u7684\u51E0\u4F55\u53C2\u6570\uFF0C\u5DF2\u968F\u7ED8\u5236\u4EE3\u7801\u79FB\u9664\u3002\uFF09 */
  const board = { hover: null, maxFret: 12 };

  function computeLayout() {
    const maxFret = rangeFretMax();
    board.maxFret = maxFret;
    /* SVG \u6307\u677F\u4E5F\u8981\u8DDF\u7740\u53EA\u663E\u793A\u5230\u5BF9\u5E94\u54C1\u6570\uFF08\u539F\u6765\u5199\u6B7B 12 \u54C1\uFF0C
       \u5BFC\u81F4\u8BBE\u7F6E\u91CC\u9009\u300C0-5 \u54C1\u300D\u65F6\u6307\u677F\u4ECD\u7136\u753B\u6EE1 12 \u54C1\uFF09\u3002
       \u4E09\u5757\u6307\u677F\u5404\u6709\u5404\u7684\u8303\u56F4\uFF0C\u5FC5\u987B\u5206\u522B\u8BBE\u7F6E\uFF1A
         #fretboard      \u2190 noteRange\uFF08\u97F3\u540D\u6A21\u5F0F\uFF09
         #posFretboard   \u2190 posRange \uFF08\u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF09
         #chordFretboard \u2190 chordRange\uFF08\u548C\u5F26\u6A21\u5F0F\uFF09
       \u4EE5\u524D\u524D\u4E24\u5757\u5171\u7528 settings.range\uFF0C\u4E8E\u662F\u4EFB\u4E00\u6A21\u5F0F\u6539\u8303\u56F4\u53E6\u4E00\u5757\u4E5F\u8DDF\u7740\u53D8\u3002 */
    if (typeof boardSvg !== 'undefined' && boardSvg.loaded && typeof boardSvg.setRange === 'function') {
      boardSvg.setRange(Number(store.settings.noteRange.split('-')[1]) || 12, ['fretboard']);
      boardSvg.setRange(Number(store.settings.posRange.split('-')[1]) || 12, ['posFretboard']);
      boardSvg.setRange(chordRangeFretMax(), ['chordFretboard']);
      boardSvg.setRange(intervalFretMax(), ['intervalFretboard']);
    }
  }

  /* \u53EA\u8D1F\u8D23\u8BA9 SVG \u6307\u677F\u6309\u5BB9\u5668\u5BBD\u5EA6\u91CD\u7B97\u9AD8\u5EA6\uFF08\u753B\u9762\u4E0E\u51E0\u4F55\u5168\u5728 board-svg.js \u91CC\uFF09 */
  function fitCanvas() {
    if (typeof boardSvg !== 'undefined' && boardSvg.loaded) boardSvg.resize();
  }

  /* ---------------------------------------------------------------
   *  SVG \u6307\u677F\u6E32\u67D3\uFF1A\u628A\u5F53\u524D\u9898\u76EE/\u4F5C\u7B54\u72B6\u6001\u6620\u5C04\u6210\u53E0\u52A0\u6807\u8BB0
   *  kind: answer\uFF08\u6B63\u786E\u4F4D\u7F6E\uFF09| missed\uFF08\u6F0F\u9009\uFF09| wrong\uFF08\u591A\u9009\uFF09
   * --------------------------------------------------------------- */
  function drawFretboardSvg() {
    /* \u548C\u5F26\u6A21\u5F0F\u6709\u81EA\u5DF1\u7684\u7ED8\u5236\u51FD\u6570\u4E0E\u81EA\u5DF1\u7684\u6307\u677F\u89C6\u56FE\uFF0C\u7EDD\u4E0D\u5171\u7528\u8FD9\u91CC\u7684\u6807\u8BB0\u903B\u8F91\uFF1A
       \u4E09\u79CD\u6A21\u5F0F\u7684\u6807\u8BB0\u8BED\u4E49\u5B8C\u5168\u4E0D\u540C\uFF08\u9898\u76EE\u683C / \u547D\u4E2D\u6F0F\u9009\u591A\u9009 / \u516D\u5F26\u4E09\u6001\uFF09\uFF0C
       \u6DF7\u5728\u4E00\u8D77\u6B63\u662F\u300C\u6807\u8BB0\u753B\u8FDB hidden \u6307\u677F\u300D\u90A3\u7C7B bug \u7684\u6E29\u5E8A\u3002 */
    if (store.settings.mode === 'chord') {
      drawChordFretboardSvg();
      return;
    }

    const q = round.current;
    const marks = [];
    const picks = [];
    let hover = null;

    const canHover = store.settings.mode === 'pos'
      && round.state === 'asking' && !round.waitStart && !store.settings.posFreeClick;
    /* \u73A9\u6CD5 A \u53EA\u8003\u4E00\u6839\u5F26\uFF1A\u5176\u5B83\u5F26\u8FDE\u60AC\u505C\u9AD8\u4EAE\u90FD\u4E0D\u7ED9\uFF08\u70B9\u4E5F\u70B9\u4E0D\u4E2D\uFF0C\u89C1 togglePick\uFF09 */
    if (canHover && board.hover
      && (!posPlayA() || !q || board.hover.s === q.s)) hover = board.hover;

    if (store.settings.mode === 'pos') {
      /* \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1A\u7B54\u9898\u4E2D\u628A\u5DF2\u9009\u683C\u5B50\u753B\u6210\u6A59\u8272\uFF1B**\u63D0\u4EA4\u540E\u4E0D\u518D\u753B\u6A59\u8272**\u3002
         \u4EE5\u524D\u4E0D\u7BA1\u72B6\u6001\u90FD push picks\uFF0C\u800C paint() \u91CC picks \u662F\u6700\u540E\u753B\u7684\uFF0C
         \u6A59\u8272\u5706\u628A\u5E95\u4E0B\u7684\u7EFF\uFF08\u547D\u4E2D\uFF09/\u9EC4\uFF08\u6F0F\u9009\uFF09/\u7EA2\uFF08\u591A\u9009\uFF09\u5168\u76D6\u4F4F\u4E86 \u2014\u2014
         \u7528\u6237\u770B\u5230\u7684\u5C31\u662F\u300C\u989C\u8272\u6CA1\u6709\u53D8\u5316\uFF0C\u5168\u662F\u6A59\u8272\u300D\u3002 */
      if (round.state === 'asking') {
        (pos.picks || []).forEach((p) => picks.push({ s: p.s, f: p.f }));
      }

      const last = pos.last;
      if (round.state === 'answered' && last) {
        last.targets.forEach((t) => {
          const missed = last.missed.some((m) => sameCell(m, t));
          marks.push({ s: t.s, f: t.f, kind: missed ? 'missed' : 'answer' });
        });
        last.extra.forEach((e) => marks.push({ s: e.s, f: e.f, kind: 'wrong' }));
      }
    } else if (q && round.state === 'answered') {
      /* \u97F3\u540D\u6A21\u5F0F\uFF1A\u7B54\u5B8C\u6807\u51FA\u6B63\u786E\u4F4D\u7F6E\uFF08\u7EFF\uFF09\uFF1B
         \u7B54\u9519\u65F6\u518D\u6807\u51FA\u300C\u7528\u6237\u5B9E\u9645\u9009\u7684\u90A3\u4E2A\u4F4D\u7F6E\u300D\uFF08\u7EA2\uFF09\uFF0C\u5426\u5219\u53EA\u770B\u5230\u4E00\u4E2A\u7EFF\u70B9\uFF0C
         \u770B\u4E0D\u51FA\u81EA\u5DF1\u9519\u5728\u54EA \u2014\u2014 \u4EE5\u524D\u8FD9\u91CC\u5B8C\u5168\u6CA1\u6709 wrong \u6807\u8BB0\u3002 */
      marks.push({ s: q.s, f: q.f, kind: 'answer' });
      if (!round.lastOk && round.chosenPc !== null && round.chosenPc !== undefined) {
        const wrongCell = cellForPc(round.chosenPc, q);
        if (wrongCell && !sameCell(wrongCell, q)) {
          marks.push({ s: wrongCell.s, f: wrongCell.f, kind: 'wrong' });
        }
      }
    }

    /* \u97F3\u540D\u6A21\u5F0F\u7B54\u9898\u4E2D\uFF1A\u6807\u51FA\u300C\u8FD9\u9053\u9898\u95EE\u7684\u662F\u54EA\u4E00\u683C\u300D\uFF08\u539F\u6765 Canvas \u7684 drawQuestionMarker\uFF09\u3002
       \u53EA\u753B\u4F4D\u7F6E\uFF0C\u4E0D\u7ED9\u7B54\u6848 \u2014\u2014 \u4EE5\u524D\u8FD9\u91CC\u4F20\u4E86 label\uFF0C\u7B49\u4E8E\u628A\u97F3\u540D\u5199\u5728\u70B9\u4E0A\u3002 */
    let question = null;
    if (q && store.settings.mode !== 'pos' && round.state === 'asking' && !round.waitStart) {
      question = { s: q.s, f: q.f };
    }

    /* \u5FC5\u987B\u628A\u300C\u5F53\u524D\u662F\u54EA\u4E2A\u6A21\u5F0F\u7684\u6307\u677F\u5BB9\u5668\u300D\u4F20\u8FDB\u53BB\uFF1A
       \u4E24\u4E2A\u6A21\u5F0F\u5404\u6709\u4E00\u4EFD SVG \u548C\u53E0\u52A0\u5C42\uFF08#fretboard / #posFretboard\uFF09\uFF0C
       \u4E0D\u4F20 id \u65F6 paint \u9ED8\u8BA4\u753B\u5230 #fretboard \u2014\u2014 \u627E\u4F4D\u7F6E\u6A21\u5F0F\u7684\u6807\u8BB0\u5C31\u4F1A\u753B\u8FDB
       \u97F3\u540D\u6A21\u5F0F\u90A3\u4E2A hidden \u7684\u6307\u677F\u91CC\uFF0C\u7528\u6237\u770B\u5230\u7684\u5C31\u662F\u300C\u70B9\u4E86\u6CA1\u53CD\u5E94\u300D\u3002
       \u8FD9\u91CC\u76F4\u63A5\u6309\u6A21\u5F0F\u5224\u65AD\uFF0C\u4E0D\u4F9D\u8D56 canvas \u53D8\u91CF\u7684\u5207\u6362\u65F6\u5E8F\u3002 */
    const paintId = store.settings.mode === 'pos' ? 'posFretboard' : 'fretboard';

    /* \u97F3\u7A0B\u6A21\u5F0F\u6709\u81EA\u5DF1\u7684\u7ED8\u5236\u51FD\u6570\u4E0E\u81EA\u5DF1\u7684\u6307\u677F\u89C6\u56FE\uFF0C\u7EDD\u4E0D\u5171\u7528\u8FD9\u91CC\u7684\u6807\u8BB0\u903B\u8F91 */
    if (store.settings.mode === 'interval') return;

    /* \u7EAF Node \u6D4B\u8BD5\u6869\u91CC\u6CA1\u6709 boardSvg\uFF08\u5B83\u6765\u81EA board-svg.js \u8FD9\u4E2A\u72EC\u7ACB\u811A\u672C\uFF09\uFF0C
       \u8FD9\u91CC\u5FC5\u987B\u7528 typeof \u5B88\u536B\uFF0C\u5426\u5219\u540C\u6B65 requestAnimationFrame \u7684\u6869\u73AF\u5883\u4F1A\u5D29\u3002 */
    if (typeof boardSvg === 'undefined' || !boardSvg || !boardSvg.loaded) return;

    /* \u627E\u4F4D\u7F6E\u6A21\u5F0F\u8C03\u8BD5\uFF1A\u628A\u6240\u6709\u683C\u5B50\u7684\u97F3\u540D\u94FA\u5E95\uFF08\u5BF9\u5E94 Canvas \u7248\u7684 drawAllNoteNames\uFF09\u3002
       \u6362\u6210 SVG \u540E\u8FD9\u6BB5\u6F0F\u6389\u4E86\uFF0C\u52FE\u4E0A\u300C\u663E\u793A\u5168\u90E8\u97F3\u540D\u300D\u753B\u9762\u6BEB\u65E0\u53D8\u5316\u3002
       \u592A\u7A84\u7684\u683C\u5B50\u8DF3\u8FC7\uFF0C\u5426\u5219\u9AD8\u628A\u4F4D\u4F1A\u7CCA\u6210\u4E00\u7247 \u2014\u2014 \u4E0E Canvas \u7248\u540C\u4E00\u89C4\u5219\u3002 */
    let allNames = null;
    if (store.settings.mode === 'pos' && store.settings.posShowAllNames) {
      allNames = [];
      const F = BOARD.fretX;
      const maxFret = boardSvg.maxFretOf(paintId);
      STRINGS.forEach((st) => {
        for (let f = 0; f <= maxFret; f++) {
          /* \u54C1\u683C k \u5360 [F[k-1], F[k]]\uFF1B\u7A7A\u5F26\u6CA1\u6709\u54C1\u683C\uFF0C\u5BBD\u5EA6\u6309\u52A0\u7C97\u7434\u6795\u7B97\u3002
             \u4EE5\u524D\u6309 [F[f], F[f+1]] \u7B97\uFF0C\u6574\u6761\u6307\u677F\u7684\u97F3\u540D\u4E5F\u8DDF\u7740\u53F3\u504F\u4E00\u683C\u3002 */
          const cellW = f === 0 ? BOARD.nutW : (F[f] - F[f - 1]);
          if (cellW < 26) continue;
          allNames.push({ s: st.n, f: f, text: noteName(pcOf(midiOf(st.n, f))) });
        }
      });
    }

    /* \u627E\u4F4D\u7F6E\u73A9\u6CD5 A \u53EA\u8003\u4E00\u6839\u5F26\uFF1A\u628A\u5176\u4F59\u4E94\u6761\u538B\u6697\uFF0C\u53EA\u7559\u9898\u76EE\u5F26\u4E00\u6761\u4EAE\u5E26\uFF08Q23/Q27\uFF09\u3002
       \u8FD9\u662F\u300C\u544A\u8BC9\u4F60\u8BE5\u770B\u54EA\u6839\u5F26\u300D\uFF0C\u4E0D\u662F\u7ED9\u7B54\u6848 \u2014\u2014 \u5F26\u5728\u526F\u6807\u9898\u91CC\u5DF2\u7ECF\u5199\u4E86\u3002 */
    let dimStrings = null;
    if (store.settings.mode === 'pos' && posPlayA() && q && q.s != null) {
      dimStrings = { keep: q.s };
    }

    boardSvg.paint({ marks, hover, picks, question, allNames, dimStrings }, paintId);
  }

  /* ---------------------------------------------------------------
   *  \u548C\u5F26\u6A21\u5F0F\u6307\u677F\u7ED8\u5236
   *
   *  \u4E09\u6001\u5728\u6307\u677F\u4E0A\u7684\u8868\u8FBE\uFF1A
   *    \u9759\u97F3 \u2014\u2014 \u4E0D\u753B\u4EFB\u4F55\u4E1C\u897F\uFF08\u9ED8\u8BA4\u5C31\u662F\u9759\u97F3\uFF0C\u516D\u5F26\u5168\u7A7A\uFF09
   *    \u7A7A\u5F26 \u2014\u2014 \u753B\u5728\u52A0\u7C97\u7684\u7434\u6795\u4E0A\uFF08boardSvg \u7684 cellCenter(s, 0) \u5C31\u843D\u5728\u7434\u6795\u6761\u4E2D\u592E\uFF09
   *    \u6309\u54C1 \u2014\u2014 \u753B\u5728\u5BF9\u5E94\u683C\u5B50
   *  \u7B54\u9898\u4E2D\u7528 picks\uFF08\u6A59\u8272\uFF09\uFF1B\u7B54\u5B8C\u7528 marks\uFF1A
   *    \u6B63\u786E\u6392\u5E03\u7684\u4F4D\u7F6E = answer\uFF08\u7EFF\uFF09\uFF0C\u7528\u6237\u6392\u5E03\u91CC\u591A\u51FA\u6765\u7684 = wrong\uFF08\u7EA2\uFF09\uFF0C
   *    \u76EE\u6807\u9700\u8981\u4F46\u7528\u6237\u6CA1\u6309\u7684 = missed\uFF08\u9EC4\uFF09
   * --------------------------------------------------------------- */
  /* \u9898\u9762\uFF1A\u8FD9\u6761\u6307\u6CD5\u91CC\u54EA\u51E0\u6839\u5F26\u53D1\u58F0 / \u54EA\u51E0\u6839\u88AB\u538B\u6697\uFF08\u7B56\u5212\u4E66 \u00A74.1.1\uFF09 */
  function chordDimStrings(item) {
    const out = [];
    if (!item) return out;
    for (let s = 1; s <= 6; s++) {
      if (item.fr[6 - s] < 0) out.push(s);
    }
    return out;
  }

  /** \u8FD9\u6761\u6307\u6CD5\u91CC\u6700\u7C97 / \u6700\u7EC6\u7684\u53D1\u58F0\u5F26\uFF08\u6A2A\u6309\u77E9\u5F62\u8981\u6A2A\u8DE8\u8FD9\u51E0\u6839\uFF09 */
  function chordSoundingSpan(fr) {
    let first = 0;
    let last = 0;
    for (let s = 1; s <= 6; s++) {
      if (fr[6 - s] >= 0) { if (!first) first = s; last = s; }
    }
    return { s1: first, s2: last };
  }

  function drawChordFretboardSvg() {
    if (typeof boardSvg === 'undefined' || !boardSvg.loaded) return;
    const item = chordRound.current;
    const play = chordRound.play || 'a';
    const paint = { marks: [], picks: [], dimCols: [], barres: [] };
    if (!item) { boardSvg.paint(paint, 'chordFretboard'); return; }

    /* \u9898\u9762\u4E09\u6837\u4E4B\u4E00\uFF1A\u4E0D\u53D1\u58F0\u7684\u5F26\u538B\u6697\uFF08\u4E24\u79CD\u73A9\u6CD5\u90FD\u6709\uFF0CA \u662F\u300C\u9898\u9762\u5DF2\u538B\u6697\u300D\uFF0CB \u662F\u9898\u9762\u672C\u8EAB\uFF09 */
    paint.dimCols = chordDimStrings(item);

    if (play === 'b') {
      /* B \u73A9\u6CD5\uFF1A\u9898\u9762 = \u4E00\u6574\u6761\u6307\u6CD5\uFF0C\u4E2D\u6027\u8272\u3001\u53EA\u8BFB\u3001\u4E0D\u753B\u6700\u4F4E\u6309\u54C1\u4EAE\u6846\uFF08\u00A74.7\uFF09\u3002
         \u7B49\u5F85\u5F00\u59CB\u9636\u6BB5\u5FC5\u987B\u4EC0\u4E48\u70B9\u90FD\u4E0D\u753B \u2014\u2014 \u6307\u677F\u672C\u8EAB\u5C31\u662F\u8FD9\u9053\u9898\u7684\u9898\u9762\uFF0C
         \u906E\u7F69\u8FD8\u6CA1\u70B9\u5F00\u5C31\u753B\u51FA\u6765\u7B49\u4E8E\u63D0\u524D\u6CC4\u9898\uFF08\u00A74.7.4 \u9632\u6CC4\u9898\u7B2C 2 \u6761\uFF09\u3002 */
      if (chordRound.waitStart) { boardSvg.paint(paint, 'chordFretboard'); return; }
      item.fr.forEach((f, i) => {
        if (f >= 0) paint.marks.push({ s: 6 - i, f: f, kind: 'given' });
      });
      if (item.barre > 0) {
        const sp = chordSoundingSpan(item.fr);
        if (sp.s1 && sp.s2 > sp.s1) {
          paint.barres.push({ s1: sp.s1, s2: sp.s2, f: item.barre, kind: 'given' });
        }
      }
      boardSvg.paint(paint, 'chordFretboard');
      return;
    }

    /* \u2014\u2014 A \u73A9\u6CD5 \u2014\u2014 */
    /* \u9898\u9762\u4E09\u6837\u4E4B\u4E8C\uFF1A\u6700\u4F4E\u6309\u54C1\u90A3\u4E00\u884C\u753B\u4EAE\u6846\uFF08\u4EE3\u66FF\u5DE6\u4FA7\u8D77\u59CB\u54C1\u906E\u7F69\uFF09 */
    if (item.minF > 0) paint.band = item.minF;

    const frets = chordRound.frets || [];

    if (chordRound.state === 'asking' && !chordRound.waitStart) {
      /* \u7B54\u9898\u4E2D\uFF1A\u7528\u6237\u6446\u7684\u843D\u5B50\uFF08\u6A59\u8272\uFF09\u3002\u9489\u5B50\u5355\u72EC\u4E00\u79CD\u989C\u8272\uFF0C\u4E0D\u753B\u6210\u843D\u5B50\u3002 */
      for (let i = 0; i < 6; i++) {
        const f = frets[i];
        if (f == null || f < 0) continue;
        const s = 6 - i;
        if (item.pins.indexOf(s) >= 0) continue;   // \u9489\u5B50\u4E0B\u9762\u5355\u72EC\u753B
        paint.picks.push({ s: s, f: f });
      }
    } else if (chordRound.state === 'answered') {
      /* \u7B54\u5B8C\uFF1A\u9010\u5F26\u548C\u9898\u5E93\u90A3\u4E00\u884C\u6BD4\u3002
         answer = \u4E0E\u7B54\u6848\u76F8\u540C\uFF1Bwrong = \u6446\u4E86\u4F46\u7B54\u6848\u4E0D\u8FD9\u4E48\u6446\uFF1B
         missed = \u7B54\u6848\u8981\u54CD\u4F46\u7528\u6237\u6CA1\u6446\uFF08\u53EA\u5728\u7B54\u9519\u65F6\u6807\uFF0C\u7B54\u5BF9\u65F6\u4E0D\u5B58\u5728\uFF09\u3002 */
      const ans = chordRound.answer || item.fr;
      for (let i = 0; i < 6; i++) {
        const want = ans[i];
        const got = frets[i];
        const s = 6 - i;
        if (got != null && got >= 0) {
          paint.marks.push({ s: s, f: got, kind: got === want ? 'answer' : 'wrong' });
        } else if (want >= 0 && chordRound.lastOk === false) {
          paint.marks.push({ s: s, f: want, kind: 'missed' });
        }
      }
    }

    /* \u9489\u5B50\uFF1A\u7B2C\u4E09\u79CD\u989C\u8272\uFF08\u7070\u84DD\uFF09\uFF0C\u6C38\u8FDC\u538B\u5728\u5176\u5B83\u6807\u8BB0\u4E0A\u9762 \u2014\u2014 \u9489\u5B50\u4E0D\u53EF\u6539\uFF0C
       \u7528\u6237\u8981\u4E00\u773C\u770B\u51FA\u300C\u8FD9\u51E0\u6839\u4E0D\u662F\u6211\u6446\u7684\u300D\u3002\u770B\u7B54\u6848\u540E\u4E5F\u4FDD\u7559\u3002 */
    item.pins.forEach((s) => {
      const f = item.fr[6 - s];
      if (f >= 0) paint.marks.push({ s: s, f: f, kind: 'pin' });
    });

    /* \u7528\u6237\u6446\u7684\u6A2A\u6309 */
    (chordRound.barres || []).forEach((b) => {
      if (item.pins.indexOf(b.s1) >= 0 && item.pins.indexOf(b.s2) >= 0) return;
      paint.barres.push({ s1: b.s1, s2: b.s2, f: b.f, kind: 'picked' });
    });

    /* \u770B\u7B54\u6848 / \u7B2C\u4E8C\u6B21\u7B54\u9519\uFF1A\u628A\u7B54\u6848\u6574\u6761\u753B\u51FA\u6765 */
    if (chordRound.revealAnswer && chordRound.answer) {
      const ans = chordRound.answer;
      for (let i = 0; i < 6; i++) {
        const f = ans[i];
        if (f < 0) continue;
        const s = 6 - i;
        if (item.pins.indexOf(s) >= 0) continue;    // \u9489\u5B50\u5DF2\u7ECF\u753B\u4E86
        paint.marks.push({ s: s, f: f, kind: 'answer' });
      }
      if (item.barre > 0) {
        const sp = chordSoundingSpan(ans);
        if (sp.s1 && sp.s2 > sp.s1) {
          paint.barres.push({ s1: sp.s1, s2: sp.s2, f: item.barre, kind: 'answer' });
        }
      }
    }

    /* \u6A2A\u6309\u8986\u76D6\u7684\u5F26\u4E0A\u4E0D\u518D\u753B\u540C\u54C1\u5706\u70B9\uFF1A\u4E00\u6839\u6A2A\u6309\u5DF2\u7ECF\u628A\u8FD9\u51E0\u6839\u5F26\u538B\u5728\u4E00\u8D77\u4E86\uFF0C
       \u518D\u53E0\u4E00\u6392\u5706\u70B9\u4F1A\u7CCA\u6210\u4E00\u4E32\u73E0\u5B50\uFF0C\u770B\u4E0D\u51FA\u300C\u8FD9\u662F\u4E00\u6839\u624B\u6307\u300D\u3002
       \u53EA\u4E22\u6389\u300C\u4E2D\u6027/\u6B63\u786E\u300D\u90A3\u4E00\u7C7B\u5706\u70B9\uFF08picks / given / answer\uFF09\u2014\u2014
       wrong / missed / pin \u5FC5\u987B\u4FDD\u7559\uFF0C\u90A3\u662F\u300C\u8FD9\u91CC\u9519\u4E86\u300D\u7684\u4FE1\u606F\uFF0C\u76D6\u5728\u8DD1\u9053\u4E0A\u4E5F\u5F97\u770B\u5F97\u89C1\u3002 */
    if (paint.barres.length) {
      const cov = {};
      paint.barres.forEach((b) => {
        const lo = Math.min(b.s1, b.s2);
        const hi = Math.max(b.s1, b.s2);
        for (let s = lo; s <= hi; s += 1) cov[s] = Number(b.f);
      });
      const drop = (p) => cov[p.s] != null && Number(cov[p.s]) === Number(p.f)
        && (p.kind == null || p.kind === 'given' || p.kind === 'answer');
      paint.picks = paint.picks.filter((p) => !drop(p));
      paint.marks = paint.marks.filter((p) => !drop(p));
    }

    /* \u62D6\u52A8\u9884\u89C8\uFF1A\u753B\u5728\u843D\u5B50\u4E0B\u9762\uFF0C\u8FD8\u6CA1\u843D\u5B50\u3002
       \u5F62\u6001\u4E0E\u627E\u4F4D\u7F6E\u6A21\u5F0F\u5B8C\u5168\u4E00\u81F4\uFF08.bm.hover \u534A\u900F\u660E\u5706 + \u62D6\u52A8\u4E2D\u7684\u6A2A\u6309\u8DD1\u9053\uFF09\u2014\u2014
       \u4E24\u4E2A\u6A21\u5F0F\u5728\u540C\u4E00\u5F20\u6307\u677F\u4E0A\uFF0C\u9F20\u6807\u53CD\u9988\u5C31\u8BE5\u957F\u4E00\u6837\uFF0C\u4E0D\u7136\u6765\u56DE\u5207\u4F1A\u89C9\u5F97\u662F\u4E24\u4E2A\u8F6F\u4EF6\u3002 */
    if (chordRound.preview) {
      paint.hover = chordRound.preview;
    } else if (board.hover && chordRound.state === 'asking' && !chordRound.waitStart
      && !chordBarreCovers(board.hover.s, board.hover.f)) {
      /* \u9F20\u6807\u505C\u5728\u683C\u5B50\u4E0A\uFF08\u672A\u6309\u4E0B\uFF09\uFF1A\u540C\u6837\u7684\u5F31\u63D0\u793A\u3002
         \u88AB\u6A2A\u6309\u76D6\u4F4F\u7684\u683C\u5B50\u8DF3\u8FC7 \u2014\u2014 \u90A3\u91CC\u5DF2\u7ECF\u6709\u8DD1\u9053\u4E86\uFF08\u89C1 bindChordBoard \u91CC\u7684\u540C\u4E00\u6761\u5224\u65AD\uFF09\u3002 */
      paint.hover = board.hover;
    }
    if (chordRound.previewBarre) paint.hoverBarre = chordRound.previewBarre;

    boardSvg.paint(paint, 'chordFretboard');
  }

  /** \u548C\u5F26\u6A21\u5F0F\u6307\u677F\u91CD\u7ED8\u5165\u53E3\uFF08\u4E0E renderFretboard \u5206\u5F00\uFF0C\u907F\u514D\u8BEF\u89E6\u5355\u97F3\u903B\u8F91\uFF09 */
  function renderChordFretboard() {
    /* \u72B6\u6001\u6761\u4E0E\u6307\u677F\u5FC5\u987B\u5171\u7528\u540C\u4E00\u4EFD\u4E8B\u5B9E\u6765\u6E90\uFF08chordRound.frets\uFF09\uFF1A
       \u4EFB\u4F55\u6539\u52A8 frets \u7684\u5730\u65B9\u90FD\u8D70\u8FD9\u4E2A\u5165\u53E3\uFF0C\u8FD9\u6837\u300C\u6307\u677F\u53D8\u4E86\u4F46\u72B6\u6001\u6761\u6CA1\u53D8\u300D
       \u8FD9\u7C7B\u4E0D\u4E00\u81F4\u4E0D\u53EF\u80FD\u53D1\u751F\uFF08\u624B\u52A8\u9A8C\u6536\u65F6\u5C31\u8E29\u5230\u8FC7\uFF1A\u7A0B\u5E8F\u5224\u5BF9\uFF0C\u72B6\u6001\u6761\u5374\u8FD8\u662F\u5168 \u00D7\uFF09\u3002 */
    syncChordUI();
    if (typeof boardSvg !== 'undefined' && boardSvg.loaded) {
      drawChordFretboardSvg();
      return;
    }
    /* SVG \u4E0D\u53EF\u7528\u65F6\u548C\u5F26\u6A21\u5F0F\u65E0\u6CD5\u4EA4\u4E92\uFF08\u4E09\u6001\u9700\u8981\u7CBE\u786E\u547D\u4E2D\uFF09\uFF0C\u7ED9\u51FA\u660E\u786E\u63D0\u793A */
    const fb = $('#chordFeedback');
    if (fb && !fb.textContent) {
      fb.className = 'feedback chord-feedback info';
      fb.textContent = '\u6307\u677F\u56FE\u5F62\u672A\u80FD\u8F7D\u5165\uFF0C\u548C\u5F26\u6A21\u5F0F\u6682\u4E0D\u53EF\u7528\u3002\u8BF7\u7528\u9759\u6001\u670D\u52A1\u5668\u6253\u5F00\u9875\u9762\u3002';
    }
  }

  /* ---------------------------------------------------------------
   *  \u548C\u5F26\u6A21\u5F0F\u6446\u4F4D\uFF08\u7B56\u5212\u4E66 \u00A74.5\uFF09
   *
   *  \u5DE6\u952E\u62D6\u52A8 = \u6446\u4E00\u4E2A\u6309\u54C1\u70B9\uFF0C\u677E\u624B\u843D\u5B50\u5373\u9501\u5B9A\uFF08\u4E0D\u80FD\u518D\u62D6\u8D70\uFF0C\u70B9\u4E00\u4E0B\u53EF\u4EE5\u64A4\uFF09
   *  \u53F3\u952E\u62D6\u52A8 = \u753B\u6A2A\u6309\uFF0C\u677E\u624B\u9501\u5B9A\uFF1B\u5DE6\u952E\u70B9\u5DF2\u6709\u6A2A\u6309 = \u5220\u6389\u6574\u6761
   *  \u89E6\u5C4F\u6CA1\u6709\u53F3\u952E \u2192 \u7528\u300C\u6A2A\u6309\u6A21\u5F0F\u300D\u5F00\u5173\u66FF\u4EE3
   *  \u9489\u5B50\u5F26\u4E0D\u53EF\u6539\uFF1B\u975E\u53D1\u58F0\u5F26\uFF08\u9898\u9762\u5DF2\u538B\u6697\uFF09\u4E0D\u63A5\u53D7\u843D\u5B50
   * --------------------------------------------------------------- */

  /** \u8FD9\u6839\u5F26\u662F\u4E0D\u662F\u9898\u76EE\u9489\u4F4F\u7684\uFF08\u9489\u5B50\u4E0D\u53EF\u6539\uFF09 */
  function chordIsPinned(s) {
    const item = chordRound.current;
    return !!(item && item.pins.indexOf(s) >= 0);
  }

  /** \u8FD9\u6839\u5F26\u5728\u8FD9\u9053\u9898\u91CC\u5141\u8BB8\u53D1\u58F0\u5417\uFF08\u9898\u9762\u538B\u6697\u7684\u5F26\u4E0D\u63A5\u53D7\u843D\u5B50\uFF09 */
  function chordStringAllowed(s) {
    const item = chordRound.current;
    if (!item) return false;
    return item.fr[6 - s] >= 0;
  }

  /** \u70B9\u843D\u5728\u54EA\u6761\u5DF2\u6709\u6A2A\u6309\u4E0A */
  function chordBarreAt(cell) {
    const list = chordRound.barres || [];
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const b = list[i];
      const lo = Math.min(b.s1, b.s2);
      const hi = Math.max(b.s1, b.s2);
      if (cell.s >= lo && cell.s <= hi && cell.f === b.f) return i;
    }
    return -1;
  }

  /** \u8FD9\u4E00\u683C\u662F\u4E0D\u662F\u5DF2\u7ECF\u88AB\u67D0\u6761\u6A2A\u6309\u6309\u4F4F\uFF08\u7528\u6765\u5173\u6389\u60AC\u505C\u9884\u89C8\uFF09 */
  function chordBarreCovers(s, f) {
    return chordBarreAt({ s: s, f: f }) >= 0;
  }

  /** \u843D\u4E00\u4E2A\u6309\u54C1\u70B9\uFF08\u540C\u683C\u518D\u70B9 = \u64A4\u56DE\uFF09\u3002\u9489\u4F4F\u7684\u5F26\u62D2\u7EDD\u3002 */
  function chordPlace(s, f) {
    if (chordRound.state !== 'asking' || chordRound.waitStart) return false;
    if ((chordRound.play || 'a') !== 'a') return false;
    if (chordIsPinned(s)) return false;
    if (f < 0) return false;
    if (!chordStringAllowed(s)) return false;
    const idx = 6 - s;
    const cur = chordRound.frets[idx];
    chordRound.frets[idx] = (cur === f) ? -1 : f;
    /* \u843D\u5B50\u540E\u628A\u8FD9\u6761\u5F26\u4E0A\u6B8B\u7559\u7684\u6A2A\u6309\u64A4\u6389\uFF0C\u907F\u514D\u300C\u6A2A\u6309 + \u5355\u70B9\u300D\u53CC\u91CD\u6807\u8BB0 */
    chordRound.barres = (chordRound.barres || []).filter(
      (b) => !(s >= Math.min(b.s1, b.s2) && s <= Math.max(b.s1, b.s2) && b.f === f)
    );
    chordPreviewClick(idx, chordRound.frets[idx]);
    syncChordUI();
    renderChordFretboard();
    return true;
  }

  /** \u6E05\u6389\u67D0\u6839\u5F26\u7684\u843D\u5B50\uFF08\u6A2A\u6309\u4E5F\u6E05\uFF09 */
  function chordClearString(s) {
    if (chordRound.state !== 'asking' || chordRound.waitStart) return false;
    if ((chordRound.play || 'a') !== 'a') return false;
    if (chordIsPinned(s)) return false;
    const idx = 6 - s;
    chordRound.frets[idx] = -1;
    chordRound.barres = (chordRound.barres || []).filter(
      (b) => !(s >= Math.min(b.s1, b.s2) && s <= Math.max(b.s1, b.s2))
    );
    syncChordUI();
    renderChordFretboard();
    return true;
  }

  /** \u70B9\u5F26\u53D1\u58F0\uFF08\u5E2E\u52A9\u786E\u8BA4\u97F3\u9AD8\uFF09\uFF1B\u9489\u5B50\u4E0E\u9759\u97F3\u4E0D\u54CD */
  function chordPreviewClick(idx, f) {
    if (f == null || f < 0) return;
    if (store.settings.chordClickSound === false) return;
    if (soundOf('chord').muted) return;
    const T = chordTheory();
    if (!T) return;
    const midi = T.STANDARD_TUNING[idx] + f;
    ensureAudio().then(() => { audio.play(midi, 0.5); });
  }

  /**
   * \u753B\u4E00\u6761\u6A2A\u6309\uFF1As1..s2 \u4E4B\u95F4\u6BCF\u6839\u5F26\u90FD\u8981\u53D1\u58F0\u4E14\u4E0D\u662F\u9489\u5B50\uFF0C\u4E14\u540C\u54C1\u3002
   * \u4E0D\u884C\u5C31\u8FD4\u56DE false\uFF08\u4E0D\u843D\u5B50\uFF09\u3002
   */
  function chordAddBarre(s1, s2, f) {
    if (chordRound.state !== 'asking' || chordRound.waitStart) return false;
    if ((chordRound.play || 'a') !== 'a') return false;
    if (!(f > 0)) return false;
    const lo = Math.min(s1, s2);
    const hi = Math.max(s1, s2);
    if (hi - lo < 1) return false;
    for (let s = lo; s <= hi; s += 1) {
      if (chordIsPinned(s)) return false;
      if (!chordStringAllowed(s)) return false;
    }
    /* \u6A2A\u6309\u8986\u76D6\u7684\u5F26\u6539\u6210\u540C\u54C1\uFF0C\u5E76\u6E05\u6389\u8FD9\u4E9B\u5F26\u4E0A\u7684\u5355\u70B9 */
    for (let s = lo; s <= hi; s += 1) chordRound.frets[6 - s] = f;
    chordRound.barres = (chordRound.barres || []).filter((b) => {
      const blo = Math.min(b.s1, b.s2);
      const bhi = Math.max(b.s1, b.s2);
      return bhi < lo || blo > hi;
    });
    chordRound.barres.push({ s1: lo, s2: hi, f: f });
    chordPreviewClick(6 - lo, f);
    syncChordUI();
    renderChordFretboard();
    return true;
  }

  /** \u517C\u5BB9\u65E7\u5165\u53E3\uFF08\u72B6\u6001\u6761\u70B9\u51FB = \u8BE5\u5F26\u5207\u56DE\u9759\u97F3\uFF09 */
  function chordMuteString(s) {
    chordClearString(s);
  }

  /** \u5168\u90E8\u9759\u97F3\uFF08Backspace\uFF09\uFF1A\u9489\u4F4F\u7684\u5F26\u4FDD\u7559 */
  function chordClearAll() {
    if (chordRound.state !== 'asking' || chordRound.waitStart) return;
    if ((chordRound.play || 'a') !== 'a') return;
    const item = chordRound.current;
    const next = [-1, -1, -1, -1, -1, -1];
    if (item) {
      item.pins.forEach((s) => { next[6 - s] = item.fr[6 - s]; });
    }
    chordRound.frets = next;
    chordRound.barres = [];
    syncChordUI();
    renderChordFretboard();
  }

  /** \u770B\u7B54\u6848\uFF1A\u628A\u7B54\u6848\u6574\u6761\u753B\u51FA\u6765\uFF08\u8BB0\u4E3A\u300C\u770B\u8FC7\u7B54\u6848\u300D\uFF0C\u7B56\u5212\u4E66 \u00A74.6\uFF09 */
  function chordRevealAnswer() {
    if (chordRound.state !== 'asking' || chordRound.waitStart) return false;
    if ((chordRound.play || 'a') !== 'a') return false;
    chordRound.revealed = true;
    chordRound.revealAnswer = true;
    const item = chordRound.current;
    if (!item) return false;
    const ans = chordRound.answer || item.fr;
    const next = ans.slice();
    item.pins.forEach((s) => { next[6 - s] = ans[6 - s]; });
    chordRound.frets = next;
    chordRound.barres = [];
    const sp = chordSoundingSpan(ans);
    if (item.barre > 0 && sp.s1 && sp.s2 > sp.s1) {
      chordRound.barres.push({ s1: sp.s1, s2: sp.s2, f: item.barre });
    }
    chordRound.interactive = false;
    renderChordFretboard();
    renderChordFeedback(false, false, chordRound.verdict || { errors: [] });
    if (item.barre > 0 && (chordRound.snap ? chordRound.snap.autoBarreHint : true)) revealBarreTips();
    /* \u770B\u7B54\u6848 = \u672C\u9898\u6CA1\u7B54\u5BF9\uFF0C\u4F46\u8981\u505C\u4F4F\u7B49\u7528\u6237\u70B9\u300C\u4E0B\u4E00\u9898\u300D */
    chordRound.submitted = true;
    chordRound.state = 'answered';
    chordRound.lastOk = false;
    if (chordRound.timer) { clearInterval(chordRound.timer); chordRound.timer = null; }
    /* \u770B\u7B54\u6848\u4E5F\u7B97\u300C\u672C\u8F6E\u8FD9\u4E00\u9898\u7ED3\u675F\u4E86\u300D\uFF1A\u56FE3 \u7684\u5DF2\u5B8C\u6210\u662F\u6309 key \u53BB\u91CD\u7684\u5DF2\u7ED3\u675F\u9898\u6570\uFF0C
       \u4E0D\u8BB0\u8FD9\u4E00\u7B14\u7684\u8BDD\uFF0C\u4E00\u8DEF\u770B\u7B54\u6848\u8DD1\u5B8C\u4E00\u8F6E\uFF0C\u4FA7\u680F\u4F1A\u505C\u5728\u300C\u5DF2\u5B8C\u6210 0 / N\u3001\u5269\u4F59 N \u9898\u300D\u3002
       \u6CE8\u610F\u53EA\u8BB0\u5B8C\u6210\u5EA6\uFF0C\u4E0D\u8BB0\u5BF9\u9519 \u2014\u2014 \u5361\u7247 / \u56FE2 / \u5386\u53F2\u4ECD\u7136\u4E0D\u52A8\uFF08\u8FD9\u4E0D\u662F\u4E00\u6B21\u4F5C\u7B54\uFF09\u3002 */
    if (chordRound.snapshot && item.key) chordRound.snapshot.done.add(item.key);
    save();
    renderChordPrompt();
    renderChordOptions();
    syncChordUI();
    renderChordReference();
    renderSidebar();
    const nextBtn = $('#chordNext');
    if (nextBtn) { nextBtn.hidden = false; nextBtn.textContent = '\u770B\u61C2\u4E86\uFF0C\u4E0B\u4E00\u9898 \u203A'; }
    return true;
  }

  let rafPending = false;
  function renderFretboard() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      /* SVG \u8FD8\u6CA1\u5C31\u7EEA\u65F6\u8DF3\u8FC7\uFF0C\u7B49\u5B83\u5C31\u7EEA\u540E\u7EDF\u4E00\u91CD\u7ED8 */
      if (typeof boardSvg !== 'undefined' && !boardSvg.loaded) return;
      drawFretboardSvg();
    });
  }

  /* ---------------------------------------------------------------
   *  \u6307\u677F\u4EA4\u4E92
   * --------------------------------------------------------------- */

  /* \u7EDF\u4E00\u547D\u4E2D\u5165\u53E3\uFF1A\u5750\u6807\u6362\u7B97\u4E0E\u683C\u5B50\u5224\u5B9A\u90FD\u4EA4\u7ED9 boardSvg\uFF08\u5B83\u6309 viewBox \u7B97\uFF0C\u4E0E\u8303\u56F4\u65E0\u5173\uFF09 */
  function boardHit(cv, ev) {
    if (typeof boardSvg === 'undefined' || !boardSvg.loaded) return null;
    return boardSvg.hitTest(ev.clientX, ev.clientY, cv.id || 'fretboard');
  }

  // \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1A\u70B9\u51FB = \u9009\u4E2D/\u53D6\u6D88\u4E00\u4E2A\u683C\u5B50\uFF08\u4E0D\u518D\u7528\u201C\u540C\u5F26\u6216\u540C\u54C1\u201D\u7684\u5BBD\u677E\u5224\u5B9A\uFF09
  function bindPosBoard(cv) {
    if (!cv) return;
    cv.addEventListener('pointermove', (ev) => {
      if (store.settings.mode !== 'pos') return;
      // \u968F\u610F\u70B9\u51FB\u6A21\u5F0F\u4E0B\u4E0D\u505A hover \u63CF\u8FB9\uFF08\u4E0D\u4EA7\u751F\u4EFB\u4F55\u6807\u8BB0\uFF09
      const canHover = round.state === 'asking' && !round.waitStart && !store.settings.posFreeClick;
      const hit = canHover ? boardHit(cv, ev) : null;
      const changed = (!!hit !== !!board.hover) || (hit && board.hover && (hit.s !== board.hover.s || hit.f !== board.hover.f));
      board.hover = hit;
      if (changed) renderFretboard();
    });
    cv.addEventListener('pointerleave', () => { board.hover = null; renderFretboard(); });
    cv.addEventListener('click', (ev) => {
      if (store.settings.mode !== 'pos') return;
      const cell = boardHit(cv, ev);
      if (!cell) return;
      // \u968F\u610F\u70B9\u51FB\uFF08\u8C03\u8BD5\uFF09\uFF1A\u53EA\u53D1\u58F0\uFF0C\u4E0D\u5224\u5206\u3001\u4E0D\u7559\u6807\u8BB0\uFF0C\u4EFB\u4F55\u72B6\u6001\u4E0B\u90FD\u53EF\u70B9
      if (store.settings.posFreeClick) { freeClickPlay(cell); return; }
      if (round.state !== 'asking') return;
      if (round.waitStart) { beginQuestion(); return; }   // \u70B9\u6307\u677F\u4E5F\u80FD\u5F00\u59CB\u8BA1\u65F6
      togglePick(cell);
    });
  }
  bindPosBoard(boardHostPos);

  /* ---------------------------------------------------------------
   *  \u548C\u5F26\u6A21\u5F0F\u6307\u677F\u624B\u52BF\uFF08\u7B56\u5212\u4E66 \u00A74.5\uFF09
   *
   *  pointerdown \u2192 \u8D77\u62D6\uFF1Bpointermove \u2192 \u53EA\u753B\u9884\u89C8\uFF08\u5438\u9644\u54C1\u683C\u5E26\u4E2D\u7EBF\u3001\u53EA\u5438\u9644\u8BB8\u53EF\u5F26\uFF09\uFF1B
   *  pointerup \u2192 \u843D\u5B50\u5373\u9501\u5B9A\u3002\u5DE6\u952E\u62D6\u6C38\u8FDC\u662F\u5355\u70B9\uFF0C\u53F3\u952E\u62D6\u624D\u662F\u6A2A\u6309\u3002
   *  \u5DE6\u952E\u70B9\u5DF2\u6709\u6A2A\u6309 = \u5220\u6389\u6574\u6761\u3002\u89E6\u5C4F\u7528\u300C\u6A2A\u6309\u6A21\u5F0F\u300D\u5F00\u5173\u5207\u5230\u753B\u6A2A\u6309\u3002
   *  \u7B49\u5F85\u5F00\u59CB\u65F6\u8FD9\u4E00\u4E0B\u53EA\u8D1F\u8D23\u5F00\u59CB\u8BA1\u65F6\uFF0C\u4E0D\u843D\u5B50\uFF08\u5426\u5219\u4F1A\u8BEF\u9009\u4E00\u683C\uFF09\u3002
   * --------------------------------------------------------------- */
  let chordDrag = null;

  function chordDragClean() {
    chordDrag = null;
    chordRound.preview = null;
    chordRound.previewBarre = null;
  }

  function bindChordBoard(cv) {
    if (!cv) return;

    cv.addEventListener('contextmenu', (ev) => {
      if (store.settings.mode !== 'chord') return;
      ev.preventDefault();          // \u53F3\u952E\u7559\u7ED9\u6A2A\u6309\uFF0C\u4E0D\u5F39\u83DC\u5355
    });

    cv.addEventListener('pointerdown', (ev) => {
      if (store.settings.mode !== 'chord') return;
      if (chordRound.state !== 'asking' || chordRound.waitStart) return;
      if ((chordRound.play || 'a') !== 'a') return;         // B \u73A9\u6CD5\u53EA\u8BFB
      if (ev.button !== 0 && ev.button !== 2) return;
      const cell = boardHit(cv, ev);
      if (!cell) return;

      /* \u5DE6\u952E\u70B9\u5728\u5DF2\u6709\u6A2A\u6309\u4E0A = \u5220\u6389\u6574\u6761\uFF08\u7B56\u5212\u4E66 \u00A74.5\uFF09 */
      if (ev.button === 0) {
        const bi = chordBarreAt(cell);
        if (bi >= 0) {
          chordRound.barres.splice(bi, 1);
          syncChordUI();
          renderChordFretboard();
          return;
        }
      }

      const wantBarre = ev.button === 2 || !!chordRound.barreMode;
      chordDrag = {
        id: ev.pointerId,
        barre: wantBarre,
        start: cell,
        last: cell,
        moved: false,
        x0: ev.clientX,
        y0: ev.clientY,
      };
      try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* \u8001\u6D4F\u89C8\u5668\u5FFD\u7565 */ }
    });

    cv.addEventListener('pointermove', (ev) => {
      if (store.settings.mode !== 'chord') return;

      /* \u62D6\u52A8\u4E2D\uFF1A\u53EA\u66F4\u65B0\u9884\u89C8\uFF0C\u4E0D\u843D\u5B50 */
      if (chordDrag && chordDrag.id === ev.pointerId) {
        const dx = ev.clientX - chordDrag.x0;
        const dy = ev.clientY - chordDrag.y0;
        if (!chordDrag.moved && Math.abs(dx) + Math.abs(dy) > 4) chordDrag.moved = true;
        const cell = boardHit(cv, ev);
        if (!cell) return;
        chordDrag.last = cell;
        if (chordDrag.barre) {
          const f = chordDrag.start.f;
          if (f > 0) {
            const s1 = Math.min(chordDrag.start.s, cell.s);
            const s2 = Math.max(chordDrag.start.s, cell.s);
            chordRound.previewBarre = { s1: s1, s2: s2, f: f };
            /* \u6A2A\u6309\u9884\u89C8\u65F6\u4E0D\u8981\u5355\u70B9\u9884\u89C8\uFF0C\u4E24\u4E2A\u4E00\u8D77\u753B\u4F1A\u82B1 */
            chordRound.preview = null;
          } else {
            chordRound.preview = cell;
          }
        } else {
          /* \u5355\u70B9\u62D6\u52A8\uFF1A\u53EA\u5438\u9644\u5230\u8BB8\u53EF\u5F26\u4E0E\u54C1\u683C\u5E26\u4E2D\u7EBF */
          chordRound.preview = { s: cell.s, f: cell.f };
          chordRound.previewBarre = null;
        }
        renderChordFretboard();
        return;
      }

      /* \u672A\u6309\u4E0B\uFF1A\u5F31\u63D0\u793A\uFF08\u672C\u6765\u5C31\u6709\u7684 hover\uFF09\u3002
         \u88AB\u5DF2\u6709\u6A2A\u6309\u76D6\u4F4F\u7684\u683C\u5B50\u4E0D\u7ED9\u9884\u89C8\u6846 \u2014\u2014 \u90A3\u91CC\u5DF2\u7ECF\u6709\u6839\u624B\u6307\u4E86\uFF0C
         \u518D\u98D8\u4E00\u4E2A\u865A\u7EBF\u6846\u4F1A\u50CF\u662F\u300C\u8FD9\u91CC\u8FD8\u80FD\u518D\u70B9\u4E00\u4E0B\u300D\uFF08\u7528\u6237 m05376 \u53CD\u9988\uFF09\u3002 */
      const canHover = chordRound.state === 'asking' && !chordRound.waitStart
        && (chordRound.play || 'a') === 'a';
      const raw = canHover ? boardHit(cv, ev) : null;
      const hit = (raw && chordBarreCovers(raw.s, raw.f)) ? null : raw;
      const changed = (!!hit !== !!board.hover)
        || (hit && board.hover && (hit.s !== board.hover.s || hit.f !== board.hover.f));
      board.hover = hit;
      if (changed) renderChordFretboard();
    });

    const finish = (ev, cancelled) => {
      if (!chordDrag || chordDrag.id !== ev.pointerId) return;
      const drag = chordDrag;
      chordDragClean();
      if (cancelled) { renderChordFretboard(); return; }
      try { cv.releasePointerCapture(ev.pointerId); } catch (e) { /* ignore */ }

      if (drag.barre) {
        const f = drag.start.f;
        if (f > 0 && drag.moved) {
          const s1 = Math.min(drag.start.s, drag.last.s);
          const s2 = Math.max(drag.start.s, drag.last.s);
          chordAddBarre(s1, s2, f);
        } else if (f >= 0) {
          /* \u6CA1\u62D6\u52A8 = \u5F53\u6210\u666E\u901A\u5355\u70B9 */
          chordPlace(drag.start.s, f);
        }
      } else {
        /* \u62D6\u52A8\u8FC7\u5C31\u5728\u677E\u624B\u7684\u90A3\u4E00\u683C\u843D\u5B50\uFF08\u62D6\u52A8\u671F\u95F4\u53EA\u753B\u9884\u89C8\uFF0C\u89C1 pointermove\uFF09\u3002
           \u843D\u70B9\u4ECE\u8D77\u70B9\u6539\u5230\u7EC8\u70B9\uFF0C\u662F\u4E3A\u4E86\u8BA9\u300C\u6309\u4F4F\u62D6\u5230\u60F3\u8981\u7684\u4F4D\u7F6E\u518D\u677E\u624B\u300D\u7B26\u5408\u76F4\u89C9\uFF1B
           \u62D6\u5230\u4E0D\u8BB8\u843D\u5B50\u7684\u683C\u5B50\u65F6 chordPlace \u81EA\u5DF1\u4F1A\u62D2\u6536\u3002 */
        const land = drag.moved && drag.last ? drag.last : drag.start;
        if (land.f >= 0) chordPlace(land.s, land.f);
      }
      renderChordFretboard();
    };

    cv.addEventListener('pointerup', (ev) => finish(ev, false));
    cv.addEventListener('pointercancel', (ev) => finish(ev, true));
    cv.addEventListener('pointerleave', () => {
      if (store.settings.mode !== 'chord') return;
      if (chordDrag) return;              // \u62D6\u52A8\u4E2D\u79BB\u5F00\u4E0D\u7B97\u79BB\u5F00
      board.hover = null;
      renderChordFretboard();
    });

    /* \u7B49\u5F85\u5F00\u59CB\uFF1A\u70B9\u4E00\u4E0B\u6307\u677F\u5C31\u5F00\u59CB\uFF08\u4E0E\u70B9\u906E\u7F69\u6309\u94AE\u7B49\u4EF7\uFF09 */
    cv.addEventListener('click', (ev) => {
      if (store.settings.mode !== 'chord') return;
      if (!chordRound.waitStart) return;
      ev.preventDefault();
      beginChordQuestion();
    });
  }
  bindChordBoard(boardHostChord);
  bindIntervalBoard(boardHostInterval);
  bindChordTipLayer();


  /* ---------------------------------------------------------------
   *  \u4FA7\u8FB9\u680F\uFF1A\u56FE2 \u4F5C\u7B54\u603B\u89C8 / \u56FE3 \u672C\u8F6E\u5206\u5E03 / \u56FE1 \u5F53\u524D\u638C\u63E1 / \u56FE4 \u590D\u4E60\u5B89\u6392
   *
   *  \u8FD9\u91CC\u53EA\u6709\u300C\u8BFB store + \u5199 DOM\u300D\uFF0C\u4E0D\u6539\u4EFB\u4F55\u5B66\u4E60\u6570\u636E \u2014\u2014
   *  \u5199\u5165\u70B9\u5728\u5224\u5B9A\u51FD\u6570\u91CC\uFF08bumpModeStats / bumpPosUnit / posBStats\uFF09\u3002
   *  \u56DB\u5757\u9762\u677F \u00D7 \u56DB\u4E2A\u6A21\u5F0F\uFF0Cid \u524D\u7F00 sn / sp / sc / si\uFF08D24\uFF09\u3002
   * --------------------------------------------------------------- */

  const DASH = '\u2014';
  const SIDE_PREFIX = { note: 'sn', pos: 'sp', chord: 'sc', interval: 'si' };

  /* ---- \u683C\u5F0F\u5316\uFF1A\u6240\u6709 textContent \u90FD\u5FC5\u987B\u7ECF\u8FC7\u8FD9\u4E09\u4E2A\u4E4B\u4E00\uFF08D7 / \u00A76.4\uFF09 ---- */
  function fmtInt(n) {
    const v = Number(n);
    return Number.isFinite(v) ? String(Math.round(v)) : DASH;
  }
  function fmtPct(n, d) {
    if (!d) return DASH;
    const v = Number(n) / Number(d);
    return Number.isFinite(v) ? String(Math.round(v * 100)) + '%' : DASH;
  }
  function fmtRatio(n, d) {
    return d ? fmtInt(n) + ' / ' + fmtInt(d) : DASH;
  }

  /* ---- \u6570\u636E\u8BBF\u95EE ---- */
  function modeStatOf(mode) {
    const m = MODE_STAT_KEYS.indexOf(mode) >= 0 ? mode : 'note';
    if (!store.modeStats[m]) store.modeStats[m] = blankModeStat();
    return store.modeStats[m];
  }
  /** \u53EA\u8BFB\uFF1A\u627E\u4E0D\u5230\u5C31\u8FD4\u56DE null\uFF0C\u7EDD\u4E0D\u5728\u6E32\u67D3\u65F6\u65B0\u5EFA\u7A7A\u6761\u76EE */
  function posUnitStatGet(key) {
    const st = key ? store.posUnitStats[key] : null;
    return st || null;
  }
  function cardOfMode(mode, key) {
    if (!key) return null;
    if (mode === 'chord') return store.chordCards[key] || null;
    if (mode === 'interval') return store.intervalCards[key] || null;
    if (mode === 'pos') return store.posCards[key] || null;
    return store.cards[key] || null;
  }
  /** \u638C\u63E1\u7B49\u7EA7 0\u20137 \u2192 \u5FBD\u7AE0\u914D\u8272\uFF1A0 \u7070 / 1\u20132 \u7EA2 / 3\u20134 \u7425\u73C0 / 5\u20137 \u7EFF\uFF08D14\uFF09 */
  function levelClass(lvl) {
    const v = clamp(Math.round(Number(lvl) || 0), 0, SRS_INTERVALS.length);
    if (v <= 0) return 'neutral';
    if (v <= 2) return 'bad';
    if (v <= 4) return 'warn';
    return 'ok';
  }
  function levelBadgeText(lvl) {
    const v = clamp(Math.round(Number(lvl) || 0), 0, SRS_INTERVALS.length - 1);
    return v <= 0 ? '\u672A\u63A5\u89E6' : '\u638C\u63E1 \u00B7 ' + LEVEL_LABEL[v];
  }
  /** \u9519\u8BEF\u7387\u4E09\u6863\uFF1A<10% \u7EFF / 10\u201325% \u7425\u73C0 / >25% \u7EA2\uFF08D27\uFF09 */
  function errClassOf(rate) {
    if (rate === null) return 'neutral';
    return rate < 10 ? 'ok' : rate <= 25 ? 'warn' : 'bad';
  }

  /* ---- \u901A\u7528\u5C0F\u5DE5\u5177 ---- */
  /* \u4FA7\u680F\u53EA\u8BFB DOM\uFF1A\u7528\u5C40\u90E8\u5305\u88C5\u800C\u4E0D\u662F\u76F4\u63A5\u8C03 document.getElementById\uFF0C
     \u8FD9\u6837 Node \u91CC\u7684\u6781\u7B80 DOM \u6869\uFF08\u53EA\u6709 querySelector\uFF09\u4E5F\u80FD\u8DD1\u901A\u3002 */
  function byId(id) {
    if (document && typeof document.getElementById === 'function') return document.getElementById(id);
    return document ? document.querySelector('#' + id) : null;
  }
  const SIDE_NUMBER_ID_RE = /^(?:sn|sp|sc|si)(?:RightN?|WrongN?|Rate|Best|Review|New|TotalN?|Done|Left|PctA|PctB|ErrRate|Recent)$/;
  function setText(id, text) {
    const el = byId(id);
    if (!el) return;
    const previous = el.textContent;
    const next = String(text);
    if (previous === next) return;
    el.textContent = next;
    if (!SIDE_NUMBER_ID_RE.test(id) || typeof el.setAttribute !== 'function') return;
    const before = String(previous).match(/-?\d+(?:\.\d+)?/);
    const after = next.match(/-?\d+(?:\.\d+)?/);
    const direction = before && after && Number(after[0]) < Number(before[0]) ? 'down' : 'up';
    if (typeof el.removeAttribute === 'function') el.removeAttribute('data-stat-motion');
    void el.offsetWidth;
    el.setAttribute('data-stat-motion', direction);
  }
  function setHidden(id, hidden) {
    const el = byId(id);
    if (el) el.hidden = !!hidden;
  }

  /* ---- \u56FE2\uFF1A\u56DB\u683C ---- */
  function renderQuad(p, d) {
    setText(p + 'Right', d.right);
    setText(p + 'Wrong', d.wrong);
    setText(p + 'Rate', d.rate);
    setText(p + 'Best', d.best);
    const note = byId(p + 'QuadEmpty');
    if (note) {
      note.hidden = !d.emptyText;
      note.textContent = d.emptyText || '';
    }
  }

  /* ---- \u56FE3\uFF1A\u672C\u8F6E\u5B66\u4E60\u5206\u5E03 ---- */
  function renderDist(p, snap, emptyText) {
    const review = snap ? snap.reviewKeys.size : 0;
    const fresh = snap ? snap.newKeys.size : 0;
    const total = snap ? snap.plan : 0;
    const done = snap ? snap.done.size : 0;
    const left = Math.max(0, total - done);
    setText(p + 'Review', fmtInt(review));
    setText(p + 'New', fmtInt(fresh));
    setText(p + 'Total', fmtInt(total));
    setText(p + 'Done', fmtInt(done) + ' / ' + fmtInt(total));
    setText(p + 'Left', fmtInt(left) + ' \u9898');
    const sum = review + fresh;
    setText(p + 'PctA', '\u590D\u4E60 ' + fmtPct(review, sum));
    setText(p + 'PctB', '\u65B0\u9898 ' + fmtPct(fresh, sum));
    const bar = byId(p + 'DistBar');
    if (bar) {
      const segA = bar.querySelector('.seg-a');
      const segB = bar.querySelector('.seg-b');
      const empty = sum === 0;
      bar.classList.toggle('is-empty', empty);
      if (segA) segA.style.width = empty ? '0%' : (review / sum * 100).toFixed(2) + '%';
      if (segB) segB.style.width = empty ? '0%' : (fresh / sum * 100).toFixed(2) + '%';
    }
    const note = byId(p + 'DistEmpty');
    if (note) {
      note.hidden = !emptyText;
      note.textContent = emptyText || '';
    }
  }

  /* ---- \u56FE1\uFF1A\u5F53\u524D\u9898\u76EE\u638C\u63E1\u60C5\u51B5 ---- */
  function renderCard(p, d) {
    const panel = byId(p + 'Card');
    const lvlEl = byId(p + 'Level');
    if (lvlEl) {
      if (d.badges) {
        /* \u627E\u4F4D\u7F6E\u73A9\u6CD5 B\uFF1A\u4E00\u7EC4\u5C0F\u5FBD\u7AE0\uFF08\u63D0\u4EA4\u540E\u624D\u6709\u5185\u5BB9\uFF0C\u89C1 D65\uFF09 */
        lvlEl.className = 'stat-badges';
        lvlEl.innerHTML = d.badges;
      } else {
        lvlEl.className = 'stat-badge ' + d.badgeClass;
        lvlEl.textContent = d.badgeText;
      }
    }
    setText(p + 'Target', d.target);
    setText(p + 'ErrRate', d.errRateText);
    const rateEl = byId(p + 'ErrRate');
    if (rateEl) rateEl.className = 'stat-err ' + d.errClass;
    const bar = byId(p + 'ErrBar');
    if (bar) {
      bar.className = 'fill ' + d.errClass;
      bar.style.width = (d.errWidth || 0) + '%';
    }
    setText(p + 'RightN', '\u6B63\u786E ' + fmtInt(d.right) + ' \u6B21');
    setText(p + 'WrongN', '\u9519\u8BEF ' + fmtInt(d.wrong) + ' \u6B21');
    setText(p + 'Recent', d.recentText);
    setText(p + 'TotalN', fmtInt(d.total));
    const hist = byId(p + 'HistNote');
    if (hist) hist.hidden = !d.histFull;
    const empty = byId(p + 'CardEmpty');
    if (empty) {
      empty.hidden = !d.emptyText;
      empty.textContent = d.emptyText || '';
      empty.classList.toggle('stat-empty-line', !!d.emptyText);
    }
    if (panel && typeof panel.setAttribute === 'function') {
      if (d.emptyText) panel.setAttribute('data-empty', '1');
      else if (typeof panel.removeAttribute === 'function') panel.removeAttribute('data-empty');
    }
  }

  /* ---- \u56FE4\uFF1A\u590D\u4E60\u5B89\u6392 ---- */
  function renderProb(p, d) {
    const panel = byId(p + 'Prob');
    const badge = byId(p + 'ProbBadge');
    if (badge) {
      badge.className = 'stat-badge ' + d.badgeClass;
      badge.textContent = d.badgeText;
    }
    setText(p + 'ProbState', d.state);
    const note = byId(p + 'ProbNote');
    if (note) {
      note.textContent = d.emptyText || d.note;
      note.classList.toggle('stat-empty-line', !!d.emptyText);
    }
    if (panel && typeof panel.setAttribute === 'function') {
      if (d.emptyText) panel.setAttribute('data-empty', '1');
      else if (typeof panel.removeAttribute === 'function') panel.removeAttribute('data-empty');
    }
  }

  /* ---- \u6982\u7387\u5FBD\u7AE0\uFF1A\u76F8\u5BF9\u6982\u7387 = \u672C\u5BF9\u8C61\u6743\u91CD \u00F7 \u6C60\u5185\u6743\u91CD\u548C ---- */
  function probBadge(weight, sum) {
    if (!sum || !Number.isFinite(weight)) return { text: DASH, cls: 'neutral' };
    const pct = weight / sum * 100;
    const text = '\u51FA\u73B0\u6982\u7387 ' + (pct < 5 ? '\u4F4E' : pct <= 12 ? '\u4E2D' : '\u9AD8');
    const cls = pct < 5 ? 'neutral' : pct <= 12 ? 'warn' : 'ok';
    return { text: text, cls: cls };
  }

  /** \u56FE4 \u5B9E\u65F6\u5224\u5B9A\uFF1A\u6709\u4F5C\u7B54\u5386\u53F2\u3001\u4E14\u6700\u8FD1\u4E00\u6B21\u4E0D\u662F\u7B54\u5BF9 \u2192 \u590D\u4E60\u9898\uFF08D55\uFF09 */
  function isReviewNow(mode, key) {
    if (mode === 'pos') {
      const st = posUnitStatGet(key);
      if (!st || !st.n) return false;
      const recent = Array.isArray(st.recent) ? st.recent : [];
      return !(recent.length && recent[recent.length - 1] === true);
    }
    const card = cardOfMode(mode, key);
    if (!card || !((card.a || 0) + (card.e || 0))) return false;
    const recent = Array.isArray(card.recent) ? card.recent : [];
    return !(recent.length && recent[recent.length - 1] === true);
  }

  /* ---- \u6982\u7387\u6C60\uFF1A\u4E0E build*Schedule() \u540C\u6E90\uFF0C\u4F46\u4E0D\u6392\u9664\u300C\u672C\u8F6E\u5DF2\u7528\u300D\uFF08D41\uFF09 ---- */
  function noteProbPool() {
    const cands = buildCandidates();
    if (store.settings.novelty !== 'familiar') return cands;
    const fam = cands.filter((c) => store.cards[c.key] && store.cards[c.key].a > 0);
    return fam.length >= 4 ? fam : cands;
  }
  function posProbPool() {
    const units = posUnits();
    if (store.settings.novelty !== 'familiar') return units;
    const fam = units.filter(posUnitSeen);
    return fam.length >= 4 ? fam : units;
  }

  function intervalNameOf(id) {
    const T = intervalTheory();
    const it = T && T.intervalById ? T.intervalById(id) : null;
    return it && it.name ? it.name : '\uFF1F';
  }
  function chordQualityLabel(qid) {
    const T = chordTheory();
    const q = T && T.qualityById ? T.qualityById(qid) : null;
    if (q && q.label) return q.label;
    /* \u9898\u5E93\u72EC\u6709\u7684 8 \u79CD\u8D28\u91CF\uFF085 / 6 / m6 / mM7 / 7sus4 / 9 / dim7 / m7\u266D5\uFF09\u5206\u6790\u5668\u4E0D\u8BA4\u8BC6\uFF0C
       \u4E2D\u6587\u540D\u76F4\u63A5\u4ECE\u9898\u5E93\u8868\u53D6\uFF0C\u522B\u9000\u56DE\u300C\uFF1F\u300D */
    const qi = bankQualityIndex(qid);
    const B = bankData();
    return (qi >= 0 && B) ? B.Q[qi][1] : '\uFF1F';
  }

  /* ================= \u97F3\u540D\u6A21\u5F0F ================= */
  function renderNoteSide() {
    const p = SIDE_PREFIX.note;
    const st = modeStatOf('note');
    const answered = st.right + st.wrong;
    renderQuad(p, {
      right: fmtInt(st.right),
      wrong: fmtInt(st.wrong),
      rate: fmtPct(st.right, answered),
      best: fmtInt(st.bestCombo),
      emptyText: answered === 0 ? '\u8FD8\u6CA1\u6709\u4F5C\u7B54\u8BB0\u5F55' : '',
    });

    const snap = round.snapshot || null;
    renderDist(p, snap, snap ? '' : '\u5F00\u59CB\u65B0\u4E00\u8F6E\u540E\u663E\u793A\u672C\u8F6E\u5206\u5E03');

    /* \u2014\u2014 \u56FE1 \u2014\u2014 */
    const q = round.current;
    const card = q ? store.cards[q.key] : null;
    if (!q) {
      renderCard(p, {
        badgeClass: 'neutral', badgeText: DASH, target: DASH,
        errRateText: DASH, errClass: 'neutral', errWidth: 0,
        right: 0, wrong: 0, recentText: DASH, total: 0, histFull: false,
        emptyText: (answered === 0 && !snap) ? '\u8FD8\u6CA1\u6709\u5F00\u59CB\u7EC3\u4E60' : '\u672C\u8F6E\u5DF2\u7ED3\u675F\uFF0C\u5F00\u59CB\u65B0\u4E00\u8F6E\u540E\u663E\u793A',
      });
    } else {
      const a = card ? (card.a || 0) : 0;
      const e = card ? (card.e || 0) : 0;
      const hist = card && Array.isArray(card.hist) ? card.hist : [];
      const rate = (a + e) ? e / (a + e) * 100 : null;
      /* \u4F5C\u7B54\u4E2D\u5199\u300C\uFF1F\u300D\uFF0C\u7B54\u5B8C\uFF08\u542B\u8D85\u65F6\uFF09\u6362\u6210\u771F\u5B9E\u97F3\u540D\uFF1A
         \u9632\u900F\u9898\u53EA\u9700\u8981\u6321\u4F4F\u300C\u8FD8\u6CA1\u7B54\u300D\u7684\u90A3\u6BB5\u65F6\u95F4\uFF0C\u7B54\u5B8C\u518D\u6321\u5C31\u53EA\u662F\u8BA9\u4EBA\u770B\u4E0D\u5230\u81EA\u5DF1\u9519\u5728\u54EA\u3002
         \u97F3\u540D\u53D6\u9898\u76EE\u7684\u5347\u964D\u53F7\u5199\u6CD5\uFF08noteNameFor\uFF09\uFF0C\u548C\u53CD\u9988\u6761\u3001\u9009\u9879\u91CC\u7684\u5199\u6CD5\u4FDD\u6301\u4E00\u81F4\u3002 */
      const answerName = noteNameFor(pcOf(midiOf(q.s, q.f)), q.spelling);
      const target = (round.state === 'answered')
        ? q.s + ' \u5F26 \u00B7 ' + q.f + ' \u54C1 \u00B7 ' + answerName
        : q.s + ' \u5F26 \u00B7 ' + q.f + ' \u54C1 \u00B7 \uFF1F';
      renderCard(p, {
        badgeClass: levelClass(card ? card.lvl : 0),
        badgeText: levelBadgeText(card ? card.lvl : 0),
        target: target,
        errRateText: rate === null ? DASH : Math.round(rate) + '%',
        errClass: errClassOf(rate),
        errWidth: rate === null ? 0 : Math.round(rate),
        right: a, wrong: e,
        recentText: hist.length ? fmtRatio(hist.filter(Boolean).length, hist.length) + ' \u6B63\u786E' : DASH,
        total: a + e,
        histFull: !!(card && card.histFull),
        emptyText: '',
      });
    }

    /* \u2014\u2014 \u56FE4 \u2014\u2014 */
    const pool = noteProbPool();
    let sum = 0;
    pool.forEach((c) => { sum += positionWeight(store.cards[c.key]); });
    const inPool = !!(q && pool.some((c) => c.key === q.key));
    if (!q) {
      /* \u6C60\u5B50\u7A7A\u65F6 E3 \u4F18\u5148\u4E8E E2\uFF1A\u6CA1\u6709\u9898\u53EF\u51FA\uFF0C\u8BF4\u300C\u6682\u4E0D\u5728\u51FA\u9898\u8303\u56F4\u300D\u6BD4\u8BF4\u300C\u672C\u8F6E\u5DF2\u7ED3\u675F\u300D\u66F4\u51C6\u786E */
      if (!pool.length) {
        renderProb(p, {
          badgeText: DASH, badgeClass: 'neutral',
          state: '\u672C\u9898\u6682\u4E0D\u5728\u51FA\u9898\u8303\u56F4',
          note: '\u5F53\u524D\u8303\u56F4\u5185\u62BD\u4E0D\u5230\u8FD9\u9053\u9898',
        });
      } else {
        renderProb(p, {
          badgeText: DASH, badgeClass: 'neutral', state: DASH, note: '',
          emptyText: '\u5F00\u59CB\u65B0\u4E00\u8F6E\u540E\u663E\u793A',
        });
      }
    } else if (!inPool || !sum) {
      renderProb(p, {
        badgeText: DASH, badgeClass: 'neutral',
        state: '\u672C\u9898\u6682\u4E0D\u5728\u51FA\u9898\u8303\u56F4',
        note: '\u5F53\u524D\u8303\u56F4\u5185\u62BD\u4E0D\u5230\u8FD9\u9053\u9898',
      });
    } else {
      const badge = probBadge(positionWeight(card), sum);
      const review = isReviewNow('note', q.key);
      renderProb(p, {
        badgeText: badge.text, badgeClass: badge.cls,
        state: review ? '\u672C\u9898\u5DF2\u8FDB\u5165\u590D\u4E60\u5468\u671F' : '\u672C\u9898\u5C1A\u672A\u8FDB\u5165\u590D\u4E60',
        note: review ? '\u7B54\u9519\u4F1A\u63D0\u9AD8\u5B83\u4E4B\u540E\u7684\u51FA\u73B0\u6982\u7387' : '\u7B54\u9519\u8BE5\u9898\u5C06\u7EB3\u5165\u590D\u4E60\u961F\u5217',
      });
    }
  }

  /* ================= \u627E\u4F4D\u7F6E\u6A21\u5F0F ================= */
  function renderPosSide() {
    const p = SIDE_PREFIX.pos;
    const playA = posPlayA();
    const q = round.current;

    /* \u2014\u2014 \u56FE2\uFF1AA \u7D2F\u8BA1 / B \u672C\u9898\uFF08\u6807\u7B7E\u76F8\u540C\uFF0C\u53EA\u6709\u7B97\u6CD5\u4E0D\u540C\uFF0CD63/D66/D69\uFF09 \u2014\u2014 */
    if (playA) {
      const st = modeStatOf('pos');
      const answered = st.right + st.wrong;
      renderQuad(p, {
        right: fmtInt(st.right),
        wrong: fmtInt(st.wrong),
        rate: fmtPct(st.right, answered),
        best: fmtInt(st.bestCombo),
        emptyText: answered === 0 ? '\u8FD8\u6CA1\u6709\u4F5C\u7B54\u8BB0\u5F55' : '',
      });
    } else {
      const last = store.posBStats ? store.posBStats.last : null;
      if (!last) {
        renderQuad(p, {
          right: DASH, wrong: DASH, rate: DASH, best: DASH,
          emptyText: '\u7B54\u5B8C\u672C\u9898\u540E\u663E\u793A',
        });
      } else {
        renderQuad(p, {
          right: fmtInt(last.right),
          wrong: fmtInt(last.wrong),
          rate: fmtPct(last.right, last.right + last.wrong),
          best: fmtInt(store.posBStats.bestCombo),
          emptyText: '',
        });
      }
    }

    /* \u2014\u2014 \u56FE3\uFF1AB \u4E0B\u6574\u5757\u4E0D\u663E\u793A\uFF08D68\uFF09 \u2014\u2014 */
    const dist = byId(p + 'Dist');
    if (dist) dist.hidden = !playA;
    if (playA) {
      const snap = round.snapshot || null;
      renderDist(p, snap, snap ? '' : '\u5F00\u59CB\u65B0\u4E00\u8F6E\u540E\u663E\u793A\u672C\u8F6E\u5206\u5E03');
    }

    /* \u2014\u2014 \u56FE1\uFF1A\u5355\u4F4D\u7EA7\uFF08A \u4E00\u4E2A\u5FBD\u7AE0 / B \u63D0\u4EA4\u540E\u4E00\u7EC4\u5C0F\u5FBD\u7AE0\uFF09 \u2014\u2014 */
    /* \u9632\u900F\u9898\uFF08D47\uFF09\uFF1A\u70B9\u300C\u5F00\u59CB\u300D\u4E4B\u524D\u9898\u9762\u662F\u906E\u4F4F\u7684\uFF08#posNote \u88AB\u906E\u6210 \uFF1F\u3001#posStartMask \u76D6\u7740\uFF09\uFF0C
       \u4FA7\u680F\u900F\u9732\u7684\u4E0D\u80FD\u6BD4\u9898\u9762\u591A\uFF0C\u6240\u4EE5\u8BAD\u7EC3\u5BF9\u8C61\u4E5F\u5199\u6210\u300C\uFF1F \u00B7 \uFF1F\u300D\uFF0C\u4E0E\u548C\u5F26 n2f \u540C\u4E00\u5957\u89C4\u5219\u3002
       \u56FE2 \u662F\u5386\u53F2\u7D2F\u8BA1\u3001\u56FE3 \u662F\u672C\u8F6E\u5206\u5E03\u3001\u56FE4 \u53EA\u8C08\u300C\u672C\u9898\u300D\u4E0D\u70B9\u540D\u5B57\uFF0C\u5747\u7167\u5E38\u663E\u793A\u3002 */
    const wait = !!round.waitStart;
    const unitKey = q ? q.key : null;
    /* q.pc \u6B63\u5E38\u90FD\u6709\uFF1B\u4E07\u4E00\u67D0\u6761\u5386\u53F2\u9898\u76EE\u6CA1\u5E26\uFF08\u65E7\u5B58\u6863 / \u6D4B\u8BD5\u9020\u9898\uFF09\uFF0C
       \u4ECE\u5F26+\u54C1\u53CD\u63A8\uFF0C\u907F\u514D\u8BAD\u7EC3\u5BF9\u8C61\u5199\u6210\u300Cundefined \u00B7 \u5168\u6307\u677F\u300D\u3002 */
    const qpc = q ? (q.pc != null ? q.pc : pcOf(midiOf(q.s, q.f))) : null;
    const ust = posUnitStatGet(unitKey);
    const n = ust ? (ust.n || 0) : 0;
    const right = ust ? (ust.right || 0) : 0;
    const wrong = ust ? (ust.wrong || 0) : 0;
    const hist = ust && Array.isArray(ust.hist) ? ust.hist : [];
    const rate = n ? wrong / n * 100 : null;
    const target = !q
      ? DASH
      : wait
        ? '\uFF1F \u00B7 \uFF1F'
        : (playA ? (q.s + ' \u5F26 \u00B7 ' + noteName(qpc)) : (noteName(qpc) + ' \u00B7 \u5168\u6307\u677F'));

    if (!q) {
      renderCard(p, {
        badgeClass: 'neutral', badgeText: DASH, target: DASH,
        errRateText: DASH, errClass: 'neutral', errWidth: 0,
        right: 0, wrong: 0, recentText: DASH, total: 0, histFull: false,
        emptyText: '\u672C\u8F6E\u5DF2\u7ED3\u675F\uFF0C\u5F00\u59CB\u65B0\u4E00\u8F6E\u540E\u663E\u793A',
      });
    } else {
      let badges = null;
      if (!playA) {
        const last = store.posBStats ? store.posBStats.last : null;
        if (wait || !last || !last.cells || !last.cells.length) {
          badges = '<span class="stat-badge neutral">\uFF1F</span>'
            + '<span class="stat-hint">\u63D0\u4EA4\u540E\u663E\u793A\u5404\u683C\u638C\u63E1\u7A0B\u5EA6</span>';
        } else {
          const cells = last.cells.slice().sort((x, y) => (x.s - y.s) || (x.f - y.f));
          badges = cells.map((c) => {
            const card = store.posCards[posKey(c.s, c.f)];
            const lvl = card ? (card.lvl || 0) : 0;
            return '<span class="stat-badge ' + levelClass(lvl) + '">'
              + c.s + '\u5F26' + c.f + '\u54C1 \u00B7 ' + levelBadgeText(lvl).replace('\u638C\u63E1 \u00B7 ', '') + '</span>';
          }).join('');
        }
      }
      renderCard(p, {
        badges: badges,
        badgeClass: levelClass(ust ? ust.lvl : 0),
        badgeText: levelBadgeText(ust ? ust.lvl : 0),
        target: target,
        errRateText: rate === null ? DASH : Math.round(rate) + '%',
        errClass: errClassOf(rate),
        errWidth: rate === null ? 0 : Math.round(rate),
        right: right, wrong: wrong,
        recentText: hist.length ? fmtRatio(hist.filter(Boolean).length, hist.length) + ' \u6B63\u786E' : DASH,
        total: n,
        histFull: !!(ust && ust.histFull),
        emptyText: '',
      });
    }

    /* \u2014\u2014 \u56FE4 \u2014\u2014 */
    const pool = posProbPool();
    let sum = 0;
    pool.forEach((u) => { sum += posUnitWeight(u); });
    const inPool = !!(q && pool.some((u) => u.key === q.key));
    if (!q) {
      renderProb(p, {
        badgeText: DASH, badgeClass: 'neutral', state: DASH, note: '',
        emptyText: '\u5F00\u59CB\u65B0\u4E00\u8F6E\u540E\u663E\u793A',
      });
    } else if (!inPool || !sum) {
      renderProb(p, {
        badgeText: DASH, badgeClass: 'neutral',
        state: '\u672C\u9898\u6682\u4E0D\u5728\u51FA\u9898\u8303\u56F4',
        note: '\u5F53\u524D\u8303\u56F4\u5185\u62BD\u4E0D\u5230\u8FD9\u9053\u9898',
      });
    } else {
      const unit = { s: playA ? q.s : null, pc: q.pc };
      const badge = probBadge(posUnitWeight(unit), sum);
      const review = isReviewNow('pos', q.key);
      renderProb(p, {
        badgeText: badge.text, badgeClass: badge.cls,
        state: review ? '\u672C\u9898\u5DF2\u8FDB\u5165\u590D\u4E60\u5468\u671F' : '\u672C\u9898\u5C1A\u672A\u8FDB\u5165\u590D\u4E60',
        note: review ? '\u7B54\u9519\u4F1A\u63D0\u9AD8\u5B83\u4E4B\u540E\u7684\u51FA\u73B0\u6982\u7387' : '\u7B54\u9519\u8BE5\u9898\u5C06\u7EB3\u5165\u590D\u4E60\u961F\u5217',
      });
    }
  }

  /* ================= \u548C\u5F26\u6A21\u5F0F ================= */
  /* ---------------------------------------------------------------
   *  \u548C\u5F26\u4FA7\u680F\uFF1A\u51FA\u9898\u8303\u56F4\uFF08\u7B56\u5212\u4E66 \u00A77\uFF09
   *
   *  \u4E94\u4E2A\u7B5B\u9009\u8F74 + \u9898\u91CF\u6863\uFF0C\u5168\u90E8 chip \u90FD\u5E26\u4E0A\u4E0B\u6587\u8BA1\u6570\uFF1A
   *  \u6570\u5B57 = \u300C\u5176\u5B83\u8F74\u90FD\u6309\u5F53\u524D\u6761\u4EF6\uFF0C\u53EA\u628A\u8FD9\u4E00\u8F74\u6362\u6210\u8BE5\u503C\u8FD8\u5269\u51E0\u9898\u300D\u3002
   *  \u7B97\u51FA\u6765\u662F 0 \u4E14\u5F53\u524D\u6CA1\u9009 \u2192 \u7F6E\u7070\u4E0D\u53EF\u70B9\uFF08\u70B9\u4E0B\u53BB\u4F1A\u6389\u8FDB 0 \u9898\u6B7B\u8DEF\uFF09\u3002
   *  \u8F74\u5E8F\u56FA\u5B9A\uFF1A\u8D28\u91CF \u2192 \u6839\u97F3 \u2192 \u5F26\u6570 \u2192 \u628A\u4F4D \u2192 \u6280\u5DE7\u3002
   * --------------------------------------------------------------- */
  const SC_POS_VALUES = ['all', 'low', 'mid', 'high'];
  const SC_POS_LABEL = { all: '\u5168\u90E8', low: '\u4F4E\u628A 1\u20133', mid: '\u4E2D\u628A 4\u20137', high: '\u9AD8\u628A 8+' };
  const SC_TECH_VALUES = ['barre', 'open', 'none'];
  const SC_TECH_LABEL = { barre: '\u542B\u6A2A\u6309', open: '\u542B\u7A7A\u5F26', none: '\u90FD\u4E0D\u542B' };

  function scChip(axis, value, label, count, opts) {
    const o = opts || {};
    const label2 = document.createElement('label');
    label2.className = 'chip sf-chip';
    if (o.on) label2.classList.add('on');
    const dead = count === 0 && !o.on && !o.keepClickable;
    if (dead) label2.classList.add('off');
    if (o.gone) label2.classList.add('gone');
    const inp = document.createElement('input');
    inp.type = o.radio ? 'radio' : 'checkbox';
    inp.checked = !!o.on;
    inp.disabled = dead;
    inp.dataset.axis = axis;
    inp.dataset.value = String(value);
    const txt = document.createElement('span');
    txt.className = 'chip-txt';
    txt.textContent = label;
    const num = document.createElement('span');
    num.className = 'chip-n';
    num.textContent = String(count);
    label2.appendChild(inp);
    label2.appendChild(txt);
    label2.appendChild(num);
    if (o.tip) {
      label2.classList.add('has-tip');
      label2.setAttribute('role', 'button');
      label2.setAttribute('aria-label', label + '\uFF1A' + o.tip);
      label2.dataset.tip = o.tip;
      label2.tabIndex = 0;
    }
    return label2;
  }

  /* \u2014\u2014 \u6C14\u6CE1\u8BF4\u660E\u5C42\uFF08\u7B56\u5212\u4E66 \u00A73.1.2\uFF09\u2014\u2014
     \u4E0D\u7528 title \u5C5E\u6027\uFF08\u79FB\u52A8\u7AEF\u4E0D\u5F39\u3001\u4E5F\u6CA1\u6709 role\uFF09\uFF0C\u6539\u7528 role=tooltip + aria-describedby\u3002
     \u684C\u9762\u60AC\u505C/\u805A\u7126\u5373\u663E\u793A\uFF0C\u89E6\u5C4F\u70B9\u4E00\u4E0B\u5207\u6362\uFF0C\u70B9\u522B\u5904\u6216\u6309 Esc \u5173\u6389\u3002 */
  let scTipEl = null;
  let scTipOwner = null;

  function scTipLayer() {
    if (scTipEl && document.body.contains(scTipEl)) return scTipEl;
    const el2 = document.createElement('div');
    el2.className = 'tip';
    el2.setAttribute('role', 'tooltip');
    el2.id = 'scTip';
    el2.hidden = true;
    document.body.appendChild(el2);
    scTipEl = el2;
    return el2;
  }

  function scTipHide() {
    if (!scTipEl) return;
    scTipEl.hidden = true;
    if (scTipOwner) {
      scTipOwner.removeAttribute('aria-describedby');
      scTipOwner = null;
    }
  }

  function scTipShow(owner) {
    const text = owner && owner.dataset ? owner.dataset.tip : '';
    if (!text) { scTipHide(); return; }
    const el2 = scTipLayer();
    el2.textContent = text;
    el2.hidden = false;
    if (scTipOwner && scTipOwner !== owner) scTipOwner.removeAttribute('aria-describedby');
    scTipOwner = owner;
    owner.setAttribute('aria-describedby', 'scTip');
    /* \u5148\u7528 clamp \u6446\u5230\u5143\u7D20\u4E0B\u65B9\uFF1B\u9760\u8FD1\u53F3\u7F18\u5C31\u5F80\u5DE6\u6536\uFF0C\u9760\u8FD1\u5E95\u7F18\u5C31\u7FFB\u5230\u4E0A\u65B9\u3002 */
    const r = owner.getBoundingClientRect();
    const w = el2.offsetWidth || 160;
    const h = el2.offsetHeight || 32;
    let left = r.left + r.width / 2 - w / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    let top = r.bottom + 6;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
    el2.style.left = Math.round(left) + 'px';
    el2.style.top = Math.round(top) + 'px';
  }

  function bindChordTipLayer() {
    /* \u4E8B\u4EF6\u59D4\u6258\uFF1Achip \u662F\u6BCF\u6B21\u91CD\u5EFA\u7684\uFF0C\u4E0D\u80FD\u9010\u4E2A\u7ED1\u3002 */
    const host = $('#scFilter');
    if (!host) return;
    const tipOf = (t) => (t && t.closest ? t.closest('[data-tip]') : null);
    host.addEventListener('pointerover', (ev) => {
      const o = tipOf(ev.target);
      if (o) scTipShow(o);
    });
    host.addEventListener('pointerout', (ev) => {
      const o = tipOf(ev.target);
      if (o && !o.contains(ev.relatedTarget)) scTipHide();
    });
    host.addEventListener('focusin', (ev) => {
      const o = tipOf(ev.target);
      if (o) scTipShow(o);
    });
    host.addEventListener('focusout', () => scTipHide());
    /* \u89E6\u5C4F\uFF1A\u70B9\u4E00\u4E0B\u5F00\u7740\uFF0C\u518D\u70B9\u4E00\u4E0B\u5173\u6389 \u2014\u2014 title \u5C5E\u6027\u505A\u4E0D\u5230\u8FD9\u4EF6\u4E8B\u3002 */
    host.addEventListener('pointerdown', (ev) => {
      const o = tipOf(ev.target);
      if (!o) return;
      if (scTipOwner === o) { scTipHide(); ev.preventDefault(); }
      else scTipShow(o);
    });
    document.addEventListener('pointerdown', (ev) => {
      if (scTipOwner && !scTipOwner.contains(ev.target)) scTipHide();
    });
    window.addEventListener('scroll', () => scTipHide(), { passive: true });
    window.addEventListener('resize', () => scTipHide());
  }

  /* \u8D28\u91CF chip \u7684\u6C14\u6CE1\u6587\u6848\uFF08\u7B56\u5212\u4E66 \u00A73.1.2 / \u00A77.3\uFF09\uFF1A
     sus \u4E09\u5144\u5F1F\u8981\u5355\u72EC\u89E3\u91CA\u300C\u4E3A\u4EC0\u4E48\u8001\u6709\u9489\u5B50\u300D\uFF1B
     \u73A9\u6CD5 B \u7684\u6C60\u5B50\u6BD4 A \u5C0F\uFF0C\u7F29\u6C34\u8FC7\u534A\u7684\u8D28\u91CF\u8981\u8BF4\u660E\u539F\u56E0 \u2014\u2014 \u6570\u5B57\u6309\u5B9E\u9645\u7B97\uFF0C\u4E0D\u5199\u6B7B\u3002 */
  const CHORD_QUALITY_TIP = {
    sus2: '\u6302\u4E8C\u548C\u5F26\u4E0E sus4 \u4E92\u4E3A\u6362\u6839\u97F3\u7684\u4E24\u9762\uFF0C\u5149\u7ED9\u540D\u5B57\u5B9A\u4E0D\u51FA\u552F\u4E00\u6307\u6CD5 \u2014\u2014 \u5168\u5E93 951 \u9053\u8981\u9489\u5F26\u7684\u9898\u91CC\u6709 43% \u6765\u81EA sus \u4E09\u5144\u5F1F\u3002',
    sus4: '\u6302\u56DB\u548C\u5F26\u4E0E sus2 \u4E92\u4E3A\u6362\u6839\u97F3\u7684\u4E24\u9762\uFF0C\u5149\u7ED9\u540D\u5B57\u5B9A\u4E0D\u51FA\u552F\u4E00\u6307\u6CD5 \u2014\u2014 \u5168\u5E93 951 \u9053\u8981\u9489\u5F26\u7684\u9898\u91CC\u6709 43% \u6765\u81EA sus \u4E09\u5144\u5F1F\u3002',
    '7sus4': '\u5C5E\u4E03\u6302\u56DB\u4E0E sus4 \u52A0\u4E03\u97F3\u7684\u542C\u611F\u91CD\u53E0\uFF0C\u6307\u6CD5\u5E38\u9700\u9489\u5B50\u624D\u80FD\u5B9A\u6B7B \u2014\u2014 \u5168\u5E93 951 \u9053\u8981\u9489\u5F26\u7684\u9898\u91CC\u6709 43% \u6765\u81EA sus \u4E09\u5144\u5F1F\u3002',
  };

  function chordQualityTip(qid, gone, aCount, bCount, play) {
    if (gone) return CHORD_STYLE_NAME[store.settings.chordStyle] + ' \u9884\u8BBE\u5DF2\u79FB\u9664\u8FD9\u4E2A\u8D28\u91CF';
    const parts = [];
    if (CHORD_QUALITY_TIP[qid]) parts.push(CHORD_QUALITY_TIP[qid]);
    if (play === 'b' && aCount > 0 && bCount * 2 < aCount) {
      parts.push('\u73A9\u6CD5 B \u53EA\u5269 ' + bCount + ' \u9053\uFF08\u73A9\u6CD5 A \u6709 ' + aCount + ' \u9053\uFF09\uFF1A\u8FD9\u4E9B\u6307\u6CD5\u5728\u8BED\u6599\u91CC\u88AB\u6807\u6210\u4E86\u4E24\u4E2A\u90FD\u8BF4\u5F97\u901A\u7684\u540D\u5B57\uFF0C\u5355\u9009\u9898\u5BB9\u4E0D\u4E0B\u3002');
    }
    return parts.join(' ');
  }

  /* \u540C\u4E00\u4E2A\u7B5B\u9009\u6761\u4EF6\u4E0B\u3001\u53E6\u4E00\u79CD\u73A9\u6CD5\u7684\u9898\u91CF \u2014\u2014 \u7528\u6765\u7B97\u300CB \u6C60\u6BD4 A \u6C60\u7F29\u6C34\u591A\u5C11\u300D\u3002
     \u53EA\u5207 chordPlay \u4E00\u4E2A\u5B57\u6BB5\uFF0C\u5176\u5B83\u6761\u4EF6\u4E0D\u52A8\uFF0C\u7B97\u5B8C\u7ACB\u523B\u8FD8\u539F\u3002 */
  function chordCountsForPlay(play) {
    const s = store.settings;
    const keep = s.chordPlay;
    if (keep === play) return chordContextCounts();
    s.chordPlay = play;
    chordPoolCache = { key: '', list: [] };
    let out = null;
    try { out = chordContextCounts(); } finally {
      s.chordPlay = keep;
      chordPoolCache = { key: '', list: [] };
    }
    return out;
  }

  function renderChordFilter() {
    const box = $('#scQualityChips');
    if (!box) return;                        /* \u8FD8\u6CA1\u6709\u8FD9\u5757 DOM \u5C31\u76F4\u63A5\u8DF3\u8FC7 */
    const s = store.settings;
    const cnt = chordContextCounts();
    const play = chordPlayMode();
    const B = bankData();
    /* \u73A9\u6CD5 B \u624D\u9700\u8981 A \u4FA7\u6570\u5B57\u505A\u5BF9\u6BD4\uFF1BA \u73A9\u6CD5\u4E0D\u7528\u591A\u7B97\u4E00\u904D */
    const cntOther = play === 'b' ? chordCountsForPlay('a') : null;

    /* \u2014\u2014 \u8D28\u91CF\uFF0818\uFF09\u2014\u2014 */
    const qbox = $('#scQualityChips');
    qbox.innerHTML = '';
    if (B) {
      bankQualityOrder().forEach((qi) => {
        const qid = B.Q[qi][0];
        const on = (s.chordQualities || []).indexOf(qid) >= 0;
        const gone = chordStyleRemoved(qid, s.chordStyle);
        qbox.appendChild(scChip('quality', qid, chordQualityLabelOf(qid),
          cnt.quality[qid] || 0, {
            on,
            gone,
            tip: chordQualityTip(qid, gone,
              cntOther ? (cntOther.quality[qid] || 0) : (cnt.quality[qid] || 0),
              cnt.quality[qid] || 0, play),
          }));
      });
    }

    /* \u2014\u2014 \u6839\u97F3\uFF0812\uFF09\u2014\u2014 */
    const rbox = $('#scRootChips');
    rbox.innerHTML = '';
    const flat = chordAccidental() === 'flat';
    for (let pcv = 0; pcv < 12; pcv += 1) {
      const on = (s.chordRoots || []).indexOf(pcv) >= 0;
      const TT = chordTheory();
      const pcName = TT ? TT.pcName(pcv, flat) : String(pcv);
      rbox.appendChild(scChip('root', pcv, pcName, cnt.root[pcv] || 0, { on }));
    }

    /* \u2014\u2014 \u53D1\u58F0\u5F26\u6570\uFF084\uFF09\u2014\u2014 */
    const sbox = $('#scStringChips');
    sbox.innerHTML = '';
    [3, 4, 5, 6].forEach((n) => {
      const on = (s.chordStrings || []).indexOf(n) >= 0;
      sbox.appendChild(scChip('strings', n, n + ' \u5F26', cnt.strings[n] || 0, { on }));
    });

    /* \u2014\u2014 \u628A\u4F4D\uFF084\uFF0C\u542B\u300C\u5168\u90E8\u300D\uFF09\u2014\u2014 */
    const pbox = $('#scPositionChips');
    pbox.innerHTML = '';
    SC_POS_VALUES.forEach((v) => {
      const on = (s.chordPosition || 'all') === v;
      const n = v === 'all' ? cnt.total : (cnt.position[v] || 0);
      pbox.appendChild(scChip('position', v, SC_POS_LABEL[v], n, { on, radio: true, keepClickable: v === 'all' }));
    });

    /* \u2014\u2014 \u6280\u5DE7\uFF08\u4E92\u65A5\u4E09\u6001\uFF1B\u518D\u70B9\u4E00\u6B21\u56DE\u5230\u5168\u90E8\uFF09\u2014\u2014 */
    const tbox = $('#scTechniqueChips');
    tbox.innerHTML = '';
    SC_TECH_VALUES.forEach((v) => {
      const on = (s.chordTechnique || 'all') === v;
      tbox.appendChild(scChip('technique', v, SC_TECH_LABEL[v], cnt.technique[v] || 0, { on }));
    });

    /* \u2014\u2014 \u9898\u91CF\u6863\uFF08\u5168\u90E8 / \u6211\u7684\u9519\u9898\uFF09\u2014\u2014 */
    const wbox = $('#scScopeChips');
    wbox.innerHTML = '';
    wbox.appendChild(scChip('scope', 'all', '\u5168\u90E8', cnt.wrong.all, { on: !s.chordWrongOnly, keepClickable: true }));
    wbox.appendChild(scChip('scope', 'wrong', '\u6211\u7684\u9519\u9898', cnt.wrong.wrong, { on: !!s.chordWrongOnly }));

    /* \u2014\u2014 \u9876\u90E8\u9898\u91CF\u4E0E\u8BF4\u660E \u2014\u2014 */
    const poolN = $('#scPoolN');
    const poolNote = $('#scPoolNote');
    const n = chordPool().length;
    if (poolN) poolN.textContent = fmtInt(n);
    if (poolNote) {
      if (!B) poolNote.textContent = '\u9898\u5E93\u672A\u8F7D\u5165';
      else if (!n) poolNote.textContent = chordPoolDiagnosis() || '\u5F53\u524D\u6761\u4EF6\u4E0B\u6CA1\u6709\u9898';
      else poolNote.textContent = '\u5F53\u524D\u6761\u4EF6\u4E0B\u80FD\u51FA\u7684\u9898\u6570';
    }
  }

  function renderChordSide() {
    renderChordFilter();
    const p = SIDE_PREFIX.chord;
    const st = modeStatOf('chord');
    const answered = st.right + st.wrong;
    renderQuad(p, {
      right: fmtInt(st.right),
      wrong: fmtInt(st.wrong),
      rate: fmtPct(st.right, answered),
      best: fmtInt(st.bestCombo),
      emptyText: answered === 0 ? '\u8FD8\u6CA1\u6709\u4F5C\u7B54\u8BB0\u5F55' : '',
    });

    const snap = chordRound.snapshot || null;
    const poolEmpty = !chordPool().length;
    renderDist(p, snap,
      poolEmpty ? '\u5F53\u524D\u8BBE\u7F6E\u4E0B\u6CA1\u6709\u53EF\u51FA\u7684\u9898\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u91CC\u8C03\u6574\u8303\u56F4'
        : (snap ? '' : '\u5F00\u59CB\u65B0\u4E00\u8F6E\u540E\u663E\u793A\u672C\u8F6E\u5206\u5E03'));

    /* \u2014\u2014 \u56FE1 \u2014\u2014 */
    const q = chordRound.current;
    const card = q ? store.chordCards[q.key] : null;
    /* \u8FD9\u5F20\u5361\u7684\u300C\u8EAB\u4EFD\u300D\u63ED\u6653\u4E86\u6CA1\u6709\uFF1FA \u73A9\u6CD5\uFF08\u540D\u5B57 \u2192 \u6307\u677F\uFF09\u51FA\u9898\u5373\u516C\u5F00\u540D\u5B57\uFF1B
       B \u73A9\u6CD5\uFF08\u6307\u677F \u2192 \u540D\u5B57\uFF09\u8981\u7B49\u7B54\u5B8C\u624D\u516C\u5F00\uFF1B\u800C B \u628A\u300C\u63ED\u6653\u65B9\u5F0F\u300D\u8BBE\u6210\u300C\u90FD\u4E0D\u63ED\u6653\u300D\u65F6\uFF0C
       \u7B54\u5B8C\u4E5F\u4E0D\u516C\u5F00\uFF08\u9898\u5361\u4E00\u76F4\u662F \uFF1F\uFF09\uFF0C\u4FA7\u680F\u81EA\u7136\u4E5F\u4E0D\u80FD\u62A5\u51FA\u540D\u5B57\u4E0E\u5386\u53F2\u3002
       \u8EAB\u4EFD\u6CA1\u516C\u5F00\u65F6\uFF0C\u56FE1 \u4E0E\u56FE4 \u53EA\u80FD\u7ED9\u5360\u4F4D\uFF1A
       \u300C\u672C\u9898\u9519\u8BEF\u7387 100%\u300D\u300C\u672C\u9898\u5DF2\u8FDB\u5165\u590D\u4E60\u5468\u671F\u300D\u7B49\u4E8E\u544A\u8BC9\u7528\u6237\u8FD9\u9898\u4EE5\u524D\u9519\u8FC7\uFF08D47\uFF09\u3002 */
    const sideDir = chordRound.dir || (chordRound.snap ? chordRound.snap.dir : 'n2f');
    const sideRevealOff = sideDir === 'f2n' && chordRound.state === 'answered' && chordRound.snap
      && (chordRound.snap.revealB || 'wrongOnly') === 'off';
    const identityMasked = !!q && (sideDir === 'f2n'
      ? (chordRound.state !== 'answered' || sideRevealOff)
      : !!chordRound.waitStart);
    if (!q) {
      renderCard(p, {
        badgeClass: 'neutral', badgeText: DASH, target: DASH,
        errRateText: DASH, errClass: 'neutral', errWidth: 0,
        right: 0, wrong: 0, recentText: DASH, total: 0, histFull: false,
        emptyText: (answered === 0 && !snap) ? '\u8FD8\u6CA1\u6709\u5F00\u59CB\u7EC3\u4E60' : '\u672C\u8F6E\u5DF2\u7ED3\u675F\uFF0C\u5F00\u59CB\u65B0\u4E00\u8F6E\u540E\u663E\u793A',
      });
    } else {
      const a = card ? (card.a || 0) : 0;
      const e = card ? (card.e || 0) : 0;
      const hist = card && Array.isArray(card.hist) ? card.hist : [];
      const rate = (a + e) ? e / (a + e) * 100 : null;
      const dir = chordRound.dir || (chordRound.snap ? chordRound.snap.dir : 'n2f');
      let target;
      if (dir === 'f2n') {
        /* \u6307\u677F \u2192 \u540D\u79F0\uFF1A\u7B54\u5B8C\u624D\u63ED\u6653\u548C\u5F26\u540D\uFF08\u4F5C\u7B54\u4E2D\u4ECD\u662F\u300C\u6307\u677F\u56FE \u00B7 \uFF1F\u300D\uFF09\u3002
           answerName \u5728 submitChord \u91CC\u7B97\u597D\uFF08\u542B\u8D85\u65F6\u672A\u4F5C\u7B54\u65F6\u7ED9\u53C2\u8003\u6392\u5E03\u7684\u540D\u5B57\uFF09\uFF0C
           \u62FF\u4E0D\u5230\u5C31\u9000\u56DE\u5F53\u524D\u9898\u76EE\u7684\u540D\u5B57\u3002\u63ED\u6653\u65B9\u5F0F\u8BBE\u6210\u300C\u90FD\u4E0D\u63ED\u6653\u300D\u65F6\u59CB\u7EC8\u4E0D\u5199\u540D\u5B57\u3002 */
        target = (chordRound.state === 'answered' && !sideRevealOff)
          ? (chordRound.answerName || chordNameOf(q)) + ' \u00B7 ' + chordQualityLabel(q.quality)
          : '\u6307\u677F\u56FE \u00B7 \uFF1F';
      } else if (chordRound.waitStart) {
        target = '\uFF1F \u00B7 \uFF1F';
      } else {
        target = chordNameOf(q) + ' \u00B7 ' + chordQualityLabel(q.quality);
      }
      /* \u8EAB\u4EFD\u6CA1\u63ED\u6653\u65F6\uFF1A\u5FBD\u7AE0\u3001\u9519\u8BEF\u7387\u3001\u6B63\u786E/\u9519\u8BEF\u6B21\u6570\u3001\u8FD1\u671F\u8868\u73B0\u3001\u7D2F\u8BA1\u7EC3\u4E60\u4E00\u5F8B\u5360\u4F4D\u3002
         \u8FD9\u4E9B\u6570\u90FD\u53EA\u5BF9\u300C\u8FD9\u4E00\u5F20\u5361\u300D\u6709\u610F\u4E49\uFF0C\u5199\u51FA\u6765\u5C31\u7B49\u4E8E\u62A5\u51FA\u8FD9\u662F\u54EA\u4E00\u9053\u9898
         \uFF08\u300C\u9519\u8BEF 9 \u6B21 / \u9519\u8BEF\u7387 60%\u300D= \u4F60\u4EE5\u524D\u9519\u8FC7\u5B83\uFF09\u3002\u56FE2 \u662F\u5168\u6A21\u5F0F\u7D2F\u8BA1\uFF0C
         \u56FE3 \u662F\u672C\u8F6E\u5206\u5E03\uFF0C\u90FD\u4E0D\u70B9\u540D\u5B57\uFF0C\u7167\u5E38\u663E\u793A\u3002 */
      renderCard(p, identityMasked
        ? {
          badgeClass: 'neutral', badgeText: DASH, target: target,
          errRateText: DASH, errClass: 'neutral', errWidth: 0,
          right: DASH, wrong: DASH, recentText: DASH, total: DASH, histFull: false,
          emptyText: sideRevealOff ? '\u672C\u5C40\u4E0D\u63ED\u6653\u672C\u9898\u8BB0\u5F55'
            : (chordRound.waitStart ? '\u5F00\u59CB\u540E\u663E\u793A\u672C\u9898\u8BB0\u5F55' : '\u7B54\u5B8C\u672C\u9898\u540E\u663E\u793A'),
        }
        : {
          badgeClass: levelClass(card ? card.lvl : 0),
          badgeText: levelBadgeText(card ? card.lvl : 0),
          target: target,
          errRateText: rate === null ? DASH : Math.round(rate) + '%',
          errClass: errClassOf(rate),
          errWidth: rate === null ? 0 : Math.round(rate),
          right: a, wrong: e,
          recentText: hist.length ? fmtRatio(hist.filter(Boolean).length, hist.length) + ' \u6B63\u786E' : DASH,
          total: a + e,
          histFull: !!(card && card.histFull),
          emptyText: '',
        });
    }

    /* \u2014\u2014 \u56FE4 \u2014\u2014 */
    const pool = chordPool();
    let sum = 0;
    pool.forEach((c) => { sum += chordCardWeight(store.chordCards[c.key]); });
    const inPool = !!(q && pool.some((c) => c.key === q.key));
    if (!q) {
      /* \u6C60\u5B50\u7A7A\u65F6 E3 \u4F18\u5148\u4E8E E2\uFF08\u540C\u97F3\u540D\u6A21\u5F0F\uFF09 */
      if (!pool.length) {
        renderProb(p, {
          badgeText: DASH, badgeClass: 'neutral',
          state: '\u672C\u9898\u6682\u4E0D\u5728\u51FA\u9898\u8303\u56F4',
          note: '\u5F53\u524D\u8303\u56F4\u5185\u62BD\u4E0D\u5230\u8FD9\u9053\u9898',
        });
      } else {
        renderProb(p, {
          badgeText: DASH, badgeClass: 'neutral', state: DASH, note: '',
          emptyText: '\u5F00\u59CB\u65B0\u4E00\u8F6E\u540E\u663E\u793A',
        });
      }
    } else if (!inPool || !sum) {
      renderProb(p, {
        badgeText: DASH, badgeClass: 'neutral',
        state: '\u672C\u9898\u6682\u4E0D\u5728\u51FA\u9898\u8303\u56F4',
        note: '\u5F53\u524D\u8303\u56F4\u5185\u62BD\u4E0D\u5230\u8FD9\u9053\u9898',
      });
    } else if (identityMasked) {
      /* \u5F3A\u5EA6\u4E5F\u6CC4\u9898\uFF1A\u590D\u4E60\u6001\u6743\u91CD\u88AB\u62AC\u9AD8\uFF0C"\u5DF2\u8FDB\u5165\u590D\u4E60\u5468\u671F" \u7B49\u4E8E\u8BF4\u8FD9\u9898\u4EE5\u524D\u9519\u8FC7\u3002
         \u540D\u5B57\u90FD\u8FD8\u6CA1\u63ED\u6653\uFF0C\u8FD9\u91CC\u53EA\u80FD\u7ED9\u64CD\u4F5C\u63D0\u793A\u3002 */
      renderProb(p, {
        badgeText: DASH, badgeClass: 'neutral',
        state: sideRevealOff
          ? '\u672C\u5C40\u4E0D\u63ED\u6653\u672C\u9898\u590D\u4E60\u5B89\u6392'
          : (chordRound.waitStart ? '\u5F00\u59CB\u540E\u663E\u793A\u672C\u9898\u590D\u4E60\u5B89\u6392' : '\u7B54\u5B8C\u672C\u9898\u540E\u663E\u793A\u590D\u4E60\u5B89\u6392'),
        note: '\u7B54\u9519\u8BE5\u9898\u5C06\u7EB3\u5165\u590D\u4E60\u961F\u5217',
      });
    } else {
      const badge = probBadge(chordCardWeight(card), sum);
      const review = isReviewNow('chord', q.key);
      renderProb(p, {
        badgeText: badge.text, badgeClass: badge.cls,
        state: review ? '\u672C\u9898\u5DF2\u8FDB\u5165\u590D\u4E60\u5468\u671F' : '\u672C\u9898\u5C1A\u672A\u8FDB\u5165\u590D\u4E60',
        note: review ? '\u7B54\u9519\u4F1A\u63D0\u9AD8\u5B83\u4E4B\u540E\u7684\u51FA\u73B0\u6982\u7387' : '\u7B54\u9519\u8BE5\u9898\u5C06\u7EB3\u5165\u590D\u4E60\u961F\u5217',
      });
    }
  }

  /* ================= \u97F3\u7A0B\u6A21\u5F0F ================= */
  function renderIntervalSide() {
    const p = SIDE_PREFIX.interval;
    const st = modeStatOf('interval');
    const answered = st.right + st.wrong;
    renderQuad(p, {
      right: fmtInt(st.right),
      wrong: fmtInt(st.wrong),
      rate: fmtPct(st.right, answered),
      best: fmtInt(st.bestCombo),
      emptyText: answered === 0 ? '\u8FD8\u6CA1\u6709\u4F5C\u7B54\u8BB0\u5F55' : '',
    });

    const snap = intervalRound.snapshot || null;
    const poolEmpty = !(intervalRound.snap && intervalRound.snap.play === 'b' ? intervalBPool() : intervalAPool()).length;
    renderDist(p, snap,
      poolEmpty ? '\u5F53\u524D\u8BBE\u7F6E\u4E0B\u6CA1\u6709\u53EF\u51FA\u7684\u9898\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u91CC\u8C03\u6574\u8303\u56F4'
        : (snap ? '' : '\u5F00\u59CB\u65B0\u4E00\u8F6E\u540E\u663E\u793A\u672C\u8F6E\u5206\u5E03'));

    /* \u2014\u2014 \u56FE1 \u2014\u2014 */
    const q = intervalRound.current;
    const card = q ? store.intervalCards[q.cardKey] : null;
    if (!q) {
      renderCard(p, {
        badgeClass: 'neutral', badgeText: DASH, target: DASH,
        errRateText: DASH, errClass: 'neutral', errWidth: 0,
        right: 0, wrong: 0, recentText: DASH, total: 0, histFull: false,
        emptyText: (answered === 0 && !snap) ? '\u8FD8\u6CA1\u6709\u5F00\u59CB\u7EC3\u4E60' : '\u672C\u8F6E\u5DF2\u7ED3\u675F\uFF0C\u5F00\u59CB\u65B0\u4E00\u8F6E\u540E\u663E\u793A',
      });
    } else {
      const a = card ? (card.a || 0) : 0;
      const e = card ? (card.e || 0) : 0;
      const hist = card && Array.isArray(card.hist) ? card.hist : [];
      const rate = (a + e) ? e / (a + e) * 100 : null;
      /* \u73A9\u6CD5 A \u4F5C\u7B54\u4E2D\u5199\u300CA \u2192 B \u00B7 \uFF1F\u300D\u9632\u900F\u9898\uFF0C\u7B54\u5B8C\uFF08\u542B\u8D85\u65F6\uFF09\u8865\u4E0A\u97F3\u7A0B\u540D\u4E0E\u65B9\u5411\uFF1B
         \u73A9\u6CD5 B \u672C\u6765\u5C31\u662F\u300C\u7ED9\u540D\u5B57\u627E\u4F4D\u7F6E\u300D\uFF0C\u540D\u5B57\u4E00\u76F4\u662F\u9898\u76EE\u6761\u4EF6\uFF0C\u4E0D\u9700\u8981\u85CF\u3002 */
      let target;
      if (q.play === 'b') {
        target = intervalNameOf(q.intervalId) + ' \u00B7 ' + (q.dir === 'down' ? '\u4E0B\u884C' : '\u4E0A\u884C') + ' \u00B7 \u627E\u4F4D\u7F6E';
      } else if (intervalRound.state === 'answered') {
        const T = intervalTheory();
        const cor = intervalRound.correct;
        const label = (T && cor && typeof T.optionLabel === 'function')
          ? T.optionLabel(cor.id, cor.dir)
          : intervalNameOf(q.intervalId);
        target = 'A \u2192 B \u00B7 ' + (label || intervalNameOf(q.intervalId));
      } else {
        target = 'A \u2192 B \u00B7 \uFF1F';
      }
      renderCard(p, {
        badgeClass: levelClass(card ? card.lvl : 0),
        badgeText: levelBadgeText(card ? card.lvl : 0),
        target: target,
        errRateText: rate === null ? DASH : Math.round(rate) + '%',
        errClass: errClassOf(rate),
        errWidth: rate === null ? 0 : Math.round(rate),
        right: a, wrong: e,
        recentText: hist.length ? fmtRatio(hist.filter(Boolean).length, hist.length) + ' \u6B63\u786E' : DASH,
        total: a + e,
        histFull: !!(card && card.histFull),
        emptyText: '',
      });
    }

    /* \u2014\u2014 \u56FE4 \u2014\u2014 */
    const playB = !!(intervalRound.snap && intervalRound.snap.play === 'b') || (q && q.play === 'b');
    const pool = playB ? intervalBPool() : intervalAPool();
    const keyOf = playB ? (x) => x.cardKey : (x) => intervalCardKeyA(x.id, x.dir, x.shape);
    let sum = 0;
    pool.forEach((x) => { sum += intervalCardWeight(keyOf(x)); });
    const inPool = !!(q && pool.some((x) => keyOf(x) === q.cardKey));
    if (!q) {
      /* \u6C60\u5B50\u7A7A\u65F6 E3 \u4F18\u5148\u4E8E E2\uFF08\u540C\u97F3\u540D\u6A21\u5F0F\uFF09 */
      if (!pool.length) {
        renderProb(p, {
          badgeText: DASH, badgeClass: 'neutral',
          state: '\u672C\u9898\u6682\u4E0D\u5728\u51FA\u9898\u8303\u56F4',
          note: '\u5F53\u524D\u8303\u56F4\u5185\u62BD\u4E0D\u5230\u8FD9\u9053\u9898',
        });
      } else {
        renderProb(p, {
          badgeText: DASH, badgeClass: 'neutral', state: DASH, note: '',
          emptyText: '\u5F00\u59CB\u65B0\u4E00\u8F6E\u540E\u663E\u793A',
        });
      }
    } else if (!inPool || !sum) {
      renderProb(p, {
        badgeText: DASH, badgeClass: 'neutral',
        state: '\u672C\u9898\u6682\u4E0D\u5728\u51FA\u9898\u8303\u56F4',
        note: '\u5F53\u524D\u8303\u56F4\u5185\u62BD\u4E0D\u5230\u8FD9\u9053\u9898',
      });
    } else {
      const badge = probBadge(intervalCardWeight(q.cardKey), sum);
      const review = isReviewNow('interval', q.cardKey);
      renderProb(p, {
        badgeText: badge.text, badgeClass: badge.cls,
        state: review ? '\u672C\u9898\u5DF2\u8FDB\u5165\u590D\u4E60\u5468\u671F' : '\u672C\u9898\u5C1A\u672A\u8FDB\u5165\u590D\u4E60',
        note: review ? '\u7B54\u9519\u4F1A\u63D0\u9AD8\u5B83\u4E4B\u540E\u7684\u51FA\u73B0\u6982\u7387' : '\u7B54\u9519\u8BE5\u9898\u5C06\u7EB3\u5165\u590D\u4E60\u961F\u5217',
      });
    }
  }

  /* ---- \u7EDF\u4E00\u5165\u53E3\uFF08\u00A77.1\uFF09\uFF1Amode \u7701\u7565 = \u5F53\u524D\u6A21\u5F0F ---- */
  function renderSidebar(mode) {
    const m = mode || store.settings.mode;
    if (m === 'note') renderNoteSide();
    else if (m === 'pos') renderPosSide();
    else if (m === 'chord') renderChordSide();
    else if (m === 'interval') renderIntervalSide();
  }

  /** \u5207\u6362\u53F3\u4FA7\u680F\uFF1A\u56DB\u4E2A\u6A21\u5F0F\u5404\u4E00\u5957\uFF0C\u4E92\u4E0D\u5171\u4EAB DOM \u5BB9\u5668 */
  function applySidebar() {
    const mode = store.settings.mode;
    const note = $('#sideNote');
    const posSide = $('#sidePos');
    const chordSide = $('#sideChord');
    const intervalSide = $('#sideInterval');
    if (note) note.hidden = mode !== 'note';
    if (posSide) posSide.hidden = mode !== 'pos';
    if (chordSide) chordSide.hidden = mode !== 'chord';
    if (intervalSide) intervalSide.hidden = mode !== 'interval';
    renderSidebar(mode);
  }

  /* ---------------------------------------------------------------
   *  \u548C\u5F26\u6A21\u5F0F\u7684\u754C\u9762\u540C\u6B65
   * --------------------------------------------------------------- */

  /** \u9898\u5361\uFF1An2f \u663E\u793A\u548C\u5F26\u540D\uFF1Bf2n \u663E\u793A\u300C\u8BF7\u542C/\u8BF7\u770B\u6392\u5E03\u5E76\u9009\u51FA\u548C\u5F26\u540D\u300D */
  /* ---------------------------------------------------------------
   *  \u9898\u9762\uFF1A\u548C\u5F26\u540D\u5757\uFF08\u7B56\u5212\u4E66 \u00A74.1.1 / \u00A74.7 / \u00A74.9\uFF09
   *
   *  A \u73A9\u6CD5\uFF1A\u82F1\u6587\u4E3B\u884C + \u4E2D\u6587\u6B21\u884C\uFF1B\u7B49\u5F85\u5F00\u59CB\u65F6\u540D\u5B57\u5FC5\u987B\u906E\u6389\uFF08\u540D\u5B57\u5C31\u662F\u9898\u76EE\uFF09\u3002
   *  B \u73A9\u6CD5\uFF1A\u7EDD\u5BF9\u4E0D\u7ED9\u540D\u5B57 \u2014\u2014 \u8FDE aria-label / title / data-* \u90FD\u4E0D\u80FD\u5E26\uFF08\u00A74.7 \u9632\u6CC4\u9898\uFF09\u3002
   *         \u6807\u9898\u4F4D\u7F6E\u6362\u6210\u9898\u53F7\uFF0C\u540D\u5B57\u7B49\u7B54\u5B8C\u518D\u51FA\u3002
   *
   *  chordNameLang\uFF1Aboth\uFF08\u9ED8\u8BA4\uFF09/ en / zh\uFF0C\u53EA\u5F71\u54CD\u663E\u793A\uFF0C\u4E0D\u5F71\u54CD\u5224\u5206\u3002
   * --------------------------------------------------------------- */
  function chordNameBlock(item) {
    const lang = store.settings.chordNameLang || 'both';
    const flat = chordAccidental() === 'flat';
    const en = bankNameOf(item.qi, item.pc, flat);
    const zh = bankNameZh(item.qi, item.pc, flat);
    if (lang === 'en') return { en: en, zh: '', aria: en };
    if (lang === 'zh') return { en: zh, zh: '', aria: zh };
    return { en: en, zh: zh, aria: zh || en };
  }

  function renderChordPrompt() {
    const item = chordRound.current;
    const nameEl = $('#chordName');
    const sub = $('#chordSub');
    const labelEl = document.querySelector('.chord-label');
    if (!nameEl) return;
    const snap = chordRound.snap || chordSettingsSnapshot();
    const play = item ? (chordRound.play || 'a') : snap.play;

    if (!item) {
      nameEl.textContent = chordRound.state === 'idle' && chordRound.results.length ? '\u672C\u8F6E\u5B8C\u6210 \uD83C\uDF89' : '\u2014';
      nameEl.className = 'chord-name';
      if (labelEl) labelEl.textContent = play === 'b' ? '\u8FD9\u4E2A\u548C\u5F26\u53EB\u4EC0\u4E48\uFF1F' : '\u8BF7\u6309\u51FA\u8FD9\u4E2A\u548C\u5F26';
      if (sub) sub.textContent = '\u6309\u300C\u5F00\u59CB\u300D\u51FA\u9898';
      return;
    }

    const answered = chordRound.state === 'answered';
    const nm = chordNameBlock(item);

    if (play === 'b') {
      /* B\uFF1A\u9898\u53F7 + \u7B54\u5B8C\u624D\u51FA\u540D\u5B57\uFF1B\u7B54\u9898\u8FC7\u7A0B\u91CC\u8FDE aria-label \u90FD\u4E0D\u5E26\u548C\u5F26\u540D */
      if (labelEl) labelEl.textContent = '\u8FD9\u4E2A\u548C\u5F26\u53EB\u4EC0\u4E48\uFF1F';
      /* \u63ED\u6653\u65B9\u5F0F = \u300C\u90FD\u4E0D\u63ED\u6653\u300D\u65F6\uFF0C\u7B54\u5B8C\u4E5F\u4FDD\u6301\u95EE\u53F7\uFF1A\u540D\u5B57\u53EA\u80FD\u9760\u6307\u677F\u81EA\u5DF1\u8BA4\u3002 */
      const revealOff = answered && (snap.revealB || 'wrongOnly') === 'off';
      if (answered && !revealOff) {
        nameEl.className = 'chord-name answered';
        nameEl.innerHTML = '<span class="en">' + esc(nm.en) + '</span>'
          + (nm.zh ? '<span class="zh">' + esc(nm.zh) + '</span>' : '');
        nameEl.setAttribute('aria-label', nm.aria);
      } else {
        nameEl.className = 'chord-name masked';
        nameEl.textContent = '\uFF1F';
        nameEl.removeAttribute('aria-label');
      }
      if (sub) {
        sub.textContent = chordRound.waitStart
          ? '\u70B9\u4E0B\u65B9\u300C\u5F00\u59CB\u300D\u540E\u8BA1\u65F6'
          : answered
            ? (revealOff ? '\u672C\u5C40\u4E0D\u63ED\u6653\u7B54\u6848' : '\u7B54\u6848\u5DF2\u63ED\u6653')
            : '\u770B\u6307\u677F\u4E0A\u7684\u8FD9\u6761\u6307\u6CD5\uFF0C\u4ECE\u4E0B\u9762\u9009\u51FA\u548C\u5F26\u540D';
      }
      syncChordListenButton();
      return;
    }

    /* A\uFF1A\u540D\u5B57\u5C31\u662F\u9898\u76EE\u3002\u7B49\u5F85\u5F00\u59CB\u65F6\u5FC5\u987B\u906E\u4F4F\u3002 */
    if (labelEl) labelEl.textContent = '\u8BF7\u6309\u51FA\u8FD9\u4E2A\u548C\u5F26';
    if (chordRound.waitStart) {
      nameEl.className = 'chord-name masked';
      nameEl.textContent = '\uFF1F';
      nameEl.removeAttribute('aria-label');
    } else {
      nameEl.className = 'chord-name';
      nameEl.innerHTML = '<span class="en">' + esc(nm.en) + '</span>'
        + (nm.zh ? '<span class="zh">' + esc(nm.zh) + '</span>' : '');
      nameEl.setAttribute('aria-label', nm.aria);
    }
    if (sub) {
      const posLabel = { low: '\u4F4E\u628A 1\u20133 \u54C1', mid: '\u4E2D\u628A 4\u20137 \u54C1', high: '\u9AD8\u628A 8 \u54C1\u4EE5\u4E0A', all: '\u5168\u90E8\u628A\u4F4D' }[store.settings.chordPosition || 'all'];
      sub.textContent = chordRound.waitStart
        ? '\u70B9\u4E0B\u65B9\u300C\u5F00\u59CB\u300D\u540E\u8BA1\u65F6'
        : answered
          ? '\u7B54\u6848\u5DF2\u63ED\u6653'
          : (item.pins.length ? '\u7070\u8272\u7684\u662F\u9898\u76EE\u5DF2\u7ECF\u9489\u4F4F\u7684\u5F26\uFF0C\u4E0D\u7528\u7BA1\u5B83 \u00B7 ' : '')
            + posLabel + ' \u00B7 \u8303\u56F4 0\u2013' + snap.maxFret + ' \u54C1';
    }
    syncChordListenButton();
  }

  /** \u300C\u542C\u300D\u6309\u94AE\uFF1A\u53EA\u6709\u771F\u7684\u80FD\u64AD\u624D\u663E\u793A\uFF08B \u73A9\u6CD5\u4E0D\u51FA\u58F0\uFF0C\u53EA\u8BFB\u9898\u9762\uFF09 */
  function syncChordListenButton() {
    const btn = $('#chordListen');
    const ansBtn = $('#chordListenAnswer');
    const play = chordRound.play || 'a';
    const asking = chordRound.state === 'asking' && !chordRound.waitStart;
    /* \u4E24\u4E2A\u5F00\u5173\u4EFB\u610F\u4E00\u4E2A\u5173\u6389\u90FD\u4E0D\u8BB8\u542C\uFF1AchordAListen \u662F A \u73A9\u6CD5\u7684\u65B0\u5165\u53E3\uFF0C
       chordListenDuringAnswer \u662F\u65E7\u5B58\u6863\u91CC\u53EF\u80FD\u8FD8\u5728\u7684\u8001\u5F00\u5173\u3002 */
    const listenOk = store.settings.chordAListen !== false
      && store.settings.chordListenDuringAnswer !== false;
    /* \uD83C\uDFA7 \u8BD5\u542C\u7B54\u6848\u53EA\u5728\u73A9\u6CD5 A \u51FA\u73B0\u3002
       B \u73A9\u6CD5\u6574\u5757\u6307\u677F\u5C31\u662F\u9898\u9762\uFF0C\u300C\u542C\u300D\u548C\u300C\u542C\u7B54\u6848\u300D\u64AD\u7684\u662F\u540C\u4E00\u6761\u6307\u6CD5 \u2014\u2014
       \u6446\u4E24\u4E2A\u6309\u94AE\uFF08\u5B9E\u6D4B\u5C31\u5E76\u6392\u6446\u7740\uFF09\u662F\u7EAF\u91CD\u590D\uFF0C\u7528\u6237 m05725 \u8981\u6C42\u53EA\u7559\u4E00\u4E2A\u3002 */
    if (ansBtn) {
      const answerOk = !asking || store.settings.chordAListenAnswer !== false;
      ansBtn.hidden = play === 'b';
      ansBtn.disabled = !chordRound.current || !!chordRound.waitStart || !answerOk;
      ansBtn.textContent = '\uD83C\uDFA7 \u8BD5\u542C\u7B54\u6848';
      ansBtn.title = answerOk
        ? '\u542C\u6B63\u786E\u7B54\u6848\u90A3\u6761\u6307\u6CD5'
        : '\u8BBE\u7F6E\u91CC\u5173\u6389\u4E86\u300C\u63D0\u4EA4\u524D\u53EF\u4EE5\u542C\u6B63\u786E\u7B54\u6848\u300D';
    }
    if (!btn) return;
    if (play === 'b') {
      btn.hidden = false;
      btn.disabled = !chordRound.current;
      btn.textContent = '\uD83D\uDD0A \u542C (Space)';
      btn.title = '\u542C\u8FD9\u6761\u6307\u6CD5';
      return;
    }
    btn.hidden = false;
    btn.textContent = '\uD83D\uDD0A \u8BD5\u542C\u6211\u6446\u7684 (Space)';
    btn.title = '\u542C\u4F60\u81EA\u5DF1\u6446\u7684\u516D\u6839\u5F26';
    btn.disabled = asking && !listenOk;
  }

  /**
   * B \u73A9\u6CD5\u7684\u9009\u9879\uFF08\u7B56\u5212\u4E66 \u00A74.7\uFF09
   *   1 \u6B63\u786E + 3 \u5E72\u6270\uFF08\u53EF 3\u20136\uFF09\u00B7 \u4E24\u884C\uFF08\u82F1\u6587\u4E3B\u884C + \u4E2D\u6587\u6B21\u884C\uFF09\u00B7 \u952E\u76D8 1\u20136 \u76F4\u9009
   *   \u7B49\u5F85\u5F00\u59CB\u65F6\u6574\u5757\u906E\u4F4F\uFF08.masked\uFF09\uFF0C\u9632\u63D0\u524D\u6CC4\u9898\u3002
   */
  function renderChordOptions() {
    const box = $('#chordOptions');
    const head = $('#chordOptionHead');
    const inputWrap = $('#chordInputWrap');
    if (!box) return;
    if (inputWrap) inputWrap.hidden = true;

    const play = chordRound.play || (chordRound.snap && chordRound.snap.play) || 'a';
    if (play !== 'b') {
      box.innerHTML = '';
      box.hidden = true;
      if (head) head.hidden = true;
      return;
    }

    box.hidden = false;
    if (head) head.hidden = false;
    const waitMask = chordRound.waitStart;
    box.classList.toggle('masked', waitMask);
    if (head) head.classList.toggle('masked', waitMask);

    const opts = chordRound.options || [];
    if (!opts.length) {
      box.innerHTML = '<div class="empty">\u672C\u9898\u6CA1\u6709\u53EF\u7528\u9009\u9879</div>';
      return;
    }

    const answered = chordRound.state === 'answered';
    const chosen = chordRound.chosen;
    const lang = store.settings.chordNameLang || 'both';
    box.innerHTML = '';
    opts.forEach((opt, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt chord-opt';
      b.dataset.root = String(opt.pc);
      b.dataset.quality = String(opt.id);
      /* \u952E\u76D8 1\u20136 \u76F4\u9009\u8981\u80FD\u53CD\u63A8\u56DE\u9009\u9879\uFF1A\u5355\u9760 dataset.root / dataset.quality \u4E5F\u884C\uFF0C
         \u4F46\u5B83\u4EEC\u90FD\u662F\u5B57\u7B26\u4E32\uFF0C\u8FD8\u5F97\u518D\u67E5\u4E00\u904D\u9898\u5E93\u624D\u80FD\u62FF\u5230 qi\uFF1B\u76F4\u63A5\u5E26\u4E0A\u66F4\u7701\u4E8B\u3002 */
      b.dataset.qi = String(opt.qi);
      const enSpan = '<span class="nm-en">' + esc(opt.en) + '</span>';
      const zhSpan = lang === 'both' ? '<span class="nm-zh">' + esc(opt.zh) + '</span>' : '';
      b.innerHTML = '<span class="kbd">' + (i < 9 ? String(i + 1) : '') + '</span>'
        + (lang === 'zh' ? '<span class="nm-en">' + esc(opt.zh) + '</span>' : enSpan + zhSpan);

      if (answered) {
        const isAnswer = opt.qi === chordRound.current.qi && opt.pc === chordRound.current.pc;
        const isChosen = chosen && chosen.qi === opt.qi && chosen.pc === opt.pc;
        /* \u63ED\u6653\u65B9\u5F0F = \u300C\u90FD\u4E0D\u63ED\u6653\u300D\uFF1A\u7B54\u5B8C\u4E5F\u4E0D\u6807\u7EFF / \u6807\u7EA2\uFF0C\u5426\u5219\u300C\u54EA\u4E2A\u662F\u7B54\u6848\u300D\u8FD8\u662F\u88AB\u6807\u51FA\u6765\u4E86\u3002 */
        const revealOff = ((chordRound.snap && chordRound.snap.revealB) || 'wrongOnly') === 'off';
        if (!revealOff) {
          if (isAnswer) b.classList.add('correct');
          if (isChosen && !isAnswer) b.classList.add('wrong');
        }
        b.disabled = true;
      } else if (waitMask) {
        b.disabled = true;
      } else if ((chordRound.excluded || []).indexOf(opt.qi + ':' + opt.pc) >= 0) {
        /* \u63D0\u793A\u5DF2\u7ECF\u6392\u9664\u6389\u7684\u9519\u9879\uFF1A\u7559\u5728\u539F\u4F4D\u5212\u6389\uFF0C\u800C\u4E0D\u662F\u5220\u6389\uFF0C
           \u5426\u5219\u9009\u9879\u4F1A\u5728\u70B9\u51FB\u540E\u8DF3\u4F4D\uFF0C\u952E\u76D8 1\u2013N \u4E5F\u8DDF\u7740\u9519\u4F4D\uFF08.gone \u5C31\u662F\u4E3A\u6B64\u51C6\u5907\u7684\uFF09\u3002 */
        b.classList.add('gone');
        b.disabled = true;
      } else {
        b.addEventListener('click', () => chooseChordOption(opt));
      }
      box.appendChild(b);
    });

    const hint = $('#chordOptionHint');
    if (hint) {
      if (answered) hint.hidden = true;
      else {
        const dropped = (chordRound.excluded || []).length;
        hint.textContent = '\u9009\u4E00\u4E2A\u548C\u5F26\u540D\uFF08\u952E\u76D8 1\u2013' + opts.length + '\uFF09'
          + (dropped ? ' \u00B7 \u5DF2\u6392\u9664 ' + dropped + ' \u4E2A\u9519\u8BEF\u9009\u9879' : '');
        hint.hidden = false;
      }
    }
  }

  /** \u7528\u6237\u70B9\u4E86\u4E00\u4E2A\u9009\u9879\uFF08B \u73A9\u6CD5\uFF09 */
  function chooseChordOption(opt) {
    if ((chordRound.play || 'a') !== 'b') return;
    if (chordRound.state !== 'asking' || chordRound.waitStart) return;
    if (chordRound.submitted) return;
    chordRound.chosen = { qi: opt.qi, pc: opt.pc };
    submitChord(false);
  }

  /** \u516D\u5F26\u72B6\u6001\u6761 + \u6309\u94AE\u53EF\u7528\u6027 */
  function syncChordUI() {
    const play = chordRound.play || 'a';
    const asking = chordRound.state === 'asking' && !chordRound.waitStart;
    /* B \u73A9\u6CD5\u662F\u53EA\u8BFB\u9898\uFF1A\u6307\u677F\u662F\u9898\u9762\uFF0C\u7528\u6237\u53EA\u80FD\u9009\u540D\u5B57 */
    const readOnly = play === 'b';
    /* \u72B6\u6001\u6761\uFF1A\u9759\u97F3\u663E\u793A \u00D7\uFF0C\u7A7A\u5F26\u663E\u793A 0\uFF0C\u6309\u54C1\u663E\u793A\u54C1\u53F7\u3002
       \u300C\u7B49\u5F85\u5F00\u59CB\u300D\u9636\u6BB5\u4E24\u79CD\u73A9\u6CD5\u90FD\u4E0D\u80FD\u6446\u51FA\u8BFB\u6570 \u2014\u2014 A \u73A9\u6CD5\u5728\u51FA\u9898\u65F6\u5DF2\u7ECF\u628A\u9489\u5B50\u54C1\u6570
       \u5199\u8FDB\u4E86 frets\uFF08\u9489\u5B50\u4E0D\u53EF\u6539\uFF0C\u5148\u9489\u4E0A\uFF09\uFF0C\u90A3\u662F\u9898\u9762\u7684\u4E00\u90E8\u5206\uFF0C\u906E\u7F69\u8FD8\u6CA1\u70B9\u5F00\u5C31\u5148
       \u6F0F\u51FA\u6765\u7B49\u4E8E\u63D0\u524D\u7ED9\u7B54\u6848\u3002 */
    const hideFrets = !!chordRound.waitStart;
    for (let n = 6; n >= 1; n--) {
      const idx = 6 - n;              // frets[0] = 6 \u5F26
      const f = chordRound.frets[idx];
      const el = $('#cs' + n);
      if (el) {
        el.textContent = hideFrets ? '\u2013' : ((f == null || f < 0) ? '\u00D7' : String(f));
        el.classList.toggle('muted', !hideFrets && (f == null || f < 0));
        el.classList.toggle('open', !hideFrets && f === 0);
      }
    }
    const anySounding = chordRound.frets.some((f) => f >= 0);
    const submit = $('#chordSubmit');
    if (submit) {
      /* B \u73A9\u6CD5\u4E0D\u7528\u300C\u63D0\u4EA4\u300D\u6309\u94AE\uFF1A\u70B9\u9009\u9879\u5373\u5224\u5B9A */
      submit.hidden = readOnly;
      submit.disabled = !asking || !anySounding;
      submit.classList.toggle('ready', asking && anySounding);
    }
    const clear = $('#chordClear');
    if (clear) {
      clear.hidden = readOnly;
      clear.disabled = !asking;
    }
    syncChordListenButton();
    /* \u6A2A\u6309\u6A21\u5F0F\u5F00\u5173\uFF1A\u53EA\u6709 A \u73A9\u6CD5 + \u89E6\u5C4F\u624D\u6709\u610F\u4E49\uFF08\u5426\u5219\u542B\u6A2A\u6309\u7684\u9898\u65E0\u89E3\uFF09 */
    const barreBtn = $('#chordBarre');
    if (barreBtn) {
      barreBtn.hidden = readOnly;
      barreBtn.classList.toggle('on', !!chordRound.barreMode);
    }
    const mask = $('#chordStartMask');
    if (mask) mask.hidden = !chordRound.waitStart;
    /* \u300C\u770B\u7B54\u6848\u300D\u53EA\u5728 A \u73A9\u6CD5\u80FD\u7B54\u7684\u65F6\u5019\u624D\u6709\u610F\u4E49\uFF1A
       B \u73A9\u6CD5\u6574\u5757\u6307\u677F\u5C31\u662F\u9898\u9762\uFF0C\u672C\u6765\u5C31\u6CA1\u6709\u300C\u7B54\u6848\u300D\u53EF\u770B\uFF0C\u7559\u7740\u662F\u4E00\u9897\u70B9\u4E86\u6CA1\u53CD\u5E94\u7684\u6B7B\u952E\uFF1B
       \u5DF2\u7ECF\u7B54\u5B8C\uFF08\u6216\u8FD8\u6CA1\u5F00\u59CB\uFF09\u65F6\u540C\u7406\uFF0C\u6309\u4E0B\u53BB\u4E5F\u53EA\u4F1A return false\u3002 */
    const revealBtn = $('#chordReveal');
    if (revealBtn) revealBtn.hidden = readOnly || !asking;
    const nextBtn = $('#chordNext');
    /* \u4E0A\u4E00\u9898\u7684\u300C\u4E0B\u4E00\u9898\u300D\u4E0D\u80FD\u8DDF\u5230\u65B0\u9898\u4E0A\uFF1A\u65B0\u9898\u8FD8\u6CA1\u7B54\uFF0C\u6309\u94AE\u53EA\u4F1A\u5728\u70B9\u4E86\u4E4B\u540E\u4EC0\u4E48\u90FD\u4E0D\u505A\u3002 */
    if (nextBtn && chordRound.state === 'asking' && !chordRound.submitted) nextBtn.hidden = true;
    const combo = $('#chordCombo');
    if (combo) combo.textContent = '\u8FDE\u5BF9 ' + chordRound.streak;
    const num = $('#chordTimerNum');
    if (num && chordRound.state === 'idle') num.textContent = '\u2013';
    /* \u6307\u677F\u63D0\u793A\uFF1AB \u73A9\u6CD5\u660E\u786E\u8BF4\u660E\u300C\u8FD9\u662F\u9898\u76EE\uFF0C\u4E0D\u80FD\u6539\u300D */
    const hint = $('#chordBoardHint');
    if (hint) {
      hint.textContent = readOnly
        ? '\u8FD9\u662F\u9898\u76EE\u7ED9\u51FA\u7684\u6307\u6CD5\uFF0C\u4E0D\u80FD\u4FEE\u6539'
        : (chordRound.barreMode
          ? '\u6A2A\u6309\u6A21\u5F0F\uFF1A\u62D6\u52A8\u5C31\u662F\u753B\u6A2A\u6309\uFF0C\u677E\u624B\u9501\u5B9A'
          : '\u6309\u4F4F\u62D6\u52A8\u6446\u4F4D\uFF0C\u677E\u624B\u9501\u5B9A\uFF1B\u53F3\u952E\u62D6\u52A8\u753B\u6A2A\u6309\uFF1B\u70B9\u5DF2\u6709\u6A2A\u6309\u53EF\u5220\u9664');
    }
    /* \u8D77\u59CB\u54C1\u8BF4\u660E\uFF1A\u53EA\u5728\u300CA \u73A9\u6CD5 + \u672C\u9898\u771F\u6709\u6700\u4F4E\u6309\u54C1 + \u5DF2\u7ECF\u70B9\u5F00\u5F00\u59CB\u300D\u65F6\u51FA\u73B0\u3002
       \u7A7A\u5F26\u8D77\u5934\uFF08minF===0\uFF09\u7684\u9898\u6839\u672C\u4E0D\u753B\u84DD\u6846\uFF0C\u7559\u7740\u8FD9\u53E5\u4F1A\u8BA9\u4EBA\u53BB\u627E\u4E00\u4E2A\u4E0D\u5B58\u5728\u7684\u4E1C\u897F\uFF1B
       \u7B49\u5F85\u5F00\u59CB\u9636\u6BB5\u6307\u677F\u6574\u5757\u88AB\u906E\u7F69\u76D6\u7740\uFF0C\u8BF4\u300C\u6846\u5728\u8FD9\u91CC\u300D\u540C\u6837\u5BF9\u4E0D\u4E0A\u3002 */
    const bandNote = $('#chordBandNote');
    if (bandNote) {
      const item = chordRound.current;
      bandNote.hidden = readOnly || !item || !(item.minF > 0) || !!chordRound.waitStart;
    }
  }

  function updateChordFeedback(text, cls) {
    const fb = $('#chordFeedback');
    if (!fb) return;
    fb.className = 'feedback chord-feedback' + (cls ? ' ' + cls : '');
    fb.textContent = text || '';
  }

  /** \u300C\u7B2C N \u5F26\u300D\u2014\u2014 \u5F26\u53F7\u4ECE\u7C97\u5230\u7EC6\uFF0Cfrets \u4E0B\u6807\u8981\u53CD\u8FC7\u6765 */
  function chordStringCN(s) {
    return '\u7B2C ' + s + ' \u5F26';
  }

  /**
   * B \u73A9\u6CD5\u7684\u7B54\u9519\u89E3\u91CA\uFF08\u7B56\u5212\u4E66 \u00A76 \u9A8C\u6536\u7B2C 3 \u6761\uFF09
   *
   * \u5FC5\u987B\u6309\u300C\u8BA4\u9519\u8D28\u91CF / \u8BA4\u9519\u6839\u97F3\u300D\u6765\u5F52\u56E0\uFF0C\u8BF4\u6E05\u4E24\u8005\u5DEE\u5728\u54EA\u4E2A\u97F3\u4E0A\uFF0C
   * \u4F46**\u4E0D\u63D0\u300C\u7F3A\u54EA\u4E2A\u97F3\u300D** \u2014\u2014 \u90A3\u662F A \u73A9\u6CD5\u7684\u8BF4\u6CD5\uFF0CB \u73A9\u6CD5\u91CC\u7528\u6237\u53EA\u8BA4\u4E86\u4E2A\u540D\u5B57\u3002
   */
  function chordDiffText(a, b) {
    const B = bankData();
    if (!B) return '';
    const T = chordTheory();
    const flat = chordAccidental() === 'flat';
    const nameOf = (x) => bankNameOf(x.qi, x.pc, flat);
    const pcName = (x) => (T ? T.pcName(x, flat) : String(x));
    const na = nameOf(a);
    const nb = nameOf(b);
    if (a.qi === b.qi) {
      return '\u8FD9\u662F ' + na + '\uFF0C\u4F60\u9009\u7684\u662F ' + nb + ' \u2014\u2014 \u6839\u97F3\u4E0D\u540C\uFF08'
        + pcName(a.pc) + ' \u5BF9 ' + pcName(b.pc) + '\uFF09';
    }
    if (a.pc === b.pc) {
      const sa = new Set((B.P[a.qi] || []).map((it) => (a.pc + it) % 12));
      const sb = new Set((B.P[b.qi] || []).map((it) => (b.pc + it) % 12));
      const onlyA = [];
      const onlyB = [];
      sa.forEach((x) => { if (!sb.has(x)) onlyA.push(x); });
      sb.forEach((x) => { if (!sa.has(x)) onlyB.push(x); });
      if (onlyA.length === 1 && onlyB.length === 1) {
        return '\u8FD9\u662F ' + na + '\uFF0C\u4F60\u9009\u7684\u662F ' + nb + ' \u2014\u2014 \u4E24\u8005\u53EA\u5DEE\u4E00\u4E2A\u97F3\uFF08'
          + pcName(onlyA[0]) + ' \u5BF9 ' + pcName(onlyB[0]) + '\uFF09';
      }
      return '\u8FD9\u662F ' + na + '\uFF0C\u4F60\u9009\u7684\u662F ' + nb + ' \u2014\u2014 \u4E24\u8005\u4E0D\u662F\u540C\u4E00\u4E2A\u548C\u5F26';
    }
    return '\u8FD9\u662F ' + na + '\uFF0C\u4F60\u9009\u7684\u662F ' + nb + '\u3002';
  }

  /**
   * \u5224\u5B9A\u53CD\u9988\u3002
   *
   * A \u73A9\u6CD5\uFF08\u7B56\u5212\u4E66 \u00A74.6.2\uFF09\uFF1A\u5206\u7EA7 \u2014\u2014
   *   \u7B2C 1 \u6B21\u9519\uFF1A\u53EA\u8BF4\u54EA\u51E0\u6839\u5F26\u4E0D\u5BF9\uFF08\u4E0D\u7ED9\u7B54\u6848\uFF09
   *   \u7B2C 2 \u6B21\u9519\uFF1A\u9010\u5F26\u8BF4\u6E05\u8BE5\u600E\u4E48\u6446\uFF0C\u5E76\u628A\u7B54\u6848\u753B\u5230\u6307\u677F\u4E0A
   * B \u73A9\u6CD5\uFF1A\u6309\u300C\u8BA4\u9519\u8D28\u91CF / \u8BA4\u9519\u6839\u97F3\u300D\u5F52\u56E0\uFF0C\u4E0D\u63D0\u7F3A\u54EA\u4E2A\u97F3\u3002
   */
  function renderChordFeedback(isCorrect, timedOut, verdict) {
    const fb = $('#chordFeedback');
    if (!fb) return;
    const item = chordRound.current;
    if (!item) return;
    const play = chordRound.play || 'a';
    const flat = chordAccidental() === 'flat';
    const snap = chordRound.snap || chordSettingsSnapshot();
    const nm = chordNameBlock(item);
    const fullName = nm.zh ? (nm.en + '\uFF08' + nm.zh + '\uFF09') : nm.en;

    if (play === 'b') {
      /* \u63ED\u6653\u65B9\u5F0F\uFF08chordBReveal\uFF0C\u8BBE\u7F6E\u9762\u677F \u00A74.6\uFF09\uFF1Aoff = \u7B54\u5B8C\u4E5F\u4E0D\u63ED\u6653\uFF0C
         \u53CD\u9988\u53EA\u8BF4\u5BF9\u9519\uFF1BwrongOnly / always \u624D\u628A\u540D\u5B57\u548C\u5DEE\u5F02\u8BF4\u51FA\u6765\u3002 */
      const revealB = (snap.revealB || 'wrongOnly');
      const hideAnswer = revealB === 'off';
      if (isCorrect) {
        fb.className = 'feedback chord-feedback ok';
        fb.textContent = hideAnswer ? '\u2714 \u5BF9\u4E86\u3002' : '\u2714 \u5BF9\u4E86\uFF1A' + fullName;
        return;
      }
      fb.className = 'feedback chord-feedback bad';
      const chosen = chordRound.chosen;
      if (hideAnswer) {
        fb.textContent = chosen
          ? (timedOut ? '\u23F0 \u65F6\u95F4\u5230 \u00B7 ' : '\u2718 ') + '\u4E0D\u5BF9\u3002'
          : (timedOut ? '\u23F0 \u65F6\u95F4\u5230\uFF0C\u6CA1\u6709\u9009\u4EFB\u4F55\u9009\u9879 \u00B7 ' : '\u2718 \u6CA1\u6709\u9009\u4EFB\u4F55\u9009\u9879 \u00B7 ') + '\u4E0D\u5BF9\u3002';
        return;
      }
      if (!chosen) {
        fb.textContent = (timedOut ? '\u23F0 \u65F6\u95F4\u5230\uFF0C\u6CA1\u6709\u9009\u4EFB\u4F55\u9009\u9879 \u00B7 ' : '\u2718 \u6CA1\u6709\u9009\u4EFB\u4F55\u9009\u9879 \u00B7 ')
          + '\u6B63\u786E\u7B54\u6848\uFF1A' + fullName;
        return;
      }
      const txt = chordDiffText({ qi: item.qi, pc: item.pc }, chosen);
      fb.textContent = (timedOut ? '\u23F0 \u65F6\u95F4\u5230 \u00B7 ' : '\u2718 ') + (txt || ('\u6B63\u786E\u7B54\u6848\uFF1A' + fullName));
      return;
    }

    /* \u2014\u2014 A \u73A9\u6CD5 \u2014\u2014 */
    if (isCorrect) {
      fb.className = 'feedback chord-feedback ok';
      /* \u8D85\u65F6\u4F46\u5185\u5BB9\u5BF9\u4E5F\u8981\u8BF4\u6E05\u695A\uFF1A\u4E0D\u7136\u7528\u6237\u4EE5\u4E3A\u81EA\u5DF1\u7B54\u5F97\u5FEB\u3002 */
      fb.textContent = (timedOut ? '\u23F0 \u65F6\u95F4\u5230\uFF0C\u4E0D\u8FC7\u6392\u5E03\u662F\u5BF9\u7684\uFF1A' : '\u2714 \u5BF9\u4E86\uFF1A') + fullName;
      return;
    }

    fb.className = 'feedback chord-feedback bad';
    const bad = (verdict && verdict.bad) ? verdict.bad.slice() : [];
    /* \u7B54\u9519\u53EA\u8BF4\u4E8B\u5B9E\uFF1A\u54EA\u91CC\u9519\u3001\u6B63\u786E\u7B54\u6848\u662F\u4EC0\u4E48\u3002
       \u4EE5\u524D\u5199\u300C\u2718 \u8FD8\u4E0D\u5BF9 \u00B7 \u2026 \u4E0D\u5BF9\u3002\u518D\u627E\u4E00\u6B21\u3002\u300D\u2014\u2014\u300C\u8FD8\u4E0D\u5BF9\u300D\u300C\u518D\u627E\u4E00\u6B21\u300D\u90FD\u662F\u5E9F\u8BDD\uFF0C
       \u7528\u6237\u4ECE\u53CD\u9988\u91CC\u8981\u7684\u662F\u5B9A\u4F4D\uFF0C\u4E0D\u662F\u52A0\u6CB9\uFF08m04981\uFF09\u3002 */
    const head = timedOut ? '\u23F0 \u65F6\u95F4\u5230 \u00B7 ' : '\u2718 ';

    if (verdict && verdict.errors && verdict.errors.indexOf('noSound') >= 0) {
      fb.textContent = head + '\u6CA1\u6709\u9009\u62E9\u4EFB\u4F55\u53D1\u58F0\u5F26\u3002\u6B63\u786E\u7B54\u6848\uFF1A' + fullName;
      return;
    }

    /* \u70B9\u8FC7\u300C\u770B\u7B54\u6848\u300D\uFF1A\u6307\u677F\u5DF2\u7ECF\u7167\u7740\u7B54\u6848\u586B\u597D\u4E86\uFF0C\u9010\u5F26\u5DEE\u522B\u4E00\u5B9A\u662F\u7A7A\u7684\u3002
       \u8FD9\u65F6\u82E5\u8FD8\u8D70\u4E0B\u9762\u7684\u5206\u7EA7\u8BDD\u672F\uFF0C\u5C31\u4F1A\u8F93\u51FA\u300C\u2718 \u8FD8\u4E0D\u5BF9 \u00B7 \u3002\u6B63\u786E\u7B54\u6848\uFF1A\u2026\u300D\u2014\u2014
       \u7A7A\u5217\u4E3E\u8BFB\u8D77\u6765\u50CF\u7A0B\u5E8F\u574F\u4E86\u3002\u76F4\u63A5\u8BF4\u660E\u7B54\u6848\u5DF2\u753B\u5728\u6307\u677F\u4E0A\u3002 */
    if (chordRound.revealed) {
      fb.className = 'feedback chord-feedback info';
      fb.textContent = (timedOut ? '\u23F0 \u65F6\u95F4\u5230 \u00B7 ' : '')
        + '\uD83D\uDC41 \u7B54\u6848\u5DF2\u7ECF\u753B\u5728\u6307\u677F\u4E0A\u4E86\uFF1A' + fullName
        + (item.pins && item.pins.length ? '\uFF08\u7070\u8272\u7684\u5F26\u662F\u9898\u76EE\u9489\u4F4F\u7684\uFF0C\u4E0D\u7528\u7BA1\uFF09' : '');
      return;
    }

    /* \u63D0\u793A\u5206\u7EA7\uFF08chordAHint\uFF0C\u8BBE\u7F6E\u9762\u677F \u00A74.6.2\uFF09\uFF1A
       first  = \u7B2C\u4E00\u6B21\u9519\u5C31\u9010\u5F26\u8BF4\u6E05\u8BE5\u600E\u4E48\u6446
       second = \u53EA\u62A5\u54EA\u51E0\u6839\u5F26\u4E0D\u5BF9\uFF08\u9ED8\u8BA4\uFF09
       off    = \u53EA\u8BF4\u300C\u4E0D\u5BF9\u300D\uFF0C\u8FDE\u5F26\u53F7\u90FD\u4E0D\u7ED9
       \u6CA1\u6709\u300C\u540C\u9898\u91CD\u8BD5\u300D\u673A\u5236\uFF0C\u6240\u4EE5\u8FD9\u91CC\u7528\u300C\u672C\u9898\u662F\u7B2C\u51E0\u6B21\u63D0\u4EA4\u300D= 1 \u6765\u5B9A\u6863\uFF0C
       second \u4E0E first \u7684\u533A\u522B\u4F53\u73B0\u5728\u8BDD\u672F\u8BE6\u7565\u4E0A\uFF0C\u800C\u4E0D\u662F\u7B49\u7B2C\u4E8C\u6B21\u9519\u3002 */
    const hintMode = snap.hint || 'second';
    if (hintMode === 'off') {
      fb.textContent = head + '\u4E0D\u5BF9\u3002';
      return;
    }
    const level = hintMode === 'first' ? 2 : (chordRound.revealed ? 2 : chordRound.attempts);
    if (level <= 1) {
      /* \u7B2C 1 \u6B21\u9519\uFF1A\u53EA\u8BF4\u54EA\u51E0\u6839 \u2014\u2014 \u4E0D\u8BF4\u8BE5\u600E\u4E48\u6446 */
      const list = bad.map(chordStringCN).join('\u3001');
      fb.textContent = head + (list ? list + ' \u4E0D\u5BF9\u3002' : '\u6392\u5E03\u4E0D\u5BF9\u3002');
      return;
    }

    /* \u7B2C 2 \u6B21\u9519\uFF1A\u9010\u5F26\u8BDD\u672F\uFF08\u7B56\u5212\u4E66 \u00A74.6.2 \u7684\u4E09\u53E5\u539F\u8BDD\uFF09 */
    const ans = chordRound.answer || item.fr;
    const frets = chordRound.frets;
    const parts = [];
    for (let i = 0; i < 6; i += 1) {
      const s = 6 - i;
      const want = ans[i];
      const got = frets[i];
      if (got === want) continue;
      if (item.pins.indexOf(s) >= 0) continue;      // \u9489\u5B50\u4E0D\u7ED9\u5FF5
      if (want < 0) {
        parts.push(chordStringCN(s) + '\u4E0D\u8BE5\u54CD\uFF08\u9898\u9762\u5DF2\u538B\u6697\uFF09');
      } else if (want === 0) {
        parts.push(chordStringCN(s) + '\u8981\u7A7A\u5F26');
      } else if (got == null || got < 0) {
        parts.push(chordStringCN(s) + '\u6CA1\u6709\u70B9\uFF0C\u8FD9\u6761\u6307\u6CD5\u8981\u54CD');
      } else {
        parts.push(chordStringCN(s) + '\u6309\u5728\u4E86 ' + got + ' \u54C1\uFF0C\u8FD9\u6761\u6307\u6CD5\u8981 ' + want + ' \u54C1');
      }
    }
    fb.textContent = head + parts.join('\uFF1B') + '\u3002\u6B63\u786E\u7B54\u6848\uFF1A' + fullName;
  }

  /** \u53C2\u8003\u6307\u578B\u5C55\u793A\uFF08\u7B54\u9519 / \u8D85\u65F6\u540E\uFF09\uFF0C\u4E0E\u300C\u81EA\u52A8\u64AD\u653E\u300D\u5F00\u5173\u65E0\u5173 */
  function renderChordReference() {
    const box = $('#chordRef');
    const body = $('#chordRefBody');
    if (!box || !body) return;
    const ref = chordRound.reference;
    /* \u63D0\u793A\u5206\u7EA7\u9009\u300C\u53EA\u62A5\u5BF9\u9519\u300D= \u8FDE\u7B54\u6848\u6307\u578B\u4E5F\u4E0D\u7ED9\uFF0C\u5426\u5219 off \u6863\u7B49\u4E8E\u767D\u8BBE\u3002 */
    const snap = chordRound.snap || chordSettingsSnapshot();
    const hintMode = snap.hint || 'second';
    const show = chordRound.state === 'answered' && chordRound.lastOk === false
      && hintMode !== 'off'
      /* \u63ED\u6653\u65B9\u5F0F\u9009\u300C\u90FD\u4E0D\u63ED\u6653\u300D\u65F6\uFF0C\u9010\u5F26\u53C2\u8003\u6307\u6CD5\u5C31\u662F\u628A\u7B54\u6848\u6284\u7ED9\u7528\u6237\u770B\uFF0C\u4E00\u5E76\u5173\u6389\u3002 */
      && !((snap.revealB || 'wrongOnly') === 'off' && (chordRound.play || 'a') === 'b');
    if (!show || !ref || !ref.ok) {
      box.hidden = true;
      body.textContent = '';
      return;
    }
    const labels = [];
    for (let i = 0; i < 6; i++) {
      const f = ref.frets[i];
      labels.push((6 - i) + '\u5F26 ' + (f < 0 ? '\u00D7' : String(f) + '\u54C1'));
    }
    box.hidden = false;
    body.textContent = labels.join(' \u00B7 ');
  }

  /* ---------------------------------------------------------------
   *  \u7EDF\u8BA1\u5F39\u7A97
   * --------------------------------------------------------------- */
  /* \u5168\u7AD9\u7EDF\u8BA1\u53E3\u5F84\u7EDF\u4E00\uFF08D29\uFF09\uFF1A\u56DB\u4E2A\u6A21\u5F0F\u7684 modeStats \u6C47\u603B\uFF0C\u5F39\u7A97\u4E0E\u4E3B\u9875\u5171\u7528 */
  function modeStatsTotals() {
    let right = 0;
    let wrong = 0;
    let best = 0;
    MODE_STAT_KEYS.forEach((m) => {
      const st = modeStatOf(m);
      right += st.right;
      wrong += st.wrong;
      if (st.bestCombo > best) best = st.bestCombo;
    });
    return { right: right, wrong: wrong, total: right + wrong, best: best };
  }

  function openStats() {
    const all = store.history;
    const now = nowMs();
    const cards = [];
    /* \u4F4D\u7F6E\u5361\u7247\u73B0\u5728\u5206\u4E24\u5957\uFF08\u97F3\u540D store.cards / \u627E\u4F4D\u7F6E store.posCards\uFF09\uFF0C
       \u952E\u5F62\u72B6\u76F8\u540C\u4F46\u8FDB\u5EA6\u4E92\u4E0D\u76F8\u5E72\uFF0C\u6240\u4EE5\u8FD9\u5F20\u8868\u6309\u5F53\u524D\u6A21\u5F0F\u53D6\u81EA\u5DF1\u90A3\u4E00\u5957 \u2014\u2014
       \u6DF7\u5728\u4E00\u8D77\u4F1A\u51FA\u73B0\u4E24\u884C\u540C\u540D\u7684\u300C4 \u5F26 0 \u54C1\u300D\u3002 */
    const cardMap = store.settings.mode === 'pos' ? store.posCards : store.cards;
    Object.keys(cardMap).forEach((k) => { if (cardMap[k].last) cards.push(cardMap[k]); });

    /* 5 \u5F20\u6458\u8981\u5361\u6539\u8BFB modeStats\uFF08D59\uFF09\uFF0C\u4E09\u5F20\u660E\u7EC6\u8868\u4ECD\u6309\u539F\u53E3\u5F84 */
    const totals = modeStatsTotals();
    const cur = modeStatOf(store.settings.mode || 'note');
    const summary = [
      ['\u603B\u7B54\u9898', fmtInt(totals.total)],
      ['\u603B\u6B63\u786E\u7387', fmtPct(totals.right, totals.total)],
      ['\u672C\u6A21\u5F0F\u7B54\u5BF9', fmtInt(cur.right)],
      ['\u672C\u6A21\u5F0F\u7B54\u9519', fmtInt(cur.wrong)],
      ['\u6700\u4F73\u8FDE\u5BF9', fmtInt(totals.best)],
    ];
    $('#statSummary').innerHTML = summary.map((x) =>
      '<div class="sum-card"><div class="num">' + x[1] + '</div><div class="lbl">' + x[0] + '</div></div>').join('');

    const tagCls = (lvl) => (lvl === 0 ? 'l1' : lvl <= 2 ? 'l2' : lvl <= 4 ? 'l3' : 'l4');
    const rows = cards.sort((x, y) => x.due - y.due).map((c) => {
      const over = c.due <= now;
      return '<tr><td>' + c.s + ' \u5F26 ' + c.f + ' \u54C1</td><td>' + noteNameSharp(pcOf(midiOf(c.s, c.f))) +
        '</td><td><span class="tag ' + tagCls(c.lvl) + '">' + (c.lvl === 0 ? LEVEL_LABEL[1] : LEVEL_LABEL[Math.min(c.lvl, 7)]) +
        '</span></td><td style="color:' + (over ? 'var(--amber-2)' : 'inherit') + '">' +
        (over ? '\u73B0\u5728' : fmtRelative(c.due) + ' \u00B7 ' + fmtClock(c.due)) + '</td><td>' + c.a + ' / ' + c.e + '</td></tr>';
    });
    $('#dueTable').innerHTML = '<thead><tr><th>\u4F4D\u7F6E</th><th>\u97F3\u540D</th><th>\u8BB0\u5FC6\u7EA7\u522B</th><th>\u4E0B\u6B21\u590D\u4E60</th><th>\u5BF9 / \u9519</th></tr></thead><tbody>' +
      (rows.join('') || '<tr><td colspan="5" style="color:#6f6456">\u6682\u65E0\u6570\u636E</td></tr>') + '</tbody>';

    const byPos = new Map();
    /* \u5386\u53F2\u91CC\u5E26 m \u5F52\u5C5E\uFF08note / pos\uFF09\u3002\u4EE5\u524D\u4E00\u5F8B\u5408\u5E76\uFF0C\u627E\u4F4D\u7F6E\u6E05\u7A7A\u4E4B\u540E\u8FD9\u5F20\u8868\u8FD8\u7559\u7740\u65E7\u884C\uFF0C
       \u770B\u8D77\u6765\u50CF\u6CA1\u6E05\u5E72\u51C0\uFF1B\u73B0\u5728\u6309\u5F53\u524D\u6A21\u5F0F\u7B5B\u81EA\u5DF1\u90A3\u4E00\u4EFD\u3002 */
    const wantPos = store.settings.mode === 'pos';
    all.forEach((h) => {
      if (wantPos !== ((h.m || 'note') === 'pos')) return;
      const k = h.s + '-' + h.f;
      const o = byPos.get(k) || { s: h.s, f: h.f, a: 0, e: 0 };
      if (h.ok) o.a++; else o.e++;
      byPos.set(k, o);
    });
    const hard = Array.from(byPos.values()).sort((x, y) => y.e - x.e || x.a - y.a).slice(0, 15).map((o) => {
      const t = o.a + o.e;
      return '<tr><td>' + o.s + ' \u5F26 ' + o.f + ' \u54C1</td><td>' + noteNameSharp(pcOf(midiOf(o.s, o.f))) +
        '</td><td style="color:var(--green)">' + o.a + '</td><td style="color:var(--red)">' + o.e +
        '</td><td>' + Math.round((o.e / t) * 100) + '%</td></tr>';
    });
    $('#hardTable').innerHTML = '<thead><tr><th>\u4F4D\u7F6E</th><th>\u97F3\u540D</th><th>\u7B54\u5BF9</th><th>\u7B54\u9519</th><th>\u9519\u8BEF\u7387</th></tr></thead><tbody>' +
      (hard.join('') || '<tr><td colspan="5" style="color:#6f6456">\u6682\u65E0\u6570\u636E</td></tr>') + '</tbody>';

    renderIntervalStatsTable();

    openModal('#statsModal');
  }

  /* \u7EDF\u8BA1\u5F39\u7A97\u91CC\u7684\u97F3\u7A0B\u6BB5\uFF1A\u6309\u300C\u73A9\u6CD5 \u00D7 \u97F3\u7A0B \u00D7 \u65B9\u5411\u300D\u805A\u5408\u5361\u7247 */
  function renderIntervalStatsTable() {
    const el = $('#intervalStatsTable');
    if (!el) return;
    const T = intervalTheory();
    if (!T) {
      el.innerHTML = '<thead><tr><th>\u97F3\u7A0B</th></tr></thead><tbody><tr><td style="color:#6f6456">\u97F3\u7A0B\u7406\u8BBA\u5C42\u672A\u52A0\u8F7D</td></tr></tbody>';
      return;
    }

    const now = nowMs();
    const agg = {};
    Object.keys(store.intervalCards || {}).forEach((k) => {
      const parsed = T.parseCardKey(k);
      const c = store.intervalCards[k];
      if (!parsed || !c) return;
      if (!c.a && !c.e) return;
      const key = parsed.play + '|' + parsed.interval + '|' + parsed.dir + '|' + parsed.mode;
      const o = agg[key] || {
        play: parsed.play, interval: parsed.interval, dir: parsed.dir, mode: parsed.mode,
        a: 0, e: 0, lvl: 0, due: 0, shapes: 0,
      };
      o.a += c.a || 0;
      o.e += c.e || 0;
      o.lvl = Math.max(o.lvl, c.lvl || 0);
      o.due = o.due ? Math.min(o.due, c.due || o.due) : (c.due || 0);
      o.shapes++;
      agg[key] = o;
    });

    const rows = Object.keys(agg).map((k) => agg[k]).sort((x, y) => {
      const ex = x.e / Math.max(1, x.a + x.e);
      const ey = y.e / Math.max(1, y.a + y.e);
      return ey - ex || (y.a + y.e) - (x.a + x.e);
    });

    const tagCls = (lvl) => (lvl === 0 ? 'l1' : lvl <= 2 ? 'l2' : lvl <= 4 ? 'l3' : 'l4');

    const body = rows.slice(0, 40).map((o) => {
      const it = T.intervalById(o.interval);
      const nm = it ? it.name : o.interval;
      const dirTxt = o.dir === 'down' ? '\u4E0B\u884C' : (o.dir === 'up' ? '\u4E0A\u884C' : '\u65E0\u5411');
      const playTxt = o.play === 'b' ? '\u73A9\u6CD5 B' : '\u73A9\u6CD5 A';
      const total = o.a + o.e;
      const err = Math.round((o.e / Math.max(1, total)) * 100);
      const over = o.due && o.due <= now;
      const when = over ? '\u73B0\u5728' : (o.due ? fmtRelative(o.due) : '\u2014');
      return '<tr>'
        + '<td>' + playTxt + '</td>'
        + '<td>' + nm + '</td>'
        + '<td>' + dirTxt + '</td>'
        + '<td>' + (o.mode === 'equiv' ? '\u8DE8\u516B\u5EA6' : '\u7CBE\u786E') + '</td>'
        + '<td><span class="tag ' + tagCls(o.lvl) + '">'
        + (o.lvl === 0 ? LEVEL_LABEL[1] : LEVEL_LABEL[Math.min(o.lvl, 7)]) + '</span></td>'
        + '<td style="color:' + (over ? 'var(--amber-2)' : 'inherit') + '">' + when + '</td>'
        + '<td>' + o.a + ' / ' + o.e + '</td>'
        + '<td>' + err + '%</td>'
        + '</tr>';
    });

    el.innerHTML = '<thead><tr>'
      + '<th>\u73A9\u6CD5</th><th>\u97F3\u7A0B</th><th>\u65B9\u5411</th><th>\u89C4\u5219</th>'
      + '<th>\u8BB0\u5FC6\u7EA7\u522B</th><th>\u4E0B\u6B21\u590D\u4E60</th><th>\u5BF9 / \u9519</th><th>\u9519\u8BEF\u7387</th>'
      + '</tr></thead><tbody>'
      + (body.join('') || '<tr><td colspan="8" style="color:#6f6456">\u8FD8\u6CA1\u6709\u97F3\u7A0B\u7EC3\u4E60\u8BB0\u5F55</td></tr>')
      + '</tbody>';
  }

  /* ---------------------------------------------------------------
   *  \u8BBE\u7F6E\u540C\u6B65
   * --------------------------------------------------------------- */
  function syncSettingsUI() {
    const s = store.settings;
    const setRadio = (name, value) => {
      const el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
      if (el) el.checked = true;
    };
    /* \u8303\u56F4\u5355\u9009\u663E\u793A\u7684\u662F\u300C\u5F53\u524D\u6A21\u5F0F\u300D\u81EA\u5DF1\u7684\u503C\uFF0C\u4E0D\u662F\u53E6\u4E00\u4E2A\u6A21\u5F0F\u7684\u3002
       \u97F3\u7A0B\u6A21\u5F0F\u6709\u81EA\u5DF1\u7684 intervalRange \u63A7\u4EF6\uFF1B\u5B83\u4E0D\u53C2\u4E0E note/pos \u7684\u8FD9\u5957\u5355\u9009\uFF0C
       \u6240\u4EE5\u843D\u5230\u97F3\u7A0B\u6A21\u5F0F\u65F6\u7528\u517C\u5BB9\u5B57\u6BB5 range \u515C\u5E95\uFF0C\u4FDD\u8BC1\u9762\u677F\u4E0D\u4F1A\u663E\u793A\u6210\u9519\u7684\u3002 */
    setRadio('range', store.settings.mode === 'interval'
      ? (String(s.range || '0-12'))
      : currentRange());
    setRadio('mode', s.mode);
    setRadio('acc', s.accidental);
    setRadio('novelty', s.novelty);
    /* \u300C\u5F00\u59CB\u65B9\u5F0F\u300D\u6309\u6A21\u5F0F\u5404\u4E00\u4EFD\uFF08\u7B2C 7 \u6761\uFF09\uFF1A\u97F3\u540D\u8BFB startMode\u3001\u627E\u4F4D\u7F6E\u8BFB posStartMode\u3001
       \u548C\u5F26\u8BFB chordStartMode\u3001\u97F3\u7A0B\u8BFB intervalStartMode\uFF08\u97F3\u7A0B\u6709\u81EA\u5DF1\u7684\u4E00\u5957\u63A7\u4EF6\uFF09\u3002 */
    setRadio('startMode', modeStartMode());
    document.querySelectorAll('#stringChips input').forEach((inp) => {
      inp.checked = s.strings.indexOf(Number(inp.dataset.str)) >= 0;
    });
    const inf = s.time === 'inf' || s.time === Infinity;
    if (!inf) $('#timeRange').value = String(s.time);
    $('#lvTime').textContent = limitLabel(s.time);
    document.querySelectorAll('#timeQuick .btn').forEach((b) => {
      const v = b.dataset.sec;
      b.classList.toggle('active', inf ? v === 'inf' : Number(v) === Number(s.time));
    });
    $('#timeRange').classList.toggle('off', inf);
    $('#perFretCheck').checked = s.timePerFret === 'fret';
    renderStringTimes();
    $('#sizeRange').value = String(s.size);
    $('#lvSize').textContent = s.size + ' \u9898';
    $('#autoPlay').checked = s.autoPlay;
    $('#autoPlaySet').checked = s.autoPlay;
    /* \u9759\u97F3 / \u97F3\u91CF\uFF1A\u56DB\u4E2A\u6A21\u5F0F\u5404\u5237\u5404\u7684\uFF08#volRange \u4E0E #muteSet \u663E\u793A\u5F53\u524D\u6A21\u5F0F\u7684\u503C\uFF09 */
    syncSoundUI();
    $('#autoSection').checked = s.autoSection;
    // \u9009\u9879\u6570\u91CF
    const ocInf = s.optionCount === 'inf' || s.optionCount === Infinity;
    const oc = ocInf ? 12 : clamp(Number(s.optionCount) || 7, 2, 12);
    if (!ocInf) $('#optionRange').value = String(oc);
    $('#lvOptions').textContent = ocInf ? '\u65E0\u9650\uFF0812 \u4E2A\u5168\u5217\uFF09' : oc + ' \u4E2A';
    document.querySelectorAll('#optionQuick .btn').forEach((b) => {
      b.classList.toggle('active', ocInf ? b.dataset.n === 'inf' : Number(b.dataset.n) === oc);
    });
    $('#optionRange').classList.toggle('off', ocInf);
    // \u5347\u964D\u8C03\u591A\u9009 / \u8C03\u8BD5\u680F
    syncAccidentalUI();
    if ($('#debugModeSet')) $('#debugModeSet').checked = !!s.debugMode;
    applyDebugMode();
    $('#pauseWrong').checked = s.pauseOnWrong !== false;
    /* \u63A8\u8FDB\u5F00\u5173\u6309\u6A21\u5F0F\u5404\u4E00\u4EFD\uFF08\u7B2C 5 / 7 \u6761\uFF09\uFF1A
       \u97F3\u540D = autoStartOnNext / autoNextOnCorrect\uFF0C
       \u627E\u4F4D\u7F6E = posAutoStartOnNext / posAutoNextOnCorrect\uFF08Q44\uFF09\uFF0C
       \u548C\u5F26 = chordAutoStartOnNext / chordAutoNextOnCorrect\uFF08\u72EC\u7ACB\u7684\u9ED8\u8BA4\u503C\uFF0C\u9ED8\u8BA4\u90FD\u5173\uFF09\u3002 */
    const pushOn = pushSettingsForCurrentMode();
    $('#autoStartNextSet').checked = pushOn.startNext;
    $('#autoNextCorrectSet').checked = pushOn.nextCorrect;
    // \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1A\u70B9\u9009\u53D1\u58F0 / \u8C03\u8BD5\u5F00\u5173
    if ($('#posClickSoundSet')) $('#posClickSoundSet').checked = s.posClickSound !== false;
    if ($('#posFreeClickSet')) $('#posFreeClickSet').checked = !!s.posFreeClick;
    if ($('#posShowAllNamesSet')) $('#posShowAllNamesSet').checked = !!s.posShowAllNames;
    syncPosSettingsUI();
    /* \u548C\u5F26\u6A21\u5F0F\u8BBE\u7F6E\uFF08\u72EC\u7ACB\u5B57\u6BB5\uFF0C\u7EDD\u4E0D\u4E0E\u5355\u97F3\u6A21\u5F0F\u5171\u4EAB\u9664\u58F0\u97F3\u4EE5\u5916\u7684\u9879\uFF09 */
    syncChordSettingsUI();
    /* \u97F3\u7A0B\u6A21\u5F0F\u8BBE\u7F6E\uFF08\u540C\u4E0A\uFF0C\u5168\u90E8\u72EC\u7ACB\u5B57\u6BB5\uFF09 */
    syncIntervalSettingsUI();
  }

  /* ---------------------------------------------------------------
   *  \u97F3\u7A0B\u8BBE\u7F6E\u9762\u677F\u540C\u6B65
   *
   *  \u6240\u6709\u5B57\u6BB5\u90FD\u662F\u97F3\u7A0B\u6A21\u5F0F\u72EC\u5360\u7684\uFF08D26/D27/D34/D37\u2026\uFF09\uFF0C
   *  \u8FD9\u91CC\u7EDD\u4E0D\u8BFB\u5199 note/pos/chord \u7684\u4EFB\u4F55\u8BBE\u7F6E\u9879\u3002
   * --------------------------------------------------------------- */
  function syncIntervalSettingsUI() {
    const T = intervalTheory();
    const s = store.settings;
    if (!T) return;

    const setRadio = (name, value) => {
      const el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
      if (el) el.checked = true;
    };

    /* \u73A9\u6CD5 */
    setRadio('intervalPlay', s.intervalPlay === 'b' ? 'b' : 'a');
    /* \u8303\u56F4 */
    setRadio('intervalRange', String(s.intervalRange || '0-12'));
    /* \u65B9\u5411 */
    setRadio('intervalDirB', s.intervalDirB === 'down' ? 'down' : (s.intervalDirB === 'random' ? 'random' : 'up'));
    /* \u5F00\u59CB\u65B9\u5F0F */
    setRadio('intervalStartMode', s.intervalStartMode === 'auto' ? 'auto' : 'manual');
    /* \u51FA\u9898\u81EA\u52A8\u64AD\u653E */
    setRadio('intervalPreview', s.intervalPreview === 'off' ? 'off' : 'on');

    /* \u5F26\u9009\u62E9 */
    const strings = intervalStrings();
    document.querySelectorAll('#intervalStringChips input').forEach((inp) => {
      inp.checked = strings.indexOf(Number(inp.dataset.istr)) >= 0;
    });

    /* \u97F3\u7A0B\u96C6\u5408\u82AF\u7247\uFF08\u6309\u76EE\u5F55\u751F\u6210\uFF0C\u53EA\u751F\u6210\u4E00\u6B21\uFF09 */
    renderIntervalSetChips('A');
    renderIntervalSetChips('B');

    /* \u9009\u9879\u6570\u91CF */
    const cap = Math.max(1, T.maxOptionCount(intervalSetA()));
    const want = Number(s.intervalOptionCount) || 4;
    const cur = clamp(Math.round(want), Math.min(4, cap), cap);
    const range = $('#intervalOptionRange');
    if (range) {
      range.min = String(Math.min(4, cap));
      range.max = String(cap);
      range.value = String(cur);
    }
    const lvOpt = $('#lvIntervalOptions');
    if (lvOpt) lvOpt.textContent = cur + ' \u4E2A\uFF08\u4E0A\u9650 ' + cap + '\uFF09';
    document.querySelectorAll('#intervalOptionQuick .btn').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.n) === cur);
      b.disabled = Number(b.dataset.n) > cap;
    });
    const optTip = $('#intervalOptionTip');
    if (optTip) {
      optTip.textContent = '\u4E0A\u9650\u4F1A\u968F\u542F\u7528\u96C6\u5408\u81EA\u52A8\u6536\u7F29\uFF1A\u5F53\u524D\u96C6\u5408\u6709 ' + cap + ' \u4E2A\u5019\u9009\u7B54\u6848\u3002';
    }

    /* \u65F6\u95F4 */
    const useA = s.intervalTimeTarget !== 'b';
    const tA = intervalTimeOf(s.intervalTimeA, 10);
    const tB = intervalTimeOf(s.intervalTimeB, 15);
    const lvA = $('#lvIntervalTimeA');
    if (lvA) lvA.textContent = limitLabel(tA);
    const lvB = $('#lvIntervalTimeB');
    if (lvB) lvB.textContent = limitLabel(tB);
    setRadio('intervalTimePreset', useA ? 'a' : 'b');
    const tr = $('#intervalTimeRange');
    const curT = useA ? tA : tB;
    const infNow = curT === 'inf';
    if (tr) {
      tr.value = String(infNow ? 10 : curT);
      tr.classList.toggle('off', infNow);
    }
    document.querySelectorAll('#intervalTimeQuick .btn').forEach((b) => {
      const v = b.dataset.sec;
      b.classList.toggle('active', v === 'inf' ? infNow : (!infNow && Number(v) === Number(curT)));
    });

    /* \u9898\u91CF */
    const size = clamp(Math.round(Number(s.intervalSize) || 10), 5, 50);
    const sr = $('#intervalSizeRange');
    if (sr) sr.value = String(size);
    const lvSize = $('#lvIntervalSize');
    if (lvSize) lvSize.textContent = size + ' \u9898';

    /* \u5E03\u5C14\u5F00\u5173 */
    const setChk = (sel, val) => { const el = $(sel); if (el) el.checked = !!val; };
    setChk('#intervalEquivSet', s.intervalEquiv);
    setChk('#intervalShowRootNameSet', s.intervalShowRootName !== false);
    setChk('#intervalClickSoundSet', s.intervalClickSound);
    setChk('#intervalPerFretSet', s.intervalPerFret);
    setChk('#intervalAutoNextSet', s.intervalAutoNextOnCorrect);
    setChk('#intervalListenDuringSet', s.intervalListenDuringAnswer !== false);
    setChk('#intervalAutoStartNextSet', s.intervalAutoStartNext !== false);
    setChk('#intervalAutoSectionSet', s.intervalAutoSection !== false);
    setRadio('intervalNovelty', s.intervalNovelty === 'new' ? 'new' : (s.intervalNovelty === 'familiar' ? 'familiar' : 'mix'));
    /* \u97F3\u540D\u5199\u6CD5\uFF08\u97F3\u7A0B\u81EA\u5DF1\u7684\u5B57\u6BB5\uFF0C\u72EC\u7ACB\u4E8E\u97F3\u540D\u6A21\u5F0F\uFF09 */
    document.querySelectorAll('input[name="intervalAcc"]').forEach((inp) => {
      inp.checked = inp.value === intervalAccidental();
    });

    /* \u97F3\u7A0B\u81EA\u5DF1\u7684\u5347\u964D\u8C03\u5F00\u5173 */
    syncIntervalAccUI();
  }

  /* \u751F\u6210\u73A9\u6CD5 A / B \u7684\u97F3\u7A0B\u82AF\u7247\uFF08\u53EA\u751F\u6210\u4E00\u6B21\uFF1B\u4E4B\u540E\u53EA\u6539 checked\uFF09 */
  function renderIntervalSetChips(which) {
    const T = intervalTheory();
    if (!T) return;
    const box = $(which === 'A' ? '#intervalSetAChips' : '#intervalSetBChips');
    if (!box) return;

    const isA = which === 'A';
    const current = isA ? intervalSetA() : intervalSetB();

    if (!box.dataset.built) {
      box.dataset.built = '1';
      T.INTERVALS.forEach((it) => {
        /* \u73A9\u6CD5 B \u6C38\u4E45\u6392\u9664\u7EAF\u4E00\u5EA6\uFF1A\u8FDE\u52FE\u9009\u9879\u90FD\u4E0D\u7ED9\uFF08D18\uFF09 */
        if (!isA && !it.hasDir) return;
        const label = document.createElement('label');
        label.className = 'chip';
        label.innerHTML = '<input type="checkbox" data-iv="' + it.id + '" /> ' + it.name;
        const inp = label.querySelector('input');
        inp.addEventListener('change', () => {
          onIntervalSetToggle(isA, it.id, inp.checked);
        });
        box.appendChild(label);
      });
    }

    box.querySelectorAll('input[data-iv]').forEach((inp) => {
      inp.checked = current.indexOf(inp.dataset.iv) >= 0;
    });
  }

  /* \u52FE\u9009/\u53D6\u6D88\u4E00\u4E2A\u97F3\u7A0B\uFF1A\u5E26 C >= 4 \u7684\u4FDD\u62A4\uFF08D33\uFF09 */
  function onIntervalSetToggle(isA, id, checked) {
    const T = intervalTheory();
    if (!T) return;
    const key = isA ? 'intervalSetA' : 'intervalSetB';
    const cur = isA ? intervalSetA() : intervalSetB();
    let next = cur.slice();
    if (checked) {
      if (next.indexOf(id) < 0) next.push(id);
    } else {
      next = next.filter((x) => x !== id);
    }
    next = T.normalizeSet(next, !isA);

    if (isA) {
      const c = T.candidateCount(next);
      if (c < 4) {
        /* \u963B\u6B62\u53D6\u6D88\uFF0C\u4FDD\u7559\u539F\u52FE\u9009\uFF0C\u5E76\u7ED9\u51FA\u7B80\u77ED\u539F\u56E0\uFF08\u4E0D\u52A0\u786E\u8BA4\u5F39\u7A97\uFF09 */
        setDataNote('\u73A9\u6CD5 A \u81F3\u5C11\u9700\u8981\u51D1\u51FA 4 \u4E2A\u5019\u9009\u7B54\u6848\uFF0C\u5F53\u524D\u64CD\u4F5C\u4F1A\u8BA9\u5019\u9009\u4E0D\u8DB3\uFF0C\u5DF2\u963B\u6B62\u3002', 'err');
        renderIntervalSetChips('A');
        return;
      }
    } else if (!next.length) {
      setDataNote('\u73A9\u6CD5 B \u81F3\u5C11\u8981\u4FDD\u7559\u4E00\u4E2A\u97F3\u7A0B\u3002', 'err');
      renderIntervalSetChips('B');
      return;
    }

    store.settings[key] = next;
    save();
    renderIntervalSetChips(isA ? 'A' : 'B');
    syncIntervalSettingsUI();
    applySettingsChange(store.settings.intervalAutoSection !== false);
  }

  /* \u5E94\u7528\u97F3\u7A0B\u96C6\u5408\u9884\u8BBE */
  function applyIntervalPreset(isA, preset) {
    const T = intervalTheory();
    if (!T) return;
    let list;
    if (preset === 'all') {
      list = T.PRESET_ALL.slice();
    } else {
      list = T.PRESET_BASIC.slice();
      /* \u73A9\u6CD5 A \u7684\u57FA\u7840\u9884\u8BBE\u5305\u542B\u7EAF\u4E00\u5EA6\uFF08\u00A76.2-4\uFF09 */
      if (isA) list.push('unison');
    }
    list = T.normalizeSet(list, !isA);
    if (isA) {
      while (T.candidateCount(list) < 4) {
        /* \u6781\u7AEF\u515C\u5E95\uFF1A\u8865\u8DB3\u5230 4 \u4E2A\u5019\u9009\uFF08\u6B63\u5E38\u9884\u8BBE\u4E0D\u4F1A\u8D70\u5230\u8FD9\u91CC\uFF09 */
        if (list.indexOf('M3') < 0) list.push('M3');
        else break;
      }
    }
    store.settings[isA ? 'intervalSetA' : 'intervalSetB'] = list;
    save();
    renderIntervalSetChips(isA ? 'A' : 'B');
    syncIntervalSettingsUI();
    applySettingsChange(store.settings.intervalAutoSection !== false);
  }

  /* \u8BBE\u7F6E\u91CC\u201C\u6309\u5F26\u5355\u72EC\u9650\u65F6\u201D\u7684\u8F93\u5165\u6846 */
  function renderStringTimes() {
    const box = $('#stringTimes');
    const s = store.settings;
    box.innerHTML = STRINGS.map((st) => {
      const v = (s.timePerString && s.timePerString[st.n] != null) ? s.timePerString[st.n] : '';
      return '<div class="st-row" data-str="' + st.n + '"><b>' + st.n + ' \u5F26</b>' +
        '<input type="number" min="2" max="60" step="1" placeholder="' + (s.time === 'inf' ? '\u221E' : s.time) + '" value="' + v + '" />\u79D2' +
        '<span class="st-eff">' + effectiveTimeHint(st.n) + '</span></div>';
    }).join('');
    box.querySelectorAll('input').forEach((inp) => {
      inp.addEventListener('change', () => {
        const n = Number(inp.parentElement.dataset.str);
        const val = inp.value.trim();
        store.settings.timePerString = store.settings.timePerString || {};
        if (val === '') delete store.settings.timePerString[n];
        else store.settings.timePerString[n] = clamp(Number(val) || s.time, 2, 60);
        save();
        renderStringTimes();
        refreshCurrentLimit();
      });
    });
  }
  function effectiveTimeHint(n) {
    const lo = timeLimitFor(n, 0);
    const hi = timeLimitFor(n, 12);
    const lab = (v) => (v === Infinity ? '\u4E0D\u9650\u65F6' : fmtShort(v));
    if (lo === hi) return '\u6BCF\u9898 ' + lab(lo);
    return '\u5F00\u653E ' + lab(lo) + ' \u00B7 12 \u54C1 ' + lab(hi);
  }

  /* \u8BBE\u7F6E\u6539\u4E86\u9650\u65F6\u540E\uFF0C\u82E5\u5F53\u524D\u9898\u8FD8\u6CA1\u5F00\u59CB\uFF08\u6216\u6B63\u5728\u8BA1\u65F6\uFF09\uFF0C\u540C\u6B65\u65B0\u9650\u65F6 */
  function refreshCurrentLimit() {
    if (!round.current || round.state === 'idle') return;
    round.limit = timeLimitFor(round.current.s, round.current.f);
    round.infinite = round.limit === Infinity;
    if (round.waitStart) {
      showWaitToStart();
    } else if (round.state === 'asking' && round.startAt) {
      round.deadline = round.infinite ? Infinity : round.startAt + round.limit * 1000;
      startTimer();
    }
  }

  /* \u548C\u5F26\u6A21\u5F0F\uFF1A\u6539\u4E86\u9650\u65F6\u8BBE\u7F6E\u540E\u7ACB\u523B\u6309\u65B0\u503C\u91CD\u7B97\u5F53\u524D\u8FD9\u4E00\u9898\uFF0C\u4E0D\u7528\u56DE\u4E3B\u9875\u91CD\u8FDB */
  function refreshChordLimit() {
    const snap = chordRound.snap;
    if (!snap) return;
    snap.timeN2f = chordTimeOf(store.settings, 'n2f');
    snap.timeF2n = chordTimeOf(store.settings, 'f2n');
    chordRound.limit = chordLimitFor();
    chordRound.infinite = chordRound.limit === Infinity;
    if (chordRound.state !== 'asking') return;
    if (chordRound.waitStart) {
      showChordWaitToStart();
      return;
    }
    if (!chordRound.startAt) return;
    chordRound.deadline = chordRound.infinite ? Infinity : chordRound.startAt + chordRound.limit * 1000;
    startChordTimer();
    syncChordUI();
  }

  /* \u97F3\u7A0B\u6A21\u5F0F\uFF1A\u540C\u7406\uFF0C\u6539\u4E86 A/B \u6863\u9650\u65F6\u540E\u7ACB\u523B\u6309\u65B0\u503C\u91CD\u7B97\u5F53\u524D\u8FD9\u4E00\u9898 */
  function refreshIntervalLimit() {
    const snap = intervalRound.snap;
    if (!snap) return;
    snap.timeA = intervalTimeOf(store.settings.intervalTimeA, 10);
    snap.timeB = intervalTimeOf(store.settings.intervalTimeB, 15);
    intervalRound.limit = intervalLimitFor(intervalRound.cellA || intervalRound.start, intervalRound.cellB);
    intervalRound.infinite = intervalRound.limit === Infinity;
    if (intervalRound.state !== 'asking') return;
    if (intervalRound.waitStart) {
      showIntervalWaitToStart();
      return;
    }
    if (!intervalRound.startAt) return;
    intervalRound.deadline = intervalRound.infinite ? Infinity : intervalRound.startAt + intervalRound.limit * 1000;
    tickIntervalTimer();
    syncIntervalUI();
  }

  /* \u53EA\u5F71\u54CD\u300C\u5F53\u524D\u8FD9\u4E00\u9898\u600E\u4E48\u5224 / \u600E\u4E48\u64AD / \u600E\u4E48\u663E\u793A\u300D\u7684\u8BBE\u7F6E\uFF08\u53D1\u58F0\u65B9\u5F0F\u3001\u81EA\u52A8\u64AD\u653E\u3001
     \u63ED\u6653\u64AD\u653E\u3001\u70B9\u9009\u53D1\u58F0\u3001\u9AD8\u628A\u4F4D\u52A0\u65F6\u3001\u5F00\u59CB\u65B9\u5F0F\u3001\u97F3\u540D\u5199\u6CD5\u3001\u9650\u65F6\u2026\uFF09\u6539\u5B8C\u7ACB\u5373\u9876\u4E0A\u53BB\uFF1A
     \u76F4\u63A5\u6539\u5199\u672C\u9898\u5FEB\u7167\u91CC\u7684\u5BF9\u5E94\u5B57\u6BB5\u5E76\u91CD\u753B\uFF0C\u4E0D\u518D\u8981\u6C42\u56DE\u4E3B\u9875\u91CD\u8FDB\u3002
     \u7ED3\u6784\u6027\u5B57\u6BB5\uFF08\u8303\u56F4 / \u65B9\u5411 / \u5BBD\u5EA6 / \u96C6\u5408 / \u9009\u9879\u6570 / \u9898\u91CF\uFF09\u4F1A\u6539\u53D8\u9898\u76EE\u672C\u8EAB\uFF0C
     \u4E0D\u80FD\u4E2D\u9014\u6539\u5199\uFF0C\u7531\u5404\u81EA\u7684 handler \u91CD\u5F00\u4E00\u8F6E\u6216\u7B49\u4E0B\u4E00\u8F6E\u3002 */
  function applyLiveSettings() {
    const mode = store.settings.mode;
    const s = store.settings;
    if (mode === 'chord') {
      const snap = chordRound.snap;
      if (snap) {
        /* \u9898\u5E93\u5316\u540E snap \u91CC\u5DF2\u7ECF\u6CA1\u6709\u5224\u5206\u5BBD\u5EA6\u4E86\uFF1A\u53EA\u5269\u64AD\u653E\u4E0E\u8BA1\u65F6\u8FD9\u7C7B\u300C\u6539\u4E86\u5F53\u573A\u751F\u6548\u300D\u7684\u9879 */
        snap.play = chordPlayMode();
        snap.dir = snap.play === 'b' ? 'f2n' : 'n2f';
        snap.style = s.chordStyle || 'general';
        snap.effort = s.chordAEffort === 'easy' ? 'easy' : 'common';
        snap.nameLang = (s.chordNameLang === 'en' || s.chordNameLang === 'zh') ? s.chordNameLang : 'both';
        snap.strum = (s.chordStrum === 'block' || s.chordStrum === 'strumUp') ? s.chordStrum : 'strum';
        snap.preview = s.chordPreview || 'reference';
        snap.revealPlay = (s.chordRevealPlay === 'always' || s.chordRevealPlay === 'off')
          ? s.chordRevealPlay : 'wrongOnly';
        snap.listenDuringAnswer = s.chordListenDuringAnswer !== false;
        snap.flat = chordAccidental() === 'flat';
        snap.soundOn = snap.play === 'b' ? (s.chordBSound !== false) : (s.chordASound !== false);
        snap.hint = snap.play === 'b' ? (s.chordBHint || 'second') : (s.chordAHint || 'second');
        snap.revealB = s.chordBReveal || 'wrongOnly';
        snap.optionCount = clamp(Number(s.chordBOptionCount) || 4, 3, 6);
        snap.distractor = s.chordBDistractor || 'mixed';
        snap.strict = !!s.chordBStrict;
        snap.autoBarreHint = s.chordAutoBarreHint !== false;
        snap.timeN2f = chordTimeOf(s, 'n2f');
        snap.timeF2n = chordTimeOf(s, 'f2n');
        chordRound.limit = chordLimitFor();
        chordRound.infinite = chordRound.limit === Infinity;
        if (chordRound.state === 'asking' && chordRound.startAt) {
          if (chordRound.waitStart) {
            showChordWaitToStart();
          } else {
            chordRound.deadline = chordRound.infinite
              ? Infinity
              : chordRound.startAt + chordRound.limit * 1000;
            startChordTimer();
          }
        }
      }
      renderChordPrompt();
      renderChordOptions();
      renderChordFretboard();
      syncChordUI();
      renderSidebar();
      return;
    }
    if (mode === 'interval') {
      const snap = intervalRound.snap;
      if (snap) {
        snap.showRootName = s.intervalShowRootName !== false;
        snap.clickSound = !!s.intervalClickSound;
        snap.preview = s.intervalPreview !== 'off';
        snap.listenDuringAnswer = s.intervalListenDuringAnswer !== false;
        snap.perFret = !!s.intervalPerFret;
        snap.autoNextOnCorrect = !!s.intervalAutoNextOnCorrect;
        snap.timeA = intervalTimeOf(s.intervalTimeA, 10);
        snap.timeB = intervalTimeOf(s.intervalTimeB, 15);
        /* \u9009\u9879\u6570\u91CF\u53EA\u5F71\u54CD\u73A9\u6CD5 A \u7684\u5E72\u6270\u9879\u6570\u91CF\uFF1A\u5F53\u573A\u91CD\u5EFA\u9009\u9879\uFF0C\u4E0D\u7528\u7B49\u4E0B\u4E00\u9898 */
        const wantCount = intervalOptionCount();
        if (snap.optionCount !== wantCount && intervalRound.play === 'a' && intervalRound.correct) {
          snap.optionCount = wantCount;
          const T = snap.theory || intervalTheory();
          if (T) intervalRound.options = T.buildOptions(intervalRound.correct, snap.setA, wantCount);
        }
        intervalRound.limit = intervalLimitFor(intervalRound.cellA || intervalRound.start, intervalRound.cellB);
        intervalRound.infinite = intervalRound.limit === Infinity;
        if (intervalRound.state === 'asking' && intervalRound.startAt) {
          if (intervalRound.waitStart) {
            showIntervalWaitToStart();
          } else {
            intervalRound.deadline = intervalRound.infinite
              ? Infinity
              : intervalRound.startAt + intervalRound.limit * 1000;
            tickIntervalTimer();
          }
        }
      }
      renderIntervalPrompt();
      renderIntervalOptions();
      renderIntervalFeedback();
      renderIntervalFretboard();
      syncIntervalUI();
      renderSidebar();
      return;
    }
    syncSettingsUI();
  }

  /* \u4F1A\u5F71\u54CD\u300C\u6392\u54EA\u4E9B\u9898\u300D\u7684\u8BBE\u7F6E\uFF08\u9898\u91CF / \u51FA\u9898\u503E\u5411\uFF09\uFF1A\u672C\u8F6E\u8FD8\u6CA1\u5F00\u59CB\u7B54\u5C31\u7ACB\u523B\u91CD\u6392\uFF0C
     \u5DF2\u7ECF\u7B54\u8FC7\u51E0\u9898\u4E86\u5C31\u7B49\u4E0B\u4E00\u8F6E\u81EA\u52A8\u751F\u6548\uFF0C\u5E76\u660E\u786E\u544A\u8BC9\u7528\u6237\u3002 */
  function reseedRoundIfFresh(what) {    const mode = store.settings.mode;
    const fresh = mode === 'chord' ? chordRound.idx === 0
      : (mode === 'interval' ? intervalRound.idx === 0 : round.idx === 0);
    if (fresh) {
      applySettingsChange(true);
      return;
    }
    updateModeFeedback(what + '\u4F1A\u5728\u4E0B\u4E00\u8F6E\u5F00\u59CB\u751F\u6548\uFF08\u672C\u8F6E\u5DF2\u7B54\u8FC7\u9898\uFF0C\u4E0D\u6253\u65AD\uFF09', 'info');
    renderSidebar();
  }

  /* \u5207\u6362\u4E24\u5957\u72EC\u7ACB\u89C6\u56FE\uFF1A\u53EA\u663E\u793A\u5F53\u524D\u6A21\u5F0F\u7684\u6574\u5757\u754C\u9762\uFF0C\u5E76\u540C\u6B65\u753B\u5E03 / \u952E\u76D8\u63D0\u793A / \u6807\u7B7E */
  /* ---------------------------------------------------------------
   *  \u4E3B\u9875 / \u6A21\u5F0F\u5207\u6362
   * --------------------------------------------------------------- */
  const ui = { screen: 'home' };   // home | practice

  /** \u8FDB\u5165\u4E3B\u9875 */
  function showHome() {
    ui.screen = 'home';
    if (round.timer) { clearInterval(round.timer); round.timer = null; }
    if (round.pendingNext) { clearTimeout(round.pendingNext); round.pendingNext = null; }
    round.state = 'idle';
    round.waitStart = false;
    /* \u548C\u5F26\u6A21\u5F0F\u4E5F\u4E00\u5E76\u6682\u505C\uFF1A\u8BA1\u65F6\u505C\u3001\u97F3\u9891\u505C\uFF0C\u4F46\u72B6\u6001\u4FDD\u7559\uFF0C\u56DE\u6765\u80FD\u7EE7\u7EED */
    if (chordRound.timer) { clearInterval(chordRound.timer); chordRound.timer = null; }
    if (chordRound.pendingNext) { clearTimeout(chordRound.pendingNext); chordRound.pendingNext = null; }
    chordRound.waitStart = false;
    if (typeof audio !== 'undefined' && audio.stopChord) audio.stopChord();
    closeModals();
    /* \u4E0A\u6B21\u79BB\u5F00\u65F6\u82E5\u786E\u8BA4\u6761\u8FD8\u5F00\u7740\uFF0C\u56DE\u5230\u4E3B\u9875\u4E0D\u8BE5\u53C8\u770B\u5230\u5B83 */
    closeHomeConfirm();
    const home = $('#homeView');
    const layout = $('.layout');
    if (home) home.hidden = false;
    if (layout) layout.hidden = true;
    $('#btnHome').hidden = true;
    document.body.classList.add('on-home');
    /* \u4E3B\u9875\u4E0A\u7684\u6574\u628A\u5409\u4ED6\uFF1A\u628A\u5B83\u6446\u56DE\u7AD6\u76F4\u5C45\u4E2D\u7684\u9759\u6B62\u59FF\u6001 */
    if (window.homeIntro && typeof window.homeIntro.layout === 'function') window.homeIntro.layout();
    refreshHome();
  }

  /** \u4ECE\u4E3B\u9875\u8FDB\u5165\u67D0\u4E2A\u7EC3\u4E60\u6A21\u5F0F */
  function enterMode(mode) {
    if (store.settings.mode !== mode) {
      store.settings.mode = mode;
      /* \u6A21\u5F0F\u53D8\u4E86 \u2192 \u517C\u5BB9\u5B57\u6BB5\u4E0E\u8BBE\u7F6E\u9762\u677F\u91CC\u7684\u8303\u56F4\u5355\u9009\u90FD\u8981\u6362\u6210\u8FD9\u4E2A\u6A21\u5F0F\u81EA\u5DF1\u7684\u503C\uFF0C
         \u5426\u5219\u4F1A\u663E\u793A\u4E0A\u4E00\u4E2A\u6A21\u5F0F\u7684\u8303\u56F4\uFF08\u4E09\u4E2A\u6A21\u5F0F\u7684\u8303\u56F4\u662F\u4E92\u76F8\u72EC\u7ACB\u7684\uFF09\u3002 */
      syncLegacyRange();
      /* \u58F0\u97F3\u540C\u7406\uFF1A\u517C\u5BB9\u5B57\u6BB5\u8DDF\u7740\u5207\uFF0C\u8F93\u51FA\u589E\u76CA\u6362\u6210\u8FD9\u4E2A\u6A21\u5F0F\u81EA\u5DF1\u7684\u9759\u97F3/\u97F3\u91CF\u3002
         \u5C11\u4E86\u8FD9\u4E00\u6B65\uFF0C\u4ECE\u300C\u5DF2\u9759\u97F3\u7684\u97F3\u7A0B\u6A21\u5F0F\u300D\u5207\u56DE\u97F3\u540D\u6A21\u5F0F\u4F1A\u4ECD\u7136\u542C\u4E0D\u5230\u58F0\u97F3\u3002 */
      syncLegacySound();
      save();
    }
    ui.screen = 'practice';
    const home = $('#homeView');
    const layout = $('.layout');
    if (home) home.hidden = true;
    if (layout) layout.hidden = false;
    $('#btnHome').hidden = false;
    document.body.classList.remove('on-home');
    computeLayout();
    /* \u8BBE\u7F6E\u9762\u677F\u91CC\u7684\u8303\u56F4\u5355\u9009\u4E5F\u8981\u663E\u793A\u8FD9\u4E2A\u6A21\u5F0F\u81EA\u5DF1\u7684\u503C\uFF08\u4E0B\u6B21\u6253\u5F00\u8BBE\u7F6E\u624D\u4E0D\u4F1A\u662F\u9519\u7684\uFF09 */
    if (typeof syncSettingsUI === 'function') syncSettingsUI();
    applySettingsChange(true);
    round.booted = true;
  }

  /** \u4E3B\u9875\u4E0A\u7684\u7EDF\u8BA1\u4FE1\u606F */
  function refreshHome() {
    /* \u4E3B\u9875\u7EDF\u8BA1\u6761\u540C\u6837\u6539\u8BFB modeStats\uFF08D29\uFF09\uFF0C\u4E0E\u4FA7\u680F / \u5F39\u7A97\u53E3\u5F84\u4E00\u81F4 */
    const noteStat = modeStatOf('note');
    const noteTotal = noteStat.right + noteStat.wrong;
    /* \u300C\u7EC3\u8FC7 N \u4E2A\u4F4D\u7F6E\u300D= \u97F3\u540D + \u627E\u4F4D\u7F6E\u4E24\u5957\u5361\u7247\u91CC\u771F\u6B63\u7EC3\u8FC7\u7684\u683C\u5B50\u4E4B\u548C\u3002
       \u5361\u7247\u73B0\u5728\u5206\u4E24\u4E2A map\uFF08store.cards / store.posCards\uFF09\uFF0C\u53EA\u770B\u5176\u4E2D\u4E00\u4E2A\u4F1A\u8BA9
       \u300C\u7EC3\u8FC7\u300D\u7684\u6570\u5B57\u6BD4\u5B9E\u9645\u5C0F\uFF1B\u540C\u4E00\u4E2A\u300C\u5F26 + \u54C1\u300D\u5728\u4E24\u4E2A\u6A21\u5F0F\u5404\u7B97\u4E00\u6B21\u4E5F\u4E0D\u7B97\u9519\uFF0C
       \u56E0\u4E3A\u90A3\u672C\u6765\u5C31\u662F\u4E24\u6761\u72EC\u7ACB\u7684\u8FDB\u5EA6\u3002 */
    const practiced = (map) => Object.keys(map || {}).filter((k) => {
      const c = map[k];
      return !!c && ((c.a || 0) + (c.e || 0) > 0);
    }).length;
    const cards = practiced(store.cards) + practiced(store.posCards);
    const chordCount = Object.keys(store.chordCards || {}).filter((k) => store.chordCards[k] && store.chordCards[k].seen).length;
    const el = $('#homeProgress');
    if (el) {
      const parts = [];
      if (noteTotal) parts.push('\u5355\u97F3\u5DF2\u7B54 <b>' + fmtInt(noteTotal) + '</b> \u9053 \u00B7 \u6B63\u786E\u7387 <b>' + fmtPct(noteStat.right, noteTotal) + '</b> \u00B7 \u7EC3\u8FC7 <b>' + cards + '</b> \u4E2A\u4F4D\u7F6E');
      if (chordCount) parts.push('\u548C\u5F26\u7EC3\u8FC7 <b>' + chordCount + '</b> \u4E2A');
      el.innerHTML = parts.length ? parts.join(' \u00B7 ') : '\u8FD8\u6CA1\u6709\u7EC3\u4E60\u8BB0\u5F55\uFF0C\u9009\u4E00\u79CD\u6A21\u5F0F\u5F00\u59CB\u5427';
    }
    const noteMeta = $('#homeNoteMeta');
    const posMeta = $('#homePosMeta');
    const chordMeta = $('#homeChordMeta');
    const mf = rangeFretMax();
    if (noteMeta) noteMeta.textContent = '\u7EC3\u300C\u4F4D\u7F6E \u2192 \u97F3\u540D\u300D\u00B7 0\u2013' + mf + ' \u54C1 \u00B7 \u4E00\u8F6E ' + store.settings.size + ' \u9898';
    if (posMeta) posMeta.textContent = '\u7EC3\u300C\u97F3\u540D \u2192 \u4F4D\u7F6E\u300D\u00B7 0\u2013' + mf + ' \u54C1 \u00B7 \u627E\u51FA\u5168\u90E8\u4F4D\u7F6E';
    if (chordMeta) {
      const cm = chordRangeFretMax();
      chordMeta.textContent = '\u7EC3\u300C\u548C\u5F26\u540D \u2192 \u6307\u677F\u300D\u00B7 0\u2013' + cm + ' \u54C1 \u00B7 \u4E00\u8F6E ' + store.settings.chordSize + ' \u9898';
    }
  }

  /** \u8BBE\u7F6E\u91CC\u53EA\u663E\u793A\u5F53\u524D\u6A21\u5F0F\u76F8\u5173\u7684\u9009\u9879
   *  \u673A\u5236\uFF1A\u52A0\u6CD5 \u2014\u2014 \u6BCF\u4E2A .field \u81EA\u5DF1\u58F0\u660E data-scope\uFF08\u7A7A\u683C\u5206\u9694\u7684\u6A21\u5F0F\u540D\uFF09\uFF0C
   *  \u8FD9\u91CC\u6309\u5F53\u524D\u6A21\u5F0F\u9010\u4E2A\u8BBE hidden\u3002\u6CA1\u58F0\u660E\u7684\u6309\u300Cnote pos chord\u300D\u515C\u5E95\uFF08\u4E0D\u9690\u85CF\uFF09\uFF0C
   *  \u4F46 tools/check-scope.mjs \u4F1A\u62E6\u4F4F\u6F0F\u58F0\u660E\uFF0C\u6240\u4EE5\u5B9E\u9645\u4E0D\u4F1A\u6709\u515C\u5E95\u751F\u6548\u7684\u60C5\u51B5\u3002 */
  function applySettingsScope() {
    const mode = store.settings.mode || 'note';
    const body = $('#settingsBody');
    if (body) {
      body.classList.toggle('scope-note', mode === 'note');
      body.classList.toggle('scope-pos', mode === 'pos');
      body.classList.toggle('scope-chord', mode === 'chord');
      body.classList.toggle('scope-interval', mode === 'interval');
      const posPlay = posPlayA() ? 'a' : 'b';
      body.querySelectorAll('[data-scope]').forEach((el) => {
        const list = String(el.getAttribute('data-scope') || '').split(/\s+/).filter(Boolean);
        let show = list.length ? list.indexOf(mode) >= 0 : true;
        /* \u7B2C\u4E8C\u4E2A\u7EF4\u5EA6\uFF1A\u627E\u4F4D\u7F6E\u73A9\u6CD5\uFF08A / B\uFF09\u3002data-posplay="a" \u7684\u9879\u53EA\u5728\u73A9\u6CD5 A \u4E0B\u51FA\u73B0\u3002
           \u5B83\u53EA\u5728\u627E\u4F4D\u7F6E\u6A21\u5F0F\u4E0B\u53C2\u4E0E\u5224\u65AD\uFF0C\u5176\u5B83\u6A21\u5F0F\u4FDD\u6301 data-scope \u7684\u7ED3\u679C\u3002 */
        const sub = el.getAttribute('data-posplay');
        if (show && sub && mode === 'pos') {
          show = String(sub).split(/\s+/).indexOf(posPlay) >= 0;
        }
        el.hidden = !show;
      });
      /* \u73A9\u6CD5 B \u91CC\u300C\u7B54\u9519\u540E\u5148\u505C\u4F4F\u300D\u6CA1\u6709\u5BF9\u8C61\uFF08\u4E00\u9898\u5373\u4E00\u56DE\u5408\uFF0C\u672C\u6765\u5C31\u8981\u70B9\u4E0B\u4E00\u9898\uFF09\uFF0C
         \u4F46\u5B83\u5C5E\u4E8E\u7528\u6237\u5DF2\u7ECF\u8BBE\u5B9A\u7684\u504F\u597D\uFF0C\u4E0D\u9690\u85CF\u3001\u53EA\u7F6E\u7070\u5E76\u7ED9\u4E00\u53E5\u8BF4\u660E\u3002 */
      const pwRow = $('#pauseWrongRow');
      const pw = $('#pauseWrong');
      const pwOff = mode === 'pos' && !posPlayA();
      if (pw) pw.disabled = pwOff;
      if (pwRow) pwRow.classList.toggle('is-disabled', pwOff);
    }
    const tag = $('#ssecModeTag');
    if (tag) {
      tag.textContent = mode === 'pos' ? '\u00B7 \u627E\u4F4D\u7F6E\u6A21\u5F0F'
        : mode === 'chord' ? '\u00B7 \u548C\u5F26\u6A21\u5F0F'
          : mode === 'interval' ? '\u00B7 \u97F3\u7A0B\u6A21\u5F0F'
            : '\u00B7 \u97F3\u540D\u6A21\u5F0F';
    }
  }

  /** \u73A9\u6CD5\u8BF4\u660E\u5F39\u7A97\u91CC\u53EA\u663E\u793A\u5F53\u524D\u6A21\u5F0F\u7684\u90A3\u51E0\u6BB5
   *  \u673A\u5236\u4E0E applySettingsScope() \u76F8\u540C\uFF1A\u6BCF\u6BB5\u81EA\u5DF1\u58F0\u660E data-scope\uFF0C
   *  \u8FD9\u91CC\u6309\u5F53\u524D\u6A21\u5F0F\u9010\u4E2A\u8BBE hidden\u3002\u6CA1\u58F0\u660E\u7684\u6309\u300C\u5168\u90E8\u6A21\u5F0F\u300D\u515C\u5E95\uFF08\u4E0D\u9690\u85CF\uFF09\u3002
   *  \u7528\u6237\u8981\u6C42\uFF1A\u548C\u5F26\u6A21\u5F0F\u4E0B\u6253\u5F00\u73A9\u6CD5\u8BF4\u660E\uFF0C\u770B\u5230\u7684\u5E94\u8BE5\u53EA\u6709\u548C\u5F26\u81EA\u5DF1\u7684\u4ECB\u7ECD\uFF0C
   *  \u4E0D\u8BE5\u5939\u7740\u97F3\u540D / \u627E\u4F4D\u7F6E / \u97F3\u7A0B\u7684\u6BB5\u843D\u3002 */
  function applyHelpScope() {
    const box = $('#helpModal');
    if (!box) return;
    const mode = store.settings.mode || 'note';
    box.querySelectorAll('[data-scope]').forEach((el) => {
      const list = String(el.getAttribute('data-scope') || '').split(/\s+/).filter(Boolean);
      el.hidden = list.length ? list.indexOf(mode) < 0 : false;
    });
  }

  function applyModeView() {
    const mode = store.settings.mode || 'note';
    syncActiveBoardHost();
    const noteView = $('#noteView');
    const posView = $('#posView');
    const chordView = $('#chordView');
    const intervalView = $('#intervalView');
    if (noteView) noteView.hidden = mode !== 'note';
    if (posView) posView.hidden = mode !== 'pos';
    if (chordView) chordView.hidden = mode !== 'chord';
    if (intervalView) intervalView.hidden = mode !== 'interval';

    /* \u6E05\u6389\u300C\u5176\u5B83\u6A21\u5F0F\u300D\u6307\u677F\u7684\u53E0\u52A0\u5C42\uFF1A\u6BCF\u4E2A\u6A21\u5F0F\u5404\u6709\u4E00\u5957\u6807\u8BB0\u8BED\u4E49\uFF0C
       \u4E0D\u6E05\u7684\u8BDD\u5207\u56DE\u6765\u4F1A\u5148\u95EA\u4E00\u4E0B\u4E0A\u4E00\u8F6E\u7684\u65E7\u6807\u8BB0\uFF08\u5386\u53F2\u4E0A\u8E29\u8FC7\u4E00\u6B21\uFF0C
       \u6807\u8BB0\u753B\u8FDB\u4E86 hidden \u7684\u6307\u677F\uFF0C\u7528\u6237\u770B\u5230\u7684\u5C31\u662F\u300C\u70B9\u4E86\u6CA1\u53CD\u5E94\u300D\uFF09\u3002 */
    if (typeof boardSvg !== 'undefined' && boardSvg.loaded) {
      const all = ['fretboard', 'posFretboard', 'chordFretboard', 'intervalFretboard'];
      const active = mode === 'pos' ? 'posFretboard'
        : (mode === 'chord' ? 'chordFretboard'
          : (mode === 'interval' ? 'intervalFretboard' : 'fretboard'));
      all.forEach((id) => {
        if (id === active) return;
        const stale = boardSvg.view(id);
        if (stale && stale.overlay) stale.overlay.textContent = '';
      });
    }

    document.body.classList.toggle('mode-pos', mode === 'pos');
    document.body.classList.toggle('mode-chord', mode === 'chord');
    document.body.classList.toggle('mode-interval', mode === 'interval');
    const kbdHint = $('#posBoardHint');
    if (kbdHint) kbdHint.textContent = mode === 'pos' ? '\u70B9\u683C\u5B50\u9009\u4E2D\uFF0C\u518D\u70B9\u4E00\u6B21\u53D6\u6D88' : '';
    const chordHint = $('#chordBoardHint');
    if (chordHint) {
      chordHint.textContent = mode === 'chord'
        ? '\u70B9\u683C\u5B50\u6309\u54C1\uFF0C\u70B9\u7434\u6795\u5DE6\u4FA7\u7A7A\u5F26\u533A\u4E3A\u7A7A\u5F26\uFF0C\u518D\u70B9\u4E00\u6B21\u56DE\u9759\u97F3'
        : '';
    }
    applySettingsScope();
    /* \u5207\u6A21\u5F0F\u65F6\u628A\u8F93\u51FA\u589E\u76CA\u4E0E\u9759\u97F3\u6309\u94AE\u5237\u6210\u8FD9\u4E2A\u6A21\u5F0F\u81EA\u5DF1\u7684\u503C
       \uFF08\u56DB\u4E2A\u6A21\u5F0F\u7684\u9759\u97F3/\u97F3\u91CF\u4E92\u76F8\u72EC\u7ACB\uFF0C\u5207\u8FC7\u53BB\u5FC5\u987B\u7ACB\u523B\u542C\u5230\u5BF9\u5E94\u7ED3\u679C\uFF09 */
    if (typeof audio !== 'undefined' && audio && typeof audio.applyModeGain === 'function') {
      audio.applyModeGain();
    }
    syncSoundUI();
    syncPosUI();
    syncChordUI();
    syncIntervalUI();
    syncPosDebugSeg();
    syncDebugBar();
    applySidebar();
    if (board.hover) { board.hover = null; }
    // \u89C6\u56FE\u521A\u4ECE hidden \u5207\u4E3A\u53EF\u89C1\u65F6 clientWidth \u53EF\u80FD\u8FD8\u662F\u65E7\u503C\uFF0C\u7B49\u4E00\u5E27\u518D\u91CF\u4E00\u6B21
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => { fitCanvas(); renderFretboard(); renderChordFretboard(); renderIntervalFretboard(); });
    }
    renderFretboard();
    renderChordFretboard();
    renderIntervalFretboard();
  }

  function applySettingsChange(restart) {
    computeLayout();
    fitCanvas();
    updateViewLabel();
    applyModeView();
    renderFretboard();
    const chordMode = store.settings.mode === 'chord';
    const intervalMode = store.settings.mode === 'interval';
    if (restart) {
      if (chordMode) startChordRound();
      else if (intervalMode) startIntervalRound();
      else startRound();
      return;
    }
    if (chordMode) {
      /* \u7EC3\u4E60\u4E2D\u6539\u8BBE\u7F6E\uFF1A\u5F53\u524D\u9898\u4FDD\u6301\u4E0D\u52A8\uFF08\u5224\u5B9A\u5BBD\u5EA6 / \u65F6\u9650 / \u8303\u56F4\u90FD\u5DF2\u5728\u9898\u76EE\u5F00\u59CB\u65F6\u5FEB\u7167\uFF09\uFF0C
         \u53EA\u5237\u65B0\u754C\u9762\u63D0\u793A\uFF0C\u4E0B\u4E00\u9898\u8D77\u751F\u6548\u3002 */
      renderChordPrompt();
      syncChordUI();
      renderChordFretboard();
      /* \u56FE4 \u7684\u76F8\u5BF9\u6982\u7387\u4F9D\u8D56\u5F53\u524D\u8BBE\u7F6E\uFF08\u8303\u56F4 / \u6839\u97F3 / \u8D28\u91CF\uFF09\uFF0C\u8BBE\u7F6E\u4E00\u53D8\u5C31\u8981\u91CD\u7B97 */
      renderSidebar();
      return;
    }
    if (intervalMode) {
      /* \u97F3\u7A0B\u6A21\u5F0F\u540C\u7406\uFF1A\u8BBE\u7F6E\u5FEB\u7167\u5728\u9898\u76EE\u5F00\u59CB\u65F6\u56FA\u5B9A\uFF08\u00A711.4\uFF09\uFF0C
         \u8FD9\u91CC\u53EA\u5237\u65B0\u754C\u9762\u63D0\u793A\u4E0E\u9009\u9879\u4E0A\u9650\uFF0C\u4E0D\u91CD\u7B97\u5F53\u524D\u9898\u3002 */
      syncIntervalSettingsUI();
      renderIntervalPrompt();
      renderIntervalOptions();
      syncIntervalUI();
      renderIntervalFretboard();
      renderSidebar();
      return;
    }
    if (round.current) {
      setPrompt(round.current);
      buildOptions(round.current);
      renderFretboard();
    }
    renderSidebar();
  }

  /* ---------------------------------------------------------------
   *  \u548C\u5F26\u8BBE\u7F6E\u9762\u677F\u540C\u6B65
   * --------------------------------------------------------------- */
  function syncChordSettingsUI() {
    const T = chordTheory();
    const s = store.settings;

    /* \u8303\u56F4 */
    document.querySelectorAll('input[name="chordRange"]').forEach((inp) => {
      inp.checked = inp.value === s.chordRange;
    });

    /* \u97F3\u540D\u5199\u6CD5\uFF08\u548C\u5F26\u81EA\u5DF1\u7684\u5B57\u6BB5\uFF0C\u72EC\u7ACB\u4E8E\u97F3\u540D\u6A21\u5F0F\uFF09 */
    document.querySelectorAll('input[name="chordAcc"]').forEach((inp) => {
      inp.checked = inp.value === chordAccidental();
    });

    /* \u6839\u97F3\u82AF\u7247\uFF1A12 \u4E2A\uFF0C\u6309\u9700\u751F\u6210\u4E00\u6B21 */
    const rootBox = $('#chordRootChips');
    if (rootBox && !rootBox.childElementCount && T) {
      rootBox.innerHTML = '';
      for (let r = 0; r < 12; r++) {
        const label = document.createElement('label');
        label.className = 'chip';
        const inp = document.createElement('input');
        inp.type = 'checkbox';
        inp.dataset.root = String(r);
        label.appendChild(inp);
        const txt = document.createElement('span');
        txt.className = 'chip-txt';
        txt.textContent = T.pcName(r, chordAccidental() === 'flat');
        label.appendChild(txt);
        const n = document.createElement('span');
        n.className = 'chip-n';
        n.dataset.count = String(r);
        label.appendChild(n);
        rootBox.appendChild(label);
      }
      rootBox.addEventListener('change', () => {
        const chosen = Array.from(rootBox.querySelectorAll('input:checked')).map((i) => Number(i.dataset.root));
        /* \u5141\u8BB8\u5168\u4E0D\u9009\uFF08\u7EC3\u4E60\u754C\u9762\u4F1A\u663E\u793A\u7A7A\u72B6\u6001\u5E76\u8BF4\u660E\u539F\u56E0\uFF09\uFF0C\u4E0D\u505A\u5F3A\u5236\u56DE\u9000 */
        store.settings.chordRoots = chosen.sort((a, b) => a - b);
        save();
        chordPoolCache = { key: '', list: [] };
        syncChordSettingsUI();
        reseedRoundIfFresh('\u548C\u5F26\u6839\u97F3\u9009\u62E9\u7684\u6539\u52A8');
      });
    }
    if (rootBox) {
      /* \u6839\u97F3\u82AF\u7247\u7684\u6587\u5B57\u8DDF\u7740\u300C\u548C\u5F26\u97F3\u540D\u5199\u6CD5\u300D\u8D70\uFF08\u266F/\u266D\uFF09\uFF0C\u5207\u6362\u5199\u6CD5\u65F6\u8981\u5237\u65B0\u6587\u5B57\uFF1B
         \u6570\u5B57\u8DDF\u7740\u4E0A\u4E0B\u6587\u8BA1\u6570\u8D70\uFF08\u7B97\u51FA\u6765 0 \u5C31\u7F6E\u7070\uFF0C\u70B9\u4E86\u4F1A\u6389\u8FDB 0 \u9898\u7684\u6B7B\u8DEF\uFF09 */
      const flat = chordAccidental() === 'flat';
      const rootCounts = (bankData() && T) ? (chordContextCounts().root || {}) : null;
      rootBox.querySelectorAll('label').forEach((label) => {
        const inp = label.querySelector('input');
        if (!inp || !T) return;
        const r = Number(inp.dataset.root);
        const txt = label.querySelector('.chip-txt');
        if (txt) txt.textContent = T.pcName(r, flat);
        inp.checked = (s.chordRoots || []).indexOf(r) >= 0;
        if (rootCounts) {
          const c = rootCounts[r] || 0;
          const n = label.querySelector('.chip-n');
          if (n) n.textContent = String(c);
          const dead = c === 0 && !inp.checked;
          label.classList.toggle('off', dead);
          inp.disabled = dead;
        }
      });
    }

    /* \u98CE\u683C\u82AF\u7247\uFF1A\u516D\u9884\u8BBE\uFF08\u7B56\u5212\u4E66 \u00A73.8\uFF09\uFF0C\u7B2C\u4E00\u6B21\u751F\u6210\uFF0C\u4E4B\u540E\u53EA\u5237\u9009\u4E2D\u6001 */
    const styleBox = $('#chordStyleChips');
    if (styleBox && !styleBox.dataset.ready) {
      styleBox.innerHTML = '';
      CHORD_STYLE_ORDER.forEach((id) => {
        const label = document.createElement('label');
        label.className = 'chip';
        const inp = document.createElement('input');
        inp.type = 'radio';
        inp.name = 'chordStyle';
        inp.value = id;
        if (id === 'general') inp.checked = true;
        label.appendChild(inp);
        /* \u7528 span.textContent \u800C\u4E0D\u662F createTextNode\uFF1ANode \u6C99\u7BB1\uFF08weight-test\uFF09
           \u7684 DOM \u6869\u6CA1\u6709 createTextNode\uFF0C\u800C textContent \u4E24\u4E2A\u73AF\u5883\u90FD\u652F\u6301\u3002 */
        const txt = document.createElement('span');
        txt.className = 'chip-txt';
        txt.textContent = CHORD_STYLE_NAME[id];
        label.appendChild(txt);
        styleBox.appendChild(label);
      });
      styleBox.dataset.ready = '1';
    }

    /* \u8D28\u91CF\u82AF\u7247\uFF1A18 \u79CD\uFF0C\u6765\u81EA\u9898\u5E93\uFF08\u7B56\u5212\u4E66 \u00A73.4\uFF09
       \u987A\u5E8F\u6309\u300C\u5E38\u7528\u5EA6\u300D\u6392\uFF08\u4E0D\u6309\u9898\u5E93\u4E0B\u6807\uFF09\uFF0C\u7528 Q_ORDER_BANK\u3002
       \u8BA1\u6570\u7528\u4E0A\u4E0B\u6587\u8BA1\u6570\uFF1A\u5176\u5B83\u8F74\u90FD\u6309\u5F53\u524D\u6761\u4EF6\u3001\u672C\u8F74\u53D6\u8BE5\u503C\u65F6\u8FD8\u5269\u591A\u5C11\u9898\uFF1B
       \u7B97\u51FA\u6765 0 \u5C31\u7F6E\u7070\u4E0D\u53EF\u70B9 \u2014\u2014 \u5426\u5219\u7528\u6237\u70B9\u4E0B\u53BB\u4F1A\u5F97\u5230\u300C0 \u9898\u300D\u7684\u6B7B\u8DEF\u3002 */
    const qualBox = $('#chordQualityChips');
    const bankQ = bankData() ? bankData().Q : null;
    if (qualBox && bankQ && !qualBox.dataset.ready) {
      qualBox.innerHTML = '';
      bankQualityOrder().forEach((qi) => {
        const q = bankQ[qi];
        const label = document.createElement('label');
        label.className = 'chip';
        const inp = document.createElement('input');
        inp.type = 'checkbox';
        inp.dataset.quality = q[0];
        label.appendChild(inp);
        const txt = document.createElement('span');
        txt.className = 'chip-txt';
        txt.textContent = q[1];
        label.appendChild(txt);
        const n = document.createElement('span');
        n.className = 'chip-n';
        n.dataset.count = q[0];
        label.appendChild(n);
        qualBox.appendChild(label);
      });
      qualBox.dataset.ready = '1';
      qualBox.addEventListener('change', () => {
        const chosen = Array.from(qualBox.querySelectorAll('input:checked')).map((i) => i.dataset.quality);
        store.settings.chordQualities = chosen;
        save();
        chordPoolCache = { key: '', list: [] };
        syncChordSettingsUI();
        reseedRoundIfFresh('\u548C\u5F26\u6027\u8D28\u9009\u62E9\u7684\u6539\u52A8');
      });
    }
    if (qualBox && bankQ) {
      const counts = chordContextCounts();
      qualBox.querySelectorAll('label').forEach((label) => {
        const inp = label.querySelector('input');
        if (!inp) return;
        const qid = inp.dataset.quality;
        inp.checked = (s.chordQualities || []).indexOf(qid) >= 0;
        const n = label.querySelector('.chip-n');
        const c = counts.quality && counts.quality[qid] != null ? counts.quality[qid] : 0;
        if (n) n.textContent = String(c);
        /* 0 \u2192 \u7F6E\u7070\uFF1B\u4F46\u5DF2\u9009\u4E2D\u7684\u9879\u5373\u4F7F\u7B97\u51FA\u6765\u662F 0 \u4E5F\u4FDD\u6301\u53EF\u70B9\uFF0C\u5426\u5219\u7528\u6237\u6CA1\u6CD5\u53D6\u6D88 */
        const dead = c === 0 && !inp.checked;
        label.classList.toggle('off', dead);
        inp.disabled = dead;
        /* \u98CE\u683C\u628A\u8FD9\u79CD\u8D28\u91CF\u6574\u4F53\u79FB\u9664\u4E86\uFF08\u6447\u6EDA\u5220\u5C5E\u4E5D\u3001\u7235\u58EB\u5220\u5F3A\u529B\u548C\u5F26\uFF09*/
        const gone = chordStyleRemoved(qid, s.chordStyle || 'general');
        label.classList.toggle('gone', gone);
        label.title = gone ? (CHORD_STYLE_NAME[s.chordStyle] + ' \u9884\u8BBE\u5DF2\u79FB\u9664 ' + qid) : '';
      });
    }

    /* \u2014\u2014 \u73A9\u6CD5 A / B \u9762\u677F\u4E92\u65A5\uFF08\u7B56\u5212\u4E66 \u00A74.8.3 \u7B2C 2 \u6761\uFF1A\u6574\u5757 hidden \u5207\u6362\uFF09\u2014\u2014 */
    const playNow = chordPlayMode();
    document.querySelectorAll('input[name="chordStyle"]').forEach((inp) => {
      inp.checked = inp.value === (s.chordStyle || 'general');
    });
    document.querySelectorAll('input[name="chordPosition"]').forEach((inp) => {
      inp.checked = inp.value === (s.chordPosition || 'all');
    });
    document.querySelectorAll('input[name="chordTechnique"]').forEach((inp) => {
      inp.checked = inp.value === (s.chordTechnique || 'all');
    });
    document.querySelectorAll('input[name="chordNameLang"]').forEach((inp) => {
      inp.checked = inp.value === (s.chordNameLang || 'both');
    });
    document.querySelectorAll('input[name="chordAEffort"]').forEach((inp) => {
      inp.checked = inp.value === (s.chordAEffort || 'common');
    });
    document.querySelectorAll('input[name="chordAHint"]').forEach((inp) => {
      inp.checked = inp.value === (s.chordAHint || 'second');
    });
    document.querySelectorAll('input[name="chordAPreview"]').forEach((inp) => {
      inp.checked = inp.value === (s.chordAPreview || 'off');
    });
    document.querySelectorAll('input[name="chordBOptionCount"]').forEach((inp) => {
      inp.checked = Number(inp.value) === clamp(Number(s.chordBOptionCount) || 4, 3, 6);
    });
    document.querySelectorAll('input[name="chordBDistractor"]').forEach((inp) => {
      inp.checked = inp.value === (s.chordBDistractor || 'mixed');
    });
    document.querySelectorAll('input[name="chordBReveal"]').forEach((inp) => {
      inp.checked = inp.value === (s.chordBReveal || 'wrongOnly');
    });
    document.querySelectorAll('input[name="chordBHint"]').forEach((inp) => {
      inp.checked = inp.value === (s.chordBHint || 'second');
    });
    if ($('#chordASound')) $('#chordASound').checked = s.chordASound !== false;
    if ($('#chordAListen')) $('#chordAListen').checked = s.chordAListen !== false;
    if ($('#chordAListenAnswer')) $('#chordAListenAnswer').checked = s.chordAListenAnswer !== false;
    if ($('#chordBSound')) $('#chordBSound').checked = s.chordBSound !== false;
    if ($('#chordBStrict')) $('#chordBStrict').checked = !!s.chordBStrict;
    if ($('#chordAutoBarreHint')) $('#chordAutoBarreHint').checked = s.chordAutoBarreHint !== false;

    /* \u98CE\u683C\u8BF4\u660E\uFF1A\u6309\u5B9E\u9645\u9898\u91CF\u7B97\uFF0C\u4E0D\u5199\u6B7B\u6570\u5B57\uFF08\u7B56\u5212\u4E66 \u00A73.8.0\uFF09 */
    const styleNote = $('#chordStyleNote');
    if (styleNote) {
      const st = s.chordStyle || 'general';
      const gone = CHORD_STYLE_REMOVE[st] || [];
      if (!gone.length) {
        styleNote.className = 'field-tip';
        styleNote.textContent = CHORD_STYLE_NAME[st] + ' \u9884\u8BBE\u4E0D\u5220\u4EFB\u4F55\u8D28\u91CF\uFF0C\u53EA\u7528\u6743\u91CD\u5F71\u54CD\u51FA\u9898\u987A\u5E8F\u3002';
      } else {
        const names = gone.map((id) => {
          const qi = bankQualityIndex(id);
          return qi >= 0 && bankData() ? bankData().Q[qi][1] : id;
        });
        styleNote.className = 'field-tip warn';
        styleNote.textContent = CHORD_STYLE_NAME[st] + ' \u9884\u8BBE\u5DF2\u79FB\u9664 ' + names.join('\u3001') + '\uFF1A\u8FD9\u4E24\u79CD\u8D28\u91CF\u5728\u771F\u5B9E\u66F2\u76EE\u91CC\u57FA\u672C\u4E0D\u51FA\u73B0\u3002';
      }
    }

    /* \u7701\u529B\u4F18\u5148\u8BF4\u660E\uFF1A\u9898\u91CF\u5DEE\u6309\u5B9E\u9645\u7B97\uFF08\u7B56\u5212\u4E66 \u00A73.7.2\uFF09 */
    const effortNote = $('#chordAEffortNote');
    if (effortNote) {
      const nowCount = chordPool().length;
      const prev = store.settings.chordAEffort;
      store.settings.chordAEffort = (s.chordAEffort === 'easy') ? 'common' : 'easy';
      chordPoolCache = { key: '', list: [] };
      const otherCount = chordPool().length;
      store.settings.chordAEffort = prev;
      chordPoolCache = { key: '', list: [] };
      const commonN = s.chordAEffort === 'easy' ? otherCount : nowCount;
      const easyN = s.chordAEffort === 'easy' ? nowCount : otherCount;
      effortNote.className = 'field-tip';
      effortNote.textContent = '\u7701\u529B\u4F18\u5148\uFF1A\u6BCF\u4E2A\u9898\u9762\u53EA\u7559\u6700\u597D\u6309\u7684\u90A3\u4E00\u6761\u6307\u6CD5\u3002\u9898\u91CF ' + commonN + ' \u2192 ' + easyN
        + (commonN > easyN ? '\uFF08\u5C11 ' + (commonN - easyN) + ' \u9053\uFF09' : '') + '\u3002';
    }

    /* \u4E25\u683C\u9898\u6C60\u8BF4\u660E\uFF08\u7B56\u5212\u4E66 \u00A72.7.4\uFF09 */
    const strictNote = $('#chordBStrictNote');
    if (strictNote) {
      const sets = chordPoolSets();
      const bN = sets.b.size;
      const sN = sets.s.size;
      strictNote.className = 'field-tip';
      strictNote.textContent = '\u9ED8\u8BA4\u9898\u6C60 ' + bN + ' \u9053\uFF1B\u53EA\u51FA\u540D\u5B57\u552F\u4E00\u7684\u9898 \u2192 ' + sN
        + ' \u9053\uFF08\u5C11 ' + (bN - sN) + ' \u9053\uFF0C\u5B83\u4EEC\u6709\u4E24\u4E2A\u540D\u5B57\u90FD\u5BF9\uFF09\u3002';
    }

    /* \u97F3\u540D\u5199\u6CD5 / \u53D1\u58F0\u65B9\u5F0F / \u81EA\u52A8\u64AD\u653E */
    document.querySelectorAll('input[name="chordStrum"]').forEach((inp) => {
      const v = (s.chordStrum === 'block' || s.chordStrum === 'strumUp') ? s.chordStrum : 'strum';
      inp.checked = inp.value === v;
    });
    document.querySelectorAll('input[name="chordPreview"]').forEach((inp) => {
      inp.checked = inp.value === (s.chordPreview || 'reference');
    });
    document.querySelectorAll('input[name="chordRevealPlay"]').forEach((inp) => {
      const v = (s.chordRevealPlay === 'always' || s.chordRevealPlay === 'off')
        ? s.chordRevealPlay : 'wrongOnly';
      inp.checked = inp.value === v;
    });
    if ($('#chordListenDuringAnswerSet')) {
      $('#chordListenDuringAnswerSet').checked = s.chordListenDuringAnswer !== false;
    }
    if ($('#chordClickSoundSet')) {
      $('#chordClickSoundSet').checked = s.chordClickSound !== false;
    }

    /* \u9650\u65F6\u5FEB\u6377\u6309\u94AE\uFF1A\u6309\u5F53\u524D\u73A9\u6CD5\u53D6\u9ED8\u8BA4\u503C\uFF08A=20 \u79D2 / B=12 \u79D2\uFF0C\u7B56\u5212\u4E66 \u00A74.8 \u5408\u5E76\u5206\uFF09 */
    const t = chordTimeOf(s, playNow === 'b' ? 'f2n' : 'n2f');
    document.querySelectorAll('#chordTimeQuick .btn').forEach((b) => {
      const v = b.dataset.ctime;
      b.classList.toggle('active', v === 'inf' ? t === 'inf' : (t !== 'inf' && Number(v) === Number(t)));
    });

    /* \u9898\u91CF */
    const sizeEl = $('#chordSizeRange');
    if (sizeEl) sizeEl.value = String(s.chordSize || 10);
    const lv = $('#lvChordSize');
    if (lv) lv.textContent = (s.chordSize || 10) + ' \u9898';

    /* \u51FA\u9898\u6C60\u72B6\u6001\uFF1A\u4E3A\u7A7A\u6216\u90E8\u5206\u4E0D\u53EF\u884C\u65F6\u7ED9\u51FA\u5177\u4F53\u539F\u56E0\uFF08\u6587\u6848\u6309\u5B9E\u9645\u4F59\u91CF\u7B97\uFF09 */
    const note = $('#chordPoolNote');
    if (note) {
      const pool = chordPool();
      const diag = chordPoolDiagnosis();
      const strictOn = playNow === 'b' && !!s.chordBStrict;
      const extra = strictOn ? '\uFF08\u4E25\u683C\u9898\u6C60\uFF1A\u53EA\u51FA\u540D\u5B57\u552F\u4E00\u7684\u9898\uFF09' : '';
      if (!pool.length) {
        note.className = 'field-tip bad';
        note.textContent = '\u26A0 \u5F53\u524D\u6CA1\u6709\u53EF\u7528\u7684\u9898\u3002' + (diag || '');
      } else if (diag) {
        note.className = 'field-tip warn';
        note.textContent = '\u26A0 \u53EF\u7528 ' + pool.length + ' \u9053\u3002' + extra + diag;
      } else {
        note.className = 'field-tip';
        note.textContent = '\u5F53\u524D\u53EF\u7528\uFF1A' + pool.length + ' \u9053' + extra + '\uFF080\u2013' + chordRangeFretMax() + ' \u54C1\u5185\uFF09\u3002';
      }
    }
  }

  /* ---------------------------------------------------------------
   *  \u548C\u5F26\u6A21\u5F0F\u7A7A\u72B6\u6001
   * --------------------------------------------------------------- */
  function renderChordEmptyState() {
    const fb = $('#chordFeedback');
    if (fb) {
      fb.className = 'feedback chord-feedback bad';
      fb.textContent = '\u5F53\u524D\u8BBE\u7F6E\u4E0B\u6CA1\u6709\u53EF\u7528\u7684\u548C\u5F26\u7EC4\u5408\u3002' + (chordPoolDiagnosis() || '\u8BF7\u5728\u8BBE\u7F6E\u91CC\u8C03\u6574\u6839\u97F3\u3001\u8D28\u91CF\u6216\u54C1\u4F4D\u8303\u56F4\u3002');
    }
    const nameEl = $('#chordName');
    if (nameEl) nameEl.textContent = '\u65E0\u53EF\u51FA\u9898';
    const sub = $('#chordSub');
    if (sub) sub.textContent = '\u8BF7\u5728\u8BBE\u7F6E \u2192 \u548C\u5F26\u6A21\u5F0F\u91CC\u8C03\u6574\u8303\u56F4';
    const next = $('#chordNext');
    if (next) next.hidden = true;
    /* f2n \u7684\u7A7A\u72B6\u6001\u4E5F\u8981\u628A\u9009\u9879\u533A\u6536\u8D77\u6765 */
    const box = $('#chordOptions');
    if (box) { box.innerHTML = ''; box.hidden = true; }
    const head = $('#chordOptionHead');
    if (head) head.hidden = true;
    syncChordUI();
  }

  /* =================================================================
   *  \u97F3\u7A0B\u6A21\u5F0F\uFF1A\u754C\u9762\u5C42
   *
   *  \u4E0E\u548C\u5F26\u6A21\u5F0F\u540C\u6784\uFF1A\u72EC\u7ACB\u89C6\u56FE #intervalView\u3001\u72EC\u7ACB\u6307\u677F #intervalFretboard\u3001
   *  \u72EC\u7ACB\u7684\u9898\u5361/\u9009\u9879/\u53CD\u9988/\u8BB0\u5F55\u3002\u7EDD\u4E0D\u4E0E\u5176\u5B83\u4E09\u4E2A\u6A21\u5F0F\u5171\u7528\u6807\u8BB0\u903B\u8F91\u3002
   * ================================================================= */

  /* ---------- \u9898\u5361 ---------- */

  function renderIntervalPrompt() {
    const T = intervalRound.snap ? (intervalRound.snap.theory || intervalTheory()) : intervalTheory();
    const q = intervalRound.current;
    const titleEl = $('#intervalTitle');
    const subEl = $('#intervalSub');
    const labelEl = $('#intervalLabel');
    if (!titleEl) return;

    /* \u4E3B\u6807\u9898 = \u771F\u6B63\u7684\u9898\u76EE\uFF1B\u526F\u6807\u9898 = \u8D77\u70B9/\u64CD\u4F5C\u63D0\u793A\u3002
       \u73A9\u6CD5 B \u4EE5\u524D\u7684\u5C42\u7EA7\u662F\u53CD\u7684\uFF1A\u8D77\u70B9\u300C3 \u5F26 9 \u54C1 \u00B7 E4\u300D\u7528 44px \u7C97\u4F53\uFF0C
       \u800C\u771F\u6B63\u7684\u9898\u76EE\u300C\u4ECE A \u5411\u4E0A\u7684\u5927\u4E03\u5EA6\u300D\u6324\u5728 13px \u7684\u5C0F\u5B57\u91CC\u3002 */
    /* \u9898\u76EE\u91CC\u7684 A / B \u8981\u7528\u4E0E\u6307\u677F\u5706\u5708\u4E00\u81F4\u7684\u989C\u8272\u6807\u51FA\uFF0C
       \u8FD9\u6837\u7528\u6237\u4E00\u773C\u5C31\u77E5\u9053\u300C\u6587\u5B57\u91CC\u7684 A\u300D\u5BF9\u5E94\u6307\u677F\u4E0A\u54EA\u4E2A\u70B9\u3002
       \u5706\u5708\u7684\u914D\u8272\u89C1 style.css \u7684 .bm.iroot\uFF08\u6A59\uFF09/ .bm.itarget\uFF08\u84DD\uFF09\u3002 */
    const A_COLOR = '#e0912f';   // \u4E0E .bm.iroot \u540C\u8272
    const B_COLOR = '#4a90d9';   // \u4E0E .bm.itarget \u540C\u8272
    const colorAB = (text) => String(text)
      .replace(/A/g, '<span class="iv-ab iv-ab-a">A</span>')
      .replace(/B/g, '<span class="iv-ab iv-ab-b">B</span>');

    const setTitle = (main, sub) => {
      if (titleEl) titleEl.innerHTML = colorAB(main);
      if (subEl) subEl.textContent = sub || '';
    };

    if (!q || intervalRound.state === 'idle') {
      if (labelEl) labelEl.textContent = '\u97F3\u7A0B\u6A21\u5F0F';
      if (intervalRound.state === 'idle' && intervalRound.results.length) {
        setTitle('\u672C\u8F6E\u5B8C\u6210 \uD83C\uDF89', '\u6309 Enter \u6216\u70B9\u300C\u5F00\u59CB\u65B0\u4E00\u8F6E\u300D\u7EE7\u7EED');
      } else {
        setTitle('\u2014', '\u9009\u62E9\u73A9\u6CD5\u540E\u5F00\u59CB');
      }
      return;
    }

    if (intervalRound.play === 'a') {
      /* \u73A9\u6CD5 A\uFF1A\u9898\u76EE\u672C\u8EAB\u5C31\u662F\u300C\u4ECE A \u5230 B \u662F\u54EA\u4E2A\u97F3\u7A0B\uFF1F\u300D\uFF0C\u5B83\u662F\u4E3B\u6807\u9898 */
      if (labelEl) labelEl.textContent = '\u770B\u6307\u677F\u4E0A\u7684\u4E24\u4E2A\u70B9';
      setTitle('\u4ECE A \u5230 B \u662F\u54EA\u4E2A\u97F3\u7A0B\uFF1F',
        intervalRound.waitStart
          ? '\u70B9\u300C\u5F00\u59CB\u300D\u540E\u8BA1\u65F6\u5E76\u64AD\u653E\u8D77\u70B9\u97F3'
          : '\u540C\u65F6\u5224\u65AD\u97F3\u7A0B\u548C\u65B9\u5411\uFF08\u4E0A\u884C / \u4E0B\u884C\uFF09');
    } else {
      /* \u73A9\u6CD5 B\uFF1A\u9898\u76EE\u300C\u4ECE A \u5411\u4E0A\u7684\u5927\u4E03\u5EA6\u300D\u662F\u4E3B\u6807\u9898\uFF0C\u8D77\u70B9\u964D\u4E3A\u526F\u6807\u9898 */
      const it = T ? T.intervalById(q.intervalId) : null;
      const name = it ? it.name : q.intervalId;
      const dirTxt = q.dir === 'down' ? '\u5411\u4E0B' : '\u5411\u4E0A';
      if (labelEl) labelEl.textContent = '\u5728\u6307\u677F\u4E0A\u70B9\u51FA\u76EE\u6807\u4F4D\u7F6E';

      const start = intervalRound.start;
      let startTxt = '';
      if (start) {
        if (intervalRound.snap && intervalRound.snap.showRootName) {
          const pc = pcOf(midiOf(start.s, start.f));
          startTxt = '\u8D77\u70B9 A\uFF1A' + start.s + ' \u5F26 ' + start.f + ' \u54C1 \u00B7 ' + intervalNoteName(pc) + octaveSuffix(start);
        } else {
          startTxt = '\u8D77\u70B9 A\uFF1A' + start.s + ' \u5F26 ' + start.f + ' \u54C1';
        }
      }
      setTitle('\u4ECE A ' + dirTxt + '\u7684' + name, startTxt || '\u70B9\u300C\u5F00\u59CB\u300D\u540E\u8BA1\u65F6\u5E76\u64AD\u653E\u8D77\u70B9\u97F3');
    }
  }

  /* \u8D77\u70B9\u97F3\u540D\u7684\u516B\u5EA6\u540E\u7F00\uFF08C3 / E4\uFF09\uFF0C\u4E0E\u73B0\u6709 noteName \u7684\u98CE\u683C\u4FDD\u6301\u4E00\u81F4 */
  function octaveSuffix(cell) {
    const midi = midiOf(cell.s, cell.f);
    const oct = Math.floor(midi / 12) - 1;
    return String(oct);
  }

  /* ---------- \u9009\u9879\uFF08\u73A9\u6CD5 A\uFF09 ---------- */

  function renderIntervalOptions() {
    const box = $('#intervalOptions');
    const head = $('#intervalOptionHead');
    if (!box) return;
    const T = intervalRound.snap ? (intervalRound.snap.theory || intervalTheory()) : intervalTheory();

    /* \u73A9\u6CD5 B \u4E0D\u7528\u9009\u9879\u533A */
    if (intervalRound.play !== 'a' || !intervalRound.options.length) {
      box.innerHTML = '';
      box.hidden = true;
      if (head) head.hidden = true;
      return;
    }
    box.hidden = false;
    if (head) head.hidden = false;
    box.innerHTML = '';

    const n = intervalRound.options.length;
    box.style.setProperty('--opt-count', String(n));
    box.className = 'options interval-options '
      + (n <= 4 ? 'few' : n <= 7 ? 'mid' : n <= 10 ? 'many' : 'max');

    intervalRound.options.forEach((opt, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.dataset.ikey = T ? T.optionKey(opt.id, opt.dir) : String(i);
      b.style.setProperty('--i', String(i));
      b.innerHTML = '<span class="kbd">' + (i < 9 ? (i + 1) : '') + '</span>'
        + '<span class="opt-main">' + (T ? T.optionLabel(opt.id, opt.dir) : opt.id) + '</span>';

      /* \u7B54\u540E\u7740\u8272\uFF1A\u6B63\u786E\u9879\u7EFF\u3001\u7528\u6237\u9519\u9009\u7EA2 */
      if (intervalRound.state === 'answered' && intervalRound.correct) {
        const isCorrect = opt.id === intervalRound.correct.id && opt.dir === intervalRound.correct.dir;
        const isChosen = intervalRound.chosen && intervalRound.chosen.id === opt.id && intervalRound.chosen.dir === opt.dir;
        if (isCorrect) b.classList.add('correct');
        else if (isChosen) b.classList.add('wrong');
        else b.classList.add('dim');
        b.disabled = true;
      } else if (intervalRound.submitted) {
        b.disabled = true;
      }

      b.addEventListener('click', () => chooseIntervalOption({ id: opt.id, dir: opt.dir }));
      box.appendChild(b);
    });

    const hint = $('#intervalOptionHint');
    if (hint) {
      const maxKey = Math.min(n, 9);
      hint.textContent = '\u70B9\u51FB\u9009\u9879\u4F5C\u7B54\uFF08\u952E\u76D8 1\u2013' + maxKey + '\uFF09';
    }
  }

  /* ---------- \u53CD\u9988 ---------- */

  function renderIntervalFeedback() {
    const fb = $('#intervalFeedback');
    if (!fb) return;
    const T = intervalRound.snap ? (intervalRound.snap.theory || intervalTheory()) : intervalTheory();
    const q = intervalRound.current;
    if (!q || intervalRound.state !== 'answered' || !intervalRound.verdict) {
      fb.className = 'feedback interval-feedback';
      fb.textContent = '';
      return;
    }
    const v = intervalRound.verdict;
    const ok = v.ok;
    fb.className = 'feedback interval-feedback ' + (ok ? 'good' : 'bad');

    /* \u4E24\u5217\u5E03\u5C40\uFF1A\u5DE6\u5217\u300C\u4F4D\u7F6E\u4E0E\u6570\u636E\u300D\uFF0C\u53F3\u5217\u300C\u7ED3\u8BBA\uFF08\u7B54\u6848 / \u4F60\u7684\u9009\u62E9 / \u9519\u56E0\uFF09\u300D\u3002
       \u4EE5\u524D\u5168\u585E\u4E00\u5217\uFF0C\u7B54\u9519\u65F6\u5806\u5230 7 \u884C\u4F1A\u628A\u4E0B\u9762\u7684\u9009\u9879\u6324\u51FA\u5C4F\u5E55\u3002
       \u6587\u5B57\u5185\u5BB9\u4E0E\u987A\u5E8F\u4E0D\u53D8\uFF0C\u53EA\u6362\u5BB9\u5668\u7ED3\u6784 \u2014\u2014 \u6309 textContent \u5224\u65AD\u7684\u65AD\u8A00\u4ECD\u7136\u6210\u7ACB\u3002 */
    const left = [];
    const right = [];
    const lines = left;
    if (intervalRound.play === 'a') {
      const a = intervalRound.cellA;
      const b = intervalRound.cellB;
      const ma = midiOf(a.s, a.f);
      const mb = midiOf(b.s, b.f);
      const rel = T ? T.relationOf(ma, mb) : null;
      lines.push('\u8D77\u70B9 A\uFF1A' + a.s + ' \u5F26 ' + a.f + ' \u54C1\uFF08' + intervalNoteName(pcOf(ma)) + octaveSuffix(a) + '\uFF09');
      lines.push('\u7EC8\u70B9 B\uFF1A' + b.s + ' \u5F26 ' + b.f + ' \u54C1\uFF08' + intervalNoteName(pcOf(mb)) + octaveSuffix(b) + '\uFF09');
      if (rel) lines.push('\u5B9E\u9645\u534A\u97F3\u8DDD\u79BB\uFF1A' + T.formatDelta(rel.delta) + '\uFF08' + T.dirLabel(rel.dir) + '\uFF09');
      const correctTxt = T ? T.optionLabel(intervalRound.correct.id, intervalRound.correct.dir) : '';
      right.push('\u6B63\u786E\u7B54\u6848\uFF1A' + correctTxt);
      if (intervalRound.chosen && T) {
        right.push('\u4F60\u9009\u62E9\uFF1A' + T.optionLabel(intervalRound.chosen.id, intervalRound.chosen.dir));
      } else if (v.timedOut) {
        right.push('\u4F60\u9009\u62E9\uFF1A\u8D85\u65F6\u672A\u4F5C\u7B54');
      }
      if (!ok) {
        if (v.error === 'direction') right.push('\u274C \u97F3\u7A0B\u5BF9\u4E86\uFF0C\u4F46\u65B9\u5411\u53CD\u4E86\u3002');
        else if (v.error === 'interval') right.push('\u274C \u65B9\u5411\u5BF9\u4E86\uFF0C\u4F46\u97F3\u7A0B\u9009\u9519\u4E86\u3002');
        else if (v.error === 'both') right.push('\u274C \u65B9\u5411\u548C\u97F3\u7A0B\u90FD\u9519\u4E86\u3002');
        else if (v.error === 'timeout') right.push('\u23F0 \u8D85\u65F6\u3002');
      }
    } else {
      const st = intervalRound.start;
      const m1 = midiOf(st.s, st.f);
      lines.push('\u8D77\u70B9 A\uFF1A' + st.s + ' \u5F26 ' + st.f + ' \u54C1\uFF08' + intervalNoteName(pcOf(m1)) + octaveSuffix(st) + '\uFF09');
      const it = T ? T.intervalById(q.intervalId) : null;
      lines.push('\u9898\u76EE\u8981\u6C42\uFF1A' + (q.dir === 'down' ? '\u5411\u4E0B' : '\u5411\u4E0A') + '\u7684' + (it ? it.name : q.intervalId)
        + (it ? '\uFF08' + it.semi + ' \u4E2A\u534A\u97F3\uFF09' : ''));
      if (intervalRound.pick) {
        const p = intervalRound.pick;
        const mp = midiOf(p.s, p.f);
        const rel = T ? T.relationOf(m1, mp) : null;
        lines.push('\u4F60\u70B9\u9009\uFF1A' + p.s + ' \u5F26 ' + p.f + ' \u54C1\uFF08' + intervalNoteName(pcOf(mp)) + octaveSuffix(p) + '\uFF09');
        if (rel) {
          lines.push('\u5B9E\u9645\uFF1A' + T.formatDelta(rel.delta) + ' \u4E2A\u534A\u97F3'
            + (rel.id ? '\uFF08' + T.intervalName(rel.id) + '\uFF09' : ''));
        }
      } else if (v.timedOut) {
        lines.push('\u4F60\u70B9\u9009\uFF1A\u8D85\u65F6\u672A\u4F5C\u7B54');
      }
      const main = intervalRound.targets.length ? intervalRound.targets[0] : null;
      if (main) {
        const mm = midiOf(main.s, main.f);
        right.push('\u6B63\u786E\u76EE\u6807\uFF1A' + main.s + ' \u5F26 ' + main.f + ' \u54C1\uFF08' + intervalNoteName(pcOf(mm)) + octaveSuffix(main) + '\uFF09'
          + (intervalRound.targets.length > 1 ? '\uFF0C\u53E6\u6709 ' + (intervalRound.targets.length - 1) + ' \u4E2A\u5408\u6CD5\u4F4D\u7F6E' : ''));
      }
      if (!ok) {
        if (v.error === 'direction') right.push('\u274C \u8DDD\u79BB\u5BF9\u4E86\uFF0C\u4F46\u65B9\u5411\u53CD\u4E86\u3002');
        else if (v.error === 'octave') right.push('\u274C \u97F3\u7EA7\u5BF9\u4E86\uFF0C\u4F46\u8DE8\u4E86\u516B\u5EA6\uFF0C\u4E0D\u7B26\u5408\u5F53\u524D\u7CBE\u786E\u5339\u914D\u89C4\u5219\u3002');
        else if (v.error === 'position') right.push('\u274C \u8FD9\u4E2A\u4F4D\u7F6E\u4E0D\u662F\u8BE5\u97F3\u7A0B\u7684\u5408\u6CD5\u76EE\u6807\u3002');
        else if (v.error === 'timeout') right.push('\u23F0 \u8D85\u65F6\u3002');
      }
    }
    /* \u4E24\u5217\uFF1A\u5DE6\u5217\u5E38\u9A7B\uFF08\u9898\u76EE\u672C\u8EAB\u7684\u4F4D\u7F6E\u4FE1\u606F\uFF09\uFF0C\u53F3\u5217\u662F\u7ED3\u8BBA\u3002\u7A84\u5C4F\u5728 CSS \u91CC\u9000\u5316\u6210\u5355\u5217\u3002 */
    fb.innerHTML = '<div class="ifb-col ifb-left">' + left.map((x) => '<div>' + x + '</div>').join('') + '</div>'
      + '<div class="ifb-col ifb-right">' + right.map((x) => '<div>' + x + '</div>').join('') + '</div>';
  }

  /* ---------- \u6307\u677F\u6E32\u67D3 ---------- */

  function renderIntervalFretboard() {
    if (typeof boardSvg === 'undefined' || !boardSvg.loaded) return;
    const T = intervalRound.snap ? (intervalRound.snap.theory || intervalTheory()) : intervalTheory();
    const marks = [];
    const picks = [];
    const snap = intervalRound.snap || intervalSnapshot();

    let hover = null;
    if (store.settings.mode === 'interval' && intervalRound.state === 'asking' && !intervalRound.waitStart) {
      hover = board.hover;
    }

    if (intervalRound.state === 'asking' && !intervalRound.waitStart) {
      if (intervalRound.play === 'a') {
        /* \u4E24\u70B9\uFF1AA / B \u5168\u7A0B\u53EF\u89C1\uFF08\u00A75.1\uFF09\uFF0C\u7B54\u9898\u4E2D\u4E0D\u663E\u793A\u97F3\u540D */
        if (intervalRound.cellA) marks.push({ s: intervalRound.cellA.s, f: intervalRound.cellA.f, kind: 'iroot', label: 'A' });
        if (intervalRound.cellB) marks.push({ s: intervalRound.cellB.s, f: intervalRound.cellB.f, kind: 'itarget', label: 'B' });
      } else {
        if (intervalRound.start) marks.push({ s: intervalRound.start.s, f: intervalRound.start.f, kind: 'iroot', label: 'A' });
        if (intervalRound.pick) picks.push({ s: intervalRound.pick.s, f: intervalRound.pick.f });
      }
    } else if (intervalRound.state === 'answered') {
      if (intervalRound.play === 'a') {
        if (intervalRound.cellA) marks.push({ s: intervalRound.cellA.s, f: intervalRound.cellA.f, kind: 'iroot', label: 'A' });
        if (intervalRound.cellB) marks.push({ s: intervalRound.cellB.s, f: intervalRound.cellB.f, kind: 'itarget', label: 'B' });
      } else {
        if (intervalRound.start) marks.push({ s: intervalRound.start.s, f: intervalRound.start.f, kind: 'iroot', label: 'A' });
        const main = intervalRound.targets.length ? intervalRound.targets[0] : null;
        /* \u5176\u4ED6\u5408\u6CD5\u76EE\u6807\uFF1A\u5F31\u63D0\u793A\uFF08\u00A74.5\uFF09 */
        intervalRound.targets.forEach((t) => {
          if (main && sameCell(t, main)) return;
          marks.push({ s: t.s, f: t.f, kind: 'ifaint' });
        });
        if (main) marks.push({ s: main.s, f: main.f, kind: 'answer' });
        /* \u7528\u6237\u9519\u9009 */
        if (intervalRound.pick && !intervalRound.lastOk) {
          marks.push({ s: intervalRound.pick.s, f: intervalRound.pick.f, kind: 'wrong' });
        } else if (intervalRound.pick && intervalRound.lastOk) {
          marks.push({ s: intervalRound.pick.s, f: intervalRound.pick.f, kind: 'answer' });
        }
      }
    }

    /* \u7B54\u540E\u8FDE\u7EBF\uFF08E3\uFF09\uFF1AA \u2192 B \u7684\u6DE1\u5F27\u7EBF */
    const links = [];
    if (intervalRound.state === 'answered' && intervalRound.play === 'a'
      && intervalRound.cellA && intervalRound.cellB) {
      links.push({ a: intervalRound.cellA, b: intervalRound.cellB });
    }

    boardSvg.paint({ marks: marks, hover: hover, picks: picks, links: links }, 'intervalFretboard');
  }

  /* ---------- \u754C\u9762\u540C\u6B65 ---------- */

  function syncIntervalUI() {
    const asking = intervalRound.state === 'asking';
    const answered = intervalRound.state === 'answered';
    const play = intervalRound.play;

    /* A / B \u5206\u6BB5\u6309\u94AE\uFF1A\u9AD8\u4EAE\u5F53\u524D\u73A9\u6CD5\uFF08\u7B54\u9898\u4E2D\u4E5F\u80FD\u5207\uFF0C\u5207\u6362\u5373\u91CD\u5F00\u4E00\u8F6E\uFF09 */
    document.querySelectorAll('#intervalPlaySeg .seg-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.play === play);
    });

    /* \u6309\u94AE */
    const submit = $('#intervalSubmit');
    if (submit) {
      submit.hidden = play !== 'b';
      submit.disabled = !(asking && !intervalRound.waitStart && intervalRound.pick && !intervalRound.submitted);
    }
    const clear = $('#intervalClear');
    if (clear) {
      clear.hidden = play !== 'b';
      clear.disabled = !(asking && !intervalRound.waitStart && intervalRound.pick && !intervalRound.submitted);
    }
    const listen = $('#intervalListen');
    if (listen) {
      listen.disabled = intervalRound.waitStart || intervalRound.state === 'idle';
    }
    const next = $('#intervalNext');
    if (next) {
      if (answered) {
        next.hidden = false;
        next.textContent = '\u4E0B\u4E00\u9898 \u203A';
      } else if (intervalRound.state === 'idle' && intervalRound.results.length) {
        next.hidden = false;
        next.textContent = '\u5F00\u59CB\u65B0\u4E00\u8F6E \u203A';
      } else {
        next.hidden = true;
      }
    }
    const combo = $('#intervalCombo');
    if (combo) combo.textContent = '\u8FDE\u5BF9 ' + intervalRound.streak;

    /* \u6307\u677F\u680F\u6587\u6848 */
    const fbMode = $('#intervalFbMode');
    if (fbMode) fbMode.textContent = '\u5409\u4ED6\u6307\u677F \u00B7 0\u2013' + intervalFretMax() + ' \u54C1';
    const hint = $('#intervalBoardHint');
    if (hint) {
      hint.textContent = play === 'b'
        ? '\u70B9\u683C\u5B50\u9009\u4E2D\u76EE\u6807\uFF0C\u518D\u70B9\u4E00\u6B21\u53D6\u6D88\uFF1BEnter \u63D0\u4EA4'
        : '\u770B\u4E24\u4E2A\u70B9\uFF0C\u5224\u65AD\u97F3\u7A0B\u4E0E\u65B9\u5411';
    }
    const muteBtn = $('#intervalMute');
    if (muteBtn) {
      /* \u97F3\u7A0B\u6A21\u5F0F\u81EA\u5DF1\u7684\u90A3\u4E00\u4EFD\u9759\u97F3\u72B6\u6001\uFF08\u4E0D\u662F\u5168\u5C40\u517C\u5BB9\u5B57\u6BB5\uFF09\uFF1B
         \u6587\u6848\u4E0E syncSoundUI() \u4FDD\u6301\u4E00\u81F4\uFF0C\u907F\u514D\u540C\u4E00\u4E2A\u6309\u94AE\u5728\u4E24\u6761\u5237\u65B0\u8DEF\u5F84\u4E0B\u663E\u793A\u4E24\u79CD\u5B57\u3002 */
      const snd = soundOf('interval');
      muteBtn.classList.toggle('muted', snd.muted);
      muteBtn.textContent = snd.muted ? '\uD83D\uDD07 \u58F0\u97F3\u5DF2\u5173' : '\uD83D\uDD0A \u58F0\u97F3\u5F00';
      muteBtn.setAttribute('aria-pressed', snd.muted ? 'true' : 'false');
    }
  }

  function renderIntervalEmptyState() {
    const fb = $('#intervalFeedback');
    if (fb) {
      fb.className = 'feedback interval-feedback bad';
      fb.textContent = '\u5F53\u524D\u8BBE\u7F6E\u4E0B\u6CA1\u6709\u53EF\u7528\u7684\u97F3\u7A0B\u9898\u76EE\u3002\u8BF7\u68C0\u67E5\uFF1A'
        + '\u2460 \u73A9\u6CD5 A \u81F3\u5C11\u52FE\u9009 2 \u6839\u5F26\uFF1B'
        + '\u2461 \u542F\u7528\u96C6\u5408\u80FD\u5426\u5728\u5F53\u524D\u54C1\u4F4D\u8303\u56F4\u91CC\u51D1\u51FA\u9898\u76EE\uFF1B'
        + '\u2462 \u73A9\u6CD5 B \u7684\u8D77\u70B9\u8303\u56F4\u5185\u662F\u5426\u5B58\u5728\u5408\u6CD5\u76EE\u6807\u3002';
    }
    const titleEl = $('#intervalTitle');
    if (titleEl) titleEl.textContent = '\u65E0\u53EF\u51FA\u9898';
    const subEl = $('#intervalSub');
    if (subEl) subEl.textContent = '\u8BF7\u5728\u8BBE\u7F6E \u2192 \u97F3\u7A0B\u6A21\u5F0F\u91CC\u8C03\u6574';
    const box = $('#intervalOptions');
    if (box) { box.innerHTML = ''; box.hidden = true; }
    const head = $('#intervalOptionHead');
    if (head) head.hidden = true;
    const next = $('#intervalNext');
    if (next) next.hidden = true;
  }

  /* ---------- \u6307\u677F\u4EA4\u4E92 ---------- */

  function bindIntervalBoard(cv) {
    if (!cv) return;
    cv.addEventListener('pointermove', (ev) => {
      if (store.settings.mode !== 'interval') return;
      const canHover = intervalRound.state === 'asking' && !intervalRound.waitStart;
      const hit = canHover ? boardHit(cv, ev) : null;
      const changed = (!!hit !== !!board.hover)
        || (hit && board.hover && (hit.s !== board.hover.s || hit.f !== board.hover.f));
      board.hover = hit;
      if (changed) renderIntervalFretboard();
    });
    cv.addEventListener('pointerleave', () => {
      if (store.settings.mode !== 'interval') return;
      board.hover = null;
      renderIntervalFretboard();
    });
    cv.addEventListener('click', (ev) => {
      if (store.settings.mode !== 'interval') return;
      /* \u7B49\u5F85\u5F00\u59CB\uFF1A\u8FD9\u4E00\u4E0B\u53EA\u5F00\u59CB\uFF0C\u4E0D\u9009\u4EFB\u4F55\u683C\u5B50 */
      if (intervalRound.waitStart) { beginIntervalQuestion(); return; }
      if (intervalRound.state !== 'asking') return;
      if (intervalRound.play !== 'b') return;
      const cell = boardHit(cv, ev);
      if (!cell) return;
      pickIntervalTarget(cell);
    });
  }

  /* ---------------------------------------------------------------
   *  \u5F39\u7A97
   * --------------------------------------------------------------- */
  function openModal(sel) {
    /* \u73A9\u6CD5\u8BF4\u660E\u6309\u5F53\u524D\u6A21\u5F0F\u88C1\u526A\uFF0C\u5FC5\u987B\u5728\u663E\u793A\u4E4B\u524D\u505A\u5B8C\uFF0C\u5426\u5219\u4F1A\u5148\u95EA\u4E00\u4E0B\u522B\u7684\u6A21\u5F0F\u7684\u6BB5\u843D */
    if (sel === '#helpModal') applyHelpScope();
    $(sel).hidden = false;
  }
  function closeModals() {
    /* Q40\uFF1A\u627E\u4F4D\u7F6E\u6A21\u5F0F\u4E0D\u5141\u8BB8\u300C\u4E00\u6839\u5F26\u90FD\u4E0D\u9009\u300D\u2014\u2014 \u5019\u9009\u6C60\u4F1A\u53D8\u6210 0\uFF0C\u9898\u76EE\u51FA\u4E0D\u6765\u3001
       \u754C\u9762\u4E00\u7247\u7A7A\u767D\uFF0C\u7528\u6237\u5B8C\u5168\u4E0D\u77E5\u9053\u53D1\u751F\u4E86\u4EC0\u4E48\u3002\u4E07\u4E00\u56E0\u4E3A\u5BFC\u5165\u5907\u4EFD\u7B49\u539F\u56E0\u51FA\u73B0\u4E86
       \u8FD9\u79CD\u72B6\u6001\uFF0C\u5C31\u5728\u9000\u51FA\u8BBE\u7F6E\u65F6\u62E6\u4F4F\uFF0C\u5E76\u7ED9\u51FA\u660E\u786E\u6587\u5B57\u3002 */
    if (store.settings.mode === 'pos' && !(store.settings.strings || []).length) {
      const note = $('#stringGuardNote');
      if (note) {
        note.hidden = false;
        note.textContent = '\u81F3\u5C11\u4FDD\u7559\u4E00\u6839\u5F26\uFF1A\u4E00\u6839\u5F26\u90FD\u4E0D\u9009\u5C31\u6CA1\u6709\u4EFB\u4F55\u53EF\u51FA\u7684\u9898\u76EE\u3002\u8BF7\u5148\u5728\u300C\u5F26\u9009\u62E9\u300D\u91CC\u52FE\u4E0A\u81F3\u5C11\u4E00\u6839\uFF0C\u518D\u5173\u95ED\u8BBE\u7F6E\u3002';
      }
      if (settingsShowSection) settingsShowSection('sec-practice');
      return;
    }
    const note = $('#stringGuardNote');
    if (note) { note.hidden = true; note.textContent = ''; }
    document.querySelectorAll('.modal').forEach((m) => { m.hidden = true; });
  }

  /* ---------------------------------------------------------------
   *  \u4E3B\u9875\u300C\u91CD\u7F6E\u5168\u90E8\u6570\u636E\u300D\u7684\u786E\u8BA4\u6761
   *  \u4E0D\u662F\u5F39\u7A97\uFF08\u4E0D\u5360 .modal\u3001\u4E0D\u9501\u952E\u76D8\uFF09\uFF0C\u5C31\u662F .home-foot \u91CC\u7684\u4E00\u6761\u6D6E\u5C42\uFF1A
   *  \u70B9\u6309\u94AE\u5C55\u5F00\uFF0C\u53D6\u6D88 / \u786E\u8BA4 / \u70B9\u522B\u5904 / Esc \u6536\u8D77\u3002
   * --------------------------------------------------------------- */
  function homeConfirmOpen() {
    const box = $('#homeConfirm');
    return !!box && !box.hidden;
  }
  function closeHomeConfirm() {
    const box = $('#homeConfirm');
    if (box) box.hidden = true;
  }
  function openHomeConfirm() {
    const box = $('#homeConfirm');
    if (!box) return;
    box.hidden = false;
    /* \u952E\u76D8\u7528\u6237\uFF1A\u5C55\u5F00\u540E\u7126\u70B9\u843D\u5728\u300C\u53D6\u6D88\u300D\u4E0A\uFF0C\u8BEF\u6309 Enter \u4E0D\u4F1A\u628A\u6570\u636E\u6E05\u6389 */
    const cancel = $('#homeResetCancel');
    if (cancel && typeof cancel.focus === 'function') cancel.focus();
  }

  function updateViewLabel() {
    const mf = rangeFretMax();
    const txt = '\u5409\u4ED6\u6307\u677F \u00B7 0\u2013' + mf + ' \u54C1 \u00B7 \u54C1\u8DDD\u6309\u771F\u5B9E\u6BD4\u4F8B\uFF08\u8D8A\u5F80\u53F3\u8D8A\u7A84\uFF09';
    ['#fbMode', '#posFbMode'].forEach((s) => { const el = $(s); if (el) el.textContent = txt; });
    const cm = chordRangeFretMax();
    const chordEl = $('#chordFbMode');
    if (chordEl) chordEl.textContent = '\u5409\u4ED6\u6307\u677F \u00B7 0\u2013' + cm + ' \u54C1\uFF08\u548C\u5F26\u6A21\u5F0F\uFF09';
  }

  /* \u8C03\u8BD5\u680F\u53EA\u5728\u8BBE\u7F6E\u91CC\u5F00\u542F\u201C\u8C03\u8BD5\u6A21\u5F0F\u201D\u540E\u663E\u793A */
  function applyDebugMode() {
    const bar = $('#debugBar');
    const on = !!store.settings.debugMode;
    if (bar) bar.hidden = !on;
    const hint = $('#debugStateHint');
    if (hint) {
      hint.textContent = on ? '\u5F53\u524D\uFF1A\u8C03\u8BD5\u5DE5\u5177\u6761\u5DF2\u663E\u793A\u5728\u9875\u9762\u9876\u90E8' : '\u5F53\u524D\uFF1A\u8C03\u8BD5\u5DE5\u5177\u6761\u5DF2\u9690\u85CF\uFF08\u666E\u901A\u4F7F\u7528\u6A21\u5F0F\uFF09';
      hint.classList.toggle('on', on);
    }
    syncPosDebugSeg();
    syncDebugBar();
  }

  function syncPosDebugSeg() {
    const seg = $('#posDebugSeg');
    if (seg) seg.hidden = store.settings.mode !== 'pos';
    document.querySelectorAll('#posDebugSeg .seg-btn').forEach((b) => {
      const key = b.dataset.posDebug;
      const on = key === 'free' ? !!store.settings.posFreeClick : !!store.settings.posShowAllNames;
      b.classList.toggle('active', on);
    });
  }

  /* \u300C\u8BB0\u4E3A\u7B54\u9519\u5E76\u5237\u65B0\u300D\u53EA\u5728\u97F3\u540D\u6A21\u5F0F\u6709\u610F\u4E49\uFF1A
   * \u5B83\u5BF9\u5355\u97F3\u5361\u7247\u5199 e++ / \u964D\u7EA7 / due \u91CD\u7F6E\uFF0C\u662F SRS \u7684\u300C\u5FD8\u6389\u4E00\u6B21\u300D\u8BED\u4E49\u3002
   * \u627E\u4F4D\u7F6E\u6A21\u5F0F\u7684\u9898\u662F\u300C\u5355\u4F4D\u300D\u4E0D\u662F\u5355\u683C\u5361\u7247\uFF0C\u548C\u5F26\u4E0E\u97F3\u7A0B\u5404\u6709\u81EA\u5DF1\u7684 SRS \u5361\uFF0C
   * \u5F3A\u884C\u501F\u7528\u4F1A\u628A\u7B54\u9519\u8BB0\u5230\u522B\u7684\u6A21\u5F0F\u7684\u5361\u7247\u4E0A\u3002
   * \u6240\u4EE5\u56DB\u4E2A\u6A21\u5F0F\u90FD\u663E\u793A\u8FD9\u4E2A\u6309\u94AE\uFF08\u4FDD\u6301\u5DE5\u5177\u6761\u5E03\u5C40\u4E00\u81F4\uFF09\uFF0C\u975E\u97F3\u540D\u6A21\u5F0F\u7F6E\u7070\u5E76\u6539\u5199\u63D0\u793A\u3002 */
  function syncDebugBar() {
    const btn = $('#btnSkipQ');
    if (!btn) return;
    const mode = store.settings.mode || 'note';
    const usable = mode === 'note';
    btn.disabled = !usable;
    btn.title = usable
      ? '\u628A\u5F53\u524D\u9898\u8BB0\u4E3A\u7B54\u9519\uFF0C\u5E76\u6362\u4E00\u9053\u65B0\u9898'
      : '\u4EC5\u97F3\u540D\u6A21\u5F0F\u53EF\u7528\uFF08\u5176\u5B83\u6A21\u5F0F\u7684\u9898\u4E0D\u8BB0\u5728\u5355\u97F3\u5361\u7247\u4E0A\uFF09';
  }

  /* \u8BBE\u7F6E\u5F39\u7A97\uFF1A\u9876\u90E8\u6807\u7B7E\u5207\u6362\u5206\u7C7B\uFF08\u6BCF\u4E2A\u5206\u7C7B\u5355\u72EC\u663E\u793A\uFF0C\u4E0D\u7528\u957F\u8DDD\u79BB\u6EDA\u52A8\uFF09 */
  let settingsNavBound = false;
  /* closeModals() \u5728\u62E6\u622A\u300C\u4E00\u6839\u5F26\u90FD\u6CA1\u9009\u300D\u65F6\u8981\u8DF3\u56DE\u300C\u7EC3\u4E60\u4E0E\u7B54\u9898\u300D\uFF0C
     \u8FD9\u91CC\u628A bindSettingsNav \u91CC\u7684\u5206\u533A\u5207\u6362\u51FD\u6570\u66B4\u9732\u5230\u6A21\u5757\u4F5C\u7528\u57DF\u3002 */
  let settingsShowSection = null;
  function bindSettingsNav() {
    const nav = $('#settingsNav');
    const body = $('#settingsBody');
    if (!nav || !body) return;
    const btns = Array.from(nav.querySelectorAll('.snav'));
    const show = (id) => {
      btns.forEach((b) => b.classList.toggle('active', b.dataset.target === id));
      Array.from(body.children).forEach((sec) => {
        if (sec.classList && sec.classList.contains('ssec')) {
          const on = sec.id === id;
          sec.hidden = !on;
          if (on) { body.scrollTop = 0; }
        }
      });
    };
    // \u53EA\u7ED1\u5B9A\u4E00\u6B21\uFF1A\u4EE5\u524D\u6BCF\u6B21\u6253\u5F00\u8BBE\u7F6E\u90FD\u4F1A\u518D\u7ED1\u4E00\u904D\uFF0C\u76D1\u542C\u5668\u8D8A\u79EF\u8D8A\u591A\uFF0C\u6EDA\u52A8/\u70B9\u51FB\u4F1A\u8D8A\u6765\u8D8A\u6162
    if (!settingsNavBound) {
      btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.target)));
      settingsNavBound = true;
    }
    settingsShowSection = show;
    /* \u9ED8\u8BA4\u505C\u5728\u54EA\u4E2A\u5206\u533A\uFF1A
       - \u97F3\u7A0B\u6A21\u5F0F \u2192 \u76F4\u63A5\u5F00\u300C\u97F3\u7A0B\u6A21\u5F0F\u300D\u9875\uFF08\u5B83\u7684\u5B57\u6BB5\u5168\u5728 #sec-interval \u91CC\uFF0C
         \u505C\u5728\u300C\u7EC3\u4E60\u4E0E\u7B54\u9898\u300D\u4F1A\u662F\u4E00\u7247\u7A7A\u767D\uFF09\uFF1B
       - \u5176\u5B83\u6A21\u5F0F \u2192 \u4FDD\u6301\u539F\u6765\u7684\u884C\u4E3A\uFF08\u7B2C\u4E00\u9875\u300C\u7EC3\u4E60\u4E0E\u7B54\u9898\u300D\uFF09\u3002
       \u53E6\u5916\uFF1A\u628A\u300C\u5728\u5F53\u524D\u6A21\u5F0F\u4E0B\u5B8C\u5168\u7A7A\u767D\u300D\u7684\u5206\u533A\u8FDE\u540C\u5BFC\u822A\u6309\u94AE\u4E00\u8D77\u9690\u85CF \u2014\u2014
       \u70B9\u8FDB\u53BB\u53EA\u6709\u4E00\u7247\u767D\uFF0C\u7B49\u4E8E\u7ED9\u7528\u6237\u6316\u5751\u3002\u5224\u636E\u662F\u8BE5 section \u5185\u6240\u6709
       [data-scope] \u5143\u7D20\u662F\u5426\u90FD\u5DF2\u5BF9\u5F53\u524D\u6A21\u5F0F\u9690\u85CF\u3002 */
    const hasVisibleContent = (sec) => {
      if (!sec) return false;
      const fields = Array.from(sec.querySelectorAll('[data-scope]'));
      if (!fields.length) return true;      // \u6CA1\u6709 scope \u58F0\u660E\u7684\u7167\u65E7\u663E\u793A
      return fields.some((el) => !el.hidden);
    };
    btns.forEach((b) => {
      b.hidden = !hasVisibleContent(document.getElementById(b.dataset.target));
    });

    const visible = btns.filter((b) => !b.hidden);
    const preferred = store.settings.mode === 'interval'
      ? visible.find((b) => b.dataset.target === 'sec-interval')
      : visible[0];
    show((preferred || visible[0] || btns[0]).dataset.target);
  }

  /* ---------------------------------------------------------------
   *  \u58F0\u97F3
   * --------------------------------------------------------------- */
  let audioInitStarted = false;
  function ensureAudio() {
    if (audioInitStarted) {
      if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
      return audio.loadingPromise || Promise.resolve();
    }
    audioInitStarted = true;
    // \u52A0\u8F7D\u9636\u6BB5\u4E0D\u663E\u793A\u7EA2\u5B57\uFF1A\u53EA\u6709\u201C\u70B9\u8FC7\u9875\u9762\uFF08\u7528\u6237\u624B\u52BF\uFF09\u4E4B\u540E\u4ECD\u5931\u8D25\u201D\u624D\u63D0\u793A\uFF0C\u907F\u514D\u8BEF\u62A5
    return audio.init().catch((e) => {
      console.warn('\u97F3\u9891\u521D\u59CB\u5316\u5931\u8D25', e);
      audio.initError = (e && e.message) || String(e);
      updateSoundStatus();
    });
  }

  window.addEventListener('pointerdown', () => { ensureAudio(); }, { capture: true });
  // \u9996\u6B21\u70B9\u51FB\u65F6\u7ACB\u5373\u6062\u590D AudioContext\uFF08\u624B\u52BF\u671F\u95F4 resume \u624D\u80FD\u89E3\u9501\u58F0\u97F3\uFF09
  window.addEventListener('pointerdown', () => {
    if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
  }, { capture: true });
  // \u5207\u56DE\u9875\u9762\u65F6\u6062\u590D\u97F3\u9891\uFF08\u5F88\u591A\u201C\u7A81\u7136\u6CA1\u58F0\u97F3\u201D\u90FD\u662F\u5207\u540E\u53F0\u540E\u88AB\u6302\u8D77\uFF09
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
  });
  // \u7B2C\u4E00\u6B21\u70B9\u51FB\u540E\u91CD\u65B0\u8BC4\u4F30\u58F0\u97F3\u72B6\u6001\uFF08\u70B9\u51FB\u524D\u4E0D\u663E\u793A\u201C\u5931\u8D25\u201D\uFF0C\u70B9\u51FB\u540E\u5931\u8D25\u624D\u660E\u786E\u62A5\u9519\uFF09
  window.addEventListener('pointerup', () => setTimeout(updateSoundStatus, 50), { capture: true, once: true });
  // samples-inline.js\uFF08\u53EF\u9009\uFF09\u5728 app.js \u4E4B\u540E\u52A0\u8F7D\uFF1A\u5982\u679C\u5B83\u5E26\u6765\u4E86\u5185\u5D4C\u91C7\u6837\uFF0C\u800C\u97F3\u9891\u6A21\u5757\u8FD8\u6CA1\u542F\u52A8\uFF0C\u5C31\u7ACB\u523B\u8865\u542F\u52A8
  window.addEventListener('load', () => {
    if (document.documentElement.dataset.samplesInline === '1' && !audioInitStarted) ensureAudio();
    updateSoundStatus();
  });

  /* \u8FD9\u9053\u9898\u300C\u8BE5\u54CD\u54EA\u4E2A\u97F3\u300D\u2014\u2014\u51FA\u9898\u81EA\u52A8\u64AD\u653E\u4E0E\u300C\u542C\u8FD9\u4E2A\u97F3\u300D\u5171\u7528\uFF0C\u4FDD\u8BC1\u4E24\u5904\u4E00\u81F4\u3002
     \u627E\u4F4D\u7F6E\u6A21\u5F0F\u6CA1\u6709\u552F\u4E00\u7684\u90A3\u4E00\u683C\uFF0C\u8BD5\u542C\u8981\u91CD\u65B0\u5B9A\u4E49\uFF1A
       A\uFF08\u5355\u5F26\uFF09\uFF1A\u8BE5\u5F26\u4E0A\u8FD9\u4E2A\u97F3\u540D\u7684\u6700\u4F4E\u683C\uFF08\u4E00\u5F26\u51FA\u73B0\u4E24\u6B21\u65F6\u56FA\u5B9A\u64AD\u4F4E\u7684\u90A3\u683C\uFF09\uFF1B
       B\uFF08\u5168\u6307\u677F\uFF09\uFF1A\u5404\u5F26\u97F3\u9AD8\u5DEE\u592A\u591A\uFF0C\u56FA\u5B9A\u64AD\u7B2C 4 \u516B\u5EA6\u7684\u6807\u51C6\u97F3\u9AD8\uFF08C4=60\u2026B4=71\uFF09\u3002 */
  function questionToneMidi(q) {
    if (!q) return 64;
    if (store.settings.mode !== 'pos') return midiOf(q.s, q.f);
    if (posPlayA()) return midiOf(q.s, q.f);
    return 60 + pcOf(midiOf(q.s, q.f));
  }

  function playCurrent() {
    /* \u97F3\u540D\u4E0E\u627E\u4F4D\u7F6E\u5171\u7528\u8FD9\u4E2A\u5165\u53E3\uFF08#btnListen / #posListen / \u7A7A\u683C\uFF09\uFF0C
       \u6240\u4EE5\u9759\u97F3\u5224\u5B9A\u8981\u53D6\u300C\u5F53\u524D\u6A21\u5F0F\u300D\u7684\u90A3\u4E00\u4EFD\uFF0C\u4E0D\u80FD\u5199\u6B7B note\u3002 */
    const snd = soundOf(store.settings.mode);
    if (snd.muted) { updateFeedback('\u5DF2\u9759\u97F3\uFF1A\u70B9\u5E95\u90E8\u300C\u58F0\u97F3\u5DF2\u5173\u300D\u53EF\u6062\u590D\u58F0\u97F3', 'info'); return; }
    ensureAudio().then(() => {
      if (!audio.ready) { updateFeedback('\u58F0\u97F3\u8FD8\u5728\u52A0\u8F7D\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u2026', 'info'); return; }
      audio.play(questionToneMidi(round.current));
    });
  }

  /* \u9759\u97F3\u5F00\u5173\uFF1A\u6309\u94AE\u3001\u8BBE\u7F6E\u91CC\u7684\u590D\u9009\u6846\u3001\u5FEB\u6377\u952E M \u5171\u7528\u3002
     \u7B2C\u4E8C\u4E2A\u53C2\u6570 mode \u53EF\u6307\u5B9A\u8981\u6539\u54EA\u4E2A\u6A21\u5F0F\uFF1B\u7F3A\u7701 = \u5F53\u524D\u6A21\u5F0F\u3002
     \u53EA\u52A8\u76EE\u6807\u6A21\u5F0F\u81EA\u5DF1\u90A3\u4E24\u4E2A\u5B57\u6BB5\uFF0C\u7EDD\u4E0D\u8FDE\u5E26\u5176\u5B83\u6A21\u5F0F\uFF08\u9694\u79BB\u7EA2\u7EBF\uFF09\u3002 */
  function setMuted(muted, mode) {
    const target = SOUND_FIELDS[mode] ? mode : (SOUND_FIELDS[store.settings.mode] ? store.settings.mode : 'note');
    setSoundOf(target, { muted: !!muted });
    save();
    audio.setMuted(!!muted, target);
    syncSoundUI();
    const nowMuted = soundOf(target).muted;
    /* \u63D0\u793A\u8BED\u53EA\u5728\u300C\u7528\u6237\u6B63\u5728\u770B\u7684\u90A3\u4E2A\u6A21\u5F0F\u300D\u4E0A\u5237\uFF0C\u907F\u514D\u6539\u4E86 A \u6A21\u5F0F\u5374\u5728 B \u6A21\u5F0F\u754C\u9762\u91CC\u5F39\u63D0\u793A */
    if (target === store.settings.mode) {
      if (target === 'pos') {
        const pf = $('#posFeedback');
        if (pf) {
          pf.className = 'feedback pos-feedback info';
          pf.textContent = nowMuted ? '\u5DF2\u9759\u97F3\uFF08\u518D\u6309 M \u6216\u70B9\u6309\u94AE\u6062\u590D\uFF09' : '\u58F0\u97F3\u5DF2\u6062\u590D';
        }
      } else {
        updateFeedback(nowMuted ? '\u5DF2\u9759\u97F3\uFF08\u518D\u6309 M \u6216\u70B9\u6309\u94AE\u6062\u590D\uFF09' : '\u58F0\u97F3\u5DF2\u6062\u590D', 'info');
      }
    }
  }

  /* \u628A\u56DB\u4E2A\u6A21\u5F0F\u7684\u9759\u97F3\u6309\u94AE + \u8BBE\u7F6E\u9762\u677F\u91CC\u7684\u9759\u97F3/\u97F3\u91CF\u63A7\u4EF6\u7EDF\u4E00\u5237\u6210\u5404\u81EA\u7684\u503C */
  function syncSoundUI() {
    [['#btnMute', 'note'], ['#posMute', 'pos'], ['#chordMute', 'chord'], ['#intervalMute', 'interval']]
      .forEach((pair) => {
        const btn = $(pair[0]);
        if (!btn) return;
        const snd = soundOf(pair[1]);
        btn.classList.toggle('muted', snd.muted);
        btn.textContent = snd.muted ? '\uD83D\uDD07 \u58F0\u97F3\u5DF2\u5173' : '\uD83D\uDD0A \u58F0\u97F3\u5F00';
        btn.setAttribute('aria-pressed', String(!!snd.muted));
      });
    const cur = soundOf(store.settings.mode);
    const chk = $('#muteSet');
    if (chk) chk.checked = !!cur.muted;
    const vol = $('#volRange');
    if (vol) vol.value = String(cur.volume);
  }

  /* \u8BD5\u542C\u67D0\u4E2A\u9009\u9879\u7684\u97F3\u9AD8\uFF08\u4E0D\u5224\u5206\uFF09\uFF1A\u6309\u9009\u9879\u5728\u5F53\u524D\u9898\u76EE\u5F26\u4E0A\u7684\u97F3\u9AD8\u64AD\u653E\uFF0C\u5E76\u9AD8\u4EAE\u8BE5\u9009\u9879 */
  function playPreviewPc(pc) {
    if (soundOf('note').muted) { updateFeedback('\u5DF2\u9759\u97F3\uFF1A\u5148\u70B9\u5E95\u90E8\u300C\u58F0\u97F3\u5DF2\u5173\u300D\u6062\u590D\u58F0\u97F3', 'info'); return; }
    const q = round.current;
    const base = q ? midiOf(q.s, 0) : 60;
    const midi = Math.round((base - pcOf(base)) / 12) * 12 + pc;   // \u57FA\u51C6\u97F3\u6240\u5728\u516B\u5EA6\u7684\u540C\u540D\u97F3
    ensureAudio().then(() => {
      if (!audio.ready) { updateFeedback('\u58F0\u97F3\u8FD8\u5728\u52A0\u8F7D\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u2026', 'info'); return; }
      audio.play(midi, 0.8);
      const btn = document.querySelector('#options .opt[data-pc="' + pc + '"]');
      if (btn) {
        btn.classList.add('previewing');
        setTimeout(() => btn.classList.remove('previewing'), 380);
      }
    });
  }

  /* \u9898\u76EE\u5347\u964D\u8C03\uFF08\u591A\u9009\uFF09\uFF1A\u81EA\u7136\u97F3 / \u5347\u53F7 / \u964D\u53F7\uFF0C\u81F3\u5C11\u4FDD\u7559\u4E00\u9879\u3002\u4E0D\u5237\u65B0\u9898\u76EE\uFF0C\u53EA\u91CD\u6392\u5F53\u524D\u9898\u7684\u9009\u9879 */
  function setAccSel(next) {
    const sel = { nat: !!next.nat, sharp: !!next.sharp, flat: !!next.flat };
    if (!sel.nat && !sel.sharp && !sel.flat) sel.nat = true;
    store.settings.accSel = sel;
    // \u517C\u5BB9\u65E7\u5B57\u6BB5\uFF1A\u5355\u4E00\u6A21\u5F0F\u5927\u81F4\u80FD\u8868\u8FBE\u591A\u9009\u65F6\u540C\u6B65\uFF0C\u65B9\u4FBF\u5176\u4ED6\u903B\u8F91\u8BFB\u53D6
    store.settings.accidentalMode = sel.nat && sel.sharp && sel.flat ? 'both'
      : sel.nat && !sel.sharp && !sel.flat ? 'natural'
        : !sel.sharp && sel.flat ? 'flat' : 'sharp';
    save();
    if (round.current && round.state === 'asking') {
      const pc = pcOf(midiOf(round.current.s, round.current.f));
      if (allowedPcs().indexOf(pc) < 0) {
        // \u5F53\u524D\u9898\u5DF2\u7ECF\u4E0D\u5728\u65B0\u8303\u56F4\u5185\uFF1A\u6362\u4E00\u9053\u7B26\u5408\u6761\u4EF6\u7684\u65B0\u9898
        refreshQuestion(false);
      } else {
        round.current.spelling = questionSpelling(pc);
        buildOptions(round.current);
        renderFretboard();
      }
    }
    syncAccidentalUI();
    updateOptionHint(document.querySelectorAll('#options .opt').length || store.settings.optionCount);
  }
  // \u517C\u5BB9\u5DE5\u5177\u6761\u65E7\u8C03\u7528\uFF1A\u6309\u65E7\u6A21\u5F0F\u5207\u6362
  function setAccidentalMode(mode) { setAccSel(accSelFromMode(mode)); }

  /* \u2014\u2014 \u97F3\u7A0B\u6A21\u5F0F\u7684\u5347\u964D\u8C03\u5F00\u5173\uFF08\u4E0E\u4E0A\u9762\u7684 accSel \u5B8C\u5168\u9694\u79BB\uFF09\u2014\u2014 */
  function syncIntervalAccUI() {
    const sel = intervalAccSel();
    const pair = [['#intervalSwNat', sel.nat], ['#intervalSwSharp', sel.sharp], ['#intervalSwFlat', sel.flat]];
    pair.forEach((p) => {
      const inp = $(p[0]);
      if (!inp) return;
      inp.checked = !!p[1];
      if (inp.parentElement) inp.parentElement.classList.toggle('active', !!p[1]);
    });
    document.querySelectorAll('#intervalAccPresets .btn').forEach((b) => {
      const p = b.dataset.preset;
      const on = p === 'natural' ? (sel.nat && !sel.sharp && !sel.flat)
        : p === 'sharp' ? (sel.nat && sel.sharp && !sel.flat)
          : p === 'flat' ? (sel.nat && !sel.sharp && sel.flat)
            : (sel.nat && sel.sharp && sel.flat);
      b.classList.toggle('active', !!on);
    });
    const tip = $('#intervalAccTip');
    if (tip) {
      tip.textContent = '\u53EA\u5F71\u54CD\u97F3\u7A0B\u6A21\u5F0F\u7684\u51FA\u9898\u8303\u56F4\uFF0C\u4E0E\u97F3\u540D\u6A21\u5F0F\u3001\u627E\u4F4D\u7F6E\u6A21\u5F0F\u7684\u5347\u964D\u8C03\u5F00\u5173\u4E92\u4E0D\u5F71\u54CD\u3002'
        + '\u5F53\u524D\uFF1A' + intervalAccModeName() + '\uFF08\u81F3\u5C11\u4FDD\u7559\u4E00\u9879\uFF09\u3002';
    }
  }

  /* \u5199\u97F3\u7A0B\u81EA\u5DF1\u7684\u5F00\u5173\uFF1B\u81F3\u5C11\u4FDD\u7559\u4E00\u9879\uFF08\u5168\u5173\u65F6\u4FDD\u7559\u81EA\u7136\u97F3\uFF0C\u4E0E\u97F3\u540D\u6A21\u5F0F\u540C\u4E00\u89C4\u5219\uFF09\u3002 */
  function setIntervalAccSel(next) {
    store.settings.intervalAccSel = normalizeAccSel(next);
    save();
    syncIntervalAccUI();
    /* \u9898\u6C60\u4E0E\u5F53\u524D\u9898\u90FD\u6309\u65B0\u8303\u56F4\u91CD\u5EFA\uFF1B\u97F3\u7A0B\u6A21\u5F0F\u6B63\u5728\u7EC3\u4E60\u65F6\u7ACB\u523B\u6362\u4E00\u8F6E\uFF0C
       \u5426\u5219\u5F53\u524D\u9898\u53EF\u80FD\u843D\u5728\u521A\u88AB\u5173\u6389\u7684\u97F3\u7EA7\u4E0A\u3002 */
    intervalAPoolCache = { key: '', list: [] };
    intervalBPoolCache = { key: '', list: [] };
    if (store.settings.mode === 'interval') applySettingsChange(true);
  }

  function syncAccidentalUI() {
    const sel = accSel();
    // \u201C\u5347\u53F7/\u964D\u53F7\u201D\u4E24\u4E2A\u5F00\u5173\uFF1B\u201C\u4EC5\u81EA\u7136\u97F3\u201D\u5C31\u662F\u628A\u4E24\u8005\u90FD\u5173\u6389
    const swSharp = $('#swSharp');
    const swFlat = $('#swFlat');
    if (swSharp) {
      swSharp.checked = !!sel.sharp;
      swSharp.parentElement.classList.toggle('active', !!sel.sharp);
    }
    if (swFlat) {
      swFlat.checked = !!sel.flat;
      swFlat.parentElement.classList.toggle('active', !!sel.flat);
    }
    const naturalOnly = $('#natOnlyBtn');
    if (naturalOnly) naturalOnly.classList.toggle('active', !sel.sharp && !sel.flat);
    const anyAcc = $('#anyAccBtn');
    if (anyAcc) anyAcc.classList.toggle('active', !!(sel.sharp && sel.flat));
    document.querySelectorAll('input[name="acc"]').forEach((inp) => {
      inp.checked = inp.value === store.settings.accidental;
    });
    const badge = $('#accBadge');
    if (badge) badge.textContent = accModeName();
  }

  /* \u9898\u76EE\u8C03\u8BD5\uFF1A\u5237\u65B0 / \u91CD\u542C / \u91CD\u7F6E\u8BB0\u5F55
   *
   * \u26A0 \u8FD9\u4E2A\u51FD\u6570\u539F\u5148\u4E00\u5F8B\u64CD\u4F5C\u5355\u97F3\u7684 round\uFF0C\u56DB\u4E2A\u6A21\u5F0F\u5171\u7528\u540C\u4E00\u4E2A\u8C03\u8BD5\u6761\u65F6\u5C31\u4F1A\u5E72\u9519\u4E8B\uFF1A
   *   - \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1Aq.key \u662F\u300C\u5355\u4F4D\u952E\u300D\uFF08pn4 / ps5n9\uFF0C\u89C1 posUnitKey\uFF09\uFF0C
   *     getCard \u7684 /^s(\d+)f(\d+)$/ \u5339\u914D\u4E0D\u4E0A\uFF0C\u4F1A\u5EFA\u51FA {s:0,f:0} \u7684\u7A7A\u58F3\u5361\uFF0C
   *     \u63A5\u7740\u65E7\u4FA7\u680F\u7684\u5F85\u590D\u4E60\u5217\u8868\u91CC midiOf(0,0) \u629B "Cannot read properties of undefined"\uFF1B
   *     \u300C\u5237\u65B0\u9898\u76EE\u300D\u8FD8\u4F1A\u628A\u627E\u4F4D\u7F6E\u7684\u9898\u6362\u6210\u6CA1\u6709 cells \u7684\u5355\u97F3\u9898\uFF0C\u754C\u9762\u76F4\u63A5\u7A7A\u6389\u3002
   *   - \u548C\u5F26 / \u97F3\u7A0B\u6A21\u5F0F\uFF1A\u5F53\u524D\u9898\u7EB9\u4E1D\u4E0D\u52A8\uFF0C\u5374\u5728\u540E\u53F0\u6084\u6084\u7ED9\u5355\u97F3\u5361\u7247\u8BB0\u4E00\u6B21\u7B54\u9519\u3002
   * \u6240\u4EE5\u8FD9\u91CC\u6309\u6A21\u5F0F\u5206\u6D3E\uFF1A\u53EA\u6709\u97F3\u540D\u6A21\u5F0F\u8D70\u539F\u6765\u7684 SRS \u903B\u8F91\uFF0C\u5176\u4F59\u4E09\u4E2A\u6A21\u5F0F\u5404\u81EA\u91CD\u62BD\u5F53\u524D\u9898\u3002
   */
  function refreshQuestion(mode) {
    // mode: true = \u628A\u5F53\u524D\u9898\u8BB0\u4E3A\u7B54\u9519\uFF1B'wrong' = \u540C\u4E0A\uFF1B\u5176\u4F59 = \u7EAF\u6362\u4E00\u9898
    const countAsWrong = mode === true || mode === 'wrong';
    const cur = store.settings.mode || 'note';
    if (cur === 'chord') { refreshChordQuestion(); return; }
    if (cur === 'interval') { refreshIntervalQuestion(); return; }
    /* \u627E\u4F4D\u7F6E\u6A21\u5F0F\u6CA1\u6709\u300C\u8DF3\u8FC7\u300D\u8FD9\u56DE\u4E8B\uFF08\u5B83\u7684\u9898\u662F\u300C\u5355\u4F4D\u300D\u4E0D\u662F\u5355\u683C\u5361\u7247\uFF09\uFF0C
       \u6240\u4EE5 countAsWrong \u5728\u8FD9\u91CC\u88AB\u5FFD\u7565\uFF1A\u53EA\u6362\u9898\uFF0C\u4E0D\u5199\u4EFB\u4F55\u6210\u7EE9\u3002 */
    if (cur === 'pos') { refreshPosQuestion(); return; }
    if (!round.current) { startRound(); return; }
    if (round.timer) { clearInterval(round.timer); round.timer = null; }
    if (round.pendingNext) { clearTimeout(round.pendingNext); round.pendingNext = null; }
    const q = round.current;
    if (countAsWrong) {
      // \u628A\u5F53\u524D\u8FD9\u9053\u9898\u8BB0\u4E3A\u7B54\u9519\uFF08\u8BA1\u5165\u9057\u5FD8\u66F2\u7EBF\uFF1A\u4E4B\u540E\u7684\u56DE\u5408\u66F4\u65E9\u3001\u66F4\u9891\u7E41\u5730\u51FA\u73B0\uFF09
      const card = getCard(q.key);
      card.e++;
      card.cn = 0;
      card.lvl = card.lvl >= 4 ? card.lvl - 1 : 0;
      card.last = nowMs();
      card.due = nowMs() + SRS_INTERVALS[0] * 60000;
      pushHist(card, false);
      bumpModeStats('note', false);
      store.history.push({ s: q.s, f: q.f, ok: false, t: nowMs(), ms: 0, lvl: card.lvl, skipped: true, m: 'note' });
      round.results.push({ pos: q.s + ' \u5F26 ' + q.f + ' \u54C1', s: q.s, f: q.f, correct: false, timedOut: false, skipped: true, chosen: '\u8DF3\u8FC7', answer: noteNameFor(pcOf(midiOf(q.s, q.f)), q.spelling), t: nowMs(), ms: 0, lvl: card.lvl, interval: SRS_INTERVALS[0] });
      round.streak = 0;
      save();
      renderSidebar();
    }
    /* \u91CD\u65B0\u62BD\u4E00\u8F6E\uFF1A\u5148\u628A\u521A\u7B54\u8FC7\u7684\u90A3\u9053\u4ECE\u5019\u9009\u6C60\u91CC\u5254\u9664\uFF0C\u518D\u62BD\u6EE1\u3002
       \u4EE5\u524D\u662F\u300C\u62BD\u6EE1\u518D filter\u300D\uFF0C\u4E00\u65E6\u4E0A\u4E00\u9898\u843D\u5728\u7B2C 2..n \u4F4D\uFF0C\u961F\u5217\u5C31\u4F1A\u5C11\u4E00\u9053\u3002 */
    const limit = store.settings.size;
    let mix = buildSchedule(limit, null, [q.key]);
    /* \u6781\u7AEF\u515C\u5E95\uFF1A\u8303\u56F4\u5185\u53EA\u6709\u8FD9\u4E00\u4E2A\u683C\u5B50\uFF08\u6392\u9664\u540E\u4E3A\u7A7A\uFF09\uFF0C\u6B64\u65F6\u53EA\u80FD\u628A\u5B83\u653E\u56DE\u53BB */
    if (!mix.length) mix = buildSchedule(limit, null);
    round.queue = mix.slice(0, Math.max(limit, 1));
    round.idx = 0;
    /* \u6362\u9898\u7B49\u4E8E\u91CD\u5F00\u4E00\u8F6E\uFF1A\u56FE3 \u7684\u5FEB\u7167\u8DDF\u7740\u65B0\u961F\u5217\u91CD\u5EFA */
    round.snapshot = freezeSnapshot(round.queue, 'note');
    nextQuestion();
    updateFeedback(countAsWrong ? '\u5DF2\u8BB0\u4E3A\u7B54\u9519\u5E76\u6362\u65B0\u9898\uFF08\u4E4B\u540E\u7684\u56DE\u5408\u4F1A\u66F4\u5E38\u51FA\u73B0\uFF09' : '\u5DF2\u6362\u65B0\u9898', 'info');
  }

  /* ---------- \u5176\u4F59\u4E09\u4E2A\u6A21\u5F0F\u7684\u300C\u6362\u4E00\u9898\u300D ----------
   * \u5171\u540C\u7EA6\u5B9A\uFF1A\u53EA\u6362\u9898\uFF0C\u4E0D\u5224\u5BF9\u9519\u3001\u4E0D\u5199\u5386\u53F2\u3001\u4E0D\u52A8 SRS \u5361\u7247\u3001\u4E0D\u6539\u672C\u8F6E\u6210\u7EE9\u3002
   * \u5DEE\u522B\u53EA\u5728\u5404\u81EA\u91CD\u62BD\u7684\u65B9\u5F0F\u4E0E\u63D0\u524D\u7ED3\u675F\u7684\u72B6\u6001\u6E05\u7406\u3002
   */

  /** \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1A\u91CD\u62BD\u4E00\u8F6E\u5E76\u8DF3\u8FC7\u5F53\u524D\u8FD9\u9053\uFF08\u5F53\u524D\u9898\u53EF\u80FD\u662F A \u7684\u300C\u5F26+\u97F3\u540D\u300D\u4E5F\u53EF\u80FD\u662F B \u7684\u97F3\u540D\uFF09\u3002
   *  \u8FD9\u91CC\u5FC5\u987B\u7528 buildPosSchedule \u2014\u2014 buildSchedule \u4EA7\u7684\u662F\u5355\u97F3\u683C\u5B50\u9898\uFF0C\u6CA1\u6709 cells \u5B57\u6BB5\uFF0C
   *  \u6362\u8FC7\u53BB\u754C\u9762\u5C31\u7A7A\u4E86\uFF08\u8FD9\u662F\u539F\u5B9E\u73B0\u771F\u5B9E\u53D1\u751F\u8FC7\u7684\u95EE\u9898\uFF09\u3002 */
  function refreshPosQuestion() {
    if (round.timer) { clearInterval(round.timer); round.timer = null; }
    if (round.pendingNext) { clearTimeout(round.pendingNext); round.pendingNext = null; }
    const skip = round.current && round.current.key ? [round.current.key] : null;
    const n = posPlayA() ? Math.max(1, Number(store.settings.size) || 10) : 1;
    let queue = buildPosSchedule(n, null, skip);
    /* \u6781\u7AEF\u515C\u5E95\uFF1A\u8303\u56F4\u5185\u53EA\u6709\u8FD9\u4E00\u4E2A\u5355\u4F4D\uFF0C\u6392\u9664\u540E\u4E3A\u7A7A \u2192 \u653E\u56DE\u53BB\uFF0C\u5426\u5219\u6574\u4E2A\u961F\u5217\u7A7A\u6389 */
    if (!queue.length) queue = buildPosSchedule(n, null);
    round.queue = queue;
    round.idx = 0;
    /* \u6362\u9898\u7B49\u4E8E\u91CD\u5F00\u4E00\u8F6E\uFF1A\u56FE3 \u7684\u5FEB\u7167\u8DDF\u7740\u65B0\u961F\u5217\u91CD\u5EFA\uFF08pos-B \u4E0D\u5EFA\u5FEB\u7167\uFF09 */
    round.snapshot = posPlayA() ? freezeSnapshot(round.queue, 'pos') : null;
    /* \u6362\u9898\u7B49\u4E8E\u653E\u5F03\u672C\u9898\uFF1A\u6E05\u6389\u9009\u70B9\u75D5\u8FF9\uFF0C\u522B\u8BA9\u4E0A\u4E00\u9898\u7684\u7EFF\u70B9\u7559\u4E0B */
    pos.picks = [];
    pos.last = null;
    pos.submitting = false;
    if (!posPlayA()) store.posBStats.last = null;
    nextQuestion();
    const pf = $('#posFeedback');
    if (pf) { pf.className = 'feedback pos-feedback info'; pf.textContent = '\u5DF2\u6362\u65B0\u9898'; }
  }

  /** \u548C\u5F26\u6A21\u5F0F\uFF1A\u91CD\u62BD\u4E00\u8F6E\uFF0C\u8DF3\u8FC7\u5F53\u524D\u8FD9\u9053\uFF08\u4FDD\u6301 n2f / f2n \u7684\u8BBE\u7F6E\u5FEB\u7167\u4E0D\u52A8\uFF09 */
  function refreshChordQuestion() {
    if (chordRound.timer) { clearInterval(chordRound.timer); chordRound.timer = null; }
    if (chordRound.pendingNext) { clearTimeout(chordRound.pendingNext); chordRound.pendingNext = null; }
    audio.stopChord();
    const skip = chordRound.current && chordRound.current.key ? chordRound.current.key : null;
    let queue = buildChordSchedule(store.settings.chordSize, null);
    /* buildChordSchedule \u6CA1\u6709 excludeKeys \u53C2\u6570\uFF1A\u62BD\u5B8C\u518D\u628A\u5F53\u524D\u9898\u5254\u6389\uFF0C
       \u5269\u4E0B\u7684\u4F5C\u65B0\u961F\u5217\uFF1B\u53EA\u6709 1 \u9898\u65F6\u4F1A\u5269\u7A7A\uFF0C\u90A3\u5C31\u5728\u539F\u961F\u5217\u91CC\u53D6\u4E0B\u4E00\u9053\uFF08\u539F\u5730\u4E0D\u52A8\uFF09\u3002 */
    if (skip) {
      const rest = queue.filter((c) => c.key !== skip);
      if (rest.length) queue = rest;
    }
    chordRound.queue = queue;
    chordRound.idx = 0;
    chordRound.snapshot = freezeSnapshot(queue, 'chord');
    if (!queue.length) {
      renderChordEmptyState();
      renderSidebar();
      return;
    }
    renderSidebar();
    nextChordQuestion();
    updateChordFeedback('\u5DF2\u6362\u65B0\u9898', 'info');
  }

  /** \u97F3\u7A0B\u6A21\u5F0F\uFF1A\u6309\u5F53\u524D\u73A9\u6CD5\u91CD\u62BD\u4E00\u8F6E\uFF0C\u8DF3\u8FC7\u5F53\u524D\u8FD9\u9053 */
  function refreshIntervalQuestion() {
    if (intervalRound.timer) { clearInterval(intervalRound.timer); intervalRound.timer = null; }
    if (intervalRound.pendingNext) { clearTimeout(intervalRound.pendingNext); intervalRound.pendingNext = null; }
    audio.stopChord();
    const snap = intervalRound.snap || intervalSnapshot();
    const skip = intervalRound.current && intervalRound.current.cardKey ? intervalRound.current.cardKey : null;
    let queue = snap.play === 'b' ? buildIntervalBSchedule(snap) : buildIntervalASchedule(snap);
    if (skip) {
      const rest = queue.filter((q) => q.cardKey !== skip);
      if (rest.length) queue = rest;
    }
    intervalRound.queue = queue;
    intervalRound.idx = 0;
    intervalRound.snapshot = freezeSnapshot(queue, 'interval', (item) => item.cardKey);
    if (!queue.length) {
      renderIntervalEmptyState();
      syncIntervalUI();
      renderIntervalFretboard();
      renderSidebar();
      return;
    }
    renderSidebar();
    nextIntervalQuestion();
    const fb = $('#intervalFeedback');
    if (fb) { fb.className = 'feedback interval-feedback info'; fb.textContent = '\u5DF2\u6362\u65B0\u9898'; }
  }

  /* \u8C03\u8BD5\u6761\u300C\u91CD\u542C\u300D\uFF1A\u64AD\u653E\u5F53\u524D\u9898\u76EE\u7684\u58F0\u97F3\uFF0C\u56DB\u4E2A\u6A21\u5F0F\u5404\u81EA\u53D6\u8BE5\u54CD\u7684\u90A3\u4E2A\u3002
   * \u97F3\u540D / \u627E\u4F4D\u7F6E \u2192 playCurrent()\uFF08\u6CBF\u7528\u539F\u5B9E\u73B0\uFF0C\u542B\u9759\u97F3\u63D0\u793A\uFF09\uFF1B
   * \u548C\u5F26 \u2192 playChordSelection()\uFF08\u7528\u6237\u81EA\u5DF1\u90A3\u516D\u6839\u5F26\uFF0C\u4E0D\u64AD\u53C2\u8003\u6392\u5E03\uFF09\uFF1B
   * \u97F3\u7A0B \u2192 playIntervalStartOnly('manual')\uFF08\u624B\u52A8\u91CD\u542C\u8D77\u70B9\u97F3\uFF0C\u53D7\u300C\u7B54\u9898\u4E2D\u5141\u8BB8\u91CD\u542C\u300D\u7EA6\u675F\uFF09\u3002 */
  function debugReplay() {
    const mode = store.settings.mode || 'note';
    if (mode === 'chord') { playChordSelection(); return; }
    if (mode === 'interval') { playIntervalStartOnly('manual'); return; }
    playCurrent();
  }

  /* \u300C\u6062\u590D\u5F53\u524D\u6A21\u5F0F\u7684\u9ED8\u8BA4\u58F0\u97F3\u8BBE\u7F6E\u300D\uFF1A\u53EA\u91CD\u7F6E\u5F53\u524D\u6A21\u5F0F\u90A3\u4E00\u4EFD\uFF0C\u5176\u5B83\u4E09\u4E2A\u6A21\u5F0F\u4E0D\u52A8\u3002
     \u8D70 setSoundOf \u800C\u4E0D\u662F\u76F4\u63A5\u5199\u5B57\u6BB5\uFF0C\u662F\u4E3A\u4E86\u8BA9\u517C\u5BB9\u955C\u50CF muted/volume \u4E0E UI \u4E00\u8D77\u5237\u65B0\u3002 */
  function resetModeSound(mode) {
    const target = SOUND_FIELDS[mode] ? mode : (SOUND_FIELDS[store.settings.mode] ? store.settings.mode : 'note');
    setSoundOf(target, { muted: false, volume: 70 });
    save();
    if (audio && typeof audio.applyModeGain === 'function') audio.applyModeGain();
    syncSoundUI();
    return target;
  }

  /* ---------------------------------------------------------------
   *  \u5907\u4EFD / \u8FC1\u79FB\uFF1A\u5BFC\u51FA\u4E0E\u5BFC\u5165\u5B66\u4E60\u6570\u636E\uFF08JSON\uFF09
   *  - \u5BFC\u51FA\uFF1A\u6700\u65B0\u7684\u4E00\u8F6E\u7EDF\u8BA1 + \u672C\u8F6E\u6210\u7EE9 + \u5F53\u524D\u8BBE\u7F6E\uFF0C\u53EF\u4F5C\u4E3A\u6362\u8BBE\u5907 / \u6362\u57DF\u540D\u65F6\u7684\u5907\u4EFD
   *  - \u5BFC\u5165\uFF1A\u6821\u9A8C\u540E\u53EF\u9009\u300C\u5408\u5E76\u300D\u6216\u300C\u8986\u76D6\u300D\uFF1B\u5408\u5E76\u65F6\u6BCF\u4E2A\u4F4D\u7F6E\u53D6\u6B21\u6570\u66F4\u591A\u7684\u8BB0\u5F55\uFF0C
   *          \u5386\u53F2\u6309\u300C\u5F26+\u54C1+\u65F6\u95F4+\u5BF9\u9519\u300D\u53BB\u91CD\u540E\u5408\u5E76\uFF0C\u8BBE\u7F6E\u9ED8\u8BA4\u4FDD\u6301\u539F\u6837
   * --------------------------------------------------------------- */
  const BACKUP_FORMAT = 'guitar-fretboard-trainer-backup';
  /* v2\uFF1A\u65B0\u589E chordCards / chordHistory\u3002
     v3\uFF1A\u65B0\u589E intervalCards / intervalHistory\u3002
     \u65E7\u5907\u4EFD\u4ECD\u7136\u53EF\u5BFC\u5165\uFF08\u7F3A\u7684\u5B57\u6BB5\u521D\u59CB\u5316\u4E3A\u7A7A\uFF09\uFF0C\u9AD8\u4E8E\u5F53\u524D\u7684\u7248\u672C\u4E00\u5F8B\u62D2\u7EDD \u2014\u2014
     \u9759\u9ED8\u964D\u7EA7\u4F1A\u8BA9\u7528\u6237\u4EE5\u4E3A\u6570\u636E\u5B8C\u6574\uFF0C\u5B9E\u9645\u4E22\u5B57\u6BB5\u3002 */
  const BACKUP_VERSION = 3;

  function backupTimestamp(d) {
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
  }

  function buildBackup() {
    return {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      app: 'guitar-fretboard-trainer',
      storageKey: STORAGE_KEY,
      settings: JSON.parse(JSON.stringify(store.settings || {})),
      cards: JSON.parse(JSON.stringify(store.cards || {})),
      history: JSON.parse(JSON.stringify(store.history || [])),
      round: { bestStreak: round.bestStreak || 0, results: JSON.parse(JSON.stringify(round.results || [])) },
      /* v2 \u65B0\u589E\uFF1A\u548C\u5F26\u6A21\u5F0F\u72EC\u7ACB\u6570\u636E */
      chordCards: JSON.parse(JSON.stringify(store.chordCards || {})),
      chordHistory: JSON.parse(JSON.stringify(store.chordHistory || [])),
      chordRound: { bestStreak: chordRound.bestStreak || 0 },
      /* v3 \u65B0\u589E\uFF1A\u97F3\u7A0B\u6A21\u5F0F\u72EC\u7ACB\u6570\u636E */
      intervalCards: JSON.parse(JSON.stringify(store.intervalCards || {})),
      intervalHistory: JSON.parse(JSON.stringify(store.intervalHistory || [])),
      intervalRound: { bestStreak: intervalRound.bestStreak || 0 },
      /* v3.1 \u65B0\u589E\uFF1A\u4FA7\u680F\u6570\u636E\u5C42\uFF08schemaVersion \u4E0E localStorage \u540C\u6E90\uFF0C\u5BFC\u5165\u65F6\u636E\u6B64\u5224\u65AD\u80FD\u5426\u56DE\u586B\uFF09 */
      schemaVersion: SCHEMA_VERSION,
      modeStats: JSON.parse(JSON.stringify(store.modeStats || blankModeStats())),
      posUnitStats: JSON.parse(JSON.stringify(store.posUnitStats || {})),
      posBStats: JSON.parse(JSON.stringify(store.posBStats || { done: 0, full: 0, streak: 0, bestCombo: 0, last: null })),
      /* v3.2 \u65B0\u589E\uFF1A\u627E\u4F4D\u7F6E\u81EA\u5DF1\u7684\u5361\u7247\uFF08\u952E\u5F62\u72B6\u540C\u97F3\u540D\uFF0C\u4F46\u72EC\u7ACB\u4E00\u4EFD\uFF0C\u4E92\u4E0D\u5F71\u54CD\u91CD\u7F6E\uFF09 */
      posCards: JSON.parse(JSON.stringify(store.posCards || {})),
    };
  }

  function exportData() {
    const data = buildBackup();
    const text = JSON.stringify(data, null, 2);
    const fileName = 'guitar-fretboard-backup-' + backupTimestamp(new Date()) + '.json';
    const cardCount = Object.keys(data.cards).length;
    const posCardCount = Object.keys(data.posCards || {}).length;
    const chordCount = Object.keys(data.chordCards || {}).length;
    const intervalCount = Object.keys(data.intervalCards || {}).length;
    try {
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1500);
      setDataNote('\u5DF2\u5BFC\u51FA ' + cardCount + ' \u4E2A\u97F3\u540D\u4F4D\u7F6E\u8BB0\u5F55\u3001' + data.history.length + ' \u6761\u7B54\u9898\u5386\u53F2'
        + '\u3001' + posCardCount + ' \u4E2A\u627E\u4F4D\u7F6E\u8BB0\u5F55'
        + '\u3001' + chordCount + ' \u4E2A\u548C\u5F26\u8BB0\u5F55\u3001' + (data.chordHistory || []).length + ' \u6761\u548C\u5F26\u5386\u53F2'
        + '\u3001' + intervalCount + ' \u4E2A\u97F3\u7A0B\u8BB0\u5F55\u3001' + (data.intervalHistory || []).length + ' \u6761\u97F3\u7A0B\u5386\u53F2\uFF08' + fileName + '\uFF09', 'ok');
      return {
        ok: true, fileName: fileName, cards: cardCount, history: data.history.length,
        posCards: posCardCount,
        chordCards: chordCount, chordHistory: (data.chordHistory || []).length,
        intervalCards: intervalCount, intervalHistory: (data.intervalHistory || []).length,
      };
    } catch (e) {
      setDataNote('\u5BFC\u51FA\u5931\u8D25\uFF1A' + (e && e.message ? e.message : String(e)) + '\u3002\u53EF\u76F4\u63A5\u590D\u5236\u4E0B\u9762\u6587\u672C\u6846\u91CC\u7684\u5185\u5BB9\u624B\u52A8\u4FDD\u5B58\u3002', 'err');
      return { ok: false, reason: e && e.message ? e.message : String(e), fallbackText: text };
    }
  }

  /* \u6821\u9A8C\u5E76\u6E05\u6D17\u5BFC\u5165\u7684\u6570\u636E\uFF1B\u8FD4\u56DE { ok, data } \u6216 { ok:false, reason } */
  function parseBackup(text) {
    let raw;
    try { raw = JSON.parse(String(text || '').replace(/^\uFEFF/, '')); }
    catch (e) { return { ok: false, reason: '\u4E0D\u662F\u6709\u6548\u7684 JSON\uFF1A' + (e.message || e) }; }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, reason: '\u6587\u4EF6\u5185\u5BB9\u4E0D\u662F\u4E00\u4E2A\u5907\u4EFD\u5BF9\u8C61' };
    if (raw.format && raw.format !== BACKUP_FORMAT) return { ok: false, reason: '\u4E0D\u662F\u672C\u7A0B\u5E8F\u7684\u5907\u4EFD\u6587\u4EF6\uFF08format=' + raw.format + '\uFF09' };
    /* \u7248\u672C\u95F8\u95E8\uFF1A\u9AD8\u4E8E\u5F53\u524D\u652F\u6301\u7684\u4E00\u5F8B\u62D2\u7EDD\uFF0C\u4E0D\u505A\u300C\u5C3D\u529B\u89E3\u6790\u300D */
    const ver = raw.version === undefined ? 1 : Number(raw.version);
    if (isFinite(ver) && ver > BACKUP_VERSION) {
      return { ok: false, reason: '\u5907\u4EFD\u7248\u672C ' + ver + ' \u9AD8\u4E8E\u5F53\u524D\u652F\u6301\u7684 ' + BACKUP_VERSION + '\uFF0C\u8BF7\u5347\u7EA7\u7A0B\u5E8F\u540E\u518D\u5BFC\u5165' };
    }
    if (!raw.cards && !raw.history && !raw.settings && !raw.round
      && !raw.chordCards && !raw.chordHistory
      && !raw.intervalCards && !raw.intervalHistory) {
      return { ok: false, reason: '\u5907\u4EFD\u91CC\u6CA1\u6709\u53EF\u7528\u7684\u6570\u636E\uFF08cards / history / settings / chord / interval \u90FD\u4E3A\u7A7A\uFF09' };
    }

    const cards = {};
    let cardCount = 0;
    if (raw.cards && typeof raw.cards === 'object' && !Array.isArray(raw.cards)) {
      Object.keys(raw.cards).forEach((k) => {
        const m = /^s([1-6])f(\d{1,2})$/.exec(k);
        const c = raw.cards[k];
        if (!m || !c || typeof c !== 'object') return;
        const f = Number(m[2]);
        if (f > 24) return;
        const num = (v) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : 0);
        cards[k] = {
          s: Number(m[1]), f: f,
          lvl: clamp(num(c.lvl), 0, SRS_INTERVALS.length),
          due: num(c.due), last: num(c.last),
          a: num(c.a), e: num(c.e), cn: num(c.cn),
          best: clamp(num(c.best), 0, SRS_INTERVALS.length),
          recent: Array.isArray(c.recent) ? c.recent.slice(-RECENT_WINDOW).map((x) => !!x) : [],
        };
        cardCount++;
      });
    }

    const history = [];
    if (Array.isArray(raw.history)) {
      raw.history.forEach((h) => {
        if (!h || typeof h !== 'object') return;
        const s = Number(h.s);
        const f = Number(h.f);
        if (!(s >= 1 && s <= 6) || !(f >= 0 && f <= 24)) return;
        const item = { s: s, f: f, ok: !!h.ok, t: typeof h.t === 'number' ? h.t : 0, ms: typeof h.ms === 'number' ? h.ms : null, lvl: Number(h.lvl) || 0 };
        if (h.skipped) item.skipped = true;
        /* \u5F52\u5C5E\uFF1A\u7F3A\u7701\u6309\u97F3\u540D\u7B97\uFF08\u8001\u5907\u4EFD\u6CA1\u6709\u8FD9\u4E2A\u5B57\u6BB5\uFF09\uFF0C\u6709\u4E86\u5B83\u7EDF\u8BA1\u5F39\u7A97\u624D\u80FD\u5206\u6A21\u5F0F\u7B5B */
        item.m = h.m === 'pos' ? 'pos' : 'note';
        history.push(item);
      });
    }

    /* \u2014\u2014 \u627E\u4F4D\u7F6E\u81EA\u5DF1\u7684\u5361\u7247\uFF08v3.2\uFF09\u2014\u2014
       \u548C cards \u5F62\u72B6\u4E00\u6837\u3001\u6E05\u6D17\u89C4\u5219\u4E00\u6837\uFF0C\u4F46\u5B58\u5728\u53E6\u4E00\u4E2A\u5B57\u6BB5\u91CC\u3002\u8001\u5907\u4EFD\u6CA1\u6709\u5B83 \u2192 \u7A7A\u5BF9\u8C61\u3002 */
    const posCards = {};
    let posCardCount = 0;
    if (raw.posCards && typeof raw.posCards === 'object' && !Array.isArray(raw.posCards)) {
      Object.keys(raw.posCards).forEach((k) => {
        const m = /^s([1-6])f(\d{1,2})$/.exec(k);
        const c = raw.posCards[k];
        if (!m || !c || typeof c !== 'object') return;
        const f = Number(m[2]);
        if (f > 24) return;
        const num = (v) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : 0);
        posCards[k] = {
          s: Number(m[1]), f: f,
          lvl: clamp(num(c.lvl), 0, SRS_INTERVALS.length),
          due: num(c.due), last: num(c.last),
          a: num(c.a), e: num(c.e), cn: num(c.cn),
          best: clamp(num(c.best), 0, SRS_INTERVALS.length),
          recent: Array.isArray(c.recent) ? c.recent.slice(-RECENT_WINDOW).map((x) => !!x) : [],
        };
        posCardCount++;
      });
    }

    /* \u2014\u2014 \u548C\u5F26\u6570\u636E\uFF08v2\uFF09\u2014\u2014
       v1 \u6587\u4EF6\u6CA1\u6709\u8FD9\u4E24\u4E2A\u5B57\u6BB5 \u2192 \u521D\u59CB\u5316\u4E3A\u7A7A\u7ED3\u6784\uFF0C\u5355\u97F3\u6570\u636E\u5B8C\u6574\u4FDD\u7559\u3002 */
    const chordCards = {};
    let chordCardCount = 0;
    if (raw.chordCards && typeof raw.chordCards === 'object' && !Array.isArray(raw.chordCards)) {
      Object.keys(raw.chordCards).forEach((k) => {
        const parsed = parseChordKey(k);
        const c = raw.chordCards[k];
        if (!parsed || !validQuality(parsed.quality) || !c || typeof c !== 'object') return;
        const num = (v) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : 0);
        chordCards[k] = {
          root: parsed.root, quality: parsed.quality,
          seen: num(c.seen), lvl: clamp(num(c.lvl), 0, SRS_INTERVALS.length),
          due: num(c.due), last: num(c.last),
          a: num(c.a), e: num(c.e), cn: num(c.cn),
          best: clamp(num(c.best), 0, SRS_INTERVALS.length),
          recent: Array.isArray(c.recent) ? c.recent.slice(-RECENT_WINDOW).map((x) => !!x) : [],
        };
        chordCardCount++;
      });
    }

    const chordHistory = [];
    if (Array.isArray(raw.chordHistory)) {
      raw.chordHistory.forEach((r) => {
        if (!r || typeof r !== 'object') return;
        if (r.dir !== 'n2f' && r.dir !== 'f2n') return;
        const root = Number(r.root);
        if (!(root >= 0 && root <= 11)) return;
        if (!validQuality(r.quality)) return;
        /* \u5224\u5206\u5BBD\u5EA6\u5DF2\u5E9F\u5F03\uFF08\u7B56\u5212\u4E66 \u00A76\uFF1A\u5224\u5206\u4E00\u5F8B\u300C\u9010\u5F26\u5168\u7B49\u9898\u5E93\u90A3\u4E00\u6761\u300D\uFF09\u3002
           \u65E7\u5907\u4EFD\u91CC\u53EF\u80FD\u8FD8\u5E26 strict/standard/loose\uFF0C\u4FDD\u7559\u517C\u5BB9\uFF1B\u6CA1\u6709\u4E5F\u5408\u6CD5\u3002 */
        if (r.width != null && r.width !== 'strict' && r.width !== 'standard' && r.width !== 'loose') return;
        /* \u4E92\u65A5\u7EA6\u675F\uFF1A\u8DF3\u8FC7\u72B6\u6001\u4E0E ok \u7684\u4E09\u6001\u5FC5\u987B\u81EA\u6D3D */
        const isSkip = r.skipped === true || r.ambigSkipped === true;
        if (r.ok === null && !isSkip) return;
        if (r.ok !== null && r.ok !== true && r.ok !== false) return;
        if (r.ok !== null && isSkip) return;
        if (r.skipped === true && r.ambigSkipped === true) return;
        if (r.timedOut === true && r.ok === null) return;
        const T = chordTheory();
        const arrangement = (typeof r.arrangement === 'string' && T && T.parseArrangement(r.arrangement))
          ? r.arrangement : '';
        const item = {
          dir: r.dir, root: root, quality: r.quality,
          arrangement: arrangement,
          width: r.width,
          ok: r.ok === null ? null : !!r.ok,
          errors: Array.isArray(r.errors) ? r.errors.filter((x) => typeof x === 'string').slice(0, 8) : [],
          t: typeof r.t === 'number' ? r.t : 0,
          ms: (typeof r.ms === 'number' && isFinite(r.ms)) ? r.ms : null,
          refV: Number(r.refV) || 1,
        };
        if (r.skipped === true) item.skipped = true;
        if (r.ambigSkipped === true) item.ambigSkipped = true;
        if (r.timedOut === true) item.timedOut = true;
        chordHistory.push(item);
      });
    }

    let roundData = null;
    if (raw.round && typeof raw.round === 'object') {
      roundData = {
        bestStreak: clamp(Number(raw.round.bestStreak) || 0, 0, 1e6),
        results: Array.isArray(raw.round.results) ? raw.round.results.filter((r) => r && typeof r === 'object') : [],
      };
    }

    /* \u2014\u2014 \u97F3\u7A0B\u6570\u636E\uFF08v3\uFF09\u2014\u2014
       v1/v2 \u6587\u4EF6\u6CA1\u6709\u8FD9\u4E24\u4E2A\u5B57\u6BB5 \u2192 \u521D\u59CB\u5316\u4E3A\u7A7A\u7ED3\u6784\uFF0C\u65E7\u6570\u636E\u5B8C\u6574\u4FDD\u7559\u3002 */
    const intervalCards = {};
    let intervalCardCount = 0;
    if (raw.intervalCards && typeof raw.intervalCards === 'object' && !Array.isArray(raw.intervalCards)) {
      const T = intervalTheory();
      Object.keys(raw.intervalCards).forEach((k) => {
        const m = INTERVAL_KEY_RE.exec(k);
        const c = raw.intervalCards[k];
        if (!m || !c || typeof c !== 'object') return;
        if (T && !T.intervalById(m[2])) return;
        const num = (v) => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : 0);
        intervalCards[k] = {
          lvl: clamp(num(c.lvl), 0, SRS_INTERVALS.length),
          due: num(c.due), last: num(c.last),
          a: num(c.a), e: num(c.e), cn: num(c.cn),
          best: clamp(num(c.best), 0, SRS_INTERVALS.length),
          recent: Array.isArray(c.recent) ? c.recent.slice(-RECENT_WINDOW).map((x) => !!x) : [],
        };
        intervalCardCount++;
      });
    }

    const intervalHistory = [];
    if (Array.isArray(raw.intervalHistory)) {
      const T = intervalTheory();
      raw.intervalHistory.forEach((r) => {
        if (!r || typeof r !== 'object') return;
        if (r.play !== 'a' && r.play !== 'b') return;
        if (T && !T.intervalById(r.interval)) return;
        if (r.dir !== 'up' && r.dir !== 'down' && r.dir !== 'none') return;
        if (r.mode !== 'exact' && r.mode !== 'equiv') return;
        if (r.ok !== true && r.ok !== false && r.ok !== null) return;
        const cell = (v) => (Array.isArray(v) && v.length === 2
          && Number(v[0]) >= 1 && Number(v[0]) <= 6
          && Number(v[1]) >= 0 && Number(v[1]) <= 24) ? [Number(v[0]), Number(v[1])] : null;
        intervalHistory.push({
          play: r.play,
          interval: r.interval,
          dir: r.dir,
          mode: r.mode,
          shape: typeof r.shape === 'string' ? r.shape : null,
          ok: r.ok === null ? null : !!r.ok,
          error: typeof r.error === 'string' ? r.error : null,
          ms: (typeof r.ms === 'number' && isFinite(r.ms)) ? r.ms : null,
          timedOut: r.timedOut === true,
          t: typeof r.t === 'number' ? r.t : 0,
          cellA: cell(r.cellA), cellB: cell(r.cellB), start: cell(r.start), pick: cell(r.pick),
          chosen: Array.isArray(r.chosen) && r.chosen.length === 2
            ? [String(r.chosen[0]), String(r.chosen[1])] : null,
        });
      });
    }

    return {
      ok: true,
      data: {
        settings: raw.settings && typeof raw.settings === 'object' && !Array.isArray(raw.settings) ? raw.settings : null,
        cards: cards,
        history: history,
        round: roundData,
        chordCards: chordCards,
        chordHistory: chordHistory.slice(-CHORD_HISTORY_LIMIT),
        intervalCards: intervalCards,
        intervalHistory: intervalHistory.slice(-INTERVAL_HISTORY_LIMIT),
        /* v3.1\uFF1A\u4FA7\u680F\u6570\u636E\u5C42\u3002\u7F3A schemaVersion = \u65E7\u5907\u4EFD\uFF081\uFF09\uFF0C\u5BFC\u5165\u65F6\u53EA\u56DE\u586B\u8BBE\u7F6E\u3001
           \u5B66\u4E60\u6570\u636E\u4E00\u5F8B\u6E05\u7A7A\uFF08\u00A73.6\uFF09\u3002 */
        schemaVersion: Number.isFinite(Number(raw.schemaVersion)) ? Number(raw.schemaVersion) : 1,
        modeStats: normalizeModeStats(raw.modeStats),
        posUnitStats: normalizePosUnitStats(raw.posUnitStats),
        posBStats: normalizePosBStats(raw.posBStats),
        posCards: posCards,
      },
      summary: {
        cards: cardCount, history: history.length,
        chordCards: chordCardCount, chordHistory: chordHistory.length,
        intervalCards: intervalCardCount, intervalHistory: intervalHistory.length,
        posCards: posCardCount,
        version: ver, exportedAt: raw.exportedAt || '',
      },
    };
  }

  /* \u5408\u5E76\u4E24\u4EFD\u4F4D\u7F6E\u8BB0\u5F55\uFF1A\u6B21\u6570\u53D6\u591A\u7684\u4E00\u65B9\uFF0C\u5230\u671F\u65F6\u95F4\u53D6\u66F4\u665A\u7684\uFF0C\u8FDB\u5EA6\u53D6\u66F4\u9AD8\u7EA7 */
  function mergeCard(oldC, newC) {
    const pick = (a, b) => (b.a + b.e > a.a + a.e ? b : a);
    const base = pick(oldC, newC);
    const out = {
      /* \u26A0 \u4E0D\u80FD\u7528 `newC.f || oldC.f`\uFF1A0 \u54C1\uFF08\u7A7A\u5F26\uFF09\u662F\u5408\u6CD5\u503C\uFF0C`0 || x` \u4F1A\u628A\u54C1\u6570\u5403\u6389\u3002
         \u53EA\u5728\u8FD9\u8FB9\u300C\u4E0D\u662F\u6709\u9650\u6570\u5B57\u300D\u65F6\u624D\u56DE\u9000\u5230\u53E6\u4E00\u65B9\u3002 */
      s: Number.isFinite(newC.s) ? newC.s : oldC.s,
      f: Number.isFinite(newC.f) ? newC.f : oldC.f,
      lvl: Math.max(oldC.lvl || 0, newC.lvl || 0),
      due: Math.max(oldC.due || 0, newC.due || 0),
      last: Math.max(oldC.last || 0, newC.last || 0),
      a: Math.max(oldC.a || 0, newC.a || 0),
      e: Math.max(oldC.e || 0, newC.e || 0),
      cn: base.cn || 0,
      best: Math.max(oldC.best || 0, newC.best || 0),
      recent: (Array.isArray(base.recent) ? base.recent : []).slice(-RECENT_WINDOW),
    };
    return out;
  }

  function historyKey(h) { return h.s + '|' + h.f + '|' + h.t + '|' + (h.ok ? 1 : 0); }

  /** \u5408\u5E76\u4E24\u5F20\u548C\u5F26\u5361\u7247\uFF1A\u6B21\u6570\u53D6\u591A\u7684\u4E00\u65B9\uFF0C\u5230\u671F\u53D6\u66F4\u665A\uFF0C\u8FDB\u5EA6\u53D6\u66F4\u9AD8\u7EA7\uFF0Cseen \u53D6\u66F4\u65E9\u7684\uFF08\u9996\u6B21\u89C1\u5230\u7684\u65F6\u95F4\uFF09 */
  function mergeChordCard(oldC, newC) {
    const pick = (a, b) => (b.a + b.e > a.a + a.e ? b : a);
    const base = pick(oldC, newC);
    const seenOld = oldC.seen || 0;
    const seenNew = newC.seen || 0;
    /* seen = \u9996\u6B21\u771F\u6B63\u8FDB\u5165\u6709\u6548\u7EC3\u4E60\u7684\u65F6\u95F4\uFF1A\u4E24\u8FB9\u90FD\u6709\u5C31\u53D6\u66F4\u65E9\u7684 */
    let seen = 0;
    if (seenOld && seenNew) seen = Math.min(seenOld, seenNew);
    else seen = seenOld || seenNew;
    return {
      root: newC.root != null ? newC.root : oldC.root,
      quality: newC.quality || oldC.quality,
      seen: seen,
      lvl: Math.max(oldC.lvl || 0, newC.lvl || 0),
      due: Math.max(oldC.due || 0, newC.due || 0),
      last: Math.max(oldC.last || 0, newC.last || 0),
      a: Math.max(oldC.a || 0, newC.a || 0),
      e: Math.max(oldC.e || 0, newC.e || 0),
      cn: base.cn || 0,
      best: Math.max(oldC.best || 0, newC.best || 0),
      recent: (Array.isArray(base.recent) ? base.recent : []).slice(-RECENT_WINDOW),
    };
  }

  function chordHistoryKey(r) {
    return r.dir + '|' + r.root + '|' + r.quality + '|' + r.t + '|' + String(r.ok) + '|' + (r.arrangement || '');
  }

  /** \u5408\u5E76\u4E24\u5F20\u97F3\u7A0B\u5361\u7247\uFF1A\u4E0E mergeChordCard \u540C\u4E00\u5957\u89C4\u5219 */
  function mergeIntervalCard(oldC, newC) {
    const pick = (a, b) => (b.a + b.e > a.a + a.e ? b : a);
    const base = pick(oldC, newC);
    return {
      lvl: Math.max(oldC.lvl || 0, newC.lvl || 0),
      due: Math.max(oldC.due || 0, newC.due || 0),
      last: Math.max(oldC.last || 0, newC.last || 0),
      a: Math.max(oldC.a || 0, newC.a || 0),
      e: Math.max(oldC.e || 0, newC.e || 0),
      cn: base.cn || 0,
      best: Math.max(oldC.best || 0, newC.best || 0),
      recent: (Array.isArray(base.recent) ? base.recent : []).slice(-RECENT_WINDOW),
    };
  }

  function intervalHistoryKey(r) {
    return r.play + '|' + r.interval + '|' + r.dir + '|' + r.mode + '|' + r.t
      + '|' + String(r.ok) + '|' + (r.shape || '');
  }

  /**
   * \u5BFC\u5165\u3002\u5168\u7A0B\u5148\u5728\u4E34\u65F6\u5BF9\u8C61\u91CC\u5B8C\u6210\u6821\u9A8C\u4E0E\u5408\u5E76\uFF0C\u5168\u90E8\u901A\u8FC7\u624D\u6574\u4F53\u66FF\u6362 store \u2014\u2014
   * \u4EFB\u4F55\u4E00\u6B65\u629B\u9519\u90FD\u4FDD\u6301\u539F\u6570\u636E\u4E0D\u52A8\uFF0C\u7EDD\u4E0D\u51FA\u73B0\u300C\u4E00\u534A\u6210\u529F\u300D\u3002
   */
  function applyImport(parsed, opts) {
    const mode = (opts && opts.mode) === 'replace' ? 'replace' : 'merge';
    const withSettings = !!(opts && opts.settings);
    const data = parsed.data;
    /* \u65E7\u5907\u4EFD\uFF08schemaVersion < 2\uFF09\u91CC\u7684\u5B66\u4E60\u6570\u636E\u53E3\u5F84\u5DF2\u7ECF\u4F5C\u5E9F\uFF08\u00A73.6\uFF09\uFF1A\u53EA\u5BFC\u8BBE\u7F6E\uFF0C\u5176\u4F59\u6E05\u7A7A */
    const legacyBackup = !(Number(data.schemaVersion) >= SCHEMA_VERSION);

    /* \u2014\u2014 \u9636\u6BB5\u4E00\uFF1A\u5728\u4E34\u65F6\u5BF9\u8C61\u91CC\u7B97\u597D\u6240\u6709\u7ED3\u679C\uFF08\u4E0D\u78B0 store\uFF09\u2014\u2014 */
    let nextCards;
    let nextHistory;
    let nextChordCards;
    let nextChordHistory;
    let nextIntervalCards;
    let nextIntervalHistory;
    let nextPosCards;

    if (mode === 'replace') {
      nextCards = data.cards;
      nextHistory = data.history.slice(-300);
      nextChordCards = data.chordCards || {};
      nextChordHistory = (data.chordHistory || []).slice(-CHORD_HISTORY_LIMIT);
      nextIntervalCards = data.intervalCards || {};
      nextIntervalHistory = (data.intervalHistory || []).slice(-INTERVAL_HISTORY_LIMIT);
      nextPosCards = data.posCards || {};
    } else {
      nextCards = Object.assign({}, store.cards);
      Object.keys(data.cards).forEach((k) => {
        nextCards[k] = nextCards[k] ? mergeCard(nextCards[k], data.cards[k]) : data.cards[k];
      });

      const seen = new Set(store.history.map(historyKey));
      const added = [];
      data.history.forEach((h) => {
        const key = historyKey(h);
        if (seen.has(key)) return;
        seen.add(key);
        added.push(h);
      });
      nextHistory = store.history.concat(added)
        .sort((x, y) => (x.t || 0) - (y.t || 0))
        .slice(-300);

      nextChordCards = Object.assign({}, store.chordCards || {});
      Object.keys(data.chordCards || {}).forEach((k) => {
        const incoming = data.chordCards[k];
        const existing = nextChordCards[k];
        nextChordCards[k] = existing ? mergeChordCard(existing, incoming) : incoming;
      });

      const cseen = new Set((store.chordHistory || []).map(chordHistoryKey));
      const cadded = [];
      (data.chordHistory || []).forEach((r) => {
        const key = chordHistoryKey(r);
        if (cseen.has(key)) return;
        cseen.add(key);
        cadded.push(r);
      });
      nextChordHistory = (store.chordHistory || []).concat(cadded)
        .sort((x, y) => (x.t || 0) - (y.t || 0))
        .slice(-CHORD_HISTORY_LIMIT);

      /* \u97F3\u7A0B\u6570\u636E\uFF1A\u4E0E\u548C\u5F26\u540C\u4E00\u5957\u5408\u5E76\u601D\u8DEF */
      nextIntervalCards = Object.assign({}, store.intervalCards || {});
      Object.keys(data.intervalCards || {}).forEach((k) => {
        const incoming = data.intervalCards[k];
        const existing = nextIntervalCards[k];
        nextIntervalCards[k] = existing ? mergeIntervalCard(existing, incoming) : incoming;
      });

      const iseen = new Set((store.intervalHistory || []).map(intervalHistoryKey));
      const iadded = [];
      (data.intervalHistory || []).forEach((r) => {
        const key = intervalHistoryKey(r);
        if (iseen.has(key)) return;
        iseen.add(key);
        iadded.push(r);
      });
      nextIntervalHistory = (store.intervalHistory || []).concat(iadded)
        .sort((x, y) => (x.t || 0) - (y.t || 0))
        .slice(-INTERVAL_HISTORY_LIMIT);

      /* \u627E\u4F4D\u7F6E\u5361\u7247\uFF1A\u548C\u97F3\u540D\u5361\u7247\u540C\u4E00\u5957\u5408\u5E76\u89C4\u5219\uFF0C\u53EA\u662F\u5B58\u5728\u53E6\u4E00\u4E2A map \u91CC */
      nextPosCards = Object.assign({}, store.posCards || {});
      Object.keys(data.posCards || {}).forEach((k) => {
        const incoming = data.posCards[k];
        const existing = nextPosCards[k];
        nextPosCards[k] = existing ? mergeCard(existing, incoming) : incoming;
      });
    }

    /* \u8BBE\u7F6E\uFF1A\u5148\u7B97\u597D\uFF0C\u4E0D\u76F4\u63A5\u5199 store */
    let nextSettings = null;
    if (withSettings && data.settings) {
      nextSettings = Object.assign({}, DEFAULT_SETTINGS, data.settings);
      const rawHasNote = data.settings && typeof data.settings.noteRange === 'string';
      const rawHasPos = data.settings && typeof data.settings.posRange === 'string';
      /* \u8FC1\u79FB\uFF1A\u65E7\u5907\u4EFD\u53EA\u6709\u517C\u5BB9\u5B57\u6BB5 range\uFF0C\u6CA1\u6709\u6309\u6A21\u5F0F\u62C6\u5F00\u7684 noteRange / posRange\u3002
         \u4E0E load() \u91CC\u7684\u8FC1\u79FB\u4FDD\u6301\u4E00\u81F4 \u2014\u2014 \u5426\u5219\u5BFC\u5165\u540E\u8BBE\u7F6E\u9762\u677F\u4F1A\u663E\u793A\u6210\u9ED8\u8BA4\u503C\uFF0C
         \u800C store.settings.range \u53C8\u662F\u65B0\u503C\uFF0C\u4E24\u8005\u4E92\u76F8\u77DB\u76FE\u3002
         \u82E5\u5907\u4EFD\u540C\u65F6\u5E26\u4E86\u4E24\u8005\uFF08\u65B0\u7248\u5907\u4EFD\uFF09\uFF0C\u4EE5 range \u4E3A\u51C6\u540C\u6B65\u5230\u5F53\u524D\u6A21\u5F0F\u7684\u5B57\u6BB5\uFF1A
         range \u662F\u300C\u7528\u6237\u5728\u9762\u677F\u4E0A\u770B\u5230\u7684\u90A3\u4E2A\u8303\u56F4\u300D\uFF0C\u5B83\u662F\u6743\u5A01\u503C\u3002 */
      if (typeof nextSettings.range === 'string' && /^\d+-\d+$/.test(nextSettings.range)) {
        const curMode = nextSettings.mode === 'pos' ? 'pos' : 'note';
        const key = curMode === 'pos' ? 'posRange' : 'noteRange';
        if (!data.settings || typeof data.settings[key] !== 'string'
          || data.settings[key] !== nextSettings.range) {
          nextSettings[key] = nextSettings.range;
        }
        if (!rawHasNote && !rawHasPos) {
          nextSettings.noteRange = nextSettings.range;
          nextSettings.posRange = nextSettings.range;
        }
      }
      if (!nextSettings.accSel) nextSettings.accSel = accSelFromMode(nextSettings.accidentalMode || 'both');
      /* \u97F3\u7A0B\u81EA\u5DF1\u7684\u5347\u964D\u8C03\u5F00\u5173\uFF1A\u65E7\u5907\u4EFD\u6CA1\u6709\u8FD9\u4E2A\u5B57\u6BB5 \u2192 \u9ED8\u8BA4\u4E09\u9879\u5168\u5F00\uFF08\u4E0E\u5347\u7EA7\u524D\u884C\u4E3A\u4E00\u81F4\uFF09 */
      nextSettings.intervalAccSel = normalizeAccSel(nextSettings.intervalAccSel);
      if (!Array.isArray(nextSettings.strings) || !nextSettings.strings.length) {
        nextSettings.strings = DEFAULT_SETTINGS.strings.slice();
      }
      /* \u58F0\u97F3\uFF1A\u65E7\u5907\u4EFD\u53EA\u6709\u5168\u5C40 muted / volume\uFF0C\u6309\u300C\u5907\u4EFD\u91CC\u90A3\u4E2A\u6A21\u5F0F\u300D\u8FC1\u79FB\u5230\u65B0\u6A21\u5F0F\u5B57\u6BB5\uFF0C
         \u7136\u540E\u7EDF\u4E00\u6E05\u6D17\u3002\u4E0E load() \u5171\u7528 migrateModeSound / cleanSoundFields \u540C\u4E00\u4EFD\u903B\u8F91\uFF1B
         \u8FD9\u91CC\u4F20 nextSettings \u800C\u4E0D\u662F store.settings \u2014\u2014 \u6821\u9A8C\u9636\u6BB5\u4E0D\u8BB8\u52A8\u771F\u5B9E\u72B6\u6001\u3002 */
      migrateModeSound(data.settings || {}, nextSettings);
      nextSettings.muted = nextSettings.mode === 'pos' ? nextSettings.posMuted
        : nextSettings.mode === 'chord' ? nextSettings.chordMuted
          : nextSettings.mode === 'interval' ? nextSettings.intervalMuted
            : nextSettings.noteMuted;
      nextSettings.volume = nextSettings.mode === 'pos' ? nextSettings.posVolume
        : nextSettings.mode === 'chord' ? nextSettings.chordVolume
          : nextSettings.mode === 'interval' ? nextSettings.intervalVolume
            : nextSettings.noteVolume;
      /* \u548C\u5F26\u5B57\u6BB5\u4E5F\u8981\u8FC7\u4E00\u904D\u6E05\u6D17\uFF0C\u907F\u514D\u5907\u4EFD\u91CC\u5E26\u8FDB\u975E\u6CD5\u503C\uFF08'inf' = \u4E0D\u9650\u65F6\uFF0C\u5FC5\u987B\u539F\u6837\u4FDD\u7559\uFF09 */
      if (nextSettings.chordTime && typeof nextSettings.chordTime === 'object') {
        nextSettings.chordTime = {
          n2f: chordTimeOf(nextSettings, 'n2f'),
          f2n: chordTimeOf(nextSettings, 'f2n'),
        };
      } else {
        nextSettings.chordTime = { n2f: 20, f2n: 12 };
      }
      if (!Array.isArray(nextSettings.chordRoots)) nextSettings.chordRoots = DEFAULT_SETTINGS.chordRoots.slice();
      if (!Array.isArray(nextSettings.chordQualities)) nextSettings.chordQualities = DEFAULT_SETTINGS.chordQualities.slice();
      /* \u9636\u6BB5\u56DB\u7684\u97F3\u9891\u8BBE\u7F6E\u540C\u6837\u6E05\u6D17\uFF1A\u65E7\u5907\u4EFD\u91CC\u6CA1\u6709\u8FD9\u4E9B\u5B57\u6BB5\uFF08Object.assign \u5DF2\u8865\u9ED8\u8BA4\uFF09\uFF0C
         \u6709\u4F46\u503C\u4E0D\u8BA4\u8BC6\u7684\u8981\u5F52\u4E00\uFF0C\u4E0D\u80FD\u628A\u810F\u503C\u5E26\u8FDB\u64AD\u653E\u8C03\u5EA6\u3002 */
      if (['strum', 'strumUp', 'block'].indexOf(nextSettings.chordStrum) < 0) {
        nextSettings.chordStrum = 'strum';
      }
      if (['wrongOnly', 'always', 'off'].indexOf(nextSettings.chordRevealPlay) < 0) {
        nextSettings.chordRevealPlay = 'wrongOnly';
      }
      if (typeof nextSettings.chordListenDuringAnswer !== 'boolean') {
        nextSettings.chordListenDuringAnswer = true;
      }
      if (typeof nextSettings.chordClickSound !== 'boolean') {
        nextSettings.chordClickSound = true;
      }
      if (typeof nextSettings.chordAListenAnswer !== 'boolean') {
        nextSettings.chordAListenAnswer = true;
      }
      /* \u5206\u6A21\u5F0F\u5B57\u6BB5\u7684\u6E05\u6D17\uFF08Q4\uFF09\uFF1A\u65E9\u671F\u7248\u672C\u6CA1\u6709\u8FD9\u4E9B\u952E\uFF0CObject.assign \u5DF2\u8865\u9ED8\u8BA4\u503C\uFF0C
         \u4F46\u5907\u4EFD\u91CC\u53EF\u80FD\u5E26\u7740\u810F\u503C\uFF0C\u8FDB\u64AD\u653E/\u51FA\u9898\u94FE\u8DEF\u524D\u5FC5\u987B\u5148\u5F52\u4E00\u3002 */
      if (['a', 'b'].indexOf(nextSettings.intervalTimeTarget) < 0) nextSettings.intervalTimeTarget = 'a';
      nextSettings.intervalTimeA = intervalTimeOf(nextSettings.intervalTimeA, 10);
      nextSettings.intervalTimeB = intervalTimeOf(nextSettings.intervalTimeB, 15);
      nextSettings.intervalTimeTarget = nextSettings.intervalTimeTarget === 'b' ? 'b' : 'a';
      nextSettings.chordAccidental = nextSettings.chordAccidental === 'flat' ? 'flat' : 'sharp';
      nextSettings.intervalAccidental = nextSettings.intervalAccidental === 'flat' ? 'flat' : 'sharp';
      ['posStartMode', 'chordStartMode', 'startMode', 'intervalStartMode'].forEach((k) => {
        nextSettings[k] = nextSettings[k] === 'auto' ? 'auto' : 'manual';
      });
      nextSettings.chordAutoStartOnNext = nextSettings.chordAutoStartOnNext !== false;
      nextSettings.chordAutoNextOnCorrect = nextSettings.chordAutoNextOnCorrect === true;
    }

    /* \u2014\u2014 \u9636\u6BB5\u4E8C\uFF1A\u5168\u90E8\u6821\u9A8C\u901A\u8FC7\uFF0C\u4E00\u6B21\u6027\u66FF\u6362 \u2014\u2014 */
    if (legacyBackup) {
      /* \u65E7\u5907\u4EFD\uFF1A\u5B66\u4E60\u6570\u636E\u5168\u90E8\u4F5C\u5E9F\uFF08\u00A73.6\uFF09\uFF0C\u53EA\u4FDD\u7559\u8BBE\u7F6E */
      wipeLearningData();
    } else {
      store.cards = nextCards;
      store.history = nextHistory;
      store.chordCards = nextChordCards;
      store.chordHistory = nextChordHistory;
      store.intervalCards = nextIntervalCards;
      store.intervalHistory = nextIntervalHistory;
      store.posCards = nextPosCards;
      store.modeStats = normalizeModeStats(data.modeStats);
      store.posUnitStats = normalizePosUnitStats(data.posUnitStats);
      store.posBStats = normalizePosBStats(data.posBStats);
    }
    if (nextSettings) store.settings = nextSettings;

    if (data.round) {
      round.bestStreak = Math.max(round.bestStreak || 0, data.round.bestStreak || 0);
      if (data.round.results && data.round.results.length) round.results = data.round.results.slice(-200);
    }

    round.lastKey = null;
    chordRound.lastKey = null;
    chordPoolCache = { key: '', list: [] };
    intervalAPoolCache = { key: '', list: [] };
    intervalBPoolCache = { key: '', list: [] };
    flushSave();
    repairCards();
    /* \u5BFC\u5165\u540E\u628A\u8F93\u51FA\u589E\u76CA\u6362\u6210\u300C\u65B0\u5B58\u6863\u5F53\u524D\u6A21\u5F0F\u300D\u7684\u58F0\u97F3\u8BBE\u7F6E */
    if (audio && typeof audio.applyModeGain === 'function') audio.applyModeGain();
    syncSettingsUI();
    applySettingsScope();
    renderSidebar();
    renderFretboard();
    renderChordFretboard();
    renderIntervalFretboard();
    return {
      cards: Object.keys(store.cards).length,
      posCards: Object.keys(store.posCards).length,
      history: store.history.length,
      chordCards: Object.keys(store.chordCards).length,
      chordHistory: store.chordHistory.length,
      intervalCards: Object.keys(store.intervalCards).length,
      intervalHistory: store.intervalHistory.length,
      mode: mode,
      settings: withSettings,
    };
  }

  /* \u5BFC\u5165\u7ED3\u679C\u63D0\u793A\uFF08\u5728\u300C\u6570\u636E\u4E0E\u91CD\u7F6E\u300D\u91CC\u663E\u793A\u4E00\u884C\u72B6\u6001\uFF09 */
  function setDataNote(text, cls) {
    const el = $('#dataNote');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'data-note' + (cls ? ' ' + cls : '');
  }

  /* \u4F9B\u8C03\u8BD5/\u6D4B\u8BD5\u4F7F\u7528\uFF1A\u4E0D\u7ECF\u8FC7 <input type=file>\uFF0C\u76F4\u63A5\u5BFC\u5165\u4E00\u6BB5 JSON \u6587\u672C */
  function importDataText(text, opts) {
    const parsed = parseBackup(text);
    if (!parsed.ok) { setDataNote('\u5BFC\u5165\u5931\u8D25\uFF1A' + parsed.reason, 'err'); return parsed; }
    const res = applyImport(parsed, opts || {});
    setDataNote('\u5BFC\u5165\u5B8C\u6210\uFF1A\u5171 ' + res.cards + ' \u4E2A\u97F3\u540D\u4F4D\u7F6E\u8BB0\u5F55\u3001' + res.posCards + ' \u4E2A\u627E\u4F4D\u7F6E\u8BB0\u5F55\u3001' + res.history + ' \u6761\u7B54\u9898\u5386\u53F2'
      + '\u3001' + res.chordCards + ' \u4E2A\u548C\u5F26\u8BB0\u5F55\u3001' + res.intervalCards + ' \u4E2A\u97F3\u7A0B\u8BB0\u5F55'
      + '\uFF08' + (res.mode === 'replace' ? '\u8986\u76D6' : '\u5408\u5E76') + '\uFF09', 'ok');
    return { ok: true, summary: parsed.summary, result: res };
  }

  /* \u8BFB\u53D6 <input type=file> \u9009\u4E2D\u7684\u5907\u4EFD\u6587\u4EF6 */
  function importDataFromFile(file, opts) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { importDataText(String(reader.result || ''), opts || {}); };
    reader.onerror = () => setDataNote('\u5BFC\u5165\u5931\u8D25\uFF1A\u8BFB\u53D6\u6587\u4EF6\u51FA\u9519', 'err');
    reader.readAsText(file, 'utf-8');
  }

  /* ---------------------------------------------------------------
   *  \u4E8B\u4EF6\u7ED1\u5B9A
   * --------------------------------------------------------------- */
  function bindEvents() {
    $('#btnListen').addEventListener('click', playCurrent);
    $('#btnMute').addEventListener('click', () => setMuted(!soundOf('note').muted, 'note'));
    $('#muteSet').addEventListener('change', (e) => setMuted(e.target.checked, store.settings.mode));

    $('#autoPlay').addEventListener('change', (e) => {
      store.settings.autoPlay = e.target.checked;
      $('#autoPlaySet').checked = e.target.checked;
      save();
    });
    $('#autoPlaySet').addEventListener('change', (e) => {
      store.settings.autoPlay = e.target.checked;
      $('#autoPlay').checked = e.target.checked;
      save();
    });

    function setTime(sec) {
      const inf = sec === 'inf' || sec === Infinity;
      store.settings.time = inf ? 'inf' : clamp(Number(sec) || 10, 3, 60);
      $('#lvTime').textContent = limitLabel(store.settings.time);
      document.querySelectorAll('#timeQuick .btn').forEach((b) => {
        const v = b.dataset.sec;
        b.classList.toggle('active', inf ? v === 'inf' : Number(v) === store.settings.time);
      });
      save();
      renderStringTimes();
      refreshCurrentLimit();
    }
    $('#timeRange').addEventListener('input', (e) => setTime(e.target.value));
    document.querySelectorAll('#timeQuick .btn').forEach((b) => {
      b.addEventListener('click', () => setTime(b.dataset.sec));
    });
    $('#perFretCheck').addEventListener('change', (e) => {
      store.settings.timePerFret = e.target.checked ? 'fret' : 'range';
      save();
      renderStringTimes();
      refreshCurrentLimit();
    });
    document.querySelectorAll('input[name="startMode"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        /* \u300C\u5F00\u59CB\u65B9\u5F0F\u300D\u6309\u6A21\u5F0F\u5404\u5B58\u4E00\u4EFD\uFF08\u7B2C 7 \u6761\uFF09\uFF1A\u53EA\u6539\u5F53\u524D\u6A21\u5F0F\u81EA\u5DF1\u7684\u5B57\u6BB5 */
        const mode = store.settings.mode;
        store.settings[startModeKeyFor(mode)] = inp.value === 'auto' ? 'auto' : 'manual';
        save();
        // \u5F53\u524D\u9898\u8FD8\u6CA1\u5F00\u59CB\u8BA1\u65F6\uFF1A\u7ACB\u5373\u6309\u65B0\u6A21\u5F0F\u5207\u6362
        if (round.current && round.state === 'asking') {
          if (modeStartMode() === 'manual') { round.waitStart = true; showWaitToStart(); }
          else if (round.waitStart) beginQuestion();
        }
        if (mode === 'chord' && chordRound.current) {
          if (startModeOf('chord') === 'manual') {
            chordRound.waitStart = true;
            showChordWaitToStart();
          } else if (chordRound.waitStart) {
            beginChordQuestion();
          }
        }
      });
    });
    $('#btnStartBig').addEventListener('click', (e) => { e.stopPropagation(); beginQuestion(); });
    // \u70B9\u5F00\u59CB\u533A\u7A7A\u767D\u5904\u4E5F\u80FD\u5F00\u59CB
    $('#startBox').addEventListener('click', () => { if (round.waitStart) beginQuestion(); });

    /* \u2014\u2014 \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF08\u72EC\u7ACB\u89C6\u56FE\uFF09\u7684\u6309\u94AE \u2014\u2014 */
    $('#btnPosStart').addEventListener('click', (e) => { e.stopPropagation(); beginQuestion(); });
    $('#posSubmit').addEventListener('click', submitPositions);
    $('#posClear').addEventListener('click', clearPicks);
    $('#posListen').addEventListener('click', playCurrent);
    $('#posMute').addEventListener('click', () => setMuted(!soundOf('pos').muted, 'pos'));
    $('#posNext').addEventListener('click', () => {
      if (round.state === 'idle') { startRound(); return; }
      if (round.state === 'answered') advanceNow();
    });

    /* \u2014\u2014 \u548C\u5F26\u6A21\u5F0F\u6309\u94AE \u2014\u2014 */
    $('#btnChordStart').addEventListener('click', (e) => { e.stopPropagation(); beginChordQuestion(); });    $('#chordStartMask').addEventListener('click', () => {
      if (chordRound.waitStart) beginChordQuestion();
    });
    $('#chordSubmit').addEventListener('click', () => submitChord(false));
    $('#chordListen').addEventListener('click', playChordSelection);
    if ($('#chordListenAnswer')) $('#chordListenAnswer').addEventListener('click', playChordAnswerSelection);
    $('#chordClear').addEventListener('click', chordClearAll);

    /* \u2014\u2014 \u97F3\u7A0B\u6A21\u5F0F\u6309\u94AE \u2014\u2014 */
    $('#btnIntervalStart').addEventListener('click', (e) => { e.stopPropagation(); beginIntervalQuestion(); });
    $('#intervalStartMask').addEventListener('click', () => {
      if (intervalRound.waitStart) beginIntervalQuestion();
    });
    $('#intervalListen').addEventListener('click', () => playIntervalStartOnly('manual'));
    $('#intervalSubmit').addEventListener('click', () => submitInterval(false));
    $('#intervalClear').addEventListener('click', clearIntervalPick);
    $('#intervalNext').addEventListener('click', intervalAdvanceNow);
    $('#intervalMute').addEventListener('click', () => setMuted(!soundOf('interval').muted, 'interval'));

    /* A / B \u5206\u6BB5\u6309\u94AE\uFF1A\u5207\u6362\u73A9\u6CD5\u5E76\u7ACB\u523B\u91CD\u5F00\u4E00\u8F6E\uFF08\u89C4\u683C D6\uFF1A\u4E24\u79CD\u73A9\u6CD5\u662F\u540C\u4E00\u6A21\u5F0F\u7684\u4E24\u4E2A\u65B9\u5411\uFF09 */
    document.querySelectorAll('#intervalPlaySeg .seg-btn').forEach((b) => {
      b.addEventListener('click', () => {
        const want = b.dataset.play === 'b' ? 'b' : 'a';
        if (store.settings.intervalPlay === want) return;
        store.settings.intervalPlay = want;
        save();
        syncIntervalSettingsUI();
        startIntervalRound();
      });
    });

    /* A / B \u5206\u6BB5\u6309\u94AE\uFF1A\u5207\u6362\u73A9\u6CD5\u5E76\u7ACB\u523B\u91CD\u5F00\u4E00\u9898\uFF08\u4E0E\u97F3\u7A0B\u6A21\u5F0F\u540C\u4E00\u5957\u4EA4\u4E92\uFF09 */
    document.querySelectorAll('#posPlaySeg .seg-btn').forEach((b) => {
      b.addEventListener('click', () => setPosPlay(b.dataset.play));
    });

    /* \u4FA7\u680F\u300C\u6E05\u7A7A\u672C\u8F6E\u8BB0\u5F55\u300D\u6309\u94AE\u5DF2\u968F\u65E7\u9762\u677F\u4E00\u8D77\u5220\u9664\uFF0C\u8FD9\u91CC\u4E0D\u518D\u6709\u76D1\u542C\u5668 */

    /* \u8BBE\u7F6E\u91CC\u7684\u97F3\u7A0B\u6A21\u5F0F\u91CD\u7F6E\uFF08\u53EA\u52A8\u97F3\u7A0B\u81EA\u5DF1\u7684\u6570\u636E\uFF0C\u4E0D\u78B0\u5176\u5B83\u4E09\u4E2A\u6A21\u5F0F\uFF09 */
    const resetIvRound = $('#btnResetIntervalRound');
    if (resetIvRound) {
      resetIvRound.addEventListener('click', () => {
        intervalRound.results = [];
        intervalRound.bestStreak = 0;
        intervalRound.streak = 0;
        modeStatOf('interval').streak = 0;
        /* \u672C\u8F6E\u8FD8\u5728\uFF1A\u56FE3 \u7684\u300C\u5DF2\u7B54 / \u603B\u9898\u300D\u6302\u5728\u5FEB\u7167\u7684 done \u4E0A\u3002
           \u8FD9\u91CC\u53EA\u6E05 done\uFF0C\u4E0D\u91CD\u5EFA\u5FEB\u7167 \u2014\u2014 \u91CD\u5EFA\u4F1A\u6309\u6E05\u7A7A\u540E\u7684\u5361\u7247\u91CD\u7B97\u65B0\u9898/\u590D\u4E60\u9898\uFF0C
           \u628A\u8FD9\u4E00\u8F6E\u672C\u6765\u7684\u5206\u5E03\u53E3\u5F84\u4E5F\u4E00\u8D77\u6539\u6389\u3002 */
        if (intervalRound.snapshot) intervalRound.snapshot.done.clear();
        flushSave();
        renderSidebar();
        setDataNote('\u5DF2\u6E05\u7A7A\u97F3\u7A0B\u6A21\u5F0F\u672C\u8F6E\u8BB0\u5F55\uFF08\u5386\u53F2\u4E0E\u5361\u7247\u4E0D\u53D7\u5F71\u54CD\uFF09\u3002', 'ok');
      });
    }
    const resetIvData = $('#btnResetIntervalData');
    if (resetIvData) {
      resetIvData.addEventListener('click', () => {
        if (!confirm('\u786E\u5B9A\u6E05\u7A7A\u5168\u90E8\u97F3\u7A0B\u5B66\u4E60\u6570\u636E\uFF08\u97F3\u7A0B\u5361\u7247\u3001\u5386\u53F2\u4E0E\u51FA\u9898\u6743\u91CD\uFF09\u5417\uFF1F\u4E0D\u5F71\u54CD\u97F3\u540D / \u627E\u4F4D\u7F6E / \u548C\u5F26\u6A21\u5F0F\u3002')) return;
        store.intervalCards = {};
        store.intervalHistory = [];
        intervalRound.results = [];
        intervalRound.bestStreak = 0;
        intervalRound.streak = 0;
        intervalRound.snapshot = null;
        store.modeStats.interval = blankModeStat();
        intervalAPoolCache = { key: '', list: [] };
        intervalBPoolCache = { key: '', list: [] };
        flushSave();
        renderSidebar();
        setDataNote('\u5DF2\u6E05\u7A7A\u97F3\u7A0B\u5B66\u4E60\u6570\u636E\u3002\u5176\u5B83\u4E09\u4E2A\u6A21\u5F0F\u7684\u8BB0\u5F55\u4FDD\u6301\u4E0D\u53D8\u3002', 'ok');
      });
    }
    $('#chordMute').addEventListener('click', () => setMuted(!soundOf('chord').muted, 'chord'));
    /* \u6A2A\u6309\u6A21\u5F0F\u5F00\u5173\uFF08\u89E6\u5C4F\u6CA1\u6709\u53F3\u952E\uFF0C\u9760\u5B83\u5207\u5230\u300C\u62D6\u52A8=\u753B\u6A2A\u6309\u300D\uFF09 */
    const barreBtn = $('#chordBarre');
    if (barreBtn) {
      barreBtn.addEventListener('click', () => {
        chordRound.barreMode = !chordRound.barreMode;
        chordRound.preview = null;
        chordRound.previewBarre = null;
        syncChordUI();
        renderChordFretboard();
      });
    }
    const revealBtn = $('#chordReveal');
    if (revealBtn) revealBtn.addEventListener('click', () => chordRevealAnswer());
    const tipsBox = $('#chordTips');
    if (tipsBox) {
      /* \u624B\u98CE\u7434\u53EA\u7559\u4E00\u4E2A\u5C55\u5F00\uFF1A\u5207\u6362\u65F6\u628A\u5176\u5B83 details \u6536\u8D77\u6765\uFF0C\u907F\u514D\u6574\u5757\u4FA7\u680F\u88AB\u9876\u4E0B\u53BB */
      tipsBox.querySelectorAll('details').forEach((d) => {
        d.addEventListener('toggle', () => {
          if (!d.open) return;
          tipsBox.querySelectorAll('details').forEach((o) => { if (o !== d) o.open = false; });
        });
      });
    }
    $('#chordNext').addEventListener('click', () => {
      if (chordRound.state === 'idle') { startChordRound(); return; }
      if (chordRound.state === 'answered') chordAdvanceNow();
    });
    /* \u4FA7\u680F\u7684\u300C\u6E05\u7A7A\u672C\u8F6E\u8BB0\u5F55\u300D\u6309\u94AE\u5DF2\u968F\u65E7\u9762\u677F\u4E00\u8D77\u5220\u9664\uFF0C\u8FD9\u91CC\u4E0D\u518D\u6709\u76D1\u542C\u5668 */
    /* \u72B6\u6001\u6761\uFF1A\u70B9\u67D0\u6839\u5F26 = \u8BE5\u5F26\u56DE\u9759\u97F3 */
    document.querySelectorAll('#chordStrings .chord-string').forEach((el) => {
      el.addEventListener('click', () => chordMuteString(Number(el.dataset.string)));
    });

    /* \u2014\u2014 \u548C\u5F26\u8BBE\u7F6E \u2014\u2014 */
    document.querySelectorAll('input[name="chordRange"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordRange = inp.value;
        save();
        /* \u8303\u56F4\u53D8\u4E86 \u2192 \u51FA\u9898\u6C60\u91CD\u7B97\uFF08\u6C60\u662F\u7F13\u5B58\u7684\uFF0C\u8FD9\u91CC\u6E05\u6389\u7F13\u5B58\uFF09 */
        chordPoolCache = { key: '', list: [] };
        computeLayout();
        syncChordSettingsUI();
        /* \u672C\u8F6E\u8FD8\u6CA1\u7B54\u8FC7\u9898\u5C31\u7ACB\u523B\u91CD\u6392\uFF1B\u7B54\u8FC7\u5C31\u7B49\u4E0B\u4E00\u8F6E\uFF0C\u4E0D\u6253\u65AD */
        reseedRoundIfFresh('\u548C\u5F26\u51FA\u9898\u8303\u56F4\u7684\u6539\u52A8');
      });
    });
    /* \u2014\u2014 \u73A9\u6CD5\u5207\u6362\uFF08A \u6446\u4F4D / B \u9009\u62E9\u9898\uFF09\uFF1A\u7B56\u5212\u4E66 \u00A74.8.3 \u2014\u2014
       \u53EA\u91CD\u5F00\u5F53\u524D\u9898\uFF0C\u4E0D\u6E05\u9519\u9898\u3001\u4E0D\u91CD\u7F6E\u8FDB\u5EA6\u3002 */
    document.querySelectorAll('#chordPlaySeg [data-play]').forEach((btn) => {
      btn.addEventListener('click', () => setChordPlay(btn.dataset.play));
    });
    /* \u2014\u2014 \u4FA7\u680F 41 \u4E2A chip\uFF08\u7B56\u5212\u4E66 \u00A77\uFF09\u2014\u2014
       \u5168\u90E8\u8D70\u4E8B\u4EF6\u59D4\u6258\uFF1A\u4E00\u4E2A\u76D1\u542C\u5668\u7BA1\u516D\u7EC4 chip\uFF0C\u91CD\u5EFA DOM \u4E0D\u7528\u91CD\u7ED1\u3002
       \u70B9\u51FB\u540E\uFF1A\u5199 settings \u2192 \u6E05\u6C60\u7F13\u5B58 \u2192 \u91CD\u7B97\u8BA1\u6570\u4E0E\u9898\u91CF \u2192 \u672C\u8F6E\u6CA1\u7B54\u8FC7\u5C31\u91CD\u6392\u3002 */
    const scFilter = $('#scFilter');
    if (scFilter) {
      scFilter.addEventListener('change', (ev) => {
        const inp = ev.target;
        if (!inp || !inp.dataset || !inp.dataset.axis) return;
        const axis = inp.dataset.axis;
        const val = inp.dataset.value;
        const s2 = store.settings;
        if (axis === 'quality') {
          const arr = Array.isArray(s2.chordQualities) ? s2.chordQualities.slice() : [];
          const qi = arr.indexOf(val);
          if (inp.checked && qi < 0) arr.push(val);
          else if (!inp.checked && qi >= 0) arr.splice(qi, 1);
          s2.chordQualities = arr;
        } else if (axis === 'root') {
          const arr = Array.isArray(s2.chordRoots) ? s2.chordRoots.slice() : [];
          const pcv = Number(val);
          const qi = arr.indexOf(pcv);
          if (inp.checked && qi < 0) arr.push(pcv);
          else if (!inp.checked && qi >= 0) arr.splice(qi, 1);
          s2.chordRoots = arr;
        } else if (axis === 'strings') {
          const arr = Array.isArray(s2.chordStrings) ? s2.chordStrings.slice() : [];
          const n = Number(val);
          const qi = arr.indexOf(n);
          if (inp.checked && qi < 0) arr.push(n);
          else if (!inp.checked && qi >= 0) arr.splice(qi, 1);
          s2.chordStrings = arr;
        } else if (axis === 'position') {
          s2.chordPosition = val === 'all' ? 'all' : val;
        } else if (axis === 'technique') {
          /* \u4E09\u6001\u4E92\u65A5\uFF1A\u518D\u70B9\u4E00\u6B21\u540C\u4E00\u4E2A\u56DE\u5230 all */
          s2.chordTechnique = (s2.chordTechnique === val) ? 'all' : val;
        } else if (axis === 'scope') {
          s2.chordWrongOnly = val === 'wrong';
        }
        save();
        chordPoolCache = { key: '', list: [] };
        renderChordFilter();
        syncChordSettingsUI();
        reseedRoundIfFresh('\u548C\u5F26\u51FA\u9898\u8303\u56F4\u7684\u6539\u52A8');
      });
      const reset = $('#scReset');
      if (reset) {
        reset.addEventListener('click', () => {
          const s2 = store.settings;
          s2.chordQualities = bankData() ? bankData().Q.map((q) => q[0]) : [];
          s2.chordRoots = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
          s2.chordStrings = [];
          s2.chordPosition = 'all';
          s2.chordTechnique = 'all';
          s2.chordWrongOnly = false;
          save();
          chordPoolCache = { key: '', list: [] };
          renderChordFilter();
          syncChordSettingsUI();
          reseedRoundIfFresh('\u56DE\u5230\u5168\u90E8');
        });
      }
    }
    /* \u98CE\u683C\u4E0E\u7701\u529B\u4F18\u5148\uFF1A\u90FD\u6539\u53D8\u9898\u6C60\uFF0C\u9700\u8981\u6E05\u7F13\u5B58\u5E76\u91CD\u6392 */
    document.querySelectorAll('input[name="chordStyle"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordStyle = inp.value;
        save();
        chordPoolCache = { key: '', list: [] };
        syncChordSettingsUI();
        reseedRoundIfFresh('\u97F3\u4E50\u98CE\u683C\u7684\u6539\u52A8');
      });
    });
    document.querySelectorAll('input[name="chordAEffort"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordAEffort = inp.value === 'easy' ? 'easy' : 'common';
        save();
        chordPoolCache = { key: '', list: [] };
        syncChordSettingsUI();
        reseedRoundIfFresh('\u7701\u529B\u4F18\u5148\u7684\u6539\u52A8');
      });
    });
    document.querySelectorAll('input[name="chordTechnique"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordTechnique = inp.value;
        save();
        chordPoolCache = { key: '', list: [] };
        syncChordSettingsUI();
        reseedRoundIfFresh('\u6280\u5DE7\u7B5B\u9009\u7684\u6539\u52A8');
      });
    });
    document.querySelectorAll('input[name="chordPosition"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordPosition = inp.value;
        save();
        chordPoolCache = { key: '', list: [] };
        syncChordSettingsUI();
        reseedRoundIfFresh('\u628A\u4F4D\u7B5B\u9009\u7684\u6539\u52A8');
      });
    });
    /* \u5341\u516B\u79CD\u8D28\u91CF\uFF1A\u6574\u5757 chip \u7EC4\u6309\u5F53\u524D\u52FE\u9009\u5199\u56DE\u6570\u7EC4 */
    const qBox = $('#chordQualityChips');
    if (qBox) {
      qBox.addEventListener('change', () => {
        const picked = [];
        qBox.querySelectorAll('input[type="checkbox"]').forEach((inp) => {
          if (inp.checked) picked.push(inp.value);
        });
        store.settings.chordQualities = picked;
        save();
        chordPoolCache = { key: '', list: [] };
        syncChordSettingsUI();
        reseedRoundIfFresh('\u548C\u5F26\u6027\u8D28\u9009\u62E9\u7684\u6539\u52A8');
      });
    }
    /* A / B \u5404\u81EA\u7684\u504F\u597D\uFF08\u524D\u7F00\u9694\u79BB\uFF0C\u4E92\u4E0D\u8986\u76D6\uFF09 */
    const boolBind = (id, key, conv) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('change', () => {
        store.settings[key] = conv ? conv(el) : !!el.checked;
        save();
        if (key === 'chordBStrict') {
          chordPoolCache = { key: '', list: [] };
          syncChordSettingsUI();
          reseedRoundIfFresh('\u4E25\u683C\u9898\u6C60\u7684\u6539\u52A8');
          return;
        }
        applyLiveSettings();
        renderChordPrompt();
        renderChordOptions();
        if (key === 'chordAutoBarreHint') return;
        renderChordFretboard();
      });
    };
    boolBind('#chordASound', 'chordASound');
    boolBind('#chordAListen', 'chordAListen');
    boolBind('#chordAListenAnswer', 'chordAListenAnswer');
    boolBind('#chordBSound', 'chordBSound');
    boolBind('#chordAutoBarreHint', 'chordAutoBarreHint');
    document.querySelectorAll('input[name="chordAHint"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordAHint = inp.value;
        save();
        /* \u63D0\u793A\u5206\u7EA7\u662F\u300C\u5F53\u573A\u751F\u6548\u300D\u7684\u8BBE\u7F6E\uFF1AapplyLiveSettings \u4F1A\u628A snap.hint \u91CD\u7B97\u5E76\u91CD\u753B\u9009\u9879/\u4FA7\u680F */
        applyLiveSettings();
      });
    });
    document.querySelectorAll('input[name="chordAPreview"]').forEach((inp) => {
      inp.addEventListener('change', () => { store.settings.chordAPreview = inp.value; save(); });
    });
    document.querySelectorAll('input[name="chordBReveal"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordBReveal = inp.value;
        save();
        /* \u63ED\u6653\u65B9\u5F0F\u5F53\u573A\u751F\u6548\uFF1AapplyLiveSettings \u4F1A\u91CD\u7B97 snap.revealB \u5E76\u91CD\u753B\u9898\u5361/\u9009\u9879/\u4FA7\u680F */
        applyLiveSettings();
      });
    });
    document.querySelectorAll('input[name="chordBHint"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordBHint = inp.value;
        save();
        applyLiveSettings();
      });
    });
    document.querySelectorAll('input[name="chordBDistractor"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordBDistractor = inp.value;
        save();
        /* \u5E72\u6270\u9879\u6765\u6E90\u53EA\u5728\u51FA\u4E0B\u4E00\u9898\u65F6\u751F\u6548\uFF0C\u5F53\u524D\u9898\u4E0D\u52A8 */
        resetChordChoices();
      });
    });
    document.querySelectorAll('input[name="chordBOptionCount"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordBOptionCount = clamp(Number(inp.value) || 4, 3, 6);
        save();
        resetChordChoices();
      });
    });
    document.querySelectorAll('input[name="chordBStrict"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordBStrict = !!inp.checked;
        save();
        chordPoolCache = { key: '', list: [] };
        syncChordSettingsUI();
        reseedRoundIfFresh('\u4E25\u683C\u9898\u6C60\u7684\u6539\u52A8');
      });
    });
    /* \u548C\u5F26\u540D\u8BED\u8A00\uFF1A\u53EA\u5F71\u54CD\u663E\u793A\uFF0C\u4E0D\u6539\u5224\u5206\uFF08\u7B56\u5212\u4E66 \u00A74.9\uFF09 */
    document.querySelectorAll('input[name="chordNameLang"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordNameLang = inp.value;
        save();
        renderChordPrompt();
        renderChordOptions();
        renderSidebar();
      });
    });
    document.querySelectorAll('input[name="chordStrum"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordStrum = inp.value;
        save();
        applyLiveSettings();
      });
    });
    document.querySelectorAll('input[name="chordPreview"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordPreview = inp.value;
        save();
        applyLiveSettings();
      });
    });
    document.querySelectorAll('input[name="chordRevealPlay"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordRevealPlay = inp.value;
        save();
        applyLiveSettings();
      });
    });
    if ($('#chordListenDuringAnswerSet')) {
      $('#chordListenDuringAnswerSet').addEventListener('change', (e) => {
        store.settings.chordListenDuringAnswer = !!e.target.checked;
        save();
        /* \u53EA\u5F71\u54CD\u624B\u52A8\u8BD5\u542C\u6309\u94AE\u7684\u53EF\u7528\u6027\uFF0C\u4E0D\u78B0\u8BA1\u65F6 / \u5224\u5B9A / \u5386\u53F2 */
        applyLiveSettings();
      });
    }
    if ($('#chordClickSoundSet')) {
      $('#chordClickSoundSet').addEventListener('change', (e) => {
        /* \u53EA\u5F71\u54CD\u7B54\u9898\u4E2D\u70B9\u683C\u5B50\u7684\u90A3\u4E00\u523B\uFF0C\u4E0D\u78B0\u51FA\u9898/\u63ED\u6653/\u624B\u52A8\u8BD5\u542C\u4E09\u6761\u64AD\u653E\u901A\u8DEF */
        store.settings.chordClickSound = !!e.target.checked;
        save();
      });
    }
    document.querySelectorAll('#chordTimeQuick .btn').forEach((b) => {
      b.addEventListener('click', () => {
        const raw = b.dataset.ctime;
        const sec = raw === 'inf' ? 'inf' : Number(raw);
        if (sec !== 'inf' && !isFinite(sec)) return;
        /* \u65B9\u5411\u5FC5\u987B\u4ECE\u300C\u5F53\u524D\u73A9\u6CD5\u300D\u6D3E\u751F\uFF1AchordDir \u662F\u65E7\u5B57\u6BB5\uFF0C\u73A9\u6CD5\u6539\u6210 A/B \u4E4B\u540E
           \u5DF2\u7ECF\u6CA1\u4EBA\u540C\u6B65\u5B83\uFF0C\u8BFB\u5B83\u4F1A\u628A B \u73A9\u6CD5\u7684\u9650\u65F6\u5199\u8FDB A \u7684\u5B57\u6BB5\uFF08\u53CD\u8FC7\u6765\u4E5F\u662F\uFF09\u3002 */
        const dir = chordPlayMode() === 'b' ? 'f2n' : 'n2f';
        /* \u4E24\u4E2A\u65B9\u5411\u7684\u9650\u65F6\u4E92\u76F8\u72EC\u7ACB\uFF1A\u6309\u5F53\u524D\u65B9\u5411\u5199\u5BF9\u5E94\u5B57\u6BB5 */
        store.settings.chordTime = Object.assign({}, store.settings.chordTime, dir === 'f2n' ? { f2n: sec } : { n2f: sec });
        save();
        syncChordSettingsUI();
        /* \u6539\u5B8C\u7ACB\u523B\u751F\u6548\uFF1A\u5F53\u524D\u8FD9\u4E00\u9898\u6309\u65B0\u9650\u65F6\u91CD\u7B97\uFF08\u4E0D\u518D\u7B49\u56DE\u4E3B\u9875\u91CD\u8FDB\uFF09 */
        refreshChordLimit();
      });
    });
    $('#chordSizeRange').addEventListener('input', (e) => {
      store.settings.chordSize = clamp(Number(e.target.value) || 10, 4, 20);
      $('#lvChordSize').textContent = store.settings.chordSize + ' \u9898';
      save();
      /* \u9898\u91CF\u53EA\u51B3\u5B9A\u6392\u591A\u5C11\u9898\uFF1A\u672C\u8F6E\u6CA1\u7B54\u8FC7\u9898\u5C31\u7ACB\u523B\u91CD\u6392\uFF0C\u5426\u5219\u7B49\u4E0B\u4E00\u8F6E */
      reseedRoundIfFresh('\u548C\u5F26\u4E00\u8F6E\u9898\u91CF\u7684\u6539\u52A8');
    });
    $('#sizeRange').addEventListener('input', (e) => {
      store.settings.size = Number(e.target.value);
      $('#lvSize').textContent = store.settings.size + ' \u9898';
      save();
      reseedRoundIfFresh('\u4E00\u8F6E\u9898\u91CF\u7684\u6539\u52A8');
    });

    /* ============================================================
     *  \u97F3\u7A0B\u6A21\u5F0F\u8BBE\u7F6E\u4E8B\u4EF6\uFF08\u5168\u90E8\u5199\u97F3\u7A0B\u81EA\u5DF1\u7684\u5B57\u6BB5\uFF0C\u7EDD\u4E0D\u78B0\u5176\u5B83\u6A21\u5F0F\uFF09
     * ============================================================ */
    document.querySelectorAll('input[name="intervalPlay"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.intervalPlay = inp.value === 'b' ? 'b' : 'a';
        save();
        /* \u6362\u73A9\u6CD5\u7B49\u4E8E\u6362\u9898\u578B\uFF0C\u76F4\u63A5\u91CD\u5F00\u4E00\u8F6E */
        if (store.settings.mode === 'interval') startIntervalRound();
      });
    });
    document.querySelectorAll('input[name="intervalRange"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.intervalRange = inp.value;
        save();
        applySettingsChange(store.settings.intervalAutoSection !== false);
      });
    });
    document.querySelectorAll('input[name="intervalDirB"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.intervalDirB = inp.value;
        save();
        applySettingsChange(true);
      });
    });
    document.querySelectorAll('input[name="intervalStartMode"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.intervalStartMode = inp.value === 'auto' ? 'auto' : 'manual';
        save();
        /* \u5F53\u524D\u9898\u8FD8\u6CA1\u5F00\u59CB\u8BA1\u65F6\uFF1A\u7ACB\u5373\u6309\u65B0\u6A21\u5F0F\u5207\u6362\uFF0C\u4E0D\u7528\u7B49\u4E0B\u4E00\u9898 */
        if (store.settings.mode === 'interval' && intervalRound.current
            && intervalRound.state === 'asking' && intervalRound.snap) {
          intervalRound.snap.startMode = store.settings.intervalStartMode;
          if (store.settings.intervalStartMode === 'manual') {
            intervalRound.waitStart = true;
            showIntervalWaitToStart();
          } else if (intervalRound.waitStart) {
            beginIntervalQuestion();
          }
        }
      });
    });
    document.querySelectorAll('input[name="intervalPreview"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.intervalPreview = inp.value === 'off' ? 'off' : 'on';
        save();
        /* \u53EA\u6539\u300C\u51FA\u9898\u65F6\u8981\u4E0D\u8981\u81EA\u52A8\u64AD\u300D\uFF0C\u5F53\u573A\u5199\u8FDB\u5FEB\u7167\u5373\u53EF */
        applyLiveSettings();
      });
    });
    document.querySelectorAll('input[name="intervalTimePreset"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.intervalTimeTarget = inp.value === 'b' ? 'b' : 'a';
        save();
        syncIntervalSettingsUI();
      });
    });
    document.querySelectorAll('#intervalAccChips input').forEach((inp) => {
      inp.addEventListener('change', () => {
        const sel = intervalAccSel();
        const key = inp.id === 'intervalSwNat' ? 'nat' : (inp.id === 'intervalSwSharp' ? 'sharp' : 'flat');
        const next = { nat: sel.nat, sharp: sel.sharp, flat: sel.flat };
        next[key] = inp.checked;
        /* \u4E09\u9879\u5168\u5173\u4E0D\u5141\u8BB8\uFF1A\u4E0E\u97F3\u540D\u6A21\u5F0F\u300C\u4E24\u4E2A\u5F00\u5173\u90FD\u5173\u6389 = \u53EA\u51FA\u81EA\u7136\u97F3\u300D\u540C\u4E00\u89C4\u5219\uFF0C
           \u8FD9\u91CC\u76F4\u63A5\u4FDD\u7559\u81EA\u7136\u97F3\u5E76\u7ED9\u51FA\u63D0\u793A\uFF0C\u907F\u514D\u51FA\u73B0\u300C\u65E0\u9898\u53EF\u51FA\u300D\u7684\u7A7A\u8F6E\u3002 */
        if (!next.nat && !next.sharp && !next.flat) {
          next.nat = true;
          setDataNote('\u81F3\u5C11\u8981\u4FDD\u7559\u4E00\u9879\uFF1A\u5DF2\u81EA\u52A8\u4FDD\u7559\u300C\u81EA\u7136\u97F3\u300D\u3002', 'err');
        }
        setIntervalAccSel(next);
      });
    });
    document.querySelectorAll('#intervalAccPresets .btn').forEach((b) => {
      b.addEventListener('click', () => {
        const p = b.dataset.preset;
        if (p === 'natural') setIntervalAccSel({ nat: true, sharp: false, flat: false });
        else if (p === 'sharp') setIntervalAccSel({ nat: true, sharp: true, flat: false });
        else if (p === 'flat') setIntervalAccSel({ nat: true, sharp: false, flat: true });
        else setIntervalAccSel({ nat: true, sharp: true, flat: true });
      });
    });
    document.querySelectorAll('#intervalStringChips input').forEach((inp) => {
      inp.addEventListener('change', () => {
        const cur = intervalStrings();
        const n = Number(inp.dataset.istr);
        let next = cur.slice();
        if (inp.checked) { if (next.indexOf(n) < 0) next.push(n); }
        else next = next.filter((x) => x !== n);
        next.sort((a, b) => b - a);
        /* \u73A9\u6CD5 A \u81F3\u5C11 2 \u6839\u5F26\uFF08D44\uFF09\uFF1B\u73A9\u6CD5 B \u5141\u8BB8 1 \u6839 */
        if (store.settings.intervalPlay !== 'b' && next.length < 2) {
          setDataNote('\u73A9\u6CD5 A \u81F3\u5C11\u9700\u8981 2 \u6839\u5F26\uFF08\u540C\u5F26\u3001\u8DE8\u5F26\u3001\u540C\u97F3\u5F02\u4F4D\u4E09\u7C7B\u9898\u90FD\u9700\u8981\uFF09\uFF0C\u5DF2\u963B\u6B62\u53D6\u6D88\u3002', 'err');
          syncIntervalSettingsUI();
          return;
        }
        if (!next.length) {
          setDataNote('\u81F3\u5C11\u8981\u4FDD\u7559 1 \u6839\u5F26\u3002', 'err');
          syncIntervalSettingsUI();
          return;
        }
        store.settings.intervalStrings = next;
        save();
        applySettingsChange(store.settings.intervalAutoSection !== false);
      });
    });
    document.querySelectorAll('#intervalSetAQuick .btn').forEach((b) => {
      b.addEventListener('click', () => applyIntervalPreset(true, b.dataset.preset));
    });
    document.querySelectorAll('#intervalSetBQuick .btn').forEach((b) => {
      b.addEventListener('click', () => applyIntervalPreset(false, b.dataset.preset));
    });
    $('#intervalOptionRange').addEventListener('input', (e) => {
      const T = intervalTheory();
      const cap = T ? Math.max(1, T.maxOptionCount(intervalSetA())) : 12;
      store.settings.intervalOptionCount = clamp(Number(e.target.value) || 4, Math.min(4, cap), cap);
      save();
      syncIntervalSettingsUI();
      applyLiveSettings();
    });
    document.querySelectorAll('#intervalOptionQuick .btn').forEach((b) => {
      b.addEventListener('click', () => {
        const T = intervalTheory();
        const cap = T ? Math.max(1, T.maxOptionCount(intervalSetA())) : 12;
        store.settings.intervalOptionCount = clamp(Number(b.dataset.n) || 4, Math.min(4, cap), cap);
        save();
        syncIntervalSettingsUI();
        applyLiveSettings();
      });
    });
    $('#intervalTimeRange').addEventListener('input', (e) => {
      const v = clamp(Number(e.target.value) || 10, 3, 60);
      if (store.settings.intervalTimeTarget === 'b') store.settings.intervalTimeB = v;
      else store.settings.intervalTimeA = v;
      save();
      syncIntervalSettingsUI();
      refreshIntervalLimit();
    });
    document.querySelectorAll('#intervalTimeQuick .btn').forEach((b) => {
      b.addEventListener('click', () => {
        const raw = b.dataset.sec;
        const v = raw === 'inf' ? 'inf' : clamp(Number(raw) || 10, 3, 60);
        if (store.settings.intervalTimeTarget === 'b') store.settings.intervalTimeB = v;
        else store.settings.intervalTimeA = v;
        save();
        syncIntervalSettingsUI();
        refreshIntervalLimit();
      });
    });
    $('#intervalSizeRange').addEventListener('input', (e) => {
      store.settings.intervalSize = clamp(Number(e.target.value) || 10, 5, 50);
      $('#lvIntervalSize').textContent = store.settings.intervalSize + ' \u9898';
      save();
      /* \u9898\u91CF\u8981\u91CD\u6392\u9898\u6C60\uFF0C\u672C\u8F6E\u6CA1\u7B54\u8FC7\u9898\u5C31\u7ACB\u523B\u91CD\u6392\uFF0C\u5426\u5219\u7B49\u4E0B\u4E00\u8F6E */
      reseedRoundIfFresh('\u97F3\u7A0B\u4E00\u8F6E\u9898\u91CF\u7684\u6539\u52A8');
    });
    $('#intervalEquivSet').addEventListener('change', (e) => {
      store.settings.intervalEquiv = e.target.checked;
      save();
      applySettingsChange(false);
    });
    $('#intervalShowRootNameSet').addEventListener('change', (e) => {
      store.settings.intervalShowRootName = e.target.checked;
      save();
      applyLiveSettings();
    });
    $('#intervalClickSoundSet').addEventListener('change', (e) => {
      store.settings.intervalClickSound = e.target.checked;
      save();
      applyLiveSettings();
    });
    $('#intervalPerFretSet').addEventListener('change', (e) => {
      store.settings.intervalPerFret = e.target.checked;
      save();
      /* \u9AD8\u628A\u4F4D\u52A0\u65F6\u76F4\u63A5\u6539\u53D8\u672C\u9898\u7684\u5269\u4F59\u65F6\u95F4\uFF0C\u5FC5\u987B\u7ACB\u523B\u91CD\u7B97 */
      applyLiveSettings();
    });
    $('#intervalAutoNextSet').addEventListener('change', (e) => {
      store.settings.intervalAutoNextOnCorrect = e.target.checked;
      save();
      /* \u8FD9\u6761\u53EA\u5F71\u54CD\u300C\u7B54\u5BF9\u540E\u8981\u4E0D\u8981\u81EA\u52A8\u4E0B\u4E00\u9898\u300D\uFF0C\u6539\u5B8C\u7ACB\u523B\u5199\u8FDB\u672C\u9898\u5FEB\u7167 */
      applyLiveSettings();
    });
    $('#intervalListenDuringSet').addEventListener('change', (e) => {
      store.settings.intervalListenDuringAnswer = e.target.checked;
      save();
      applyLiveSettings();
    });
    /* \u300C\u70B9\u4E0B\u4E00\u9898\u81EA\u52A8\u5F00\u59CB\u300D\u53EA\u5F71\u54CD advanceInterval \u7684\u4F20\u53C2\uFF0C\u4E0D\u6539\u5F53\u524D\u9898 */
    $('#intervalAutoStartNextSet').addEventListener('change', (e) => {
      store.settings.intervalAutoStartNext = e.target.checked;
      save();
    });
    /* \u300C\u6539\u8303\u56F4/\u5F26/\u96C6\u5408\u540E\u7ACB\u5373\u5F00\u65B0\u4E00\u8F6E\u300D\u53EA\u662F\u4E2A\u6807\u8BB0\uFF0C\u5728\u4E0B\u4E00\u6B21\u6539\u8303\u56F4\u65F6\u751F\u6548 */
    $('#intervalAutoSectionSet').addEventListener('change', (e) => {
      store.settings.intervalAutoSection = e.target.checked;
      save();
    });
    /* \u51FA\u9898\u503E\u5411\u6539\u7684\u662F\u62BD\u9898\u6765\u6E90\uFF1A\u672C\u8F6E\u6CA1\u7B54\u8FC7\u9898\u5C31\u7ACB\u523B\u91CD\u6392\uFF0C\u5426\u5219\u7B49\u4E0B\u4E00\u8F6E */
    document.querySelectorAll('input[name="intervalNovelty"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const v = inp.value;
        store.settings.intervalNovelty = (v === 'new' || v === 'familiar') ? v : 'mix';
        save();
        reseedRoundIfFresh('\u97F3\u7A0B\u51FA\u9898\u503E\u5411\u7684\u6539\u52A8');
      });
    });

    /* \u6062\u590D\u5F53\u524D\u6A21\u5F0F\u7684\u9ED8\u8BA4\u58F0\u97F3\uFF08\u53EA\u52A8\u5F53\u524D\u6A21\u5F0F\uFF0C\u5176\u5B83\u4E09\u4E2A\u6A21\u5F0F\u4FDD\u6301\u4E0D\u53D8\uFF09 */
    if ($('#btnResetSound')) {
      $('#btnResetSound').addEventListener('click', () => {
        const target = resetModeSound(store.settings.mode);
        const note = $('#soundNote');
        if (note) {
          note.className = 'field-tip data-note ok';
          note.textContent = '\u5DF2\u6062\u590D\u5F53\u524D\u6A21\u5F0F\uFF08' + target + '\uFF09\u7684\u9ED8\u8BA4\u58F0\u97F3\uFF1A\u4E0D\u9759\u97F3\u3001\u97F3\u91CF 70\u3002';
        }
      });
    }    $('#volRange').addEventListener('input', (e) => {
      /* \u53EA\u5199\u300C\u5F53\u524D\u6A21\u5F0F\u300D\u81EA\u5DF1\u7684\u97F3\u91CF\uFF08\u9694\u79BB\u7EA2\u7EBF\uFF1A\u4E0D\u8FDE\u5E26\u5176\u5B83\u4E09\u4E2A\u6A21\u5F0F\uFF09 */
      const mode = store.settings.mode;
      setSoundOf(mode, { volume: Number(e.target.value) });
      audio.setVolume(Number(e.target.value), mode);
      save();
    });

    document.querySelectorAll('input[name="range"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        /* \u53EA\u5199\u300C\u5F53\u524D\u6A21\u5F0F\u300D\u81EA\u5DF1\u7684\u90A3\u4EFD\u8303\u56F4\uFF0C\u53E6\u4E00\u4E2A\u6A21\u5F0F\u4FDD\u6301\u4E0D\u52A8 */
        store.settings[rangeKeyFor(store.settings.mode)] = inp.value;
        syncLegacyRange();
        save();
        if (store.settings.autoSection) {
          /* \u300C\u6539\u8303\u56F4\u540E\u7ACB\u5373\u5F00\u65B0\u4E00\u8F6E\u300D\u5F00\u7740\uFF1A\u76F4\u63A5\u91CD\u5F00 */
          applySettingsChange(true);
        } else {
          /* \u5173\u7740\uFF1A\u4E0D\u6253\u65AD\u5DF2\u7B54\u7684\u9898\uFF0C\u4F46\u672C\u8F6E\u8FD8\u6CA1\u7B54\u8FC7\u5C31\u7ACB\u523B\u6309\u65B0\u8303\u56F4\u91CD\u6392 */
          reseedRoundIfFresh('\u7B54\u9898\u8303\u56F4\u7684\u6539\u52A8');
        }
      });
    });

    document.querySelectorAll('#stringChips input').forEach((inp) => {
      inp.addEventListener('change', () => {
        const chosen = Array.from(document.querySelectorAll('#stringChips input:checked')).map((i) => Number(i.dataset.str));
        if (!chosen.length) { inp.checked = true; return; }
        store.settings.strings = chosen.sort((a, b) => b - a);
        save();
        if (store.settings.autoSection) {
          applySettingsChange(true);
        } else {
          reseedRoundIfFresh('\u5F26\u9009\u62E9\u7684\u6539\u52A8');
        }
      });
    });

    // \u7EC3\u4E60\u6A21\u5F0F\u5DF2\u79FB\u5230\u4E3B\u9875\u9009\u62E9\uFF08\u89C1 showHome / enterMode\uFF09\uFF0C\u8BBE\u7F6E\u91CC\u4E0D\u518D\u6709\u6A21\u5F0F\u5207\u6362

    document.querySelectorAll('input[name="acc"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.accidental = inp.value;
        save();
        if (round.current) buildOptions(round.current);
      });
    });

    document.querySelectorAll('input[name="novelty"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.novelty = inp.value;
        save();
        /* \u51FA\u9898\u503E\u5411\u6539\u7684\u662F\u62BD\u9898\u6765\u6E90\uFF1A\u672C\u8F6E\u6CA1\u7B54\u8FC7\u9898\u5C31\u7ACB\u523B\u91CD\u6392\uFF0C\u5426\u5219\u7B49\u4E0B\u4E00\u8F6E */
        reseedRoundIfFresh('\u51FA\u9898\u503E\u5411\u7684\u6539\u52A8');
      });
    });

    /* \u548C\u5F26\u6A21\u5F0F\u81EA\u5DF1\u7684\u300C\u97F3\u540D\u663E\u793A\u5199\u6CD5\u300D\uFF08\u4E0E\u97F3\u540D/\u627E\u4F4D\u7F6E\u7684 input[name="acc"] \u5B8C\u5168\u72EC\u7ACB\uFF09 */
    document.querySelectorAll('input[name="chordAcc"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        store.settings.chordAccidental = inp.value === 'flat' ? 'flat' : 'sharp';
        save();
        syncChordSettingsUI();
        if (store.settings.mode === 'chord') {
          renderChordPrompt();
          renderChordFeedback();
          renderChordFretboard();
        }
      });
    });

    // \u65E7\u7248\u201C\u7F29\u5C0F / \u653E\u5927\u201D\u89C6\u56FE\u5DF2\u79FB\u9664\uFF1A\u73B0\u5728\u53EA\u6709\u4E00\u79CD\u6309\u771F\u5B9E\u6BD4\u4F8B\u7ED8\u5236\u7684\u6307\u677F

    $('#autoSection').addEventListener('change', (e) => { store.settings.autoSection = e.target.checked; save(); });

    $('#btnSettings').addEventListener('click', () => {
      syncSettingsUI();
      applySettingsScope();
      openModal('#settingsModal');
      /* bindSettingsNav \u81EA\u5DF1\u4F1A\u6309\u5F53\u524D\u6A21\u5F0F\u9009\u9ED8\u8BA4\u5206\u533A\uFF08\u97F3\u7A0B\u6A21\u5F0F\u76F4\u63A5\u5F00\u300C\u97F3\u7A0B\u6A21\u5F0F\u300D\u9875\uFF09 */
      bindSettingsNav();
    });
    $('#btnStats').addEventListener('click', openStats);
    $('#btnHelp').addEventListener('click', () => openModal('#helpModal'));
    $('#btnHome').addEventListener('click', showHome);

    /* \u2014\u2014 \u4E3B\u9875\uFF1A\u9009\u62E9\u7EC3\u4E60\u6A21\u5F0F \u2014\u2014
       \u70B9\u51FB\u540E\u5148\u64AD\u300C\u6574\u7434\u65CB\u8F6C\u653E\u5927 \u2192 \u4EA4\u63A5\u6307\u677F\u300D\u7684\u8FC7\u6E21\uFF08home-intro.js\uFF09\uFF0C\u518D\u8FDB\u5165\u7B54\u9898\u3002
       enterMode \u5728\u8FC7\u6E21\u7684\u300C\u88C1\u5207\u5B8C\u6210\u300D\u56DE\u8C03\u91CC\u6267\u884C\uFF0C\u8FD9\u6837\u6574\u7434\u80FD\u5BF9\u51C6\u771F\u5B9E\u7684\u6307\u677F\u4F4D\u7F6E\u3002

       \u26A0 \u8FC7\u6E21\u8FDB\u884C\u4E2D\u7684\u7B2C\u4E8C\u6B21\u70B9\u51FB\u5FC5\u987B**\u5FFD\u7565**\uFF0C\u4E0D\u80FD\u987A\u624B enterMode\uFF1A
       \u90A3\u4F1A\u5728\u6574\u7434\u8FD8\u5728\u65CB\u8F6C\u653E\u5927\u7684\u65F6\u5019\u5C31\u63ED\u5F00\u7B54\u9898\u754C\u9762\uFF0C\u5F97\u5230\u300C\u754C\u9762\u5DF2\u7ECF\u5B8C\u6574\u663E\u793A\u3001
       \u52A8\u753B\u5374\u8FD8\u5728\u64AD\u300D\u7684\u753B\u9762\uFF1B\u800C\u4E14 enterMode \u4F1A\u7ACB\u523B startRound()\uFF0C\u7B49\u4E8E\u8FD8\u6CA1\u4EA4\u63A5\u5B8C
       \u5C31\u5F00\u59CB\u4E86\u8BA1\u65F6\u3002\u52A8\u753B\u81EA\u5DF1\u4F1A\u5728 FRAME(1900ms) \u8C03 onReveal\u3001END(3400ms) \u6536\u5C3E\uFF0C
       \u4E0D\u9700\u8981\u7B2C\u4E8C\u6B21\u70B9\u51FB\u53BB\u50AC\u3002 */
    const introBusy = () => {
      const intro = window.homeIntro;
      if (!intro) return false;
      return !!intro.running || document.body.classList.contains('intro-running');
    };
    const pickMode = (mode) => {
      const intro = window.homeIntro;
      if (!intro) { enterMode(mode); return; }
      if (introBusy()) return;
      document.body.classList.add('intro-running');
      intro.play(() => enterMode(mode), mode).then(() => {
        document.body.classList.remove('intro-running');
      }).catch(() => {
        document.body.classList.remove('intro-running');
      });
    };
    $('#homePickNote').addEventListener('click', () => pickMode('note'));
    $('#homePickPos').addEventListener('click', () => pickMode('pos'));
    $('#homePickChord').addEventListener('click', () => pickMode('chord'));
    $('#homePickInterval').addEventListener('click', () => pickMode('interval'));
    $('#homeStats').addEventListener('click', openStats);

    /* \u2014\u2014 \u4E3B\u9875\u300C\u91CD\u7F6E\u5168\u90E8\u6570\u636E\u300D\u2014\u2014
       \u7528\u6237\u8981\u6C42\uFF1A\u70B9\u4E00\u4E0B\u4E0D\u5F39 window.confirm\uFF0C\u53EA\u5728\u6309\u94AE\u4E0A\u65B9\u5C55\u5F00\u4E00\u6761\u786E\u8BA4\u6761\uFF0C
       \u518D\u70B9\u300C\u786E\u8BA4\u91CD\u7F6E\u300D\u624D\u771F\u7684\u52A8\u624B\u3002\u8303\u56F4\u662F\u300C\u5B66\u4E60\u8BB0\u5F55 + \u8BBE\u7F6E\u300D\uFF0C\u6BD4\u8BBE\u7F6E\u9875\u91CC\u7684
       \u300C\u6E05\u7A7A\u5F53\u524D\u6A21\u5F0F\u300D\u72E0\u4E00\u6863\uFF0C\u6240\u4EE5\u6587\u6848\u91CC\u660E\u5199\u56DB\u4E2A\u6A21\u5F0F\u90FD\u4F1A\u88AB\u6E05\u3002
       \u5C55\u5F00/\u6536\u8D77\u7684\u4E09\u4E2A\u51FD\u6570\u5728\u6A21\u5757\u4F5C\u7528\u57DF\u91CC\uFF08showHome / \u952E\u76D8 Esc \u4E5F\u8981\u7528\uFF09\uFF0C
       \u8FD9\u91CC\u53EA\u6302\u76D1\u542C\u3002 */
    if ($('#homeResetAll')) {
      $('#homeResetAll').addEventListener('click', (e) => {
        e.stopPropagation();
        if (homeConfirmOpen()) closeHomeConfirm();
        else openHomeConfirm();
      });
    }
    if ($('#homeResetCancel')) {
      $('#homeResetCancel').addEventListener('click', (e) => {
        e.stopPropagation();
        closeHomeConfirm();
      });
    }
    if ($('#homeResetConfirm')) {
      $('#homeResetConfirm').addEventListener('click', (e) => {
        e.stopPropagation();
        closeHomeConfirm();
        resetEverything();
      });
    }
    /* \u70B9\u786E\u8BA4\u6761\u4EE5\u5916\u7684\u4EFB\u4F55\u5730\u65B9\u6536\u8D77\uFF08\u70B9\u786E\u8BA4\u6761\u81EA\u5DF1\u3001\u70B9\u89E6\u53D1\u6309\u94AE\u4E0D\u7B97\uFF09\u3002
       \u7528\u6355\u83B7\u9636\u6BB5\uFF1A\u5373\u4F7F\u70B9\u5728\u522B\u7684\u6309\u94AE\u4E0A\uFF0C\u4E5F\u5148\u628A\u786E\u8BA4\u6761\u6536\u8D77\u6765\uFF0C\u4E0D\u4F1A\u51FA\u73B0
       \u300C\u786E\u8BA4\u6761\u8FD8\u60AC\u7740\u3001\u9875\u9762\u5DF2\u7ECF\u8DF3\u8D70\u300D\u3002 */
    document.addEventListener('click', (e) => {
      if (!homeConfirmOpen()) return;
      const box = $('#homeConfirm');
      if (box && box.contains(e.target)) return;
      if (e.target === $('#homeResetAll')) return;
      closeHomeConfirm();
    }, true);

    document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModals));
    document.querySelectorAll('.modal').forEach((m) => {
      m.addEventListener('click', (e) => { if (e.target === m) closeModals(); });
    });

    /* \u4FA7\u680F\u7684\u300C\u6E05\u7A7A\u300D\u6309\u94AE\u5DF2\u968F\u65E7\u9762\u677F\u4E00\u8D77\u5220\u9664\uFF1A\u6E05\u7A7A\u5165\u53E3\u53EA\u5269\u8BBE\u7F6E\u9875\u7684\u91CD\u7F6E\u6309\u94AE */
    $('#nextHint').addEventListener('click', advanceNow);

    /* \u2014\u2014 \u8C03\u8BD5\u5DE5\u5177\u6761 \u2014\u2014
       #btnSkipQ \u53EA\u5728\u97F3\u540D\u6A21\u5F0F\u53EF\u7528\uFF08syncDebugBar \u4F1A\u7F6E\u7070\uFF09\uFF0C
       #btnRefreshQ / #btnReplay \u56DB\u4E2A\u6A21\u5F0F\u90FD\u80FD\u7528\uFF0C\u5404\u81EA\u5206\u6D3E\u5230\u81EA\u5DF1\u6A21\u5F0F\u3002 */
    /* \u6E05\u7A7A\u5F53\u524D\u6A21\u5F0F\u4E4B\u540E\u8981\u628A\u6210\u7EE9\u6761\u5199\u56DE\u300C\u7EC3\u4E60\u89C6\u56FE\u300D\u7684\u53EF\u89C1\u4F4D\u7F6E\uFF1A
       \u8BBE\u7F6E\u5F39\u7A97\u76D6\u7740\u7EC3\u4E60\u89C6\u56FE\uFF0C\u5199\u8FDB .feedback \u7B49\u4E8E\u6CA1\u63D0\u793A\uFF0C\u6240\u4EE5\u540C\u65F6\u5199\u6570\u636E\u533A\u90A3\u884C\u3002 */
    $('#btnResetRecords').addEventListener('click', () => {
      const mode = store.settings.mode;
      resetModeData(mode);
      renderSidebar();
      updateModeFeedback('\u5DF2\u91CD\u7F6E\u300C' + modeLabel(mode) + '\u300D\u7684\u8BB0\u5F55', 'info');
    });
    $('#btnRefreshQ').addEventListener('click', () => refreshQuestion(false));
    $('#btnSkipQ').addEventListener('click', () => refreshQuestion(true));
    $('#btnReplay').addEventListener('click', () => debugReplay());
    // \u9898\u76EE\u91CC\u7684\u5347\u964D\u8C03\u5FEB\u6377\u5207\u6362\uFF08\u5BF9\u5E94\u51E0\u79CD\u5E38\u7528\u7EC4\u5408\uFF0C\u53EF\u591A\u9009\uFF09
    document.querySelectorAll('#accModeQuick .seg-btn').forEach((b) => {
      b.addEventListener('click', () => setAccSel(accSelFromMode(b.dataset.mode)));
    });
    // 6 \u5F26\u5728\u4E0A / \u5728\u4E0B\uFF1A\u8BE5\u9879\u529F\u80FD\u5DF2\u79FB\u9664\uFF08\u6307\u677F\u53EA\u6309\u771F\u5B9E\u6BD4\u4F8B\u7ED8\u5236\u4E00\u5957\u5F26\u5E8F\uFF09
    // \u627E\u4F4D\u7F6E\u6A21\u5F0F\u8C03\u8BD5\uFF1A\u968F\u610F\u70B9\u51FB / \u663E\u793A\u5168\u90E8\u97F3\u540D
    document.querySelectorAll('#posDebugSeg .seg-btn').forEach((b) => {
      b.addEventListener('click', () => {
        if (b.dataset.posDebug === 'free') {
          store.settings.posFreeClick = !store.settings.posFreeClick;
          board.hover = null;
        } else {
          store.settings.posShowAllNames = !store.settings.posShowAllNames;
        }
        save();
        if ($('#posFreeClickSet')) $('#posFreeClickSet').checked = !!store.settings.posFreeClick;
        if ($('#posShowAllNamesSet')) $('#posShowAllNamesSet').checked = !!store.settings.posShowAllNames;
        syncPosDebugSeg();
        renderFretboard();
      });
    });
    /* \u2014\u2014 \u8BBE\u7F6E\uFF1A\u5347\u964D\u8C03\u591A\u9009 \u2014\u2014 */    $('#swSharp').addEventListener('change', () => {
      const sel = accSel();
      setAccSel({ nat: true, sharp: $('#swSharp').checked, flat: sel.flat });
    });
    $('#swFlat').addEventListener('change', () => {
      const sel = accSel();
      setAccSel({ nat: true, sharp: sel.sharp, flat: $('#swFlat').checked });
    });
    $('#natOnlyBtn').addEventListener('click', () => setAccSel({ nat: true, sharp: false, flat: false }));
    $('#sharpOnlyPreset').addEventListener('click', () => setAccSel({ nat: true, sharp: true, flat: false }));
    $('#flatOnlyPreset').addEventListener('click', () => setAccSel({ nat: true, sharp: false, flat: true }));
    $('#sharpFlatPreset').addEventListener('click', () => setAccSel(accSelFromMode('sharpflat')));
    $('#anyAccBtn').addEventListener('click', () => setAccSel({ nat: true, sharp: true, flat: true }));

    /* \u2014\u2014 \u8BBE\u7F6E\uFF1A\u8C03\u8BD5\u6A21\u5F0F\uFF08\u51B3\u5B9A\u9876\u90E8\u8C03\u8BD5\u680F\u662F\u5426\u51FA\u73B0\uFF09 \u2014\u2014 */
    $('#debugModeSet').addEventListener('change', (e) => {
      store.settings.debugMode = e.target.checked;
      save();
      applyDebugMode();
    });

    /* \u2014\u2014 \u8BBE\u7F6E\uFF1A\u627E\u4F4D\u7F6E\u6A21\u5F0F \u2014\u2014 */
    $('#posClickSoundSet').addEventListener('change', (e) => {
      store.settings.posClickSound = e.target.checked;
      save();
    });
    $('#posFreeClickSet').addEventListener('change', (e) => {
      store.settings.posFreeClick = e.target.checked;
      save();
      board.hover = null;
      renderFretboard();
      const pf = $('#posFeedback');
      if (pf) {
        pf.className = 'feedback pos-feedback info';
        pf.textContent = e.target.checked ? '\u968F\u610F\u70B9\u51FB\u5DF2\u5F00\u542F\uFF1A\u70B9\u683C\u5B50\u53EA\u53D1\u58F0\uFF0C\u4E0D\u4F1A\u9009\u4E2D\u6216\u5224\u5206' : '';
      }
    });
    $('#posShowAllNamesSet').addEventListener('change', (e) => {
      store.settings.posShowAllNames = e.target.checked;
      save();
      renderFretboard();
    });

    /* \u2014\u2014 \u8BBE\u7F6E\uFF1A\u91CD\u7F6E \u2014\u2014 */
    $('#btnResetProgress').addEventListener('click', () => {
      const mode = store.settings.mode;
      if (!confirm('\u786E\u5B9A\u6E05\u7A7A\u300C' + modeLabel(mode) + '\u300D\u7684\u5B66\u4E60\u6570\u636E\uFF08\u8BB0\u5F55\u3001\u7EDF\u8BA1\u3001\u6700\u9700\u8981\u7EC3\uFF09\u5417\uFF1F\n\u5176\u5B83\u6A21\u5F0F\u4E0D\u53D7\u5F71\u54CD\u3002\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002')) return;
      resetModeData(mode);
      closeModals();
      /* \u91CD\u5F00\u300C\u672C\u6A21\u5F0F\u300D\u81EA\u5DF1\u7684\u4E00\u8F6E\uFF1A\u4EE5\u524D\u8FD9\u91CC\u4E00\u5F8B\u8C03 startRound()\uFF0C
         \u800C startRound \u91CC\u6709 modeStatOf(mode==='pos'?'pos':'note').streak = 0\uFF0C
         \u4E8E\u662F\u5728\u548C\u5F26 / \u97F3\u7A0B\u6A21\u5F0F\u4E0B\u6E05\u6570\u636E\u4F1A\u628A\u97F3\u540D\u6216\u627E\u4F4D\u7F6E\u7684\u8FDE\u5BF9\u4E00\u8D77\u6E05\u6389\u3002 */
      if (mode === 'chord') startChordRound();
      else if (mode === 'interval') startIntervalRound();
      else startRound();
    });
    $('#btnResetDataHere').addEventListener('click', () => {
      const mode = store.settings.mode;
      if (!confirm('\u786E\u5B9A\u6E05\u7A7A\u300C' + modeLabel(mode) + '\u300D\u7684\u5B66\u4E60\u6570\u636E\uFF08\u8BB0\u5F55\u3001\u7EDF\u8BA1\u3001\u6700\u9700\u8981\u7EC3\uFF09\u5417\uFF1F\n\u5176\u5B83\u6A21\u5F0F\u4E0D\u53D7\u5F71\u54CD\u3002\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002')) return;
      resetModeData(mode);
      /* \u8BBE\u7F6E\u5F39\u7A97\u76D6\u7740\u7EC3\u4E60\u89C6\u56FE\uFF1A\u53EA\u5199 .feedback \u7528\u6237\u770B\u4E0D\u89C1\uFF0C\u8FD9\u91CC\u5199\u6570\u636E\u533A\u90A3\u884C\u5E76\u5237\u65B0\u4FA7\u680F */
      renderSidebar();
      setDataNote('\u5DF2\u91CD\u7F6E\u300C' + modeLabel(mode) + '\u300D\u7684\u8BB0\u5F55\u4E0E\u5F85\u7EC3\u3002', 'ok');
      updateModeFeedback('\u5DF2\u91CD\u7F6E\u300C' + modeLabel(mode) + '\u300D\u7684\u8BB0\u5F55\u4E0E\u5F85\u7EC3', 'info');
    });

    /* \u2014\u2014 \u6570\u636E\u4E0E\u91CD\u7F6E\uFF1A\u5BFC\u51FA / \u5BFC\u5165 \u2014\u2014 */
    function importMode() {
      const el = document.querySelector('input[name="importMode"]:checked');
      return el && el.value === 'replace' ? 'replace' : 'merge';
    }
    function importWithSettings() {
      const el = $('#importSettings');
      return !!(el && el.checked);
    }
    if ($('#btnExportData')) {
      $('#btnExportData').addEventListener('click', () => { exportData(); });
    }
    if ($('#btnImportData')) {
      $('#btnImportData').addEventListener('click', () => { $('#importFile').click(); });
    }
    if ($('#importFile')) {
      $('#importFile').addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (importMode() === 'replace' &&
            !confirm('\u300C\u8986\u76D6\u300D\u4F1A\u5148\u6E05\u7A7A\u5F53\u524D\u5168\u90E8\u8BB0\u5F55\uFF0C\u518D\u5BFC\u5165\u6240\u9009\u6587\u4EF6\u3002\u786E\u5B9A\u7EE7\u7EED\u5417\uFF1F')) {
          e.target.value = '';
          return;
        }
        importDataFromFile(file, { mode: importMode(), settings: importWithSettings() });
        e.target.value = '';   // \u5141\u8BB8\u518D\u6B21\u9009\u62E9\u540C\u4E00\u4E2A\u6587\u4EF6
      });
    }

    // \u8BBE\u7F6E\uFF1A\u9009\u9879\u6570\u91CF\uFF08'inf' = \u65E0\u9650\u9009\u9879\uFF1A12 \u4E2A\u97F3\u5168\u90E8\u5217\u51FA\uFF09
    function setOptionCount(n) {
      const inf = n === 'inf' || n === Infinity;
      store.settings.optionCount = inf ? 'inf' : clamp(Number(n) || 7, 2, 12);
      $('#lvOptions').textContent = inf ? '\u65E0\u9650\uFF0812 \u4E2A\u5168\u5217\uFF09' : store.settings.optionCount + ' \u4E2A';
      document.querySelectorAll('#optionQuick .btn').forEach((b) => {
        b.classList.toggle('active', inf ? b.dataset.n === 'inf' : Number(b.dataset.n) === store.settings.optionCount);
      });
      $('#optionRange').classList.toggle('off', inf);
      save();
      if (round.current && round.state === 'asking') buildOptions(round.current);
    }
    $('#optionRange').addEventListener('input', (e) => {
      if (store.settings.optionCount === 'inf') $('#optionRange').classList.remove('off');
      setOptionCount(e.target.value);
    });
    document.querySelectorAll('#optionQuick .btn').forEach((b) => {
      b.addEventListener('click', () => setOptionCount(b.dataset.n));
    });
    // \u8BBE\u7F6E\uFF1A\u7B54\u9519\u540E\u5148\u505C\u4F4F
    $('#pauseWrong').addEventListener('change', (e) => {
      store.settings.pauseOnWrong = e.target.checked;
      save();
    });
    $('#autoStartNextSet').addEventListener('change', (e) => {
      /* \u6309\u6A21\u5F0F\u5404\u5B58\u4E00\u4EFD\uFF08\u7B2C 5 / 7 \u6761\uFF09\uFF1A\u97F3\u540D / \u627E\u4F4D\u7F6E / \u548C\u5F26\u4E92\u4E0D\u5F71\u54CD */
      const mode = store.settings.mode;
      const v = e.target.checked;
      if (mode === 'pos') store.settings.posAutoStartOnNext = v;
      else if (mode === 'chord') store.settings.chordAutoStartOnNext = v;
      else store.settings.autoStartOnNext = v;
      save();
    });
    $('#autoNextCorrectSet').addEventListener('change', (e) => {
      const mode = store.settings.mode;
      const v = e.target.checked;
      if (mode === 'pos') store.settings.posAutoNextOnCorrect = v;
      else if (mode === 'chord') store.settings.chordAutoNextOnCorrect = v;
      else store.settings.autoNextOnCorrect = v;
      save();
    });

    /* \u2014\u2014 \u8BBE\u7F6E\uFF1A\u627E\u4F4D\u7F6E\u73A9\u6CD5\uFF08\u4E0E\u7B54\u9898\u754C\u9762\u5934\u90E8\u7684 #posPlaySeg \u540C\u4E00\u4E2A\u8BBE\u7F6E\uFF09 \u2014\u2014 */
    document.querySelectorAll('#posPlayChips input[name="posPlay"]').forEach((inp) => {
      inp.addEventListener('change', () => {
        if (!inp.checked) return;
        setPosPlay(inp.value === 'a' ? 'a' : 'b');
      });
    });

    /* \u2014\u2014 \u8BBE\u7F6E\uFF1A\u627E\u4F4D\u7F6E\u6A21\u5F0F\u7684\u91CD\u7F6E\uFF08\u53EA\u52A8\u627E\u4F4D\u7F6E\u81EA\u5DF1\u7684\u7EDF\u8BA1\uFF09 \u2014\u2014 */
    const resetPosRound = $('#btnResetPosRound');
    if (resetPosRound) {
      resetPosRound.addEventListener('click', () => {
        round.results = [];
        store.posBStats.done = 0;
        store.posBStats.full = 0;
        store.posBStats.streak = 0;
        store.posBStats.bestCombo = 0;
        store.posBStats.last = null;
        /* \u56FE3 \u7684\u300C\u5DF2\u7B54 / \u603B\u9898\u300D\u5B58\u5728\u5FEB\u7167\u7684 done \u91CC\uFF0C\u4E0D\u6E05\u5B83\u4F1A\u7EE7\u7EED\u663E\u793A\u65E7\u8FDB\u5EA6\u3002 */
        if (round.snapshot) round.snapshot.done.clear();
        flushSave();
        renderSidebar();
        setDataNote('\u5DF2\u6E05\u7A7A\u627E\u4F4D\u7F6E\u6A21\u5F0F\u672C\u8F6E\u7EDF\u8BA1\u3002', 'ok');
      });
    }
    const resetPosData = $('#btnResetPosData');
    if (resetPosData) {
      resetPosData.addEventListener('click', () => {
        store.posRecent = [];
        store.posUnitStats = {};
        store.posBStats = { done: 0, full: 0, streak: 0, bestCombo: 0, last: null };
        store.modeStats.pos = blankModeStat();
        round.snapshot = null;
        round.results = [];
        round.streak = 0;
        round.bestStreak = 0;
        round.lastKey = null;
        /* \u5386\u53F2\u91CC\u5E26 m \u5F52\u5C5E\uFF0C\u5220\u6389\u627E\u4F4D\u7F6E\u90A3\u51E0\u6761\u4E0D\u4F1A\u78B0\u5230\u97F3\u540D / \u548C\u5F26 / \u97F3\u7A0B\uFF1B
           \u4E0D\u5220\u7684\u8BDD\u7EDF\u8BA1\u5F39\u7A97\u300C\u6700\u6613\u9519\u7684\u533A\u57DF\u300D\u4ECD\u4F1A\u628A\u627E\u4F4D\u7F6E\u7684\u7B54\u9519\u8BB0\u5F55\u5217\u51FA\u6765\uFF0C
           \u770B\u8D77\u6765\u50CF\u662F\u6CA1\u6E05\u5E72\u51C0\u3002 */
        store.history = store.history.filter((h) => (h.m || 'note') !== 'pos');
        /* \u5B66\u4E60\u5361\u7247\uFF1A\u627E\u4F4D\u7F6E\u73B0\u5728\u6709\u81EA\u5DF1\u7684 store.posCards\uFF08\u952E\u5F62\u72B6\u548C\u97F3\u540D\u4E00\u6837\uFF0C\u4F46\u5B58\u5728
           \u53E6\u4E00\u4E2A map \u91CC\uFF09\uFF0C\u6240\u4EE5\u8FD9\u91CC\u53EF\u4EE5\u6574\u4EFD\u6E05\u6389 \u2014\u2014 \u97F3\u540D\u7684 store.cards \u4E00\u683C\u4E0D\u52A8\u3002
           \u4EE5\u524D\u4E24\u6A21\u5F0F\u5171\u7528\u4E00\u4E2A map\uFF0C\u6E05\u8FD9\u4E2A\u6309\u94AE\u8981\u4E48\u6E05\u4E0D\u5E72\u51C0\u3001\u8981\u4E48\u8BEF\u4F24\u97F3\u540D\u3002 */
        store.posCards = {};
        flushSave();
        renderSidebar();
        setDataNote('\u5DF2\u6E05\u7A7A\u627E\u4F4D\u7F6E\u5B66\u4E60\u6570\u636E\u3002\u5176\u5B83\u4E09\u4E2A\u6A21\u5F0F\u7684\u8BB0\u5F55\u4FDD\u6301\u4E0D\u53D8\u3002', 'ok');
      });
    }

    // \u5FEB\u6377\u952E
    document.addEventListener('keydown', (e) => {
      /* \u4E3B\u9875\u786E\u8BA4\u6761\u5C55\u5F00\u65F6\u5B83\u5C31\u662F\u5F53\u524D\u7684\u300C\u6700\u4E0A\u5C42\u300D\uFF1AEsc \u53EA\u6536\u5B83\uFF0C
         \u6570\u5B57\u952E / Enter \u4E5F\u4E0D\u80FD\u7A7F\u900F\u53BB\u9009\u6A21\u5F0F\uFF08\u5426\u5219\u4E00\u8FB9\u786E\u8BA4\u4E00\u8FB9\u8FDB\u4E86\u65B0\u9875\u9762\uFF09\u3002 */
      if (homeConfirmOpen()) {
        if (e.key === 'Escape') { e.preventDefault(); closeHomeConfirm(); return; }
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
          const tag = (e.target && e.target.tagName) || '';
          const onButton = tag === 'BUTTON' || tag === 'A' || tag === 'INPUT';
          if (!onButton) { e.preventDefault(); return; }
          return;
        }
        if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') { e.preventDefault(); return; }
      }
      if (e.key === 'Escape') { closeModals(); return; }
      const anyModal = Array.from(document.querySelectorAll('.modal')).some((m) => !m.hidden);
      if (anyModal) return;
      // \u4E3B\u9875\uFF1A\u6570\u5B57\u952E 1/2/3/4 \u76F4\u63A5\u9009\u6A21\u5F0F\uFF0CEnter \u8FDB\u5165\u4E0A\u6B21\u7684\u6A21\u5F0F
      if (ui.screen === 'home') {
        if (e.key === '1') { e.preventDefault(); pickMode('note'); return; }
        if (e.key === '2') { e.preventDefault(); pickMode('pos'); return; }
        if (e.key === '3') { e.preventDefault(); pickMode('chord'); return; }
        if (e.key === '4') { e.preventDefault(); pickMode('interval'); return; }
        if (e.key === 'Enter') { e.preventDefault(); pickMode(store.settings.mode || 'note'); return; }
        return;
      }

      /* \u2014\u2014 \u548C\u5F26\u6A21\u5F0F\uFF1A\u4E00\u5957\u5B8C\u5168\u72EC\u7ACB\u7684\u952E\u76D8\u8BED\u4E49\uFF08\u7B56\u5212\u4E66 \u00A74.7 / \u00A74.5\uFF09\u2014\u2014
         A \u73A9\u6CD5\uFF1A\u7A7A\u683C = \u5F00\u59CB / \u8BD5\u542C\uFF1BEnter = \u5F00\u59CB / \u63D0\u4EA4 / \u4E0B\u4E00\u9898\uFF1BBackspace = \u6E05\u7A7A\uFF1B
         1\u20136 = \u8BE5\u5F26\u5207\u56DE\u9759\u97F3\uFF08\u952E\u76D8\u53EA\u8D1F\u8D23\u300C\u6E05\u300D\uFF0C\u6446\u4F4D\u5929\u751F\u662F\u9F20\u6807/\u89E6\u6478\u4EFB\u52A1\uFF09\u3002
         B \u73A9\u6CD5\uFF1A1\u20136 = \u76F4\u9009\u7B2C N \u4E2A\u9009\u9879\uFF08\u70B9\u5373\u5224\uFF0C\u4E0D\u9700\u8981\u518D\u6309\u63D0\u4EA4\uFF09\uFF1B\u7A7A\u683C = \u91CD\u542C\u8FD9\u6761\u6307\u6CD5\u3002 */
      if (store.settings.mode === 'chord') {
        const chordStarting = chordRound.state === 'asking' && chordRound.waitStart;
        const playNow = chordRound.play || chordPlayMode();
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          if (chordStarting) beginChordQuestion();
          else playChordSelection();
          return;
        }
        if (e.key === 'Enter' || e.key === 'ArrowRight') {
          e.preventDefault();
          if (chordStarting) { beginChordQuestion(); return; }
          if (playNow === 'b') {
            /* B \u662F\u70B9\u5373\u5224\uFF1A\u7B54\u9898\u4E2D\u6309 Enter \u6CA1\u6709\u300C\u63D0\u4EA4\u300D\u53EF\u505A\uFF0C\u76F4\u63A5\u8FDB\u4E0B\u4E00\u9898 */
            if (chordRound.state === 'asking') return;
            if (chordRound.state === 'answered') { chordAdvanceNow(); return; }
            if (chordRound.state === 'idle') { startChordRound(); return; }
            return;
          }
          if (chordRound.state === 'asking') { submitChord(false); return; }
          if (chordRound.state === 'answered') { chordAdvanceNow(); return; }
          if (chordRound.state === 'idle') { startChordRound(); return; }
          return;
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
          if (chordRound.state === 'asking' && playNow === 'a') {
            e.preventDefault();
            chordClearAll();
          }
          return;
        }
        if (/^[1-6]$/.test(e.key) && chordRound.state === 'asking' && !chordRound.waitStart) {
          if (playNow === 'b') {
            /* B\uFF1A\u6570\u5B57\u952E\u76F4\u9009\u9009\u9879\uFF08\u6309\u5C4F\u5E55\u4E0A\u7684\u987A\u5E8F\uFF0C\u4E0D\u770B\u9898\u5E93\u987A\u5E8F\uFF09 */
            const n = Number(e.key) - 1;
            const opts = chordRound.options || [];
            if (n < opts.length) {
              e.preventDefault();
              const btn = document.querySelectorAll('#chordOptions .chord-opt')[n];
              if (btn && !btn.disabled) chooseChordOption({
                qi: Number(btn.dataset.qi), pc: Number(btn.dataset.root), id: btn.dataset.quality
              });
            }
            return;
          }
          e.preventDefault();
          chordMuteString(Number(e.key));
          return;
        }
        if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey) setMuted(!soundOf(store.settings.mode).muted, store.settings.mode);
        return;
      }

      /* \u2014\u2014 \u97F3\u7A0B\u6A21\u5F0F\uFF1A\u4E00\u5957\u5B8C\u5168\u72EC\u7ACB\u7684\u952E\u76D8\u8BED\u4E49\uFF08\u00A713.4 / E1\uFF09\u2014\u2014
         \u73A9\u6CD5 A\uFF1A1\u20139 \u9009\u9009\u9879\uFF08\u70B9\u5373\u5224\uFF09\uFF1BEnter = \u5F00\u59CB/\u4E0B\u4E00\u9898\u3002
         \u73A9\u6CD5 B\uFF1AEnter = \u63D0\u4EA4\uFF1BBackspace = \u53D6\u6D88\u9009\u62E9\u3002
         \u7A7A\u683C\u5728\u4E24\u4E2A\u73A9\u6CD5\u91CC\u90FD\u662F\u300C\u5F00\u59CB / \u91CD\u542C\u8D77\u70B9\u97F3\u300D\u3002 */
      if (store.settings.mode === 'interval') {
        const starting = intervalRound.state === 'asking' && intervalRound.waitStart;
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          if (starting) beginIntervalQuestion();
          else playIntervalStartOnly('manual');
          return;
        }
        if (e.key === 'Enter' || e.key === 'ArrowRight') {
          e.preventDefault();
          if (starting) { beginIntervalQuestion(); return; }
          if (intervalRound.state === 'asking') {
            if (intervalRound.play === 'b') { submitInterval(false); return; }
            return;   // \u73A9\u6CD5 A \u5FC5\u987B\u70B9\u9009\u9879\uFF0CEnter \u4E0D\u4EE3\u66FF\u4F5C\u7B54
          }
          if (intervalRound.state === 'answered') { intervalAdvanceNow(); return; }
          if (intervalRound.state === 'idle') { startIntervalRound(); return; }
          return;
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
          if (intervalRound.state === 'asking' && intervalRound.play === 'b') {
            e.preventDefault();
            clearIntervalPick();
          }
          return;
        }
        if (/^[1-9]$/.test(e.key) && intervalRound.state === 'asking'
          && !intervalRound.waitStart && intervalRound.play === 'a') {
          const idx = Number(e.key) - 1;
          const opt = intervalRound.options[idx];
          if (opt) { e.preventDefault(); chooseIntervalOption({ id: opt.id, dir: opt.dir }); }
          return;
        }
        if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey) setMuted(!soundOf(store.settings.mode).muted, store.settings.mode);
        return;
      }

      const starting = round.state === 'asking' && round.waitStart;
      const posMode = store.settings.mode === 'pos';
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        // \u7B49\u5F85\u5F00\u59CB\u65F6\uFF1A\u5F00\u59CB\u8BA1\u65F6\uFF1B\u5DF2\u5F00\u59CB\uFF1A\u518D\u542C\u4E00\u6B21
        if (starting) beginQuestion();
        else playCurrent();
        return;
      }
      if (e.key === 'Enter' || e.key === 'ArrowRight') {
        if (starting) { e.preventDefault(); beginQuestion(); return; }
        // \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1A\u7B54\u9898\u4E2D Enter = \u63D0\u4EA4\u7B54\u6848\uFF08\u63D0\u4EA4\u540E\u624D\u80FD\u8FDB\u5165\u4E0B\u4E00\u9898\uFF09
        if (posMode && round.state === 'asking') { e.preventDefault(); submitPositions(); return; }
        if (round.state === 'answered') { e.preventDefault(); advanceNow(); return; }
        if (round.state === 'idle') { e.preventDefault(); startRound(); return; }
        return;
      }
      // \u627E\u4F4D\u7F6E\u6A21\u5F0F\uFF1ABackspace / Delete \u6E05\u7A7A\u5DF2\u9009
      if (posMode && (e.key === 'Backspace' || e.key === 'Delete')) {
        if (round.state === 'asking') { e.preventDefault(); clearPicks(); }
        return;
      }
      if (store.settings.mode === 'note' && round.state === 'asking' && /^[1-9]$/.test(e.key)) {
        const b = document.querySelectorAll('#options .opt')[Number(e.key) - 1];
        if (b) b.click();
      }
      // \u8C03\u8BD5\u5FEB\u6377\u952E\uFF1AR \u6362\u4E00\u9898\uFF0CL \u91CD\u542C\uFF08Space \u4E5F\u53EF\u4EE5\uFF09
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) refreshQuestion(false);
      // \u5FEB\u6377\u952E M\uFF1A\u9759\u97F3 / \u6062\u590D
      if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey) setMuted(!soundOf(store.settings.mode).muted, store.settings.mode);
    });

    let resizeT = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => { computeLayout(); fitCanvas(); renderFretboard(); }, 120);
    });

    /* \u4FA7\u680F\u6539\u4E3A\u300C\u4E8B\u4EF6\u9A71\u52A8\u300D\uFF1A\u4E0D\u518D\u5B9A\u65F6\u8F6E\u8BE2\u5230\u671F\u5217\u8868\uFF08\u00A77.3\uFF09 */
    window.addEventListener('beforeunload', flushSave);
  }

  /* ---------------------------------------------------------------
   *  \u542F\u52A8
   * --------------------------------------------------------------- */
  function boot() {
    /* \u4E3B\u9875\u5165\u573A\u8FC7\u6E21\uFF1A\u521D\u59CB\u5316\u4E00\u6B21\uFF08\u5143\u7D20\u5B58\u5728\u624D\u542F\u7528\uFF0C\u7F3A\u5931\u65F6\u81EA\u52A8\u8DF3\u8FC7\u52A8\u753B\uFF09 */
    if (window.homeIntro && typeof window.homeIntro.init === 'function') window.homeIntro.init();

    /* SVG \u6307\u677F\u5148\u53D1\u8D77\u8F7D\u5165\uFF08\u4E0D\u963B\u585E\u5176\u5B83\u521D\u59CB\u5316\uFF09\uFF0C\u8F7D\u5165\u5B8C\u6210\u540E\u624D\u5141\u8BB8\u91CD\u7ED8\uFF1A
       boardSvg \u672A\u5C31\u7EEA\u65F6\u53E0\u52A0\u5C42\u8FD8\u4E0D\u5B58\u5728\uFF0C\u6B64\u65F6\u7ED8\u5236\u6CA1\u6709\u610F\u4E49\u3002 */
    let boardLoad = Promise.resolve(false);
    if (typeof initBoardSvg === 'function') {
      boardLoad = initBoardSvg()
        .then((ok) => {
          boardSvgActive = !!(ok && !boardSvg.degraded);
          if (boardSvgActive) {
            /* \u5C31\u4F4D\u540E\u7ACB\u523B\u5957\u7528\u5404\u81EA\u7684\u300C\u8303\u56F4\u300D\u8BBE\u7F6E\u3002
               \u4E09\u5757\u6307\u677F\u4E92\u4E0D\u76F8\u540C\uFF1A\u97F3\u540D / \u627E\u4F4D\u7F6E / \u548C\u5F26\u5404\u53D6\u81EA\u5DF1\u7684\u5B57\u6BB5\u3002 */
            if (typeof boardSvg.setRange === 'function') {
              boardSvg.setRange(Number(store.settings.noteRange.split('-')[1]) || 12, ['fretboard']);
              boardSvg.setRange(Number(store.settings.posRange.split('-')[1]) || 12, ['posFretboard']);
              boardSvg.setRange(chordRangeFretMax(), ['chordFretboard']);
              boardSvg.setRange(intervalFretMax(), ['intervalFretboard']);
            }
            boardSvg.resize();
          }
          return boardSvgActive;
        })
        .catch(() => false);
    }
    /* \u7B49 SVG \u5C31\u7EEA\u540E\u518D\u753B\u7B2C\u4E00\u5E27\u3002
       \u82E5\u8F7D\u5165\u5931\u8D25\uFF08degraded\uFF09\uFF0C\u5BB9\u5668\u91CC\u662F\u4E00\u5F20\u9759\u6001 <img>\uFF0C\u53E0\u52A0\u5C42\u4E0D\u53EF\u7528\uFF0C
       \u6B64\u65F6\u4E0D\u91CD\u7ED8 \u2014\u2014 \u97F3\u540D\u6A21\u5F0F\u4ECD\u53EF\u7528\u9009\u9879\u4F5C\u7B54\uFF0C\u53E6\u4E24\u4E2A\u6A21\u5F0F\u4F1A\u81EA\u5DF1\u7ED9\u51FA\u63D0\u793A\u3002 */
    boardLoad.then((svgOk) => {
      if (svgOk) { renderFretboard(); renderChordFretboard(); }
    });

    load();
    repairCards();
    computeLayout();
    fitCanvas();
    updateViewLabel();
    bindEvents();
    syncSettingsUI();
    applyModeView();

    buildOptions(null);
    applySidebar();
    updateSoundStatus();
    // \u5185\u5D4C\u91C7\u6837\u811A\u672C\uFF08\u5982\u679C\u5B58\u5728\uFF09\u4F1A\u5728\u542F\u52A8\u540E\u624D\u52A0\u8F7D\u5B8C\uFF0C\u5C4A\u65F6\u5237\u65B0\u4E00\u6B21\u72B6\u6001\u5E76\u542F\u52A8\u97F3\u9891
    if (document.documentElement.dataset.samplesInline === '1' && !audioInitStarted) ensureAudio();

    // \u4F5C\u7B54\u540E\u9AD8\u5149\u52A8\u753B
    setInterval(() => {
      if (round.state === 'answered' && nowMs() - round.answeredAt < 600) renderFretboard();
    }, 60);

    // \u542F\u52A8\u5148\u5230\u4E3B\u9875\u9009\u6A21\u5F0F\uFF1B\u7EC3\u4E60\u754C\u9762\u5728\u540E\u53F0\u6392\u597D\u9898\u4F46\u4E0D\u8BA1\u65F6
    startRound();
    round.booted = true;
    showHome();
    // \u8C03\u8BD5/\u81EA\u52A8\u5316\u6D4B\u8BD5\u5165\u53E3\uFF08\u4E0D\u5F71\u54CD\u529F\u80FD\uFF09
    // \u6CE8\u610F\uFF1Astore \u5728 load() \u4E2D\u4F1A\u88AB\u6574\u4F53\u66FF\u6362\uFF0C\u8FD9\u91CC\u7528 getter \u59CB\u7EC8\u8FD4\u56DE\u5F53\u524D\u5BF9\u8C61\uFF0C\u907F\u514D\u62FF\u5230\u5931\u6548\u7684\u65E7\u5F15\u7528\u3002
    window.__gft = {
      audio: audio, round: round, midiOf: midiOf, board: board,
      /* \u6D4B\u8BD5\u94A9\u5B50\uFF1ASVG \u6307\u677F\u7684\u547D\u4E2D\u5224\u5B9A\uFF08clientX/clientY + \u5BB9\u5668 id\uFF09\u3002
         \u65E9\u671F\u8FD9\u91CC\u662F Canvas \u7684 hitTest({x,y})\uFF0CCanvas \u6574\u4F53\u79FB\u9664\u540E\u8FD9\u6761\u65AD\u8A00\u5C31\u5931\u6548\u4E86\uFF1B
         \u73B0\u5728\u76F4\u63A5\u628A board-svg \u7684\u771F\u5B9E\u547D\u4E2D\u51FD\u6570\u66B4\u9732\u51FA\u53BB\u3002 */
      hitTest: (pt, id) => {
        if (typeof boardSvg === 'undefined' || !boardSvg || !boardSvg.loaded) return null;
        const p = pt || {};
        return boardSvg.hitTest(p.x, p.y, id || 'fretboard');
      },
      /* \u6D4B\u8BD5\u94A9\u5B50\uFF1A\u628A\u67D0\u683C\u5B50\u7684\u4E2D\u5FC3\u6362\u7B97\u6210\u5C4F\u5E55\u5750\u6807\uFF08\u7528\u4E8E\u771F\u5B9E\u70B9\u51FB\uFF09\u3002
         \u6362\u7B97\u5FC5\u987B\u5E26\u4E0A viewBox \u7684 x/y \u504F\u79FB\uFF08\u6307\u677F SVG \u7684 viewBox \u4E0D\u662F\u4ECE 0,0 \u5F00\u59CB\uFF09\u3002 */
      cellScreenPoint: (s, f, id) => {
        if (typeof boardSvg === 'undefined' || !boardSvg || !boardSvg.loaded) return null;
        const vid = id || 'fretboard';
        const v = boardSvg.view(vid);
        if (!v || !v.svg) return null;
        const rect = v.host.getBoundingClientRect();
        const c = boardSvg.cellCenter(Number(s), Number(f));
        if (!c) return null;
        const vb = v.svg.viewBox && v.svg.viewBox.baseVal;
        const vbW = (vb && vb.width) || 1200;
        const vbH = (vb && vb.height) || 320;
        const vbX = (vb && vb.x) || 0;
        const vbY = (vb && vb.y) || 0;
        const sx = (rect.width || 1) / vbW;
        const sy = (rect.height || 1) / vbH;
        return {
          x: rect.left + (c.x - vbX) * sx,
          y: rect.top + (c.y - vbY) * sy,
        };
      },
      timeLimitFor: timeLimitFor,
      allowedPcs: allowedPcs, makeOptionSet: makeOptionSet,
      buildCandidates: buildCandidates,
      get store() { return store; },
      get screen() { return ui.screen; },
      showHome: showHome,
      enterMode: enterMode,
      schedule: (n) => buildSchedule(n || store.settings.size, null).map((x) => Object.assign({ card: store.cards[x.key] }, x)),
      refresh: (m) => refreshQuestion(m),
      beginQuestion: beginQuestion,
      advanceNow: advanceNow,
      startRound: startRound,
      // \u627E\u4F4D\u7F6E\u6A21\u5F0F\u6D4B\u8BD5\u94A9\u5B50
      pos: pos,
      togglePick: togglePick,
      submitPositions: submitPositions,
      clearPicks: clearPicks,
      targetPositions: () => targetPositions(round.current),
      /* \u627E\u4F4D\u7F6E A/B \u73A9\u6CD5\u6D4B\u8BD5\u94A9\u5B50 */
      posPlay: () => (posPlayA() ? 'a' : 'b'),
      setPosPlay: (p) => setPosPlay(p),
      posUnits: () => posUnits().map((u) => Object.assign({}, u)),
      posCellsFor: (s, pc) => posCellsFor(s, pc).map((c) => ({ s: c.s, f: c.f })),
      posSchedule: (n) => buildPosSchedule(n || (posPlayA() ? store.settings.size : 1), null),
      questionToneMidi: () => questionToneMidi(round.current),
      posRecent: () => store.posRecent.slice(),
      posUnitStats: () => JSON.parse(JSON.stringify(store.posUnitStats)),
      modeStats: () => JSON.parse(JSON.stringify(store.modeStats)),
      renderSidebar: (m) => renderSidebar(m),
      snapshotOf: (m) => {
        const s = m === 'chord' ? chordRound.snapshot : (m === 'interval' ? intervalRound.snapshot : round.snapshot);
        return s ? { plan: s.plan, newKeys: s.newKeys.size, reviewKeys: s.reviewKeys.size, done: s.done.size } : null;
      },
      posBStats: () => Object.assign({}, store.posBStats),
      // \u6D4B\u8BD5\u7528\uFF1A\u628A\u5F53\u524D\u9898\u6309\u201C\u5BF9/\u9519\u201D\u771F\u5B9E\u4F5C\u7B54\u4E00\u6B21\uFF08\u8D70 resolveAnswer \u7684\u5B8C\u6574\u903B\u8F91\uFF09\uFF0C
      // \u7528\u4E8E\u9A8C\u8BC1\u5EF6\u8FDF\u91CD\u73B0\u4E0E\u8FD1\u671F\u8868\u73B0\uFF1B\u53EF\u7531\u81EA\u52A8\u6D4B\u8BD5\u8C03\u7528\u3002
      answerCurrent: (correct) => {
        const q = round.current;
        if (!q || round.state !== 'asking') return { ok: false, reason: 'not asking' };
        round.waitStart = false;
        round.infinite = round.limit === Infinity;
        round.startAt = round.startAt || nowMs();
        const pc = pcOf(midiOf(q.s, q.f));
        resolveAnswer(correct ? pc : (pc + 1) % 12, false);
        return { ok: true, key: q.key, state: round.state };
      },
      // \u6A21\u62DF\u4F5C\u7B54\u4E00\u6B21\uFF1A\u8D70\u4E0E\u771F\u5B9E\u4F5C\u7B54\u76F8\u540C\u7684 SRS / \u8FD1\u671F\u8BB0\u5F55\u903B\u8F91\uFF08\u4E0D\u89E6\u53D1 UI \u6D41\u7A0B\uFF09
      answerForTest: (key, ok, ms) => {
        const m = key.match(/^s(\d+)f(\d+)$/);
        const s = Number(m[1]);
        const f = Number(m[2]);
        const card = getCard(key);
        const totalMs = store.settings.time === 'inf' ? Infinity : store.settings.time * 1000;
        card.s = s; card.f = f; card.last = nowMs();
        let intervalMin;
        if (ok) {
          card.a++; card.cn++;
          const fast = ms < totalMs * 0.45;
          const jump = (card.a >= 3 && card.e === 0 && card.a % 2 === 1) ? 2 : 1;
          card.lvl = clamp(card.lvl + jump, 1, SRS_INTERVALS.length);
          if (card.lvl === 1 && card.a >= 2) card.lvl = clamp((card.best || 1) - 1, 1, SRS_INTERVALS.length);
          intervalMin = SRS_INTERVALS[card.lvl - 1] * (fast ? 1.1 : 1);
          card.best = Math.max(card.best || 0, card.lvl);
        } else {
          card.e++; card.cn = 0;
          card.lvl = card.lvl >= 4 ? card.lvl - 1 : 0;
          intervalMin = card.lvl >= 4 ? SRS_INTERVALS[card.lvl - 1] : SRS_INTERVALS[0];
        }
        card.due = nowMs() + intervalMin * 60000;
        card.recent = Array.isArray(card.recent) ? card.recent.slice(-(RECENT_WINDOW - 1)) : [];
        card.recent.push(!!ok);
        /* \u4E0E\u771F\u5B9E\u4F5C\u7B54\u4FDD\u6301\u540C\u4E00\u5957\u5199\u5165\uFF1A\u56FE1 \u7684 hist \u4E0E\u56FE2 \u7684 modeStats \u90FD\u8981\u8DDF\u7740\u52A8\uFF0C
           \u5426\u5219\u7528\u8FD9\u4E2A\u94A9\u5B50\u9020\u51FA\u6765\u7684\u6570\u636E\u5728\u4FA7\u680F\u91CC\u770B\u4E0D\u5230\u3002
           \u540C\u65F6\u8981\u5199\u4E00\u6761 store.history\uFF08\u5E26 m \u5F52\u5C5E\uFF09\uFF0C\u56E0\u4E3A\u300C\u6309\u6A21\u5F0F\u6E05\u7A7A\u300D\u9760\u5B83\u5224\u65AD
           \u67D0\u4E2A\u683C\u5B50\u5F52\u97F3\u540D\u8FD8\u662F\u627E\u4F4D\u7F6E\uFF0C\u7F3A\u4E86\u8FD9\u6761\u94A9\u5B50\u9020\u7684\u6570\u636E\u5C31\u6210\u4E86\u65E0\u4E3B\u5361\u7247\u3002 */
        pushHist(card, !!ok);
        bumpModeStats('note', !!ok);
        store.history.push({ s: s, f: f, ok: !!ok, t: card.last, ms: ms, lvl: card.lvl, m: 'note' });
        if (store.history.length > 300) store.history = store.history.slice(-300);
        return card;
      },
      // \u6570\u636E\u5907\u4EFD\uFF1A\u5BFC\u51FA / \u5BFC\u5165\uFF08\u5BFC\u5165\u53EF\u4F20 { mode: 'merge'|'replace', settings: true|false }\uFF09
      exportData: () => exportData(),
      buildBackup: () => buildBackup(),
      parseBackup: (text) => parseBackup(text),
      importDataText: (text, opts) => importDataText(text, opts),

      /* \u2014\u2014 \u548C\u5F26\u6A21\u5F0F\u6D4B\u8BD5\u94A9\u5B50 \u2014\u2014 */
      chord: chordRound,
      chordPool: () => chordPool(),
      chordPoolDiagnosis: () => chordPoolDiagnosis(),
      chordRangeFretMax: () => chordRangeFretMax(),
      chordKey: chordKey,
      getChordCard: getChordCard,
      startChordRound: startChordRound,
      nextChordQuestion: nextChordQuestion,
      beginChordQuestion: beginChordQuestion,
      /* \u6446\u4F4D\uFF08\u7B56\u5212\u4E66 \u00A74.5 \u7684\u624B\u52BF\u8BED\u4E49\uFF0C\u6D4B\u8BD5\u7528\u8FD9\u51E0\u4E2A\u5165\u53E3\uFF0C\u4E0D\u6A21\u62DF pointer \u4E8B\u4EF6\uFF09 */
      chordPlace: chordPlace,
      chordAddBarre: chordAddBarre,
      chordClearString: chordClearString,
      chordRevealAnswer: chordRevealAnswer,
      chordMuteString: chordMuteString,
      chordClearAll: chordClearAll,
      submitChord: (timedOut) => submitChord(!!timedOut),
      playChordSelection: playChordSelection,
      playChordAnswerSelection: playChordAnswerSelection,
      chooseChordOption: (opt) => chooseChordOption(opt),
      /* \u9898\u5E93\u5C42\uFF08\u7B56\u5212\u4E66 \u00A72 / \u00A73\uFF09\uFF1A\u884C\u8868\u3001\u6C60\u5B50\u96C6\u5408\u3001\u98CE\u683C\u3001\u4E0A\u4E0B\u6587\u8BA1\u6570 */
      chordBank: () => bankData(),
      chordRows: () => bankRows(),
      chordRowMatch: (r, skip) => chordRowMatch(r, store.settings, skip || null),
      chordContextCounts: () => chordContextCounts(),
      chordPoolSets: () => chordPoolSets(),
      chordStyleWeight: (qid, style) => chordStyleWeight(qid, style || store.settings.chordStyle),
      chordStyleRemoved: (qid, style) => chordStyleRemoved(qid, style || store.settings.chordStyle),
      chordRowPosition: (r) => chordRowPosition(r),
      chordRowTechnique: (r) => chordRowTechnique(r),
      chordRowWrong: (r) => chordRowWrong(r),
      chordPlayMode: () => chordPlayMode(),
      setChordPlay: (p) => setChordPlay(p),
      syncChordPlayUI: () => syncChordPlayUI(),
      buildBankOptions: (r, need, mode) => buildBankOptions(r, need, mode),
      renderChordOptions: () => renderChordOptions(),

      /* \u2014\u2014 \u97F3\u7A0B\u6A21\u5F0F\u6D4B\u8BD5\u94A9\u5B50\uFF08\u4E0E\u548C\u5F26\u540C\u4E00\u5957\u547D\u540D\u4E60\u60EF\uFF09\u2014\u2014 */
      interval: intervalRound,
      intervalTheory: () => intervalTheory(),
      intervalSnapshot: () => intervalSnapshot(),
      intervalSetA: () => intervalSetA(),
      intervalSetB: () => intervalSetB(),
      intervalFretMax: () => intervalFretMax(),
      intervalStrings: () => intervalStrings(),
      intervalAccSel: () => intervalAccSel(),
      intervalAllowedPcs: () => intervalAllowedPcs(),
      setIntervalAccSel: (next) => setIntervalAccSel(next),
      soundOf: (m) => soundOf(m),
      setSoundOf: (m, patch) => setSoundOf(m, patch),
      resetModeSound: (m) => resetModeSound(m),
      syncIntervalSettingsUI: () => syncIntervalSettingsUI(),
      intervalOptionCount: () => intervalOptionCount(),
      intervalAPool: () => intervalAPool(),
      intervalBPool: () => intervalBPool(),
      /* \u51FA\u9898\u503E\u5411\u8FC7\u6EE4\u7684\u53EA\u8BFB\u94A9\u5B50\uFF08\u6D4B\u8BD5\u7528\uFF09\uFF1A\u4F20\u5165\u6C60\uFF0C\u8FD4\u56DE\u8FC7\u6EE4\u540E\u7684\u6C60 */
      intervalNoveltyFilterA: (list) => intervalNoveltyFilter(list, (g) => intervalCardKeyA(g.id, g.dir, g.shape)),
      intervalNoveltyFilterB: (list) => intervalNoveltyFilter(list, (x) => x.cardKey),
      intervalCardKeyA: intervalCardKeyA,
      intervalCardKeyB: intervalCardKeyB,
      intervalCardWeight: intervalCardWeight,
      getIntervalCard: getIntervalCard,
      startIntervalRound: startIntervalRound,
      nextIntervalQuestion: nextIntervalQuestion,
      beginIntervalQuestion: beginIntervalQuestion,
      chooseIntervalOption: (opt) => chooseIntervalOption(opt),
      pickIntervalTarget: (cell) => pickIntervalTarget(cell),
      clearIntervalPick: clearIntervalPick,
      submitInterval: (timedOut) => submitInterval(!!timedOut),
      advanceInterval: intervalAdvanceNow,
      playIntervalStartOnly: (r) => playIntervalStartOnly(r || 'manual'),
      renderIntervalFretboard: () => renderIntervalFretboard(),
      playChordReference: playChordReference,
      playChordFromFrets: playChordFromFrets,
      chordAdvanceNow: chordAdvanceNow,
      chordNameOf: chordNameOf,
      chordSettingsSnapshot: chordSettingsSnapshot,
      renderChordFretboard: renderChordFretboard,
      chordApplyLayout: () => { computeLayout(); fitCanvas(); renderChordFretboard(); },
      renderChordPrompt: renderChordPrompt,
      renderChordFeedback: (ok, timedOut, verdict) => renderChordFeedback(ok, timedOut, verdict),
      syncChordSettingsUI: syncChordSettingsUI,
      chordSoundingMidis: chordSoundingMidis,
      chordSoundingList: chordSoundingList,
      syncChordUI: syncChordUI,
      /* \u9636\u6BB5\u56DB\u58F0\u97F3\u6D4B\u8BD5\u94A9\u5B50\uFF1A\u53EA\u8BFB\u5730\u89C2\u5BDF\u64AD\u653E\u8C03\u5EA6\uFF0C\u4E0D\u53C2\u4E0E\u4EFB\u4F55\u903B\u8F91\u3002
         lastPlan \u8BB0\u5F55\u300C\u6700\u8FD1\u4E00\u6B21 playChord \u5B9E\u9645\u6392\u51FA\u7684 (\u5F26\u53F7, \u97F3\u9AD8) \u5E8F\u5217\u300D\uFF0C
         \u7528\u6765\u65AD\u8A00\u626B\u5F26\u65B9\u5411\u771F\u7684\u662F\u6309\u5F26\u53F7\u800C\u4E0D\u662F\u6309\u97F3\u9AD8\u3002 */
      chordAudio: {
        get lastPlan() { return audio.lastChordPlan; },
        get batch() { return audio.chordBatch; },
        get sourceCount() { return audio.sources.size; },
        get batchSeq() { return audio.chordBatchSeq; },
        playing() { return audio.chordPlaying(); },
        stop() { audio.stopChord(); },
      },
      /* \u9898\u6C60\u8BCA\u65AD\u94A9\u5B50\uFF1A\u53EA\u7528\u4E8E\u6027\u80FD\u5B9E\u6D4B\u4E0E\u300C\u9898\u6C60\u662F\u5426\u5B8C\u6574\u300D\u7684\u9A8C\u8BC1\uFF0C
         \u4E0D\u53C2\u4E0E\u4EFB\u4F55\u7B54\u9898\u903B\u8F91\u3002 */
      chordPoolCacheClear: () => { chordPoolCache = { key: '', list: [] }; },
      chordPoolCacheSize: () => chordPoolCache.list.length,
    };

    if (!localStorage.getItem(STORAGE_KEY + ':seen-help')) {
      openModal('#helpModal');
      try { localStorage.setItem(STORAGE_KEY + ':seen-help', '1'); } catch (e) { /* \u5B58\u50A8\u4E0D\u53EF\u7528\u65F6\u5FFD\u7565 */ }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
