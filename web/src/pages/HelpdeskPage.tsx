import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { AppPageChrome } from '../components/AppPageChrome'
import { useAuth } from '../contexts/AuthContext'
import { canManageHelpdesk } from '../lib/helpdeskAccess'
import { ticketActorFromProfile } from '../lib/ticketsFirestore'
import { useTickets } from '../hooks/useTickets'
import {
  TICKET_ARCHIVE_TAG_LABELS,
  TICKET_ARCHIVE_TAGS,
  TICKET_CATEGORY_LABELS,
  TICKET_STATUSES,
  TICKET_STATUS_LABELS,
  type Ticket,
  type TicketArchiveTag,
  type TicketStatus,
} from '../types/ticket'
import { NewTicketDialog } from '../features/helpdesk/NewTicketDialog'
import {
  TicketArchiveTagChip,
  TicketPriorityChip,
  TicketStatusChip,
} from '../features/helpdesk/ticketChips'

function TicketRow({
  ticket,
  onOpen,
  showAuthor,
}: {
  ticket: Ticket
  onOpen: (id: string) => void
  showAuthor: boolean
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onOpen(ticket.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(ticket.id)
        }
      }}
      sx={{
        px: { xs: 2, sm: 2.5 },
        py: 1.75,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
          alignItems: { sm: 'center' },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
            {ticket.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {TICKET_CATEGORY_LABELS[ticket.category]}
            {showAuthor ? ` · ${ticket.authorName}` : ''}
            {ticket.assigneeName ? ` · Resp.: ${ticket.assigneeName}` : ''}
            {' · '}
            {ticket.createdAt.toLocaleString('pt-BR')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', flexShrink: 0 }}>
          <TicketPriorityChip priority={ticket.priority} />
          {ticket.archiveTag ? (
            <TicketArchiveTagChip tag={ticket.archiveTag} />
          ) : (
            <TicketStatusChip status={ticket.status} />
          )}
        </Box>
      </Box>
    </Box>
  )
}

export function HelpdeskPage() {
  const navigate = useNavigate()
  const { user, profile, profileMissing, photoURL } = useAuth()
  const isAgent = canManageHelpdesk(profile)

  const [view, setView] = useState<'gestao' | 'meus' | 'arquivados'>(
    isAgent ? 'gestao' : 'meus',
  )
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('')
  const [tagFilter, setTagFilter] = useState<TicketArchiveTag | ''>('')
  const [dialogOpen, setDialogOpen] = useState(false)

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

  const effectiveView = isAgent ? view : 'meus'

  const mineState = useTickets({ scope: 'mine', uid: user?.uid ?? null })
  // Carrega todos os chamados e filtra no cliente (ativos x arquivados,
  // status e etiqueta), evitando índices compostos adicionais no Firestore.
  const allState = useTickets({ scope: 'all', statusFilter: null })

  const baseState = effectiveView === 'meus' ? mineState : allState

  const displayTickets = useMemo(() => {
    if (effectiveView === 'meus') return mineState.tickets
    if (effectiveView === 'arquivados') {
      return allState.tickets.filter(
        (t) => t.archivedAt && (tagFilter === '' || t.archiveTag === tagFilter),
      )
    }
    // gestão: somente ativos (não arquivados), com filtro de status opcional
    return allState.tickets.filter(
      (t) => !t.archivedAt && (statusFilter === '' || t.status === statusFilter),
    )
  }, [effectiveView, mineState.tickets, allState.tickets, statusFilter, tagFilter])

  const queueCount = useMemo(
    () =>
      isAgent
        ? allState.tickets.filter((t) => !t.archivedAt && t.status === 'aberto')
            .length
        : 0,
    [isAgent, allState.tickets],
  )

  const archivedCount = useMemo(
    () => (isAgent ? allState.tickets.filter((t) => t.archivedAt).length : 0),
    [isAgent, allState.tickets],
  )

  if (profileMissing) {
    return (
      <AppPageChrome overline="T.I" title="Chamados internos">
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Seu perfil não foi encontrado no Firestore. Fale com um administrador.
        </Alert>
      </AppPageChrome>
    )
  }

  return (
    <>
      <AppPageChrome
        overline="T.I"
        title="Chamados internos"
        subtitle={
          <Typography variant="body1" color="text.secondary">
            {isAgent
              ? 'Central de atendimento do T.I: receba, resgate, atualize e encerre os chamados com parecer resolutivo.'
              : 'Abra chamados para o T.I e acompanhe o andamento dos seus pedidos.'}
          </Typography>
        }
        illustration="helpdesk"
        illustrationAlt="Central de chamados T.I"
        headerRight={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Abrir chamado
          </Button>
        }
      >
        {isAgent ? (
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <ToggleButtonGroup
              size="small"
              exclusive
              value={view}
              onChange={(_, v) => {
                if (v) setView(v as 'gestao' | 'meus' | 'arquivados')
              }}
            >
              <ToggleButton value="gestao">
                Gestão (T.I)
                {queueCount > 0 ? (
                  <Chip
                    size="small"
                    color="info"
                    label={queueCount}
                    sx={{ ml: 1, height: 20 }}
                  />
                ) : null}
              </ToggleButton>
              <ToggleButton value="meus">Meus chamados</ToggleButton>
              <ToggleButton value="arquivados">
                Arquivados
                {archivedCount > 0 ? (
                  <Chip
                    size="small"
                    label={archivedCount}
                    sx={{ ml: 1, height: 20 }}
                  />
                ) : null}
              </ToggleButton>
            </ToggleButtonGroup>

            {view === 'gestao' ? (
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="ticket-status-filter">Status</InputLabel>
                <Select
                  labelId="ticket-status-filter"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as TicketStatus | '')
                  }
                >
                  <MenuItem value="">Todos os status</MenuItem>
                  {TICKET_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {TICKET_STATUS_LABELS[s]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}

            {view === 'arquivados' ? (
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="ticket-tag-filter">Etiqueta</InputLabel>
                <Select
                  labelId="ticket-tag-filter"
                  label="Etiqueta"
                  value={tagFilter}
                  onChange={(e) =>
                    setTagFilter(e.target.value as TicketArchiveTag | '')
                  }
                >
                  <MenuItem value="">Todas as etiquetas</MenuItem>
                  {TICKET_ARCHIVE_TAGS.map((t) => (
                    <MenuItem key={t} value={t}>
                      {TICKET_ARCHIVE_TAG_LABELS[t]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
          </Box>
        ) : null}

        <Paper
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2.5,
            bgcolor: 'background.paper',
            overflow: 'hidden',
            mt: 2,
          }}
        >
          {baseState.status === 'loading' ? (
            <Box sx={{ px: 2.5, py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Carregando chamados…
              </Typography>
            </Box>
          ) : baseState.status === 'error' ? (
            <Box sx={{ px: 2.5, py: 3 }}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {baseState.message}
              </Alert>
            </Box>
          ) : displayTickets.length === 0 ? (
            <Box sx={{ px: 2.5, py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {effectiveView === 'gestao'
                  ? 'Nenhum chamado para os critérios atuais.'
                  : effectiveView === 'arquivados'
                    ? 'Nenhum chamado arquivado para os critérios atuais.'
                    : 'Você ainda não abriu chamados. Clique em «Abrir chamado» para começar.'}
              </Typography>
            </Box>
          ) : (
            <Stack divider={<Divider />}>
              {displayTickets.map((t) => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  onOpen={(id) => navigate(`/chamados/${id}`)}
                  showAuthor={effectiveView !== 'meus'}
                />
              ))}
            </Stack>
          )}
        </Paper>
      </AppPageChrome>

      <NewTicketDialog
        open={dialogOpen}
        actor={actor}
        onClose={() => setDialogOpen(false)}
        onCreated={(id) => {
          setDialogOpen(false)
          navigate(`/chamados/${id}`)
        }}
      />
    </>
  )
}
