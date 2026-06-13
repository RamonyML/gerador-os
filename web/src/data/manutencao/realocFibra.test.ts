import { describe, it, expect } from 'vitest'
import padraoHtml from '../../../../legado-exemplo/suporte/realoc-fibra/realoc-fibra.html?raw'
import pjHtml from '../../../../legado-exemplo/suporte/realoc-fibra/realoc-fibra-pj.html?raw'
import fibra1Html from '../../../../legado-exemplo/suporte/realoc-fibra/realoc-fibra1/realoc-fibra1.html?raw'
import fibra2Html from '../../../../legado-exemplo/suporte/realoc-fibra/realoc-fibra2/realoc-fibra2.html?raw'
import fibra3Html from '../../../../legado-exemplo/suporte/realoc-fibra/realoc-fibra3/realoc-fibra3.html?raw'
import {
  REALOC_FIBRA_OUTPUT,
  buildRealocFibraTextos,
  T_PJ,
} from './realocFibra'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'
import { renderTemplate } from '../../lib/renderTemplate'

/**
 * Paridade com legado-exemplo/suporte/realoc-fibra/ — o teste extrai e EXECUTA
 * a própria função gerarTextos() de cada HTML legado e compara com o builder.
 */

type Inputs = Record<string, string>

function runLegacy(html: string, inputs: Inputs, operador: string) {
  const marker = "getElementById('textoAgenda').value = textoAgenda;"
  const endPos = html.indexOf(marker)
  // Há uma gerarTextos() duplicada (stub) antes da real; pegamos a última.
  const start = html.lastIndexOf('function gerarTextos()', endPos)
  const fnSrc = html.slice(start, endPos + marker.length)
  const store: Record<string, string> = {}
  const doc = {
    getElementById: (id: string) => ({
      get value() {
        return inputs[id] ?? ''
      },
      set value(x: string) {
        store[id] = x
      },
      checked: false,
    }),
    querySelector: () => ({ value: '' }),
  }
  const win = { nomeOperadorAtual: operador }
  const run = new Function('document', 'window', `${fnSrc}\n}\n gerarTextos();`)
  run(doc, win)
  return {
    textoProtocolo: store.textoProtocolo,
    textoOS: store.textoOS,
    textoAgenda: store.textoAgenda,
  }
}

const BASE: Inputs = {
  cliente: 'JOÃO DA SILVA SAURO',
  canal: 'WHATSAPP',
  contato: '1133334444',
  contatoSol: '1199998888',
  sinalONU: '-19.20 DBM',
  bairro: 'CENTRO',
  motivo: 'REALIZOU REFORMA EM SUA SALA E PRECISA REALOCAR O DROP INTERNO',
  valor:
    'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR DROP NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) OU CASO NÃO SEJA POSSÍVEL REAPROVEITÁ-LO SENDO NECESSÁRIO FAZER EMENDA TÉCNICA, O VALOR É DE R$ 50,00 REFERENTE A MÃO DE OBRA TÉCNICA.',
  dataVisita: '20/06/2026',
  horaVisita: '08:30',
  protocolo: '123.456',
  formaPag: 'PIX',
  operador: 'FULANO',
  // terceiros / pj
  solicitante: 'MARIA DAS DORES SOUZA',
  autorizado: 'MARIA DAS DORES SOUZA',
  parente: 'ESPOSA',
  cargo: 'GERENTE',
}

const OPERADOR = 'FULANO'

const CASES: Array<{ file: string; html: string; tipo: string }> = [
  { file: 'realoc-fibra.html', html: padraoHtml, tipo: T_TITULAR },
  { file: 'realoc-fibra-pj.html', html: pjHtml, tipo: T_PJ },
  { file: 'realoc-fibra1.html', html: fibra1Html, tipo: T_TITULAR_TERCEIRO },
  { file: 'realoc-fibra2.html', html: fibra2Html, tipo: T_TERCEIRO_TERCEIRO },
  { file: 'realoc-fibra3.html', html: fibra3Html, tipo: T_TERCEIRO_TITULAR },
]

describe('remanejamento de fibra — paridade com legado', () => {
  for (const { file, html, tipo } of CASES) {
    it(file, () => {
      const legacy = runLegacy(html, BASE, OPERADOR)
      const built = buildRealocFibraTextos({ ...BASE, tipoSolicitacao: tipo }, OPERADOR)
      expect(built.realocFibraTextoProtocolo).toBe(legacy.textoProtocolo)
      expect(built.realocFibraTextoOS).toBe(legacy.textoOS)
      expect(built.realocFibraTextoAgenda).toBe(legacy.textoAgenda)
    })
  }

  it('output template renderiza as três abas', () => {
    const built = buildRealocFibraTextos({ ...BASE, tipoSolicitacao: T_TITULAR }, OPERADOR)
    const rendered = renderTemplate(REALOC_FIBRA_OUTPUT, built)
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('=== Texto O.S ===')
    expect(rendered).toContain('=== Texto da Agenda ===')
    expect(rendered).toContain('MAN REMANEJAMENTO DE FIBRA JOÃO DA SILVA SAURO')
  })
})
