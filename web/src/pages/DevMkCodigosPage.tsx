import { useState, useMemo } from 'react'
import {
  Box, Chip, InputAdornment, Paper, Tab, Tabs, TextField, Typography, useTheme,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { AppPageChrome } from '../components/AppPageChrome'
import {
  MK_CLASSIFICACOES,
  MK_PROCESSOS,
  MK_TIPOS_OS,
  MK_GRUPOS,
  MK_ORIGEM_CONTATO,
  MK_TECNICOS,
  MK_CONTRATOS_ATIVOS,
} from '../data/mkCodigos'
import type { MkClassificacao, MkTipoOS, MkContrato, MkTecnico } from '../data/mkCodigos'

// ──────────────────────────────────────────────────────────────────────────────
// Copy hook
// ──────────────────────────────────────────────────────────────────────────────

function useCopied(ms = 1400) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const copy = (val: string | number, key: string) => {
    navigator.clipboard.writeText(String(val))
    setCopiedId(key)
    setTimeout(() => setCopiedId(null), ms)
  }
  return { copiedId, copy }
}

// ──────────────────────────────────────────────────────────────────────────────
// CodeChip — clicável, mostra check após copiar
// ──────────────────────────────────────────────────────────────────────────────

function CodeChip({ value, copyKey, onCopy, copiedId }: {
  value: number
  copyKey: string
  onCopy: (val: number, key: string) => void
  copiedId: string | null
}) {
  const theme = useTheme()
  const copied = copiedId === copyKey
  return (
    <Box
      component="span"
      onClick={() => onCopy(value, copyKey)}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.5,
        fontFamily: 'monospace', fontWeight: 700, fontSize: 13,
        color: copied ? 'success.main' : 'primary.main',
        cursor: 'pointer', userSelect: 'none',
        '&:hover .copy-icon': { opacity: 1 },
      }}
    >
      {value}
      <Box
        className="copy-icon"
        component="span"
        sx={{
          opacity: copied ? 1 : 0,
          transition: 'opacity .15s',
          fontSize: 12, display: 'flex', alignItems: 'center',
          color: copied ? 'success.main' : theme.palette.text.disabled,
        }}
      >
        {copied
          ? <CheckRoundedIcon sx={{ fontSize: 13 }} />
          : <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />}
      </Box>
    </Box>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Table base
// ──────────────────────────────────────────────────────────────────────────────

function TableHead({ cols }: { cols: string[] }) {
  return (
    <Box
      component="thead"
      sx={{ bgcolor: 'background.default' }}
    >
      <tr>
        {cols.map(c => (
          <Box
            key={c}
            component="th"
            sx={{
              px: 2, py: 1.25, textAlign: 'left',
              fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              color: 'text.secondary', borderBottom: '1px solid',
              borderColor: 'divider', whiteSpace: 'nowrap',
            }}
          >
            {c}
          </Box>
        ))}
      </tr>
    </Box>
  )
}

function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <Box
      component="td"
      sx={{
        px: 2, py: 1, fontSize: 13,
        fontFamily: mono ? 'monospace' : undefined,
        borderBottom: '1px solid', borderColor: 'divider',
        verticalAlign: 'middle',
        'tr:last-child > &': { borderBottom: 'none' },
      }}
    >
      {children}
    </Box>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Filter helper
// ──────────────────────────────────────────────────────────────────────────────

function matches(q: string, ...fields: (string | number | boolean | undefined)[]) {
  if (!q) return true
  const lq = q.toLowerCase()
  return fields.some(f => f !== undefined && String(f).toLowerCase().includes(lq))
}

function EmptyState({ q }: { q: string }) {
  return (
    <Box sx={{ textAlign: 'center', py: 5, color: 'text.disabled', fontSize: 13 }}>
      Nenhum resultado para &ldquo;<strong>{q}</strong>&rdquo;
    </Box>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Sections
// ──────────────────────────────────────────────────────────────────────────────

function SectionClassificacoes({ q, copiedId, copy }: { q: string; copiedId: string | null; copy: (v: number, k: string) => void }) {
  const rows = useMemo(
    () => MK_CLASSIFICACOES.filter((r: MkClassificacao) => matches(q, r.id, r.nome, r.encerramento ? 'encerramento' : 'abertura')),
    [q],
  )
  return rows.length === 0 ? <EmptyState q={q} /> : (
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
      <TableHead cols={['Código', 'Nome', 'Uso']} />
      <tbody>
        {rows.map((r: MkClassificacao) => (
          <tr key={r.id}>
            <Td><CodeChip value={r.id} copyKey={`cl-${r.id}`} onCopy={copy} copiedId={copiedId} /></Td>
            <Td>{r.nome}</Td>
            <Td>
              <Chip
                label={r.encerramento ? 'Encerrar' : 'Abrir'}
                size="small"
                color={r.encerramento ? 'error' : 'success'}
                variant="outlined"
                sx={{ fontSize: 11, height: 20 }}
              />
            </Td>
          </tr>
        ))}
      </tbody>
    </Box>
  )
}

function SectionProcessos({ q, copiedId, copy }: { q: string; copiedId: string | null; copy: (v: number, k: string) => void }) {
  const rows = useMemo(
    () => MK_PROCESSOS.filter(r => matches(q, r.id, r.nome)),
    [q],
  )
  return rows.length === 0 ? <EmptyState q={q} /> : (
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
      <TableHead cols={['Código', 'Nome']} />
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <Td><CodeChip value={r.id} copyKey={`pr-${r.id}`} onCopy={copy} copiedId={copiedId} /></Td>
            <Td>{r.nome}</Td>
          </tr>
        ))}
      </tbody>
    </Box>
  )
}

function SectionTiposOS({ q, copiedId, copy }: { q: string; copiedId: string | null; copy: (v: number, k: string) => void }) {
  const rows = useMemo(
    () => MK_TIPOS_OS.filter((r: MkTipoOS) => matches(q, r.id, r.nome, r.ativo ? 'ativo' : 'inativo')),
    [q],
  )
  return rows.length === 0 ? <EmptyState q={q} /> : (
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
      <TableHead cols={['Código', 'Nome', 'Status']} />
      <tbody>
        {rows.map((r: MkTipoOS) => (
          <tr key={r.id}>
            <Td><CodeChip value={r.id} copyKey={`to-${r.id}`} onCopy={copy} copiedId={copiedId} /></Td>
            <Td>{r.nome}</Td>
            <Td>
              <Chip
                label={r.ativo ? 'Ativo' : 'Inativo'}
                size="small"
                color={r.ativo ? 'success' : 'default'}
                variant="outlined"
                sx={{ fontSize: 11, height: 20 }}
              />
            </Td>
          </tr>
        ))}
      </tbody>
    </Box>
  )
}

function SectionGrupos({ q, copiedId, copy }: { q: string; copiedId: string | null; copy: (v: number, k: string) => void }) {
  const rows = useMemo(() => MK_GRUPOS.filter(r => matches(q, r.id, r.nome)), [q])
  return rows.length === 0 ? <EmptyState q={q} /> : (
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
      <TableHead cols={['Código', 'Nome']} />
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <Td><CodeChip value={r.id} copyKey={`gr-${r.id}`} onCopy={copy} copiedId={copiedId} /></Td>
            <Td>{r.nome}</Td>
          </tr>
        ))}
      </tbody>
    </Box>
  )
}

function SectionOrigem({ q, copiedId, copy }: { q: string; copiedId: string | null; copy: (v: number, k: string) => void }) {
  const rows = useMemo(() => MK_ORIGEM_CONTATO.filter(r => matches(q, r.id, r.nome)), [q])
  return rows.length === 0 ? <EmptyState q={q} /> : (
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
      <TableHead cols={['Código', 'Canal']} />
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <Td><CodeChip value={r.id} copyKey={`or-${r.id}`} onCopy={copy} copiedId={copiedId} /></Td>
            <Td>{r.nome}</Td>
          </tr>
        ))}
      </tbody>
    </Box>
  )
}

function SectionTecnicos({ q, copiedId, copy }: { q: string; copiedId: string | null; copy: (v: number, k: string) => void }) {
  const rows = useMemo(
    () => MK_TECNICOS.filter((r: MkTecnico) => matches(q, r.id, r.nome, r.login)),
    [q],
  )
  return rows.length === 0 ? <EmptyState q={q} /> : (
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
      <TableHead cols={['Código MK', 'Nome', 'Login ERP']} />
      <tbody>
        {rows.map((r: MkTecnico) => (
          <tr key={r.id}>
            <Td><CodeChip value={r.id} copyKey={`tec-${r.id}`} onCopy={copy} copiedId={copiedId} /></Td>
            <Td>{r.nome}</Td>
            <Td>
              <Box
                component="span"
                sx={{
                  fontFamily: 'monospace', fontSize: 12,
                  color: 'secondary.main',
                  bgcolor: 'action.hover', px: 0.75, py: 0.25, borderRadius: 0.5,
                }}
              >
                {r.login}
              </Box>
            </Td>
          </tr>
        ))}
      </tbody>
    </Box>
  )
}

function SectionPlanos({ q, copiedId, copy }: { q: string; copiedId: string | null; copy: (v: number, k: string) => void }) {
  const rows = useMemo(
    () => MK_CONTRATOS_ATIVOS.filter((r: MkContrato) => matches(q, r.id, r.nome, r.tipo)),
    [q],
  )
  return rows.length === 0 ? <EmptyState q={q} /> : (
    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
      <TableHead cols={['Código', 'Nome', 'Tipo']} />
      <tbody>
        {rows.map((r: MkContrato) => (
          <tr key={r.id}>
            <Td><CodeChip value={r.id} copyKey={`pl-${r.id}`} onCopy={copy} copiedId={copiedId} /></Td>
            <Td>{r.nome}</Td>
            <Td>
              <Chip
                label={r.tipo}
                size="small"
                variant="outlined"
                color={r.tipo === 'Internet' ? 'primary' : r.tipo === 'SVA' ? 'secondary' : 'default'}
                sx={{ fontSize: 11, height: 20 }}
              />
            </Td>
          </tr>
        ))}
      </tbody>
    </Box>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'classificacoes', label: 'Classificações', count: MK_CLASSIFICACOES.length },
  { key: 'processos',      label: 'Processos',      count: MK_PROCESSOS.length },
  { key: 'tipos-os',       label: 'Tipos O.S.',     count: MK_TIPOS_OS.length },
  { key: 'grupos',         label: 'Grupos',          count: MK_GRUPOS.length },
  { key: 'origem',         label: 'Origem',          count: MK_ORIGEM_CONTATO.length },
  { key: 'tecnicos',       label: 'Técnicos',        count: MK_TECNICOS.length },
  { key: 'planos',         label: 'Planos',          count: MK_CONTRATOS_ATIVOS.length },
] as const

type TabKey = typeof TABS[number]['key']

export function DevMkCodigosPage() {
  const [tab, setTab] = useState<TabKey>('classificacoes')
  const [search, setSearch] = useState('')
  const { copiedId, copy } = useCopied()

  const q = search.trim()

  const sectionProps = { q, copiedId, copy }

  return (
    <AppPageChrome
      overline="Ambiente de desenvolvimento"
      title="Códigos MK"
      subtitle="Banco de códigos do Webservice MK Solutions"
      illustration="technology"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Search + info */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar código ou nome…"
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 260 }}
          />
          <Typography variant="caption" color="text.secondary">
            Clique no número para copiar o código
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Tabs
            value={tab}
            onChange={(_, v: TabKey) => { setTab(v); setSearch('') }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 42 }}
          >
            {TABS.map(t => (
              <Tab
                key={t.key}
                value={t.key}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {t.label}
                    <Box
                      component="span"
                      sx={{
                        fontSize: 10, fontWeight: 700, px: 0.75, py: 0.1,
                        borderRadius: 10, bgcolor: 'action.selected',
                        color: 'text.secondary',
                      }}
                    >
                      {t.count}
                    </Box>
                  </Box>
                }
                sx={{ fontSize: 13, minHeight: 42, py: 0 }}
              />
            ))}
          </Tabs>

          <Box sx={{ overflowX: 'auto' }}>
            {tab === 'classificacoes' && <SectionClassificacoes {...sectionProps} />}
            {tab === 'processos'      && <SectionProcessos      {...sectionProps} />}
            {tab === 'tipos-os'       && <SectionTiposOS        {...sectionProps} />}
            {tab === 'grupos'         && <SectionGrupos         {...sectionProps} />}
            {tab === 'origem'         && <SectionOrigem         {...sectionProps} />}
            {tab === 'tecnicos'       && <SectionTecnicos       {...sectionProps} />}
            {tab === 'planos'         && <SectionPlanos         {...sectionProps} />}
          </Box>
        </Paper>

      </Box>
    </AppPageChrome>
  )
}
