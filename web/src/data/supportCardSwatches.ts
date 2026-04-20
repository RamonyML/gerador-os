/** Cinco cores fixas para os cards do hub Suporte — repetem nos 10 itens (2 voltas). */
const HUB_COLORS = ['#2E7D32', '#1565C0', '#EF6C00', '#C62828', '#7B1FA2'] as const
//                 verde     azul      laranja   vermelho  roxo

export function accentHexForSupportDemandSlot(slotIndex: number): string {
  return HUB_COLORS[slotIndex % HUB_COLORS.length]!
}
