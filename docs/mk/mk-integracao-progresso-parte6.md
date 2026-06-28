# MK Solutions — Progresso da Integração (Parte 6)
> Documento de continuidade — iniciado em: 2026-06-28 | atualizado em: 2026-06-28
> Leia a Parte 1 (`mk-integracao-progresso.md` na raiz), Partes 2–5 (`docs/mk/`) antes deste.

---

## Status geral

| Etapa | Status |
|---|---|
| Autenticação MK em produção | ✅ Funcional |
| Buscar cliente por CPF | ✅ Funcional |
| Listar conexões do cliente | ✅ Funcional |
| Criar atendimento com op_abertura | ✅ Funcional |
| Protocolo no gerador — Senha Wi-Fi | ✅ Em produção |
| Protocolo no gerador — 14 formulários de Manutenção (Fase 1) | ✅ Em produção |
| Protocolo no gerador — Formulários de Feedback (8 forms) | ✅ Em produção |
| Inserir comentário (WSMKAtendimentoComentario) | ✅ Funcional — chunking automático para varchar(300) |
| Criar OS vinculada — `manut-ont-queimada` | ✅ Em produção — OS criada com CodigoConexao e campos separados |
| Op. abertura automática pelo operador logado | ⚠️ Bloqueado — depende de credenciais MK (ver Seção 3) |

---

## 1. Criação de O.S. vinculada ao protocolo — `manut-ont-queimada` (2026-06-28)

### 1.1 Contexto

A partir desta sessão, o fluxo `manut-ont-queimada` passou a criar uma **O.S. de Manutenção** vinculada ao atendimento MK após o operador clicar em "Criar O.S. no MK". O botão aparece automaticamente quando o atendimento (Card 0) está confirmado.

### 1.2 Parâmetros definidos para `WSMKCriarOrdemServico.rule`

O endpoint exige pelo menos `CodigoGrupoServico` e `CodigoTecnico` além dos obrigatórios padrão. Após testes extensivos:

| Parâmetro | Valor | Observação |
|---|---|---|
| `CodigoTipoOS` | `3` (MANUTENCAO) | Confirmado |
| `CodigoGrupoServico` | `10` | Único grupo que aceita `CodicoTecnico: 1` |
| `CodigoTecnico` | `1` | Único código válido encontrado (1–30 testados; 2–30 → "não encontrado") |
| `categoria` | `1` | 1=Cliente, obrigatório a partir da release 74 |
| `CodigoConexao` | dinâmico | Buscado via `WSMKConexoesPorCliente.rule` antes de criar a OS |
| `CodigoAtendimento` | dinâmico | ID do atendimento gerado pelo Card 0 |

**Registry (`mkProtocolRegistry.ts`) — entrada para `manut-ont-queimada`:**
```typescript
{ mode: 'new', processoId: 17, classificacaoId: 3, buildSegmentos: buildOntQueimadaSegmentos,
  tipoOS: 3, grupoServico: 10, tecnicoId: 1 }
```

### 1.3 Padrão de duas sessões MK (`criar_os_vinculada`)

Chamar `mkBuscarConexaoCliente` na mesma sessão que `mkCriarOS` "contaminava" o contexto MK e alterava o comportamento do endpoint. Solução adotada: **duas sessões independentes**.

```typescript
// Sessão A — só para buscar conexão do cliente
const sessionLookup = await mkAuth(cfg)
conexao = await mkBuscarConexaoCliente(cfg, sessionLookup, codigoCliente)

// Sessão B — limpa, só para criar OS
const session = await mkAuth(cfg)
osNumero = await mkCriarOS(cfg, session, { ..., CodigoConexao: conexao, ... })
```

Se a busca da conexão falhar (cliente sem conexão ativa), a OS é criada mesmo assim — sem `CodigoConexao`. Não interrompe o fluxo.

### 1.4 `CodigoConexao` na O.S.

A OS criada agora aparece corretamente na área técnica do MK, vinculada à conexão do cliente. Sem `CodigoConexao`, a OS ficava "solta" e não aparecia para o técnico.

---

## 2. Separação de campos da O.S. — Relato do problema vs. Indicações (2026-06-28)

### 2.1 Problema

O texto completo da O.S. (relato de abertura + `=========================================` + `INDICACAO TECNICA: ...`) estava sendo enviado inteiro para o campo `DescricaoProblema` (Relato do problema) no MK. O campo **Indicações** ficava vazio.

### 2.2 Solução

Separação dos dois blocos no próprio `buildOntQueimadaSegmentos`, retornando campos extras opcionais:

```typescript
// web/src/data/manutencao/ontQueimada.ts
export function buildOntQueimadaSegmentos(rawValues) {
  // ... lógica existente dos cards de protocolo ...

  // Texto para DescricaoProblema (Relato do problema no MK)
  const osDescricao = `${abertura} ENTROU EM CONTATO POR ... ${osClose}`

  // Texto para Indicacoes (campo Indicações no MK)
  const osIndicacoes = `TECNICO: CONFERIR A TOMADA, T , ETC. ...`

  return { info, comentarios, osDescricao, osIndicacoes }
}
```

### 2.3 Tipo `MkProtocolNewEntry` atualizado

```typescript
// web/src/data/mkProtocolRegistry.ts
buildSegmentos: (v: Record<string, unknown>) => {
  info: string
  comentarios: string[]
  osDescricao?: string   // texto para DescricaoProblema (Relato do problema no MK)
  osIndicacoes?: string  // texto para Indicacoes (campo Indicações no MK)
}
```

Retrocompatível: formulários sem `osDescricao`/`osIndicacoes` continuam usando `osTexto ?? cards[0]` como antes.

### 2.4 Propagação frontend → Cloud Function

**`OsGeneratorPage.tsx`** passa os novos props ao `MkProtocolCards`:
```tsx
osDescricao={mkSegmentos.osDescricao}
osIndicacoes={mkSegmentos.osIndicacoes}
```

**`MkProtocolCards.tsx`** usa `osDescricao` para o `descricaoProblema` enviado ao MK:
```typescript
descricaoProblema: osDescricao ?? osTexto ?? cards[0],
indicacoes: osIndicacoes,
```

O card de exibição no app continua mostrando o texto completo (`osTexto` = `previewSections[1]?.body`) para o operador revisar — apenas o que vai para o MK foi separado.

### 2.5 Cloud Function (`mk-suporte.ts`)

`MkOsPayload` recebeu o campo `Indicacoes?: string`. O handler `criar_os_vinculada` aceita `indicacoes` no payload e passa para `mkCriarOS`:

```typescript
type MkOsPayload = {
  token: string
  CodigoCliente: number
  DescricaoProblema: string
  Indicacoes?: string       // NOVO
  CodigoTipoOS: number
  // ...
}
```

---

## 3. Op. abertura — "master" (bloqueio de configuração) (2026-06-28)

### 3.1 Sintoma

A OS criada via API mostra **"master"** no campo **Op. abertura** no MK ERP, em vez do nome do operador que a gerou (ex.: "mz.ramony").

### 3.2 Investigação

- Testes com `CodigoTecnico` de 1 a 30 (bruteforce PowerShell): apenas `1` é válido; 2–30 → "CodigoTecnico não encontrado"
- O parâmetro `op_abertura` não é reconhecido por `WSMKCriarOrdemServico.rule` (ignorado silenciosamente)
- OS históricas 131594–131596 que mostravam "mz.ramony" foram criadas quando `CodigoTecnico: 3` ainda era válido — o mapeamento interno do MK mudou desde então

### 3.3 Hipótese mais provável

O **Op. abertura** é derivado do **usuário das credenciais MK** (`MK_TOKEN` / `MK_WEBSERVICE_PASSWORD`) armazenadas no Secret Manager, não do `CodicoTecnico`. Se as credenciais são de uma conta "master", todas as OS abertas via API aparecerão como "master", independente de qualquer parâmetro.

**Para corrigir:** verificar no painel MK de qual usuário pertencem as credenciais armazenadas no Secret Manager. Se for de "master" (conta de API genérica), substituir pelo login de um usuário real (ex.: `mz.ramony`).

### 3.4 Decisão

O usuário confirmou que **"essa parte do técnico não impacta muito"** — o fluxo funciona e a OS é criada corretamente com `CodigoConexao`. A questão do operador foi adiada e não bloqueia o uso em produção.

---

## 4. Commits desta sessão

```
(deploy desta sessão — sem commit individual identificado)
```

Arquivos modificados:
- `functions/src/mk-suporte.ts` — duas sessões, `Indicacoes` em `MkOsPayload` e `criar_os_vinculada`
- `web/src/data/manutencao/ontQueimada.ts` — `buildOntQueimadaSegmentos` retorna `osDescricao` + `osIndicacoes`
- `web/src/data/mkProtocolRegistry.ts` — tipo `MkProtocolNewEntry.buildSegmentos` atualizado
- `web/src/components/MkProtocolCards.tsx` — props `osDescricao` + `osIndicacoes`, `handleCriarOS` atualizado
- `web/src/pages/OsGeneratorPage.tsx` — passa `osDescricao` e `osIndicacoes` ao `MkProtocolCards`

---

## 5. Pendências ao retomar

### Criar O.S. — outros formulários de manutenção
- [ ] Definir `tipoOS`, `grupoServico`, `tecnicoId` para os demais slugs de manutenção (hoje apenas `manut-ont-queimada` tem OS configurada)
- [ ] `manut-visita-testes` — formulário sem protocolo (só O.S. + Agenda), tratar separadamente
- [ ] Replicar `osDescricao` / `osIndicacoes` nos outros `buildXxxSegmentos` de manutenção quando for criar OS para eles

### Op. abertura (baixa prioridade)
- [ ] Verificar a qual usuário MK pertencem as credenciais no Secret Manager
- [ ] Se necessário, trocar `MK_TOKEN` / `MK_WEBSERVICE_PASSWORD` por credenciais de um usuário operador real

### Outros (pendentes das sessões anteriores)
- [ ] Mover `MK_USER_MAP` para Firestore (campo `mkLogin` no cadastro de usuário)
- [ ] Formulários `wifi-extend` e `midia-tv` — ainda sem `buildSegmentos`
- [ ] Implementar `mkCadastro` CF (ver `docs/mk/mk-cadastro-integracao-plano.md`)
- [ ] Confirmar se módulos de Cadastro (`WSMKNovaPessoa`, `WSMKNovaLead`, etc.) estão disponíveis no servidor
