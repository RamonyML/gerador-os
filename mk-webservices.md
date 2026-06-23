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

Ao chamar o endpoint com os três campos obrigatórios (`token`, `cd_atendimento`, `comentario`), o servidor retorna **HTTP 500** com a seguinte mensagem:

```
javax.servlet.ServletException: O objeto (Tabela) deve ter um valor definido!
  wfr.web.ExternalRulesServlet.process(SourceFile:321)
```

A chamada realizada:

```
GET /mk/WSMKAtendimentoComentario.rule
  ?sys=MK0
  &token=<token_valido>
  &cd_atendimento=268137
  &comentario=CLIENTE+SEM+BLOQUEIO...
  &tipo=2
```

O atendimento `268137` foi criado pelo próprio sistema segundos antes, com sucesso.

### 3.2 Nossa análise

O erro `"O objeto (Tabela) deve ter um valor definido!"` é uma exceção do runtime WFR indicando que um objeto de banco de dados está nulo internamente. Testamos com e sem o parâmetro `tipo`, com tokens de sessão novos e a mensagem de erro é sempre a mesma.

Nossa hipótese é que a regra tenta associar o comentário a um **operador ERP** (`user`) e, quando esse parâmetro não é fornecido, faz uma busca interna que retorna nulo — causando o crash.

### 3.3 O que precisamos do MK

**a) Confirmar a causa raiz do erro 500** — O campo `user` é, na prática, obrigatório mesmo estando documentado como opcional? Ou há algum pré-requisito de configuração que não estamos atendendo?

**b) Mapeamento de operadores por usuário** — Cada solicitação ao nosso sistema é feita por um operador autenticado via Firebase. Para que o comentário apareça corretamente associado no ticket MK, precisamos de uma forma de obter o **login ERP** do operador a partir do sistema. As alternativas que enxergamos:

- O próprio cadastro de operadores expõe um endpoint de consulta por e-mail ou nome (`WSMKConsultaUsuario.rule` ou similar)?
- Ou devemos manter uma tabela de mapeamento manual `{email_firebase → login_mk}` no nosso sistema?

**c) Serviço no perfil de webservice** — O endpoint `WSMKAtendimentoComentario.rule` requer alguma configuração específica no perfil de webservice além do `cd_servico: 9999`?

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
```

Retorno: `{ CodigoAtendimento, Protocolo }` ✅

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
