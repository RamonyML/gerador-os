import { Button, Container, Typography, Alert, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { app } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { canManageOsTemplates } from '../lib/permissions'
import { canAccessSupportHub } from '../lib/supportAccess'

export function HomePage() {
  const { user, profile, profileMissing } = useAuth()
  const navigate = useNavigate()
  const showSupportHub = profile != null && canAccessSupportHub(profile)

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Início
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Projeto Firebase: <code>{app.options.projectId}</code>
      </Typography>

      {showSupportHub ? (
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/suporte')}>
            Abrir hub Suporte
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Demandas por tipo (mudança de endereço, plano, manutenção…), como no dashboard antigo.
          </Typography>
        </Box>
      ) : null}

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
        {profile && canManageOsTemplates(profile) ? (
          <>
            {' '}
            Quem é <strong>gerente</strong>, <strong>supervisor</strong>,{' '}
            <strong>admin</strong> ou <strong>dev</strong> pode criar e editar
            modelos em <strong>Modelos</strong>.
          </>
        ) : null}
      </Typography>
    </Container>
  )
}
