/* =====================================================================
   THERMOSCADA — Engine (mô phỏng)
   Sinh dữ liệu "sống" cho HMI: một biến điều khiển "tải" cho mỗi tổ máy,
   các đại lượng còn lại suy ra theo quan hệ vật lý gần đúng + nhiễu nhỏ.
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, F = global.F;
  var HKEYS = ['mw', 'msP', 'msT', 'coalF', 'o2', 'brgT', 'vib', 'so2', 'nox', 'dust',
    'deaP', 'cwOutT', 'freq', 'furnP', 'drumL', 'genU', 'feedF', 'fgT'];
  var HMAX = 180;

  function set(u, f, target, amp, spring) { u[f] = F.drift(u[f] == null ? target : u[f], target, amp || 0, spring); }

  /* ---- Suy ra toàn bộ đại lượng từ tải (lf = load fraction) ---- */
  function derive(u, unit) {
    var lf = u.load / unit.pmax;                 // 0..1
    var k = u._k;                                // đặc tính riêng của tổ máy

    // Lò hơi
    set(u, 'msP', 168 - (1 - lf) * 7 + k * 0.6, 0.25);
    set(u, 'msT', 540 + (lf - 0.9) * 8 + k * 1.2, 0.7);
    set(u, 'msF', 1010 * lf, 4);
    set(u, 'rhT', 539 + (lf - 0.9) * 7 + k, 0.7);
    set(u, 'drumL', k * 4, 6, 0.15);
    set(u, 'drumP', 178 - (1 - lf) * 6, 0.3);
    set(u, 'furnP', -0.25 + k * 0.1, 0.35, 0.2);
    set(u, 'o2', 3.2 + (1 - lf) * 1.7, 0.12);
    set(u, 'coalF', 165 * lf + k * 1.5, 0.8);
    set(u, 'feedF', 1005 * lf, 4);
    set(u, 'fgT', 126 + lf * 14 + u._millBias * 0.4, 0.8);
    set(u, 'saT', 300 + lf * 40, 1.2);

    // Tua-bin & máy phát
    set(u, 'spd', 3000, 1.6, 0.3);
    set(u, 'mw', u.load, 0.4, 0.3);
    set(u, 'mvar', 60 + lf * 55 + k * 6, 1.5);
    set(u, 'vac', 6.2 + lf * 1.6, 0.12);
    set(u, 'gvP', 42 + lf * 54, 0.8);
    set(u, 'brgT', 70 + lf * 15 + u._vibBias * 3, 0.25);
    set(u, 'thrT', 66 + lf * 14, 0.25);
    set(u, 'vib', 36 + lf * 10 + u._vibBias * 22, 1.2);
    set(u, 'expD', 2.4 + lf * 1.4, 0.06);
    set(u, 'ecc', 44 + lf * 12, 1.0);
    set(u, 'stExh', 38 + lf * 16, 0.6);

    // Điện
    set(u, 'genU', 20.0 + k * 0.05, 0.05);
    set(u, 'freq', S.plant.freq, 0.0, 1);
    set(u, 'pf', 0.90 + lf * 0.04, 0.004);
    set(u, 'statT', 76 + lf * 22, 0.35);
    set(u, 'rotT', 82 + lf * 24, 0.4);
    set(u, 'exI', 1800 + lf * 900 + k * 40, 8);
    set(u, 'hvU', S.plant.hvU, 0.0, 1);

    // Nước cấp · ngưng tụ · khử khí
    set(u, 'condL', k * 6, 5, 0.15);
    set(u, 'deaP', 6.4 + lf * 2.4, 0.06);
    set(u, 'deaT', 158 + lf * 18, 0.5);
    set(u, 'deaL', k * 12, 10, 0.15);
    set(u, 'bfpP', 178 + lf * 26, 0.5);
    set(u, 'bfpF', 1015 * lf, 4);
    set(u, 'hwT', 32 + lf * 9, 0.3);
    set(u, 'fwhT', 242 + lf * 32, 0.6);

    // Nước làm mát
    var amb = S.plant.ambientT;
    set(u, 'cwInT', amb + 0.6, 0.2);
    set(u, 'cwOutT', amb + 7.5 + lf * 3.5, 0.25);
    set(u, 'cwF', 38000 * (unit.online ? 1 : 0) + k * 300, 120);
    set(u, 'ctBasT', amb + 0.4, 0.2);
    set(u, 'ctApp', 3.8 + lf * 2.2, 0.15);
    set(u, 'cwP', 2.4 + lf * 0.4, 0.05);

    // Nhiên liệu (than)
    set(u, 'bunkL', u._bunk, 0.3);
    u._bunk = F.clamp(u._bunk - lf * 0.02 + (u._bunk < 45 ? 0.6 : 0), 15, 95); // tiêu hao & nạp lại
    set(u, 'feedR', 41 * lf, 0.4);
    set(u, 'millT', 74 + lf * 10 + u._millBias, 0.6);
    set(u, 'millI', 62 + lf * 40, 1.2);
    set(u, 'millDP', 34 + lf * 24, 1.0);
    set(u, 'beltL', 620 * lf, 6);

    // Khí thải (CEMS)
    var fgd = 96 - (1 - lf) * 2;
    set(u, 'fgdEff', fgd, 0.15);
    set(u, 'so2', (900 + lf * 300) * (1 - fgd / 100) + 40, 4);
    set(u, 'nox', 360 + lf * 90 + (1 - lf) * 30, 6);
    set(u, 'dust', 14 + lf * 6 + u._millBias * 0.3, 0.7);
    set(u, 'co', 60 + (1 - lf) * 70, 4);
    set(u, 'opac', 8 + lf * 3, 0.4);
    set(u, 'stkT', 118 + lf * 16, 0.7);
    set(u, 'espI', 620 + lf * 240, 8);
  }

  function pushHist(uid, f, v) {
    var h = S.history[uid] || (S.history[uid] = {});
    var a = h[f] || (h[f] = []);
    a.push(v);
    if (a.length > HMAX) a.shift();
  }

  /* ---- Cảnh báo: quét vi phạm ngưỡng + alarm rời rạc đã seed ---- */
  var ackedIds = {};
  function computeAlarms() {
    var list = [];
    S.UNITS.forEach(function (unit) {
      var u = S.u[unit.id];
      if (!u) return;
      Object.keys(S.SPEC).forEach(function (name) {
        var st = S.statusOf(name, u[name]);
        if (st === 'ok') return;
        var sp = S.SPEC[name];
        var id = unit.id + '.' + name;
        var high = st === 'alarm';
        var hi = u[name] >= (sp.wh);
        list.push({
          id: id, uid: unit.id, tag: sp.isa, isa: sp.isa,
          msg: sp.d + (hi ? ' cao' : ' thấp') + ' · ' + F.fmt(u[name], sp.dp) + ' ' + sp.u,
          sev: high ? 'high' : 'medium',
          ts: u._alarmTs[id] || (u._alarmTs[id] = new Date(S.now)),
          state: ackedIds[id] ? 'ack' : 'active'
        });
      });
      // dọn timestamp của alarm đã hết
      Object.keys(u._alarmTs).forEach(function (id) {
        if (!list.some(function (a) { return a.id === id; })) delete u._alarmTs[id];
      });
    });
    // alarm rời rạc (thiết bị) đã seed
    S._discrete.forEach(function (d) { list.push(d); });
    // sắp xếp: active trước, rồi theo mức, rồi thời gian
    list.sort(function (a, b) {
      var sv = { high: 0, medium: 1, low: 2 };
      if ((a.state === 'active') !== (b.state === 'active')) return a.state === 'active' ? -1 : 1;
      if (sv[a.sev] !== sv[b.sev]) return sv[a.sev] - sv[b.sev];
      return b.ts - a.ts;
    });
    S.alarms = list;
  }

  S.ackAlarm = function (id) { ackedIds[id] = true; var d = S._discrete.filter(function (x) { return x.id === id; })[0]; if (d) d.state = 'ack'; computeAlarms(); S.emit(); };
  S.ackAll = function () { S.alarms.forEach(function (a) { ackedIds[a.id] = true; if (a.id.indexOf('DEV') === 0) a.state = 'ack'; }); computeAlarms(); S.emit(); };

  /* ---- Khởi tạo ---- */
  function init() {
    S.plant = { freq: 50.0, hvU: 231.5, ambientT: 31.0, ambRH: 78, totalMW: 0, avail: 99.4, netMW: 0, auxPct: 6.8, coalDay: 0 };
    S.history = {};
    S.devices = [
      { id: 'RTU-BOILER-1', ip: '10.20.11.11', role: 'Lò hơi S1', ms: 11, st: 'ok' },
      { id: 'RTU-TURB-1',   ip: '10.20.11.12', role: 'Tua-bin S1', ms: 13, st: 'ok' },
      { id: 'RTU-ELEC-1',   ip: '10.20.11.13', role: 'Điện · Trạm', ms: 9, st: 'ok' },
      { id: 'RTU-BOP-1',    ip: '10.20.11.14', role: 'BOP · Nước làm mát', ms: 16, st: 'ok' },
      { id: 'CEMS-STACK-1', ip: '10.20.11.21', role: 'Quan trắc khí thải', ms: 22, st: 'ok' },
      { id: 'RTU-COAL-1',   ip: '10.20.11.31', role: 'Cấp nhiên liệu', ms: 0, st: 'off' }
    ];
    S._discrete = [
      { id: 'DEV-CWP-B', uid: 'S1', tag: 'CWP-1B', isa: 'CWP-1B', msg: 'Bơm tuần hoàn 1B (dự phòng) offline · leg dự phòng', sev: 'medium', ts: new Date(S.now - 41 * 60000), state: 'ack' },
      { id: 'DEV-SOOT', uid: 'S2', tag: 'SB-204', isa: 'SB-204', msg: 'Máy thổi bụi SB-204 gặp lỗi vị trí · cần kiểm tra', sev: 'low', ts: new Date(S.now - 12 * 60000), state: 'active' }
    ];

    S.UNITS.forEach(function (unit, i) {
      var u = {
        load: unit.pmax * (i === 0 ? 0.91 : 0.86),
        _k: i === 0 ? 0.3 : -0.4,
        _bunk: i === 0 ? 62 : 71,
        _millBias: i === 0 ? 14 : 0,   // S1: máy nghiền A nóng dần → kịch bản drift/cảnh báo
        _vibBias: i === 0 ? 0.15 : 0.05,
        _loadSP: unit.pmax * (i === 0 ? 0.91 : 0.86),
        _alarmTs: {}
      };
      // mồi 1 lần để mọi field có giá trị
      derive(u, unit); derive(u, unit); derive(u, unit);
      S.u[unit.id] = u;
    });

    seedHistory();
    computeAlarms();
  }

  // tạo lịch sử giả cho trend đỡ trống lúc mở màn
  function seedHistory() {
    var pts = 150;
    S.UNITS.forEach(function (unit) {
      var u = S.u[unit.id];
      for (var p = pts; p > 0; p--) {
        var t = 1 - p / pts;
        var wobble = Math.sin(t * 6 + (unit.id === 'S1' ? 0 : 2)) * 0.05 + (Math.random() - 0.5) * 0.02;
        var lf = F.clamp((unit.id === 'S1' ? 0.9 : 0.85) + wobble, 0.4, 1);
        var mw = lf * unit.pmax;
        pushHist(unit.id, 'mw', mw);
        pushHist(unit.id, 'msP', 168 - (1 - lf) * 7 + (Math.random() - .5) * .6);
        pushHist(unit.id, 'msT', 540 + (lf - .9) * 8 + (Math.random() - .5) * 2);
        pushHist(unit.id, 'coalF', 165 * lf + (Math.random() - .5) * 2);
        pushHist(unit.id, 'o2', 3.2 + (1 - lf) * 1.7 + (Math.random() - .5) * .2);
        pushHist(unit.id, 'brgT', 70 + lf * 15 + (Math.random() - .5) * .6);
        pushHist(unit.id, 'vib', 36 + lf * 10 + (Math.random() - .5) * 3);
        pushHist(unit.id, 'so2', (900 + lf * 300) * 0.04 + 40 + (Math.random() - .5) * 6);
        pushHist(unit.id, 'nox', 360 + lf * 90 + (Math.random() - .5) * 10);
        pushHist(unit.id, 'dust', 14 + lf * 6 + (Math.random() - .5) * 2);
        pushHist(unit.id, 'freq', 50 + (Math.random() - .5) * .04);
        pushHist(unit.id, 'furnP', -0.25 + (Math.random() - .5) * .3);
        pushHist(unit.id, 'drumL', (Math.random() - .5) * 12);
        pushHist(unit.id, 'genU', 20 + (Math.random() - .5) * .15);
        pushHist(unit.id, 'deaP', 6.4 + lf * 2.4 + (Math.random() - .5) * .1);
        pushHist(unit.id, 'cwOutT', 31 + 8.5 + lf * 4 + (Math.random() - .5) * .4);
        pushHist(unit.id, 'feedF', 1005 * lf + (Math.random() - .5) * 6);
        pushHist(unit.id, 'fgT', 126 + lf * 14 + (Math.random() - .5) * 2);
      }
    });
  }

  /* ---- Vòng lặp ---- */
  function step() {
    S.now = new Date();
    S.tickCount++;

    // lưới điện chung
    set(S.plant, 'freq', 50.0, 0.012, 0.1);
    set(S.plant, 'hvU', 231.5, 0.15, 0.1);
    set(S.plant, 'ambientT', 31.0, 0.05, 0.05);

    var total = 0;
    S.UNITS.forEach(function (unit) {
      var u = S.u[unit.id];
      // điều độ tải: thỉnh thoảng đổi setpoint
      if (S.tickCount % 25 === 0) u._loadSP = unit.pmax * F.clamp(0.82 + Math.random() * 0.14, 0.5, 1);
      u.load += (u._loadSP - u.load) * 0.03;

      // kịch bản drift: S1 máy nghiền A nóng dần → cảnh báo
      if (unit.id === 'S1') u._millBias = Math.min(24, u._millBias + 0.03);

      derive(u, unit);
      total += u.mw;
      HKEYS.forEach(function (f) { pushHist(unit.id, f, u[f]); });
    });

    // jitter ping thiết bị truyền thông
    if (S.devices) S.devices.forEach(function (d) { if (d.st !== 'off') d.ms = Math.max(6, Math.round(d.ms + (Math.random() - 0.5) * 4)); });

    S.plant.totalMW = total;
    S.plant.netMW = total * (1 - S.plant.auxPct / 100);
    S.plant.coalDay += (S.u.S1.coalF + S.u.S2.coalF) / 3600; // tấn cộng dồn (demo)
    set(S.plant, 'auxPct', 6.6 + (1 - total / 660) * 1.2, 0.03);

    if (S.tickCount % 3 === 0) computeAlarms();
    S.emit();
  }

  var timer = null;
  global.Engine = {
    init: init,
    start: function () { if (!timer) { step(); timer = setInterval(step, S.PLANT.scan); } },
    stop: function () { clearInterval(timer); timer = null; }
  };
})(window);
