import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { canAccessAgenda } from '../lib/permissions'

export function RequireAgenda({ children }: { children: ReactNode }) {
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

  if (profileMissing || !profile || !canAccessAgenda(profile)) {
    return <Navigate to="/" replace />
  }

  return children
}
