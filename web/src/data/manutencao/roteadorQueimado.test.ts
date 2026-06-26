import { describe, it, expect } from 'vitest'
import cobradaHtml from '../../../../legado-exemplo/suporte/equip-queimado/roteador-queimado/roteador-queimado.html?raw'
import isentoJs from '../../../../legado-exemplo/suporte/equip-queimado/script.js?raw'
import {
  ROTEADOR_QUEIMADO_OUTPUT,
  buildRoteadorQueimadoTextos,
  M_COBRADA,
  M_ISENTO,
} from './roteadorQueimado'
import { renderTemplate } from '../../lib/renderTemplate'

/**
 * Paridade (titular) com o legado: o teste extrai e EXECUTA a propria funcao
 * gerarTextos() de cada fonte (HTML cobrada / script.js isento) e compara com o
 * builder. As variacoes PJ/Terceiros/mensalidade sao por analogia (sem fonte
 * legada) e por isso nao sao cobertas por paridade.
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

describe('roteador queimado — paridade titular com legado', () => {
  it('cobrada (roteador-queimado.html) — separadores =', () => {
    const legacyInputs: Inputs = {
      cliente: 'JOAO DA SILVA SAURO',
      canal: 'WHATSAPP',
      contato: '1133334444',
      bairro: 'CENTRO',
      dataVisita: '20/06/2026',
      horaVisita: 'AS 08:30 HRS',
      protocolo: '123.456',
      formaPag: 'PIX',
      operador: OPERADOR,
      roteador: 'MULTILASER',
      sinalONU: '-19.20 DBM',
    }
    const legacy = runLegacy(cobradaHtml, legacyInputs)
    const built = buildRoteadorQueimadoTextos(
      {
        modoCusto: M_COBRADA,
        tipoSolicitacao: 'titular',
        cliente: 'JOAO DA SILVA SAURO',
        canal: 'WHATSAPP',
        contato: '1133334444',
        bairro: 'CENTRO',
        dataVisita: '20/06/2026',
        horaCobrada: 'AS 08:30 HRS',
        protocolo: '123.456',
        formaPag: 'PIX',
        roteador: 'MULTILASER',
        sinalONU: '-19.20 DBM',
        pagamento: 'AVISTA',
      },
      OPERADOR,
    )
    expect(built.roteadorQueimadoTextoProtocolo).toBe(legacy.textoProtocolo)
    expect(built.roteadorQueimadoTextoOS).toBe(legacy.textoOS)
    expect(built.roteadorQueimadoTextoAgenda).toBe(legacy.textoAgenda)
  })

  it('isento (script.js) — separadores *', () => {
    const legacyInputs: Inputs = {
      cliente: 'JOAO DA SILVA SAURO',
      canal: 'WHATSAPP',
      contato: '1133334444',
      sinalONU: '-19.20 DBM',
      bairro: 'CENTRO',
      dataVisita: '20/06/2026',
      horaVisita: '08:30',
      protocolo: '123.456',
      formaPag: 'PIX',
      roteador: 'R$150,00',
      operador: OPERADOR,
    }
    const legacy = runLegacy(isentoJs, legacyInputs)
    const built = buildRoteadorQueimadoTextos(
      {
        modoCusto: M_ISENTO,
        tipoSolicitacao: 'titular',
        cliente: 'JOAO DA SILVA SAURO',
        canal: 'WHATSAPP',
        contato: '1133334444',
        sinalONU: '-19.20 DBM',
        bairro: 'CENTRO',
        dataVisita: '20/06/2026',
        horaVisita: '08:30',
        protocolo: '123.456',
        formaPag: 'PIX',
        roteador: 'MULTILASER',
      },
      OPERADOR,
    )
    expect(built.roteadorQueimadoTextoProtocolo).toBe(legacy.textoProtocolo)
    expect(built.roteadorQueimadoTextoOS).toBe(legacy.textoOS)
    expect(built.roteadorQueimadoTextoAgenda).toBe(legacy.textoAgenda)
  })

  it('output template compoe Protocolo, O.S e Agenda', () => {
    const built = buildRoteadorQueimadoTextos(
      {
        modoCusto: M_COBRADA,
        tipoSolicitacao: 'titular',
        cliente: 'JOAO DA SILVA SAURO',
        canal: 'WHATSAPP',
        contato: '1133334444',
        bairro: 'CENTRO',
        dataVisita: '20/06/2026',
        horaCobrada: 'AS 08:30 HRS',
        protocolo: '123.456',
        formaPag: 'PIX',
        roteador: 'MULTILASER',
        sinalONU: '-19.20 DBM',
      },
      OPERADOR,
    )
    const rendered = renderTemplate(ROTEADOR_QUEIMADO_OUTPUT, built)
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('=== Texto O.S ===')
    expect(rendered).toContain('=== Texto da Agenda ===')
    expect(rendered).toContain('MAN TROCA ROTEADOR JOAO DA SILVA SAURO')
  })

  it('mensalidade reflete na agenda (cobrada)', () => {
    const built = buildRoteadorQueimadoTextos(
      {
        modoCusto: M_COBRADA,
        tipoSolicitacao: 'titular',
        cliente: 'JOAO DA SILVA SAURO',
        canal: 'WHATSAPP',
        contato: '1133334444',
        bairro: 'CENTRO',
        dataVisita: '20/06/2026',
        horaCobrada: 'AS 08:30 HRS',
        protocolo: '123.456',
        formaPag: 'PIX',
        roteador: 'MULTILASER',
        sinalONU: '-19.20 DBM',
        pagamento: 'MENSALIDADE',
      },
      OPERADOR,
    )
    expect(built.roteadorQueimadoTextoAgenda).toContain('PROT:123.456 MENSALIDADE')
    expect(built.roteadorQueimadoTextoProtocolo).toContain('LANCAR O VALOR NA PROXIMA MENSALIDADE')
  })
})
