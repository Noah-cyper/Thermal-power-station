/* =====================================================================
   VIEW · Nước cấp · Ngưng tụ · Khử khí (Feedwater / Condensate)
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C;
  var V = global.Views = global.Views || {};
  var TAGS = ['condL', 'deaP', 'deaT', 'deaL', 'bfpP', 'bfpF', 'hwT', 'fwhT', 'vac'];

  function drawTrend(root) {
    var cv = root.querySelector('#fw-trend'); if (!cv) return;
    var h = S.history[S.activeUnit] || {};
    C.trend(cv, [{ data: h.deaP || [], color: '--series-1', width: 2, fill: true }],
      { height: 200, min: 5, max: 11, dp: 1, xlabels: ['−3′', '−2′', '−1′', 'hiện tại'] });
  }

  V.feedwater = {
    title: 'Nước cấp & Ngưng tụ',
    subtitle: 'Feedwater · Condensate · Deaerator',
    render: function (root) {
      var u = S.activeUnit;
      root.innerHTML =
        '<div class="page">' +
          '<div class="page__head"><h2>Nước cấp · Ngưng tụ · Khử khí</h2><span class="sub">Bình ngưng → bơm ngưng → khử khí → bơm cấp → lò</span><div class="spacer"></div>' + C.unitTabs() + '</div>' +
          '<div class="grid cols-4">' +
            C.gaugeCard('deaP', u, 'Áp suất khử khí') +
            C.gaugeCard('deaT', u, 'Nhiệt độ khử khí') +
            C.gaugeCard('bfpP', u, 'Áp đẩy bơm cấp') +
            C.gaugeCard('condL', u, 'Mức bình ngưng') +
          '</div>' +
          '<div class="layout-rail" style="margin-top:14px">' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('drop', 'ico') + '<h3>Chu trình nước cấp</h3></div><div class="card__body">' +
                C.metric('bfpF', u, { icon: 'pump' }) + C.metric('bfpP', u, { icon: 'press' }) +
                C.metric('fwhT', u, { icon: 'thermo' }) + C.metric('feedF', u, { icon: 'activity' }) +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('activity', 'ico') + '<h3>Xu hướng áp suất khử khí</h3><div class="spacer"></div>' +
                C.legend([{ label: 'Áp khử khí (bar)', color: 'var(--series-1)' }]) + '</div>' +
                '<div class="card__body"><div class="trend"><canvas id="fw-trend"></canvas></div></div></div>' +
            '</div>' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('layers', 'ico') + '<h3>Bình khử khí</h3></div><div class="card__body">' +
                C.metric('deaP', u, { icon: 'press', bar: false }) + C.metric('deaT', u, { icon: 'thermo', bar: false }) + C.metric('deaL', u, { icon: 'drop', bar: false }) +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('snow', 'ico') + '<h3>Bình ngưng</h3></div><div class="card__body">' +
                C.metric('vac', u, { icon: 'press', bar: false }) + C.metric('condL', u, { icon: 'drop', bar: false }) + C.metric('hwT', u, { icon: 'thermo', bar: false }) +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('bell', 'ico') + '<h3>Cảnh báo — Nước cấp ' + u + '</h3></div><div id="fw-alarms">' + C.alarmRows(C.sysAlarms(TAGS)) + '</div></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      drawTrend(root); this._root = root;
    },
    update: function () {
      var root = this._root; if (!root) return;
      C.refresh(root);
      var a = root.querySelector('#fw-alarms'); if (a) a.innerHTML = C.alarmRows(C.sysAlarms(TAGS));
      drawTrend(root);
    }
  };
})(window);
