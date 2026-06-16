import { describe, it, expect } from 'vitest'
import pfHtml from '../../../../legado-exemplo/suporte/wi-fi extend/tplink/tplink-wifi-extend.html?raw'
import pfTrocaHtml from '../../../../legado-exemplo/suporte/wi-fi extend/tplink/tplink-wifi-extend-troca.html?raw'
import pjHtml from '../../../../legado-exemplo/suporte/wi-fi extend/tplink/tplink-wifi-extend-pj.html?raw'
import pjTrocaHtml from '../../../../legado-exemplo/suporte/wi-fi extend/tplink/tplink-wifi-extend-pj-troca.html?raw'
import { buildWifiExtendTplinkTextos } from './extendTplink'

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
  canal: 'LIGAÇÃO',
  contato: '34999887766',
  sinalONU: '-21.05DBM',
  bairro: 'SARANDI',
  planoAtual: '1000 MEGA/99,90',
  planoEscolhido:
    '1 GIGA (1.000 MEGA); + WI-FI EXTEND (ROTEADOR ADICIONAL)  MENSALIDADE: R$134,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
  roteador: 'ONT TPLINK X530',
  dataContrato: '03/2025',
  dataVisita: '21/06/2026',
  horaVisita: '14:30',
  protocolo: '987.654',
  vencimentoData: '20',
  operador: OPERADOR,
  obs: 'CASA FRENTE > CASA FUNDOS (CABEADO)',
}

function builderInputs(flags: { segmento: string; troca: string }): Inputs {
  return { ...COMMON, ...flags, obsLocal: COMMON.obs, obsOutro: '' }
}

function checkParity(html: string, flags: { segmento: string; troca: string }) {
  const legacy = runLegacy(html, COMMON)
  const built = buildWifiExtendTplinkTextos(builderInputs(flags), OPERADOR)
  expect(built.wifiExtendTextoProtocolo).toBe(legacy.textoProtocolo)
  expect(built.wifiExtendTextoOS).toBe(legacy.textoOS)
  expect(built.wifiExtendTextoAgenda).toBe(legacy.textoAgenda)
}

describe('Wi-Fi Extend TP-Link — paridade legado (4 variações)', () => {
  it('PF · sem troca', () => {
    checkParity(pfHtml, { segmento: 'PF', troca: 'NAO' })
  })
  it('PF · com troca (POR ONT TPLINK.)', () => {
    checkParity(pfTrocaHtml, { segmento: 'PF', troca: 'SIM' })
  })
  it('PJ · sem troca', () => {
    checkParity(pjHtml, { segmento: 'PJ', troca: 'NAO' })
  })
  it('PJ · com troca (separador = e "TPLINK .")', () => {
    checkParity(pjTrocaHtml, { segmento: 'PJ', troca: 'SIM' })
  })
})
