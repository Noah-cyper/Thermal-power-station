/* =====================================================================
   THERMOSCADA — Hash Router
   View = { title, subtitle, render(root), update?() }
   ===================================================================== */
(function (global) {
  'use strict';
  var routes = {}, order = [], current = null, unsub = null, onChange = null;

  var Router = {
    register: function (id, view) { routes[id] = view; if (order.indexOf(id) < 0) order.push(id); },
    routes: routes,
    onChange: function (fn) { onChange = fn; },
    current: function () { return current; },

    go: function (id) { if (location.hash !== '#/' + id) location.hash = '#/' + id; else this._mount(id); },

    _mount: function (id) {
      var view = routes[id] || routes[order[0]];
      if (!view) return;
      if (unsub) { unsub(); unsub = null; }
      current = id;
      var root = document.getElementById('view');
      root.innerHTML = '';
      try { view.render(root); } catch (e) { root.innerHTML = '<div class="empty">Lỗi hiển thị: ' + e.message + '</div>'; console.error(e); }
      if (view.update) {
        var upd = function () { try { view.update(); } catch (e) { console.error(e); } };
        unsub = global.Store.subscribe(upd);
        upd();
      }
      root.scrollTop = 0;
      if (onChange) onChange(id, view);
    },

    start: function () {
      var self = this;
      window.addEventListener('hashchange', function () { self._mount(self._id()); });
      this._mount(this._id());
    },
    _id: function () { var h = location.hash.replace('#/', ''); return routes[h] ? h : order[0]; }
  };

  global.Router = Router;
})(window);
