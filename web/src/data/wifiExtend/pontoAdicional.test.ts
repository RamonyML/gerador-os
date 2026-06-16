import { describe, it, expect } from 'vitest'
import pfHtml from '../../../../legado-exemplo/suporte/wi-fi extend/wi-fi-ponto/index-wifi-ext-ponto.html?raw'
import pfTrocaHtml from '../../../../legado-exemplo/suporte/wi-fi extend/wi-fi-ponto/index-wifi-ext-ponto-troca.html?raw'
import pjHtml from '../../../../legado-exemplo/suporte/wi-fi extend/wi-fi-ponto/index-wifi-ext-ponto-pj.html?raw'
import pjTrocaHtml from '../../../../legado-exemplo/suporte/wi-fi extend/wi-fi-ponto/index-wifi-ext-ponto-pj-troca.html?raw'
import { PONTO_ADICIONAL_OUTPUT, buildPontoAdicionalTextos } from './pontoAdicional'
import { renderTemplate } from '../../lib/renderTemplate'

type Inputs = Record<string, string>

function runLegacy(source: string, inputs: Inputs) {
  const marker = "getElementById('textoAgenda').value = textoAgenda;"
  const endPos = source.indexOf(marker)
  const start = source.lastIndexOf('function gerarTextos()', endPos)
  const fnSrc = source.slice(start, endPos + marker.length)
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
    querySelector: () => ({ value: '', checkValidity: () => true, classList: { add() {} } }),
  }
  const run = new Function('document', `${fnSrc}\n}\n gerarTextos();`)
  run(doc)
  return {
    textoOS: store.textoOS,
    textoAgenda: store.textoAgenda,
  }
}

const OPERADOR = 'FULANO'

const COMMON = {
  cliente: 'EMPRESA EXEMPLO LTDA',
  solicitante: 'MARIA DAS GRAÇAS',
  cargo: 'GERENTE',
  canal: 'WHATSAPP',
  contato: '34999887766',
  bairro: 'CENTRO',
  dataVisita: '20/06/2026',
  horaVisita: '08:30',
  protocolo: '123.456',
  parcela: '3x',
  formaPag: 'CARTÃO DE CRÉDITO SEM JUROS',
  operador: OPERADOR,
}

function builderInputs(flags: { segmento: string; troca: string }): Inputs {
  return { ...COMMON, ...flags }
}

function checkParity(html: string, flags: { segmento: string; troca: string }) {
  const legacy = runLegacy(html, COMMON)
  const built = buildPontoAdicionalTextos(builderInputs(flags), OPERADOR)
  expect(built.pontoTextoOS).toBe(legacy.textoOS)
  expect(built.pontoTextoAgenda).toBe(legacy.textoAgenda)
}

describe('Ponto adicional — paridade legado (4 variações)', () => {
  it('PF · sem troca', () => {
    checkParity(pfHtml, { segmento: 'PF', troca: 'NAO' })
  })
  it('PF · com troca', () => {
    checkParity(pfTrocaHtml, { segmento: 'PF', troca: 'SIM' })
  })
  it('PJ · sem troca', () => {
    checkParity(pjHtml, { segmento: 'PJ', troca: 'NAO' })
  })
  it('PJ · com troca', () => {
    checkParity(pjTrocaHtml, { segmento: 'PJ', troca: 'SIM' })
  })

  it('output template expõe O.S e Agenda (sem Protocolo)', () => {
    const built = buildPontoAdicionalTextos(
      builderInputs({ segmento: 'PF', troca: 'NAO' }),
      OPERADOR,
    )
    const rendered = renderTemplate(PONTO_ADICIONAL_OUTPUT, built)
    expect(rendered).toContain('=== Texto O.S ===')
    expect(rendered).toContain('=== Texto da Agenda ===')
    expect(rendered).not.toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('PONTO ADICIONAL EMPRESA EXEMPLO LTDA')
  })
})
