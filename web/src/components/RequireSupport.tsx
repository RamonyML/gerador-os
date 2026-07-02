import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { AppLoader } from './AppLoader'
import { useAuth } from '../contexts/AuthContext'
import { canAccessSupportHub } from '../lib/supportAccess'

export function RequireSupport({ children }: { children: ReactNode }) {
  const { profile, profileMissing } = useAuth()

  if (profileMissing || !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <AppLoader size={14} />
      </Box>
    )
  }

  if (!canAccessSupportHub(profile)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
