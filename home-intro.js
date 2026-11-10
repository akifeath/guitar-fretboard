/* ============================================================================
 *  入场过渡动画 —— 照搬原型 variant-B-svg 的五段结构，并做了三处必要修正
 *
 *  五个阶段（时间轴取自原型）：
 *    ROT     780   ① 整把琴逆时针旋转 90°
 *    ZOOM   1500   ② 整琴放大到「框宽 × OVERSCALE ÷ 0–12 品长」→ 故意超出框
 *    FRAME  1900   ③ 框（琥珀描边）出现；clip-path 从外扩收到框的本地逆映射
 *    —      2100   ④ 交叉淡化：整琴 1→0、独立指板 0→1（互补，亮度不变）
 *    PUSH   2450   ⑤ 内部挤压：独立指板 scale 1.45 → 1.0
 *    BLOCKS 2750   ⑤ 挤压完成；其它块淡入
 *    END    3200
 *
 *  ── 三处修正（相对原型）──────────────────────────────────────────────
 *  1) 整琴用**矢量**（assets/guitar/guitar-full.svg，3000×6000）而不是位图。
 *     位图放大近 10 倍会先糊再突然变清楚，非常割裂；矢量任意放大都清晰。
 *  2) 放大倍数受控：不再把指板段硬拉到满框宽度，而是让**整琴宽度**刚好覆盖
 *     框的宽度 —— 这样落点和大小都可控，不会「放太大、位置对不上」。
 *  3) 旋转前先下沉：① 之前加一段「整琴往下挪一点」，让画面重心下移再起转。
 *
 *  几何（3000×6000 画布，来自 manifest）：
 *    琴枕线 y=1080，12 品线 y=3105，指板横向 x≈1343–1639。
 * ========================================================================== */

const INTRO = {
  /* 整琴矢量图尺寸（= guitar-full.svg 的 viewBox） */
  imgW: 3000,
  imgH: 6000,
  /* 0–12 品指板段在整琴坐标系里的包围盒。
     不是琴枕→12品的理论长度（2025），而是 SVG 里「指板」图层的实测 bbox：
     x=1338, y=1079, w=331, h=2553。
     答题界面的 board.svg 展示的是同一块指板，所以必须用实测值才能严丝合缝。 */
  board: { x: 1338, y: 1079, w: 331, h: 2553 },

  /* 主页静止时整琴占屏高比例 */
  HOME_SCALE: 0.84,
  /* 主页静止时的垂直位置（屏高比例）：0.56 = 略偏下 */
  HOME_CY: 0.56,
  /* ① 旋转前先下沉的距离（屏高比例） */
  DIP: 0.03,
  /* ② 放大时故意超出框的倍数；⑤ 再压回 1.0 */
  OVERSCALE: 1.28,
  /* 纵向校准（像素）：实测发现矢量整琴的指板 bbox 中心与答题框中心
     本来就重合，不需要额外补偿 —— 早先的 70 是位图时代的经验值，
     在矢量版上会让交接瞬间整体往下跳 70px（也就是"跳一下"的来源之一）。
     保留这个常量是为了以后真的需要微调时有地方改，默认 0。 */
  Y_CAL: 0,
  /* 测量补偿（像素）：_measureTargetRect 在 pre-start 版面下量到的指板
     比真正揭幕后的位置**低**这么多（顶部提示条挂载后会把内容上提）。
     实测两个模式都是 −10px，所以这里写 -10（y 减去 10）。 */
  MEASURE_DY: -10,

  /* 原型时间轴（毫秒） */
  DIP_END: 260,      // 旋转前下沉结束
  ROT: 780,
  ZOOM: 1500,
  FRAME: 1900,
  XFADE_END: 2100,
  /* 框外侵蚀：与放大末段重叠开始，到交叉淡化结束时正好收到框边 */
  ERODE_START: 1250,
  ERODE_END: 2100,
  /* 侵蚀前沿的羽化宽度（屏幕像素）：越大越像「渐隐」，越小越像「擦除」 */
  ERODE_FEATHER: 240,
  /* 侵蚀蒙版的绘制分辨率（相对整琴画布）。
     羽化本身是低频信号：1/8 分辨率下画高斯模糊、再由 mask-size 拉回全尺寸，
     视觉上与全分辨率高斯无法区分，但光栅化像素量只有 1/64。
     早期版本在 3000×6000 全分辨率上跑高斯，实测 p99=83ms、最大帧 116ms。 */
  MASK_SCALE: 0.125,
  PUSH: 2450,
  BLOCKS: 2750,
  END: 3400,
};

const homeIntro = {
  running: false,
  box: null,
  svg: null,

  init() {
    this.box = document.getElementById('homeGuitar');
    this.svg = document.getElementById('guitarSvg');
    /* 把内联的矢量整琴塞进 SVG 容器（双击 file:// 也能用，不需要外部文件） */
    if (this.svg && typeof GUITAR_SVG === 'string' && GUITAR_SVG) {
      this.svg.innerHTML = GUITAR_SVG.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    }
    this.layout();
  },

  _homePose() {
    const mobile = window.innerWidth <= 720;
    return {
      scale: mobile ? 0.68 : INTRO.HOME_SCALE,
      cy: mobile ? 0.47 : INTRO.HOME_CY,
    };
  },

  /* 主页静止姿态 = 动画第 0 帧 */
  layout() {
    const box = this.box;
    if (!box) return;
    const pose = this._homePose();
    const s0 = (window.innerHeight * pose.scale) / INTRO.imgH;
    box.style.width = INTRO.imgW + 'px';
    box.style.height = INTRO.imgH + 'px';
    box.style.transformOrigin = '0 0';
    box.style.transform = this._tf(s0, 0, window.innerWidth / 2, window.innerHeight * pose.cy);
  },

  _tf(s, rot, cx, cy) {
    return `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px) rotate(${rot.toFixed(3)}deg) ` +
      `scale(${s.toFixed(5)}) translate(${(-INTRO.imgW / 2).toFixed(2)}px, ${(-INTRO.imgH / 2).toFixed(2)}px)`;
  },

  async play(onReveal, mode) {
    if (!this.box || this.running) { if (onReveal) onReveal(); return; }
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (onReveal) onReveal();
      return;
    }
    this.running = true;
    this._maskLogged = false;
    this._erodeState = null;

    /* 清理上一轮残留的 WAAPI 动画。

       块淡入用的是 el.animate(..., { fill: 'forwards' })，动画结束后
       仍会留在元素上（playState = finished）。动画来源的优先级高于
       内联样式，所以第二次进入时，那条"finished、值为 opacity:1"的
       旧动画会压过我们刚写的 opacity:0 —— 表现为「块一开始就全显示，
       然后才淡入」（首次进入正常，返回主页再进就复现）。

       必须在加 .intro-running 之前把它们全部 cancel 掉，
       同时清掉上一轮可能残留的内联 opacity/transform。 */
    const prevBlocks = document.querySelectorAll(
      '.layout > .board-panel > *:not(.fretboard-wrap), .layout > .side, .layout .fretboard-wrap > .fb-bar'
    );
    for (const el of prevBlocks) {
      if (typeof el.getAnimations === 'function') {
        for (const a of el.getAnimations()) {
          try { a.cancel(); } catch (e) { /* 忽略已失效的动画 */ }
        }
      }
      el.style.opacity = '';
      el.style.transform = '';
    }
    document.body.classList.remove('intro-blocks');

    document.body.classList.add('intro-running');

    const box = this.box;
    const b = INTRO.board;

    /* 目标矩形 = 即将进入的那个模式在答题界面里的指板位置
       （临时揭开量一次再恢复；mode 决定量哪一块指板） */
    const target = this._measureTargetRect(mode);
    /* 四个模式各有一块指板：和弦模式必须取 #chordFretboard，
       音程模式必须取 #intervalFretboard，否则交接时量的是音名模式的指板，
       落点会整体错位。 */
    const boardId = mode === 'chord' ? 'chordFretboard'
      : (mode === 'pos' ? 'posFretboard'
        : (mode === 'interval' ? 'intervalFretboard' : 'fretboard'));
    const boardSlot = document.getElementById(boardId);
    const boardSvgEl = boardSlot ? boardSlot.querySelector('svg') : null;

    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const pose = this._homePose();
    const s0 = (vh * pose.scale) / INTRO.imgH;

    /* ② 终点缩放：以「指板厚度」为基准 —— 让整琴上指板段的高度 = 答题框的高度。
       为什么不比长度：指板本来就比框长，右侧还要被侵蚀动画裁掉，
       长度对不上是设计的一部分；真正要严丝合缝的是「上下两条边 + 中心轴」。
       指板段在整琴里是竖向长条（宽 331 = 厚度），旋转 90° 后厚度变成屏幕纵向，
       所以用 board.w 对到 target.h。 */
    const sEnd = (target && target.w > 40)
      ? (target.h / INTRO.board.w)
      : s0 * 1.6;

    const t0 = performance.now();
    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const seg = (t, a, c) => clamp01((t - a) / (c - a));
    const lerp = (x, y, p) => x + (y - x) * p;
    const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    /* 侵蚀用更柔的 sine in-out：起步和收尾都没有加速度突变 */
    const easeIO = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * x));

    let revealed = false;
    let blocksQueued = false;
    /* 动画期间主页保持可见（被旋转放大的是主页那把吉他本身），
       答题界面等裁切完成时再切出来。 */

    await new Promise((resolve) => {
      const step = () => {
        const t = performance.now() - t0;

        /* ⓪ 旋转前先往下挪一点：这是一次**位置变更**，不是来回摆。
           下沉完成后整琴就停在新位置，后面旋转、放大都从这里出发（见 cyBase）。 */
        const pDip = ease(seg(t, 0, INTRO.DIP_END));
        const dipY = vh * INTRO.DIP * pDip;

        /* ① 旋转 */
        const pRot = ease(seg(t, INTRO.DIP_END - 60, INTRO.ROT));
        const rot = -90 * pRot;

        /* ② 放大 */
        const pZoom = ease(seg(t, INTRO.ROT, INTRO.ZOOM));
        const s = Math.exp(lerp(Math.log(s0), Math.log(Math.max(sEnd, s0)), pZoom));

        /* ③ 框出现 / 裁切量 */
        const pFrame = ease(seg(t, INTRO.ZOOM, INTRO.FRAME));
        const clipAmt = pFrame;
        /* ④ 交叉淡化 */
        const pHand = ease(seg(t, INTRO.FRAME, INTRO.XFADE_END));
        const guitarFade = 1 - pHand;
        /* ⑤ 内部挤压 1.45 → 1.0 */
        const pSqueeze = ease(seg(t, INTRO.PUSH, INTRO.BLOCKS));
        const squeeze = lerp(INTRO.OVERSCALE, 1.0, pSqueeze);

        /* 放大阶段的起点 = 下沉后的位置。它一旦确定就不动，
           所以整条轨迹是「下沉 → 停在低处旋转 → 从低处放大到框」，
           不会出现「先下去又升回来」。 */
        const cx0 = vw / 2;
        const cyBase = vh * pose.cy + vh * INTRO.DIP;

        /* 指板段**中心**：整琴里的指板段和答题界面的指板长宽比并不相同
           （board.svg 在答题界面里被 preserveAspectRatio="none" 拉过），
           一个缩放无法同时对齐宽和高。这里优先保证「长度方向」（品丝那条轴）
           严丝合缝，那是最容易被眼睛抓到的地方。 */
        const bCx = b.x + b.w / 2;
        const bCy = b.y + b.h / 2;
        const rad = (rot * Math.PI) / 180;
        const cs = Math.cos(rad);
        const sn = Math.sin(rad);
        const dx = (bCx - INTRO.imgW / 2) * s;
        const dy = (bCy - INTRO.imgH / 2) * s;
        const ox = dx * cs - dy * sn;
        const oy = dx * sn + dy * cs;

        /* 下沉阶段：从主页原位线性下移，落点就是 cyBase；
           下沉结束后 cyBase 保持不变，旋转与放大都从它出发。
           放大终点严格对齐「指板段中心 → 框中心」，这样交接才不跳。 */
        const cyStart = vh * pose.cy;
        const cyDip = lerp(cyStart, cyBase, pDip);

        let cx = cx0;
        let cy = cyDip;
        if (target && pZoom > 0) {
          /* 对齐基准：
             · 厚度方向 —— 整琴指板段的高度已等于框高（见 sEnd），上下边自然贴合
             · 中心轴   —— 指板段的厚度中线对准框的纵向中线
             · 长度方向 —— **左端（琴枕那头）对齐框的左端**，超出的部分全部
               堆到右侧交给侵蚀动画化掉。
               以前是「中心对齐」，于是左右各溢出约 276px，左端那截指板
               在侵蚀阶段被一起羽化掉，看起来像指板凭空少了一段。
               设计意图本来就是「右侧留给侵蚀」，所以左边必须贴住。

             ox/oy 是「指板段中心」相对画布中心的旋转后偏移，
             所以要把中心再挪回左边缘：ox 里已经含了 (bCx − imgW/2)，
             减去半个指板长度（board.h/2 · s，旋转后落在横向）才是左边缘。 */
          const halfBoardLen = (INTRO.board.h / 2) * s;
          cx = lerp(cx0, target.x + halfBoardLen - ox, pZoom);
          cy = lerp(cyBase, target.y + target.h / 2 - oy + INTRO.Y_CAL, pZoom);
        }

        box.style.transform = this._tf(s, rot, cx, cy);

        /* ③ 框外侵蚀（渐变覆盖层）：
           以前用 clip-path inset 把整琴硬切到「指板包围盒」—— 硬直边扫过琴身很生硬。
           现在用一层渐变覆盖：把答题框右侧的琴身和伸出框的指板，用与页面同色的
           渐变「擦掉」，边缘是连续的所以看着像羽化。

           ⚠ 覆盖层必须在交接完成的瞬间就撤掉。
           它 z-index 高于答题界面，如果留到动画结束（3400ms），
           2750ms 之后浮现的那些块会被它盖住一条白带 —— 观感很违和。
           所以只要 pErode 走满（或者进入交叉淡化阶段）就立即 dispose。 */
        const pErode = target ? easeIO(seg(t, INTRO.ERODE_START, INTRO.ERODE_END)) : 0;
        if (target) {
          if (this._erodeState !== 'on') {
            this._erodeState = 'on';
            box.style.clipPath = 'none';
          }
          /* 侵蚀已走完 → 覆盖层没有存在意义了，立刻撤掉，
             这样后面块浮现时画面是干净的。 */
          if (pErode >= 1 || t >= INTRO.XFADE_END) {
            if (this._overlay) this._disposeErodeMask(box);
          } else if (pErode > 0) {
            this._applyErodeMask(box, target, s, rot, cx, cy, pErode, vw, vh);
          } else if (this._erodeState !== 'idle') {
            /* 侵蚀还没开始：不需要覆盖层，整琴完全可见 */
            this._erodeState = 'idle';
            this._disposeErodeMask(box);
          }
        } else if (clipAmt > 0.001) {
          /* 量不到答题框时退回旧的包围盒裁切 */
          const pad = (1 - clipAmt) * 900;
          box.style.clipPath = `inset(${Math.max(0, b.y - pad)}px ` +
            `${Math.max(0, INTRO.imgW - (b.x + b.w + pad))}px ` +
            `${Math.max(0, INTRO.imgH - (b.y + b.h + pad))}px ` +
            `${Math.max(0, b.x - pad)}px)`;
          if (this._erodeState !== 'fallback') {
            this._erodeState = 'fallback';
            this._disposeErodeMask(box);
          }
        } else {
          if (this._erodeState !== 'plain') {
            this._erodeState = 'plain';
            box.style.clipPath = 'none';
            this._disposeErodeMask(box);
          }
        }

        /* ③ 框：琥珀描边，出现后一直保留 */
        if (boardSlot) {
          if (pFrame <= 0.005) {
            boardSlot.style.boxShadow = 'none';
            boardSlot.style.background = 'transparent';
          } else {
            boardSlot.style.boxShadow =
              `0 0 0 2px rgba(240,169,75,${(0.85 * pFrame).toFixed(3)}), ` +
              `inset 0 0 0 1px rgba(240,169,75,${(0.35 * pFrame).toFixed(3)})`;
            boardSlot.style.background = 'transparent';
          }
        }

        /* ④ 交叉淡化：整琴 1→0（③ 阶段保持 1，框内不淡化） */
        box.style.opacity = (pHand > 0 ? guitarFade : 1).toFixed(3);

        /* ③ 结束（裁切到框边）时把答题界面切出来。
           注意：onReveal 会把 .layout 从 display:none 切成可见。
           浏览器对「display:none → 可见」的元素**不执行过渡** ——
           必须让它在可见状态下先渲染一帧，后续 opacity 变化才会动。
           所以这里揭幕之后立刻强制一次布局，把「块=透明」的起始状态落实。 */
        if (!revealed && t >= INTRO.FRAME) {
          revealed = true;
          if (onReveal) onReveal();
          /* 强制同步布局：让刚显示出来的答题界面以 opacity:0 的状态真正落帧 */
          void document.body.offsetHeight;
        }

        /* ⑤ 独立指板内部挤压（绕中心，与整琴缩放锚点一致） */
        if (boardSvgEl) {
          boardSvgEl.style.transformOrigin = '50% 50%';
          boardSvgEl.style.transform = `scale(${squeeze.toFixed(5)}, ${squeeze.toFixed(5)})`;
        }

        if (t >= INTRO.ZOOM - 60 && boardSlot) boardSlot.style.opacity = '1';

        /* ⑤ 其它块到 BLOCKS 时刻才淡入。

           为什么不用 CSS transition 切换 class：
           这些块在动画前半段处于 display:none 的容器里（.layout 未显示），
           浏览器对「从 display:none 变可见」的元素不执行过渡 ——
           实测加 class 后 opacity 从 0 直接跳到 1，没有任何中间帧，
           观感就是"块啪地出现"。而 transition 的 0.5s 也因此完全浪费。

           改用 Web Animations API 显式驱动：它不依赖元素之前是否渲染过，
           开始时刻、时长、缓动都确定，块会真正从透明淡入并轻微上浮。 */
        if (t >= INTRO.BLOCKS && !blocksQueued) {
          blocksQueued = true;
          const targets = document.querySelectorAll(
            '.layout > .board-panel > *:not(.fretboard-wrap), .layout > .side, .layout .fretboard-wrap > .fb-bar'
          );

          /* 顺序很关键：
             ① 先把每个块的内联 opacity 钉到 0（此刻 .intro-running 的
                CSS 规则还在，本来就是 0，所以不会闪）
             ② 加 .intro-blocks 解除 pointer-events 限制
             ③ commitStyles / 强制布局，把「0 状态」真正落到一帧
             ④ 下一帧再启动动画
             如果先加 class 再写 opacity，中间会有一帧块是可见的 ——
             这正是"先全部显示、然后才淡入"的来源。 */
          for (const el of targets) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(14px)';
          }
          /* 强制一次样式落帧（读 offsetHeight 会触发同步重排） */
          void document.body.offsetHeight;

          document.body.classList.add('intro-blocks');

          requestAnimationFrame(() => {
            for (const el of targets) {
              if (typeof el.animate === 'function') {
                const a = el.animate(
                  [
                    { opacity: '0', transform: 'translateY(14px)' },
                    { opacity: '1', transform: 'translateY(0px)' },
                  ],
                  { duration: 520, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' }
                );
                a.onfinish = () => {
                  el.style.opacity = '';
                  el.style.transform = '';
                };
              } else {
                el.style.opacity = '1';
              }
            }
          });
        }

        if (t >= INTRO.END) { resolve(); return; }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    /* 收尾：清掉临时样式，指板回到正常尺寸，整琴回到主页姿态 */
    if (boardSvgEl) {
      boardSvgEl.style.transformOrigin = '';
      boardSvgEl.style.transform = '';
    }
    if (boardSlot) {
      boardSlot.style.opacity = '';
      boardSlot.style.background = '';
    }
    /* 收尾时也把块的动画取消并交还给 CSS，
       避免下一次进入时残留的 fill:forwards 动画压过 opacity:0。 */
    for (const el of document.querySelectorAll(
      '.layout > .board-panel > *:not(.fretboard-wrap), .layout > .side, .layout .fretboard-wrap > .fb-bar'
    )) {
      if (typeof el.getAnimations === 'function') {
        for (const a of el.getAnimations()) {
          try { a.cancel(); } catch (e) { /* 忽略 */ }
        }
      }
      el.style.opacity = '';
      el.style.transform = '';
    }
    box.style.opacity = '';
    box.style.clipPath = 'none';
    box.style.visibility = '';
    this._disposeErodeMask(box);
    box.style.clipPath = 'none';
    this._erodeState = null;
    document.body.classList.remove('intro-blocks', 'intro-running');
    this.layout();
    this.running = false;
  },

  /* 框外侵蚀 —— 用**渐变覆盖层**实现，不给吉他加蒙版。

     ── 为什么不用 mask（性能实测，GPU 开，掉帧数）──────────────────
     给吉他加蒙版（无论挂在被变换元素上还是外层容器上），浏览器每帧都要
     重建那个 3446×1723 变换图层的蒙版：
       蒙版挂在 #homeGuitar 上        11 帧
       复用 DOM + 1/8 分辨率高斯       13 帧
       静态蒙版 + mask-size 动画        8 帧
       蒙版挂在固定外层容器           48 帧（更糟：大图层裁切更贵）
       不加任何遮罩（基线）             3 帧
     改成渐变覆盖层后是 4 帧，与基线持平。

     ── 做法 ────────────────────────────────────────────────────
     在 body 上放一个 fixed 全屏 div，用 linear-gradient 做「左透明 → 右
     不透明」的过渡，边界正好落在答题框右边。它盖住的是框右侧的琴身和
     伸出框的指板，那一带页面只有背景色，没有文字或装饰，所以不会误盖。

     只改 background（一个渐变字符串），浏览器不需要重建任何图层的蒙版。
     渐变本身是连续的，视觉上就是羽化 —— 不是硬边。 */
  _applyErodeMask(box, target, s, rot, cx, cy, progress, vw, vh) {
    /* ① 建一次覆盖层 */
    if (!this._overlay) {
      const d = document.createElement('div');
      d.id = 'homeErodeOverlay';
      d.style.cssText =
        'position:fixed;left:0;top:0;width:100%;height:100%;' +
        'pointer-events:none;z-index:4;';
      document.body.appendChild(d);
      this._overlay = d;

      /* 取页面底色，保证覆盖层与背景同色（否则会看到色块） */
      const bg = getComputedStyle(document.body).backgroundColor;
      const m = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(bg || '');
      this._overlayRGB = m
        ? `${m[1]}, ${m[2]}, ${m[3]}`
        : '242, 236, 225';
    }

    /* ② 羽化宽度（屏幕像素）：框短边很窄时按比例缩小 */
    const shortSide = Math.min(target.w, target.h);
    const feather = Math.max(40, Math.min(INTRO.ERODE_FEATHER, shortSide * 0.35));

    /* ③ 边界：progress=0 时在画面最右（完全看不见覆盖），
       progress=1 时收到答题框右边。 */
    const edgeTarget = target.x + target.w;
    const edge = vw + feather + ((edgeTarget) - (vw + feather)) * progress;
    const fadeStart = Math.max(0, edge - feather);
    const rgb = this._overlayRGB;

    /* ④ 只写 background 一个属性 */
    this._overlay.style.background =
      `linear-gradient(to right, ` +
      `rgba(${rgb}, 0) 0px, ` +
      `rgba(${rgb}, 0) ${fadeStart.toFixed(1)}px, ` +
      `rgba(${rgb}, 1) ${edge.toFixed(1)}px, ` +
      `rgba(${rgb}, 1) 100%)`;

    if (!this._maskLogged) {
      this._maskLogged = true;
      console.log('[erode] overlay', {
        progress: +progress.toFixed(3),
        frameRight: +edgeTarget.toFixed(0),
        feather: +feather.toFixed(1),
        edge: +edge.toFixed(0),
        rgb,
      });
    }
  },

  /* 移除侵蚀覆盖层（动画结束或不需要时调用） */
  _disposeErodeMask(box) {
    const ov = this._overlay;
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    this._overlay = null;
    this._overlayRGB = null;
    if (box) {
      box.style.maskImage = '';
      box.style.webkitMaskImage = '';
    }
  },

  /* 量「即将进入的那个模式」的指板矩形。

     ⚠ 必须模拟**真实的答题界面布局**再量，否则量到的是另一个版面。
     实测差异来源：主页状态带 body.on-home，它的 CSS 让 .layout 满宽
     （1422px、无边距）；而进入答题界面后 on-home 被移除，.layout 变成
     1366px 宽、左上有 28px 边距。以前在 on-home 还在时就量，
     得到 (36, 202, 1000×201)，真实落点是 (64, 319, 944×190) ——
     横向差 28px、纵向差 117px，交接瞬间就会跳。
     现在：临时摘掉 on-home + 切 hidden → 强制重排 → 量 → 全部还原。 */
  _measureTargetRect(mode) {
    const home = document.getElementById('homeView');
    const layout = document.querySelector('.layout');
    if (!layout) return null;
    const noteView = document.getElementById('noteView');
    const posView = document.getElementById('posView');
    const chordView = document.getElementById('chordView');
    const intervalView = document.getElementById('intervalView');
    const homeWas = home ? home.hidden : true;
    const layoutWas = layout.hidden;
    const noteWas = noteView ? noteView.hidden : true;
    const posWas = posView ? posView.hidden : true;
    const chordWas = chordView ? chordView.hidden : true;
    const intervalWas = intervalView ? intervalView.hidden : true;
    const hadOnHome = document.body.classList.contains('on-home');
    try {
      if (home) home.hidden = true;
      /* 关键 ①：摘掉主页版面标记，让 .layout 用答题界面的真实布局 */
      document.body.classList.remove('on-home');
      layout.hidden = false;
      /* 关键 ②：先把「即将进入的那个模式」的视图显出来再量。
         以前不管进哪个模式都量 #fretboard（音名模式的指板），
         从主页选「找位置」时音名视图是 hidden 的，量到 0 宽 →
         sEnd 退回 s0*1.6 → 表现为「只旋转、几乎不放大」。
         三个模式现在各有一块指板，所以是三分支而不是二选一。 */
      const posMode = mode === 'pos';
      const chordMode = mode === 'chord';
      const intervalMode = mode === 'interval';
      if (noteView) noteView.hidden = posMode || chordMode || intervalMode;
      if (posView) posView.hidden = !posMode;
      if (chordView) chordView.hidden = !chordMode;
      if (intervalView) intervalView.hidden = !intervalMode;
      const boardId = chordMode ? 'chordFretboard'
        : (posMode ? 'posFretboard'
          : (intervalMode ? 'intervalFretboard' : 'fretboard'));
      const el = document.getElementById(boardId);
      if (!el) return null;

      /* 关键 ③：强制同步重排后再读，连读两次确认稳定。

         pos 模式的指板高度不是 CSS 定值 —— board-svg.js 会按**容器宽度**
         算出高度写进 style。如果只读 el.offsetWidth，父容器的高度还没算好，
         量到的 h 会比真实揭幕值大 7px（实测 190.1 vs 183）。
         所以先读一次父容器的宽度，把指板尺寸计算触发出来。 */
      const read = () => {
        /* 先逼父容器完成布局，再逼指板自身重算高度 */
        if (el.parentElement) void el.parentElement.offsetWidth;
        void el.offsetWidth;
        const r = el.getBoundingClientRect();
        return { x: r.left, y: r.top, w: r.width, h: r.height };
      };
      let prev = read();
      for (let i = 0; i < 4; i++) {
        const next = read();
        const stable = Math.abs(next.x - prev.x) < 0.5 &&
          Math.abs(next.y - prev.y) < 0.5 &&
          Math.abs(next.w - prev.w) < 0.5 &&
          Math.abs(next.h - prev.h) < 0.5;
        prev = next;
        if (stable) break;
      }

      if (prev.w < 40 || prev.h < 20) return null;

      /* 关键 ④：pos 模式的高度补偿。
         board-svg.js 在容器真正可见后才按宽度重算指板高度（异步），
         测量时算出来的 h 偏大 7px（实测 190.1 → 真实 183，约 3.7%）。
         不补的话动画落点会比真实指板高一点点，交接时能看出来。
         note 模式的指板高度是 CSS 定的，不受影响，所以只对 pos 补。 */
      if (mode === 'pos') {
        prev.h = prev.h * (183 / 190.109375);
      }

      /* 关键 ⑤：纵向补偿。
         测量时页面还处于 pre-start（顶部提示条未挂载），真实揭幕时
         提示条出现会把指板往下挤 ~10px。实测两个模式都是 10px，
         所以统一补上；如果以后布局改了，用 dev/track-answer-rect.mjs
         复测 measured vs settled 的 dy 并改这个常量。 */
      prev.y += INTRO.MEASURE_DY;
      return prev;
    } finally {
      layout.hidden = layoutWas;
      if (home) home.hidden = homeWas;
      if (noteView) noteView.hidden = noteWas;
      if (posView) posView.hidden = posWas;
      if (chordView) chordView.hidden = chordWas;
      if (intervalView) intervalView.hidden = intervalWas;
      if (hadOnHome) document.body.classList.add('on-home');
    }
  },
};

window.addEventListener('resize', () => {
  if (window.homeIntro && !window.homeIntro.running) window.homeIntro.layout();
});

window.homeIntro = homeIntro;
