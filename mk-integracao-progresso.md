# MK Solutions — Progresso da Integração
> Documento de continuidade — última atualização: 2026-06-19
> Leia inteiro antes de tocar em qualquer código.

---

## 1. O que é e por que estamos fazendo

O sistema MZ NET (Firebase + React) gera protocolos de O.S. em texto. O objetivo é fazer cada fluxo **criar automaticamente o atendimento e a OS no MK Solutions**, eliminando o copiar e colar manual dos operadores.

Escopo atual: manutenção, alteração de plano, Roku TV, Wi-Fi Extend, senha de rede, feedback, termos — detalhes completos em `mk-integracao-briefing.md`.

**REGRA ATIVA:** Nenhum deploy em produção até o fluxo completo ser validado localmente. Só testes locais via emulador Firebase Functions.

---

## 2. Arquitetura da integração

```
React (web/) ──httpsCallable──▶ Cloud Function mkSuporte (functions/)
                                        │
                                        ▼
                              MK Solutions API (HTTPS)
                              sistema.mznet.com.br
```

- **Credenciais MK** ficam APENAS em `functions/.env` (gitignored). Nunca no bundle React.
- **Shadow mode** (`MK_MODE=shadow`): a função loga o payload no Firestore (`mk_integration_log`) sem chamar o MK. Seguro para testar o fluxo de UI.
- **Real mode** (`MK_MODE=real`): chama o MK de verdade. Cria registros reais.

---

## 3. Arquivos criados/modificados nesta integração

### Cloud Function
| Arquivo | O que faz |
|---|---|
| `functions/src/mk-suporte.ts` | Toda a lógica de integração MK — autenticação, busca de cliente, criação de atendimento e OS |
| `functions/src/index.ts` | Exporta `mkSuporte` |
| `functions/.env` | Credenciais (gitignored) |

### Frontend
| Arquivo | O que faz |
|---|---|
| `web/src/pages/MkTestesPage.tsx` | Página de testes (`/dev/mk`) com 7 cards de teste |
| `web/src/components/RequireDev.tsx` | Guard de rota — só permite acesso a usuários com `profile.isDev === true` |
| `web/src/App.tsx` | Rota `/dev/mk` com `<RequireDev>` |
| `web/src/pages/HomePage.tsx` | Card "Laboratório MK" visível só para `isDev` |
| `web/src/lib/firebase.ts` | `getFirebaseFunctions()` verifica `VITE_USE_FUNCTIONS_EMULATOR` para rotear ao emulador |
| `web/.env.local` | `VITE_USE_FUNCTIONS_EMULATOR=true` — conecta só as Functions ao emulador (auth/Firestore continuam em produção) |

---

## 4. Como rodar o ambiente de testes

### Terminal 1 — emulador de funções
```powershell
cd C:\Users\MZNET\Documents\novo-gerador
firebase emulators:start --only functions --project gerador-de-os-3ba02
```

### Terminal 2 — app React
```powershell
cd C:\Users\MZNET\Documents\novo-gerador\web
npm run dev
```

Acesse: `http://localhost:5173/dev/mk`

**Atenção:** após qualquer mudança em `functions/src/`, fazer build antes de reiniciar o emulador:
```powershell
cd functions
npm run build
```

O emulador NÃO recompila automaticamente.

---

## 5. Configuração atual (`functions/.env`)

```env
MK_BASE_URL=https://sistema.mznet.com.br
MK_TOKEN=54a82e56997b60d3bc36091a71482b4b
MK_WEBSERVICE_PASSWORD=37948d6b8e13701
MK_MODE=real
```

`MK_MODE=real` foi ativado para testes. Para voltar ao modo seguro: `MK_MODE=shadow`.

---

## 6. Autenticação MK

**Endpoint:** `GET /mk/WSAutenticacao.rule`
**Params:** `sys=MK0&token={MK_TOKEN}&password={MK_WEBSERVICE_PASSWORD}&cd_servico=9999`

**Resposta real (campo correto é `Token` com T maiúsculo):**
```json
{ "Token": "abc123...", "Expire": "...", "status": "OK" }
```
⚠️ A documentação antiga diz `tokenRetornoAutenticacao` — está errada. O campo real é `Token`.

---

## 7. Resultados dos testes de descoberta (todos funcionam ✓)

### Teste 2 — Buscar cliente por CPF
**Endpoint:** `GET /mk/WSMKConsultaDoc.rule?sys=MK0&token=...&doc={CPF}`

**Resposta real (estrutura flat, NÃO há objeto `cliente` aninhado):**
```json
{
  "CodigoPessoa": 19934,
  "Nome": "JOSIMAR DA SILVA OLIVEIRA",
  "Email": "josimar_montagem@hotmail.com",
  "Fone": "34998929467",
  "Endereco": "Rua Cláudio Silveira, 500 - Presidente Roosevelt, Uberlândia",
  "CEP": "38401084",
  "Situacao": "Ativo",
  "Outros": [],
  "status": "OK"
}
```
⚠️ O campo é `CodigoPessoa` (não `codigo`). A documentação antiga estava errada.

### Teste 3 — Listar tipos de OS
**Endpoint:** `GET /mk/WSMKOSListaTiposOS.rule`
**Resposta:** `{ "Tipos": [ { "codostipo": 3, "descricao": "MANUTENCAO" }, ... ], "status": "OK" }`

**Tipos relevantes:**
| codostipo | descricao |
|---|---|
| 3 | MANUTENCAO |
| 7 | ALTERAÇÃO DE PLANO |
| 2 | OS DE INSTALACAO / ATIVACAO |
| 6 | MUDANCA DE ENDERECO |
| 21 | ROKU TV |

### Teste 4 — Listar grupos/equipes
**Endpoint:** `GET /mk/WSMKConsultaEquipes.rule`
**Resposta:** `{ "Equipes:": [ ... ] }` ⚠️ A chave tem dois pontos no final: `"Equipes:"` — bug na API deles.

**Grupos principais (código extraído do campo `cd_mestre`):**
| Equipe | Código |
|---|---|
| SUPORTE TÉCNICO - MZ NET | 6 |
| EQUIPE MZ NET | 10 |
| INSTALAÇÃO - MZ NET | 11 |
| NOC - MZ NET | 4 |
| FINANCEIRO - MZ NET | 7 |

**Técnicos do grupo 6 (Suporte):**
| Colaborador | Código |
|---|---|
| FRANKLIM CARDOSO DA SILVA | 2900 |
| KAROLAYNE PEREIRA DE SOUZA | 12277 |
| THALISSON RAMOS DA COSTA | 8448 |
| WANDERSON CUSTODIO MARTINS | 31475 |
| PEDRO CARDOSO NUNES | 55422 |
| KELSON OLIVEIRA SILVA | 20503 |

### Teste 5 — Listar processos
**Endpoint:** `GET /mk/WSMKListaProcessos.rule`
**Resposta:** `{ "processos": [ { "codprocesso": 12, "nome_processo": "TECNICO-SEM-CONEXAO", "subprocessos": [...] }, ... ], "status": "OK" }`

**Processos relevantes:**
| codprocesso | nome_processo |
|---|---|
| 12 | TECNICO-SEM-CONEXAO |
| 13 | TECNICO-CONEXAO-LENTA |
| 14 | TECNICO-ALTERAR-WIFI |
| 18 | TECNICO-OUTRAS-SOLICITACOES |
| 5 | PROC-ALTERA-PLANO |
| 16 | PROC-MUDANCA-ENDERECO |
| 21 | FINANCEIRO-TROCA-TITULARIDADE |

### Teste 6 — Listar classificações
**Endpoint:** `GET /mk/WSMKListaClassificacoesAte.rule`
**Resposta:** `{ "ClassificacoesAtendimento": [ { "codigo": 8, "descricao": "ONU-SEM-LUZ", "encerramento": "Sim" }, ... ], "status": "OK" }`

**Classificações relevantes:**
| codigo | descricao |
|---|---|
| 6 | DEFEITO-EQUIPAMENTO |
| 7 | ROTEADOR-RESETADO |
| 8 | ONU-SEM-LUZ |
| 3 | NORMAL |
| 21 | TROCA-DE-ONU |
| 28 | CONFIG-CONEXAO-EQUIPAMENTO |

---

## 8. Criar atendimento — FUNCIONA ✓

**Endpoint:** `GET /mk/WSMKNovoAtendimento.rule`
**Params obrigatórios:**
```
sys=MK0
token={sessionToken}
cd_cliente={CodigoPessoa}
cd_processo={codprocesso}
cd_classificacao_ate={codigo da classificação}
origem_contato=9          (9 = WhatsApp — padrão MZ NET)
info={descrição do problema}
```

**Resposta real:**
```json
{
  "Cliente": "JOSIMAR DA SILVA OLIVEIRA",
  "CodigoAtendimento": 267754,
  "CodigoCliente": 19934,
  "Protocolo": "2606.22596",
  "status": "OK"
}
```
⚠️ O campo ID é `CodigoAtendimento` (PascalCase). Documentação dizia `cd_atendimento` — estava errada.

**Código no `mkCriarAtendimento`:**
```typescript
const id = data.CodigoAtendimento ?? data.cd_atendimento ?? data.codigo ?? data.id
```

---

## 9. Criar OS — BLOQUEADO ✗

**Endpoint:** `GET /mk/WSMKCriarOrdemServico.rule`
**Erro:** HTTP 500 — página de erro Tomcat genérica (crash no servidor Java do MK)

**Params sendo enviados (já sem `categoria`):**
```
sys=MK0
token={sessionToken}
CodigoCliente={CodigoPessoa}
DescricaoProblema={texto}
CodigoTipoOS={codostipo}
CodigoGrupoServico={cod_equipe}
CodigoTecnico={cod_colaborador}
CodigoAtendimento={CodigoAtendimento}
```

**Hipótese mais provável — `CodigoConexao` ausente:**
A documentação marca `CodigoConexao` como opcional, mas na prática o servidor MK faz crash (NullPointerException no Tomcat) quando o campo está ausente. Toda OS precisa ser vinculada a uma conexão/contrato específico do cliente.

**O que já foi descartado:**
- `categoria=1` — removido, não resolveu
- `undefined` em params — corrigido (o spread espalhava `"undefined"` como string)
- CPF do funcionário sem conexão — testado com cliente real (JOSIMAR), mesmo erro

---

## 10. Próximo passo — obter `CodigoConexao`

Antes de criar a OS, precisa buscar a conexão ativa do cliente. Dois caminhos:

### Caminho A — endpoint de contratos
Provavelmente `WSMKContratosPorCliente.rule` (mencionado na doc como fonte do `cd_contrato`):
```
GET /mk/WSMKContratosPorCliente.rule?sys=MK0&token=...&cd_cliente={CodigoPessoa}
```
Retorna contratos/conexões — pegar o `CodigoConexao` da conexão ativa.

### Caminho B — endpoint de conexões
Pode ser `WSMKConsultaConexoes.rule` ou similar. Verificar em `docs/mk/mk-apis-gerais.txt` no repo `https://github.com/FelipePriet0/mznet-integrations`.

**Fluxo corrigido quando resolvido:**
```
1. auth()                          → sessionToken
2. buscarClientePorCpf()           → CodigoPessoa
3. buscarConexaoAtiva()            → CodigoConexao   ← NOVO
4. criarAtendimento()              → CodigoAtendimento
5. criarOS(CodigoConexao)          → numero da OS
```

---

## 11. Atendimentos de teste criados no MK (limpar)

Durante os testes, atendimentos reais foram criados no MK para o cliente JOSIMAR DA SILVA OLIVEIRA (CPF 08090484697, código 19934). Os IDs conhecidos:

- `267754` — criado em 19/06/2026, processo FINANCEIRO-TROCA-TITULARIDADE, classificação NORMAL

Verificar no MK e encerrar/deletar se ainda estiverem abertos.

---

## 12. Formato correto para testar o Teste 7 (quando `CodigoConexao` estiver disponível)

| Campo | Valor |
|---|---|
| CPF | CPF de cliente real com conexão ativa |
| Tipo OS | `3` (MANUTENCAO) |
| Processo | `12` (TECNICO-SEM-CONEXAO) |
| Classificação | `8` (ONU-SEM-LUZ) |
| Grupo | `6` (SUPORTE TÉCNICO) |
| Técnico | `12277` (KAROLAYNE) ou `2900` (FRANKLIM) |
| Descrição | Qualquer texto não vazio |

---

## 13. Código atual relevante em `functions/src/mk-suporte.ts`

### `mkGet` — inclui body no erro
```typescript
async function mkGet<T>(path, params): Promise<T> {
  // ...
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`MK GET ${path} → HTTP ${res.status}${body ? ` — ${body.slice(0, 300)}` : ''}`)
  }
  return res.json()
}
```

### `mkBuscarClientePorCpf` — campo correto
```typescript
// Resposta é flat — campo CodigoPessoa, não cliente.codigo
if (data.status !== 'OK' || !data.CodigoPessoa) throw new Error(...)
return { codigo: data.CodigoPessoa, nome: data.Nome ?? '', ... }
```

### `mkCriarAtendimento` — endpoint e params corretos
```typescript
// GET WSMKNovoAtendimento.rule, não POST /atendimentos
// Resposta: CodigoAtendimento (não cd_atendimento)
const id = data.CodigoAtendimento ?? data.cd_atendimento ?? data.codigo ?? data.id
```

### `mkCriarOS` — filtra undefined
```typescript
// Spread direto espalhava undefined como string "undefined" na URL
const params: Record<string, string | number> = { sys: 'MK0' }
for (const [k, v] of Object.entries(payload)) {
  if (v !== undefined && v !== null) params[k] = v as string | number
}
```
