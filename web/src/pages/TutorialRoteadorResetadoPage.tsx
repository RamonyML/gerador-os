import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import CloseIcon from '@mui/icons-material/Close'
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import { useNavigate } from 'react-router-dom'
import { TUTORIAL_ROT_RESET_MODELS } from '../data/tutorialRotReset'
import { Reveal } from '../components/Reveal'
import { ProtocoloRotResetForm } from '../components/ProtocoloRotResetForm'

type LightboxState = { src: string; alt: string } | null

export function TutorialRoteadorResetadoPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [modelIndex, setModelIndex] = useState(0)
  const [lightbox, setLightbox] = useState<LightboxState>(null)

  const PROTOCOL_TAB = TUTORIAL_ROT_RESET_MODELS.length
  const isProtocol = modelIndex === PROTOCOL_TAB
  const model = TUTORIAL_ROT_RESET_MODELS[modelIndex] ?? TUTORIAL_ROT_RESET_MODELS[0]

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Back + header */}
          <Reveal>
            <Box>
              <Button
                size="small"
                startIcon={<ArrowBackOutlinedIcon />}
                onClick={() => navigate('/suporte/tutoriais')}
                sx={{ mb: 2, color: 'text.secondary' }}
              >
                Tutoriais
              </Button>

              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}
              >
                Roteador Resetado
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                Guia passo a passo para reconfigurar roteadores após reset de fábrica.
              </Typography>
            </Box>
          </Reveal>

          {/* Illustration */}
          <Reveal>
            <Box
              component="img"
              src="/illustrations/illus-reset.png"
              alt="Roteador Resetado"
              sx={{ width: '100%', display: 'block', mx: 'auto', borderRadius: 2 }}
            />
          </Reveal>

          {/* Model selector */}
          <Reveal>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                Escolha o modelo do roteador
              </Typography>
              <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Tabs
                  value={modelIndex}
                  onChange={(_, v) => setModelIndex(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  slotProps={{
                    indicator: {
                      style: {
                        backgroundColor: isProtocol ? '#16a34a' : undefined,
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                      },
                    },
                  }}
                  sx={{
                    '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', minHeight: 48 },
                    '& .Mui-selected': { color: 'primary.main' },
                    [`& .MuiTab-root:nth-of-type(${PROTOCOL_TAB + 1})`]: {
                      color: '#16a34a',
                    },
                    [`& .MuiTab-root:nth-of-type(${PROTOCOL_TAB + 1}).Mui-selected`]: {
                      color: '#16a34a',
                    },
                  }}
                >
                  {TUTORIAL_ROT_RESET_MODELS.map((m) => (
                    <Tab key={m.id} label={m.label} />
                  ))}
                  <Tab
                    icon={<AssignmentOutlinedIcon sx={{ fontSize: 16 }} />}
                    iconPosition="start"
                    label="Registrar Protocolo"
                  />
                </Tabs>
              </Paper>
            </Box>
          </Reveal>

          {/* Protocol form */}
          {isProtocol && (
            <Reveal key="protocol-form">
              <ProtocoloRotResetForm />
            </Reveal>
          )}

          {/* Access credentials chip row */}
          {!isProtocol && (
          <Reveal>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                size="small"
                label={`IP: ${model.ip}`}
                variant="outlined"
                sx={{ fontFamily: 'monospace', fontWeight: 600 }}
              />
              {model.user !== '—' && (
                <Chip
                  size="small"
                  label={`Usuário: ${model.user}`}
                  variant="outlined"
                  sx={{ fontFamily: 'monospace' }}
                />
              )}
              {model.password !== '—' && (
                <Chip
                  size="small"
                  label={`Senha: ${model.password}`}
                  variant="outlined"
                  sx={{ fontFamily: 'monospace' }}
                />
              )}
            </Box>
          </Reveal>
          )}

          {/* Steps */}
          {!isProtocol && model.steps.map((step, i) => (
            <Reveal key={`${model.id}-step-${i}`}>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 3, p: { xs: 2.5, sm: 3 }, borderColor: 'divider' }}
              >
                {/* Step header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {step.title}
                  </Typography>
                </Box>

                {/* Instructions */}
                <Box
                  component="ol"
                  sx={{
                    pl: 2.5,
                    m: 0,
                    '& li': { mb: 0.75, color: 'text.primary', lineHeight: 1.65 },
                  }}
                >
                  {step.items.map((item, j) => (
                    <li key={j}>
                      <Typography variant="body2" component="span">
                        {item}
                      </Typography>
                    </li>
                  ))}
                </Box>

                {/* Images */}
                {step.images && step.images.length > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      justifyContent: 'center',
                      mt: 2.5,
                    }}
                  >
                    {step.images.map((img) => (
                      <Box
                        key={img.src}
                        onClick={() => setLightbox(img)}
                        sx={{
                          position: 'relative',
                          maxWidth: { xs: '100%', sm: 340 },
                          width: '100%',
                          cursor: 'zoom-in',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: theme.shadows[1],
                          '&:hover .zoom-hint': { opacity: 1 },
                          '&:hover img': { transform: 'scale(1.02)' },
                        }}
                      >
                        <Box
                          component="img"
                          src={img.src}
                          alt={img.alt}
                          sx={{
                            display: 'block',
                            width: '100%',
                            transition: 'transform 0.2s ease',
                          }}
                        />
                        <Box
                          className="zoom-hint"
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha('#000', 0.35),
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            borderRadius: 2,
                          }}
                        >
                          <ZoomInOutlinedIcon sx={{ color: '#fff', fontSize: 36 }} />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Tip */}
                {step.tip && (
                  <Alert
                    severity="success"
                    icon={<CheckCircleOutlineIcon fontSize="small" />}
                    sx={{ mt: 2.5, borderRadius: 2 }}
                  >
                    {step.tip}
                  </Alert>
                )}
              </Paper>
            </Reveal>
          ))}
        </Box>
      </Container>


      {/* Lightbox */}
      <Dialog
        open={lightbox !== null}
        onClose={() => setLightbox(null)}
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none',
              m: { xs: 1, sm: 2 },
              maxWidth: '90vw',
            },
          },
          backdrop: {
            sx: { bgcolor: alpha('#000', 0.85) },
          },
        }}
      >
        <DialogContent
          sx={{ p: 0, position: 'relative', overflow: 'visible' }}
          onClick={() => setLightbox(null)}
        >
          <IconButton
            onClick={() => setLightbox(null)}
            size="small"
            sx={{
              position: 'absolute',
              top: -16,
              right: -16,
              bgcolor: 'background.paper',
              boxShadow: theme.shadows[4],
              zIndex: 1,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          {lightbox && (
            <Box
              component="img"
              src={lightbox.src}
              alt={lightbox.alt}
              sx={{
                display: 'block',
                maxWidth: '85vw',
                maxHeight: '85vh',
                width: 'auto',
                height: 'auto',
                borderRadius: 2,
                boxShadow: theme.shadows[10],
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
