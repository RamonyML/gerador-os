import { useCallback, useRef, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import Cropper from 'react-easy-crop'
import { sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { AppPageChrome } from '../components/AppPageChrome'
import { Reveal } from '../components/Reveal'
import { SidebarCircuit } from '../components/SidebarCircuit'
import { SidebarWaves } from '../components/SidebarWaves'
import { SidebarBubbles } from '../components/SidebarBubbles'
import { SidebarDots } from '../components/SidebarDots'
import { SidebarHexagons } from '../components/SidebarHexagons'
import { SidebarMesh } from '../components/SidebarMesh'
import { useAuth } from '../contexts/AuthContext'
import {
  SIDEBAR_TEXTURES,
  useSidebarTexture,
  type SidebarTexture,
} from '../contexts/SidebarTextureContext'
import {
  APP_FONTS,
  FONT_STACKS,
  useAppFont,
  type AppFont,
} from '../contexts/FontContext'
import { auth, db } from '../lib/firebase'
import { upsertMyPublicProfile } from '../lib/usersPublic'
import {
  AVATAR_ACCEPT,
  getCroppedAvatarBlob,
  uploadAvatar,
  validateAvatarFile,
  type CropArea,
} from '../lib/avatarStorage'
import {
  SECTOR_LABELS,
  type Hierarchy,
} from '../types/profile'

const HIERARCHY_LABELS: Record<Hierarchy, string> = {
  gerente: 'Gestor',
  supervisor: 'Supervisor',
  operador: 'Operador',
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

/** Amostra visual de uma textura do menu lateral (usada no seletor de aparência). */
function TexturePreviewTile({ value }: { value: SidebarTexture }) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 96,
        height: 96,
        mx: 'auto',
        borderRadius: '50%',
        overflow: 'hidden',
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {value === 'circuito' ? <SidebarCircuit preview /> : null}
      {value === 'ondas' ? <SidebarWaves preview /> : null}
      {value === 'bolhas' ? <SidebarBubbles preview /> : null}
      {value === 'pontos' ? <SidebarDots preview /> : null}
      {value === 'hexagonos' ? <SidebarHexagons preview /> : null}
      {value === 'malha' ? <SidebarMesh preview /> : null}
      {value === 'nenhuma' ? (
        <Typography variant="caption" color="text.disabled">
          Sem textura
        </Typography>
      ) : null}
    </Box>
  )
}

export function ProfilePage() {
  const theme = useTheme()
  const primary = theme.palette.primary.main
  const { user, profile, photoURL, refreshUser } = useAuth()
  const { texture, setTexture } = useSidebarTexture()
  const { font, setFont } = useAppFont()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<CropArea | null>(null)
  const [uploading, setUploading] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const [resetting, setResetting] = useState(false)
  const [resetMsg, setResetMsg] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)

  const displayName =
    profile?.displayName?.trim() || user?.email?.split('@')[0] || 'Usuário'
  const email = user?.email ?? profile?.email ?? '—'

  const onCropComplete = useCallback((_: CropArea, areaPixels: CropArea) => {
    setCroppedArea(areaPixels)
  }, [])

  const pickFile = () => {
    setPhotoError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const err = validateAvatarFile(file)
    if (err) {
      setPhotoError(err)
      return
    }
    const url = URL.createObjectURL(file)
    setImageSrc(url)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  const closeCropper = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc)
    setImageSrc(null)
    setCroppedArea(null)
  }

  const handleConfirmCrop = async () => {
    if (!imageSrc || !croppedArea || !auth.currentUser) return
    setUploading(true)
    setPhotoError(null)
    try {
      const blob = await getCroppedAvatarBlob(imageSrc, croppedArea)
      const url = await uploadAvatar(auth.currentUser.uid, blob)
      await updateProfile(auth.currentUser, { photoURL: url })
      await upsertMyPublicProfile(db, auth.currentUser.uid, {
        displayName,
        photoURL: url,
      })
      await refreshUser()
      closeCropper()
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : 'Falha ao atualizar a foto.',
      )
    } finally {
      setUploading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email || email === '—') {
      setResetError('Não há e-mail associado a esta conta.')
      return
    }
    setResetting(true)
    setResetError(null)
    setResetMsg(null)
    try {
      await sendPasswordResetEmail(auth, email)
      setResetMsg(
        `Enviamos um link de redefinição de senha para ${email}. Verifique sua caixa de entrada (e o spam).`,
      )
    } catch {
      setResetError('Não foi possível enviar o e-mail. Tente novamente.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <AppPageChrome
      overline="Conta"
      title="Meu perfil"
      subtitle={
        <Typography variant="body1" color="text.secondary">
          Gerencie sua foto de perfil e a segurança da sua conta. Nome e e-mail são
          definidos pela gestão.
        </Typography>
      }
      maxWidth="lg"
      illustration="account"
      illustrationAlt="Perfil e conta"
    >
      <Stack spacing={2.5}>
        {/* Identificação */}
        <Reveal delay={60}>
          <Paper
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 3 },
                alignItems: { xs: 'flex-start', sm: 'center' },
              }}
            >
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                  src={photoURL ?? undefined}
                  sx={{
                    width: 104,
                    height: 104,
                    bgcolor: 'primary.main',
                    fontSize: 34,
                    fontWeight: 700,
                    boxShadow: `0 10px 26px ${alpha(primary, 0.32)}`,
                  }}
                >
                  {initialsFrom(displayName)}
                </Avatar>
                <Button
                  onClick={pickFile}
                  size="small"
                  variant="contained"
                  aria-label="Alterar foto"
                  sx={{
                    position: 'absolute',
                    right: -6,
                    bottom: -6,
                    minWidth: 0,
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    p: 0,
                    boxShadow: 2,
                  }}
                >
                  <PhotoCameraOutlinedIcon fontSize="small" />
                </Button>
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {displayName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.25 }}
                  noWrap
                >
                  {email}
                </Typography>
                {profile ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                    <Chip
                      icon={<BadgeOutlinedIcon />}
                      label={SECTOR_LABELS[profile.sector] ?? profile.sector}
                      size="small"
                      sx={{
                        bgcolor: alpha(primary, theme.palette.mode === 'dark' ? 0.22 : 0.12),
                        color: 'primary.main',
                        fontWeight: 700,
                        '& .MuiChip-icon': { color: 'primary.main' },
                      }}
                    />
                    <Chip
                      icon={<WorkspacePremiumOutlinedIcon />}
                      label={HIERARCHY_LABELS[profile.hierarchy] ?? profile.hierarchy}
                      size="small"
                      variant="outlined"
                    />
                    {profile.isTi ? <Chip label="T.I" size="small" color="primary" /> : null}
                    {profile.isAdmin ? (
                      <Chip label="Administrador" size="small" color="secondary" />
                    ) : null}
                    {profile.isDev ? (
                      <Chip label="Dev" size="small" variant="outlined" />
                    ) : null}
                  </Box>
                ) : null}
              </Box>
            </Box>

            {photoError ? (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                {photoError}
              </Alert>
            ) : null}

            <input
              ref={fileInputRef}
              type="file"
              accept={AVATAR_ACCEPT}
              hidden
              onChange={handleFileChange}
            />
          </Paper>
        </Reveal>

        {/* Segurança */}
        <Reveal delay={140}>
          <Paper
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Segurança
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              Para alterar sua senha, enviaremos um link seguro de redefinição para o seu
              e-mail.
            </Typography>

            {resetMsg ? (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setResetMsg(null)}>
                {resetMsg}
              </Alert>
            ) : null}
            {resetError ? (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setResetError(null)}>
                {resetError}
              </Alert>
            ) : null}

            <Button
              variant="contained"
              startIcon={
                resetting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <LockResetOutlinedIcon />
                )
              }
              disabled={resetting}
              onClick={() => void handlePasswordReset()}
            >
              {resetting ? 'Enviando…' : 'Redefinir senha por e-mail'}
            </Button>
          </Paper>
        </Reveal>

        {/* Aparência */}
        <Reveal delay={220}>
          <Paper
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Aparência do menu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              Escolha a textura de fundo do menu lateral. A preferência fica salva
              neste dispositivo.
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                },
                gap: 1.5,
              }}
            >
              {SIDEBAR_TEXTURES.map((opt) => {
                const selected = texture === opt.value
                return (
                  <Box
                    key={opt.value}
                    role="radio"
                    aria-checked={selected}
                    tabIndex={0}
                    onClick={() => setTexture(opt.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setTexture(opt.value)
                      }
                    }}
                    sx={{
                      position: 'relative',
                      cursor: 'pointer',
                      borderRadius: 2,
                      p: 1,
                      border: 2,
                      borderColor: selected ? 'primary.main' : 'divider',
                      bgcolor: selected
                        ? alpha(primary, theme.palette.mode === 'dark' ? 0.16 : 0.07)
                        : 'transparent',
                      transition: 'border-color .15s, background-color .15s',
                      outline: 'none',
                      '&:hover': {
                        borderColor: selected ? 'primary.main' : 'text.disabled',
                      },
                      '&:focus-visible': {
                        boxShadow: `0 0 0 3px ${alpha(primary, 0.35)}`,
                      },
                    }}
                  >
                    {selected ? (
                      <CheckCircleRoundedIcon
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          fontSize: 20,
                          bgcolor: 'background.paper',
                          borderRadius: '50%',
                        }}
                      />
                    ) : null}
                    <TexturePreviewTile value={opt.value} />
                    <Box sx={{ px: 0.5, pt: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {opt.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {opt.description}
                      </Typography>
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Paper>
        </Reveal>

        <Reveal>
          <Paper
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Fonte do sistema
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              Escolha a fonte usada em toda a plataforma. A preferência fica salva
              neste dispositivo.
            </Typography>

            <TextField
              select
              label="Fonte"
              value={font}
              onChange={(e) => setFont(e.target.value as AppFont)}
              fullWidth
              sx={{ maxWidth: 360 }}
            >
              {APP_FONTS.map((opt) => (
                <MenuItem
                  key={opt.value}
                  value={opt.value}
                  sx={{ fontFamily: FONT_STACKS[opt.value] }}
                >
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Paper>
        </Reveal>
      </Stack>

      {/* Recorte da foto */}
      <Dialog open={imageSrc != null} onClose={uploading ? undefined : closeCropper} maxWidth="xs" fullWidth>
        <DialogTitle>Ajustar foto</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 300,
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'action.hover',
            }}
          >
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            ) : null}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Zoom
            </Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.01}
              onChange={(_, v) => setZoom(v as number)}
              aria-label="Zoom"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCropper} disabled={uploading} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={() => void handleConfirmCrop()}
            variant="contained"
            disabled={uploading || !croppedArea}
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {uploading ? 'Salvando…' : 'Salvar foto'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppPageChrome>
  )
}
