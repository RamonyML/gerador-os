import { kml } from '@tmcw/togeojson'
import type { Feature, FeatureCollection, Geometry, GeometryCollection, Position } from 'geojson'

const KML_URL = '/coverage.kml'

export type LatLng = { lat: number; lng: number }
export type CoverageFeature = Feature<Geometry, { name?: string }>
export type CoverageData = { polygons: CoverageFeature[]; points: CoverageFeature[] }

export async function fetchCoverage(signal?: AbortSignal): Promise<CoverageData> {
  const res = await fetch(KML_URL, { signal })
  if (!res.ok) throw new Error(`Falha ao carregar o mapa (HTTP ${res.status}).`)
  const text = await res.text()
  const dom = new DOMParser().parseFromString(text, 'application/xml')
  const geojson = kml(dom) as FeatureCollection<Geometry, { name?: string }>
  const polygons: CoverageFeature[] = []
  const points: CoverageFeature[] = []
  for (const f of geojson.features) {
    const t = f.geometry?.type
    if (t === 'Polygon' || t === 'MultiPolygon') {
      polygons.push(f)
    } else if (t === 'GeometryCollection') {
      const gc = f.geometry as GeometryCollection
      if (gc.geometries.some((g) => g.type === 'Polygon' || g.type === 'MultiPolygon')) {
        polygons.push(f)
      }
    } else if (t === 'Point') {
      points.push(f)
    }
  }
  return { polygons, points }
}

function pointInRing(pt: [number, number], ring: Position[]): boolean {
  const [x, y] = pt
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]![0]!, yi = ring[i]![1]!
    const xj = ring[j]![0]!, yj = ring[j]![1]!
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function pointInGeometry(pt: [number, number], geom: Geometry): boolean {
  if (geom.type === 'Polygon') {
    const [outer, ...holes] = geom.coordinates
    if (!outer || !pointInRing(pt, outer)) return false
    return !holes.some((h) => pointInRing(pt, h))
  }
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.some((poly) => {
      const [outer, ...holes] = poly
      if (!outer || !pointInRing(pt, outer)) return false
      return !holes.some((h) => pointInRing(pt, h))
    })
  }
  if (geom.type === 'GeometryCollection') {
    return geom.geometries.some((g) => pointInGeometry(pt, g))
  }
  return false
}

export function findCoverageAt(coverage: CoverageData, ll: LatLng): CoverageFeature | null {
  const pt: [number, number] = [ll.lng, ll.lat]
  for (const f of coverage.polygons) {
    if (f.geometry && pointInGeometry(pt, f.geometry)) return f
  }
  return null
}

export function coverageBounds(coverage: CoverageData): [[number, number], [number, number]] | null {
  let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity
  const visit = (coords: unknown) => {
    if (Array.isArray(coords) && typeof coords[0] === 'number') {
      const [lng, lat] = coords as [number, number]
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
      if (lng < minLng) minLng = lng
      if (lng > maxLng) maxLng = lng
      return
    }
    if (Array.isArray(coords)) coords.forEach(visit)
  }
  for (const f of coverage.polygons) {
    if (!f.geometry) continue
    if (f.geometry.type === 'GeometryCollection') {
      for (const g of f.geometry.geometries) {
        if ('coordinates' in g) visit(g.coordinates)
      }
    } else if ('coordinates' in f.geometry) {
      visit(f.geometry.coordinates)
    }
  }
  if (minLat === Infinity) return null
  return [[minLat, minLng], [maxLat, maxLng]]
}

const UBERLANDIA_BBOX = { west: -48.45, south: -19.02, east: -48.1, north: -18.78 }

export type GeocodeResult = { lat: number; lng: number; precise: boolean }

export async function geocodeAddress(query: string, bairro?: string): Promise<GeocodeResult | null> {
  const q = `${query}, Uberlândia, MG`
  const params = new URLSearchParams({
    format: 'jsonv2',
    limit: '6',
    addressdetails: '1',
    countrycodes: 'br',
    viewbox: `${UBERLANDIA_BBOX.west},${UBERLANDIA_BBOX.north},${UBERLANDIA_BBOX.east},${UBERLANDIA_BBOX.south}`,
    bounded: '1',
    q,
  })
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return null
  const data = await res.json() as Array<{ lat: string; lon: string; address?: { house_number?: string; suburb?: string; neighbourhood?: string } }>
  if (!data.length) return null

  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const hint = bairro ? normalize(bairro) : null
  const byBairro = hint
    ? data.find((d) => { const sub = d.address?.suburb ?? d.address?.neighbourhood; return sub != null && normalize(sub) === hint })
    : undefined
  const chosen = byBairro ?? data[0]!
  return { lat: Number.parseFloat(chosen.lat), lng: Number.parseFloat(chosen.lon), precise: chosen.address?.house_number != null }
}
