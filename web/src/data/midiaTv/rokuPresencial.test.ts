import { describe, it, expect } from 'vitest'
import presencialHtml from '../../../../legado-exemplo/suporte/compra-roku-tv/index-roku-presencial.html?raw'
import { ROKU_PRESENCIAL_OUTPUT, buildRokuPresencialTextos } from './rokuPresencial'
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
    textoProtocolo: store.textoProtocolo,
    textoOS: store.textoOS,
    textoAgenda: store.textoAgenda,
  }
}

const OPERADOR = 'FULANO'

const COMMON = {
  cliente: 'JOÃO DA SILVA SAURO',
  sinalONU: '-19.20DBM',
  bairro: 'CENTRO',
  valorSTB: 'R$230,00',
  parcelas: '3x',
  formaPag: 'CARTAO',
  dataVisita: '20/06/2026',
  horaVisita: '14:30',
  protocolo: '123.456',
  operador: OPERADOR,
}

describe('Compra Roku TV — presencial (paridade legado)', () => {
  it('index-roku-presencial.html', () => {
    const legacy = runLegacy(presencialHtml, COMMON)
    const built = buildRokuPresencialTextos(COMMON, OPERADOR)
    expect(built.rokuPresencialTextoProtocolo).toBe(legacy.textoProtocolo)
    expect(built.rokuPresencialTextoOS).toBe(legacy.textoOS)
    expect(built.rokuPresencialTextoAgenda).toBe(legacy.textoAgenda)
  })

  it('output template compõe Protocolo, O.S e Agenda', () => {
    const built = buildRokuPresencialTextos(COMMON, OPERADOR)
    const rendered = renderTemplate(ROKU_PRESENCIAL_OUTPUT, built)
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('=== Texto O.S ===')
    expect(rendered).toContain('=== Texto da Agenda ===')
    expect(rendered).toContain('COMPARECEU NA LOJA')
  })
})
