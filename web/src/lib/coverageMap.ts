import { kml } from '@tmcw/togeojson'
import type {
  Feature,
  FeatureCollection,
  Geometry,
  Position,
} from 'geojson'

/** ID do mapa "MZ NET" no Google My Maps (camada pública de cobertura). */
export const COVERAGE_MID = '1W78joEfkyIPieGT57NwcHA9s5BYH1Mbb'

/**
 * Export público de KML do My Maps. `forcekml=1` garante KML (e não KMZ) e o
 * endpoint responde com `Access-Control-Allow-Origin: *`, então o fetch direto
 * pelo navegador funciona sem proxy — dado sempre atualizado em runtime.
 */
const KML_URL = `https://www.google.com/maps/d/kml?mid=${COVERAGE_MID}&forcekml=1`

export type LatLng = { lat: number; lng: number }

export type CoverageFeature = Feature<Geometry, { name?: string }>

export type CoverageData = {
  /** Polígonos de cobertura por bairro (camada COBERTURA). */
  polygons: CoverageFeature[]
  /** Pontos com coordenadas (condomínios/celurização geocodificados). */
  points: CoverageFeature[]
}

/** Busca o KML do My Maps e separa polígonos de cobertura e pontos. */
export async function fetchCoverage(signal?: AbortSignal): Promise<CoverageData> {
  const res = await fetch(KML_URL, { signal })
  if (!res.ok) {
    throw new Error(`Falha ao carregar o mapa de cobertura (HTTP ${res.status}).`)
  }
  const text = await res.text()
  const dom = new DOMParser().parseFromString(text, 'application/xml')
  const geojson = kml(dom) as FeatureCollection<Geometry, { name?: string }>

  const polygons: CoverageFeature[] = []
  const points: CoverageFeature[] = []
  for (const feature of geojson.features) {
    const type = feature.geometry?.type
    if (type === 'Polygon' || type === 'MultiPolygon') {
      polygons.push(feature)
    } else if (type === 'Point') {
      points.push(feature)
    }
  }
  return { polygons, points }
}

/** Ray-casting para um anel linear. `pt` e `ring` em [lng, lat]. */
function pointInRing(pt: [number, number], ring: Position[]): boolean {
  const [x, y] = pt
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]![0]!
    const yi = ring[i]![1]!
    const xj = ring[j]![0]!
    const yj = ring[j]![1]!
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

function pointInGeometry(pt: [number, number], geom: Geometry): boolean {
  if (geom.type === 'Polygon') {
    const [outer, ...holes] = geom.coordinates
    if (!outer || !pointInRing(pt, outer)) return false
    return !holes.some((hole) => pointInRing(pt, hole))
  }
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.some((poly) => {
      const [outer, ...holes] = poly
      if (!outer || !pointInRing(pt, outer)) return false
      return !holes.some((hole) => pointInRing(pt, hole))
    })
  }
  return false
}

/** Retorna o polígono de cobertura que contém o ponto, ou `null`. */
export function findCoverageAt(
  coverage: CoverageData,
  ll: LatLng,
): CoverageFeature | null {
  const pt: [number, number] = [ll.lng, ll.lat]
  for (const feature of coverage.polygons) {
    if (feature.geometry && pointInGeometry(pt, feature.geometry)) {
      return feature
    }
  }
  return null
}

/** Bounding box de todos os polígonos: `[[sul, oeste], [norte, leste]]`. */
export function coverageBounds(
  coverage: CoverageData,
): [[number, number], [number, number]] | null {
  let minLat = Infinity
  let minLng = Infinity
  let maxLat = -Infinity
  let maxLng = -Infinity

  const visit = (coords: Position | Position[] | Position[][] | Position[][][]) => {
    if (typeof (coords as Position)[0] === 'number') {
      const [lng, lat] = coords as Position
      if (lat! < minLat) minLat = lat!
      if (lat! > maxLat) maxLat = lat!
      if (lng! < minLng) minLng = lng!
      if (lng! > maxLng) maxLng = lng!
      return
    }
    for (const c of coords as Position[]) {
      visit(c as unknown as Position)
    }
  }

  for (const feature of coverage.polygons) {
    if (feature.geometry && 'coordinates' in feature.geometry) {
      visit(feature.geometry.coordinates as Position[][])
    }
  }

  if (minLat === Infinity) return null
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ]
}

export type GeocodeResult = {
  lat: number
  lng: number
  displayName: string
  /** `true` quando o geocoder casou o número da casa (não só a via). */
  precise: boolean
  source: 'mapbox' | 'osm'
}

export type GeocodeOptions = {
  /** Bairro (ex.: do CEP) usado para desempatar resultados no OSM. */
  bairro?: string
  signal?: AbortSignal
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

// Caixa aproximada de Uberlândia-MG: oeste, sul, leste, norte.
const UBERLANDIA_BBOX = { west: -48.45, south: -19.02, east: -48.1, north: -18.78 }
const UBERLANDIA_CENTER = { lng: -48.2772, lat: -18.9186 }

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Geocodifica via Mapbox (interpola número da casa). Restringe a Uberlândia
 * por bbox + proximity. Retorna `null` se não houver token ou resultado.
 */
async function geocodeMapbox(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodeResult | null> {
  if (!MAPBOX_TOKEN) return null
  const params = new URLSearchParams({
    q: `${query}, Uberlândia, MG`,
    country: 'br',
    language: 'pt',
    limit: '1',
    proximity: `${UBERLANDIA_CENTER.lng},${UBERLANDIA_CENTER.lat}`,
    bbox: `${UBERLANDIA_BBOX.west},${UBERLANDIA_BBOX.south},${UBERLANDIA_BBOX.east},${UBERLANDIA_BBOX.north}`,
    access_token: MAPBOX_TOKEN,
  })
  const res = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`,
    { signal },
  )
  if (!res.ok) return null
  const data = (await res.json()) as {
    features?: Array<{
      geometry?: { coordinates?: [number, number] }
      properties?: { feature_type?: string; full_address?: string; name?: string }
    }>
  }
  const feature = data.features?.[0]
  const coords = feature?.geometry?.coordinates
  if (!coords) return null
  const props = feature?.properties ?? {}
  return {
    lng: coords[0],
    lat: coords[1],
    displayName: props.full_address ?? props.name ?? query,
    precise: props.feature_type === 'address',
    source: 'mapbox',
  }
}

/**
 * Fallback via Nominatim (OpenStreetMap), sem chave. Quando há `bairro`,
 * escolhe entre os candidatos aquele cujo subúrbio casa com o bairro — assim
 * pega o trecho correto da via em vez do ponto representativo padrão.
 */
async function geocodeNominatim(
  query: string,
  bairro: string | undefined,
  signal?: AbortSignal,
): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({
    format: 'jsonv2',
    limit: '6',
    addressdetails: '1',
    countrycodes: 'br',
    viewbox: `${UBERLANDIA_BBOX.west},${UBERLANDIA_BBOX.north},${UBERLANDIA_BBOX.east},${UBERLANDIA_BBOX.south}`,
    bounded: '1',
    q: `${query}, Uberlândia, MG`,
  })
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { signal, headers: { Accept: 'application/json' } },
  )
  if (!res.ok) return null
  const data = (await res.json()) as Array<{
    lat: string
    lon: string
    display_name: string
    address?: { house_number?: string; suburb?: string; neighbourhood?: string }
  }>
  if (!Array.isArray(data) || data.length === 0) return null

  const wanted = bairro ? normalize(bairro) : null
  const byBairro = wanted
    ? data.find((d) => {
        const sub = d.address?.suburb ?? d.address?.neighbourhood
        return sub != null && normalize(sub) === wanted
      })
    : undefined
  const chosen = byBairro ?? data[0]!
  return {
    lat: Number.parseFloat(chosen.lat),
    lng: Number.parseFloat(chosen.lon),
    displayName: chosen.display_name,
    precise: chosen.address?.house_number != null,
    source: 'osm',
  }
}

/**
 * Geocodifica um endereço. Usa Mapbox quando há `VITE_MAPBOX_TOKEN` (precisão
 * com número da casa) e cai para o Nominatim caso contrário.
 */
export async function geocodeAddress(
  query: string,
  opts: GeocodeOptions = {},
): Promise<GeocodeResult | null> {
  const viaMapbox = await geocodeMapbox(query, opts.signal)
  if (viaMapbox) return viaMapbox
  return geocodeNominatim(query, opts.bairro, opts.signal)
}
