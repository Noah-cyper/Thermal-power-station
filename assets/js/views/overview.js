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

  /* ---- Sơ đồ dây chuyền công nghệ (P&ID) ---- */
  function isa(cx, cy, name, tickTo) {
    var sp = S.spec(name), parts = sp.isa.split('-'), v = F.fmt(S.val(name), sp.dp);
    var g = '<g>';
    if (tickTo != null) g += '<line x1="' + cx + '" y1="' + (cy + 17) + '" x2="' + cx + '" y2="' + tickTo + '" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="2 2"/>';
    g += '<circle class="isa" cx="' + cx + '" cy="' + cy + '" r="17"/>';
    g += '<text class="isacode" x="' + cx + '" y="' + (cy - 3) + '" text-anchor="middle">' + parts[0] + '</text>';
    g += '<text class="isacode" x="' + cx + '" y="' + (cy + 7) + '" text-anchor="middle">' + parts[1] + '</text>';
    g += '<text class="isaval" x="' + cx + '" y="' + (cy + 32) + '" text-anchor="middle" data-live="' + S.activeUnit + '|' + name + '||1|1">' + v + ' ' + sp.u + '</text>';
    g += '</g>';
    return g;
  }
  function eqBox(x, y, w, h, code, name, fill, key) {
    var open = key ? '<g data-fp="' + key + '" class="eqg clickable">' : '<g>';
    return open + '<rect class="eqbox" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="7"' + (fill ? ' style="fill:' + fill + '"' : '') + '/>' +
      '<text class="eqlabel" x="' + (x + w / 2) + '" y="' + (y + h - 15) + '" text-anchor="middle">' + code + '</text>' +
      '<text class="eqname" x="' + (x + w / 2) + '" y="' + (y + h - 4) + '" text-anchor="middle">' + name + '</text></g>';
  }
  function pipe(d, color, flow) {
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="4.5" stroke-linecap="round"' + (flow ? ' class="flow"' : '') + '/>';
  }
  var STEAM = '#d64545', WATER = '#2b7fd4', COAL = '#7a6350', FLUE = '#94a3b8', ELEC = '#e0a300';

  function pidPlant() {
    var s = '<svg viewBox="0 0 1160 300" role="img" aria-label="Sơ đồ dây chuyền công nghệ tổ máy">';
    // ----- Pipes (vẽ trước để nằm dưới) -----
    s += pipe('M84 205 H120', COAL, true);                             // bunker→mill
    s += pipe('M196 205 H232', COAL, true);                            // mill→boiler
    s += pipe('M287 90 V52 H265', FLUE, true);                         // boiler→stack (khói)
    s += pipe('M342 120 H470', STEAM, true);                           // hơi chính → tua-bin
    s += pipe('M620 135 H666', '#334155', false);                      // trục tua-bin→máy phát
    s += pipe('M734 135 H770', ELEC, true);                            // máy phát→MBA
    s += pipe('M814 135 H900', ELEC, true);                            // MBA→lưới
    s += pipe('M545 170 V210', WATER, true);                           // tua-bin→bình ngưng
    s += pipe('M620 234 H700', WATER, true);                           // bình ngưng→tháp (nước nóng)
    s += pipe('M700 258 V270 H470 V258', WATER, true);                 // tháp→bình ngưng (nước lạnh hồi)
    s += pipe('M500 234 H452', WATER, true);                           // bình ngưng→khử khí
    s += pipe('M360 250 H300 V90', WATER, true);                       // khử khí/bơm→lò (nước cấp)

    // ----- Equipment (data-fp = mở faceplate chi tiết) -----
    s += eqBox(20, 150, 64, 110, 'CB-1A', 'Bunker than', null, 'bunker');
    s += eqBox(120, 175, 76, 60, 'MILL-1A', 'Máy nghiền', null, 'mill');
    s += eqBox(232, 70, 110, 190, 'BLR-1', 'Lò hơi', 'rgba(214,69,69,.05)', 'boiler');
    s += '<path d="M262 250 q10 -22 25 -12 q-6 -18 12 -24 q4 16 16 12 q-2 20 -18 24 z" fill="#f0a030" opacity=".85" style="pointer-events:none"/>'; // ngọn lửa
    s += eqBox(240, 20, 34, 130, 'STK-1', 'Ống khói', '#eef1f6', 'stack');
    s += eqBox(470, 100, 150, 70, 'TG-1', 'Tua-bin HP·IP·LP', 'rgba(43,127,212,.05)', 'turbine');
    s += '<g data-fp="generator" class="eqg clickable"><circle class="eqbox" cx="700" cy="135" r="34"/><text class="eqlabel" x="700" y="132" text-anchor="middle" font-size="16">G</text><text class="eqname" x="700" y="146" text-anchor="middle">Máy phát</text></g>';
    s += eqBox(770, 108, 44, 54, 'GSU-1', 'MBA', '#eef1f6', 'gsu');
    s += '<path d="M905 118 l24 0 l-12 -14 z M905 152 l24 0 l-12 14 z" fill="none" stroke="' + ELEC + '" stroke-width="2"/><text class="eqname" x="917" y="170" text-anchor="middle">Lưới 220kV</text>';
    s += eqBox(500, 210, 120, 48, 'COND-1', 'Bình ngưng', '#eef4fb', 'condenser');
    s += '<g data-fp="cooltower" class="eqg clickable"><path d="M672 258 h56 l-12 -46 h-32 z" class="eqbox"/><text class="eqlabel" x="700" y="238" text-anchor="middle">CT-1</text><text class="eqname" x="700" y="250" text-anchor="middle">Tháp giải nhiệt</text></g>';
    s += eqBox(360, 232, 92, 40, 'DEA/BFP', 'Khử khí + Bơm cấp', '#eef4fb', 'dea');

    // ----- Instrument bubbles -----
    s += isa(158, 150, 'coalF', 175);        // than vào nghiền
    s += isa(372, 72, 'msP', 118);           // áp hơi chính
    s += isa(430, 72, 'msT', 118);           // nhiệt hơi chính
    s += isa(300, 55, 'stkT', null);         // nhiệt ống khói
    s += isa(655, 72, 'mw', 118);            // công suất
    s += isa(700, 200, 'vac', 210);          // chân không bình ngưng
    s += isa(760, 240, 'cwOutT', null);      // nước làm mát ra
    s += isa(792, 78, 'genU', 108);          // điện áp đầu cực

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
          '<div class="layout-rail" style="margin-top:14px">' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('layers', 'ico') + '<h3>Sơ đồ dây chuyền công nghệ</h3><span class="sub">— ' + S.unit().name + '</span><div class="spacer"></div>' +
                '<div class="legend-row"><span class="lg"><span class="d" style="background:#d64545"></span>Hơi</span><span class="lg"><span class="d" style="background:#2b7fd4"></span>Nước</span><span class="lg"><span class="d" style="background:#7a6350"></span>Than</span><span class="lg"><span class="d" style="background:#94a3b8"></span>Khói</span></div></div>' +
                '<div class="card__body"><div class="pid">' + pidPlant() + '</div>' +
                  '<div class="pid-hint">' + C.icon('gauge', '', 1.6) + ' Bấm vào thiết bị (lò hơi, tua-bin, máy phát, bình ngưng…) để xem chi tiết</div></div></div>' +
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
