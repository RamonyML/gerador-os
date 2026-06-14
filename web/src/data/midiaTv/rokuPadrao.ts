import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  ROKU_AGENDAMENTO_FIELDS,
  ROKU_COMPRA_FIELDS,
} from './rokuCompraShared'

/**
 * Compra Roku TV — padrão (cliente solicita por telefone/WhatsApp).
 * Paridade com legado-exemplo/suporte/compra-roku-tv/index-roku-padrao.html.
 */

export { buildRokuPadraoTextos } from './rokuCompraShared'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'

export const ROKU_PADRAO_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{rokuPadraoTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{rokuPadraoTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{rokuPadraoTextoAgenda}}',
].join('\n')

export const ROKU_PADRAO_FIELDS: OsTemplateField[] = [
  {
    id: 'cliente',
    label: 'Nome Completo',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 8 },
  },
  {
    id: 'contato',
    label: 'Contato',
    control: 'phone',
    placeholder: 'Somente os números',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'canal',
    label: 'Canal',
    control: 'select',
    section: S_ID,
    layout: { md: 4 },
    options: [
      { value: 'LIGAÇÃO', label: 'Telefone' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
    ],
  },
  {
    id: 'sinalONU',
    label: 'Sinal ONU',
    control: 'text',
    placeholder: '-19.20 DBM ou SEM SINAL',
    section: S_ID,
    layout: { md: 4 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    placeholder: 'Insira o bairro do cliente',
    section: S_ID,
    layout: { md: 4 },
  },
  ...ROKU_COMPRA_FIELDS,
  ...ROKU_AGENDAMENTO_FIELDS,
]

export function getMidiaRokuPadraoDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'midia-roku-padrao',
    title: 'Compra Roku TV — Padrão',
    demandCategory: 'midia-tv',
    outputTemplate: ROKU_PADRAO_OUTPUT,
    fields: ROKU_PADRAO_FIELDS.map((f) => ({ ...f })),
  }
}
