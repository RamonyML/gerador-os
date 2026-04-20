/**
 * Percorre legado-exemplo/suporte/ e gera legacy-suporte-inventory.json
 * com metadados para migração → presets Firestore / osTemplatePresets.
 *
 * Uso: node scripts/build-legacy-suporte-inventory.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', 'legado-exemplo', 'suporte')
const OUT_JSON = path.join(__dirname, '..', 'legado-exemplo', 'suporte', 'legacy-suporte-inventory.json')

const DASHBOARD_PATTERN = /^dash-|dashboard|^dashman|^dash-man|^dashboard\s/i

/** Pastas ou padrões de nome que não são geradores de O.S completos */
const SKIP_PATH_PARTS = [
  '\\download\\',
  '\\modelos\\modelos-manutenção\\',
  '\\olt\\',
  '\\teste-ceps\\',
]

/** Sugestão de demandCategory (web/src/data/supportDemands.ts) por segmento do caminho */
function guessDemandCategory(relPath) {
  const lower = relPath.replace(/\\/g, '/').toLowerCase()
  if (lower.includes('altplan')) return 'alteracao-plano'
  if (lower.includes('mud-end')) return 'mudanca-endereco'
  if (lower.includes('mud-ponto-int')) return 'manutencao'
  if (lower.includes('wi-fi extend') || lower.includes('wifi extend'))
    return 'wifi-extend'
  if (lower.includes('/feedback/') || lower.startsWith('feedback/'))
    return 'feedback'
  if (
    lower.includes('compra-stb') ||
    lower.includes('compra-roku') ||
    lower.includes('ittv-upgrades')
  )
    return 'midia-tv'
  if (lower.includes('pesquisa-cep')) return 'pesquisa-endereco'
  if (lower.includes('termo-resp')) return 'termo-docs'
  if (
    lower.includes('luz-vermelha') ||
    lower.includes('lentidao') ||
    lower.includes('sinal-alto') ||
    lower.includes('equip-queimado') ||
    lower.includes('realoc-fibra') ||
    lower.includes('roteador-reset') ||
    lower.includes('instrutiva') ||
    lower.includes('monitoramento')
  )
    return 'manutencao'
  if (lower.includes('altera-senha')) return 'senha-rede'
  if (lower.includes('encerramentos')) return 'termo-docs'
  if (lower.includes('separadores')) return 'geral'
  if (lower.includes('validacao')) return 'geral'
  if (lower.includes('direc-portas')) return 'geral'
  return 'geral'
}

function slugSuggestion(relPath) {
  const noExt = relPath.replace(/\.html$/i, '')
  const parts = noExt.split(path.sep).filter(Boolean)
  const tail = parts.slice(-3).join('-')
  return (
    'legacy-' +
    tail
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80)
  )
}

function walkHtml(dir, baseRel, out) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of entries) {
    const full = path.join(dir, e.name)
    const rel = path.join(baseRel, e.name)
    if (e.isDirectory()) {
      walkHtml(full, rel, out)
      continue
    }
    if (!e.name.toLowerCase().endsWith('.html')) continue
    if (DASHBOARD_PATTERN.test(e.name)) continue
    if (SKIP_PATH_PARTS.some((p) => full.includes(p))) continue

    let raw = ''
    try {
      raw = fs.readFileSync(full, 'utf8')
    } catch {
      continue
    }

    const hasGerarTextos = /\bgerarTextos\s*\(/.test(raw)
    const hasGerarAlt =
      /\bfunction\s+gerar/i.test(raw) && !/gerarTextos/.test(raw)
    const hasTemplateLiteralProtocol =
      /textoProtocolo|textoOS|`[\s\S]{30,}`/.test(raw)

    const likelyGenerator =
      hasGerarTextos ||
      (hasGerarAlt && hasTemplateLiteralProtocol) ||
      (/document\.getElementById\(['"]textoProtocolo['"]/.test(raw) &&
        raw.length > 800)

    out.push({
      path: rel.replace(/\\/g, '/'),
      basename: e.name,
      slugSuggestion: slugSuggestion(rel),
      demandCategoryGuess: guessDemandCategory(rel),
      flags: {
        gerarTextos: hasGerarTextos,
        likelyOsGenerator: likelyGenerator,
      },
      sizeBytes: Buffer.byteLength(raw, 'utf8'),
    })
  }
}

const items = []
walkHtml(ROOT, '', items)

items.sort((a, b) => a.path.localeCompare(b.path))

const generators = items.filter((x) => x.flags.likelyOsGenerator)
const unclear = items.filter((x) => !x.flags.likelyOsGenerator)

const summary = {
  generatedAt: new Date().toISOString(),
  root: 'legado-exemplo/suporte',
  totalHtml: items.length,
  likelyOsGenerators: generators.length,
  otherHtml: unclear.length,
  byDemandGuess: {},
}

for (const g of generators) {
  const d = g.demandCategoryGuess
  summary.byDemandGuess[d] = (summary.byDemandGuess[d] ?? 0) + 1
}

fs.writeFileSync(
  OUT_JSON,
  JSON.stringify({ summary, items, generatorsOnly: generators }, null, 2),
  'utf8',
)

console.log('Escrito:', OUT_JSON)
console.log(JSON.stringify(summary, null, 2))
