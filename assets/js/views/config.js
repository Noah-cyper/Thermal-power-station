/* =====================================================================
   VIEW · Cấu hình hệ thống (Assets / Devices / Users / Settings)
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C, F = global.F;
  var V = global.Views = global.Views || {};
  var tab = 'assets';

  var ASSETS = [
    { code: 'BLR-1/2', name: 'Lò hơi', type: 'Lò hơi bao hơi tự nhiên', tags: 24, area: 'Lò' },
    { code: 'TG-1/2', name: 'Tua-bin', type: 'Tua-bin ngưng hơi 3 thân', tags: 22, area: 'Máy' },
    { code: 'GEN-1/2', name: 'Máy phát', type: 'Máy phát đồng bộ 20 kV', tags: 14, area: 'Điện' },
    { code: 'GSU-1/2', name: 'MBA tăng áp', type: 'MBA 20/220 kV · 370 MVA', tags: 8, area: 'Trạm' },
    { code: 'COND-1/2', name: 'Bình ngưng', type: 'Bình ngưng bề mặt', tags: 10, area: 'Máy' },
    { code: 'CT-1/2', name: 'Tháp giải nhiệt', type: 'Tháp giải nhiệt cưỡng bức', tags: 9, area: 'BOP' },
    { code: 'MILL-1A..E', name: 'Máy nghiền', type: 'Máy nghiền bi trung tốc', tags: 30, area: 'Nhiên liệu' },
    { code: 'FGD-1/2', name: 'Khử lưu huỳnh', type: 'FGD ướt đá vôi–thạch cao', tags: 12, area: 'Môi trường' },
    { code: 'ESP-1/2', name: 'Lọc bụi tĩnh điện', type: 'ESP 4 trường', tags: 11, area: 'Môi trường' }
  ];
  var USERS = [
    { name: 'Trần Xuân Hoan', acc: 'op.hoan', role: 'Kỹ sư vận hành', perm: 'Vận hành · Ack', st: 'ok' },
    { name: 'Nguyễn Văn Tuấn', acc: 'op.tuan', role: 'Trưởng kíp', perm: 'Vận hành · Điều độ', st: 'ok' },
    { name: 'Quản trị hệ thống', acc: 'admin', role: 'Quản trị', perm: 'Toàn quyền', st: 'ok' },
    { name: 'Phòng Kỹ thuật', acc: 'kt.view', role: 'Kỹ thuật', perm: 'Chỉ xem · Báo cáo', st: 'ok' },
    { name: 'Sở TN&MT (CEMS)', acc: 'env.gov', role: 'Cơ quan quản lý', perm: 'Chỉ xem khí thải', st: 'ext' }
  ];

  function tabs() {
    var items = [['assets', 'Tài sản', 'layers'], ['devices', 'Thiết bị I/O', 'device'], ['users', 'Người dùng', 'users'], ['settings', 'Cài đặt', 'settings']];
    return '<div class="unit-tabs" id="cf-tabs">' + items.map(function (it) {
      return '<button class="unit-tab' + (tab === it[0] ? ' is-active' : '') + '" data-tab="' + it[0] + '">' + C.icon(it[2], '', 1.7) + ' ' + it[1] + '</button>';
    }).join('') + '</div>';
  }

  function assetsTable() {
    return '<div class="card"><div class="card__head">' + C.icon('layers', 'ico') + '<h3>Danh mục tài sản</h3><div class="spacer"></div><span class="sub">' + ASSETS.length + ' nhóm thiết bị</span><button class="btn" style="margin-left:10px">' + C.icon('settings') + 'Thêm</button></div>' +
      '<div class="card__body tight"><table class="tbl"><thead><tr><th>Mã tài sản</th><th>Tên</th><th>Loại thiết bị</th><th>Khu vực</th><th class="r">Số tag</th><th>Trạng thái</th></tr></thead><tbody>' +
      ASSETS.map(function (a) {
        return '<tr><td class="code">' + a.code + '</td><td>' + a.name + '</td><td class="dim">' + a.type + '</td><td>' + a.area + '</td><td class="r num">' + a.tags + '</td><td>' + C.badge('ok', 'Đang giám sát') + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }

  function devicesTable() {
    return '<div class="card"><div class="card__head">' + C.icon('device', 'ico') + '<h3>Thiết bị đầu cuối (RTU / IO / CEMS)</h3><div class="spacer"></div><span class="sub">IEC 60870-5-104 · ' + S.PLANT.scan + ' ms</span></div>' +
      '<div class="card__body tight"><table class="tbl"><thead><tr><th>Thiết bị</th><th>Địa chỉ IP</th><th>Giao thức</th><th class="r">Chu kỳ quét</th><th class="r">Trễ (ping)</th><th>Trạng thái</th></tr></thead><tbody>' +
      (S.devices || []).map(function (d) {
        var off = d.st === 'off';
        return '<tr><td class="code">' + d.id + '<div class="dim" style="font-size:10.5px">' + d.role + '</div></td><td class="mono">' + d.ip + '</td><td class="dim">IEC-104</td>' +
          '<td class="r num">' + S.PLANT.scan + ' ms</td><td class="r num">' + (off ? '—' : d.ms + ' ms') + '</td>' +
          '<td>' + (off ? C.badge('alarm', 'Offline') : C.badge('ok', 'Trực tuyến')) + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }

  function usersTable() {
    return '<div class="card"><div class="card__head">' + C.icon('users', 'ico') + '<h3>Người dùng & Phân quyền</h3><div class="spacer"></div><button class="btn">' + C.icon('users') + 'Thêm người dùng</button></div>' +
      '<div class="card__body tight"><table class="tbl"><thead><tr><th>Họ tên</th><th>Tài khoản</th><th>Vai trò</th><th>Quyền hạn</th><th>Trạng thái</th></tr></thead><tbody>' +
      USERS.map(function (u) {
        return '<tr><td style="font-weight:600">' + u.name + '</td><td class="code">' + u.acc + '</td><td>' + u.role + '</td><td class="dim">' + u.perm + '</td>' +
          '<td>' + (u.st === 'ext' ? C.badge('info', 'Bên ngoài') : C.badge('ok', 'Kích hoạt')) + '</td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }

  function settings() {
    function group(icon, title, rows) {
      return '<div class="card"><div class="card__head">' + C.icon(icon, 'ico') + '<h3>' + title + '</h3></div><div class="card__body"><div class="cellgrid" style="grid-template-columns:1fr 1fr">' +
        rows.map(function (r) { return '<div class="cell"><div class="k">' + r[0] + '</div><div class="v" style="font-size:15px">' + r[1] + '</div></div>'; }).join('') + '</div></div></div>';
    }
    return '<div class="grid cols-2">' +
      group('factory', 'Hệ thống', [['Tên nhà máy', S.PLANT.name], ['Địa điểm', S.PLANT.site], ['Cấu hình', S.PLANT.config], ['Phiên bản', 'ThermoSCADA 1.0']]) +
      group('device', 'Truyền thông', [['Giao thức', 'IEC 60870-5-104'], ['Chu kỳ quét', S.PLANT.scan + ' ms'], ['Dự phòng', 'Hot-standby A/B'], ['Đồng bộ giờ', 'NTP · GPS']]) +
      group('report', 'Historian', [['Cơ sở dữ liệu', 'PostgreSQL / TimescaleDB'], ['Lưu trữ', '3 năm · nén 1s'], ['Số điểm đo', Object.keys(S.SPEC).length * 2 + ' tag'], ['Sao lưu', 'Hằng ngày 02:00']]) +
      group('settings', 'Giao diện & Đơn vị', [['Ngôn ngữ', 'Tiếng Việt'], ['Đơn vị', 'SI · °C · bar · MW'], ['Múi giờ', 'UTC+7 (ICT)'], ['Chế độ', 'Chỉ đọc · Giám sát']]) +
      '</div>';
  }

  function content() {
    if (tab === 'assets') return assetsTable();
    if (tab === 'devices') return devicesTable();
    if (tab === 'users') return usersTable();
    return settings();
  }

  V.config = {
    title: 'Cấu hình hệ thống',
    subtitle: 'Assets · Devices · Users · Settings',
    render: function (root) {
      root.innerHTML =
        '<div class="page">' +
          '<div class="page__head"><h2>Cấu hình hệ thống</h2><span class="sub">Tài sản · thiết bị I/O · người dùng · cài đặt</span><div class="spacer"></div>' + tabs() + '</div>' +
          '<div id="cf-content">' + content() + '</div>' +
        '</div>';
      root.querySelector('#cf-tabs').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-tab]'); if (!b) return;
        tab = b.getAttribute('data-tab');
        root.querySelectorAll('#cf-tabs button').forEach(function (x) { x.classList.toggle('is-active', x === b); });
        root.querySelector('#cf-content').innerHTML = content();
      });
      this._root = root;
    },
    update: function () {
      var root = this._root; if (!root) return;
      if (tab === 'devices') root.querySelector('#cf-content').innerHTML = content();
    }
  };
})(window);
