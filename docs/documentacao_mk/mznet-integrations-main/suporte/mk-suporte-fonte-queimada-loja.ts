import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { defineString } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

// credenciais via firebase functions:config:set mk.*
const MK_BASE_URL              = defineString('MK_BASE_URL')
const MK_USER                  = defineString('MK_USER')
const MK_PASSWORD              = defineString('MK_PASSWORD')
const MK_MODE                  = defineString('MK_MODE') // "shadow" | "on"
const MK_TIPO_OS_ATEND_LOJA    = defineString('MK_TIPO_OS_ATENDIMENTO_LOJA')

const REGION = 'southamerica-east1'
const CALLABLE_HTTP_OPTS = {
  region: REGION,
  cors: [
    /^http:\/\/localhost(?::\d+)?$/,
    /^https:\/\/[\w.-]+\.web\.app$/,
    /^https:\/\/[\w.-]+\.firebaseapp\.com$/,
  ],
}

// ─── helpers MK ──────────────────────────────────────────────────────────────

async function mkAutenticar(base: string, user: string, pass: string) {
  const url = `${base}/mk/WSMKLoginCompleto.rule?sys=MK0&login=${encodeURIComponent(user)}&senha=${encodeURIComponent(pass)}`
  const res  = await fetch(url)
  const json = await res.json()
  const token = json?.tokenUsuario ?? json?.token ?? null
  return { token, raw: JSON.stringify(json) }
}

async function mkConsultarCliente(base: string, token: string, cpf: string) {
  const url = `${base}/mk/WSMKConsultaDoc.rule?sys=MK0&token=${token}&documento=${encodeURIComponent(cpf)}`
  const res  = await fetch(url)
  const json = await res.json()
  const cd_cliente = json?.codigo ?? json?.cd_cliente ?? null
  return { cd_cliente, raw: JSON.stringify(json) }
}

async function mkCriarProtocolo(base: string, token: string, cd_cliente: string, info: string) {
  const url = `${base}/mk/WSMKNovoAtendimento.rule?sys=MK0&token=${token}&cd_cliente=${cd_cliente}&info=${encodeURIComponent(info)}`
  const res  = await fetch(url)
  const json = await res.json()
  const cd_atendimento = json?.CodigoAtendimento ?? json?.cd_atendimento ?? null
  const protocolo      = json?.Protocolo ?? null
  return { cd_atendimento, protocolo, raw: JSON.stringify(json) }
}

async function mkCriarOS(
  base: string, token: string,
  cd_cliente: string, cd_atendimento: string,
  tipo: string, descricao: string, data: string, hora: string
) {
  const params = new URLSearchParams({
    sys: 'MK0', token,
    CodigoCliente:      cd_cliente,
    CodigoAtendimento:  cd_atendimento,
    CodigoTipoOS:       tipo,
    DescricaoProblema:  descricao,
    categoria:          '1',
    data,
    hora,
  })
  const url = `${base}/mk/WSMKCriarOrdemServico.rule?${params}`
  const res  = await fetch(url)
  const json = await res.json()
  const cd_os = json?.CodigoOS ?? json?.cd_os ?? null
  return { cd_os, raw: JSON.stringify(json) }
}

// ─── logger Firestore ─────────────────────────────────────────────────────────

async function logStep(
  db: FirebaseFirestore.Firestore,
  taskId: string,
  etapa: string,
  dados: Record<string, unknown>
) {
  await db.collection('mk_integration_log').add({
    task:      taskId,
    etapa,
    ...dados,
    createdAt: FieldValue.serverTimestamp(),
  })
}

// ─── Cloud Function ───────────────────────────────────────────────────────────

/**
 * Tarefa #1 — fonte-queimada-loja
 * Padrão A: autenticar → consultarCliente → criarProtocolo → criarOS (atendimento_loja)
 *
 * Payload esperado:
 *   cpf        string  CPF/CNPJ do cliente (sem formatação)
 *   cliente    string  Nome completo do titular
 *   canal      string  Canal de contato (WhatsApp, telefone, etc.)
 *   contato    string  Número de telefone
 *   sinalONU   string  Sinal da fibra ex: -31.87 dBm
 *   equip      string  Equipamento (fonte, roteador, etc.)
 *   proced     string  Procedimento remoto realizado
 *   dataVisita string  Data que cliente virá à loja dd/mm/aaaa
 *   horaVisita string  Período (manhã / tarde)
 */
export const mkFonteQueimadaLoja = onCall(CALLABLE_HTTP_OPTS, async (request) => {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Faça login.')

  const { cpf, cliente, canal, contato, sinalONU, equip, proced, dataVisita, horaVisita } = request.data ?? {}
  if (!cpf || !cliente) throw new HttpsError('invalid-argument', 'cpf e cliente são obrigatórios.')

  const TASK_ID = 'fonte-queimada-loja'
  const db      = getFirestore()
  const base    = MK_BASE_URL.value()
  const mode    = MK_MODE.value() ?? 'shadow'

  // idempotência — não duplica se já foi processado com sucesso
  const jaFeito = await db.collection('mk_integration_log')
    .where('task', '==', TASK_ID)
    .where('etapa', '==', 'criar_os')
    .where('sucesso', '==', true)
    .where('cpf', '==', cpf)
    .limit(1).get()
  if (!jaFeito.empty) {
    return { modo: 'JA_PROCESSADO', cd_os: jaFeito.docs[0].data().cd_os }
  }

  // monta textos exatamente como o gerador faz hoje
  const primeiroNome = cliente.split(' ')[0].toUpperCase()
  const infoProtocolo =
    `${primeiroNome} ENTROU EM CONTATO POR ${canal} (${contato}) INFORMANDO PROBLEMA DE CONEXÃO.\n` +
    `FIBRA COM SINAL: ${sinalONU}. ${equip} DESCONECTADO. ${proced}\n` +
    `CLIENTE OPTOU POR VIR À LOJA RETIRAR FONTE. DATA: ${dataVisita} PERÍODO: ${horaVisita}.`

  const descricaoOS = `CLIENTE VIRÁ NA LOJA RECOLHER UMA FONTE DE ${equip} SEM CUSTOS. EM ${dataVisita} NO PERÍODO DA ${horaVisita}.`

  // SHADOW — loga payload e retorna sem chamar o MK
  if (mode === 'shadow') {
    await logStep(db, TASK_ID, 'shadow', {
      cpf, sucesso: true,
      payload_protocolo: infoProtocolo,
      payload_os: descricaoOS,
      nota: 'shadow mode — nenhuma chamada enviada ao MK',
    })
    return { modo: 'shadow', payload_protocolo: infoProtocolo, payload_os: descricaoOS }
  }

  // MODO ON — executa o fluxo completo
  // 1. autenticar
  const auth = await mkAutenticar(base, MK_USER.value(), MK_PASSWORD.value())
  await logStep(db, TASK_ID, 'autenticacao', { sucesso: !!auth.token })
  if (!auth.token) throw new HttpsError('internal', 'Falha na autenticação com o MK.')

  // 2. consultar cliente
  const cliente_mk = await mkConsultarCliente(base, auth.token, cpf)
  await logStep(db, TASK_ID, 'consulta_cliente', { cpf, cd_cliente: cliente_mk.cd_cliente, sucesso: !!cliente_mk.cd_cliente })
  if (!cliente_mk.cd_cliente) throw new HttpsError('not-found', `Cliente com CPF ${cpf} não encontrado no MK.`)

  // 3. criar protocolo
  const prot = await mkCriarProtocolo(base, auth.token, cliente_mk.cd_cliente, infoProtocolo)
  await logStep(db, TASK_ID, 'criar_protocolo', { cd_atendimento: prot.cd_atendimento, protocolo: prot.protocolo, sucesso: !!prot.cd_atendimento })
  if (!prot.cd_atendimento) throw new HttpsError('internal', 'Falha ao criar protocolo no MK.')

  // 4. criar OS — código tipo via Firebase Config (functions:config:set mk.tipo_os_atendimento_loja=VALOR)
  const tipoOS = MK_TIPO_OS_ATEND_LOJA.value()
  if (!tipoOS) throw new HttpsError('internal', 'Config mk.tipo_os_atendimento_loja não definida.')
  const os = await mkCriarOS(base, auth.token, cliente_mk.cd_cliente, prot.cd_atendimento, tipoOS, descricaoOS, dataVisita, horaVisita)
  await logStep(db, TASK_ID, 'criar_os', { cd_os: os.cd_os, sucesso: !!os.cd_os, cpf })
  if (!os.cd_os) throw new HttpsError('internal', 'Falha ao criar OS no MK.')

  return {
    modo: 'on',
    cd_cliente:     cliente_mk.cd_cliente,
    cd_atendimento: prot.cd_atendimento,
    protocolo:      prot.protocolo,
    cd_os:          os.cd_os,
  }
})
