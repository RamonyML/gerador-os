import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
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
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet'
import type { Map as LeafletMap, PathOptions } from 'leaflet'
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

// Corrige os ícones padrão do Leaflet quando empacotado pelo Vite.
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

const UBERLANDIA_CENTER: [number, number] = [-18.9186, -48.2772]

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

export function CoberturaPage() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [result, setResult] = useState<SearchResult | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const fittedRef = useRef(false)

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
              {coverage ? (
                <GeoJSON
                  key={`cov-${polygonsFc.features.length}`}
                  data={polygonsFc}
                  style={() => polygonStyle}
                  onEachFeature={(feature: CoverageFeature, layer) => {
                    const name = feature.properties?.name
                    if (name) layer.bindTooltip(shortName(name), { sticky: true })
                  }}
                />
              ) : null}
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
              {result ? (
                <Marker position={[result.lat, result.lng]}>
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
