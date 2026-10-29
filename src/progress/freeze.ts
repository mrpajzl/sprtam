// While the pupil is being switched (profiles.ts), nothing may write the progress: another tab's save could
// otherwise put one child's progress into the other's. Set once and never cleared – the page reloads.
export let frozen = false
export const freeze = () => { frozen = true }
