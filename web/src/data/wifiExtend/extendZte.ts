import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  WIFI_EXTEND_OUTPUT,
  buildExtendFields,
  buildExtendTextos,
  buildExtendSegmentos,
  ROTEADOR_ZTE_OPTS,
} from './wifiExtendShared'

/**
 * Wi-Fi Extend — ZTE / Mesh (PF/PJ, solicitado/ofertado, com/sem troca).
 * Consolida as 7 variações ZTE do legado em um único fluxo com selects.
 */
export function buildWifiExtendZteTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  return buildExtendTextos(rawValues, operadorPrimeiroNome, 'ZTE')
}

export function buildWifiExtendZteSegmentos(
  rawValues: Record<string, unknown>,
): { info: string; comentarios: string[] } {
  return buildExtendSegmentos(rawValues)
}

export function getWifiExtendZteDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'wifi-extend-zte',
    title: 'Wi-Fi Extend — ZTE / Mesh',
    demandCategory: 'wifi-extend',
    outputTemplate: WIFI_EXTEND_OUTPUT,
    fields: buildExtendFields(ROTEADOR_ZTE_OPTS, true),
    operatorGuidance: {
      title: 'Atenção ao agendar a visita técnica',
      items: [
        'Ao marcar a visita técnica, agendar para Téc. Júnior e reservar o mesmo horário para outro técnico ajudá-lo a passar cabeamento.',
      ],
    },
  }
}
