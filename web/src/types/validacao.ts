import type { Timestamp } from 'firebase/firestore'

export type TipoMudanca = 'MUD END' | 'MUD END + ALT PLAN'
export type FormaPagamento = 'PIX' | 'CARTÃO' | 'DINHEIRO' | 'ISENTO'
export type ValorMudanca = 'R$100,00' | 'R$70,00' | 'ISENTO'
export type StatusValidacao = 'PENDENTE' | 'VALIDADO' | 'RETORNAR'

export type StatusAgendamento =
  | 'EXECUTADA'
  | 'EM EXECUÇÃO'
  | 'VALIDAR HOJE'
  | 'VALIDAR DEPOIS'

export interface AcompanhanteInfo {
  nome: string
  grauParentesco: string
  telefone: string
}

export interface AlteracaoPlanoInfo {
  planoEscolhido: string
  trocaRoteador: boolean
  equipamento?: string
}

export interface ChecklistValidacao {
  conferirOS: boolean
  conferirProtocolo: boolean
  conferirEnderecoSistema: boolean
  conferirOutraInstalacao: boolean
  conferirFinanceiro: boolean
  conferirFidelidade: boolean
  conferirPlanoRoteador: boolean
  conferirAutorizacao90dias: boolean
  conferirTipoCliente: boolean
  conferirTipoOS: boolean
}

export interface MudancaEndereco {
  id: string
  nomeCliente: string
  telefoneCliente: string
  tipoMudanca: TipoMudanca
  dataMudanca: Timestamp
  horaMudanca: string
  novoEndereco: string
  equipamento: string
  titularAcompanha: boolean
  acompanhante?: AcompanhanteInfo
  formaPagamento: FormaPagamento
  valorMudanca: ValorMudanca
  mensalidadeVincenda: boolean
  alteracaoPlano?: AlteracaoPlanoInfo
  atendente: string
  textoComprovante?: string
  status: StatusValidacao
  checklist?: Partial<ChecklistValidacao>
  validadoPor?: string
  validadoPorUid?: string
  validadoEm?: Timestamp
  observacoes?: string
  criadoPorUid: string
  criadoPorNome: string
  criadoEm: Timestamp
  atualizadoEm: Timestamp
}

export type MudancaEnderecoInput = Omit<
  MudancaEndereco,
  'id' | 'status' | 'checklist' | 'validadoPor' | 'validadoPorUid' | 'validadoEm' | 'criadoEm' | 'atualizadoEm'
>

export function getStatusAgendamento(dataMudanca: Date): StatusAgendamento {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)
  const data = new Date(dataMudanca)
  data.setHours(0, 0, 0, 0)

  if (data < hoje) return 'EXECUTADA'
  if (data.getTime() === hoje.getTime()) return 'EM EXECUÇÃO'
  if (data.getTime() === amanha.getTime()) return 'VALIDAR HOJE'
  return 'VALIDAR DEPOIS'
}

export const STATUS_AGENDAMENTO_COLOR: Record<StatusAgendamento, string> = {
  'VALIDAR HOJE': 'warning',
  'EM EXECUÇÃO': 'info',
  'VALIDAR DEPOIS': 'default',
  EXECUTADA: 'success',
}

export const STATUS_VALIDACAO_COLOR: Record<StatusValidacao, 'warning' | 'success' | 'error'> = {
  PENDENTE: 'warning',
  VALIDADO: 'success',
  RETORNAR: 'error',
}

export const CHECKLIST_LABELS: Record<keyof ChecklistValidacao, string> = {
  conferirOS: 'Conferir Ordem de Serviço',
  conferirProtocolo: 'Conferir Protocolo',
  conferirEnderecoSistema: 'Conferir se endereço na O.S e cadastro foram alterados',
  conferirOutraInstalacao: 'Verificar em Pessoas/Empresas se há outra instalação ativa no mesmo endereço',
  conferirFinanceiro: 'Conferir Financeiro',
  conferirFidelidade: 'Verificar fidelidade do cliente (se não tiver, é responsabilidade do atendente ofertar)',
  conferirPlanoRoteador: 'Alteração de plano: verificar novo plano, roteador e se troca está na O.S/protocolo',
  conferirAutorizacao90dias: 'Se instalado há menos de 90 dias: verificar autorização do Hiago/Deivit',
  conferirTipoCliente: 'Verificar se mudança é de residencial → comercial ou vice-versa (exige autorização)',
  conferirTipoOS: 'Conferir se o tipo de O.S está correto',
}

export const CHECKLIST_KEYS = Object.keys(CHECKLIST_LABELS) as (keyof ChecklistValidacao)[]

export function getChecklistProgress(
  tipoMudanca: TipoMudanca,
  checklist?: Partial<ChecklistValidacao>
): { marcados: number; total: number; pct: number } {
  const keys = CHECKLIST_KEYS.filter(
    (k) => k !== 'conferirPlanoRoteador' || tipoMudanca === 'MUD END + ALT PLAN'
  )
  const total = keys.length
  const marcados = checklist ? keys.filter((k) => checklist[k]).length : 0
  return { marcados, total, pct: total > 0 ? Math.round((marcados / total) * 100) : 0 }
}
