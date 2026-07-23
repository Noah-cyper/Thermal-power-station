/* =====================================================================
   VIEW · Tổng quan nhà máy (Plant Overview)
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C, F = global.F;
  var V = global.Views = global.Views || {};

  /* ---- KPI cấp nhà máy ---- */
  function kpiCards() {
    var p = S.plant, n = S.unacked();
    var fSt = S.statusOf('freq', p.freq);
    var mwHist = (S.history.S1 && S.history.S1.mw || []).map(function (v, i) { return v + (S.history.S2.mw[i] || 0); });
    return C.kpi({ label: 'Công suất phát', value: F.fmt(p.totalMW, 0), unit: 'MW', icon: 'bolt', status: 'info',
        sub: 'Thực phát ' + F.fmt(p.netMW, 0) + ' MW · tự dùng ' + F.fmt(p.auxPct, 1) + '%', spark: { data: mwHist, color: 'var(--series-1)' } }) +
      C.kpi({ label: 'Tần số lưới', value: F.fmt(p.freq, 2), unit: 'Hz', icon: 'activity', status: fSt === 'ok' ? 'ok' : 'warn',
        sub: 'Thanh cái 220kV · ' + F.fmt(p.hvU, 1) + ' kV' }) +
      C.kpi({ label: 'Tổ máy vận hành', value: '2 / 2', unit: '', icon: 'factory', status: 'ok',
        sub: 'S1 · S2 hòa lưới' }) +
      C.kpi({ label: 'Cảnh báo hoạt động', value: F.fmt0(n), unit: '', icon: 'bell', status: n > 0 ? 'warn' : 'ok',
        sub: n > 0 ? 'cần xác nhận (ack)' : 'không có cảnh báo mới' }) +
      C.kpi({ label: 'Khả dụng (AF)', value: F.fmt(p.avail, 1), unit: '%', icon: 'check', status: 'ok',
        sub: 'trung bình 30 ngày' }) +
      C.kpi({ label: 'Than tiêu thụ (ca)', value: F.fmt(p.coalDay + 1840, 0), unit: 'tấn', icon: 'coal', status: 'info',
        sub: 'ước tính · 2 tổ máy' });
  }

  /* ============================================================
     Sơ đồ công nghệ (P&ID chi tiết) — mimic kiểu SCADA công nghiệp
     Ống tô theo màu công chất · thiết bị vẽ ký hiệu thật · điểm đo live
     ============================================================ */
  var STEAM = '#d64545', RH = '#e07a7a', WATER = '#2b7fd4', COND = '#5aa0e0',
    COAL = '#8a6d4b', FLUE = '#c2a83e', AIR = '#2fa8a0', ELEC = '#e0a300', SHAFT = '#4b5a72';

  // Bong bóng đo ISA (2 dòng mã + giá trị live). dir: 'down'|'up'|'left'|'right' cho vạch nối
  function isa(cx, cy, name, tick, dir, r) {
    var sp = S.spec(name); if (!sp) return '';
    var parts = sp.isa.split('-'), v = F.fmt(S.val(name), sp.dp);
    r = r || 15;
    var g = '<g>';
    if (tick != null) {
      var x2 = cx, y2 = tick;
      if (dir === 'left') { x2 = tick; y2 = cy; } else if (dir === 'right') { x2 = tick; y2 = cy; }
      var x1 = cx, y1 = cy;
      if (dir === 'left') x1 = cx - r; else if (dir === 'right') x1 = cx + r; else if (dir === 'up') y1 = cy - r; else y1 = cy + r;
      g += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="2 2"/>';
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
  function motor(cx, cy) { return '<rect x="' + (cx - 7) + '" y="' + (cy - 6) + '" width="14" height="12" rx="2" fill="var(--surface-3)" stroke="var(--line-strong)" stroke-width="1"/><text x="' + cx + '" y="' + (cy + 3.5) + '" text-anchor="middle" font-size="8" font-weight="700" fill="var(--muted)">M</text>'; }
  // Bơm: vòng tròn + cánh + động cơ; clickable nếu có key
  function pump(cx, cy, r, col, key, cd) {
    var g = key ? '<g data-fp="' + key + '" class="eqg clickable">' : '<g>';
    g += '<circle class="eqbox" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>';
    g += '<path d="M' + (cx - r * 0.45) + ' ' + (cy - r * 0.55) + ' L' + (cx + r * 0.72) + ' ' + cy + ' L' + (cx - r * 0.45) + ' ' + (cy + r * 0.55) + ' Z" fill="' + col + '" opacity=".85"/>';
    g += motor(cx, cy - r - 5);
    if (cd) g += code(cx, cy + r + 12, cd);
    return g + '</g>';
  }
  // Quạt: vòng tròn + 4 cánh cong quay
  function fan(cx, cy, r, key, cd) {
    var bl = '';
    for (var i = 0; i < 4; i++) bl += '<path d="M0 0 Q' + (r * 0.78) + ' ' + (-r * 0.28) + ' ' + (r * 0.92) + ' 0 Q' + (r * 0.4) + ' ' + (r * 0.12) + ' 0 0Z" fill="var(--muted-2)" opacity=".5" transform="rotate(' + (i * 90) + ')"/>';
    var g = key ? '<g data-fp="' + key + '" class="eqg clickable">' : '<g>';
    g += '<circle class="eqbox" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>';
    g += '<g transform="translate(' + cx + ' ' + cy + ')">' + bl + '<circle r="3" fill="var(--muted)"/></g><g class="fan-spin" transform="translate(' + cx + ' ' + cy + ')"></g>';
    if (cd) g += code(cx, cy + r + 12, cd);
    return g + '</g>';
  }
  function valve(cx, cy, col) {
    var s = 6.5;
    return '<path d="M' + (cx - s) + ' ' + (cy - s) + ' L' + cx + ' ' + cy + ' L' + (cx - s) + ' ' + (cy + s) + ' Z M' + (cx + s) + ' ' + (cy - s) + ' L' + cx + ' ' + cy + ' L' + (cx + s) + ' ' + (cy + s) + ' Z" fill="' + (col || '#fff') + '" stroke="var(--line-strong)" stroke-width="1.1"/>';
  }
  function heatx(x, y, w, h) { // bộ trao đổi nhiệt (coil zig-zag)
    var d = 'M' + (x + 4) + ' ' + (y + h / 2), n = Math.floor((w - 8) / 8);
    for (var i = 0; i < n; i++) d += ' l4 ' + (i % 2 ? h / 2.6 : -h / 2.6) + ' l4 ' + (i % 2 ? -h / 2.6 : h / 2.6);
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="url(#gMetal)" stroke="var(--line-strong)" stroke-width="1.2"/><path d="' + d + '" fill="none" stroke="var(--muted-2)" stroke-width="1.3"/>';
  }

  function pidPlant() {
    var s = '<svg viewBox="0 0 1400 620" role="img" aria-label="Sơ đồ công nghệ nhà máy nhiệt điện">';
    // ---- Gradient (tạo khối 3D cho thiết bị) ----
    s += '<defs>' +
      '<linearGradient id="gMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdfeff"/><stop offset=".5" stop-color="#dbe3ee"/><stop offset="1" stop-color="#c3cddb"/></linearGradient>' +
      '<linearGradient id="gVessel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dbe3ee"/><stop offset=".45" stop-color="#f6f9fc"/><stop offset="1" stop-color="#cfd8e4"/></linearGradient>' +
      '<radialGradient id="gFlame" cx=".5" cy=".85" r=".85"><stop offset="0" stop-color="#ffe487"/><stop offset=".45" stop-color="#f7a63b"/><stop offset="1" stop-color="#e4551f"/></radialGradient>' +
      '<linearGradient id="gTurbo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4d8ef"/><stop offset=".5" stop-color="#6f9fce"/><stop offset="1" stop-color="#46709e"/></linearGradient>' +
      '<linearGradient id="gGen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7dd97"/><stop offset="1" stop-color="#d79a2b"/></linearGradient>' +
      '<radialGradient id="gCoal" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#a2825c"/><stop offset="1" stop-color="#6d5637"/></radialGradient>' +
      '</defs>';
    s += '<rect x="0" y="0" width="1400" height="620" fill="var(--surface)"/>';

    /* =================== ỐNG (vẽ trước, nằm dưới) =================== */
    // Than (nâu)
    s += pipe('M96 168 V196 Q96 214 112 214 H150', COAL, 6, true);        // bunker→feeder→mill
    s += pipe('M150 250 H196 Q214 250 214 268 V300 H244', COAL, 6, true); // mill→vòi đốt
    // Gió cháy (teal): FD fan→lò; APH→gió nóng vào lò
    s += pipe('M142 470 H298', AIR, 5, true);                             // FD fan→gió sơ cấp vào lò
    s += pipe('M512 134 V150 H424', AIR, 4, true);                        // APH→gió nóng vào lò
    // Khói (vàng): lò→ECO→APH→ESP→FGD→ID→ống khói
    s += pipe('M406 150 V96 H430', FLUE, 9, true);                        // lò→ECO
    s += pipe('M456 96 H486', FLUE, 9, true);                             // ECO→APH
    s += pipe('M538 96 H556', FLUE, 9, true);                             // APH→ESP
    s += pipe('M624 96 H650', FLUE, 9, true);                             // ESP→FGD
    s += pipe('M700 96 H720', FLUE, 9, true);                             // FGD→ID fan
    s += pipe('M764 96 H832', FLUE, 9, true);                             // ID→ống khói
    // Hơi chính (đỏ): SH→tua-bin
    s += pipe('M420 170 H540 V240 H556', STEAM, 6, true);                    // hơi chính lò→tua-bin
    // Trục tua-bin→máy phát (xám)
    s += pipe('M712 268 H772', SHAFT, 6);
    // Điện (hổ phách): máy phát→GSU→thanh cái→lưới
    s += pipe('M840 268 H904', ELEC, 5, true);
    s += pipe('M968 250 V150 H1090', ELEC, 4, true);                        // GSU→sân phân phối
    // Hơi thoát→bình ngưng (đỏ nhạt)
    s += pipe('M650 300 V360', RH, 7, true);
    // Nước ngưng/cấp (xanh): bình ngưng→CEP→DEA→BFP→ECO→bao hơi
    s += pipe('M584 396 H544 Q520 396 520 420 V470', COND, 5, true);        // →bơm ngưng
    s += pipe('M520 500 V520 H500', COND, 5, true);                         // →DEA
    s += pipe('M380 500 H352 Q332 500 332 520 V540', WATER, 5, true);       // DEA→BFP
    s += pipe('M332 566 V596 H284 V126 H296', WATER, 5, true);              // BFP→nước cấp→bao hơi (ngoài lò)
    // Nước làm mát (xanh nhạt): bình ngưng↔tháp
    s += pipe('M714 380 H980', COND, 6, true);                             // bình ngưng→tháp (nóng)
    s += pipe('M1040 452 V500 H714 V396', WATER, 6, true);                 // tháp→bình ngưng (lạnh)

    /* =================== THIẾT BỊ =================== */
    // ----- Bunker than -----
    s += '<g data-fp="bunker" class="eqg clickable">';
    s += '<path class="eqbox" d="M56 44 H136 V96 L108 150 H84 L56 96 Z"/>';
    s += '<path d="M64 54 H128 V94 L104 138 H88 L64 94 Z" fill="url(#gCoal)" opacity=".55" style="pointer-events:none"/>';
    s += code(96, 40, 'CB-1A') + '</g>';
    s += lbl(96, 30, 'Bunker than');
    s += '<rect class="eqbox" x="74 " y="150" width="44" height="14" rx="2"/>' + code(96, 161, 'FEEDER');
    // ----- Máy nghiền -----
    s += '<g data-fp="mill" class="eqg clickable"><circle class="eqbox" cx="120" cy="250" r="30"/>' +
      '<circle cx="120" cy="250" r="17" fill="none" stroke="var(--muted-2)" stroke-width="1.5"/><circle cx="120" cy="250" r="4" fill="var(--muted-2)"/>' +
      code(120, 292, 'MILL-1A') + '</g>' + motor(88, 250) + lbl(120, 304, 'Máy nghiền');
    // ----- FD fan (quạt gió cấp) -----
    s += fan(120, 470, 22, 'boiler', 'FD-FAN') + lbl(120, 512, 'Quạt gió cấp');

    // ----- Lò hơi (buồng lửa + bao hơi) -----
    s += '<g data-fp="boiler" class="eqg clickable">';
    s += '<rect class="eqbox" x="300" y="150" width="120" height="250" rx="6" style="fill:url(#gVessel)"/>';
    // membrane wall
    for (var mw = 312; mw < 420; mw += 12) s += '<line x1="' + mw + '" y1="152" x2="' + mw + '" y2="336" stroke="var(--line)" stroke-width="1" style="pointer-events:none"/>';
    // superheater coils
    s += '<path d="M308 172 h104 M308 184 h104 M308 196 h104" stroke="var(--muted-2)" stroke-width="2" fill="none" style="pointer-events:none"/>';
    // bao hơi (drum)
    s += '<rect class="eqbox" x="296" y="104" width="128" height="40" rx="20" style="fill:url(#gMetal)"/>';
    s += code(360, 128, 'BAO HƠI');
    s += code(360, 396, 'BLR-1') + '</g>';
    s += lbl(360, 414, 'Lò hơi · Buồng lửa');
    // ngọn lửa (trang trí)
    s += '<path d="M322 392 q6 -46 30 -24 q-10 -40 26 -50 q8 34 30 22 q-2 46 -34 52 q-22 6 -30 -2 z" fill="url(#gFlame)" opacity=".9" style="pointer-events:none"/>';
    // bed temp
    s += '<g style="pointer-events:none">';
    for (var bt = 0; bt < 4; bt++) s += '<rect x="' + (312 + bt * 26) + '" y="372" width="22" height="13" rx="2" fill="var(--surface)" stroke="var(--line-strong)" stroke-width="1"/>';
    s += lbl(360, 368, 'Bed temp', 'eqname') + '</g>';

    // ----- Đường khói: ECO, APH, ESP, FGD, ID fan (bên phải bao hơi) -----
    s += heatx(430, 62, 26, 70) + code(443, 148, 'ECO');            // economizer
    s += '<rect class="eqbox" x="486" y="60" width="52" height="72" rx="4" style="fill:url(#gMetal)"/>' +
      '<path d="M492 66 l40 60 M532 66 l-40 60 M492 96 h40" stroke="var(--muted-2)" stroke-width="1.2" style="pointer-events:none"/>' + code(512, 148, 'APH');
    s += '<g data-fp="stack" class="eqg clickable"><rect class="eqbox" x="556" y="50" width="68" height="92" rx="4" style="fill:url(#gMetal)"/>';
    for (var ep = 566; ep < 624; ep += 10) s += '<line x1="' + ep + '" y1="58" x2="' + ep + '" y2="134" stroke="var(--muted-2)" stroke-width="1.1" style="pointer-events:none"/>';
    s += code(590, 156, 'ESP · Lọc bụi') + '</g>';
    s += '<rect class="eqbox" x="650" y="56" width="50" height="84" rx="6" style="fill:url(#gMetal)"/>' + code(675, 156, 'FGD') + lbl(675, 48, 'Khử SO₂');
    s += fan(742, 96, 22, 'stack', 'ID-FAN') + lbl(742, 142, 'Quạt khói');
    // ----- Ống khói + CEMS -----
    s += '<g data-fp="stack" class="eqg clickable"><rect class="eqbox" x="832" y="34" width="34" height="120" rx="3" style="fill:url(#gMetal)"/>' +
      '<path d="M840 34 q6 -16 -2 -26 q16 6 10 -14" fill="none" stroke="var(--muted-2)" stroke-width="2" opacity=".6" style="pointer-events:none"/>' +
      code(849, 170, 'STK-1') + '</g>' + lbl(849, 182, 'Ống khói · CEMS');

    // ----- Tua-bin + Máy phát + GSU + Lưới -----
    s += '<g data-fp="turbine" class="eqg clickable">' +
      '<path class="eqbox" d="M556 240 h40 v-14 h44 v-16 h56 v72 h-56 v-16 h-44 v-14 h-40 z" style="fill:url(#gTurbo)"/>' +
      '<path d="M556 268 H712" stroke="#2d4c72" stroke-width="1.5" style="pointer-events:none"/>' +
      code(636, 300, 'TG-1') + '</g>' + lbl(636, 312, 'Tua-bin HP·IP·LP');
    s += '<g data-fp="generator" class="eqg clickable"><circle class="eqbox" cx="806" cy="268" r="34" style="fill:url(#gGen)"/>' +
      '<text x="806" y="266" text-anchor="middle" font-size="17" font-weight="750" fill="#7a5410" style="pointer-events:none">G</text>' +
      '<path d="M790 278 q16 -14 32 0" stroke="#7a5410" stroke-width="1.6" fill="none" style="pointer-events:none"/>' +
      code(806, 314, 'GEN-1') + '</g>';
    s += '<g data-fp="gsu" class="eqg clickable"><circle class="eqbox" cx="936" cy="262" r="16"/><circle class="eqbox" cx="936" cy="278" r="16"/>' +
      code(966, 300, 'GSU-1') + '</g>' + lbl(936, 314, 'MBA đầu cực');
    // sân 220kV
    s += '<line x1="1090" y1="120" x2="1090" y2="196" stroke="' + ELEC + '" stroke-width="4"/>';
    s += '<path d="M1120 150 h30 l-15 -16 z M1120 168 h30 l-15 16 z" fill="none" stroke="' + ELEC + '" stroke-width="2"/>';
    s += '<path d="M1180 190 l14 -40 l14 40 M1180 190 h28 M1187 168 h14" stroke="var(--muted-2)" stroke-width="1.6" fill="none"/>';
    s += lbl(1150, 210, 'Sân phân phối 220kV');

    // ----- Bình ngưng + tháp giải nhiệt + nước cấp -----
    s += '<g data-fp="condenser" class="eqg clickable"><rect class="eqbox" x="584" y="360" width="130" height="52" rx="5" style="fill:url(#gMetal)"/>' +
      '<path d="M592 372 q10 8 20 0 q10 -8 20 0 q10 8 20 0 q10 -8 20 0 q10 8 20 0" fill="none" stroke="' + WATER + '" stroke-width="1.6" opacity=".7" style="pointer-events:none"/>' +
      '<path d="M592 398 q10 8 20 0 q10 -8 20 0 q10 8 20 0 q10 -8 20 0 q10 8 20 0" fill="none" stroke="' + WATER + '" stroke-width="1.6" opacity=".7" style="pointer-events:none"/>' +
      code(649, 404, 'COND-1') + '</g>' + lbl(649, 428, 'Bình ngưng');
    s += pump(520, 486, 15, COND, 'condenser', 'CEP') + lbl(520, 528, 'Bơm ngưng');
    // Deaerator
    s += '<g data-fp="dea" class="eqg clickable"><rect class="eqbox" x="380" y="456" width="120" height="30" rx="15" style="fill:url(#gMetal)"/>' +
      '<rect class="eqbox" x="404" y="486" width="72" height="26" rx="4" style="fill:url(#gMetal)"/>' +
      code(440, 476, 'DEA') + '</g>' + lbl(440, 448, 'Khử khí + Bể chứa');
    s += pump(332, 553, 15, WATER, 'dea', 'BFP') + lbl(332, 597, 'Bơm nước cấp');
    // Tháp giải nhiệt (hyperbolic)
    s += '<g data-fp="cooltower" class="eqg clickable"><path class="eqbox" d="M986 380 h68 l-14 42 q-20 8 -40 0 z" style="fill:url(#gMetal)"/>' +
      '<path class="eqbox" d="M980 452 h80 v14 h-80 z" style="fill:url(#gMetal)"/>' +
      '<ellipse cx="1020" cy="380" rx="34" ry="6" fill="var(--surface-2)" stroke="var(--line-strong)" stroke-width="1.2" style="pointer-events:none"/>' +
      code(1020, 444, 'CT-1') + '</g>' + fan(1020, 372, 12) + lbl(1020, 484, 'Tháp giải nhiệt');

    /* =================== ĐIỂM ĐO (live) =================== */
    s += isa(64, 122, 'bunkL', 92, 'down');                 // mức bunker (trên bunker)
    s += isa(178, 228, 'coalF', 208, 'down');               // than vào lò
    s += isa(58, 236, 'millT', 90, 'right');                // nhiệt ra máy nghiền
    s += isa(258, 190, 'furnP', 300, 'right');              // áp buồng lửa (trái lò)
    s += isa(258, 122, 'drumL', 296, 'right');              // mức bao hơi
    s += isa(458, 198, 'msP', 170, 'up');                   // áp hơi chính (trên ống hơi)
    s += isa(528, 198, 'msT', 170, 'up');                   // nhiệt hơi chính
    s += isa(466, 62, 'fgT', null, null, 13);               // nhiệt khói (giữa ECO–APH)
    s += isa(808, 44, 'stkT', 60, 'down');                  // nhiệt ống khói
    s += isa(906, 52, 'so2', null);                         // SO2 (cột CEMS)
    s += isa(906, 104, 'nox', null);                        // NOx
    s += isa(906, 156, 'dust', null);                       // bụi
    s += isa(636, 216, 'spd', 232, 'down');                 // tốc độ tua-bin
    s += isa(700, 216, 'mw', 240, 'down');                  // công suất
    s += isa(872, 232, 'genU', 262, 'left');                // điện áp đầu cực
    s += isa(1006, 116, 'hvU', 150, 'down');                // điện áp 220kV
    s += isa(700, 338, 'vac', 360, 'down');                 // chân không
    s += isa(560, 428, 'condL', null);                      // mức bình ngưng
    s += isa(452, 522, 'deaP', 500, 'up');                  // áp khử khí
    s += isa(286, 350, 'feedF', 300, 'right', 13);          // lưu lượng nước cấp
    s += isa(284, 553, 'bfpP', 316, 'right');               // áp bơm cấp
    s += isa(946, 388, 'cwOutT', null);                     // nước làm mát ra
    s += isa(884, 494, 'cwInT', null);                      // nước làm mát vào

    s += '</svg>';
    return s;
  }

  /* ---- Trend công suất 2 tổ máy ---- */
  function drawTrend(root) {
    var cv = root.querySelector('#ov-trend'); if (!cv) return;
    C.trend(cv, [
      { data: S.history.S1 ? S.history.S1.mw : [], color: '--series-1', width: 2, fill: true },
      { data: S.history.S2 ? S.history.S2.mw : [], color: '--series-3', width: 2 }
    ], { height: 210, min: 200, max: 345, dp: 0, xlabels: ['−3′', '−2′', '−1′', 'hiện tại'] });
  }

  /* ---- Thẻ thiết bị chính ---- */
  function eqPills() {
    function pill(icon, name, tag, valName, uid, key) {
      var st = S.stat(valName, uid);
      return '<div class="eq' + (key ? ' clickable' : '') + '"' + (key ? ' data-fp="' + key + '"' : '') + '><div class="eq__top"><span class="eq__code">' + C.icon(icon, '', 1.7) + ' ' + tag + '</span>' +
        C.badge(st) + '</div><div class="eq__name">' + name + '</div>' +
        '<div class="eq__val"><span data-live="' + uid + '|' + valName + '||1|1">' + F.fmt(S.val(valName, uid), S.spec(valName).dp) + ' ' + S.spec(valName).u + '</span></div></div>';
    }
    var u = S.activeUnit;
    return pill('flame', 'Lò hơi', 'BLR-1', 'msP', u, 'boiler') +
      pill('rotor', 'Tua-bin', 'TG-1', 'spd', u, 'turbine') +
      pill('gen', 'Máy phát', 'GEN-1', 'mw', u, 'generator') +
      pill('drop', 'Bình ngưng', 'COND-1', 'vac', u, 'condenser') +
      pill('tower', 'Tháp giải nhiệt', 'CT-1', 'cwOutT', u, 'cooltower') +
      pill('coal', 'Máy nghiền A', 'MILL-1A', 'millT', u, 'mill');
  }

  /* ---- Rail phải ---- */
  function alarmsRail() { return C.alarmRows(S.alarms.slice(0, 5)); }
  function commRail() {
    return (S.devices || []).map(function (d) {
      var col = d.st === 'off' ? 'var(--alarm)' : d.ms > 20 ? 'var(--warn)' : 'var(--ok)';
      return '<div class="dev-row"><span class="st" style="background:' + col + '"></span>' +
        '<span class="nm">' + d.id + '<span class="ip">' + d.ip + '</span></span>' +
        '<span class="ms" style="color:' + col + '">' + (d.st === 'off' ? 'timeout' : d.ms + ' ms') + '</span></div>';
    }).join('');
  }
  function healthRail() {
    var ok = 0, warn = 0, alarm = 0;
    S.UNITS.forEach(function (unit) { Object.keys(S.SPEC).forEach(function (n) { var st = S.stat(n, unit.id); if (st === 'ok') ok++; else if (st === 'warn') warn++; else alarm++; }); });
    var tot = ok + warn + alarm;
    var onl = (S.devices || []).filter(function (d) { return d.st !== 'off'; }).length, off = (S.devices || []).length - onl;
    function bar(lbl, val, tot, col) {
      return '<div class="hb"><span class="lbl">' + lbl + '</span><div class="meter"><div class="meter__fill" style="width:' + (val / tot * 100).toFixed(0) + '%;background:' + col + '"></div></div><span class="val">' + val + '</span></div>';
    }
    return '<div class="health-bar">' +
      '<div class="eyebrow">Tín hiệu đo (' + tot + ' điểm)</div>' +
      bar('Bình thường', ok, tot, 'var(--ok)') +
      bar('Cảnh báo', warn, tot, 'var(--warn)') +
      bar('Sự cố', alarm, tot, 'var(--alarm)') +
      '<div class="eyebrow" style="margin-top:8px">Thiết bị mạng (' + (S.devices || []).length + ')</div>' +
      bar('Trực tuyến', onl, onl + off, 'var(--ok)') +
      bar('Offline', off, onl + off, 'var(--alarm)') +
      '</div>';
  }

  /* ---- Render ---- */
  V.overview = {
    title: 'Tổng quan nhà máy',
    subtitle: S.PLANT.name + ' · ' + S.PLANT.site,
    render: function (root) {
      root.innerHTML =
        '<div class="page">' +
          '<div class="page__head"><h2>Tổng quan nhà máy</h2><span class="sub">Giám sát toàn nhà máy · 2 × 330 MW</span>' +
            '<div class="spacer"></div>' + C.unitTabs() + '</div>' +
          '<div class="grid cols-6" id="ov-kpi">' + kpiCards() + '</div>' +
          '<div class="card" style="margin-top:14px"><div class="card__head">' + C.icon('layers', 'ico') + '<h3>Sơ đồ công nghệ nhà máy</h3><span class="sub">— ' + S.unit().name + '</span><div class="spacer"></div>' +
            '<div class="legend-row">' +
              '<span class="lg"><span class="d" style="background:#d64545"></span>Hơi</span>' +
              '<span class="lg"><span class="d" style="background:#2b7fd4"></span>Nước</span>' +
              '<span class="lg"><span class="d" style="background:#c2a83e"></span>Khói</span>' +
              '<span class="lg"><span class="d" style="background:#2fa8a0"></span>Gió</span>' +
              '<span class="lg"><span class="d" style="background:#8a6d4b"></span>Than</span>' +
              '<span class="lg"><span class="d" style="background:#e0a300"></span>Điện</span></div></div>' +
            '<div class="card__body"><div class="pid pid--full">' + pidPlant() + '</div>' +
              '<div class="pid-hint">' + C.icon('gauge', '', 1.6) + ' Bấm vào thiết bị (lò hơi, tua-bin, máy phát, bình ngưng, tháp giải nhiệt…) để mở faceplate chi tiết</div></div></div>' +
          '<div class="layout-rail" style="margin-top:14px">' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('activity', 'ico') + '<h3>Xu hướng công suất phát</h3><div class="spacer"></div>' +
                C.legend([{ label: 'S1 (MW)', color: 'var(--series-1)' }, { label: 'S2 (MW)', color: 'var(--series-3)' }]) + '</div>' +
                '<div class="card__body"><div class="trend"><canvas id="ov-trend"></canvas></div></div></div>' +
              '<div class="grid cols-6" id="ov-eq">' + eqPills() + '</div>' +
            '</div>' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('bell', 'ico') + '<h3>Cảnh báo gần đây</h3><div class="spacer"></div><button class="btn btn--ghost" data-ackall style="height:26px">Ack tất cả</button></div>' +
                '<div id="ov-alarms">' + alarmsRail() + '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('wifi', 'ico') + '<h3>Trạng thái truyền thông</h3></div><div class="card__body tight" id="ov-comm">' + commRail() + '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('check', 'ico') + '<h3>Tình trạng hệ thống</h3></div><div class="card__body" id="ov-health">' + healthRail() + '</div></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      drawTrend(root);
      this._root = root;
    },
    update: function () {
      var root = this._root; if (!root) return;
      C.refresh(root);
      var set = function (id, html) { var e = root.querySelector(id); if (e) e.innerHTML = html; };
      set('#ov-kpi', kpiCards());
      set('#ov-eq', eqPills());
      set('#ov-alarms', alarmsRail());
      set('#ov-comm', commRail());
      set('#ov-health', healthRail());
      drawTrend(root);
    }
  };
})(window);
