import type { OsTemplatePresetPayload } from '../osTemplatePresets'
import {
  WIFI_EXTEND_OUTPUT,
  buildExtendFields,
  buildExtendTextos,
  ROTEADOR_TPLINK_OPTS,
} from './wifiExtendShared'

/**
 * Wi-Fi Extend — TP-Link (PF/PJ, com/sem troca).
 * Consolida as 4 variações TP-Link do legado em um único fluxo com selects.
 * Não há variante "ofertado" no legado TP-Link.
 */
export function buildWifiExtendTplinkTextos(
  rawValues: Record<string, unknown>,
  operadorPrimeiroNome: string,
): Record<string, string> {
  return buildExtendTextos(rawValues, operadorPrimeiroNome, 'TPLINK')
}

export function getWifiExtendTplinkDefaults(): OsTemplatePresetPayload {
  return {
    slug: 'wifi-extend-tplink',
    title: 'Wi-Fi Extend — TP-Link',
    demandCategory: 'wifi-extend',
    outputTemplate: WIFI_EXTEND_OUTPUT,
    fields: buildExtendFields(ROTEADOR_TPLINK_OPTS, false),
    operatorGuidance: {
      title: 'Atenção ao agendar a visita técnica',
      items: [
        'Ao marcar a visita técnica, agendar para Téc. Júnior e reservar o mesmo horário para outro técnico ajudá-lo a passar cabeamento.',
      ],
    },
  }
}
