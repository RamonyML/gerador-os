import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import pkg from 'xlsx'

const XLSX = pkg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const file = path.resolve(__dirname, '../../MZ_CONDOMINIOS.xlsx')
const outDir = path.resolve(__dirname, '../public/data')
const outFile = path.join(outDir, 'condominios-seed.json')

const buf = readFileSync(file)
const wb = XLSX.read(buf, { type: 'buffer' })

const clean = (v) => String(v ?? '').replace(/\u0000/g, '').trim()

/** Converte serial do Excel (dias desde 1899-12-30) em dd/MM/yyyy. */
function excelToDateStr(v) {
  if (typeof v !== 'number' || !isFinite(v) || v <= 0) return clean(v)
  const ms = Math.round((v - 25569) * 86400 * 1000)
  const d = new Date(ms)
  if (isNaN(d.getTime())) return clean(v)
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const yyyy = d.getUTCFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function rowsOf(sheetName) {
  const ws = wb.Sheets[sheetName]
  if (!ws) return []
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false })
}

const records = []

// --- VIÁVEIS: CONDOMÍNIOS ---
// Colunas: NOME, RUA, NUMERO, CEP, BAIRRO, Obs., Sindico, VISTORIADOR
{
  const rows = rowsOf('CONDOMÍNIOS').slice(1)
  for (const r of rows) {
    const nome = clean(r[0])
    if (!nome) continue
    records.push({
      categoria: 'viavel',
      nome,
      rua: clean(r[1]),
      numero: clean(r[2]),
      cep: clean(r[3]),
      bairro: clean(r[4]),
      obs: clean(r[5]),
      sindico: clean(r[6]),
      vistoriador: clean(r[7]),
      dataTentativa: '',
      novaVistoria: '',
      tecnicoResponsavel: '',
    })
  }
}

// --- INVIÁVEIS: INVIABILIDADE (COND) ---
// Colunas: Nome, RUA, NUMERO, CEP, Bairro, Data Tentativa, OBS, NOVA VISTORIA, TECNICO RESPONSAVEL
{
  const rows = rowsOf('INVIABILIDADE (COND) ').slice(1)
  for (const r of rows) {
    const nome = clean(r[0])
    if (!nome) continue
    records.push({
      categoria: 'inviavel',
      nome,
      rua: clean(r[1]),
      numero: clean(r[2]),
      cep: clean(r[3]),
      bairro: clean(r[4]),
      obs: clean(r[6]),
      sindico: '',
      vistoriador: '',
      dataTentativa: excelToDateStr(r[5]),
      novaVistoria: excelToDateStr(r[7]),
      tecnicoResponsavel: clean(r[8]),
    })
  }
}

mkdirSync(outDir, { recursive: true })
writeFileSync(outFile, JSON.stringify(records, null, 0), 'utf8')

const viaveis = records.filter((r) => r.categoria === 'viavel').length
const inviaveis = records.filter((r) => r.categoria === 'inviavel').length
console.log(`OK -> ${outFile}`)
console.log(`Total: ${records.length}  (viáveis: ${viaveis}, inviáveis: ${inviaveis})`)
