// Prints written-arithmetic layouts as text: npx tsx scripts/column-test.tsx
import { _layout } from '../src/widgets/column'
const show = (name: string, L: ReturnType<typeof _layout.divide>) => {
  console.log(`\n=== ${name}`)
  L.rows.forEach((row, r) => console.log((L.lines.includes(r) ? '‾'.repeat(L.width) + '\n' : '') + row.map((c) => (c ? (c.kind === 'carry' ? c.ch : c.ch) : ' ')).join('')))
  L.steps.forEach((s, i) => console.log(`  ${i + 1}. ${s.text}`))
}
show('832 − 457', _layout.addSub('832', '457', true))
show('345 + 278', _layout.addSub('345', '278', false))
show('8450 − 3975', _layout.addSub('8450', '3975', true))
show('1506 + 2897', _layout.addSub('1506', '2897', false))
show('12,5 + 3,75', _layout.addSub('12,5', '3,75', false))
show('1000 − 1', _layout.addSub('1000', '1', true))
show('95 + 7', _layout.addSub('95', '7', false))
show('456 · 7', _layout.multiply('456', '7'))
show('345 · 23', _layout.multiply('345', '23'))
show('8450 : 5', _layout.divide('8450', '5'))
show('125 : 5', _layout.divide('125', '5'))
show('9874 : 7', _layout.divide('9874', '7'))
