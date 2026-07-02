import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { AppLoader } from './AppLoader'
import { useAuth } from '../contexts/AuthContext'
import { canAccessValidacao } from '../lib/permissions'

export function RequireValidacao({ children }: { children: ReactNode }) {
  const { profile, profileMissing, initializing } = useAuth()

  if (initializing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <AppLoader size={14} />
      </Box>
    )
  }

  if (profileMissing || !profile || !canAccessValidacao(profile)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
