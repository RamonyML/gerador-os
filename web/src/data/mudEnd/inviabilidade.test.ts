import { describe, expect, it } from 'vitest'
import {
  MUD_END_INVIAB_OUTPUT,
  buildMudEndInviabilidadeTextos,
  I_TITULAR,
  I_TERCEIRO,
  I_PJ,
} from './inviabilidade'
import { renderTemplate } from '../../lib/renderTemplate'
import { splitOsPreviewSections } from '../../lib/splitOsPreviewSections'
import { formatSinalFibraSaida } from '../../lib/sinalFibraMask'

type Entrada = {
  cliente: string
  canal: string
  contato: string
  sinalONU: string
  onuOnt: string
  cep: string
  adress: string
  num: string
  bairro: string
  complemento: string
  mudou: string
  quandoMud: string
  solicitante?: string
  parente?: string
  contatoSol?: string
}

const SEP = '*'.repeat(15)

/** Reproduz o titular (index-mud-end-inviab.html). */
function esperadoTitular(v: Entrada) {
  const cliente = v.cliente.toUpperCase()
  const c0 = cliente.split(' ')[0]
  const contato = v.contato.replace(/\D/g, '')
  const equipPrefix = v.onuOnt.toUpperCase().startsWith('ONT') ? 'ONT' : 'ONU'
  const sinal = formatSinalFibraSaida(v.sinalONU)
  const adress = v.adress.toUpperCase()
  const complemento = v.complemento.toUpperCase()
  const bairro = v.bairro.toUpperCase()
  const quandoMud = v.quandoMud.toUpperCase()

  return `${c0} ENTROU EM CONTATO POR ${v.canal} (${contato}) E PEDIU INFORMAÇÕES SOBRE MUDANÇA DE ENDEREÇO.

${SEP}

CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E ${equipPrefix} ${sinal}.

${SEP}

QUESTIONADO, ${c0} DISSE QUE ${v.mudou} DESEJA QUE OS EQUIPAMENTOS SEJAM REINSTALADOS NO NOVO ENDEREÇO.

ENDEREÇO NOVO: ${adress}, ${v.num.replace(/\D/g, '')}
COMPLEMENTO: ${complemento}
CEP: ${v.cep}
BAIRRO: ${bairro}

${quandoMud}

${SEP}

INFORMEI À ${c0} QUE NÃO POSSUÍMOS VIABILIDADE TÉCNICA PARA INSTALAÇÃO DE FIBRA ÓPTICA NO ENDEREÇO SOLICITADO. CONFORME CONSTA NO CONTRATO, EM SITUAÇÕES ONDE NÃO É POSSÍVEL ATENDER O CLIENTE COM O SERVIÇO DE FIBRA ÓPTICA, O ASSINANTE DEVE PROSSEGUIR COM A MUDANÇA PARA OUTRO ENDEREÇO VIÁVEL (SEJA PARA SI PRÓPRIO OU ALGUM PARENTE), CIENTE DE QUE AS RESPONSABILIDADES PELO CONTRATO E EQUIPAMENTOS PERMANECEM COM O ASSINANTE. CASO A MUDANÇA NÃO SEJA POSSÍVEL, O ASSINANTE DEVE SOLICITAR O CANCELAMENTO DO SERVIÇO. REFORÇAMOS QUE A COBERTURA DE FIBRA NÃO É GARANTIDA EM TODA A ÁREA URBANA DE UBERLÂNDIA, VIDE CONTRATO.

O ATENDIMENTO (${v.canal}) FOI DIRECIONADO AO SETOR FINANCEIRO PARA TRATATIVAS.`
}

function gerar(v: Entrada, tipo: string) {
  const base = { ...v, tipoSolicitacao: tipo }
  const full = renderTemplate(MUD_END_INVIAB_OUTPUT, {
    ...base,
    ...buildMudEndInviabilidadeTextos(base),
  })
  const secs = splitOsPreviewSections(full)
  return secs[0]?.body ?? ''
}

const CENARIO: Entrada = {
  cliente: 'João da Silva',
  canal: 'WHATSAPP',
  contato: '(34) 99999-8888',
  sinalONU: '19.20',
  onuOnt: 'ONU DATA',
  cep: '38400000',
  adress: 'Avenida dos Eucaliptos',
  num: '624',
  bairro: 'Saraiva',
  complemento: 'casa fundos',
  mudou: 'AINDA NÃO SE MUDOU, PORÉM',
  quandoMud: 'cliente vai mudar na próxima semana',
}

describe('MUD END — inviabilidade', () => {
  it('Texto Protocolo preserva o legado (titular / PF assinante)', () => {
    expect(gerar(CENARIO, I_TITULAR)).toBe(esperadoTitular(CENARIO))
  })

  it('Variação terceiro cita solicitante e assinante no cancelamento', () => {
    const out = gerar(
      {
        ...CENARIO,
        solicitante: 'Ana Lima',
        parente: 'FILHA',
        contatoSol: '34966665555',
      },
      I_TERCEIRO,
    )
    expect(out).toContain('ANA (FILHA DE JOÃO) ENTROU EM CONTATO')
    expect(out).toContain('VAI SE MUDAR E DESEJA')
    expect(out).toContain(
      'JOÃO DA SILVA (ASSINANTE) DEVE SOLICITAR O CANCELAMENTO',
    )
  })

  it('Variação PJ usa apenas o parentesco no cabeçalho', () => {
    const out = gerar(
      {
        ...CENARIO,
        solicitante: 'Ana Lima',
        parente: 'REPRESENTANTE',
        contatoSol: '34966665555',
      },
      I_PJ,
    )
    expect(out).toContain('ANA (REPRESENTANTE) ENTROU EM CONTATO')
    expect(out).not.toContain('REPRESENTANTE DE JOÃO')
    expect(out).toContain(
      'JOÃO DA SILVA (ASSINANTE) DEVE SOLICITAR O CANCELAMENTO',
    )
  })
})
