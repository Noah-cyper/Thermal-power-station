/* =====================================================================
   VIEW · Cảnh báo & Sự kiện (Alarm & Event Management)
   ===================================================================== */
(function (global) {
  'use strict';
  var S = global.Store, C = global.C, F = global.F;
  var V = global.Views = global.Views || {};
  var flt = { sev: 'all', st: 'all', unit: 'all' };
  var SEVT = { high: 'CAO', medium: 'TRUNG BÌNH', low: 'THẤP' };

  function filtered() {
    return S.alarms.filter(function (a) {
      if (flt.sev !== 'all' && a.sev !== flt.sev) return false;
      if (flt.st !== 'all' && a.state !== flt.st) return false;
      if (flt.unit !== 'all' && a.uid !== flt.unit) return false;
      return true;
    });
  }

  function summary() {
    var act = S.alarms.filter(function (a) { return a.state === 'active'; });
    var hi = S.alarms.filter(function (a) { return a.sev === 'high'; }).length;
    var me = S.alarms.filter(function (a) { return a.sev === 'medium'; }).length;
    return C.kpi({ label: 'Cảnh báo hoạt động', value: F.fmt0(S.alarms.length), unit: '', icon: 'bell', status: S.alarms.length ? 'warn' : 'ok', sub: 'trên toàn nhà máy' }) +
      C.kpi({ label: 'Chờ xác nhận (ack)', value: F.fmt0(act.length), unit: '', icon: 'alert', status: act.length ? 'warn' : 'ok', sub: 'cần thao tác' }) +
      C.kpi({ label: 'Mức cao', value: F.fmt0(hi), unit: '', icon: 'alert', status: hi ? 'alarm' : 'ok', sub: 'ưu tiên xử lý' }) +
      C.kpi({ label: 'Mức trung bình', value: F.fmt0(me), unit: '', icon: 'activity', status: me ? 'warn' : 'ok', sub: 'theo dõi' });
  }

  function seg(key, opts) {
    return '<div class="seg" data-fkey="' + key + '">' + opts.map(function (o) {
      return '<button data-fval="' + o[0] + '"' + (flt[key] === o[0] ? ' class="is-active"' : '') + '>' + o[1] + '</button>';
    }).join('') + '</div>';
  }

  function alarmTable() {
    var list = filtered();
    if (!list.length) return '<div class="empty">' + C.icon('check') + '<br>Không có cảnh báo phù hợp bộ lọc</div>';
    return '<table class="tbl"><thead><tr><th>Thời gian</th><th>Mức</th><th>Tổ máy</th><th>Tag</th><th>Mô tả</th><th>Trạng thái</th><th></th></tr></thead><tbody>' +
      list.map(function (a) {
        var stCls = a.state === 'active' ? 'state-active' : a.state === 'ack' ? 'state-ack' : 'state-cleared';
        var stTxt = a.state === 'active' ? 'Chờ ack' : a.state === 'ack' ? 'Đã ack' : 'Đã xóa';
        return '<tr><td class="mono">' + F.clockTime(a.ts) + '</td>' +
          '<td><span class="alarm-item__sev sev-' + a.sev + '">' + SEVT[a.sev] + '</span></td>' +
          '<td>' + a.uid + '</td><td class="code">' + a.isa + '</td>' +
          '<td>' + a.msg + '</td>' +
          '<td class="' + stCls + '" style="font-weight:700;font-size:11.5px">' + stTxt + '</td>' +
          '<td class="r">' + (a.state === 'active' ? '<button class="btn" data-ack="' + a.id + '" style="height:26px">Ack</button>' : '') + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  function eventTable() {
    return '<table class="tbl"><thead><tr><th>Thời gian</th><th>Loại</th><th>Tổ máy</th><th>Nội dung</th><th>Người/Nguồn</th></tr></thead><tbody>' +
      (S.events || []).slice(0, 12).map(function (e) {
        return '<tr><td class="mono">' + F.clockTime(e.ts) + '</td>' +
          '<td><span class="badge badge--muted">' + e.type + '</span></td>' +
          '<td>' + e.uid + '</td><td>' + e.msg + '</td><td class="dim">' + e.user + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  V.alarms = {
    title: 'Cảnh báo & Sự kiện',
    subtitle: 'Alarm & Event Management',
    render: function (root) {
      root.innerHTML =
        '<div class="page">' +
          '<div class="page__head"><h2>Cảnh báo & Sự kiện</h2><span class="sub">Danh sách cảnh báo · xác nhận · nhật ký vận hành</span>' +
            '<div class="spacer"></div><button class="btn btn--primary" data-ackall>' + C.icon('check') + 'Xác nhận tất cả</button></div>' +
          '<div class="grid cols-4" id="al-sum">' + summary() + '</div>' +
          '<div class="card" style="margin-top:14px"><div class="card__head">' + C.icon('bell', 'ico') + '<h3>Danh sách cảnh báo</h3><div class="spacer"></div>' +
            '<div class="row wrap" style="gap:8px" id="al-filters">' +
              '<span class="eyebrow">Mức</span>' + seg('sev', [['all', 'Tất cả'], ['high', 'Cao'], ['medium', 'TB'], ['low', 'Thấp']]) +
              '<span class="eyebrow">Trạng thái</span>' + seg('st', [['all', 'Tất cả'], ['active', 'Chờ ack'], ['ack', 'Đã ack']]) +
              '<span class="eyebrow">Tổ máy</span>' + seg('unit', [['all', 'Tất cả'], ['S1', 'S1'], ['S2', 'S2']]) +
            '</div></div>' +
            '<div class="card__body tight" id="al-table">' + alarmTable() + '</div></div>' +
          '<div class="card" style="margin-top:14px"><div class="card__head">' + C.icon('report', 'ico') + '<h3>Nhật ký sự kiện</h3><div class="spacer"></div><span class="sub">Sequence of Events</span></div>' +
            '<div class="card__body tight" id="al-events">' + eventTable() + '</div></div>' +
        '</div>';

      root.querySelector('#al-filters').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-fval]'); if (!b) return;
        var key = b.closest('[data-fkey]').getAttribute('data-fkey');
        flt[key] = b.getAttribute('data-fval');
        root.querySelectorAll('#al-filters .seg[data-fkey="' + key + '"] button').forEach(function (x) { x.classList.toggle('is-active', x === b); });
        root.querySelector('#al-table').innerHTML = alarmTable();
      });
      this._root = root;
    },
    update: function () {
      var root = this._root; if (!root) return;
      root.querySelector('#al-sum').innerHTML = summary();
      root.querySelector('#al-table').innerHTML = alarmTable();
      root.querySelector('#al-events').innerHTML = eventTable();
    }
  };
})(window);
