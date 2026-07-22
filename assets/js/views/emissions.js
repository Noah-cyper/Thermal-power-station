/* VIEW · emissions — stub tạm (sẽ hoàn thiện ở giai đoạn sau) */
(function (global) {
  'use strict';
  var C = global.C, V = global.Views = global.Views || {};
  V.emissions = {
    title: 'emissions',
    subtitle: 'Đang phát triển',
    render: function (root) {
      root.innerHTML = '<div class="page"><div class="card"><div class="card__body">' +
        '<div class="empty">' + C.icon('settings') + '<br>Màn hình "<b>emissions</b>" sẽ được xây dựng ở giai đoạn tiếp theo.</div>' +
        '</div></div></div>';
    }
  };
})(window);
