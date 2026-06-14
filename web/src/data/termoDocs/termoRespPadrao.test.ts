import { describe, expect, it } from 'vitest'
import termoRespHtml from '../../../../legado-exemplo/suporte/termo-resp/termo-resp-padrao.html?raw'
import { renderTemplate } from '../../lib/renderTemplate'
import {
  TERMO_RESP_PADRAO_OUTPUT,
  buildTermoRespPadraoTextos,
} from './termoRespPadrao'

type Inputs = Record<string, string>

/**
 * Paridade com o legado: extrai e EXECUTA a própria gerarTextos() do HTML e
 * compara os dois textos gerados.
 */
function runLegacy(source: string, inputs: Inputs) {
  const marker = "document.getElementById('textoOS').value = textoOS;"
  const endPos = source.indexOf(marker)
  const start = source.lastIndexOf('function gerarTextos', endPos)
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
      checked: id === 'sim',
    }),
    querySelector: () => ({
      checkValidity: () => true,
      classList: { add() {} },
    }),
  }
  const run = new Function('document', `${fnSrc}\n}\n gerarTextos();`)
  run(doc)
  return {
    textoCliente: store.textoOS,
    textoProtocolo: store.textoProtocolo,
  }
}

const INPUTS: Inputs = {
  cliente: 'JOÃO DA SILVA SAURO',
  canal: 'ENTROU EM CONTATO POR WHATSAPP',
  contato: '34999887766',
  sinalONU: '-19.20 DBM',
  mac: 'a1:b2:c3:d4:e5:f6',
  roteador: 'TP-LINK 840',
  protocolo: '2501.1234',
  testouSenha: 'sim',
  user: 'Admin',
  senha: 'Abcd1234',
}

describe('Termo de Responsabilidade — Padrão', () => {
  it('mantém paridade caractere-a-caractere com o termo ao cliente do legado', () => {
    const legacy = runLegacy(termoRespHtml, INPUTS)
    const built = buildTermoRespPadraoTextos(INPUTS)
    expect(built.termoRespTextoCliente).toBe(legacy.textoCliente)
  })

  it('mantém paridade caractere-a-caractere com o protocolo do legado', () => {
    const legacy = runLegacy(termoRespHtml, INPUTS)
    const built = buildTermoRespPadraoTextos(INPUTS)
    expect(built.termoRespTextoProtocolo).toBe(legacy.textoProtocolo)
  })

  it('preserva usuário e senha exatamente como digitados', () => {
    const built = buildTermoRespPadraoTextos({
      ...INPUTS,
      user: 'super',
      senha: 'super123',
    })
    expect(built.termoRespTextoProtocolo).toContain('USUÁRIO: super')
    expect(built.termoRespTextoProtocolo).toContain('SENHA: super123')
  })

  it('output template expõe as duas abas do fluxo', () => {
    const built = buildTermoRespPadraoTextos(INPUTS)
    const rendered = renderTemplate(TERMO_RESP_PADRAO_OUTPUT, built)
    expect(rendered).toContain('=== Encaminhar termo ao cliente ===')
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('SOLICITOU ACESSO AO ROTEADOR EM COMODATO')
  })
})
