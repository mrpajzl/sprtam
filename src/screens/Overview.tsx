import { GRADE_NAME, GRADES, gradeSubjects, subjectMeta } from '../content/curriculum'
import { useIndex, type TopicRef } from '../content/library'
import type { GradeId, SubjectId } from '../content/types'
import { streakOf } from '../progress/recommend'
import { answeredToday, goalOf, isDue, isMistake, stars, today, useProgress, type Progress } from '../progress/store'
import { Link } from '../router'
import { Bar } from '../ui/Bar'
import { subjectStyle } from '../ui/glyphs'
import { IArrow } from '../ui/icons'
import { useAsync } from '../ui/useAsync'
import { MASTERED } from './Vocab'
import { loadWordRefs, type WordRef } from '../vocab'
import { LANGS, LEVEL_IDS, vocabPath, wordKey } from '../vocab/langs'

// /prehled – everything practised so far at a glance, for the student and a parent looking over the shoulder:
// the last weeks, and per grade and subject how many topics are on one, two or three stars. Only from the
// progress in this device; nothing is loaded except the topic index (and the word list for vocabulary).

const plural = (n: number, one: string, few: string, many: string) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many)

/** Topics of a subject by the stars of their best round: [not yet, 0, 1, 2, 3]. */
function buckets(p: Progress, refs: TopicRef[]) {
  const out = [0, 0, 0, 0, 0]
  for (const r of refs) { const t = p.t[r.key]; out[t?.n ? stars(t.s) + 1 : 0]++ }
  return out
}

export function Overview() {
  const p = useProgress()
  const all = useIndex()
  const s = streakOf(p)
  const now = today()
  const days30 = (p.a ?? []).filter((d) => now - d < 30).length
  const qs = Object.values(p.q ?? {})
  const mistakes = qs.filter(isMistake).length, due = qs.filter((v) => isDue(v, now)).length
  const goal = goalOf(p)
  const rounds = Object.values(p.t).reduce((n, t) => n + t.n, 0)

  // The chosen grade first, then every other grade with some practice.
  const listed = (all ?? []).filter((r) => !r.approach)
  const practised = new Set(listed.filter((r) => p.t[r.key]?.n).map((r) => r.g))
  const grades = GRADES.filter((g) => g === p.g || practised.has(g)).sort((a, b) => (a === p.g ? -1 : b === p.g ? 1 : 0))

  return (
    <div class="page overview">
      <Bar title="Přehled" />
      <div class="stat-grid">
        <Stat n={s.n} label={`${plural(s.n, 'den', 'dny', 'dní')} v řadě`} />
        <Stat n={days30} label="dní za 30 dní" />
        <Stat n={rounds} label={plural(rounds, 'kolo', 'kola', 'kol')} />
        {goal > 0 && <Stat n={answeredToday(p)} of={goal} label="dnes odpovědí" />}
      </div>
      <div class="list">
        <Link class="row" href="/chyby"><span class="txt"><b>Sešit chyb</b><small>{mistakes ? `${mistakes} ${plural(mistakes, 'otázka', 'otázky', 'otázek')} k opravení` : 'prázdný'}</small></span><IArrow /></Link>
        {due > 0 && <Link class="row" href="/dnes" rel="nofollow"><span class="txt"><b>Dnešní opakování</b><small>{due} {plural(due, 'otázka je', 'otázky jsou', 'otázek je')} na řadě</small></span><IArrow /></Link>}
      </div>

      {all && !grades.length && <div class="empty">Zatím nic procvičeného. Vyber si třídu a téma a začni.<Link class="btn" href="/">Domů</Link></div>}
      {grades.map((g) => <GradeOverview key={g} g={g} p={p} refs={listed.filter((r) => r.g === g)} />)}
      {Object.keys(p.w).length > 0 && <VocabOverview p={p} />}
      {grades.length > 0 && <p class="muted legend"><i class="b3" />★★★ <i class="b2" />★★ <i class="b1" />★ <i class="b0" />procvičeno pod 40 % <i />zatím ne</p>}
    </div>
  )
}

function Stat({ n, of, label }: { n: number; of?: number; label: string }) {
  return <div class={`stat ${of && n >= of ? 'done' : ''}`}><b>{n}{of ? <small>/{of}</small> : null}</b><span>{label}</span></div>
}

function GradeOverview({ g, p, refs }: { g: GradeId; p: Progress; refs: TopicRef[] }) {
  const subjects = gradeSubjects(g).filter((s) => refs.some((r) => r.s === s))
  return (
    <section class="sec">
      <h2 class="label">{GRADE_NAME[g]}</h2>
      <div class="list">
        {subjects.map((s) => <SubjectRow key={s} g={g} s={s} b={buckets(p, refs.filter((r) => r.s === s))} />)}
      </div>
    </section>
  )
}

function SubjectRow({ g, s, b }: { g: GradeId; s: SubjectId; b: number[] }) {
  const total = b.reduce((x, y) => x + y, 0)
  const done = total - b[0]
  return (
    <Link class="row sub-row" style={subjectStyle(s)} href={`/g/${g}/${s}`}>
      <span class="txt">
        <b>{subjectMeta(s).name}</b>
        <small>{done} z {total} témat{b[4] ? ` · ${b[4]}× ★★★` : ''}</small>
        <span class="star-bar" role="img" aria-label={`Tři hvězdy ${b[4]}, dvě ${b[3]}, jedna ${b[2]}, pod 40 % ${b[1]}, zatím ne ${b[0]}`}>
          {[4, 3, 2, 1].map((k) => b[k] > 0 && <i key={k} class={`b${k - 1}`} style={{ flexGrow: b[k] }} />)}
          {b[0] > 0 && <i style={{ flexGrow: b[0] }} />}
        </span>
      </span>
      <IArrow />
    </Link>
  )
}

function VocabOverview({ p }: { p: Progress }) {
  const words = useAsync(loadWordRefs, [])
  if (!words) return null
  return (
    <>
      {LANGS.map((m) => {
        const rows = LEVEL_IDS.map((l) => {
          const of = words.filter((w) => w.lang === m.id && w.level === l)
          const box = (w: WordRef) => p.w[wordKey(m.id, w.word)] ?? 0
          const learned = of.filter((w) => box(w) >= MASTERED).length, seen = of.filter((w) => box(w) > 0).length
          if (!seen) return null
          return (
            <Link key={l} class="row sub-row" href={vocabPath(m.id, l)}>
              <span class="txt">
                <b>{l}</b><small>{learned} naučených · {seen} z {of.length} viděných</small>
                <span class="star-bar" role="img" aria-label={`Naučených ${learned}, rozpracovaných ${seen - learned}, zbývá ${of.length - seen}`}>
                  {learned > 0 && <i class="b2" style={{ flexGrow: learned }} />}
                  {seen - learned > 0 && <i class="b0" style={{ flexGrow: seen - learned }} />}
                  <i style={{ flexGrow: of.length - seen }} />
                </span>
              </span>
              <IArrow />
            </Link>
          )
        }).filter(Boolean)
        return rows.length > 0 && (
          <section key={m.id} class="sec">
            <h2 class="label">{m.title}</h2>
            <div class="list">{rows}</div>
          </section>
        )
      })}
    </>
  )
}
