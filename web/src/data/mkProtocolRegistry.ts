import { buildAlteraSenhaSegmentos } from './senhaRede/alteraSenha'
import { buildFeedbackSemSucessoSegmentos } from './feedback/semSucesso'
import { buildFeedbackManExternalSegmentos } from './feedback/manExternal'
import { buildFeedbackManOcasionadoSegmentos } from './feedback/manOcasionado'
import { buildFeedbackTrocaEquipSegmentos } from './feedback/trocaEquip'
import { buildFeedbackMudancaPontoSegmentos } from './feedback/mudancaPonto'
import { buildFeedbackAltplanSegmentos } from './feedback/altplan'
import { buildFeedbackStbRokuSegmentos } from './feedback/stbRoku'
import { buildFeedbackWifiExtendSegmentos } from './feedback/wifiExtend'

export type MkProtocolEntry = {
  processoId: number
  classificacaoId: number
  buildSegmentos: (v: Record<string, unknown>) => { info: string; comentarios: string[] }
}

export const MK_PROTOCOL_REGISTRY: Record<string, MkProtocolEntry> = {
  'senha-altera-senha': {
    processoId: 14,
    classificacaoId: 3,
    buildSegmentos: buildAlteraSenhaSegmentos,
  },

  // Feedback — TODO: substituir processoId/classificacaoId pelos códigos reais do MK admin
  'feedback-sem-sucesso':    { processoId: 14, classificacaoId: 3, buildSegmentos: buildFeedbackSemSucessoSegmentos },
  'feedback-man-externa':    { processoId: 14, classificacaoId: 3, buildSegmentos: buildFeedbackManExternalSegmentos },
  'feedback-man-ocasionado': { processoId: 14, classificacaoId: 3, buildSegmentos: buildFeedbackManOcasionadoSegmentos },
  'feedback-troca-equip':    { processoId: 14, classificacaoId: 3, buildSegmentos: buildFeedbackTrocaEquipSegmentos },
  'feedback-mudanca-ponto':  { processoId: 14, classificacaoId: 3, buildSegmentos: buildFeedbackMudancaPontoSegmentos },
  'feedback-altplan':        { processoId: 14, classificacaoId: 3, buildSegmentos: buildFeedbackAltplanSegmentos },
  'feedback-stb-roku':       { processoId: 14, classificacaoId: 3, buildSegmentos: buildFeedbackStbRokuSegmentos },
  'feedback-wifi-extend':    { processoId: 14, classificacaoId: 3, buildSegmentos: buildFeedbackWifiExtendSegmentos },
}
