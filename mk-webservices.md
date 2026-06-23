# MZ NET × MK Solutions — Webservices necessários

> Documento gerado para o time do MK Solutions com todos os endpoints
> utilizados pelo **Gerador de O.S. da MZ NET**, status de cada um e
> o que está bloqueando a integração de Manutenção.

---

## Fluxo de Manutenção (P1 — 60 variantes)

```
1. Auth            → WSAutenticacao.rule              ✅ funcionando
2. Buscar cliente  → WSMKConsultaDoc.rule              ✅ funcionando
3. Buscar conexão  → ??? (endpoint não identificado)  ❌ BLOQUEIO
4. Criar atendimento → WSMKNovoAtendimento.rule        ✅ funcionando
5. Criar OS técnica  → WSMKCriarOrdemServico.rule      ⚠️  retorna 500
```

O passo **3** é o bloqueio principal. Precisamos do endpoint que retorna
o `CodigoConexao` da conexão ativa de um cliente — esse código é
necessário nos passos 4 e 5.

---

## Endpoints já implementados

### 1. Autenticação
```
GET /mk/WSAutenticacao.rule
```
| Parâmetro  | Tipo   | Descrição                        |
|-----------|--------|----------------------------------|
| `sys`     | string | sempre `"MK0"`                   |
| `token`   | string | token de usuário MK              |
| `password`| string | contra-senha do perfil webservice|
| `cd_servico` | int | ex: `9999`                      |

**Retorno esperado:** `{ Token, Expire, ServicosAutorizados }`

---

### 2. Buscar cliente por CPF/CNPJ
```
GET /mk/WSMKConsultaDoc.rule
```
| Parâmetro | Tipo   | Descrição                         |
|-----------|--------|-----------------------------------|
| `sys`     | string | `"MK0"`                           |
| `token`   | string | token de sessão (retornado pelo auth) |
| `doc`     | string | CPF ou CNPJ **sem formatação**   |

**Retorno esperado:** `{ CodigoPessoa, Nome, Email, Fone, Situacao, status }`

---

### 3. Criar atendimento
```
GET /mk/WSMKNovoAtendimento.rule
```
| Parâmetro             | Tipo   | Obrigatório | Descrição                         |
|-----------------------|--------|-------------|-----------------------------------|
| `sys`                 | string | ✅          | `"MK0"`                           |
| `token`               | string | ✅          | token de sessão                   |
| `cd_cliente`          | int    | ✅          | `CodigoPessoa` retornado no passo 2|
| `cd_processo`         | int    | ✅          | código do processo MK             |
| `cd_classificacao_ate`| int    | ✅          | código da classificação           |
| `origem_contato`      | int    | ✅          | `6`=Telefone, `9`=WhatsApp        |
| `info`                | string | ✅          | texto de descrição do atendimento |
| `cd_contrato`         | int    | ❌          | código do contrato (se disponível)|
| `conexao_associada`   | int    | ❌          | **CodigoConexao** — ver passo 3   |

**Retorno esperado:** `{ CodigoAtendimento, Protocolo }`

---

### 4. Criar Ordem de Serviço (técnica)
```
GET /mk/WSMKCriarOrdemServico.rule
```
| Parâmetro            | Tipo   | Obrigatório | Descrição                          |
|----------------------|--------|-------------|------------------------------------|
| `sys`                | string | ✅          | `"MK0"`                            |
| `token`              | string | ✅          | token de sessão                    |
| `CodigoCliente`      | int    | ✅          | `CodigoPessoa` do passo 2          |
| `DescricaoProblema`  | string | ✅          | texto da O.S.                      |
| `CodigoTipoOS`       | int    | ✅          | código do tipo de OS               |
| `CodigoGrupoServico` | int    | ❌          | grupo de serviço / equipe          |
| `CodigoTecnico`      | int    | ❌          | técnico pré-designado              |
| `CodigoAtendimento`  | int    | ❌          | vínculo com o atendimento criado   |

**Retorno esperado:** `{ codigo_os }` ou `{ CodigoOS }`

> ⚠️ **Status atual:** retorna HTTP 500. Suspeita: falta `CodigoConexao`
> como parâmetro obrigatório. Precisamos confirmar se este endpoint
> exige esse campo e qual o nome correto do parâmetro.

---

### 5. Inserir comentário em atendimento
```
GET /mk/WSMKAtendimentoComentario.rule
```
| Parâmetro       | Tipo   | Descrição                       |
|-----------------|--------|---------------------------------|
| `sys`           | string | `"MK0"`                         |
| `token`         | string | token de sessão                 |
| `cd_atendimento`| int    | ID do atendimento               |
| `comentario`    | string | texto do comentário/encerramento|

---

### Endpoints de consulta de catálogo (funcionando)

| Endpoint                              | Uso                               |
|---------------------------------------|-----------------------------------|
| `WSMKOSListaTiposOS.rule`             | listar tipos de OS disponíveis    |
| `WSMKConsultaEquipes.rule`            | listar grupos de serviço/equipes  |
| `WSMKListaProcessos.rule`             | listar processos de atendimento   |
| `WSMKListaClassificacoesAte.rule`     | listar classificações (por processo) |

---

## ❌ BLOQUEIO — Endpoint faltando

### Buscar conexão ativa do cliente

O campo `CodigoConexao` (ou `conexao_associada`) é necessário para:
- Associar o atendimento à conexão correta do cliente
- Possivelmente obrigatório em `WSMKCriarOrdemServico.rule` (causa do 500)

**Precisamos que o time do MK informe:**

1. **Nome do endpoint** para buscar a conexão ativa de um cliente
   - Suspeita: `WSMKConexaoCliente.rule` ou `WSMKListaConexoes.rule` — mas não confirmado
2. **Parâmetros de entrada** (provavelmente `CodigoPessoa` ou CPF)
3. **Nome exato do campo** no retorno que representa o código da conexão
4. **Se `WSMKCriarOrdemServico.rule` exige `CodigoConexao`** — e qual o nome do parâmetro

---

## Resumo do que precisamos do MK Solutions

| # | Item                                      | Status         |
|---|-------------------------------------------|----------------|
| 1 | Endpoint para buscar conexão ativa        | **❌ FALTANDO** |
| 2 | Nome do campo `CodigoConexao` na resposta | **❌ FALTANDO** |
| 3 | Confirmar parâmetros de `WSMKCriarOrdemServico.rule` | **❌ FALTANDO** |
| 4 | Códigos internos: TipoOS, GrupoServico, Processo e Classificação para Manutenção | **❌ FALTANDO** |
| 5 | Todos os itens acima para Alteração de Plano (P1 — fila após Manutenção) | pendente |

---

## Contexto técnico

- **Proxy:** Cloud Function Firebase (`southamerica-east1`) — o React nunca
  faz chamada direta à API MK; tudo passa pela function.
- **Credenciais:** armazenadas no Google Cloud Secret Manager.
- **Modo shadow:** em dev/teste, os payloads são logados no Firestore sem
  atingir a API MK. Basta setar `MK_MODE=real` para ativar em produção.
- **Autenticação:** o token de sessão MK é obtido a cada requisição
  (sem cache) para evitar expiração.
