import { describe, it, expect } from 'vitest'
import pfHtml from '../../../../legado-exemplo/suporte/wi-fi extend/index-altplan-wifi-extend.html?raw'
import pfTrocaHtml from '../../../../legado-exemplo/suporte/wi-fi extend/index-altplan-wifi-extend-troca.html?raw'
import pjHtml from '../../../../legado-exemplo/suporte/wi-fi extend/wi-fi-extend-pj/index-altplan-wifi-extend-pj.html?raw'
import pjTrocaHtml from '../../../../legado-exemplo/suporte/wi-fi extend/wi-fi-extend-pj/index-altplan-wifi-extend-pj-troca.html?raw'
import ofHtml from '../../../../legado-exemplo/suporte/wi-fi extend/wifi-ext-ofertado/index-altplan-wifi-extend-of.html?raw'
import ofTrocaHtml from '../../../../legado-exemplo/suporte/wi-fi extend/wifi-ext-ofertado/index-altplan-wifi-extend-of-troca.html?raw'
import oferPjHtml from '../../../../legado-exemplo/suporte/wi-fi extend/wi-fi-extend-pj/wifi-ext-ofertado-pj/index-altplan-wifi-extend-ofer-pj.html?raw'
import { WIFI_EXTEND_OUTPUT } from './wifiExtendShared'
import { buildWifiExtendZteTextos } from './extendZte'
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
  cliente: 'EMPRESA EXEMPLO LTDA',
  solicitante: 'MARIA DAS GRAÇAS',
  cargo: 'GERENTE',
  canal: 'WHATSAPP',
  contato: '34999887766',
  sinalONU: '-19.20DBM',
  bairro: 'CENTRO',
  planoAtual: '600 MEGA/79,90',
  planoEscolhido:
    '600 MEGA; + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$114,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+)',
  roteador: 'ZTE H199-A',
  dataContrato: '01/2025',
  dataVisita: '20/06/2026',
  horaVisita: '08:30',
  protocolo: '123.456',
  vencimentoData: '10',
  operador: OPERADOR,
  obs: 'MESMA CASA (POSSÍVEL MESH)',
}

function builderInputs(flags: { segmento: string; origem: string; troca: string }): Inputs {
  return { ...COMMON, ...flags, obsLocal: COMMON.obs, obsOutro: '' }
}

function checkParity(
  html: string,
  flags: { segmento: string; origem: string; troca: string },
) {
  const legacy = runLegacy(html, COMMON)
  const built = buildWifiExtendZteTextos(builderInputs(flags), OPERADOR)
  expect(built.wifiExtendTextoProtocolo).toBe(legacy.textoProtocolo)
  expect(built.wifiExtendTextoOS).toBe(legacy.textoOS)
  expect(built.wifiExtendTextoAgenda).toBe(legacy.textoAgenda)
}

describe('Wi-Fi Extend ZTE — paridade legado (7 variações)', () => {
  it('PF · solicitado · sem troca', () => {
    checkParity(pfHtml, { segmento: 'PF', origem: 'SOLICITADO', troca: 'NAO' })
  })
  it('PF · solicitado · com troca', () => {
    checkParity(pfTrocaHtml, { segmento: 'PF', origem: 'SOLICITADO', troca: 'SIM' })
  })
  it('PJ · solicitado · sem troca', () => {
    checkParity(pjHtml, { segmento: 'PJ', origem: 'SOLICITADO', troca: 'NAO' })
  })
  it('PJ · solicitado · com troca (separador =)', () => {
    checkParity(pjTrocaHtml, { segmento: 'PJ', origem: 'SOLICITADO', troca: 'SIM' })
  })
  it('PF · ofertado · sem troca', () => {
    checkParity(ofHtml, { segmento: 'PF', origem: 'OFERTADO', troca: 'NAO' })
  })
  it('PF · ofertado · com troca', () => {
    checkParity(ofTrocaHtml, { segmento: 'PF', origem: 'OFERTADO', troca: 'SIM' })
  })
  it('PJ · ofertado · sem troca', () => {
    checkParity(oferPjHtml, { segmento: 'PJ', origem: 'OFERTADO', troca: 'NAO' })
  })

  it('output template compõe Protocolo, O.S e Agenda', () => {
    const built = buildWifiExtendZteTextos(
      builderInputs({ segmento: 'PF', origem: 'SOLICITADO', troca: 'NAO' }),
      OPERADOR,
    )
    const rendered = renderTemplate(WIFI_EXTEND_OUTPUT, built)
    expect(rendered).toContain('=== Texto Protocolo ===')
    expect(rendered).toContain('=== Texto O.S ===')
    expect(rendered).toContain('=== Texto da Agenda ===')
    expect(rendered).toContain('ALT PLANO + WIFI EXTEND EMPRESA EXEMPLO LTDA')
  })
})
