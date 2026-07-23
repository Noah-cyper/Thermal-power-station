/* =====================================================================
   VIEW · Tua-bin & Máy phát (Turbine–Generator)
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C, F = global.F, M = global.M;
  var V = global.Views = global.Views || {};

  /* ---- Mimic Tua-bin–Máy phát (HP-HMI): HP·IP·LP · gối trục · bình ngưng · máy phát ---- */
  function turbineMimic() {
    var CO = M.colors, s = '';
    // ===== Ống =====
    s += M.pipe('M70 66 V150', CO.STEAM, 6, true);                 // hơi chính
    s += M.pipe('M70 168 V210 H176', CO.STEAM, 6, true);           // → HP
    s += M.pipe('M270 200 V92 H150', CO.RH, 5, true);              // HP → cold RH (lên lò)
    s += M.pipe('M330 92 V180', CO.RH, 5, true);                   // hot RH → IP
    s += M.pipe('M412 180 V150 H432', CO.STEAM, 5, true);          // crossover IP → LP
    s += M.pipe('M516 260 V322', CO.RH, 8, true);                  // LP thoát → bình ngưng
    s += M.pipe('M440 362 H356', CO.CW, 6, true);                  // nước làm mát ra
    s += M.pipe('M620 362 H704', CO.CW, 6, true);                  // nước làm mát vào
    s += M.pipe('M176 210 H772', CO.SHAFT, 5);                     // trục
    s += M.pipe('M806 210 H892', CO.ELEC, 5, true);               // máy phát → GSU

    // ===== Thiết bị =====
    s += M.valve(70, 159) + M.lbl(96, 152, 'GV', 'eqname');
    // HP · IP · LP (casing tapered)
    s += '<g data-fp="turbine" class="eqg clickable"><path class="eqbox" data-fill="turbo" d="M176 188 L270 178 L270 242 L176 232 Z"/>' + M.code(223, 262, 'HP') + '</g>';
    s += '<g data-fp="turbine" class="eqg clickable"><path class="eqbox" data-fill="turbo" d="M300 182 L412 172 L412 248 L300 238 Z"/>' + M.code(356, 264, 'IP') + '</g>';
    s += '<g data-fp="turbine" class="eqg clickable"><path class="eqbox" data-fill="turbo" d="M432 168 L600 158 L600 262 L432 252 Z"/>' + M.code(516, 278, 'LP') + '</g>';
    s += M.lbl(430, 52, 'TG-1 · Tua-bin HP·IP·LP', 'eqname');
    // Gối trục
    var brg = [166, 288, 420, 616, 756];
    for (var i = 0; i < brg.length; i++) s += '<path class="eqbox" d="M' + (brg[i] - 10) + ' 232 h20 l-4 22 h-12 z"/>';
    // Máy phát + kích từ
    s += '<g data-fp="generator" class="eqg clickable"><rect class="eqbox" data-fill="gen" x="632" y="178" width="122" height="66" rx="8"/>' +
      '<text x="693" y="218" text-anchor="middle" font-size="22" font-weight="750" fill="var(--pid-genink)" style="pointer-events:none">G</text>' + M.code(693, 264, 'GEN-1') + '</g>';
    s += '<rect class="eqbox" x="768" y="194" width="38" height="32" rx="3"/>' + M.lbl(787, 240, 'Kích từ', 'eqname');
    // Bình ngưng
    s += '<g data-fp="condenser" class="eqg clickable"><rect class="eqbox" data-fill="metal" x="440" y="322" width="180" height="80" rx="5"/>' +
      '<path d="M450 344 q12 8 24 0 q12 -8 24 0 q12 8 24 0 q12 -8 24 0 q12 8 24 0 q12 -8 24 0" fill="none" stroke="' + CO.CW + '" stroke-width="1.5" opacity=".7" style="pointer-events:none"/>' +
      '<path d="M450 374 q12 8 24 0 q12 -8 24 0 q12 8 24 0 q12 -8 24 0 q12 8 24 0 q12 -8 24 0" fill="none" stroke="' + CO.CW + '" stroke-width="1.5" opacity=".7" style="pointer-events:none"/>' +
      M.code(530, 396, 'COND-1') + '</g>' + M.lbl(530, 418, 'Bình ngưng');
    // GSU
    s += '<path d="M894 200 h20 l-10 -12 z M894 220 h20 l-10 12 z" fill="none" stroke="' + CO.ELEC + '" stroke-width="2"/>' + M.lbl(910, 240, '→ GSU', 'eqname');
    // Nhãn dòng
    s += M.lbl(70, 56, 'Hơi chính', 'eqname') + M.lbl(150, 82, '↑ RH lò', 'eqname') + M.lbl(340, 92, 'RH nóng', 'eqname');

    // ===== Điểm đo =====
    s += M.isa(152, 150, 'spd', 210, 'down');
    s += M.isa(108, 116, 'gvP', 70, 'down');
    s += M.isa(238, 130, 'ecc', 210, 'down');
    s += M.isa(560, 122, 'expD', null);
    s += M.isa(300, 300, 'thrT', 232, 'up');
    s += M.isa(420, 300, 'vib', 254, 'up');
    s += M.isa(490, 300, 'brgT', 254, 'up');
    s += M.isa(560, 300, 'stExh', null);
    s += M.isa(672, 402, 'vac', null);
    s += M.isa(626, 128, 'genU', 178, 'down');
    s += M.isa(693, 132, 'mw', 178, 'down');
    s += M.isa(766, 128, 'mvar', null);
    s += M.isa(700, 300, 'statT', null);
    s += M.isa(770, 300, 'pf', null);
    return s;
  }

  function u() { return S.activeUnit; }
  function sysAlarms(names) {
    return S.alarms.filter(function (a) { var p = a.id.split('.'); return p[0] === S.activeUnit && names.indexOf(p[1]) >= 0; });
  }
  var TAGS = ['spd', 'mw', 'mvar', 'vac', 'gvP', 'brgT', 'thrT', 'vib', 'expD', 'ecc', 'stExh', 'genU', 'pf', 'statT', 'rotT', 'exI'];

  function gaugeCard(name, label) {
    return '<div class="card"><div class="card__body" style="display:grid;gap:9px;justify-items:center">' +
      C.gaugeBox(name, u(), { size: 148, label: label }) +
      '<div style="width:100%">' + C.bandBox(name, u()) + '</div></div></div>';
  }

  function drawTrend(root) {
    var cv = root.querySelector('#tb-trend'); if (!cv) return;
    var h = S.history[u()] || {};
    C.trend(cv, [{ data: h.vib || [], color: '--series-1', width: 2, fill: true }],
      { height: 190, min: 20, max: 130, dp: 0, xlabels: ['−3′', '−2′', '−1′', 'hiện tại'], limit: 80 });
  }

  V.turbine = {
    title: 'Tua-bin & Máy phát',
    subtitle: 'Turbine–Generator',
    render: function (root) {
      var uu = u();
      root.innerHTML =
        '<div class="page">' +
          '<div class="page__head"><h2>Tua-bin & Máy phát</h2><span class="sub">Cơ nhiệt tua-bin · giám sát rung · máy phát</span><div class="spacer"></div>' + C.unitTabs() + '</div>' +
          '<div class="card"><div class="card__head">' + C.icon('rotor', 'ico') + '<h3>Sơ đồ tua-bin – máy phát</h3><span class="sub">— ' + S.unit().name + '</span><div class="spacer"></div>' +
            '<div class="legend-row">' +
              '<span class="lg"><span class="d" style="background:' + M.colors.STEAM + '"></span>Hơi</span>' +
              '<span class="lg"><span class="d" style="background:' + M.colors.RH + '"></span>Tái nhiệt</span>' +
              '<span class="lg"><span class="d" style="background:' + M.colors.CW + '"></span>Nước làm mát</span>' +
              '<span class="lg"><span class="d" style="background:' + M.colors.ELEC + '"></span>Điện</span></div>' +
            M.themeToggle() + '</div>' +
            '<div class="card__body">' + M.panel(turbineMimic(), '0 0 960 440', 'Sơ đồ tua-bin máy phát') + '</div></div>' +
          '<div class="grid cols-4" style="margin-top:14px">' +
            gaugeCard('spd', 'Tốc độ tua-bin') +
            gaugeCard('mw', 'Công suất tác dụng') +
            gaugeCard('vac', 'Chân không bình ngưng') +
            gaugeCard('vib', 'Độ rung gối #3') +
          '</div>' +
          '<div class="layout-rail" style="margin-top:14px">' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('rotor', 'ico') + '<h3>Gối trục · Rung · Giãn nở</h3></div><div class="card__body">' +
                C.metric('brgT', uu, { icon: 'thermo' }) + C.metric('thrT', uu, { icon: 'thermo' }) +
                C.metric('vib', uu, { icon: 'activity' }) + C.metric('ecc', uu, { icon: 'rotor' }) +
                C.metric('expD', uu, { icon: 'layers' }) +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('activity', 'ico') + '<h3>Xu hướng độ rung gối #3</h3><div class="spacer"></div>' +
                C.legend([{ label: 'Rung (µm)', color: 'var(--series-1)' }, { label: 'Ngưỡng cảnh báo 80', color: 'var(--alarm)', dash: true }]) + '</div>' +
                '<div class="card__body"><div class="trend"><canvas id="tb-trend"></canvas></div></div></div>' +
            '</div>' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('gen', 'ico') + '<h3>Máy phát</h3></div><div class="card__body">' +
                C.metric('genU', uu, { icon: 'bolt', bar: false }) + C.metric('mvar', uu, { icon: 'activity', bar: false }) +
                C.metric('pf', uu, { icon: 'gauge', bar: false }) + C.metric('statT', uu, { icon: 'thermo', bar: false }) +
                C.metric('rotT', uu, { icon: 'thermo', bar: false }) + C.metric('exI', uu, { icon: 'bolt', bar: false }) +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('valve', 'ico') + '<h3>Hơi & Điều tốc</h3></div><div class="card__body">' +
                C.metric('gvP', uu, { icon: 'valve', bar: false }) + C.metric('stExh', uu, { icon: 'thermo', bar: false }) +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('bell', 'ico') + '<h3>Cảnh báo — Tua-bin ' + uu + '</h3></div><div id="tb-alarms">' + C.alarmRows(sysAlarms(TAGS)) + '</div></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      drawTrend(root);
      if (M.kksTitles) M.kksTitles(root);
      this._root = root;
    },
    update: function () {
      var root = this._root; if (!root) return;
      C.refresh(root);
      var a = root.querySelector('#tb-alarms'); if (a) a.innerHTML = C.alarmRows(sysAlarms(TAGS));
      drawTrend(root);
    }
  };
})(window);
