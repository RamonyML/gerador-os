/**
 * Migração one-time: popula o campo `mkLogin` nos documentos users/{uid}
 * existentes no Firestore com base no mapeamento UID → login MK.
 *
 * Uso:
 *   node scripts/migrate-mk-login.js <caminho-para-serviceAccountKey.json>
 *
 * Como obter a service account key:
 *   Firebase Console → Configurações do projeto → Contas de serviço
 *   → "Gerar nova chave privada" → salvar o JSON e passar o caminho aqui.
 *   Após rodar o script, pode apagar o arquivo de chave.
 */

const path = require('path')
const admin = require(path.join(__dirname, '../functions/node_modules/firebase-admin'))

const keyPath = process.argv[2]
if (!keyPath) {
  console.error('Uso: node scripts/migrate-mk-login.js <serviceAccountKey.json>')
  process.exit(1)
}

const serviceAccount = require(path.resolve(keyPath))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

const MK_USER_MAP = {
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

async function run() {
  const entries = Object.entries(MK_USER_MAP)
  console.log(`Migrando ${entries.length} usuários...\n`)

  let ok = 0
  let skip = 0
  let fail = 0

  for (const [uid, mkLogin] of entries) {
    try {
      const ref = db.doc(`users/${uid}`)
      const snap = await ref.get()
      if (!snap.exists) {
        console.log(`  SKIP  ${mkLogin} (${uid}) — documento não existe`)
        skip++
        continue
      }
      await ref.update({ mkLogin })
      console.log(`  OK    ${mkLogin} (${uid})`)
      ok++
    } catch (e) {
      console.error(`  ERRO  ${mkLogin} (${uid}): ${e.message}`)
      fail++
    }
  }

  console.log(`\nConcluído: ${ok} atualizados, ${skip} ignorados, ${fail} erros.`)
  process.exit(fail > 0 ? 1 : 0)
}

run().catch((e) => {
  console.error('Erro fatal:', e)
  process.exit(1)
})
