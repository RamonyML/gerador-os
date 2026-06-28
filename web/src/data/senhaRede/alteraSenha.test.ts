import { describe, it, expect } from 'vitest'
import alteraSenhaHtml from '../../../../legado-exemplo/suporte/altera-senha/altera-senha.html?raw'
import { ALTERA_SENHA_OUTPUT, buildAlteraSenhaTextos, buildAlteraSenhaSegmentos } from './alteraSenha'
import { renderTemplate } from '../../lib/renderTemplate'

type Inputs = Record<string, string>

/**
 * Paridade com o legado: extrai e EXECUTA a própria gerarTextos() do HTML e
 * compara com o builder. Este fluxo gera apenas o Texto Protocolo.
 */
function runLegacy(source: string, inputs: Inputs) {
  const marker = "document.getElementById('textoProtocolo').value = textoProtocolo;"
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
    querySelector: () => ({
      value: '',
      checkValidity: () => true,
      classList: { add() {} },
    }),
  }
  const run = new Function('document', `${fnSrc}\n}\n gerarTextos();`)
  run(doc)
  return { textoProtocolo: store.textoProtocolo }
}

const BASE = {
  cliente: 'JOÃO DA SILVA SAURO',
  canal: 'WHATSAPP',
  contato: '34999887766',
  sinalONU: '-19.20DBM',
  atualSSID: 'MZNET_2G',
  novoSSID: 'CasaDoJoao_5G',
  atualSenha: 'senhaAntiga123',
  novaSenha: 'NovaSenh@2026',
}

describe('Alteração de SSID / Senha', () => {
  it('SSID E SENHA: paridade caractere-a-caractere com o legado (todas as linhas)', () => {
    const inputs = { ...BASE, solicitacao: 'SSID E SENHA' }
    const legacy = runLegacy(alteraSenhaHtml, inputs)
    const built = buildAlteraSenhaTextos(inputs)
    expect(built.alteraSenhaTextoProtocolo).toBe(legacy.textoProtocolo)
  })

  it('SSID: mostra só as linhas de SSID (sem linhas de senha)', () => {
    const built = buildAlteraSenhaTextos({ ...BASE, solicitacao: 'SSID' })
    const txt = built.alteraSenhaTextoProtocolo
    expect(txt).toContain('SSID ATUAL:')
    expect(txt).toContain('SSID NOVA:')
    expect(txt).not.toContain('SENHA ATUAL:')
    expect(txt).not.toContain('SENHA NOVA:')
    expect(txt).toContain('SSID ALTERADA COM SUCESSO')
  })

  it('SENHA: mostra só as linhas de senha (sem linhas de SSID)', () => {
    const built = buildAlteraSenhaTextos({ ...BASE, solicitacao: 'SENHA' })
    const txt = built.alteraSenhaTextoProtocolo
    expect(txt).toContain('SENHA ATUAL:')
    expect(txt).toContain('SENHA NOVA:')
    expect(txt).not.toContain('SSID ATUAL:')
    expect(txt).not.toContain('SSID NOVA:')
    expect(txt).toContain('SENHA ALTERADA COM SUCESSO')
  })

  it('preserva SSID/senha exatamente como digitados (case-sensitive)', () => {
    const built = buildAlteraSenhaTextos({ ...BASE, solicitacao: 'SSID E SENHA' })
    expect(built.alteraSenhaTextoProtocolo).toContain(`SSID NOVA: ${BASE.novoSSID}`)
    expect(built.alteraSenhaTextoProtocolo).toContain(`SENHA NOVA: ${BASE.novaSenha}`)
  })

  it('output template expõe a aba Protocolo', () => {
    const built = buildAlteraSenhaTextos({ ...BASE, solicitacao: 'SSID E SENHA' })
    const rendered = renderTemplate(ALTERA_SENHA_OUTPUT, built)
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('ALTERAÇÃO DA SSID E SENHA DO WI-FI')
  })
})

describe('buildAlteraSenhaSegmentos', () => {
  it('SSID E SENHA: produz info + 2 comentarios', () => {
    const result = buildAlteraSenhaSegmentos({ ...BASE, solicitacao: 'SSID E SENHA' })
    expect(result.comentarios).toHaveLength(2)
    expect(result.info).toContain('SOLICITOU A ALTERACAO DA SSID E SENHA DO WI-FI.')
    expect(result.comentarios[0]).toContain('SEM REDUCAO')
    expect(result.comentarios[0]).toContain('SEM OSCILACAO')
    expect(result.comentarios[1]).toContain('SSID ATUAL:')
    expect(result.comentarios[1]).toContain('SENHA ATUAL:')
    expect(result.comentarios[1]).toContain('SSID E SENHA ALTERADA COM SUCESSO')
    expect(result.comentarios[1]).toContain('CONFIRMOU CONEXAO.')
  })

  it('SSID: comentarios[1] tem SSID mas nao tem SENHA', () => {
    const result = buildAlteraSenhaSegmentos({ ...BASE, solicitacao: 'SSID' })
    expect(result.comentarios[1]).toContain('SSID ATUAL:')
    expect(result.comentarios[1]).not.toContain('SENHA ATUAL:')
    expect(result.comentarios[1]).toContain('SSID ALTERADA COM SUCESSO')
  })

  it('SENHA: comentarios[1] tem SENHA mas nao tem SSID', () => {
    const result = buildAlteraSenhaSegmentos({ ...BASE, solicitacao: 'SENHA' })
    expect(result.comentarios[1]).not.toContain('SSID ATUAL:')
    expect(result.comentarios[1]).toContain('SENHA ATUAL:')
    expect(result.comentarios[1]).toContain('SENHA ALTERADA COM SUCESSO')
  })

  it('preserva SSID/senha case-sensitive no registro', () => {
    const result = buildAlteraSenhaSegmentos({ ...BASE, solicitacao: 'SSID E SENHA' })
    expect(result.comentarios[1]).toContain(`SSID NOVA: ${BASE.novoSSID}`)
    expect(result.comentarios[1]).toContain(`SENHA NOVA: ${BASE.novaSenha}`)
  })

  it('texto MK nao contém acentos nos campos de template', () => {
    const result = buildAlteraSenhaSegmentos({ ...BASE, solicitacao: 'SSID E SENHA' })
    expect(result.info).not.toContain('ALTERAÇÃO')
    expect(result.comentarios[0]).not.toContain('REDUÇÃO')
    expect(result.comentarios[0]).not.toContain('OSCILAÇÃO')
    expect(result.comentarios[1]).not.toContain('CONEXÃO')
  })
})
