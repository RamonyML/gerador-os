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
  TICKET_CATEGORY_LABELS,
  TICKET_STATUSES,
  TICKET_STATUS_LABELS,
  type Ticket,
  type TicketStatus,
} from '../types/ticket'
import { NewTicketDialog } from '../features/helpdesk/NewTicketDialog'
import {
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
          <TicketStatusChip status={ticket.status} />
        </Box>
      </Box>
    </Box>
  )
}

export function HelpdeskPage() {
  const navigate = useNavigate()
  const { user, profile, profileMissing } = useAuth()
  const isAgent = canManageHelpdesk(profile)

  const [view, setView] = useState<'gestao' | 'meus'>(isAgent ? 'gestao' : 'meus')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const actor = useMemo(
    () =>
      user
        ? ticketActorFromProfile(user.uid, user.email ?? null, profile, isAgent)
        : null,
    [user, profile, isAgent],
  )

  const effectiveView = isAgent ? view : 'meus'

  const mineState = useTickets({ scope: 'mine', uid: user?.uid ?? null })
  const allState = useTickets({
    scope: 'all',
    statusFilter: statusFilter === '' ? null : statusFilter,
  })

  const state = effectiveView === 'gestao' ? allState : mineState

  const queueCount = useMemo(
    () =>
      effectiveView === 'gestao'
        ? allState.tickets.filter((t) => t.status === 'aberto').length
        : 0,
    [effectiveView, allState.tickets],
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
                if (v) setView(v as 'gestao' | 'meus')
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
          {state.status === 'loading' ? (
            <Box sx={{ px: 2.5, py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Carregando chamados…
              </Typography>
            </Box>
          ) : state.status === 'error' ? (
            <Box sx={{ px: 2.5, py: 3 }}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {state.message}
              </Alert>
            </Box>
          ) : state.tickets.length === 0 ? (
            <Box sx={{ px: 2.5, py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {effectiveView === 'gestao'
                  ? 'Nenhum chamado para os critérios atuais.'
                  : 'Você ainda não abriu chamados. Clique em «Abrir chamado» para começar.'}
              </Typography>
            </Box>
          ) : (
            <Stack divider={<Divider />}>
              {state.tickets.map((t) => (
                <TicketRow
                  key={t.id}
                  ticket={t}
                  onOpen={(id) => navigate(`/chamados/${id}`)}
                  showAuthor={effectiveView === 'gestao'}
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
