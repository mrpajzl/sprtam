// The app moved from sprtam.ondrejzraly.cz to sprtam.cz. Progress lives only in this browser (localStorage, per
// domain), so on the old domain the server answers page loads with this script: it packs the progress and theme
// into the #fragment (never sent to a server) and continues to the same page on the new domain, which imports it
// (src/app.tsx, route #/presun/<code>). Same format as pack() in src/progress/code.ts.
(function () {
  var NEW = 'https://sprtam.cz'
  var target = NEW + location.pathname + location.search
  function b64(bytes) {
    var s = ''
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  function pack(data) {
    var stream = new Blob([JSON.stringify(data)]).stream().pipeThrough(new CompressionStream('deflate-raw'))
    return new Response(stream).arrayBuffer().then(function (buf) {
      var body = b64(new Uint8Array(buf))
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(body)).then(function (h) { return '1' + b64(new Uint8Array(h)).slice(0, 6) + body })
    })
  }
  function leave(hash) {
    // Drop this domain's service worker and caches so an installed app does not keep reopening the old copy.
    var sw = navigator.serviceWorker
    Promise.all([
      sw && sw.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister() })) }),
      window.caches && caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k) })) }),
    ]).catch(function () {}).then(function () { location.replace(target + hash) })
  }
  var data = {}
  try {
    var p = JSON.parse(localStorage.getItem('sprtam:progress') || 'null')
    if (p && p.v === 1) data.p = p
    if (localStorage.getItem('sprtam-theme') === 'dark') data.t = 'dark'
  } catch (e) { /* storage blocked: nothing to carry */ }
  // A shared progress or pairing link (#/p/…, #/spojit/…) keeps working after the move.
  if (/^#\/(p|spojit)\//.test(location.hash)) data.h = location.hash
  if (!data.p && !data.t) return leave(location.hash)
  try { pack(data).then(function (code) { leave('#/presun/' + code) }, function () { leave(location.hash) }) }
  catch (e) { leave(location.hash) }
})()
