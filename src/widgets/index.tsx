import type { WidgetDef } from './kit'
import angle from './angle'
import balance from './balance'
import bars from './bars'
import clock from './clock'
import column from './column'
import counter from './counter'
import cycle from './cycle'
import flip from './flip'
import fraction from './fraction'
import gap from './gap'
import linear from './linear'
import multiply from './multiply'
import multipleCircle from './multiple-circle'
import numberLine from './number-line'
import parts from './parts'
import percent from './percent'
import placeValue from './place-value'
import pythagoras from './pythagoras'
import quadratic from './quadratic'
import shape from './shape'
import sort from './sort'
import timeline from './timeline'

// Every widget, by name. A new widget = a new file + one line here (scripts/check-content.ts
// fails when a file in src/widgets is missing from this list). Grouped as in the gallery (/widgety).
export const WIDGET_GROUPS: { name: string; widgets: WidgetDef[] }[] = [
  { name: 'Čísla a počítání', widgets: [counter, numberLine, placeValue, column, multiply, multipleCircle, fraction, percent, clock] },
  { name: 'Geometrie a funkce', widgets: [angle, shape, pythagoras, balance, linear, quadratic] },
  { name: 'Text, třídění a souvislosti', widgets: [flip, sort, gap, parts, cycle, timeline, bars] },
]

export const WIDGETS: Record<string, WidgetDef> = Object.fromEntries(WIDGET_GROUPS.flatMap((g) => g.widgets).map((w) => [w.name, w]))

/** A widget as used in content: name + props. */
export interface WidgetRef { widget: string; props: Record<string, unknown> }

export function WidgetView({ w }: { w: WidgetRef }) {
  const C = WIDGETS[w.widget]?.Component
  return C ? <C {...w.props} /> : null
}

/** The widget's task above a quiz question (never shows the answer). */
export function WidgetQuestion({ w }: { w: WidgetRef }) {
  const C = WIDGETS[w.widget]?.Question
  return C ? <C {...w.props} /> : null
}
