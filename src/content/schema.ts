// A tiny schema builder. One definition gives three things that therefore never drift apart:
//   - the TypeScript type (`Infer<typeof x>`),
//   - validation of content files (`validate(x, value)`, used by scripts/check-content.ts),
//   - JSON Schema (`toJsonSchema(x)`) for editor autocompletion in content/**/*.json.
// Every value can carry a Czech `description`; it is shown in editors, in docs/WIDGETY.md and in the gallery.

export type Json = null | boolean | number | string | Json[] | { [k: string]: Json }

interface Base<T> {
  readonly kind: string
  readonly description?: string
  /** Phantom field carrying the TypeScript type. */
  readonly _t?: T
}

export interface StringS extends Base<string> { kind: 'string'; min?: number; pattern?: string }
export interface NumberS extends Base<number> { kind: 'number'; int?: boolean; min?: number; max?: number }
export interface BooleanS extends Base<boolean> { kind: 'boolean' }
export interface EnumS<T extends string> extends Base<T> { kind: 'enum'; values: readonly T[] }
export interface ArrayS<T = unknown> extends Base<T[]> { kind: 'array'; item: S; min?: number; max?: number }
export interface TupleS<T = unknown> extends Base<T> { kind: 'tuple'; items: S[] }
export interface ObjectS<T = unknown> extends Base<T> { kind: 'object'; fields: Record<string, S>; optional: Set<string> }
export interface AnyOfS<T = unknown> extends Base<T> { kind: 'anyOf'; options: S[] }
/** Objects told apart by the value of one field (`type`, `widget`). */
export interface VariantsS<T = unknown> extends Base<T> { kind: 'variants'; key: string; cases: Record<string, ObjectS | VariantsS> }

export type S = StringS | NumberS | BooleanS | EnumS<string> | ArrayS | TupleS | ObjectS | AnyOfS | VariantsS

export type Infer<X> = X extends Base<infer T> ? T : never

/** Marks an object field as optional. */
export interface Opt<X extends S> { readonly opt: X }
type Fields = Record<string, S | Opt<S>>
type Req<F extends Fields> = { [K in keyof F as F[K] extends Opt<S> ? never : K]: Infer<F[K]> }
type Optional<F extends Fields> = { [K in keyof F as F[K] extends Opt<S> ? K : never]?: F[K] extends Opt<infer X> ? Infer<X> : never }
type Flat<T> = { [K in keyof T]: T[K] } & {}
export type ObjectOf<F extends Fields> = Flat<Req<F> & Optional<F>>
type CasesOf<K extends string, C extends Record<string, ObjectS | VariantsS>> = { [V in keyof C]: Flat<{ [P in K]: V } & Infer<C[V]>> }[keyof C]

type Doc = { description?: string }

export const s = {
  string: (o: Doc & { min?: number; pattern?: string } = {}): StringS => ({ kind: 'string', ...o }),
  number: (o: Doc & { min?: number; max?: number } = {}): NumberS => ({ kind: 'number', ...o }),
  int: (o: Doc & { min?: number; max?: number } = {}): NumberS => ({ kind: 'number', int: true, ...o }),
  boolean: (o: Doc = {}): BooleanS => ({ kind: 'boolean', ...o }),
  enum: <const T extends string>(values: readonly T[], o: Doc = {}): EnumS<T> => ({ kind: 'enum', values, ...o }),
  array: <X extends S>(item: X, o: Doc & { min?: number; max?: number } = {}): ArrayS<Infer<X>> => ({ kind: 'array', item, ...o }) as ArrayS<Infer<X>>,
  tuple: <const X extends S[]>(items: X, o: Doc = {}): TupleS<{ [I in keyof X]: Infer<X[I]> }> => ({ kind: 'tuple', items, ...o }),
  optional: <X extends S>(x: X): Opt<X> => ({ opt: x }),
  object: <F extends Fields>(fields: F, o: Doc = {}): ObjectS<ObjectOf<F>> => {
    const out: Record<string, S> = {}
    const optional = new Set<string>()
    for (const [k, v] of Object.entries(fields)) {
      if ('opt' in v) { optional.add(k); out[k] = v.opt } else out[k] = v
    }
    return { kind: 'object', fields: out, optional, ...o }
  },
  anyOf: <X extends S[]>(options: X, o: Doc = {}): AnyOfS<Infer<X[number]>> => ({ kind: 'anyOf', options, ...o }),
  /** `{ [key]: "a", …fields of a } | { [key]: "b", … }`. */
  variants: <K extends string, C extends Record<string, ObjectS | VariantsS>>(key: K, cases: C, o: Doc = {}): VariantsS<CasesOf<K, C>> => ({ kind: 'variants', key, cases, ...o }),
}

// ——— Validation ———

export interface Issue { path: string; message: string }

const typeOf = (v: unknown) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v)
const show = (v: unknown) => { const j = JSON.stringify(v); return j && j.length > 40 ? `${j.slice(0, 37)}…` : j }

/** All problems of `value` against `schema`; an empty list means valid. Unknown object fields are errors (catches typos). */
export function validate(schema: S, value: unknown, path = '', out: Issue[] = []): Issue[] {
  const bad = (message: string) => { out.push({ path: path || '(root)', message }); return out }
  switch (schema.kind) {
    case 'string':
      if (typeof value !== 'string') return bad(`expected text, got ${typeOf(value)}`)
      if (value.length < (schema.min ?? 1)) return bad(schema.min ? `text shorter than ${schema.min}` : 'empty text')
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) return bad(`${show(value)} does not match ${schema.pattern}`)
      return out
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) return bad(`expected a number, got ${typeOf(value)}`)
      if (schema.int && !Number.isInteger(value)) return bad(`expected a whole number, got ${value}`)
      if (schema.min !== undefined && value < schema.min) return bad(`${value} is less than ${schema.min}`)
      if (schema.max !== undefined && value > schema.max) return bad(`${value} is more than ${schema.max}`)
      return out
    case 'boolean':
      return typeof value === 'boolean' ? out : bad(`expected true/false, got ${typeOf(value)}`)
    case 'enum':
      return schema.values.includes(value as string) ? out : bad(`${show(value)} is not one of ${schema.values.map((v) => `"${v}"`).join(', ')}`)
    case 'array':
      if (!Array.isArray(value)) return bad(`expected a list, got ${typeOf(value)}`)
      if (schema.min !== undefined && value.length < schema.min) return bad(`needs at least ${schema.min} items, has ${value.length}`)
      if (schema.max !== undefined && value.length > schema.max) return bad(`allows at most ${schema.max} items, has ${value.length}`)
      value.forEach((v, i) => validate(schema.item, v, `${path}[${i}]`, out))
      return out
    case 'tuple':
      if (!Array.isArray(value) || value.length !== schema.items.length) return bad(`expected a list of exactly ${schema.items.length} items`)
      schema.items.forEach((x, i) => validate(x, value[i], `${path}[${i}]`, out))
      return out
    case 'object': {
      if (typeOf(value) !== 'object') return bad(`expected an object, got ${typeOf(value)}`)
      const o = value as Record<string, unknown>
      for (const k of Object.keys(o)) if (!Object.hasOwn(schema.fields, k) && k !== '$schema') bad(`unknown field "${k}"`)
      for (const [k, f] of Object.entries(schema.fields)) {
        if (o[k] === undefined) { if (!schema.optional.has(k)) bad(`missing field "${k}"`); continue }
        validate(f, o[k], path ? `${path}.${k}` : k, out)
      }
      return out
    }
    case 'anyOf': {
      for (const x of schema.options) if (!validate(x, value).length) return out
      return bad(`${show(value)} does not fit (${schema.options.map(describe).join(' or ')})`)
    }
    case 'variants': {
      if (typeOf(value) !== 'object') return bad(`expected an object, got ${typeOf(value)}`)
      const tag = (value as Record<string, unknown>)[schema.key]
      const c = typeof tag === 'string' && Object.hasOwn(schema.cases, tag) ? schema.cases[tag] : undefined
      if (!c) return bad(`unknown ${schema.key} ${show(tag)} (allowed: ${Object.keys(schema.cases).join(', ')})`)
      const { [schema.key]: _, ...rest } = value as Record<string, unknown>
      return validate(c, rest, path, out)
    }
  }
  return out
}

const describe = (x: S): string => (x.kind === 'number' ? (x.int ? 'whole number' : 'number') : x.kind === 'string' ? 'text' : x.kind)

// ——— JSON Schema (draft 2020-12) ———

type JS = { [k: string]: Json }

export function toJsonSchema(schema: S): JS {
  const d: JS = schema.description ? { description: schema.description } : {}
  switch (schema.kind) {
    case 'string': return { type: 'string', minLength: schema.min ?? 1, ...(schema.pattern ? { pattern: schema.pattern } : {}), ...d }
    case 'number': return { type: schema.int ? 'integer' : 'number', ...(schema.min !== undefined ? { minimum: schema.min } : {}), ...(schema.max !== undefined ? { maximum: schema.max } : {}), ...d }
    case 'boolean': return { type: 'boolean', ...d }
    case 'enum': return { enum: [...schema.values], ...d }
    case 'array': return { type: 'array', items: toJsonSchema(schema.item), ...(schema.min !== undefined ? { minItems: schema.min } : {}), ...(schema.max !== undefined ? { maxItems: schema.max } : {}), ...d }
    case 'tuple': return { type: 'array', prefixItems: schema.items.map(toJsonSchema), minItems: schema.items.length, maxItems: schema.items.length, ...d }
    case 'object': return object(schema, {}, d)
    case 'anyOf': return { anyOf: schema.options.map(toJsonSchema), ...d }
    case 'variants': return variants(schema, {}, d)
  }
  return {}
}

/** `extra` = fields fixed by an outer variants (a widget block keeps its `"type": "widget"`). */
function variants(v: VariantsS, extra: JS, d: JS = {}): JS {
  const tags = Object.keys(v.cases)
  // if/then per case: editors then report errors of the matching case only, not of every alternative.
  return {
    type: 'object', required: [v.key],
    properties: { [v.key]: { enum: tags } },
    allOf: tags.map((t) => ({
      if: { properties: { [v.key]: { const: t } }, required: [v.key] },
      then: caseSchema(v.cases[t], { ...extra, [v.key]: { const: t } }),
    })),
    ...d,
  }
}

const caseSchema = (c: ObjectS | VariantsS, extra: JS): JS => (c.kind === 'object' ? object(c, extra) : variants(c, extra, c.description ? { description: c.description } : {}))

function object(o: ObjectS, extra: JS, d: JS = {}): JS {
  const properties: JS = { $schema: { type: 'string' }, ...extra }
  for (const [k, f] of Object.entries(o.fields)) properties[k] = toJsonSchema(f)
  const required = [...Object.keys(extra), ...Object.keys(o.fields).filter((k) => !o.optional.has(k))]
  return { type: 'object', properties, required, additionalProperties: false, ...(o.description ? { description: o.description } : {}), ...d }
}

// ——— Docs ———

/** One line per field for docs and the gallery: [name, type, required, description]. */
export function fieldRows(o: ObjectS, prefix = ''): [string, string, boolean, string][] {
  return Object.entries(o.fields).flatMap(([k, f]) => {
    const name = prefix + k
    const row: [string, string, boolean, string] = [name, typeLabel(f), !o.optional.has(k), f.description ?? '']
    const inner = f.kind === 'array' && f.item.kind === 'object' ? fieldRows(f.item, `${name}[].`) : f.kind === 'object' ? fieldRows(f, `${name}.`) : []
    return [row, ...inner]
  })
}

const range = (min: number | undefined, max: number | undefined, unit: string) =>
  min !== undefined && max !== undefined ? (min === max ? ` ${min}${unit}` : ` ${min}–${max}${unit}`) : min !== undefined ? ` ≥ ${min}${unit}` : max !== undefined ? ` ≤ ${max}${unit}` : ''

export function typeLabel(x: S): string {
  switch (x.kind) {
    case 'string': return 'text'
    case 'number': return (x.int ? 'celé číslo' : 'číslo') + range(x.min, x.max, '')
    case 'boolean': return 'true / false'
    case 'enum': return x.values.map((v) => `"${v}"`).join(' | ')
    case 'array': return `seznam (${typeLabel(x.item)})${range(x.min, x.max, ' položek')}`
    case 'tuple': return `[${x.items.map(typeLabel).join(', ')}]`
    case 'object': return 'objekt'
    case 'anyOf': return x.options.map(typeLabel).join(' | ')
    case 'variants': return `objekt podle "${x.key}"`
  }
  return ''
}
