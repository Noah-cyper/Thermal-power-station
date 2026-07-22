/* =====================================================================
   VIEW · Historian & Xu hướng (Trends)
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C, F = global.F;
  var V = global.Views = global.Views || {};

  var CHS = [
    { k: 'mw', lbl: 'Công suất' }, { k: 'msP', lbl: 'Áp hơi chính' }, { k: 'msT', lbl: 'Nhiệt hơi chính' },
    { k: 'coalF', lbl: 'Than vào lò' }, { k: 'feedF', lbl: 'Nước cấp' }, { k: 'o2', lbl: 'O₂ khói' },
    { k: 'fgT', lbl: 'Nhiệt khói thải' }, { k: 'brgT', lbl: 'Nhiệt gối trục' }, { k: 'vib', lbl: 'Độ rung' },
    { k: 'deaP', lbl: 'Áp khử khí' }, { k: 'cwOutT', lbl: 'Nước làm mát ra' }, { k: 'freq', lbl: 'Tần số' },
    { k: 'so2', lbl: 'SO₂' }, { k: 'nox', lbl: 'NOx' }, { k: 'dust', lbl: 'Bụi' }
  ];
  var st = { ch: 'mw', range: 180 };

  function slice(uid) { var a = (S.history[uid] || {})[st.ch] || []; return a.slice(-st.range); }
  function stats(arr) {
    if (!arr.length) return { cur: null, min: null, max: null, avg: null };
    var mn = Infinity, mx = -Infinity, sum = 0;
    arr.forEach(function (v) { if (v < mn) mn = v; if (v > mx) mx = v; sum += v; });
    return { cur: arr[arr.length - 1], min: mn, max: mx, avg: sum / arr.length };
  }
  function xlabels() { return ['−' + st.range + 's', '−' + Math.round(st.range * 2 / 3) + 's', '−' + Math.round(st.range / 3) + 's', 'hiện tại']; }

  function draw(root) {
    var cv = root.querySelector('#tr-canvas'); if (!cv) return;
    C.trend(cv, [
      { data: slice('S1'), color: '--series-1', width: 2, fill: true },
      { data: slice('S2'), color: '--series-3', width: 2 }
    ], { height: 300, dp: S.spec(st.ch).dp, xlabels: xlabels() });
  }

  function chips() {
    return CHS.map(function (c) {
      return '<button class="unit-tab' + (st.ch === c.k ? ' is-active' : '') + '" data-ch="' + c.k + '" style="height:30px;font-size:12px;padding:0 11px">' + c.lbl + '</button>';
    }).join('');
  }

  function statTable() {
    var sp = S.spec(st.ch);
    function row(uid, col) {
      var s = stats(slice(uid));
      return '<tr><td><span class="dot-st" style="background:' + col + '"></span> Tổ máy ' + uid + '</td>' +
        '<td class="r num" style="font-weight:700">' + F.fmt(s.cur, sp.dp) + '</td>' +
        '<td class="r num">' + F.fmt(s.min, sp.dp) + '</td><td class="r num">' + F.fmt(s.max, sp.dp) + '</td>' +
        '<td class="r num">' + F.fmt(s.avg, sp.dp) + '</td></tr>';
    }
    return '<table class="tbl"><thead><tr><th>Kênh · ' + sp.d + ' (' + sp.u + ')</th><th class="r">Hiện tại</th><th class="r">Nhỏ nhất</th><th class="r">Lớn nhất</th><th class="r">Trung bình</th></tr></thead><tbody>' +
      row('S1', '#2b7fd4') + row('S2', '#e08600') + '</tbody></table>';
  }

  V.trends = {
    title: 'Historian & Xu hướng',
    subtitle: 'Trends · So sánh 2 tổ máy',
    render: function (root) {
      var sp = S.spec(st.ch);
      root.innerHTML =
        '<div class="page">' +
          '<div class="page__head"><h2>Historian & Xu hướng</h2><span class="sub">Đồ thị đa kênh · so sánh tổ máy · thống kê</span>' +
            '<div class="spacer"></div>' +
            '<div class="seg" id="tr-range"><button data-range="60"' + (st.range === 60 ? ' class="is-active"' : '') + '>1 phút</button><button data-range="120"' + (st.range === 120 ? ' class="is-active"' : '') + '>2 phút</button><button data-range="180"' + (st.range === 180 ? ' class="is-active"' : '') + '>3 phút</button></div></div>' +
          '<div class="card"><div class="card__head">' + C.icon('layers', 'ico') + '<h3>Chọn kênh (pen)</h3></div><div class="card__body"><div class="row wrap" style="gap:7px" id="tr-chips">' + chips() + '</div></div></div>' +
          '<div class="card" style="margin-top:14px"><div class="card__head">' + C.icon('activity', 'ico') + '<h3 id="tr-title">' + sp.d + '</h3><span class="sub" id="tr-unit">— ' + sp.u + '</span><div class="spacer"></div>' +
            C.legend([{ label: 'Tổ máy S1', color: 'var(--series-1)' }, { label: 'Tổ máy S2', color: 'var(--series-3)' }]) + '</div>' +
            '<div class="card__body"><div class="trend"><canvas id="tr-canvas"></canvas></div></div></div>' +
          '<div class="card" style="margin-top:14px"><div class="card__head">' + C.icon('report', 'ico') + '<h3>Thống kê khoảng thời gian</h3></div><div class="card__body tight" id="tr-stats">' + statTable() + '</div></div>' +
        '</div>';

      function pickCh(k) {
        st.ch = k;
        root.querySelectorAll('#tr-chips button').forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-ch') === k); });
        var sp2 = S.spec(k); root.querySelector('#tr-title').textContent = sp2.d; root.querySelector('#tr-unit').textContent = '— ' + sp2.u;
        root.querySelector('#tr-stats').innerHTML = statTable(); draw(root);
      }
      root.querySelector('#tr-chips').addEventListener('click', function (e) { var b = e.target.closest('button[data-ch]'); if (b) pickCh(b.getAttribute('data-ch')); });
      root.querySelector('#tr-range').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-range]'); if (!b) return;
        st.range = +b.getAttribute('data-range');
        root.querySelectorAll('#tr-range button').forEach(function (x) { x.classList.toggle('is-active', x === b); });
        root.querySelector('#tr-stats').innerHTML = statTable(); draw(root);
      });
      draw(root); this._root = root;
    },
    update: function () {
      var root = this._root; if (!root) return;
      root.querySelector('#tr-stats').innerHTML = statTable();
      draw(root);
    }
  };
})(window);
