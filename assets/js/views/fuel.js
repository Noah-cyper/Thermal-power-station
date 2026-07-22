/* =====================================================================
   VIEW · Cấp nhiên liệu — than (Fuel / Coal Handling)
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C, F = global.F;
  var V = global.Views = global.Views || {};
  var TAGS = ['bunkL', 'feedR', 'millT', 'millI', 'millDP', 'beltL', 'coalF'];

  function drawTrend(root) {
    var cv = root.querySelector('#fu-trend'); if (!cv) return;
    var h = S.history[S.activeUnit] || {};
    C.trend(cv, [{ data: h.coalF || [], color: '--series-1', width: 2, fill: true }],
      { height: 190, min: 100, max: 175, dp: 0, xlabels: ['−3′', '−2′', '−1′', 'hiện tại'] });
  }

  // Bảng 5 máy nghiền: A dùng số liệu live (đang nóng), B–D suy ra, E dự phòng
  function millRows(u) {
    var lf = S.val('mw', u) / 330;
    var fr = S.val('feedR', u);
    var rows = [
      { id: 'MILL-1A', t: S.val('millT', u), i: S.val('millI', u), dp: S.val('millDP', u), f: fr, st: S.stat('millT', u) },
      { id: 'MILL-1B', t: 80 + lf * 7, i: 64 + lf * 36, dp: 35 + lf * 21, f: fr * 0.99, st: 'ok' },
      { id: 'MILL-1C', t: 79 + lf * 8, i: 66 + lf * 34, dp: 37 + lf * 20, f: fr * 1.01, st: 'ok' },
      { id: 'MILL-1D', t: 81 + lf * 6, i: 63 + lf * 37, dp: 34 + lf * 23, f: fr * 0.97, st: 'ok' },
      { id: 'MILL-1E', standby: true }
    ];
    var stBadge = { ok: '<span class="badge badge--ok"><span class="dot"></span>Chạy</span>', warn: '<span class="badge badge--warn">' + C.icon('alert', '', 2) + 'Cảnh báo</span>', alarm: '<span class="badge badge--alarm">' + C.icon('alert', '', 2) + 'Sự cố</span>' };
    return '<table class="tbl"><thead><tr><th>Máy nghiền</th><th>Trạng thái</th><th class="r">Cấp than</th><th class="r">Nhiệt ra</th><th class="r">Dòng ĐC</th><th class="r">ΔP</th></tr></thead><tbody>' +
      rows.map(function (m) {
        if (m.standby) return '<tr><td class="code">' + m.id + '</td><td><span class="badge badge--muted"><span class="dot"></span>Dự phòng</span></td><td class="r dim">—</td><td class="r dim">—</td><td class="r dim">—</td><td class="r dim">—</td></tr>';
        var cls = m.st === 'alarm' ? 'is-alarm' : m.st === 'warn' ? 'is-warn' : '';
        return '<tr><td class="code">' + m.id + '</td><td>' + stBadge[m.st] + '</td>' +
          '<td class="r num">' + F.fmt(m.f, 1) + '</td>' +
          '<td class="r num ' + cls + '">' + F.fmt(m.t, 0) + '</td>' +
          '<td class="r num">' + F.fmt(m.i, 0) + '</td>' +
          '<td class="r num">' + F.fmt(m.dp, 0) + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  V.fuel = {
    title: 'Cấp nhiên liệu',
    subtitle: 'Fuel · Coal Handling',
    render: function (root) {
      var u = S.activeUnit;
      root.innerHTML =
        '<div class="page">' +
          '<div class="page__head"><h2>Cấp nhiên liệu — Than</h2><span class="sub">Kho → băng tải → bunker → máy nghiền → vòi đốt</span><div class="spacer"></div>' + C.unitTabs() + '</div>' +
          '<div class="grid cols-4">' +
            C.gaugeCard('bunkL', u, 'Mức than bunker') +
            C.gaugeCard('beltL', u, 'Tải băng tải than') +
            C.gaugeCard('coalF', u, 'Tổng than vào lò') +
            C.gaugeCard('millT', u, 'Nhiệt độ máy nghiền A') +
          '</div>' +
          '<div class="layout-rail" style="margin-top:14px">' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('coal', 'ico') + '<h3>Máy nghiền than (Mills 1A–1E)</h3><div class="spacer"></div><span class="sub">4 chạy · 1 dự phòng</span></div>' +
                '<div class="card__body tight" id="fu-mills">' + millRows(u) + '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('activity', 'ico') + '<h3>Xu hướng lượng than vào lò</h3><div class="spacer"></div>' +
                C.legend([{ label: 'Than vào lò (t/h)', color: 'var(--series-1)' }]) + '</div>' +
                '<div class="card__body"><div class="trend"><canvas id="fu-trend"></canvas></div></div></div>' +
            '</div>' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('layers', 'ico') + '<h3>Kho & Vận chuyển</h3></div><div class="card__body">' +
                C.metric('bunkL', u, { icon: 'coal', bar: false }) + C.metric('beltL', u, { icon: 'activity', bar: false }) + C.metric('feedR', u, { icon: 'pump', bar: false }) +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('alert', 'ico') + '<h3>Máy nghiền 1A</h3></div><div class="card__body">' +
                C.metric('millT', u, { icon: 'thermo', bar: false }) + C.metric('millI', u, { icon: 'bolt', bar: false }) + C.metric('millDP', u, { icon: 'press', bar: false }) +
              '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('bell', 'ico') + '<h3>Cảnh báo — Nhiên liệu ' + u + '</h3></div><div id="fu-alarms">' + C.alarmRows(C.sysAlarms(TAGS)) + '</div></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      drawTrend(root); this._root = root;
    },
    update: function () {
      var root = this._root; if (!root) return;
      C.refresh(root);
      var m = root.querySelector('#fu-mills'); if (m) m.innerHTML = millRows(S.activeUnit);
      var a = root.querySelector('#fu-alarms'); if (a) a.innerHTML = C.alarmRows(C.sysAlarms(TAGS));
      drawTrend(root);
    }
  };
})(window);
