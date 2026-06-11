import { httpsCallable } from 'firebase/functions'
import { auth, getFirebaseFunctions } from './firebase'

export type ManagedUserRow = {
  uid: string
  email: string | null
  emailVerified: boolean
  displayName: string | null
  disabled: boolean
  sector: string | null
  hierarchy: string | null
  profileActive: boolean | null
  isDev: boolean
  isAdmin: boolean
  isTi: boolean
  profileMissing: boolean
}

export type ManageUsersListResponse = {
  users: ManagedUserRow[]
  nextPageToken: string | null
}

function functions() {
  return getFirebaseFunctions()
}

/**
 * Chamadas para `*.cloudfunctions.net` a partir do Hosting são **origem cruzada**
 * e podem falhar no preflight (CORS) se o Cloud Run não responder certo ao OPTIONS.
 * Solução: mesmo host do app (`/__fbfunctions` no Vite, `/fbfunctions` no Hosting)
 * + POST com `Authorization: Bearer` — sem CORS no browser.
 */
function sameOriginCallableBase(): string | null {
  if (typeof window === 'undefined') return null

  if (import.meta.env.DEV) {
    return `${window.location.origin}/__fbfunctions`
  }

  const host = window.location.hostname
  const onFirebaseHosting =
    host.endsWith('.web.app') ||
    host.endsWith('.firebaseapp.com') ||
    import.meta.env.VITE_FUNCTIONS_USE_HOSTING_PROXY === '1'

  if (onFirebaseHosting) {
    return `${window.location.origin}/fbfunctions`
  }

  return null
}

/** Protocolo HTTP das callables: POST JSON `{ data }` + `Authorization: Bearer <idToken>`. */
async function invokeCallable<T>(name: string, data: unknown): Promise<T> {
  const base = sameOriginCallableBase()

  if (base === null) {
    const fn = httpsCallable(functions(), name)
    const res = await fn(data)
    return res.data as T
  }

  const user = auth.currentUser
  if (!user) {
    throw Object.assign(new Error('Faça login para usar esta função.'), {
      code: 'functions/unauthenticated',
    })
  }

  const token = await user.getIdToken()
  const url = `${base}/${name}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  })

  let payload: unknown = null
  try {
    const text = await response.text()
    payload = text ? JSON.parse(text) : null
  } catch {
    payload = null
  }

  const body = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null

  if (body?.error != null && typeof body.error === 'object') {
    const e = body.error as { message?: string; status?: string }
    const msg =
      typeof e.message === 'string'
        ? e.message
        : typeof e.status === 'string'
          ? e.status
          : 'Erro na Cloud Function.'
    throw Object.assign(new Error(msg), {
      code: `functions/${String(e.status ?? 'unknown').toLowerCase().replace(/_/g, '-')}`,
    })
  }

  if (!response.ok) {
    throw Object.assign(new Error(`HTTP ${response.status}`), {
      code: `functions/http-${response.status}`,
    })
  }

  if (body && 'result' in body) {
    return body.result as T
  }

  throw Object.assign(new Error('Resposta inválida da Cloud Function.'), {
    code: 'functions/unknown',
  })
}

export async function manageUsersList(
  pageToken?: string | null,
): Promise<ManageUsersListResponse> {
  return invokeCallable<ManageUsersListResponse>('manageUsersList', {
    pageToken: pageToken ?? undefined,
  })
}

/** E-mail + nome para o mesmo setor do usuário (qualquer perfil ativo). */
export type SectorRosterRow = {
  email: string
  displayName: string | null
}

export type SectorRosterResponse = {
  users: SectorRosterRow[]
  nextPageToken: string | null
}

export async function sectorRoster(payload?: {
  sector?: string
  pageToken?: string | null
}): Promise<SectorRosterResponse> {
  return invokeCallable<SectorRosterResponse>('sectorRoster', {
    sector: payload?.sector,
    pageToken: payload?.pageToken ?? undefined,
  })
}

/** Todas as páginas do Auth (itera tokens). */
export async function fetchFullSectorRoster(sector?: string): Promise<SectorRosterRow[]> {
  const all: SectorRosterRow[] = []
  let token: string | null | undefined = undefined
  for (;;) {
    const res = await sectorRoster({ sector, pageToken: token ?? null })
    all.push(...res.users)
    token = res.nextPageToken ?? null
    if (!token) break
  }
  return all
}

export async function manageUsersCreate(payload: {
  email: string
  password: string
  displayName: string
  sector: string
  hierarchy: string
  active?: boolean
  isAdmin?: boolean
  isDev?: boolean
  isTi?: boolean
}): Promise<{ uid: string }> {
  return invokeCallable<{ uid: string }>('manageUsersCreate', payload)
}

export async function manageUsersUpdate(payload: {
  uid: string
  email?: string
  password?: string
  displayName?: string
  sector?: string
  hierarchy?: string
  active?: boolean
  isAdmin?: boolean
  isDev?: boolean
  isTi?: boolean
}): Promise<{ ok: boolean }> {
  return invokeCallable<{ ok: boolean }>('manageUsersUpdate', payload)
}

export function callableErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const message = 'message' in err ? String((err as { message?: string }).message ?? '') : ''
    const code = 'code' in err ? String((err as { code?: string }).code ?? '') : ''
    if (/^internal\b/i.test(message) || code.endsWith('/internal')) {
      return (
        'Erro interno no servidor (functions). Veja logs no Firebase Console » Functions.'
      )
    }
    if (message.trim()) return message
    if (code.trim()) return code
  }
  return (
    'Erro ao comunicar com o servidor. Faça deploy com `firebase.json` contendo rewrites `/fbfunctions/*` para as três functions. ' +
    'Se ainda falhar, no Google Cloud » Cloud Run (southamerica-east1) permita invocação pública nos serviços das functions.'
  )
}
