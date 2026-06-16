import { useCallback, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Snackbar,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { AppPageChrome } from '../components/AppPageChrome'
import { MODELOS_OS } from '../data/modelosOs'

const CATEGORY_COLORS: Record<string, string> = {
  manutencao: '#f97316',
  altplan: '#3b82f6',
  variadas: '#8b5cf6',
}

export function ModelosOsPage() {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [expanded, setExpanded] = useState<string | false>(false)
  const [copyOk, setCopyOk] = useState(false)

  const activeCategory = MODELOS_OS[activeTab]!
  const accent = CATEGORY_COLORS[activeCategory.id] ?? theme.palette.primary.main

  const handleCopy = useCallback(async (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopyOk(true)
    } catch {
      /* ignore */
    }
  }, [])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    setExpanded(false)
  }

  return (
    <AppPageChrome
      overline="Suporte"
      title="Modelos de O.S."
      maxWidth="lg"
      headerRight={
        <Button
          component={RouterLink}
          to="/suporte"
          variant="outlined"
          color="inherit"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ borderColor: 'divider' }}
        >
          Hub Suporte
        </Button>
      }
      subtitle={
        <Typography variant="body1" color="text.secondary">
          Referências de texto para casos atípicos sem fluxo de formulário dedicado. Expanda o modelo,
          leia o contexto e copie o texto base para adaptar ao atendimento.
        </Typography>
      }
    >
      <Container maxWidth="lg" disableGutters>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: 3,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 14,
                minHeight: 48,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: accent,
              },
              '& .Mui-selected': {
                color: `${accent} !important`,
              },
            }}
          >
            {MODELOS_OS.map((cat, i) => (
              <Tab
                key={cat.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {cat.label}
                    <Chip
                      label={cat.modelos.length}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        bgcolor: alpha(
                          CATEGORY_COLORS[cat.id] ?? theme.palette.primary.main,
                          activeTab === i ? 0.15 : 0.08,
                        ),
                        color: CATEGORY_COLORS[cat.id] ?? theme.palette.primary.main,
                      }}
                    />
                  </Box>
                }
                value={i}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {activeCategory.modelos.map((modelo) => (
            <Accordion
              key={modelo.id}
              expanded={expanded === modelo.id}
              onChange={(_, isExpanded) =>
                setExpanded(isExpanded ? modelo.id : false)
              }
              elevation={0}
              disableGutters
              sx={{
                border: 1,
                borderColor:
                  expanded === modelo.id
                    ? alpha(accent, 0.45)
                    : 'divider',
                borderRadius: '12px !important',
                bgcolor: 'background.paper',
                transition: 'border-color 0.2s ease',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  boxShadow: theme.palette.mode === 'dark'
                    ? `0 8px 24px ${alpha('#000', 0.4)}`
                    : `0 8px 24px ${alpha(accent, 0.1)}`,
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon />}
                sx={{
                  px: 2.5,
                  py: 0.5,
                  minHeight: 64,
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    gap: 2,
                    my: 1,
                  },
                  '& .MuiAccordionSummary-expandIconWrapper': {
                    color: 'text.secondary',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(accent, theme.palette.mode === 'dark' ? 0.18 : 0.1),
                    color: accent,
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                    {modelo.title}
                  </Typography>
                  {modelo.subtitle ? (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {modelo.subtitle}
                    </Typography>
                  ) : null}
                </Box>

                <Tooltip title="Copiar texto">
                  <IconButton
                    size="small"
                    onClick={(e) => void handleCopy(modelo.text, e)}
                    sx={{
                      flexShrink: 0,
                      color: 'text.secondary',
                      '&:hover': { color: accent },
                    }}
                  >
                    <ContentCopyRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                <Alert
                  severity="info"
                  icon={false}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: alpha(accent, theme.palette.mode === 'dark' ? 0.12 : 0.07),
                    color: theme.palette.mode === 'dark' ? alpha(accent, 0.9) : accent,
                    border: `1px solid ${alpha(accent, 0.2)}`,
                    '& .MuiAlert-message': { width: '100%' },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {modelo.description}
                  </Typography>
                </Alert>

                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.03)'
                        : 'grey.50',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2,
                      py: 1,
                      borderBottom: 1,
                      borderColor: 'divider',
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.04)'
                          : 'grey.100',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.06em' }}>
                      TEXTO BASE
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopyRoundedIcon />}
                      onClick={(e) => void handleCopy(modelo.text, e)}
                      sx={{
                        height: 28,
                        fontSize: 12,
                        borderColor: alpha(accent, 0.4),
                        color: accent,
                        '&:hover': {
                          borderColor: accent,
                          bgcolor: alpha(accent, 0.06),
                        },
                      }}
                    >
                      Copiar
                    </Button>
                  </Box>

                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: theme.typography.fontFamily,
                      fontSize: { xs: 13, sm: 13.5 },
                      lineHeight: 1.65,
                      color: 'text.primary',
                      maxHeight: 400,
                      overflowY: 'auto',
                    }}
                  >
                    {modelo.text}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>

      <Snackbar
        open={copyOk}
        autoHideDuration={2200}
        onClose={() => setCopyOk(false)}
        message="Texto copiado para a área de transferência"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </AppPageChrome>
  )
}
