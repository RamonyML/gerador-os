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

async function mkLoginByUid(uid: string): Promise<string | undefined> {
  const snap = await getFirestore().doc(`users/${uid}`).get()
  const val = snap.data()?.mkLogin
  return typeof val === 'string' && val.trim() ? val.trim() : undefined
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
  Indicacoes?: string
  CodigoTipoOS: number
  CodigoGrupoServico?: number
  CodigoTecnico?: number
  CodigoConexao?: number
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
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
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

// MK HTML-encoda chars antes de gravar no varchar(300):
//   Não-ASCII (acentos): &Aacute; etc. → até 8 chars
//   ASCII especiais (()/$ etc.): &#xx;  → 5 chars
//   Demais ASCII: 1 char
const MK_HTML_SPECIALS = new Set(['(', ')', '/', '$', '#', '&', '<', '>', '"', "'"])
function mkEstimatedLength(text: string): number {
  let len = 0
  for (const ch of text) {
    if (ch.charCodeAt(0) > 127) len += 8
    else if (MK_HTML_SPECIALS.has(ch)) len += 5
    else len += 1
  }
  return len
}

const HTML_RED_PREFIX = '<font color="#FF0000">'
const HTML_RED_SUFFIX = '</font>'
// MK HTML-encoda < " > antes de gravar no varchar(300):
//   <font color="#FF0000">  →  &lt;font color=&quot;#FF0000&quot;&gt;  (+16 chars)
//   </font>                →  &lt;/font&gt;                           (+6 chars)
// Overhead armazenado real: 29 raw + 22 de encoding = 51 chars
const HTML_RED_STORED_OVERHEAD = 51

async function mkInserirComentario(
  cfg: MkConfig,
  session: MkSession,
  atendimentoId: number,
  comentario: string,
  mkLogin?: string,
  tipo = 1,
): Promise<void> {
  const contentMax = tipo === 1
    ? 300 - HTML_RED_STORED_OVERHEAD - 5  // 244: conteúdo + 51 overhead ≤ 295
    : 285
  const normalized = comentario
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const chunks: string[] = []
  let remaining = normalized
  while (mkEstimatedLength(remaining) > contentMax) {
    let i = remaining.length
    while (i > 0 && mkEstimatedLength(remaining.slice(0, i)) > contentMax) i--
    const sliceForCut = remaining.slice(0, i)
    const cutNl = sliceForCut.lastIndexOf('\n')
    const cutSp = sliceForCut.lastIndexOf(' ')
    const cut = cutNl > 0 ? cutNl : cutSp
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
  console.log('[MK] criar OS resposta completa:', JSON.stringify(data))
  // API retorna {"mensagem":"OS 234736 criada com sucesso.","status":"OK"} — número embutido na string
  const fromMensagem = data.mensagem ? /OS (\d+) criada/i.exec(data.mensagem)?.[1] : undefined
  const codigoOs = fromMensagem ? parseInt(fromMensagem, 10)
    : data.codigo_os ?? (data as Record<string, unknown>).CodigoOS ?? (data as Record<string, unknown>).Codigo
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
  | { action: 'listar_tecnicos' }
  | { action: 'listar_processos' }
  | { action: 'listar_classificacoes'; processoId?: number }
  | {
      action: 'criar_protocolo'
      slug: string
      cpf: string
      processoId: number
      classificacaoId: number
      info: string
      comentarios?: string[]
      origemContato?: number
      conexaoAssociada?: number
      contratoId?: number
      clienteCodigo?: number  // override: pula busca por CPF, usa este código MK direto
    }
  | {
      action: 'inserir_comentario'
      atendimentoId: number
      comentario: string
      tipo?: number
    }
  | { action: 'buscar_conexao'; cpf: string; clienteCodigo?: number }
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
  | {
      action: 'criar_os_vinculada'
      slug: string
      atendimentoId: number
      codigoCliente: number
      descricaoProblema: string
      indicacoes?: string
      tipoOS: number
      grupoServico?: number
      tecnicoId?: number
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

    // ---- listar_tecnicos ----
    if (action === 'listar_tecnicos') {
      if (cfg.shadow) return { shadow: true, raw: [] }
      const session = await mkAuth(cfg)
      const { data: raw } = await mkRequest(cfg.baseUrl, '/mk/WSMKOSListaTecnicos.rule', { sys: 'MK0', token: session.token }, session.jsessionid)
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
      const { cpf, clienteCodigo: codigoOverride } = req.data
      if (!cpf?.trim() && !codigoOverride) throw new HttpsError('invalid-argument', 'CPF ou código MK é obrigatório.')
      if (cfg.shadow) return { shadow: true, conexoes: [], raw: { simulado: true, cpf } }
      const session = await mkAuth(cfg)

      let clienteCodigo: number
      let clienteNome: string
      if (codigoOverride) {
        clienteCodigo = codigoOverride
        clienteNome = `Cadastro MK #${codigoOverride}`
      } else {
        const cliente = await mkBuscarClientePorCpf(cfg, session, cpf)
        clienteCodigo = cliente.codigo
        clienteNome = cliente.nome
      }

      const lista = await mkListarConexoes(cfg, session, clienteCodigo)
      const conexoes: MkConexaoPublic[] = lista.map((c) => ({
        codigo: (c.CodigoConexao ?? c.Codigo ?? c.codconexao) as number,
        contrato: (c.contrato ?? 0) as number,
        username: String(c.username ?? c.Login ?? ''),
        tecnologia: String(c.tecnologia ?? ''),
        bloqueada: String(c.bloqueada ?? 'Não'),
      })).filter(c => c.codigo)
      return { shadow: false, clienteCodigo, clienteNome, conexoes }
    }

    // ---- criar_protocolo: Padrão B — auth → cliente → atendimento (sem OS) ----
    if (action === 'criar_protocolo') {
      const { slug, cpf, processoId, classificacaoId, info, comentarios, origemContato, conexaoAssociada, contratoId, clienteCodigo: clienteCodigoOverride } = req.data

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
      const mkLogin = await mkLoginByUid(uid)

      try {
        session = await mkAuth(cfg)
        if (clienteCodigoOverride) {
          cliente = { codigo: clienteCodigoOverride, nome: `Cadastro MK #${clienteCodigoOverride}` }
        } else {
          cliente = await mkBuscarClientePorCpf(cfg, session, cpf)
        }

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
        const mkLogin = await mkLoginByUid(uid)
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

      const mkLogin = await mkLoginByUid(uid)

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
          CodigoConexao: conexao,
          CodigoAtendimento: atendimento.id,
          categoria: 1,  // 1=cliente OS, 2=provedor OS — obrigatório a partir da release 74
        })

        if (mkLogin) {
          try {
            await mkInserirComentario(cfg, session, atendimento.id, `Uma nova O.S foi gerada por ${mkLogin}`, mkLogin, 2)
          } catch {
            console.warn('[MK] criar_os: falha ao inserir comentário de identificação — OS criada com sucesso')
          }
        }
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

    // ---- criar_os_vinculada: vincula OS a atendimento já existente ----
    if (action === 'criar_os_vinculada') {
      const { slug, atendimentoId, codigoCliente, descricaoProblema, indicacoes, tipoOS, grupoServico, tecnicoId } = req.data

      if (!descricaoProblema?.trim()) throw new HttpsError('invalid-argument', 'Descrição do problema é obrigatória.')
      if (!atendimentoId) throw new HttpsError('invalid-argument', 'ID do atendimento é obrigatório.')
      if (!codigoCliente) throw new HttpsError('invalid-argument', 'Código do cliente é obrigatório.')

      const payload = { slug, atendimentoId, codigoCliente, descricaoProblema, tipoOS, grupoServico, tecnicoId }

      if (cfg.shadow) {
        console.log('[MK shadow] criar_os_vinculada payload:', JSON.stringify(payload))
        await salvarLog({ uid, slug, shadow: true, payload })
        return { shadow: true }
      }

      const mkLogin = await mkLoginByUid(uid)

      let osNumero: number
      try {
        // Sessão A: só para buscar conexão (chamada intermediária contamina o contexto MK)
        let conexao: number | undefined
        try {
          const sessionLookup = await mkAuth(cfg)
          conexao = await mkBuscarConexaoCliente(cfg, sessionLookup, codigoCliente)
        } catch {
          console.warn('[MK] criar_os_vinculada: conexão do cliente não encontrada — OS sem CodigoConexao')
        }

        // Sessão B: limpa, só para criar OS (contexto puro → operador atribuído corretamente pelo MK)
        const session = await mkAuth(cfg)
        osNumero = await mkCriarOS(cfg, session, {
          token: session.token,
          CodigoCliente: codigoCliente,
          DescricaoProblema: descricaoProblema,
          Indicacoes: indicacoes,
          CodigoTipoOS: tipoOS,
          CodigoGrupoServico: grupoServico,
          CodigoTecnico: tecnicoId,
          CodigoConexao: conexao,
          CodigoAtendimento: atendimentoId,
          categoria: 1,
        })

        if (mkLogin) {
          try {
            await mkInserirComentario(cfg, session, atendimentoId, `Uma nova O.S foi gerada por ${mkLogin}`, mkLogin, 2)
          } catch {
            console.warn('[MK] criar_os_vinculada: falha ao inserir comentário de identificação — OS criada com sucesso')
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        await salvarLog({ uid, slug, shadow: false, payload, erro: msg })
        throw new HttpsError('internal', `Falha ao criar O.S.: ${msg}`)
      }

      await salvarLog({ uid, slug, shadow: false, payload, resultado: { atendimentoId, osNumero } })
      return { shadow: false, atendimentoId, osNumero }
    }

    throw new HttpsError('invalid-argument', `Ação desconhecida: ${String(action)}`)
  },
)
