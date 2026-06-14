import { describe, it, expect } from 'vitest'
import padraoHtml from '../../../../legado-exemplo/suporte/compra-roku-tv/index-roku-padrao.html?raw'
import { ROKU_PADRAO_OUTPUT, buildRokuPadraoTextos } from './rokuPadrao'
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
  canal: 'WHATSAPP',
  contato: '34999887766',
  sinalONU: '-19.20DBM',
  bairro: 'CENTRO',
  valorSTB: 'R$200,00',
  parcelas: '1x',
  formaPag: 'PIX',
  dataVisita: '20/06/2026',
  horaVisita: '08:30',
  protocolo: '123.456',
  operador: OPERADOR,
}

describe('Compra Roku TV — padrão (paridade legado)', () => {
  it('index-roku-padrao.html', () => {
    const legacy = runLegacy(padraoHtml, COMMON)
    const built = buildRokuPadraoTextos(COMMON, OPERADOR)
    expect(built.rokuPadraoTextoProtocolo).toBe(legacy.textoProtocolo)
    expect(built.rokuPadraoTextoOS).toBe(legacy.textoOS)
    expect(built.rokuPadraoTextoAgenda).toBe(legacy.textoAgenda)
  })

  it('output template compõe Protocolo, O.S e Agenda', () => {
    const built = buildRokuPadraoTextos(COMMON, OPERADOR)
    const rendered = renderTemplate(ROKU_PADRAO_OUTPUT, built)
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('=== Texto O.S ===')
    expect(rendered).toContain('=== Texto da Agenda ===')
    expect(rendered).toContain('COMPRA ROKU-TV JOÃO DA SILVA SAURO')
  })
})
