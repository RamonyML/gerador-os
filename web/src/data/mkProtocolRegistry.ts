import { buildAlteraSenhaSegmentos } from './senhaRede/alteraSenha'
import { buildFeedbackSemSucessoTextos } from './feedback/semSucesso'
import { buildFeedbackManExternalTextos } from './feedback/manExternal'
import { buildFeedbackManOcasionadoTextos } from './feedback/manOcasionado'
import { buildFeedbackTrocaEquipTextos } from './feedback/trocaEquip'
import { buildFeedbackMudancaPontoTextos } from './feedback/mudancaPonto'
import { buildFeedbackAltplanTextos } from './feedback/altplan'
import { buildFeedbackStbRokuTextos } from './feedback/stbRoku'
import { buildFeedbackWifiExtendTextos } from './feedback/wifiExtend'

export type MkProtocolNewEntry = {
  mode: 'new'
  processoId: number
  classificacaoId: number
  buildSegmentos: (v: Record<string, unknown>) => { info: string; comentarios: string[] }
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

  // Feedback — insere comentário num atendimento existente (protocolo informado pelo operador)
  // TODO: confirmar se processId/classificacaoId são necessários para comentários de feedback
  'feedback-sem-sucesso':    { mode: 'comment', buildText: (v) => buildFeedbackSemSucessoTextos(v).feedbackSemSucessoTexto },
  'feedback-man-externa':    { mode: 'comment', buildText: (v) => buildFeedbackManExternalTextos(v).feedbackManExternalTexto },
  'feedback-man-ocasionado': { mode: 'comment', buildText: (v) => buildFeedbackManOcasionadoTextos(v).feedbackManOcasionadoTexto },
  'feedback-troca-equip':    { mode: 'comment', buildText: (v) => buildFeedbackTrocaEquipTextos(v).feedbackTrocaEquipTexto },
  'feedback-mudanca-ponto':  { mode: 'comment', buildText: (v) => buildFeedbackMudancaPontoTextos(v).feedbackMudancaPontoTexto },
  'feedback-altplan':        { mode: 'comment', buildText: (v) => buildFeedbackAltplanTextos(v).feedbackAltplanTexto },
  'feedback-stb-roku':       { mode: 'comment', buildText: (v) => buildFeedbackStbRokuTextos(v).feedbackStbRokuTexto },
  'feedback-wifi-extend':    { mode: 'comment', buildText: (v) => buildFeedbackWifiExtendTextos(v).feedbackWifiExtendTexto },
}
