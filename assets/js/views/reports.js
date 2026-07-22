/* =====================================================================
   VIEW · Báo cáo (Reports — báo cáo ca / sản lượng / phát thải)
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C, F = global.F;
  var V = global.Views = global.Views || {};
  var SHIFT_H = 8;
  var LIMIT = { so2: 350, nox: 650, dust: 50 };

  function unitRow(uid) {
    var mw = S.val('mw', uid), coal = S.val('coalF', uid) * SHIFT_H;
    return {
      mwh: mw * SHIFT_H, hours: SHIFT_H.toFixed(1), load: mw,
      hr: 9000 + (1 - mw / 330) * 850, coal: coal
    };
  }

  function kpis() {
    var s1 = unitRow('S1'), s2 = unitRow('S2');
    var mwh = s1.mwh + s2.mwh;
    var aux = mwh * S.plant.auxPct / 100;
    var hr = (s1.hr + s2.hr) / 2;
    return C.kpi({ label: 'Sản lượng ca', value: F.fmt(mwh, 0), unit: 'MWh', icon: 'bolt', status: 'info', sub: 'điện đầu cực · 2 tổ máy' }) +
      C.kpi({ label: 'Điện tự dùng', value: F.fmt(aux, 0), unit: 'MWh', icon: 'activity', status: 'ok', sub: F.fmt(S.plant.auxPct, 1) + '% sản lượng' }) +
      C.kpi({ label: 'Suất hao nhiệt', value: F.fmt(hr, 0), unit: 'kJ/kWh', icon: 'flame', status: 'ok', sub: 'bình quân ca' }) +
      C.kpi({ label: 'Hệ số khả dụng', value: F.fmt(S.plant.avail, 1), unit: '%', icon: 'check', status: 'ok', sub: '2/2 tổ máy sẵn sàng' });
  }

  function balanceTable() {
    function tr(name, uid) {
      var r = unitRow(uid);
      return '<tr><td class="code">' + name + '</td><td class="r num">' + F.fmt(r.mwh, 0) + '</td><td class="r num">' + r.hours + '</td>' +
        '<td class="r num">' + F.fmt(r.load, 1) + '</td><td class="r num">' + F.fmt(r.hr, 0) + '</td><td class="r num">' + F.fmt(r.coal, 0) + '</td></tr>';
    }
    var s1 = unitRow('S1'), s2 = unitRow('S2');
    return '<table class="tbl"><thead><tr><th>Tổ máy</th><th class="r">Sản lượng (MWh)</th><th class="r">Giờ VH</th><th class="r">Tải TB (MW)</th><th class="r">Suất hao (kJ/kWh)</th><th class="r">Than (tấn)</th></tr></thead><tbody>' +
      tr('Tổ máy S1', 'S1') + tr('Tổ máy S2', 'S2') +
      '<tr style="font-weight:750;background:var(--surface-2)"><td>Toàn nhà máy</td><td class="r num">' + F.fmt(s1.mwh + s2.mwh, 0) + '</td><td class="r num">' + (SHIFT_H * 2).toFixed(1) + '</td><td class="r num">' + F.fmt(s1.load + s2.load, 1) + '</td><td class="r num">' + F.fmt((s1.hr + s2.hr) / 2, 0) + '</td><td class="r num">' + F.fmt(s1.coal + s2.coal, 0) + '</td></tr>' +
      '</tbody></table>';
  }

  function emissionTable() {
    function tr(name, k) {
      var v = (S.val(k, 'S1') + S.val(k, 'S2')) / 2, lim = LIMIT[k], ok = v <= lim;
      return '<tr><td>' + name + '</td><td class="r num">' + F.fmt(v, 0) + '</td><td class="r num dim">' + lim + '</td>' +
        '<td class="r">' + (ok ? '<span class="badge badge--ok"><span class="dot"></span>Đạt</span>' : '<span class="badge badge--alarm">Vượt</span>') + '</td></tr>';
    }
    return '<table class="tbl"><thead><tr><th>Chỉ tiêu</th><th class="r">TB ca</th><th class="r">Ngưỡng</th><th class="r">Đánh giá</th></tr></thead><tbody>' +
      tr('SO₂ (mg/Nm³)', 'so2') + tr('NOx (mg/Nm³)', 'nox') + tr('Bụi (mg/Nm³)', 'dust') + '</tbody></table>';
  }

  // Biểu đồ cột sản lượng theo giờ (mô phỏng 12 giờ)
  function hourlyBars() {
    var base = S.plant.totalMW;
    var vals = [];
    for (var i = 0; i < 12; i++) vals.push(base * (0.9 + 0.12 * Math.sin(i / 2) + (i % 3) * 0.01));
    var max = Math.max.apply(null, vals) * 1.1, W = 640, H = 190, bw = W / 12;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto">';
    for (var g = 0; g <= 3; g++) { var y = 12 + (H - 40) * g / 3; s += '<line x1="34" y1="' + y + '" x2="' + W + '" y2="' + y + '" stroke="var(--line)" stroke-width="1"/><text x="28" y="' + (y + 3) + '" text-anchor="end" font-size="9" fill="var(--muted)">' + F.fmt(max * (1 - g / 3), 0) + '</text>'; }
    vals.forEach(function (v, i) {
      var h = (H - 40) * (v / max), x = 40 + i * (bw - 3) + 6, y = H - 28 - h;
      s += '<rect x="' + x + '" y="' + y + '" width="' + (bw - 16) + '" height="' + h + '" rx="3" fill="var(--series-1)" opacity="0.9"/>';
      s += '<text x="' + (x + (bw - 16) / 2) + '" y="' + (H - 14) + '" text-anchor="middle" font-size="9" fill="var(--muted)">' + (i * 2) + 'h</text>';
    });
    s += '</svg>';
    return s;
  }

  function opCells() {
    var lf = (S.val('mw', 'S1') + S.val('mw', 'S2')) / 660 * 100;
    return '<div class="cellgrid" style="grid-template-columns:1fr 1fr">' +
      '<div class="cell"><div class="k">Hệ số tải</div><div class="v">' + F.fmt(lf, 1) + '<span class="u">%</span></div></div>' +
      '<div class="cell"><div class="k">Giờ vận hành</div><div class="v">' + (SHIFT_H * 2).toFixed(0) + '<span class="u">giờ</span></div></div>' +
      '<div class="cell"><div class="k">Lần khởi động</div><div class="v">0</div></div>' +
      '<div class="cell"><div class="k">Sự cố dừng máy</div><div class="v">0</div></div>' +
      '</div>';
  }

  V.reports = {
    title: 'Báo cáo',
    subtitle: 'Reports · Báo cáo ca vận hành',
    render: function (root) {
      root.innerHTML =
        '<div class="page">' +
          '<div class="page__head"><h2>Báo cáo ca vận hành</h2><span class="sub">Ca 3 · ' + F.longDate(S.now) + ' · 22:00–06:00</span>' +
            '<div class="spacer"></div><button class="btn">' + C.icon('report') + 'Xuất Excel</button><button class="btn btn--primary">' + C.icon('report') + 'In báo cáo</button></div>' +
          '<div class="grid cols-4" id="rp-kpi">' + kpis() + '</div>' +
          '<div class="layout-rail" style="margin-top:14px">' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('grid', 'ico') + '<h3>Cân bằng sản lượng theo tổ máy</h3></div><div class="card__body tight" id="rp-balance">' + balanceTable() + '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('activity', 'ico') + '<h3>Sản lượng toàn nhà máy theo giờ</h3><div class="spacer"></div>' + C.legend([{ label: 'Công suất (MW)', color: 'var(--series-1)' }]) + '</div><div class="card__body" id="rp-bars">' + hourlyBars() + '</div></div>' +
            '</div>' +
            '<div class="grid" style="gap:14px">' +
              '<div class="card"><div class="card__head">' + C.icon('smoke', 'ico') + '<h3>Phát thải trung bình ca</h3></div><div class="card__body tight" id="rp-emis">' + emissionTable() + '</div></div>' +
              '<div class="card"><div class="card__head">' + C.icon('check', 'ico') + '<h3>Chỉ tiêu vận hành</h3></div><div class="card__body" id="rp-op">' + opCells() + '</div></div>' +
              '<div class="card"><div class="card__body"><div class="dim" style="font-size:12px;line-height:1.6">Báo cáo tự động tổng hợp từ historian. Số liệu mang tính minh hoạ (mô phỏng). Ký duyệt: Trưởng ca · Trưởng kíp lò máy · Trưởng kíp điện.</div></div></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      this._root = root;
    },
    update: function () {
      var root = this._root; if (!root) return;
      root.querySelector('#rp-kpi').innerHTML = kpis();
      root.querySelector('#rp-balance').innerHTML = balanceTable();
      root.querySelector('#rp-emis').innerHTML = emissionTable();
      root.querySelector('#rp-op').innerHTML = opCells();
    }
  };
})(window);
