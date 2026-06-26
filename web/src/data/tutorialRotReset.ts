const SEP = '*'.repeat(23)

function upper(v: unknown): string {
  return String(v ?? '').trim().toUpperCase()
}
function digits(v: unknown): string {
  return String(v ?? '').replace(/\D/g, '')
}
function firstWord(v: string): string {
  return v.split(/\s+/).filter(Boolean)[0] ?? ''
}

export type RotResetFormValues = {
  solicitante: string
  cpf: string
  titular: string
  canal: string
  contato: string
  sinalONU: string
  ssid: string
  senhaWifi: string
}

export const ROT_RESET_REQUIRED_FIELDS: (keyof RotResetFormValues)[] = [
  'solicitante',
  'cpf',
  'titular',
  'canal',
  'contato',
  'sinalONU',
  'ssid',
  'senhaWifi',
]

export function buildRotResetSegmentos(v: RotResetFormValues): {
  info: string
  comentarios: string[]
} {
  const solFirst = firstWord(upper(v.solicitante))
  const canal = upper(v.canal)
  const contato = digits(v.contato)
  const sinal = upper(v.sinalONU)
  const ssid = v.ssid.trim()
  const senha = v.senhaWifi.trim()

  const info = `${solFirst} ENTROU EM CONTATO POR ${canal} (${contato}) E INFORMOU QUE ESTÁ SEM ACESSO A INTERNET E QUE SUA REDE WI-FI ESTÁ APARECENDO CONTATE_MZNET.`

  return {
    info,
    comentarios: [
      `CLIENTE SEM BLOQUEIO, SEM REDUÇÃO E SINAL ONU/ONT ${sinal} SEM OSCILAÇÃO.`,
      `AO VERIFICAR EM SISTEMA CLIENTE ESTÁ COM O ROTEADOR RESETADO E QUESTIONADO INFORMOU QUE AO REALIZAR INTERVENÇÃO NO EQUIPAMENTO ACABOU O RESETANDO.`,
      `CLIENTE FOI ORIENTADO A NÃO MANUSEAR EQUIPAMENTO SEM AUXÍLIO DO SUPORTE. REALIZEI AS CONFIGURAÇÕES DO ROTEADOR COM PPOE/SENHA E INCLUSIVE REDE WI-FI.\n\nSSID: ${ssid}\nSENHA: ${senha}`,
      `CLIENTE CONECTOU SEUS DISPOSITIVOS E FEZ OS TESTES DE NAVEGAÇÃO.\n\nCLIENTE SEM DÚVIDAS.`,
    ],
  }
}

export const SEP_ROT_RESET = SEP

export type TutorialStep = {
  title: string
  items: string[]
  images?: { src: string; alt: string }[]
  tip?: string
}

export type TutorialModel = {
  id: string
  label: string
  ip: string
  user: string
  password: string
  steps: TutorialStep[]
}

const BASE = '/tutoriais/rot-reset'

export const TUTORIAL_ROT_RESET_MODELS: TutorialModel[] = [
  {
    id: 'ax2',
    label: 'Huawei AX2',
    ip: '192.168.3.1',
    user: '—',
    password: '—',
    steps: [
      {
        title: 'Passo 1 — Acesso e configuração PPPoE',
        items: [
          'Oriente o cliente a usar de preferência PC/notebook com cabo de rede ou Wi-Fi.',
          'Acesse o IP: 192.168.3.1',
          'Marque CONCORDO e clique em INICIAR.',
          'Insira o usuário e senha PPPoE do cliente.',
          'Clique em SEGUINTE.',
        ],
        images: [
          { src: `${BASE}/ax2/01.png`, alt: 'Tela inicial AX2' },
          { src: `${BASE}/ax2/02.png`, alt: 'Configuração PPPoE AX2' },
        ],
      },
      {
        title: 'Passo 2 — Configurações adicionais',
        items: [
          'No menu principal, acesse MAIS FUNÇÕES → DEFINIÇÕES DE REDE.',
          'Habilite UPnP e clique em SALVAR.',
          'Acesse DEFINIÇÕES Wi-Fi → desabilite WPS.',
          'Acesse DEFINIÇÕES DE SEGURANÇA e configure conforme a imagem abaixo.',
          'Acesse ATUALIZAÇÕES → ATUALIZAÇÃO DE UM SÓ CLIQUE.',
          'Em GERENCIAMENTO DE CONTA DO USUÁRIO, altere a senha do USER para 183729. Não altere a senha do ADMIN.',
        ],
        images: [
          { src: `${BASE}/ax2/03.png`, alt: 'Definições de segurança AX2' },
        ],
        tip: 'Confirme com o cliente se consegue navegar na internet normalmente.',
      },
    ],
  },
  {
    id: 'grtk1',
    label: 'Greatek V1',
    ip: '192.168.1.1/padrao.htm',
    user: 'super',
    password: 'super123',
    steps: [
      {
        title: 'Passo 1 — Acesso e configuração inicial',
        items: [
          'Oriente o cliente a usar de preferência PC/notebook com cabo de rede ou Wi-Fi.',
          'Acesse: 192.168.1.1/padrao.htm',
          'Usuário: super / Senha: super123',
          'Realize as configurações conforme as imagens abaixo.',
        ],
        images: [
          { src: `${BASE}/grtk1/01.png`, alt: 'Configuração Greatek V1 — tela 1' },
          { src: `${BASE}/grtk1/02.png`, alt: 'Configuração Greatek V1 — tela 2' },
        ],
        tip: 'Clique em SALVAR E REINICIAR.',
      },
      {
        title: 'Passo 2 — Reset e desativar WPS',
        items: [
          'Após reiniciar, acesse o roteador em: 192.168.1.1',
          'Resete para os padrões de fábrica que você acabou de criar (conforme imagem).',
          'Após o reinício, desabilite WPS em ambas as redes Wi-Fi (2.4G e 5G).',
        ],
        images: [
          { src: `${BASE}/grtk1/03.png`, alt: 'Reset Greatek V1' },
          { src: `${BASE}/grtk1/04.png`, alt: 'Desabilitar WPS Greatek V1' },
        ],
      },
      {
        title: 'Passo 3 — UPnP, ping WAN e IPv6',
        items: [
          'Acesse REDE → CONFIGURAÇÕES WAN e habilite UPnP e ping WAN.',
          'Acesse IPv6 → CONFIGURAÇÕES DE IPV6 NA REDE WAN e configure conforme a imagem.',
          'Clique em SALVAR / APLICAR e reinicie o roteador.',
        ],
        images: [
          { src: `${BASE}/grtk1/05.png`, alt: 'UPnP e ping WAN Greatek V1' },
          { src: `${BASE}/grtk1/06.png`, alt: 'IPv6 WAN Greatek V1' },
        ],
        tip: 'Confirme com o cliente se consegue navegar na internet normalmente.',
      },
    ],
  },
  {
    id: 'grtk2',
    label: 'Greatek V2',
    ip: '192.168.1.1',
    user: 'super',
    password: 'super123',
    steps: [
      {
        title: 'Passo 1 — Acesso e configuração PPPoE e Wi-Fi',
        items: [
          'Oriente o cliente a usar de preferência PC/notebook com cabo de rede ou Wi-Fi.',
          'Acesse: 192.168.1.1 — Usuário: super / Senha: super123',
          'Na próxima tela, selecione PPPoE e insira o usuário e senha PPPoE do cliente.',
          'Configure o Wi-Fi 2.4G e 5G: SSID e senha de cada banda.',
          'Marque "usar a mesma senha das redes Wi-Fi" e clique em Aplicar configurações.',
        ],
        images: [
          { src: `${BASE}/grtk2/01.png`, alt: 'Configuração inicial Greatek V2' },
        ],
      },
      {
        title: 'Passo 2 — Gateway e IPv6',
        items: [
          'Acesse LAN → GATEWAY e configure conforme o exemplo abaixo.',
          'Clique em INÍCIO, faça login novamente e acesse AVANÇADO.',
          'No submenu IPv6 WAN, selecione PPP em WAN LINK TYPE, marque SLAAC e clique em SAVE.',
        ],
        images: [
          { src: `${BASE}/grtk2/02.png`, alt: 'Gateway Greatek V2' },
          { src: `${BASE}/grtk2/03.png`, alt: 'IPv6 WAN Greatek V2' },
        ],
      },
      {
        title: 'Passo 3 — UPnP, acesso remoto e padrão de fábrica',
        items: [
          'No submenu UPnP, clique em ENABLE UPnP e SAVE.',
          'No submenu Pass-through, marque "Enable Web Access from WAN", coloque 8255 em Access Port e clique em SAVE & APPLY.',
          'Após 30 segundos, acesse 192.168.1.1/padrao.htm e clique em SET TO DEFAULT (ou DEFINIR COMO PADRÃO).',
        ],
        images: [
          { src: `${BASE}/grtk2/04.png`, alt: 'Pass-through Greatek V2' },
          { src: `${BASE}/grtk2/05.png`, alt: 'Set to Default Greatek V2' },
        ],
        tip: 'Confirme com o cliente se consegue navegar na internet normalmente.',
      },
    ],
  },
  {
    id: 'zte',
    label: 'ZTE H199-A',
    ip: '192.168.1.1',
    user: 'multipro',
    password: 'multipro',
    steps: [
      {
        title: 'Passo 1 — Configuração PPPoE, Wi-Fi e acesso remoto',
        items: [
          'Oriente o cliente a usar de preferência PC/notebook com cabo de rede ou Wi-Fi.',
          'Acesse: 192.168.1.1 — Usuário: multipro / Senha: multipro',
          'Clique em PRÓXIMO, insira o usuário e senha PPPoE. Marque IPv4/v6 e clique em PRÓXIMO.',
          'Configure Wi-Fi 2.4G (SSID + senha) → PRÓXIMO. Configure Wi-Fi 5G (SSID + senha) → PRÓXIMO.',
          'Clique em TERMINAR.',
          'Acesse INTERNET → SEGURANÇA → NÍVEL DE FIREWALL → selecione MÉDIO → APLICAR.',
          'Acesse CONTROLE DE SERVIÇO LOCAL → CONTROLE DE SERVIÇO IPv4 → LIGADO. No campo NOME digite "Remoto". Mantenha OBJETIVO, ENTRADA e INTERVALO DE IP como estão. Em TIPO DE SERVIÇO, selecione HTTP → APLICAR.',
          'Deve ficar conforme a imagem abaixo.',
        ],
        images: [
          { src: `${BASE}/zte/01.png`, alt: 'Controle de serviço remoto ZTE' },
        ],
      },
      {
        title: 'Passo 1 (cont.) — Portas de serviço remoto',
        items: [
          'Na parte inferior, acesse CONTROLE DE PORTA DE SERVIÇO REMOTO — IPv4.',
          'HTTP → 8255',
          'TELNET → 2355',
          'HTTPS → 4433',
          'Clique em APLICAR.',
        ],
        images: [
          { src: `${BASE}/zte/02.png`, alt: 'Portas de serviço remoto ZTE' },
        ],
      },
      {
        title: 'Passo 2 — UPnP, senha de usuário e preset',
        items: [
          'Acesse REDE LOCAL → UPnP → LIGADO → APLICAR.',
          'Acesse GERENCIAMENTO E DIAGNÓSTICO → GERENCIAMENTO DE CONTA → GERENCIAMENTO DE CONTA DO USUÁRIO.',
          'Pode manter o "nome de usuário" como "user". Altere a nova senha para 183729, confirme e clique em APLICAR.',
          'Atenção: altere apenas a senha do USER. Não altere a senha do ADMIN.',
          'No menu lateral, clique em GERENCIAMENTO DE SISTEMA → aba "Configuração de Gerência padrão" e configure o preset conforme a imagem abaixo.',
        ],
        images: [
          { src: `${BASE}/zte/03.png`, alt: 'Preset ZTE' },
        ],
      },
      {
        title: 'Passo 2 (cont.) — Configuração WLAN SSID',
        items: [
          'Após o roteador reiniciar, acesse novamente.',
          'Acesse REDE LOCAL → WLAN → CONFIGURAÇÃO WLAN SSID.',
          'Configure conforme o exemplo abaixo.',
        ],
        images: [
          { src: `${BASE}/zte/04.png`, alt: 'Configuração WLAN SSID ZTE' },
        ],
        tip: 'Confirme com o cliente se consegue navegar na internet normalmente.',
      },
    ],
  },
]
