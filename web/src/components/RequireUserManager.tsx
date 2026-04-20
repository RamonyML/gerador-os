import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
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
        <CircularProgress />
      </Box>
    )
  }

  if (profileMissing || !profile || !canManageUsers(profile)) {
    return <Navigate to="/" replace />
  }

  return children
}
