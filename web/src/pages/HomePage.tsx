import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  Alert,
} from '@mui/material'
import { app } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

export function HomePage() {
  const { user, profile, profileMissing, logOut } = useAuth()

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar variant="dense">
          <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
            Gerador de O.S
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <Button color="inherit" size="small" onClick={() => void logOut()}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3, flex: 1 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Projeto Firebase: <code>{app.options.projectId}</code>
        </Typography>

        {profileMissing ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Não existe documento <code>users/{user?.uid}</code> no Firestore ou
            faltam os campos <code>sector</code> e <code>hierarchy</code>.
            Crie o documento no console (coleção <code>users</code>, ID = seu
            UID) com pelo menos: sector, hierarchy, displayName, active.
          </Alert>
        ) : profile ? (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Seu perfil
            </Typography>
            <Typography variant="body2" component="div">
              Setor: <strong>{profile.sector}</strong>
              <br />
              Função: <strong>{profile.hierarchy}</strong>
              {profile.isDev ? (
                <>
                  <br />
                  <strong>Dev</strong> — acesso ampliado (stub)
                </>
              ) : null}
              {profile.isAdmin ? (
                <>
                  <br />
                  <strong>Admin</strong> — gestão de usuários (stub)
                </>
              ) : null}
            </Typography>
          </>
        ) : null}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Próximo: gerador de O.S com templates no Firestore.
        </Typography>
      </Container>
    </Box>
  )
}
