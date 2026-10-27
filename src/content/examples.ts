import type { Block, Question } from './types'

// One example of every block and question type – shown in the gallery (/widgety) and in docs/FORMAT.md,
// and validated by scripts/check-content.ts. A new block or question type must get an example here
// (the Record types make TypeScript insist on it).

export const BLOCK_EXAMPLES: { [T in Block['type']]: Extract<Block, { type: T }> } = {
  heading: { type: 'heading', text: 'O čem to je' },
  text: { type: 'text', text: 'Když krájíš pizzu na **stejné** díly, každý díl je *zlomek* celé pizzy.' },
  term: { type: 'term', term: 'Jmenovatel', definition: 'Číslo **pod** čarou. Říká, na kolik stejných dílů je celek rozdělený.', example: 'Ve zlomku 3/4 je jmenovatel 4.' },
  mistake: { type: 'mistake', wrong: '1/2 + 1/3 = 2/5', right: '1/2 + 1/3 = 3/6 + 2/6 = 5/6', why: 'Sčítat jde jen díly stejné velikosti – nejdřív stejný jmenovatel.' },
  summary: { type: 'summary', text: 'Zlomek = kolik dílů máš (nahoře) z kolika stejných dílů (dole).' },
  list: { type: 'list', items: ['čitatel je nahoře', 'jmenovatel je dole', 'zlomková čára znamená „děleno“'] },
  steps: { type: 'steps', items: ['Najdi společný jmenovatel.', 'Rozšiř oba zlomky.', 'Sečti čitatele, jmenovatel opiš.'] },
  example: {
    type: 'example', question: 'Vypočítej písemně 832 − 457.', answer: 'Odčítám od jednotek a doplňuji: **375**.',
    widget: { widget: 'column', props: { a: 832, b: 457, op: '-' } },
  },
  table: { type: 'table', head: ['', 'čitatel', 'jmenovatel'], rows: [['3/4', '3', '4'], ['5/8', '5', '8']] },
  picture: { type: 'picture', items: ['🍕', '🍕', '🍕', '⬜'], caption: 'Tři čtvrtiny pizzy' },
  widget: { type: 'widget', widget: 'fraction', props: { numerator: 3, denominator: 4 } },
}

export const QUESTION_EXAMPLES: { [T in Question['type']]: Extract<Question, { type: T }> } = {
  choice: { type: 'choice', question: 'Který zlomek je největší?', options: ['1/2', '1/3', '1/4'], answer: 0, explanation: 'Čím méně dílů, tím je každý větší.' },
  truefalse: { type: 'truefalse', question: '2/4 je totéž co 1/2.', answer: true, explanation: 'Čitatel i jmenovatel jde vydělit dvěma.' },
  input: {
    type: 'input', question: 'Vypočítej písemně: 345 + 278 =', answers: ['623'], explanation: 'Sčítej od jednotek, 1 si pamatuj.',
    widget: { widget: 'column', props: { a: 345, b: 278, op: '+' } },
    hints: ['Začni vpravo: sečti jednotky 5 + 8.', 'Je to víc než 9? Napiš jednotky a 1 si pamatuj k desítkám.'],
  },
  order: { type: 'order', question: 'Seřaď od nejmenšího.', items: ['1/8', '1/4', '1/2', '1'] },
  match: { type: 'match', question: 'Spoj zlomek s desetinným číslem.', pairs: [['1/2', '0,5'], ['1/4', '0,25'], ['3/4', '0,75']] },
  open: { type: 'open', question: 'Vysvětli, co znamená jmenovatel.', answer: 'Jmenovatel je číslo pod zlomkovou čarou. Říká, na kolik stejných dílů je celek rozdělený.' },
}
