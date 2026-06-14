import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Box, Chip, Container, Paper, Tooltip, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FolderTree,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  MessageSquare,
  MousePointerClick,
  PlusCircle,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
  Workflow,
} from 'lucide-react'
import { useColorMode } from '../contexts/ColorModeContext'
import { HeroIllustration } from '../components/HeroIllustration'
import { ILLUSTRATIONS } from '../data/illustrations'

/** Padrão decorativo discreto (equivalente ao SVG do legado). */
const SUBTLE_PATTERN =
  'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2322c55e\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'

/** O que a plataforma oferece hoje (recursos efetivamente disponíveis). */
const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: LayoutDashboard,
    title: 'Hub de Suporte',
    desc: 'Centralização dos fluxos operacionais utilizados pelo suporte técnico.',
  },
  {
    icon: FolderTree,
    title: 'Demandas por Categoria',
    desc: 'Modelos de atendimento organizados por área e tipo de operação.',
  },
  {
    icon: LifeBuoy,
    title: 'Chamados Internos',
    desc: 'Registro e acompanhamento das demandas internas da equipe.',
  },
  {
    icon: TrendingUp,
    title: 'Registro de Upgrades',
    desc: 'Controle operacional dos upgrades realizados e suas comissões.',
  },
  {
    icon: CalendarDays,
    title: 'Escala de Trabalho',
    desc: 'Organização dos turnos e plantões da equipe.',
  },
  {
    icon: MapPin,
    title: 'Agenda de Visitas',
    desc: 'Agendamento de visitas técnicas de instalação, mudança de endereço e manutenção.',
  },
  {
    icon: Building2,
    title: 'Condomínios',
    desc: 'Consulta de viabilidade de fibra e registros de inviabilidade.',
  },
  {
    icon: Users,
    title: 'Gestão de Usuários',
    desc: 'Controle de contas, perfis e permissões de acesso.',
  },
  {
    icon: ClipboardCheck,
    title: 'Padronização de Processos',
    desc: 'Uniformidade na documentação e nos procedimentos.',
  },
  {
    icon: ShieldCheck,
    title: 'Autenticação Segura',
    desc: 'Controle de acesso através do Firebase Authentication.',
  },
]

/** Resultados obtidos com a plataforma. */
const RESULTS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Clock,
    title: 'Redução de tempo',
    desc: 'De 10–15 minutos para cerca de 3–5 minutos por documento.',
  },
  {
    icon: CheckCircle2,
    title: 'Padronização',
    desc: 'Documentação uniforme e aprovada pela gerência.',
  },
  {
    icon: ShieldAlert,
    title: 'Menos erros',
    desc: 'Geração assistida que minimiza falhas humanas.',
  },
  {
    icon: Rocket,
    title: 'Mais produtividade',
    desc: 'Equipe focada no atendimento, não na digitação repetitiva.',
  },
  {
    icon: GraduationCap,
    title: 'Melhor treinamento',
    desc: 'Onboarding mais claro e rápido para novos colaboradores.',
  },
]

/** Desenvolvimento contínuo: o sistema é um produto vivo. */
const CONTINUOUS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: MessageSquare,
    title: 'Feedback dos operadores',
    desc: 'A equipe sugere melhorias e reporta falhas no dia a dia.',
  },
  {
    icon: Wrench,
    title: 'Correções contínuas',
    desc: 'Ajustes constantes de estabilidade e qualidade.',
  },
  {
    icon: PlusCircle,
    title: 'Novas funcionalidades',
    desc: 'Recursos novos conforme a operação evolui.',
  },
  {
    icon: MousePointerClick,
    title: 'Melhorias de usabilidade',
    desc: 'Interface cada vez mais simples e agradável.',
  },
  {
    icon: Workflow,
    title: 'Expansão dos fluxos',
    desc: 'Novos processos operacionais integrados à plataforma.',
  },
]

/**
 * Tecnologias efetivamente presentes no projeto (stack real).
 * Reflete as dependências reais do app — não inclui itens que não são usados.
 */
const TECHNOLOGIES = [
  'React',
  'TypeScript',
  'Vite',
  'Material UI',
  'Emotion',
  'Firebase Authentication',
  'Cloud Firestore',
  'Firebase Storage',
  'Firebase Hosting',
  'React Router',
  'Recharts',
  'Lucide Icons',
  'jsPDF',
]

function FadeInSection({
  children,
  delayMs = 0,
}: {
  children: ReactNode
  delayMs?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible(true)
      },
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
  const { mode } = useColorMode()
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
    bgcolor: alpha(primary, mode === 'dark' ? 0.18 : 0.12),
    border: 1,
    borderColor: alpha(primary, mode === 'dark' ? 0.3 : 0.16),
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
      {/* Hero + parallax */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
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
            background: alpha(primary, mode === 'dark' ? 0.12 : 0.08),
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
                <Chip
                  label="Plataforma operacional"
                  size="small"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    color: 'primary.main',
                    bgcolor: alpha(primary, mode === 'dark' ? 0.18 : 0.1),
                    border: 1,
                    borderColor: alpha(primary, 0.25),
                  }}
                />
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
                  Plataforma de apoio operacional para o suporte técnico da MZ NET.
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 2, maxWidth: 560, lineHeight: 1.7 }}
                >
                  Muito além de gerar ordens de serviço: centraliza fluxos, organiza
                  demandas e aumenta a eficiência das equipes no dia a dia.
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
        {/* Evolução do Projeto */}
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
              . Hoje ela reúne, em um só lugar, os fluxos, as demandas e as ferramentas que
              sustentam a operação da equipe.
            </Typography>
          </Paper>
        </FadeInSection>

        {/* O que a plataforma oferece */}
        <FadeInSection delayMs={60}>
          <Box sx={{ mt: 7 }}>
            <SectionHeading
              overline="Recursos"
              title="O que a plataforma oferece"
              subtitle="Funcionalidades disponíveis atualmente para apoiar a operação do suporte técnico."
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  lg: '1fr 1fr 1fr',
                },
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

        {/* Resultados Obtidos */}
        <FadeInSection delayMs={80}>
          <Box sx={{ mt: 7 }}>
            <SectionHeading
              overline="Impacto"
              title="Resultados obtidos"
              subtitle="Ganhos concretos percebidos no dia a dia do suporte técnico."
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  lg: 'repeat(5, 1fr)',
                },
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

        {/* História do Projeto */}
        <FadeInSection delayMs={100}>
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
                  <TooltipName title="Idealizador & Desenvolvedor Back/Front-End">
                    Ramony Lima
                  </TooltipName>
                  , a partir da necessidade de agilizar e padronizar a abertura de protocolos e
                  ordens de serviço no suporte técnico.
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
                  Todos os modelos são padronizados e validados pela gerência, sob supervisão de{' '}
                  <TooltipName title="Gerente de Suporte">Deivit Rafael</TooltipName> e{' '}
                  <TooltipName title="Sub-gerente">Hiago Alves</TooltipName>, com grande
                  contribuição de{' '}
                  <TooltipName title="Revisão e Formatação">Karolayne Pereira</TooltipName> na
                  revisão e formatação textual.
                </Typography>
              </Paper>
            </Box>
          </Box>
        </FadeInSection>

        {/* Tecnologias Utilizadas */}
        <FadeInSection delayMs={120}>
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
                    bgcolor: alpha(primary, mode === 'dark' ? 0.16 : 0.08),
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
        <FadeInSection delayMs={140}>
          <Box sx={{ mt: 7 }}>
            <SectionHeading
              overline="Produto vivo"
              title="Desenvolvimento contínuo"
              subtitle="O sistema está em evolução constante, guiado pela rotina real da equipe."
            />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  lg: 'repeat(5, 1fr)',
                },
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
          <Typography variant="body2" sx={{ textAlign: 'center', lineHeight: 1.8 }}>
            © <strong>2025 Ramony Lima – Todos os direitos reservados.</strong>
            <br />
            <Box component="em" sx={{ display: 'block', mt: 1, opacity: 0.9 }}>
              Esta aplicação (Gerador de O.S / Sistema de Upgrades) está protegida pela Lei nº 9.609/1998
              (Lei de Software – Brasil), que assegura os direitos autorais do desenvolvedor.
            </Box>
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
