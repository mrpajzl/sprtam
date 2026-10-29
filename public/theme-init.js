// Apply the saved theme (light unless the user picked dark) and reading settings (src/reading.ts) before first paint.
// A separate file, not inline: the CSP only allows script-src 'self'.
try { if (localStorage.getItem('sprtam-theme') === 'dark') { document.documentElement.dataset.theme = 'dark'; document.querySelector('meta[name=theme-color]').content = '#111214' } } catch {}
try {
  var r = JSON.parse(localStorage.getItem('sprtam-reading') || '{}') || {}, d = document.documentElement.dataset
  if (r.size === 1 || r.size === 2) d.text = String(r.size)
  if (r.wide === true) d.spacing = 'wide'
  if (r.legible === true) d.font = 'legible'
  if (r.nokeys === true) d.keys = 'off'
} catch {}
