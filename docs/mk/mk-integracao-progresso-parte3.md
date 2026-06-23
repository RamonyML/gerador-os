# MK Solutions — Progresso da Integração (Parte 3)
> Documento de continuidade — última atualização: 2026-06-23 (revisão 2)
> Leia a Parte 1 (`mk-integracao-progresso.md` na raiz) e a Parte 2 (`docs/mk/mk-integracao-progresso-parte2.md`) antes deste.

---

## Status geral

| Etapa | Status |
|---|---|
| Autenticação MK em produção | ✅ Funcional |
| Buscar cliente por CPF | ✅ Funcional |
| Listar conexões do cliente | ✅ Funcional (implementado nesta sessão) |
| Criar atendimento com op_abertura | ✅ Funcional — release ≥ 64.9 confirmada |
| Inserir comentário | ❌ Bloqueado — bug server-side no MK (escalado) |
| Criar OS | ⏳ Pendente — aguarda códigos do administrador MK da MZ NET |

---

## 1. O que foi feito nesta sessão (2026-06-23)

Esta sessão cobriu três grandes frentes: implementação de endpoints pendentes, identificação definitiva de um bug server-side no MK e organização de toda a comunicação técnica com o MK Solutions.

### 1.1 Commits desta sessão

#### `bac954f` — Briefing inicial para o MK Solutions
- Criação do `mk-webservices.md` como documento técnico formal para envio à equipe MK Solutions
- Lista todos os endpoints com status, identifica o bloqueio em `WSMKCriarOrdemServico.rule` (CodigoConexao)

#### `4c51d15` — Maior commit: seletor de conexão, comentário, docs e priorizacao
- **`web/src/components/MkProtocolCards.tsx`**: implementado seletor de conexão ativa antes de abrir protocolo; botão "Inserir no MK" em cada card de comentário (fallback manual enquanto o endpoint de comentário está quebrado)
- **`functions/src/mk-suporte.ts`**: adicionadas ações `buscar_conexao` e `inserir_comentario`; parâmetro `user` no comentário; parâmetro `tipo: 2` (público) no comentário
- **`web/src/pages/MkTestesPage.tsx`**: card 3 para testar `buscar_conexao`, campo `codigoConexao` no formulário de criar OS
- **`mk-webservices-carta.html`**: criado documento HTML estilizado para impressão como PDF — versão visual da carta técnica para o MK Solutions
- **`mk-priorizacao.html`**: atualizado — conexão e atendimento marcados como concluídos; bloqueios atualizados
- **`docs/documentacao_mk/`**: documentação oficial do MK Solutions clonada localmente no repositório

#### `2899869` — Ajuste de assinatura na carta
- Nome da assinatura corrigido de "MZ NET Telecom — Setor de T.I." para "MZ NET — Suporte N3 · Ramony Lima"

#### `3dea24c` — Mapeamento Firebase UID → login MK ERP por colaborador
- Substituição do `MK_USER_LOGIN` global (login único para todos) por `MK_USER_MAP` estático
- 20 colaboradores mapeados: cada ação no MK agora aparece com o nome do operador que a realizou
- `op_abertura` passado na criação de atendimento; `user` passado na inserção de comentário
- **Deploy em produção realizado após validação** (atendimento #268168 confirmado com operador correto)

---

## 2. Descobertas técnicas importantes

### 2.1 WSMKConexoesPorCliente.rule — campo retornado diferente da documentação

A documentação MK menciona o campo `CodigoConexao`, mas o JSON real retornado pela API usa **`codconexao`** (todo lowercase). O código já trata isso via fallback:

```typescript
type MkConexaoItem = {
  CodigoConexao?: number
  Codigo?: number
  codconexao?: number   // nome real retornado pela API MK
  contrato?: number
  username?: string
  bloqueada?: string
  motivo_bloqueio?: string | null
  tecnologia?: string
}
```

O campo `contrato` da conexão é o que deve ser passado como `cd_contrato` no `WSMKNovoAtendimento.rule`. O campo `codconexao` vai em `conexao_associada`.

### 2.2 op_abertura — confirmado funcional (release ≥ 64.9)

O parâmetro `op_abertura` em `WSMKNovoAtendimento.rule` foi testado em produção e registrou o operador `mz.ramony` corretamente no atendimento #268168. Isso confirma que a instalação MK da MZ NET está na **release 64.9 ou superior**.

```
GET /mk/WSMKNovoAtendimento.rule
  ?sys=MK0
  &token=<sessao>
  &cd_cliente=28903
  &cd_processo=14
  &cd_classificacao_ate=3
  &origem_contato=9
  &info=<texto>
  &cd_contrato=46364
  &conexao_associada=35525
  &op_abertura=mz.ramony   ← registrado corretamente ✅
```

### 2.3 WSMKAtendimentoComentario.rule — bug server-side confirmado

Este é o maior bloqueio identificado nesta sessão. O endpoint retorna HTTP 500 em **todas as combinações** de parâmetros e métodos HTTP testados:

| Combinação testada | Método | JSESSIONID | Resultado |
|---|---|---|---|
| Somente campos obrigatórios (token, cd_atendimento, comentario) | GET | Não | ❌ 500 |
| Com `tipo=1` | GET | Não | ❌ 500 |
| Com `tipo=2` | GET | Não | ❌ 500 |
| Com `user=mz.ramony` | GET | Não | ❌ 500 |
| Tokens de sessão diferentes | GET | Não | ❌ 500 |
| Seguindo exemplo do MK Solutions (`tipo=1`, POST, body vazio) | POST | Sim (`CE715CC5...`) | ❌ 500 |

O crash sempre ocorre na mesma linha interna, independente do método:
```
javax.servlet.ServletException: O objeto (Tabela) deve ter um valor definido!
  wfr.web.ExternalRulesServlet.process(SourceFile:321)
  wfr.web.ExternalRulesServlet.doPost(SourceFile:118)   ← doPost após ajuste
```

**Conclusão:** A falha ocorre em `process:321`, antes de qualquer validação de parâmetros, indicando que a regra WFR interna tenta acessar uma tabela de banco de dados que retorna nulo. Não é um problema de parâmetros, método HTTP ou sessão — é um bug ou configuração ausente no servidor MK da MZ NET. O parâmetro `tipo_comentario` (nome errado na documentação antiga) também foi testado e descartado; o nome correto é `tipo`.

**Estado atual do código:** a Cloud Function agora envia POST com `JSESSIONID` propagado da sessão de auth — implementado mas bloqueado pelo bug server-side.

**Workaround em produção:** o botão "Inserir no MK" em `MkProtocolCards.tsx` permite que o operador copie o comentário para colar manualmente no ticket MK ERP. O campo `user` já está implementado no código e será ativado automaticamente quando o MK corrigir o servidor.

---

## 3. Mapeamento Firebase UID → login MK ERP

Implementado em `functions/src/mk-suporte.ts` como mapa estático `MK_USER_MAP`. O token do webservice (de Felipe) é usado para autenticação; os logins individuais são passados como `op_abertura` / `user` para rastrear quem fez cada ação.

```typescript
const MK_USER_MAP: Record<string, string> = {
  'daqWkAW8gNZjUZBX5O9iDYk7U9D3': 'mz.ramony',
  '0UvfKTsWMWg51OfmhKe9jSjN7zq2': 'mz.victorhugo',
  'esHXTraWEwQ4s0jdPFDJIY8cVRk2': 'mz.hiorranna',
  'smlrMVGkeqZfKcHfsKwd8Kezb1h2': 'mz.halyson',
  'qo9FJdO3hyUEInOdA6n0m1wICxk1': 'mz.izabela',
  '14U120GV9IUnIkvGSHOgZG823Pj1': 'mz.brunacristina',
  'kqLoVLuP1UhPxaPiZ26wKmd5Eul2': 'mz.jhonatan',
  'Ff0IBg4gquX1Q7CQxW4fonjg2jy1': 'mz.joseramos',
  'R4QXtKbIySNiLMKb9j0Lu6Q3pxB3': 'mz.lauren',
  'pFgE8jEtsreUuxvywISFXdlOBxN2': 'mz.eduardohenrique',
  'LraqF5iRVDM98MdS5StezC6kTzj2': 'mz.renatasaraiva',
  'SVMua6jWatVt3wmPhSHJOuZVg5h1': 'mz.gabrielmartins',
  'rTvjrujWRvUtJVw4LtTdkX7Ny4k2': 'mz.andreza',
  'ecJLm1beorbfM51IApqwzRtE3wx2': 'mz.pedrohenrique',
  'Iq67U4vLKpWY7HsLa8V2RVpuVz72': 'mz.vagner',
  'bjO17WJAsJdsZ2hfKorEvaugxIP2': 'mz.hiagoalves',
  'RAqfy5tThwQNzJzcbLnXHxzV81O2': 'mz.vitormanoel',
  'cYldsb3BkogRPG9dQRbEcPjJKIc2': 'mz.vitorsilva',
  'EzcVPkrbnKZqG1Xqfravbp26cEv1': 'mz.luis',
  'dZGecnIydSbOSCDfkwH4bwJZilc2': 'mz.ronald',
}
```

Se um novo colaborador for cadastrado no Firebase e não estiver neste mapa, `mkLoginByUid(uid)` retorna `undefined` e o campo `op_abertura`/`user` simplesmente não é enviado (não quebra o fluxo). Para adicionar novos colaboradores: obter o UID no Firebase Console → Authentication, adicionar no mapa, deployar functions.

---

## 4. Fluxo atual funcionando em produção

```
1. Cloud Function mkSuporte acionada pelo app React (callable v2)
2. getMkConfig() lê MK_TOKEN e MK_WEBSERVICE_PASSWORD do Secret Manager (com .trim())
3. mkAuth() → WSAutenticacao.rule → sessionToken ✅
4. mkBuscarClientePorCpf() → WSMKConsultaDoc.rule → { codigo, nome } ✅
5. mkListarConexoes() → WSMKConexoesPorCliente.rule → lista de conexões ✅
   ↳ campo real: "codconexao" (lowercase) — tratar via fallback
6. mkCriarAtendimento() → WSMKNovoAtendimento.rule → { id, protocolo } ✅
   ↳ op_abertura = login MK do operador logado (via MK_USER_MAP)
7. mkInserirComentario() → WSMKAtendimentoComentario.rule ❌ HTTP 500 (bug MK)
   ↳ user = login MK do operador (código pronto, esperando MK corrigir)
8. mkCriarOS() → WSMKCriarOrdemServico.rule ⏳ não testado
   ↳ bloqueado — aguarda CodigoTipoOS, CodigoGrupoServico, CodigoTecnico do admin MK
```

---

## 5. Comunicação com MK Solutions

Foi aberto um chamado formal no suporte MK Solutions com:
- **PDF impresso** gerado de `mk-webservices-carta.html` (v1.1)
- **Descrição do chamado:** bloqueio em `WSMKAtendimentoComentario.rule` — 500 em todas as combinações, mesmo com `user=mz.ramony` (login ERP válido confirmado via op_abertura)

### 5.1 Resposta do MK Solutions (2026-06-23 — Analista Jardel Henrique)

O analista Jardel respondeu com um curl de exemplo da base de teste deles:

```bash
curl --location 'https://comercial.mksolutions.com.br/mk/WSMKAtendimentoComentario.rule?
  sys=MK0&token=33aa...&cd_atendimento=1214&comentario=%22teste%22&tipo=1&user=jardel' \
  --header 'Cookie: JSESSIONID=27DE166D8F978AE0059BF5DC0F0C8590' \
  --data ''
```

**Diferenças identificadas no exemplo deles vs nosso código anterior:**
1. Método `POST` com body vazio (`--data ''`) — nós usávamos `GET`
2. `Cookie: JSESSIONID=...` — sessão Java/Tomcat que deve ser propagada da autenticação
3. `tipo=1` — nós usávamos `tipo=2`

**Ajuste implementado na Cloud Function** (`functions/src/mk-suporte.ts`):
- `mkGet` substituído por `mkRequest` que envia `POST` com body vazio
- `mkAuth` agora captura o `JSESSIONID` do `Set-Cookie` da resposta de autenticação
- Todas as funções subsequentes recebem e repassam `{ token, jsessionid }` via `MkSession`
- `tipo` corrigido de `2` para `1`

**Resultado após ajuste:** ainda retorna HTTP 500 na mesma linha (`process:321`). O JSESSIONID foi confirmado como sendo capturado nos logs (`CE715CC5...`). Isso elimina definitivamente qualquer hipótese de problema no lado da MZ NET.

### 5.2 Segunda mensagem enviada ao MK Solutions

Informamos que implementamos todos os ajustes do exemplo deles (POST, JSESSIONID, tipo=1) e o erro persiste na mesma linha interna. Solicitamos novamente verificação do `catalina.out` para identificar qual objeto/tabela está nulo em `process:321`.

### 5.3 Perguntas enviadas ao MK (na carta original):

**Q1 — WSMKAtendimentoComentario.rule:**
Verificar arquivo `catalina.out` (logs Tomcat) no momento de uma chamada — o crash na linha 321 do servlet indica falha interna que só eles conseguem rastrear.

**Q2 — WSMKAtendimentoComentario.rule:**
Existe algum módulo, tabela ou configuração adicional que precisa estar habilitada no ERP para que o endpoint funcione?

**Q3/Q4 — WSMKCriarOrdemServico.rule:**
- Existe "técnico padrão" / "a designar" para usar como placeholder em `CodigoTecnico` quando a OS é aberta remotamente antes de escalar?
- É possível criar a OS sem `CodigoTecnico` e designar depois pelo painel MK ERP?

### Aguardando do administrador MK da MZ NET (interno):

| Item | Para usar em |
|---|---|
| `CodigoTipoOS` — Manutenção | WSMKCriarOrdemServico |
| `CodigoTipoOS` — Instalação | WSMKCriarOrdemServico |
| `CodigoGrupoServico` — Suporte Técnico | WSMKCriarOrdemServico |
| `CodigoGrupoServico` — Instalação | WSMKCriarOrdemServico |
| `CodigoTecnico` — placeholder genérico | WSMKCriarOrdemServico |

---

## 6. Arquivos relevantes

| Arquivo | Conteúdo |
|---|---|
| `functions/src/mk-suporte.ts` | Toda a lógica da integração MK — cloud function `mkSuporte` |
| `web/src/components/MkProtocolCards.tsx` | UI de criação de protocolo — seletor de conexão, botão "Inserir no MK" |
| `web/src/pages/MkTestesPage.tsx` | Página de testes (`/dev/mk`) — apenas para `isDev=true` |
| `mk-webservices-carta.html` | Carta técnica para MK Solutions — imprimir como PDF |
| `mk-webservices.md` | Versão markdown da mesma carta |
| `mk-priorizacao.html` | Priorização dos fluxos MK com status atual |
| `docs/documentacao_mk/` | Documentação oficial MK Solutions (clonada localmente) |

---

## 7. Pendências ao retomar

### Bloqueio externo (depende do MK Solutions)
- Aguardar retorno do analista Jardel sobre `catalina.out` — segunda mensagem enviada em 2026-06-23 após testes com POST + JSESSIONID + tipo=1
- Quando o comentário for corrigido: o código já está pronto em produção (POST, JSESSIONID, tipo=1, user=login_operador), basta o servidor MK parar de retornar 500

### Bloqueio interno (depende de informações do admin MK da MZ NET)
- Obter os códigos `CodigoTipoOS`, `CodigoGrupoServico` e `CodigoTecnico` para poder testar `WSMKCriarOrdemServico.rule`
- Sem esses códigos não é possível testar nem implementar a criação de OS

### Próximo passo técnico (quando desbloqueado)
1. Corrigir `WSMKAtendimentoComentario.rule` (resposta do MK Solutions)
2. Testar `WSMKCriarOrdemServico.rule` com os códigos corretos
3. Conectar o fluxo completo aos formulários de OS dos tipos: Manutenção, Alteração de Plano, Mudança de Endereço

---

## 8. Organização dos documentos MK

| Arquivo | Conteúdo |
|---|---|
| `mk-integracao-progresso.md` (raiz) | Parte 1 — descoberta da API, testes iniciais, endpoints, bloqueio na OS |
| `docs/mk/mk-integracao-progresso-parte2.md` | Parte 2 — credenciais Secret Manager, fix do trim, produção funcional |
| `docs/mk/mk-integracao-progresso-parte3.md` | **Este arquivo** — conexão, op_abertura, bug comentário, mapeamento por colaborador |
| `mk-integracao-briefing.md` (raiz) | Briefing original do escopo da integração |
| `mk-priorizacao.html` / `.md` (raiz) | Priorização dos fluxos a integrar com status atual |
| `mk-webservices-carta.html` (raiz) | Carta técnica formal para o MK Solutions |
| `docs/documentacao_mk/` | Documentação oficial MK Solutions |
