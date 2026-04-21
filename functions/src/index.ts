import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getAuth, type UserRecord } from 'firebase-admin/auth'
import { setGlobalOptions } from 'firebase-functions/v2/options'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

initializeApp()

const REGION = 'southamerica-east1'

/**
 * Gen 2 roda no Cloud Run. Sem `invoker: public`, o preflight OPTIONS chega
 * sem JWT e recebe 403 — o browser mostra isso como “CORS”.
 * `setGlobalOptions` costuma aplicar IAM `allUsers` como invoker com mais
 * consistência que só passar `invoker` em cada `onCall`.
 */
setGlobalOptions({
  region: REGION,
  invoker: 'public',
})

/**
 * Origens permitidas no preflight (localhost + Firebase Hosting).
 */
const CALLABLE_HTTP_OPTS = {
  cors: [
    /^http:\/\/localhost(?::\d+)?$/,
    /^http:\/\/127\.0\.0\.1(?::\d+)?$/,
    /^https:\/\/[\w.-]+\.web\.app$/,
    /^https:\/\/[\w.-]+\.firebaseapp\.com$/,
  ],
}

const VALID_SECTORS = new Set([
  'suporte',
  'instalacao',
  'financeiro',
  'comercial',
  'cadastro',
])

const VALID_HIERARCHIES = new Set(['gerente', 'supervisor', 'operador'])

type ActorProfile = {
  sector: string
  hierarchy: string
  active: boolean
  isDev?: boolean
  isAdmin?: boolean
}

function parseSectorHierarchy(data: Record<string, unknown>): {
  sector?: string
  hierarchy?: string
} {
  const sector = typeof data.sector === 'string' ? data.sector : undefined
  const hierarchy =
    typeof data.hierarchy === 'string' ? data.hierarchy : undefined
  return { sector, hierarchy }
}

async function loadActorProfile(uid: string): Promise<ActorProfile | null> {
  const snap = await getFirestore().doc(`users/${uid}`).get()
  if (!snap.exists) return null
  const d = snap.data()!
  const { sector, hierarchy } = parseSectorHierarchy(d)
  if (!sector || !hierarchy) return null
  return {
    sector,
    hierarchy,
    active: d.active !== false,
    isDev: d.isDev === true,
    isAdmin: d.isAdmin === true,
  }
}

function canOpenUserManagement(actor: ActorProfile): boolean {
  if (!actor.active) return false
  if (actor.isDev === true) return true
  if (actor.isAdmin === true) return true
  return actor.hierarchy === 'gerente' || actor.hierarchy === 'supervisor'
}

/** Somente dev pode conceder ou remover o papel dev (acesso total técnico). */
function canAssignDevFlag(actor: ActorProfile): boolean {
  return actor.active === true && actor.isDev === true
}

/** Dev ou administrador podem conceder papel administrativo (sem ser dev). */
function canAssignAdminFlag(actor: ActorProfile): boolean {
  return actor.active === true && (actor.isDev === true || actor.isAdmin === true)
}

/** Gerentes/supervisores só gerem no próprio setor; dev/admin veem todos. */
function assertSectorScope(
  actor: ActorProfile,
  targetSector: string,
): void {
  if (actor.isDev === true || actor.isAdmin === true) return
  if (actor.hierarchy === 'gerente' || actor.hierarchy === 'supervisor') {
    if (actor.sector !== targetSector) {
      throw new HttpsError(
        'permission-denied',
        'Sem permissão para usuários deste setor.',
      )
    }
    return
  }
  throw new HttpsError('permission-denied', 'Sem permissão.')
}

function assertValidSectorHierarchy(sector: string, hierarchy: string): void {
  if (!VALID_SECTORS.has(sector)) {
    throw new HttpsError('invalid-argument', 'Setor inválido.')
  }
  if (!VALID_HIERARCHIES.has(hierarchy)) {
    throw new HttpsError('invalid-argument', 'Hierarquia inválida.')
  }
}

/** Mesma prioridade razoável que `manageUsersList`: Auth, depois Firestore (`displayName`, `nome`, `name`). */
function resolveOperatorDisplayName(
  u: UserRecord,
  prof: Record<string, unknown> | null | undefined,
): string | null {
  const authName =
    typeof u.displayName === 'string' ? u.displayName.trim() : ''
  if (authName) return authName

  if (!prof) return null

  const pick = (v: unknown): string | null => {
    if (typeof v !== 'string') return null
    const t = v.trim()
    return t.length > 0 ? t : null
  }

  return (
    pick(prof.displayName) ??
    pick(prof.nome) ??
    pick(prof.name) ??
    null
  )
}

export const manageUsersList = onCall(CALLABLE_HTTP_OPTS, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Faça login.')
  }
  const actor = await loadActorProfile(request.auth.uid)
  if (!actor || !canOpenUserManagement(actor)) {
    throw new HttpsError('permission-denied', 'Sem permissão para esta ação.')
  }

  const maxPerPage = 500
  let pageToken: string | undefined =
    typeof request.data?.pageToken === 'string'
      ? request.data.pageToken
      : undefined

  const list = await getAuth().listUsers(maxPerPage, pageToken)
  const db = getFirestore()
  const out: Array<Record<string, unknown>> = []

  for (const u of list.users) {
    const profSnap = await db.doc(`users/${u.uid}`).get()
    const prof = profSnap.exists ? profSnap.data()! : null
    const sector =
      prof && typeof prof.sector === 'string' ? prof.sector : undefined
    const hierarchy =
      prof && typeof prof.hierarchy === 'string' ? prof.hierarchy : undefined

    const canSee =
      actor.isDev === true ||
      actor.isAdmin === true ||
      (sector != null &&
        actor.hierarchy !== undefined &&
        (actor.hierarchy === 'gerente' || actor.hierarchy === 'supervisor') &&
        sector === actor.sector) ||
      u.uid === request.auth.uid

    if (!canSee) continue

    const profileMissing = !prof || !sector || !hierarchy

    out.push({
      uid: u.uid,
      email: u.email ?? null,
      emailVerified: u.emailVerified,
      displayName: u.displayName ?? (prof?.displayName as string | undefined) ?? null,
      disabled: u.disabled,
      sector: sector ?? null,
      hierarchy: hierarchy ?? null,
      profileActive: prof ? prof.active !== false : null,
      isDev: prof?.isDev === true,
      isAdmin: prof?.isAdmin === true,
      profileMissing,
    })
  }

  return {
    users: out,
    nextPageToken: list.pageToken ?? null,
  }
})

/**
 * Lista e-mail + nome de exibição do **próprio setor** (perfil ativo).
 * Qualquer colaborador autenticado pode chamar — p.ex. escala exibindo nomes
 * sem depender de `manageUsersList` (só gestores).
 * Dev/admin podem informar `sector` para consultar outro setor.
 */
export const sectorRoster = onCall(CALLABLE_HTTP_OPTS, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Faça login.')
  }
  const actor = await loadActorProfile(request.auth.uid)
  if (!actor || !actor.active) {
    throw new HttpsError('permission-denied', 'Sem permissão.')
  }

  let targetSector = actor.sector
  const sectorArg =
    typeof request.data?.sector === 'string'
      ? String(request.data.sector).trim()
      : ''
  if (sectorArg) {
    if (actor.isDev !== true && actor.isAdmin !== true) {
      throw new HttpsError(
        'permission-denied',
        'Somente administrador pode consultar outro setor.',
      )
    }
    if (!VALID_SECTORS.has(sectorArg)) {
      throw new HttpsError('invalid-argument', 'Setor inválido.')
    }
    targetSector = sectorArg
  }

  const maxPerPage = 500
  let pageToken: string | undefined =
    typeof request.data?.pageToken === 'string'
      ? request.data.pageToken
      : undefined

  const list = await getAuth().listUsers(maxPerPage, pageToken)
  const db = getFirestore()

  type Row = { email: string; displayName: string | null }
  const out: Row[] = []

  for (const u of list.users) {
    if (u.disabled) continue
    const profSnap = await db.doc(`users/${u.uid}`).get()
    const prof = profSnap.exists ? profSnap.data()! : null
    const sector =
      prof && typeof prof.sector === 'string' ? prof.sector : undefined
    if (!sector || sector !== targetSector) continue
    if (prof?.active === false) continue

    const emailRaw = u.email
    if (!emailRaw) continue
    const email = emailRaw.trim().toLowerCase()
    const displayName = resolveOperatorDisplayName(u, prof)

    out.push({ email, displayName })
  }

  return {
    users: out,
    nextPageToken: list.pageToken ?? null,
  }
})

export const manageUsersCreate = onCall(CALLABLE_HTTP_OPTS, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Faça login.')
  }
  const actor = await loadActorProfile(request.auth.uid)
  if (!actor || !canOpenUserManagement(actor)) {
    throw new HttpsError('permission-denied', 'Sem permissão para esta ação.')
  }

  const email = String(request.data?.email ?? '').trim().toLowerCase()
  const password = String(request.data?.password ?? '')
  const displayName = String(request.data?.displayName ?? '').trim()
  const sector = String(request.data?.sector ?? '')
  const hierarchy = String(request.data?.hierarchy ?? '')
  const active = request.data?.active !== false
  const wantIsAdmin = request.data?.isAdmin === true
  const wantIsDev = request.data?.isDev === true

  if (!email || !password || password.length < 6) {
    throw new HttpsError(
      'invalid-argument',
      'Informe e-mail e senha (mínimo 6 caracteres).',
    )
  }
  if (!displayName) {
    throw new HttpsError('invalid-argument', 'Informe o nome completo.')
  }
  assertValidSectorHierarchy(sector, hierarchy)
  assertSectorScope(actor, sector)

  if (wantIsAdmin && !canAssignAdminFlag(actor)) {
    throw new HttpsError(
      'permission-denied',
      'Sem permissão para definir administrador.',
    )
  }
  if (wantIsDev && !canAssignDevFlag(actor)) {
    throw new HttpsError('permission-denied', 'Só desenvolvedor pode definir dev.')
  }

  let userRecord
  try {
    userRecord = await getAuth().createUser({
      email,
      password,
      displayName,
      disabled: !active,
    })
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code?: string }).code)
        : ''
    if (code === 'auth/email-already-exists') {
      throw new HttpsError('already-exists', 'Este e-mail já está cadastrado.')
    }
    throw new HttpsError('internal', 'Falha ao criar usuário no Auth.')
  }

  const profile: Record<string, unknown> = {
    sector,
    hierarchy,
    displayName,
    email,
    active,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  }
  if (wantIsAdmin) profile.isAdmin = true
  if (wantIsDev) profile.isDev = true

  await getFirestore().doc(`users/${userRecord.uid}`).set(profile)

  return { uid: userRecord.uid }
})

export const manageUsersUpdate = onCall(CALLABLE_HTTP_OPTS, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Faça login.')
  }
  const actor = await loadActorProfile(request.auth.uid)
  if (!actor || !canOpenUserManagement(actor)) {
    throw new HttpsError('permission-denied', 'Sem permissão para esta ação.')
  }

  const uid = String(request.data?.uid ?? '').trim()
  if (!uid) {
    throw new HttpsError('invalid-argument', 'Informe o usuário.')
  }

  const db = getFirestore()
  const existingProf = await db.doc(`users/${uid}`).get()
  const existingData = existingProf.exists ? existingProf.data()! : {}
  const prevSector =
    typeof existingData.sector === 'string'
      ? existingData.sector
      : undefined

  const existingUser = await getAuth().getUser(uid)

  const nextSector =
    request.data?.sector !== undefined
      ? String(request.data.sector)
      : prevSector
  const nextHierarchy =
    request.data?.hierarchy !== undefined
      ? String(request.data.hierarchy)
      : typeof existingData.hierarchy === 'string'
        ? existingData.hierarchy
        : ''

  if (!nextSector || !nextHierarchy) {
    throw new HttpsError(
      'failed-precondition',
      'Documento de perfil incompleto; defina setor e hierarquia.',
    )
  }
  assertValidSectorHierarchy(nextSector, nextHierarchy)
  assertSectorScope(actor, nextSector)
  if (prevSector != null && prevSector !== nextSector) {
    assertSectorScope(actor, prevSector)
  }

  const wantIsAdmin =
    request.data?.isAdmin !== undefined
      ? request.data.isAdmin === true
      : existingData.isAdmin === true
  const wantIsDev =
    request.data?.isDev !== undefined
      ? request.data.isDev === true
      : existingData.isDev === true

  if (
    (request.data?.isAdmin === true || request.data?.isAdmin === false) &&
    !canAssignAdminFlag(actor)
  ) {
    throw new HttpsError(
      'permission-denied',
      'Sem permissão para alterar o flag administrador.',
    )
  }
  if (
    (request.data?.isDev === true || request.data?.isDev === false) &&
    !canAssignDevFlag(actor)
  ) {
    throw new HttpsError(
      'permission-denied',
      'Só desenvolvedor pode alterar o flag dev.',
    )
  }

  const emailRaw = request.data?.email
  const email =
    emailRaw !== undefined ? String(emailRaw).trim().toLowerCase() : undefined
  const passwordRaw = request.data?.password
  const password =
    passwordRaw !== undefined && String(passwordRaw).length > 0
      ? String(passwordRaw)
      : undefined
  if (password != null && password.length < 6) {
    throw new HttpsError(
      'invalid-argument',
      'Senha deve ter pelo menos 6 caracteres.',
    )
  }

  const displayName =
    request.data?.displayName !== undefined
      ? String(request.data.displayName).trim()
      : typeof existingData.displayName === 'string'
        ? existingData.displayName
        : existingUser.displayName ?? ''

  const active =
    request.data?.active !== undefined
      ? request.data.active !== false
      : existingData.active !== false

  const authUpdate: {
    email?: string
    password?: string
    displayName?: string
    disabled?: boolean
  } = {
    displayName: displayName || undefined,
    disabled: !active,
  }
  if (email !== undefined) authUpdate.email = email
  if (password !== undefined) authUpdate.password = password

  try {
    await getAuth().updateUser(uid, authUpdate)
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code?: string }).code)
        : ''
    if (code === 'auth/email-already-exists') {
      throw new HttpsError(
        'already-exists',
        'Este e-mail já está em uso por outra conta.',
      )
    }
    throw new HttpsError('internal', 'Falha ao atualizar usuário no Auth.')
  }

  const resolvedEmail =
    email !== undefined ? email : existingUser.email ?? ''

  const profileUpdate: Record<string, unknown> = {
    sector: nextSector,
    hierarchy: nextHierarchy,
    displayName: displayName || FieldValue.delete(),
    email: resolvedEmail,
    active,
    updatedAt: FieldValue.serverTimestamp(),
  }

  if (!existingProf.exists) {
    profileUpdate.createdAt = FieldValue.serverTimestamp()
  }

  if (canAssignAdminFlag(actor)) {
    profileUpdate.isAdmin = wantIsAdmin === true
  }
  if (canAssignDevFlag(actor)) {
    profileUpdate.isDev = wantIsDev === true
  }

  await db.doc(`users/${uid}`).set(profileUpdate, { merge: true })

  return { ok: true }
})
