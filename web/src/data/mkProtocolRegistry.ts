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
import { buildVisitaTestesSegmentos } from './manutencao/visitaTestes'
import { buildAltplanRemotoSegmentos } from './altplan/remoto'
import { buildAltplanPresencialSegmentos } from './altplan/presencial'
import { buildAltplanSemTrocaVisitaIsentaSegmentos } from './altplan/semTrocaVisitaIsenta'
import { buildAltplanSemTrocaVisitaPagaSegmentos } from './altplan/semTrocaVisitaPaga'
import { buildAltplanTrocaVisitaIsentaSegmentos } from './altplan/trocaVisitaIsenta'
import { buildAltplanTrocaVisitaPagaSegmentos } from './altplan/trocaVisitaPaga'
import { buildWifiExtendZteSegmentos } from './wifiExtend/extendZte'
import { buildWifiExtendTplinkSegmentos } from './wifiExtend/extendTplink'
import { buildPontoAdicionalSegmentos } from './wifiExtend/pontoAdicional'
import { buildRokuPadraoSegmentos } from './midiaTv/rokuPadrao'
import { buildRokuPresencialSegmentos } from './midiaTv/rokuPresencial'
import { buildTermoRespPadraoSegmentos } from './termoDocs/termoRespPadrao'

export type MkProtocolNewEntry = {
  mode: 'new'
  processoId: number
  classificacaoId: number
  buildSegmentos: (v: Record<string, unknown>) => {
    info: string
    comentarios: string[]
    osDescricao?: string    // texto para DescricaoProblema (Relato do problema no MK)
    osIndicacoes?: string   // texto para Indicacoes (campo Indicações no MK)
    avisoCard?: string       // card laranja exibido ao operador após os comentários — NÃO enviado ao MK
    avisoObservacao?: string // texto copyável para inserir em Pessoas/Empresas e Observações do MK
    clienteTexto?: string    // texto para aba extra "Termo para o cliente" (termo-resp)
  }
  tipoOS?: number
  grupoServico?: number
  tecnicoId?: number  // CodigoTecnico no MK (sistema separado de Colaborador — usar 1 como padrão para grupo 10)
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
  // tipoOS 3 = MANUTENCAO, grupoServico 10 = EQUIPE MZ NET (codigos_mk/CODIGOS_MK_REFERENCIA.md)
  // processo 12 (TECNICO-SEM-CONEXAO)
  'manut-luz-vermelha':        { mode: 'new', processoId: 12, classificacaoId: 3, buildSegmentos: buildLuzVermelhaSegmentos, tipoOS: 3, grupoServico: 10, tecnicoId: 1 },
  'manut-luz-vermelha-pj':     { mode: 'new', processoId: 12, classificacaoId: 3, buildSegmentos: buildLuzVermelhaPjSegmentos, tipoOS: 3, grupoServico: 10, tecnicoId: 1 },
  // tipoOS 22 = RETORNO EM GARANTIA (07 DIAS) — exceção: visita isenta dentro da garantia de 7 dias
  'manut-luz-vermelha-isento': { mode: 'new', processoId: 12, classificacaoId: 3, buildSegmentos: buildLuzVermelhaIsentoSegmentos, tipoOS: 22, grupoServico: 10, tecnicoId: 1 },
  'manut-fibra-externa':       { mode: 'new', processoId: 12, classificacaoId: 3, buildSegmentos: buildFibraExternaSegmentos, tipoOS: 3, grupoServico: 10, tecnicoId: 1 },
  'manut-ocas-conector':       { mode: 'new', processoId: 12, classificacaoId: 3, buildSegmentos: buildOcasConectorSegmentos, tipoOS: 3, grupoServico: 10, tecnicoId: 1 },
  'manut-ocas-fibra':          { mode: 'new', processoId: 12, classificacaoId: 3, buildSegmentos: buildOcasFibraSegmentos, tipoOS: 3, grupoServico: 10, tecnicoId: 1 },
  'manut-sinal-alto':          { mode: 'new', processoId: 12, classificacaoId: 3, buildSegmentos: buildSinalAltoSegmentos, tipoOS: 3, grupoServico: 10, tecnicoId: 1 },
  // processo 18 (TECNICO-OUTRAS-SOLICITACOES)
  'manut-realoc-fibra':        { mode: 'new', processoId: 18, classificacaoId: 3, buildSegmentos: buildRealocFibraSegmentos, tipoOS: 3, grupoServico: 10, tecnicoId: 1 },
  'manut-mud-ponto-int':       { mode: 'new', processoId: 18, classificacaoId: 3, buildSegmentos: buildMudPontoIntSegmentos, tipoOS: 3, grupoServico: 10, tecnicoId: 1 },
  // processo 17 (TECNICO-FALHA-EM-SERVIÇO-ESPECIFICO)
  'manut-fonte-queimada':      { mode: 'new', processoId: 17, classificacaoId: 3, buildSegmentos: buildFonteQueimadaSegmentos, tipoOS: 3, grupoServico: 10, tecnicoId: 1 },
  'manut-roteador-queimado':   { mode: 'new', processoId: 17, classificacaoId: 3, buildSegmentos: buildRoteadorQueimadoSegmentos, tipoOS: 3, grupoServico: 10, tecnicoId: 1 },
  'manut-ont-queimada':        { mode: 'new', processoId: 17, classificacaoId: 3, buildSegmentos: buildOntQueimadaSegmentos, tipoOS: 3, grupoServico: 10, tecnicoId: 1 },
  'manut-onu-queimada':        { mode: 'new', processoId: 17, classificacaoId: 3, buildSegmentos: buildOnuQueimadaSegmentos, tipoOS: 3, grupoServico: 10, tecnicoId: 1 },
  // processo 14 (TECNICO-ALTERAR-WIFI)
  'manut-roteador-reset':      { mode: 'new', processoId: 14, classificacaoId: 3, buildSegmentos: buildRoteadorResetSegmentos, tipoOS: 3, grupoServico: 10, tecnicoId: 1 },
  // processo 18 (TECNICO-OUTRAS-SOLICITACOES)
  'manut-visita-testes':       { mode: 'new', processoId: 18, classificacaoId: 3, buildSegmentos: buildVisitaTestesSegmentos, tipoOS: 3, grupoServico: 10, tecnicoId: 1 },

  // Alteração de plano — processo 5 (PROC-ALTERA-PLANO), classificação 3 (NORMAL), tipoOS 7 (ALTERAÇÃO DE PLANO)
  'altplan-remoto':                    { mode: 'new', processoId: 5, classificacaoId: 3, buildSegmentos: buildAltplanRemotoSegmentos, tipoOS: 7, grupoServico: 10, tecnicoId: 1 },
  'altplan-presencial':                { mode: 'new', processoId: 5, classificacaoId: 3, buildSegmentos: buildAltplanPresencialSegmentos, tipoOS: 7, grupoServico: 10, tecnicoId: 1 },
  'altplan-sem-troca-visita-isenta':   { mode: 'new', processoId: 5, classificacaoId: 3, buildSegmentos: buildAltplanSemTrocaVisitaIsentaSegmentos, tipoOS: 7, grupoServico: 10, tecnicoId: 1 },
  'altplan-sem-troca-visita-paga':     { mode: 'new', processoId: 5, classificacaoId: 3, buildSegmentos: buildAltplanSemTrocaVisitaPagaSegmentos, tipoOS: 7, grupoServico: 10, tecnicoId: 1 },
  'altplan-troca-visita-isenta':       { mode: 'new', processoId: 5, classificacaoId: 3, buildSegmentos: buildAltplanTrocaVisitaIsentaSegmentos, tipoOS: 7, grupoServico: 10, tecnicoId: 1 },
  'altplan-troca-visita-paga':         { mode: 'new', processoId: 5, classificacaoId: 3, buildSegmentos: buildAltplanTrocaVisitaPagaSegmentos, tipoOS: 7, grupoServico: 10, tecnicoId: 1 },

  // Termo de responsabilidade — processo 38 (TECNICO-DOCUMENTOS), classificação 3 (sem O.S. — tipoOS 12 removido, ver mk-refatoracao-integracao-geradores.md §9.2)
  'termo-resp-padrao': { mode: 'new', processoId: 38, classificacaoId: 3, buildSegmentos: buildTermoRespPadraoSegmentos },

  // Mídia TV — processo 18 (TECNICO-OUTRAS-SOLICITAÇOES), classificação 3, tipoOS 21 (ROKU TV)
  'midia-roku-padrao':     { mode: 'new', processoId: 18, classificacaoId: 3, tipoOS: 21, grupoServico: 10, tecnicoId: 1, buildSegmentos: buildRokuPadraoSegmentos },
  'midia-roku-presencial': { mode: 'new', processoId: 18, classificacaoId: 3, tipoOS: 21, grupoServico: 10, tecnicoId: 1, buildSegmentos: buildRokuPresencialSegmentos },

  // Wi-Fi Extend — alteração de plano, processo 5 (PROC-ALTERA-PLANO), classificação 3 (NORMAL), tipoOS 18 (ALTERAÇÃO DE PLANO + WI-FI EXTEND)
  'wifi-extend-zte':    { mode: 'new', processoId: 5, classificacaoId: 3, buildSegmentos: buildWifiExtendZteSegmentos, tipoOS: 18, grupoServico: 10, tecnicoId: 1 },
  'wifi-extend-tplink': { mode: 'new', processoId: 5, classificacaoId: 3, buildSegmentos: buildWifiExtendTplinkSegmentos, tipoOS: 18, grupoServico: 10, tecnicoId: 1 },
  // Ponto adicional — compra de equipamento, tipoOS 13 (OS DE PONTO ADICIONAL)
  'wifi-extend-ponto':  { mode: 'new', processoId: 5, classificacaoId: 3, buildSegmentos: buildPontoAdicionalSegmentos, tipoOS: 13, grupoServico: 10, tecnicoId: 1 },

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
