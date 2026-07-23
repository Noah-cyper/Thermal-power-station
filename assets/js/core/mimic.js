/* =====================================================================
   THERMOSCADA — Mimic library (thư viện vẽ sơ đồ P&ID dùng chung)
   Ký hiệu thiết bị (bơm/quạt/van/HX…), màu môi chất ISA-101 §9.4,
   bong bóng đo ISA-5.1 (live), gradient khối, khung panel + 2 theme.
   Dùng cho Tổng quan, Lò hơi, Tua-bin… (một nguồn duy nhất).
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, F = global.F;

  // Màu môi chất (master prompt §9.4) — dùng chung cả 2 theme
  var colors = {
    STEAM: '#D93A3A', RH: '#E8791E', WATER: '#2E6FD9', COND: '#29A38A', CW: '#1FA5D6',
    COAL: '#4A4A4A', FLUE: '#8B7355', AIR: '#93B8D8', ELEC: '#E0A300', SHAFT: '#7B8794', OIL: '#B8860B'
  };

  function defs() {
    return '<defs>' +
      '<linearGradient id="gMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdfeff"/><stop offset=".5" stop-color="#dbe3ee"/><stop offset="1" stop-color="#c3cddb"/></linearGradient>' +
      '<linearGradient id="gVessel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dbe3ee"/><stop offset=".45" stop-color="#f6f9fc"/><stop offset="1" stop-color="#cfd8e4"/></linearGradient>' +
      '<radialGradient id="gFlame" cx=".5" cy=".85" r=".85"><stop offset="0" stop-color="#ffe487"/><stop offset=".45" stop-color="#f7a63b"/><stop offset="1" stop-color="#e4551f"/></radialGradient>' +
      '<linearGradient id="gTurbo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4d8ef"/><stop offset=".5" stop-color="#6f9fce"/><stop offset="1" stop-color="#46709e"/></linearGradient>' +
      '<linearGradient id="gGen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7dd97"/><stop offset="1" stop-color="#d79a2b"/></linearGradient>' +
      '<radialGradient id="gCoal" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#a2825c"/><stop offset="1" stop-color="#6d5637"/></radialGradient>' +
      '</defs>';
  }

  // Bong bóng đo ISA (2 dòng mã + giá trị live). dir: 'down'|'up'|'left'|'right'
  function isa(cx, cy, name, tick, dir, r) {
    var sp = S.spec(name); if (!sp) return '';
    var parts = sp.isa.split('-'), v = F.fmt(S.val(name), sp.dp);
    r = r || 15;
    var g = '<g>';
    if (tick != null) {
      var x2 = cx, y2 = tick;
      if (dir === 'left' || dir === 'right') { x2 = tick; y2 = cy; }
      var x1 = cx, y1 = cy;
      if (dir === 'left') x1 = cx - r; else if (dir === 'right') x1 = cx + r; else if (dir === 'up') y1 = cy - r; else y1 = cy + r;
      g += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="var(--pid-line)" stroke-width="1" stroke-dasharray="2 2"/>';
    }
    g += '<circle class="isa" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>';
    g += '<text class="isacode" x="' + cx + '" y="' + (cy - 3) + '" text-anchor="middle">' + parts[0] + '</text>';
    g += '<text class="isacode" x="' + cx + '" y="' + (cy + 6) + '" text-anchor="middle">' + parts[1] + '</text>';
    g += '<text class="isaval" x="' + cx + '" y="' + (cy + r + 12) + '" text-anchor="middle" data-live="' + S.activeUnit + '|' + name + '||1|1">' + v + ' ' + sp.u + '</text>';
    g += '</g>';
    return g;
  }
  function pipe(d, color, w, flow) {
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + (w || 5) + '" stroke-linecap="round" stroke-linejoin="round"' + (flow ? ' class="flow"' : '') + '/>';
  }
  function lbl(x, y, t, cls) { return '<text class="' + (cls || 'eqname') + '" x="' + x + '" y="' + y + '" text-anchor="middle">' + t + '</text>'; }
  function code(x, y, t) { return '<text class="eqlabel" x="' + x + '" y="' + y + '" text-anchor="middle">' + t + '</text>'; }
  function motor(cx, cy) { return '<rect x="' + (cx - 7) + '" y="' + (cy - 6) + '" width="14" height="12" rx="2" fill="var(--pid-panel)" stroke="var(--pid-line)" stroke-width="1"/><text x="' + cx + '" y="' + (cy + 3.5) + '" text-anchor="middle" font-size="8" font-weight="700" fill="var(--pid-dim)">M</text>'; }
  function pump(cx, cy, r, col, key, cd) {
    var g = key ? '<g data-fp="' + key + '" class="eqg clickable">' : '<g>';
    g += '<circle class="eqbox" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>';
    g += '<path d="M' + (cx - r * 0.45) + ' ' + (cy - r * 0.55) + ' L' + (cx + r * 0.72) + ' ' + cy + ' L' + (cx - r * 0.45) + ' ' + (cy + r * 0.55) + ' Z" fill="' + col + '" opacity=".85"/>';
    g += motor(cx, cy - r - 5);
    if (cd) g += code(cx, cy + r + 12, cd);
    return g + '</g>';
  }
  function fan(cx, cy, r, key, cd) {
    var bl = '';
    for (var i = 0; i < 4; i++) bl += '<path d="M0 0 Q' + (r * 0.78) + ' ' + (-r * 0.28) + ' ' + (r * 0.92) + ' 0 Q' + (r * 0.4) + ' ' + (r * 0.12) + ' 0 0Z" fill="var(--pid-line2)" opacity=".5" transform="rotate(' + (i * 90) + ')"/>';
    var g = key ? '<g data-fp="' + key + '" class="eqg clickable">' : '<g>';
    g += '<circle class="eqbox" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>';
    g += '<g transform="translate(' + cx + ' ' + cy + ')">' + bl + '<circle r="3" fill="var(--pid-line)"/></g>';
    if (cd) g += code(cx, cy + r + 12, cd);
    return g + '</g>';
  }
  function valve(cx, cy, col) {
    var s = 6.5;
    return '<path d="M' + (cx - s) + ' ' + (cy - s) + ' L' + cx + ' ' + cy + ' L' + (cx - s) + ' ' + (cy + s) + ' Z M' + (cx + s) + ' ' + (cy - s) + ' L' + cx + ' ' + cy + ' L' + (cx + s) + ' ' + (cy + s) + ' Z" fill="' + (col || 'var(--pid-panel)') + '" stroke="var(--pid-line)" stroke-width="1.1"/>';
  }
  function heatx(x, y, w, h) {
    var d = 'M' + (x + 4) + ' ' + (y + h / 2), n = Math.floor((w - 8) / 8);
    for (var i = 0; i < n; i++) d += ' l4 ' + (i % 2 ? h / 2.6 : -h / 2.6) + ' l4 ' + (i % 2 ? -h / 2.6 : h / 2.6);
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" data-fill="metal" stroke="var(--pid-line)" stroke-width="1.2"/><path d="' + d + '" fill="none" stroke="var(--pid-line2)" stroke-width="1.3"/>';
  }
  // Hộp thiết bị có mã + tên; key ⇒ clickable mở faceplate
  function eqBox(x, y, w, h, cd, nm, fill, key) {
    var open = key ? '<g data-fp="' + key + '" class="eqg clickable">' : '<g>';
    return open + '<rect class="eqbox" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="7"' + (fill ? ' data-fill="' + fill + '"' : '') + '/>' +
      '<text class="eqlabel" x="' + (x + w / 2) + '" y="' + (y + h - 15) + '" text-anchor="middle">' + cd + '</text>' +
      '<text class="eqname" x="' + (x + w / 2) + '" y="' + (y + h - 4) + '" text-anchor="middle">' + nm + '</text></g>';
  }

  // Khung panel: bọc nội dung SVG trong .pid (mặc định HP-HMI) + defs + nền
  function panel(inner, viewBox, label) {
    return '<div class="pid pid--full hmi-hp">' +
      '<svg viewBox="' + viewBox + '" role="img"' + (label ? ' aria-label="' + label + '"' : '') + '>' +
      defs() + '<rect x="0" y="0" width="100%" height="100%" fill="var(--pid-canvas)"/>' + inner + '</svg></div>';
  }
  function themeToggle() {
    return '<div class="pid-theme" style="margin-left:12px">' +
      '<button data-pidtheme="hp" class="is-active">HP-HMI</button>' +
      '<button data-pidtheme="classic">Cổ điển</button></div>';
  }
  function setTheme(t) {
    if (t !== 'hp' && t !== 'classic') return;
    document.querySelectorAll('.pid--full').forEach(function (p) { p.classList.toggle('hmi-hp', t === 'hp'); });
    document.querySelectorAll('.pid-theme [data-pidtheme]').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-pidtheme') === t); });
    var fp = document.querySelector('.fp-overlay'); if (fp) fp.classList.toggle('fp-hp', t === 'hp');
  }
  // Gắn tooltip KKS (native <title>) cho thiết bị có data-fp trong 1 panel
  function kksTitles(root) {
    var EQ = (global.Faceplate && global.Faceplate.EQ) || {}, up = S.activeUnit === 'S2' ? '2' : '1';
    root.querySelectorAll('.pid--full [data-fp]').forEach(function (g) {
      var eq = EQ[g.getAttribute('data-fp')]; if (!eq || g.querySelector('title')) return;
      var el = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      el.textContent = 'KKS ' + up + eq.kks + ' · ' + eq.code + ' — ' + eq.name;
      g.insertBefore(el, g.firstChild);
    });
  }

  global.M = {
    colors: colors, defs: defs, isa: isa, pipe: pipe, lbl: lbl, code: code,
    motor: motor, pump: pump, fan: fan, valve: valve, heatx: heatx, eqBox: eqBox,
    panel: panel, themeToggle: themeToggle, setTheme: setTheme, kksTitles: kksTitles
  };
})(window);
