import { describe, it, expect } from 'vitest'
import visitaHtml from '../../../../legado-exemplo/suporte/roteador-reset/index-roteador-reset.html?raw'
import lojaHtml from '../../../../legado-exemplo/suporte/roteador-reset/rot-reset-loja/rot-reset-loja.html?raw'
import {
  ROTEADOR_RESET_OUTPUT,
  buildRoteadorResetTextos,
  M_VISITA,
  M_LOJA,
} from './roteadorReset'
import { renderTemplate } from '../../lib/renderTemplate'

/**
 * Paridade com legado-exemplo/suporte/roteador-reset — o teste extrai e EXECUTA
 * a própria função gerarTextos() dos HTMLs legados e compara com o builder.
 */

type Inputs = Record<string, string>

function runLegacy(source: string, inputs: Inputs, marker: string) {
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

const BASE: Inputs = {
  cliente: 'JOÃO DA SILVA SAURO',
  canal: 'WHATSAPP',
  contato: '1133334444',
  sinalONU: '-19.20 DBM',
  oscila: 'SEM OSCILAÇÃO',
  roteador: 'TP-LINK 840',
}

describe('roteador resetado — paridade com legado', () => {
  it('index-roteador-reset.html (visita técnica)', () => {
    const inputs = {
      ...BASE,
      bairro: 'CENTRO',
      dataVisita: '20/06/2026',
      horaVisita: '08:30',
      protocolo: '123.456',
      formaPag: 'PIX',
      operador: OPERADOR,
    }
    const legacy = runLegacy(
      visitaHtml,
      inputs,
      "document.getElementById('textoAgenda').value = textoAgenda;",
    )
    const built = buildRoteadorResetTextos({ ...inputs, tipoSolicitacao: M_VISITA }, OPERADOR)
    expect(built.roteadorResetTextoProtocolo).toBe(legacy.textoProtocolo)
    expect(built.roteadorResetTextoOS).toBe(legacy.textoOS)
    expect(built.roteadorResetTextoAgenda).toBe(legacy.textoAgenda)
  })

  it('rot-reset-loja.html (trazer na loja)', () => {
    const inputs = {
      ...BASE,
      dataLigacao: '20/06/2026 14:30',
    }
    const legacy = runLegacy(
      lojaHtml,
      inputs,
      "document.getElementById('textoProtocolo').value = textoProtocolo;",
    )
    const built = buildRoteadorResetTextos({ ...inputs, tipoSolicitacao: M_LOJA }, OPERADOR)
    expect(built.roteadorResetTextoProtocolo).toBe(legacy.textoProtocolo)
    expect(built.roteadorResetTextoOS).toBe('')
    expect(built.roteadorResetTextoAgenda).toBe('')
  })

  it('output template compõe Protocolo, O.S e Agenda (visita)', () => {
    const built = buildRoteadorResetTextos(
      {
        ...BASE,
        tipoSolicitacao: M_VISITA,
        bairro: 'CENTRO',
        dataVisita: '20/06/2026',
        horaVisita: '08:30',
        protocolo: '123.456',
        formaPag: 'PIX',
      },
      OPERADOR,
    )
    const rendered = renderTemplate(ROTEADOR_RESET_OUTPUT, built)
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('=== Texto O.S ===')
    expect(rendered).toContain('=== Texto da Agenda ===')
    expect(rendered).toContain('MAN ROTEADOR RESETADO JOÃO DA SILVA SAURO')
  })

  it('output template compõe somente Protocolo (loja)', () => {
    const built = buildRoteadorResetTextos(
      { ...BASE, tipoSolicitacao: M_LOJA, dataLigacao: '20/06/2026 14:30' },
      OPERADOR,
    )
    const rendered = renderTemplate(ROTEADOR_RESET_OUTPUT, built)
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).not.toContain('=== Texto O.S ===')
    expect(rendered).not.toContain('=== Texto da Agenda ===')
  })
})
