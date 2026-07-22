/* =====================================================================
   THERMOSCADA — Formatting helpers
   ===================================================================== */
(function (global) {
  'use strict';

  function fmt(v, dp) {
    if (v === null || v === undefined || Number.isNaN(v)) return '—';
    dp = dp == null ? 1 : dp;
    return Number(v).toLocaleString('vi-VN', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }
  function fmt0(v) { return fmt(v, 0); }
  function sign(v, dp) {
    if (v === null || v === undefined || Number.isNaN(v)) return '—';
    var s = fmt(Math.abs(v), dp == null ? 1 : dp);
    return (v > 0 ? '+' : v < 0 ? '−' : '') + s;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function clockTime(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function hm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  var DOW = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  function longDate(d) {
    return DOW[d.getDay()] + ' ' + pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  // dao động ngẫu nhiên có xu hướng quay về giá trị nền
  function drift(cur, base, amp, spring) {
    var noise = (Math.random() - 0.5) * amp;
    return cur + (base - cur) * (spring == null ? 0.05 : spring) + noise;
  }
  function pct(v, lo, hi) { return clamp((v - lo) / (hi - lo), 0, 1); }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  global.F = {
    fmt: fmt, fmt0: fmt0, sign: sign, pad: pad,
    clockTime: clockTime, hm: hm, longDate: longDate,
    clamp: clamp, lerp: lerp, drift: drift, pct: pct, escapeHtml: escapeHtml
  };
})(window);
