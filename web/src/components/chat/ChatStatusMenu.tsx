import { Box, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material'
import { STATUS_CONFIG, type UserStatus } from '../../types/chat'
import { useChat } from '../../contexts/ChatContext'

const STATUSES: UserStatus[] = ['online', 'ocupado', 'em_pausa', 'offline']

type Props = {
  anchorEl: HTMLElement | null
  onClose: () => void
}

export function ChatStatusMenu({ anchorEl, onClose }: Props) {
  const { myStatus, setMyStatus } = useChat()

  const handleSelect = (s: UserStatus) => {
    setMyStatus(s)
    onClose()
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      slotProps={{ paper: { sx: { minWidth: 160, borderRadius: 2 } } }}
    >
      {STATUSES.map((s) => {
        const cfg = STATUS_CONFIG[s]
        const active = myStatus === s
        return (
          <MenuItem
            key={s}
            onClick={() => handleSelect(s)}
            selected={active}
            sx={{ gap: 1, py: 0.75 }}
          >
            <ListItemIcon sx={{ minWidth: 'auto' }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: cfg.color,
                  flexShrink: 0,
                }}
              />
            </ListItemIcon>
            <Typography variant="body2" sx={{ fontWeight: active ? 700 : 400 }}>
              {cfg.label}
            </Typography>
          </MenuItem>
        )
      })}
    </Menu>
  )
}
