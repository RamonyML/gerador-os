import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { PatternFormat } from 'react-number-format'
import { subMonths } from 'date-fns'
import { db } from '../../lib/firebase'
import { logger } from '../../lib/logger'
import { useAuth } from '../../contexts/AuthContext'
import { useUpgradeLogger } from '../../hooks/useUpgradeLogger'
import {
  MeioContato,
  TipoAssinatura,
  TipoUpgrade,
  type Upgrade,
} from '../../types/upgrades'
import { normalizeClienteNome } from '../../lib/upgradesFormat'

type Props = {
  upgradeId?: string
  onSuccess?: () => void
  onCancel?: () => void
  readOnly?: boolean
  /** Quando já sabemos os dados (ex.: pré-preencher). */
  initialData?: Partial<Upgrade>
  defaultTab?: 'upgrade' | 'roku'
}

export function UpgradeForm({
  upgradeId,
  onSuccess,
  onCancel,
  readOnly = false,
  initialData,
  defaultTab = 'upgrade',
}: Props) {
  const { user, profile } = useAuth()
  const { logAction } = useUpgradeLogger()

  const displayName =
    profile?.displayName?.trim() || user?.email?.split('@')[0] || ''

  const initialFormState: Partial<Upgrade> = {
    data: initialData?.data ?? Timestamp.fromDate(new Date()),
    cliente: initialData?.cliente ?? '',
    meioContato: initialData?.meioContato,
    numeroContato: initialData?.numeroContato ?? '',
    assinatura: initialData?.assinatura,
    tipoUpgrade:
      initialData?.tipoUpgrade ??
      (initialData?.isRoku ? TipoUpgrade.ATIVO : undefined),
    observacao: initialData?.observacao ?? '',
    operadorId: initialData?.operadorId ?? user?.email ?? '',
    operadorNome: initialData?.operadorNome ?? displayName,
    duplicado: initialData?.duplicado ?? false,
    isRoku: initialData?.isRoku ?? false,
    criadoEm: initialData?.criadoEm ?? Timestamp.fromDate(new Date()),
    ultimaAtualizacao: initialData?.ultimaAtualizacao ?? Timestamp.fromDate(new Date()),
  }

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Upgrade>>(initialFormState)
  const [activeTab, setActiveTab] = useState<'upgrade' | 'roku'>(
    initialData?.isRoku ? 'roku' : defaultTab,
  )

  const effectiveId = upgradeId

  const loadUpgrade = useCallback(async () => {
    if (!effectiveId) return
    try {
      setLoading(true)
      const docRef = doc(db, 'upgrades', effectiveId)
      const snap = await getDoc(docRef)
      if (!snap.exists()) return
      const data = snap.data() as Record<string, unknown>
      const isRoku = data?.isRoku === true
      const dataTs = data?.data as Timestamp | undefined
      setFormData({
        ...(data as unknown as Partial<Upgrade>),
        id: effectiveId,
        data: dataTs ?? Timestamp.fromDate(new Date()),
        cliente: typeof data.cliente === 'string' ? data.cliente : '',
        meioContato: data.meioContato as Upgrade['meioContato'],
        numeroContato: typeof data.numeroContato === 'string' ? data.numeroContato : '',
        assinatura: data.assinatura as Upgrade['assinatura'],
        tipoUpgrade: data.tipoUpgrade as Upgrade['tipoUpgrade'],
        observacao: typeof data.observacao === 'string' ? data.observacao : '',
        operadorId: typeof data.operadorId === 'string' ? data.operadorId : '',
        operadorNome: typeof data.operadorNome === 'string' ? data.operadorNome : '',
        duplicado: data.duplicado === true,
        isRoku,
        criadoEm: (data.criadoEm as Timestamp) ?? Timestamp.fromDate(new Date()),
        ultimaAtualizacao:
          (data.ultimaAtualizacao as Timestamp) ?? Timestamp.fromDate(new Date()),
      })
      if (isRoku) setActiveTab('roku')
    } catch (e) {
      logger.error(e)
    } finally {
      setLoading(false)
    }
  }, [effectiveId])

  useEffect(() => {
    void loadUpgrade()
  }, [loadUpgrade])

  const checkDuplicate = async (
    clienteName: string,
    isRoku: boolean,
  ): Promise<boolean> => {
    try {
      const tenMonthsAgo = subMonths(new Date(), 10)
      const q = query(
        collection(db, 'upgrades'),
        where('cliente', '==', normalizeClienteNome(clienteName)),
      )
      const snap = await getDocs(q)
      return snap.docs.some((d) => {
        if (effectiveId && d.id === effectiveId) return false
        const row = d.data() as Record<string, unknown>
        const rowData = row.data as Timestamp | undefined
        if (!rowData?.toDate) return false
        if (rowData.toDate() < tenMonthsAgo) return false
        const docIsRoku = row.isRoku === true
        return docIsRoku === isRoku
      })
    } catch (e) {
      logger.error(e)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.data) return
    if (!formData.cliente?.trim()) return
    if (!formData.meioContato) return
    if (
      formData.meioContato !== MeioContato.PRESENCIAL &&
      !formData.numeroContato?.trim()
    )
      return
    const isRokuTab = activeTab === 'roku'
    if (!isRokuTab && !formData.assinatura) return
    if (!formData.tipoUpgrade && !isRokuTab) return

    try {
      setLoading(true)
      const isRoku = isRokuTab
      const dup = await checkDuplicate(formData.cliente!, isRoku)
      if (dup) {
        const ok = window.confirm(
          `Um ${isRoku ? 'registro de Roku' : 'upgrade'} já foi registrado para o cliente ${formData.cliente} dentro dos últimos 10 meses. Deseja mesmo seguir com o registro?`,
        )
        if (!ok) {
          setLoading(false)
          return
        }
      }

      const now = new Date()
      const upgradePayload: Record<string, unknown> = {
        cliente: normalizeClienteNome(formData.cliente!),
        meioContato: formData.meioContato,
        numeroContato: formData.numeroContato?.trim() ?? '',
        observacao: formData.observacao?.trim() ?? '',
        duplicado: dup,
        isRoku,
        tipoUpgrade: isRoku ? TipoUpgrade.ATIVO : formData.tipoUpgrade,
        data: formData.data,
        ultimaAtualizacao: Timestamp.fromDate(now),
        updatedBy: user?.email ?? '',
      }

      if (!isRoku && formData.assinatura) {
        upgradePayload.assinatura = formData.assinatura
      }

      if (effectiveId) {
        const docRef = doc(db, 'upgrades', effectiveId)
        const cur = (await getDoc(docRef)).data()
        await updateDoc(docRef, {
          ...upgradePayload,
          operadorId: (cur as Record<string, unknown>)?.operadorId ?? '',
          operadorNome: (cur as Record<string, unknown>)?.operadorNome ?? '',
        })
        await logAction({
          action: 'update',
          targetCollection: 'upgrades',
          targetId: effectiveId,
          details: upgradePayload as Record<string, unknown>,
        })
      } else {
        const ref = await addDoc(collection(db, 'upgrades'), {
          ...upgradePayload,
          criadoEm: Timestamp.fromDate(now),
          createdBy: user?.email ?? '',
          operadorId: user?.email ?? '',
          operadorNome: displayName,
        })
        await logAction({
          action: 'create',
          targetCollection: 'upgrades',
          targetId: ref.id,
          details: upgradePayload as Record<string, unknown>,
        })
      }

      onSuccess?.()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao salvar upgrade.'
      logger.error(err)
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target
    if (name === 'meioContato') {
      setFormData((prev) => ({
        ...prev,
        meioContato: value as MeioContato,
        numeroContato:
          value === MeioContato.PRESENCIAL ? '' : prev.numeroContato ?? '',
      }))
      return
    }
    if (name === 'assinatura') {
      setFormData((prev) => ({
        ...prev,
        assinatura: value as TipoAssinatura,
      }))
      return
    }
    if (name === 'tipoUpgrade') {
      setFormData((prev) => ({
        ...prev,
        tipoUpgrade: value as TipoUpgrade,
      }))
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    const next =
      name === 'numeroContato' ? value : value.toUpperCase()
    setFormData((prev) => ({ ...prev, [name]: next }))
  }

  const handleTabChange = (_: React.SyntheticEvent, v: 'upgrade' | 'roku') => {
    setActiveTab(v)
    if (v === 'roku') {
      setFormData((prev) => ({
        ...prev,
        tipoUpgrade: TipoUpgrade.ATIVO,
        isRoku: true,
      }))
    } else {
      setFormData((prev) => ({ ...prev, isRoku: false }))
    }
  }

  const dataDayjs = formData.data ? dayjs(formData.data.toDate()) : null

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {effectiveId ? 'Editar registro' : 'Novo registro'}
      </Typography>

      {!effectiveId && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => {
              if (v === 'upgrade' || v === 'roku') handleTabChange(_, v)
            }}
            aria-label="Tipo de registro"
          >
            <Tab label="Upgrade" value="upgrade" />
            <Tab label="Roku TV" value="roku" />
          </Tabs>
        </Box>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          <DatePicker
            label="Data"
            value={dataDayjs}
            onChange={(d) => {
              if (d?.isValid()) {
                setFormData((prev) => ({
                  ...prev,
                  data: Timestamp.fromDate(d.toDate()),
                }))
              }
            }}
            maxDate={dayjs()}
            disabled={readOnly}
            slotProps={{
              textField: { fullWidth: true, required: true },
            }}
          />

          <TextField
            label="Cliente"
            name="cliente"
            value={formData.cliente ?? ''}
            onChange={handleInputChange}
            required
            fullWidth
            disabled={readOnly}
          />

          <FormControl fullWidth required disabled={readOnly}>
            <InputLabel id="mc-label">Meio de contato</InputLabel>
            <Select
              labelId="mc-label"
              name="meioContato"
              value={formData.meioContato ?? ''}
              onChange={handleSelectChange}
              label="Meio de contato"
            >
              <MenuItem value={MeioContato.PRESENCIAL}>Presencial</MenuItem>
              <MenuItem value={MeioContato.LIGACAO}>Ligação</MenuItem>
              <MenuItem value={MeioContato.WHATSAPP}>WhatsApp</MenuItem>
            </Select>
          </FormControl>

          <PatternFormat
            format="(##) # ####-####"
            mask="_"
            allowEmptyFormatting={false}
            value={formData.numeroContato ?? ''}
            onValueChange={(vals) => {
              setFormData((prev) => ({
                ...prev,
                numeroContato: vals.formattedValue,
              }))
            }}
            customInput={TextField}
            label="Número de contato"
            name="numeroContato"
            fullWidth
            disabled={readOnly || formData.meioContato === MeioContato.PRESENCIAL}
            required={formData.meioContato !== MeioContato.PRESENCIAL}
            helperText={
              formData.meioContato === MeioContato.PRESENCIAL
                ? 'Não necessário para contato presencial'
                : undefined
            }
          />

          {!formData.isRoku ? (
            <FormControl fullWidth required disabled={readOnly}>
              <InputLabel id="as-label">Assinatura</InputLabel>
              <Select
                labelId="as-label"
                name="assinatura"
                value={formData.assinatura ?? ''}
                onChange={handleSelectChange}
                label="Assinatura"
              >
                <MenuItem value={TipoAssinatura.DIGITAL}>Digital</MenuItem>
                <MenuItem value={TipoAssinatura.FISICA}>Físico</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <Box />
          )}

          {!formData.isRoku ? (
            <FormControl fullWidth required disabled={readOnly}>
              <InputLabel id="tu-label">Tipo</InputLabel>
              <Select
                labelId="tu-label"
                name="tipoUpgrade"
                value={formData.tipoUpgrade ?? ''}
                onChange={handleSelectChange}
                label="Tipo"
              >
                <MenuItem value={TipoUpgrade.ATIVO}>Ativo</MenuItem>
                <MenuItem value={TipoUpgrade.RECEPTIVO}>Receptivo</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth disabled>
              <InputLabel>Tipo</InputLabel>
              <Select value={TipoUpgrade.ATIVO} label="Tipo">
                <MenuItem value={TipoUpgrade.ATIVO}>Ativo</MenuItem>
              </Select>
            </FormControl>
          )}

          <TextField
            label="Observação"
            name="observacao"
            value={formData.observacao ?? ''}
            onChange={handleInputChange}
            multiline
            rows={4}
            fullWidth
            disabled={readOnly}
            sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
          />
        </Box>

        {!readOnly && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            {onCancel ? (
              <Button type="button" variant="outlined" onClick={onCancel} disabled={loading}>
                Cancelar
              </Button>
            ) : null}
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Salvando…' : effectiveId ? 'Atualizar' : 'Registrar'}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
