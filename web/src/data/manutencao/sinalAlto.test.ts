import { describe, it, expect } from 'vitest'
import padraoHtml from '../../../../legado-exemplo/suporte/sinal-alto/index-sinal-padrao.html?raw'
import pjHtml from '../../../../legado-exemplo/suporte/sinal-alto/index-sinal-pj.html?raw'
import sinal1Html from '../../../../legado-exemplo/suporte/sinal-alto/sinal1.html?raw'
import sinal2Html from '../../../../legado-exemplo/suporte/sinal-alto/sinal2.html?raw'
import sinal3Html from '../../../../legado-exemplo/suporte/sinal-alto/sinal3.html?raw'
import {
  SINAL_ALTO_OUTPUT,
  buildSinalAltoTextos,
  T_PJ,
} from './sinalAlto'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'
import { renderTemplate } from '../../lib/renderTemplate'

/**
 * Paridade com legado-exemplo/suporte/sinal-alto/ — o teste extrai e EXECUTA
 * a própria função gerarTextos() de cada HTML legado e compara com o builder.
 * - index-sinal-padrao.html (titular)
 * - index-sinal-pj.html (pessoa jurídica)
 * - sinal1.html (terceiro solicita, titular ausente)
 * - sinal2.html (terceiro solicita, titular presente)
 * - sinal3.html (titular solicita e autoriza terceiro)
 */

type Inputs = Record<string, string>

function runLegacy(html: string, inputs: Inputs, ctoType: 'CTOE' | 'CTOI', operador: string) {
  const marker = "getElementById('textoAgenda').value = textoAgenda;"
  const endPos = html.indexOf(marker)
  // Alguns legados têm uma gerarTextos() duplicada (com bloco flatpickr no meio);
  // a função real é a última antes das atribuições finais.
  const start = html.lastIndexOf('function gerarTextos()', endPos)
  const end = endPos + marker.length
  const fnSrc = html.slice(start, end)
  const store: Record<string, string> = {}
  const doc = {
    getElementById: (id: string) => ({
      get value() {
        return inputs[id] ?? ''
      },
      set value(x: string) {
        store[id] = x
      },
    }),
    querySelector: () => ({ value: ctoType }),
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
  bairro: 'CENTRO',
  sinalONU: '-31.87 DBM',
  sinalONUan: '-17.45 DBM',
  oscila: 'SEM OSCILAÇÃO',
  onu: 'ONU E ROTEADOR',
  cto: '1035-A',
  passante: 'PASSANTE NO POSTE PRÓXIMO AO SOBRADO',
  dataVisita: '20/06/2026',
  horaVisita: '08:30',
  formaPag: 'PIX',
  protocolo: '123.456',
  solicitante: 'MARIA DAS DORES SOUZA',
  parente: 'ESPOSA',
  cargo: 'GERENTE',
}

const OPERADOR = 'FULANO'

const CASES: Array<{ file: string; html: string; tipo: string }> = [
  { file: 'index-sinal-padrao.html', html: padraoHtml, tipo: T_TITULAR },
  { file: 'index-sinal-pj.html', html: pjHtml, tipo: T_PJ },
  { file: 'sinal1.html', html: sinal1Html, tipo: T_TERCEIRO_TERCEIRO },
  { file: 'sinal2.html', html: sinal2Html, tipo: T_TERCEIRO_TITULAR },
  { file: 'sinal3.html', html: sinal3Html, tipo: T_TITULAR_TERCEIRO },
]

describe('sinal alto — paridade com legado', () => {
  for (const { file, html, tipo } of CASES) {
    for (const cto of ['CTOE', 'CTOI'] as const) {
      it(`${file} (${cto})`, () => {
        const legacy = runLegacy(html, BASE, cto, OPERADOR)
        const built = buildSinalAltoTextos(
          { ...BASE, tipoSolicitacao: tipo, ctoType: cto },
          OPERADOR,
        )
        // sinal1/2/3 têm um bug no legado: o operador na agenda é lido de um
        // campo inexistente e cai no default "SEM SINAL". O sistema novo usa
        // corretamente o nome do operador, então normalizamos a comparação.
        const expectedAgenda = legacy.textoAgenda.replace('(SEM SINAL)', `(${OPERADOR})`)
        expect(built.sinalAltoTextoProtocolo).toBe(legacy.textoProtocolo)
        expect(built.sinalAltoTextoOS).toBe(legacy.textoOS)
        expect(built.sinalAltoTextoAgenda).toBe(expectedAgenda)
      })
    }
  }

  it('output template renderiza as três abas', () => {
    const built = buildSinalAltoTextos(
      { ...BASE, tipoSolicitacao: T_TITULAR, ctoType: 'CTOE' },
      OPERADOR,
    )
    const rendered = renderTemplate(SINAL_ALTO_OUTPUT, built)
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('=== Texto O.S ===')
    expect(rendered).toContain('=== Texto da Agenda ===')
    expect(rendered).toContain('MAN SINAL ALTO JOÃO DA SILVA SAURO')
  })
})
