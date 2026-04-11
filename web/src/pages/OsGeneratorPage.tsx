import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { useAuth } from '../contexts/AuthContext'
import { useOsTemplates } from '../hooks/useOsTemplates'
import { renderTemplate } from '../lib/renderTemplate'
import type { OsTemplate } from '../types/osTemplate'

const EXEMPLO_FIRESTORE_JSON = `{
  "sector": "suporte",
  "slug": "atendimento-demo",
  "title": "Atendimento — demonstração",
  "version": 1,
  "active": true,
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
  const [selectedId, setSelectedId] = useState<string>('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [copyOk, setCopyOk] = useState(false)

  const templates = state.status === 'ready' ? state.templates : []

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? null,
    [templates, selectedId],
  )

  const handleSelectTemplate = useCallback((id: string) => {
    setSelectedId(id)
    const t = templates.find((x) => x.id === id) ?? null
    setValues(buildInitialValues(t))
  }, [templates])

  useEffect(() => {
    if (templates.length > 0 && !selectedId) {
      const first = templates[0]
      setSelectedId(first.id)
      setValues(buildInitialValues(first))
    }
  }, [templates, selectedId])

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
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Gerar O.S
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Escolha um fluxo, preencha os campos e copie o texto gerado. Templates
        vêm da coleção <code>osTemplates</code> no Firestore (ativos e do seu
        setor; dev vê todos).
      </Typography>

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

      {state.status === 'ready' && templates.length > 0 ? (
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="tpl-label">Fluxo / template</InputLabel>
            <Select
              labelId="tpl-label"
              label="Fluxo / template"
              value={selectedId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
            >
              {templates.map((t) => (
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
              <Stack spacing={2}>
                {selected.fields.map((f) => (
                  <TextField
                    key={f.id}
                    label={f.label}
                    placeholder={f.placeholder}
                    value={values[f.id] ?? ''}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [f.id]: e.target.value }))
                    }
                    fullWidth
                    multiline={f.multiline}
                    minRows={f.multiline ? 3 : 1}
                  />
                ))}
              </Stack>

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
                startIcon={<ContentCopyIcon />}
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
