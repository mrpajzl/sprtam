/** File name of a word's recording: public/audio/en/<slug>.mp3 (see scripts/vocab-audio.ts). */
export const audioSlug = (en: string) => en.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
