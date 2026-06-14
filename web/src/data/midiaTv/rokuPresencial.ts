import type { OsTemplateField } from '../../types/osTemplate'
import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  ROKU_AGENDAMENTO_FIELDS,
  ROKU_COMPRA_FIELDS,
} from './rokuCompraShared'

/**
 * Compra Roku TV — presencial (cliente comparece à loja).
 * Paridade com legado-exemplo/suporte/compra-roku-tv/index-roku-presencial.html.
 */

export { buildRokuPresencialTextos } from './rokuCompraShared'

const S_ID = 'IDENTIFICAÇÃO DO CLIENTE'

export const ROKU_PRESENCIAL_OUTPUT = [
  '=== Texto Protocolo ===',
  '{{rokuPresencialTextoProtocolo}}',
  '',
  '=== Texto O.S ===',
  '{{rokuPresencialTextoOS}}',
  '',
  '=== Texto da Agenda ===',
  '{{rokuPresencialTextoAgenda}}',
].join('\n')

export const ROKU_PRESENCIAL_FIELDS: OsTemplateField[] = [
  {
    id: 'cliente',
    label: 'Nome Completo',
    control: 'text',
    placeholder: 'Nome completo',
    section: S_ID,
    layout: { md: 6 },
  },
  {
    id: 'sinalONU',
    label: 'Sinal ONU',
    control: 'text',
    placeholder: '-19.20 DBM ou SEM SINAL',
    section: S_ID,
    layout: { md: 3 },
  },
  {
    id: 'bairro',
    label: 'Bairro',
    control: 'text',
    placeholder: 'Insira o bairro do cliente',
    section: S_ID,
    layout: { md: 3 },
  },
  ...ROKU_COMPRA_FIELDS,
  ...ROKU_AGENDAMENTO_FIELDS,
]

export function getMidiaRokuPresencialDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'midia-roku-presencial',
    title: 'Compra Roku TV — Presencial',
    demandCategory: 'midia-tv',
    outputTemplate: ROKU_PRESENCIAL_OUTPUT,
    fields: ROKU_PRESENCIAL_FIELDS.map((f) => ({ ...f })),
  }
}
