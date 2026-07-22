/* =====================================================================
   VIEW · Điện · Máy phát · Trạm phân phối (Electrical / Switchyard)
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C, F = global.F;
  var V = global.Views = global.Views || {};
  var TAGS = ['genU', 'pf', 'statT', 'rotT', 'exI', 'mw', 'mvar'];

  function drawTrend(root) {
    var cv = root.querySelector('#el-trend'); if (!cv) return;
    var h = S.history[S.activeUnit] || {};
    C.trend(cv, [{ data: h.freq || [], color: '--series-1', width: 2 }],
      { height: 180, min: 49.7, max: 50.3, dp: 2, xlabels: ['−3′', '−2′', '−1′', 'hiện tại'], limit: 50.2 });
  }

  // Sơ đồ một sợi (single-line diagram)
  function sld() {
    function brk(x, y) { return '<rect x="' + (x - 5) + '" y="' + (y - 5) + '" width="10" height="10" fill="#fff" stroke="var(--ink-2)" stroke-width="1.4"/>'; }
    function liveT(x, y, name, uid, anchor) {
      var sp = S.spec(name);
      return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" class="isaval" data-live="' + uid + '|' + name + '||1|1">' + F.fmt(S.val(name, uid), sp.dp) + ' ' + sp.u + '</text>';
    }
    function gen(cx, cy, label, uid) {
      return '<g><circle cx="' + cx + '" cy="' + cy + '" r="26" fill="#fff" stroke="var(--series-1)" stroke-width="2"/>' +
        '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" font-size="15" font-weight="750" fill="var(--ink)">' + label + '</text>' +
        '<text x="' + cx + '" y="' + (cy + 12) + '" text-anchor="middle" font-size="9" fill="var(--muted)">~</text>' +
        liveT(cx, cy - 36, 'genU', uid, 'middle') + liveT(cx, cy + 46, 'mw', uid, 'middle') + '</g>';
    }
    function xfmr(cx, cy) { return '<circle cx="' + cx + '" cy="' + (cy - 6) + '" r="11" fill="none" stroke="var(--ink-2)" stroke-width="1.4"/><circle cx="' + cx + '" cy="' + (cy + 6) + '" r="11" fill="none" stroke="var(--ink-2)" stroke-width="1.4"/>'; }
    var s = '<div class="pid"><svg viewBox="0 0 680 300" role="img" aria-label="Sơ đồ một sợi trạm điện">';
    // đường dây
    s += '<path d="M96 80 H150 M200 80 H320 V150" fill="none" stroke="var(--ink-2)" stroke-width="1.6"/>';
    s += '<path d="M96 220 H150 M200 220 H320 V150" fill="none" stroke="var(--ink-2)" stroke-width="1.6"/>';
    // busbar 220kV
    s += '<line x1="300" y1="150" x2="640" y2="150" stroke="var(--brand)" stroke-width="5" stroke-linecap="round"/>';
    s += '<text x="470" y="140" text-anchor="middle" class="eqname">Thanh cái 220kV · C21</text>';
    s += liveT(628, 140, 'hvU', S.activeUnit, 'end');
    // feeders
    s += '<path d="M430 150 V56" fill="none" stroke="var(--ink-2)" stroke-width="1.6"/><path d="M424 62 l6 -8 l6 8" fill="none" stroke="var(--ink-2)" stroke-width="1.6"/>';
    s += '<path d="M560 150 V56" fill="none" stroke="var(--ink-2)" stroke-width="1.6"/><path d="M554 62 l6 -8 l6 8" fill="none" stroke="var(--ink-2)" stroke-width="1.6"/>';
    s += '<text x="430" y="44" text-anchor="middle" class="eqname">Lộ 271</text><text x="560" y="44" text-anchor="middle" class="eqname">Lộ 272</text>';
    // station service
    s += '<path d="M360 150 V214" fill="none" stroke="var(--ink-2)" stroke-width="1.6"/>';
    s += xfmr(360, 232) + '<text x="360" y="262" text-anchor="middle" class="eqname">TD 6kV</text>';
    // components
    s += gen(70, 80, 'G1', 'S1') + gen(70, 220, 'G2', 'S2');
    s += xfmr(175, 80) + '<text x="175" y="104" text-anchor="middle" class="eqname">GSU-1</text>';
    s += xfmr(175, 220) + '<text x="175" y="244" text-anchor="middle" class="eqname">GSU-2</text>';
    s += brk(320, 118) + brk(430, 110) + brk(560, 110) + brk(360, 190);
    // tần số
    s += '<text x="470" y="176" text-anchor="middle" class="eqlabel">f = </text>' + liveT(500, 176, 'freq', S.activeUnit, 'start');
    s += '</svg></div>';
    return s;
  }

  function lineLoads() {
    var tot = S.plant.totalMW, p1 = tot * 0.54, p2 = tot * 0.46;
    return '<div class="cellgrid" style="grid-template-columns:1fr 1fr">' +
      '<div class="cell"><div class="k"><span class="dot-st ok"></span>Lộ 271</div><div class="v">' + F.fmt(p1, 0) + '<span class="u">MW</span></div><div class="foot">Đóng · 220kV</div></div>' +
      '<div class="cell"><div class="k"><span class="dot-st ok"></span>Lộ 272</div><div class="v">' + F.fmt(p2, 0) + '<span class="u">MW</span></div><div class="foot">Đóng · 220kV</div></div>' +
      '</div>';
  }

  V.electrical = {
    title: 'Điện & Trạm phân phối',
    subtitle: 'Electrical · Generator · Switchyard',
    render: function (root) {
      var u = S.activeUnit;
      root.innerHTML =
        '<div class="page">' +
          '<div class="page__head"><h2>Điện · Máy phát · Trạm phân phối</h2><span class="sub">Máy phát → MBA → thanh cái 220kV → lưới</span><div class="spacer"></div>' + C.unitTabs() + '</div>' +
          '<div class="grid cols-4">' +
            C.gaugeCard('genU', u, 'Điện áp đầu cực') +
            C.gaugeCard('freq', u, 'Tần số lưới') +
            C.gaugeCard('mw', u, 'Công suất tác dụng') +
            C.gaugeCard('pf', u, 'Hệ số công suất') +
          '</div>' +
          '<div class="layout-rail" style="margin-top:14px">' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('grid', 'ico') + '<h3>Sơ đồ một sợi · Trạm 220kV</h3><div class="spacer"></div>' +
                '<span class="legend-row"><span class="lg"><span class="d" style="background:var(--brand)"></span>Thanh cái</span></span></div>' +
                '<div class="card__body">' + sld() + '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('activity', 'ico') + '<h3>Xu hướng tần số lưới</h3><div class="spacer"></div>' +
                C.legend([{ label: 'Tần số (Hz)', color: 'var(--series-1)' }, { label: 'Ngưỡng 50,2', color: 'var(--alarm)', dash: true }]) + '</div>' +
                '<div class="card__body"><div class="trend"><canvas id="el-trend"></canvas></div></div></div>' +
            '</div>' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('gen', 'ico') + '<h3>Máy phát ' + u + '</h3></div><div class="card__body">' +
                C.metric('mvar', u, { icon: 'activity', bar: false }) + C.metric('pf', u, { icon: 'gauge', bar: false }) +
                C.metric('statT', u, { icon: 'thermo', bar: false }) + C.metric('rotT', u, { icon: 'thermo', bar: false }) + C.metric('exI', u, { icon: 'bolt', bar: false }) +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('bolt', 'ico') + '<h3>Trạm 220kV · Lộ đường dây</h3></div><div class="card__body">' +
                C.metric('hvU', u, { icon: 'bolt', bar: false }) + C.metric('freq', u, { icon: 'activity', bar: false }) +
                '<div class="mt-2" id="el-lines">' + lineLoads() + '</div>' +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('bell', 'ico') + '<h3>Cảnh báo — Điện ' + u + '</h3></div><div id="el-alarms">' + C.alarmRows(C.sysAlarms(TAGS)) + '</div></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      drawTrend(root); this._root = root;
    },
    update: function () {
      var root = this._root; if (!root) return;
      C.refresh(root);
      var l = root.querySelector('#el-lines'); if (l) l.innerHTML = lineLoads();
      var a = root.querySelector('#el-alarms'); if (a) a.innerHTML = C.alarmRows(C.sysAlarms(TAGS));
      drawTrend(root);
    }
  };
})(window);
