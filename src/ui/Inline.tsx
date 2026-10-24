import type { JSX } from 'preact'

// Renders **bold**, *italic* and `code` inside content strings.
export function Inline({ text }: { text: string }) {
  const out: (string | JSX.Element)[] = []
  const re = /\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*|\^([+−-]?(?:[IVX]+|[0-9]+)[+−-]?|[+−-])/g
  let last = 0, m: RegExpExecArray | null, i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(m[1] ? <strong key={i++}>{m[1]}</strong> : m[2] ? <code key={i++}>{m[2]}</code> : m[3] ? <em key={i++}>{m[3]}</em> : <sup key={i++}>{m[4]}</sup>)
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return <>{out}</>
}
