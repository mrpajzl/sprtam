import type { Widget } from '../content/types'
import { Angle, Balance, Clock, Counter, Fraction, Linear, Multiply, NumberLine, Percent, PlaceValue, Pythagoras, Quadratic, Shape } from './math'
import { Bars, Cycle, Flip, Gap, Parts, Sort, Timeline } from './generic'
import { Column } from './column'

const MAP: Record<Widget['w'], (p: any) => preact.JSX.Element> = {
  counter: Counter, numberline: NumberLine, fraction: Fraction, placevalue: PlaceValue, clock: Clock,
  multiply: Multiply, balance: Balance, angle: Angle, pythagoras: Pythagoras, linear: Linear, quadratic: Quadratic,
  percent: Percent, shape: Shape, timeline: Timeline, flip: Flip, sort: Sort, cycle: Cycle, parts: Parts, gap: Gap, bars: Bars, column: Column,
}

export function WidgetView({ w }: { w: Widget }) {
  const C = MAP[w.w]
  return C ? <C {...w.p} /> : null
}
