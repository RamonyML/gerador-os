import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { AppLoader } from './AppLoader'
import { useAuth } from '../contexts/AuthContext'
import { canManageUsers } from '../lib/permissions'

export function RequireUserManager({
  children,
}: {
  children: ReactNode
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
        <AppLoader size={14} />
      </Box>
    )
  }

  if (profileMissing || !profile || !canManageUsers(profile)) {
    return <Navigate to="/" replace />
  }

  return children
}
