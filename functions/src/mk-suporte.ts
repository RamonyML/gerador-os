import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

// ---- Configuração ----

const MK_BASE_URL = (process.env.MK_BASE_URL ?? '').replace(/\/$/, '')
const MK_TOKEN    = process.env.MK_TOKEN ?? ''
const MK_PASSWORD = process.env.MK_WEBSERVICE_PASSWORD ?? ''
const SHADOW_MODE = process.env.MK_MODE !== 'real'

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

// ---- Cliente HTTP MK ----

async function mkGet<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString()
  const url = `${MK_BASE_URL}${path}?${qs}`
  console.log(`[MK] GET ${path}`, Object.fromEntries(Object.entries(params).filter(([k]) => k !== 'token' && k !== 'password')))
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    // Log completo para depuração — leia o terminal do emulador
    console.error(`[MK] ERRO ${res.status} em ${path}:`, body.slice(0, 2000))
    throw new Error(`MK GET ${path} → HTTP ${res.status} — verifique o terminal do emulador para detalhes`)
  }
  return res.json() as Promise<T>
}

// ---- Operações MK ----

async function mkAuth(): Promise<string> {
  const data = await mkGet<MkAuthResponse>('/mk/WSAutenticacao.rule', {
    sys: 'MK0',
    token: MK_TOKEN,
    password: MK_PASSWORD,
    cd_servico: 9999,
  })
  const token = data.Token ?? data.tokenRetornoAutenticacao
  if (!token || data.status === 'ERRO') {
    throw new Error(`MK auth falhou — status: ${data.status ?? 'sem resposta'}`)
  }
  return token
}

async function mkBuscarClientePorCpf(sessionToken: string, cpf: string): Promise<MkCliente> {
  const data = await mkGet<MkConsultaDocResponse>('/mk/WSMKConsultaDoc.rule', {
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

async function mkCriarAtendimento(payload: MkAtendimentoPayload): Promise<{ id: number; protocolo: string }> {
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

  const data = await mkGet<MkAtendimentoResponse>('/mk/WSMKNovoAtendimento.rule', params)
  const id = data.CodigoAtendimento ?? data.cd_atendimento ?? data.codigo ?? data.id
  if (!id) throw new Error(`MK não retornou ID do atendimento: ${data.Mensagem ?? data.mensagem ?? JSON.stringify(data)}`)
  return { id, protocolo: data.Protocolo ?? '' }
}

async function mkInserirComentario(
  sessionToken: string,
  atendimentoId: number,
  comentario: string,
): Promise<void> {
  await mkGet<Record<string, unknown>>('/mk/WSMKAtendimentoComentario.rule', {
    sys: 'MK0',
    token: sessionToken,
    cd_atendimento: atendimentoId,
    comentario,
    // `tipo` (1=privado, 2=público) requer release >= 64.9 — omitido para compatibilidade
  })
}

async function mkCriarOS(payload: MkOsPayload): Promise<number> {
  const params: Record<string, string | number> = { sys: 'MK0' }
  for (const [k, v] of Object.entries(payload)) {
    if (v !== undefined && v !== null) params[k] = v as string | number
  }
  const data = await mkGet<MkOsResponse>('/mk/WSMKCriarOrdemServico.rule', params)
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
    }
  | {
      action: 'inserir_comentario'
      atendimentoId: number
      comentario: string
      sessionToken: string  // token da mesma sessão que criou o atendimento
    }
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
    }

export type MkSuporteResponse = {
  shadow: boolean
  sessionToken?: string
  clienteCodigo?: number
  clienteNome?: string
  atendimentoId?: number
  protocolo?: string
  osNumero?: number
  // respostas raw para testes
  raw?: unknown
}

// ---- Cloud Function callable ----

export const mkSuporte = onCall<MkSuporteRequest, Promise<MkSuporteResponse>>(
  { cors: true, region: 'southamerica-east1', invoker: 'public' },
  async (req) => {
    const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true'
    const uid = req.auth?.uid ?? (isEmulator ? 'emulator-test' : null)
    if (!uid) throw new HttpsError('unauthenticated', 'Autenticação necessária.')

    const { action } = req.data

    // ---- testar_auth: valida se as credenciais funcionam ----
    if (action === 'testar_auth') {
      if (SHADOW_MODE) {
        console.log('[MK shadow] testar_auth — credenciais não enviadas ao MK')
        return { shadow: true }
      }
      const sessionToken = await mkAuth()
      return { shadow: false, sessionToken: sessionToken.slice(0, 8) + '...' }
    }

    // ---- buscar_cliente: auth + busca por CPF ----
    if (action === 'buscar_cliente') {
      const { cpf } = req.data
      if (SHADOW_MODE) return { shadow: true, raw: { simulado: true, cpf } }
      const sessionToken = await mkAuth()
      const raw = await mkGet('/mk/WSMKConsultaDoc.rule', { sys: 'MK0', token: sessionToken, doc: cpf.replace(/\D/g, '') })
      return { shadow: false, raw }
    }

    // ---- listar_tipos_os ----
    if (action === 'listar_tipos_os') {
      if (SHADOW_MODE) return { shadow: true, raw: [] }
      const sessionToken = await mkAuth()
      const raw = await mkGet('/mk/WSMKOSListaTiposOS.rule', { sys: 'MK0', token: sessionToken })
      return { shadow: false, raw }
    }

    // ---- listar_grupos ----
    if (action === 'listar_grupos') {
      if (SHADOW_MODE) return { shadow: true, raw: [] }
      const sessionToken = await mkAuth()
      const raw = await mkGet('/mk/WSMKConsultaEquipes.rule', { sys: 'MK0', token: sessionToken })
      return { shadow: false, raw }
    }

    // ---- listar_processos ----
    if (action === 'listar_processos') {
      if (SHADOW_MODE) return { shadow: true, raw: [] }
      const sessionToken = await mkAuth()
      const raw = await mkGet('/mk/WSMKListaProcessos.rule', { sys: 'MK0', token: sessionToken })
      return { shadow: false, raw }
    }

    // ---- listar_classificacoes ----
    if (action === 'listar_classificacoes') {
      if (SHADOW_MODE) return { shadow: true, raw: [] }
      const sessionToken = await mkAuth()
      const params: Record<string, string | number> = { sys: 'MK0', token: sessionToken }
      if (req.data.processoId) params.cd_processo = req.data.processoId
      const raw = await mkGet('/mk/WSMKListaClassificacoesAte.rule', params)
      return { shadow: false, raw }
    }

    // ---- criar_protocolo: Padrão B — auth → cliente → atendimento (sem OS) ----
    if (action === 'criar_protocolo') {
      const { slug, cpf, processoId, classificacaoId, info, comentarios, origemContato } = req.data

      if (!info?.trim()) throw new HttpsError('invalid-argument', 'Campo "info" é obrigatório.')
      if (!cpf?.trim()) throw new HttpsError('invalid-argument', 'CPF é obrigatório.')

      const payload = { slug, cpf, processoId, classificacaoId, info, comentarios }

      if (SHADOW_MODE) {
        console.log('[MK shadow] criar_protocolo payload:', JSON.stringify(payload))
        await salvarLog({ uid, slug, cpf, shadow: true, payload })
        return { shadow: true }
      }

      let sessionToken: string
      let cliente: MkCliente
      let resultado: { id: number; protocolo: string }

      try {
        sessionToken = await mkAuth()
        cliente = await mkBuscarClientePorCpf(sessionToken, cpf)
        resultado = await mkCriarAtendimento({
          token: sessionToken,
          cd_cliente: cliente.codigo,
          cd_processo: processoId,
          cd_classificacao_ate: classificacaoId,
          origem_contato: origemContato ?? 9,
          info,
        })
        // Insere cada bloco adicional como comentário público separado
        for (const bloco of comentarios ?? []) {
          if (bloco.trim()) {
            await mkInserirComentario(sessionToken, resultado.id, bloco.trim())
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
        sessionToken,  // reutilizado pelos cards de comentário subsequentes
      }
    }

    // ---- inserir_comentario: adiciona comentário a atendimento já aberto ----
    if (action === 'inserir_comentario') {
      const { atendimentoId, comentario, sessionToken: providedToken } = req.data
      if (!comentario?.trim()) throw new HttpsError('invalid-argument', '"comentario" é obrigatório.')
      if (!atendimentoId) throw new HttpsError('invalid-argument', '"atendimentoId" é obrigatório.')
      if (!providedToken) throw new HttpsError('invalid-argument', '"sessionToken" é obrigatório.')

      if (SHADOW_MODE) {
        console.log('[MK shadow] inserir_comentario:', JSON.stringify({ atendimentoId, comentario }))
        return { shadow: true }
      }

      try {
        // Usa o mesmo token da sessão que criou o atendimento — não re-autentica
        await mkInserirComentario(providedToken, atendimentoId, comentario.trim())
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        throw new HttpsError('internal', `Falha ao inserir comentário: ${msg}`)
      }

      return { shadow: false, atendimentoId }
    }

    // ---- criar_os: fluxo completo auth → cliente → atendimento → OS ----
    if (action === 'criar_os') {
      const { slug, cpf, descricaoProblema, tipoOS, processoId, classificacaoId, grupoServico, tecnicoId } = req.data

      if (!descricaoProblema?.trim()) {
        throw new HttpsError('invalid-argument', 'Descrição do problema é obrigatória.')
      }

      const payload = { slug, cpf, descricaoProblema, tipoOS, processoId, classificacaoId, grupoServico }

      if (SHADOW_MODE) {
        console.log('[MK shadow] criar_os payload:', JSON.stringify(payload))
        await salvarLog({ uid, slug, cpf, shadow: true, payload })
        return { shadow: true }
      }

      let sessionToken: string
      let cliente: MkCliente
      let atendimento: { id: number; protocolo: string }
      let osNumero: number

      try {
        sessionToken = await mkAuth()
        cliente = await mkBuscarClientePorCpf(sessionToken, cpf)
        atendimento = await mkCriarAtendimento({
          token: sessionToken,
          cd_cliente: cliente.codigo,
          cd_processo: processoId,
          cd_classificacao_ate: classificacaoId,
          origem_contato: 9,
          info: descricaoProblema,
        })
        osNumero = await mkCriarOS({
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
