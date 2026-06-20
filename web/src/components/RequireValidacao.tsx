import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { canAccessValidacao } from '../lib/permissions'

export function RequireValidacao({ children }: { children: ReactNode }) {
  const { profile, profileMissing, initializing } = useAuth()

  if (initializing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (profileMissing || !profile || !canAccessValidacao(profile)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
