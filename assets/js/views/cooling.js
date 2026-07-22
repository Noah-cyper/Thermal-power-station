/* =====================================================================
   VIEW · Nước làm mát & Tháp giải nhiệt (Cooling Water / Cooling Tower)
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C, F = global.F;
  var V = global.Views = global.Views || {};
  var TAGS = ['cwInT', 'cwOutT', 'cwF', 'ctBasT', 'ctApp', 'cwP'];

  function drawTrend(root) {
    var cv = root.querySelector('#cw-trend'); if (!cv) return;
    var h = S.history[S.activeUnit] || {};
    C.trend(cv, [{ data: h.cwOutT || [], color: '--series-1', width: 2, fill: true }],
      { height: 190, min: 34, max: 50, dp: 1, xlabels: ['−3′', '−2′', '−1′', 'hiện tại'], limit: 45 });
  }

  function towerSVG(u) {
    var app = F.fmt(S.val('ctApp', u), 1);
    return '<div class="pid"><svg viewBox="0 0 340 170" role="img" aria-label="Tháp giải nhiệt">' +
      // quạt
      '<circle cx="170" cy="26" r="16" fill="none" stroke="var(--series-1)" stroke-width="2"/>' +
      '<g class="flow" style="transform-origin:170px 26px"><path d="M170 26 L170 12 M170 26 L182 33 M170 26 L158 33" stroke="var(--series-1)" stroke-width="2" fill="none"/></g>' +
      '<text x="170" y="8" text-anchor="middle" class="eqname">Quạt CT-FAN</text>' +
      // thân tháp (hyperbol đơn giản hoá)
      '<path d="M96 50 L244 50 L224 120 L116 120 Z" fill="rgba(43,127,212,.06)" stroke="var(--line-strong)" stroke-width="1.3"/>' +
      // fill/nước rơi
      '<g stroke="var(--series-1)" stroke-width="1" opacity=".5" class="flow">' +
      '<line x1="130" y1="58" x2="126" y2="112"/><line x1="150" y1="58" x2="148" y2="112"/><line x1="170" y1="58" x2="170" y2="112"/><line x1="190" y1="58" x2="192" y2="112"/><line x1="210" y1="58" x2="214" y2="112"/></g>' +
      // bể chứa
      '<rect x="104" y="120" width="132" height="26" rx="3" fill="#eef4fb" stroke="var(--line-strong)" stroke-width="1.3"/>' +
      '<text x="170" y="137" text-anchor="middle" class="eqlabel">Bể tháp · CT-1</text>' +
      // bơm tuần hoàn ra
      '<circle cx="270" cy="133" r="13" fill="#fff" stroke="var(--line-strong)" stroke-width="1.3"/><path d="M270 126v7l5 3" stroke="var(--series-1)" stroke-width="1.5" fill="none"/>' +
      '<text x="290" y="136" class="eqname">Bơm CWP</text>' +
      // ghi approach
      '<text x="40" y="88" class="eqlabel" font-size="9">Approach</text>' +
      '<text x="40" y="102" class="isaval" font-size="13">' + app + ' °C</text>' +
      '</svg></div>';
  }

  function fanCells(u) {
    var lf = S.val('mw', u) / 330;
    var fans = [
      { id: 'CT-FAN-1', sp: Math.round(88 + lf * 8) }, { id: 'CT-FAN-2', sp: Math.round(86 + lf * 9) },
      { id: 'CT-FAN-3', sp: Math.round(90 + lf * 7) }, { id: 'CT-FAN-4', sp: Math.round(84 + lf * 10) }
    ];
    return '<div class="cellgrid" style="grid-template-columns:1fr 1fr">' + fans.map(function (f) {
      return '<div class="cell"><div class="k"><span class="dot-st ok"></span>' + f.id + '</div>' +
        '<div class="v">' + f.sp + '<span class="u">%</span></div><div class="foot">Chạy · biến tần</div></div>';
    }).join('') + '</div>';
  }

  V.cooling = {
    title: 'Nước làm mát',
    subtitle: 'Cooling Water · Cooling Tower',
    render: function (root) {
      var u = S.activeUnit;
      root.innerHTML =
        '<div class="page">' +
          '<div class="page__head"><h2>Nước làm mát & Tháp giải nhiệt</h2><span class="sub">Nước tuần hoàn · bơm · tháp giải nhiệt</span><div class="spacer"></div>' + C.unitTabs() + '</div>' +
          '<div class="grid cols-4">' +
            C.gaugeCard('cwInT', u, 'Nước làm mát vào') +
            C.gaugeCard('cwOutT', u, 'Nước làm mát ra') +
            C.gaugeCard('cwF', u, 'Lưu lượng tuần hoàn') +
            C.gaugeCard('ctApp', u, 'Approach tháp') +
          '</div>' +
          '<div class="layout-rail" style="margin-top:14px">' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('pump', 'ico') + '<h3>Hệ nước tuần hoàn</h3></div><div class="card__body">' +
                C.metric('cwF', u, { icon: 'activity' }) + C.metric('cwP', u, { icon: 'press' }) +
                C.metric('cwInT', u, { icon: 'thermo' }) + C.metric('cwOutT', u, { icon: 'thermo' }) +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('activity', 'ico') + '<h3>Xu hướng nhiệt độ nước ra</h3><div class="spacer"></div>' +
                C.legend([{ label: 'Nước ra (°C)', color: 'var(--series-1)' }, { label: 'Ngưỡng 45', color: 'var(--alarm)', dash: true }]) + '</div>' +
                '<div class="card__body"><div class="trend"><canvas id="cw-trend"></canvas></div></div></div>' +
            '</div>' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('tower', 'ico') + '<h3>Tháp giải nhiệt</h3></div><div class="card__body">' + towerSVG(u) +
                '<div class="mt-3">' + C.metric('ctBasT', u, { icon: 'thermo', bar: false }) + C.metric('ctApp', u, { icon: 'snow', bar: false }) + '</div>' +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('fan', 'ico') + '<h3>Quạt tháp giải nhiệt</h3></div><div class="card__body" id="cw-fans">' + fanCells(u) + '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('bell', 'ico') + '<h3>Cảnh báo — Làm mát ' + u + '</h3></div><div id="cw-alarms">' + C.alarmRows(C.sysAlarms(TAGS)) + '</div></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      drawTrend(root); this._root = root;
    },
    update: function () {
      var root = this._root; if (!root) return;
      C.refresh(root);
      var f = root.querySelector('#cw-fans'); if (f) f.innerHTML = fanCells(S.activeUnit);
      var a = root.querySelector('#cw-alarms'); if (a) a.innerHTML = C.alarmRows(C.sysAlarms(TAGS));
      drawTrend(root);
    }
  };
})(window);
