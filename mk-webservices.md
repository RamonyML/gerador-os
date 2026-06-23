# MZ NET × MK Solutions — Solicitação Técnica de Suporte à API

> **Para:** Equipe Técnica MK Solutions  
> **De:** MZ NET Telecom — Setor de T.I.  
> **Data:** 2026-06-23  
> **Assunto:** Integração via Webservices — bloqueios e necessidades técnicas

---

## 1. Contexto

A MZ NET está desenvolvendo um sistema interno chamado **Gerador de O.S.**, construído sobre Firebase (Cloud Functions + React). O objetivo é automatizar a abertura de protocolos, comentários e ordens de serviço no MK ERP a partir de formulários preenchidos pela equipe de suporte técnico, eliminando o processo de cópia manual de dados.

A integração é feita via Cloud Functions (proxy seguro — o frontend nunca acessa a API MK diretamente). A autenticação usa `WSAutenticacao.rule` com token de perfil webservice.

---

## 2. Status atual dos endpoints

| # | Endpoint                               | Status            |
|---|----------------------------------------|-------------------|
| 1 | `WSAutenticacao.rule`                  | ✅ Funcionando     |
| 2 | `WSMKConsultaDoc.rule`                 | ✅ Funcionando     |
| 3 | `WSMKConexoesPorCliente.rule`          | ✅ Funcionando     |
| 4 | `WSMKNovoAtendimento.rule`             | ✅ Funcionando     |
| 5 | `WSMKAtendimentoComentario.rule`       | ❌ Erro 500        |
| 6 | `WSMKCriarOrdemServico.rule`           | ⚠️ Não testado — aguarda códigos obrigatórios |

---

## 3. Bloqueio crítico — `WSMKAtendimentoComentario.rule`

### 3.1 O problema

O endpoint retorna **HTTP 500** consistentemente. Realizamos testes exaustivos variando todos os parâmetros possíveis:

```
GET /mk/WSMKAtendimentoComentario.rule
  ?sys=MK0
  &token=<token_valido>
  &cd_atendimento=268168
  &comentario=CLIENTE SEM BLOQUEIO, SEM REDUCAO, E ONU -23.65DBM SEM OSCILACAO.
  &tipo=2
  &user=mz.ramony

→ HTTP 500: "O objeto (Tabela) deve ter um valor definido!"
   javax.servlet.ServletException
   wfr.web.ExternalRulesServlet.process(SourceFile:321)
   wfr.web.ExternalRulesServlet.doGet(SourceFile:113)
```

### 3.2 Diagnóstico — não é problema de parâmetros

Testamos sistematicamente todas as combinações possíveis:

| Combinação testada | Resultado |
|---|---|
| Somente campos obrigatórios (`token`, `cd_atendimento`, `comentario`) | ❌ 500 — mesma linha |
| Com `tipo=1` (privado) | ❌ 500 — mesma linha |
| Com `tipo=2` (público) | ❌ 500 — mesma linha |
| Com `user=mz.ramony` (login ERP válido) | ❌ 500 — mesma linha |
| Tokens de sessão diferentes (auth renovada) | ❌ 500 — mesma linha |

O crash ocorre sempre na **mesma linha** do servlet (`ExternalRulesServlet.process(SourceFile:321)`), antes de qualquer validação de parâmetros. Isso indica uma falha interna da regra WFR — provavelmente uma tabela de banco de dados acessada internamente que retorna nulo.

> **Confirmação: release ≥ 64.9 —** Paralelamente, implementamos e testamos o parâmetro `op_abertura` em `WSMKNovoAtendimento.rule` — ele funcionou corretamente, registrando o operador `mz.ramony` no ticket #268168. Isso confirma que o servidor está na release 64.9 ou superior. O problema em `WSMKAtendimentoComentario.rule` não é de versão.

### 3.3 O que precisamos do MK Solutions

**Q1 — Verificar logs do servidor Tomcat:** A mensagem de erro informa que "a pilha de erros completa da causa principal está disponível nos logs do servidor". Precisamos que a equipe MK verifique o arquivo `catalina.out` (ou equivalente) no momento de uma chamada ao endpoint para identificar a causa raiz do `NullPointerException` na linha 321.

**Q2 — Configuração do módulo:** Existe algum módulo, tabela ou configuração adicional que precisa estar habilitada no ERP para que `WSMKAtendimentoComentario.rule` funcione? O endpoint responde (retorna 500, não 404), mas parece falhar ao acessar uma estrutura interna.

---

## 4. Necessidade — `WSMKCriarOrdemServico.rule`

### 4.1 Parâmetros obrigatórios ainda não configurados

A documentação indica que os seguintes campos são **obrigatórios** a partir da release 74:

| Parâmetro            | Obrigatoriedade       | Status na MZ NET            |
|----------------------|-----------------------|-----------------------------|
| `CodigoTipoOS`       | Obrigatório           | ❌ código não levantado      |
| `CodigoTecnico`      | Obrigatório           | ❌ não usamos técnico fixo   |
| `CodigoGrupoServico` | Obrigatório           | ❌ código não levantado      |
| `categoria`          | Obrigatório (rel. 74) | Definiremos como `1` (cliente)|

### 4.2 O que precisamos do MK

**a) Códigos de referência** — Precisamos que a equipe do MK (ou o responsável pelo ERP na MZ NET) nos informe os seguintes códigos cadastrados no sistema:

| Item                  | Descrição                                          | Código |
|-----------------------|----------------------------------------------------|--------|
| TipoOS — Manutenção   | O.S. de manutenção técnica em campo                | ?      |
| TipoOS — Instalação   | O.S. de instalação de novo cliente                 | ?      |
| GrupoServico          | Equipe de suporte técnico                          | ?      |
| GrupoServico          | Equipe de instalação                               | ?      |

**b) Técnico genérico** — Como a O.S. é aberta remotamente antes de escalonar, não temos um técnico definido no momento da abertura. Existe um "técnico genérico" ou "técnico padrão" cadastrado no MK que pode ser usado como placeholder? Qual o `CodigoTecnico`?

**c) Comportamento esperado** — É possível abrir uma O.S. sem `CodigoTecnico` definido e designar o técnico posteriormente via MK ERP? Ou o campo é estritamente obrigatório na criação?

---

## 5. Estrutura de parâmetros confirmada (para registro)

### `WSMKNovoAtendimento.rule` — funcionando corretamente

```
GET /mk/WSMKNovoAtendimento.rule
  ?sys=MK0
  &token=<sessao>
  &cd_cliente=28903
  &cd_processo=14
  &cd_classificacao_ate=3
  &origem_contato=9
  &info=<texto>
  &cd_contrato=46364          ← necessário quando há múltiplas conexões
  &conexao_associada=35525    ← necessário quando há múltiplas conexões
  &op_abertura=mz.ramony      ← login ERP do operador (release ≥ 64.9) ✅
```

Retorno: `{ CodigoAtendimento: 268168, Protocolo }` ✅

### `WSMKConexoesPorCliente.rule` — campo correto identificado

A documentação menciona `CodigoConexao`, mas o campo retornado no JSON é **`codconexao`** (lowercase). Nosso código já trata esse caso via fallback.

---

## 6. Próximas integrações planejadas

Assim que os bloqueios acima forem resolvidos, o sistema precisará também automatizar:

| Processo              | Endpoints necessários                                       |
|-----------------------|-------------------------------------------------------------|
| Alteração de Plano    | `WSMKNovoAtendimento` + comentários + `WSMKCriarOrdemServico` |
| Mudança de Endereço   | `WSMKNovoAtendimento` + `WSMKCriarOrdemServico`             |
| Auto-desbloqueio      | `WSMKAutoDesbloqueioV2.rule`                                |
| Encerramento de O.S.  | `PUT /os` (API especial Node.js)                            |

---

## 7. Contato técnico MZ NET

Para dúvidas ou esclarecimentos sobre esta solicitação, entrar em contato com:

**Setor de T.I. — MZ NET Telecom**  
E-mail: ramonyml@gmail.com

---

*Documento gerado pelo sistema Gerador de O.S. — MZ NET T.I.*
