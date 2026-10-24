// Recovery for a page that cannot start the app, e.g. a stale service worker or cache after a deploy:
// drop the service worker and Cache Storage and reload, at most once a minute. Progress (localStorage) stays.
// A separate file, not inline: the CSP only allows script-src 'self'. The server also sends it in place of
// a missing /assets/*.js chunk requested by an old page.
(function () {
  function heal() {
    try {
      if (Date.now() - (Number(localStorage.getItem('sprtam-heal')) || 0) < 60000) return
      localStorage.setItem('sprtam-heal', String(Date.now()))
    } catch (e) { return }
    var sw = navigator.serviceWorker
    Promise.all([
      sw && sw.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister() })) }),
      window.caches && caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k) })) }),
    ]).catch(function () {}).then(function () { location.reload() })
  }
  window.sprtamHeal = heal
  // The app marks <html data-app> once it has rendered.
  addEventListener('load', function () {
    // Offline, keep the caches: they are the only copy of the app.
    setTimeout(function () { if (!document.documentElement.hasAttribute('data-app') && navigator.onLine) heal() }, 4000)
  })
})()
