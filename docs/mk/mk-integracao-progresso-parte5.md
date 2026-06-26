# MK Solutions — Progresso da Integração (Parte 5)
> Documento de continuidade — iniciado em: 2026-06-26 | atualizado em: 2026-06-26
> Leia a Parte 1 (`mk-integracao-progresso.md` na raiz), Partes 2, 3 e 4 (`docs/mk/`) antes deste.

---

## Status geral

| Etapa | Status |
|---|---|
| Autenticação MK em produção | ✅ Funcional |
| Buscar cliente por CPF | ✅ Funcional |
| Listar conexões do cliente | ✅ Funcional |
| Criar atendimento com op_abertura | ✅ Funcional |
| Protocolo no gerador — Senha Wi-Fi | ✅ Em produção |
| Protocolo no gerador — 14 formulários de Manutenção (Fase 1) | ✅ Em produção — UI funcional, comentários sendo inseridos |
| Protocolo no gerador — Formulários de Feedback (8 forms) | ✅ Deployado — aguarda MK comentário funcionar |
| Inserir comentário (WSMKAtendimentoComentario) | ✅ Funcional — chunking automático para varchar(300) |
| Criar OS | ⏳ Pendente — aguarda códigos do administrador MK da MZ NET |

---

## 1. Fase 1 — integração MK nos 14 formulários de Manutenção (2026-06-26)

### 1.1 Contexto

Até a Parte 4, a integração MK estava funcionando apenas para **Senha Wi-Fi** (cria atendimento) e **8 formulários de Feedback** (insere comentário em atendimento existente). O objetivo desta fase foi replicar o fluxo de **criação de atendimento + inserção de comentários** para todos os 14 formulários de manutenção.

### 1.2 Função `buildSegmentos` adicionada aos 14 formulários

Cada arquivo de dados de manutenção recebeu uma função `buildXxxSegmentos(rawValues)` que:

1. Chama o `buildXxxTextos` já existente para gerar o texto completo do protocolo
2. Divide o texto nos separadores (`*` ou `=` repetidos ≥5 vezes) via `/^[=*]{5,}$/gm`
3. Retorna `{ info: string; comentarios: string[] }` — o mesmo padrão do Senha Wi-Fi

**Arquivos modificados:**
- `luzVermelha.ts`, `luzVermelhaPj.ts`, `luzVermelhaIsento.ts`
- `fibraExterna.ts`, `ocasConector.ts`, `ocasFibra.ts`
- `sinalAlto.ts`, `realocFibra.ts`, `mudPontoInterno.ts`
- `fonteQueimada.ts`, `roteadorQueimado.ts`, `ontQueimada.ts`, `onuQueimada.ts`, `roteadorReset.ts`

### 1.3 Registry atualizado com códigos MK reais

Todos os 14 formulários foram registrados em `web/src/data/mkProtocolRegistry.ts` com os códigos MK confirmados pelo laboratório:

| Slug | processoId | classificacaoId |
|---|---|---|
| `manut-luz-vermelha` / `pj` / `isento` | 12 (TECNICO-SEM-CONEXAO) | 8 (ONU-SEM-LUZ) |
| `manut-fibra-externa` | 12 | 23 (PROBLEMA-EXTERNO-FIBRA) |
| `manut-ocas-conector` | 12 | 26 (PROBLEMA-INTERNO-CONECTOR-ONU) |
| `manut-ocas-fibra` | 12 | 23 (PROBLEMA-EXTERNO-FIBRA) |
| `manut-sinal-alto` | 12 | 24 (PROBLEMA-EXTERNO-CONECTOR-CTOE) |
| `manut-realoc-fibra` | 18 (TECNICO-OUTRAS-SOLICITACOES) | 25 (PROBLEMA-INTERNO-FIBRA) |
| `manut-mud-ponto-int` | 18 | 36 (MUDANCA-PONTO-INTERNO) |
| `manut-fonte-queimada` | 17 (TECNICO-FALHA-EM-SERVIÇO-ESPECIFICO) | 45 (FONTE-QUEIMADA) |
| `manut-roteador-queimado` | 17 | 20 (TROCA-DE-ROTEADOR) |
| `manut-ont-queimada` / `onu-queimada` | 17 | 21 (TROCA-DE-ONU) |
| `manut-roteador-reset` | 14 (TECNICO-ALTERAR-WIFI) | 7 (ROTEADOR-RESETADO) |

### 1.4 CPF/CNPJ adicionado a todos os 14 formulários

Campo `cpf` inserido em todos os formulários de manutenção (necessário para `WSMKConsultaDoc` identificar o cliente antes de abrir o atendimento). `luzVermelhaIsento` herda via spread de `LUZ_VERMELHA_FIELDS`.

### 1.5 Layout `OsGeneratorPage.tsx` — tabs e botão "Trecho da aba" ocultados

Quando `showMkCards && mkEntry.mode === 'new'`, as abas de seleção de trecho e o botão "Copiar trecho" ficam ocultos — o painel direito passa a ser dominado pelos `MkProtocolCards`. Os textos de O.S. e Agenda continuam acessíveis via accordions abaixo dos cards.

---

## 2. Remoção de acentos em todos os 14 textos de manutenção (2026-06-26)

### 2.1 Problema

O MK HTML-encoda caracteres não-ASCII antes de gravar no `varchar(300)`: `Á` → `&Aacute;` (+7 chars), `ã` → `&atilde;` (+7 chars), etc. Um texto de 230 chars com 8 acentos se tornava 286 chars armazenados — ultrapassando o limite.

### 2.2 Solução

Todos os strings literais nos 14 arquivos `web/src/data/manutencao/*.ts` foram convertidos para ASCII puro via PowerShell (substituição em massa). Exemplos: `Á→A`, `Â→A`, `Ã→A`, `É→E`, `Ê→E`, `Í→I`, `Ó→O`, `Ô→O`, `Ç→C`, `ção→cao`, `não→nao`, `técnico→tecnico`. Os arquivos de testes também foram atualizados.

---

## 3. Comentários em vermelho — wrapper HTML `<font color="#FF0000">` (2026-06-26)

### 3.1 Decisão de design

Os comentários inseridos via API aparecem em vermelho/privado no MK quando embrulhados com `<font color="#FF0000">...</font>`. O `tipo: 1` (privado) é passado, mas o HTML é necessário para a cor visual.

**Regra definida:**
- **Card 0** — campo `info` (ex.: "RAMONY ENTROU EM CONTATO...") → texto puro, sem wrapper
- **Card 1 em diante** — `comentarios[]` → vermelho com wrapper HTML

### 3.2 Implementação

```typescript
// functions/src/mk-suporte.ts
const HTML_RED_PREFIX = '<font color="#FF0000">'
const HTML_RED_SUFFIX = '</font>'
const HTML_RED_STORED_OVERHEAD = 51  // overhead após HTML-encoding do MK

// cards com tipo=1 recebem wrapper; tipo=0 (info) não
const content = tipo === 1
  ? `${HTML_RED_PREFIX}${chunk}${HTML_RED_SUFFIX}`
  : chunk
```

```typescript
// web/src/components/MkProtocolCards.tsx
// handleSendComment — index=1 é o primeiro comentário (diagnóstico = raw/puro)
raw: index === 1
```

---

## 4. Cards independentes — copy sem sequência (2026-06-26)

### 4.1 Problema

Os cards de comentário tinham dependência sequencial: o operador só conseguia copiar o card N após o card N-1 estar marcado como "feito". Isso impedia o time de usar os textos enquanto a integração MK estava em debugging.

### 4.2 Solução (`web/src/components/MkProtocolCards.tsx`)

- Botão de cópia: `disabled={!text}` — sempre habilitado quando o texto existe, independente do estado dos outros cards
- `enabled` para cards de comentário: `!disabled && card0Done` — apenas depende do atendimento ter sido aberto (card 0), não dos comentários anteriores
- Removidos: `opacity` e `color` condicionais que desvaneciam o card desabilitado

---

## 5. Fix `mudPontoInterno.ts` — separadores `'---'` (2026-06-26)

### 5.1 Problema

Os branches `T_TITULAR`, `T_PJ` e `T_TITULAR_TERCEIRO` de `mudPontoInterno.ts` usavam `'---'` (3 traços) como separadores entre blocos. O padrão de split `/^[=*]{5,}$/gm` só reconhece `*` ou `=` repetidos ≥ 5 vezes — portanto `'---'` era ignorado e todo o texto anterior ao primeiro `SEP_STAR` ia inteiro para o bloco `info`, gerando um comentário único gigantesco.

### 5.2 Solução

Todas as 6 ocorrências de `'---'` nos 3 branches foram substituídas por `SEP_STAR` (`'*'.repeat(35)`). Resultado correto para `T_TITULAR`:

| Card | Conteúdo |
|---|---|
| `info` | linha de abertura ("RAMONY ENTROU EM CONTATO POR LIGACAO...") |
| `comentarios[0]` | "CLIENTE SEM BLOQUEIO, SEM REDUCAO E ONU..." |
| `comentarios[1]` | "QUESTIONADO... AMBIENTE... EXPLIQUEI..." |
| `comentarios[2]` | "CONCORDOU COM OS TERMOS..." |

---

## 6. Fix `mkEstimatedLength` — ASCII especiais também são HTML-encodados (2026-06-26)

### 6.1 Root cause do `varchar(300)` failure após remoção de acentos

Após remover todos os acentos, o comentário 2/3 do `mud-ponto-interno` continuou falhando. Análise do log Firebase:

```
comentario: '<font color="#FF0000">QUESTIONADO RAMONY DISSE QUE PQ SIM. AMBIENTE ATUAL: SALA
NOVO AMBIENTE: QUARTO EXPLIQUEI QUE SE CONSEGUIR REINSTALAR OS EQUIPAMENTOS APROVEITANDO O
MESMO DROP (CABO/FIBRA) O CUSTO DO SERVICO E DE R$50,00. EXPLIQUEI TAMBEM QUE CASO DROP</font>'
```

Conteúdo: 236 chars ASCII. Com `contentMax=244`, o chunker não disparou (236 < 244). Porém o MK **também** HTML-encoda chars ASCII especiais antes de gravar:

| Char | Entidade | Chars extras |
|---|---|---|
| `(` | `&#40;` | +4 |
| `/` | `&#47;` | +4 |
| `)` | `&#41;` | +4 |
| `$` | `&#36;` | +4 |

Chunk com `(CABO/FIBRA)` + `R$50,00` → 4 especiais × +4 = **+16 chars** no conteúdo.

Cálculo do tamanho armazenado:
- 236 chars conteúdo + 16 expansão = 252 chars
- + 51 chars do wrapper `<font...>...</font>` após HTML-encoding
- = **303 > 300 → FALHA**

### 6.2 Solução

Atualização de `mkEstimatedLength` em `functions/src/mk-suporte.ts`:

```typescript
// Antes: só contava não-ASCII como expandido
function mkEstimatedLength(text: string): number {
  let len = 0
  for (const ch of text) {
    len += ch.charCodeAt(0) > 127 ? 8 : 1
  }
  return len
}

// Depois: também conta ASCII especiais HTML-encodáveis como 5
const MK_HTML_SPECIALS = new Set(['(', ')', '/', '$', '#', '&', '<', '>', '"', "'"])
function mkEstimatedLength(text: string): number {
  let len = 0
  for (const ch of text) {
    if (ch.charCodeAt(0) > 127) len += 8
    else if (MK_HTML_SPECIALS.has(ch)) len += 5
    else len += 1
  }
  return len
}
```

Com a nova função, o chunk de 236 chars com 4 especiais → estimativa 252 > 244 → chunker divide → ambos os pedaços armazenados ficam abaixo de 300. Testado e confirmado em produção.

### 6.3 Comportamento após fix

O comentário longo é automaticamente dividido em 2 ou 3 partes menores. Cada parte aparece como um comentário separado no MK, todos em vermelho. O texto fica ligeiramente fragmentado — solução permanente dado que o MK confirmou que o limite de 300 chars não será aumentado (ver Seção 7).

---

## 7. Ligação com suporte MK Solutions — limitações confirmadas (2026-06-26)

### 7.1 Busca de atendimento por protocolo — não existe endpoint

Pergunta feita ao suporte MK: existe algum endpoint para buscar `cd_atendimento` a partir do número de protocolo visível (ex.: `2606.28765`)?

**Resposta:** não existe. O suporte confirmou que é um ponto de melhoria no roadmap sem prazo definido.

**Impacto:** o operador **sempre precisará copiar o ID interno do atendimento diretamente do MK ERP** e colar no campo "Cód. atendimento MK" dos formulários de feedback. Não há como automatizar essa etapa.

### 7.2 Limite `varchar(300)` — não será aumentado

Pergunta feita ao suporte MK: possibilidade de aumentar o limite para `varchar(700)` no endpoint `WSMKAtendimentoComentario.rule`.

**Resposta:** aumentar exigiria mudança arquitetural na API — muito trabalhoso, sem prazo.

**Observação feita:** comentários inseridos manualmente pela interface do MK não têm limite de caracteres, o que indica que a tela usa uma coluna diferente (provavelmente `TEXT`) enquanto a API usa uma coluna legada `varchar(300)`. A solicitação foi registrada com MK como melhoria.

**Solução permanente adotada:** chunking automático em `mkInserirComentario` com estimativa corrigida de tamanho armazenado (Seção 6).

---

## 8. Commits desta sessão

```
8ad4030  fix(mk): mkEstimatedLength conta chars especiais ASCII como entidades HTML
1f0397d  fix(manut): substitui separadores '---' por SEP_STAR em mudPontoInterno
e272c4d  fix(mk): cards independentes + contentMax 244 para wrapper HTML vermelho
c633ac9  feat(mk): integracao MK completa — CPF, processos, comentarios vermelhos sem acentos
43789bf  fix(feedback): corrige fluxo MK — comentário em atendimento existente
```

---

## 9. Pendências ao retomar

### Bloqueio externo (MK Solutions)
- [ ] Resposta sobre os códigos internos solicitados (TipoOS, GrupoServico, processos, classificações, técnicos, financeiro) — enviado na Parte 4, Seção 6
- [ ] Confirmar se módulos do fluxo Cadastro (WSMKNovaPessoa, WSMKNovaLead, WSMKNovoContrato, WSMKCriarConexao) estão disponíveis
- [ ] Confirmar se `WSMKCriarOrdemServico.rule` está instalado no servidor

### Bloqueio interno (admin MK da MZ NET)
- [ ] Preencher `suporte/mk-codigos.json` com os IDs reais do painel MK
- [ ] Verificar se técnicos de campo têm cadastro no MK e qual identificador aceita (`CodigoTecnico`)

### Técnico (quando desbloqueado)
- [ ] Ativar `criar_os` com `MK_MODE=real` após obter os códigos internos
- [ ] Implementar `mkCadastro` CF seguindo o plano em `docs/mk/mk-cadastro-integracao-plano.md`
- [ ] Mover `MK_USER_MAP` para Firestore (campo `mkLogin` na tela de criação de usuário) — após validar fluxo completo
- [ ] `manut-visita-testes` — formulário sem protocolo (só O.S. + Agenda), tratar separadamente
- [ ] Formulários `wifi-extend` e `midia-tv` — ainda sem buildSegmentos, pendentes

### Não existe (confirmado com MK)
- ~~Endpoint de busca por protocolo~~ — não existe e sem prazo
- ~~Aumento do varchar(300)~~ — não será feito, chunking automático é a solução permanente

---

## 10. Arquivos relevantes

| Arquivo | Conteúdo |
|---|---|
| `functions/src/mk-suporte.ts` | CF `mkSuporte` — toda lógica da integração, `mkEstimatedLength`, chunking |
| `web/src/components/MkProtocolCards.tsx` | UI de criação de protocolo — cards independentes, copy sempre disponível |
| `web/src/components/MkFeedbackCards.tsx` | UI de feedback — campo cód. atendimento + botão inserir comentário |
| `web/src/data/mkProtocolRegistry.ts` | Registry com 14 entradas de manutenção + 1 senha + 8 feedbacks |
| `web/src/data/manutencao/*.ts` | 14 formulários — todos com `buildSegmentos` e textos ASCII puro |
| `web/src/pages/OsGeneratorPage.tsx` | Renderização condicional por `mode` — MkProtocolCards, MkFeedbackCards ou preview |
