import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'
import { useColorMode } from '../contexts/ColorModeContext'
import { brandLogoSrc } from '../lib/brandAssets'

/** Padrão decorativo discreto (equivalente ao SVG do legado). */
const SUBTLE_PATTERN =
  'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2322c55e\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'

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

function TooltipName({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
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

  const sectionBg =
    mode === 'light'
      ? alpha(theme.palette.primary.main, 0.04)
      : alpha(theme.palette.primary.main, 0.08)

  const impactItems = [
    'Redução significativa no tempo de elaboração de documentos',
    'Maior precisão nas informações registradas',
    'Padronização completa da documentação',
    'Melhoria na qualidade do atendimento ao cliente',
    'Aumento na produtividade da equipe de suporte',
    'Melhor clareza no processo de treinamento de novos colaboradores',
  ]

  return (
    <Box sx={{ flex: 1, width: '100%', bgcolor: 'background.default' }}>
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
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            bottom: '8%',
            left: '5%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: alpha(primary, mode === 'dark' ? 0.1 : 0.06),
            filter: 'blur(48px)',
            transform: `translate(${parallaxY * 0.08}px, ${parallaxY * -0.1}px)`,
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            py: { xs: 5, md: 8 },
            px: { xs: 2, sm: 3 },
          }}
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
                    fontSize: { xs: '1.15rem', sm: '1.35rem' },
                  }}
                >
                  Padronização e Automatização
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: '0 1 320px',
                  width: '100%',
                  maxWidth: 320,
                  transform: `translateY(${parallaxY * -0.04}px)`,
                  transition: 'transform 0.1s linear',
                }}
              >
                <Box
                  component="img"
                  src={brandLogoSrc(mode)}
                  alt="MZ NET"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    filter:
                      mode === 'light'
                        ? 'drop-shadow(0 12px 28px rgba(0,0,0,0.08))'
                        : 'drop-shadow(0 12px 32px rgba(0,0,0,0.35))',
                  }}
                />
              </Box>
            </Box>
          </FadeInSection>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 }, px: { xs: 2, sm: 3 } }}>
        <FadeInSection delayMs={50}>
          <Box sx={{ textAlign: { xs: 'left', lg: 'center' }, mb: 6 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}
            >
              Sobre o Projeto
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                mt: 2,
                fontWeight: 400,
                maxWidth: 640,
                mx: { lg: 'auto' },
                lineHeight: 1.6,
              }}
            >
              Uma solução para otimizar o processo de elaboração de protocolos e Ordens de Serviços
              geradas pelo suporte técnico.
            </Typography>
          </Box>
        </FadeInSection>

        <FadeInSection delayMs={100}>
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
                boxShadow:
                  mode === 'light'
                    ? '0 8px 32px rgba(0,0,0,0.06)'
                    : '0 8px 32px rgba(0,0,0,0.35)',
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
                .
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
                boxShadow:
                  mode === 'light'
                    ? '0 8px 32px rgba(0,0,0,0.06)'
                    : '0 8px 32px rgba(0,0,0,0.35)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Supervisão e Validação
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                Todas as O.S são padronizadas e validadas pela gerência, sob supervisão de{' '}
                <TooltipName title="Gerente de Suporte">Deivit Rafael</TooltipName> e{' '}
                <TooltipName title="Sub-gerente">Hiago Alves</TooltipName>, com grande contribuição de{' '}
                <TooltipName title="Revisão e Formatação">Karolayne Pereira</TooltipName> na revisão e
                formatação textual.
              </Typography>
            </Paper>
          </Box>
        </FadeInSection>

        <FadeInSection delayMs={120}>
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 800, textAlign: 'center', mt: 7, mb: 4, letterSpacing: '-0.02em' }}
          >
            Objetivos e Benefícios
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
              gap: 3,
            }}
          >
            {[
              {
                icon: <SpeedOutlinedIcon sx={{ fontSize: 36 }} />,
                title: 'Otimização de Tempo',
                body: 'Redução significativa no tempo de elaboração de demandas, de 10-15 minutos para aproximadamente 3-5 minutos.',
              },
              {
                icon: <TaskAltOutlinedIcon sx={{ fontSize: 36 }} />,
                title: 'Padronização',
                body: 'Garantia de uniformidade na documentação gerada, seguindo padrões estabelecidos e aprovados pela gerência.',
              },
              {
                icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 36 }} />,
                title: 'Automatização',
                body: 'Geração automática de protocolos e O.S, minimizando erros humanos e aumentando a produtividade.',
              },
            ].map((item) => (
              <Paper
                key={item.title}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: 1,
                  borderColor: alpha(primary, 0.2),
                  bgcolor: sectionBg,
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    color: 'primary.main',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: alpha(primary, mode === 'dark' ? 0.18 : 0.12),
                  }}
                >
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                    {item.body}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </FadeInSection>

        <FadeInSection delayMs={140}>
          <Paper
            elevation={0}
            sx={{
              mt: 7,
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow:
                mode === 'light'
                  ? '0 8px 32px rgba(0,0,0,0.06)'
                  : '0 8px 32px rgba(0,0,0,0.35)',
            }}
          >
            <Typography variant="h5" component="h3" sx={{ fontWeight: 800, mb: 3 }}>
              Impacto e Resultados
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.75 }}>
              O Gerador de O.S otimizou o <strong>processo de elaboração de protocolos e O.S</strong> no
              suporte técnico da MZNet, proporcionando uma solução eficiente e padronizada para o registro
              de atendimentos. Com sua implementação, conseguimos:
            </Typography>
            <List dense sx={{ py: 0, pl: 0 }}>
              {impactItems.map((text) => (
                <ListItem key={text} sx={{ px: 0, py: 0.5, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 28, mt: 0.6 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    slotProps={{
                      primary: {
                        variant: 'body1',
                        color: 'text.secondary',
                        sx: { lineHeight: 1.7 },
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </FadeInSection>

        <FadeInSection delayMs={160}>
          <Paper
            elevation={0}
            sx={{
              mt: 5,
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: 1,
              borderColor: alpha(primary, 0.25),
              background:
                mode === 'light'
                  ? `linear-gradient(120deg, ${alpha(primary, 0.08)} 0%, ${alpha(theme.palette.grey[100], 0.9)} 100%)`
                  : `linear-gradient(120deg, ${alpha(primary, 0.14)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
            }}
          >
            <Typography variant="h5" component="h3" sx={{ fontWeight: 800, mb: 3 }}>
              Desenvolvimento Contínuo e Validação
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Evolução Contínua
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                  O Gerador de O.S é um projeto em constante desenvolvimento. Contamos com o valioso
                  feedback de nossos operadores para identificar e resolver falhas, além de implementar
                  melhorias que tornem a ferramenta ainda mais eficiente e adaptada às necessidades da
                  equipe.
                </Typography>
              </Paper>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Validação de Novos Padrões
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                  <strong>Importante:</strong> Qualquer ordem de serviço que divirja dos padrões
                  estabelecidos neste gerador deve ser obrigatoriamente validada pela gerência antes de sua
                  implementação. Este processo garante a manutenção da qualidade e consistência em nossa
                  documentação.
                </Typography>
              </Paper>
            </Box>
          </Paper>
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
