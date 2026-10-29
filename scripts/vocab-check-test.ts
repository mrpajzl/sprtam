// Typed vocabulary answers of every language (src/vocab/check.ts) and recording file names (src/vocab/slug.ts): npx tsx scripts/vocab-check-test.ts
import { check } from '../src/vocab/check'
import { wordSlug } from '../src/vocab/slug'
const cases: [string, string, string][] = [
  ['der Hund', 'der Hund', 'ok'], ['Der hund', 'der Hund', 'ok'], ['die Hund', 'der Hund', 'bad'], ['Hund', 'der Hund', 'bad'],
  ['uber', 'über', 'typo'], ['über', 'über', 'ok'], ['strasse', 'die Straße', 'bad'], ['die Strasse', 'die Straße', 'typo'],
  ["l'arbre", "l'arbre (m)", 'ok'], ["l’arbre (m)", "l'arbre (m)", 'ok'], ['ecole', "l'école (f)", 'bad'], ["l'ecole", "l'école (f)", 'typo'],
  ['el nino', 'el niño', 'typo'], ['manana', 'mañana', 'typo'], ['¿qué?', 'qué', 'ok'], ['dog', 'dog', 'ok'], ['dig', 'dog', 'bad'], ['housr', 'house', 'typo'],
]
let bad = 0
for (const [t, a, want] of cases) { const got = check(t, a); if (got !== want) { bad++; console.log('✗', t, a, got, want) } }
const slugs = [wordSlug('de', 'schön'), wordSlug('de', 'schon'), wordSlug('es', 'sí'), wordSlug('es', 'si'), wordSlug('en', "don't")]
if (new Set(slugs).size !== slugs.length || slugs[4] !== 'dont') { bad++; console.log('✗ slugs', slugs) }
console.log(bad ? `${bad} failed` : 'all ok'); process.exit(bad ? 1 : 0)
