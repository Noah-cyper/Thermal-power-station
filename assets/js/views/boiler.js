/* =====================================================================
   VIEW · Lò hơi & Đốt (Boiler & Combustion)
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C, F = global.F, M = global.M;
  var V = global.Views = global.Views || {};

  /* ---- Mimic Lò hơi (HP-HMI): buồng lửa · bao hơi · SH/RH/ECO · APH · gió–khói ---- */
  function boilerMimic() {
    var CO = M.colors, s = '';
    // ===== Ống =====
    // Than: bunker → 2 máy nghiền → vòi đốt
    s += M.pipe('M96 140 V196 Q96 212 112 212 H140', CO.COAL, 6, true);
    s += M.pipe('M96 140 V300 H140', CO.COAL, 6, true);
    s += M.pipe('M122 220 H310', CO.COAL, 5, true);
    s += M.pipe('M122 300 H310', CO.COAL, 5, true);
    // Gió: FD → windbox; PA → nghiền; APH → gió nóng
    s += M.pipe('M250 448 V330 H286', CO.AIR, 5, true);
    s += M.pipe('M55 370 V300 H70', CO.AIR, 4, true);
    s += M.pipe('M635 310 V276 H500', CO.AIR, 4, true);
    // Khói: buồng lửa → backpass → APH → ESP → ID → ống khói
    s += M.pipe('M490 120 H510', CO.FLUE, 8, true);
    s += M.pipe('M542 390 V400 H600', CO.FLUE, 8, true);
    s += M.pipe('M670 355 H700', CO.FLUE, 8, true);
    s += M.pipe('M672 355 V160 H700', CO.FLUE, 8, true);
    s += M.pipe('M780 160 H798', CO.FLUE, 8, true);
    s += M.pipe('M842 160 H880', CO.FLUE, 8, true);
    // Hơi chính (SH → tua-bin) + tái nhiệt
    s += M.pipe('M400 62 V34 H636', CO.STEAM, 6, true);
    s += M.pipe('M574 185 H636', CO.RH, 5, true);
    s += M.pipe('M636 215 H574', CO.RH, 5, true);
    // Nước cấp: ECO → bao hơi (downcomer ngoài lò)
    s += M.pipe('M636 386 H660 V300', CO.WATER, 5, true);
    s += M.pipe('M508 300 V102', CO.WATER, 5, true);
    s += M.pipe('M508 300 H660', CO.WATER, 5, true);

    // ===== Thiết bị =====
    // Bunker than
    s += '<g data-fp="bunker" class="eqg clickable"><path class="eqbox" d="M56 32 H136 V86 L108 140 H84 L56 86 Z"/>' +
      '<path d="M64 42 H128 V84 L104 128 H88 L64 84 Z" data-fill="coal" opacity=".5" style="pointer-events:none"/>' +
      M.code(96, 28, 'CB-1A') + '</g>';
    s += '<rect class="eqbox" x="74" y="140" width="44" height="13" rx="2"/>' + M.code(96, 150, 'FEEDER');
    // 2 máy nghiền + PA fan
    s += '<g data-fp="mill" class="eqg clickable"><circle class="eqbox" cx="96" cy="220" r="26"/><circle cx="96" cy="220" r="14" fill="none" stroke="var(--pid-line2)" stroke-width="1.4"/>' + M.code(96, 256, 'MILL-1A') + '</g>' + M.motor(64, 220);
    s += '<g data-fp="mill" class="eqg clickable"><circle class="eqbox" cx="96" cy="300" r="26"/><circle cx="96" cy="300" r="14" fill="none" stroke="var(--pid-line2)" stroke-width="1.4"/>' + M.code(96, 336, 'MILL-1B') + '</g>' + M.motor(64, 300);
    s += M.fan(55, 388, 18) + M.lbl(55, 424, 'Quạt PA');
    // Buồng lửa + bao hơi
    s += '<g data-fp="boiler" class="eqg clickable">';
    s += '<rect class="eqbox" x="310" y="100" width="180" height="290" rx="5" data-fill="vessel"/>';
    for (var mw = 322; mw < 490; mw += 15) s += '<line x1="' + mw + '" y1="102" x2="' + mw + '" y2="330" stroke="var(--pid-line2)" stroke-width="1" style="pointer-events:none"/>';
    s += '<path d="M312 150 h176 M312 132 h176" stroke="var(--pid-line2)" stroke-width="2" fill="none" style="pointer-events:none"/>'; // SH platen
    s += '<rect class="eqbox" x="300" y="60" width="200" height="42" rx="21" data-fill="metal"/>' + M.code(400, 86, 'BAO HƠI');
    s += '</g>';
    s += M.lbl(400, 404, 'BLR-1 · Buồng lửa · Lò hơi');
    // Vòi đốt + ngọn lửa
    s += '<g style="pointer-events:none">';
    s += '<path d="M300 262 l16 8 l-16 8 z M300 292 l16 8 l-16 8 z M300 322 l16 8 l-16 8 z" fill="var(--pid-line)"/>';
    s += '<path d="M384 390 q5 -32 21 -17 q-8 -28 19 -35 q6 25 21 16 q-1 33 -25 38 q-17 4 -21 -2 z" data-fill="flame" opacity=".9"/></g>';
    // Windbox
    s += '<rect class="eqbox" x="286" y="250" width="18" height="86" rx="2"/>' + M.lbl(295, 348, 'WB', 'eqname');
    // Backpass: SH/RH/ECO
    s += '<rect class="eqbox" x="510" y="100" width="64" height="290" rx="4" data-fill="metal"/>';
    s += '<g style="pointer-events:none">';
    s += '<path d="M516 118 h52 M516 132 h52 M516 146 h52" stroke="var(--pid-line2)" stroke-width="1.6" fill="none"/>'; // SH
    s += '<path d="M516 175 h52 M516 190 h52 M516 205 h52" stroke="var(--pid-line2)" stroke-width="1.6" fill="none"/>'; // RH
    s += '<path d="M516 330 h52 M516 345 h52 M516 360 h52 M516 375 h52" stroke="var(--pid-line2)" stroke-width="1.6" fill="none"/></g>'; // ECO
    s += M.code(542, 165, 'SH') + M.code(542, 228, 'RH') + M.code(542, 400, 'ECO');
    // APH
    s += '<rect class="eqbox" x="600" y="312" width="70" height="86" rx="4" data-fill="metal"/>' +
      '<path d="M606 318 l58 74 M664 318 l-58 74" stroke="var(--pid-line2)" stroke-width="1.1" style="pointer-events:none"/>' + M.code(635, 410, 'APH');
    // ESP + ID + ống khói
    s += '<g data-fp="stack" class="eqg clickable"><rect class="eqbox" x="700" y="110" width="80" height="100" rx="4" data-fill="metal"/>';
    for (var ep = 710; ep < 780; ep += 10) s += '<line x1="' + ep + '" y1="118" x2="' + ep + '" y2="202" stroke="var(--pid-line2)" stroke-width="1" style="pointer-events:none"/>';
    s += M.code(740, 224, 'ESP') + '</g>';
    s += M.fan(820, 160, 20, 'stack', 'ID-FAN');
    s += '<g data-fp="stack" class="eqg clickable"><rect class="eqbox" x="880" y="70" width="30" height="150" rx="3" data-fill="metal"/>' + M.code(895, 234, 'STK-1') + '</g>';
    // FD fan
    s += M.fan(250, 470, 20, 'boiler', 'FD-FAN') + M.lbl(250, 506, 'Quạt FD');
    // Nhãn dòng
    s += M.lbl(636, 28, '→ Tua-bin HP', 'eqname') + M.lbl(726, 205, 'RH ↔ IP', 'eqname') + M.lbl(700, 274, 'Nước cấp', 'eqname');

    // ===== Điểm đo =====
    s += M.isa(96, 176, 'coalF', null);
    s += M.isa(64, 250, 'millT', 88, 'right');
    s += M.isa(280, 130, 'furnP', 310, 'right');
    s += M.isa(266, 82, 'drumL', 300, 'right');
    s += M.isa(400, 132, 'msP', 150, 'down');
    s += M.isa(452, 60, 'msT', 100, 'down');
    s += M.isa(360, 40, 'msF', null);
    s += M.isa(600, 190, 'rhT', 574, 'left');
    s += M.isa(430, 200, 'o2', null);
    s += M.isa(542, 300, 'fgT', null);
    s += M.isa(250, 400, 'saT', 448, 'up');
    s += M.isa(700, 300, 'feedF', 660, 'left');
    s += M.isa(895, 60, 'stkT', 70, 'down');
    return s;
  }

  function u() { return S.activeUnit; }
  function sysAlarms(names) {
    return S.alarms.filter(function (a) { var p = a.id.split('.'); return p[0] === S.activeUnit && names.indexOf(p[1]) >= 0; });
  }
  var BOILER_TAGS = ['msP', 'msT', 'msF', 'rhT', 'drumL', 'drumP', 'furnP', 'o2', 'coalF', 'feedF', 'fgT', 'saT'];

  function gaugeCard(name, label) {
    return '<div class="card"><div class="card__body" style="display:grid;gap:9px;justify-items:center">' +
      C.gaugeBox(name, u(), { size: 148, label: label }) +
      '<div style="width:100%">' + C.bandBox(name, u()) + '</div></div></div>';
  }

  function drawTrend(root) {
    var cv = root.querySelector('#bo-trend'); if (!cv) return;
    var h = S.history[u()] || {};
    C.trend(cv, [
      { data: h.msT || [], color: '--series-1', width: 2 },
      { data: h.msT ? h.msT.map(function (v) { return v - 1; }) : [], color: '--series-3', width: 2, dash: true }
    ], { height: 200, min: 500, max: 575, dp: 0, xlabels: ['−3′', '−2′', '−1′', 'hiện tại'], limit: 565 });
  }

  function threeElement() {
    var uu = u();
    return '<div class="cellgrid" style="grid-template-columns:1fr 1fr">' +
      '<div class="cell" style="grid-column:1/-1;text-align:center">' +
        '<div class="k" style="justify-content:center"><span class="dot-st" data-dot="' + uu + '|drumL"></span>Mức nước bao hơi</div>' +
        '<div class="v" style="font-size:30px">' + C.live('drumL', uu, { color: true }) + ' <span class="u">mm</span></div>' +
      '</div>' +
      '<div style="grid-column:1/-1;padding:0 12px 10px">' + C.bandBox('drumL', uu) + '</div>' +
      C.cell('msF', uu, { name: 'Hơi ra' }) +
      C.cell('feedF', uu, { name: 'Nước cấp vào' }) +
      '</div>';
  }

  V.boiler = {
    title: 'Lò hơi & Đốt',
    subtitle: 'Boiler & Combustion',
    render: function (root) {
      var uu = u();
      root.innerHTML =
        '<div class="page">' +
          '<div class="page__head"><h2>Lò hơi & Đốt</h2><span class="sub">Sinh hơi · quá trình cháy · gió–khói</span><div class="spacer"></div>' + C.unitTabs() + '</div>' +
          '<div class="card"><div class="card__head">' + C.icon('flame', 'ico') + '<h3>Sơ đồ lò hơi</h3><span class="sub">— ' + S.unit().name + '</span><div class="spacer"></div>' +
            '<div class="legend-row">' +
              '<span class="lg"><span class="d" style="background:' + M.colors.STEAM + '"></span>Hơi</span>' +
              '<span class="lg"><span class="d" style="background:' + M.colors.RH + '"></span>Tái nhiệt</span>' +
              '<span class="lg"><span class="d" style="background:' + M.colors.WATER + '"></span>Nước cấp</span>' +
              '<span class="lg"><span class="d" style="background:' + M.colors.FLUE + '"></span>Khói</span>' +
              '<span class="lg"><span class="d" style="background:' + M.colors.AIR + '"></span>Gió</span>' +
              '<span class="lg"><span class="d" style="background:' + M.colors.COAL + '"></span>Than</span></div>' +
            M.themeToggle() + '</div>' +
            '<div class="card__body">' + M.panel(boilerMimic(), '0 0 960 530', 'Sơ đồ lò hơi') + '</div></div>' +
          '<div class="grid cols-4" style="margin-top:14px">' +
            gaugeCard('msP', 'Áp suất hơi chính') +
            gaugeCard('msT', 'Nhiệt độ hơi chính') +
            gaugeCard('rhT', 'Nhiệt độ hơi tái nhiệt') +
            gaugeCard('o2', 'Ôxy khói (O₂)') +
          '</div>' +
          '<div class="layout-rail" style="margin-top:14px">' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('drop', 'ico') + '<h3>Hơi & Nước cấp</h3></div><div class="card__body">' +
                C.metric('msF', uu, { icon: 'activity' }) + C.metric('feedF', uu, { icon: 'drop' }) +
                C.metric('drumP', uu, { icon: 'press' }) + C.metric('fwhT', uu, { icon: 'thermo' }) +
                C.metric('saT', uu, { icon: 'wind' }) +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('activity', 'ico') + '<h3>Xu hướng nhiệt độ hơi</h3><div class="spacer"></div>' +
                C.legend([{ label: 'Hơi chính', color: 'var(--series-1)' }, { label: 'Hơi tái nhiệt', color: 'var(--series-3)', dash: true }]) + '</div>' +
                '<div class="card__body"><div class="trend"><canvas id="bo-trend"></canvas></div></div></div>' +
            '</div>' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('flame', 'ico') + '<h3>Quá trình đốt & khói</h3></div><div class="card__body">' +
                C.metric('coalF', uu, { icon: 'coal', bar: false }) + C.metric('o2', uu, { icon: 'wind', bar: false }) +
                C.metric('furnP', uu, { icon: 'press', bar: false }) + C.metric('fgT', uu, { icon: 'smoke', bar: false }) +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('layers', 'ico') + '<h3>Mức bao hơi · điều khiển 3 phần tử</h3></div><div class="card__body">' + threeElement() + '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('bell', 'ico') + '<h3>Cảnh báo — Lò hơi ' + uu + '</h3></div><div id="bo-alarms">' + C.alarmRows(sysAlarms(BOILER_TAGS)) + '</div></div>' +
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
      var a = root.querySelector('#bo-alarms'); if (a) a.innerHTML = C.alarmRows(sysAlarms(BOILER_TAGS));
      drawTrend(root);
    }
  };
})(window);
