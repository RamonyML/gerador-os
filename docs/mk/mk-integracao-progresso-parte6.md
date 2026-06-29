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
- [x] Definir `tipoOS`, `grupoServico`, `tecnicoId` para os demais slugs de manutenção — **concluído em 2026-06-29, ver Seção 11**
- [x] `manut-visita-testes` — incluído com `tipoOS: 3` igual aos demais
- [ ] Replicar `osDescricao` / `osIndicacoes` nos outros `buildXxxSegmentos` (opcional — melhoria futura; o fluxo já funciona usando o texto da O.S. legado)

### Op. abertura (baixa prioridade)
- [ ] Verificar a qual usuário MK pertencem as credenciais no Secret Manager
- [ ] Se necessário, trocar `MK_TOKEN` / `MK_WEBSERVICE_PASSWORD` por credenciais de um usuário operador real

### Outros (pendentes das sessões anteriores)
- [ ] Mover `MK_USER_MAP` para Firestore (campo `mkLogin` no cadastro de usuário)
- [ ] Implementar `mkCadastro` CF (ver `docs/mk/mk-cadastro-integracao-plano.md`)
- [ ] Confirmar se módulos de Cadastro (`WSMKNovaPessoa`, `WSMKNovaLead`, etc.) estão disponíveis no servidor

---

## 6. Wi-Fi Extend — integração MK (2026-06-29)

### 6.1 `buildExtendSegmentos` em `wifiExtendShared.ts`

Criada função central `buildExtendSegmentos(rawValues)`, seguindo o mesmo padrão dos 14 formulários de manutenção (INFORMEI/QUESTIONEI/DISSE). Retorna `{ info, comentarios }`.

Correção identificada durante a implementação: `dataVisita` e `horaVisita` eram usados no texto mas não existiam como campos no formulário. Campos adicionados à seção `S_AGE`.

### 6.2 Registry

```typescript
// tipoOS 18 = ALTERAÇÃO DE PLANO + WI-FI EXTEND; tipoOS 13 = OS DE PONTO ADICIONAL
'wifi-extend-zte':    { mode: 'new', processoId: 5, classificacaoId: 3, buildSegmentos: buildWifiExtendZteSegmentos, tipoOS: 18, grupoServico: 10, tecnicoId: 1 },
'wifi-extend-tplink': { mode: 'new', processoId: 5, classificacaoId: 3, buildSegmentos: buildWifiExtendTplinkSegmentos, tipoOS: 18, grupoServico: 10, tecnicoId: 1 },
'wifi-extend-ponto':  { mode: 'new', processoId: 5, classificacaoId: 3, buildSegmentos: buildPontoAdicionalSegmentos, tipoOS: 13, grupoServico: 10, tecnicoId: 1 },
```

`processoId: 5` = PROC-ALTERA-PLANO. `tipoOS: 18` para ZTE/TP-Link; `tipoOS: 13` para ponto adicional (compra de equipamento sem renovação de fidelidade).

---

## 7. Conversores de Mídia (Roku) — integração MK (2026-06-29)

### 7.1 `buildRokuSegmentos` em `rokuCompraShared.ts`

Criada função central com variant `'PADRAO' | 'PRESENCIAL'`. 5 cards:
- Card 0: questionado sobre Smart-TV nativa
- Card 1: informei valores (R$200 à vista / R$230 parcelado, formas de pagamento)
- Card 2: informei necessidade de visita (isenta)
- Card 3: concordou (termos + forma de pagamento)
- Card 4: data/hora agendada + garantia 90 dias

Campo `cpf` adicionado a ambos os formulários (`rokuPadrao.ts`, `rokuPresencial.ts`).

### 7.2 Registry

```typescript
'midia-roku-padrao':     { mode: 'new', processoId: 18, classificacaoId: 3, tipoOS: 21, grupoServico: 10, tecnicoId: 1, buildSegmentos: buildRokuPadraoSegmentos },
'midia-roku-presencial': { mode: 'new', processoId: 18, classificacaoId: 3, tipoOS: 21, grupoServico: 10, tecnicoId: 1, buildSegmentos: buildRokuPresencialSegmentos },
```

`processoId: 18` = TECNICO-OUTRAS-SOLICITAÇOES. `tipoOS: 21` = ROKU TV. `grupoServico: 10` + `tecnicoId: 1` adicionados em 2026-06-29 para habilitar criação de O.S. (eram ausentes na entrada original).

---

## 8. Termo de Responsabilidade — refatoração completa (2026-06-29)

### 8.1 Máscara de MAC hexadecimal

Novo `control: 'mac'` em `osTemplate.ts` + `FieldControl`. Lógica de máscara em `web/src/lib/macMask.ts`:
- Aceita apenas `[0-9a-fA-F]`, auto-insere `:` a cada 2 chars, uppercase, maxLength 17
- Renderizado em `OsTemplateFieldsForm.tsx` como `TextField` com `fontFamily: 'monospace'`

### 8.2 `buildTermoRespPadraoSegmentos`

6 cards de protocolo:
1. Questionado (modelo do roteador + MAC)
2. Disse que quer acesso
3. Expliquei responsabilidade (taxa R$50 se roteador resetado)
4. Destaquei admin/firmware
5. Informei taxa R$50
6. Encaminhei termo, concordou, print do aceite

**`avisoCard`** (card laranja — NÃO enviado ao MK): só quando `testouSenha === 'SIM'`. Mostra usuário + senha repassados. Exibido após os comentários em `MkProtocolCards`.

**`avisoObservacao`** (bloco copyável laranja): texto `"CLIENTE TEM ACESSO AO ROTEADOR.\nPROTOCOLO Nº xxx"` para inserir em Pessoas/Empresas e Técnico > Observações.

**`clienteTexto`**: texto completo da mensagem WhatsApp para o cliente — exposto como aba extra "Termo para o cliente" via prop `extraTab`.

### 8.3 Registry

```typescript
'termo-resp-padrao': { mode: 'new', processoId: 38, classificacaoId: 3, buildSegmentos: buildTermoRespPadraoSegmentos },
```

`processoId: 38` = TECNICO-TERMO-RESPONSABILIDADE. Sem `tipoOS` (sem O.S. vinculada).

---

## 9. Melhorias gerais em `MkProtocolCards` e `OsGeneratorPage` (2026-06-29)

### 9.1 Props novos em `MkProtocolCards`

| Prop | Tipo | Uso |
|---|---|---|
| `avisoCard` | `string?` | Card laranja após progress bar, sem botão enviar |
| `avisoObservacao` | `string?` | Bloco copyável laranja com label "Inserir em Pessoas/Empresas e Técnico > Observações" |
| `extraTab` | `{ label, content }?` | Adiciona aba extra genérica (usada pelo Termo para aba "Termo para o cliente") |

### 9.2 Bug: aba O.S. e Agenda aparecendo no Termo

**Causa da aba O.S.**: `tipoOS: 12` no registry ativava `hasOs` mesmo sem texto de O.S.
- **Fix**: removido `tipoOS: 12` da entrada do Termo (o Termo não tem O.S.).

**Causa da aba Agenda**: `mkAgendaTexto` usava lógica negativa (`!/protocolo/i && !/O\.S/i`) e capturava a seção "Encaminhar termo ao cliente".
- **Fix**: mudado para `/agenda/i` (match positivo) — só seções cujo label contém "agenda" são tratadas como texto de agenda.

### 9.3 Tipo `buildSegmentos` expandido

```typescript
buildSegmentos: (v: Record<string, unknown>) => {
  info: string
  comentarios: string[]
  osDescricao?: string
  osIndicacoes?: string
  avisoCard?: string
  avisoObservacao?: string
  clienteTexto?: string  // texto para aba extra "Termo para o cliente"
}
```

---

## 10. Status geral atualizado

| Formulário | Integração MK |
|---|---|
| Senha Wi-Fi | ✅ Em produção |
| 14 formulários Manutenção (protocolo) | ✅ Em produção |
| 8 formulários Feedback | ✅ Em produção |
| Alteração de Plano (6 forms) | ✅ Em produção |
| Wi-Fi Extend (ZTE + TP-Link + Ponto) | ✅ Em produção |
| Conversores de Mídia (Roku) | ✅ Em produção |
| Termo de Responsabilidade | ✅ Em produção |
| **"Criar O.S. no MK" — TODOS os formulários com O.S.** | ✅ **Em produção (concluído 2026-06-29)** |

---

## 11. Rollout do botão "Criar O.S. no MK" para todos os formulários (2026-06-29)

### 11.1 Contexto

Até esta data, apenas `manut-ont-queimada` (e `midia-roku-*` sem `grupoServico`/`tecnicoId`) tinham `tipoOS` configurado no `MK_PROTOCOL_REGISTRY`. O botão **"Criar O.S. no MK"** em `MkProtocolCards.tsx` só renderiza quando `tipoOS !== undefined && card0Done` — ou seja, nenhum outro formulário mostrava o botão, mesmo com a infraestrutura completa.

Causa: dado faltando no registry, não bug de renderização.

### 11.2 Mapeamento de tipoOS por formulário

Códigos extraídos de `docs/codigos_mk/CODIGOS_MK_REFERENCIA.md` (fonte canônica — consultar sempre antes de alterar):

| Slug(s) | tipoOS | Nome no MK |
|---|---|---|
| Todos os `manut-*` (exceto isento) | **3** | MANUTENCAO |
| `manut-luz-vermelha-isento` | **22** | RETORNO EM GARANTIA (07 DIAS) |
| Todos os `altplan-*` | **7** | ALTERAÇÃO DE PLANO |
| `wifi-extend-zte`, `wifi-extend-tplink` | **18** | ALTERAÇÃO DE PLANO + WI-FI EXTEND |
| `wifi-extend-ponto` | **13** | OS DE PONTO ADICIONAL (COMPRA DE EQUIPAMENTO) |
| `midia-roku-padrao`, `midia-roku-presencial` | **21** | ROKU TV |
| `senha-altera-senha`, `termo-resp-padrao` | — | sem O.S. |

> **`grupoServico: 10` (EQUIPE MZ NET) em todos os formulários com O.S.** — confirmado pelo admin MZ NET.

### 11.3 tecnicoId

`tecnicoId: 1` adicionado a todas as entradas com O.S., igual ao padrão já testado em produção de `manut-ont-queimada`. O campo não controla o "Op. abertura" exibido no MK ERP (isso depende das credenciais do Secret Manager — ver Seção 3.3), mas é exigido pelo endpoint `WSMKCriarOrdemServico` para a criação bem-sucedida com `grupoServico: 10`.

### 11.4 Estado final do registry

```typescript
// web/src/data/mkProtocolRegistry.ts

// processo 12 — TECNICO-SEM-CONEXAO
'manut-luz-vermelha':        { ..., tipoOS: 3,  grupoServico: 10, tecnicoId: 1 },
'manut-luz-vermelha-pj':     { ..., tipoOS: 3,  grupoServico: 10, tecnicoId: 1 },
'manut-luz-vermelha-isento': { ..., tipoOS: 22, grupoServico: 10, tecnicoId: 1 },  // garantia 7 dias
'manut-fibra-externa':       { ..., tipoOS: 3,  grupoServico: 10, tecnicoId: 1 },
'manut-ocas-conector':       { ..., tipoOS: 3,  grupoServico: 10, tecnicoId: 1 },
'manut-ocas-fibra':          { ..., tipoOS: 3,  grupoServico: 10, tecnicoId: 1 },
'manut-sinal-alto':          { ..., tipoOS: 3,  grupoServico: 10, tecnicoId: 1 },
// processo 18 — TECNICO-OUTRAS-SOLICITACOES
'manut-realoc-fibra':        { ..., tipoOS: 3,  grupoServico: 10, tecnicoId: 1 },
'manut-mud-ponto-int':       { ..., tipoOS: 3,  grupoServico: 10, tecnicoId: 1 },
'manut-visita-testes':       { ..., tipoOS: 3,  grupoServico: 10, tecnicoId: 1 },
// processo 17 — TECNICO-FALHA-EM-SERVIÇO-ESPECIFICO
'manut-fonte-queimada':      { ..., tipoOS: 3,  grupoServico: 10, tecnicoId: 1 },
'manut-roteador-queimado':   { ..., tipoOS: 3,  grupoServico: 10, tecnicoId: 1 },
'manut-ont-queimada':        { ..., tipoOS: 3,  grupoServico: 10, tecnicoId: 1 },  // primeiro testado
'manut-onu-queimada':        { ..., tipoOS: 3,  grupoServico: 10, tecnicoId: 1 },
// processo 14 — TECNICO-ALTERAR-WIFI
'manut-roteador-reset':      { ..., tipoOS: 3,  grupoServico: 10, tecnicoId: 1 },
// processo 5 — PROC-ALTERA-PLANO
'altplan-remoto':                  { ..., tipoOS: 7,  grupoServico: 10, tecnicoId: 1 },
'altplan-presencial':              { ..., tipoOS: 7,  grupoServico: 10, tecnicoId: 1 },
'altplan-sem-troca-visita-isenta': { ..., tipoOS: 7,  grupoServico: 10, tecnicoId: 1 },
'altplan-sem-troca-visita-paga':   { ..., tipoOS: 7,  grupoServico: 10, tecnicoId: 1 },
'altplan-troca-visita-isenta':     { ..., tipoOS: 7,  grupoServico: 10, tecnicoId: 1 },
'altplan-troca-visita-paga':       { ..., tipoOS: 7,  grupoServico: 10, tecnicoId: 1 },
'wifi-extend-zte':    { ..., tipoOS: 18, grupoServico: 10, tecnicoId: 1 },
'wifi-extend-tplink': { ..., tipoOS: 18, grupoServico: 10, tecnicoId: 1 },
'wifi-extend-ponto':  { ..., tipoOS: 13, grupoServico: 10, tecnicoId: 1 },
// processo 18 — TECNICO-OUTRAS-SOLICITAÇOES
'midia-roku-padrao':     { ..., tipoOS: 21, grupoServico: 10, tecnicoId: 1 },
'midia-roku-presencial': { ..., tipoOS: 21, grupoServico: 10, tecnicoId: 1 },
```

### 11.5 Integração concluída

A integração MK está **completamente funcional em produção** (deploy 2026-06-29):

- **Protocolo**: 100% dos formulários abrem atendimento e inserem comentários automaticamente no MK ERP
- **O.S.**: 100% dos formulários que geram visita técnica têm o botão "Criar O.S. no MK" ativo após o Card 0
- **Feedback**: 8 formulários inserem comentário em atendimento existente (modo `comment`)
- **Sem O.S.**: `senha-altera-senha` e `termo-resp-padrao` — apenas protocolo, comportamento correto
