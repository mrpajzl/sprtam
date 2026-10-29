import { isoOf, type Plan } from './progress/plan'

// Reminders in the pupil's own calendar (Nastavení → Připomínka, a plan's „Připomínat v kalendáři“): an .ics file
// made in the device and handed to the calendar app. No push notifications, no server, nothing is sent anywhere; the
// reminder lives in the calendar and is cancelled there. Times are floating (no time zone): 17:00 wherever you are.

const ORIGIN = 'https://sprtam.cz'

const esc = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, '\\n')

/** Lines longer than 75 bytes are folded (RFC 5545), never inside a UTF-8 character. */
function fold(line: string): string {
  const out: string[] = []
  let cur = '', bytes = 0
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length
    if (bytes + n > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0 }
    cur += ch; bytes += n
  }
  out.push(cur)
  return out.join('\r\n ')
}

const utc = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
const date = (day: number) => isoOf(day).replace(/-/g, '')
const at = (day: number, time: string) => `${date(day)}T${time.replace(':', '')}00`

function calendar(events: string[][]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Šprtám//sprtam.cz//CS', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...events.flat(), 'END:VCALENDAR']
  return lines.map(fold).join('\r\n') + '\r\n'
}

function event(uid: string, fields: string[], alarm: { trigger: string; text: string }): string[] {
  return ['BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${utc(new Date())}`, ...fields,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `TRIGGER:${alarm.trigger}`, `DESCRIPTION:${esc(alarm.text)}`, 'END:VALARM', 'END:VEVENT']
}

/** `HH:MM` from a time input, or the default. */
export const cleanTime = (t: string) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(t) ? t : '17:00')

/** Every day at `time`: a short practice. Imported again, it replaces the earlier one (same UID per pupil: `who`). */
export function dailyReminder(time: string, today: number, who = ''): string {
  const t = cleanTime(time)
  return calendar([event(`denni-opakovani${who ? `-${who}` : ''}@sprtam.cz`, [
    `DTSTART:${at(today, t)}`, 'DURATION:PT15M', 'RRULE:FREQ=DAILY',
    `SUMMARY:${esc('Šprtám: chvilka procvičování')}`,
    `DESCRIPTION:${esc(`Dnešní opakování a co je na řadě: ${ORIGIN}/`)}`, `URL:${ORIGIN}/`, 'TRANSP:TRANSPARENT',
  ], { trigger: 'PT0M', text: 'Šprtám: chvilka procvičování' })])
}

/** A plan: a reminder every day at `time` until the day before the test, and the test itself the day before. */
export function planCalendar(id: string, plan: Plan, time: string, today: number): string {
  const t = cleanTime(time)
  const url = `${ORIGIN}/plan/${id}`
  const events: string[][] = []
  const last = plan.d - 1
  if (last >= today) {
    events.push(event(`plan-${id}-opakovani@sprtam.cz`, [
      `DTSTART:${at(today, t)}`, 'DURATION:PT15M', `RRULE:FREQ=DAILY;UNTIL=${at(last, t)}`,
      `SUMMARY:${esc(`Šprtám: ${plan.n}`)}`, `DESCRIPTION:${esc(`Co dnes procvičit: ${url}`)}`, `URL:${url}`, 'TRANSP:TRANSPARENT',
    ], { trigger: 'PT0M', text: `Šprtám: ${plan.n}` }))
  }
  events.push(event(`plan-${id}@sprtam.cz`, [
    `DTSTART;VALUE=DATE:${date(plan.d)}`, `DTEND;VALUE=DATE:${date(plan.d + 1)}`,
    `SUMMARY:${esc(plan.n)}`, `DESCRIPTION:${esc(`Plán opakování: ${url}`)}`, `URL:${url}`, 'TRANSP:TRANSPARENT',
  ], { trigger: '-PT6H', text: `Zítra: ${plan.n}` }))
  return calendar(events)
}

/** Hand the file to the device: a download the calendar app opens. */
export function saveCalendar(name: string, ics: string) {
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `${name}.ics` })
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
