import { useMemo } from 'react'
import { Box, Container, Paper, Tooltip, Typography } from '@mui/material'
import ApiOutlinedIcon from '@mui/icons-material/ApiOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import { NavCard } from '../components/NavCard'
import { Reveal } from '../components/Reveal'
import {
  MK_CLASSIFICACOES,
  MK_PROCESSOS,
  MK_TIPOS_OS,
  MK_ORIGEM_CONTATO,
} from '../data/mkCodigos'

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem', fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.25 }}>
        {value}
      </Typography>
    </Paper>
  )
}

// ── Mini bar chart ───────────────────────────────────────────────────────────
type BarItem = { label: string; value: number; color: string }

function MiniBarChart({ items, title }: { items: BarItem[]; title: string }) {
  const max = Math.max(...items.map(i => i.value), 1)
  const CHART_H = 80

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem' }}
      >
        {title}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end', height: CHART_H + 44, mt: 1.5 }}>
        {items.map((item) => {
          const barH = Math.max((item.value / max) * CHART_H, item.value > 0 ? 4 : 0)
          return (
            <Tooltip key={item.label} title={`${item.label}: ${item.value}`} placement="top" arrow>
              <Box
                sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, cursor: 'default' }}
              >
                <Box sx={{ width: '100%', height: CHART_H, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: barH,
                      bgcolor: item.color,
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.63rem', color: 'text.secondary', textAlign: 'center', lineHeight: 1.3 }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'text.primary', mt: -0.25 }}
                >
                  {item.value}
                </Typography>
              </Box>
            </Tooltip>
          )
        })}
      </Box>
    </Box>
  )
}

// ── Sub-page navigation cards ─────────────────────────────────────────────
const SUB_CARDS = [
  {
    to: '/dev/mk-testes',
    accent: '#3b82f6',
    icon: <ScienceOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Testes de API',
    description: 'Dispare chamadas diretas à API MK Solutions e inspecione respostas em tempo real.',
  },
  {
    to: '/dev/mk-status',
    accent: '#0ea5e9',
    icon: <BarChartOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Status da Integração',
    description: 'Verifique o estado da comunicação com o servidor MK e o tempo de resposta.',
  },
  {
    to: '/dev/mk-codigos',
    accent: '#6366f1',
    icon: <DataObjectOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Códigos e Parâmetros',
    description: 'Referência completa dos processoId, tipoOS, grupos, classificações e demais constantes.',
  },
  {
    to: '/dev/funcoes',
    accent: '#0f766e',
    icon: <CloudOutlinedIcon sx={{ fontSize: 26 }} />,
    title: 'Cloud Functions',
    description: 'Funções em nuvem utilizadas na integração com o MK Solutions e outros serviços.',
  },
]

// ── Main page ─────────────────────────────────────────────────────────────
export function MkSolutionsPage() {
  const processCategories = useMemo<BarItem[]>(() => {
    const tecnico    = MK_PROCESSOS.filter(p => p.nome.toUpperCase().startsWith('TECNICO') || p.nome === 'SUPORTE TÉCNICO').length
    const financeiro = MK_PROCESSOS.filter(p => p.nome.toUpperCase().startsWith('FINANCEIRO')).length
    const plantao    = MK_PROCESSOS.filter(p => p.nome.toUpperCase().startsWith('PLANTAO')).length
    const outros     = MK_PROCESSOS.length - tecnico - financeiro - plantao
    return [
      { label: 'Técnico',    value: tecnico,    color: '#3b82f6' },
      { label: 'Financeiro', value: financeiro, color: '#8b5cf6' },
      { label: 'Plantão',    value: plantao,    color: '#f59e0b' },
      { label: 'Outros',     value: outros,     color: '#6b7280' },
    ]
  }, [])

  const classifCategories = useMemo<BarItem[]>(() => {
    const abertura    = MK_CLASSIFICACOES.filter(c => !c.encerramento).length
    const encerramento = MK_CLASSIFICACOES.filter(c => c.encerramento).length
    return [
      { label: 'Abertura',     value: abertura,     color: '#10b981' },
      { label: 'Encerramento', value: encerramento, color: '#ef4444' },
    ]
  }, [])

  const tiposOsCategories = useMemo<BarItem[]>(() => {
    const ativos   = MK_TIPOS_OS.filter(t => t.ativo).length
    const inativos = MK_TIPOS_OS.filter(t => !t.ativo).length
    return [
      { label: 'Ativos',   value: ativos,   color: '#10b981' },
      { label: 'Inativos', value: inativos, color: '#6b7280' },
    ]
  }, [])

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Header */}
          <Reveal>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ApiOutlinedIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em', fontWeight: 600 }}>
                  Área Dev
                </Typography>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  MK Solutions
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  Integração REST com a API MK Solutions — OS, protocolos e dados de cliente em tempo real.
                </Typography>
              </Box>
            </Box>
          </Reveal>

          {/* Stats */}
          <Reveal>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2 }}>
              <StatCard label="Variantes"          value={149} />
              <StatCard label="Classificações"     value={MK_CLASSIFICACOES.length} />
              <StatCard label="Processos"          value={MK_PROCESSOS.length} />
              <StatCard label="Tipos de O.S."      value={MK_TIPOS_OS.length} />
              <StatCard label="Origens de Contato" value={MK_ORIGEM_CONTATO.length} />
            </Box>
          </Reveal>

          {/* Charts */}
          <Reveal>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: { xs: 4, md: 4 },
                }}
              >
                <MiniBarChart title="Processos por categoria" items={processCategories} />
                <MiniBarChart title="Classificações por uso"  items={classifCategories} />
                <MiniBarChart title="Tipos de O.S."           items={tiposOsCategories} />
              </Box>
            </Paper>
          </Reveal>

          {/* Sub-page cards */}
          <Reveal>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Módulos
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                }}
              >
                {SUB_CARDS.map(c => (
                  <NavCard
                    key={c.to}
                    to={c.to}
                    accent={c.accent}
                    icon={c.icon}
                    title={c.title}
                    description={c.description}
                  />
                ))}
              </Box>
            </Box>
          </Reveal>

        </Box>
      </Container>
    </Box>
  )
}
