import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { ContentCopy } from '@mui/icons-material'
import { OsTemplateFieldsForm } from '../components/OsTemplateFieldsForm'
import { useAuth } from '../contexts/AuthContext'
import { useOsTemplates } from '../hooks/useOsTemplates'
import { renderTemplate } from '../lib/renderTemplate'
import type { OsTemplate } from '../types/osTemplate'
import {
  SUPPORT_DEMANDS,
  isKnownDemandCategory,
  templatesMatchingDemand,
} from '../data/supportDemands'

const EXEMPLO_FIRESTORE_JSON = `{
  "sector": "suporte",
  "slug": "atendimento-demo",
  "title": "Atendimento — demonstração",
  "version": 1,
  "active": true,
  "demandCategory": "geral",
  "outputTemplate": "Cliente: {{cliente}}\\nProtocolo: {{protocolo}}\\nBairro: {{bairro}}\\nOperador: {{operador.nome}}\\nObservações: {{observacoes}}",
  "fields": [
    { "id": "cliente", "label": "Cliente", "placeholder": "Nome do cliente" },
    { "id": "protocolo", "label": "Protocolo", "placeholder": "Número" },
    { "id": "bairro", "label": "Bairro", "placeholder": "" },
    { "id": "observacoes", "label": "Observações", "placeholder": "", "multiline": true }
  ]
}`

function buildInitialValues(template: OsTemplate | null): Record<string, string> {
  if (!template) return {}
  const o: Record<string, string> = {}
  for (const f of template.fields) {
    o[f.id] = ''
  }
  return o
}

export function OsGeneratorPage() {
  const { user, profile, profileMissing } = useAuth()
  const state = useOsTemplates(profile)
  const [searchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState<string>('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [copyOk, setCopyOk] = useState(false)

  const templates = state.status === 'ready' ? state.templates : []
  const demandParam = searchParams.get('demanda')
  const tplParam = searchParams.get('tpl')

  const visibleTemplates = useMemo(() => {
    if (!demandParam || !isKnownDemandCategory(demandParam)) {
      return templates
    }
    return templatesMatchingDemand(templates, demandParam)
  }, [templates, demandParam])

  const demandMeta = useMemo(
    () =>
      demandParam
        ? SUPPORT_DEMANDS.find((d) => d.id === demandParam)
        : undefined,
    [demandParam],
  )

  const selected = useMemo(
    () => visibleTemplates.find((t) => t.id === selectedId) ?? null,
    [visibleTemplates, selectedId],
  )

  const handleSelectTemplate = useCallback(
    (id: string) => {
      setSelectedId(id)
      const t = visibleTemplates.find((x) => x.id === id) ?? null
      setValues(buildInitialValues(t))
    },
    [visibleTemplates],
  )

  useEffect(() => {
    if (state.status !== 'ready') return
    const vis = visibleTemplates
    if (vis.length === 0) {
      setSelectedId('')
      setValues({})
      return
    }
    const prefer =
      tplParam && vis.find((t) => t.id === tplParam) ? tplParam : null
    const next = prefer
      ? vis.find((t) => t.id === prefer)!
      : vis[0]
    setSelectedId(next.id)
    setValues(buildInitialValues(next))
  }, [state.status, visibleTemplates, tplParam, demandParam])

  const context = useMemo(() => {
    const base: Record<string, unknown> = { ...values }
    base.operador = {
      nome: profile?.displayName ?? '',
      email: user?.email ?? profile?.email ?? '',
    }
    return base
  }, [values, profile, user])

  const preview = useMemo(() => {
    if (!selected) return ''
    return renderTemplate(selected.outputTemplate, context)
  }, [selected, context])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(preview)
      setCopyOk(true)
    } catch {
      /* ignore */
    }
  }, [preview])

  if (profileMissing || !profile) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="warning">
          Complete seu perfil em <strong>users/&lt;uid&gt;</strong> para usar o
          gerador.
        </Alert>
      </Container>
    )
  }

  return (
    <Container
      maxWidth="md"
      sx={{ py: 3, maxWidth: { xs: '100%', md: 880 } }}
    >
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Gerar O.S
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Escolha um fluxo, preencha os campos e copie o texto gerado. Templates
        vêm da coleção <code>osTemplates</code> no Firestore (ativos e do seu
        setor; dev vê todos).
      </Typography>

      {demandParam && demandMeta ? (
        <Stack
          direction="row"
          sx={{ alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}
        >
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={`Demanda: ${demandMeta.title}`}
          />
          <Link component={RouterLink} to="/gerar-os" underline="hover" variant="body2">
            Mostrar todos os modelos
          </Link>
        </Stack>
      ) : null}

      {state.status === 'loading' ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {state.status === 'error' ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.message}
        </Alert>
      ) : null}

      {state.status === 'ready' &&
      templates.length > 0 &&
      visibleTemplates.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Nenhum modelo nesta categoria de demanda.{' '}
          <Link component={RouterLink} to="/gerar-os">
            Ver todos os fluxos
          </Link>{' '}
          ou peça a um gestor para classificar um modelo em <strong>Modelos</strong>.
        </Alert>
      ) : null}

      {state.status === 'ready' && templates.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Nenhum template ativo para o seu acesso. No Firebase Console →
          Firestore, crie a coleção <strong>osTemplates</strong>, adicione um
          documento e preencha os campos. Exemplo de campos do documento:
          <Box
            component="pre"
            sx={{
              mt: 1,
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'action.hover',
              fontSize: 12,
              overflow: 'auto',
              textAlign: 'left',
            }}
          >
            {EXEMPLO_FIRESTORE_JSON}
          </Box>
        </Alert>
      ) : null}

      {state.status === 'ready' && visibleTemplates.length > 0 ? (
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="tpl-label">Fluxo / template</InputLabel>
            <Select
              labelId="tpl-label"
              label="Fluxo / template"
              value={selectedId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
            >
              {visibleTemplates.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.title}{' '}
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    (v{t.version} · {t.sector})
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selected ? (
            <>
              <OsTemplateFieldsForm
                fields={selected.fields}
                values={values}
                onChange={(id, v) =>
                  setValues((prev) => ({ ...prev, [id]: v }))
                }
                onPatchValues={(patch) =>
                  setValues((prev) => ({ ...prev, ...patch }))
                }
              />

              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Pré-visualização
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'inherit',
                    fontSize: 14,
                    textAlign: 'left',
                  }}
                >
                  {preview || '(vazio)'}
                </Box>
              </Paper>

              <Button
                variant="contained"
                startIcon={<ContentCopy />}
                onClick={() => void handleCopy()}
                disabled={!preview.trim()}
              >
                Copiar texto
              </Button>
            </>
          ) : null}
        </Stack>
      ) : null}

      <Snackbar
        open={copyOk}
        autoHideDuration={2500}
        onClose={() => setCopyOk(false)}
        message="Texto copiado para a área de transferência"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  )
}
