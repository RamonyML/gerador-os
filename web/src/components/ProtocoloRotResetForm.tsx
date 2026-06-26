import { useMemo, useState } from 'react'
import {
  Box,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { MkProtocolCards } from './MkProtocolCards'
import {
  buildRotResetSegmentos,
  ROT_RESET_REQUIRED_FIELDS,
  type RotResetFormValues,
} from '../data/tutorialRotReset'

const EMPTY: RotResetFormValues = {
  solicitante: '',
  cpf: '',
  titular: '',
  canal: '',
  contato: '',
  sinalONU: '',
  ssid: '',
  senhaWifi: '',
}

export function ProtocoloRotResetForm() {
  const [values, setValues] = useState<RotResetFormValues>(EMPTY)

  function set(field: keyof RotResetFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const emptyFields = ROT_RESET_REQUIRED_FIELDS.filter((f) => !values[f].trim())
  const allFilled = emptyFields.length === 0

  const segmentos = useMemo(
    () => (allFilled ? buildRotResetSegmentos(values) : { info: '', comentarios: [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allFilled, values.solicitante, values.cpf, values.titular, values.canal,
     values.contato, values.sinalONU, values.ssid, values.senhaWifi],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 3 } }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          Identificação
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Solicitante"
            placeholder="Nome de quem ligou"
            size="small"
            fullWidth
            value={values.solicitante}
            onChange={(e) => set('solicitante', e.target.value)}
            helperText="Pode diferir do titular do contrato"
          />
          <TextField
            label="CPF do titular"
            placeholder="Somente números"
            size="small"
            fullWidth
            value={values.cpf}
            onChange={(e) => set('cpf', e.target.value.replace(/\D/g, ''))}
            slotProps={{ htmlInput: { maxLength: 11 } }}
          />
          <TextField
            label="Nome do titular"
            placeholder="Nome completo"
            size="small"
            fullWidth
            value={values.titular}
            onChange={(e) => set('titular', e.target.value)}
            sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, gridColumn: { xs: '1', sm: '1 / -1' } }}>
            <TextField
              select
              label="Canal"
              size="small"
              fullWidth
              value={values.canal}
              onChange={(e) => set('canal', e.target.value)}
            >
              <MenuItem value="LIGAÇÃO">Telefone</MenuItem>
              <MenuItem value="WHATSAPP">WhatsApp</MenuItem>
            </TextField>
            <TextField
              label="Contato"
              placeholder="XX XXXXX-XXXX"
              size="small"
              fullWidth
              value={values.contato}
              onChange={(e) => set('contato', e.target.value)}
            />
          </Box>
        </Box>

        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, mt: 3, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          Diagnóstico e resolução
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Sinal ONU/ONT"
            placeholder="-23.50 DBM"
            size="small"
            fullWidth
            value={values.sinalONU}
            onChange={(e) => set('sinalONU', e.target.value)}
          />
          <TextField
            label="SSID (nome da rede)"
            placeholder="Ex: MinhaRede"
            size="small"
            fullWidth
            value={values.ssid}
            onChange={(e) => set('ssid', e.target.value)}
          />
          <TextField
            label="Senha Wi-Fi"
            placeholder="Ex: senha123"
            size="small"
            fullWidth
            value={values.senhaWifi}
            onChange={(e) => set('senhaWifi', e.target.value)}
          />
        </Box>
      </Paper>

      <MkProtocolCards
        slug="manut-roteador-reset"
        cpf={values.cpf}
        processoId={14}
        classificacaoId={3}
        segmentos={segmentos}
        disabled={!allFilled}
      />
    </Box>
  )
}
