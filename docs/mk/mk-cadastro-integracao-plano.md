# Integração MK Solutions — Setor de Cadastro/Análise
> Para uso da LLM responsável pelo sistema de Análise.
> O repositório da integração MK é: https://github.com/RamonyML/gerador-os

---

## O que este documento define

Quando uma ficha é finalizada no sistema de Análise, o sistema deve chamar a **Cloud Function `mkCadastro`** do repositório `gerador-os`. Essa CF é quem faz todas as chamadas à API do MK ERP — o sistema de Análise **não chama o MK diretamente**. As credenciais MK ficam no Secret Manager do `gerador-os` e não precisam ser repassadas.

---

## O trigger

```
Ficha → movida para "Finalizados" + status obrigatório selecionado
  └── status: "aprovada" | "negada" | "cancelada"
        └── POST → Cloud Function mkCadastro
```

---

## Payload (PostgreSQL → CF)

Os dados vêm do banco PostgreSQL do sistema de Análise. Mapeie para este formato ao chamar a CF:

```json
{
  "action": "processar_ficha",
  "status": "aprovada",
  "operador": "<Firebase UID do analista logado>",
  "ficha": {
    "cpf": "000.000.000-00",
    "nome": "Nome do cliente",
    "bairro": "Nome do bairro",
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
| `cpf`, `nome`, `bairro` | ✓ | — | — |
| `plano`, `dataInstalacao`, `formaPagamento`, `vencimento` | ✓ | — | — |
| `temWifiExtend`, `tipoAprovacao` | ✓ | — | — |
| `motivo` | — | ✓ | ✓ |

`operador` é sempre obrigatório. É o Firebase UID do analista — a CF mapeia para o login MK correspondente. Se o UID não estiver no mapa interno da CF, o fluxo continua normalmente sem registrar o operador.

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
    "comentario":  { "ok": false, "erro": "HTTP 500 — aguardando correção MK Solutions" },
    "subprocesso": { "ok": false, "erro": "endpoint não confirmado" }
  }
}
```

Cada etapa é registrada individualmente. Falha em uma etapa não anula as anteriores — exiba para o analista o que foi criado e onde parou.

---

## O que a CF faz internamente por status

**aprovada** — executa em sequência:
1. Verificar cadastro do cliente por CPF (`WSMKConsultaDoc`)
2. Criar cliente se não existir / reativar se inativo (`WSMKNovaPessoa`)
3. Criar Lead com plano, negócio fechado, vendedor, vencimento (`WSMKNovaLead`)
4. Criar Contrato com data de instalação e forma de pagamento (`WSMKNovoContrato`)
5. Criar Conexão — Ponto de Acesso (Zona Leste/Oeste por bairro) + Hawuey Patricia (`WSMKCriarConexao`)
6. Gerar texto da O.S. — algoritmo interno, roda na própria CF, sem input extra necessário
7. Criar O.S. de Instalação e Ativação ± Wi-Fi Extend (`WSMKCriarOrdemServico`)
8. Abrir protocolo/atendimento (`WSMKNovoAtendimento`)
9. Comentar padrão + encaminhar subprocesso (`WSMKAtendimentoComentario`)

**negada / cancelada** — executa apenas:
1. Fechar protocolo com comentário do motivo (`WSMKAtendimentoComentario`)

---

## Estado atual das etapas (junho 2026)

| Etapa | Estado |
|---|---|
| Verificar cadastro | ✅ Funcional |
| Criar/reativar cliente | ⏳ Aguarda MK confirmar módulo |
| Criar Lead | ⏳ Aguarda MK confirmar módulo |
| Criar Contrato | ⏳ Aguarda MK confirmar módulo |
| Criar Conexão | ⏳ Aguarda MK confirmar módulo |
| Gerar texto da O.S. | ✅ Implementável agora |
| Criar O.S. | ⏳ Aguarda MK confirmar módulo + códigos internos |
| Abrir protocolo | ✅ Funcional em produção |
| Comentar / encerrar / encaminhar subprocesso | ❌ Bug HTTP 500 no MK — chamado aberto |

As etapas bloqueadas retornam `{ "ok": false, "erro": "..." }` na resposta — o fluxo não trava, registra o que conseguiu executar.

---

## Referência no repositório gerador-os

Se precisar entender a estrutura existente antes de implementar a `mkCadastro`:

- `functions/src/mk-suporte.ts` — Cloud Function de referência (Suporte Técnico). `mkCadastro` seguirá a mesma estrutura: `defineSecret`, `getMkConfig`, `mkAuth`, chamadas em sequência com `MkSession`.
- `docs/mk/mk-integracao-progresso-parte3.md` — log técnico detalhado: JSESSIONID, mapeamento de operadores, bug do comentário, campos reais retornados pela API.

**Atenção:** a API `WSMKConexoesPorCliente` retorna o campo `codconexao` em lowercase, não `CodigoConexao` como a documentação MK indica. O código em `mk-suporte.ts` já trata esse caso via fallback — replicar o mesmo tratamento na `mkCadastro`.
