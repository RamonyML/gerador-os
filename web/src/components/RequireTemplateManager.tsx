import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { canManageOsTemplates } from '../lib/permissions'

export function RequireTemplateManager({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile, profileMissing, initializing } = useAuth()

  if (initializing) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 240,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (profileMissing || !profile || !canManageOsTemplates(profile)) {
    return <Navigate to="/" replace />
  }

  return children
}
