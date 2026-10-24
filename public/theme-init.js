// Apply the saved theme before first paint (light unless the user picked dark).
// A separate file, not inline: the CSP only allows script-src 'self'.
try { if (localStorage.getItem('sprtam-theme') === 'dark') { document.documentElement.dataset.theme = 'dark'; document.querySelector('meta[name=theme-color]').content = '#111214' } } catch {}
