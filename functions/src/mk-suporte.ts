import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { defineSecret, defineString } from 'firebase-functions/params'

// ---- Parâmetros de configuração ----
// defineSecret → armazenado no Google Cloud Secret Manager (não exposto em logs/env)
// defineString → variável de ambiente comum (não-sensível)

const _mkBaseUrl = defineString('MK_BASE_URL', { default: '' })
const _mkMode    = defineString('MK_MODE',     { default: 'shadow' })
const _mkToken   = defineSecret('MK_TOKEN')
const _mkPass    = defineSecret('MK_WEBSERVICE_PASSWORD')

// Lido dentro do handler (defineSecret.value() só funciona durante a execução)
type MkConfig = { baseUrl: string; token: string; password: string; shadow: boolean }
function getMkConfig(): MkConfig {
  return {
    baseUrl:  _mkBaseUrl.value().replace(/\/$/, '').trim(),
    token:    _mkToken.value().trim(),
    password: _mkPass.value().trim(),
    shadow:   _mkMode.value().trim() !== 'real',
  }
}

// Mapeamento Firebase UID → login MK ERP
// Cada colaborador aparece com seu próprio nome nos tickets e comentários do MK
const MK_USER_MAP: Record<string, string> = {
  'daqWkAW8gNZjUZBX5O9iDYk7U9D3': 'mz.ramony',
  '0UvfKTsWMWg51OfmhKe9jSjN7zq2': 'mz.victorhugo',
  'esHXTraWEwQ4s0jdPFDJIY8cVRk2': 'mz.hiorranna',
  'smlrMVGkeqZfKcHfsKwd8Kezb1h2': 'mz.halyson',
  'qo9FJdO3hyUEInOdA6n0m1wICxk1': 'mz.izabela',
  '14U120GV9IUnIkvGSHOgZG823Pj1': 'mz.brunacristina',
  'kqLoVLuP1UhPxaPiZ26wKmd5Eul2': 'mz.jhonatan',
  'Ff0IBg4gquX1Q7CQxW4fonjg2jy1': 'mz.joseramos',
  'R4QXtKbIySNiLMKb9j0Lu6Q3pxB3': 'mz.lauren',
  'pFgE8jEtsreUuxvywISFXdlOBxN2': 'mz.eduardohenrique',
  'LraqF5iRVDM98MdS5StezC6kTzj2': 'mz.renatasaraiva',
  'SVMua6jWatVt3wmPhSHJOuZVg5h1': 'mz.gabrielmartins',
  'rTvjrujWRvUtJVw4LtTdkX7Ny4k2': 'mz.andreza',
  'ecJLm1beorbfM51IApqwzRtE3wx2': 'mz.pedrohenrique',
  'Iq67U4vLKpWY7HsLa8V2RVpuVz72': 'mz.vagner',
  'bjO17WJAsJdsZ2hfKorEvaugxIP2': 'mz.hiagoalves',
  'RAqfy5tThwQNzJzcbLnXHxzV81O2': 'mz.vitormanoel',
  'cYldsb3BkogRPG9dQRbEcPjJKIc2': 'mz.vitorsilva',
  'EzcVPkrbnKZqG1Xqfravbp26cEv1': 'mz.luis',
  'dZGecnIydSbOSCDfkwH4bwJZilc2': 'mz.ronald',
  'kV7VX6qkQObt5cZcF0cb2VRzDBn2': 'mz.karolayne',
}

function mkLoginByUid(uid: string): string | undefined {
  return MK_USER_MAP[uid]
}

// ---- Tipos de resposta da API MK ----

type MkAuthResponse = {
  Token?: string
  tokenRetornoAutenticacao?: string  // fallback documentação antiga
  Expire?: string
  LimiteUso?: number
  ServicosAutorizados?: number[]
  status?: string
}

type MkCliente = {
  codigo: number
  nome: string
  documento?: string
  email?: string
  fone?: string
}

type MkConsultaDocResponse = {
  CodigoPessoa?: number
  Nome?: string
  Email?: string
  Fone?: string
  Endereco?: string
  CEP?: string
  Situacao?: string
  status?: string
  mensagem?: string
}

type MkAtendimentoPayload = {
  token: string
  cd_cliente: number
  cd_processo: number
  cd_classificacao_ate: number
  origem_contato: number  // 6=Telefone, 9=WhatsApp
  info: string
  cd_contrato?: number
  conexao_associada?: number
  op_abertura?: string   // login ERP do operador que abriu (release 64.9+)
}

type MkAtendimentoResponse = {
  CodigoAtendimento?: number
  CodigoCliente?: number
  Cliente?: string
  Protocolo?: string
  cd_atendimento?: number
  codigo?: number
  id?: number
  status?: string
  mensagem?: string
  Mensagem?: string
}

type MkOsPayload = {
  token: string
  CodigoCliente: number
  DescricaoProblema: string
  CodigoTipoOS: number
  CodigoGrupoServico?: number
  CodigoTecnico?: number
  CodigoAtendimento?: number
  categoria?: number  // 1=Cliente, 2=Fornecedor
}

type MkOsResponse = {
  codigo_os?: number
  mensagem?: string
  erro?: string
}

type MkConexaoItem = {
  CodigoConexao?: number
  Codigo?: number
  codconexao?: number   // nome real retornado pela API MK
  contrato?: number
  username?: string
  bloqueada?: string
  motivo_bloqueio?: string | null
  tecnologia?: string
  [key: string]: unknown
}

type MkConexoesResponse = MkConexaoItem[] | {
  conexoes?: MkConexaoItem[]
  Conexoes?: MkConexaoItem[]
  status?: string
  mensagem?: string
}

// ---- Cliente HTTP MK ----

type MkSession = { token: string; jsessionid?: string }

async function mkRequest<T>(
  baseUrl: string,
  path: string,
  params: Record<string, string | number>,
  jsessionid?: string,
): Promise<{ data: T; jsessionid?: string }> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString()
  const url = `${baseUrl}${path}`
  console.log(`[MK] POST ${path}`, Object.fromEntries(Object.entries(params).filter(([k]) => k !== 'token' && k !== 'password')))
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (jsessionid) headers['Cookie'] = `JSESSIONID=${jsessionid}`
  const res = await fetch(url, { method: 'POST', body: qs, headers, signal: AbortSignal.timeout(15_000) })
  // Captura JSESSIONID retornado pelo Tomcat para manter a sessão Java
  const setCookie = res.headers.get('set-cookie') ?? ''
  const match = setCookie.match(/JSESSIONID=([^;]+)/)
  const newJsessionid = match?.[1] ?? jsessionid
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`[MK] ERRO ${res.status} em ${path}:`, body.slice(0, 2000))
    throw new Error(`MK ${path} → HTTP ${res.status}`)
  }
  return { data: await res.json() as T, jsessionid: newJsessionid }
}

// ---- Operações MK ----

async function mkAuth(cfg: MkConfig): Promise<MkSession> {
  const { data, jsessionid } = await mkRequest<MkAuthResponse>(cfg.baseUrl, '/mk/WSAutenticacao.rule', {
    sys: 'MK0',
    token: cfg.token,
    password: cfg.password,
    cd_servico: 9999,
  })
  const token = data.Token ?? data.tokenRetornoAutenticacao
  if (!token || data.status === 'ERRO') {
    console.error('[MK] auth falhou — resposta completa:', JSON.stringify(data))
    throw new Error(`MK auth falhou — status: ${data.status ?? 'sem resposta'}`)
  }
  console.log('[MK] auth ok — JSESSIONID:', jsessionid ? jsessionid.slice(0, 8) + '...' : 'ausente')
  return { token, jsessionid }
}

async function mkBuscarClientePorCpf(cfg: MkConfig, session: MkSession, cpf: string): Promise<MkCliente> {
  const { data } = await mkRequest<MkConsultaDocResponse>(cfg.baseUrl, '/mk/WSMKConsultaDoc.rule', {
    sys: 'MK0',
    token: session.token,
    doc: cpf.replace(/\D/g, ''),
  }, session.jsessionid)
  if (data.status !== 'OK' || !data.CodigoPessoa) {
    throw new Error(`Cliente não encontrado no MK (CPF: ${cpf}) — ${data.mensagem ?? data.status ?? 'sem resposta'}`)
  }
  return {
    codigo: data.CodigoPessoa,
    nome: data.Nome ?? '',
    email: data.Email,
    fone: data.Fone,
  }
}

async function mkListarConexoes(cfg: MkConfig, session: MkSession, codigoCliente: number): Promise<MkConexaoItem[]> {
  const { data } = await mkRequest<MkConexoesResponse>(cfg.baseUrl, '/mk/WSMKConexoesPorCliente.rule', {
    sys: 'MK0',
    token: session.token,
    cd_cliente: codigoCliente,
  }, session.jsessionid)
  const lista: MkConexaoItem[] = Array.isArray(data)
    ? data
    : ((data as { conexoes?: MkConexaoItem[]; Conexoes?: MkConexaoItem[] }).conexoes
        ?? (data as { Conexoes?: MkConexaoItem[] }).Conexoes
        ?? [])
  return lista
}

async function mkBuscarConexaoCliente(cfg: MkConfig, session: MkSession, codigoCliente: number): Promise<number> {
  const lista = await mkListarConexoes(cfg, session, codigoCliente)
  if (lista.length === 0) throw new Error(`Nenhuma conexão encontrada para o cliente ${codigoCliente}`)
  const conexao = lista[0]
  const codigo = conexao.CodigoConexao ?? conexao.Codigo ?? conexao.codconexao
  if (!codigo) throw new Error(`CodigoConexao ausente na resposta: ${JSON.stringify(conexao)}`)
  return codigo
}

async function mkCriarAtendimento(cfg: MkConfig, session: MkSession, payload: MkAtendimentoPayload): Promise<{ id: number; protocolo: string }> {
  const params: Record<string, string | number> = {
    sys: 'MK0',
    token: payload.token,
    cd_cliente: payload.cd_cliente,
    cd_processo: payload.cd_processo,
    cd_classificacao_ate: payload.cd_classificacao_ate,
    origem_contato: payload.origem_contato,
    info: payload.info,
  }
  if (payload.cd_contrato) params.cd_contrato = payload.cd_contrato
  if (payload.conexao_associada) params.conexao_associada = payload.conexao_associada
  if (payload.op_abertura) params.op_abertura = payload.op_abertura

  const { data } = await mkRequest<MkAtendimentoResponse>(cfg.baseUrl, '/mk/WSMKNovoAtendimento.rule', params, session.jsessionid)
  const id = data.CodigoAtendimento ?? data.cd_atendimento ?? data.codigo ?? data.id
  if (!id) throw new Error(`MK não retornou ID do atendimento: ${data.Mensagem ?? data.mensagem ?? JSON.stringify(data)}`)
  return { id, protocolo: data.Protocolo ?? '' }
}

// MK grava acentos como entidades HTML (&Aacute; etc.) antes do varchar(300).
// Cada char não-ASCII custa ~8 chars. Estimamos o tamanho real para não ultrapassar.
function mkEstimatedLength(text: string): number {
  let len = 0
  for (const ch of text) {
    len += ch.charCodeAt(0) > 127 ? 8 : 1
  }
  return len
}

const HTML_RED_PREFIX = '<font color="#FF0000">'
const HTML_RED_SUFFIX = '</font>'
const HTML_RED_OVERHEAD = HTML_RED_PREFIX.length + HTML_RED_SUFFIX.length // 28

async function mkInserirComentario(
  cfg: MkConfig,
  session: MkSession,
  atendimentoId: number,
  comentario: string,
  mkLogin?: string,
  tipo = 1,
): Promise<void> {
  // tipo 1 = vermelho/privado: wrapper HTML consome 28 chars do varchar(300)
  const contentMax = 290 - (tipo === 1 ? HTML_RED_OVERHEAD : 0)
  const normalized = comentario
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join(' ')

  const chunks: string[] = []
  let remaining = normalized
  while (mkEstimatedLength(remaining) > contentMax) {
    let i = remaining.length
    while (i > 0 && mkEstimatedLength(remaining.slice(0, i)) > contentMax) i--
    const cut = remaining.slice(0, i).lastIndexOf(' ')
    if (cut > 0) {
      chunks.push(remaining.slice(0, cut))
      remaining = remaining.slice(cut + 1)
    } else {
      chunks.push(remaining.slice(0, i))
      remaining = remaining.slice(i)
    }
  }
  if (remaining) chunks.push(remaining)

  for (const chunk of chunks) {
    const content = tipo === 1
      ? `${HTML_RED_PREFIX}${chunk}${HTML_RED_SUFFIX}`
      : chunk
    const params: Record<string, string | number> = {
      sys: 'MK0',
      token: session.token,
      cd_atendimento: atendimentoId,
      comentario: content,
      tipo,
    }
    if (mkLogin) params.user = mkLogin
    await mkRequest<Record<string, unknown>>(cfg.baseUrl, '/mk/WSMKAtendimentoComentario.rule', params, session.jsessionid)
  }
}

async function mkCriarOS(cfg: MkConfig, session: MkSession, payload: MkOsPayload): Promise<number> {
  const params: Record<string, string | number> = { sys: 'MK0' }
  for (const [k, v] of Object.entries(payload)) {
    if (v !== undefined && v !== null) params[k] = v as string | number
  }
  const { data } = await mkRequest<MkOsResponse>(cfg.baseUrl, '/mk/WSMKCriarOrdemServico.rule', params, session.jsessionid)
  const codigoOs = data.codigo_os ?? (data as Record<string, unknown>).CodigoOS ?? (data as Record<string, unknown>).Codigo
  if (!codigoOs) throw new Error(`MK não retornou código da OS: ${data.erro ?? data.mensagem ?? JSON.stringify(data)}`)
  return codigoOs as number
}

// ---- Log de integrações (Firestore) ----

async function salvarLog(entry: {
  uid: string
  slug?: string
  cpf?: string
  shadow: boolean
  payload: unknown
  resultado?: unknown
  erro?: string
}): Promise<void> {
  try {
    await getFirestore()
      .collection('mk_integration_log')
      .add({ ...entry, criadoEm: FieldValue.serverTimestamp() })
  } catch (e) {
    // Log não é crítico — não derruba o fluxo principal (ex: Firestore emulador não rodando)
    console.warn('[salvarLog] falha ao registrar:', e instanceof Error ? e.message : String(e))
  }
}

// ---- Tipos do callable ----

export type MkSuporteRequest =
  | { action: 'testar_auth' }
  | { action: 'buscar_cliente'; cpf: string }
  | { action: 'listar_tipos_os' }
  | { action: 'listar_grupos' }
  | { action: 'listar_processos' }
  | { action: 'listar_classificacoes'; processoId?: number }
  | {
      action: 'criar_protocolo'
      slug: string
      cpf: string
      processoId: number
      classificacaoId: number
      info: string
      comentarios?: string[]  // blocos adicionais inseridos como comentários separados
      origemContato?: number  // 6=Telefone, 9=WhatsApp (default)
      conexaoAssociada?: number  // CodigoConexao — se omitido, buscado automaticamente
      contratoId?: number       // contrato da conexão — passado junto com conexaoAssociada
    }
  | {
      action: 'inserir_comentario'
      atendimentoId: number
      comentario: string
      tipo?: number  // 1=privado (default), 2=público
    }
  | { action: 'buscar_conexao'; cpf: string }
  | {
      action: 'criar_os'
      slug: string
      cpf: string
      descricaoProblema: string
      tipoOS: number
      processoId: number
      classificacaoId: number
      grupoServico?: number
      tecnicoId?: number
      codigoConexao?: number  // se omitido, buscado automaticamente via WSMKConexoesPorCliente
    }

export type MkConexaoPublic = {
  codigo: number
  contrato: number
  username: string
  tecnologia: string
  bloqueada: string
}

export type MkSuporteResponse = {
  shadow: boolean
  sessionToken?: string
  clienteCodigo?: number
  clienteNome?: string
  atendimentoId?: number
  protocolo?: string
  osNumero?: number
  conexoes?: MkConexaoPublic[]
  // respostas raw para testes
  raw?: unknown
}

// ---- Cloud Function callable ----

export const mkSuporte = onCall<MkSuporteRequest, Promise<MkSuporteResponse>>(
  { cors: true, region: 'southamerica-east1', invoker: 'public', secrets: [_mkToken, _mkPass] },
  async (req) => {
    const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true'
    const uid = req.auth?.uid ?? (isEmulator ? 'emulator-test' : null)
    if (!uid) throw new HttpsError('unauthenticated', 'Autenticação necessária.')

    const cfg = getMkConfig()
    const { action } = req.data

    // ---- testar_auth: valida se as credenciais funcionam ----
    if (action === 'testar_auth') {
      if (cfg.shadow) {
        console.log('[MK shadow] testar_auth — credenciais não enviadas ao MK')
        return { shadow: true }
      }
      const session = await mkAuth(cfg)
      return { shadow: false, sessionToken: session.token.slice(0, 8) + '...' }
    }

    // ---- buscar_cliente: auth + busca por CPF ----
    if (action === 'buscar_cliente') {
      const { cpf } = req.data
      if (cfg.shadow) return { shadow: true, raw: { simulado: true, cpf } }
      const session = await mkAuth(cfg)
      const { data: raw } = await mkRequest(cfg.baseUrl, '/mk/WSMKConsultaDoc.rule', { sys: 'MK0', token: session.token, doc: cpf.replace(/\D/g, '') }, session.jsessionid)
      return { shadow: false, raw }
    }

    // ---- listar_tipos_os ----
    if (action === 'listar_tipos_os') {
      if (cfg.shadow) return { shadow: true, raw: [] }
      const session = await mkAuth(cfg)
      const { data: raw } = await mkRequest(cfg.baseUrl, '/mk/WSMKOSListaTiposOS.rule', { sys: 'MK0', token: session.token }, session.jsessionid)
      return { shadow: false, raw }
    }

    // ---- listar_grupos ----
    if (action === 'listar_grupos') {
      if (cfg.shadow) return { shadow: true, raw: [] }
      const session = await mkAuth(cfg)
      const { data: raw } = await mkRequest(cfg.baseUrl, '/mk/WSMKConsultaEquipes.rule', { sys: 'MK0', token: session.token }, session.jsessionid)
      return { shadow: false, raw }
    }

    // ---- listar_processos ----
    if (action === 'listar_processos') {
      if (cfg.shadow) return { shadow: true, raw: [] }
      const session = await mkAuth(cfg)
      const { data: raw } = await mkRequest(cfg.baseUrl, '/mk/WSMKListaProcessos.rule', { sys: 'MK0', token: session.token }, session.jsessionid)
      return { shadow: false, raw }
    }

    // ---- listar_classificacoes ----
    if (action === 'listar_classificacoes') {
      if (cfg.shadow) return { shadow: true, raw: [] }
      const session = await mkAuth(cfg)
      const params: Record<string, string | number> = { sys: 'MK0', token: session.token }
      if (req.data.processoId) params.cd_processo = req.data.processoId
      const { data: raw } = await mkRequest(cfg.baseUrl, '/mk/WSMKListaClassificacoesAte.rule', params, session.jsessionid)
      return { shadow: false, raw }
    }

    // ---- buscar_conexao: auth → cliente → lista de conexões ativas ----
    if (action === 'buscar_conexao') {
      const { cpf } = req.data
      if (!cpf?.trim()) throw new HttpsError('invalid-argument', 'CPF é obrigatório.')
      if (cfg.shadow) return { shadow: true, conexoes: [], raw: { simulado: true, cpf } }
      const session = await mkAuth(cfg)
      const cliente = await mkBuscarClientePorCpf(cfg, session, cpf)
      const lista = await mkListarConexoes(cfg, session, cliente.codigo)
      const conexoes: MkConexaoPublic[] = lista.map((c) => ({
        codigo: (c.CodigoConexao ?? c.Codigo ?? c.codconexao) as number,
        contrato: (c.contrato ?? 0) as number,
        username: String(c.username ?? c.Login ?? ''),
        tecnologia: String(c.tecnologia ?? ''),
        bloqueada: String(c.bloqueada ?? 'Não'),
      })).filter(c => c.codigo)
      return { shadow: false, clienteCodigo: cliente.codigo, clienteNome: cliente.nome, conexoes }
    }

    // ---- criar_protocolo: Padrão B — auth → cliente → atendimento (sem OS) ----
    if (action === 'criar_protocolo') {
      const { slug, cpf, processoId, classificacaoId, info, comentarios, origemContato, conexaoAssociada, contratoId } = req.data

      if (!info?.trim()) throw new HttpsError('invalid-argument', 'Campo "info" é obrigatório.')
      if (!cpf?.trim()) throw new HttpsError('invalid-argument', 'CPF é obrigatório.')

      const payload = { slug, cpf, processoId, classificacaoId, info, ...(comentarios ? { comentarios } : {}) }

      if (cfg.shadow) {
        console.log('[MK shadow] criar_protocolo payload:', JSON.stringify(payload))
        await salvarLog({ uid, slug, cpf, shadow: true, payload })
        return { shadow: true }
      }

      let session: MkSession
      let cliente: MkCliente
      let resultado: { id: number; protocolo: string }
      const mkLogin = mkLoginByUid(uid)

      try {
        session = await mkAuth(cfg)
        cliente = await mkBuscarClientePorCpf(cfg, session, cpf)

        let conexao = conexaoAssociada
        if (!conexao) {
          try {
            conexao = await mkBuscarConexaoCliente(cfg, session, cliente.codigo)
          } catch {
            console.warn('[MK] criar_protocolo: não foi possível obter conexão — prosseguindo sem ela')
          }
        }

        resultado = await mkCriarAtendimento(cfg, session, {
          token: session.token,
          cd_cliente: cliente.codigo,
          cd_processo: processoId,
          cd_classificacao_ate: classificacaoId,
          origem_contato: origemContato ?? 9,
          info,
          cd_contrato: contratoId || undefined,
          conexao_associada: conexao,
          op_abertura: mkLogin,
        })
        for (const bloco of comentarios ?? []) {
          if (bloco.trim()) {
            await mkInserirComentario(cfg, session, resultado.id, bloco.trim(), mkLogin)
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        await salvarLog({ uid, slug, cpf, shadow: false, payload, erro: msg })
        throw new HttpsError('internal', `Falha na integração MK: ${msg}`)
      }

      await salvarLog({ uid, slug, cpf, shadow: false, payload, resultado: { atendimentoId: resultado.id, protocolo: resultado.protocolo } })
      return {
        shadow: false,
        clienteCodigo: cliente.codigo,
        clienteNome: cliente.nome,
        atendimentoId: resultado.id,
        protocolo: resultado.protocolo,
        sessionToken: session.token,
      }
    }

    // ---- inserir_comentario: auth própria → insere comentário no atendimento ----
    if (action === 'inserir_comentario') {
      const { atendimentoId, comentario, tipo } = req.data
      if (!comentario?.trim()) throw new HttpsError('invalid-argument', '"comentario" é obrigatório.')
      if (!atendimentoId) throw new HttpsError('invalid-argument', '"atendimentoId" é obrigatório.')

      if (cfg.shadow) {
        console.log('[MK shadow] inserir_comentario:', JSON.stringify({ atendimentoId, comentario, tipo }))
        return { shadow: true }
      }

      try {
        const session = await mkAuth(cfg)
        const mkLogin = mkLoginByUid(uid)
        await mkInserirComentario(cfg, session, atendimentoId, comentario.trim(), mkLogin, tipo ?? 1)
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        throw new HttpsError('internal', `Falha ao inserir comentário: ${msg}`)
      }

      return { shadow: false, atendimentoId }
    }

    // ---- criar_os: fluxo completo auth → cliente → conexão → atendimento → OS ----
    if (action === 'criar_os') {
      const { slug, cpf, descricaoProblema, tipoOS, processoId, classificacaoId, grupoServico, tecnicoId, codigoConexao: conexaoFornecida } = req.data

      if (!descricaoProblema?.trim()) {
        throw new HttpsError('invalid-argument', 'Descrição do problema é obrigatória.')
      }

      const payload = { slug, cpf, descricaoProblema, tipoOS, processoId, classificacaoId, grupoServico }

      if (cfg.shadow) {
        console.log('[MK shadow] criar_os payload:', JSON.stringify(payload))
        await salvarLog({ uid, slug, cpf, shadow: true, payload })
        return { shadow: true }
      }

      let session: MkSession
      let cliente: MkCliente
      let atendimento: { id: number; protocolo: string }
      let osNumero: number

      try {
        session = await mkAuth(cfg)
        cliente = await mkBuscarClientePorCpf(cfg, session, cpf)

        let conexao = conexaoFornecida
        if (!conexao) {
          try {
            conexao = await mkBuscarConexaoCliente(cfg, session, cliente.codigo)
          } catch {
            console.warn('[MK] criar_os: não foi possível obter conexão — prosseguindo sem ela')
          }
        }

        atendimento = await mkCriarAtendimento(cfg, session, {
          token: session.token,
          cd_cliente: cliente.codigo,
          cd_processo: processoId,
          cd_classificacao_ate: classificacaoId,
          origem_contato: 9,
          info: descricaoProblema,
          conexao_associada: conexao,
        })
        osNumero = await mkCriarOS(cfg, session, {
          token: session.token,
          CodigoCliente: cliente.codigo,
          DescricaoProblema: descricaoProblema,
          CodigoTipoOS: tipoOS,
          CodigoGrupoServico: grupoServico,
          CodigoTecnico: tecnicoId,
          CodigoAtendimento: atendimento.id,
          categoria: 1,  // 1=cliente OS, 2=provedor OS — obrigatório a partir da release 74
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        await salvarLog({ uid, slug, cpf, shadow: false, payload, erro: msg })
        throw new HttpsError('internal', `Falha na integração MK: ${msg}`)
      }

      await salvarLog({ uid, slug, cpf, shadow: false, payload, resultado: { atendimentoId: atendimento.id, osNumero } })
      return {
        shadow: false,
        clienteCodigo: cliente.codigo,
        clienteNome: cliente.nome,
        atendimentoId: atendimento.id,
        protocolo: atendimento.protocolo,
        osNumero,
      }
    }

    throw new HttpsError('invalid-argument', `Ação desconhecida: ${String(action)}`)
  },
)
