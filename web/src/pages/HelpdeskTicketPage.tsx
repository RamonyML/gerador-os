import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import { alpha, useTheme } from '@mui/material/styles'
import { AppPageChrome } from '../components/AppPageChrome'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/firebase'
import { canManageHelpdesk } from '../lib/helpdeskAccess'
import {
  addComment,
  claimTicket,
  releaseTicket,
  reopenTicket,
  resolveTicket,
  subscribeComments,
  subscribeTicket,
  ticketActorFromProfile,
  updateTicketStatus,
} from '../lib/ticketsFirestore'
import {
  TICKET_CATEGORY_LABELS,
  type Ticket,
  type TicketComment,
} from '../types/ticket'
import {
  TicketPriorityChip,
  TicketStatusChip,
} from '../features/helpdesk/ticketChips'
import { AttachmentGallery } from '../features/helpdesk/AttachmentGallery'
import { AttachmentPicker } from '../features/helpdesk/AttachmentPicker'
import { subscribeUsersPublic, type PublicProfile } from '../lib/usersPublic'

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export function HelpdeskTicketPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const { user, profile, photoURL } = useAuth()
  const isAgent = canManageHelpdesk(profile)

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [comments, setComments] = useState<TicketComment[]>([])
  const [publicProfiles, setPublicProfiles] = useState<
    Record<string, PublicProfile>
  >({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [commentText, setCommentText] = useState('')
  const [commentFiles, setCommentFiles] = useState<File[]>([])
  const [posting, setPosting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [resolveOpen, setResolveOpen] = useState(false)
  const [parecer, setParecer] = useState('')

  const actor = useMemo(
    () =>
      user
        ? ticketActorFromProfile(
            user.uid,
            user.email ?? null,
            profile,
            isAgent,
            photoURL,
          )
        : null,
    [user, profile, isAgent, photoURL],
  )

  useEffect(() => {
    if (!ticketId) return
    setLoading(true)
    const unsubTicket = subscribeTicket(
      db,
      ticketId,
      (t) => {
        setTicket(t)
        setLoading(false)
      },
      (err) => {
        setError(err instanceof Error ? err.message : 'Falha ao carregar o chamado.')
        setLoading(false)
      },
    )
    const unsubComments = subscribeComments(
      db,
      ticketId,
      (list) => setComments(list),
      () => {
        /* timeline opcional; ignora erro de comentários */
      },
    )
    return () => {
      unsubTicket()
      unsubComments()
    }
  }, [ticketId])

  useEffect(() => {
    return subscribeUsersPublic(
      db,
      (map) => setPublicProfiles(map),
      () => {
        /* fotos são opcionais; ignora erro do mapa público */
      },
    )
  }, [])

  const resolvePhoto = (uid: string, fallback: string | null): string | undefined =>
    publicProfiles[uid]?.photoURL ?? fallback ?? undefined

  const isAuthor = !!ticket && !!user && ticket.authorUid === user.uid
  const canComment = isAgent || isAuthor
  const resolved = ticket?.status === 'resolvido'

  const runAction = async (fn: () => Promise<void>) => {
    setBusy(true)
    setActionError(null)
    try {
      await fn()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Falha na ação.')
    } finally {
      setBusy(false)
    }
  }

  const postComment = async () => {
    if (!ticketId || !actor) return
    const text = commentText.trim()
    if (!text && commentFiles.length === 0) return
    setPosting(true)
    setActionError(null)
    try {
      await addComment(db, ticketId, actor, text, commentFiles)
      setCommentText('')
      setCommentFiles([])
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Falha ao enviar atualização.')
    } finally {
      setPosting(false)
    }
  }

  const submitResolution = async () => {
    if (!ticketId || !actor) return
    const text = parecer.trim()
    if (!text) {
      setActionError('Informe o parecer resolutivo.')
      return
    }
    await runAction(() => resolveTicket(db, ticketId, actor, text))
    setResolveOpen(false)
    setParecer('')
  }

  if (loading) {
    return (
      <AppPageChrome overline="T.I" title="Chamado">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </AppPageChrome>
    )
  }

  if (error || !ticket) {
    return (
      <AppPageChrome overline="T.I" title="Chamado">
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error ?? 'Chamado não encontrado ou sem permissão de acesso.'}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/chamados')}
          >
            Voltar para chamados
          </Button>
        </Box>
      </AppPageChrome>
    )
  }

  return (
    <>
      <AppPageChrome
        overline={`Chamado · ${TICKET_CATEGORY_LABELS[ticket.category]}`}
        title={ticket.title}
        subtitle={
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1 }}>
            <TicketStatusChip status={ticket.status} />
            <TicketPriorityChip priority={ticket.priority} />
            <Chip
              size="small"
              variant="outlined"
              label={`Solicitante: ${ticket.authorName}`}
            />
            <Chip
              size="small"
              variant="outlined"
              label={
                ticket.assigneeName
                  ? `Responsável: ${ticket.assigneeName}`
                  : 'Sem responsável'
              }
            />
          </Box>
        }
        headerRight={
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/chamados')}
          >
            Voltar
          </Button>
        }
      >
        {actionError ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {actionError}
          </Alert>
        ) : null}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 300px' },
            gap: 2,
          }}
        >
          <Stack spacing={2}>
            <Paper
              elevation={0}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 2.5, p: 2.5 }}
            >
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1 }}>
                <Avatar
                  src={resolvePhoto(ticket.authorUid, ticket.authorPhotoURL)}
                  sx={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    bgcolor: 'grey.500',
                  }}
                >
                  {initialsFrom(ticket.authorName)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {ticket.authorName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Solicitante
                  </Typography>
                </Box>
              </Box>
              <Typography variant="overline" color="text.secondary">
                Descrição
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                {ticket.description}
              </Typography>
              <AttachmentGallery attachments={ticket.attachments} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1.5 }}
              >
                Aberto em {ticket.createdAt.toLocaleString('pt-BR')}
              </Typography>
            </Paper>

            {resolved && ticket.resolution ? (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2.5,
                  p: 2.5,
                  border: 1,
                  borderColor: alpha(theme.palette.success.main, 0.5),
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <CheckCircleOutlineRoundedIcon color="success" fontSize="small" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Parecer resolutivo
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {ticket.resolution.text}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  Por {ticket.resolution.byName}
                  {ticket.resolvedAt
                    ? ` · ${ticket.resolvedAt.toLocaleString('pt-BR')}`
                    : ''}
                </Typography>
              </Paper>
            ) : null}

            <Paper
              elevation={0}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2.5,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ px: 2.5, py: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Linha do tempo
                </Typography>
              </Box>
              <Divider />
              {comments.length === 0 ? (
                <Box sx={{ px: 2.5, py: 2.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Ainda não há atualizações neste chamado.
                  </Typography>
                </Box>
              ) : (
                <Stack divider={<Divider />}>
                  {comments.map((c) => (
                    <Box
                      key={c.id}
                      sx={{ px: 2.5, py: 2, display: 'flex', gap: 1.5 }}
                    >
                      <Avatar
                        src={resolvePhoto(c.authorUid, c.authorPhotoURL)}
                        sx={{
                          width: 36,
                          height: 36,
                          flexShrink: 0,
                          mt: 0.25,
                          fontSize: 13,
                          fontWeight: 700,
                          bgcolor:
                            c.authorRole === 'ti' ? 'primary.main' : 'grey.500',
                        }}
                      >
                        {initialsFrom(c.authorName)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                            mb: 0.5,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {c.authorName}
                          </Typography>
                          <Chip
                            size="small"
                            variant="outlined"
                            color={c.authorRole === 'ti' ? 'primary' : 'default'}
                            label={c.authorRole === 'ti' ? 'T.I' : 'Solicitante'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {c.createdAt.toLocaleString('pt-BR')}
                          </Typography>
                        </Box>
                        {c.text ? (
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {c.text}
                          </Typography>
                        ) : null}
                        <AttachmentGallery attachments={c.attachments} size={84} />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}

              {canComment ? (
                <>
                  <Divider />
                  <Box sx={{ px: 2.5, py: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      placeholder={
                        resolved
                          ? 'Adicionar observação (chamado resolvido)…'
                          : 'Escreva uma atualização…'
                      }
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <Box sx={{ mt: 1.5 }}>
                      <AttachmentPicker
                        files={commentFiles}
                        onChange={setCommentFiles}
                        onError={(msg) => msg && setActionError(msg)}
                        disabled={posting}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                      <Button
                        variant="contained"
                        onClick={() => void postComment()}
                        disabled={
                          posting ||
                          (commentText.trim().length === 0 &&
                            commentFiles.length === 0)
                        }
                      >
                        {posting ? 'Enviando…' : 'Enviar atualização'}
                      </Button>
                    </Box>
                  </Box>
                </>
              ) : null}
            </Paper>
          </Stack>

          <Stack spacing={2}>
            <Paper
              elevation={0}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 2.5, p: 2.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                {isAgent ? 'Atendimento (T.I)' : 'Acompanhamento'}
              </Typography>

              {isAgent ? (
                <Stack spacing={1}>
                  {ticket.status === 'aberto' ? (
                    <Button
                      variant="contained"
                      disabled={busy}
                      onClick={() =>
                        actor && void runAction(() => claimTicket(db, ticket.id, actor))
                      }
                    >
                      Resgatar (assumir)
                    </Button>
                  ) : null}

                  {!resolved && ticket.status !== 'em_atendimento' ? (
                    <Button
                      variant="outlined"
                      disabled={busy}
                      onClick={() =>
                        void runAction(() =>
                          updateTicketStatus(db, ticket.id, 'em_atendimento'),
                        )
                      }
                    >
                      Marcar em atendimento
                    </Button>
                  ) : null}

                  {!resolved && ticket.status !== 'aguardando_solicitante' ? (
                    <Button
                      variant="outlined"
                      disabled={busy}
                      onClick={() =>
                        void runAction(() =>
                          updateTicketStatus(
                            db,
                            ticket.id,
                            'aguardando_solicitante',
                          ),
                        )
                      }
                    >
                      Aguardar solicitante
                    </Button>
                  ) : null}

                  {!resolved ? (
                    <Button
                      variant="contained"
                      color="success"
                      disabled={busy}
                      onClick={() => {
                        setParecer('')
                        setResolveOpen(true)
                      }}
                    >
                      Encerrar com parecer
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      disabled={busy}
                      onClick={() => void runAction(() => reopenTicket(db, ticket.id))}
                    >
                      Reabrir chamado
                    </Button>
                  )}

                  {ticket.assigneeUid ? (
                    <Button
                      variant="text"
                      color="inherit"
                      disabled={busy}
                      onClick={() => void runAction(() => releaseTicket(db, ticket.id))}
                    >
                      Liberar (voltar à fila)
                    </Button>
                  ) : null}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {resolved
                    ? 'Este chamado foi encerrado pelo T.I com parecer resolutivo. Caso o problema persista, registre uma atualização na linha do tempo.'
                    : 'O T.I foi notificado. Acompanhe o andamento e use a linha do tempo para enviar informações adicionais.'}
                </Typography>
              )}
            </Paper>

            <Paper
              elevation={0}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 2.5, p: 2.5 }}
            >
              <Typography variant="overline" color="text.secondary">
                Detalhes
              </Typography>
              <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                <Typography variant="body2">
                  <strong>Categoria:</strong>{' '}
                  {TICKET_CATEGORY_LABELS[ticket.category]}
                </Typography>
                <Typography variant="body2">
                  <strong>Solicitante:</strong> {ticket.authorName}
                  {ticket.authorEmail ? ` (${ticket.authorEmail})` : ''}
                </Typography>
                <Typography variant="body2">
                  <strong>Responsável:</strong>{' '}
                  {ticket.assigneeName ?? '—'}
                </Typography>
                {ticket.updatedAt ? (
                  <Typography variant="body2" color="text.secondary">
                    Última atualização: {ticket.updatedAt.toLocaleString('pt-BR')}
                  </Typography>
                ) : null}
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </AppPageChrome>

      <Dialog
        open={resolveOpen}
        onClose={() => {
          if (!busy) setResolveOpen(false)
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Encerrar chamado com parecer resolutivo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Descreva a solução aplicada. O parecer ficará registrado e é
            obrigatório para encerrar o chamado.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            label="Parecer resolutivo"
            value={parecer}
            onChange={(e) => setParecer(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveOpen(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => void submitResolution()}
            disabled={busy || parecer.trim().length === 0}
          >
            {busy ? 'Encerrando…' : 'Encerrar chamado'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
