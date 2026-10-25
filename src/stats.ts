// Anonymous usage counting – the only thing that ever leaves the device.
// Once per day the app sends {new: true|false}: no ID, no cookie, no progress, no content.
// The server can then count daily users and new installs. Disabled unless VITE_STATS_URL is set,
// and off when the browser asks not to be tracked (Do Not Track or Global Privacy Control).

const URL_ = import.meta.env.VITE_STATS_URL as string | undefined
const KEY = 'sprtam:seen'

export function ping() {
  if (!URL_ || navigator.doNotTrack === '1' || (navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl) return
  const day = new Date().toISOString().slice(0, 10)
  const last = localStorage.getItem(KEY)
  if (last === day) return
  localStorage.setItem(KEY, day)
  const body = JSON.stringify({ new: !last })
  try { navigator.sendBeacon?.(URL_, new Blob([body], { type: 'text/plain' })) || fetch(URL_, { method: 'POST', body, keepalive: true, credentials: 'omit' }) } catch { /* offline */ }
}
