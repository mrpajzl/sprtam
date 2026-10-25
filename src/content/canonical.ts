import type { S } from './schema'

// Writes content the way the files in content/ are written: object fields in the order of the format
// (src/content/format.ts), the variant tag (`type`, `widget`) first, `$schema` at the top, 2-space JSON
// with a newline at the end. Used by the moderator app, so its pull requests change only what was edited.

export function canonical(schema: S, value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value
  switch (schema.kind) {
    case 'array':
      return Array.isArray(value) ? value.map((v) => canonical(schema.item, v)) : value
    case 'tuple':
      return Array.isArray(value) ? value.map((v, i) => (schema.items[i] ? canonical(schema.items[i], v) : v)) : value
    case 'object': {
      const o = value as Record<string, unknown>
      const out: Record<string, unknown> = {}
      if ('$schema' in o) out.$schema = o.$schema
      for (const [k, f] of Object.entries(schema.fields)) if (o[k] !== undefined) out[k] = canonical(f, o[k])
      for (const k of Object.keys(o)) if (!(k in out) && o[k] !== undefined) out[k] = o[k] // unknown fields stay (the validator reports them)
      return out
    }
    case 'variants': {
      const o = value as Record<string, unknown>
      const tag = o[schema.key]
      const c = typeof tag === 'string' && Object.hasOwn(schema.cases, tag) ? schema.cases[tag] : undefined
      if (!c) return value
      const { [schema.key]: _, ...rest } = o
      return { [schema.key]: tag, ...(canonical(c, rest) as Record<string, unknown>) }
    }
  }
  return value
}

/** The exact text of a content file. */
export const fileText = (schema: S, value: unknown) => JSON.stringify(canonical(schema, value), null, 2) + '\n'
