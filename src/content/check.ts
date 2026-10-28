import { EXAM } from '../exam'
import { GRADE_SUBJECTS, isVocationalEntry, ODB } from './curriculum'
import { parseKey, RESERVED, SCHEMAS, subjectKey, vocabKey, type DocRef } from './docs'
import { LEVELS } from './format'
import { topicIssues } from './rules'
import { validate } from './schema'
import type { ApproachYearFile, SubjectFile, TopicFile, VocabFile } from './types'

// Checks a whole set of content documents (docs.ts): the format of each, the authoring rules of topics
// (rules.ts), and everything that ties documents together – every topic listed in its subject exactly
// once, plans of teaching approaches and the entrance exam preparation (src/exam.ts) pointing at existing topics,
// English words unique across levels.
// Used by scripts/check-content.ts (files in content/) and by the content service before anything is
// published (the database with the change applied), so the two can never disagree.

/** key → document (without `$schema`). */
export type Snapshot = ReadonlyMap<string, unknown>

export interface CheckIssue {
  /** Document key ('' = the content as a whole). */
  key: string
  /** Path inside the document ('' = the document itself). */
  path: string
  message: string
  /** The same in Czech, for moderators. */
  cs: string
}

export interface CheckOptions {
  /** Check format and rules only of these documents (the rest is assumed fine); cross-document checks always run. */
  only?: ReadonlySet<string>
  /** Skip "missing document" checks (a partial snapshot, e.g. `check:content -- topics/z5`). */
  partial?: boolean
}

export function checkSnapshot(snap: Snapshot, opts: CheckOptions = {}): CheckIssue[] {
  const out: CheckIssue[] = []
  const add = (key: string, path: string, message: string, cs = message) => out.push({ key, path, message, cs })
  const deep = (key: string) => !opts.only || opts.only.has(key)

  const refs = new Map<string, DocRef>()
  for (const key of snap.keys()) {
    const ref = parseKey(key)
    if (!ref) add(key, '', 'not a content document (unknown grade, subject, level or id)', 'Neznámý dokument učiva.')
    else refs.set(key, ref)
  }

  // Format of every document. Documents with format errors skip the rules (they would crash on them).
  const valid = new Set<string>()
  for (const [key, ref] of refs) {
    if (!deep(key)) { valid.add(key); continue }
    const issues = validate(SCHEMAS[ref.kind], snap.get(key))
    for (const i of issues.slice(0, 20)) add(key, i.path === '(root)' ? '' : i.path, i.message, `Chyba formátu: ${i.message}`)
    if (issues.length > 20) add(key, '', `… and ${issues.length - 20} more format errors`)
    if (!issues.length) valid.add(key)
  }

  const approachIds = [...refs.values()].flatMap((r) => (r.kind === 'approach' ? [r.approach] : []))
  for (const id of approachIds) if (RESERVED.includes(id)) add(`approaches/${id}/approach`, '', 'approach id is a reserved route', 'Tohle id přístupu je rezervované.')

  // ——— Topics and subjects ———

  /** grade/subject/id → approach of approach-only topics (undefined for the rest). */
  const topics = new Map<string, string | undefined>()
  for (const [key, ref] of refs) {
    if (ref.kind !== 'topic') continue
    const t = snap.get(key) as TopicFile
    // A topic with format errors still exists (its errors are reported once, above).
    topics.set(`${ref.grade}/${ref.subject}/${ref.id}`, typeof t?.approach === 'string' ? t.approach : undefined)
    if (!valid.has(key)) continue
    if (t.id !== ref.id) add(key, 'id', `id "${t.id}" differs from the key`, 'Id tématu nesedí s jeho adresou.')
    if (!deep(key)) continue
    try { for (const i of topicIssues(t, approachIds)) add(key, i.path, i.message, i.cs) } catch { add(key, '', 'cannot check the rules', 'Pravidla tématu nejde zkontrolovat.') }
  }
  for (const [key, ref] of refs) {
    if (ref.kind === 'topic' && !snap.has(subjectKey(ref.grade, ref.subject))) add(key, '', 'its subject has no _subject list', 'Předmět tématu nemá seznam témat.')
    if (ref.kind !== 'subject' || !valid.has(key)) continue
    const ids = (snap.get(key) as SubjectFile).topics
    if (new Set(ids).size !== ids.length) add(key, 'topics', 'a topic is listed twice', 'Téma je v seznamu dvakrát.')
    for (const id of ids) if (!snap.has(`topics/${ref.grade}/${ref.subject}/${id}`)) add(key, 'topics', `lists "${id}" but that topic does not exist`, `Seznam obsahuje téma „${id}“, které neexistuje.`)
  }
  // Odborné předměty name themselves; the curriculum's subjects are named in code.
  for (const [key, ref] of refs) {
    if (ref.kind !== 'subject' || !valid.has(key) || !deep(key)) continue
    const f = snap.get(key) as SubjectFile
    if (ref.grade === ODB) {
      for (const k of ['name', 'emoji', 'color'] as const) if (!f[k]) add(key, k, `an odborný předmět needs its ${k}`, `Odborný předmět potřebuje ${k === 'name' ? 'název' : k === 'emoji' ? 'emoji' : 'barvu'}.`)
      // The same rule the web server applies to the release (server/content.ts): what passes here is never refused there.
      if (f.name && f.emoji && f.color && !isVocationalEntry(ref.subject, { name: f.name, emoji: f.emoji, c: f.color })) add(key, '', 'odborný předmět: name ≤ 80 characters, emoji ≤ 16', 'Název odborného předmětu smí mít nejvýš 80 znaků a emoji nejvýš 16.')
    } else if (f.name !== undefined || f.emoji !== undefined || f.color !== undefined) add(key, '', 'name, emoji and color are only for odborné předměty (topics/odb)', 'Název, emoji a barvu mají jen odborné předměty.')
  }
  const listed = new Set<string>()
  for (const [key, ref] of refs) if (ref.kind === 'subject' && valid.has(key)) for (const id of (snap.get(key) as SubjectFile).topics) listed.add(`topics/${ref.grade}/${ref.subject}/${id}`)
  for (const [key, ref] of refs) if (ref.kind === 'topic' && snap.has(subjectKey(ref.grade, ref.subject)) && !listed.has(key)) add(key, '', 'not listed in _subject', 'Téma chybí v seznamu témat předmětu.')
  if (!opts.partial) for (const [g, subs] of Object.entries(GRADE_SUBJECTS)) for (const s of subs) {
    if (!snap.has(subjectKey(g, s))) add(subjectKey(g, s), '', 'missing (every subject of the curriculum needs its content)', 'Chybí seznam témat předmětu.')
  }

  // ——— Teaching approaches ———

  const reached = new Set<string>()
  for (const [key, ref] of refs) {
    if (ref.kind !== 'approach-year') continue
    if (!snap.has(`approaches/${ref.approach}/approach`)) add(key, '', 'missing approach.json of this approach', 'Chybí popis přístupu.')
    if (!valid.has(key)) continue
    const y = snap.get(key) as ApproachYearFile
    const ids = new Set<string>()
    for (const b of [...y.epochs, ...(y.ongoing ?? [])]) {
      if (ids.has(b.id)) add(key, b.id, `duplicate id "${b.id}"`, `Id „${b.id}“ je v roce dvakrát.`)
      ids.add(b.id)
      if (new Set(b.topics).size !== b.topics.length) add(key, b.id, 'a topic is listed twice', `${b.title}: téma je v seznamu dvakrát.`)
      for (const k of b.topics) {
        reached.add(k)
        if (!topics.has(k)) { if (!opts.partial) add(key, b.id, `topic ${k} does not exist`, `${b.title}: téma ${k} neexistuje.`) }
        else if (topics.get(k) && topics.get(k) !== ref.approach) add(key, b.id, `${k} belongs to approach "${topics.get(k)}"`, `${b.title}: téma ${k} patří k jinému přístupu.`)
      }
    }
  }
  // An approach-only topic is reachable only through its approach's plan.
  if (!opts.partial) for (const [k, a] of topics) if (a && !reached.has(k)) add(`topics/${k}`, '', `approach-only topic is not in any year of approaches/${a}`, 'Téma jen pro jeden přístup není v žádném ročníku jeho plánu.')

  // ——— Příprava na přijímačky (src/exam.ts, in code): its topics must stay ———

  if (!opts.partial) for (const pt of EXAM.parts) for (const a of pt.areas) for (const k of a.topics) {
    if (!topics.has(k)) add(`topics/${k}`, '', `missing, but ${EXAM.id}/${pt.s}/${a.id} (src/exam.ts) points at it`, `Téma chybí, ale příprava na přijímačky (${pt.title}: ${a.title}) na něj odkazuje.`)
    else if (topics.get(k)) add(`topics/${k}`, '', `approach-only, but ${EXAM.id}/${pt.s}/${a.id} (src/exam.ts) points at it`, `Téma je jen pro jeden přístup, ale příprava na přijímačky (${pt.title}: ${a.title}) na něj odkazuje.`)
  }

  // ——— Vocabulary ———

  const english = new Map<string, string>()
  for (const l of LEVELS) {
    const key = vocabKey(l)
    if (!snap.has(key)) { if (!opts.partial) add(key, '', 'missing', 'Chybí slovíčka úrovně.'); continue }
    if (!valid.has(key)) continue
    const v = snap.get(key) as VocabFile
    if (v.level !== l) add(key, 'level', `level ${v.level} differs from the key`, 'Úroveň nesedí s adresou.')
    for (const g of v.groups) for (const w of g.words) {
      const where = `${g.name} "${w.cz}"`
      if (new Set([w.en, w.similar, w.related].map((x) => x.toLowerCase())).size !== 3) add(key, where, 'similar/related must differ from each other and from en', `${where}: špatné možnosti se musí lišit od sebe i od správné.`)
      // Progress is stored by the English word: it must be unique across all levels.
      const k = w.en.toLowerCase()
      if (english.has(k)) add(key, where, `"${w.en}" is already in ${english.get(k)}`, `${where}: „${w.en}“ už je v ${english.get(k)}.`)
      english.set(k, `${l} ${g.name}`)
    }
  }
  return out
}
