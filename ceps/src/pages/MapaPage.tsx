import { useEffect, useMemo, useRef, useState } from 'react'
import { db } from '../firebase'
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  CircleMarker,
  Tooltip as LeafletTooltip,
} from 'react-leaflet'
import type { CircleMarker as LCircleMarker, Map as LMap } from 'leaflet'
import L from 'leaflet'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { fetchCoverage, findCoverageAt, coverageBounds, geocodeAddress, type CoverageData } from '../lib/coverageMap'
import { fetchCepWithFallback, normalizeCepInput, CepLookupError } from '../lib/cepLookup'
import { subscribeCondominios } from '../lib/condominiosFirestore'
import { CONDOMINIO_CATEGORIA_LABELS, type Condominio, type CondominioCategoria } from '../types/condominio'

// ── Pin SVG para resultado de busca ──────────────────────────────────────────
function makePin(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
    <path d="M16 0C7.7 0 1 6.7 1 15c0 10.5 13.1 25.2 13.7 25.8a1.8 1.8 0 0 0 2.6 0C17.9 40.2 31 25.5 31 15 31 6.7 24.3 0 16 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
    <circle cx="16" cy="15" r="5.5" fill="#fff"/>
  </svg>`
  return L.divIcon({ className: '', html: svg, iconSize: [32, 42], iconAnchor: [16, 42], popupAnchor: [0, -38] })
}

// ── Tipos internos ────────────────────────────────────────────────────────────
type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: CoverageData }
type SearchResult = { lat: number; lng: number; label: string; covered: boolean; bairro: string | null; precise: boolean }
type LocatedCondominio = Condominio & { lat: number; lng: number }

function isLocated(c: Condominio): c is LocatedCondominio {
  return c.lat != null && c.lng != null && c.geocodeStatus === 'ok'
}

function shortName(name?: string): string {
  const first = name?.split(';')[0]?.trim()
  return first || 'Sem nome'
}

function parseAddressText(text: string): { street: string; number: string } | null {
  const matches = [...text.matchAll(/\b(\d{1,5}[A-Za-z]?)\b/g)]
  const last = matches.at(-1)
  if (!last || last.index == null) return null
  const street = text.slice(0, last.index).trim().replace(/[,\s]+$/, '').trim()
  if (!street) return null
  return { street, number: last[1]! }
}

// ── Marcador de condomínio ────────────────────────────────────────────────────
function CondoMarker({ condo, color, selected, onSelect }: { condo: LocatedCondominio; color: string; selected: boolean; onSelect: () => void }) {
  const ref = useRef<LCircleMarker | null>(null)
  useEffect(() => { if (selected) ref.current?.openPopup() }, [selected])
  return (
    <CircleMarker
      ref={ref}
      center={[condo.lat, condo.lng]}
      radius={selected ? 11 : 7}
      pathOptions={{ color: selected ? color : '#fff', weight: selected ? 3 : 1.5, fillColor: color, fillOpacity: 0.9 }}
      eventHandlers={{ click: onSelect }}
    >
      <Popup>
        <strong>{condo.nome}</strong><br />
        {CONDOMINIO_CATEGORIA_LABELS[condo.categoria]}
        {condo.bairro ? ` · ${condo.bairro}` : ''}
        {condo.rua ? <><br />{[condo.rua, condo.numero].filter(Boolean).join(', ')}</> : null}
        {condo.obs ? <><br /><em>{condo.obs}</em></> : null}
      </Popup>
    </CircleMarker>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
function openInTab() {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') + '?full=1' })
}

export function MapaPage({ isFullMode }: { isFullMode: boolean }) {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchMsg, setSearchMsg] = useState<{ text: string; type: 'success' | 'error' | 'warn' } | null>(null)
  const [result, setResult] = useState<SearchResult | null>(null)
  const mapRef = useRef<LMap | null>(null)
  const fittedRef = useRef(false)

  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [filters, setFilters] = useState<Record<CondominioCategoria, boolean>>({ viavel: true, inviavel: true })
  const [selectedCondoId, setSelectedCondoId] = useState<string | null>(null)

  // Carrega polígonos de cobertura
  const load = () => {
    const ctrl = new AbortController()
    setLoadState({ status: 'loading' })
    fetchCoverage(ctrl.signal)
      .then((data) => setLoadState({ status: 'ready', data }))
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return
        setLoadState({ status: 'error', message: err instanceof Error ? err.message : 'Erro ao carregar mapa.' })
      })
    return ctrl
  }

  useEffect(() => { const c = load(); return () => c.abort() }, [])

  // Subscreve condomínios em tempo real
  useEffect(() => {
    return subscribeCondominios(db, setCondominios, () => setCondominios([]))
  }, [])

  const coverage = loadState.status === 'ready' ? loadState.data : null

  const polygonsFc = useMemo<FeatureCollection<Geometry, { name?: string }>>(
    () => ({ type: 'FeatureCollection', features: (coverage?.polygons ?? []) as Feature<Geometry, { name?: string }>[] }),
    [coverage],
  )

  // Ajusta enquadramento uma única vez ao carregar
  useEffect(() => {
    if (!coverage || fittedRef.current || !mapRef.current) return
    const bounds = coverageBounds(coverage)
    if (bounds) { mapRef.current.fitBounds(bounds, { padding: [24, 24] }); fittedRef.current = true }
  }, [coverage])

  const locatedCondos = useMemo(() => condominios.filter(isLocated), [condominios])
  const visibleCondos = useMemo(() => locatedCondos.filter((c) => filters[c.categoria]), [locatedCondos, filters])

  const condoCounts = useMemo(() => ({
    viavel: locatedCondos.filter((c) => c.categoria === 'viavel').length,
    inviavel: locatedCondos.filter((c) => c.categoria === 'inviavel').length,
  }), [locatedCondos])

  const condoColor = (cat: CondominioCategoria) => cat === 'viavel' ? '#00b353' : '#c62828'

  const toggleFilter = (cat: CondominioCategoria) =>
    setFilters((prev) => ({ ...prev, [cat]: !prev[cat] }))

  const handleSearch = async () => {
    if (!coverage) return
    setSearchMsg(null); setResult(null); setSearching(true)
    try {
      const typed = endereco.trim()
      let bairroHint: string | null = null
      let cepLogradouro = ''
      let cepAddress = ''

      const digits = normalizeCepInput(cep)
      if (digits.length === 8) {
        const found = await fetchCepWithFallback(digits)
        if (found.uf && found.uf !== 'MG') throw new CepLookupError('Este CEP não pertence a Minas Gerais.')
        cepLogradouro = found.logradouro
        bairroHint = found.bairro || null
        cepAddress = [found.logradouro, found.bairro].filter(Boolean).join(', ')
        if (!typed && cepAddress) setEndereco(cepAddress)
      }

      const query = typed || cepAddress || (digits.length === 8 ? `CEP ${cep}` : '')
      if (!query) throw new CepLookupError('Informe um CEP ou endereço.')

      const parsed = typed ? parseAddressText(typed) : null
      const street = cepLogradouro || parsed?.street || typed
      const number = parsed?.number

      const geo = await geocodeAddress(
        number ? `${street}, ${number}` : street || query,
        bairroHint ?? undefined,
      )
      if (!geo) throw new CepLookupError('Endereço não localizado. Tente incluir o número e o bairro.')

      const match = findCoverageAt(coverage, { lat: geo.lat, lng: geo.lng })
      const next: SearchResult = { lat: geo.lat, lng: geo.lng, label: query, covered: match != null, bairro: match?.properties?.name ?? bairroHint, precise: geo.precise }
      setResult(next)
      mapRef.current?.flyTo([geo.lat, geo.lng], geo.precise ? 17 : 16, { duration: 0.8 })
    } catch (e: unknown) {
      const text = e instanceof CepLookupError ? e.message : e instanceof Error ? e.message : 'Erro ao pesquisar.'
      setSearchMsg({ text, type: 'warn' })
    } finally {
      setSearching(false)
    }
  }

  const handleClear = () => { setCep(''); setEndereco(''); setResult(null); setSearchMsg(null) }

  return (
    <div className="mapa-root">
      {/* Cabeçalho */}
      <header className="mapa-header">
        <div className="mapa-brand">
          <div className="mapa-brand-dot" />
          <span className="mapa-brand-name">MZ NET</span>
          <span className="mapa-brand-sep">|</span>
          <span className="mapa-brand-sub">Mapa de Cobertura</span>
        </div>
        {!isFullMode && (
          <button className="btn-logout" onClick={openInTab} title="Abrir em janela completa">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
            </svg>
            Expandir
          </button>
        )}
      </header>

      {/* Painel de busca */}
      <div className="mapa-panel">
        <div className="mapa-fields">
          <div className="field-group field-cep">
            <label>CEP</label>
            <input
              type="text"
              placeholder="38400-000"
              value={cep}
              maxLength={9}
              inputMode="numeric"
              onChange={(e) => {
                const d = normalizeCepInput(e.target.value)
                setCep(d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d)
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch() }}
            />
          </div>
          <div className="field-group field-end">
            <label>Endereço</label>
            <input
              type="text"
              placeholder="Ex.: Av. Rondon Pacheco, 500, Tibery"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch() }}
            />
          </div>
          <button className="btn-primary" onClick={() => void handleSearch()} disabled={searching || loadState.status !== 'ready'}>
            {searching
              ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Buscando…</>
              : <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                  Verificar
                </>
            }
          </button>
          <button className="btn-clear" onClick={handleClear}>Limpar</button>
        </div>

        {(searchMsg || result) && (
          <div className="mapa-result">
            {searchMsg && (
              <div className={`alert alert-${searchMsg.type}`}>
                <span>{searchMsg.text}</span>
              </div>
            )}
            {result && (
              <div className={`alert alert-${result.covered ? 'success' : 'error'}`}>
                <b>{result.covered ? '✓ Dentro da área de cobertura' : '✗ Fora da área de cobertura'}</b>
                <span>{result.label}{result.bairro ? ` · ${result.bairro}` : ''}</span>
                {!result.precise && <span style={{ fontSize: 11, opacity: 0.75 }}> — localização aproximada da via</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtros de condomínios */}
      <div className="mapa-filters">
        <span className="filter-label">Condomínios:</span>
        {(['viavel', 'inviavel'] as CondominioCategoria[]).map((cat) => (
          <button
            key={cat}
            className={`filter-toggle ${cat}${filters[cat] ? ' active' : ''}`}
            onClick={() => toggleFilter(cat)}
          >
            <div className={`filter-dot ${cat}`} />
            {CONDOMINIO_CATEGORIA_LABELS[cat]} ({condoCounts[cat]})
          </button>
        ))}
      </div>

      {/* Mapa */}
      <div className="mapa-map">
        {loadState.status === 'loading' && (
          <div className="map-loading">
            <div className="spinner" />
            <p>Carregando mapa de cobertura…</p>
          </div>
        )}
        {loadState.status === 'error' && (
          <div className="map-error">
            <p>{loadState.message}</p>
            <button className="btn-primary" onClick={load}>Tentar novamente</button>
          </div>
        )}

        <MapContainer
          center={[-18.9186, -48.2772]}
          zoom={12}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
          ref={(i) => { mapRef.current = i }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {coverage && (
            <GeoJSON
              key={`cov-${polygonsFc.features.length}`}
              data={polygonsFc}
              interactive={false}
              style={() => ({ color: '#00b353', weight: 1.5, fillColor: '#00b353', fillOpacity: 0.35 })}
              onEachFeature={(feature, layer) => {
                const name = (feature as Feature<Geometry, { name?: string }>).properties?.name
                if (name) layer.bindTooltip(shortName(name), { sticky: true })
              }}
            />
          )}

          {visibleCondos.map((c) => (
            <CondoMarker
              key={c.id}
              condo={c}
              color={condoColor(c.categoria)}
              selected={c.id === selectedCondoId}
              onSelect={() => {
                setSelectedCondoId(c.id)
                mapRef.current?.flyTo([c.lat, c.lng], 17, { duration: 0.7 })
              }}
            />
          ))}

          {coverage?.points.map((p, i) => {
            if (p.geometry?.type !== 'Point') return null
            const [lng, lat] = p.geometry.coordinates
            return (
              <CircleMarker key={`pt-${i}`} center={[lat!, lng!]} radius={5}
                pathOptions={{ color: '#1565c0', fillColor: '#1565c0', fillOpacity: 0.85, weight: 1 }}>
                <LeafletTooltip>{shortName(p.properties?.name)}</LeafletTooltip>
              </CircleMarker>
            )
          })}

          {result && (
            <Marker position={[result.lat, result.lng]} icon={makePin(result.covered ? '#00b353' : '#c62828')}>
              <Popup>
                <strong>{result.covered ? 'Dentro da cobertura' : 'Fora da cobertura'}</strong><br />
                {result.label}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  )
}
