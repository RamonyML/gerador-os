# Integração MK Solutions — Setor de Cadastro/Análise
> Para uso da LLM responsável pelo sistema de Análise (Felipe).
> Repositório do gerador-os: https://github.com/RamonyML/gerador-os
> Atualizado em: 2026-06-25

---

## O que este documento define

Quando uma ficha é finalizada no sistema de Análise, o sistema deve chamar a **Cloud Function `mkCadastro`** do repositório `gerador-os`. Essa CF faz todas as chamadas à API do MK ERP — o sistema de Análise **não chama o MK diretamente**. As credenciais MK ficam no Secret Manager do `gerador-os`.

---

## O trigger

```
Ficha → movida para "Finalizados" + status obrigatório selecionado
  └── status: "aprovada" | "negada" | "cancelada"
        └── POST → Cloud Function mkCadastro
```

---

## Payload (PostgreSQL → CF)

```json
{
  "action": "processar_ficha",
  "status": "aprovada",
  "operador": "<Firebase UID do analista logado>",
  "ficha": {
    "cpf": "000.000.000-00",
    "nome": "Nome Completo do Cliente",
    "cep": "69000-000",
    "numero": "123",
    "complemento": "Apto 2",
    "email": "cliente@email.com",
    "fone": "92999990000",
    "bairro": "Nome do Bairro",
    "plano": { "codigo": "...", "nome": "..." },
    "dataInstalacao": "2026-07-01",
    "formaPagamento": "...",
    "vencimento": 10,
    "temWifiExtend": false,
    "tipoAprovacao": "gratuita",
    "motivo": ""
  }
}
```

**Campos obrigatórios por status:**

| Campo | aprovada | negada | cancelada |
|---|:---:|:---:|:---:|
| `cpf`, `nome`, `cep`, `numero`, `email`, `fone`, `bairro` | ✓ | — | — |
| `plano`, `dataInstalacao`, `formaPagamento`, `vencimento` | ✓ | — | — |
| `temWifiExtend`, `tipoAprovacao` | ✓ | — | — |
| `atendimentoId` (para negada/cancelada) | — | ✓ | ✓ |
| `motivo` | — | ✓ | ✓ |

`operador` é sempre obrigatório — Firebase UID do analista. A CF mapeia para o login MK.

`tipoAprovacao` aceita: `"gratuita"` | `"compra_equipamento"` | `"novos_dados"`.

---

## Resposta da CF

```json
{
  "success": true,
  "etapas": {
    "cadastro":    { "ok": true,  "codigoPessoa": 28903 },
    "lead":        { "ok": true,  "codigoLead": "..." },
    "contrato":    { "ok": true,  "codigoContrato": "..." },
    "conexao":     { "ok": true,  "codigoConexao": 35525 },
    "os":          { "ok": true,  "codigoOS": "...", "textoGerado": "..." },
    "atendimento": { "ok": true,  "protocolo": "268262" },
    "comentario":  { "ok": true }
  }
}
```

Falha em uma etapa não anula as anteriores — exiba para o analista o que foi criado e onde parou.

---

## O que a CF faz internamente por status

**aprovada** — executa em sequência:
1. Verificar cadastro do cliente por CPF (`WSMKConsultaDoc`)
2. Criar cliente se não existir / reativar se inativo (`WSMKNovaPessoa`)
3. Criar Lead com info do atendimento (`WSMKNovaLead`)
4. Criar Contrato com plano, vencimento e forma de pagamento (`WSMKNovoContrato`)
5. Criar Conexão — Ponto de Acesso por bairro + servidor (`WSMKCriarConexao`)
6. Gerar texto da O.S. — algoritmo interno da CF
7. Criar O.S. de Instalação (`WSMKCriarOrdemServico`)
8. Abrir protocolo/atendimento (`WSMKNovoAtendimento`)
9. Inserir comentário padrão — público (`WSMKAtendimentoComentario`)

**negada / cancelada** — executa apenas:
1. Inserir comentário no atendimento existente com o motivo (`WSMKAtendimentoComentario`)
   > Requer `atendimentoId` no payload (atendimento já aberto anteriormente)

---

## Estado atual das APIs (2026-06-25)

| Etapa | API | Estado |
|---|---|---|
| Verificar cadastro | `WSMKConsultaDoc` | ✅ Funcional e testado |
| Criar/reativar cliente | `WSMKNovaPessoa` | ✅ **Módulo instalado** — não testado |
| Criar Lead | `WSMKNovaLead` | ⚠️ Instalado implícito (API geral) — ver nota abaixo |
| Criar Contrato | `WSMKNovoContrato` | ⏳ Aguarda confirmação de instalação + códigos internos |
| Criar Conexão | `WSMKCriarConexao` | ⏳ Aguarda confirmação de instalação + códigos internos |
| Gerar texto da O.S. | interno | ✅ Implementável agora |
| Criar O.S. | `WSMKCriarOrdemServico` | ✅ **Módulo instalado** — aguarda códigos internos |
| Abrir protocolo | `WSMKNovoAtendimento` | ✅ Funcional e testado |
| Inserir comentário | `WSMKAtendimentoComentario` | ✅ **Testado e validado em produção hoje** |

---

## Specs das APIs (documentação oficial lida em 2026-06-25)

### 1. WSMKConsultaDoc — Verificar cliente por CPF
```
GET /mk/WSMKConsultaDoc.rule?sys=MK0&token=...&doc=CPF_SEM_MASCARA
```
Retorna `CodigoPessoa`, `Nome`, `Situacao`. Se `Situacao == 'Inativo'`, passa para WSMKNovaPessoa.

---

### 2. WSMKNovaPessoa — Criar/reativar cadastro
```
GET /mk/WSMKNovaPessoa.rule?sys=MK0&token=...&doc=...&nome=...&cep=...
  &cd_uf=...&cd_cidade=...&cd_bairro=...&cd_logradouro=...
  &numero=...&email=...&fone=...
```

| Parâmetro | Obrig. | Fonte |
|---|:---:|---|
| `token` | ✓ | autenticação |
| `doc` | ✓ | CPF sem máscara |
| `nome` | ✓ | ficha |
| `cep` | ✓ | ficha |
| `cd_uf` | ✓ | lookup via `WSMKListaEstruturaEnderecos` pelo CEP |
| `cd_cidade` | ✓ | lookup via `WSMKListaEstruturaEnderecos` |
| `cd_bairro` | ✓ | lookup via `WSMKListaEstruturaEnderecos` |
| `cd_logradouro` | ✓ | lookup via `WSMKListaEstruturaEnderecos` |
| `numero` | ✓ | ficha |
| `email` | ✓ | ficha |
| `fone` | ✓ | ficha |
| `complemento` | — | ficha |
| `tipo_cadastro` | — | `1` = PF (default) |

> ⚠️ **Dependência crítica:** os campos `cd_uf`, `cd_cidade`, `cd_bairro`, `cd_logradouro` são **códigos numéricos internos do MK**, não texto livre. A CF precisará chamar `WSMKListaEstruturaEnderecos` (API geral, sem módulo especial) passando o CEP para obter esses códigos antes de criar o cadastro. Essa etapa deve ser transparente — não requer dado extra do Felipe.

---

### 3. WSMKNovaLead — Criar lead no CRM
```
GET /mk/WSMKNovaLead.rule?sys=MK0&token=...&cd_cliente=CODIGO_CLIENTE&info='TEXTO'
```

| Parâmetro | Obrig. | Fonte |
|---|:---:|---|
| `token` | ✓ | autenticação |
| `cd_cliente` | ✓ | retorno do WSMKConsultaDoc/WSMKNovaPessoa |
| `info` | — | texto livre descrevendo o atendimento |

> ⚠️ **Nota importante:** a API de lead do MK aceita apenas `cd_cliente` + `info` (texto). Ela **não** recebe plano, vencimento, vendedor ou forma de pagamento — esses dados vão para o Contrato (WSMKNovoContrato), não para a lead. A lead no MK é essencialmente um registro de CRM/atendimento que precede o contrato.

---

### 4. WSMKNovoContrato — Criar contrato
```
GET /mk/WSMKNovoContrato.rule?sys=MK0&token=...&CodigoCliente=...
  &CodigoTipoPlano=1&CodigoPlanoAcesso=...&CodigoRegraVencimento=...
  &CodigoRegraBloqueio=...&CodigoFormaPagamento=...
  &CodigoProfilePagamento=...&CodigoMetodoFaturamento=...
  &CodigoPlanoContas=...
```

| Parâmetro | Obrig. | Fonte |
|---|:---:|---|
| `CodigoCliente` | ✓ | retorno cadastro |
| `CodigoTipoPlano` | ✓ | `1` = Internet (fixo) |
| `CodigoPlanoAcesso` | ✓ | mapeado pelo nome do plano da ficha |
| `CodigoRegraVencimento` | ✓ | mapeado pelo dia de vencimento da ficha |
| `CodigoRegraBloqueio` | ✓ | código fixo da MZ NET |
| `CodigoFormaPagamento` | ✓ | mapeado do campo `formaPagamento` da ficha |
| `CodigoProfilePagamento` | ✓ | código fixo da MZ NET |
| `CodigoMetodoFaturamento` | ✓ | código fixo da MZ NET |
| `CodigoPlanoContas` | ✓ | código fixo da MZ NET |
| `AguardaAtivacao` | — | `'S'` (instala na data agendada) |

> ⚠️ **Todos os códigos "fixo da MZ NET"** precisam ser obtidos no painel MK pelo administrador e informados à CF antes de qualquer teste. Ver seção de pendências.

---

### 5. WSMKCriarConexao — Criar conexão
```
GET /mk/WSMKCriarConexao.rule?sys=MK0&token=...&CodigoCliente=...
  &CodigoPontoAcesso=...&CodigoContrato=...&CodigoServidor=...
  &CodigoPlanoAcesso=...&CodigoTipoIP=1&Tecnologia=F
  &AutoDesbloqueio=true&macAddress=00:00:00:00:00:00
  &EnderecoCadastro=true&TipoConexao=1&Password=...&Username=...
```

| Parâmetro | Obrig. | Fonte |
|---|:---:|---|
| `CodigoCliente` | ✓ | retorno cadastro |
| `CodigoPontoAcesso` | ✓ | mapeado pelo bairro da ficha (Zona Leste/Oeste) |
| `CodigoContrato` | ✓ | retorno WSMKNovoContrato |
| `CodigoServidor` | ✓ | código fixo da MZ NET (por zona) |
| `CodigoPlanoAcesso` | ✓ | mesmo do contrato |
| `CodigoTipoIP` | ✓ | `1` = Dinâmico (padrão MZ NET) |
| `Tecnologia` | ✓ | `'F'` = FTTH (padrão MZ NET) |
| `AutoDesbloqueio` | ✓ | `true` |
| `macAddress` | ✓ | gerado pela CF (padrão `00:00:00:00:00:00` ou aleatório válido) |
| `EnderecoCadastro` | ✓ | `true` (usa endereço do cadastro) |
| `TipoConexao` | ✓ | `1` = Cobrança |
| `Username` | ✓ | gerado pela CF (padrão CPF ou nome simplificado) |
| `Password` | ✓ | gerado pela CF (aleatório seguro) |

> ⚠️ **`CodigoPontoAcesso` e `CodigoServidor`** dependem do bairro do cliente. A MZ NET precisa fornecer o mapeamento `bairro → (CodigoPontoAcesso, CodigoServidor)`. Sem isso a conexão não pode ser criada automaticamente.

---

### 6. WSMKCriarOrdemServico — Criar O.S.
```
GET /mk/WSMKCriarOrdemServico.rule?sys=MK0&token=...&CodigoCliente=...
  &DescricaoProblema=...&CodigoTipoOS=...&CodigoTecnico=...
  &CodigoGrupoServico=...&CodigoAtendimento=...&categoria=1
```

Ver spec completa no documento `mk-integracao-progresso-parte4.md`.

---

### 7. WSMKNovoAtendimento — Abrir protocolo
Já funcional em produção. Spec detalhada em `mk-integracao-progresso-parte3.md`.

---

### 8. WSMKAtendimentoComentario — Inserir comentário
```
POST /mk/WSMKAtendimentoComentario.rule?sys=MK0&token=...
  &cd_atendimento=ID&comentario=TEXTO&tipo=2&user=LOGIN_MK
```
`tipo: 2` = público. **Testado e validado em produção em 2026-06-25.**

---

## Pendências antes de implementar

### Bloqueio: códigos internos MK (admin MZ NET)

O administrador MK da MZ NET precisa obter e fornecer os seguintes códigos do painel:

| Código | Usado em | Descrição |
|---|---|---|
| `CodigoRegraVencimento` (por dia) | Contrato | ex: dia 10 → código X |
| `CodigoRegraBloqueio` | Contrato | régua padrão da MZ NET |
| `CodigoFormaPagamento` (por tipo) | Contrato | PIX, boleto, etc. |
| `CodigoProfilePagamento` | Contrato | perfil padrão |
| `CodigoMetodoFaturamento` | Contrato | método padrão |
| `CodigoPlanoContas` | Contrato | plano de contas padrão |
| `CodigoPontoAcesso` (por bairro/zona) | Conexão | Zona Leste, Zona Oeste... |
| `CodigoServidor` (por zona) | Conexão | servidor de autenticação |
| `CodigoPlanoAcesso` (por plano) | Contrato + Conexão | mapa nome → ID |
| `CodigoTipoOS` instalação | O.S. | tipo "Instalação e Ativação" |
| `CodigoGrupoServico` instalação | O.S. | grupo da equipe de instalação |

### Bloqueio: confirmação de instalação de módulos

| API | Estado |
|---|---|
| `WSMKNovoContrato` | ⏳ Não confirmado na mensagem do MK |
| `WSMKCriarConexao` | ⏳ Não confirmado na mensagem do MK |

Solicitar confirmação ao suporte MK se esses dois módulos também foram instalados.

---

## Referência no repositório gerador-os

- `functions/src/mk-suporte.ts` — CF de referência. `mkCadastro` seguirá a mesma estrutura: `defineSecret`, `getMkConfig`, `mkAuth`, chamadas em sequência com `MkSession`.
- `docs/mk/mk-integracao-progresso-parte3.md` — log detalhado: JSESSIONID, mapeamento de operadores, campos reais retornados pela API.
- `docs/mk/mk-integracao-progresso-parte4.md` — spec do WSMKCriarOrdemServico + estado das APIs em junho 2026.

> **Atenção:** a API `WSMKConexoesPorCliente` retorna o campo `codconexao` em lowercase, não `CodigoConexao` como a documentação indica. O código em `mk-suporte.ts` já trata esse fallback — replicar na `mkCadastro`.
