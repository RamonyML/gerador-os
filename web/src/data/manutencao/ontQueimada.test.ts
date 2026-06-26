import { describe, it, expect } from 'vitest'
import ontHtml from '../../../../legado-exemplo/suporte/equip-queimado/ont-queimada/ont-queimada.html?raw'
import { ONT_QUEIMADA_OUTPUT, buildOntQueimadaTextos } from './ontQueimada'
import { renderTemplate } from '../../lib/renderTemplate'

/**
 * Paridade (titular) com o legado: extrai e EXECUTA a propria gerarTextos() do
 * HTML legado e compara com o builder. PJ/Terceiros/mensalidade sao por analogia
 * (sem fonte legada).
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
  onu: 'ONT ZTE F 670-L',
  protocolo: '123.456',
  dataVisita: '20/06/2026',
  horaVisita: 'AS 08:30 HRS',
  formaPag: 'PIX',
}

describe('ONT queimada — paridade titular com legado', () => {
  it('ont-queimada.html (titular)', () => {
    const legacy = runLegacy(ontHtml, { ...COMMON, operador: OPERADOR })
    const built = buildOntQueimadaTextos(
      { ...COMMON, tipoSolicitacao: 'titular', pagamento: 'AVISTA' },
      OPERADOR,
    )
    expect(built.ontQueimadaTextoProtocolo).toBe(legacy.textoProtocolo)
    expect(built.ontQueimadaTextoOS).toBe(legacy.textoOS)
    expect(built.ontQueimadaTextoAgenda).toBe(legacy.textoAgenda)
  })

  it('output template compoe Protocolo, O.S e Agenda', () => {
    const built = buildOntQueimadaTextos(
      { ...COMMON, tipoSolicitacao: 'titular' },
      OPERADOR,
    )
    const rendered = renderTemplate(ONT_QUEIMADA_OUTPUT, built)
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('=== Texto O.S ===')
    expect(rendered).toContain('=== Texto da Agenda ===')
    expect(rendered).toContain('MAN TROCA ONT JOAO DA SILVA SAURO')
  })

  it('mensalidade reflete na agenda e no protocolo', () => {
    const built = buildOntQueimadaTextos(
      { ...COMMON, tipoSolicitacao: 'titular', pagamento: 'MENSALIDADE' },
      OPERADOR,
    )
    expect(built.ontQueimadaTextoAgenda).toContain('PROT:123.456 MENSALIDADE')
    expect(built.ontQueimadaTextoProtocolo).toContain('LANCAR O VALOR NA PROXIMA MENSALIDADE')
  })
})
