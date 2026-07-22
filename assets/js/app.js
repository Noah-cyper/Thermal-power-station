/* =====================================================================
   THERMOSCADA — Bootstrap
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C, F = global.F, Router = global.Router, Engine = global.Engine, V = global.Views || {};

  /* ---- Cấu trúc điều hướng ---- */
  var NAV = [
    { label: 'Giám sát', items: [
      { id: 'overview',   name: 'Tổng quan nhà máy',   icon: 'factory' },
      { id: 'boiler',     name: 'Lò hơi & Đốt',        icon: 'flame' },
      { id: 'turbine',    name: 'Tua-bin & Máy phát',  icon: 'rotor' },
      { id: 'feedwater',  name: 'Nước cấp & Ngưng tụ', icon: 'drop' },
      { id: 'cooling',    name: 'Nước làm mát',        icon: 'tower' },
      { id: 'fuel',       name: 'Cấp nhiên liệu',      icon: 'coal' },
      { id: 'electrical', name: 'Điện & Trạm phân phối',icon: 'bolt' },
      { id: 'emissions',  name: 'Khí thải & CEMS',     icon: 'smoke' }
    ]},
    { label: 'Vận hành', items: [
      { id: 'alarms',  name: 'Cảnh báo & Sự kiện', icon: 'bell', badge: true },
      { id: 'trends',  name: 'Historian & Xu hướng', icon: 'activity' },
      { id: 'reports', name: 'Báo cáo', icon: 'report' }
    ]},
    { label: 'Cấu hình', items: [
      { id: 'config', name: 'Cấu hình hệ thống', icon: 'settings' }
    ]}
  ];

  /* ---- Sidebar nav ---- */
  function buildNav() {
    var nav = document.getElementById('nav');
    nav.innerHTML = NAV.map(function (g) {
      return '<div class="nav__group"><div class="nav__label">' + g.label + '</div>' +
        g.items.map(function (it) {
          return '<a class="nav__item" href="#/' + it.id + '" data-id="' + it.id + '">' +
            C.icon(it.icon) + '<span>' + it.name + '</span>' +
            (it.badge ? '<span class="nav__badge is-zero" data-alarm-badge>0</span>' : '') + '</a>';
        }).join('') + '</div>';
    }).join('');
  }

  /* ---- Topbar ---- */
  function buildTopbar() {
    var tb = document.getElementById('topbar');
    tb.innerHTML =
      '<div class="topbar__title"><h1 id="tb-title">Tổng quan</h1><p id="tb-sub">' + S.PLANT.name + '</p></div>' +
      '<div class="topbar__spacer"></div>' +
      '<div class="topbar__chips">' +
        '<span class="chip">' + C.icon('factory') + '<b>' + S.PLANT.site + '</b> · ' + S.PLANT.config + '</span>' +
        '<span class="chip">' + C.icon('device') + 'IEC-104 · <b>' + S.PLANT.scan + ' ms</b></span>' +
        '<span class="chip"><span class="dot" style="background:var(--ok)"></span><span class="pulse">Trực tuyến</span> · Mô phỏng</span>' +
        '<div class="clock"><span class="t" id="tb-clock">--:--:--</span><span class="d" id="tb-date">—</span></div>' +
        '<div class="user"><div class="user__av">TXH</div><div class="user__meta"><div class="n">Trần Xuân Hoan</div><div class="r">Kỹ sư vận hành</div></div></div>' +
      '</div>';
  }

  /* ---- Cập nhật topbar + badge theo tick ---- */
  function tickChrome() {
    var c = document.getElementById('tb-clock'); if (c) c.textContent = F.clockTime(S.now);
    var d = document.getElementById('tb-date'); if (d) d.textContent = F.longDate(S.now) + ' · UTC+7';
    var n = S.unacked();
    document.querySelectorAll('[data-alarm-badge]').forEach(function (b) {
      b.textContent = n; b.classList.toggle('is-zero', n === 0);
    });
  }

  /* ---- Khởi động ---- */
  function boot() {
    Engine.init();
    buildNav();
    buildTopbar();

    // đăng ký view
    Object.keys(V).forEach(function (id) { Router.register(id, V[id]); });

    Router.onChange(function (id, view) {
      document.querySelectorAll('.nav__item').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-id') === id); });
      var t = document.getElementById('tb-title'); if (t) t.textContent = view.title || '';
      var s = document.getElementById('tb-sub'); if (s) s.textContent = view.subtitle || S.PLANT.name;
      document.title = (view.title || 'ThermoSCADA') + ' · ThermoSCADA';
    });

    // Bắt sự kiện click chung cho mọi view (event delegation)
    document.getElementById('view').addEventListener('click', function (e) {
      var u = e.target.closest('[data-unit]');
      if (u) { S.setUnit(u.getAttribute('data-unit')); Router.go(Router.current()); return; }
      var n = e.target.closest('[data-nav]');
      if (n) { Router.go(n.getAttribute('data-nav')); return; }
      var aa = e.target.closest('[data-ackall]');
      if (aa) { S.ackAll(); return; }
      var a = e.target.closest('[data-ack]');
      if (a) { S.ackAlarm(a.getAttribute('data-ack')); return; }
    });

    S.subscribe(tickChrome);
    Router.start();
    Engine.start();
    tickChrome();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
