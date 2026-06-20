import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  MudancaEndereco,
  MudancaEnderecoInput,
  ChecklistValidacao,
  StatusValidacao,
} from '../types/validacao'

const COL = 'mudancasEndereco'

export async function criarMudancaEndereco(
  input: MudancaEnderecoInput
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...input,
    status: 'PENDENTE' as StatusValidacao,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  })
  return ref.id
}

export async function listarMudancasEndereco(): Promise<MudancaEndereco[]> {
  const q = query(collection(db, COL), orderBy('dataMudanca', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MudancaEndereco))
}

export async function getMudancaEndereco(id: string): Promise<MudancaEndereco | null> {
  const snap = await getDoc(doc(db, COL, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as MudancaEndereco
}

export async function salvarChecklist(
  id: string,
  checklist: Partial<ChecklistValidacao>
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    checklist,
    atualizadoEm: serverTimestamp(),
  })
}

export async function validarMudanca(
  id: string,
  validadorNome: string,
  validadorUid: string,
  observacoes: string,
  checklist: Partial<ChecklistValidacao>
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    status: 'VALIDADO' as StatusValidacao,
    validadoPor: validadorNome,
    validadoPorUid: validadorUid,
    validadoEm: serverTimestamp(),
    observacoes,
    checklist,
    atualizadoEm: serverTimestamp(),
  })
}

export async function marcarRetornar(
  id: string,
  observacoes: string,
  checklist: Partial<ChecklistValidacao>
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    status: 'RETORNAR' as StatusValidacao,
    observacoes,
    checklist,
    atualizadoEm: serverTimestamp(),
  })
}

export function gerarTextoContatoFeito(params: {
  atendente: string
  nomeCliente: string
  telefoneCliente: string
  novoEndereco: string
  valorMudanca: string
  diaSemana: string
  dataMudanca: Timestamp
  horaMudanca: string
  titularAcompanha: boolean
  acompanhante?: { nome: string; telefone: string }
}): string {
  const agora = new Date()
  const hojeStr = agora.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const horaStr = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const dataAgendStr = params.dataMudanca
    .toDate()
    .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

  const acompanhamento = params.titularAcompanha
    ? `${params.nomeCliente} VAI ACOMPANHAR A VISITA.`
    : `${params.nomeCliente} AUTORIZA ${params.acompanhante?.nome ?? ''} (${params.acompanhante?.telefone ?? ''}) ACOMPANHAR A VISITA.`

  return `TÉC. ${params.atendente}

ENTREI EM CONTATO COM ${params.nomeCliente} (${params.telefoneCliente}) DIA ${hojeStr} ÀS ${horaStr} HORAS POR LIGAÇÃO. CONFIRMEI OS DADOS ABAIXO:
${params.novoEndereco}

TAXA A SER PAGA NO MOMENTO DA INSTALAÇÃO DE ${params.valorMudanca} NO ${params.diaSemana.toUpperCase()} E RESSALTEI QUE OS EQUIPAMENTOS DE INTERNET DEVEM SER LEVADOS PARA O NOVO ENDEREÇO, ONU, ROTEADOR OU ONT + (FONTES DE ENERGIA).
${acompanhamento}
CONFIRMADO PARA DIA ${dataAgendStr} ÀS ${params.horaMudanca} HORAS.`
}

export function gerarTextoSemContato(params: {
  atendente: string
  nomeCliente: string
  telefoneCliente: string
}): string {
  const agora = new Date()
  const hojeStr = agora.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const horaStr = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return `TÉC. ${params.atendente}

TENTEI CONTATO COM ${params.nomeCliente} POR LIGAÇÃO (${params.telefoneCliente}) DIA ${hojeStr} ÀS ${horaStr} HORAS, TELEFONE NÃO ATENDE.
ENVIEI MENSAGEM WHATSAPP AGUARDANDO RETORNO.`
}

export function getDiaSemana(dataMudanca: Timestamp): string {
  const dias = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO']
  return dias[dataMudanca.toDate().getDay()] ?? ''
}
