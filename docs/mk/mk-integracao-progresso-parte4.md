# MK Solutions — Progresso da Integração (Parte 4)
> Documento de continuidade — iniciado em: 2026-06-25
> Leia a Parte 1 (`mk-integracao-progresso.md` na raiz), Parte 2 e Parte 3 (`docs/mk/`) antes deste.

---

## Status geral

| Etapa | Status |
|---|---|
| Autenticação MK em produção | ✅ Funcional |
| Buscar cliente por CPF | ✅ Funcional |
| Listar conexões do cliente | ✅ Funcional |
| Criar atendimento com op_abertura | ✅ Funcional |
| Inserir comentário | ❌ Bloqueado — módulo ativado mas não configurado no servidor MK |
| Criar OS | ⏳ Pendente — aguarda códigos do administrador MK da MZ NET |

---

## 1. O que foi feito nesta sessão (2026-06-25)

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

> Nota importante: quando o atendimento não existe ou está encerrado, o MK retorna **HTTP 200** com `"status": "ERRO"` no body. Nosso HTTP 500 é diferente disso — é uma falha do servidor antes de qualquer validação de parâmetros.

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

O código está com `tipo: 1` (privado). Isso foi definido para teste — quando o MK corrigir a configuração do servidor, avaliar se deve ser público (`tipo: 2`) conforme o uso real do suporte.

> O operador da operação revelou que os comentários usados no suporte são **públicos**. Portanto, quando o endpoint funcionar, alterar `tipo: 1` para `tipo: 2` novamente.

---

## 2. Correção de layout — formulário Senha Wi-Fi

O card "COMENTÁRIO 1 DE 2" ficava cortado no painel direito quando o formulário de Senha/SSID Wi-Fi estava aberto com zoom normal.

**Causa raiz:** `maxHeight: calc(100vh - 96px)` + `overflow: auto` sem `minHeight: 0` no flex container — itens flex têm `min-height: auto` por padrão, impedindo o shrink, então o overflow nunca ativava.

**Fix aplicado:**
- `OsGeneratorPage.tsx`: adicionado `showMkCards` — quando true, o Paper do painel direito recebe `position: 'static'` e `maxHeight: 'none'`
- `MkProtocolCards.tsx`: removido `flex: 1`, `overflow: auto` e `minHeight` do Stack externo

Corrigido, deployado em produção.

---

## 3. Planejamento da integração Cadastro/Análise

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
| Criar Conexão (WSMKCriarConexao) | ⏳ Aguarda MK confirmar módulo |
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

## 5. Comunicação com MK Solutions — próximo contato

### Mensagem a ser enviada (após testes desta sessão)

> Testamos o endpoint `WSMKAtendimentoComentario.rule` com o módulo liberado pelo Pedro. O endpoint está sendo alcançado (autenticação e abertura de atendimento continuam funcionando), mas retorna HTTP 500 com a seguinte exceção do Tomcat:
>
> `javax.servlet.ServletException: O objeto (Tabela) deve ter um valor definido!`
> `wfr.web.ExternalRulesServlet.process(SourceFile:321)`
>
> Testamos com `tipo=1` e `tipo=2` — o erro é idêntico. O problema ocorre antes de qualquer validação de parâmetros, sugerindo que o módulo foi ativado mas falta alguma configuração de tabela no ERP (parametrização do módulo de comentários?). Podem verificar nos logs do servidor (`catalina.out`) o que está nulo na linha 321?

### Código a ser encaminhado se solicitado

```typescript
const params = {
  sys:            'MK0',
  token:          '<token retornado pelo WSAutenticacao.rule>',
  cd_atendimento: 268489,
  comentario:     'CLIENTE SEM BLOQUEIO, SEM REDUÇÃO, E ONU -23.65DBM SEM OSCILAÇÃO.',
  tipo:           1,
  user:           'mz.ramony',
}

const qs = new URLSearchParams(
  Object.entries(params).map(([k, v]) => [k, String(v)])
).toString()

await fetch(`${BASE_URL}/mk/WSMKAtendimentoComentario.rule?${qs}`, {
  method:  'POST',
  body:    '',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Cookie':       'JSESSIONID=<jsessionid da autenticação>',
  },
})
```

---

## 6. Documentação `WSMKCriarOrdemServico` — encontrada e revisada

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

**Parâmetro adicionado ao código:** `categoria: 1` incluído no call `mkCriarOS` em `functions/src/mk-suporte.ts`. O valor `1` corresponde a "O.S. de cliente", que é o caso da MZ NET (abre O.S. para os clientes dela).

A Seção 7 do PDF documenta também o `ALTERAR OS` (endpoint REST `PUT /os`), mas **não será utilizado** — o fluxo da MZ NET só precisa criar O.S., não alterar nem encerrar via API.

---

## 7. Cruzamento com `mznet-integrations-main`

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

**Status:** pendente de confirmação com o admin MK. Não implementar nada até ter certeza do formato aceito.

---

## 8. Pendências ao retomar

### Bloqueio externo (MK Solutions)
- [ ] MK Solutions configurar a tabela faltante para `WSMKAtendimentoComentario.rule` (servidor não configurado após liberação do módulo)
- [ ] Quando resolvido: alterar `tipo: 1` para `tipo: 2` em `mk-suporte.ts` (comentário público) e fazer deploy
- [ ] Confirmar se os módulos do fluxo Cadastro (WSMKNovaPessoa, WSMKNovaLead, etc.) estão disponíveis
- [ ] Confirmar se `WSMKCriarOrdemServico.rule` está instalado no servidor

### Bloqueio interno (admin MK da MZ NET)
- [ ] Preencher `suporte/mk-codigos.json` com os IDs reais do painel MK (CodigoTipoOS, CodigoGrupoServico, classificações)
- [ ] Verificar se técnicos de campo têm cadastro no MK e qual identificador aceita (`CodigoTecnico`)

### Técnico (quando desbloqueado)
- [ ] Testar `WSMKAtendimentoComentario.rule` assim que MK configurar o servidor
- [ ] Ativar `criar_os` com `MK_MODE=real` após obter os códigos internos
- [ ] Implementar `mkCadastro` CF seguindo o plano em `docs/mk/mk-cadastro-integracao-plano.md`
- [ ] Mover `MK_USER_MAP` para Firestore (campo `mkLogin` na tela de criação de usuário) — após validar endpoint de comentário

---

## 9. Arquivos relevantes

| Arquivo | Conteúdo |
|---|---|
| `functions/src/mk-suporte.ts` | CF `mkSuporte` — toda lógica da integração suporte técnico |
| `web/src/components/MkProtocolCards.tsx` | UI do protocolo — seletor de conexão, botão "Inserir no MK" |
| `web/src/pages/OsGeneratorPage.tsx` | Gerador de O.S. — fix do layout com `showMkCards` |
| `mk-cadastro-arquitetura.html` | Planejamento visual da integração Cadastro/Análise |
| `docs/mk/mk-cadastro-integracao-plano.md` | Briefing para a LLM do sistema de Felipe |
| `docs/documentacao_mk/mznet-integrations-main/MK30-APIs especiais-250626-112436.pdf` | Documentação oficial das APIs especiais MK Solutions |
| `docs/documentacao_mk/mznet-integrations-main/mk-apis-especiais.txt` | Versão texto extraída do PDF |
