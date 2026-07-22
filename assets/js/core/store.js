/* =====================================================================
   THERMOSCADA — Store
   Mô hình nhà máy (2 tổ máy) + "tag database" (metadata) + pub/sub.
   Toàn bộ dữ liệu là MÔ PHỎNG, chạy trên trình duyệt — không kết nối thật.
   ===================================================================== */
(function (global) {
  'use strict';

  /* ---- Thông tin nhà máy (demo) ---- */
  var PLANT = {
    name: 'ThermoSCADA · NMNĐ Than',
    site: 'Hải Phòng',
    config: '2 × 330 MW',
    proto: 'Ethernet · IEC 60870-5-104',
    scan: 1000
  };

  /* ---- Cấu hình tổ máy ---- */
  var UNITS = [
    { id: 'S1', name: 'Tổ máy S1', pmax: 330, online: true },
    { id: 'S2', name: 'Tổ máy S2', pmax: 330, online: true }
  ];

  /* ---- SPEC: metadata cho từng biến (dùng chung mọi tổ máy) ----
     d: mô tả · u: đơn vị · isa: mã ISA · dp: số lẻ ·
     lo/hi: dải hiển thị (gauge/meter) · wl/wh: ngưỡng cảnh báo · al/ah: ngưỡng alarm
     (đặt -Infinity / Infinity cho phía không dùng)                          */
  var N = Infinity;
  var SPEC = {
    /* ---- Lò hơi & Đốt ---- */
    msP:   { d: 'Áp suất hơi chính',        u: 'bar',   isa: 'PT-101', dp: 1, lo: 140, hi: 185, wl: 160, wh: 172, al: 152, ah: 178 },
    msT:   { d: 'Nhiệt độ hơi chính',       u: '°C',    isa: 'TT-102', dp: 0, lo: 480, hi: 580, wl: 528, wh: 552, al: 515, ah: 565 },
    msF:   { d: 'Lưu lượng hơi chính',      u: 't/h',   isa: 'FT-103', dp: 0, lo: 0,   hi: 1050, wl: -N, wh: 1020, al: -N, ah: 1040 },
    rhT:   { d: 'Nhiệt độ hơi tái nhiệt',   u: '°C',    isa: 'TT-104', dp: 0, lo: 480, hi: 580, wl: 528, wh: 552, al: 515, ah: 565 },
    drumL: { d: 'Mức nước bao hơi',         u: 'mm',    isa: 'LT-105', dp: 0, lo: -200, hi: 200, wl: -50, wh: 50, al: -120, ah: 120 },
    drumP: { d: 'Áp suất bao hơi',          u: 'bar',   isa: 'PT-106', dp: 1, lo: 150, hi: 195, wl: 168, wh: 184, al: 160, ah: 190 },
    furnP: { d: 'Áp suất buồng lửa',        u: 'mbar',  isa: 'PT-107', dp: 2, lo: -6,  hi: 6,   wl: -3, wh: 2, al: -5, ah: 4 },
    o2:    { d: 'Ôxy khói (O₂)',            u: '%',     isa: 'AT-108', dp: 1, lo: 0,   hi: 8,   wl: 2.5, wh: 5.0, al: 1.8, ah: 6.0 },
    coalF: { d: 'Lưu lượng than',           u: 't/h',   isa: 'WT-109', dp: 1, lo: 0,   hi: 175, wl: -N, wh: 170, al: -N, ah: 175 },
    feedF: { d: 'Lưu lượng nước cấp',       u: 't/h',   isa: 'FT-110', dp: 0, lo: 0,   hi: 1050, wl: -N, wh: 1030, al: -N, ah: 1045 },
    fgT:   { d: 'Nhiệt độ khói thải',       u: '°C',    isa: 'TT-111', dp: 0, lo: 90,  hi: 170, wl: -N, wh: 150, al: -N, ah: 160 },
    saT:   { d: 'Nhiệt độ gió cấp',         u: '°C',    isa: 'TT-112', dp: 0, lo: 250, hi: 360, wl: 270, wh: 345, al: 255, ah: 355 },

    /* ---- Tua-bin & Máy phát ---- */
    spd:   { d: 'Tốc độ tua-bin',           u: 'rpm',   isa: 'ST-201', dp: 0, lo: 2900, hi: 3100, wl: 2985, wh: 3015, al: 2955, ah: 3045 },
    mw:    { d: 'Công suất tác dụng',       u: 'MW',    isa: 'JT-202', dp: 1, lo: 0,   hi: 345, wl: -N, wh: 335, al: -N, ah: 345 },
    mvar:  { d: 'Công suất phản kháng',     u: 'MVAr',  isa: 'JT-203', dp: 1, lo: -50, hi: 180, wl: -N, wh: 160, al: -N, ah: 175 },
    vac:   { d: 'Chân không bình ngưng',    u: 'kPa(a)',isa: 'PT-204', dp: 1, lo: 3,   hi: 20,  wl: -N, wh: 12, al: -N, ah: 16 },
    gvP:   { d: 'Vị trí van điều tốc',      u: '%',     isa: 'ZT-205', dp: 1, lo: 0,   hi: 100, wl: -N, wh: 98, al: -N, ah: 100 },
    brgT:  { d: 'Nhiệt độ gối trục #3',     u: '°C',    isa: 'TT-206', dp: 1, lo: 40,  hi: 120, wl: -N, wh: 95, al: -N, ah: 105 },
    thrT:  { d: 'Nhiệt độ gối chặn',        u: '°C',    isa: 'TT-207', dp: 1, lo: 40,  hi: 120, wl: -N, wh: 90, al: -N, ah: 100 },
    vib:   { d: 'Độ rung gối #3',           u: 'µm',    isa: 'VT-208', dp: 0, lo: 0,   hi: 150, wl: -N, wh: 80, al: -N, ah: 125 },
    expD:  { d: 'Giãn nở chênh lệch',       u: 'mm',    isa: 'GT-209', dp: 2, lo: -2,  hi: 6,   wl: -1, wh: 4.5, al: -1.5, ah: 5.2 },
    ecc:   { d: 'Độ lệch tâm trục',         u: 'µm',    isa: 'GT-210', dp: 0, lo: 0,   hi: 120, wl: -N, wh: 76, al: -N, ah: 100 },
    stExh: { d: 'Nhiệt độ hơi thoát',       u: '°C',    isa: 'TT-211', dp: 0, lo: 30,  hi: 90,  wl: -N, wh: 65, al: -N, ah: 80 },

    /* ---- Điện · Máy phát · Trạm ---- */
    genU:  { d: 'Điện áp đầu cực',          u: 'kV',    isa: 'UT-301', dp: 2, lo: 18,  hi: 22,  wl: 19.4, wh: 20.6, al: 19.0, ah: 21.0 },
    freq:  { d: 'Tần số',                   u: 'Hz',    isa: 'FQ-302', dp: 2, lo: 49,  hi: 51,  wl: 49.8, wh: 50.2, al: 49.5, ah: 50.5 },
    pf:    { d: 'Hệ số công suất',          u: '',      isa: 'PF-303', dp: 3, lo: 0.8, hi: 1,   wl: 0.85, wh: 1, al: 0.80, ah: 1 },
    statT: { d: 'Nhiệt độ cuộn stato',      u: '°C',    isa: 'TT-304', dp: 0, lo: 40,  hi: 130, wl: -N, wh: 105, al: -N, ah: 120 },
    rotT:  { d: 'Nhiệt độ rôto (kích từ)',  u: '°C',    isa: 'TT-305', dp: 0, lo: 40,  hi: 130, wl: -N, wh: 110, al: -N, ah: 125 },
    exI:   { d: 'Dòng kích từ',             u: 'A',     isa: 'IT-306', dp: 0, lo: 0,   hi: 3200,wl: -N, wh: 3000, al: -N, ah: 3150 },
    hvU:   { d: 'Điện áp thanh cái 220kV',  u: 'kV',    isa: 'UT-307', dp: 1, lo: 205, hi: 245, wl: 210, wh: 238, al: 200, ah: 245 },

    /* ---- Nước cấp · Ngưng tụ · Khử khí ---- */
    condL: { d: 'Mức nước bình ngưng',      u: 'mm',    isa: 'LT-401', dp: 0, lo: -200, hi: 200, wl: -80, wh: 80, al: -140, ah: 140 },
    deaP:  { d: 'Áp suất khử khí',          u: 'bar',   isa: 'PT-402', dp: 2, lo: 4,   hi: 12,  wl: 6.5, wh: 9.5, al: 5.5, ah: 10.5 },
    deaT:  { d: 'Nhiệt độ khử khí',         u: '°C',    isa: 'TT-403', dp: 0, lo: 140, hi: 200, wl: 158, wh: 182, al: 150, ah: 190 },
    deaL:  { d: 'Mức bình khử khí',         u: 'mm',    isa: 'LT-404', dp: 0, lo: -300, hi: 300, wl: -120, wh: 120, al: -200, ah: 200 },
    bfpP:  { d: 'Áp đẩy bơm nước cấp',      u: 'bar',   isa: 'PT-405', dp: 1, lo: 150, hi: 220, wl: 175, wh: 208, al: 165, ah: 215 },
    bfpF:  { d: 'Lưu lượng bơm cấp',        u: 't/h',   isa: 'FT-406', dp: 0, lo: 0,   hi: 1100, wl: -N, wh: 1060, al: -N, ah: 1080 },
    hwT:   { d: 'Nhiệt độ nước ngưng',      u: '°C',    isa: 'TT-407', dp: 0, lo: 20,  hi: 60,  wl: -N, wh: 48, al: -N, ah: 55 },
    fwhT:  { d: 'Nhiệt độ nước cấp ra',     u: '°C',    isa: 'TT-408', dp: 0, lo: 200, hi: 290, wl: 240, wh: 278, al: 230, ah: 285 },

    /* ---- Nước làm mát · Tháp giải nhiệt ---- */
    cwInT: { d: 'Nhiệt độ nước làm mát vào',u: '°C',    isa: 'TT-501', dp: 1, lo: 20,  hi: 40,  wl: -N, wh: 34, al: -N, ah: 38 },
    cwOutT:{ d: 'Nhiệt độ nước làm mát ra', u: '°C',    isa: 'TT-502', dp: 1, lo: 25,  hi: 52,  wl: -N, wh: 45, al: -N, ah: 48 },
    cwF:   { d: 'Lưu lượng nước tuần hoàn', u: 'm³/h',  isa: 'FT-503', dp: 0, lo: 0,   hi: 42000, wl: 30000, wh: N, al: 26000, ah: N },
    ctBasT:{ d: 'Nhiệt độ bể tháp',         u: '°C',    isa: 'TT-504', dp: 1, lo: 20,  hi: 45,  wl: -N, wh: 38, al: -N, ah: 42 },
    ctApp: { d: 'Approach tháp giải nhiệt', u: '°C',    isa: 'TT-505', dp: 1, lo: 2,   hi: 12,  wl: -N, wh: 9, al: -N, ah: 11 },
    cwP:   { d: 'Áp đẩy bơm tuần hoàn',     u: 'bar',   isa: 'PT-506', dp: 2, lo: 1,   hi: 4,   wl: 1.8, wh: 3.2, al: 1.5, ah: 3.6 },

    /* ---- Cấp nhiên liệu (than) ---- */
    bunkL: { d: 'Mức than bunker',          u: '%',     isa: 'LT-601', dp: 0, lo: 0,   hi: 100, wl: 20, wh: N, al: 10, ah: N },
    feedR: { d: 'Tốc độ máy cấp than',      u: 't/h',   isa: 'WT-602', dp: 1, lo: 0,   hi: 45,  wl: -N, wh: 42, al: -N, ah: 45 },
    millT: { d: 'Nhiệt độ ra máy nghiền',   u: '°C',    isa: 'TT-603', dp: 0, lo: 40,  hi: 110, wl: 65, wh: 95, al: 55, ah: 105 },
    millI: { d: 'Dòng động cơ máy nghiền',  u: 'A',     isa: 'IT-604', dp: 0, lo: 0,   hi: 120, wl: -N, wh: 105, al: -N, ah: 115 },
    millDP:{ d: 'Chênh áp máy nghiền',      u: 'mbar',  isa: 'PT-605', dp: 0, lo: 0,   hi: 80,  wl: -N, wh: 62, al: -N, ah: 72 },
    beltL: { d: 'Tải băng tải than',        u: 't/h',   isa: 'WT-606', dp: 0, lo: 0,   hi: 800, wl: -N, wh: 720, al: -N, ah: 780 },

    /* ---- Khí thải · Quan trắc (CEMS) ---- */
    so2:   { d: 'SO₂ (quy 6% O₂)',          u: 'mg/Nm³',isa: 'AT-701', dp: 0, lo: 0,   hi: 600, wl: -N, wh: 300, al: -N, ah: 350 },
    nox:   { d: 'NOx (quy 6% O₂)',          u: 'mg/Nm³',isa: 'AT-702', dp: 0, lo: 0,   hi: 800, wl: -N, wh: 500, al: -N, ah: 650 },
    dust:  { d: 'Bụi tổng (PM)',            u: 'mg/Nm³',isa: 'AT-703', dp: 1, lo: 0,   hi: 100, wl: -N, wh: 30, al: -N, ah: 50 },
    co:    { d: 'CO',                       u: 'mg/Nm³',isa: 'AT-704', dp: 0, lo: 0,   hi: 300, wl: -N, wh: 150, al: -N, ah: 200 },
    opac:  { d: 'Độ mờ khói (opacity)',     u: '%',     isa: 'AT-705', dp: 1, lo: 0,   hi: 40,  wl: -N, wh: 15, al: -N, ah: 20 },
    stkT:  { d: 'Nhiệt độ ống khói',        u: '°C',    isa: 'TT-706', dp: 0, lo: 80,  hi: 160, wl: -N, wh: 140, al: -N, ah: 150 },
    fgdEff:{ d: 'Hiệu suất khử SO₂ (FGD)',  u: '%',     isa: 'QT-707', dp: 1, lo: 80,  hi: 100, wl: 90, wh: N, al: 85, ah: N },
    espI:  { d: 'Dòng trường lọc bụi ESP',  u: 'mA',    isa: 'IT-708', dp: 0, lo: 0,   hi: 1200, wl: 400, wh: N, al: 250, ah: N }
  };

  /* ---- Trạng thái từ giá trị theo ngưỡng ---- */
  function statusOf(name, v) {
    var s = SPEC[name];
    if (!s || v == null || Number.isNaN(v)) return 'ok';
    if (v <= s.al || v >= s.ah) return 'alarm';
    if (v <= s.wl || v >= s.wh) return 'warn';
    return 'ok';
  }

  /* ---------------- Store ---------------- */
  var subs = [];
  var Store = {
    PLANT: PLANT,
    UNITS: UNITS,
    SPEC: SPEC,
    activeUnit: 'S1',
    tickCount: 0,
    startedAt: new Date(),
    now: new Date(),

    // state.u[uid] = { field: value } — engine điền
    u: {},
    plant: {},           // giá trị cấp nhà máy (lưới, thời tiết, tổng hợp)
    alarms: [],          // alarm đang hoạt động / lịch sử gần nhất
    events: [],          // nhật ký sự kiện
    history: {},         // ring buffer cho trend: history[uid][field] = [..]

    spec: function (name) { return SPEC[name]; },
    val: function (name, uid) { var o = this.u[uid || this.activeUnit]; return o ? o[name] : null; },
    stat: function (name, uid) { return statusOf(name, this.val(name, uid)); },
    unit: function (uid) { return UNITS.filter(function (x) { return x.id === (uid || Store.activeUnit); })[0]; },
    active: function () { return this.u[this.activeUnit]; },

    setUnit: function (uid) { if (this.activeUnit !== uid) { this.activeUnit = uid; this.emit(); } },

    // đếm alarm chưa ack cho badge sidebar
    unacked: function () { return this.alarms.filter(function (a) { return a.state === 'active'; }).length; },

    subscribe: function (fn) { subs.push(fn); return function () { subs = subs.filter(function (f) { return f !== fn; }); }; },
    emit: function () { for (var i = 0; i < subs.length; i++) { try { subs[i](); } catch (e) { console.error(e); } } }
  };

  Store.statusOf = statusOf;
  global.Store = Store;
})(window);
