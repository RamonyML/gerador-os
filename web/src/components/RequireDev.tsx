import { Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { AppLoader } from './AppLoader'
import { useAuth } from '../contexts/AuthContext'

export function RequireDev({ children }: { children: React.ReactNode }) {
  const { profile, initializing } = useAuth()

  if (initializing) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AppLoader size={16} />
      </Box>
    )
  }

  if (!profile?.isDev) return <Navigate to="/" replace />
  return children
}
