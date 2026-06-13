import { describe, it, expect } from 'vitest'
import comVisitaHtml from '../../../../legado-exemplo/suporte/equip-queimado/fonte-queimada.html?raw'
import lojaHtml from '../../../../legado-exemplo/suporte/equip-queimado/fonte-queimada-loja.html?raw'
import {
  FONTE_QUEIMADA_OUTPUT,
  buildFonteQueimadaTextos,
  M_VISITA,
  M_LOJA,
} from './fonteQueimada'
import { renderTemplate } from '../../lib/renderTemplate'

/**
 * Paridade com legado-exemplo/suporte/equip-queimado/ — o teste extrai e EXECUTA
 * a própria função gerarTextos() de cada HTML legado e compara com o builder.
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
    textoProtocolo: store.textoProtocolo,
    textoOS: store.textoOS,
    textoAgenda: store.textoAgenda,
  }
}

const PROC =
  'ORIENTEI CLIENTE A INVERTER A FONTE DA ONU COM A DO ROTEADOR, E ASSIM EQUIPAMENTO FUNCIONOU'

const BASE: Inputs = {
  cliente: 'JOÃO DA SILVA SAURO',
  canal: 'WHATSAPP',
  contato: '1133334444',
  sinalONU: '-31.87 DBM',
  bairro: 'CENTRO',
  equip: 'ONU',
  proced: PROC,
  formaPag: 'PIX',
  dataVisita: '20/06/2026',
  horaVisita: '08:30',
  protocolo: '123.456',
  operador: 'FULANO',
}

const OPERADOR = 'FULANO'

describe('fonte queimada — paridade com legado', () => {
  it('fonte-queimada.html (com visita)', () => {
    const legacy = runLegacy(comVisitaHtml, BASE)
    const built = buildFonteQueimadaTextos({ ...BASE, tipoSolicitacao: M_VISITA }, OPERADOR)
    expect(built.fonteQueimadaTextoProtocolo).toBe(legacy.textoProtocolo)
    expect(built.fonteQueimadaTextoOS).toBe(legacy.textoOS)
    expect(built.fonteQueimadaTextoAgenda).toBe(legacy.textoAgenda)
  })

  it('fonte-queimada-loja.html (retirar na loja)', () => {
    // O legado da loja usa horaVisita = período (MANHÃ/TARDE).
    const lojaInputs = { ...BASE, horaVisita: 'MANHÃ' }
    const legacy = runLegacy(lojaHtml, lojaInputs)
    const built = buildFonteQueimadaTextos(
      { ...BASE, tipoSolicitacao: M_LOJA, periodo: 'MANHÃ' },
      OPERADOR,
    )
    expect(built.fonteQueimadaTextoProtocolo).toBe(legacy.textoProtocolo)
    expect(built.fonteQueimadaTextoAgenda).toBe(legacy.textoAgenda)
  })

  it('output template compõe Protocolo, O.S e Agenda (com visita)', () => {
    const built = buildFonteQueimadaTextos({ ...BASE, tipoSolicitacao: M_VISITA }, OPERADOR)
    const rendered = renderTemplate(FONTE_QUEIMADA_OUTPUT, built)
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('=== Texto O.S ===')
    expect(rendered).toContain('=== Texto da Agenda ===')
    expect(rendered).toContain('MAN TROCA FONTE JOÃO DA SILVA SAURO')
  })

  it('output template compõe Protocolo e LEIA, sem O.S (loja)', () => {
    const built = buildFonteQueimadaTextos(
      { ...BASE, tipoSolicitacao: M_LOJA, periodo: 'TARDE' },
      OPERADOR,
    )
    const rendered = renderTemplate(FONTE_QUEIMADA_OUTPUT, built)
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('=== Encaminhar no grupo LEIA ===')
    expect(rendered).not.toContain('=== Texto O.S ===')
  })
})
