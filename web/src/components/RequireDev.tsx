import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export function RequireDev({ children }: { children: React.ReactNode }) {
  const { profile, initializing } = useAuth()

  if (initializing) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!profile?.isDev) return <Navigate to="/" replace />
  return children
}
