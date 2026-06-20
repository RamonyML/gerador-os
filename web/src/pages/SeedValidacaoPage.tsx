import { useState } from 'react'
import { Alert, Box, Button, LinearProgress, Typography } from '@mui/material'
import { Timestamp } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { criarMudancaEndereco } from '../lib/validacaoFirestore'
import seedData from '../data/seedValidacao.json'
import type { TipoMudanca, FormaPagamento, ValorMudanca } from '../types/validacao'

export function SeedValidacaoPage() {
  const { user, profile } = useAuth()
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(0)
  const [errors, setErrors] = useState(0)
  const [finished, setFinished] = useState(false)

  async function handleSeed() {
    if (!user || !profile) return
    setRunning(true)
    setDone(0)
    setErrors(0)
    setFinished(false)

    for (const item of seedData) {
      try {
        const [yyyy, mm, dd] = (item.dataMudanca as string).split('-').map(Number)
        const dataTs = Timestamp.fromDate(new Date(yyyy!, mm! - 1, dd!))
        const payload: Parameters<typeof criarMudancaEndereco>[0] = {
          nomeCliente: item.nomeCliente,
          telefoneCliente: item.telefoneCliente,
          tipoMudanca: item.tipoMudanca as TipoMudanca,
          dataMudanca: dataTs,
          horaMudanca: item.horaMudanca,
          novoEndereco: item.novoEndereco,
          equipamento: item.equipamento,
          titularAcompanha: item.titularAcompanha,
          formaPagamento: item.formaPagamento as FormaPagamento,
          valorMudanca: item.valorMudanca as ValorMudanca,
          mensalidadeVincenda: item.mensalidadeVincenda,
          atendente: item.atendente,
          criadoPorUid: user.uid,
          criadoPorNome: profile.displayName ?? user.email ?? 'seed',
        }
        if (item.acompanhante) payload.acompanhante = item.acompanhante
        if (item.textoComprovante) payload.textoComprovante = item.textoComprovante
        if (item.alteracaoPlano) payload.alteracaoPlano = item.alteracaoPlano
        await criarMudancaEndereco(payload)
        setDone((n) => n + 1)
      } catch (e) {
        console.error('Erro no registro', item.nomeCliente, e)
        setErrors((n) => n + 1)
      }
    }
    setRunning(false)
    setFinished(true)
  }

  const total = seedData.length
  const progress = total > 0 ? Math.round(((done + errors) / total) * 100) : 0

  return (
    <Box sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Seed — Validação
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Insere {total} registros da planilha Excel no Firestore. Use apenas uma vez para popular o ambiente.
      </Typography>

      {running && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
          <Typography variant="caption">{done + errors}/{total} — {errors} erros</Typography>
        </Box>
      )}

      {finished && (
        <Alert severity={errors === 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
          Concluído: {done} inseridos, {errors} erros.
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={handleSeed}
        disabled={running || finished}
        size="large"
      >
        {running ? `Inserindo… ${done}/${total}` : finished ? 'Concluído' : 'Inserir no Firestore'}
      </Button>
    </Box>
  )
}
