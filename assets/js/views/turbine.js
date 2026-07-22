/* =====================================================================
   VIEW · Tua-bin & Máy phát (Turbine–Generator)
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C, F = global.F;
  var V = global.Views = global.Views || {};

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
          '<div class="grid cols-4">' +
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
