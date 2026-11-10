/* ============================================================================
 *  SVG 指板（替换原来的 Canvas 指板）
 *
 *  画面来自 assets/guitar/board.svg —— 由源图
 *  guitar-build/guitar-3000-coloured.svg 切出的「指板 / 品柱 / 品记 / 六弦」四层，
 *  品柱和品记都不是手画的。
 *
 *  ── 坐标契约（全部实测得来，不靠推测）──────────────────────────────────────
 *  文件声明：viewBox = (960.22, 1415.22, 2025, 383)，preserveAspectRatio="none"
 *  把图缩到 1200px 宽（显示高 227px）后逐像素实测：
 *      品丝线像素 x = 4, 121.5, 238, 340.5, 440, 540.5, 628.5, 713.5,
 *                     792.5, 869, 939, 1008, 1068.5, 1131, 1186   （0 品 → 12 品）
 *      六根弦像素 y = 38, 70, 99.5, 131.5, 161, 193.5             （一弦 → 六弦）
 *  换算到 viewBox 用户单位后得到下面的 FRET_X / STRING_Y 表。
 *
 *  方向：屏幕左侧是琴枕、右侧是 12 品；上边是一弦、下边是六弦。
 *
 *  注意：board.svg 的图层自带 rotate(0.32596…)，外层还有 rotate(-90 …)，
 *  所以「图层局部坐标」不能直接写进叠加层。叠加层一律用 **viewBox 坐标**。
 * ========================================================================== */

const BOARD = {
  url: 'assets/guitar/board.svg',
  viewBox: { x: 960.22, y: 1415.22, w: 2025, h: 383 },
  /* board.svg 的内容在 viewBox 里只占中间这一段（上下各有空白）。
     用这个比例算容器高度，指板就能刚好铺满，不留黑边。 */
  contentRatio: 312 / 383,

  /* 品丝线 viewBox x（index = 品丝序号；[0]=琴枕线，[21]=21 品线，[22]=22 品线用于界定 21 品格）

     全部 23 项都是**逐像素实测值**（tools/px-frets2.mjs）：
     在指板上下各取 2 个无弦无品记的高度横向扫描 #path15，
     四个高度的命中位置完全一致（离散 0），所以数据可信。

     ⚠ 这里曾经用等比公式 f(n)=琴枕+L·(1-2^(-n/12)) 外推 14 品以后的位置，
     结果 12 品之后越往右偏得越多（21 品处偏 3 单位），
     在窄品格里占比很大，看起来就是「圆点偏左」。现已全部换成实测值。
     [22] 由最后两格的间距比外推（21 品格宽 50.5）。
  */
  fretX: [
    967.0, 1159.1, 1356.6, 1528.5, 1696.4, 1865.7, 2014.8,
    2158.5, 2291.5, 2420.4, 2538.7, 2655.5, 2757.6, 2862.4,
    2956.4, 3049.1, 3135.1, 3217.0, 3292.2, 3363.4, 3429.3,
    3487.0, 3537.5,
  ],
  /* 可选的最大品数（设置里的「范围」上限）。
     定成 21 品是因为：21 品格的右边界 = fretX[22] = 3537.5（实测外推），
     而 board.svg 的指板图形画到 viewBox X≈3513，加上 #ext21 补边到 3556，
     刚好覆盖得住。再往上（22 品、24 品）就明显超出指板图形了。 */
  maxFretSupported: 21,
  /* 六根弦的 viewBox y —— 注意！弦不是水平的，是扇形张开的。
     原来这里只存一个常数 y，结果标点在琴枕侧偏高、在 12 品侧偏低，
     六弦最明显（旧表 1741.8 在 12 品处实际是 1748.0，而琴枕处只有 1719.1，
     一差就是 30 单位 ≈ 15 屏幕像素）。
     stringY 保留「x = 琴枕线（967）」处的值，只给需要粗略弦距的场合用。
     真实几何见 stringLine。 */
  stringY: { 1: 1502.6, 2: 1549.2, 3: 1590.4, 4: 1631.2, 5: 1672.7, 6: 1719.1 },

  /* 六弦中心线拟合：y = a + b·x（viewBox 用户坐标）
     实测方法：
       在指板宽度上取 12 个 x，用 elementsFromPoint 逐 0.25px 竖向扫描，
       命中弦路径（#layer21/23/24/25/26/27）的像素带取中点为该弦在该 x 的 y，
       再最小二乘拟合。残差全部 < 0.2 用户单位，远小于弦距（约 50），
       所以线性模型足够精确。
     回归验证：tools/verify-geom.mjs 会把 6 弦 × 0–12 品的格心与真实弦像素带
       逐一对照，当前最大偏差 0.12px。
     用法：stringYAt(s, x) —— 命中判定 / 格子中心 / 题目高亮都必须走它。 */
  stringLine: {
    1: { a: 1518.049, b: -0.015939 },
    2: { a: 1559.409, b: -0.010575 },
    3: { a: 1594.610, b: -0.004377 },
    4: { a: 1626.685, b: 0.004674 },
    5: { a: 1662.376, b: 0.010640 },
    6: { a: 1703.542, b: 0.016092 },
  },
  /* 弦序号排列（从上到下一弦 → 六弦） */
  strings: [1, 2, 3, 4, 5, 6],

  /* 指板深色面（#path3）在 viewBox 里的实测左右缘 / 上下缘。
     这是「琴枕可以画在哪」的边界：画到这条线以外就是图外空白。
     注意板子是梯形：中段 1484..1738，到最右端 1448..1774。琴枕只占最左端
     30 单位（967..997），那里实测 1486..1736，所以纵向就用左端的值 ——
     用中段或右端的值都会让银条上下各露出一点。 */
  faceX0: 958.5,
  faceY0: 1486,
  faceY1: 1736,

  /* 上弦枕（琴枕）宽度，viewBox 单位 = 两个品柱的粗细（实测一根品柱 15 单位）。
     指板图是从整琴矢量图里切出来的，图上没有「空弦格」—— 空弦就在琴枕上，
     没有格子可点（这也是老 bug「空弦点不中」的根因）。

     做法（按用户要求：**不整体右移、不动外框、不改 viewBox**）：
       琴枕直接画在指板最左端、向内占 nutW，本身代表空弦格；
       所有品丝、外框、viewBox 一律不动，画面不位移也不缩放（动画不受影响）。
       · 空弦格 = [F[0], F[0]+nutW]，就是这条加粗的银带
       · k 品   = [F[k-1], F[k]]，与图上真实品丝线严格对齐（只有 1 品左边被琴枕吃掉一点） */
  nutW: 30,

  maxFret: 12,
  minH: 120,
};

/* 当前要显示的品数（由设置里的「范围」决定：0-5 / 0-7 / 0-9 / 0-12）。
   不是常量 —— 用户改设置后要立刻生效，所以放在可变对象上。 */
const boardView = { maxFret: 12 };

/* 第 s 弦在 viewBox 横坐标 x 处的中心线 y。
   弦是扇形张开的，同一条弦在不同品位的 y 并不相同 —— 所有取弦位置的地方
   （命中判定、格子中心、题目高亮）都必须走这个函数，不能再读固定常数。 */
function stringYAt(s, x) {
  const L = BOARD.stringLine[s];
  if (!L) return BOARD.stringY[s] || 0;
  return L.a + L.b * x;
}

/* 全局只取一次 SVG 源文本，两个容器各克隆一份 */
const boardSource = { text: null, error: null };

const boardSvg = {
  loaded: false,
  degraded: false,
  error: null,
  /* containerId -> { host, svg, overlay } */
  views: {},

  /* ---------------------------------------------------------------- */
  /* 载入：给每个容器各装一份 SVG + 叠加层                                  */
  /* ---------------------------------------------------------------- */
  async load(ids = ['fretboard', 'posFretboard', 'chordFretboard', 'intervalFretboard']) {
    try {
      if (boardSource.text === null) {
        /* 优先用内联的 SVG 源（board-svg-source.js，由 build.mjs 从 assets/guitar/board.svg 生成）。
           内联的好处：双击 file:// 打开也能用 —— 那种情况下浏览器会拦 fetch/XHR 读本地文件。
           只有内联源缺失时才退回网络请求。 */
        if (typeof BOARD_SVG_SOURCE === 'string' && BOARD_SVG_SOURCE) {
          boardSource.text = BOARD_SVG_SOURCE;
        } else {
          const res = await fetch(BOARD.url, { cache: 'force-cache' });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          boardSource.text = await res.text();
        }
      }
      const doc = new DOMParser().parseFromString(boardSource.text, 'image/svg+xml');
      if (doc.querySelector('parsererror')) throw new Error('SVG 解析失败');

      const ns = 'http://www.w3.org/2000/svg';
      ids.forEach((id) => {
        const host = document.getElementById(id);
        if (!host) return;
        host.textContent = '';
        const svg = document.importNode(doc.documentElement, true);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('class', 'board-svg');
        /* 去掉原始 width/height 属性，尺寸完全交给 CSS 与容器高度 */
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        host.appendChild(svg);

        const layer = document.createElementNS(ns, 'g');
        layer.setAttribute('class', 'board-overlay');
        svg.appendChild(layer);

        /* 加粗琴枕：图上没有「空弦格」，所以把琴枕本身画粗，让它代表空弦。
           必须在叠加层之前插入 —— 标记点要压在琴枕上面。 */
        this._drawNut(svg);

        this.views[id] = { host, svg, overlay: layer, maxFret: boardView.maxFret };
      });

      this.loaded = true;
      this.degraded = false;
      return true;
    } catch (e) {
      /* file:// 下 fetch 被拦：退回 <img>，画面照常、交互降级 */
      this.error = (e && e.message) || String(e);
      this.degraded = true;
      ids.forEach((id) => {
        const host = document.getElementById(id);
        if (!host) return;
        host.textContent = '';
        const img = document.createElement('img');
        img.src = BOARD.url;
        img.alt = '吉他指板';
        img.className = 'board-img';
        host.appendChild(img);
      });
      this.loaded = true;
      return true;
    }
  },

  view(id) {
    return this.views[id] || this.views.fretboard || Object.values(this.views)[0] || null;
  },

  /* 把琴枕画粗，代表空弦。
     图上琴枕就是 #path15 最左那段（约 15 单位宽的银色条），空弦没有自己的格子。

     做法（按用户要求：**不整体右移、不动外框、不改 viewBox**）：
       琴枕直接画在指板最左端、**向内**占 nutW（≈ 两个品柱），本身代表空弦格。
       所有品丝、外框包边、viewBox 一律不动 —— 画面既不位移也不缩放，
       琴枕也不会凸到指板外面（之前那版向左延长，看着像贴了块板子）。
       整组插在弦图层之前 —— 弦压在琴枕上面，不会被银条盖住。
     用 SVG 几何（不用 CSS）是为了随 viewBox 缩放，手机上也是同一条。 */
  _drawNut(svg) {
    const ns = 'http://www.w3.org/2000/svg';
    const F = BOARD.fretX;
    const x0 = F[0];                   // 琴枕左缘 = 指板最左端（不动外框）
    const x1 = F[0] + BOARD.nutW;      // 向内加粗到两个品柱宽
    /* 纵向范围用**深色指板面**的实测上下缘（1484..1737），
       不能用 #path3 的外接框（1435..1773）—— 后者含浅色包边，
       照它画会让琴枕条上下各露出一截。 */
    const y0 = BOARD.faceY0;
    const y1 = BOARD.faceY1;
    const h = y1 - y0;

    const g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'board-nut');

    /* 加粗的琴枕（银灰，与品柱 #path15 同色） */
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', x0.toFixed(1));
    rect.setAttribute('y', y0.toFixed(1));
    rect.setAttribute('width', (x1 - x0).toFixed(1));
    rect.setAttribute('height', h.toFixed(1));
    rect.setAttribute('fill', '#9e9ea3');
    g.appendChild(rect);

    /* 右缘一条深一点的缝，把琴枕和 1 品格分开（否则像一块连续的银板） */
    const seam = document.createElementNS(ns, 'rect');
    seam.setAttribute('x', (x1 - 2).toFixed(1));
    seam.setAttribute('y', y0.toFixed(1));
    seam.setAttribute('width', '2');
    seam.setAttribute('height', h.toFixed(1));
    seam.setAttribute('fill', '#6f6f74');
    g.appendChild(seam);

    /* 插到「品记之后、六弦之前」—— 弦必须压在琴枕上面。
       弦图层在 #horiz 里，而 #horiz 有 rotate(-90)，为了让这组矩形继续用
       viewBox 坐标，外面套一层反向 rotate(90) 把父级旋转抵消掉。 */
    const horiz = svg.querySelector('#horiz');
    const strings = svg.querySelector('#layer21');
    const overlay = svg.querySelector('.board-overlay');
    if (horiz) {
      const wrap = document.createElementNS(ns, 'g');
      wrap.setAttribute('class', 'board-nut');
      wrap.setAttribute('transform', 'rotate(90 1491.72 1611.5)');
      while (g.firstChild) wrap.appendChild(g.firstChild);
      if (strings && strings.parentNode === horiz) horiz.insertBefore(wrap, strings);
      else horiz.appendChild(wrap);
    } else if (overlay) {
      svg.insertBefore(g, overlay);
    } else {
      svg.appendChild(g);
    }
  },

  /**
   * 设定要显示的品数（0–N）。设置里改「范围」后立刻调用。
   * 做法：改 svg 的 viewBox 宽度，只保留到第 N 品的品丝线。
   * 这样指板物理上只画到那一品，而不是画满 12 品再遮住。
   *
   * N 可以是 5 / 12 / 15 / 21。以前这里写死 Math.min(12, …)，
   * 所以设置里的「0-15 品」「0-21 品」选了也不生效 —— 一律被钳回 12 品。
   *
   * ids：要应用这个范围的目标视图（省略 = 全部视图）。
   * 和弦模式的练习范围（chordRange）和单音模式的范围（settings.range）是两个独立
   * 配置，三块指板必须能各自显示自己的品数 —— 所以范围必须能按视图分别设置。
   * 每个视图自己的品数记在 views[id].maxFret 上，命中判定与品号标注都读它，
   * 不再共用一个全局 boardView.maxFret（那样后设置的会覆盖先设置的）。
   */
  setRange(maxFret, ids) {
    const maxSupported = BOARD.maxFretSupported || 21;
    const n = Math.max(1, Math.min(maxSupported, Number(maxFret) || 12));
    const F = BOARD.fretX;
    /* 右边界 = 第 N 品格自己的右缘（F[N]）。
       品格 k（k>=1）占 [F[k-1], F[k]]，所以「0–N 品」= 空弦 + N 个品格，
       右缘就是 F[N]。以前写 F[N+1]，等于多画一格无名品格。 */
    const rightEdge = F[Math.min(n, F.length - 1)];
    /* 左边界 = 琴枕线 F[0]。**不动外框**：viewBox 完全保持原样，
       加粗的琴枕是向内（向右）占位，所以画面既不位移也不缩放 —— 动画不受影响。 */
    const leftEdge = F[0];
    const vbW = rightEdge - leftEdge;
    const vb = { x: leftEdge, y: BOARD.viewBox.y, w: vbW, h: BOARD.viewBox.h };

    const targets = Array.isArray(ids) && ids.length ? ids : Object.keys(this.views);
    targets.forEach((id) => {
      const v = this.views[id];
      if (!v || !v.svg) return;
      v.svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
      v.maxFret = n;
    });
    boardView.maxFret = n;   // 兼容：没有任何视图时也留一个可读的当前值
    /* 保持纵向比例：宽度变了，容器高度也要跟着重算 */
    this.resize();
  },

  /** 某个视图当前显示到第几品（命中判定 / 品号标注必须按视图取，不能用全局值） */
  maxFretOf(id) {
    const v = this.views[id];
    if (v && typeof v.maxFret === 'number') return v.maxFret;
    return boardView.maxFret;
  },

  /* 宽 100%，高按「当前 viewBox」等比（preserveAspectRatio=none 时必须比，否则会横向拉宽）。
     实测内容只占 viewBox 纵向 96.5%（上下各留 ~1.7% 空白），容器高度按内容区算，
     这样指板正好铺满，不会上下露出黑边。 */
  resize() {
    Object.values(this.views).forEach(({ host, svg }) => {
      const w = host.clientWidth || host.getBoundingClientRect().width;
      if (!w || w < 10) return;
      /* 用当前 svg 的 viewBox（会随「品数」变化），而不是固定的原始值。
         同样注意：SVGRect 用 width / height，不是 w / h。 */
      const vb = svg ? svg.viewBox.baseVal : null;
      const vbW = (vb && vb.width) || BOARD.viewBox.w;
      const vbH = (vb && vb.height) || BOARD.viewBox.h;
      const ratio = (vbH * 0.965) / vbW;
      const h = Math.max(BOARD.minH, Math.round(w * ratio));
      host.style.height = h + 'px';
    });
  },

  /* 屏幕坐标 → viewBox 坐标（按当前 svg 的 viewBox，会随品数变化）
     ⚠ svg.viewBox.baseVal 是 SVGRect，属性名是 width / height，
       不是 w / h。以前这里写成 vb.w / vb.h，拿到 undefined → sx/sy 变 NaN
       → 返回的坐标全变成 null，找位置模式点击因此完全没有反应。 */
  _toView(rect, clientX, clientY, id = 'fretboard') {
    const v = this.view(id);
    const vb = (v && v.svg) ? v.svg.viewBox.baseVal : null;
    const vbW = (vb && vb.width) || BOARD.viewBox.w;
    const vbH = (vb && vb.height) || BOARD.viewBox.h;
    const vbX = (vb && vb.x) || BOARD.viewBox.x;
    const vbY = (vb && vb.y) || BOARD.viewBox.y;
    const sx = (rect.width || 1) / vbW;
    const sy = (rect.height || 1) / vbH;
    return {
      x: (clientX - rect.left) / sx + vbX,
      y: (clientY - rect.top) / sy + vbY,
    };
  },

  /* 屏幕坐标 → (弦, 品)；点在指板外或离弦太远返回 null */
  hitTest(clientX, clientY, id = 'fretboard') {
    const v = this.view(id);
    if (!v || this.degraded) return null;
    const rect = v.host.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null;

    const p = this._toView(rect, clientX, clientY, id);

    /* 弦：找最近的一条。弦是斜的，所以先在 p.x 处算出每根弦的实际 y 再比距离。
       容差取「该弦与相邻弦的局部间距」，超过 3/4 弦距算没点中。 */
    let s = null;
    let bestDy = Infinity;
    const ysHere = BOARD.strings.map((k) => stringYAt(k, p.x));
    for (let i = 0; i < BOARD.strings.length; i++) {
      const dy = Math.abs(ysHere[i] - p.y);
      if (dy < bestDy) { bestDy = dy; s = BOARD.strings[i]; }
    }
    if (s === null) return null;
    const si = BOARD.strings.indexOf(s);
    const gapUp = si > 0 ? Math.abs(ysHere[si] - ysHere[si - 1]) : Infinity;
    const gapDown = si < ysHere.length - 1 ? Math.abs(ysHere[si + 1] - ysHere[si]) : Infinity;
    const pitch = Math.min(gapUp, gapDown);
    if (bestDy > pitch * 0.75) return null;

    /* 品：与 cellSpan 严格同源，否则「画在哪」和「点到哪」会差一格。
       空弦 = 琴枕条本身（f=0），1 品从琴枕右缘开始。 */
    const maxFret = this.maxFretOf(id);
    for (let f = 0; f <= maxFret; f++) {
      const sp = this.cellSpan(f);
      if (p.x >= sp[0] && p.x < sp[1]) return { s, f };
    }
    return null;
  },

  /* 格子的横向跨度（viewBox x 区间）。
     单一真源：cellCenter / hitTest / 品号 / 铺底音名 / 琴枕绘制全部走这里，
     否则「画在哪」和「点到哪」迟早会差一格（这正是老 bug 的成因）。

       f = 0      → 加粗琴枕 [F[0], F[0]+nutW]，空弦格就是这条银带本身
       f = 1      → [F[0]+nutW, F[1]]，从琴枕右缘起算（真实吉他的 1 品也是这样）
       f >= 2     → [F[f-1], F[f]]，与图上真实品丝线严格对齐
     三段首尾相接、互不重叠：点在哪一段，就判给哪一格，不会再出现「差一格」。
  */
  cellSpan(f) {
    const F = BOARD.fretX;
    const k = Math.max(0, Math.min(Number(f) || 0, F.length - 1));
    if (k === 0) return [F[0], F[0] + BOARD.nutW];
    if (k === 1) return [F[0] + BOARD.nutW, F[1]];
    return [F[k - 1], F[k]];
  },

  /* (弦, 品) → 格子中心（viewBox 坐标）
     y 必须按该格的 x 求弦心线，否则六弦会在右侧跑出指板。

     ⚠ 品格编号：fretX 表里 [0] 是琴枕、[1] 是 1 品丝线、[2] 是 2 品丝线……
     所以「品格 k」占 [F[k-1], F[k]]，不是 [F[k], F[k+1]]。
     以前按 F[f]..F[f+1] 取格心，整个指板右偏一格 —— 品记圆点（3/5/7/9/12 品）
     与品号永远差一格，空弦也被画进 1 品的格子里。
     空弦（f=0）没有品格，画在加粗琴枕上（见 _drawNut / BOARD.nutW）。 */
  cellCenter(s, f) {
    const sp = this.cellSpan(f);
    const x = (sp[0] + sp[1]) / 2;
    return { x: x, y: stringYAt(s, x) };
  },

  /* ---------------------------------------------------------------- */
  /* 叠加层                                                             */
  /* ---------------------------------------------------------------- */
  /* r 默认 20 = 答对/答错标点（.bm）的半径。
     未答点以前由 CSS 单独压到 r:13，比答完的标点小一半，看起来像两种东西；
     现在统一用 20，只有脉冲圈比它大。 */
  _circle(v, cls, r) {
    const ns = 'http://www.w3.org/2000/svg';
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', v.x.toFixed(1));
    c.setAttribute('cy', v.y.toFixed(1));
    c.setAttribute('r', String(r == null ? 20 : r));
    c.setAttribute('class', cls);
    return c;
  },

  /* 标记半径：默认 20，但**不能超出自己的格子**。
     空弦格就是那条加粗琴枕（宽 nutW=30），中心 982、半径 20 → 圆会伸到 962，
     而 viewBox 左缘是 967 —— 空弦的点被裁掉一条直边（用户放大截图指出过）。
     规则：半径 = min(20, 半格宽 - 2)，减 2 是给 .bm 的 3px 描边留位置。
     只有空弦格会因此变小（13），其余格子宽 150+ 一律还是 20。 */
  _markRadius(f) {
    const sp = this.cellSpan(f);
    const half = (sp[1] - sp[0]) / 2;
    return Math.max(8, Math.min(20, half - 2));
  },

  _label(v, str, cls) {
    const ns = 'http://www.w3.org/2000/svg';
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', v.x.toFixed(1));
    t.setAttribute('y', v.y.toFixed(1));
    t.setAttribute('class', cls);
    /* 标记上的字母徽标要垂直居中（默认基线对齐会偏下） */
    if (cls && cls.indexOf('bm-label') === 0) {
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('dominant-baseline', 'central');
    }
    t.textContent = str;
    return t;
  },

  /**
   * o: { marks:[{s,f,kind}], hover:{s,f}, picks:[{s,f}], question:{s,f},
   *      allNames:[{s,f,text}], links:[{a:{s,f}, b:{s,f}}], dimStrings:{keep:弦号},
   *      dimCols:[弦号], band:最低按品, barres:[{s1,s2,f,kind}], hoverBarre:{s1,s2,f} }
   * kind: answer（命中/正确）| missed（漏选）| wrong（多选/答错）
   *       iroot（音程起点 A）| itarget（音程终点 B）| ifaint（其他合法目标，弱提示）
   *       pin（和弦题面的钉弦）| given（B 玩法的题面指法）
   *
   * 层级：allNames（底层铺底）< links（连线）< dimCols/band（和弦题面的压暗与亮框）
   *       < hover < hoverBarre < picks < barres < marks < question ——
   * 最终结论永远画在最上面，不会被临时标记或铺底文字盖住。
   *
   * 曾有一个 numbers:true 选项用来在指板上沿画 0…N 品号，四个模式都没有启用，
   * 且 0–21 品时字号会随指板缩到 2.5px，已整体删除。
   */
  /* 压暗「除某根弦以外」的整片区域（找位置玩法 A：一题只考一根弦）。
     弦是斜的，所以不能用矩形：按「相邻两弦的中线」各算一条边，
     上下两块多边形把题目那根弦夹成一条亮带 —— 视觉上「整块指板只剩一条亮道」。
     画在叠加层最底层，标记 / 已选 / 音名都压在它上面，不会被灰罩盖住。 */
  _dimStrings(ov, keepS, id) {
    const svgEl = (this.view(id) || {}).svg;
    const vb = (svgEl && svgEl.viewBox && svgEl.viewBox.baseVal) || BOARD.viewBox;
    const x0 = vb.x;
    const x1 = vb.x + vb.width;
    const y0 = vb.y;
    const y1 = vb.y + vb.height;
    const idx = BOARD.strings.indexOf(keepS);
    if (idx < 0) return;
    const yAt = (i, x) => stringYAt(BOARD.strings[i], x);
    const mid = (i, j, x) => (yAt(i, x) + yAt(j, x)) / 2;
    const topEdge = (x) => (idx > 0 ? mid(idx, idx - 1, x) : y0);
    const botEdge = (x) => (idx < BOARD.strings.length - 1 ? mid(idx, idx + 1, x) : y1);
    const ns = 'http://www.w3.org/2000/svg';
    const poly = (pts) => {
      const p = document.createElementNS(ns, 'polygon');
      p.setAttribute('points', pts.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' '));
      p.setAttribute('class', 'board-dim');
      ov.appendChild(p);
    };
    poly([[x0, y0], [x1, y0], [x1, topEdge(x1)], [x0, topEdge(x0)]]);
    poly([[x0, botEdge(x0)], [x1, botEdge(x1)], [x1, y1], [x0, y1]]);

    /* 只压暗不够：指板面本来就是近黑色，灰罩压上去几乎看不出差别，
       用户实测「改了但在可视范围里没显示出来」。所以再把题目那根弦
       用亮色重描一遍，压在所有灰罩之上 —— 亮带是自己亮起来的，
       不依赖「别的弦变暗」这种相对对比。 */
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', x0.toFixed(1));
    line.setAttribute('y1', yAt(idx, x0).toFixed(1));
    line.setAttribute('x2', x1.toFixed(1));
    line.setAttribute('y2', yAt(idx, x1).toFixed(1));
    line.setAttribute('class', 'board-focus-string');
    ov.appendChild(line);
  },

  /* 压暗「指定的这几根弦」（和弦题面：这条指法里不发声的弦）。
     _dimStrings 是「只留一根亮」，这里是「这几根变暗」，语义相反。
     每根被压暗的弦覆盖它上下各半条弦距，边界取相邻两弦的中线（弦是斜的，不能画矩形）。 */
  _dimCols(ov, dimS, id) {
    const svgEl = (this.view(id) || {}).svg;
    const vb = (svgEl && svgEl.viewBox && svgEl.viewBox.baseVal) || BOARD.viewBox;
    const x0 = vb.x;
    const x1 = vb.x + vb.width;
    const y0 = vb.y;
    const y1 = vb.y + vb.height;
    const ns = 'http://www.w3.org/2000/svg';
    const yAt = (i, x) => stringYAt(BOARD.strings[i], x);
    const mid = (i, j, x) => (yAt(i, x) + yAt(j, x)) / 2;
    const all = BOARD.strings;
    (dimS || []).forEach((s) => {
      const idx = all.indexOf(s);
      if (idx < 0) return;
      const topEdge = (x) => (idx > 0 ? mid(idx, idx - 1, x) : y0);
      const botEdge = (x) => (idx < all.length - 1 ? mid(idx, idx + 1, x) : y1);
      const p = document.createElementNS(ns, 'polygon');
      p.setAttribute('points', [[x0, topEdge(x0)], [x1, topEdge(x1)], [x1, botEdge(x1)], [x0, botEdge(x0)]]
        .map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' '));
      p.setAttribute('class', 'board-dim');
      ov.appendChild(p);
    });
  },

  /* 最低按品那一行的亮框：横跨六弦、占满整条品（题面三样之一）。
     上下边界取**指板深色面**的实测上下缘（与 _drawNut 同一口径，不能含浅色包边），
     不是「最外两根弦 ± 26」—— 弦只占指板中间那段，按弦心画出来的框上下都空着，
     用户看到的是一条贴着弦的窄条，而不是整整一条品（m04981 截图里的红线）。

     板子是梯形（左端最窄、右端外扩最多），所以边界按 x 做三段插值。 */
  _bandRow(ov, fret, id) {
    const f = Number(fret);
    if (!(f > 0)) return;
    const svgEl = (this.view(id) || {}).svg;
    if (!svgEl) return;
    const sp = this.cellSpan(f);
    const pad = 2;
    /* 指板深色面（#path3）的实测六角点，换算到 viewBox 坐标后就是三段：
       琴枕端 x=960.1（1486.2..1736.8）、折点 x=2985.8（1455.4..1767.6）、
       最右端 x=3511.8（1446.2..1776.8）。板子向右外扩，所以必须按 x 插值 ——
       用一组常数会让远端框上下各露出一截白边（或用左端值则远端不够高）。 */
    const kx = [
      { x: 960.1, y0: 1486.2, y1: 1736.8 },
      { x: 2985.8, y0: 1455.4, y1: 1767.6 },
      { x: 3511.8, y0: 1446.2, y1: 1776.8 },
    ];
    const edge = (x, key) => {
      if (x <= kx[0].x) return kx[0][key];
      for (let i = 1; i < kx.length; i += 1) {
        if (x <= kx[i].x) {
          const a = kx[i - 1];
          const b = kx[i];
          const t = (x - a.x) / (b.x - a.x);
          return a[key] + (b[key] - a[key]) * t;
        }
      }
      return kx[kx.length - 1][key];
    };
    const xL = sp[0] + pad;
    const xR = sp[1] - pad;
    const pts = [[xL, edge(xL, 'y0')], [xR, edge(xR, 'y0')],
      [xR, edge(xR, 'y1')], [xL, edge(xL, 'y1')]];
    const ns = 'http://www.w3.org/2000/svg';
    const p = document.createElementNS(ns, 'polygon');
    p.setAttribute('points', pts.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' '));
    p.setAttribute('class', 'board-band');
    ov.appendChild(p);
  },

  /* 横按（跨弦跑道形）：从 s1 弦到 s2 弦、按在 f 品。
     弦在这张图上横着排，所以一根横按的手指是**竖着**的一条：
     上下跨过它压住的每根弦（两端各留半个标记半径的圆头），左右只占品格中间一段。

     以前的实现是一条**横**的扁矩形（照搬 和弦指型库/index.html 的 diagram() ——
     那边弦是竖的，横按才是横的；这里没转过来），结果只是穿过中间那根弦的一小条，
     两头压在圆点上，看着像贴了个创可贴（m05029 截图）。

     拖动预览走同一个函数（class 'barre hover'），所以预览会随拖动实时改变跨度。 */
  _barreRect(ov, b, cls) {
    if (!b) return;
    const f = Number(b.f);
    if (!(f > 0)) return;
    const a = BOARD.strings.indexOf(b.s1);
    const c = BOARD.strings.indexOf(b.s2);
    if (a < 0 || c < 0) return;
    const iTop = Math.min(a, c);
    const iBot = Math.max(a, c);
    const sp = this.cellSpan(f);
    const cx = (sp[0] + sp[1]) / 2;
    const yOf = (i, x) => stringYAt(BOARD.strings[i], x);
    /* 两端圆头半径 = 同一格圆点的半径 → 跑道直径与圆点直径完全一致。
       以前这里是「品格宽的一半，夹在 44–110」，比圆点粗一半以上，
       拖动预览时像一根粗棍子（m05246 截图）。 */
    const r = this._markRadius(f);
    const w = r * 2;
    const yTop = yOf(iTop, cx) - r;
    const yBot = yOf(iBot, cx) + r;
    const ns = 'http://www.w3.org/2000/svg';
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', (cx - w / 2).toFixed(1));
    rect.setAttribute('y', yTop.toFixed(1));
    rect.setAttribute('width', w.toFixed(1));
    rect.setAttribute('height', (yBot - yTop).toFixed(1));
    rect.setAttribute('rx', (w / 2).toFixed(1));
    rect.setAttribute('ry', (w / 2).toFixed(1));
    rect.setAttribute('class', cls);
    ov.appendChild(rect);
  },

  paint(o = {}, id = 'fretboard') {
    const v = this.view(id);
    if (!v || !v.overlay) return;
    const ov = v.overlay;
    ov.textContent = '';

    /* 压暗其它弦必须最先画：后面所有标记都压在它上面。 */
    if (o.dimStrings && o.dimStrings.keep) this._dimStrings(ov, o.dimStrings.keep, id);
    /* 和弦题面：不发声的弦压暗（在标记之下，标记仍然可见） */
    if (o.dimCols && o.dimCols.length) this._dimCols(ov, o.dimCols, id);
    /* 和弦题面：最低按品那一行亮框 */
    if (o.band) this._bandRow(ov, o.band, id);

    /* 调试用：把所有格子的音名铺在底层（对应 Canvas 版 drawAllNoteNames）。
       必须在 marks 之前画，否则会把对错标点盖住。 */
    (o.allNames || []).forEach((n) => {
      const p = this.cellCenter(n.s, n.f);
      ov.appendChild(this._circle(p, 'nm', 14));
      ov.appendChild(this._label(p, n.text, 'nm-text'));
    });

    /* 音程模式的 A→B 连线：白色虚线，画在标记之下。
       白色在深色指板面上对比最强；虚线则不会和琴弦、品柱的实线混淆。 */
    (o.links || []).forEach((lk) => {
      if (!lk || !lk.a || !lk.b) return;
      const pa = this.cellCenter(lk.a.s, lk.a.f);
      const pb = this.cellCenter(lk.b.s, lk.b.f);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', pa.x.toFixed(1));
      line.setAttribute('y1', pa.y.toFixed(1));
      line.setAttribute('x2', pb.x.toFixed(1));
      line.setAttribute('y2', pb.y.toFixed(1));
      line.setAttribute('class', 'ilink');
      ov.appendChild(line);
    });

    /* 绘制顺序 = 层级（SVG 后画的盖在上面），按「弱提示 → 强结论」排：
       hover（最弱，浅描边）→ picked（答题中的临时选择）→ marks（最终对错结论）。
       以前 marks 先画、picked 后画，找位置模式提交后橙色圈把绿/黄/红全盖住了。 */
    /* 半径按各自格子算：空弦格只有 30 单位宽，用默认 20 会被 viewBox 左缘裁掉一条边 */
    if (o.hover) ov.appendChild(this._circle(this.cellCenter(o.hover.s, o.hover.f), 'bm hover', this._markRadius(o.hover.f)));
    /* 横按矩形画在圆点之下：一个横按会盖住好几根弦，圆点（钉子/落子）必须能看见 */
    if (o.hoverBarre) this._barreRect(ov, o.hoverBarre, 'barre hover');
    (o.barres || []).forEach((b) => {
      this._barreRect(ov, b, 'barre ' + (b.kind || 'picked'));
    });
    (o.picks || []).forEach((pk) => {
      ov.appendChild(this._circle(this.cellCenter(pk.s, pk.f), 'bm picked', this._markRadius(pk.f)));
    });
    (o.marks || []).forEach((m) => {
      const p = this.cellCenter(m.s, m.f);
      ov.appendChild(this._circle(p, 'bm ' + (m.kind || 'answer'), this._markRadius(m.f)));
      /* 标记上的文字徽标：音程模式需要区分「哪个是起点 A、哪个是终点 B」。
         只靠颜色不够 —— 两个点都是实心圆，用户分不出角色。 */
      if (m.label) ov.appendChild(this._label(p, String(m.label), 'bm-label ' + (m.kind || 'answer')));
    });

    /* 答题中的题目位置提示：竖向虚线 + 横向虚线 + 脉冲圆 + 音名
       对应原来 Canvas 里的 drawQuestionMarker —— 换成 SVG 时漏掉了这一段。 */
    if (o.question) this._paintQuestion(ov, o.question, id);
  },

  /* 题目高亮（音名模式：告诉用户「是这一格」）
     只画「是哪一格」的定位提示，**不显示答案音名** —— 答案要用户自己选。 */
  _paintQuestion(ov, q, id = 'fretboard') {
    const ns = 'http://www.w3.org/2000/svg';
    const p = this.cellCenter(q.s, q.f);
    const svgEl = (this.view(id) || {}).svg;
    const vbAttr = (svgEl && svgEl.viewBox && svgEl.viewBox.baseVal) || null;
    const topY = (vbAttr && vbAttr.y) || BOARD.viewBox.y;

    /* 弦距：该 x 处相邻两弦的间隔（弦是斜的，不能用固定常数） */
    const idx = BOARD.strings.indexOf(q.s);
    const step = 1;
    const yAbove = idx > 0 ? stringYAt(BOARD.strings[idx - step], p.x) : stringYAt(q.s, p.x) - 55;
    const yBelow = idx < BOARD.strings.length - 1
      ? stringYAt(BOARD.strings[idx + step], p.x)
      : stringYAt(q.s, p.x) + 55;
    const halfGap = Math.max(14, Math.min((yBelow - yAbove) / 2, 40));

    /* 1) 从指板上沿引下来的竖向虚线 */
    const line1 = document.createElementNS(ns, 'line');
    line1.setAttribute('x1', p.x); line1.setAttribute('y1', topY + 6);
    line1.setAttribute('x2', p.x); line1.setAttribute('y2', (p.y - halfGap).toFixed(1));
    line1.setAttribute('class', 'q-guide');
    ov.appendChild(line1);

    /* 2) 弦间横向虚线（上下各半格，标出「这根弦」的带宽） */
    const line2 = document.createElementNS(ns, 'line');
    line2.setAttribute('x1', p.x); line2.setAttribute('y1', (p.y - halfGap).toFixed(1));
    line2.setAttribute('x2', p.x); line2.setAttribute('y2', (p.y + halfGap).toFixed(1));
    line2.setAttribute('class', 'q-guide');
    ov.appendChild(line2);

    /* 3) 脉冲圆 + 实心点（尺寸与答对/答错的 .bm 标点一致，见 style.css） */
    const halo = this._circle(p, 'q-halo');
    const dot = this._circle(p, 'q-dot');
    ov.appendChild(halo);
    ov.appendChild(dot);

    /* 不再画 q.label：以前这里把答案音名直接写在点上，等于直接给答案。 */
  },
};

/* 初始化：app.src.js 启动时调用一次 */
async function initBoardSvg() {
  const ok = await boardSvg.load();
  if (ok) boardSvg.resize();
  if (boardSvg.error) console.warn('[board] SVG 载入失败，交互已降级：' + boardSvg.error);
  return ok;
}
