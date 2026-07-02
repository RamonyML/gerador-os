import type { CatalogoCategoria, CatalogoItemDraft } from '../types/catalogo'

type SeedItem = Omit<CatalogoItemDraft, 'ordem'>

const planosAtualBase: SeedItem[] = [
  { label: '100MB/59,90',                     value: '100 MEGA/59,90',                     ativo: true },
  { label: '100MB/79,90',                     value: '100 MEGA/79,90',                     ativo: true },
  { label: '150MB/59,90',                     value: '150 MEGA/59,90',                     ativo: true },
  { label: '250MB/69,90',                     value: '250 MEGA/69,90',                     ativo: true },
  { label: '300MB/69,90',                     value: '300 MEGA/69,90',                     ativo: true },
  { label: '400MB/79,90',                     value: '400 MEGA/79,90',                     ativo: true },
  { label: '500MB/79,90',                     value: '500 MEGA/79,90',                     ativo: true },
  { label: '500MB/99,90',                     value: '500 MEGA/99,90',                     ativo: true },
  { label: '600MB/79,90',                     value: '600 MEGA/79,90',                     ativo: true },
  { label: '1000MB/99,90',                    value: '1000 MEGA/99,90',                    ativo: true },
  { label: '1000MB/149,80',                   value: '1000 MEGA/149,80',                   ativo: true },
  { label: '500MB/119,90 — WI-FI EXTEND',    value: '500 MEGA + WI-FI EXTEND/119,90',    ativo: true },
  { label: '1000MB/139,90 — WI-FI EXTEND',   value: '1000 MEGA + WI-FI EXTEND/139,90',   ativo: true },
]

const planosOfertadoAltplanMudend: SeedItem[] = [
  {
    label: '150 MEGA/59,90 + MZTV (CDNTV+)',
    value: '150 MEGA/59,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    ativo: true,
  },
  {
    label: '300 MEGA/69,90 + MZTV (CDNTV+)',
    value: '300 MEGA/69,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    ativo: true,
  },
  {
    label: '600 MEGA/79,90 + MZTV (CDNTV+)',
    value: '600 MEGA/79,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    ativo: true,
  },
  {
    label: '1000 MEGA/99,90 + MZTV (CDNTV+) + VOD',
    value: '1 GIGA (1.000 MEGA) R$99,90. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    ativo: true,
  },
  {
    label: '150 MEGA/80,00 + MZTV (CDNTV+) + IP DIN',
    value: '150 MEGA/80,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    ativo: true,
  },
  {
    label: '300 MEGA/90,00 + MZTV (CDNTV+) + IP DIN',
    value: '300 MEGA/90,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    ativo: true,
  },
  {
    label: '600 MEGA/100,00 + MZTV (CDNTV+) + IP DIN',
    value: '600 MEGA/100,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    ativo: true,
  },
  {
    label: '1000 MEGA/120,00 + MZTV (CDNTV+) + VOD + IP DIN',
    value: '1 GIGA (1.000 MEGA) R$120,00 + IP PUBLICO DINAMICO. BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    ativo: true,
  },
  {
    label: '600 MEGA/109,90 + MZTV + VOD + ITTV PLUS (1 LICENÇA)',
    value: '600 MEGA/109,90 + ITTV PLUS (1 LICENÇA). BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV',
    ativo: true,
  },
  {
    label: '1000 MEGA/129,90 + MZTV + VOD + ITTV PLUS (1 LICENÇA)',
    value: '1 GIGA (1.000 MEGA) R$129,90 + ITTV PLUS (1 LICENÇA). BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV + VOD',
    ativo: true,
  },
  {
    label: '600 MEGA/114,90 + BENEFÍCIOS + WI-FI EXTEND',
    value: '600 MEGA; + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$114,90; EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS; BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    ativo: true,
  },
  {
    label: '1000 MEGA/134,90 + BENEFÍCIOS + WI-FI EXTEND',
    value: '1 GIGA (1.000 MEGA); + WI-FI EXTEND (ROTEADOR ADICIONAL)  MENSALIDADE: R$134,90; EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS; BENEFÍCIOS: ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    ativo: true,
  },
]

const planosAtualExtend: SeedItem[] = [
  ...planosAtualBase,
  { label: '1000MB/114,90 + IP DIN (antigo)',  value: '1000 MEGA/114,90 + IP PUBLICO DINAMICO', ativo: true },
  { label: '1000MB/120,00 + IP DIN',           value: '1000 MEGA/120,00 + IP PUBLICO DINAMICO', ativo: true },
]

const planosOfertadoExtend: SeedItem[] = [
  {
    label: '600 MEGA/114,90 + BENEFÍCIOS + WI-FI EXTEND',
    value: '600 MEGA; + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$114,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    ativo: true,
  },
  {
    label: '1000 MEGA/134,90 + BENEFÍCIOS + WI-FI EXTEND',
    value: '1 GIGA (1.000 MEGA); + WI-FI EXTEND (ROTEADOR ADICIONAL)  MENSALIDADE: R$134,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    ativo: true,
  },
  {
    label: '600 MEGA/144,90 + BENEFÍCIOS + WI-FI EXTEND (2 unidades)',
    value: '600 MEGA; + WI-FI EXTEND (2 ROTEADORES ADICIONAIS) MENSALIDADE: R$144,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    ativo: true,
  },
  {
    label: '1000 MEGA/164,90 + BENEFÍCIOS + WI-FI EXTEND (2 unidades)',
    value: '1 GIGA (1.000 MEGA); + WI-FI EXTEND (2 ROTEADORES ADICIONAIS)  MENSALIDADE: R$164,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    ativo: true,
  },
  {
    label: '600 MEGA/174,90 + BENEFÍCIOS + WI-FI EXTEND (3 unidades)',
    value: '600 MEGA; + WI-FI EXTEND (3 ROTEADORES ADICIONAIS) MENSALIDADE: R$174,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+)',
    ativo: true,
  },
  {
    label: '1000 MEGA/194,90 + BENEFÍCIOS + WI-FI EXTEND (3 unidades)',
    value: '1 GIGA (1.000 MEGA); + WI-FI EXTEND (3 ROTEADORES ADICIONAIS)  MENSALIDADE: R$194,90; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    ativo: true,
  },
  {
    label: '600 MEGA/135,00 + BENEFÍCIOS + WI-FI EXTEND + IP DIN',
    value: '600 MEGA; + IP PUBLICO DINAMICO + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$135,00; BENEFÍCIOS: EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS + ACESSO GRATUITO AO APP MZTV (CDNTV+) + VOD',
    ativo: true,
  },
  {
    label: '1000 MEGA/155,00 + BENEFÍCIOS + WI-FI EXTEND + IP DIN',
    value: '1 GIGA (1.000 MEGA); + WI-FI EXTEND (ROTEADOR ADICIONAL) MENSALIDADE: R$155,00; + EQUIPAMENTOS EMPRESTADOS EM REGIME DE COMODATO + IP PUBLICO DINAMICO + INSTALAÇÃO/ATIVAÇÃO GRÁTIS; BENEFÍCIOS: ACESSO GRATUITO AO APP MZ PLAY + ACESSO GRATUITO AO APP (CDNTV+) + VOD',
    ativo: true,
  },
]

function withOrdem(items: SeedItem[], grupo?: 'atual' | 'ofertado'): CatalogoItemDraft[] {
  return items.map((item, i) => ({
    ...item,
    ordem: (i + 1) * 10,
    ...(grupo !== undefined ? { grupo } : {}),
  }))
}

export const CATALOGO_SEED: Record<CatalogoCategoria, CatalogoItemDraft[]> = {
  'planos-altplan': [
    ...withOrdem(planosAtualBase, 'atual'),
    ...withOrdem(planosOfertadoAltplanMudend, 'ofertado'),
  ],
  'planos-extend': [
    ...withOrdem(planosAtualExtend, 'atual'),
    ...withOrdem(planosOfertadoExtend, 'ofertado'),
  ],
  'planos-mudend': [
    ...withOrdem(planosAtualBase, 'atual'),
    ...withOrdem(planosOfertadoAltplanMudend, 'ofertado'),
  ],
  'equipamentos': withOrdem([
    { label: 'MULTILASER',                        value: 'MULTILASER',                    ativo: true },
    { label: 'TP-LINK 840',                       value: 'TP-LINK 840',                   ativo: true },
    { label: 'TP LINK C-20',                      value: 'TP LINK C-20',                  ativo: true },
    { label: 'D-LINK DIR 842',                    value: 'D-LINK DIR 842',                ativo: true },
    { label: 'TP LINK C-5',                       value: 'TP LINK C-5',                   ativo: true },
    { label: 'TP LINK G-5',                       value: 'TP LINK G-5',                   ativo: true },
    { label: 'GREATEK',                           value: 'GREATEK',                       ativo: true },
    { label: 'INTELBRAS',                         value: 'INTELBRAS',                     ativo: true },
    { label: 'HUAWEI AX2',                        value: 'HUAWEI AX2',                    ativo: true },
    { label: 'ZTE H196-MESH',                     value: 'ZTE H196-MESH',                 ativo: true },
    { label: 'ZTE H199-A',                        value: 'ZTE H199-A',                    ativo: true },
    { label: 'ONT ZTE F 670-L',                   value: 'ONT ZTE F 670-L',               ativo: true },
    { label: 'ONT TP-LINK XC220',                 value: 'ONT TP-LINK XC220',             ativo: true },
    { label: 'ONT TP-LINK XC230',                 value: 'ONT TP-LINK XC230',             ativo: true },
    { label: 'ONT TP-LINK X530',                  value: 'ONT TP-LINK X530',              ativo: true },
    { label: 'ZTE H199-A + ZTE H199-A',           value: 'ZTE H199-A + ZTE H199-A',       ativo: true },
    { label: 'ZTE H199-A + ZTE H196',             value: 'ZTE H199-A + ZTE H196',         ativo: true },
    { label: 'ONT ZTE F 670-L + ZTE H199-A',      value: 'ONT ZTE F 670-L + ZTE H199-A', ativo: true },
    { label: 'ONT ZTE F 670-L + ZTE H196',        value: 'ONT ZTE F 670-L + ZTE H196',   ativo: true },
  ]),
  'formas-pag': withOrdem([
    { label: 'PIX',         value: 'PIX',         ativo: true },
    { label: 'Dinheiro',    value: 'DINHEIRO',    ativo: true },
    { label: 'Cartão',      value: 'CARTAO',      ativo: true },
    { label: 'Mensalidade', value: 'MENSALIDADE', ativo: true },
  ]),
  'canais': withOrdem([
    { label: 'Telefone',  value: 'LIGAÇÃO',   ativo: true },
    { label: 'WhatsApp',  value: 'WHATSAPP',  ativo: true },
  ]),
  'parentesco': withOrdem([
    { label: 'ESPOSO',        value: 'ESPOSO',        ativo: true },
    { label: 'ESPOSA',        value: 'ESPOSA',        ativo: true },
    { label: 'CÔNJUGE',       value: 'CÔNJUGE',       ativo: true },
    { label: 'MARIDO',        value: 'MARIDO',        ativo: true },
    { label: 'PAI',           value: 'PAI',           ativo: true },
    { label: 'MÃE',           value: 'MÃE',           ativo: true },
    { label: 'FILHO',         value: 'FILHO',         ativo: true },
    { label: 'FILHA',         value: 'FILHA',         ativo: true },
    { label: 'IRMÃO',         value: 'IRMÃO',         ativo: true },
    { label: 'IRMÃ',          value: 'IRMÃ',          ativo: true },
    { label: 'AVÔ',           value: 'AVÔ',           ativo: true },
    { label: 'AVÓ',           value: 'AVÓ',           ativo: true },
    { label: 'TIO',           value: 'TIO',           ativo: true },
    { label: 'TIA',           value: 'TIA',           ativo: true },
    { label: 'PRIMO',         value: 'PRIMO',         ativo: true },
    { label: 'PRIMA',         value: 'PRIMA',         ativo: true },
    { label: 'VIZINHO',       value: 'VIZINHO',       ativo: true },
    { label: 'VIZINHA',       value: 'VIZINHA',       ativo: true },
    { label: 'RESPONSÁVEL',   value: 'RESPONSÁVEL',   ativo: true },
    { label: 'FUNCIONÁRIO',   value: 'FUNCIONÁRIO',   ativo: true },
    { label: 'SÓCIO',         value: 'SÓCIO',         ativo: true },
    { label: 'GERENTE',       value: 'GERENTE',       ativo: true },
  ]),
}
