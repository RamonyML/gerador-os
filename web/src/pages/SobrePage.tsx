import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Box, Chip, Container, Paper, Tooltip, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
  ArrowLeftRight,
  Bug,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Coffee,
  FileText,
  FolderTree,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Link2,
  MapPin,
  MessageSquare,
  MousePointerClick,
  Rocket,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
  Workflow,
  Zap,
} from 'lucide-react'
import { useColorMode } from '../contexts/ColorModeContext'
import { HeroIllustration } from '../components/HeroIllustration'
import { ILLUSTRATIONS } from '../data/illustrations'

const SUBTLE_PATTERN =
  'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2322c55e\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Zap,
    title: 'Integração MK Solutions',
    desc: 'Cada formulário abre o atendimento, insere os comentários e cria a O.S. automaticamente no MK ERP — sem copiar e colar.',
  },
  {
    icon: LayoutDashboard,
    title: 'Hub de Suporte',
    desc: 'Centralização dos fluxos operacionais utilizados pelo suporte técnico, organizados por categoria de demanda.',
  },
  {
    icon: FolderTree,
    title: 'Gerador de O.S.',
    desc: 'Modelos padronizados de atendimento com painel lateral integrado ao MK ERP — protocolo gerado em segundos.',
  },
  {
    icon: LifeBuoy,
    title: 'Chamados Internos',
    desc: 'Sistema estilo GLPI para registro, acompanhamento e encerramento de demandas internas da equipe.',
  },
  {
    icon: TrendingUp,
    title: 'Registro de Upgrades',
    desc: 'Controle operacional dos upgrades realizados e das comissões correspondentes.',
  },
  {
    icon: CalendarDays,
    title: 'Escala de Trabalho',
    desc: 'Organização dos turnos e plantões da equipe com visão por período.',
  },
  {
    icon: MapPin,
    title: 'Agenda de Visitas',
    desc: 'Grade colaborativa da equipe técnica para instalações e manutenções, com acompanhamento em tempo real.',
  },
  {
    icon: Building2,
    title: 'Condomínios',
    desc: 'Consulta de viabilidade de fibra e registros de inviabilidade por condomínio.',
  },
  {
    icon: Users,
    title: 'Gestão de Usuários',
    desc: 'Controle de contas, perfis, setores, hierarquia e permissões de acesso por papel.',
  },
  {
    icon: Bug,
    title: 'Relatório de Bugs',
    desc: 'Canal interno para que operadores registrem falhas e acompanhem o status de correção.',
  },
  {
    icon: Coffee,
    title: 'Pausa da Equipe',
    desc: 'Widget de controle de pausas por equipe, com visibilidade em tempo real de quem está disponível.',
  },
  {
    icon: ClipboardCheck,
    title: 'Padronização de Processos',
    desc: 'Uniformidade na documentação e nos procedimentos validados pela gerência.',
  },
]

const MK_STEPS: { icon: LucideIcon; label: string; desc: string }[] = [
  {
    icon: FileText,
    label: '1. Preenche o formulário',
    desc: 'Operador insere os dados do atendimento normalmente no gerador de O.S.',
  },
  {
    icon: Link2,
    label: '2. Protocolo automático',
    desc: 'O sistema abre o atendimento no MK ERP e insere cada comentário em sequência com um clique.',
  },
  {
    icon: Zap,
    label: '3. O.S. criada no MK',
    desc: 'A Ordem de Serviço é gerada vinculada ao protocolo — sem copiar, sem colar, sem erro manual.',
  },
]

const RESULTS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Clock,
    title: 'Muito mais rápido',
    desc: 'De 10–15 minutos de trabalho manual para menos de 2 minutos com a integração MK.',
  },
  {
    icon: CheckCircle2,
    title: 'Padronização total',
    desc: 'Documentação uniforme e aprovada pela gerência em todos os formulários.',
  },
  {
    icon: ShieldAlert,
    title: 'Zero erros manuais',
    desc: 'Geração e envio automático eliminam falhas de digitação e campos esquecidos.',
  },
  {
    icon: Rocket,
    title: 'Mais produtividade',
    desc: 'Equipe focada no atendimento ao cliente, não na digitação repetitiva no ERP.',
  },
  {
    icon: GraduationCap,
    title: 'Onboarding rápido',
    desc: 'Novos colaboradores seguem os modelos prontos desde o primeiro dia.',
  },
]

const TECHNOLOGIES = [
  'React 19',
  'TypeScript',
  'Vite',
  'Material UI v9',
  'Emotion',
  'React Router v7',
  'Firebase Authentication',
  'Cloud Firestore',
  'Cloud Functions (Node 20)',
  'Google Cloud Secret Manager',
  'Firebase Hosting',
  'MK Solutions API',
  'Recharts',
  'Lucide Icons',
  'jsPDF',
  'Vitest',
  'Playwright',
]

const CONTINUOUS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: MessageSquare,
    title: 'Feedback dos operadores',
    desc: 'A equipe reporta falhas e sugere melhorias pelo canal de Bug Reports integrado.',
  },
  {
    icon: Wrench,
    title: 'Correções contínuas',
    desc: 'Ajustes constantes de estabilidade, qualidade e comportamento dos formulários.',
  },
  {
    icon: ArrowLeftRight,
    title: 'Expansão da integração MK',
    desc: 'Novos fluxos conectados ao ERP conforme as demandas operacionais crescem.',
  },
  {
    icon: MousePointerClick,
    title: 'Melhorias de usabilidade',
    desc: 'Interface cada vez mais simples e eficiente para o dia a dia do suporte.',
  },
  {
    icon: Workflow,
    title: 'Novos módulos',
    desc: 'Recursos novos conforme a operação da MZ NET evolui e novas necessidades surgem.',
  },
]

function FadeInSection({ children, delayMs = 0 }: { children: ReactNode; delayMs?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) setVisible(true) },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transitionProperty: 'opacity, transform',
        transitionDuration: '0.75s',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${delayMs}ms`,
      }}
    >
      {children}
    </Box>
  )
}

function TooltipName({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Tooltip title={title} arrow placement="top">
      <Box
        component="span"
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          cursor: 'help',
          borderBottom: '1px dotted',
          borderColor: 'primary.light',
        }}
      >
        {children}
      </Box>
    </Tooltip>
  )
}

export function SobrePage() {
  const theme = useTheme()
  const { mode, isDark } = useColorMode()
  const primary = theme.palette.primary.main
  const [parallaxY, setParallaxY] = useState(0)
  const raf = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      if (raf.current) return
      raf.current = requestAnimationFrame(() => {
        raf.current = 0
        setParallaxY(typeof window !== 'undefined' ? window.scrollY : 0)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  const heroGradient =
    mode === 'light'
      ? `linear-gradient(145deg, ${alpha(primary, 0.16)} 0%, ${alpha(primary, 0.05)} 45%, ${theme.palette.background.default} 100%)`
      : `linear-gradient(145deg, ${alpha(primary, 0.22)} 0%, ${alpha('#000', 0.35)} 55%, ${theme.palette.background.default} 100%)`

  const cardShadow =
    mode === 'light' ? '0 8px 32px rgba(0,0,0,0.06)' : '0 8px 32px rgba(0,0,0,0.35)'

  const sectionBg =
    mode === 'light'
      ? alpha(theme.palette.primary.main, 0.04)
      : alpha(theme.palette.primary.main, 0.08)

  const iconBadgeSx = {
    color: 'primary.main',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    width: 44,
    height: 44,
    borderRadius: 2,
    bgcolor: alpha(primary, isDark ? 0.18 : 0.12),
    border: 1,
    borderColor: alpha(primary, isDark ? 0.3 : 0.16),
  } as const

  const SectionHeading = ({
    overline,
    title,
    subtitle,
  }: {
    overline?: string
    title: string
    subtitle?: string
  }) => (
    <Box sx={{ mb: 4 }}>
      {overline ? (
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.08em' }}
        >
          {overline}
        </Typography>
      ) : null}
      <Typography
        variant="h4"
        component="h2"
        sx={{ fontWeight: 800, letterSpacing: '-0.02em', mt: overline ? 0.5 : 0 }}
      >
        {title}
      </Typography>
      {subtitle ? (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 1.5, maxWidth: 720, lineHeight: 1.7 }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  )

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      {/* Hero */}
      <Box sx={{ position: 'relative', overflow: 'hidden', borderBottom: 1, borderColor: 'divider' }}>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: heroGradient,
            transform: `translateY(${parallaxY * 0.35}px)`,
            willChange: 'transform',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: '-20%',
            opacity: mode === 'light' ? 0.55 : 0.35,
            backgroundImage: SUBTLE_PATTERN,
            transform: `translateY(${parallaxY * 0.18}px) scale(1.05)`,
            willChange: 'transform',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: '12%',
            right: '8%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: alpha(primary, isDark ? 0.12 : 0.08),
            filter: 'blur(60px)',
            transform: `translate(${parallaxY * -0.06}px, ${parallaxY * 0.12}px)`,
          }}
        />

        <Container
          maxWidth="lg"
          sx={{ position: 'relative', py: { xs: 5, md: 8 }, px: { xs: 2, sm: 3 } }}
        >
          <FadeInSection>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: { xs: 4, lg: 6 },
              }}
            >
              <Box sx={{ flex: '1 1 auto', maxWidth: { lg: '58%' } }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip
                    label="Plataforma operacional"
                    size="small"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      bgcolor: alpha(primary, isDark ? 0.18 : 0.1),
                      border: 1,
                      borderColor: alpha(primary, 0.25),
                    }}
                  />
                  <Chip
                    label="MK Solutions integrado"
                    size="small"
                    sx={{
                      fontWeight: 700,
                      color: isDark ? '#4ade80' : '#16a34a',
                      bgcolor: alpha('#22c55e', isDark ? 0.18 : 0.1),
                      border: 1,
                      borderColor: alpha('#22c55e', 0.3),
                    }}
                  />
                </Box>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
                  }}
                >
                  Gerador de O.S
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mt: 2,
                    fontWeight: 600,
                    color: 'primary.main',
                    letterSpacing: '-0.02em',
                    fontSize: { xs: '1.1rem', sm: '1.3rem' },
                    lineHeight: 1.4,
                  }}
                >
                  Plataforma operacional da MZ NET — do formulário ao MK ERP com um clique.
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 2, maxWidth: 560, lineHeight: 1.7 }}
                >
                  O sistema centraliza os fluxos do suporte técnico e está integrado
                  diretamente ao ERP MK Solutions: cada atendimento abre o protocolo,
                  insere os comentários e cria a Ordem de Serviço automaticamente —
                  sem copiar e colar.
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: '0 1 380px',
                  width: '100%',
                  maxWidth: 380,
                  transform: `translateY(${parallaxY * -0.04}px)`,
                  transition: 'transform 0.1s linear',
                }}
              >
                <HeroIllustration
                  src={ILLUSTRATIONS.collaboration}
                  alt="Equipe de suporte colaborando na plataforma"
                  maxWidth={380}
                />
              </Box>
            </Box>
          </FadeInSection>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 }, px: { xs: 2, sm: 3 } }}>

        {/* Evolução */}
        <FadeInSection delayMs={40}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: 1,
              borderColor: alpha(primary, 0.25),
              background:
                mode === 'light'
                  ? `linear-gradient(120deg, ${alpha(primary, 0.1)} 0%, ${alpha(theme.palette.grey[100], 0.9)} 100%)`
                  : `linear-gradient(120deg, ${alpha(primary, 0.16)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={iconBadgeSx}>
                <Sparkles size={22} />
              </Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
                Evolução do Projeto
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              O projeto nasceu como uma ferramenta para automatizar a criação de ordens de
              serviço e protocolos, mas evoluiu para uma{' '}
              <Box component="strong" sx={{ color: 'text.primary' }}>
                plataforma operacional utilizada diariamente pelo suporte técnico da MZ NET
              </Box>
              . Hoje ela reúne, em um só lugar, os fluxos, as demandas, as ferramentas e —
              com a integração completa ao MK Solutions — a automação total do ciclo de atendimento.
            </Typography>
          </Paper>
        </FadeInSection>

        {/* Integração MK Solutions — destaque */}
        <FadeInSection delayMs={60}>
          <Box sx={{ mt: 7 }}>
            <SectionHeading
              overline="Integração ERP"
              title="Integração MK Solutions"
              subtitle="A principal evolução da plataforma: cada formulário de suporte está conectado diretamente ao ERP MK Solutions, automatizando o ciclo completo de atendimento."
            />

            {/* Fluxo em 3 passos */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                gap: 2,
                mb: 3,
              }}
            >
              {MK_STEPS.map(({ icon: Icon, label, desc }) => (
                <Paper
                  key={label}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: 1,
                    borderColor: alpha('#22c55e', isDark ? 0.3 : 0.2),
                    bgcolor: alpha('#22c55e', isDark ? 0.08 : 0.04),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      placeItems: 'center',
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: alpha('#22c55e', isDark ? 0.22 : 0.12),
                      border: 1,
                      borderColor: alpha('#22c55e', isDark ? 0.35 : 0.2),
                      color: isDark ? '#4ade80' : '#16a34a',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {desc}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* Detalhes técnicos */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                border: 1,
                borderColor: alpha('#22c55e', isDark ? 0.3 : 0.2),
                bgcolor: alpha('#22c55e', isDark ? 0.06 : 0.03),
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: isDark ? '#4ade80' : '#16a34a' }}>
                Cobertura atual da integração
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                  gap: 2,
                }}
              >
                {[
                  { num: '37', label: 'formulários integrados' },
                  { num: '170', label: 'variantes de atendimento' },
                  { num: '8', label: 'categorias cobertas' },
                  { num: '100%', label: 'das O.S. automatizadas' },
                ].map(({ num, label }) => (
                  <Box key={label} sx={{ textAlign: 'center', py: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 800, color: isDark ? '#4ade80' : '#16a34a', lineHeight: 1 }}
                    >
                      {num}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5, lineHeight: 1.7 }}>
                Categorias integradas:{' '}
                <Box component="span" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  Manutenção (15 formulários) · Alteração de Plano (6) · Wi-Fi Extend (3) ·
                  Mídia/TV — Roku (2) · Senha de Rede · Termo de Responsabilidade · Feedback pós-O.S. (8)
                </Box>
                . A integração cobre autenticação, busca de cliente por CPF/CNPJ, seleção de
                conexão ativa, criação de atendimento com operador identificado, inserção de
                comentários em sequência e criação de Ordem de Serviço vinculada ao protocolo.
              </Typography>
            </Paper>
          </Box>
        </FadeInSection>

        {/* Funcionalidades */}
        <FadeInSection delayMs={80}>
          <Box sx={{ mt: 7 }}>
            <SectionHeading
              overline="Recursos"
              title="O que a plataforma oferece"
              subtitle="Funcionalidades disponíveis atualmente para apoiar a operação do suporte técnico."
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
                gap: 2.5,
              }}
            >
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <Paper
                  key={title}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: cardShadow,
                      borderColor: alpha(primary, 0.4),
                    },
                  }}
                >
                  <Box sx={{ ...iconBadgeSx, mb: 2 }}>
                    <Icon size={22} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {desc}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </FadeInSection>

        {/* Resultados */}
        <FadeInSection delayMs={100}>
          <Box sx={{ mt: 7 }}>
            <SectionHeading
              overline="Impacto"
              title="Resultados obtidos"
              subtitle="Ganhos concretos percebidos no dia a dia do suporte técnico desde a integração com o MK Solutions."
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(5, 1fr)' },
                gap: 2.5,
              }}
            >
              {RESULTS.map(({ icon: Icon, title, desc }) => (
                <Paper
                  key={title}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: 1,
                    borderColor: alpha(primary, 0.2),
                    bgcolor: sectionBg,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                  }}
                >
                  <Box sx={iconBadgeSx}>
                    <Icon size={22} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                    {desc}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </FadeInSection>

        {/* História */}
        <FadeInSection delayMs={120}>
          <Box sx={{ mt: 7 }}>
            <SectionHeading
              overline="Origem"
              title="A história do projeto"
              subtitle="Como tudo começou e quem ajudou a construir e validar os padrões."
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  boxShadow: cardShadow,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Idealização e Desenvolvimento
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                  O Gerador de O.S foi idealizado e desenvolvido por{' '}
                  <TooltipName title="Idealizador & Desenvolvedor">
                    Ramony Lima
                  </TooltipName>
                  , a partir da necessidade de agilizar e padronizar a abertura de protocolos e
                  ordens de serviço no suporte técnico — e evoluiu até a integração completa
                  com o ERP MK Solutions.
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  boxShadow: cardShadow,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Supervisão e Validação
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                  Todos os modelos são padronizados e validados pela gerência, com supervisão de{' '}
                  <TooltipName title="Sub-gerente de Suporte">Hiago Alves</TooltipName> e grande
                  contribuição de{' '}
                  <TooltipName title="Revisão e Formatação">Karolayne Pereira</TooltipName> na
                  revisão e formatação textual dos protocolos.
                </Typography>
              </Paper>
            </Box>
          </Box>
        </FadeInSection>

        {/* Tecnologias */}
        <FadeInSection delayMs={140}>
          <Box sx={{ mt: 7 }}>
            <SectionHeading
              overline="Stack"
              title="Tecnologias utilizadas"
              subtitle="Conjunto de tecnologias efetivamente presentes no projeto."
            />
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: cardShadow,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.25,
              }}
            >
              {TECHNOLOGIES.map((tech) => (
                <Chip
                  key={tech}
                  label={tech}
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    bgcolor: alpha(primary, isDark ? 0.16 : 0.08),
                    border: 1,
                    borderColor: alpha(primary, 0.2),
                    color: 'text.primary',
                  }}
                />
              ))}
            </Paper>
          </Box>
        </FadeInSection>

        {/* Desenvolvimento Contínuo */}
        <FadeInSection delayMs={160}>
          <Box sx={{ mt: 7 }}>
            <SectionHeading
              overline="Produto vivo"
              title="Desenvolvimento contínuo"
              subtitle="O sistema está em evolução constante, guiado pela rotina real da equipe e pela expansão da integração MK."
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(5, 1fr)' },
                gap: 2.5,
              }}
            >
              {CONTINUOUS.map(({ icon: Icon, title, desc }) => (
                <Paper
                  key={title}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                  }}
                >
                  <Box sx={iconBadgeSx}>
                    <Icon size={22} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                    {desc}
                  </Typography>
                </Paper>
              ))}
            </Box>

            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: 3,
                borderRadius: 3,
                border: 1,
                borderColor: alpha(primary, 0.25),
                bgcolor: sectionBg,
              }}
            >
              <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                Validação de novos padrões
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                <Box component="strong" sx={{ color: 'text.primary' }}>
                  Importante:
                </Box>{' '}
                qualquer ordem de serviço que divirja dos padrões estabelecidos nesta
                plataforma deve ser obrigatoriamente validada pela gerência antes de sua
                implementação. Esse processo garante a manutenção da qualidade e da
                consistência da nossa documentação.
              </Typography>
            </Paper>
          </Box>
        </FadeInSection>
      </Container>

      <Box
        component="footer"
        sx={{
          mt: 'auto',
          py: 5,
          px: 2,
          bgcolor: mode === 'light' ? theme.palette.grey[900] : alpha('#000', 0.55),
          color: theme.palette.grey[400],
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            sx={{ textAlign: 'center', lineHeight: 1.8, color: '#bdbdbd' }}
          >
            <Box component="span" sx={{ opacity: 0.5, fontSize: 11, letterSpacing: '0.06em', color: '#bdbdbd' }}>
              GERADOR DE O.S · MZ NET
            </Box>
            <br />
            © <strong style={{ color: '#e0e0e0' }}>2026 Ramony Lima – Todos os direitos reservados.</strong>
            <br />
            <Box component="em" sx={{ display: 'block', mt: 1, opacity: 0.9, color: '#bdbdbd' }}>
              Esta aplicação está protegida pela Lei nº 9.609/1998
              (Lei de Software – Brasil), que assegura os direitos autorais do desenvolvedor.
            </Box>
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
