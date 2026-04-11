import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { canAccessSupportHub } from '../lib/supportAccess'

export function RequireSupport({ children }: { children: ReactNode }) {
  const { profile, profileMissing } = useAuth()

  if (profileMissing || !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!canAccessSupportHub(profile)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
