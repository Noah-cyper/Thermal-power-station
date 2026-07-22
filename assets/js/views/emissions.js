/* =====================================================================
   VIEW · Khí thải & Quan trắc môi trường (Emissions / CEMS)
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C, F = global.F;
  var V = global.Views = global.Views || {};
  var TAGS = ['so2', 'nox', 'dust', 'co', 'opac', 'stkT', 'fgdEff', 'espI'];
  // Ngưỡng cho phép (tham chiếu QCVN 22 — cột B, hệ số áp dụng), dùng để tính % tuân thủ
  var LIMIT = { so2: 350, nox: 650, dust: 50 };

  function drawTrend(root) {
    var cv = root.querySelector('#em-trend'); if (!cv) return;
    var h = S.history[S.activeUnit] || {};
    function pctOf(arr, lim) { return (arr || []).map(function (v) { return v / lim * 100; }); }
    C.trend(cv, [
      { data: pctOf(h.so2, LIMIT.so2), color: '--series-1', width: 2 },
      { data: pctOf(h.nox, LIMIT.nox), color: '--series-3', width: 2 },
      { data: pctOf(h.dust, LIMIT.dust), color: '--series-4', width: 2 }
    ], { height: 200, min: 0, max: 120, dp: 0, xlabels: ['−3′', '−2′', '−1′', 'hiện tại'], limit: 100 });
  }

  function complianceBadge(u) {
    var over = ['so2', 'nox', 'dust'].some(function (n) { return S.val(n, u) > LIMIT[n]; });
    return over ? '<span class="badge badge--alarm">' + C.icon('alert', '', 2) + 'Vượt ngưỡng</span>'
                : '<span class="badge badge--ok">' + C.icon('check', '', 2) + 'Đạt QCVN</span>';
  }

  V.emissions = {
    title: 'Khí thải & CEMS',
    subtitle: 'Emissions · Continuous Monitoring',
    render: function (root) {
      var u = S.activeUnit;
      root.innerHTML =
        '<div class="page">' +
          '<div class="page__head"><h2>Khí thải & Quan trắc môi trường</h2><span class="sub">CEMS · FGD khử SO₂ · ESP lọc bụi · ống khói</span><div class="spacer"></div>' + C.unitTabs() + '</div>' +
          '<div class="grid cols-4">' +
            C.gaugeCard('so2', u, 'SO₂ (quy 6% O₂)') +
            C.gaugeCard('nox', u, 'NOx (quy 6% O₂)') +
            C.gaugeCard('dust', u, 'Bụi tổng (PM)') +
            C.gaugeCard('opac', u, 'Độ mờ khói') +
          '</div>' +
          '<div class="layout-rail" style="margin-top:14px">' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('smoke', 'ico') + '<h3>Nồng độ phát thải</h3><div class="spacer"></div><span id="em-badge">' + complianceBadge(u) + '</span></div><div class="card__body">' +
                C.metric('so2', u, { icon: 'smoke' }) + C.metric('nox', u, { icon: 'smoke' }) +
                C.metric('dust', u, { icon: 'wind' }) + C.metric('co', u, { icon: 'wind' }) +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('activity', 'ico') + '<h3>Xu hướng tuân thủ (% ngưỡng cho phép)</h3><div class="spacer"></div>' +
                C.legend([{ label: 'SO₂', color: 'var(--series-1)' }, { label: 'NOx', color: 'var(--series-3)' }, { label: 'Bụi', color: 'var(--series-4)' }, { label: '100% ngưỡng', color: 'var(--alarm)', dash: true }]) + '</div>' +
                '<div class="card__body"><div class="trend"><canvas id="em-trend"></canvas></div></div></div>' +
            '</div>' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('layers', 'ico') + '<h3>Hệ thống xử lý khí thải</h3></div><div class="card__body">' +
                C.metric('fgdEff', u, { icon: 'drop', bar: false }) + C.metric('espI', u, { icon: 'bolt', bar: false }) + C.metric('stkT', u, { icon: 'thermo', bar: false }) +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('smoke', 'ico') + '<h3>Ống khói</h3></div><div class="card__body">' +
                C.metric('opac', u, { icon: 'smoke', bar: false }) + C.metric('stkT', u, { icon: 'thermo', bar: false }) +
                '<div class="card__foot" style="border:none;padding:6px 0 0">Quan trắc tự động, truyền số liệu Sở TN&MT · 5 phút/lần</div>' +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('bell', 'ico') + '<h3>Cảnh báo — Khí thải ' + u + '</h3></div><div id="em-alarms">' + C.alarmRows(C.sysAlarms(TAGS)) + '</div></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      drawTrend(root); this._root = root;
    },
    update: function () {
      var root = this._root; if (!root) return;
      C.refresh(root);
      var b = root.querySelector('#em-badge'); if (b) b.innerHTML = complianceBadge(S.activeUnit);
      var a = root.querySelector('#em-alarms'); if (a) a.innerHTML = C.alarmRows(C.sysAlarms(TAGS));
      drawTrend(root);
    }
  };
})(window);
