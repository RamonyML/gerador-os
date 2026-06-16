import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import MyLocationOutlinedIcon from '@mui/icons-material/MyLocationOutlined'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded'
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  CircleMarker,
  Pane,
  Tooltip as LeafletTooltip,
} from 'react-leaflet'
import type { CircleMarker as LeafletCircleMarker, Map as LeafletMap, PathOptions } from 'leaflet'
import L from 'leaflet'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { Reveal } from '../components/Reveal'
import {
  coverageBounds,
  fetchCoverage,
  findCoverageAt,
  geocodeAddress,
  type CoverageData,
  type CoverageFeature,
} from '../lib/coverageMap'
import {
  CepLookupError,
  fetchCepWithFallback,
  normalizeCepInput,
} from '../lib/cepLookup'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { canAccessCondominios } from '../lib/condominiosAccess'
import { subscribeCondominios } from '../lib/condominiosFirestore'
import {
  CONDOMINIO_CATEGORIA_LABELS,
  type Condominio,
  type CondominioCategoria,
} from '../types/condominio'

// Corrige os ícones padrão do Leaflet quando empacotado pelo Vite.
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const UBERLANDIA_CENTER: [number, number] = [-18.9186, -48.2772]

/**
 * Pin desenhado em SVG (divIcon) — independente das imagens padrão do Leaflet,
 * que não carregam de forma confiável no bundle do Vite. A cor reflete o
 * resultado da busca (verde = coberto, vermelho = fora).
 */
function makePin(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 0C7.7 0 1 6.7 1 15c0 10.5 13.1 25.2 13.7 25.8a1.8 1.8 0 0 0 2.6 0C17.9 40.2 31 25.5 31 15 31 6.7 24.3 0 16 0z"
        fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="16" cy="15" r="5.5" fill="#ffffff"/>
    </svg>`
  return L.divIcon({
    className: 'coverage-result-pin',
    html: svg,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  })
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: CoverageData }

type SearchResult = {
  lat: number
  lng: number
  label: string
  covered: boolean
  bairro: string | null
  precise: boolean
}

/** Primeiro campo do nome (antes do `;`) — útil para os pontos em CSV. */
function shortName(name?: string): string {
  if (!name) return 'Sem nome'
  const first = name.split(';')[0]?.trim()
  return first || 'Sem nome'
}

/** Condomínio que já possui coordenadas e pode ser plotado no mapa. */
type LocatedCondominio = Condominio & { lat: number; lng: number }

function isLocated(c: Condominio): c is LocatedCondominio {
  return c.lat != null && c.lng != null && c.geocodeStatus === 'ok'
}

/**
 * Marcador de um condomínio no mapa. Reage à seleção crescendo e abrindo o
 * popup automaticamente — o que permite destacar o item escolhido na busca.
 */
function CondoMarker({
  condo,
  color,
  selected,
  onSelect,
}: {
  condo: LocatedCondominio
  color: string
  selected: boolean
  onSelect: (id: string) => void
}) {
  const ref = useRef<LeafletCircleMarker | null>(null)

  useEffect(() => {
    if (selected) ref.current?.openPopup()
  }, [selected])

  return (
    <CircleMarker
      ref={ref}
      center={[condo.lat, condo.lng]}
      radius={selected ? 11 : 7}
      pathOptions={{
        color: selected ? color : '#ffffff',
        weight: selected ? 3 : 1.5,
        fillColor: color,
        fillOpacity: 0.9,
      }}
      eventHandlers={{ click: () => onSelect(condo.id) }}
    >
      <Popup>
        <strong>{condo.nome}</strong>
        <br />
        {CONDOMINIO_CATEGORIA_LABELS[condo.categoria]}
        {condo.bairro ? ` · ${condo.bairro}` : ''}
        {[condo.rua, condo.numero].filter(Boolean).length > 0 ? (
          <>
            <br />
            {[condo.rua, condo.numero].filter(Boolean).join(', ')}
          </>
        ) : null}
        {condo.obs ? (
          <>
            <br />
            <em>{condo.obs}</em>
          </>
        ) : null}
      </Popup>
    </CircleMarker>
  )
}

export function CoberturaPage() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { profile } = useAuth()
  const canSeeCondominios = canAccessCondominios(profile)
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [result, setResult] = useState<SearchResult | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const fittedRef = useRef(false)

  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [condoFilters, setCondoFilters] = useState<
    Record<CondominioCategoria, boolean>
  >({ viavel: true, inviavel: true })
  const [selectedCondoId, setSelectedCondoId] = useState<string | null>(null)

  useEffect(() => {
    if (!canSeeCondominios) return
    const unsub = subscribeCondominios(
      db,
      (list) => setCondominios(list),
      () => setCondominios([]),
    )
    return unsub
  }, [canSeeCondominios])

  const locatedCondos = useMemo(
    () => condominios.filter(isLocated),
    [condominios],
  )

  const condoCounts = useMemo(
    () => ({
      viavel: locatedCondos.filter((c) => c.categoria === 'viavel').length,
      inviavel: locatedCondos.filter((c) => c.categoria === 'inviavel').length,
    }),
    [locatedCondos],
  )

  const missingLocation = useMemo(
    () => condominios.filter((c) => !isLocated(c)).length,
    [condominios],
  )

  const visibleCondos = useMemo(
    () => locatedCondos.filter((c) => condoFilters[c.categoria]),
    [locatedCondos, condoFilters],
  )

  const condoColor = (categoria: CondominioCategoria) =>
    categoria === 'viavel'
      ? theme.palette.success.main
      : theme.palette.error.main

  const handleSelectCondo = (condo: LocatedCondominio | null) => {
    if (!condo) {
      setSelectedCondoId(null)
      return
    }
    setSelectedCondoId(condo.id)
    if (!condoFilters[condo.categoria]) {
      setCondoFilters((prev) => ({ ...prev, [condo.categoria]: true }))
    }
    mapRef.current?.flyTo([condo.lat, condo.lng], 17, { duration: 0.8 })
  }

  const load = () => {
    const controller = new AbortController()
    setState({ status: 'loading' })
    fetchCoverage(controller.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const message =
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar o mapa de cobertura.'
        setState({ status: 'error', message })
      })
    return controller
  }

  useEffect(() => {
    const controller = load()
    return () => controller.abort()
  }, [])

  const coverage = state.status === 'ready' ? state.data : null

  const polygonsFc = useMemo<FeatureCollection<Geometry, { name?: string }>>(
    () => ({
      type: 'FeatureCollection',
      features: (coverage?.polygons ?? []) as Feature<Geometry, { name?: string }>[],
    }),
    [coverage],
  )

  // Ajusta o enquadramento aos polígonos uma única vez.
  useEffect(() => {
    if (!coverage || fittedRef.current) return
    const map = mapRef.current
    if (!map) return
    const bounds = coverageBounds(coverage)
    if (bounds) {
      map.fitBounds(bounds, { padding: [24, 24] })
      fittedRef.current = true
    }
  }, [coverage])

  const polygonStyle = useMemo<PathOptions>(
    () => ({
      color: theme.palette.success.main,
      weight: 1.5,
      fillColor: theme.palette.success.main,
      fillOpacity: isDark ? 0.28 : 0.22,
    }),
    [theme.palette.success.main, isDark],
  )

  const handleResolve = async () => {
    if (!coverage) return
    setSearchError(null)
    setResult(null)
    setSearching(true)
    try {
      const typed = endereco.trim()
      let bairroFromCep: string | null = null
      let cepAddress = ''

      const cepDigits = normalizeCepInput(cep)
      if (cepDigits.length === 8) {
        const found = await fetchCepWithFallback(cepDigits)
        if (found.uf && found.uf !== 'MG') {
          throw new CepLookupError('Este CEP não pertence a Minas Gerais.')
        }
        bairroFromCep = found.bairro || null
        cepAddress = [found.logradouro, found.bairro].filter(Boolean).join(', ')
        if (!typed && cepAddress) {
          setEndereco(cepAddress)
        }
      }

      // Preserva o que o operador digitou (inclui o número da casa). Só usa o
      // CEP para montar a busca quando o endereço não foi preenchido.
      const query =
        typed || cepAddress || (cepDigits.length === 8 ? `CEP ${cep}` : '')

      if (!query) {
        throw new CepLookupError('Informe um CEP ou um endereço para pesquisar.')
      }

      const geo = await geocodeAddress(query, { bairro: bairroFromCep ?? undefined })
      if (!geo) {
        throw new CepLookupError(
          'Endereço não localizado no mapa. Tente detalhar a rua, o número e o bairro.',
        )
      }

      const match = findCoverageAt(coverage, { lat: geo.lat, lng: geo.lng })
      const next: SearchResult = {
        lat: geo.lat,
        lng: geo.lng,
        label: query,
        covered: match != null,
        bairro: match?.properties?.name ?? bairroFromCep,
        precise: geo.precise,
      }
      setResult(next)
      mapRef.current?.flyTo([geo.lat, geo.lng], geo.precise ? 17 : 16, { duration: 0.8 })
    } catch (err: unknown) {
      const message =
        err instanceof CepLookupError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Não foi possível concluir a pesquisa.'
      setSearchError(message)
    } finally {
      setSearching(false)
    }
  }

  const handleClear = () => {
    setCep('')
    setEndereco('')
    setResult(null)
    setSearchError(null)
  }

  const totalBairros = coverage?.polygons.length ?? 0
  const totalPontos = coverage?.points.length ?? 0

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          <Reveal>
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
              >
                Cobertura · Fibra óptica
              </Typography>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}
              >
                Mapa de cobertura
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
                Consulte a área atendida em Uberlândia-MG e verifique, por CEP ou endereço, se
                um ponto está dentro da cobertura. Os dados são sincronizados em tempo real com o
                mapa oficial.
              </Typography>
            </Box>
          </Reveal>

          <Paper
            variant="outlined"
            sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, bgcolor: 'background.paper' }}
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.5}
                sx={{ alignItems: { md: 'flex-start' } }}
              >
                <TextField
                  label="CEP"
                  placeholder="38400-000"
                  value={cep}
                  onChange={(e) => {
                    const digits = normalizeCepInput(e.target.value)
                    const formatted =
                      digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
                    setCep(formatted)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleResolve()
                  }}
                  size="small"
                  sx={{ width: { xs: '100%', md: 160 } }}
                  slotProps={{ htmlInput: { maxLength: 9, inputMode: 'numeric' } }}
                />
                <TextField
                  label="Endereço (rua, bairro)"
                  placeholder="Ex.: Av. Rondon Pacheco, Tibery"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleResolve()
                  }}
                  size="small"
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PlaceOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                  <Button
                    variant="contained"
                    onClick={() => void handleResolve()}
                    disabled={searching || state.status !== 'ready'}
                    startIcon={
                      searching ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <SearchRoundedIcon />
                      )
                    }
                  >
                    Verificar
                  </Button>
                  <Button variant="text" color="inherit" onClick={handleClear} disabled={searching}>
                    Limpar
                  </Button>
                </Stack>
              </Stack>

              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: 'flex-start', color: 'text.secondary' }}
              >
                <InfoOutlinedIcon fontSize="small" sx={{ mt: '1px', flexShrink: 0 }} />
                <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
                  A precisão da localização exata do número está em desenvolvimento — o
                  pino pode cair de forma aproximada na via. A verificação de cobertura
                  por área já é confiável.
                </Typography>
              </Stack>

              {searchError ? (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  {searchError}
                </Alert>
              ) : null}

              {result ? (
                <Alert
                  severity={result.covered ? 'success' : 'error'}
                  icon={<MyLocationOutlinedIcon fontSize="inherit" />}
                  sx={{ borderRadius: 2 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {result.covered
                      ? 'Endereço dentro da área de cobertura'
                      : 'Endereço fora da área de cobertura mapeada'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {result.label}
                    {result.bairro ? ` · ${result.bairro}` : ''}
                  </Typography>
                  {!result.precise ? (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Localização aproximada da via (número não localizado na base do mapa).
                    </Typography>
                  ) : null}
                </Alert>
              ) : null}
            </Stack>
          </Paper>

          {canSeeCondominios ? (
            <Paper
              variant="outlined"
              sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, bgcolor: 'background.paper' }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <ApartmentRoundedIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Condomínios no mapa
                  </Typography>
                </Stack>

                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  sx={{ alignItems: { md: 'center' } }}
                >
                  <Autocomplete
                    size="small"
                    sx={{ flex: 1, minWidth: { xs: '100%', md: 280 } }}
                    options={locatedCondos}
                    value={
                      locatedCondos.find((c) => c.id === selectedCondoId) ?? null
                    }
                    onChange={(_, value) => handleSelectCondo(value)}
                    getOptionLabel={(o) => o.nome}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    noOptionsText="Nenhum condomínio localizado"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Buscar e destacar condomínio"
                        placeholder="Digite o nome do condomínio…"
                        slotProps={{
                          ...params.slotProps,
                          input: {
                            ...params.slotProps.input,
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchRoundedIcon fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props
                      return (
                      <Box component="li" key={key} {...optionProps}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: condoColor(option.categoria),
                            mr: 1.5,
                            flexShrink: 0,
                          }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {option.nome}
                          </Typography>
                          {option.bairro ? (
                            <Typography variant="caption" color="text.secondary">
                              {option.bairro}
                            </Typography>
                          ) : null}
                        </Box>
                      </Box>
                      )
                    }}
                  />

                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={condoFilters.viavel}
                          onChange={(e) =>
                            setCondoFilters((prev) => ({
                              ...prev,
                              viavel: e.target.checked,
                            }))
                          }
                          sx={{
                            color: theme.palette.success.main,
                            '&.Mui-checked': { color: theme.palette.success.main },
                          }}
                        />
                      }
                      label={`${CONDOMINIO_CATEGORIA_LABELS.viavel} (${condoCounts.viavel})`}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={condoFilters.inviavel}
                          onChange={(e) =>
                            setCondoFilters((prev) => ({
                              ...prev,
                              inviavel: e.target.checked,
                            }))
                          }
                          sx={{
                            color: theme.palette.error.main,
                            '&.Mui-checked': { color: theme.palette.error.main },
                          }}
                        />
                      }
                      label={`${CONDOMINIO_CATEGORIA_LABELS.inviavel} (${condoCounts.inviavel})`}
                    />
                  </Stack>
                </Stack>

                {missingLocation > 0 ? (
                  <>
                    <Divider />
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ alignItems: 'flex-start', color: 'text.secondary' }}
                    >
                      <InfoOutlinedIcon fontSize="small" sx={{ mt: '1px', flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
                        {missingLocation}{' '}
                        {missingLocation === 1
                          ? 'condomínio ainda sem localização e não aparece no mapa'
                          : 'condomínios ainda sem localização e não aparecem no mapa'}
                        . Use "Geolocalizar pendentes" na tela de Condomínios para
                        posicioná-los.
                      </Typography>
                    </Stack>
                  </>
                ) : null}
              </Stack>
            </Paper>
          ) : null}

          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              height: { xs: 420, sm: 520, md: 600 },
            }}
          >
            {state.status === 'loading' ? (
              <Stack
                spacing={1.5}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 500,
                  bgcolor: 'background.paper',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CircularProgress size={26} thickness={5} />
                <Typography variant="body2" color="text.secondary">
                  Carregando mapa de cobertura…
                </Typography>
              </Stack>
            ) : null}

            {state.status === 'error' ? (
              <Stack
                spacing={2}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 500,
                  p: 3,
                  textAlign: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {state.message}
                </Alert>
                <Button
                  variant="outlined"
                  startIcon={<RefreshRoundedIcon />}
                  onClick={() => load()}
                >
                  Tentar novamente
                </Button>
              </Stack>
            ) : null}

            <MapContainer
              center={UBERLANDIA_CENTER}
              zoom={12}
              scrollWheelZoom
              style={{ height: '100%', width: '100%' }}
              ref={(instance) => {
                mapRef.current = instance
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Pane name="coverage-polygons" style={{ zIndex: 390 }}>
                {coverage ? (
                  <GeoJSON
                    key={`cov-${polygonsFc.features.length}`}
                    data={polygonsFc}
                    interactive={false}
                    style={() => polygonStyle}
                    onEachFeature={(feature: CoverageFeature, layer) => {
                      const name = feature.properties?.name
                      if (name) layer.bindTooltip(shortName(name), { sticky: true })
                    }}
                  />
                ) : null}
              </Pane>
              <Pane name="coverage-points" style={{ zIndex: 610 }}>
                {coverage?.points.map((p, i) => {
                  const geom = p.geometry
                  if (!geom || geom.type !== 'Point') return null
                  const [lng, lat] = geom.coordinates
                  return (
                    <CircleMarker
                      key={`pt-${i}`}
                      center={[lat!, lng!]}
                      radius={5}
                      pathOptions={{
                        color: theme.palette.primary.main,
                        fillColor: theme.palette.primary.main,
                        fillOpacity: 0.85,
                        weight: 1,
                      }}
                    >
                      <LeafletTooltip>{shortName(p.properties?.name)}</LeafletTooltip>
                    </CircleMarker>
                  )
                })}
              </Pane>
              <Pane name="condominio-markers" style={{ zIndex: 650 }}>
                {visibleCondos.map((c) => (
                  <CondoMarker
                    key={`condo-${c.id}`}
                    condo={c}
                    color={condoColor(c.categoria)}
                    selected={c.id === selectedCondoId}
                    onSelect={setSelectedCondoId}
                  />
                ))}
              </Pane>
              {result ? (
                <Marker
                  position={[result.lat, result.lng]}
                  icon={makePin(
                    result.covered
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                  )}
                >
                  <Popup>
                    <strong>
                      {result.covered ? 'Dentro da cobertura' : 'Fora da cobertura'}
                    </strong>
                    <br />
                    {result.label}
                  </Popup>
                </Marker>
              ) : null}
            </MapContainer>
          </Paper>

          {state.status === 'ready' ? (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={`${totalBairros} áreas de cobertura`}
                sx={{
                  fontWeight: 600,
                  bgcolor: alpha(theme.palette.success.main, isDark ? 0.2 : 0.12),
                  color: theme.palette.success.main,
                }}
              />
              {totalPontos > 0 ? (
                <Chip
                  size="small"
                  label={`${totalPontos} pontos mapeados`}
                  sx={{
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.12),
                    color: theme.palette.primary.main,
                  }}
                />
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </Container>
    </Box>
  )
}
