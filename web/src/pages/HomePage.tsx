import { Container, Typography, Alert } from '@mui/material'
import { app } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

export function HomePage() {
  const { user, profile, profileMissing } = useAuth()

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Início
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Projeto Firebase: <code>{app.options.projectId}</code>
      </Typography>

      {profileMissing ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Não existe documento <code>users/{user?.uid}</code> no Firestore ou
          faltam os campos <code>sector</code> e <code>hierarchy</code>. Crie o
          documento no console (coleção <code>users</code>, ID = seu UID) com
          pelo menos: sector, hierarchy, displayName, active.
        </Alert>
      ) : null}

      {!profileMissing && profile ? (
        <>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Seu perfil
          </Typography>
          <Typography variant="body2" component="div">
            Setor: <strong>{profile.sector}</strong>
            <br />
            Função: <strong>{profile.hierarchy}</strong>
            {profile.displayName ? (
              <>
                <br />
                Nome: <strong>{profile.displayName}</strong>
              </>
            ) : null}
            {profile.isDev ? (
              <>
                <br />
                <strong>Dev</strong> — vê todos os templates de O.S
              </>
            ) : null}
            {profile.isAdmin ? (
              <>
                <br />
                <strong>Admin</strong> — gestão de usuários (em breve)
              </>
            ) : null}
          </Typography>
        </>
      ) : null}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        Use <strong>Gerar O.S</strong> no menu para montar textos a partir dos
        templates no Firestore.
      </Typography>
    </Container>
  )
}
