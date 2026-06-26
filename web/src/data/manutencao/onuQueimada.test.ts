import { describe, it, expect } from 'vitest'
import onuHtml from '../../../../legado-exemplo/suporte/equip-queimado/onu-queimada/onu-queimada.html?raw'
import { ONU_QUEIMADA_OUTPUT, buildOnuQueimadaTextos } from './onuQueimada'
import { renderTemplate } from '../../lib/renderTemplate'

/**
 * Paridade (titular) com o legado: extrai e EXECUTA a propria gerarTextos() do
 * HTML legado e compara com o builder. PJ/Terceiros/mensalidade sao por analogia.
 */

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
  cliente: 'JOAO DA SILVA SAURO',
  canal: 'WHATSAPP',
  contato: '1133334444',
  bairro: 'CENTRO',
  alarme: 'ESTA APENAS COM A LUZ POWER ACESA',
  onu: 'ZTE',
  protocolo: '123.456',
  dataVisita: '20/06/2026',
  horaVisita: 'AS 08:30 HRS',
  formaPag: 'PIX',
}

describe('ONU queimada — paridade titular com legado', () => {
  it('onu-queimada.html (titular)', () => {
    const legacy = runLegacy(onuHtml, { ...COMMON, operador: OPERADOR })
    const built = buildOnuQueimadaTextos(
      { ...COMMON, tipoSolicitacao: 'titular', pagamento: 'AVISTA' },
      OPERADOR,
    )
    expect(built.onuQueimadaTextoProtocolo).toBe(legacy.textoProtocolo)
    expect(built.onuQueimadaTextoOS).toBe(legacy.textoOS)
    expect(built.onuQueimadaTextoAgenda).toBe(legacy.textoAgenda)
  })

  it('output template compoe Protocolo, O.S e Agenda', () => {
    const built = buildOnuQueimadaTextos({ ...COMMON, tipoSolicitacao: 'titular' }, OPERADOR)
    const rendered = renderTemplate(ONU_QUEIMADA_OUTPUT, built)
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('=== Texto O.S ===')
    expect(rendered).toContain('=== Texto da Agenda ===')
    expect(rendered).toContain('MAN TROCA ONU JOAO DA SILVA SAURO')
  })

  it('mensalidade reflete na agenda e no protocolo', () => {
    const built = buildOnuQueimadaTextos(
      { ...COMMON, tipoSolicitacao: 'titular', pagamento: 'MENSALIDADE' },
      OPERADOR,
    )
    expect(built.onuQueimadaTextoAgenda).toContain('PROT:123.456 MENSALIDADE')
    expect(built.onuQueimadaTextoProtocolo).toContain('LANCAR O VALOR NA PROXIMA MENSALIDADE')
  })
})
