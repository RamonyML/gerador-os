import { describe, it, expect } from 'vitest'
import pfHtml from '../../../../legado-exemplo/suporte/lentidao/index-lentidao.html?raw'
import pjHtml from '../../../../legado-exemplo/suporte/lentidao/index-lentidao-pj.html?raw'
import isentoPfHtml from '../../../../legado-exemplo/suporte/lentidao/isento/index-lentidao.html?raw'
import isentoPjHtml from '../../../../legado-exemplo/suporte/lentidao/isento/index-lentidao-pj.html?raw'
import dispPfHtml from '../../../../legado-exemplo/suporte/lentidao/disp-remoto/index-lentidao-disp.html?raw'
import dispPjHtml from '../../../../legado-exemplo/suporte/lentidao/disp-remoto/index-lentidao-disp-pj.html?raw'
import {
  VISITA_TESTES_OUTPUT,
  buildVisitaTestesTextos,
  T_PF,
  T_PJ,
  T_ISENTO_PF,
  T_ISENTO_PJ,
  T_DISP_PF,
  T_DISP_PJ,
} from './visitaTestes'
import { renderTemplate } from '../../lib/renderTemplate'

/**
 * Paridade com legado-exemplo/suporte/lentidao/ — o teste extrai e EXECUTA
 * a propria funcao gerarTextos() de cada HTML legado e compara com o builder.
 */

type Inputs = Record<string, string>

function runLegacy(html: string, inputs: Inputs) {
  const marker = "getElementById('textoAgenda').value = textoAgenda;"
  const endPos = html.indexOf(marker)
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
  const run = new Function('document', `${fnSrc}\n}\n gerarTextos();`)
  run(doc)
  return {
    textoOS: store.textoOS,
    textoAgenda: store.textoAgenda,
  }
}

const BASE: Inputs = {
  cliente: 'JOAO DA SILVA SAURO',
  solicitante: 'MARIA DAS DORES SOUZA',
  cargo: 'GERENTE',
  canal: 'WHATSAPP',
  contato: '1133334444',
  sinalONU: '-19.20 DBM',
  oscila: 'SEM OSCILACAO',
  repetidor: ' CLIENTE NAO POSSUI REPETIDOR DE SINAL.',
  disp1: '8',
  disp2: '6',
  disp3: '2',
  bairro: 'CENTRO',
  gestor: 'DEIVIT',
  dataVisita: '20/06/2026',
  horaVisita: '08:30',
  protocolo: '123.456',
  formaPag: 'PIX',
  operador: 'FULANO',
}

const OPERADOR = 'FULANO'

const CASES: Array<{ file: string; html: string; tipo: string }> = [
  { file: 'index-lentidao.html', html: pfHtml, tipo: T_PF },
  { file: 'index-lentidao-pj.html', html: pjHtml, tipo: T_PJ },
  { file: 'isento/index-lentidao.html', html: isentoPfHtml, tipo: T_ISENTO_PF },
  { file: 'isento/index-lentidao-pj.html', html: isentoPjHtml, tipo: T_ISENTO_PJ },
  { file: 'disp-remoto/index-lentidao-disp.html', html: dispPfHtml, tipo: T_DISP_PF },
  { file: 'disp-remoto/index-lentidao-disp-pj.html', html: dispPjHtml, tipo: T_DISP_PJ },
]

describe('visita de testes (lentidao) — paridade com legado', () => {
  for (const { file, html, tipo } of CASES) {
    it(file, () => {
      const legacy = runLegacy(html, BASE)
      const built = buildVisitaTestesTextos({ ...BASE, tipoSolicitacao: tipo }, OPERADOR)
      expect(built.visitaTestesTextoOS).toBe(legacy.textoOS)
      expect(built.visitaTestesTextoAgenda).toBe(legacy.textoAgenda)
    })
  }

  it('output template renderiza O.S e Agenda', () => {
    const built = buildVisitaTestesTextos({ ...BASE, tipoSolicitacao: T_PF }, OPERADOR)
    const rendered = renderTemplate(VISITA_TESTES_OUTPUT, built)
    expect(rendered).toContain('=== Texto O.S ===')
    expect(rendered).toContain('=== Texto da Agenda ===')
    expect(rendered).toContain('MAN TESTES JOAO DA SILVA SAURO')
  })
})
