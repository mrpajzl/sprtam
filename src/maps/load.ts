import type { MapData, Source } from '.'

// The outlines (src/maps/data/*.json, 25–200 kB) load only when a map is opened; the app precaches them for offline use.

const cache = new Map<Source, Promise<MapData>>()
const loaders: Record<Source, () => Promise<{ default: unknown }>> = {
  svet: () => import('./data/svet.json'),
  evropa: () => import('./data/evropa.json'),
  kraje: () => import('./data/kraje.json'),
}

export function loadMap(s: Source): Promise<MapData> {
  let p = cache.get(s)
  if (!p) {
    p = loaders[s]().then((m) => m.default as MapData)
    p.catch(() => cache.delete(s))
    cache.set(s, p)
  }
  return p
}
