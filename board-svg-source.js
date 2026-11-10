/* 指板 SVG 源（内联自 assets/guitar/board.svg）。
   这样双击 file:// 打开也能用 —— 浏览器在 file:// 下会拦 fetch/XHR 读本地文件，
   但内联进 JS 的字符串不受限制。
   ⚠ 改它请改 assets/guitar/board.svg 后跑 node build.mjs，不要手改本文件。 */
const BOARD_SVG_SOURCE = String.raw`<?xml version="1.0" encoding="UTF-8"?>
<!-- 由 src/build/build-board-svg.mjs 从 guitar-build/guitar-3000-coloured.svg 生成，请勿手改 -->
<!-- 只含「指板 / 品柱 / 品记 / 六根弦」四层，原样搬运，外圈 rotate(-90) 转成横向 -->
<!-- 原图矩形：x 1305..1688  y 1080..3105（琴枕 → 12 品） -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" id="board" width="2025" height="383"
     viewBox="960.22 1415.22 2025 383">
  <g id="horiz" transform="rotate(-90 1491.72 1611.5)">
  <g
     inkscape:groupmode="layer"
     id="g3"
     inkscape:label="指板"
     style="display:inline"
     transform="rotate(0.32596,1491.72,1611.5)">
    <path
       style="display:inline;fill:#141416;fill-opacity:1;stroke:none"
       d="m 1363.4,1080.61 250.592,-1.426 42.363,2025.459 12.202,525.92 -330.69,1.882 6.218,-526.026 z"
       id="path3" />
    <g
       id="binding-board">
      <path
         id="bind-board-1"
         style="display:inline;fill:#3a2f24;fill-opacity:1;fill-rule:evenodd;stroke:none"
         d="M 1363.40,1080.61 L 1613.99,1079.18 L 1656.36,3104.64 L 1668.56,3630.56 L 1337.87,3632.45 L 1344.09,3106.42 Z M 1378.26,1095.53 L 1599.30,1094.27 L 1641.36,3104.97 L 1653.21,3615.65 L 1353.05,3617.36 L 1359.08,3106.58 Z" />
    </g>
  </g>
  <g
     inkscape:groupmode="layer"
     id="g15"
     inkscape:label="品柱"
     style="display:inline"
     transform="rotate(0.32596,1491.72,1611.5)">
    <path
       style="display:inline;fill:#9e9ea3;fill-opacity:1;stroke:none"
       d="m 1369.295,1079.55 238.789,-1.359 0.086,15 -238.789,1.359 z m -1.903,199.661 244.868,-1.393 0.085,14.999 -244.868,1.393 z m -1.875,196.63 250.855,-1.427 0.085,15 -250.855,1.427 z m -1.65,173.04 256.123,-1.457 0.085,14.999 -256.123,1.457 z m -1.599,167.659 261.228,-1.486 0.085,14.999 -261.227,1.487 z m -1.613,169.199 266.379,-1.516 0.086,15 -266.379,1.516 z m -1.425,149.458 270.93,-1.541 0.085,14.999 -270.929,1.542 z m -1.362,142.888 275.28,-1.566 0.085,14.999 -275.28,1.567 z m -1.271,133.337 279.339,-1.589 0.085,15 -279.339,1.589 z m -1.232,129.177 283.272,-1.612 0.086,15 -283.273,1.612 z m -1.128,118.336 286.875,-1.632 0.085,15 -286.875,1.632 z m -1.108,116.147 290.412,-1.652 0.085,14.999 -290.411,1.652 z m -0.977,102.505 293.532,-1.67 0.086,15 -293.533,1.67 z m -1.004,105.296 296.738,-1.688 0.086,15 -296.739,1.688 z m -0.886,92.885 299.567,-1.704 0.085,15 -299.566,1.704 z m -1.052,93.516 302.735,-1.722 0.085,14.999 -302.735,1.723 z m -1.021,86.376 305.76,-1.74 0.085,15 -305.76,1.74 z m -0.968,81.885 308.627,-1.755 0.086,14.999 -308.627,1.756 z m -0.878,74.285 311.228,-1.77 0.086,14.999 -311.228,1.771 z m -0.845,71.475 313.731,-1.785 0.086,15 -313.731,1.785 z m -0.786,66.535 316.061,-1.798 0.085,14.999 -316.061,1.798 z m -0.669,56.613 318.043,-1.809 0.085,15 -318.043,1.809 z"
       id="path15" />
  </g>
  <g
     inkscape:groupmode="layer"
     id="layer2"
     inkscape:label="品记"
     transform="rotate(0.32596,1491.72,1611.5)"
     style="display:inline">
    <ellipse
       style="fill:#d9dadd;fill-opacity:1;stroke:none"
       id="path16"
       cx="1492.0574"
       cy="1578.2748"
       rx="12.095247"
       ry="12.405382" />
    <ellipse
       style="fill:#d9dadd;fill-opacity:1;stroke:none"
       id="path16-8"
       cx="1493.7344"
       cy="1915.8357"
       rx="12.095247"
       ry="12.405382" />
    <ellipse
       style="fill:#d9dadd;fill-opacity:1;stroke:none"
       id="path16-1"
       cx="1495.6807"
       cy="2221.0127"
       rx="12.247245"
       ry="12.402312" />
    <ellipse
       style="display:inline;fill:#d9dadd;fill-opacity:1;stroke:none"
       id="path16-2"
       cx="1496.975"
       cy="2489.804"
       rx="12.095247"
       ry="12.405382" />
    <ellipse
       style="display:inline;fill:#d9dadd;fill-opacity:1;stroke:none"
       id="path16-23"
       cx="1425.804"
       cy="2841.5952"
       rx="12.095247"
       ry="12.405382" />
    <ellipse
       style="display:inline;fill:#d9dadd;fill-opacity:1;stroke:none"
       id="path16-85"
       cx="1574.3865"
       cy="2840.9749"
       rx="12.095247"
       ry="12.405382" />
    <ellipse
       style="display:inline;fill:#d9dadd;fill-opacity:1;stroke:none"
       id="path16-9"
       cx="1501.1837"
       cy="3138.3862"
       rx="12.095247"
       ry="12.405382" />
    <ellipse
       style="display:inline;fill:#d9dadd;fill-opacity:1;stroke:none"
       id="path16-4"
       cx="1501.1837"
       cy="3311.2849"
       rx="12.095247"
       ry="12.405382" />
  </g>
  <g
     inkscape:groupmode="layer"
     id="layer21"
     inkscape:label="六弦"
     style="display:inline"
     transform="rotate(0.32596,1491.72,1611.5)">
    <path
       style="display:inline;fill:#b0864e;fill-opacity:1;stroke:none"
       d="m 1375.3533,819.7632 c 3.6441,1.70574 8.289,0.31192 8.289,0.31192 l 0.3331,5.8132 1.0855,254.00018 -0.3569,29.7058 -38.0346,3696.2857 c 0,0 -5.4276,-0.5757 -8.5115,0.2193 l 38.8395,-3696.1277 0.3102,-30.0831 z"
       id="path55"
       sodipodi:nodetypes="cccccccccc" />
  </g>
  <g
     inkscape:groupmode="layer"
     id="layer23"
     inkscape:label="五弦"
     style="display:inline"
     transform="rotate(0.32596,1491.72,1611.5)">
    <path
       style="display:inline;fill:#b0864e;fill-opacity:1;stroke:none"
       d="m 1378.4567,591.31366 43.2001,489.19514 1.8608,29.1526 -19.2283,3695.4083 -0.039,0.8917 c 0,0 5.7762,-0.4265 9.808,-0.2714 l 17.3014,-3696.4795 0.3289,-14.8026 -1.4254,-14.8026 -43.437,-495.11577 z"
       id="path56"
       sodipodi:nodetypes="ccccccccccc" />
  </g>
  <g
     inkscape:groupmode="layer"
     id="layer24"
     inkscape:label="四弦"
     style="display:inline"
     transform="rotate(0.32596,1491.72,1611.5)">
    <path
       style="display:inline;fill:#b0864e;fill-opacity:1;stroke:none"
       d="m 1364.9621,364.56851 c 5.5824,-1.93834 8.9939,-5.51018 8.9939,-5.51018 0,0.77533 96.8773,720.32767 96.8773,720.32767 l 1.9737,14.4737 0.2193,15.3508 4.4547,3696.1693 c 0,0 -4.8071,0.1551 -8.6838,1.5507 l -3.8766,-3708.744 z"
       id="path57"
       sodipodi:nodetypes="ccccccccc" />
  </g>
  <g
     inkscape:groupmode="layer"
     id="layer25"
     inkscape:label="三弦"
     style="display:inline"
     transform="rotate(0.32596,1491.72,1611.5)">
    <path
       style="display:inline;fill:#c8c8cc;fill-opacity:1;stroke:none"
       d="m 1596.2578,358.92247 c 0,0 1.917,2.45522 7.3995,4.4289 l -87.7196,717.77773 -1.8608,13.6459 v 13.6459 l 37.8364,3698.0444 c 0,0 -2.1709,-2.8687 -8.9939,-1.2405 l -36.906,-3696.3387 -0.3101,-14.4213 z"
       id="path58"
       sodipodi:nodetypes="cccccccccc" />
  </g>
  <g
     inkscape:groupmode="layer"
     id="layer26"
     inkscape:label="二弦"
     style="display:inline"
     transform="rotate(0.32596,1491.72,1611.5)">
    <path
       style="display:inline;fill:#c8c8cc;fill-opacity:1;stroke:none"
       d="m 1587.406,581.95872 c 0,0 0.1534,3.26171 6.046,7.6036 l -37.0923,489.82368 -0.6579,9.4298 -0.2193,19.5175 60.6287,3696.4263 c 0,0 -5.4752,-0.7026 -9.0937,-0.045 l -59.8684,-3709.9778 z"
       id="path59"
       sodipodi:nodetypes="ccccccccc" />
  </g>
  <g
     inkscape:groupmode="layer"
     id="layer27"
     inkscape:label="一弦"
     style="display:inline"
     transform="rotate(0.32596,1491.72,1611.5)">
    <path
       style="display:inline;fill:#c8c8cc;fill-opacity:1;stroke:none"
       d="m 1592.1182,818.90733 c 3.9473,0.32895 7.7493,-0.89954 7.7493,-0.89954 l 2.5448,260.93961 v 28.9473 l 80.0677,3696.3997 c 0,0 -5.4274,-1.0855 -8.9939,0 l -79.7046,-3696.1836 -0.6203,-29.4628 z"
       id="path14"
       sodipodi:nodetypes="ccccccccc" />
  </g>
  
  

  

  

  

  

  

  

  

  

  

  
</g>

  <!-- ===== 21 品补边（tools/extend-21.mjs 生成）=====
       实测：指板 path3 右边界 3522、品柱 path15 右边界 3511，
       而 21 品格的右边界（22 品线）= 3551.5，各差 30 / 41 单位。
       这里用 viewBox 坐标直接补两段矩形（放在 horiz 之外，
       因此没有 rotate(-90)；30 单位宽度下 0.326° 的倾斜差 < 0.2 单位，不可见）。 -->
  <g id="ext21">
    <rect x="3520" y="1424" width="35.5" height="360" fill="#141416"/>
    <rect x="3509" y="1432" width="46.5" height="345" fill="#9e9ea3"/>
  </g>
</svg>
`;
