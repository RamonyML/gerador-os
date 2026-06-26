/**
 * Banco de códigos MK Solutions — MZ NET
 * Extraído dos Excels em docs/codigos_mk/ + validado pelo Laboratório MK
 * Atualizado em: 2026-06-26
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type MkItem = { id: number; nome: string }

export type MkClassificacao = MkItem & {
  encerramento: boolean  // true = usado para FECHAR atendimento; false = para ABRIR
  inativa: boolean
  aplicacao?: string
}

export type MkProcesso = MkItem

export type MkTipoOS = MkItem & {
  ativo: boolean
}

export type MkGrupo = MkItem

export type MkOrigemContato = MkItem

export type MkTecnico = {
  id: number
  nome: string
  login: string
  tipo: 'Técnico' | 'Líder'
  classificacao: 'Funcionário' | 'Terceirizado'
}

export type MkContrato = {
  id: number
  nome: string
  tipo: 'Internet' | 'SVA' | 'TV/OTT' | 'Outros'
  ativo: boolean
}

// ---------------------------------------------------------------------------
// Classificações de atendimento
// encerramento=false → usar para ABRIR protocolo (ex: NORMAL=3, EMERGENCIAL=4)
// encerramento=true  → usar para FECHAR atendimento (ex: ONU-SEM-LUZ=8, ROTEADOR-RESETADO=7)
// ---------------------------------------------------------------------------

export const MK_CLASSIFICACOES: MkClassificacao[] = [
  { id: 2,  nome: 'ADESAO',                              encerramento: false, inativa: false },
  { id: 3,  nome: 'NORMAL',                              encerramento: false, inativa: false },
  { id: 4,  nome: 'EMERGENCIAL',                         encerramento: false, inativa: false },
  { id: 5,  nome: 'FINALIZADO',                          encerramento: false, inativa: false },
  { id: 6,  nome: 'DEFEITO-EQUIPAMENTO',                 encerramento: true,  inativa: false },
  { id: 7,  nome: 'ROTEADOR-RESETADO',                   encerramento: true,  inativa: false },
  { id: 8,  nome: 'ONU-SEM-LUZ',                         encerramento: true,  inativa: false },
  { id: 9,  nome: 'LIBERACAO-CONFIANCA',                 encerramento: true,  inativa: false },
  { id: 10, nome: 'SEGUNDA-VIA',                         encerramento: true,  inativa: false },
  { id: 11, nome: 'ALTERACAO-PLANO',                     encerramento: true,  inativa: false },
  { id: 12, nome: 'ALTERACAO-DATA-VENCIMENTO',           encerramento: true,  inativa: false },
  { id: 14, nome: 'EQUIPAMENTO-TRAVADO',                 encerramento: true,  inativa: false },
  { id: 15, nome: 'ABERTURA-PORTAS',                     encerramento: true,  inativa: false },
  { id: 16, nome: 'ALTERACAO SENHA WI-FI',               encerramento: true,  inativa: false },
  { id: 17, nome: 'CONFIGURACAO-INSTRUCAO-CLIENTE',      encerramento: true,  inativa: false },
  { id: 18, nome: 'PROBLEMA-EQUIPAMENTO-CLIENTE',        encerramento: true,  inativa: false },
  { id: 19, nome: 'AFERICAO-VELOCIDADE',                 encerramento: true,  inativa: false },
  { id: 20, nome: 'TROCA-DE-ROTEADOR',                   encerramento: true,  inativa: false },
  { id: 21, nome: 'TROCA-DE-ONU',                        encerramento: true,  inativa: false },
  { id: 22, nome: 'TROCA-ONU-ROTEADOR',                  encerramento: true,  inativa: false },
  { id: 23, nome: 'PROBLEMA-EXTERNO-FIBRA',              encerramento: true,  inativa: false },
  { id: 24, nome: 'PROBLEMA-EXTERNO-CONECTOR-CTOE',      encerramento: true,  inativa: false },
  { id: 25, nome: 'PROBLEMA-INTERNO-FIBRA',              encerramento: true,  inativa: false },
  { id: 26, nome: 'PROBLEMA-INTERNO-CONECTOR-ONU',       encerramento: true,  inativa: false },
  { id: 27, nome: 'ALTERACAO-ENDERECO-INSTALACAO',       encerramento: true,  inativa: false },
  { id: 28, nome: 'CONFIG-CONEXAO-EQUIPAMENTO',          encerramento: true,  inativa: false },
  { id: 31, nome: 'PROBLEMA-SERVICO-ESPECIFICO',         encerramento: true,  inativa: false },
  { id: 32, nome: 'NENHUM-PROBLEMA-ENCONTRADO',          encerramento: true,  inativa: false },
  { id: 33, nome: 'MASSIVA-ROMPIMENTO-FIBRA',            encerramento: true,  inativa: false },
  { id: 34, nome: 'MENSALIDADE-EM-ATRASO',               encerramento: true,  inativa: false },
  { id: 35, nome: 'REINSTALACAO-DE-EQUIPAMENTO',         encerramento: true,  inativa: false },
  { id: 36, nome: 'MUDANCA-PONTO-INTERNO',               encerramento: true,  inativa: false },
  { id: 37, nome: 'MUDANCA-ENDERECO',                    encerramento: true,  inativa: false },
  { id: 38, nome: 'CLIENTE-COBERTURA-WIFI',              encerramento: true,  inativa: false },
  { id: 39, nome: 'MASSIVA-OPERADORA',                   encerramento: true,  inativa: false },
  { id: 40, nome: 'MASSIVA-EQUIPAMENTO-BACKBONE',        encerramento: true,  inativa: false },
  { id: 41, nome: 'INTERVENCAO-N3',                      encerramento: true,  inativa: false, aplicacao: 'USADO EM FECHAMENTO QUANDO NECESSARIO DE INTERVENÇAO N3' },
  { id: 42, nome: 'INST. ITTV PLUS APP OU STB',          encerramento: true,  inativa: false },
  { id: 43, nome: 'ENCERRAMENTO VIA APLICATIVO',         encerramento: true,  inativa: false, aplicacao: 'MK Agentes' },
  { id: 44, nome: 'INSTALAÇÃO EXECUTADA',                encerramento: true,  inativa: false },
  { id: 45, nome: 'FONTE QUEIMADA (ONU-ROTEADOR)',       encerramento: true,  inativa: false },
  { id: 66, nome: 'CHIP MOVEL NOVO NUMERO',              encerramento: true,  inativa: false },
  { id: 67, nome: 'CHIP MOVEL PORTABILIDADE',            encerramento: true,  inativa: false },
]

// ---------------------------------------------------------------------------
// Processos de atendimento
// ---------------------------------------------------------------------------

export const MK_PROCESSOS: MkProcesso[] = [
  { id: 2,  nome: 'SUPORTE TÉCNICO' },
  { id: 4,  nome: 'FINANCEIRO-COBRANÇA' },
  { id: 5,  nome: 'PROC-ALTERA-PLANO' },
  { id: 7,  nome: 'FINANCEIRO' },
  { id: 12, nome: 'TECNICO-SEM-CONEXAO' },
  { id: 13, nome: 'TECNICO-CONEXAO-LENTA' },
  { id: 14, nome: 'TECNICO-ALTERAR-WIFI' },
  { id: 15, nome: 'TECNICO-LIBERACAO-PORTAS' },
  { id: 16, nome: 'PROC-MUDANCA-ENDERECO' },
  { id: 17, nome: 'TECNICO-FALHA-EM-SERVIÇO-ESPECIFICO' },
  { id: 18, nome: 'TECNICO-OUTRAS-SOLICITAÇOES' },
  { id: 19, nome: 'FINANCEIRO-SEGUNDA-VIA' },
  { id: 20, nome: 'FINANCEIRO-MUDANCA-VENCIMENTO' },
  { id: 21, nome: 'FINANCEIRO-TROCA-TITULARIDADE' },
  { id: 22, nome: 'FINANCEIRO-NF' },
  { id: 23, nome: 'FINANCEIRO-CANCELAMENTO(POR PARTE DO CLIENTE)' },
  { id: 24, nome: 'FINANCEIRO-SUSPENSAO-CONTRATO' },
  { id: 25, nome: 'TECNICO-DOCUMENTOS' },
  { id: 26, nome: 'FINANCEIRO-OUTRAS-SOLICITACOES' },
  { id: 27, nome: 'FINANCEIRO-DESBLOQUEIO-CONFIANCA' },
  { id: 28, nome: 'FINANCEIRO-RETIRADA-INADIMPLENTE' },
  { id: 29, nome: 'PROCESSO-ADESAO' },
  { id: 30, nome: 'PROC_INSTALACAO' },
  { id: 31, nome: 'PLANTAO-DESBLOQUEIO-CONFIANCA' },
  { id: 32, nome: 'PLANTAO-SEGUNDA-VIA' },
  { id: 33, nome: 'PLANTAO-SEM-CONEXAO' },
  { id: 34, nome: 'PLANTAO-CONEXAO-LENTA' },
  { id: 35, nome: 'PLANTAO-OUTROS-ASSUNTOS' },
  { id: 36, nome: 'PLANTAO-VIABILIDADE' },
  { id: 37, nome: 'SOLICITACAO-N3' },
  { id: 38, nome: 'TECNICO-TERMO-RESPONSABILIDADE' },
  { id: 39, nome: 'CHIP MOVEL 5G - ADESAO' },
]

// ---------------------------------------------------------------------------
// Tipos de O.S.
// ---------------------------------------------------------------------------

export const MK_TIPOS_OS: MkTipoOS[] = [
  { id: 2,  nome: 'OS DE INSTALACAO / ATIVACAO',                     ativo: true  },
  { id: 3,  nome: 'MANUTENCAO',                                       ativo: true  },
  { id: 4,  nome: 'DESLIGAMENTO DE CLIENTE',                          ativo: true  },
  { id: 5,  nome: 'SOLICITACAO DE CANCELAMENTO',                      ativo: true  },
  { id: 6,  nome: 'MUDANCA DE ENDERECO',                              ativo: true  },
  { id: 7,  nome: 'ALTERAÇÃO DE PLANO',                               ativo: true  },
  { id: 8,  nome: 'MUDANÇA DE TITULARIDADE',                          ativo: true  },
  { id: 9,  nome: 'RECOLHIMENTO DE EQUIPAMENTOS',                     ativo: true  },
  { id: 10, nome: 'OS DE MANUTENCAO DE INFRAESTRUTURA',               ativo: true  },
  { id: 11, nome: 'NEGOCIAÇÃO DE DEBITO',                             ativo: true  },
  { id: 12, nome: 'TERMO DE RESPONSABILIDADE',                        ativo: true  },
  { id: 13, nome: 'OS DE PONTO ADICIONAL (COMPRA DE EQUIPAMENTO)',    ativo: true  },
  { id: 14, nome: 'MZ PLAY PLUS - ITTV',                              ativo: false },
  { id: 15, nome: 'TESTE SUPORTE ALT PLANO 79,90',                   ativo: false },
  { id: 16, nome: 'O.S TIPO DE ACESSO "IP"',                         ativo: true  },
  { id: 17, nome: 'MUD END + ALT PLANO',                              ativo: true  },
  { id: 18, nome: 'ALTERAÇÃO DE PLANO + WI-FI EXTEND',               ativo: true  },
  { id: 19, nome: 'OS DE INSTALACAO + WI-FI EXTEND',                 ativo: true  },
  { id: 20, nome: 'SETUP BOX (STB)',                                   ativo: true  },
  { id: 21, nome: 'ROKU TV',                                           ativo: true  },
  { id: 22, nome: 'RETORNO EM GARANTIA (07 DIAS)',                    ativo: true  },
]

// ---------------------------------------------------------------------------
// Grupos / Equipes
// ---------------------------------------------------------------------------

export const MK_GRUPOS: MkGrupo[] = [
  { id: 2,  nome: 'EQUIPE PRONET' },
  { id: 3,  nome: 'EQUIPE MARCOS' },
  { id: 4,  nome: 'NOC - MZ NET' },
  { id: 6,  nome: 'SUPORTE TÉCNICO - MZ NET' },
  { id: 7,  nome: 'FINANCEIRO - MZ NET' },
  { id: 8,  nome: 'EQUIPE-TERCEIRIZADA' },
  { id: 9,  nome: 'EQUIPE VB' },
  { id: 10, nome: 'EQUIPE MZ NET' },
  { id: 11, nome: 'INSTALAÇÃO - MZ NET' },
]

// ---------------------------------------------------------------------------
// Origem de contato
// ---------------------------------------------------------------------------

export const MK_ORIGEM_CONTATO: MkOrigemContato[] = [
  { id: 1,  nome: 'Email' },
  { id: 2,  nome: 'Outros' },
  { id: 3,  nome: 'Presencial' },
  { id: 4,  nome: 'SAC' },
  { id: 5,  nome: 'Site' },
  { id: 6,  nome: 'Telefônico' },
  { id: 7,  nome: 'Através de um técnico' },
  { id: 8,  nome: 'CRM' },
  { id: 9,  nome: 'WhatsApp' },
  { id: 10, nome: 'Facebook' },
  { id: 11, nome: 'Instagram' },
  { id: 12, nome: 'Messenger' },
  { id: 13, nome: 'MKBot Assistant' },
  { id: 14, nome: 'Monitoramento' },
  { id: 15, nome: 'Reclame aqui' },
]

// ---------------------------------------------------------------------------
// Técnicos
// ---------------------------------------------------------------------------

export const MK_TECNICOS: MkTecnico[] = [
  { id: 18328, nome: 'ALEX BERNARDES BARCELOS',            login: 'tec.alex',              tipo: 'Técnico', classificacao: 'Funcionário'   },
  { id: 26801, nome: 'ALYSSON SOARES SILVA',               login: 'tec.alysson',           tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 62176, nome: 'ANTONIO DHIONES DA SILVA VIANA',     login: 'tec.antoniodhiones',    tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 60074, nome: 'BRUNO KENNEDY MARTINS REBELLO',      login: 'tec.brunokenned',       tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 443,   nome: 'BRUNO TANNUS MATIAS',                login: 'tec.bruno',             tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 29418, nome: 'DANILO PESSOA DE ANDRADE',           login: 'tec.danilo',            tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 44649, nome: 'EDSON MARTINS NETO',                 login: 'tec.edson',             tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 51441, nome: 'ERICLES SOUZA DE ARAUJO',            login: 'tec.ericles',           tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 52582, nome: 'EVERTON DO NASCIMENTO BUSSOLARO',    login: 'tec.everton',           tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 30685, nome: 'FELIPE GONCALVES DUARTE',            login: 'tec.felipe',            tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 8508,  nome: 'FLAVIO DA COSTA FERNANDES',          login: 'mz.flavio',             tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 2900,  nome: 'FRANKLIM CARDOSO DA SILVA',          login: 'tec.franklim',          tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 32928, nome: 'GABRIEL ALVES SILVA',                login: 'tec.gabrielalves',      tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 61157, nome: 'GUSTAVO BARCELOS DE SA',             login: 'tec.gustavobarcelos',   tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 54307, nome: 'HALEN EUSTAQUIO CHAVES OLIVEIRA',    login: 'mz.halen',              tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 51279, nome: 'HEMILLY DE OLIVEIRA TOLENTINO TORRES', login: 'tec.tolentino',       tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 31653, nome: 'HUGO HENRIQUE MOREIRA ANDRADE OLIVEIRA', login: 'tec.hugo',          tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 42500, nome: 'ISMAEL DE ALMEIDA MOTA',             login: 'tec.ismael',            tipo: 'Técnico', classificacao: 'Terceirizado'  },
  { id: 13061, nome: 'JAILSON DA ROCHA DE OLIVEIRA',       login: 'tec.jailson',           tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 38461, nome: 'JOAO GABRIEL BELINA LEAO',           login: 'mz.joaobelina',         tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 42951, nome: 'JOAO VITOR LIMA MENDONCA',           login: 'tec.joaovitor',         tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 30275, nome: 'JOELSON BASILIO SANTOS FERREIRA',    login: 'tec.joelson',           tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 16102, nome: 'JUNIOR SOARES DE OLIVEIRA',          login: 'tec.junior',            tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 12277, nome: 'KAROLAYNE PEREIRA DE SOUZA',         login: 'mz.karolayne',          tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 20503, nome: 'KELSON OLIVEIRA SILVA',              login: 'tec.kelson',            tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 35099, nome: 'LEANDRO FERREIRA',                   login: 'tec.leandroferreira',   tipo: 'Técnico', classificacao: 'Terceirizado'  },
  { id: 3,     nome: 'LEANDRO RODRIGUES COELHO DE SOUZA',  login: 'mz.leandro',            tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 13028, nome: 'LEANDRO SILVA ARANTES',              login: 'tec.arantes',           tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 47521, nome: 'LUCAS BRESSANI CASTRO',              login: 'tec.bressani',          tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 13914, nome: 'LUCAS SILVA CARREIRO',               login: 'tec.carreiro',          tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 2215,  nome: 'LUIZ RENATO DE NASCIMENTO SANTOS',   login: 'tec.luizrenato',        tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 30142, nome: 'MAICON DOUGLAS MENDES DANTAS',       login: 'mz.pa',                 tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 13795, nome: 'MANOEL ALVES NASCIMENTO NETO',       login: 'tec.manoel',            tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 1535,  nome: 'MARCELO MACHADO DE SOUZA',           login: 'tec.marcelo',           tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 52836, nome: 'MATHAUS SILVA RODRIGUES BORGES',     login: 'tec.mathaus',           tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 46671, nome: 'MATHEUS AUGUSTO BELIZARIO LEITE',    login: 'tec.matheusaugusto',    tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 8620,  nome: 'MAYKOLL FERNANDES RODRIGUES SILVA',  login: 'tec.maykoll',           tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 25055, nome: 'OTAVIO PAIVA COSTA',                 login: 'tec.otavio',            tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 58151, nome: 'PAULO CÉSAR ALVES SILVA JÚNIOR',     login: 'tec.paulocesar',        tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 38459, nome: 'PEDRO HENRIQUE VILARINHO DE MORAES', login: 'tec.pedro',             tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 1403,  nome: 'RENATO HONORATO DOS SANTOS CARMO',   login: 'tec.renatohonorato',    tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 44331, nome: 'RICHARD MARQUES DE OLIVEIRA',        login: 'tec.richard',           tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 44414, nome: 'SALATIEL DA SILVA OLIVEIRA',         login: 'tec.salatiel',          tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 8448,  nome: 'THALISSON RAMOS DA COSTA',           login: 'tec.thalisson',         tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 54156, nome: 'THALYTA DA SILVA SANTOS',            login: 'mz.thalyta',            tipo: 'Líder',   classificacao: 'Funcionário'   },
  { id: 19816, nome: 'THIAGO MEDEIROS GARCIA',             login: 'tec.thiagomedeiros',    tipo: 'Técnico', classificacao: 'Terceirizado'  },
  { id: 39289, nome: 'VALDIR FELIPE DA SILVA',             login: 'tec.valdir',            tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 33046, nome: 'WAGNER RIBEIRO DOS REIS',            login: 'tec.wagner',            tipo: 'Líder',   classificacao: 'Terceirizado'  },
  { id: 31475, nome: 'WANDERSON CUSTODIO MARTINS',         login: 'tec.wanderson',         tipo: 'Líder',   classificacao: 'Funcionário'   },
]

// ---------------------------------------------------------------------------
// Contratos / Planos ativos
// (apenas os com Ativo=Sim — para consulta em formulários de alteração de plano)
// ---------------------------------------------------------------------------

export const MK_CONTRATOS_ATIVOS: MkContrato[] = [
  { id: 4,   nome: 'MZ BASIC 100 MB - SEM COMBO',                       tipo: 'Internet', ativo: true },
  { id: 3,   nome: '500 MEGA - PRE PAGO',                                tipo: 'Internet', ativo: true },
  { id: 52,  nome: '500MB-FUNCIONARIOS',                                 tipo: 'Internet', ativo: true },
  { id: 57,  nome: 'MZ ULTRA 1GB - SEM COMBO',                          tipo: 'Internet', ativo: true },
  { id: 58,  nome: 'MZ ULTRA AX 1GB + COMBO + MZPLAY PLUS',             tipo: 'Internet', ativo: true },
  { id: 78,  nome: 'MZ ULTRA 1GB + COMBO',                               tipo: 'Internet', ativo: true },
  { id: 80,  nome: 'MZPLAYplus - (ITTV)',                                tipo: 'TV/OTT',   ativo: true },
  { id: 79,  nome: 'MZPLAYplus - STB',                                   tipo: 'TV/OTT',   ativo: true },
  { id: 83,  nome: 'MZ ULTRA + COMBO + MZ PLAY PLUS (APP)',              tipo: 'Internet', ativo: true },
  { id: 85,  nome: '1GB - 2023',                                         tipo: 'Internet', ativo: true },
  { id: 86,  nome: 'MOVEL 5G PRE-25',                                    tipo: 'SVA',      ativo: true },
  { id: 87,  nome: 'MOVEL 5G PRE-20',                                    tipo: 'SVA',      ativo: true },
  { id: 88,  nome: 'MOVEL 5G PRE-15',                                    tipo: 'SVA',      ativo: true },
  { id: 98,  nome: '1000MB + IP',                                        tipo: 'Internet', ativo: true },
  { id: 99,  nome: '400MB + IP',                                         tipo: 'Internet', ativo: true },
  { id: 102, nome: '100 MEGA - PRE PAGO',                                tipo: 'Internet', ativo: true },
  { id: 110, nome: 'DEEZER',                                             tipo: 'TV/OTT',   ativo: true },
  { id: 120, nome: '100 MEGA - 2023',                                    tipo: 'Internet', ativo: false },
  { id: 121, nome: '250 MEGA - 2023',                                    tipo: 'Internet', ativo: true },
  { id: 122, nome: '500 MEGA - 2023',                                    tipo: 'Internet', ativo: true },
  { id: 126, nome: 'WI-FI EX 100',                                       tipo: 'Outros',   ativo: true },
  { id: 127, nome: '03 - WI-FI EXTEND',                                  tipo: 'Outros',   ativo: true },
  { id: 128, nome: '02 - WI-FI EXTEND',                                  tipo: 'Outros',   ativo: true },
  { id: 129, nome: '01 - WI-FI EXTEND',                                  tipo: 'Outros',   ativo: true },
  { id: 158, nome: '150 MEGA - 2024',                                    tipo: 'Internet', ativo: true },
  { id: 159, nome: '300 MEGA - 2024',                                    tipo: 'Internet', ativo: true },
  { id: 160, nome: '600 MEGA - 2024',                                    tipo: 'Internet', ativo: true },
  { id: 161, nome: '1000 MEGA - 2024',                                   tipo: 'Internet', ativo: true },
  { id: 172, nome: 'MZPLAY Gold Completo SVOD',                          tipo: 'TV/OTT',   ativo: true },
  { id: 175, nome: '150 MEGA + IP DIN - 2024',                           tipo: 'Internet', ativo: true },
  { id: 176, nome: '1000 MEGA + IP DIN - 2024',                          tipo: 'Internet', ativo: true },
  { id: 177, nome: '300 MEGA + IP DIN - 2024',                           tipo: 'Internet', ativo: true },
  { id: 178, nome: '600 MEGA + IP DIN - 2024',                           tipo: 'Internet', ativo: true },
  { id: 179, nome: '1000 MEGA + IP FIXO - 2024',                         tipo: 'Internet', ativo: true },
  { id: 184, nome: '600 MEGA + IP FIXO - 2024',                          tipo: 'Internet', ativo: true },
  { id: 195, nome: 'LINK DEDICADO 1000 MB',                              tipo: 'Internet', ativo: true },
  { id: 198, nome: '600 MEGA + WI-FI EXTEND - 2024',                     tipo: 'Internet', ativo: true },
  { id: 199, nome: '1000 MEGA + WI-FI EXTEND - 2024',                    tipo: 'Internet', ativo: true },
  { id: 200, nome: '300 MEGA + WI-FI EXTEND - 2024',                     tipo: 'Internet', ativo: true },
  { id: 209, nome: 'CONEXAO REDUZIDA POR FALTA DE ASSINATURA DE CONTRATO', tipo: 'Internet', ativo: true },
  { id: 210, nome: 'TRANSPORTE',                                         tipo: 'Internet', ativo: true },
  { id: 212, nome: 'TRANSPORTE + LINK DEDICADO',                         tipo: 'Internet', ativo: true },
  { id: 213, nome: 'MOVEL 5G PRE-15 - FUNCIONARIOS',                     tipo: 'SVA',      ativo: true },
  { id: 214, nome: 'MOVEL 5G PRE-20 - FUNCIONARIOS',                     tipo: 'SVA',      ativo: true },
  { id: 215, nome: 'MOVEL 5G PRE-25 - FUNCIONARIOS',                     tipo: 'SVA',      ativo: true },
  { id: 216, nome: '04 - WI-FI EXTEND',                                  tipo: 'Outros',   ativo: true },
  { id: 220, nome: 'MOVEL 5G POS-15',                                    tipo: 'SVA',      ativo: true },
  { id: 221, nome: '14 LINHAS CHIP MOVEL 15G - PRE PAGO',                tipo: 'SVA',      ativo: true },
  { id: 223, nome: '150 MEGA - PRE PAGO',                                tipo: 'Internet', ativo: true },
]

// ---------------------------------------------------------------------------
// Mapeamentos usados em produção (protocolos e O.S.)
// Referência rápida para o registry de formulários
// ---------------------------------------------------------------------------

export const MK_MAP = {
  // Processos relevantes para o suporte técnico
  processos: {
    suporteTecnico: 2,
    semConexao: 12,
    conexaoLenta: 13,
    alterarWifi: 14,       // roteador resetado, config wi-fi
    liberacaoPorts: 15,
    falhaServico: 17,
    outrasSolicitacoes: 18,
    documentos: 25,
    termoResponsabilidade: 38,
  },
  // Processos para o setor financeiro/comercial
  processosComerciais: {
    alteracaoPlano: 5,
    mudancaEndereco: 16,
    segundaVia: 19,
    mudancaVencimento: 20,
    cancelamento: 23,
    desbloqueioConfianca: 27,
    adesao: 29,
    instalacao: 30,
  },
  // Classificações para ABRIR atendimento
  classificacaoAbertura: {
    normal: 3,
    emergencial: 4,
    adesao: 2,
  },
  // Tipos de O.S. mais usados
  tiposOS: {
    instalacao: 2,
    manutencao: 3,
    desligamento: 4,
    mudancaEndereco: 6,
    alteracaoPlano: 7,
    mudancaTitularidade: 8,
    recolhimentoEquipamentos: 9,
    termoResponsabilidade: 12,
    alteracaoPlanoWifiExtend: 18,
    retornoGarantia: 22,
  },
  // Grupos de serviço
  grupos: {
    suporteTecnico: 6,
    equipeMzNet: 10,
    instalacao: 11,
    financeiro: 7,
    noc: 4,
  },
} as const
