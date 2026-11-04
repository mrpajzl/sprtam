/**
 * "Celé téma jsem ověřil/a": approving a change checks only what changed, so the topic becomes verified only when
 * its author went through all of it – and then in the author's name, not the reviewer's.
 */
export function WholeTopicCheck({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label class={`whole-check${checked ? ' on' : ''}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.currentTarget.checked)} />
      <span>
        <b>Celé téma jsem ověřil/a</b>
        <small>Prošel/prošla jsem všechna vysvětlení a všechny otázky s odpověďmi, nejen svou změnu. Po schválení bude téma ověřené tvým jménem. Bez zaškrtnutí se zveřejní jen změna – neověřené téma zůstane neověřené.</small>
      </span>
    </label>
  )
}
