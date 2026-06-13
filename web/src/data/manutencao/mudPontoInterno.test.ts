import { describe, it, expect } from 'vitest'
import padraoHtml from '../../../../legado-exemplo/suporte/mud-ponto-int/mud-ponto-int.html?raw'
import pjHtml from '../../../../legado-exemplo/suporte/mud-ponto-int/mud-ponto-int-pj.html?raw'
import mp1Html from '../../../../legado-exemplo/suporte/mud-ponto-int/mudponto1/mudponto1.html?raw'
import mp2Html from '../../../../legado-exemplo/suporte/mud-ponto-int/mudponto2/mudponto2.html?raw'
import mp3Html from '../../../../legado-exemplo/suporte/mud-ponto-int/mudponto3/mudponto3.html?raw'
import {
  MUD_PONTO_INT_OUTPUT,
  buildMudPontoIntTextos,
  T_PJ,
} from './mudPontoInterno'
import {
  T_TITULAR,
  T_TERCEIRO_TITULAR,
  T_TERCEIRO_TERCEIRO,
  T_TITULAR_TERCEIRO,
} from '../mudEnd/padrao'
import { renderTemplate } from '../../lib/renderTemplate'

/**
 * Paridade com legado-exemplo/suporte/mud-ponto-int/ — o teste extrai e EXECUTA
 * a própria função gerarTextos() de cada HTML legado e compara com o builder.
 */

type Inputs = Record<string, string>

function runLegacy(html: string, inputs: Inputs) {
  const marker = "getElementById('textoAgenda').value = textoAgenda;"
  const endPos = html.indexOf(marker)
  // Há uma gerarTextos() duplicada (stub) antes da real; pegamos a última.
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

const VALOR_50 =
  'EXPLIQUEI QUE SE CONSEGUIR REINSTALAR OS EQUIPAMENTOS NO LOCAL DESEJADO APROVEITANDO O MESMO DROP (CABO/FIBRA) OU CASO NÃO SEJA POSSÍVEL REAPROVEITÁ-LO SENDO NECESSARIO A PASSAGEM DE UM NOVO CABEAMENTO, O VALOR É DE R$ 50,00 REFERENTE A MÃO DE OBRA TÉCNICA.'

const BASE: Inputs = {
  cliente: 'JOÃO DA SILVA SAURO',
  canal: 'WHATSAPP',
  contato: '1133334444',
  contatoSol: '1199998888',
  sinalONU: '-19.20 DBM',
  bairro: 'CENTRO',
  motivo: 'REALIZOU UMA REFORMA EM SUA SALA E DESEJA ALTERAR O ROTEADOR DE LUGAR',
  ambienteAtual: 'SALA',
  ambienteNovo: 'QUARTO',
  valor: VALOR_50,
  dataVisita: '20/06/2026',
  horaVisita: '08:30',
  protocolo: '123.456',
  formaPag: 'PIX',
  operador: 'FULANO',
  // terceiros / pj
  solicitante: 'MARIA DAS DORES SOUZA',
  autorizado: 'MARIA DAS DORES SOUZA',
  parente: 'ESPOSA',
  cargo: 'GERENTE',
}

const OPERADOR = 'FULANO'

const CASES: Array<{ file: string; html: string; tipo: string }> = [
  { file: 'mud-ponto-int.html', html: padraoHtml, tipo: T_TITULAR },
  { file: 'mud-ponto-int-pj.html', html: pjHtml, tipo: T_PJ },
  { file: 'mudponto1.html', html: mp1Html, tipo: T_TITULAR_TERCEIRO },
  { file: 'mudponto2.html', html: mp2Html, tipo: T_TERCEIRO_TERCEIRO },
  { file: 'mudponto3.html', html: mp3Html, tipo: T_TERCEIRO_TITULAR },
]

describe('mudança de ponto interno — paridade com legado', () => {
  for (const { file, html, tipo } of CASES) {
    it(file, () => {
      const legacy = runLegacy(html, BASE)
      const built = buildMudPontoIntTextos({ ...BASE, tipoSolicitacao: tipo }, OPERADOR)
      expect(built.mudPontoIntTextoProtocolo).toBe(legacy.textoProtocolo)
      expect(built.mudPontoIntTextoOS).toBe(legacy.textoOS)
      expect(built.mudPontoIntTextoAgenda).toBe(legacy.textoAgenda)
    })
  }

  it('output template renderiza as três abas', () => {
    const built = buildMudPontoIntTextos({ ...BASE, tipoSolicitacao: T_TITULAR }, OPERADOR)
    const rendered = renderTemplate(MUD_PONTO_INT_OUTPUT, built)
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('=== Texto O.S ===')
    expect(rendered).toContain('=== Texto da Agenda ===')
    expect(rendered).toContain('MAN MUD PONTO INTERNO JOÃO DA SILVA SAURO')
  })
})
