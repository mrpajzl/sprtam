import { parseKey, stripSchema, wordsKey } from '../../src/content/docs'
import type { Session } from './auth'
import { audit } from './db'
import { HttpError, limit } from './http'
import { MINUTE } from './config'
import { publish, type DocChange } from './store'

// Vocabulary of the other languages (vocab/<lang>/<level>, src/content/format.ts WordsFile) has no editor and no
// review in moderation. Like topics added by AI (publishUnverified), an admin publishes it at once – in the browser
// or with an API token (scripts/content-words.ts). The whole content is checked before it is published, as always.

export function publishWords(s: Session, body: Record<string, unknown>, ip: string) {
  if (s.user.role !== 'admin') throw new HttpError(403, 'Slovíčka smí zveřejnit jen správce.')
  limit(`words:${s.user.id}`, 30, 10 * MINUTE)
  const files = body.files
  if (!Array.isArray(files) || !files.length || files.length > 15) throw new HttpError(400, 'Pošli 1–15 souborů slovíček (files: [{ lang, level, data }]).')
  const changes: DocChange[] = files.map((f) => {
    const { lang, level, data } = (f ?? {}) as { lang?: unknown; level?: unknown; data?: unknown }
    const key = wordsKey(String(lang), String(level))
    if (parseKey(key)?.kind !== 'words') throw new HttpError(400, `Neznámý jazyk nebo úroveň: ${String(lang)} ${String(level)}.`)
    return { key, data: stripSchema(data) }
  })
  if (new Set(changes.map((c) => c.key)).size !== changes.length) throw new HttpError(400, 'Každý soubor jen jednou.')
  const note = typeof body.note === 'string' && body.note.trim() ? body.note.trim().slice(0, 300) : 'Slovíčka'
  const r = publish(changes, { userId: s.user.id, reason: 'change', note })
  audit('words.published', s.user.id, { release: r.release, docs: changes.map((c) => c.key) }, ip)
  return { release: r.release, published: changes.length }
}
