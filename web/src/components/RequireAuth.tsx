import { Navigate, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import { AppLoader } from './AppLoader'
import { useAuth } from '../contexts/AuthContext'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppLoader size={16} />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
