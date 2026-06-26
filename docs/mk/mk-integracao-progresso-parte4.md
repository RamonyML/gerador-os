# MK Solutions — Progresso da Integração (Parte 4)
> Documento de continuidade — iniciado em: 2026-06-25 | atualizado em: 2026-06-25
> Leia a Parte 1 (`mk-integracao-progresso.md` na raiz), Parte 2 e Parte 3 (`docs/mk/`) antes deste.

---

## Status geral

| Etapa | Status |
|---|---|
| Autenticação MK em produção | ✅ Funcional |
| Buscar cliente por CPF | ✅ Funcional |
| Listar conexões do cliente | ✅ Funcional |
| Criar atendimento com op_abertura | ✅ Funcional |
| Protocolo no gerador — Senha Wi-Fi | ✅ Em produção |
| Protocolo no gerador — Formulários de Feedback (Fase 1) | ✅ Deployado — aguarda MK corrigir servidor |
| Inserir comentário (WSMKAtendimentoComentario) | ❌ Bloqueado — módulo ativado mas não configurado no servidor MK |
| Criar OS | ⏳ Pendente — aguarda códigos do administrador MK da MZ NET |

---

## 1. O que foi feito em 2026-06-25 (sessão anterior)

### 1.1 Ligação para o MK Solutions — confirmação do módulo especial

Em vez de aguardar resposta pelo ticket (que estava demorando), a equipe MZ NET ligou diretamente para o suporte MK Solutions. O resultado foi:

- **Confirmado:** `WSMKAtendimentoComentario.rule` é uma **"API especial"** — requer módulo separado que não está incluso no contrato padrão.
- **Liberado:** Pedro Overbeck liberou **2 APIs para teste de 7 dias** (início: 2026-06-24):
  1. `WSMKAtendimentoComentario.rule` — comentários em atendimentos
  2. `WSMKCriarCadastro` — criar cadastro de cliente (para uso em outro projeto, não no gerador de O.S.)

> **Atenção:** a janela de 7 dias é a oportunidade para testar e validar. Se funcionar, é necessário contratar o módulo permanentemente.

### 1.2 Documentação oficial obtida

O PDF `MK30-APIs especiais-250626-112436.pdf` (exportado do Confluence MK Solutions) foi colocado em `docs/documentacao_mk/mznet-integrations-main/` e lido nesta sessão.

**Spec confirmada para `WSMKAtendimentoComentario.rule`:**

```
Pré-requisitos: sistema atualizado na release nº 60 ou superior

URL: IP:PORTA/mk/WSMKAtendimentoComentario.rule?sys=MK0&token=&cd_atendimento=&comentario=
```

| Parâmetro | Obrigatório | Detalhe |
|---|:---:|---|
| `token` | ✓ | retorno da autenticação |
| `cd_atendimento` | ✓ | código do atendimento |
| `comentario` | ✓ | texto do comentário |
| `user` | — | login MK do operador (release 64.9+) |
| `tipo` | — | 1 = privado / 2 = público (default: privado) |

**Resposta de sucesso (HTTP 200):**
```json
{ "CodigoAtendimento": 14758, "Comentario": "testeAPI", "status": "OK" }
```

**Resposta de erro válida — atendimento não encontrado ou encerrado (HTTP 200):**
```json
{ "Mensagem": "Dados não localizados.", "Num. ERRO": "003", "status": "ERRO" }
```

> Nota importante: quando o atendimento não existe ou está encerrado, o MK retorna **HTTP 200** com `"status": "ERRO"` no body. O HTTP 500 que recebemos é diferente disso — é uma falha do servidor antes de qualquer validação de parâmetros.

### 1.3 Testes realizados com o módulo liberado

Após a liberação, testamos em produção. O erro persiste:

```
javax.servlet.ServletException: O objeto (Tabela) deve ter um valor definido!
    wfr.web.ExternalRulesServlet.process(SourceFile:321)
    wfr.web.ExternalRulesServlet.doPost(SourceFile:118)
```

Testamos com `tipo=1` e com `tipo=2` — o erro é **idêntico nos dois casos**. Isso confirma que o problema **não está nos parâmetros** enviados: é uma configuração de tabela no servidor MK que está ausente. O módulo foi ativado mas não parametrizado.

**Diagnóstico:** a falha ocorre em `ExternalRulesServlet.process:321` antes de qualquer lógica do endpoint ser executada. Sugere que ao processar a regra WFR interna, o servidor tenta ler um objeto de tabela (configuração do módulo de comentários?) que está nulo.

### 1.4 Operador Karolayne adicionada ao mapa

```typescript
'kV7VX6qkQObt5cZcF0cb2VRzDBn2': 'mz.karolayne',
```

O mapa agora tem **21 colaboradores** mapeados em `MK_USER_MAP`.

### 1.5 `tipo` atual em produção

O código está com `tipo: 2` (público) para comentários de feedback. Confirmado pelo operador que os comentários de suporte devem ser públicos.

---

## 2. Correção de layout — formulário Senha Wi-Fi (2026-06-25)

O card "COMENTÁRIO 1 DE 2" ficava cortado no painel direito quando o formulário de Senha/SSID Wi-Fi estava aberto com zoom normal.

**Causa raiz:** `maxHeight: calc(100vh - 96px)` + `overflow: auto` sem `minHeight: 0` no flex container — itens flex têm `min-height: auto` por padrão, impedindo o shrink, então o overflow nunca ativava.

**Fix aplicado:**
- `OsGeneratorPage.tsx`: adicionado `showMkCards` — quando true, o Paper do painel direito recebe `position: 'static'` e `maxHeight: 'none'`
- `MkProtocolCards.tsx`: removido `flex: 1`, `overflow: auto` e `minHeight` do Stack externo

Corrigido, deployado em produção.

---

## 3. Planejamento da integração Cadastro/Análise (2026-06-25)

Paralelamente ao suporte técnico, foi planejada a integração para o setor de Análise/Cadastro. Essa integração é separada do gerador de O.S. e envolve o sistema de Felipe (PostgreSQL).

**Premissa:** o trigger vem do sistema de Felipe (quando a ficha é movida para "Finalizados" + status selecionado). O sistema de Felipe chama nossa Cloud Function `mkCadastro`, que orquestra todas as chamadas ao MK ERP.

**Três fluxos:**
- `aprovada` → 9 chamadas em sequência (Cadastro → Lead → Contrato → Conexão → O.S. → Protocolo → Comentário → Encaminhar subprocesso)
- `negada` → 1 chamada (fechar protocolo com comentário do motivo)
- `cancelada` → 1 chamada (fechar protocolo com comentário do motivo)

**Documentos gerados:**
- `mk-cadastro-arquitetura.html` (raiz) — documento visual com fluxo, contrato de API, status de cada etapa
- `docs/mk/mk-cadastro-integracao-plano.md` — briefing para a LLM do sistema de Felipe (PostgreSQL)

**Estado atual das etapas da integração Cadastro:**

| Etapa | Estado |
|---|---|
| Verificar cadastro (WSMKConsultaDoc) | ✅ Funcional |
| Criar/reativar cliente (WSMKNovaPessoa) | ⏳ Aguarda MK confirmar módulo |
| Criar Lead (WSMKNovaLead) | ⏳ Aguarda MK confirmar módulo |
| Criar Contrato (WSMKNovoContrato) | ⏳ Aguarda MK confirmar módulo |
| Criar Conexão (WSMKCriarConexao) | ⏳ Aguarda módulo + códigos internos |
| Gerar texto da O.S. | ✅ Implementável (algoritmo interno da CF) |
| Criar O.S. (WSMKCriarOrdemServico) | ⏳ Aguarda módulo + códigos internos |
| Abrir protocolo (WSMKNovoAtendimento) | ✅ Funcional em produção |
| Comentar / encerrar (WSMKAtendimentoComentario) | ❌ Bloqueado — mesmo bug do suporte |

---

## 4. Melhoria planejada — mapeamento UID → login MK via Firestore

O `MK_USER_MAP` atual é estático (hardcoded na CF). Toda adição de operador exige editar código + rebuild + deploy.

**Solução sugerida e aprovada:** adicionar campo `mkLogin` no documento do usuário no Firestore. Na tela de criação/edição de usuário do gerador, exibir campo "Login MK ERP". A CF passaria a fazer `db.collection('users').doc(uid).get()` para obter o `mkLogin`.

**Vantagem:** admins não-técnicos conseguem cadastrar novos operadores sem envolver desenvolvimento.

**Quando implementar:** após confirmar que o endpoint de comentário está funcionando (não faz sentido refatorar o mapeamento antes de validar o fluxo completo).

---

## 5. Fase 1 — Integração MK nos formulários de Feedback (2026-06-25)

### 5.1 Contexto

O gerador de O.S. já tinha integração MK funcional para o formulário de **Alteração de Senha Wi-Fi** (cria novo atendimento via `WSMKNovoAtendimento`). O objetivo desta fase foi replicar a integração para os 8 formulários de feedback. A diferença fundamental: feedback não cria um novo atendimento — ele **insere um comentário num atendimento já existente**.

### 5.2 Arquitetura implementada — `MK_PROTOCOL_REGISTRY` com discriminated union

Antes desta sessão, o registry tinha um único tipo de entrada. Após a refatoração:

```typescript
// web/src/data/mkProtocolRegistry.ts

export type MkProtocolNewEntry = {
  mode: 'new'
  processoId: number
  classificacaoId: number
  buildSegmentos: (v: Record<string, unknown>) => { info: string; comentarios: string[] }
}

export type MkProtocolCommentEntry = {
  mode: 'comment'
  buildText: (v: Record<string, unknown>) => string
}

export type MkProtocolEntry = MkProtocolNewEntry | MkProtocolCommentEntry
```

- `mode: 'new'` → cria atendimento (ex.: `senha-altera-senha`) — usa `MkProtocolCards`
- `mode: 'comment'` → insere comentário em atendimento existente (8 feedbacks) — usa `MkFeedbackCards`

Os 8 formulários de feedback ficaram assim no registry:

```typescript
'feedback-sem-sucesso':    { mode: 'comment', buildText: (v) => buildFeedbackSemSucessoTextos(v).feedbackSemSucessoTexto },
'feedback-man-externa':    { mode: 'comment', buildText: (v) => buildFeedbackManExternalTextos(v).feedbackManExternalTexto },
// ... (padrão idêntico para os demais 6)
```

### 5.3 Formulários de feedback — campo CPF removido

A implementação inicial (errada) adicionou CPF aos formulários de feedback pressupondo que seria necessário identificar o cliente. Como o fluxo correto opera sobre um atendimento existente (não cria novo), o CPF é desnecessário. **Todos os 8 formulários tiveram o campo CPF removido.**

Arquivos alterados: `altplan.ts`, `manExternal.ts`, `manOcasionado.ts`, `mudancaPonto.ts`, `semSucesso.ts`, `stbRoku.ts`, `trocaEquip.ts`, `wifiExtend.ts`.

As funções `buildFeedbackXxxSegmentos` também foram removidas — eram wrappers desnecessários para o novo modelo de `buildText`.

### 5.4 Componente `MkFeedbackCards`

Criado em `web/src/components/MkFeedbackCards.tsx`.

**Fluxo no painel direito:**
1. Operador preenche o formulário normalmente (gera texto de feedback)
2. No painel direito, aparece o card de comentário com o texto gerado
3. Operador abre o atendimento no MK ERP, copia o **Código do Atendimento** (ID interno numérico, ex.: `268489`) — **não o número do protocolo**
4. Cola no campo "Cód. atendimento MK" e clica "Inserir no MK"
5. CF chama `WSMKAtendimentoComentario.rule` com `tipo: 2` (público)

> **Nota:** o botão "Copiar texto" sempre funciona como fallback manual.

### 5.5 Descoberta: `WSMKConsultaAtendimento.rule` não existe

Durante o desenvolvimento, foi tentada a implementação de um botão "Carregar" que buscaria o atendimento pelo número de protocolo visível (ex.: `2606.28765`). A chamada retornou **HTTP 500**.

Após leitura completa do PDF oficial (`MK30-APIs especiais-250626-112436.pdf`) e do catálogo de APIs gerais, **confirmou-se que não existe nenhum endpoint MK para buscar um atendimento por número de protocolo**. O PDF lista todos os endpoints disponíveis e nenhum deles oferece essa funcionalidade.

**Pergunta encaminhada ao MK Solutions** (ver Seção 6): verificar se existe algum endpoint não documentado ou alternativa (listagem com filtro, busca por `cd_cliente` + data etc.).

### 5.6 `OsGeneratorPage.tsx` — renderização condicional por mode

```typescript
// Antes: sempre MkProtocolCards
const showMkCards = !!mkEntry && !!mkSegmentos

// Depois: discriminado por mode
const mkSegmentos = useMemo(() => {
  if (!mkEntry || mkEntry.mode !== 'new') return null
  return mkEntry.buildSegmentos(values)
}, [mkEntry, values])

const mkFeedbackText = useMemo(() => {
  if (!mkEntry || mkEntry.mode !== 'comment') return null
  return mkEntry.buildText(values)
}, [mkEntry, values])

const showMkCards = !!mkEntry  // true para ambos os modes
```

No render:
- `mode === 'new'` → `<MkProtocolCards>` (fluxo senha wi-fi)
- `mode === 'comment'` → `<MkFeedbackCards>` (fluxo feedback)
- sem entry → preview de texto puro

### 5.7 Commit e deploy

```
43789bf fix(feedback): corrige fluxo MK — comentário em atendimento existente
```

Deployado em produção em 2026-06-25. TypeScript: zero erros. Testes: 275/275 passam (5 falhas pré-existentes em `extendZte.test.ts` não relacionadas).

---

## 6. Comunicação com MK Solutions — solicitação unificada enviada (2026-06-25)

Foi preparada e enviada uma solicitação unificada combinando as necessidades do sistema de Felipe (Cadastro/Análise) e do gerador de O.S. (Suporte Técnico). Texto completo abaixo para referência:

---

> Poderiam nos informar os seguintes códigos para parametrização das nossas integrações via API?
>
> **Técnico / Rede:**
> - Código do concentrador "Hawuey Patricia"
> - Código do ponto de acesso da Zona Leste
> - Código do ponto de acesso da Zona Oeste
> - Código do tipo de O.S. "Instalação e Ativação"
> - Código do tipo de O.S. "Visita Técnica / Manutenção" (suporte ao cliente)
> - Código do grupo de serviço da equipe de instalação
> - Código do grupo de serviço da equipe de suporte técnico
> - Código do técnico (ou equipe) responsável pela instalação
> - Códigos dos técnicos de campo (ou confirmação se `CodigoTecnico` aceita login do ERP, como `mz.halyson`, ou somente ID numérico)
>
> **Financeiro / Contrato:**
> - Código da regra de vencimento utilizada
> - Código da régua de bloqueio por inadimplência
> - Código da forma de pagamento padrão (boleto/PIX)
> - Código do perfil de pagamento
> - Código do método de faturamento
> - Código do plano de contas
> - Código do plano de acesso 600 Mega (e demais planos que utilizamos, se houver)
>
> **CRM / Atendimento:**
> - Código do subprocesso "Aprovado Instalação Gratuita"
> - Código do subprocesso "Aprovado Compra de Equipamento"
> - Código do processo utilizado para abertura de atendimentos de suporte técnico
> - Código da classificação de abertura para suporte técnico
> - Código do processo e classificação para atendimentos de feedback pós-O.S.
>
> **Dúvida técnica — Consulta de atendimento por protocolo:**
> Existe algum endpoint nas APIs que permita buscar um atendimento pelo número de protocolo (ex.: `2606.28765`) e retornar o `CodigoAtendimento` interno?
> Precisamos disso para que o operador insira o número de protocolo visível no ticket e o sistema localize automaticamente o `cd_atendimento` antes de chamar o `WSMKAtendimentoComentario.rule`.
> Caso não exista esse endpoint, existe alguma alternativa (ex.: busca por `cd_cliente` + data, ou endpoint de listagem de atendimentos com filtro)?
>
> **Atualização sobre `WSMKAtendimentoComentario.rule`:**
> Conforme informado anteriormente, o módulo foi liberado mas o endpoint continua retornando HTTP 500 com a exceção:
> `javax.servlet.ServletException: O objeto (Tabela) deve ter um valor definido!`
> `wfr.web.ExternalRulesServlet.process(SourceFile:321)`
> Isso ocorre com `tipo=1` e `tipo=2` — o erro é idêntico. A chamada ao `WSMKNovoAtendimento.rule` no mesmo servidor funciona normalmente. Poderiam verificar nos logs do Tomcat (`catalina.out`) o que está nulo na linha 321 no momento de uma chamada ao `WSMKAtendimentoComentario`?
>
> Esses dados são necessários para parametrizar corretamente as chamadas às APIs `WSMKNovoContrato`, `WSMKCriarConexao`, `WSMKCriarOrdemServico`, `WSMKNovoAtendimento` e `WSMKAtendimentoComentario`.
>
> Obrigado!

---

## 7. Documentação `WSMKCriarOrdemServico` — encontrada e revisada

A documentação completa do endpoint de criação de O.S. foi localizada em `mk-apis-especiais.txt` (Seção 6 do PDF oficial).

**URL:**
```
IP:PORTA/mk/WSMKCriarOrdemServico.rule?sys=MK0&token=&CodigoCliente=&CodigoConexao=&CodigoContrato=
  &DescricaoProblema=&CodigoTipoOS=&CodigoTecnico=&CodigoGrupoServico=&CodigoAtendimento=&categoria=
```

| Parâmetro | Obrigatoriedade | Detalhe |
|---|:---:|---|
| `token` | ✓ | token de autenticação |
| `CodigoCliente` | ✓ | código do cliente no MK |
| `DescricaoProblema` | ✓ | texto descritivo da O.S. |
| `CodigoTipoOS` | ✓ | ID do tipo de O.S. (a confirmar) |
| `CodigoTecnico` | ✓ | ID ou login do técnico responsável |
| `CodigoGrupoServico` | ✓ | ID do grupo de serviço |
| `categoria` | ✓ a partir da release 74 | `1` = O.S. de cliente / `2` = O.S. de provedor |
| `CodigoConexao` | Opcional | buscado automaticamente se omitido |
| `CodigoContrato` | Opcional | — |
| `CodigoAtendimento` | Opcional | vincula a O.S. ao atendimento criado antes |

**Parâmetro adicionado ao código:** `categoria: 1` incluído no call `mkCriarOS` em `functions/src/mk-suporte.ts`.

A Seção 7 do PDF documenta também o `ALTERAR OS` (endpoint REST `PUT /os`), mas **não será utilizado** — o fluxo da MZ NET só precisa criar O.S., não alterar nem encerrar via API.

---

## 8. Cruzamento com `mznet-integrations-main`

Após levantar os parâmetros necessários para `WSMKCriarOrdemServico`, foi feito o cruzamento com os arquivos já preparados em `docs/documentacao_mk/mznet-integrations-main/`:

### Estado do `suporte/mk-codigos.json`

| Campo | Itens mapeados | Estado |
|---|---|---|
| `tiposOS` | 14 tipos (visita_tecnica_manutencao, instalacao, loja, altplan, etc.) | todos `null` |
| `gruposServico` | 3 grupos (suporte_tecnico, instalacao, loja) | todos `null` |
| `classificacoesAtendimento` | 6 classificações | todos `null` |
| `CodigoTecnico` | **não está no arquivo** | lacuna identificada |

Todos os IDs precisam ser obtidos no painel do MK Solutions pela equipe administrativa da MZ NET e preenchidos neste JSON antes de qualquer ativação em produção.

### Impacto no `suporte/PROGRESSO.md` (186 tarefas)

| IDs mais críticos a obter | Tarefas desbloqueadas |
|---|---|
| `visita_tecnica_manutencao` + grupo `suporte_tecnico` | ~60 tarefas (luz vermelha, lentidão, mudança de ponto...) |
| `visita_tecnica_instalacao` + grupo `instalacao` | ~30 tarefas (instalações, Wi-Fi Extend, STB, Roku...) |
| `classif.manutencao` + `classif.alteracao_plano` | necessário para o atendimento que precede a O.S. |

### `CodigoTecnico` — lacuna e hipótese de cruzamento

O parâmetro `CodigoTecnico` é o técnico que **executará** a O.S. (o de campo, não o operador do suporte que abre). A lacuna é que:

- O `mk-codigos.json` não prevê esse campo em nenhum lugar
- A agenda de manutenção do gerador de O.S. tem os técnicos **só pelo primeiro nome**
- O MK Solutions usa **ID numérico ou login** para identificar o técnico

**O que precisaria ser verificado antes de implementar:**
1. Os técnicos de campo têm cadastro ativo no MK Solutions?
2. O MK aceita login de texto (como `mz.halyson`) ou só ID numérico para `CodigoTecnico`?
3. Se aceitar login: mapear `primeiroNome → mkLogin` (similar ao `MK_USER_MAP` dos operadores)
4. Se aceitar só ID numérico: consultar lista de técnicos via API antes de criar a O.S.

**Status:** aguardando resposta da solicitação enviada ao MK Solutions (Seção 6).

---

## 9. Pendências ao retomar

### Bloqueio externo (MK Solutions)
- [ ] MK Solutions configurar a tabela faltante para `WSMKAtendimentoComentario.rule` (servidor não configurado após liberação do módulo)
- [ ] Quando resolvido: testar `inserir_comentario` com `tipo: 2` nos formulários de feedback
- [ ] Resposta sobre endpoint de busca por protocolo (ou alternativa)
- [ ] Confirmação dos códigos solicitados (TipoOS, GrupoServico, processos, classificações, técnicos, financeiro)
- [ ] Confirmar se os módulos do fluxo Cadastro (WSMKNovaPessoa, WSMKNovaLead, etc.) estão disponíveis
- [ ] Confirmar se `WSMKCriarOrdemServico.rule` está instalado no servidor

### Bloqueio interno (admin MK da MZ NET)
- [ ] Preencher `suporte/mk-codigos.json` com os IDs reais do painel MK (CodigoTipoOS, CodigoGrupoServico, classificações)
- [ ] Verificar se técnicos de campo têm cadastro no MK e qual identificador aceita (`CodigoTecnico`)

### Técnico (quando desbloqueado)
- [ ] Testar `WSMKAtendimentoComentario.rule` assim que MK configurar o servidor
- [ ] Se confirmado endpoint de busca por protocolo: implementar `buscar_atendimento` na CF e atualizar `MkFeedbackCards` para buscar automaticamente pelo número do protocolo (eliminando a necessidade de o operador informar o ID interno)
- [ ] Ativar `criar_os` com `MK_MODE=real` após obter os códigos internos
- [ ] Implementar `mkCadastro` CF seguindo o plano em `docs/mk/mk-cadastro-integracao-plano.md`
- [ ] Mover `MK_USER_MAP` para Firestore (campo `mkLogin` na tela de criação de usuário) — após validar endpoint de comentário

---

## 10. Arquivos relevantes

| Arquivo | Conteúdo |
|---|---|
| `functions/src/mk-suporte.ts` | CF `mkSuporte` — toda lógica da integração suporte técnico |
| `web/src/components/MkProtocolCards.tsx` | UI de criação de protocolo — seletor de conexão, botão "Inserir no MK" |
| `web/src/components/MkFeedbackCards.tsx` | UI de feedback — campo cód. atendimento + botão inserir comentário |
| `web/src/data/mkProtocolRegistry.ts` | Registry discriminado: `mode: 'new'` (senha wi-fi) e `mode: 'comment'` (feedbacks) |
| `web/src/pages/OsGeneratorPage.tsx` | Gerador de O.S. — renderiza MkProtocolCards ou MkFeedbackCards por mode |
| `mk-cadastro-arquitetura.html` | Planejamento visual da integração Cadastro/Análise |
| `docs/mk/mk-cadastro-integracao-plano.md` | Briefing para a LLM do sistema de Felipe |
| `docs/documentacao_mk/mznet-integrations-main/MK30-APIs especiais-250626-112436.pdf` | Documentação oficial das APIs especiais MK Solutions |
| `docs/documentacao_mk/mznet-integrations-main/mk-apis-especiais.txt` | Versão texto extraída do PDF |
