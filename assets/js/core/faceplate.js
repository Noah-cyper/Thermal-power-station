/* =====================================================================
   THERMOSCADA — Equipment Faceplate (drill-down popup, kiểu SCADA thật)
   Bấm một thiết bị trên sơ đồ P&ID (hoặc thẻ thiết bị) → mở faceplate:
   thông số trực tiếp của thiết bị + nút mở màn hình phân hệ đầy đủ.
   Cập nhật tại chỗ theo từng nhịp mô phỏng (data-live / data-gauge / data-meter).
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C;

  /* Bản đồ thiết bị: key → {code, name, icon, view, desc, tags[]}
     - view: màn hình phân hệ để "mở đầy đủ" (dùng chung Router)
     - tags: điểm đo của thiết bị; tags[0] hiển thị dạng gauge, còn lại dạng hàng */
  // kks = phần hệ thống của mã KKS (VGB-B106). Tiền tố tổ máy (1/2) thêm lúc chạy.
  // ⚠ Mã KKS ở đây là GIẢ ĐỊNH minh hoạ (xem docs/assumptions.md) — không phải KKS đã duyệt.
  var EQ = {
    bunker:    { code: 'CB-1A',   kks: 'HFB10', name: 'Bunker than',            icon: 'coal',  view: 'fuel',       desc: 'Kho than cấp cho máy nghiền',        tags: ['bunkL', 'beltL', 'feedR'] },
    mill:      { code: 'MILL-1A', kks: 'HFC10', name: 'Máy nghiền than',        icon: 'coal',  view: 'fuel',       desc: 'Nghiền than mịn cấp buồng lửa',      tags: ['millT', 'millI', 'millDP', 'coalF'] },
    boiler:    { code: 'BLR-1',   kks: 'HAD10', name: 'Lò hơi',                 icon: 'flame', view: 'boiler',     desc: 'Sinh hơi quá nhiệt cấp cho tua-bin', tags: ['msP', 'msT', 'drumL', 'o2', 'furnP', 'feedF'] },
    stack:     { code: 'STK-1',   kks: 'HNA10', name: 'Ống khói & CEMS',        icon: 'smoke', view: 'emissions',  desc: 'Thải khói · quan trắc phát thải',    tags: ['stkT', 'so2', 'nox', 'dust', 'opac'] },
    turbine:   { code: 'TG-1',    kks: 'MAA10', name: 'Tua-bin HP·IP·LP',       icon: 'rotor', view: 'turbine',    desc: 'Biến nhiệt năng hơi thành cơ năng',  tags: ['spd', 'mw', 'brgT', 'vib', 'expD', 'stExh'] },
    generator: { code: 'GEN-1',   kks: 'MKA10', name: 'Máy phát',               icon: 'gen',   view: 'electrical', desc: 'Máy phát đồng bộ 3 pha',             tags: ['mw', 'mvar', 'genU', 'pf', 'statT', 'exI'] },
    gsu:       { code: 'GSU-1',   kks: 'BAT10', name: 'Máy biến áp đầu cực',    icon: 'bolt',  view: 'electrical', desc: 'Nâng áp máy phát lên lưới 220kV',    tags: ['genU', 'hvU', 'freq'] },
    condenser: { code: 'COND-1',  kks: 'MAG10', name: 'Bình ngưng',             icon: 'drop',  view: 'feedwater',  desc: 'Ngưng hơi thoát · giữ chân không',   tags: ['vac', 'condL', 'hwT'] },
    cooltower: { code: 'CT-1',    kks: 'PAH10', name: 'Tháp giải nhiệt',        icon: 'tower', view: 'cooling',    desc: 'Thải nhiệt nước tuần hoàn ra không khí', tags: ['cwInT', 'cwOutT', 'ctApp', 'cwF'] },
    dea:       { code: 'DEA/BFP', kks: 'LAA10', name: 'Khử khí & Bơm nước cấp', icon: 'pump',  view: 'feedwater',  desc: 'Khử O₂ · bơm nước cấp vào lò',       tags: ['deaP', 'deaT', 'deaL', 'bfpP', 'bfpF'] }
  };

  var host = null, unsub = null;

  function ensureHost() {
    if (host) return host;
    host = document.createElement('div');
    host.className = 'fp-overlay';
    host.addEventListener('click', function (e) {
      if (e.target === host || e.target.closest('[data-fp-close]')) { close(); return; }
      var go = e.target.closest('[data-fp-go]');
      if (go) { var v = go.getAttribute('data-fp-go'); close(); if (global.Router) global.Router.go(v); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && host && host.classList.contains('is-open')) close();
    });
    document.body.appendChild(host);
    return host;
  }

  function worstOf(tags, uid) {
    var w = 'ok';
    tags.forEach(function (n) { var st = S.stat(n, uid); if (st === 'alarm') w = 'alarm'; else if (st === 'warn' && w !== 'alarm') w = 'warn'; });
    return w;
  }

  function render(key) {
    var eq = EQ[key]; if (!eq) return;
    var uid = S.activeUnit, unit = S.unit(uid);
    var head = eq.tags[0], rest = eq.tags.slice(1);
    var kks = (uid === 'S2' ? '2' : '1') + eq.kks;
    var h = '<div class="fp" role="dialog" aria-modal="true" aria-label="' + eq.code + ' — ' + eq.name + '">';
    h += '<div class="fp__head">';
    h += '<span class="fp__ic">' + C.icon(eq.icon, '', 1.7) + '</span>';
    h += '<div class="fp__ttl"><div class="fp__code">' + unit.id + ' · ' + eq.code + ' · KKS ' + kks + '</div><div class="fp__name">' + eq.name + '</div></div>';
    h += '<span class="fp__badge">' + C.badge(worstOf(eq.tags, uid)) + '</span>';
    h += '<button class="fp__x" data-fp-close aria-label="Đóng">' + C.icon('xcirc', '', 1.8) + '</button>';
    h += '</div>';
    h += '<div class="fp__desc">' + eq.desc + '</div>';
    h += '<div class="fp__body">';
    h += '<div class="fp__gauge">' + C.gaugeBox(head, uid, { size: 150 }) + '</div>';
    h += '<div class="fp__list">' + rest.map(function (n) { return C.metric(n, uid, { bar: false }); }).join('') + '</div>';
    h += '</div>';
    h += '<div class="fp__foot"><span class="fp__hint"><span class="dot pulse" style="background:var(--ok)"></span>Mô phỏng thời gian thực · ' + unit.name + ' · KKS minh hoạ</span>';
    h += '<button class="btn btn--primary" data-fp-go="' + eq.view + '">Mở màn hình đầy đủ →</button></div>';
    h += '</div>';
    ensureHost().innerHTML = h;
  }

  function open(key) {
    if (!EQ[key]) return;
    ensureHost();
    render(key);
    // Đồng bộ theme với sơ đồ: nếu P&ID đang HP-HMI thì faceplate cũng tối
    host.classList.toggle('fp-hp', !!document.querySelector('.pid--full.hmi-hp'));
    host.classList.add('is-open');
    document.body.classList.add('fp-lock');
    if (unsub) unsub();
    unsub = S.subscribe(function () { if (host && host.classList.contains('is-open')) C.refresh(host); });
  }

  function close() {
    if (!host || !host.classList.contains('is-open')) return;
    host.classList.remove('is-open');
    host.innerHTML = '';
    document.body.classList.remove('fp-lock');
    if (unsub) { unsub(); unsub = null; }
  }

  global.Faceplate = { open: open, close: close, EQ: EQ };
})(window);
