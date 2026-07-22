/* =====================================================================
   THERMOSCADA — Components (render helpers, không phụ thuộc thư viện)
   ===================================================================== */
(function (global) {
  'use strict';
  var F = global.F, S = global.Store;

  /* ---------------- Icon set (stroke, 24x24) ---------------- */
  var P = {
    gauge: '<path d="M12 14a2 2 0 100-4 2 2 0 000 4zM12 4a8 8 0 018 8M4 12a8 8 0 018-8M13.4 10.6l3.6-3.6"/>',
    flame: '<path d="M12 3c1 3-2 4-2 7a2 2 0 004 0c0-1 0-2-.5-3 2 1.5 3.5 4 3.5 6a5 5 0 01-10 0c0-3 3-5 5-7z"/>',
    fan: '<path d="M12 12a3 3 0 100-.01M12 12c0-3 1-6-1-8 3 0 5 2 5 4M12 12c3 0 6 1 8-1 0 3-2 5-4 5M12 12c0 3-1 6 1 8-3 0-5-2-5-4M12 12c-3 0-6-1-8 1 0-3 2-5 4-5"/>',
    rotor: '<circle cx="12" cy="12" r="8"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4"/><circle cx="12" cy="12" r="2"/>',
    drop: '<path d="M12 3s6 6 6 10a6 6 0 01-12 0c0-4 6-10 6-10z"/>',
    snow: '<path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9M9 5l3 2 3-2M9 19l3-2 3 2"/>',
    coal: '<path d="M3 8l4-3h10l4 3v8l-4 3H7l-4-3z"/><path d="M3 8l9 3 9-3M12 11v8"/>',
    bolt: '<path d="M13 3L5 13h6l-1 8 8-11h-6z"/>',
    smoke: '<path d="M6 20V9l3-4h6l3 4v11M9 9v11M15 9v11M4 20h16"/>',
    bell: '<path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6zM10 20a2 2 0 004 0"/>',
    activity: '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
    report: '<path d="M7 3h7l4 4v14H7zM14 3v4h4M9 12h6M9 16h6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/>',
    device: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9zM2 9h2M2 15h2M20 9h2M20 15h2M9 2v2M15 2v2M9 20v2M15 20v2"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 7a3 3 0 010 6M21 20c0-2-1-3-3-4"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 16l9 5 9-5"/>',
    thermo: '<path d="M12 3a2 2 0 012 2v9a4 4 0 11-4 0V5a2 2 0 012-2z"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    factory: '<path d="M3 21V10l6 4V10l6 4V6l6 4v11zM3 21h18M7 17h2M13 17h2"/>',
    pump: '<circle cx="12" cy="12" r="7"/><path d="M12 5v7l5 3"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    alert: '<path d="M12 3l9 16H3zM12 10v4M12 17h.01"/>',
    xcirc: '<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/>',
    wifi: '<path d="M5 12a10 10 0 0114 0M8 15a6 6 0 018 0M12 18h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    valve: '<path d="M4 8l8 4 8-4v8l-8-4-8 4zM12 12v4M9 20h6"/>',
    gen: '<circle cx="12" cy="12" r="8"/><path d="M9 12a3 3 0 016 0M8 9l1 1M16 9l-1 1M12 8v1"/>',
    press: '<circle cx="12" cy="13" r="7"/><path d="M12 13l4-3M12 6V4M5 8L4 7M19 8l1-1"/>',
    dot: '<circle cx="12" cy="12" r="4"/>',
    wind: '<path d="M3 8h10a2 2 0 100-4M3 12h14a2 2 0 110 4M3 16h8a2 2 0 110 4"/>',
    tower: '<path d="M6 21l3-9M18 21l-3-9M9 12h6M7 3h10l-2 9H9z"/>'
  };
  function icon(name, cls, sw) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
      (sw || 1.7) + '" stroke-linecap="round" stroke-linejoin="round">' + (P[name] || P.dot) + '</svg>';
  }

  /* ---------------- Status ---------------- */
  var ST = {
    ok:    { cls: 'ok',    txt: 'Bình thường', ic: 'check' },
    warn:  { cls: 'warn',  txt: 'Cảnh báo',    ic: 'alert' },
    alarm: { cls: 'alarm', txt: 'Sự cố',       ic: 'alert' }
  };
  function badge(status, text) {
    var s = ST[status] || ST.ok;
    return '<span class="badge badge--' + s.cls + '">' + icon(s.ic, '', 2) + (text || s.txt) + '</span>';
  }
  // badge tự suy từ tag
  function tagBadge(name, uid, labelOk) {
    var st = S.stat(name, uid);
    return badge(st, st === 'ok' ? (labelOk || 'Bình thường') : null);
  }

  /* ---------------- Value text (số + đơn vị + màu trạng thái) ---------------- */
  function valHTML(name, uid, big) {
    var sp = S.spec(name), v = S.val(name, uid), st = S.stat(name, uid);
    var cls = st === 'alarm' ? 'is-alarm' : st === 'warn' ? 'is-warn' : '';
    return '<span class="num ' + cls + '">' + F.fmt(v, sp.dp) + '</span>' +
      (big ? '' : ' <span class="u dim">' + sp.u + '</span>');
  }

  /* ---------------- KPI tile ---------------- */
  function kpi(o) {
    // o: {label, value, unit, icon, status, sub, spark:{data,color}}
    var cls = o.status ? 'kpi kpi--' + o.status : 'kpi';
    var h = '<div class="' + cls + '">';
    h += '<div class="kpi__top">' + icon(o.icon || 'gauge', 'ico') + '<span class="kpi__label">' + o.label + '</span></div>';
    h += '<div class="kpi__val num">' + o.value + (o.unit ? ' <span class="unit">' + o.unit + '</span>' : '') + '</div>';
    if (o.sub) h += '<div class="kpi__sub">' + o.sub + '</div>';
    if (o.spark) h += '<div class="kpi__spark">' + spark(o.spark.data, { color: o.spark.color, width: 240, height: 30, fill: true }) + '</div>';
    h += '</div>';
    return h;
  }

  /* ---------------- Live helpers (cập nhật tại chỗ) ---------------- */
  // data-live = "uid|name|dp|unit(0/1)|color(0/1)"
  function dl(name, uid, o) {
    o = o || {};
    return 'data-live="' + (uid || S.activeUnit) + '|' + name + '|' + (o.dp == null ? '' : o.dp) + '|' + (o.unit ? 1 : 0) + '|' + (o.color === false ? 0 : 1) + '"';
  }
  function live(name, uid, o) {
    o = o || {};
    var sp = S.spec(name), uid2 = uid || S.activeUnit, v = S.val(name, uid2), st = S.stat(name, uid2);
    var dp = o.dp == null ? sp.dp : o.dp;
    var cls = o.color === false ? '' : (st === 'alarm' ? 'is-alarm' : st === 'warn' ? 'is-warn' : '');
    return '<span class="num ' + cls + '" ' + dl(name, uid2, o) + '>' + F.fmt(v, dp) + (o.unit ? ' ' + sp.u : '') + '</span>';
  }
  function gaugeBox(name, uid, o) {
    o = o || {}; var uid2 = uid || S.activeUnit;
    return '<div data-gauge="' + uid2 + '|' + name + '|' + (o.size || 132) + '|' + (o.label || S.spec(name).d) + '">' + gauge(name, uid2, o) + '</div>';
  }
  function bandBox(name, uid) { var uid2 = uid || S.activeUnit; return '<div data-band="' + uid2 + '|' + name + '">' + band(name, uid2) + '</div>'; }

  /* ---------------- Metric row ---------------- */
  function metric(name, uid, opts) {
    opts = opts || {};
    var sp = S.spec(name), uid2 = uid || S.activeUnit, v = S.val(name, uid2), st = S.stat(name, uid2);
    var cls = st === 'alarm' ? 'is-alarm' : st === 'warn' ? 'is-warn' : '';
    var h = '<div class="metric">';
    h += '<div class="metric__ic">' + icon(opts.icon || 'dot', '', 1.7) + '</div>';
    h += '<div class="metric__main"><div class="metric__name">' + (opts.name || sp.d) + '</div><div class="metric__tag">' + sp.isa + '</div></div>';
    if (opts.bar !== false) h += '<div class="metric__bar" data-meter="' + uid2 + '|' + name + '">' + bandMini(name, uid2) + '</div>';
    h += '<div class="metric__val"><span class="v ' + cls + '" ' + dl(name, uid2) + '>' + F.fmt(v, sp.dp) + '</span><span class="u">' + sp.u + '</span></div>';
    h += '</div>';
    return h;
  }

  /* ---------------- Cell (ô số) ---------------- */
  function cell(name, uid, opts) {
    opts = opts || {};
    var sp = S.spec(name), uid2 = uid || S.activeUnit, v = S.val(name, uid2), st = S.stat(name, uid2);
    var cls = st === 'alarm' ? 'is-alarm' : st === 'warn' ? 'is-warn' : '';
    var dotcls = st === 'alarm' ? 'alarm' : st === 'warn' ? 'warn' : 'ok';
    var h = '<div class="cell">';
    h += '<div class="k"><span class="dot-st ' + dotcls + '" data-dot="' + uid2 + '|' + name + '"></span>' + (opts.name || sp.d) + '</div>';
    h += '<div class="v ' + cls + '"><span ' + dl(name, uid2, { color: false }) + '>' + F.fmt(v, sp.dp) + '</span><span class="u">' + sp.u + '</span></div>';
    if (opts.foot !== false) h += '<div class="foot mono">' + sp.isa + '</div>';
    h += '</div>';
    return h;
  }

  /* ---------------- Refresh: cập nhật mọi phần tử data-* tại chỗ ---------------- */
  function refresh(root) {
    root = root || document;
    root.querySelectorAll('[data-live]').forEach(function (el) {
      var p = el.getAttribute('data-live').split('|');
      var uid = p[0] || S.activeUnit, name = p[1], sp = S.spec(name); if (!sp) return;
      var dp = p[2] === '' ? sp.dp : +p[2], u = p[3] === '1', c = p[4] === '1';
      var v = S.val(name, uid), st = S.stat(name, uid);
      el.textContent = F.fmt(v, dp) + (u ? ' ' + sp.u : '');
      if (c) {
        var isSvg = el.namespaceURI && el.namespaceURI.indexOf('svg') >= 0;
        if (isSvg) el.style.fill = st === 'alarm' ? 'var(--alarm-strong)' : st === 'warn' ? 'var(--warn-strong)' : '';
        else { el.classList.remove('is-warn', 'is-alarm'); if (st === 'warn') el.classList.add('is-warn'); else if (st === 'alarm') el.classList.add('is-alarm'); }
      }
    });
    root.querySelectorAll('[data-dot]').forEach(function (el) {
      var p = el.getAttribute('data-dot').split('|'); var st = S.stat(p[1], p[0]);
      el.className = 'dot-st ' + (st === 'alarm' ? 'alarm' : st === 'warn' ? 'warn' : 'ok');
    });
    root.querySelectorAll('[data-meter]').forEach(function (el) {
      var p = el.getAttribute('data-meter').split('|'); el.innerHTML = bandMini(p[1], p[0]);
    });
    root.querySelectorAll('[data-band]').forEach(function (el) {
      var p = el.getAttribute('data-band').split('|'); el.innerHTML = band(p[1], p[0]);
    });
    root.querySelectorAll('[data-gauge]').forEach(function (el) {
      var p = el.getAttribute('data-gauge').split('|'); el.innerHTML = gauge(p[1], p[0], { size: +p[2], label: p[3] });
    });
  }

  /* ---------------- Band meter (giải dung sai + kim) ---------------- */
  function bandMini(name, uid) {
    var sp = S.spec(name), v = S.val(name, uid), st = S.stat(name, uid);
    var p = F.pct(v, sp.lo, sp.hi) * 100;
    var cls = st === 'alarm' ? 'alarm' : st === 'warn' ? 'warn' : 'ok';
    return '<div class="meter"><div class="meter__fill ' + cls + '" style="width:' + p.toFixed(0) + '%"></div></div>';
  }
  function band(name, uid) {
    var sp = S.spec(name), v = S.val(name, uid), st = S.stat(name, uid);
    var p = (F.pct(v, sp.lo, sp.hi) * 100).toFixed(1);
    var cls = st === 'alarm' ? 'alarm' : st === 'warn' ? 'warn' : 'ok';
    var h = '<div class="band-wrap">';
    h += '<div class="band"><div class="band__sp"></div><div class="band__needle ' + cls + '" style="left:' + p + '%"></div></div>';
    h += '<div class="band-scale"><span>' + F.fmt(sp.lo, sp.dp) + '</span><span>' + sp.u + '</span><span>' + F.fmt(sp.hi, sp.dp) + '</span></div>';
    h += '</div>';
    return h;
  }

  /* ---------------- Radial gauge (SVG) ---------------- */
  function polar(cx, cy, r, deg) { var a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  function arc(cx, cy, r, a0, a1) {
    var s = polar(cx, cy, r, a1), e = polar(cx, cy, r, a0);
    var large = (a1 - a0) <= 180 ? 0 : 1;
    return 'M' + s[0].toFixed(1) + ' ' + s[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 ' + large + ' 0 ' + e[0].toFixed(1) + ' ' + e[1].toFixed(1);
  }
  function gauge(name, uid, opts) {
    opts = opts || {};
    var sp = S.spec(name), v = S.val(name, uid), st = S.stat(name, uid);
    var size = opts.size || 132, cx = size / 2, cy = size / 2, r = size / 2 - 12;
    var A0 = -135, A1 = 135;                     // 270° sweep
    var frac = F.pct(v, sp.lo, sp.hi);
    var ang = F.lerp(A0, A1, frac);
    var col = st === 'alarm' ? 'var(--alarm)' : st === 'warn' ? 'var(--warn)' : 'var(--brand)';
    var n = polar(cx, cy, r - 4, ang);
    var h = '<div class="gauge"><svg width="' + size + '" height="' + (size * 0.82).toFixed(0) + '" viewBox="0 0 ' + size + ' ' + (size * 0.82).toFixed(0) + '">';
    h += '<path d="' + arc(cx, cy, r, A0, A1) + '" fill="none" stroke="var(--surface-3)" stroke-width="9" stroke-linecap="round"/>';
    h += '<path d="' + arc(cx, cy, r, A0, ang) + '" fill="none" stroke="' + col + '" stroke-width="9" stroke-linecap="round"/>';
    // vạch chia
    for (var t = 0; t <= 4; t++) {
      var ta = F.lerp(A0, A1, t / 4); var p1 = polar(cx, cy, r - 11, ta), p2 = polar(cx, cy, r - 15, ta);
      h += '<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) + '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) + '" stroke="var(--line-strong)" stroke-width="1.5"/>';
    }
    h += '<line x1="' + cx + '" y1="' + cy + '" x2="' + n[0].toFixed(1) + '" y2="' + n[1].toFixed(1) + '" stroke="' + col + '" stroke-width="2.5" stroke-linecap="round"/>';
    h += '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="' + col + '"/>';
    h += '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" font-size="20" font-weight="750" fill="var(--ink)" style="font-variant-numeric:tabular-nums">' + F.fmt(v, sp.dp) + '</text>';
    h += '<text x="' + cx + '" y="' + (cy + 13) + '" text-anchor="middle" font-size="10" fill="var(--muted)">' + sp.u + '</text>';
    h += '</svg><div class="gauge__label">' + (opts.label || sp.d) + '</div></div>';
    return h;
  }

  /* ---------------- Sparkline ---------------- */
  function spark(data, o) {
    o = o || {};
    var w = o.width || 120, h = o.height || 28, pad = 2;
    if (!data || !data.length) return '<svg class="spark" width="' + w + '" height="' + h + '"></svg>';
    var min = Math.min.apply(null, data), max = Math.max.apply(null, data);
    var rng = (max - min) || 1, n = data.length;
    var pts = data.map(function (v, i) {
      var x = pad + (w - 2 * pad) * i / (n - 1);
      var y = pad + (h - 2 * pad) * (1 - (v - min) / rng);
      return x.toFixed(1) + ',' + y.toFixed(1);
    });
    var col = o.color || 'var(--series-1)';
    var s = '<svg class="spark" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">';
    if (o.fill) s += '<polygon points="' + pad + ',' + (h - pad) + ' ' + pts.join(' ') + ' ' + (w - pad) + ',' + (h - pad) + '" fill="' + col + '" opacity="0.10"/>';
    s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + col + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '</svg>';
    return s;
  }

  /* ---------------- Trend chart (canvas, đa chuỗi, 1 trục) ---------------- */
  function cssvar(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || v; }
  function trend(canvas, series, o) {
    o = o || {};
    var ratio = window.devicePixelRatio || 1;
    var W = canvas.clientWidth || 600, H = o.height || 240;
    canvas.width = W * ratio; canvas.height = H * ratio;
    canvas.style.height = H + 'px';
    var ctx = canvas.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, W, H);

    var padL = 46, padR = 14, padT = 12, padB = 24;
    var plotW = W - padL - padR, plotH = H - padT - padB;

    // dải giá trị
    var min = o.min, max = o.max;
    if (min == null || max == null) {
      var all = [];
      series.forEach(function (s) { (s.data || []).forEach(function (v) { if (v != null) all.push(v); }); });
      if (!all.length) all = [0, 1];
      min = Math.min.apply(null, all); max = Math.max.apply(null, all);
      var pad = (max - min) * 0.15 || 1; min -= pad; max += pad;
    }
    var rng = (max - min) || 1;
    var muted = cssvar('--muted-2'), grid = cssvar('--line'), ink = cssvar('--muted');
    function X(i, n) { return padL + plotW * (n <= 1 ? 0 : i / (n - 1)); }
    function Y(v) { return padT + plotH * (1 - (v - min) / rng); }

    // lưới ngang + nhãn trục
    ctx.font = '10px system-ui'; ctx.textBaseline = 'middle';
    ctx.strokeStyle = grid; ctx.fillStyle = ink; ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var val = min + rng * g / 4, y = Y(val);
      ctx.globalAlpha = g === 0 ? 0.9 : 0.5;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
      ctx.globalAlpha = 1; ctx.textAlign = 'right';
      ctx.fillText(F.fmt(val, o.dp == null ? 0 : o.dp), padL - 8, y);
    }
    // nhãn thời gian
    ctx.textAlign = 'center';
    var labels = o.xlabels || ['−30′', '−20′', '−10′', 'now'];
    labels.forEach(function (lb, i) { ctx.fillText(lb, padL + plotW * i / (labels.length - 1), H - padB + 12); });

    // đường
    series.forEach(function (s) {
      var d = s.data || []; if (d.length < 2) return;
      ctx.strokeStyle = cssvar(s.color || '--series-1'); ctx.lineWidth = s.width || 2;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (s.dash) ctx.setLineDash([5, 4]); else ctx.setLineDash([]);
      if (s.fill) {
        ctx.beginPath();
        d.forEach(function (v, i) { var x = X(i, d.length), y = Y(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        ctx.lineTo(X(d.length - 1, d.length), padT + plotH); ctx.lineTo(X(0, d.length), padT + plotH); ctx.closePath();
        ctx.globalAlpha = 0.08; ctx.fillStyle = cssvar(s.color || '--series-1'); ctx.fill(); ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      d.forEach(function (v, i) { var x = X(i, d.length), y = Y(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke();
      // điểm cuối
      var lx = X(d.length - 1, d.length), ly = Y(d[d.length - 1]);
      ctx.setLineDash([]); ctx.fillStyle = cssvar(s.color || '--series-1');
      ctx.beginPath(); ctx.arc(lx, ly, 3, 0, 7); ctx.fill();
    });
    ctx.setLineDash([]);

    // ngưỡng (nếu có)
    if (o.limit != null) {
      ctx.strokeStyle = cssvar('--alarm'); ctx.setLineDash([6, 4]); ctx.lineWidth = 1.2; ctx.globalAlpha = .7;
      var yl = Y(o.limit); ctx.beginPath(); ctx.moveTo(padL, yl); ctx.lineTo(W - padR, yl); ctx.stroke();
      ctx.globalAlpha = 1; ctx.setLineDash([]);
    }
  }

  /* ---------------- Alarm rows (dùng chung) ---------------- */
  function alarmRows(list, opts) {
    opts = opts || {};
    if (!list || !list.length) return '<div class="empty">' + icon('check') + '<br>Không có cảnh báo</div>';
    var sevTxt = { high: 'CAO', medium: 'TB', low: 'THẤP' };
    return list.map(function (a) {
      var stCls = a.state === 'active' ? 'state-active' : a.state === 'ack' ? 'state-ack' : 'state-cleared';
      var stTxt = a.state === 'active' ? 'CHỜ ACK' : a.state === 'ack' ? 'ĐÃ ACK' : 'ĐÃ XÓA';
      return '<div class="alarm-item alarm-item--' + a.sev + '"><div class="alarm-item__body">' +
        '<div class="alarm-item__top"><span class="alarm-item__time">' + F.clockTime(a.ts) + '</span>' +
        '<span class="alarm-item__sev sev-' + a.sev + '">' + sevTxt[a.sev] + '</span>' +
        '<span class="alarm-item__state ' + stCls + '">' + stTxt + '</span></div>' +
        '<div class="alarm-item__tag">' + a.uid + ' · ' + a.isa + '</div>' +
        '<div class="alarm-item__msg">' + a.msg + '</div></div>' +
        (a.state === 'active' ? '<button class="btn btn--ghost" data-ack="' + a.id + '" title="Xác nhận" style="align-self:center;height:26px;padding:0 10px">Ack</button>' : '') +
        '</div>';
    }).join('');
  }

  /* ---------------- Unit selector ---------------- */
  function unitTabs() {
    return '<div class="unit-tabs">' + S.UNITS.map(function (u) {
      var act = u.id === S.activeUnit;
      var mw = F.fmt(S.val('mw', u.id), 0);
      var dotc = u.online ? 'var(--ok)' : 'var(--muted-2)';
      return '<button class="unit-tab' + (act ? ' is-active' : '') + '" data-unit="' + u.id + '">' +
        '<span class="d" style="background:' + dotc + '"></span>' + u.name +
        ' <span class="dim num" style="font-weight:600">· ' + mw + ' MW</span></button>';
    }).join('') + '</div>';
  }

  function legend(items) {
    return '<div class="trend__legend">' + items.map(function (it) {
      return '<span class="lg"><span class="sw ' + (it.dash ? 'dash' : '') + '" style="' + (it.dash ? 'color:' + it.color : 'background:' + it.color) + '"></span>' + it.label + '</span>';
    }).join('') + '</div>';
  }

  /* ---------------- Trạng thái chấm nhỏ (cho .k) ---------------- */
  // thêm style runtime cho dot-st (dùng chung)
  var stStyle = document.createElement('style');
  stStyle.textContent = '.dot-st{width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:5px;vertical-align:middle}.dot-st.ok{background:var(--ok)}.dot-st.warn{background:var(--warn)}.dot-st.alarm{background:var(--alarm)}';
  document.head.appendChild(stStyle);

  global.C = {
    icon: icon, badge: badge, tagBadge: tagBadge, valHTML: valHTML,
    kpi: kpi, metric: metric, cell: cell, band: band, bandMini: bandMini, bandBox: bandBox,
    gauge: gauge, gaugeBox: gaugeBox, spark: spark, trend: trend, legend: legend,
    live: live, dl: dl, refresh: refresh, unitTabs: unitTabs, alarmRows: alarmRows, ST: ST
  };
})(window);
