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

async function mkGet<T>(baseUrl: string, path: string, params: Record<string, string | number>): Promise<T> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString()
  const url = `${baseUrl}${path}?${qs}`
  console.log(`[MK] GET ${path}`, Object.fromEntries(Object.entries(params).filter(([k]) => k !== 'token' && k !== 'password')))
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(`[MK] ERRO ${res.status} em ${path}:`, body.slice(0, 2000))
    throw new Error(`MK GET ${path} → HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ---- Operações MK ----

async function mkAuth(cfg: MkConfig): Promise<string> {
  const data = await mkGet<MkAuthResponse>(cfg.baseUrl, '/mk/WSAutenticacao.rule', {
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
  return token
}

async function mkBuscarClientePorCpf(cfg: MkConfig, sessionToken: string, cpf: string): Promise<MkCliente> {
  const data = await mkGet<MkConsultaDocResponse>(cfg.baseUrl, '/mk/WSMKConsultaDoc.rule', {
    sys: 'MK0',
    token: sessionToken,
    doc: cpf.replace(/\D/g, ''),
  })
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

async function mkListarConexoes(cfg: MkConfig, sessionToken: string, codigoCliente: number): Promise<MkConexaoItem[]> {
  const data = await mkGet<MkConexoesResponse>(cfg.baseUrl, '/mk/WSMKConexoesPorCliente.rule', {
    sys: 'MK0',
    token: sessionToken,
    cd_cliente: codigoCliente,
  })
  const lista: MkConexaoItem[] = Array.isArray(data)
    ? data
    : ((data as { conexoes?: MkConexaoItem[]; Conexoes?: MkConexaoItem[] }).conexoes
        ?? (data as { Conexoes?: MkConexaoItem[] }).Conexoes
        ?? [])
  return lista
}

async function mkBuscarConexaoCliente(cfg: MkConfig, sessionToken: string, codigoCliente: number): Promise<number> {
  const lista = await mkListarConexoes(cfg, sessionToken, codigoCliente)
  if (lista.length === 0) throw new Error(`Nenhuma conexão encontrada para o cliente ${codigoCliente}`)
  const conexao = lista[0]
  const codigo = conexao.CodigoConexao ?? conexao.Codigo ?? conexao.codconexao
  if (!codigo) throw new Error(`CodigoConexao ausente na resposta: ${JSON.stringify(conexao)}`)
  return codigo
}

async function mkCriarAtendimento(cfg: MkConfig, payload: MkAtendimentoPayload): Promise<{ id: number; protocolo: string }> {
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

  const data = await mkGet<MkAtendimentoResponse>(cfg.baseUrl, '/mk/WSMKNovoAtendimento.rule', params)
  const id = data.CodigoAtendimento ?? data.cd_atendimento ?? data.codigo ?? data.id
  if (!id) throw new Error(`MK não retornou ID do atendimento: ${data.Mensagem ?? data.mensagem ?? JSON.stringify(data)}`)
  return { id, protocolo: data.Protocolo ?? '' }
}

async function mkInserirComentario(
  cfg: MkConfig,
  sessionToken: string,
  atendimentoId: number,
  comentario: string,
  mkLogin?: string,
): Promise<void> {
  const params: Record<string, string | number> = {
    sys: 'MK0',
    token: sessionToken,
    cd_atendimento: atendimentoId,
    comentario,
    tipo: 2,
  }
  if (mkLogin) params.user = mkLogin
  await mkGet<Record<string, unknown>>(cfg.baseUrl, '/mk/WSMKAtendimentoComentario.rule', params)
}

async function mkCriarOS(cfg: MkConfig, payload: MkOsPayload): Promise<number> {
  const params: Record<string, string | number> = { sys: 'MK0' }
  for (const [k, v] of Object.entries(payload)) {
    if (v !== undefined && v !== null) params[k] = v as string | number
  }
  const data = await mkGet<MkOsResponse>(cfg.baseUrl, '/mk/WSMKCriarOrdemServico.rule', params)
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
      const sessionToken = await mkAuth(cfg)
      return { shadow: false, sessionToken: sessionToken.slice(0, 8) + '...' }
    }

    // ---- buscar_cliente: auth + busca por CPF ----
    if (action === 'buscar_cliente') {
      const { cpf } = req.data
      if (cfg.shadow) return { shadow: true, raw: { simulado: true, cpf } }
      const sessionToken = await mkAuth(cfg)
      const raw = await mkGet(cfg.baseUrl, '/mk/WSMKConsultaDoc.rule', { sys: 'MK0', token: sessionToken, doc: cpf.replace(/\D/g, '') })
      return { shadow: false, raw }
    }

    // ---- listar_tipos_os ----
    if (action === 'listar_tipos_os') {
      if (cfg.shadow) return { shadow: true, raw: [] }
      const sessionToken = await mkAuth(cfg)
      const raw = await mkGet(cfg.baseUrl, '/mk/WSMKOSListaTiposOS.rule', { sys: 'MK0', token: sessionToken })
      return { shadow: false, raw }
    }

    // ---- listar_grupos ----
    if (action === 'listar_grupos') {
      if (cfg.shadow) return { shadow: true, raw: [] }
      const sessionToken = await mkAuth(cfg)
      const raw = await mkGet(cfg.baseUrl, '/mk/WSMKConsultaEquipes.rule', { sys: 'MK0', token: sessionToken })
      return { shadow: false, raw }
    }

    // ---- listar_processos ----
    if (action === 'listar_processos') {
      if (cfg.shadow) return { shadow: true, raw: [] }
      const sessionToken = await mkAuth(cfg)
      const raw = await mkGet(cfg.baseUrl, '/mk/WSMKListaProcessos.rule', { sys: 'MK0', token: sessionToken })
      return { shadow: false, raw }
    }

    // ---- listar_classificacoes ----
    if (action === 'listar_classificacoes') {
      if (cfg.shadow) return { shadow: true, raw: [] }
      const sessionToken = await mkAuth(cfg)
      const params: Record<string, string | number> = { sys: 'MK0', token: sessionToken }
      if (req.data.processoId) params.cd_processo = req.data.processoId
      const raw = await mkGet(cfg.baseUrl, '/mk/WSMKListaClassificacoesAte.rule', params)
      return { shadow: false, raw }
    }

    // ---- buscar_conexao: auth → cliente → lista de conexões ativas ----
    if (action === 'buscar_conexao') {
      const { cpf } = req.data
      if (!cpf?.trim()) throw new HttpsError('invalid-argument', 'CPF é obrigatório.')
      if (cfg.shadow) return { shadow: true, conexoes: [], raw: { simulado: true, cpf } }
      const sessionToken = await mkAuth(cfg)
      const cliente = await mkBuscarClientePorCpf(cfg, sessionToken, cpf)
      const lista = await mkListarConexoes(cfg, sessionToken, cliente.codigo)
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

      let sessionToken: string
      let cliente: MkCliente
      let resultado: { id: number; protocolo: string }
      const mkLogin = mkLoginByUid(uid)

      try {
        sessionToken = await mkAuth(cfg)
        cliente = await mkBuscarClientePorCpf(cfg, sessionToken, cpf)

        let conexao = conexaoAssociada
        if (!conexao) {
          try {
            conexao = await mkBuscarConexaoCliente(cfg, sessionToken, cliente.codigo)
          } catch {
            console.warn('[MK] criar_protocolo: não foi possível obter conexão — prosseguindo sem ela')
          }
        }

        resultado = await mkCriarAtendimento(cfg, {
          token: sessionToken,
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
            await mkInserirComentario(cfg, sessionToken, resultado.id, bloco.trim(), mkLogin)
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
        sessionToken,
      }
    }

    // ---- inserir_comentario: auth própria → insere comentário no atendimento ----
    if (action === 'inserir_comentario') {
      const { atendimentoId, comentario } = req.data
      if (!comentario?.trim()) throw new HttpsError('invalid-argument', '"comentario" é obrigatório.')
      if (!atendimentoId) throw new HttpsError('invalid-argument', '"atendimentoId" é obrigatório.')

      if (cfg.shadow) {
        console.log('[MK shadow] inserir_comentario:', JSON.stringify({ atendimentoId, comentario }))
        return { shadow: true }
      }

      try {
        const sessionToken = await mkAuth(cfg)
        await mkInserirComentario(cfg, sessionToken, atendimentoId, comentario.trim(), mkLoginByUid(uid))
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

      let sessionToken: string
      let cliente: MkCliente
      let atendimento: { id: number; protocolo: string }
      let osNumero: number

      try {
        sessionToken = await mkAuth(cfg)
        cliente = await mkBuscarClientePorCpf(cfg, sessionToken, cpf)

        let conexao = conexaoFornecida
        if (!conexao) {
          try {
            conexao = await mkBuscarConexaoCliente(cfg, sessionToken, cliente.codigo)
          } catch {
            console.warn('[MK] criar_os: não foi possível obter conexão — prosseguindo sem ela')
          }
        }

        atendimento = await mkCriarAtendimento(cfg, {
          token: sessionToken,
          cd_cliente: cliente.codigo,
          cd_processo: processoId,
          cd_classificacao_ate: classificacaoId,
          origem_contato: 9,
          info: descricaoProblema,
          conexao_associada: conexao,
        })
        osNumero = await mkCriarOS(cfg, {
          token: sessionToken,
          CodigoCliente: cliente.codigo,
          DescricaoProblema: descricaoProblema,
          CodigoTipoOS: tipoOS,
          CodigoGrupoServico: grupoServico,
          CodigoTecnico: tecnicoId,
          CodigoAtendimento: atendimento.id,
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
