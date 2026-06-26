# Códigos MK Solutions — MZ NET
> Referência completa extraída do sistema em 26/06/2026.  
> Use estes códigos ao configurar integrações via Webservice MK.

---

## Regra geral de uso (Protocolo sem O.S.)

| Campo | Valor recomendado |
|---|---|
| `classificacaoId` na **abertura** | **3 (NORMAL)** ou 4 (EMERGENCIAL) |
| `classificacaoId` no **encerramento** | código específico da ocorrência (ver tabela abaixo) |

> ⚠️ Classificações com coluna "Encerramento = SIM" **não devem ser usadas para abrir** atendimento — são para fechar.

---

## 1. Classificações de atendimento

| Código | Nome | Encerramento |
|---|---|---|
| 2 | ADESAO | NÃO |
| 3 | NORMAL | NÃO |
| 4 | EMERGENCIAL | NÃO |
| 5 | FINALIZADO | NÃO |
| 6 | DEFEITO-EQUIPAMENTO | SIM |
| 7 | ROTEADOR-RESETADO | SIM |
| 8 | ONU-SEM-LUZ | SIM |
| 9 | LIBERACAO-CONFIANCA | SIM |
| 10 | SEGUNDA-VIA | SIM |
| 11 | ALTERACAO-PLANO | SIM |
| 12 | ALTERACAO-DATA-VENCIMENTO | SIM |
| 14 | EQUIPAMENTO-TRAVADO | SIM |
| 15 | ABERTURA-PORTAS | SIM |
| 16 | ALTERACAO SENHA WI-FI | SIM |
| 17 | CONFIGURACAO-INSTRUCAO-CLIENTE | SIM |
| 18 | PROBLEMA-EQUIPAMENTO-CLIENTE | SIM |
| 19 | AFERICAO-VELOCIDADE | SIM |
| 20 | TROCA-DE-ROTEADOR | SIM |
| 21 | TROCA-DE-ONU | SIM |
| 22 | TROCA-ONU-ROTEADOR | SIM |
| 23 | PROBLEMA-EXTERNO-FIBRA | SIM |
| 24 | PROBLEMA-EXTERNO-CONECTOR-CTOE | SIM |
| 25 | PROBLEMA-INTERNO-FIBRA | SIM |
| 26 | PROBLEMA-INTERNO-CONECTOR-ONU | SIM |
| 27 | ALTERACAO-ENDERECO-INSTALACAO | SIM |
| 28 | CONFIG-CONEXAO-EQUIPAMENTO | SIM |
| 31 | PROBLEMA-SERVICO-ESPECIFICO | SIM |
| 32 | NENHUM-PROBLEMA-ENCONTRADO | SIM |
| 33 | MASSIVA-ROMPIMENTO-FIBRA | SIM |
| 34 | MENSALIDADE-EM-ATRASO | SIM |
| 35 | REINSTALACAO-DE-EQUIPAMENTO | SIM |
| 36 | MUDANCA-PONTO-INTERNO | SIM |
| 37 | MUDANCA-ENDERECO | SIM |
| 38 | CLIENTE-COBERTURA-WIFI | SIM |
| 39 | MASSIVA-OPERADORA | SIM |
| 40 | MASSIVA-EQUIPAMENTO-BACKBONE | SIM |
| 41 | INTERVENCAO-N3 | SIM |
| 42 | INST. ITTV PLUS APP OU STB | SIM |
| 43 | ENCERRAMENTO VIA APLICATIVO | SIM |
| 44 | INSTALAÇÃO EXECUTADA | SIM |
| 45 | FONTE QUEIMADA (ONU-ROTEADOR) | SIM |
| 66 | CHIP MOVEL NOVO NUMERO | SIM |
| 67 | CHIP MOVEL PORTABILIDADE | SIM |

---

## 2. Processos de atendimento

| Código | Nome |
|---|---|
| 2 | SUPORTE TÉCNICO |
| 4 | FINANCEIRO-COBRANÇA |
| 5 | PROC-ALTERA-PLANO |
| 7 | FINANCEIRO |
| 12 | TECNICO-SEM-CONEXAO |
| 13 | TECNICO-CONEXAO-LENTA |
| 14 | TECNICO-ALTERAR-WIFI |
| 15 | TECNICO-LIBERACAO-PORTAS |
| 16 | PROC-MUDANCA-ENDERECO |
| 17 | TECNICO-FALHA-EM-SERVIÇO-ESPECIFICO |
| 18 | TECNICO-OUTRAS-SOLICITAÇOES |
| 19 | FINANCEIRO-SEGUNDA-VIA |
| 20 | FINANCEIRO-MUDANCA-VENCIMENTO |
| 21 | FINANCEIRO-TROCA-TITULARIDADE |
| 22 | FINANCEIRO-NF |
| 23 | FINANCEIRO-CANCELAMENTO (POR PARTE DO CLIENTE) |
| 24 | FINANCEIRO-SUSPENSAO-CONTRATO |
| 25 | TECNICO-DOCUMENTOS |
| 26 | FINANCEIRO-OUTRAS-SOLICITACOES |
| 27 | FINANCEIRO-DESBLOQUEIO-CONFIANCA |
| 28 | FINANCEIRO-RETIRADA-INADIMPLENTE |
| 29 | PROCESSO-ADESAO |
| 30 | PROC_INSTALACAO |
| 31 | PLANTAO-DESBLOQUEIO-CONFIANCA |
| 32 | PLANTAO-SEGUNDA-VIA |
| 33 | PLANTAO-SEM-CONEXAO |
| 34 | PLANTAO-CONEXAO-LENTA |
| 35 | PLANTAO-OUTROS-ASSUNTOS |
| 36 | PLANTAO-VIABILIDADE |
| 37 | SOLICITACAO-N3 |
| 38 | TECNICO-TERMO-RESPONSABILIDADE |
| 39 | CHIP MOVEL 5G - ADESAO |

---

## 3. Tipos de O.S.

| Código | Nome | Status |
|---|---|---|
| 2 | OS DE INSTALACAO / ATIVACAO | Ativo |
| 3 | MANUTENCAO | Ativo |
| 4 | DESLIGAMENTO DE CLIENTE | Ativo |
| 5 | SOLICITACAO DE CANCELAMENTO | Ativo |
| 6 | MUDANCA DE ENDERECO | Ativo |
| 7 | ALTERAÇÃO DE PLANO | Ativo |
| 8 | MUDANÇA DE TITULARIDADE | Ativo |
| 9 | RECOLHIMENTO DE EQUIPAMENTOS | Ativo |
| 10 | OS DE MANUTENCAO DE INFRAESTRUTURA | Ativo |
| 11 | NEGOCIAÇÃO DE DEBITO | Ativo |
| 12 | TERMO DE RESPONSABILIDADE | Ativo |
| 13 | OS DE PONTO ADICIONAL (COMPRA DE EQUIPAMENTO) | Ativo |
| 14 | MZ PLAY PLUS - ITTV | Inativo |
| 16 | O.S TIPO DE ACESSO "IP" | Ativo |
| 17 | MUD END + ALT PLANO | Ativo |
| 18 | ALTERAÇÃO DE PLANO + WI-FI EXTEND | Ativo |
| 19 | OS DE INSTALACAO + WI-FI EXTEND | Ativo |
| 20 | SETUP BOX (STB) | Ativo |
| 21 | ROKU TV | Ativo |
| 22 | RETORNO EM GARANTIA (07 DIAS) | Ativo |

---

## 4. Grupos / Equipes

| Código | Nome |
|---|---|
| 2 | EQUIPE PRONET |
| 3 | EQUIPE MARCOS |
| 4 | NOC - MZ NET |
| 6 | SUPORTE TÉCNICO - MZ NET |
| 7 | FINANCEIRO - MZ NET |
| 8 | EQUIPE-TERCEIRIZADA |
| 9 | EQUIPE VB |
| 10 | EQUIPE MZ NET |
| 11 | INSTALAÇÃO - MZ NET |

---

## 5. Origem de contato

| Código | Nome |
|---|---|
| 1 | Email |
| 2 | Outros |
| 3 | Presencial |
| 4 | SAC |
| 5 | Site |
| 6 | Telefônico |
| 7 | Através de um técnico |
| 8 | CRM |
| 9 | WhatsApp |
| 10 | Facebook |
| 11 | Instagram |
| 12 | Messenger |
| 13 | MKBot Assistant |
| 14 | Monitoramento |
| 15 | Reclame aqui |

---

## 6. Técnicos

| Código MK | Nome | Login ERP |
|---|---|---|
| 3 | LEANDRO RODRIGUES COELHO DE SOUZA | mz.leandro |
| 443 | BRUNO TANNUS MATIAS | tec.bruno |
| 1403 | RENATO HONORATO DOS SANTOS CARMO | tec.renatohonorato |
| 1535 | MARCELO MACHADO DE SOUZA | tec.marcelo |
| 2215 | LUIZ RENATO DE NASCIMENTO SANTOS | tec.luizrenato |
| 2900 | FRANKLIM CARDOSO DA SILVA | tec.franklim |
| 8448 | THALISSON RAMOS DA COSTA | tec.thalisson |
| 8508 | FLAVIO DA COSTA FERNANDES | mz.flavio |
| 8620 | MAYKOLL FERNANDES RODRIGUES SILVA | tec.maykoll |
| 12277 | KAROLAYNE PEREIRA DE SOUZA | mz.karolayne |
| 13028 | LEANDRO SILVA ARANTES | tec.arantes |
| 13061 | JAILSON DA ROCHA DE OLIVEIRA | tec.jailson |
| 13795 | MANOEL ALVES NASCIMENTO NETO | tec.manoel |
| 13914 | LUCAS SILVA CARREIRO | tec.carreiro |
| 16102 | JUNIOR SOARES DE OLIVEIRA | tec.junior |
| 18328 | ALEX BERNARDES BARCELOS | tec.alex |
| 19816 | THIAGO MEDEIROS GARCIA | tec.thiagomedeiros |
| 20503 | KELSON OLIVEIRA SILVA | tec.kelson |
| 25055 | OTAVIO PAIVA COSTA | tec.otavio |
| 26801 | ALYSSON SOARES SILVA | tec.alysson |
| 29418 | DANILO PESSOA DE ANDRADE | tec.danilo |
| 30142 | MAICON DOUGLAS MENDES DANTAS | mz.pa |
| 30275 | JOELSON BASILIO SANTOS FERREIRA | tec.joelson |
| 31475 | WANDERSON CUSTODIO MARTINS | tec.wanderson |
| 31653 | HUGO HENRIQUE MOREIRA ANDRADE OLIVEIRA | tec.hugo |
| 32928 | GABRIEL ALVES SILVA | tec.gabrielalves |
| 33046 | WAGNER RIBEIRO DOS REIS | tec.wagner |
| 35099 | LEANDRO FERREIRA | tec.leandroferreira |
| 38461 | JOAO GABRIEL BELINA LEAO | mz.joaobelina |
| 38459 | PEDRO HENRIQUE VILARINHO DE MORAES | tec.pedro |
| 39289 | VALDIR FELIPE DA SILVA | tec.valdir |
| 42500 | ISMAEL DE ALMEIDA MOTA | tec.ismael |
| 42951 | JOAO VITOR LIMA MENDONCA | tec.joaovitor |
| 44331 | RICHARD MARQUES DE OLIVEIRA | tec.richard |
| 44414 | SALATIEL DA SILVA OLIVEIRA | tec.salatiel |
| 44649 | EDSON MARTINS NETO | tec.edson |
| 46671 | MATHEUS AUGUSTO BELIZARIO LEITE | tec.matheusaugusto |
| 47521 | LUCAS BRESSANI CASTRO | tec.bressani |
| 51279 | HEMILLY DE OLIVEIRA TOLENTINO TORRES | tec.tolentino |
| 51441 | ERICLES SOUZA DE ARAUJO | tec.ericles |
| 52582 | EVERTON DO NASCIMENTO BUSSOLARO | tec.everton |
| 52836 | MATHAUS SILVA RODRIGUES BORGES | tec.mathaus |
| 54156 | THALYTA DA SILVA SANTOS | mz.thalyta |
| 54307 | HALEN EUSTAQUIO CHAVES OLIVEIRA | mz.halen |
| 58151 | PAULO CÉSAR ALVES SILVA JÚNIOR | tec.paulocesar |
| 60074 | BRUNO KENNEDY MARTINS REBELLO | tec.brunokenned |
| 61157 | GUSTAVO BARCELOS DE SA | tec.gustavobarcelos |
| 62176 | ANTONIO DHIONES DA SILVA VIANA | tec.antoniodhiones |

---

## 7. Planos ativos (Internet)

| Código | Nome |
|---|---|
| 4 | MZ BASIC 100 MB - SEM COMBO |
| 121 | 250 MEGA - 2023 |
| 122 | 500 MEGA - 2023 |
| 158 | 150 MEGA - 2024 |
| 159 | 300 MEGA - 2024 |
| 160 | 600 MEGA - 2024 |
| 161 | 1000 MEGA - 2024 |
| 175 | 150 MEGA + IP DIN - 2024 |
| 176 | 1000 MEGA + IP DIN - 2024 |
| 177 | 300 MEGA + IP DIN - 2024 |
| 178 | 600 MEGA + IP DIN - 2024 |
| 179 | 1000 MEGA + IP FIXO - 2024 |
| 184 | 600 MEGA + IP FIXO - 2024 |
| 195 | LINK DEDICADO 1000 MB |
| 198 | 600 MEGA + WI-FI EXTEND - 2024 |
| 199 | 1000 MEGA + WI-FI EXTEND - 2024 |
| 200 | 300 MEGA + WI-FI EXTEND - 2024 |
| 3 | 500 MEGA - PRE PAGO |
| 102 | 100 MEGA - PRE PAGO |
| 223 | 150 MEGA - PRE PAGO |
| 98 | 1000MB + IP |
| 99 | 400MB + IP |

---

## Combinações em produção (referência rápida)

| Demanda | processoId | classificacaoId (abertura) | tipoOS |
|---|---|---|---|
| Sem conexão — suporte remoto | 12 | 3 | — |
| Conexão lenta | 13 | 3 | — |
| Roteador resetado / Config Wi-Fi | 14 | 3 | — |
| Abertura de portas | 15 | 3 | — |
| Alteração de plano | 5 | 3 | 7 |
| Mudança de endereço | 16 | 3 | 6 |
| Manutenção (visita técnica) | 2 | 3 | 3 |
| Instalação nova | 30 | 2 | 2 |
| Termo de responsabilidade | 38 | 3 | 12 |
