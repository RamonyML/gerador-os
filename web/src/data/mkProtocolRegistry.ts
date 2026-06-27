import { buildAlteraSenhaSegmentos } from './senhaRede/alteraSenha'
import { buildFeedbackSemSucessoTextos } from './feedback/semSucesso'
import { buildFeedbackManExternalTextos } from './feedback/manExternal'
import { buildFeedbackManOcasionadoTextos } from './feedback/manOcasionado'
import { buildFeedbackTrocaEquipTextos } from './feedback/trocaEquip'
import { buildFeedbackMudancaPontoTextos } from './feedback/mudancaPonto'
import { buildFeedbackAltplanTextos } from './feedback/altplan'
import { buildFeedbackStbRokuTextos } from './feedback/stbRoku'
import { buildFeedbackWifiExtendTextos } from './feedback/wifiExtend'
import { buildLuzVermelhaSegmentos } from './manutencao/luzVermelha'
import { buildLuzVermelhaPjSegmentos } from './manutencao/luzVermelhaPj'
import { buildLuzVermelhaIsentoSegmentos } from './manutencao/luzVermelhaIsento'
import { buildFibraExternaSegmentos } from './manutencao/fibraExterna'
import { buildOcasConectorSegmentos } from './manutencao/ocasConector'
import { buildOcasFibraSegmentos } from './manutencao/ocasFibra'
import { buildSinalAltoSegmentos } from './manutencao/sinalAlto'
import { buildRealocFibraSegmentos } from './manutencao/realocFibra'
import { buildMudPontoIntSegmentos } from './manutencao/mudPontoInterno'
import { buildFonteQueimadaSegmentos } from './manutencao/fonteQueimada'
import { buildRoteadorQueimadoSegmentos } from './manutencao/roteadorQueimado'
import { buildOntQueimadaSegmentos } from './manutencao/ontQueimada'
import { buildOnuQueimadaSegmentos } from './manutencao/onuQueimada'
import { buildRoteadorResetSegmentos } from './manutencao/roteadorReset'

export type MkProtocolNewEntry = {
  mode: 'new'
  processoId: number
  classificacaoId: number
  buildSegmentos: (v: Record<string, unknown>) => { info: string; comentarios: string[] }
  tipoOS?: number
  grupoServico?: number
}

export type MkProtocolCommentEntry = {
  mode: 'comment'
  buildText: (v: Record<string, unknown>) => string
}

export type MkProtocolEntry = MkProtocolNewEntry | MkProtocolCommentEntry

export const MK_PROTOCOL_REGISTRY: Record<string, MkProtocolEntry> = {
  'senha-altera-senha': {
    mode: 'new',
    processoId: 14,
    classificacaoId: 3,
    buildSegmentos: buildAlteraSenhaSegmentos,
  },

  // Manutenção — classificacaoId 3 (NORMAL) na abertura; classificação de resolução fica com o técnico ao fechar no MK
  // processo 12 (TECNICO-SEM-CONEXAO)
  'manut-luz-vermelha':        { mode: 'new', processoId: 12, classificacaoId: 3, buildSegmentos: buildLuzVermelhaSegmentos },
  'manut-luz-vermelha-pj':     { mode: 'new', processoId: 12, classificacaoId: 3, buildSegmentos: buildLuzVermelhaPjSegmentos },
  'manut-luz-vermelha-isento': { mode: 'new', processoId: 12, classificacaoId: 3, buildSegmentos: buildLuzVermelhaIsentoSegmentos },
  'manut-fibra-externa':       { mode: 'new', processoId: 12, classificacaoId: 3, buildSegmentos: buildFibraExternaSegmentos },
  'manut-ocas-conector':       { mode: 'new', processoId: 12, classificacaoId: 3, buildSegmentos: buildOcasConectorSegmentos },
  'manut-ocas-fibra':          { mode: 'new', processoId: 12, classificacaoId: 3, buildSegmentos: buildOcasFibraSegmentos },
  'manut-sinal-alto':          { mode: 'new', processoId: 12, classificacaoId: 3, buildSegmentos: buildSinalAltoSegmentos },
  // processo 18 (TECNICO-OUTRAS-SOLICITACOES)
  'manut-realoc-fibra':        { mode: 'new', processoId: 18, classificacaoId: 3, buildSegmentos: buildRealocFibraSegmentos },
  'manut-mud-ponto-int':       { mode: 'new', processoId: 18, classificacaoId: 3, buildSegmentos: buildMudPontoIntSegmentos },
  // processo 17 (TECNICO-FALHA-EM-SERVIÇO-ESPECIFICO)
  'manut-fonte-queimada':      { mode: 'new', processoId: 17, classificacaoId: 3, buildSegmentos: buildFonteQueimadaSegmentos },
  'manut-roteador-queimado':   { mode: 'new', processoId: 17, classificacaoId: 3, buildSegmentos: buildRoteadorQueimadoSegmentos },
  'manut-ont-queimada':        { mode: 'new', processoId: 17, classificacaoId: 3, buildSegmentos: buildOntQueimadaSegmentos, tipoOS: 3, grupoServico: 6 },
  'manut-onu-queimada':        { mode: 'new', processoId: 17, classificacaoId: 3, buildSegmentos: buildOnuQueimadaSegmentos },
  // processo 14 (TECNICO-ALTERAR-WIFI)
  'manut-roteador-reset':      { mode: 'new', processoId: 14, classificacaoId: 3, buildSegmentos: buildRoteadorResetSegmentos },

  // Feedback — insere comentário num atendimento existente (protocolo informado pelo operador)
  'feedback-sem-sucesso':    { mode: 'comment', buildText: (v) => buildFeedbackSemSucessoTextos(v).feedbackSemSucessoTexto },
  'feedback-man-externa':    { mode: 'comment', buildText: (v) => buildFeedbackManExternalTextos(v).feedbackManExternalTexto },
  'feedback-man-ocasionado': { mode: 'comment', buildText: (v) => buildFeedbackManOcasionadoTextos(v).feedbackManOcasionadoTexto },
  'feedback-troca-equip':    { mode: 'comment', buildText: (v) => buildFeedbackTrocaEquipTextos(v).feedbackTrocaEquipTexto },
  'feedback-mudanca-ponto':  { mode: 'comment', buildText: (v) => buildFeedbackMudancaPontoTextos(v).feedbackMudancaPontoTexto },
  'feedback-altplan':        { mode: 'comment', buildText: (v) => buildFeedbackAltplanTextos(v).feedbackAltplanTexto },
  'feedback-stb-roku':       { mode: 'comment', buildText: (v) => buildFeedbackStbRokuTextos(v).feedbackStbRokuTexto },
  'feedback-wifi-extend':    { mode: 'comment', buildText: (v) => buildFeedbackWifiExtendTextos(v).feedbackWifiExtendTexto },
}
