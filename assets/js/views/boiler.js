/* =====================================================================
   VIEW · Lò hơi & Đốt (Boiler & Combustion)
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C, F = global.F;
  var V = global.Views = global.Views || {};

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
          '<div class="grid cols-4">' +
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
