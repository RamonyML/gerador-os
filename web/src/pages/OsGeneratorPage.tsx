import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { ContentCopy } from '@mui/icons-material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined'
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import { AgendarVisitaModal } from '../components/AgendarVisitaModal'
import { AppPageChrome } from '../components/AppPageChrome'
import { OsTemplateFieldsForm, isFieldDisabled } from '../components/OsTemplateFieldsForm'
import { useAuth } from '../contexts/AuthContext'
import { useOsTemplates } from '../hooks/useOsTemplates'
import { renderTemplate } from '../lib/renderTemplate'
import { splitOsPreviewSections } from '../lib/splitOsPreviewSections'
import type { OsTemplate } from '../types/osTemplate'
import {
  SUPPORT_DEMANDS,
  isKnownDemandCategory,
  templatesMatchingDemand,
} from '../data/supportDemands'
import { CADASTRO_DEMANDS } from '../data/cadastroDemands'
import { buildMudEndPadraoTextos } from '../data/mudEnd/padrao'
import { buildMudEndComFibraTextos } from '../data/mudEnd/comFibra'
import { buildMudEndEquipamentosTextos } from '../data/mudEnd/equipamentos'
import { buildMudEndAltplanPropostaTextos } from '../data/mudEnd/altplanProposta'
import { buildMudEndAltplanPagoTextos } from '../data/mudEnd/altplanPago'
import { buildMudEndInviabilidadeTextos } from '../data/mudEnd/inviabilidade'
import { buildAltplanRemotoTextos } from '../data/altplan/remoto'
import { buildAltplanPresencialTextos } from '../data/altplan/presencial'
import { buildAltplanSemTrocaVisitaIsentaTextos } from '../data/altplan/semTrocaVisitaIsenta'
import { buildAltplanSemTrocaVisitaPagaTextos } from '../data/altplan/semTrocaVisitaPaga'
import { buildAltplanTrocaVisitaIsentaTextos } from '../data/altplan/trocaVisitaIsenta'
import { buildAltplanTrocaVisitaPagaTextos } from '../data/altplan/trocaVisitaPaga'
import { buildLuzVermelhaTextos } from '../data/manutencao/luzVermelha'
import { buildLuzVermelhaPjTextos } from '../data/manutencao/luzVermelhaPj'
import { buildFibraExternaTextos } from '../data/manutencao/fibraExterna'
import { buildOcasConectorTextos } from '../data/manutencao/ocasConector'
import { buildOcasFibraTextos } from '../data/manutencao/ocasFibra'
import { buildLuzVermelhaIsentoTextos } from '../data/manutencao/luzVermelhaIsento'
import { buildSinalAltoTextos } from '../data/manutencao/sinalAlto'
import { buildRealocFibraTextos } from '../data/manutencao/realocFibra'
import { buildMudPontoIntTextos } from '../data/manutencao/mudPontoInterno'
import { buildVisitaTestesTextos } from '../data/manutencao/visitaTestes'
import { buildFonteQueimadaTextos } from '../data/manutencao/fonteQueimada'
import { buildRoteadorQueimadoTextos } from '../data/manutencao/roteadorQueimado'
import { buildOntQueimadaTextos } from '../data/manutencao/ontQueimada'
import { buildOnuQueimadaTextos } from '../data/manutencao/onuQueimada'
import { buildRoteadorResetTextos } from '../data/manutencao/roteadorReset'
import { buildRokuPadraoTextos } from '../data/midiaTv/rokuPadrao'
import { buildRokuPresencialTextos } from '../data/midiaTv/rokuPresencial'
import { buildAlteraSenhaTextos, buildAlteraSenhaSegmentos } from '../data/senhaRede/alteraSenha'
import { MkProtocolCards } from '../components/MkProtocolCards'
import { buildWifiExtendZteTextos } from '../data/wifiExtend/extendZte'
import { buildWifiExtendTplinkTextos } from '../data/wifiExtend/extendTplink'
import { buildPontoAdicionalTextos } from '../data/wifiExtend/pontoAdicional'
import { buildTermoRespPadraoTextos } from '../data/termoDocs/termoRespPadrao'
import { buildFeedbackSemSucessoTextos } from '../data/feedback/semSucesso'
import { buildFeedbackManExternalTextos } from '../data/feedback/manExternal'
import { buildFeedbackManOcasionadoTextos } from '../data/feedback/manOcasionado'
import { buildFeedbackTrocaEquipTextos } from '../data/feedback/trocaEquip'
import { buildFeedbackMudancaPontoTextos } from '../data/feedback/mudancaPonto'
import { buildFeedbackAltplanTextos } from '../data/feedback/altplan'
import { buildFeedbackStbRokuTextos } from '../data/feedback/stbRoku'
import { buildFeedbackWifiExtendTextos } from '../data/feedback/wifiExtend'
import { buildInstGratisResidencialTextos } from '../data/instalacao/gratisResidencial'
import { buildInstGratisEmpresarialTextos } from '../data/instalacao/gratisEmpresarial'
import { buildInstTaxaResidencialTextos } from '../data/instalacao/taxaResidencial'
import { buildInstTaxaEmpresarialTextos } from '../data/instalacao/taxaEmpresarial'
import { buildEncPadraoCasaTextos } from '../data/encerramentoInst/padraoCasa'
import { buildEncPadraoEmpresaTextos } from '../data/encerramentoInst/padraoEmpresa'
import { buildEncPadraoCasaExtendTextos } from '../data/encerramentoInst/padraoCasaExtend'
import { buildEncAltplanRemotoTextos } from '../data/encerramentoInst/altplanRemoto'
import { isKnownCadastroDemandCategory } from '../data/cadastroDemands'
import { INSTALACAO_DEMANDS, isKnownInstalacaoDemandCategory } from '../data/instalacaoDemands'
import { db } from '../lib/firebase'
import { saveOsHistory } from '../lib/osHistoryFirestore'

const LAST_OS_TEMPLATE_KEY = 'gerador-os:lastOsTemplateId'

// Mapeia demandas de cadastro cujos templates usam uma demandCategory diferente na URL
const DEMAND_CATEGORY_ALIAS: Record<string, string> = {
  'midia-tv-cadastro': 'midia-tv',
}

const AGENDA_CONTEXT_KEY: Record<string, string> = {
  'manut-luz-vermelha': 'luzVmTextoAgenda',
  'manut-luz-vermelha-pj': 'luzVmPjTextoAgenda',
  'manut-fibra-externa': 'fibraExtTextoAgenda',
  'manut-ocas-conector': 'ocasConectTextoAgenda',
  'manut-ocas-fibra': 'ocasFibraTextoAgenda',
  'manut-sinal-alto': 'sinalAltoTextoAgenda',
  'manut-roteador-queimado': 'roteadorQueimadoTextoAgenda',
  'manut-ont-queimada': 'ontQueimadaTextoAgenda',
  'manut-onu-queimada': 'onuQueimadaTextoAgenda',
  'manut-fonte-queimada': 'fonteQueimadaTextoAgenda',
  'manut-mud-ponto-int': 'mudPontoIntTextoAgenda',
  'manut-realoc-fibra': 'realocFibraTextoAgenda',
  'manut-visita-testes': 'visitaTestesTextoAgenda',
  'altplan-sem-troca-visita-isenta': 'altplanSemTrocaVisitaIsentaTextoAgenda',
  'altplan-sem-troca-visita-paga': 'altplanSemTrocaVisitaPagaTextoAgenda',
  'altplan-troca-visita-isenta': 'altplanTrocaVisitaIsentaTextoAgenda',
  'altplan-troca-visita-paga': 'altplanTrocaVisitaPagaTextoAgenda',
  'wifi-extend-zte': 'wifiExtendTextoAgenda',
  'wifi-extend-tplink': 'wifiExtendTextoAgenda',
  'wifi-extend-ponto': 'pontoTextoAgenda',
  'midia-roku-padrao': 'rokuPadraoTextoAgenda',
  'midia-roku-presencial': 'rokuPresencialTextoAgenda',
  'manut-roteador-reset': 'roteadorResetTextoAgenda',
}

/** Demandas com hub dedicado; as demais voltam para a página da demanda. */
const DEMAND_HUB_ROUTES: Record<string, string> = {
  'alteracao-plano': '/suporte/alteracao-plano',
  'mudanca-endereco': '/suporte/mudanca-endereco',
  manutencao: '/suporte/manutencao',
  'midia-tv': '/suporte/midia-tv',
  'senha-rede': '/suporte/senha-rede',
  'wifi-extend': '/suporte/wifi-extend',
  'termo-docs': '/suporte/termos-documentos',
  feedback: '/suporte/feedback',
  'instalacao-gratis': '/cadastro/instalacao-gratis',
  'instalacao-taxa': '/cadastro/instalacao-taxa',
  'encerramentos-instalacao': '/instalacao/encerramentos',
  'midia-tv-cadastro': '/cadastro/midia-tv',
}

/** Descrição do processo por demanda, exibida no cabeçalho do gerador. */
const DEMAND_GENERATOR_BLURB: Record<string, string> = {
  'mudanca-endereco':
    'Reinstalação dos equipamentos do cliente em um novo endereço. Confirme a viabilidade de fibra, registre o comprovante de endereço, faça o agendamento e gere os textos de Protocolo, O.S e Agenda.',
}

function buildInitialValues(template: OsTemplate | null): Record<string, string> {
  if (!template) return {}
  const o: Record<string, string> = {}
  for (const f of template.fields) {
    o[f.id] = f.defaultValue ?? ''
  }
  return o
}

export function OsGeneratorPage() {
  const theme = useTheme()
  const { user, profile, profileMissing } = useAuth()
  const state = useOsTemplates(profile)
  const [searchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState<string>('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [copyOk, setCopyOk] = useState(false)
  const [previewTab, setPreviewTab] = useState(0)
  const [attempted, setAttempted] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveObs, setSaveObs] = useState('')
  const [saving, setSaving] = useState(false)
  const [agendarOpen, setAgendarOpen] = useState(false)

  const templates = state.status === 'ready' ? state.templates : []
  const demandParam = searchParams.get('demanda')
  const tplParam = searchParams.get('tpl')
  const slugParam = searchParams.get('slug')

  const visibleTemplates = useMemo(() => {
    if (!demandParam) return templates
    if (isKnownDemandCategory(demandParam) || isKnownCadastroDemandCategory(demandParam) || isKnownInstalacaoDemandCategory(demandParam)) {
      const resolvedCategory = DEMAND_CATEGORY_ALIAS[demandParam] ?? demandParam
      return templatesMatchingDemand(templates, resolvedCategory)
    }
    return templates
  }, [templates, demandParam])

  const demandMeta = useMemo(() => {
    if (!demandParam) return undefined
    return (
      SUPPORT_DEMANDS.find((d) => d.id === demandParam) ??
      CADASTRO_DEMANDS.find((d) => d.id === demandParam) ??
      INSTALACAO_DEMANDS.find((d) => d.id === demandParam)
    )
  }, [demandParam])

  const selected = useMemo(
    () => visibleTemplates.find((t) => t.id === selectedId) ?? null,
    [visibleTemplates, selectedId],
  )

  useEffect(() => {
    if (state.status !== 'ready') return
    const vis = visibleTemplates
    if (vis.length === 0) {
      setSelectedId('')
      setValues({})
      return
    }

    const tplBySlug =
      !tplParam && slugParam
        ? vis.find((t) => t.slug === slugParam)
        : undefined

    let savedId: string | null = null
    try {
      savedId = localStorage.getItem(LAST_OS_TEMPLATE_KEY)
    } catch {
      savedId = null
    }

    const preferSaved =
      !tplParam &&
      !slugParam &&
      savedId &&
      vis.some((t) => t.id === savedId)
        ? savedId
        : null

    const preferId =
      tplParam && vis.find((t) => t.id === tplParam)
        ? tplParam
        : tplBySlug
          ? tplBySlug.id
          : preferSaved

    const next = preferId
      ? vis.find((t) => t.id === preferId)!
      : vis[0]
    setSelectedId(next.id)
    setValues(buildInitialValues(next))
    setPreviewTab(0)
    setAttempted(false)
  }, [state.status, visibleTemplates, tplParam, slugParam, demandParam])

  useEffect(() => {
    if (!selectedId) return
    try {
      localStorage.setItem(LAST_OS_TEMPLATE_KEY, selectedId)
    } catch {
      /* ignore */
    }
  }, [selectedId])

  const context = useMemo(() => {
    const base: Record<string, unknown> = { ...values }

    const nome = String(values.cliente ?? '').trim()
    const upperTokens = nome.toUpperCase().split(/\s+/).filter(Boolean)
    base.clientePrimeiro = upperTokens[0] ?? ''
    base.clienteUpper = nome.toUpperCase()
    base.bairroUpper = String(values.bairro ?? '').trim().toUpperCase()

    // Mudança de endereço (espelha os .toUpperCase()/replace do HTML legado).
    base.adressUpper = String(values.adress ?? '').trim().toUpperCase()
    base.numNumerico = String(values.num ?? '').replace(/\D/g, '')
    base.complementoUpper = String(values.complemento ?? '').trim().toUpperCase()
    base.quandoMudUpper = String(values.quandoMud ?? '').trim().toUpperCase()
    base.tipoCompUpper = String(values.tipoComp ?? '').trim().toUpperCase()
    base.nomeComprovUpper = String(values.nomeComprov ?? '').trim().toUpperCase()
    base.grauCompUpper = String(values.grauComp ?? '').trim().toUpperCase()
    base.extendAgenda = String(values.extend ?? '').replace(/<b>|<\/b>/g, '**')

    base.equipamentoOuOnu =
      String(values.equipamento ?? '').trim().toUpperCase() || 'ONU'

    const sol = String(values.solicitante ?? '')
      .trim()
      .toUpperCase()
      .split(/\s+/)
      .filter(Boolean)
    base.solicitantePrimeiro = sol[0] ?? ''
    base.solicitanteUpper = String(values.solicitante ?? '').trim().toUpperCase()

    base.parenteUpper = String(values.parente ?? '').trim().toUpperCase()
    base.autorizadoUpper = String(values.autorizado ?? '').trim().toUpperCase()

    const contatoRaw = String(values.contato ?? '')
    base.contatoNumerico = contatoRaw.replace(/\D/g, '')

    base.contatoSolNumerico = String(values.contatoSol ?? '').replace(
      /\D/g,
      '',
    )

    base.motivoUpper = String(values.motivo ?? '').trim().toUpperCase()

    base.ambienteAtualUpper = String(values.ambienteAtual ?? '')
      .trim()
      .toUpperCase()
    base.ambienteNovoUpper = String(values.ambienteNovo ?? '')
      .trim()
      .toUpperCase()

    const semSinal = values.semSinal === 'sim'
    const sinalRaw = String(values.sinalONU ?? '').trim().toUpperCase()
    base.sinalONUFinal = semSinal || !sinalRaw ? 'SEM SINAL' : sinalRaw
    base.sinalONUUpper = String(values.sinalONU ?? '').trim().toUpperCase()
    base.sinalONUAnUpper = String(values.sinalONUan ?? '').trim().toUpperCase()
    base.oscilaUpper = String(values.oscila ?? '').trim().toUpperCase()
    base.protocoloUpper = String(values.protocolo ?? '').trim().toUpperCase()
    base.valorUpper = String(values.valor ?? '').trim().toUpperCase()
    base.cargoUpper = String(values.cargo ?? '').trim().toUpperCase()

    const tipoAlarmeMon = String(values.tipoAlarme ?? '').trim()
    let alarmeMonitoramentoCompleto = tipoAlarmeMon
    if (tipoAlarmeMon === 'DE SINAL ALTO') {
      const sigMon = String(values.sinalMonitoramento ?? '').trim()
      if (sigMon) alarmeMonitoramentoCompleto = `DE SINAL ALTO ${sigMon}`
    }
    base.alarmeMonitoramentoCompleto = alarmeMonitoramentoCompleto

    const onuTok = String(values.onu ?? '')
      .trim()
      .toUpperCase()
      .split(/\s+/)
      .filter(Boolean)
    base.onuPrimeiro = onuTok[0] ?? ''

    const alarmeTok = String(values.alarme ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    base.alarmeAgendaPrefix = alarmeTok.slice(0, 2).join(' ')

    const ctRaw = String(values.ctoType ?? '').trim()
    const ctoTypeResolved = ctRaw || 'CTOE'
    const ctoU = String(values.cto ?? '').trim().toUpperCase()
    const passU = String(values.passante ?? '').trim().toUpperCase()
    if (ctoTypeResolved === 'CTOE') {
      base.textoOSCtoInstrutiva = ` <b> CTOE: ${ctoU} // ${passU}.</b>`
    } else if (ctoTypeResolved === 'CTOI') {
      base.textoOSCtoInstrutiva = ` <b> CTOI // ${passU}.</b>`
    } else {
      base.textoOSCtoInstrutiva = ''
    }

    if (ctRaw === 'CTOE') {
      base.textoOSCtoSinalAlto = `\nCTOE: ${ctoU} // ${passU}.\n`
    } else if (ctRaw === 'CTOI') {
      base.textoOSCtoSinalAlto = `\nCTOI // ${passU}.\n`
    } else {
      base.textoOSCtoSinalAlto = ''
    }
    base.agendaSinalAltoSuffix = ctRaw === 'CTOI' ? ' *CTOI*' : ''

    base.operadorOuSemSinal =
      String(values.operador ?? '').trim() || 'SEM SINAL'

    const spL = String(values.dataLigacao ?? '').trim().split(/\s+/)
    base.dataLigacaoData = spL[0] ?? ''
    base.dataLigacaoHora = spL[1] ?? ''

    const spP = String(values.dataProtocolo ?? '').trim().split(/\s+/)
    base.dataProtocoloData = spP[0] ?? ''
    base.dataProtocoloHora = spP[1] ?? ''

    base.encerramento = {
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    base.operador = {
      nome: profile?.displayName ?? '',
      email: user?.email ?? profile?.email ?? '',
    }
    base.operadorPrimeiroNome =
      (profile?.displayName ?? '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)[0]
        ?.toUpperCase() ?? ''

    if (selected?.slug === 'mud-end-padrao') {
      Object.assign(
        base,
        buildMudEndPadraoTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'mud-end-com-fibra') {
      Object.assign(
        base,
        buildMudEndComFibraTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'mud-end-buscar-equipamentos') {
      Object.assign(
        base,
        buildMudEndEquipamentosTextos(
          values,
          String(base.operadorPrimeiroNome ?? ''),
        ),
      )
    } else if (selected?.slug === 'mud-end-altplan-proposta') {
      Object.assign(
        base,
        buildMudEndAltplanPropostaTextos(
          values,
          String(base.operadorPrimeiroNome ?? ''),
        ),
      )
    } else if (selected?.slug === 'mud-end-altplan-pago') {
      Object.assign(
        base,
        buildMudEndAltplanPagoTextos(
          values,
          String(base.operadorPrimeiroNome ?? ''),
        ),
      )
    } else if (selected?.slug === 'mud-end-inviabilidade') {
      Object.assign(base, buildMudEndInviabilidadeTextos(values))
    } else if (selected?.slug === 'altplan-remoto') {
      Object.assign(base, buildAltplanRemotoTextos(values))
    } else if (selected?.slug === 'altplan-presencial') {
      Object.assign(base, buildAltplanPresencialTextos(values))
    } else if (selected?.slug === 'altplan-sem-troca-visita-isenta') {
      Object.assign(
        base,
        buildAltplanSemTrocaVisitaIsentaTextos(
          values,
          String(base.operadorPrimeiroNome ?? ''),
        ),
      )
    } else if (selected?.slug === 'altplan-sem-troca-visita-paga') {
      Object.assign(
        base,
        buildAltplanSemTrocaVisitaPagaTextos(
          values,
          String(base.operadorPrimeiroNome ?? ''),
        ),
      )
    } else if (selected?.slug === 'altplan-troca-visita-isenta') {
      Object.assign(
        base,
        buildAltplanTrocaVisitaIsentaTextos(
          values,
          String(base.operadorPrimeiroNome ?? ''),
        ),
      )
    } else if (selected?.slug === 'altplan-troca-visita-paga') {
      Object.assign(
        base,
        buildAltplanTrocaVisitaPagaTextos(
          values,
          String(base.operadorPrimeiroNome ?? ''),
        ),
      )
    } else if (selected?.slug === 'manut-luz-vermelha') {
      Object.assign(
        base,
        buildLuzVermelhaTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'manut-luz-vermelha-pj') {
      Object.assign(
        base,
        buildLuzVermelhaPjTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'manut-fibra-externa') {
      Object.assign(
        base,
        buildFibraExternaTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'manut-ocas-conector') {
      Object.assign(
        base,
        buildOcasConectorTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'manut-ocas-fibra') {
      Object.assign(
        base,
        buildOcasFibraTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'manut-luz-vermelha-isento') {
      Object.assign(
        base,
        buildLuzVermelhaIsentoTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'manut-sinal-alto') {
      Object.assign(
        base,
        buildSinalAltoTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'manut-realoc-fibra') {
      Object.assign(
        base,
        buildRealocFibraTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'manut-mud-ponto-int') {
      Object.assign(
        base,
        buildMudPontoIntTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'manut-visita-testes') {
      Object.assign(
        base,
        buildVisitaTestesTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'manut-fonte-queimada') {
      Object.assign(
        base,
        buildFonteQueimadaTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'manut-roteador-queimado') {
      Object.assign(
        base,
        buildRoteadorQueimadoTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'manut-ont-queimada') {
      Object.assign(
        base,
        buildOntQueimadaTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'manut-onu-queimada') {
      Object.assign(
        base,
        buildOnuQueimadaTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'manut-roteador-reset') {
      Object.assign(
        base,
        buildRoteadorResetTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'midia-roku-padrao') {
      Object.assign(
        base,
        buildRokuPadraoTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'midia-roku-presencial') {
      Object.assign(
        base,
        buildRokuPresencialTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'senha-altera-senha') {
      Object.assign(base, buildAlteraSenhaTextos(values))
    } else if (selected?.slug === 'wifi-extend-zte') {
      Object.assign(
        base,
        buildWifiExtendZteTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'wifi-extend-tplink') {
      Object.assign(
        base,
        buildWifiExtendTplinkTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'wifi-extend-ponto') {
      Object.assign(
        base,
        buildPontoAdicionalTextos(values, String(base.operadorPrimeiroNome ?? '')),
      )
    } else if (selected?.slug === 'termo-resp-padrao') {
      Object.assign(base, buildTermoRespPadraoTextos(values))
    } else if (selected?.slug === 'feedback-sem-sucesso') {
      Object.assign(base, buildFeedbackSemSucessoTextos(values))
    } else if (selected?.slug === 'feedback-man-externa') {
      Object.assign(base, buildFeedbackManExternalTextos(values))
    } else if (selected?.slug === 'feedback-man-ocasionado') {
      Object.assign(base, buildFeedbackManOcasionadoTextos(values))
    } else if (selected?.slug === 'feedback-troca-equip') {
      Object.assign(base, buildFeedbackTrocaEquipTextos(values))
    } else if (selected?.slug === 'feedback-mudanca-ponto') {
      Object.assign(base, buildFeedbackMudancaPontoTextos(values))
    } else if (selected?.slug === 'feedback-altplan') {
      Object.assign(base, buildFeedbackAltplanTextos(values))
    } else if (selected?.slug === 'feedback-stb-roku') {
      Object.assign(base, buildFeedbackStbRokuTextos(values))
    } else if (selected?.slug === 'feedback-wifi-extend') {
      Object.assign(base, buildFeedbackWifiExtendTextos(values))
    } else if (selected?.slug === 'inst-gratis-residencial') {
      Object.assign(base, buildInstGratisResidencialTextos(values))
    } else if (selected?.slug === 'inst-gratis-empresarial') {
      Object.assign(base, buildInstGratisEmpresarialTextos(values))
    } else if (selected?.slug === 'inst-taxa-residencial') {
      Object.assign(base, buildInstTaxaResidencialTextos(values))
    } else if (selected?.slug === 'inst-taxa-empresarial') {
      Object.assign(base, buildInstTaxaEmpresarialTextos(values))
    } else if (selected?.slug === 'ence-altplan-remoto') {
      Object.assign(base, buildEncAltplanRemotoTextos(values))
    } else if (selected?.slug === 'ence-padrao-casa') {
      Object.assign(base, buildEncPadraoCasaTextos(values))
    } else if (selected?.slug === 'ence-padrao-empresa') {
      Object.assign(base, buildEncPadraoEmpresaTextos(values))
    } else if (selected?.slug === 'ence-padrao-casa-extend') {
      Object.assign(base, buildEncPadraoCasaExtendTextos(values))
    }

    if (selected?.slug?.startsWith('inst-')) {
      base.instTextoAgenda = `INST ${String(values.cliente ?? '').trim().toUpperCase()} (${String(base.operadorPrimeiroNome ?? '')})`
    }

    return base
  }, [values, profile, user, selected?.slug])

  const alteraSenhaSegmentos = useMemo(() => {
    if (selected?.slug !== 'senha-altera-senha') return null
    return buildAlteraSenhaSegmentos(values)
  }, [selected?.slug, values])

  const modalTextoAgenda = useMemo(() => {
    if (!selected) return ''
    const key = AGENDA_CONTEXT_KEY[selected.slug]
    if (key) return String(context[key] ?? '')
    if (selected.slug.startsWith('inst-')) return String(context.instTextoAgenda ?? '')
    return ''
  }, [selected, context])

  const preview = useMemo(() => {
    if (!selected) return ''
    return renderTemplate(selected.outputTemplate, context)
  }, [selected, context])

  const previewSections = useMemo(
    () => splitOsPreviewSections(preview),
    [preview],
  )

  const activePreviewBody =
    previewSections[previewTab]?.body ?? previewSections[0]?.body ?? ''

  const handleCopyEncerramento = useCallback(async () => {
    const roteador = (values.roteador ?? '').trim()
    const agora = new Date()
    const dataFormatada = agora.toLocaleDateString('pt-BR')
    const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const texto = [
      'ALTERAÇÃO DE PLANO EXECUTADA REMOTAMENTE COM SUCESSO.',
      'ASSINATURA DIGITAL + SELFIE EM ANEXO.',
      `NÃO HOUVE INTERVENÇÃO TÉCNICA DEVIDO O ROTEADOR EM COMODATO SER COMPATÍVEL AO PLANO ACORDADO (${roteador}).`,
      '',
      'CLIENTE SEM DÚVIDAS.',
      '',
      `DATA/HORA DO ENCERRAMENTO: ${dataFormatada} ÀS ${horaFormatada}HRS`,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(texto)
      setCopyOk(true)
    } catch {
      /* ignore */
    }
  }, [values.roteador])

  const handleCopyAll = useCallback(async () => {
    setAttempted(true)
    try {
      await navigator.clipboard.writeText(preview)
      setCopyOk(true)
    } catch {
      /* ignore */
    }
  }, [preview])

  const handleCopySection = useCallback(async () => {
    setAttempted(true)
    try {
      await navigator.clipboard.writeText(activePreviewBody)
      setCopyOk(true)
    } catch {
      /* ignore */
    }
  }, [activePreviewBody])

  const handleSaveConfirm = useCallback(async () => {
    if (!user || !selected) return
    setSaving(true)
    try {
      await saveOsHistory(db, {
        uid: user.uid,
        slug: selected.slug,
        title: selected.title,
        demandCategory: selected.demandCategory,
        preview,
        clientName: (values.cliente ?? values.nome ?? '').trim(),
        obs: saveObs.trim(),
      })
      setSaveDialogOpen(false)
      setSaveObs('')
    } finally {
      setSaving(false)
    }
  }, [user, selected, preview, values.cliente, values.nome, saveObs])

  const multiPreviewTabs = previewSections.length > 1

  const emptyFields = useMemo(() => {
    if (!selected) return []
    return selected.fields.filter((f) => {
      if (f.control === 'select' || f.control === 'radio') return false
      if (isFieldDisabled(f, values)) return false
      if (f.showWhen) {
        const depVal = values[f.showWhen.field] ?? ''
        const expected = f.showWhen.equals
        const isVisible = Array.isArray(expected)
          ? expected.includes(depVal)
          : expected === depVal
        if (!isVisible) return false
      }
      return !(values[f.id] ?? '').trim()
    })
  }, [selected, values])

  const errorFieldIds = useMemo(
    () => (attempted ? new Set(emptyFields.map((f) => f.id)) : new Set<string>()),
    [attempted, emptyFields],
  )

  const isCadastroDemand =
    demandParam != null && isKnownCadastroDemandCategory(demandParam)
  const backTo = demandParam
    ? (DEMAND_HUB_ROUTES[demandParam] ??
      (demandMeta
        ? isCadastroDemand
          ? '/cadastro'
          : `/suporte/demanda/${demandParam}`
        : isCadastroDemand
          ? '/cadastro'
          : '/suporte'))
    : isCadastroDemand
      ? '/cadastro'
      : '/suporte'
  const backLabel = demandMeta?.title ?? (isCadastroDemand ? 'Hub Cadastro' : 'Hub Suporte')
  const backButton = (
    <Button
      component={RouterLink}
      to={backTo}
      variant="outlined"
      color="inherit"
      startIcon={<ArrowBackRoundedIcon />}
      sx={{ borderColor: 'divider' }}
    >
      {backLabel}
    </Button>
  )

  if (profileMissing || !profile) {
    return (
      <AppPageChrome
        overline="Operação"
        title="Gerar O.S."
        maxWidth="xl"
        headerRight={backButton}
      >
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Complete seu perfil em <strong>users/&lt;uid&gt;</strong> para usar o gerador.
        </Alert>
      </AppPageChrome>
    )
  }

  const headerTitle = demandMeta ? demandMeta.title : 'Gerar O.S.'
  const headerOverline = (() => {
    const label = selected?.title ?? ''
    const variant = label.includes('—') ? label.split('—').pop()?.trim() : ''
    if (variant) return variant.charAt(0).toUpperCase() + variant.slice(1)
    return 'Operação'
  })()
  const headerSubtitle =
    demandMeta && DEMAND_GENERATOR_BLURB[demandMeta.id]
      ? DEMAND_GENERATOR_BLURB[demandMeta.id]
      : demandMeta
        ? demandMeta.description
        : 'Preencha o formulário à esquerda; o texto atualiza à direita. Use as abas para copiar só um trecho (protocolo, O.S., agenda).'

  const accent: 'green' | 'red' = selected?.slug?.startsWith('mud-end-inviab')
    ? 'red'
    : 'green'
  const accentColor =
    accent === 'red' ? theme.palette.error.main : theme.palette.success.main

  return (
    <AppPageChrome
      overline={headerOverline}
      title={headerTitle}
      maxWidth="xl"
      accentColor={accent === 'red' ? '#c70000' : undefined}
      headerRight={backButton}
      subtitle={
        <Typography variant="body1" color="text.secondary" component="div">
          {headerSubtitle}
        </Typography>
      }
    >

      {state.status === 'loading' ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            py: 6,
            px: 2,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <CircularProgress size={28} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Carregando modelos…
          </Typography>
        </Box>
      ) : null}

      {state.status === 'error' ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {state.message}
        </Alert>
      ) : null}

      {state.status === 'ready' &&
      templates.length > 0 &&
      visibleTemplates.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Nenhum modelo nesta categoria.{' '}
          <Link component={RouterLink} to="/gerar-os">
            Ver todos os fluxos
          </Link>{' '}
          ou peça classificação em <strong>Modelos</strong>.
        </Alert>
      ) : null}

      {state.status === 'ready' && templates.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Nenhum fluxo disponível para o seu setor. Se isso parecer incorreto,
          fale com um administrador ou com a equipe técnica.
        </Alert>
      ) : null}

      {state.status === 'ready' && visibleTemplates.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2.5, md: 3 },
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1.05fr)' },
            alignItems: 'start',
          }}
        >
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 2.5,
              borderColor: 'divider',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.02)'
                  : 'background.paper',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Preencha atentamente o formulário abaixo
            </Typography>

            {selected?.operatorGuidance ? (
              <Accordion
                disableGutters
                elevation={0}
                defaultExpanded
                sx={{
                  mb: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: alpha(
                    accentColor,
                    theme.palette.mode === 'dark' ? 0.12 : 0.06,
                  ),
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreRoundedIcon />}
                  sx={{ '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1 } }}
                >
                  <LightbulbOutlinedIcon sx={{ fontSize: 20, color: accentColor }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {selected.operatorGuidance.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <List dense disablePadding sx={{ listStyleType: 'disc', pl: 3 }}>
                    {selected.operatorGuidance.items.map((item, i) => (
                      <ListItem
                        key={i}
                        disableGutters
                        sx={{ display: 'list-item', py: 0.25 }}
                      >
                        <ListItemText
                          primary={item}
                          slotProps={{
                            primary: {
                              variant: 'body2',
                              sx: { whiteSpace: 'pre-line' },
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ) : null}

            {selected ? (
              <OsTemplateFieldsForm
                fields={selected.fields}
                values={values}
                accent={accent}
                onChange={(id, v) => {
                  setValues((prev) => ({ ...prev, [id]: v }))
                }}
                onPatchValues={(patch) =>
                  setValues((prev) => ({ ...prev, ...patch }))
                }
                errorFieldIds={errorFieldIds}
                appendToLastSection={
                  (selected.slug in AGENDA_CONTEXT_KEY || selected.slug.startsWith('inst-')) &&
                  !isCadastroDemand &&
                  !(selected.slug === 'manut-roteador-reset' && values.tipoSolicitacao === 'loja') ? (
                    <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<HomeOutlinedIcon />}
                        onClick={() => setAgendarOpen(true)}
                        sx={{
                          py: 1,
                          fontWeight: 600,
                          bgcolor: 'primary.main',
                          '&:hover': { bgcolor: 'primary.dark' },
                        }}
                      >
                        Agendar Visita
                      </Button>
                    </Grid>
                  ) : undefined
                }
              />
            ) : null}
          </Paper>

          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 2.5,
              borderColor: 'divider',
              position: { md: 'sticky' },
              top: { md: 72 },
              maxHeight: { md: 'calc(100vh - 96px)' },
              display: 'flex',
              flexDirection: 'column',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.03)'
                  : 'grey.50',
            }}
          >
            <Stack
              direction="row"
              sx={{
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 1,
                mb: 1.5,
                flexWrap: 'wrap',
              }}
            >
              {selected ? (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selected.title}
                </Typography>
              ) : null}
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {selected?.slug === 'altplan-remoto' ? (
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    startIcon={<AssignmentTurnedInOutlinedIcon />}
                    onClick={() => void handleCopyEncerramento()}
                    disabled={!values.roteador}
                  >
                    Encerrar O.S
                  </Button>
                ) : null}
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<BookmarkBorderRoundedIcon />}
                  onClick={() => setSaveDialogOpen(true)}
                  disabled={!preview.trim()}
                >
                  Salvar O.S
                </Button>
                {multiPreviewTabs ? (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopy />}
                    onClick={() => void handleCopySection()}
                    disabled={!activePreviewBody.trim()}
                  >
                    Trecho da aba
                  </Button>
                ) : null}
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<ContentCopy />}
                  onClick={() => void handleCopyAll()}
                  disabled={!preview.trim()}
                >
                  Texto completo
                </Button>
              </Stack>
            </Stack>

            {selected ? (
              emptyFields.length > 0 ? (
                <Alert
                  severity="error"
                  icon={false}
                  sx={{ mb: 1.5, py: 0.5, px: 1.5, borderRadius: 1.5, fontSize: 13 }}
                >
                  <strong>Há campos a serem preenchidos</strong>
                </Alert>
              ) : (
                <Alert
                  severity="success"
                  icon={false}
                  sx={{ mb: 1.5, py: 0.5, px: 1.5, borderRadius: 1.5, fontSize: 13 }}
                >
                  <strong>Todos os campos preenchidos</strong>
                </Alert>
              )
            ) : null}

            {multiPreviewTabs ? (
              <Tabs
                value={Math.min(previewTab, previewSections.length - 1)}
                onChange={(_, v) => setPreviewTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 40,
                  borderBottom: 1,
                  borderColor: 'divider',
                  mb: 1.5,
                  '& .MuiTab-root': {
                    minHeight: 40,
                    py: 0,
                    textTransform: 'none',
                    fontSize: 13,
                  },
                }}
              >
                {previewSections.map((sec, i) => (
                  <Tab key={sec.id} label={sec.label} value={i} />
                ))}
              </Tabs>
            ) : null}

            {selected?.slug === 'senha-altera-senha' && alteraSenhaSegmentos ? (
              <MkProtocolCards
                slug={selected.slug}
                cpf={String(values.cpf ?? '')}
                processoId={14}
                classificacaoId={3}
                segmentos={alteraSenhaSegmentos}
                disabled={emptyFields.length > 0}
              />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  minHeight: { xs: 220, md: 280 },
                  pr: 0.5,
                }}
              >
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: theme.typography.fontFamily,
                    fontSize: { xs: 13, sm: 14 },
                    lineHeight: 1.55,
                    color: 'text.primary',
                    textAlign: 'left',
                  }}
                >
                  {(multiPreviewTabs ? activePreviewBody : preview) ||
                    'Preencha os campos ao lado para gerar o texto.'}
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      ) : null}

      <AgendarVisitaModal
        open={agendarOpen}
        onClose={() => setAgendarOpen(false)}
        textoAgenda={modalTextoAgenda}
        initialDate={values.dataVisita}
        onScheduled={(dataVisita, horaVisita) => {
          setValues((prev) => ({ ...prev, dataVisita, horaVisita }))
        }}
      />

      <Snackbar
        open={copyOk}
        autoHideDuration={2200}
        onClose={() => setCopyOk(false)}
        message="Copiado para a área de transferência"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Dialog
        open={saveDialogOpen}
        onClose={() => { setSaveDialogOpen(false); setSaveObs('') }}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Salvar O.S no histórico</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Adicione uma observação para identificar esta O.S no histórico (opcional).
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Observação / tag"
            placeholder="Ex: cliente reclamou de queda, visita às 14h…"
            value={saveObs}
            onChange={(e) => setSaveObs(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleSaveConfirm() }}
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => { setSaveDialogOpen(false); setSaveObs('') }}>Cancelar</Button>
          <Button
            variant="contained"
            disableElevation
            onClick={() => void handleSaveConfirm()}
            disabled={saving}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppPageChrome>
  )
}
